// Geodesy + 3D Tiles bounding-volume tests. All tile volumes are tested in a local frame
// at the Bell Tower (x east, z south, u up) so region, box and sphere share one AABB test.
export const ORIGIN = { lat: 40.42728706, lon: -86.91406754 };
const A = 6378137;
const F = 1 / 298.257223563;
const E2 = F * (2 - F);
const R_EARTH = 6371008.8; // same radius as geo.ts makeProjector
const rad = Math.PI / 180;

export type V3 = [number, number, number];
export type Mat4 = number[]; // column-major, as in 3D Tiles

export function llhToEcef(latRad: number, lonRad: number, h: number): V3 {
  const s = Math.sin(latRad);
  const n = A / Math.sqrt(1 - E2 * s * s);
  return [
    (n + h) * Math.cos(latRad) * Math.cos(lonRad),
    (n + h) * Math.cos(latRad) * Math.sin(lonRad),
    (n * (1 - E2) + h) * s,
  ];
}

/** Rigid ECEF -> local frame at a lat/lon (degrees), height 0. */
export function makeEnu(latDeg: number, lonDeg: number) {
  const la = latDeg * rad;
  const lo = lonDeg * rad;
  const o = llhToEcef(la, lo, 0);
  const e: V3 = [-Math.sin(lo), Math.cos(lo), 0];
  const n: V3 = [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)];
  const u: V3 = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return {
    origin: o,
    rot: { e, n, u },
    /** ECEF -> game frame: x east, y up, z south. */
    toLocal(p: V3): V3 {
      const d: V3 = [p[0] - o[0], p[1] - o[1], p[2] - o[2]];
      return [dot(e, d), dot(u, d), -dot(n, d)];
    },
  };
}
export const enu = makeEnu(ORIGIN.lat, ORIGIN.lon);

/** Inverse of geo.ts makeProjector: local (x east, z south) -> [lat, lon] degrees. */
export function unproject(x: number, z: number): [number, number] {
  const k = Math.cos(ORIGIN.lat * rad);
  return [ORIGIN.lat - z / (R_EARTH * rad), ORIGIN.lon + x / (R_EARTH * rad * k)];
}

/** Local-frame box: x east, z south (metres from the Bell Tower), u up from the h=0 ellipsoid. */
export interface Bbox {
  xmin: number;
  xmax: number;
  zmin: number;
  zmax: number;
  umin: number;
  umax: number;
}
// From campus.json named buildings: x -78..174 (Elliott..BHEE), z -261..35 (Forney..Psych), plus
// ~100 m margin. 500 x 500 m. Vertical range is wide because the ground's ellipsoid height here is
// unknown to within a few hundred metres (geoid undulation).
export const MVP_BBOX: Bbox = {
  xmin: -200,
  xmax: 300,
  zmin: -350,
  zmax: 150,
  umin: -400,
  umax: 600,
};

export function bboxLatLon(b: Bbox) {
  const [north, west] = unproject(b.xmin, b.zmin);
  const [south, east] = unproject(b.xmax, b.zmax);
  return { south, north, west, east };
}

export type BoundingVolume = { region: number[] } | { box: number[] } | { sphere: number[] };

export function mat4Mul(a: Mat4, b: Mat4): Mat4 {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++)
        o[c * 4 + r] += (a[k * 4 + r] as number) * (b[c * 4 + k] as number);
  return o;
}
export const IDENTITY: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export const applyPoint = (m: Mat4, p: V3): V3 => [
  (m[0] as number) * p[0] + (m[4] as number) * p[1] + (m[8] as number) * p[2] + (m[12] as number),
  (m[1] as number) * p[0] + (m[5] as number) * p[1] + (m[9] as number) * p[2] + (m[13] as number),
  (m[2] as number) * p[0] + (m[6] as number) * p[1] + (m[10] as number) * p[2] + (m[14] as number),
];

/** Conservative test: does the volume (in ECEF, after `world` transform) touch the bbox? */
export function intersectsBbox(bv: BoundingVolume, b: Bbox, world: Mat4 = IDENTITY): boolean {
  if ('region' in bv) {
    const [w, s, e, n, hmin, hmax] = bv.region as [number, number, number, number, number, number];
    const ll = bboxLatLon(b);
    return (
      w <= ll.east * rad &&
      e >= ll.west * rad &&
      s <= ll.north * rad &&
      n >= ll.south * rad &&
      hmax >= b.umin &&
      hmin <= b.umax
    );
  }
  const clamp = (v: number, a: number, c: number) => Math.max(a, Math.min(c, v));
  if ('sphere' in bv) {
    const s = bv.sphere as number[];
    const c = enu.toLocal(applyPoint(world, [s[0] as number, s[1] as number, s[2] as number]));
    const sc = Math.max(
      Math.hypot(world[0] as number, world[1] as number, world[2] as number),
      Math.hypot(world[4] as number, world[5] as number, world[6] as number),
      Math.hypot(world[8] as number, world[9] as number, world[10] as number),
    );
    const r = (s[3] as number) * sc;
    const dx = c[0] - clamp(c[0], b.xmin, b.xmax);
    const du = c[1] - clamp(c[1], b.umin, b.umax);
    const dz = c[2] - clamp(c[2], b.zmin, b.zmax);
    return dx * dx + dz * dz + du * du <= r * r;
  }
  const bx = bv.box;
  const ctr: V3 = [bx[0] as number, bx[1] as number, bx[2] as number];
  const axes: V3[] = [
    [bx[3] as number, bx[4] as number, bx[5] as number],
    [bx[6] as number, bx[7] as number, bx[8] as number],
    [bx[9] as number, bx[10] as number, bx[11] as number],
  ];
  const mn = [Infinity, Infinity, Infinity];
  const mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < 8; i++) {
    const sg = [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1];
    const p = [0, 1, 2].map(
      (k) =>
        (ctr[k] as number) + axes.reduce((s, a, j) => s + (sg[j] as number) * (a[k] as number), 0),
    ) as V3;
    const q = enu.toLocal(applyPoint(world, p));
    for (let k = 0; k < 3; k++) {
      mn[k] = Math.min(mn[k] as number, q[k] as number);
      mx[k] = Math.max(mx[k] as number, q[k] as number);
    }
  }
  // shortcut: AABB of an oriented box can over-select slightly; fine for a download filter.
  return (
    (mn[0] as number) <= b.xmax &&
    (mx[0] as number) >= b.xmin &&
    (mn[2] as number) <= b.zmax &&
    (mx[2] as number) >= b.zmin &&
    (mn[1] as number) <= b.umax &&
    (mx[1] as number) >= b.umin
  );
}
