import { ShapeUtils, Vector2 } from 'three';

/** Local metres: x east, z south. Outer rings CCW on a north-up map, holes CW (see map-tools types). */
export type Pt = readonly [x: number, z: number];
export interface Footprint {
  outer: readonly Pt[];
  holes?: readonly (readonly Pt[])[];
}

/** Shoelace sum in (x, z): negative for a ring that is CCW on a north-up map. */
export function area2(r: readonly Pt[]) {
  let s = 0;
  r.forEach((p, i) => {
    const q = r[(i + 1) % r.length] as Pt;
    s += p[0] * q[1] - q[0] * p[1];
  });
  return s;
}

/** Fix winding so the same outward-normal formula works for outer rings and holes. */
export function orient(f: Footprint) {
  const fix = (r: readonly Pt[], outer: boolean) =>
    area2(r) < 0 === outer ? [...r] : [...r].reverse();
  return { outer: fix(f.outer, true), holes: (f.holes ?? []).map((h) => fix(h, false)) };
}

export interface Edge {
  a: Pt;
  b: Pt;
  L: number;
  /** Unit direction. */
  ux: number;
  uz: number;
  /** Unit outward normal (away from the building; into the courtyard for holes): (-uz, ux). */
  nx: number;
  nz: number;
  /** Distance along the ring to `a`, so textures run on around corners. */
  s: number;
  /** tan(turn/2) at a and b: positive at outside corners (gap), negative at inside corners. */
  tanA: number;
  tanB: number;
}

/** Edges of an oriented ring; edges shorter than `minLen` are dropped (not their corners). */
export function edges(ring: readonly Pt[], minLen = 0.05): Edge[] {
  const n = ring.length;
  const dirs = ring.map((p, i) => {
    const q = ring[(i + 1) % n] as Pt;
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1e-9;
    return [(q[0] - p[0]) / L, (q[1] - p[1]) / L, L] as const;
  });
  const out: Edge[] = [];
  let s = 0;
  ring.forEach((a, i) => {
    const [ux, uz, L] = dirs[i] as readonly [number, number, number];
    const prev = dirs[(i + n - 1) % n] as readonly [number, number, number];
    const next = dirs[(i + 1) % n] as readonly [number, number, number];
    const tan = (u1: number, z1: number, u2: number, z2: number) => {
      // theta > 0 when the next edge turns toward the interior (outside corner).
      const theta = Math.atan2(-(u2 * -z1 + z2 * u1), u1 * u2 + z1 * z2);
      return Math.tan(Math.max(-1.5, Math.min(1.5, theta / 2)));
    };
    if (L >= minLen)
      out.push({
        a,
        b: ring[(i + 1) % n] as Pt,
        L,
        ux,
        uz,
        nx: -uz,
        nz: ux,
        s,
        tanA: tan(prev[0], prev[1], ux, uz),
        tanB: tan(ux, uz, next[0], next[1]),
      });
    s += L;
  });
  return out;
}

/** Roof triangles as index triples into outer ++ holes. */
export function triangulate(outer: readonly Pt[], holes: readonly (readonly Pt[])[]) {
  const v = (r: readonly Pt[]) => r.map((p) => new Vector2(p[0], p[1]));
  return ShapeUtils.triangulateShape(v(outer), holes.map(v));
}
