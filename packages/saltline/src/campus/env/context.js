// Non-walkable surroundings of the ?walk=1 box: neighbouring buildings (facades.js far LOD + hip roofs on the brick halls),
// context trees (env/trees.js LODs), a hedge along the box edge, ortho ground beyond the box, and a far skyline of simple masses.
// buildContext(G, zone, root, { box, keep, ortho }) -> { solids, tris }. Total budget ~150k tris.
import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, DoubleSide, Quaternion, Vector3 } from 'three';
import { loadCampus } from '../index.js';
import { buildFacades, Bucket, ring, offset, cap } from '../facades.js';
import { buildWalkTrees } from './trees.js';
import roofs from '../../../../../data/pilot/roofs.json';

// brick halls with dark red / terracotta tile hips (design render, left and right); every other neighbour is a flat grey lab block
const HALLS = ['way/75498146', 'way/117146492', 'way/158307860', 'way/117147171', 'way/117147168', 'relation/3759822'];
const RED = [0x8a3a30, 0xa8532f];
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const inPoly = (x, z, p) => { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; return c; };

function hip(f, rise, color) { // eave overhang -> ridge ring, one bucket
  const R = ring(f.poly), mat = new MeshStandardMaterial({ color, roughness: 0.85, side: DoubleSide }), B = new Bucket(mat, false);
  const w = Math.min(f.maxX - f.minX, f.maxZ - f.minZ), ins = Math.min(rise * 1.5, w * 0.35);
  const A = offset(R, 0.8), C = offset(R, -ins), e = f.top, r = f.top + rise;
  for (let i = 0; i < R.length; i++) { const j = (i + 1) % R.length; B.q([A[i][0], e, A[i][1]], [C[i][0], r, C[i][1]], [C[j][0], r, C[j][1]], [A[j][0], e, A[j][1]]); }
  cap(B, C, r);
  return B;
}

export function buildContext(G, zone, root, { box, keep, ortho }) {
  const g = new Group(); g.name = 'walk_context';
  const near = loadCampus({ ...zone, colliders: zone.colliders.filter((c) => !keep.includes(c.id)), landmarks: {} }).footprints;
  const rf = Object.fromEntries(roofs.buildings.map((b) => [b.id, b]));
  const halls = [];
  for (const f of near) {
    if (!HALLS.includes(f.id)) continue;
    const r = rf[f.id], rise = r && r.ridgeH > r.eaveH ? r.ridgeH - r.eaveH : f.top * 0.18;
    f.top = r ? r.eaveH : f.top - rise; // walls end at the eave, the hip carries the rest
    halls.push([f, rise]);
  }
  const prevTicks = (G.campusTick || []).length;
  const fac = buildFacades(G, { footprints: near }, g, {});
  if (G.campusTick) G.campusTick.length = prevTicks; // replace the default 150 m LOD tick with a shorter one
  if (G.camera) G.campusTick.push(() => fac.update(G.camera.position, 70));
  let tris = fac.trisFar;
  for (const [f, rise] of halls) {
    const B = hip(f, rise, RED[Math.floor(hash(f.minX, f.minZ) * 2)]), m = B.mesh(); m.castShadow = true; g.add(m); tris += B.p.length / 9;
  }

  // ground beyond the box: georeferenced ortho under everything, then a plain grass-brown plane to the horizon
  const under = new MeshStandardMaterial({ color: 0x6b6b3e, roughness: 1 });
  const flat = new Mesh(new BoxGeometry(5000, 0.1, 5000).translate(40, -0.15, -80), under); flat.receiveShadow = true; g.add(flat);
  if (ortho) {
    const x0 = ortho.xMin, z0 = ortho.zMin, x1 = x0 + ortho.w, z1 = z0 + ortho.h, geo = new BufferGeometry();
    const f = ortho.fit || { theta: 0, cx: 0, cz: 0, dx: 0, dz: 0 }, c = Math.cos(f.theta), sn = Math.sin(f.theta); // ground.js maps world -> image by R(p-c)+c+d; invert it for the corners
    const W = ([u, v]) => { const a = u - f.cx - f.dx, b = v - f.cz - f.dz; return [c * a + sn * b + f.cx, -sn * a + c * b + f.cz]; };
    geo.setAttribute('position', new BufferAttribute(new Float32Array([x0, z0, x1, z0, x1, z1, x0, z1].flatMap((_, i, a) => (i % 2 ? [] : [...(([x, z]) => [x, 0, z])(W([a[i], a[i + 1]]))]))), 3));
    geo.setAttribute('normal', new BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
    geo.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
    geo.setIndex([0, 2, 1, 0, 3, 2]);
    const o = new Mesh(geo, new MeshStandardMaterial({ map: ortho.texture, color: 0xc4b48a, roughness: 1, side: DoubleSide }));
    o.position.y = -0.06; o.receiveShadow = true; g.add(o);
  }

  // trees: the zone's real trunks outside the box, plus a deterministic scatter (denser right at the edge) clear of buildings
  const blocked = (x, z) => near.some((f) => x > f.minX - 4 && x < f.maxX + 4 && z > f.minZ - 4 && z < f.maxZ + 4 && (inPoly(x, z, f.poly) || [[4, 0], [-4, 0], [0, 4], [0, -4]].some(([a, b]) => inPoly(x + a, z + b, f.poly))));
  const out = (x, z) => x < box.minX || x > box.maxX || z < box.minZ || z > box.maxZ;
  const props = zone.props.filter((t) => out(t.x, t.z) && !blocked(t.x, t.z));
  const cx = 40, cz = -80;
  for (let i = 0; i < 1500; i++) {
    const a = hash(i, 1) * 6.2832, rr = 40 + Math.pow(hash(i, 2), 0.7) * 420, x = cx + Math.cos(a) * rr * 1.5, z = cz + Math.sin(a) * rr;
    if (out(x, z) && !blocked(x, z) && hash(i, 3) < (Math.abs(x - 40) > 215 || z < box.minZ - 20 || z > box.maxZ + 20 ? 0.45 : 1)) props.push({ x, z });
  }
  for (let s = 0; s < 2; s++) { // two tree rows just outside the edge
    const o = 3.5 + s * 3.5;
    for (let t = 3 + s * 4; t < box.maxX - box.minX; t += 9) for (const z of [box.minZ - o, box.maxZ + o]) props.push({ x: box.minX + t + hash(t, s) * 3, z: z + hash(s, t) * 2 });
    for (let t = 3 + s * 4; t < box.maxZ - box.minZ; t += 9) for (const x of [box.minX - o, box.maxX + o]) props.push({ x: x + hash(t, s) * 2, z: box.minZ + t + hash(s, t) * 3 });
  }
  for (let i = props.length - 1; i >= 0; i--) if (blocked(props[i].x, props[i].z)) props.splice(i, 1);
  const trees = buildWalkTrees({ props, trees: props });
  g.add(trees);
  if (G.campusTick) G.campusTick.push(() => trees.update(G.camera));

  // hedge along the walk-box edge so the world never visibly ends (skipped where a building stands there)
  const hedgeAt = [];
  for (let x = box.minX; x < box.maxX; x += 3) for (const z of [box.minZ - 0.7, box.maxZ + 0.7]) hedgeAt.push([x + 1.5, z, 0]);
  for (let z = box.minZ; z < box.maxZ; z += 3) for (const x of [box.minX - 0.7, box.maxX + 0.7]) hedgeAt.push([x, z + 1.5, Math.PI / 2]);
  const spots = hedgeAt.filter(([x, z]) => !blocked(x, z));
  const hedge = new InstancedMesh(new BoxGeometry(3.2, 1.4, 1.3).translate(0, 0.7, 0), new MeshStandardMaterial({ color: 0x3f5a2a, roughness: 1 }), spots.length), M = new Matrix4();
  spots.forEach(([x, z, r], i) => { M.makeRotationY(r).setPosition(x, 0, z); hedge.setMatrixAt(i, M); hedge.setColorAt(i, new Color().setHSL(0.24 + hash(x, z) * 0.05, 0.4, 0.2 + hash(z, x) * 0.1)); });
  hedge.castShadow = hedge.receiveShadow = true; g.add(hedge); tris += spots.length * 12;

  // far skyline: grey-blue masses in a ring, fog does the rest
  const sky = new InstancedMesh(new BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new MeshStandardMaterial({ color: 0x9a9fa6, roughness: 1 }), 90);
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * 6.2832 + hash(i, 5) * 0.06, rr = 520 + hash(i, 6) * 380, w = 30 + hash(i, 7) * 70, h = 12 + hash(i, 8) * 28, d = 30 + hash(i, 9) * 50;
    M.compose(new Vector3(cx + Math.cos(a) * rr * 1.4, 0, cz + Math.sin(a) * rr), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), hash(i, 4) * 3), new Vector3(w, h, d));
    sky.setMatrixAt(i, M);
  }
  g.add(sky); tris += 90 * 12;

  root.add(g);
  return { solids: near.filter((f) => f.maxX > box.minX - 2 && f.minX < box.maxX + 2 && f.maxZ > box.minZ - 2 && f.minZ < box.maxZ + 2).map((f) => f.poly.reduce((a, v, i) => (i % 2 ? (a[a.length - 1].push(v), a) : (a.push([v]), a)), [])), tris, near: near.length, props: props.length };
}
