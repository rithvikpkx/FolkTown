import type { Scene } from 'three';
import { Batch, type Vec3 } from '../batch';
import { MATERIAL_NAMES, type MaterialName, type makeMaterials, TILING } from '../materials';

export const BELL_TOWER_HEIGHT = 48.8;

/**
 * Purdue Bell Tower, Tier 1 hand-authored (origin at the centre of its base, +z = front).
 * Limestone plinth, brick shaft with slit windows, clock level, louvred belfry, copper cap and spire.
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
  // Box given in front-face space, rotated about y by `k` quarter turns so all four faces match.
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
    const r = (x: number, z: number): [number, number] =>
      (
        [
          [x, z],
          [z, -x],
          [-x, -z],
          [-z, x],
        ] as [number, number][]
      )[k] as [number, number];
    const [ax, az] = r(x0, z0);
    const [bx, bz] = r(x1, z1);
    b[m].box(Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz), t(m));
  };
  const sides = [0, 1, 2, 3];

  box('limestone', 0, -4.8, 0, -4.8, 4.8, 1.2, 4.8); // plinth
  box('limestone', 0, -4.2, 1.2, -4.2, 4.2, 1.6, 4.2); // plinth cap
  b.brick.shade = (y) => 0.75 + 0.25 * Math.min(1, y / 4);
  box('brick', 0, -3.6, 1.6, -3.6, 3.6, 30, 3.6); // shaft
  b.brick.shade = null;
  for (const k of sides) {
    box('limestone', k, -0.8, 1.6, 3.6, 0.8, 5.2, 3.75); // entrance surround
    for (const y of [9, 14, 19, 24]) box('limestone', k, -0.25, y, 3.6, 0.25, y + 2.4, 3.7); // slit windows
    box('limestone', k, -3.8, 15, 3.5, 3.8, 15.5, 3.8); // string course
  }
  box('limestone', 0, -4, 30, -4, 4, 31, 4); // band under clock level

  // Clock level: brick block with a limestone panel and a dark dial on each face.
  box('brick', 0, -3.5, 31, -3.5, 3.5, 36, 3.5);
  for (const k of sides) {
    box('limestone', k, -2.7, 31.6, 3.5, 2.7, 35.4, 3.65);
    const a = (k * Math.PI) / 2;
    const [nx, nz] = [Math.sin(a), Math.cos(a)];
    const c = (d: number): Vec3 => [nx * d, 33.5, nz * d];
    b.metal.cyl(c(3.65), c(3.75), 1.9, 1.9, 28, t('metal'));
    b.limestone.cyl(c(3.75), c(3.78), 1.7, 1.7, 28, t('limestone'));
    const hand = (len: number, ang: number) => {
      const [lx, ly] = [Math.sin(ang) * len, Math.cos(ang) * len];
      const p = (s: number): Vec3 => [
        nx * 3.8 + nz * lx * s,
        33.5 + ly * s,
        nz * 3.8 - nx * lx * s,
      ];
      b.metal.cyl(p(0), p(1), 0.07, 0.04, 4, t('metal'), false);
    };
    hand(1.4, 0.5); // shortcut: clocks are static at about 10:10
    hand(1.0, -1.0);
  }
  box('limestone', 0, -3.9, 36, -3.9, 3.9, 36.6, 3.9);

  // Belfry: brick core, louvres in the openings, limestone mullions and lintels.
  box('brick', 0, -2.4, 36.6, -2.4, 2.4, 43, 2.4);
  for (const k of sides) {
    box('brick', k, -3.4, 36.6, 2.4, -2.4, 43, 3.4); // corner pier
    box('brick', k, 2.4, 36.6, 2.4, 3.4, 43, 3.4);
    box('limestone', k, -2.4, 36.6, 3.3, 2.4, 37.2, 3.5); // sill
    for (let y = 37.2; y < 41.6; y += 0.45) box('metal', k, -2.4, y, 3.3, 2.4, y + 0.12, 3.5); // louvre slats
    box('limestone', k, -2.7, 41.6, 3.3, 2.7, 42.4, 3.7); // lintel
    box('limestone', k, -0.08, 37.2, 3.3, 0.08, 41.6, 3.55); // central mullion
  }
  box('limestone', 0, -4.1, 43, -4.1, 4.1, 44, 4.1); // cornice

  // Pyramidal copper cap with a spire.
  const base = 4.1;
  const apex: Vec3 = [0, 47, 0];
  const cs = [
    [-base, base],
    [base, base],
    [base, -base],
    [-base, -base],
  ] as const;
  for (let i = 0; i < 4; i++) {
    const p = cs[i] as readonly [number, number];
    const q = cs[(i + 1) % 4] as readonly [number, number];
    b.metal.tri([p[0], 44, p[1]], [q[0], 44, q[1]], apex, t('metal'));
  }
  b.metal.cyl([0, 47, 0], [0, BELL_TOWER_HEIGHT, 0], 0.4, 0.04, 8, t('metal'));

  for (const n of MATERIAL_NAMES) {
    if (!b[n].triangleCount) continue;
    const m = b[n].mesh(mats[n]);
    m.position.set(...at);
    scene.add(m);
  }
}
