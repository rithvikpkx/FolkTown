import type { ColliderData, NavNode, PropData, SpawnData, Team, ZoneData } from '@folktown/shared';
import type { Campus, Pt } from './types.ts';

export interface BakeOptions {
  name: string;
  /** Centre of the zone in campus metres. */
  centre: Pt;
  /** Side length of the square zone, metres. */
  size: number;
  /** Nav grid spacing, metres. */
  navSpacing: number;
  /** Required free distance between a nav node (and every nav edge) and any solid, metres. */
  clearance: number;
  spawnsPerTeam: number;
  /** Storey height and fallback building height, metres. */
  levelHeight: number;
  defaultHeight: number;
}

/**
 * Zone choice. In data/campus.json (origin = Bell Tower, x east, z south) the Engineering Mall
 * is NORTH of the Bell Tower, not south-west: Armstrong Hall (ARMS) spans z -433..-375 at its
 * north end, Hampton (-59,-332) and Forney (14,-261) flank the open mall, and Physics, the Data
 * Science hall and Nursing close it to the south. A 300 m box centred on (-30, -290) takes in
 * Armstrong, Hampton, Forney, Physics, Nursing, Pharmacy, the Student Health Center and the
 * corner of MSEE, with the open mall plaza and its tree rows in the middle. Wetherill (81, 92)
 * and Potter (147, -26) are 200+ m to the south-east, outside the box.
 */
export const ENGINEERING_MALL: BakeOptions = {
  name: 'Engineering Mall',
  centre: [-30, -290],
  size: 300,
  navSpacing: 6,
  clearance: 1.5,
  spawnsPerTeam: 12,
  levelHeight: 3.5,
  defaultHeight: 10,
};

const TREE_RADIUS = 0.35;
const TREE_TOP = 6;
/** Minimum footprint area (m^2) kept after clipping to the box. */
const MIN_AREA = 4;

const r2 = (n: number): number => Math.round(n * 100) / 100;

function area(poly: Pt[]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i] as Pt;
    const [xj, zj] = poly[j] as Pt;
    a += xj * zi - xi * zj;
  }
  return a / 2;
}

function pointInPoly(poly: Pt[], x: number, z: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i] as Pt;
    const [xj, zj] = poly[j] as Pt;
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function distToSeg(px: number, pz: number, a: Pt, b: Pt): number {
  const ex = b[0] - a[0];
  const ez = b[1] - a[1];
  const l2 = ex * ex + ez * ez;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - a[0]) * ex + (pz - a[1]) * ez) / l2));
  return Math.hypot(px - (a[0] + ex * t), pz - (a[1] + ez * t));
}

/** Sutherland-Hodgman clip of a ring against an axis-aligned rectangle. */
function clipRect(poly: Pt[], minX: number, maxX: number, minZ: number, maxZ: number): Pt[] {
  type Edge = { inside: (p: Pt) => boolean; cut: (a: Pt, b: Pt) => Pt };
  const edges: Edge[] = [
    {
      inside: (p) => p[0] >= minX,
      cut: (a, b) => [minX, a[1] + ((b[1] - a[1]) * (minX - a[0])) / (b[0] - a[0])],
    },
    {
      inside: (p) => p[0] <= maxX,
      cut: (a, b) => [maxX, a[1] + ((b[1] - a[1]) * (maxX - a[0])) / (b[0] - a[0])],
    },
    {
      inside: (p) => p[1] >= minZ,
      cut: (a, b) => [a[0] + ((b[0] - a[0]) * (minZ - a[1])) / (b[1] - a[1]), minZ],
    },
    {
      inside: (p) => p[1] <= maxZ,
      cut: (a, b) => [a[0] + ((b[0] - a[0]) * (maxZ - a[1])) / (b[1] - a[1]), maxZ],
    },
  ];
  let out = poly;
  for (const e of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i] as Pt;
      const prev = input[(i + input.length - 1) % input.length] as Pt;
      if (e.inside(cur)) {
        if (!e.inside(prev)) out.push(e.cut(prev, cur));
        out.push(cur);
      } else if (e.inside(prev)) out.push(e.cut(prev, cur));
    }
    if (out.length === 0) break;
  }
  return out;
}

function buildingHeight(
  b: { heightLidar?: number; tags: Record<string, string> },
  o: BakeOptions,
): number {
  if (b.heightLidar != null && b.heightLidar > 0) return b.heightLidar;
  const levels = Number.parseFloat(b.tags['building:levels'] ?? '');
  if (levels > 0) return levels * o.levelHeight;
  return o.defaultHeight;
}

/** Bucket grid of polygons and discs for clearance queries. */
class Obstacles {
  private cells = new Map<number, number[]>();
  private polys: Pt[][] = [];
  private discs: { x: number; z: number; r: number }[] = [];
  private bucket = 16;

  private key(i: number, j: number): number {
    return (i + 4096) * 8192 + (j + 4096);
  }

  private add(minX: number, maxX: number, minZ: number, maxZ: number, idx: number): void {
    for (let i = Math.floor(minX / this.bucket); i <= Math.floor(maxX / this.bucket); i++) {
      for (let j = Math.floor(minZ / this.bucket); j <= Math.floor(maxZ / this.bucket); j++) {
        const k = this.key(i, j);
        const l = this.cells.get(k);
        if (l) l.push(idx);
        else this.cells.set(k, [idx]);
      }
    }
  }

  /** `margin` is the largest clearance later asked for, so cells cover the inflated shape. */
  addPoly(poly: Pt[], margin: number): void {
    const idx = this.polys.length;
    this.polys.push(poly);
    const xs = poly.map((p) => p[0]);
    const zs = poly.map((p) => p[1]);
    this.add(
      Math.min(...xs) - margin,
      Math.max(...xs) + margin,
      Math.min(...zs) - margin,
      Math.max(...zs) + margin,
      idx,
    );
  }

  addDisc(x: number, z: number, r: number, margin: number): void {
    const idx = -1 - this.discs.length;
    this.discs.push({ x, z, r });
    this.add(x - r - margin, x + r + margin, z - r - margin, z + r + margin, idx);
  }

  /** True when (x, z) is inside a solid or closer than `clear` to one. */
  blocked(x: number, z: number, clear: number): boolean {
    const l = this.cells.get(this.key(Math.floor(x / this.bucket), Math.floor(z / this.bucket)));
    if (!l) return false;
    for (const idx of l) {
      if (idx < 0) {
        const d = this.discs[-1 - idx] as { x: number; z: number; r: number };
        if (Math.hypot(x - d.x, z - d.z) < d.r + clear) return true;
      } else {
        const p = this.polys[idx] as Pt[];
        if (pointInPoly(p, x, z)) return true;
        for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
          if (distToSeg(x, z, p[j] as Pt, p[i] as Pt) < clear) return true;
        }
      }
    }
    return false;
  }

  segmentClear(a: Pt, b: Pt, clear: number): boolean {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.ceil(len / 0.5));
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      if (this.blocked(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, clear)) return false;
    }
    return true;
  }
}

/** Pure: campus -> playable zone (flat ground, colliders, props, spawns, nav graph). */
export function bakeZone(campus: Campus, opts: BakeOptions = ENGINEERING_MALL): ZoneData {
  const o = opts;
  const half = o.size / 2;
  const minX = o.centre[0] - half;
  const maxX = o.centre[0] + half;
  const minZ = o.centre[1] - half;
  const maxZ = o.centre[1] + half;

  // Buildings: outer rings clipped to the box. Courtyard holes are not emitted as separate
  // colliders: a hole is enclosed by its building, so the outer solid already keeps players out
  // of it, and nothing is reachable inside (known-gaps row 10).
  const colliders: ColliderData[] = [];
  const obstacles = new Obstacles();
  for (const b of campus.buildings) {
    let ring = clipRect(b.outer, minX, maxX, minZ, maxZ);
    if (ring.length < 3 || Math.abs(area(ring)) < MIN_AREA) continue;
    ring = ring.map(([x, z]) => [r2(x), r2(z)] as Pt);
    colliders.push({ id: b.id, poly: ring, baseY: 0, topY: r2(buildingHeight(b, o)) });
    obstacles.addPoly(ring, o.clearance);
  }

  const props: PropData[] = [];
  for (const t of campus.trees) {
    if (t.x < minX || t.x > maxX || t.z < minZ || t.z > maxZ) continue;
    const x = r2(t.x);
    const z = r2(t.z);
    props.push({ x, z, radius: TREE_RADIUS, baseY: 0, topY: TREE_TOP });
    obstacles.addDisc(x, z, TREE_RADIUS, o.clearance);
  }
  // Water is excluded from the nav graph (not a collider; the zone has no water of its own).
  for (const w of campus.water) {
    const ring = clipRect(w.outer, minX - 20, maxX + 20, minZ - 20, maxZ + 20);
    if (ring.length >= 3) obstacles.addPoly(ring, o.clearance);
  }

  // Nav grid on free cells, inset from the box edge.
  const inset = o.clearance + 1;
  const cols = Math.floor((o.size - 2 * inset) / o.navSpacing) + 1;
  const gx0 = o.centre[0] - ((cols - 1) * o.navSpacing) / 2;
  const gz0 = o.centre[1] - ((cols - 1) * o.navSpacing) / 2;
  const cellNode = new Int32Array(cols * cols).fill(-1);
  const raw: Pt[] = [];
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < cols; i++) {
      const x = r2(gx0 + i * o.navSpacing);
      const z = r2(gz0 + j * o.navSpacing);
      if (obstacles.blocked(x, z, o.clearance)) continue;
      cellNode[j * cols + i] = raw.length;
      raw.push([x, z]);
    }
  }
  const rawEdges: [number, number][] = [];
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < cols; i++) {
      const a = cellNode[j * cols + i] as number;
      if (a < 0) continue;
      for (const [di, dj] of [
        [1, 0],
        [0, 1],
        [1, 1],
        [-1, 1],
      ] as const) {
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || ni >= cols || nj >= cols) continue;
        const b = cellNode[nj * cols + ni] as number;
        if (b < 0) continue;
        if (obstacles.segmentClear(raw[a] as Pt, raw[b] as Pt, o.clearance)) rawEdges.push([a, b]);
      }
    }
  }

  // Largest connected component (union-find).
  const parent = raw.map((_, i) => i);
  const find = (x: number): number => {
    let r = x;
    while (parent[r] !== r) r = parent[r] as number;
    let c = x;
    while (parent[c] !== r) {
      const n = parent[c] as number;
      parent[c] = r;
      c = n;
    }
    return r;
  };
  for (const [a, b] of rawEdges) parent[find(a)] = find(b);
  const sizes = new Map<number, number>();
  for (let i = 0; i < raw.length; i++) sizes.set(find(i), (sizes.get(find(i)) ?? 0) + 1);
  let best = -1;
  let bestN = 0;
  for (const [root, n] of sizes) {
    if (n > bestN || (n === bestN && root < best)) {
      best = root;
      bestN = n;
    }
  }
  const remap = new Map<number, number>();
  const nodes: NavNode[] = [];
  raw.forEach(([x, z], i) => {
    if (find(i) !== best) return;
    remap.set(i, nodes.length);
    nodes.push({ id: nodes.length, x, z });
  });
  const edges: [number, number][] = [];
  for (const [a, b] of rawEdges) {
    const na = remap.get(a);
    const nb = remap.get(b);
    if (na != null && nb != null) edges.push([na, nb]);
  }

  // Spawns: farthest-point sampling over nav nodes in an annulus around the centre. Team 0 takes
  // the north half (z < centre), team 1 the south half, so the teams start on opposite sides.
  const [cx, cz] = o.centre;
  const spawns: SpawnData[] = [];
  const pick = (team: Team): void => {
    const pool = nodes.filter((n) => {
      const d = Math.hypot(n.x - cx, n.z - cz);
      return d >= half * 0.3 && d <= half * 0.9 && (team === 0 ? n.z < cz : n.z >= cz);
    });
    const chosen: NavNode[] = [];
    const first = pool.reduce<NavNode | undefined>(
      (a, n) => (!a || Math.hypot(n.x - cx, n.z - cz) > Math.hypot(a.x - cx, a.z - cz) ? n : a),
      undefined,
    );
    if (first) chosen.push(first);
    while (chosen.length < o.spawnsPerTeam && pool.length > chosen.length) {
      let bestNode: NavNode | undefined;
      let bestD = -1;
      for (const n of pool) {
        const d = Math.min(...chosen.map((c) => Math.hypot(n.x - c.x, n.z - c.z)));
        if (d > bestD) {
          bestD = d;
          bestNode = n;
        }
      }
      if (!bestNode) break;
      chosen.push(bestNode);
    }
    for (const n of chosen) {
      // Yaw 0 looks toward -z, positive turns left: forward = (-sin yaw, -cos yaw).
      const yaw = Math.atan2(-(cx - n.x), -(cz - n.z));
      spawns.push({ x: n.x, z: n.z, yaw: r2(yaw), team });
    }
  };
  pick(0);
  pick(1);

  return {
    name: o.name,
    bounds: { minX, maxX, minZ, maxZ },
    ground: { x0: minX, z0: minZ, cell: o.size, cols: 2, rows: 2, heights: [0, 0, 0, 0] },
    colliders,
    props,
    spawns,
    nav: { nodes, edges },
  };
}
