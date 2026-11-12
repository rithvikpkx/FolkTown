import type { Material, Mesh } from 'three';
import { Batch, UP, type Vec3 } from '../batch';
import { type Edge, edges, type Footprint, orient, type Pt, triangulate } from './geom';

export type { Footprint, Pt } from './geom';

export interface FacadeStyle {
  /** Material key for the main wall (e.g. 'brick'). Trim uses 'stone', roofs 'roof', panes 'glass'. */
  wall: string;
  /** Storeys; default round(height / floorHeight). */
  floors?: number;
  /** Used only when `floors` is absent. Default 3.8. */
  floorHeight?: number;
  bayWidth: number;
  window: 'punched' | 'ribbon';
  /** Gabled applies to rectangles only; other shapes fall back to flat with a parapet. */
  roof: 'flat' | 'gabled';
  /** Base course, piers, cornice and window surrounds. */
  trim: boolean;
}

/** Geometry grouped per material key; one merged mesh each. */
export class Batches {
  private m = new Map<string, Batch>();
  get(key: string) {
    const b = this.m.get(key) ?? new Batch();
    this.m.set(key, b);
    return b;
  }
  keys() {
    return [...this.m.keys()];
  }
  get triangles() {
    let n = 0;
    for (const b of this.m.values()) n += b.triangleCount;
    return n;
  }
  meshes(materials: Record<string, Material>): Mesh[] {
    return [...this.m].map(([k, b]) => {
      const mat = materials[k];
      if (!mat) throw new Error(`no material for "${k}"`);
      return b.mesh(mat);
    });
  }
}

const WT = 1.8; // metres per wall texture repeat
const ST = 2.4;
const MIN_MARGIN = 1.2; // bare wall kept at each end of an edge that has bays

const P = (e: Edge, u: number, v: number, d: number): Vec3 => [
  e.a[0] + e.ux * u + e.nx * d,
  v,
  e.a[1] + e.uz * u + e.nz * d,
];
const U3 = (e: Edge): Vec3 => [e.ux, 0, e.uz];
const N3 = (e: Edge): Vec3 => [e.nx, 0, e.nz];
const neg = (v: Vec3): Vec3 => [-v[0], -v[1], -v[2]];

/** Flat wall-plane rectangle; u/v are edge-local metres, d is the offset along the normal. */
function frect(
  b: Batch,
  e: Edge,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  d: number,
  t: number,
) {
  if (u1 - u0 > 1e-4 && v1 - v0 > 1e-4)
    b.rect(P(e, u0, v0, d), U3(e), UP, u1 - u0, v1 - v0, t, e.s + u0, v0);
}

/** Box oriented to the edge, spanning d0..d1 along the outward normal; no back face. */
function obox(
  b: Batch,
  e: Edge,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  d0: number,
  d1: number,
  t: number,
) {
  const w = u1 - u0;
  const h = v1 - v0;
  const dd = d1 - d0;
  const U = U3(e);
  const N = N3(e);
  b.rect(P(e, u0, v0, d1), U, UP, w, h, t, e.s + u0, v0); // front
  b.rect(P(e, u1, v0, d1), neg(N), UP, dd, h, t); // right
  b.rect(P(e, u0, v0, d0), N, UP, dd, h, t); // left
  b.rect(P(e, u0, v1, d1), U, neg(N), w, dd, t); // top
  b.rect(P(e, u0, v0, d0), U, N, w, dd, t); // bottom
}

const hash = (a: number) => {
  const x = Math.sin(a * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

function windowAt(
  B: Batches,
  e: Edge,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  style: FacadeStyle,
  seed: number,
) {
  const r = 0.3; // recess depth
  const w = u1 - u0;
  const h = v1 - v0;
  const stone = B.get('stone');
  const glass = B.get('glass');
  const U = U3(e);
  const N = N3(e);
  glass.shade = () => hash(seed); // per-window seed for the fake-room shader (vertex colour r)
  glass.rect(P(e, u0, v0, -r), U, UP, w, h, 1, -w / 2, 0);
  glass.shade = null;
  stone.rect(P(e, u0, v0, 0), neg(N), UP, r, h, ST);
  stone.rect(P(e, u1, v0, -r), N, UP, r, h, ST);
  stone.rect(P(e, u0, v0, 0), U, neg(N), w, r, ST);
  stone.rect(P(e, u0, v1, -r), U, N, w, r, ST);
  if (style.trim && style.window === 'punched') {
    obox(stone, e, u0 - 0.2, v0 - 0.16, u1 + 0.2, v0, 0, 0.13, ST); // sill
    obox(stone, e, u0 - 0.16, v1, u1 + 0.16, v1 + 0.3, 0, 0.07, ST); // lintel
    obox(stone, e, u0 - 0.16, v0, u0, v1, 0, 0.04, ST);
    obox(stone, e, u1, v0, u1 + 0.16, v1, 0, 0.04, ST);
  }
}

/** Number of window bays on an edge; 0 when it is too short to carry one. */
export function bayCount(L: number, bayWidth: number) {
  return Math.max(0, Math.floor((L - MIN_MARGIN) / bayWidth));
}

function wallEdge(
  B: Batches,
  e: Edge,
  seed: number,
  fh: number,
  floors: number,
  top: number,
  style: FacadeStyle,
) {
  const wall = B.get(style.wall);
  const nb = bayCount(e.L, style.bayWidth);
  if (nb === 0) return frect(wall, e, 0, 0, e.L, top, 0, WT);
  const ribbon = style.window === 'ribbon';
  const bw = style.bayWidth;
  const m = (e.L - nb * bw) / 2;
  const ww = ribbon ? bw - 0.6 : Math.min(1.5, bw - 1.2);
  const sill = ribbon ? 0.8 : 0.95;
  const wh = Math.max(0.5, Math.min(ribbon ? fh - 1.3 : 2.5, fh - sill - 0.5));
  for (let f = 0; f < floors; f++) {
    const y0 = f * fh;
    const w0 = y0 + sill;
    const w1 = w0 + wh;
    frect(wall, e, 0, y0, e.L, w0, 0, WT);
    frect(wall, e, 0, w1, e.L, f === floors - 1 ? top : y0 + fh, 0, WT);
    let u = 0;
    for (let b = 0; b < nb; b++) {
      const cx = m + (b + 0.5) * bw;
      frect(wall, e, u, w0, cx - ww / 2, w1, 0, WT);
      windowAt(B, e, cx - ww / 2, w0, cx + ww / 2, w1, style, seed * 1000 + f * 31 + b);
      u = cx + ww / 2;
    }
    frect(wall, e, u, w0, e.L, w1, 0, WT);
  }
  if (style.trim)
    for (let b = 0; b <= nb; b++) {
      const u = m + b * bw;
      obox(wall, e, u - 0.28, 1, u + 0.28, floors * fh + 0.05, 0, 0.12, WT);
    }
}

/** Base course and cornice; ends are mitred by extending/shortening them at corners. */
function trimEdge(B: Batches, e: Edge, top: number, cornice: boolean) {
  const stone = B.get('stone');
  const run = (v0: number, v1: number, depth: number) => {
    const c = (t: number) => Math.max(-0.45 * e.L, Math.min(3 * depth, depth * t));
    obox(stone, e, -c(e.tanA), v0, e.L + c(e.tanB), v1, 0, depth, ST);
  };
  run(0, 0.9, 0.08);
  run(0.9, 1.0, 0.12);
  if (!cornice) return;
  run(top - 0.45, top - 0.12, 0.22);
  run(top - 0.12, top, 0.34);
}

function isRect(r: readonly Pt[]) {
  const es = edges(r);
  return (
    r.length === 4 &&
    es.length === 4 &&
    es.every((e, i) => {
      const n = es[(i + 1) % 4] as Edge;
      return Math.abs(e.ux * n.ux + e.uz * n.uz) < 0.05;
    })
  );
}

function flatRoof(B: Batches, outer: readonly Pt[], holes: readonly (readonly Pt[])[], y: number) {
  const pts = [...outer, ...holes.flat()];
  const roof = B.get('roof');
  const at = (q: number): Vec3 => [(pts[q] as Pt)[0], y, (pts[q] as Pt)[1]];
  for (const [i, j, k] of triangulate(outer, holes) as [number, number, number][]) {
    const a = at(i);
    const b = at(j);
    const c = at(k);
    const cross = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]); // y of (b-a)x(c-a), negated
    if (cross > 0) roof.tri(a, b, c, 3);
    else roof.tri(a, c, b, 3);
  }
}

/** Gabled roof over a rectangle: two slopes plus gable-end triangles in the wall material. */
function gableRoof(B: Batches, es: Edge[], H: number, wallKey: string, long: number) {
  const short = es[1 - long] as Edge;
  const rise = (short.L / 2) * 0.55;
  const slope = Math.hypot(short.L / 2, rise);
  const roof = B.get('roof');
  for (const k of [long, long + 2]) {
    const e = es[k] as Edge;
    const V: Vec3 = [(-e.nx * short.L) / 2 / slope, rise / slope, (-e.nz * short.L) / 2 / slope];
    roof.rect(P(e, 0, H, 0), U3(e), V, e.L, slope, 3);
  }
  for (const k of [1 - long, 3 - long]) {
    const e = es[k] as Edge;
    B.get(wallKey).tri(P(e, 0, H, 0), P(e, e.L, H, 0), P(e, e.L / 2, H + rise, 0), WT);
  }
}

/** Detailed (Tier 1/2) building: recessed windows, trim, courtyards, flat or gabled roof. */
export function buildFacade(B: Batches, fp: Footprint, height: number, style: FacadeStyle) {
  const { outer, holes } = orient(fp);
  const floors = Math.max(1, style.floors ?? Math.round(height / (style.floorHeight ?? 3.8)));
  const fh = height / floors;
  const rect = style.roof === 'gabled' && holes.length === 0 && isRect(outer);
  const top = rect ? height : height + 0.9; // flat roofs get a parapet
  const oe = edges(outer);
  const long = rect && (oe[0] as Edge).L >= (oe[1] as Edge).L ? 0 : 1;
  [outer, ...holes].forEach((ring, ri) => {
    edges(ring).forEach((e, i) => {
      wallEdge(B, e, ri * 100 + i, fh, floors, top, style);
      // Gable ends (odd offset from the long pair) carry no cornice.
      if (style.trim) trimEdge(B, e, top, !(rect && (i + long) % 2 === 1));
      // Parapet inner face closes the roof edge when seen from above.
      if (!rect)
        B.get(style.wall).rect(P(e, e.L, height, 0), neg(U3(e)), UP, e.L, top - height, WT);
    });
  });
  if (rect) gableRoof(B, oe, height, style.wall, long);
  else flatRoof(B, outer, holes, height);
}

/** Tier 3: plain extrusion and flat roof, one quad per edge. */
export function buildLowDetail(
  B: Batches,
  fp: Footprint,
  height: number,
  style: Pick<FacadeStyle, 'wall'>,
) {
  const { outer, holes } = orient(fp);
  const wall = B.get(style.wall);
  for (const ring of [outer, ...holes])
    for (const e of edges(ring)) frect(wall, e, 0, 0, e.L, height, 0, 4);
  flatRoof(B, outer, holes, height);
}
