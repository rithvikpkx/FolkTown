import { DoubleSide, Group, MeshStandardMaterial } from 'three';
import { Batch } from '../batch';
import { type MaterialName, TILING } from '../materials';

type Mats = Record<MaterialName, import('three').Material>;

/**
 * Engineering Fountain (Tier 1): round stone basin, static glossy water, and a cluster of
 * angular concrete columns with frozen jets. Centred on (cx, cz), ground at y = 0.
 */
export function buildFountain(mats: Mats, cx = 0, cz = 0) {
  const stone = new Batch();
  const metal = new Batch();
  const water = new Batch();
  const jets = new Batch();
  const ts = TILING.limestone.tile;
  const R = 9; // basin outer radius
  const seg = 48;
  const P = (x: number, y: number, z: number) => [cx + x, y, cz + z] as const;

  // basin: wall (outer + inner face), coping ring, floor
  stone.cyl(P(0, 0, 0), P(0, 0.9, 0), R, R, seg, ts, false);
  stone.cyl(P(0, 0.9, 0), P(0, 0, 0), R - 0.7, R - 0.7, seg, ts, false);
  stone.cyl(P(0, 0.9, 0), P(0, 1.0, 0), R + 0.25, R + 0.25, seg, ts);
  stone.cyl(P(0, 0.05, 0), P(0, 0.1, 0), R - 0.7, R - 0.7, seg, ts);
  // static water: a thin disc just under the coping
  water.cyl(P(0, 0.6, 0), P(0, 0.62, 0), R - 0.7, R - 0.7, seg, 4);

  // central sculpture: plinth plus ragged ring of square columns of varied height
  stone.cyl(P(0, 0.1, 0), P(0, 0.9, 0), 2.6, 2.4, 12, ts);
  const cols = 9;
  for (let i = 0; i < cols; i++) {
    const a = (i / cols) * Math.PI * 2;
    const r = i % 2 ? 1.5 : 0.7;
    const h = 3 + ((i * 7) % 5) * 1.1;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const w = 0.35 + (i % 3) * 0.1;
    stone.box(cx + x - w, 0.9, cz + z - w, cx + x + w, 0.9 + h, cz + z + w, ts);
    metal.box(
      cx + x - w - 0.04,
      0.9 + h,
      cz + z - w - 0.04,
      cx + x + w + 0.04,
      1.0 + h,
      cz + z + w + 0.04,
      TILING.metal.tile,
    );
    // frozen jet arcing outward from the column top
    jets.cyl(P(x, 1.0 + h, z), P(x * 2.6, 1.0 + h * 0.6, z * 2.6), 0.05, 0.03, 6, 1, false);
    jets.cyl(
      P(x * 2.6, 1.0 + h * 0.6, z * 2.6),
      P(x * 4.2, 0.65, z * 4.2),
      0.03,
      0.06,
      6,
      1,
      false,
    );
  }
  // ring of low ground jets
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.cos(a) * 6;
    const z = Math.sin(a) * 6;
    jets.cyl(P(x, 0.6, z), P(x * 0.9, 2.2, z * 0.9), 0.05, 0.02, 6, 1, false);
  }

  const waterMat = new MeshStandardMaterial({ color: 0x3f6f78, roughness: 0.05, metalness: 0.1 });
  const jetMat = new MeshStandardMaterial({
    color: 0xe8f4f6,
    roughness: 0.1,
    transparent: true,
    opacity: 0.7,
    side: DoubleSide,
  });
  const g = new Group();
  g.add(
    stone.mesh(mats.limestone),
    metal.mesh(mats.metal),
    water.mesh(waterMat, false),
    jets.mesh(jetMat, false),
  );
  return g;
}
