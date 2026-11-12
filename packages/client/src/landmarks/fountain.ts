import { Group, type Mesh, type ShaderMaterial } from 'three';
import { Batch, type Vec3 } from '../batch';
import { type MaterialName, TILING } from '../materials';
import { makeConcrete, makeMirrorSteel, makeWaterMaterial, tickWater } from './fountainMaterials';

type Mats = Record<MaterialName, import('three').Material>;

const HEIGHT = 11.6; // 38 ft
const SLABS = 4;

/**
 * Engineering Fountain (Robert Youngman, 1989): no pool and no fence. Four tall concrete
 * parabolic slabs lean in around a central jet inside a mirror-steel cylinder, water runs down
 * them onto a paved, gently dished apron and drains through a metal grate ring.
 * Sources: Purdue Alumnus / Purdue UVAC campus art pages (see docs/known-gaps.md 40).
 * Centred on (cx, cz), ground at y = 0.
 */
export function buildFountain(mats: Mats, cx = 0, cz = 0) {
  const pave = new Batch();
  const grate = new Batch();
  const conc = new Batch();
  const sheet = new Batch();
  const pool = new Batch();
  const jet = new Batch();
  const P = (x: number, y: number, z: number): Vec3 => [cx + x, y, cz + z];

  // paved apron (slightly dished toward the drain) and the grate ring
  const apron = 9.5;
  pave.cyl(P(0, 0, 0), P(0, 0.06, 0), apron, apron, 40, TILING.pavers.tile);
  grate.cyl(P(0, 0.061, 0), P(0, 0.07, 0), 6.0, 6.0, 40, 1, true);
  pave.cyl(P(0, 0.07, 0), P(0, 0.075, 0), 5.6, 5.6, 40, TILING.pavers.tile);
  // thin film of water over the wetted area inside the grate
  pool.cyl(P(0, 0.08, 0), P(0, 0.085, 0), 5.4, 5.4, 40, 4);

  // four leaning parabolic slabs: radius shrinks with the square of the remaining height
  const steps = 14;
  for (let k = 0; k < SLABS; k++) {
    const th = (k / SLABS) * Math.PI * 2 + 0.4;
    const er: Vec3 = [Math.cos(th), 0, Math.sin(th)];
    const et: Vec3 = [-Math.sin(th), 0, Math.cos(th)];
    // ring i: centre, half width, half thickness, normal in the r-y plane
    const ring = (i: number, off: number, thick: number) => {
      const t = i / steps;
      const r = 0.9 + 4.6 * (1 - t) * (1 - t);
      const dr = (-9.2 * (1 - t)) / HEIGHT; // dr/dy
      const nl = Math.hypot(1, dr);
      const nr = 1 / nl;
      const ny = -dr / nl;
      const hw = 1.9 - 0.9 * t;
      const ht = thick * (1 - 0.35 * t) + off;
      const y = t * HEIGHT;
      const c = (sw: number, sn: number): Vec3 =>
        P(
          (r + sn * ht * nr) * er[0] + sw * hw * et[0],
          y + sn * ht * ny,
          (r + sn * ht * nr) * er[2] + sw * hw * et[2],
        );
      return c;
    };
    for (let i = 0; i < steps; i++) {
      const a = ring(i, 0, 0.45);
      const b = ring(i + 1, 0, 0.45);
      // outer (+1), inner (-1) faces and two sides
      for (const [s0, n0, s1, n1] of [
        [-1, 1, 1, 1],
        [1, -1, -1, -1],
        [1, 1, 1, -1],
        [-1, -1, -1, 1],
      ] as const) {
        const q0 = a(s0, n0);
        const q1 = a(s1, n1);
        const q2 = b(s1, n1);
        const q3 = b(s0, n0);
        conc.tri(q0, q1, q2, 2);
        conc.tri(q0, q2, q3, 2);
      }
      // water sheet sliding down the inner face, a hair off the concrete
      const wa = ring(i, 0.05, 0.45);
      const wb = ring(i + 1, 0.05, 0.45);
      const l0 = wa(-0.8, -1);
      const l1 = wa(0.8, -1);
      const l2 = wb(0.8, -1);
      const l3 = wb(-0.8, -1);
      sheet.tri(l0, l1, l2, 2);
      sheet.tri(l0, l2, l3, 2);
    }
    // top cap
    const ta = ring(steps, 0, 0.45);
    conc.tri(ta(-1, 1), ta(1, 1), ta(1, -1), 2);
    conc.tri(ta(-1, 1), ta(1, -1), ta(-1, -1), 2);
  }

  // central jet inside the mirrored cylinder, plus a falling plume
  jet.cyl(P(0, 2.2, 0), P(0, 8.5, 0), 0.22, 0.1, 10, 1, false);
  jet.cyl(P(0, 8.5, 0), P(0, 2.4, 0), 0.1, 0.9, 16, 1, false);
  const steel = new Batch();
  steel.cyl(P(0, 0.08, 0), P(0, 2.2, 0), 0.8, 0.8, 24, 1, true);

  const g = new Group();
  const concMat = makeConcrete();
  const steelMat = makeMirrorSteel();
  const flatWater = makeWaterMaterial(0);
  const sheetWater = makeWaterMaterial(1);
  const jetWater = makeWaterMaterial(1);
  const animate = (m: ShaderMaterial) => (mesh: Mesh) => {
    mesh.onBeforeRender = () => tickWater(m);
    return mesh;
  };
  g.add(
    pave.mesh(mats.pavers),
    grate.mesh(mats.metal),
    conc.mesh(concMat),
    steel.mesh(steelMat),
    animate(flatWater)(pool.mesh(flatWater, false)),
    animate(sheetWater)(sheet.mesh(sheetWater, false)),
    animate(jetWater)(jet.mesh(jetWater, false)),
  );
  return g;
}
