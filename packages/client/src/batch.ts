import { BufferGeometry, Float32BufferAttribute, type Material, Mesh } from 'three';

export type Vec3 = readonly [number, number, number];

export const UP: Vec3 = [0, 1, 0];
export const AX: Vec3 = [1, 0, 0];
export const AZ: Vec3 = [0, 0, 1];
export const NX: Vec3 = [-1, 0, 0];
export const NZ: Vec3 = [0, 0, -1];

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/**
 * Accumulates static geometry for one material. Texture coordinates are in world units divided
 * by `tile` (metres per texture repeat), so a texture keeps its real-world scale on any surface.
 */
export class Batch {
  private pos: number[] = [];
  private nrm: number[] = [];
  private uvs: number[] = [];
  private col: number[] = [];
  private idx: number[] = [];
  /** Per-vertex grime/AO brightness (1 = clean) by world height; applies to later additions. */
  shade: ((y: number) => number) | null = null;

  get vertexCount() {
    return this.pos.length / 3;
  }

  private vert(p: Vec3, n: Vec3, u: number, v: number) {
    this.pos.push(p[0], p[1], p[2]);
    this.nrm.push(n[0], n[1], n[2]);
    this.uvs.push(u, v);
    const s = this.shade ? this.shade(p[1]) : 1;
    this.col.push(s, s, s);
    return this.vertexCount - 1;
  }

  /**
   * Quad from `o` spanning U*w and V*h, facing U x V (CCW from the front).
   * u,v run from (uo,vo) in metres, divided by `tile` (and `tileV` if different).
   */
  rect(o: Vec3, U: Vec3, V: Vec3, w: number, h: number, tile = 1, uo = 0, vo = 0, tileV = tile) {
    const n = cross(U, V);
    const corners = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ] as const;
    let first = 0;
    corners.forEach(([a, b], k) => {
      const id = this.vert(
        [o[0] + U[0] * a + V[0] * b, o[1] + U[1] * a + V[1] * b, o[2] + U[2] * a + V[2] * b],
        n,
        (uo + a) / tile,
        (vo + b) / tileV,
      );
      if (k === 0) first = id;
    });
    this.idx.push(first, first + 1, first + 2, first, first + 2, first + 3);
  }

  /** Axis-aligned box from min to max corner. */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dz = z1 - z0;
    this.rect([x1, y0, z1], NZ, UP, dz, dy, tile, -z1, y0); // +x
    this.rect([x0, y0, z0], AZ, UP, dz, dy, tile, z0, y0); // -x
    this.rect([x0, y0, z1], AX, UP, dx, dy, tile, x0, y0); // +z
    this.rect([x1, y0, z0], NX, UP, dx, dy, tile, -x1, y0); // -z
    this.rect([x0, y1, z1], AX, NZ, dx, dz, tile, x0, -z1); // top
    this.rect([x0, y0, z0], AX, AZ, dx, dz, tile, x0, z0); // bottom
  }

  /** Cone frustum from `a` (radius r0) to `b` (radius r1), `seg` sides. */
  cyl(a: Vec3, b: Vec3, r0: number, r1: number, seg: number, tile = 1, caps = true) {
    const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const ax = norm(d);
    const e1 = norm(cross(Math.abs(ax[1]) > 0.9 ? AX : UP, ax));
    const e2 = cross(ax, e1);
    const k0 = this.vertexCount;
    const ring: Vec3[] = [];
    for (let i = 0; i <= seg; i++) {
      const an = (i / seg) * Math.PI * 2;
      const c = Math.cos(an);
      const s = Math.sin(an);
      const n: Vec3 = [e1[0] * c + e2[0] * s, e1[1] * c + e2[1] * s, e1[2] * c + e2[2] * s];
      const u = (an * Math.max(r0, r1)) / tile;
      ring.push(n);
      this.vert([a[0] + n[0] * r0, a[1] + n[1] * r0, a[2] + n[2] * r0], n, u, 0);
      this.vert([b[0] + n[0] * r1, b[1] + n[1] * r1, b[2] + n[2] * r1], n, u, len / tile);
    }
    for (let i = 0; i < seg; i++) {
      const k = k0 + i * 2;
      this.idx.push(k, k + 2, k + 3, k, k + 3, k + 1);
    }
    if (!caps) return;
    for (const [c, r, s] of [
      [b, r1, 1],
      [a, r0, -1],
    ] as const) {
      if (r <= 0) continue;
      const cn: Vec3 = [ax[0] * s, ax[1] * s, ax[2] * s];
      const ci = this.vert(c, cn, 0, 0);
      const rim: number[] = [];
      for (let j = 0; j < seg; j++) {
        const n = ring[j] as Vec3;
        rim.push(this.vert([c[0] + n[0] * r, c[1] + n[1] * r, c[2] + n[2] * r], cn, n[0], n[2]));
      }
      for (let j = 0; j < seg; j++) {
        const p = rim[j] as number;
        const q = rim[(j + 1) % seg] as number;
        if (s > 0) this.idx.push(ci, p, q);
        else this.idx.push(ci, q, p);
      }
    }
  }

  geometry() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2));
    g.setAttribute('color', new Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    return g;
  }

  mesh(material: Material, shadows = true) {
    const m = new Mesh(this.geometry(), material);
    m.castShadow = m.receiveShadow = shadows;
    return m;
  }
}
