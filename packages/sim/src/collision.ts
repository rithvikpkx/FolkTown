import type { ColliderData, ZoneData } from '@folktown/shared';

export interface RayHit {
  /** Distance along the (normalised) ray. */
  t: number;
  x: number;
  y: number;
  z: number;
  /** Surface normal at the hit. */
  nx: number;
  ny: number;
  nz: number;
  /** Collider id, or `prop:<index>`. */
  id: string;
}

/** Unified solid: a polygon prism, or a cylinder (poly is null). */
export interface Solid {
  id: string;
  poly: [number, number][] | null;
  cx: number;
  cz: number;
  r: number;
  baseY: number;
  topY: number;
}

const CELL = 16;

export function groundHeightAt(zone: ZoneData, x: number, z: number): number {
  const g = zone.ground;
  const fx = Math.min(Math.max((x - g.x0) / g.cell, 0), g.cols - 1);
  const fz = Math.min(Math.max((z - g.z0) / g.cell, 0), g.rows - 1);
  const ix = Math.min(Math.floor(fx), g.cols - 2);
  const iz = Math.min(Math.floor(fz), g.rows - 2);
  const tx = fx - ix;
  const tz = fz - iz;
  const h = (i: number, j: number) => g.heights[j * g.cols + i] ?? 0;
  const a = h(ix, iz) * (1 - tx) + h(ix + 1, iz) * tx;
  const b = h(ix, iz + 1) * (1 - tx) + h(ix + 1, iz + 1) * tx;
  return a * (1 - tz) + b * tz;
}

export function pointInPoly(poly: [number, number][], x: number, z: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i] as [number, number];
    const [xj, zj] = poly[j] as [number, number];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Spatial grid over the zone's solids. Deterministic: results come back sorted by index. */
export class ZoneCollision {
  readonly zone: ZoneData;
  readonly solids: Solid[] = [];
  private cells = new Map<number, number[]>();
  private stamp: number[] = [];
  private stampId = 0;

  constructor(zone: ZoneData) {
    this.zone = zone;
    for (const c of zone.colliders) this.addCollider(c);
    zone.props.forEach((p, i) => {
      this.addSolid({
        id: `prop:${i}`,
        poly: null,
        cx: p.x,
        cz: p.z,
        r: p.radius,
        baseY: p.baseY,
        topY: p.topY,
      });
    });
  }

  private addCollider(c: ColliderData): void {
    this.addSolid({ id: c.id, poly: c.poly, cx: 0, cz: 0, r: 0, baseY: c.baseY, topY: c.topY });
  }

  private key(i: number, j: number): number {
    return (i + 32768) * 65536 + (j + 32768);
  }

  private addSolid(s: Solid): void {
    const idx = this.solids.length;
    this.solids.push(s);
    this.stamp.push(0);
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;
    if (s.poly) {
      for (const [x, z] of s.poly) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }
    } else {
      minX = s.cx - s.r;
      maxX = s.cx + s.r;
      minZ = s.cz - s.r;
      maxZ = s.cz + s.r;
    }
    for (let i = Math.floor(minX / CELL); i <= Math.floor(maxX / CELL); i++) {
      for (let j = Math.floor(minZ / CELL); j <= Math.floor(maxZ / CELL); j++) {
        const k = this.key(i, j);
        let list = this.cells.get(k);
        if (!list) {
          list = [];
          this.cells.set(k, list);
        }
        list.push(idx);
      }
    }
  }

  /** Solid indices whose cells overlap the square [x±r, z±r]. Sorted ascending. */
  query(x: number, z: number, r: number): number[] {
    const out: number[] = [];
    this.stampId++;
    this.collect(
      Math.floor((x - r) / CELL),
      Math.floor((x + r) / CELL),
      Math.floor((z - r) / CELL),
      Math.floor((z + r) / CELL),
      out,
    );
    return out.sort((a, b) => a - b);
  }

  private collect(i0: number, i1: number, j0: number, j1: number, out: number[]): void {
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        const list = this.cells.get(this.key(i, j));
        if (!list) continue;
        for (const idx of list) {
          if (this.stamp[idx] === this.stampId) continue;
          this.stamp[idx] = this.stampId;
          out.push(idx);
        }
      }
    }
  }

  groundHeight(x: number, z: number): number {
    return groundHeightAt(this.zone, x, z);
  }

  /** Nearest hit along a ray against colliders and props (not the ground). */
  raycast(
    origin: { x: number; y: number; z: number },
    dir: { x: number; y: number; z: number },
    maxDist: number,
  ): RayHit | null {
    const len = Math.hypot(dir.x, dir.y, dir.z);
    if (len === 0) return null;
    const dx = dir.x / len;
    const dy = dir.y / len;
    const dz = dir.z / len;
    // Candidates: cells touched by points sampled along the ray.
    const cand: number[] = [];
    this.stampId++;
    const step = CELL / 2;
    const n = Math.max(1, Math.ceil(maxDist / step));
    for (let s = 0; s <= n; s++) {
      const t = Math.min(maxDist, s * step);
      const ci = Math.floor((origin.x + dx * t) / CELL);
      const cj = Math.floor((origin.z + dz * t) / CELL);
      this.collect(ci - 1, ci + 1, cj - 1, cj + 1, cand);
    }
    cand.sort((a, b) => a - b);

    let best: RayHit | null = null;
    const consider = (t: number, nx: number, ny: number, nz: number, id: string) => {
      if (t < 0 || t > maxDist || (best && t >= best.t)) return;
      best = {
        t,
        x: origin.x + dx * t,
        y: origin.y + dy * t,
        z: origin.z + dz * t,
        nx,
        ny,
        nz,
        id,
      };
    };

    for (const idx of cand) {
      const s = this.solids[idx] as Solid;
      if (s.poly) {
        const p = s.poly;
        for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
          const [ax, az] = p[j] as [number, number];
          const [bx, bz] = p[i] as [number, number];
          const ex = bx - ax;
          const ez = bz - az;
          const denom = dx * ez - dz * ex;
          if (Math.abs(denom) < 1e-12) continue;
          const ox = ax - origin.x;
          const oz = az - origin.z;
          const t = (ox * ez - oz * ex) / denom;
          const u = (ox * dz - oz * dx) / denom;
          if (u < 0 || u > 1) continue;
          const y = origin.y + dy * t;
          if (y < s.baseY || y > s.topY) continue;
          let nx = ez;
          let nz = -ex;
          const nl = Math.hypot(nx, nz);
          nx /= nl;
          nz /= nl;
          if (nx * dx + nz * dz > 0) {
            nx = -nx;
            nz = -nz;
          }
          consider(t, nx, 0, nz, s.id);
        }
        if (Math.abs(dy) > 1e-12) {
          const t = (s.topY - origin.y) / dy;
          if (t >= 0 && pointInPoly(p, origin.x + dx * t, origin.z + dz * t)) {
            consider(t, 0, dy > 0 ? -1 : 1, 0, s.id);
          }
        }
      } else {
        const fx = origin.x - s.cx;
        const fz = origin.z - s.cz;
        const a = dx * dx + dz * dz;
        if (a > 1e-12) {
          const b = fx * dx + fz * dz;
          const c = fx * fx + fz * fz - s.r * s.r;
          const disc = b * b - a * c;
          if (disc >= 0) {
            const t = (-b - Math.sqrt(disc)) / a;
            const y = origin.y + dy * t;
            if (y >= s.baseY && y <= s.topY) {
              const nx = fx + dx * t;
              const nz = fz + dz * t;
              consider(t, nx / s.r, 0, nz / s.r, s.id);
            }
          }
        }
        if (Math.abs(dy) > 1e-12) {
          const t = (s.topY - origin.y) / dy;
          const hx = origin.x + dx * t - s.cx;
          const hz = origin.z + dz * t - s.cz;
          if (t >= 0 && hx * hx + hz * hz <= s.r * s.r) {
            consider(t, 0, dy > 0 ? -1 : 1, 0, s.id);
          }
        }
      }
    }
    return best;
  }
}
