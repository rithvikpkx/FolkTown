import { readFileSync } from 'node:fs';
import type { PlayerInput, ZoneData } from '@folktown/shared';
import { PLAYER_RADIUS, TICK_DT } from '@folktown/shared';
import { createPlayerState, stepController, ZoneCollision } from '@folktown/sim';
import { describe, expect, it } from 'vitest';
import { type BakeOptions, bakeZone } from './bake-zone.ts';
import type { Area, Campus, Pt } from './types.ts';

const sq = (x0: number, z0: number, x1: number, z1: number): Pt[] => [
  [x0, z0],
  [x1, z0],
  [x1, z1],
  [x0, z1],
];

const opts: BakeOptions = {
  name: 'Test',
  centre: [0, 0],
  size: 100,
  navSpacing: 6,
  clearance: 1.5,
  spawnsPerTeam: 4,
  levelHeight: 3.5,
  defaultHeight: 10,
};

function area(id: string, outer: Pt[], tags: Record<string, string> = {}): Area {
  return { id, outer, holes: [], tags };
}

const campus: Campus = {
  origin: { lat: 0, lon: 0, name: 'x' },
  buildings: [
    { ...area('lidar', sq(10, 10, 20, 20)), heightLidar: 17.5 },
    area('levels', sq(-30, -30, -20, -20), { 'building:levels': '3' }),
    area('plain', sq(-30, 20, -20, 30)),
    area('clipped', sq(40, -10, 80, 10)),
    area('outside', sq(200, 200, 210, 210)),
  ],
  paths: [],
  trees: [
    { id: 't1', x: 0.123, z: 5.678, tags: {} },
    { id: 't2', x: 500, z: 0, tags: {} },
  ],
  water: [area('pond', sq(-10, -45, 10, -35))],
  grass: [],
  stats: { failedRelations: 0, skippedElements: 0 },
};

function connected(z: ZoneData): boolean {
  const adj = z.nav.nodes.map(() => [] as number[]);
  for (const [a, b] of z.nav.edges) {
    adj[a]?.push(b);
    adj[b]?.push(a);
  }
  const seen = new Set<number>([0]);
  const stack = [0];
  while (stack.length) {
    for (const n of adj[stack.pop() as number] as number[]) {
      if (!seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen.size === z.nav.nodes.length;
}

describe('bakeZone (synthetic campus)', () => {
  const zone = bakeZone(campus, opts);

  it('clips buildings to the box and assigns heights', () => {
    const ids = zone.colliders.map((c) => c.id);
    expect(ids).toEqual(['lidar', 'levels', 'plain', 'clipped']);
    const top = (id: string) => zone.colliders.find((c) => c.id === id)?.topY;
    expect(top('lidar')).toBe(17.5);
    expect(top('levels')).toBe(10.5);
    expect(top('plain')).toBe(10);
    const xs = zone.colliders.find((c) => c.id === 'clipped')?.poly.map((p) => p[0]) ?? [];
    expect(Math.max(...xs)).toBe(50);
  });

  it('keeps only trees inside the box, rounded', () => {
    expect(zone.props).toHaveLength(1);
    expect(zone.props[0]?.x).toBe(0.12);
    expect(zone.props[0]?.z).toBe(5.68);
  });

  it('has flat ground and bounds', () => {
    expect(zone.bounds).toEqual({ minX: -50, maxX: 50, minZ: -50, maxZ: 50 });
    expect(zone.ground.heights).toEqual([0, 0, 0, 0]);
  });

  it('nav avoids buildings and water, is connected, and spawns are on it', () => {
    expect(zone.nav.nodes.length).toBeGreaterThan(50);
    expect(connected(zone)).toBe(true);
    for (const n of zone.nav.nodes) {
      expect(n.x >= -50 && n.x <= 50).toBe(true);
      for (const c of zone.colliders) expect(insidePoly(c.poly, n.x, n.z)).toBe(false);
      expect(n.z > -46 && n.z < -34 && Math.abs(n.x) < 11).toBe(false);
    }
    expect(zone.spawns).toHaveLength(8);
    expect(zone.spawns.filter((s) => s.team === 0)).toHaveLength(4);
  });

  it('is deterministic', () => {
    expect(JSON.stringify(bakeZone(campus, opts))).toBe(JSON.stringify(zone));
  });
});

describe('data/zones/engineering-mall.json', () => {
  const zone = JSON.parse(
    readFileSync(new URL('../../../data/zones/engineering-mall.json', import.meta.url), 'utf8'),
  ) as ZoneData;
  const col = new ZoneCollision(zone);

  /** Does a circle of radius r at (x,z) touch any solid? */
  function touches(x: number, z: number, r: number): boolean {
    for (const i of col.query(x, z, r + 1)) {
      const s = col.solids[i];
      if (!s) continue;
      if (s.poly) {
        if (insidePoly(s.poly, x, z)) return true;
        for (let a = 0, b = s.poly.length - 1; a < s.poly.length; b = a++) {
          if (segDist(x, z, s.poly[b] as Pt, s.poly[a] as Pt) < r) return true;
        }
      } else if (Math.hypot(x - s.cx, z - s.cz) < s.r + r) return true;
    }
    return false;
  }

  it('has the expected shape', () => {
    expect(zone.colliders.length).toBeGreaterThan(5);
    expect(zone.spawns).toHaveLength(24);
    expect(zone.spawns.filter((s) => s.team === 0)).toHaveLength(12);
    expect(zone.nav.nodes.length).toBeGreaterThan(500);
  });

  it('spawns are inside bounds and free of colliders', () => {
    for (const s of zone.spawns) {
      expect(s.x).toBeGreaterThan(zone.bounds.minX);
      expect(s.x).toBeLessThan(zone.bounds.maxX);
      expect(s.z).toBeGreaterThan(zone.bounds.minZ);
      expect(s.z).toBeLessThan(zone.bounds.maxZ);
      expect(touches(s.x, s.z, PLAYER_RADIUS)).toBe(false);
    }
  });

  it('nav is one connected component', () => {
    expect(connected(zone)).toBe(true);
  });

  it('nav edges do not cross colliders', () => {
    for (const [a, b] of zone.nav.edges) {
      const p = zone.nav.nodes[a];
      const q = zone.nav.nodes[b];
      if (!p || !q) throw new Error('bad edge');
      const n = Math.ceil(Math.hypot(q.x - p.x, q.z - p.z) / 0.5);
      for (let s = 0; s <= n; s++) {
        const t = s / n;
        expect(touches(p.x + (q.x - p.x) * t, p.z + (q.z - p.z) * t, PLAYER_RADIUS)).toBe(false);
      }
    }
  });

  it('a controller walk from a spawn moves and stays out of solids', () => {
    const sp = zone.spawns[0];
    if (!sp) throw new Error('no spawn');
    const p = createPlayerState(1, sp.team, sp.x, 0, sp.z, sp.yaw);
    const input: PlayerInput = {
      tick: 0,
      moveX: 0,
      moveZ: 1,
      yaw: sp.yaw,
      pitch: 0,
      jump: false,
      sprint: false,
      crouch: false,
      fire: false,
      ads: false,
      reload: false,
    };
    for (let i = 0; i < 240; i++) {
      stepController(p, { ...input, tick: i }, col, TICK_DT);
      expect(touches(p.pos.x, p.pos.z, PLAYER_RADIUS - 0.05)).toBe(false);
    }
    expect(Math.hypot(p.pos.x - sp.x, p.pos.z - sp.z)).toBeGreaterThan(5);
    expect(p.pos.y).toBeCloseTo(0, 1);
  });
});

function insidePoly(poly: Pt[], x: number, z: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i] as Pt;
    const [xj, zj] = poly[j] as Pt;
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function segDist(px: number, pz: number, a: Pt, b: Pt): number {
  const ex = b[0] - a[0];
  const ez = b[1] - a[1];
  const l2 = ex * ex + ez * ez;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - a[0]) * ex + (pz - a[1]) * ez) / l2));
  return Math.hypot(px - (a[0] + ex * t), pz - (a[1] + ez * t));
}
