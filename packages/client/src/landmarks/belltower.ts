import type { Scene } from 'three';
import { Batch, type Vec3 } from '../batch';
import { MATERIAL_NAMES, type MaterialName, type makeMaterials, TILING } from '../materials';

export const BELL_TOWER_HEIGHT = 48.8;

/**
 * Purdue Bell Tower (origin at the centre of its base, +z = front, all four faces identical).
 *
 * Reference: the 1995 tower, a gift of the Class of 1948, is about 160 ft (48.8 m), red brick trimmed
 * with limestone, with a clock on each face, and reinterprets the 1894 Heavilon Hall tower
 * (see docs/known-gaps.md for what could not be verified). Stack, bottom to top: limestone plinth,
 * tall brick shaft with slit windows, clock stage with white dials, belfry with round-arched
 * louvred openings, then a steep pyramidal verdigris copper cap with a finial.
 */
export function buildBellTower(
  scene: Scene,
  mats: Awaited<ReturnType<typeof makeMaterials>>,
  at: Vec3 = [0, 0, 0],
) {
  const b = Object.fromEntries(MATERIAL_NAMES.map((n) => [n, new Batch()])) as Record<
    MaterialName,
    Batch
  >;
  const t = (n: MaterialName) => TILING[n].tile;
  // Face space (x right, z out) to world, rotated about y by `k` quarter turns.
  const rot = (k: number, x: number, z: number): [number, number] =>
    (
      [
        [x, z],
        [z, -x],
        [-x, -z],
        [-z, x],
      ] as [number, number][]
    )[k] as [number, number];
  const pt = (k: number, x: number, y: number, z: number): Vec3 => {
    const [wx, wz] = rot(k, x, z);
    return [wx, y, wz];
  };
  const box = (
    m: MaterialName,
    k: number,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
  ) => {
    const [ax, az] = rot(k, x0, z0);
    const [bx, bz] = rot(k, x1, z1);
    b[m].box(Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz), t(m));
  };
  const disc = (
    m: MaterialName,
    k: number,
    cx: number,
    cy: number,
    z0: number,
    z1: number,
    r: number,
  ) => b[m].cyl(pt(k, cx, cy, z0), pt(k, cx, cy, z1), r, r, 32, t(m));
  const sides = [0, 1, 2, 3];

  // Plinth and shaft (7.2 m square, ~27 m of brick).
  box('limestone', 0, -4.6, 0, -4.6, 4.6, 1.0, 4.6);
  box('limestone', 0, -4.1, 1.0, -4.1, 4.1, 1.5, 4.1);
  b.brick.shade = (y) => 0.75 + 0.25 * Math.min(1, y / 4);
  box('brick', 0, -3.6, 1.5, -3.6, 3.6, 27, 3.6);
  b.brick.shade = null;
  for (const k of sides) {
    box('limestone', k, -0.9, 1.5, 3.6, 0.9, 5.4, 3.75); // entrance surround
    box('limestone', k, -0.55, 1.5, 3.75, 0.55, 4.6, 3.8); // door
    for (const y of [9, 14, 19, 23]) box('limestone', k, -0.25, y, 3.6, 0.25, y + 2.4, 3.7); // slit windows
    box('limestone', k, -3.8, 6.6, 3.5, 3.8, 7.0, 3.8); // string courses
    box('limestone', k, -3.8, 26, 3.5, 3.8, 26.4, 3.8);
  }
  box('limestone', 0, -3.95, 27, -3.95, 3.95, 27.8, 3.95); // band under clock stage

  // Clock stage: brick with a limestone panel carrying a white dial, numerals ticks and hands.
  box('brick', 0, -3.6, 27.8, -3.6, 3.6, 34, 3.6);
  const cy = 30.9;
  for (const k of sides) {
    box('limestone', k, -2.9, 28.2, 3.5, 2.9, 33.6, 3.68);
    disc('metal', k, 0, cy, 3.68, 3.74, 2.35); // bezel
    disc('polymer', k, 0, cy, 3.74, 3.78, 2.15); // white dial
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const [s, c] = [Math.sin(a), Math.cos(a)];
      const big = i % 3 === 0;
      const r0 = big ? 1.55 : 1.75;
      b.metal.cyl(
        pt(k, s * r0, cy + c * r0, 3.8),
        pt(k, s * 2.0, cy + c * 2.0, 3.8),
        big ? 0.07 : 0.04,
        big ? 0.07 : 0.04,
        4,
        t('metal'),
        false,
      );
    }
    const hand = (len: number, ang: number, w: number) =>
      b.metal.cyl(
        pt(k, 0, cy, 3.84),
        pt(k, Math.sin(ang) * len, cy + Math.cos(ang) * len, 3.84),
        w,
        w * 0.5,
        4,
        t('metal'),
        false,
      );
    hand(1.9, -2.0, 0.07); // static about 10:10
    hand(1.3, 0.5, 0.1);
    disc('metal', k, 0, cy, 3.8, 3.88, 0.12);
  }
  box('limestone', 0, -4.1, 34, -4.1, 4.1, 34.7, 4.1); // cornice under belfry

  // Belfry: brick core, four corner piers, round-arched louvred openings with limestone surrounds.
  const bt = 34.7;
  const spring = 38.4; // arch springing line
  const hw = 1.55; // opening half width
  box('brick', 0, -3.3, bt, -3.3, 3.3, 41.4, 3.3);
  for (const k of sides) {
    box('limestone', k, -2.1, bt, 3.3, 2.1, bt + 0.5, 3.45); // sill
    box('metal', k, -hw, bt + 0.5, 3.2, hw, spring, 3.38); // dark opening, rectangular part
    disc('metal', k, 0, spring, 3.2, 3.38, hw); // arched head
    for (let y = bt + 0.9; y < spring + 0.9; y += 0.4) {
      const half = y < spring ? hw : Math.sqrt(Math.max(0, hw * hw - (y - spring) ** 2));
      if (half > 0.2) box('limestone', k, -half, y, 3.38, half, y + 0.1, 3.5); // louvre slats
    }
    // limestone surround: jambs plus an arch ring (bigger disc behind, opening disc in front)
    box('limestone', k, -hw - 0.3, bt + 0.5, 3.3, -hw, spring, 3.5);
    box('limestone', k, hw, bt + 0.5, 3.3, hw + 0.3, spring, 3.5);
    disc('limestone', k, 0, spring, 3.3, 3.42, hw + 0.3);
    disc('metal', k, 0, spring, 3.42, 3.44, hw);
    for (let y = spring - 0.05; y < spring + hw; y += 0.4) {
      const half = Math.sqrt(Math.max(0, hw * hw - (y - spring) ** 2));
      if (half > 0.2) box('limestone', k, -half, y, 3.44, half, y + 0.1, 3.52);
    }
    box('limestone', k, -0.07, bt + 0.5, 3.44, 0.07, spring, 3.55); // central mullion
    box('limestone', k, -2.0, 41.4, 3.2, 2.0, 41.55, 3.4);
  }
  box('limestone', 0, -3.9, 41.4, -3.9, 3.9, 42.2, 3.9); // eaves cornice

  // Steep pyramidal verdigris copper cap with a short finial spire.
  const base = 3.8;
  const eave = 42.2;
  const apex: Vec3 = [0, 47.2, 0];
  const cs = [
    [-base, base],
    [base, base],
    [base, -base],
    [-base, -base],
  ] as const;
  for (let i = 0; i < 4; i++) {
    const p = cs[i] as readonly [number, number];
    const q = cs[(i + 1) % 4] as readonly [number, number];
    b.verdigris.tri([p[0], eave, p[1]], [q[0], eave, q[1]], apex, t('verdigris'));
  }
  b.verdigris.cyl([0, 47.0, 0], [0, 47.6, 0], 0.22, 0.22, 8, t('verdigris'));
  b.verdigris.cyl([0, 47.6, 0], [0, BELL_TOWER_HEIGHT, 0], 0.12, 0.02, 8, t('verdigris'));

  for (const n of MATERIAL_NAMES) {
    if (!b[n].triangleCount) continue;
    const m = b[n].mesh(mats[n]);
    m.position.set(...at);
    scene.add(m);
  }
}
