// WALC plaza (v3-plaza): brick strips, concrete bands, planters with grasses, benches, bike racks, trees, raised deck with steps/ramp, Bell Tower base arch frames.
// FROM ORTHO/OSM: plaza extent (road x~19 to WALC glazed face x 45.4), the two paved bands at z=-25.2 and 4.6 (OSM footways, ortho bands -25.8/4.7), N-S planter rows near x 23, 34, 42.
// GUESSED: pitch of the other bands (extrapolated 9.93 m), planter lengths, bench/rack/tree positions, deck height and steps, ramp spot, arch frame size. Everything is merged or instanced, no glb.
import {
  BoxGeometry, ExtrudeGeometry, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, NoColorSpace, PlaneGeometry, Quaternion, RepeatWrapping,
  Shape, SRGBColorSpace, TextureLoader, Euler, Vector3, Color, Path,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildUnderstory, MATS, PROTO } from './furniture.js';

const BASE = import.meta.env.BASE_URL + 'campus/walk/';
export const DECK = 0.24, X0 = 23.0, Z0 = -45.7, Z1 = 25.1, XE = 45.3, TILE = 3.0;
const BANDS = [-45.1, -35.15, -25.2, -15.27, -5.3, 4.6, 14.5, 24.5]; // -25.2 and 4.6 are real (OSM footways); pitch 9.93 = (4.6+25.2)/3
const RAMP = { z0: 12, z1: 20, len: 2.5 };
const eastX = (z) => (z < -32.8 ? 41.0 : z < -26.5 ? 44 : z < 5.7 ? 45.2 : 41.4);
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

export const inPlaza = (x, z, m = 0) => x > X0 - 1 - m && x < XE + m && z > Z0 - 1 - m && z < Z1 + 1 + m;
// walkable deck height: two steps (0.9 m) round the edge, gentle ramp at RAMP
export function plazaFloor(x, z) {
  if (x > 46 || x < 18 || z < Z0 - 1 || z > Z1 + 1) return 0;
  const ramp = z > RAMP.z0 && z < RAMP.z1, k = ramp ? RAMP.len : 0.9, w = ramp ? X0 - 0.45 - RAMP.len : X0 - 0.9;
  return DECK * Math.max(0, Math.min(1, (x - w) / k, (z - (Z0 - 0.9)) / 0.9, (Z1 + 0.9 - z) / 0.9));
}

const strips = BANDS.slice(1).map((b, i) => ({ z0: BANDS[i] + 0.6, z1: b - 0.6, i, mid: (BANDS[i] + b) / 2, e: eastX((BANDS[i] + b) / 2) }));
export const planters = [];
for (const s of strips) {
  const z0 = s.z0 + 0.7, z1 = s.z1 - 0.7, central = s.mid > -25 && s.mid < 5;
  const row = (x) => planters.push({ x, z0, z1, w: 1.5 });
  row(X0 + 1.0);
  if (s.i % 2) row(33.9);
  if (central) row(43.2); else if (s.i % 2 === 0) row(39.4);
}

export function plazaTrees() {
  const t = [];
  for (const s of strips) for (const x of [30.0, 39.0]) if (x < s.e - 2 && (x < 35 || s.i % 2 === 0)) t.push({ x, z: s.mid + (hash(x, s.mid) - 0.5) * 1.2 });
  for (const x of [25, 31, 37]) t.push({ x, z: Z0 - 1.9 }, { x, z: Z1 + 2.0 });
  return t.map(({ x, z }) => ({ x, z, y: DECK, radius: 0.3, baseY: DECK, topY: 6, sp: 'locust', scale: 0.5 + hash(z, x) * 0.12 }));
}

// world-planar uv baked into geometry (u = x, v = -z on tops), so standard map/normalMap/roughnessMap work
const tex = (n, cs) => { const t = new TextureLoader().load(BASE + n); t.wrapS = t.wrapT = RepeatWrapping; t.colorSpace = cs; t.anisotropy = 16; return t; };
const NOISE = `float gh(vec2 p){ p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(gh(i), gh(i+vec2(1,0)), f.x), mix(gh(i+vec2(0,1)), gh(i+vec2(1,1)), f.x), f.y); }`;
// anti-repeat: per-tile and multi-scale brightness/hue variation on top of the 3 m tile
function worldMat(m, brick) {
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP;\n${NOISE}`).replace('#include <map_fragment>', `
      vec3 sd = texture2D(map, vMapUv).rgb; vec2 w = vWP.xz;
      float m1 = vn(w * 0.33), m2 = vn(w * 1.9 + 9.0), m3 = vn(w * 0.07 + 3.0), cell = gh(floor(w / ${TILE.toFixed(1)}));
      ${brick ? 'sd *= mix(vec3(0.80, 0.74, 0.74), vec3(1.16, 1.06, 1.0), m1) * (0.9 + 0.2 * m2) * (0.9 + 0.2 * m3) * (0.92 + 0.16 * cell);' : 'sd *= (0.92 + 0.16 * m1) * (0.94 + 0.12 * m2) * (0.95 + 0.1 * cell);'}
      diffuseColor *= vec4(sd * ${brick ? '1.55' : '1.7'}, 1.0);`);
  };
  m.customProgramCacheKey = () => 'plaza_' + (brick ? 'b' : 'c');
  return m;
}
function fixUV(g) {
  const p = g.attributes.position, n = g.attributes.normal, uv = [];
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ay > 0.5) uv.push(p.getX(i) / TILE, -p.getZ(i) / TILE); else if (ax > 0.5) uv.push(p.getZ(i) / TILE, p.getY(i) / TILE); else uv.push(p.getX(i) / TILE, p.getY(i) / TILE);
  }
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  return g;
}
const box = (x0, y0, z0, x1, y1, z1) => fixUV(new BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
const top = (x0, z0, x1, z1, y) => fixUV(new PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, y, (z0 + z1) / 2));
const solid = (geos, mat, shadow = true) => { const m = new Mesh(mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g))), mat); m.castShadow = shadow; m.receiveShadow = true; return m; };

function instProto(proto, items, mats) {
  const out = [], Q = new Quaternion(), E = new Euler(), M = new Matrix4(), P = new Vector3(), S = new Vector3();
  for (const [key, geos] of Object.entries(proto)) {
    const geo = mergeGeometries(geos.map((g) => { const c = g.index ? g.toNonIndexed() : g.clone(); for (const a of Object.keys(c.attributes)) if (!['position', 'normal', 'uv'].includes(a)) c.deleteAttribute(a); if (!c.attributes.uv) c.setAttribute('uv', new Float32BufferAttribute(new Float32Array(c.attributes.position.count * 2), 2)); return c; }));
    mats[key] = mats[key] || MATS[key]();
    const m = new InstancedMesh(geo, mats[key], items.length); m.castShadow = m.receiveShadow = true;
    items.forEach((it, i) => { E.set(0, it.yaw || 0, 0); Q.setFromEuler(E); M.compose(P.set(it.x, it.y ?? DECK, it.z), Q, S.setScalar(it.s || 1)); m.setMatrixAt(i, M); if (key === 'tint') m.setColorAt(i, it.color || new Color(0x884422)); });
    m.instanceMatrix.needsUpdate = true; out.push(m);
  }
  return out;
}

// curved bench: wooden slats on a steel frame along a 100 degree arc, radius 2.2 (concave side faces -x at yaw 0)
function arcBench() {
  const wood = [], dark = [], R = 2.2, n = 8, span = 1.75;
  for (let i = 0; i < n; i++) {
    const a = -span / 2 + (span * (i + 0.5)) / n, len = ((R * span) / n) * 1.02, rot = new Matrix4().makeRotationY(-a);
    for (const dz of [-0.1, 0, 0.1]) wood.push(new BoxGeometry(0.085, 0.045, len).translate(R + dz, 0.46, 0).applyMatrix4(rot));
    for (const y of [0.72, 0.86]) wood.push(new BoxGeometry(0.035, 0.1, len).translate(R + 0.22, y, 0).applyMatrix4(rot));
    if (i % 3 === 0) dark.push(new BoxGeometry(0.06, 0.46, 0.06).translate(R, 0.23, 0).applyMatrix4(rot), new BoxGeometry(0.05, 0.5, 0.05).translate(R + 0.22, 0.72, 0).applyMatrix4(rot));
  }
  return { wood, dark };
}

// open arched surround on each tower face (belltower.js is solid brick above 1.55 m; the dark recess stands in for the open arch)
function towerBase() {
  const g = new Group(); g.name = 'belltower_base_surround';
  const sh = new Shape(); sh.moveTo(-2.5, 0); sh.lineTo(2.5, 0); sh.lineTo(2.5, 3.7); sh.lineTo(-2.5, 3.7); sh.lineTo(-2.5, 0);
  const hole = new Path(); hole.moveTo(-1.25, 0); hole.lineTo(1.25, 0); hole.lineTo(1.25, 1.9); hole.absarc(0, 1.9, 1.25, 0, Math.PI, false); hole.lineTo(-1.25, 0);
  sh.holes.push(hole);
  const frame = new ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false, curveSegments: 18 });
  const dk = new Shape(); dk.moveTo(-1.25, 0); dk.lineTo(1.25, 0); dk.lineTo(1.25, 1.9); dk.absarc(0, 1.9, 1.25, 0, Math.PI, false);
  const recess = new ExtrudeGeometry(dk, { depth: 0.02, bevelEnabled: false, curveSegments: 18 });
  const lime = new MeshStandardMaterial({ color: 0xe4dcc6, roughness: 0.9 }), black = new MeshStandardMaterial({ color: 0x14110f, roughness: 1 });
  const sill = new BoxGeometry(5.4, 0.12, 0.7).translate(0, 0.06, 0.2), cap = new BoxGeometry(5.2, 0.14, 0.42).translate(0, 3.77, 0.12);
  for (let k = 0; k < 4; k++) {
    const f = new Group(); f.rotation.y = (k * Math.PI) / 2;
    const a = new Mesh(frame, lime), b = new Mesh(recess, black), c = new Mesh(sill, lime), d = new Mesh(cap, lime);
    a.position.set(0, 1.55, 3.4); b.position.set(0, 1.55, 3.38); c.position.set(0, 1.55, 3.4); d.position.set(0, 1.55, 3.4);
    for (const m of [a, c, d]) m.castShadow = m.receiveShadow = true;
    f.add(a, b, c, d); g.add(f);
  }
  return g;
}

export function buildPlaza(G, zone) {
  const out = new Group(); out.name = 'walk_plaza';
  const brickM = worldMat(new MeshStandardMaterial({ map: tex('brick-albedo.jpg', SRGBColorSpace), normalMap: tex('brick-normal.jpg', NoColorSpace), roughnessMap: tex('brick-rough.jpg', NoColorSpace), roughness: 1, color: 0xdcc0b0 }), true);
  const concM = worldMat(new MeshStandardMaterial({ map: tex('concrete-albedo.jpg', SRGBColorSpace), normalMap: tex('concrete-normal.jpg', NoColorSpace), roughness: 0.92, color: 0xd9d6cf }), false);
  const stoneM = worldMat(new MeshStandardMaterial({ map: tex('concrete-albedo.jpg', SRGBColorSpace), roughness: 0.95, color: 0xc4baa8 }), false);
  const soilM = new MeshStandardMaterial({ color: 0x3e2f22, roughness: 1 });
  const yb = DECK + 0.0008, dk = DECK - 0.0015;
  const bricks = [], conc = [], stone = [], soil = [];
  // deck: two steps round the edge (0.12, 0.24), ramp gap on the west side
  const W1 = X0 - 0.9, W2 = X0 - 0.45;
  conc.push(box(W2, 0, Z0 - 0.45, XE, dk, Z1 + 0.45),
    box(W1, 0, Z0 - 0.9, XE, 0.12, Z0 - 0.45), box(W1, 0, Z1 + 0.45, XE, 0.12, Z1 + 0.9),
    box(W1, 0, Z0 - 0.45, W2, 0.12, RAMP.z0), box(W1, 0, RAMP.z1, W2, 0.12, Z1 + 0.45));
  const tri = new Shape(); tri.moveTo(0, 0); tri.lineTo(RAMP.len, 0); tri.lineTo(RAMP.len, dk); tri.lineTo(0, 0);
  conc.push(fixUV(new ExtrudeGeometry(tri, { depth: RAMP.z1 - RAMP.z0, bevelEnabled: false }).translate(W2 - RAMP.len, 0, RAMP.z0).toNonIndexed()));
  for (const s of strips) bricks.push(top(X0, s.z0, s.e, s.z1, yb));
  for (const b of BANDS) conc.push(box(X0, dk, b - 0.6, XE, DECK + 0.02, b + 0.6));
  // planters: stone walls + soil
  const solids = [];
  for (const p of planters) {
    const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, h = DECK + 0.5, t = 0.14;
    stone.push(box(x0, DECK, p.z0, x0 + t, h, p.z1), box(x1 - t, DECK, p.z0, x1, h, p.z1), box(x0 + t, DECK, p.z0, x1 - t, h, p.z0 + t), box(x0 + t, DECK, p.z1 - t, x1 - t, h, p.z1),
      box(x0 - 0.04, h, p.z0 - 0.04, x1 + 0.04, h + 0.04, p.z1 + 0.04));
    soil.push(box(x0 + t, DECK, p.z0 + t, x1 - t, h - 0.1, p.z1 - t));
    solids.push([[x0, p.z0], [x1, p.z0], [x1, p.z1], [x0, p.z1]]);
  }
  out.add(solid(bricks, brickM, false), solid(conc, concM), solid(stone, stoneM), solid(soil, soilM, false));
  // understory: ornamental grasses + dormant shrubs as 2.4 m planter segments (clumps sit at y 0.58 for a 0.57 m planter)
  const seg = [];
  for (const p of planters) { const n = Math.max(1, Math.round((p.z1 - p.z0) / 2.4)); for (let i = 0; i < n; i++) seg.push({ x: p.x, z: p.z0 + ((i + 0.5) * (p.z1 - p.z0)) / n, yaw: Math.PI / 2 }); }
  const under = buildUnderstory(G, zone, seg); under.position.y = DECK - 0.07; out.add(under);
  // benches: curved; racks: long hoop runs along z, ~45% with a bike
  const mats = {}, benches = [], racks = [], bikes = [];
  for (const s of strips) { if (s.i % 2 === 0) benches.push({ x: 25.2, z: s.mid, yaw: 0 }); else if (s.e > 40) benches.push({ x: 37.5, z: s.mid, yaw: Math.PI }); }
  for (const [x, za, zb] of [[31, 13.3, 21.7], [31, -45.0, -37.2]]) for (let z = za; z <= zb; z += 0.9) { racks.push({ x, z, yaw: 0 }); if (hash(x, z) < 0.45) bikes.push({ x, z, yaw: 0, color: new Color().setHSL(hash(z, 3), 0.5, 0.35) }); }
  out.add(...instProto(arcBench(), benches, mats), ...instProto(PROTO.rack, racks, mats), ...instProto(PROTO.bike, bikes, mats));
  out.add(towerBase());
  out.counts = { strips: strips.length, planters: planters.length, grassSegs: seg.length, benches: benches.length, racks: racks.length, bikes: bikes.length };
  out.solids = solids;
  return out;
}
