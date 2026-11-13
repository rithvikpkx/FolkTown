// Shared helpers for the v5 hotspots (elliott.js, memorial-mall.js). Lives in lib/ so import.meta.glob('hotspots/*.js') does not pick it up.
import { BufferGeometry, ClampToEdgeWrapping, DoubleSide, Float32BufferAttribute, Mesh, MeshStandardMaterial, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace, TextureLoader } from 'three';

export const BASE = (import.meta.env?.BASE_URL ?? '/') + 'campus/';
export const rng = (seed) => () => ((seed = (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) | 0), ((seed ^ (seed >>> 14)) >>> 0) / 4294967296);

const loader = new TextureLoader();
export function tex(url, { srgb = true, aniso = 8 } = {}) {
  const t = loader.load(BASE + url);
  t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = aniso; if (srgb) t.colorSpace = SRGBColorSpace;
  return t;
}
export const std = (o) => new MeshStandardMaterial({ side: DoubleSide, ...o });

// merged-geometry accumulator: quads/triangles with per-vertex normal, uv and optional colour (same contract as facades.js Bucket, plus a metre-uv mode)
export class Buf {
  constructor(mat, colored = false) { this.mat = mat; this.p = []; this.n = []; this.uv = []; this.c = colored ? [] : null; this.tris = 0; }
  tri(a, b, c, ua, ub, uc, col) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    [a, b, c].forEach((v, i) => { this.p.push(v[0], v[1], v[2]); this.n.push(nx, ny, nz); const u = [ua, ub, uc][i]; this.uv.push(u[0], u[1]); if (this.c) this.c.push(...col); });
    this.tris++;
  }
  // quad a,b,c,d counter-clockwise seen from the visible side; uvs = 4 [u,v] pairs; default = planar metres (u along a->b, v along a->d) * [su, sv]
  q(a, b, c, d, su = 1, sv = 1, uvs, col) {
    const w = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), h = Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2]);
    const t = uvs || [[0, 0], [w * su, 0], [w * su, h * sv], [0, h * sv]];
    this.tri(a, b, c, t[0], t[1], t[2], col); this.tri(a, c, d, t[0], t[2], t[3], col);
  }
  mesh() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.n, 3)); g.setAttribute('uv', new Float32BufferAttribute(this.uv, 2));
    if (this.c) g.setAttribute('color', new Float32BufferAttribute(this.c, 3));
    g.computeBoundingSphere();
    const m = new Mesh(g, this.mat); m.castShadow = m.receiveShadow = true; return m;
  }
}

// flat polygon fill at height y, uv = world metres * s, normal up. ring: [[x,z]...] (any winding)
export function fillPoly(buf, ring, y, s = 0.25) {
  const sh = new Shape(ring.map(([x, z]) => ({ x, y: -z })));
  const g = new ShapeGeometry(sh), p = g.attributes.position, ix = g.index.array;
  for (let i = 0; i < ix.length; i += 3) {
    const v = [0, 1, 2].map((k) => [p.getX(ix[i + k]), y, -p.getY(ix[i + k])]);
    // ShapeGeometry is CCW seen from +y after our z flip? make the face point up explicitly
    const e1 = [v[1][0] - v[0][0], v[1][2] - v[0][2]], e2 = [v[2][0] - v[0][0], v[2][2] - v[0][2]], up = e1[1] * e2[0] - e1[0] * e2[1] > 0;
    const [a, b, c] = up ? v : [v[0], v[2], v[1]];
    buf.tri(a, b, c, [a[0] * s, a[2] * s], [b[0] * s, b[2] * s], [c[0] * s, c[2] * s]);
  }
  g.dispose();
}

// ribbon of width w along polyline pts [[x,z]...] at height y; uv = (metres along * s, across 0..1)
export function ribbon(buf, pts, w, y, s = 0.25) {
  let acc = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0); if (L < 1e-3) continue;
    const nx = (-(z1 - z0) / L) * (w / 2), nz = ((x1 - x0) / L) * (w / 2);
    const a = [x0 + nx, y, z0 + nz], b = [x0 - nx, y, z0 - nz], c = [x1 - nx, y, z1 - nz], d = [x1 + nx, y, z1 + nz];
    // wound to face +y
    buf.tri(a, d, c, [acc * s, 0], [(acc + L) * s, 0], [(acc + L) * s, w * s]);
    buf.tri(a, c, b, [acc * s, 0], [(acc + L) * s, w * s], [acc * s, w * s]);
    acc += L;
  }
}
export const inPoly = (x, z, poly) => { let r = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [a, b] = poly[j], [c, d] = poly[i]; if ((b > z) !== (d > z) && x < ((c - a) * (z - b)) / (d - b) + a) r = !r; } return r; };
export const distSeg = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
export const distPath = (x, z, pts) => { let m = 1e9; for (let i = 0; i + 1 < pts.length; i++) m = Math.min(m, distSeg(x, z, pts[i], pts[i + 1])); return m; };
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export { ClampToEdgeWrapping };
