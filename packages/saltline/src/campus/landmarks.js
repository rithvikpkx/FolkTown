// Purdue landmarks for Saltline: buildBellTower(at, mats) and buildFountain(at, mats).
// Each returns { group, colliders, update(t), tris }. group origin = `at` (ground centre, y = 0);
// colliders are world-space AABBs [{min:[x,y,z], max:[x,y,z]}]. mats defaults to window.__G.mats
// (Saltline's material set, src/game/mats.js); lighting comes from the host scene (sun + sky).
//
// Matched against reference/purdue-photos/tour-Bell_Tower.jpg and tour-Engi_Fountain.jpg:
//  Bell Tower (48.8 m): slender red-brick shaft with pale limestone bands (not one plinth only),
//   white limestone clock stage slightly wider than the shaft with a cornice and one white dial per
//   face, white belfry with two tall arched openings per face lit warm from inside, and a steep dark
//   slate-purple pyramid cap (concave, ribbed) with a finial. Cap/belfry/clock are each ~13% of height.
//  Engineering Fountain: four tall, thin, cream-tan concrete slabs in two height pairs, curving from a
//   flared base to a near-vertical top, narrowing upward; inner faces wet; low square pool wall with
//   coping around a shallow pool; mirror-steel jet column in the middle. Not copied: the diagonal
//   lattice relief on the slab inner faces and the terraced side wings.
import {
  BoxGeometry, CylinderGeometry, LatheGeometry, BufferGeometry, Float32BufferAttribute, Group, Mesh,
  MeshStandardMaterial, CanvasTexture, RepeatWrapping, Euler, Matrix4, Vector3, Quaternion,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const flat = (g) => { const n = g.index ? g.toNonIndexed() : g; n.computeVertexNormals(); return n; };

// Collects geometry per material key, then merges into one mesh per material.
class Parts {
  constructor(mats) { this.mats = mats; this.m = new Map(); this.colliders = []; }
  add(key, geo, opts) {
    const k = key + '|' + JSON.stringify(opts || {});
    if (!this.m.has(k)) this.m.set(k, { key, opts, geos: [] });
    this.m.get(k).geos.push(geo.index ? geo.toNonIndexed() : geo);
  }
  box(key, x0, y0, z0, x1, y1, z1, opts) {
    const g = new BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    this.add(key, g, opts);
  }
  // cylinder along z (axis towards the viewer), centre (cx,cy), z0..z1
  disc(key, cx, cy, z0, z1, r, opts) {
    const g = new CylinderGeometry(r, r, z1 - z0, 24);
    g.rotateX(Math.PI / 2);
    g.translate(cx, cy, (z0 + z1) / 2);
    this.add(key, g, opts);
  }
  build(group) {
    let tris = 0;
    for (const { key, opts, geos } of this.m.values()) {
      const g = mergeGeometries(geos.map((x) => { x.deleteAttribute('uv'); return x; }));
      tris += g.attributes.position.count / 3;
      const mat = typeof key === 'string' && this.mats ? this.mats.get(key, { triplanar: true, ...opts }) : key;
      const mesh = new Mesh(g, mat);
      mesh.castShadow = mesh.receiveShadow = true;
      group.add(mesh);
    }
    return tris;
  }
}

const getMats = (m) => m || (typeof window !== 'undefined' && window.__G && window.__G.mats);
const LIME = { color: 0xe9e1cf };     // limestone: tinted white paint set (concrete texture read too brown)
const SLATE = { color: 0x4a4466 };    // cap: dark slate-purple (the photo, not green verdigris)
const rotY = (k) => new Matrix4().makeRotationY((k * Math.PI) / 2);

export function buildBellTower(at = [0, 0, 0], mats) {
  mats = getMats(mats);
  const P = new Parts(mats), group = new Group();
  const H = 48.8, SHAFT = 3.2, CLK = 3.6;           // half widths
  const y0 = 0.9, yShaft = 25.5, yClock = 32.0, yBelfry = 38.5, yCap = 47.4;

  // Plinth + shaft + bands (symmetric, no per-face work)
  P.box('paint_white', -4.4, 0, -4.4, 4.4, 0.9, 4.4, LIME);
  P.box('brick', -SHAFT, y0, -SHAFT, SHAFT, yShaft, SHAFT);
  for (const y of [0.9, 6.5, 12.2, 17.9, 23.4]) P.box('paint_white', -SHAFT - 0.12, y, -SHAFT - 0.12, SHAFT + 0.12, y + 0.35, SHAFT + 0.12, LIME);
  P.box('paint_white', -CLK - 0.2, yShaft, -CLK - 0.2, CLK + 0.2, yShaft + 0.6, CLK + 0.2, LIME);

  // Clock stage: limestone block, cornice on top
  P.box('paint_white', -CLK, yShaft + 0.6, -CLK, CLK, yClock, CLK, LIME);
  P.box('paint_white', -CLK - 0.35, yClock, -CLK - 0.35, CLK + 0.35, yClock + 0.5, CLK + 0.35, LIME);

  // Belfry: white core, corner piers, centre mullions, warm lit arched openings
  const b0 = yClock + 0.5, hw = 0.85, spring = yBelfry - 2.6;
  P.box('paint_white', -CLK + 0.4, b0, -CLK + 0.4, CLK - 0.4, yBelfry, CLK - 0.4, LIME);
  const lamp = mats.emissive(0xffd9a0, 3);
  const dark = 'steel_dark';
  for (let k = 0; k < 4; k++) {
    const m = rotY(k), face = new Parts(mats);
    for (const x of [-1.55, 1.55]) {                // two openings per face
      face.box(lamp, x - hw, b0 + 0.9, CLK - 0.42, x + hw, spring, CLK - 0.36);
      const a = new CylinderGeometry(hw, hw, 0.06, 16, 1, false, 0, Math.PI); a.rotateX(Math.PI / 2); a.translate(x, spring, CLK - 0.39);
      face.add(lamp, a);
    }
    face.box('paint_white', -0.2, b0 + 0.9, CLK - 0.45, 0.2, yBelfry - 0.4, CLK - 0.3, LIME); // mullion
    // clock dial
    const cy = (yShaft + 0.6 + yClock) / 2 + 0.2;
    face.disc('paint_white', 0, cy, CLK, CLK + 0.08, 2.55, LIME);          // surround
    face.disc('paint_white', 0, cy, CLK + 0.08, CLK + 0.16, 2.3, { color: 0xffffff });       // dial
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6, big = i % 3 === 0, r0 = big ? 1.65 : 1.85;
      const g = new BoxGeometry(big ? 0.14 : 0.07, big ? 0.45 : 0.25, 0.05);
      g.translate(0, (r0 + 2.15) / 2 + 0.0, 0); g.rotateZ(-a); g.translate(0, cy, CLK + 0.18);
      face.add(dark, g);
    }
    for (const [len, ang, w] of [[1.9, -2.0, 0.1], [1.3, 0.5, 0.14]]) {
      const g = new BoxGeometry(w, len, 0.06); g.translate(0, len / 2, 0); g.rotateZ(-ang); g.translate(0, cy, CLK + 0.22);
      face.add(dark, g);
    }
    for (const v of face.m.values()) for (const g of v.geos) { g.applyMatrix4(m); P.add(v.key, g, v.opts); }
  }
  P.box('paint_white', -CLK - 0.3, yBelfry, -CLK - 0.3, CLK + 0.3, yBelfry + 0.6, CLK + 0.3, LIME); // eaves

  // Cap: concave 4-sided pyramid, ribs, finial
  const prof = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push(new Vector3(0.001 + 4.7 * (1 - t) * (1 - t * 0.45) , yBelfry + 0.6 + t * (yCap - yBelfry - 0.6), 0)); }
  const cap = new LatheGeometry(prof.map((p) => ({ x: p.x, y: p.y })), 4); cap.rotateY(Math.PI / 4);
  P.add('paint_grey', flat(cap), SLATE);
  P.add('brass', new CylinderGeometry(0.1, 0.18, H - yCap + 0.3, 8).translate(0, (H + yCap) / 2 - 0.15, 0));

  const tris = P.build(group);
  group.position.set(...at);
  const colliders = [{ min: [at[0] - 4.4, at[1], at[2] - 4.4], max: [at[0] + 4.4, at[1] + H, at[2] + 4.4] }];
  return { group, colliders, update() {}, tris, height: H };
}

// Streaky tileable water texture, scrolled in update().
function waterTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const x = c.getContext('2d'); x.fillStyle = '#9fb7c4'; x.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.5})`; const w = 1 + Math.random() * 3, y = Math.random() * 256; x.fillRect(Math.random() * 64, y, w, 8 + Math.random() * 40); if (y > 200) x.fillRect(Math.random() * 64, y - 256, w, 20); }
  const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; return t;
}

export function buildFountain(at = [0, 0, 0], mats) {
  mats = getMats(mats);
  const P = new Parts(mats), group = new Group(), colliders = [];
  const R = 11, WALL = 0.55, T = 0.45;
  // Square pool: coping wall on a paved apron, shallow water film
  P.box('concrete', -R - 3, -0.02, -R - 3, R + 3, 0.04, R + 3, { color: 0xcfc6b4 });
  for (const [x0, z0, x1, z1] of [[-R, -R, R, -R + 0.7], [-R, R - 0.7, R, R], [-R, -R, -R + 0.7, R], [R - 0.7, -R, R, R]]) {
    P.box('paint_white', x0, 0, z0, x1, WALL, z1, { color: 0xeadfc2 });
    colliders.push({ min: [at[0] + x0, at[1], at[2] + z0], max: [at[0] + x1, at[1] + WALL, at[2] + z1] });
  }
  const wtex = waterTex();
  const water = (map, o) => { const m = new MeshStandardMaterial({ map, color: 0xcfe6ee, roughness: 0.08, metalness: 0, transparent: true, opacity: o, depthWrite: false, emissive: 0x335566, emissiveIntensity: 0.4 }); return m; };
  const poolMat = water(wtex.clone(), 0.55), sheetMat = water(wtex, 0.5), jetMat = water(wtex.clone(), 0.7);
  poolMat.map.wrapS = poolMat.map.wrapT = RepeatWrapping; poolMat.map.repeat.set(6, 6); poolMat.map.needsUpdate = true;
  const wet = new Group();
  const poolG = new BoxGeometry(2 * R - 1.4, 0.04, 2 * R - 1.4); poolG.translate(0, 0.38, 0);
  wet.add(new Mesh(poolG, poolMat));

  // Four swept slabs: radius shrinks with remaining height squared, width tapers, two height pairs
  const STEPS = 16, ths = [0.4, 0.4 + Math.PI / 2, 0.4 + Math.PI, 0.4 + 1.5 * Math.PI], hs = [11.6, 9.8, 11.6, 9.8];
  ths.forEach((th, k) => {
    const Hh = hs[k], er = [Math.cos(th), Math.sin(th)], et = [-Math.sin(th), Math.cos(th)];
    const ring = (i, off) => {
      const t = i / STEPS, r = 1.2 + 5.2 * (1 - t) ** 2.3, dr = (-5.2 * 2.3 * (1 - t) ** 1.3) / Hh;
      const nl = Math.hypot(1, dr), nr = 1 / nl, ny = -dr / nl, hw = 2.0 - 1.1 * t, ht = T * (1 - 0.4 * t) + off, y = t * Hh;
      return (sw, sn) => new Vector3((r + sn * ht * nr) * er[0] + sw * hw * et[0], y + sn * ht * ny, (r + sn * ht * nr) * er[1] + sw * hw * et[1]);
    };
    const pos = [], spos = [];
    const quad = (arr, a, b, c, d) => arr.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
    for (let i = 0; i < STEPS; i++) {
      const a = ring(i, 0), b = ring(i + 1, 0);
      for (const [s0, n0, s1, n1] of [[-1, 1, 1, 1], [1, -1, -1, -1], [1, 1, 1, -1], [-1, -1, -1, 1]]) quad(pos, a(s0, n0), a(s1, n1), b(s1, n1), b(s0, n0));
      const wa = ring(i, 0.04), wb = ring(i + 1, 0.04);
      quad(spos, wa(-0.8, -1), wa(0.8, -1), wb(0.8, -1), wb(-0.8, -1));
      if (i % 5 === 0 || i === STEPS - 1) { // collider segment per ~third of the slab
        const seg = [];
        for (let j = i; j <= Math.min(STEPS, i + 5); j++) for (const sw of [-1, 1]) for (const sn of [-1, 1]) seg.push(ring(j, 0)(sw, sn));
        colliders.push({ min: [0, 1, 2].map((a) => at[a] + Math.min(...seg.map((v) => [v.x, v.y, v.z][a]))), max: [0, 1, 2].map((a) => at[a] + Math.max(...seg.map((v) => [v.x, v.y, v.z][a]))) });
      }
    }
    const ta = ring(STEPS, 0); quad(pos, ta(-1, 1), ta(1, 1), ta(1, -1), ta(-1, -1));
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    P.add('paint_white', g, { color: 0xeadfc2 });
    const sg = new BufferGeometry(); sg.setAttribute('position', new Float32BufferAttribute(spos, 3)); sg.computeVertexNormals();
    const sm = new Mesh(sg, sheetMat); sm.renderOrder = 2; wet.add(sm);
  });
  // central mirror-steel column and jet
  P.add('aluminium', new CylinderGeometry(0.8, 0.8, 2.2, 24).translate(0, 1.1, 0), { color: 0xffffff });
  const jet = new Mesh(new CylinderGeometry(0.12, 0.2, 6.5, 10, 1, true).translate(0, 5.4, 0), jetMat); wet.add(jet);
  const plume = new Mesh(new CylinderGeometry(0.2, 1.0, 5.5, 16, 1, true).translate(0, 5.2, 0), jetMat); plume.scale.set(1, 0.5, 1); wet.add(plume);
  const tris = P.build(group);
  group.add(wet);
  let wt = tris; wet.children.forEach((m) => { wt += m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3; });
  group.position.set(...at);
  const update = (t) => {
    sheetMat.map.offset.y = -t * 0.9; jetMat.map.offset.y = -t * 1.6; poolMat.map.offset.set(t * 0.03, t * 0.02);
    jet.scale.y = 1 + 0.05 * Math.sin(t * 5); plume.scale.set(1 + 0.04 * Math.sin(t * 3), 0.5 + 0.04 * Math.sin(t * 4), 1 + 0.04 * Math.cos(t * 3));
  };
  return { group, colliders, update, tris: Math.round(wt), height: 11.6 };
}

// Adapter for campus/index.js: place both landmarks from the zone records, add their collision, tick the water.
export function build(G, zone, root) {
  const L = zone.landmarks || {};
  const items = [];
  if (L.bellTower) items.push(buildBellTower([L.bellTower.x, 0, L.bellTower.z], G.mats));
  if (L.fountain) items.push(buildFountain([L.fountain.x, 0, L.fountain.z], G.mats));
  for (const it of items) {
    root.add(it.group);
    for (const c of it.colliders) G.physics.addBox(c.min, c.max, { surface: 'concrete', noNav: true });
  }
  (G.campusTick = G.campusTick || []).push((t) => items.forEach((it) => it.update(t)));
}
