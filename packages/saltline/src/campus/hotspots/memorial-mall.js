// Memorial Mall (OSM park way/74154179, local x -60..16, z 155..340, south of the Bell Tower), generated in code. build(G, zone) -> { id, group, solids, update, stats }.
// Real data: OSM park + lawn/garden polygons, OSM footways/steps/cycleways and the Memorial Mall Drive loop (data/campus.json via tools/hotspot-data.py), OSM tree nodes.
// Species mix and canopy: env/trees.js (oak/maple/linden/locust/spruce/pear, seasonal via ?season=). Guessed: bench and lamp spacing; flower-bed planting colours.
// Measured from Street View: black post lamps with a lantern head, bollards linked by chain along the drive, wide pale concrete walks with a brick-paver edge band, juniper hedge in the drive median.
// No monuments are in the OSM data or visible in the 5 frames, so none are drawn (reported in docs/assets.md).
import { Group, Mesh, MeshStandardMaterial, SphereGeometry, InstancedMesh, Matrix4, Color, Quaternion, Vector3 } from 'three';
import { buildWalkTrees } from '../env/trees.js';
import { Buf, fillPoly, ribbon, std, tex, rng, inPoly, distPath } from './lib/common.js';
import data from './data/mall.json';

const BOX = [-110, 70, 120, 400]; // x0 x1 z0 z1 of the area drawn (park plus its frontage walks and the drive)
const inBox = (x, z, pad = 0) => x > BOX[0] - pad && x < BOX[1] + pad && z > BOX[2] - pad && z < BOX[3] + pad;
const cyl = (b, x, z, r, y0, y1, seg = 8) => { for (let i = 0; i < seg; i++) { const a0 = (i / seg) * 6.2832, a1 = ((i + 1) / seg) * 6.2832; b.q([x + r * Math.cos(a0), y0, z + r * Math.sin(a0)], [x + r * Math.cos(a1), y0, z + r * Math.sin(a1)], [x + r * Math.cos(a1), y1, z + r * Math.sin(a1)], [x + r * Math.cos(a0), y1, z + r * Math.sin(a0)], 1, 1); } };
const box = (b, x0, y0, z0, x1, y1, z1) => {
  b.q([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], 1, 1); b.q([x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], 1, 1); b.q([x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], 1, 1);
  b.q([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], 1, 1); b.q([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], 1, 1);
};
const runs = (pts) => { const out = []; let cur = []; for (const p of pts) { if (inBox(p[0], p[1], 15)) cur.push(p); else { if (cur.length > 1) out.push(cur); cur = []; } } if (cur.length > 1) out.push(cur); return out; };

export async function build(G, zone) {
  const POFF = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
  const lawnM = std({ map: tex('walk/grass-albedo.jpg'), color: 0xb8c48a, roughness: 1, ...POFF }), walkM = std({ map: tex('walk/concrete-albedo.jpg'), color: 0xe0dacb, roughness: 0.95, ...POFF }),
    roadM = std({ map: tex('walk/asphalt-albedo.jpg'), roughness: 0.95, ...POFF }), paverM = std({ map: tex('walk/pavers-albedo.jpg'), roughness: 0.9, ...POFF }),
    mulchM = std({ color: 0x4a3626, roughness: 1, ...POFF }), curbM = std({ color: 0xc4bfb2, roughness: 0.9 }), ironM = std({ color: 0x1b1c1e, roughness: 0.5, metalness: 0.6 }),
    woodM = std({ color: 0x7a5a38, roughness: 0.8 }), lampM = std({ color: 0xfff1d0, emissive: 0xffe2a8, emissiveIntensity: 0.5 });
  const L = new Buf(lawnM), WK = new Buf(walkM), RD = new Buf(roadM), PV = new Buf(paverM), ML = new Buf(mulchM), CB = new Buf(curbM), IR = new Buf(ironM), WD = new Buf(woodM), LP = new Buf(lampM);
  // ---- ground treatments (ordered by height so polygon offset keeps them apart): lawn 0.03, mulch 0.04, walks 0.05, drive 0.05 ----
  fillPoly(L, data.park, 0.03, 0.22);
  for (const g of data.grass) if (g.tags.leisure === 'garden' && g.outer.every(([x, z]) => inBox(x, z))) fillPoly(ML, g.outer, 0.045, 0.3);
  const paths = [];
  for (const p of data.paths) for (const pts of runs(p.points)) paths.push({ ...p, points: pts });
  const solids = [], lampAt = [], benchAt = [];
  const rr = rng(17);
  for (const p of paths) {
    const road = p.kind === 'road' && p.hw !== 'pedestrian' && p.hw !== 'service', svc = p.hw === 'service', ped = p.hw === 'pedestrian';
    const w = road ? (p.hw === 'primary' ? 9 : 7.2) : svc ? 5 : ped ? 4.5 : p.hw === 'cycleway' ? 2.6 : p.hw === 'steps' ? 2.4 : p.name === 'Hello Walk' ? 3.5 : 2.6;
    if (road || svc) {
      ribbon(RD, p.points, w, 0.05, 0.25); ribbon(CB, p.points.map((q, i, a) => { const n = a[Math.min(i + 1, a.length - 1)], m = a[Math.max(i - 1, 0)], dx = n[0] - m[0], dz = n[1] - m[1], l = Math.hypot(dx, dz) || 1; return [q[0] - (dz / l) * (w / 2 + 0.15), q[1] + (dx / l) * (w / 2 + 0.15)]; }), 0.3, 0.1, 0.3);
      ribbon(CB, p.points.map((q, i, a) => { const n = a[Math.min(i + 1, a.length - 1)], m = a[Math.max(i - 1, 0)], dx = n[0] - m[0], dz = n[1] - m[1], l = Math.hypot(dx, dz) || 1; return [q[0] + (dz / l) * (w / 2 + 0.15), q[1] - (dx / l) * (w / 2 + 0.15)]; }), 0.3, 0.1, 0.3);
    } else {
      ribbon(WK, p.points, w, 0.055, 0.25);
      if (w > 3) { ribbon(PV, p.points, 0.5, 0.058, 0.6); } // paver edge band down the middle of the wide walks (m: Street View frames show brick paver bands next to the concrete)
      // lamps and benches beside the walks inside the park
      let acc = rr() * 20;
      for (let i = 0; i + 1 < p.points.length; i++) {
        const [x0, z0] = p.points[i], [x1, z1] = p.points[i + 1], Ls = Math.hypot(x1 - x0, z1 - z0);
        for (let s = 0; s < Ls; s += 2) {
          acc += 2; if (acc < 34) continue; acc = 0;
          const t = s / Ls, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, nx = -(z1 - z0) / Ls, nz = (x1 - x0) / Ls, side = rr() < 0.5 ? 1 : -1, o = (w / 2 + 1.3) * side;
          if (!inPoly(x + nx * o, z + nz * o, data.park)) continue;
          (rr() < 0.55 ? lampAt : benchAt).push([x + nx * o, z + nz * o, Math.atan2(nx * side, nz * side)]);
        }
      }
    }
  }
  // drive loop: chain posts down the median edge (m: frame G1Tn h0 shows bollards with chain) -- placed along the Memorial Mall Drive way
  for (const p of paths) if (p.name === 'Memorial Mall Drive') for (let i = 0; i + 1 < p.points.length; i++) {
    const [x0, z0] = p.points[i], [x1, z1] = p.points[i + 1], Ls = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / Ls, nz = (x1 - x0) / Ls;
    let prev = null;
    for (let s = 0; s < Ls; s += 3.2) { const x = x0 + (x1 - x0) * (s / Ls) + nx * 4.4, z = z0 + (z1 - z0) * (s / Ls) + nz * 4.4; if (!inBox(x, z)) continue; cyl(IR, x, z, 0.08, 0, 0.95, 6); if (prev) { IR.q([prev[0], 0.8, prev[1]], [x, 0.8, z], [x, 0.84, z], [prev[0], 0.84, prev[1]], 1, 1); } prev = [x, z]; }
  }
  // furniture geometry
  for (const [x, z] of lampAt) { cyl(IR, x, z, 0.09, 0, 3.9, 8); cyl(IR, x, z, 0.16, 0, 0.5, 8); box(LP, x - 0.2, 3.9, z - 0.2, x + 0.2, 4.4, z + 0.2); box(IR, x - 0.27, 4.4, z - 0.27, x + 0.27, 4.5, z + 0.27); solids.push([[x - 0.2, z - 0.2], [x + 0.2, z - 0.2], [x + 0.2, z + 0.2], [x - 0.2, z + 0.2]]); }
  for (const [x, z, yaw] of benchAt) {
    const c = Math.cos(yaw), s = Math.sin(yaw), P = (a, b) => [x + a * c + b * s, z - a * s + b * c]; // a along the bench, b towards the seat front
    const q = (a0, b0, a1, b1, y0, y1) => { const p0 = P(a0, b0), p1 = P(a1, b0), p2 = P(a1, b1), p3 = P(a0, b1); box(WD, Math.min(p0[0], p2[0]), y0, Math.min(p0[1], p2[1]), Math.max(p0[0], p2[0]), y1, Math.max(p0[1], p2[1])); void p1; void p3; };
    q(-0.9, -0.25, 0.9, 0.25, 0.42, 0.48); q(-0.9, -0.28, 0.9, -0.22, 0.48, 0.85); for (const a of [-0.8, 0.8]) box(IR, P(a, 0)[0] - 0.04, 0, P(a, 0)[1] - 0.04, P(a, 0)[0] + 0.04, 0.42, P(a, 0)[1] + 0.04);
    solids.push([P(-0.9, -0.3), P(0.9, -0.3), P(0.9, 0.3), P(-0.9, 0.3)]);
  }
  // ---- planted beds: shrubs and flowers (g: colours) ----
  const flowers = [], shrubs = [];
  for (const g of data.grass) {
    if (g.tags.leisure !== 'garden' || !g.outer.every(([x, z]) => inBox(x, z))) continue;
    const xs = g.outer.map((p) => p[0]), zs = g.outer.map((p) => p[1]);
    for (let i = 0; i < 90; i++) { const x = Math.min(...xs) + rr() * (Math.max(...xs) - Math.min(...xs)), z = Math.min(...zs) + rr() * (Math.max(...zs) - Math.min(...zs)); if (!inPoly(x, z, g.outer)) continue; (rr() < 0.35 ? shrubs : flowers).push([x, z]); }
  }
  const group = new Group(); group.name = 'memorial-mall';
  for (const b of [L, ML, WK, PV, RD, CB, IR, WD, LP]) if (b.p.length) group.add(b.mesh());
  const mk = (geo, mat, pts, sc, tintF) => {
    const m = new InstancedMesh(geo, mat, Math.max(1, pts.length)), M = new Matrix4(), Q = new Quaternion(), c = new Color(); m.castShadow = true; m.receiveShadow = true;
    pts.forEach(([x, z], i) => { const s = sc * (0.7 + rr() * 0.6); M.compose(new Vector3(x, s * 0.45, z), Q, new Vector3(s, s * 0.9, s)); m.setMatrixAt(i, M); m.setColorAt(i, c.set(tintF())); }); return m;
  };
  const pal = [0xd8d0e8, 0xe8c44a, 0xc23a52, 0xf0f0e8, 0xe0803a];
  if (flowers.length) group.add(mk(new SphereGeometry(0.18, 5, 4), new MeshStandardMaterial({ roughness: 0.8 }), flowers, 1, () => pal[(rr() * pal.length) | 0]));
  if (shrubs.length) group.add(mk(new SphereGeometry(0.55, 7, 6), new MeshStandardMaterial({ roughness: 0.9 }), shrubs, 1, () => (rr() < 0.5 ? 0x2d5a30 : 0x3f6b32)));
  // ---- trees: OSM nodes, species from env/trees.js ----
  const treePts = data.trees.filter(([x, z]) => inBox(x, z) && !paths.some((p) => (p.kind === 'road') && distPath(x, z, p.points) < 3.5));
  const trees = buildWalkTrees({ trees: treePts.map(([x, z]) => ({ x, z })) });
  const pump = new Mesh(new SphereGeometry(0.01), new MeshStandardMaterial({ visible: false })); pump.frustumCulled = false; pump.onBeforeRender = (r, s, camera) => trees.update(camera);
  group.add(trees, pump);
  for (const [x, z] of treePts) { const r = 0.45; solids.push([[x - r, z - r], [x + r, z - r], [x + r, z + r], [x - r, z + r]]); }
  const tris = [L, ML, WK, PV, RD, CB, IR, WD, LP].reduce((s, b) => s + b.tris, 0);
  return { id: 'memorial-mall', group, solids, stats: { tris, trees: treePts.length, lamps: lampAt.length, benches: benchAt.length, flowers: flowers.length, shrubs: shrubs.length }, update() {} };
}
