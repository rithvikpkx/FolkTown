// Purdue Bell Tower (Class of 1948 Bell Tower, dedicated 14 Oct 1995), built in code. Origin = tower centre, ground y = 0.
// buildBellTower(at, mats, opts) -> { group, colliders, update(t), setNight(on), tris, trisFar, height }
// opts: { shaftTexture: THREE.Texture (bell-shaft.jpg, repeat-wrapped), night, clock: () => seconds-of-day, materials: { brick, lime, slate } (photo-texture hook, see facades.json) }
//
// Proportions measured from Wikimedia Commons photos (Purdue_Bell_Tower_Purdue_University_2016_01, Purdue_BellTower_1,
// Purdue_University_belltower, Purdue_Bell_Tower_night; CC BY / CC BY-SA / PD) and reference/purdue-photos/tour-Bell_Tower.jpg.
// Shaft width 6.6 m; heights (m): shaft 1.45-31.0, cornice 31.0-31.75, clock stage 31.75-36.0, belfry 36.0-41.2,
// belfry cornice 41.2-42.4, slate cap 42.4-46.8 (rise 4.4 over half width 3.2), finial to 48.8 (LiDAR: ridge 46.4, max 47.7, spire under-sampled).
import {
  BoxGeometry, BufferGeometry, CanvasTexture, CircleGeometry, CylinderGeometry, ExtrudeGeometry, Float32BufferAttribute, Group, LOD,
  LatheGeometry, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, Shape, SphereGeometry, SRGBColorSpace, Vector2, Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const BELLTOWER_HALF = 5.0; // outer edge of the base steps: the walk/campus collider footprint
const H = 48.8, HW = 3.3;
const LIME = { color: 0xefeadc }, SLATE = { color: 0x2c2638 }, BRICKC = { color: 0xb8795f };

// Collects geometry per material, merges to one mesh per material.
class Parts {
  constructor() { this.m = new Map(); }
  add(key, geo, opts) {
    const k = (typeof key === 'string' ? key : key.uuid) + JSON.stringify(opts || {});
    if (!this.m.has(k)) this.m.set(k, { key, opts, geos: [] });
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.deleteAttribute('uv');
    this.m.get(k).geos.push(g);
  }
  box(key, x0, y0, z0, x1, y1, z1, opts) {
    this.add(key, new BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), opts);
  }
  // box centred on x,z with half widths hx, hz
  col(key, cx, cz, hx, hz, y0, y1, opts) { this.box(key, cx - hx, y0, cz - hz, cx + hx, y1, cz + hz, opts); }
  // copy of this face set rotated k quarter turns about y, merged into target
  rotInto(target, k) {
    const m = new Matrix4().makeRotationY((k * Math.PI) / 2);
    for (const v of this.m.values()) for (const g of v.geos) target.add(v.key, g.clone().applyMatrix4(m), v.opts);
  }
  build(group, mats, shadows = true) {
    let tris = 0;
    for (const { key, opts, geos } of this.m.values()) {
      const g = mergeGeometries(geos);
      tris += g.attributes.position.count / 3;
      const mat = typeof key === 'string' ? mats.get(key, { triplanar: true, ...opts }) : key;
      const mesh = new Mesh(g, mat);
      mesh.castShadow = mesh.receiveShadow = shadows;
      group.add(mesh);
    }
    return tris;
  }
}

// thin bar from a to b
function bar(a, b, w) {
  const d = new Vector3().subVectors(b, a), len = d.length();
  const g = new BoxGeometry(w, w, len);
  const m = new Matrix4().lookAt(new Vector3(), d.clone().normalize(), new Vector3(0, 1, 0));
  g.applyMatrix4(m); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}

// four-sided pyramid, flat shaded
function pyramid(hw, y0, y1) {
  const a = new Vector3(0, y1, 0), c = [[-hw, -hw], [hw, -hw], [hw, hw], [-hw, hw]].map(([x, z]) => new Vector3(x, y0, z));
  const p = [];
  for (let i = 0; i < 4; i++) p.push(...c[i].toArray(), ...a.toArray(), ...c[(i + 1) % 4].toArray());
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(p, 3)); g.computeVertexNormals();
  return g;
}

function dialTexture() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d'), m = S / 2;
  x.fillStyle = '#f3ecd8'; x.fillRect(0, 0, S, S);
  x.strokeStyle = '#17140f'; x.fillStyle = '#17140f';
  x.lineWidth = 10; x.beginPath(); x.arc(m, m, m - 8, 0, 7); x.stroke();
  for (let i = 0; i < 60; i++) { // minute track of dots, longer ticks on the hours
    const a = (i * Math.PI) / 30, r = m - 34;
    x.beginPath(); x.arc(m + Math.sin(a) * r, m - Math.cos(a) * r, i % 5 ? 3 : 5, 0, 7); x.fill();
  }
  x.font = 'bold 54px "Times New Roman", Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((n, i) => {
    const a = (i * Math.PI) / 6;
    x.save(); x.translate(m + Math.sin(a) * (m - 92), m - Math.cos(a) * (m - 92)); x.rotate(a); x.fillText(n, 0, 0); x.restore();
  });
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 8; return t;
}

// bronze time-capsule plaque, text from reference photo (Purdue_BellTowerTimeCapsule.jpg)
function plaqueTexture() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d'), m = S / 2;
  x.fillStyle = '#4a2e1c'; x.beginPath(); x.arc(m, m, m, 0, 7); x.fill();
  x.strokeStyle = '#c9a24a'; x.lineWidth = 22; x.beginPath(); x.arc(m, m, m - 14, 0, 7); x.stroke();
  x.fillStyle = '#c9a24a';
  for (let i = 0; i < 40; i++) { x.save(); x.translate(m, m); x.rotate((i * Math.PI) / 20); x.fillRect(-14, -m + 46, 28, 20); x.restore(); }
  x.textAlign = 'center'; x.font = 'bold 44px Georgia, serif'; x.fillText('PURDUE BELL TOWER', m, 340);
  x.font = '27px Georgia, serif';
  ['On January 19, 1894, Purdue University dedicated', 'Heavilon Hall, an engineering laboratory with a tower', 'that soared above the modest skyline of the fledgling',
    'campus. Four days later, the structure lay in ruins,', 'destroyed by explosion and fire.', '"That tower shall go up one brick higher!"',
    'It did go up again - nine bricks higher, according to', 'legend - and the rebuilt Heavilon Hall and tower', 'remained a campus landmark until they were razed in 1956.',
    'The four bells from the rebuilt tower fell silent for', 'almost 40 years. The Heavilon Hall bells now ring again', 'in the belfry above, reminding all who hear their joyous',
    'peals that our University will ever strive to build', '"one brick higher."'].forEach((l, i) => x.fillText(l, m, 395 + i * 34));
  x.font = 'bold 26px Georgia, serif'; x.fillText('DEDICATED OCTOBER 14, 1995', m, 890);
  x.font = '22px Georgia, serif'; x.fillText('Made possible with a leadership gift from the Class of 1948.', m, 925);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildBellTower(at = [0, 0, 0], mats, opts = {}) {
  mats = mats || (typeof window !== 'undefined' && window.__G && window.__G.mats);
  const MT = opts.materials || {};
  const brick = MT.brick || 'brick', lime = MT.lime || 'paint_white', slate = MT.slate || 'paint_grey';
  const bo = MT.brick ? undefined : BRICKC, lo = MT.lime ? undefined : LIME, so = MT.slate ? undefined : SLATE;
  const P = new Parts(), F = new Parts(), group = new Group(); // F = one face (+z), rotated into P four times
  const near = new Group(), far = new Group();

  // ---- plaza, steps, base course ----
  P.box('concrete', -13, 0, -13, 13, 0.08, 13, { color: 0x8a6a5a });
  for (const s of [-1, 1]) { // limestone curb round the plaza
    P.box(lime, -13.6, 0, s * 13.3 - 0.3, 13.6, 0.1, s * 13.3 + 0.3, lo);
    P.box(lime, s * 13.3 - 0.3, 0, -13, s * 13.3 + 0.3, 0.1, 13, lo);
  }
  P.col(lime, 0, 0, 5.0, 5.0, 0, 0.15, lo); P.col(lime, 0, 0, 4.35, 4.35, 0.15, 0.3, lo);
  P.col(lime, 0, 0, 3.85, 3.85, 0.3, 1.2, lo); P.col(lime, 0, 0, 3.7, 3.7, 1.2, 1.45, lo); P.col(lime, 0, 0, 3.55, 3.55, 1.45, 1.55, lo);

  // ---- brick shaft: recessed panel + projecting corner piers, limestone bands, cornice ----
  P.col(brick, 0, 0, 3.2, 3.2, 1.55, 31.0, bo);
  const pierHalf = [[2.35, 3.3], [-3.3, -2.35]];
  for (const [a, b] of pierHalf) for (const s of [-1, 1]) {
    P.box(brick, a, 1.55, s * 3.2 - (s > 0 ? 0 : 0.1), b, 31.0, s * 3.2 + (s > 0 ? 0.1 : 0), bo); // piers on +-z faces
    P.box(brick, s * 3.2 - (s > 0 ? 0 : 0.1), 1.55, a, s * 3.2 + (s > 0 ? 0.1 : 0), 31.0, b, bo); // and on +-x faces
  }
  for (const y of [5.4, 11.8, 18.2, 24.6]) { // bands every 6.4 m below the cornice
    P.col(lime, 0, 0, 3.5, 3.5, y, y + 0.34, lo); P.col(lime, 0, 0, 3.4, 3.4, y + 0.34, y + 0.46, lo);
  }
  P.col(lime, 0, 0, 3.55, 3.55, 31.0, 31.4, lo); P.col(lime, 0, 0, 3.4, 3.4, 31.4, 31.75, lo);

  // ---- clock stage (limestone) ----
  P.col(lime, 0, 0, 2.95, 2.95, 31.75, 36.0, lo);
  const dialY = 34.2;
  F.box(lime, -2.6, 32.15, 2.95, 2.6, 32.25, 3.03, lo); F.box(lime, -2.6, 35.55, 2.95, 2.6, 35.65, 3.03, lo); // raised panel frame
  F.box(lime, -2.6, 32.15, 2.95, -2.5, 35.65, 3.03, lo); F.box(lime, 2.5, 32.15, 2.95, 2.6, 35.65, 3.03, lo);
  F.add(lime, new CylinderGeometry(1.0, 1.0, 0.12, 40).rotateX(Math.PI / 2).translate(0, dialY, 3.0), lo); // dial surround
  F.box('steel_dark', -0.5, 32.7, 2.95, 0.5, 33.0, 3.01, { color: 0x1c1c1c });                           // name plate
  { // drip hood under the dial
    const s = new Shape([new Vector2(0, 0), new Vector2(0.5, 0), new Vector2(0.5, 0.18), new Vector2(0, 0.75)]);
    F.add(lime, new ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(0.55, 31.8, 2.95), lo);
  }

  // ---- belfry: sill, corner piers, paired mullions, arched head wall, rail, cornice ----
  P.col(lime, 0, 0, 2.95, 2.95, 36.0, 36.2, lo); P.col(lime, 0, 0, 2.7, 2.7, 36.2, 36.45, lo);
  F.box(lime, -2.6, 36.45, 2.15, 2.6, 37.05, 2.6, lo);                       // solid sill under the openings
  F.box(lime, -2.6, 37.5, 2.2, 2.6, 37.85, 2.5, lo);                         // mid rail across the openings
  for (const x of [-0.42, 0.42]) { F.col(lime, x, 2.35, 0.13, 0.13, 37.05, 41.2, lo); F.col(lime, x, 2.35, 0.2, 0.2, 37.05, 37.3, lo); }
  { // arched head wall: two openings per face (x 0.55..1.9), springing at 39.7
    const sp = 39.7, r = 0.675, s = new Shape();
    s.moveTo(-2.6, 39.0); s.lineTo(-2.6, 41.2); s.lineTo(2.6, 41.2); s.lineTo(2.6, 39.0);
    s.lineTo(1.9, 39.0); s.lineTo(1.9, sp); s.absarc(1.225, sp, r, 0, Math.PI, false); s.lineTo(0.55, 39.0);
    s.lineTo(-0.55, 39.0); s.lineTo(-0.55, sp); s.absarc(-1.225, sp, r, 0, Math.PI, false); s.lineTo(-1.9, 39.0); s.closePath();
    F.add(lime, new ExtrudeGeometry(s, { depth: 0.45, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, 2.15), lo);
  }
  for (const sx of [-1, 1]) { P.col(lime, sx * 2.25, sx * 2.25, 0.4, 0.4, 36.45, 41.2, lo); P.col(lime, sx * 2.25, -sx * 2.25, 0.4, 0.4, 36.45, 41.2, lo); } // corner piers
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    P.col(lime, sx * 2.25, sz * 2.25, 0.5, 0.5, 36.45, 36.75, lo); P.col(lime, sx * 2.25, sz * 2.25, 0.5, 0.5, 40.9, 41.2, lo); // base blocks and capitals
  }
  // belfry cornice, wide flared coping
  P.col(lime, 0, 0, 3.0, 3.0, 41.2, 41.5, lo); P.col(lime, 0, 0, 3.25, 3.25, 41.5, 41.85, lo); P.col(lime, 0, 0, 3.45, 3.45, 41.85, 42.4, lo);

  // ---- slate cap with white ribs, finial ----
  P.add(slate, pyramid(3.2, 42.4, 46.8), so);
  const apex = new Vector3(0, 46.8, 0), up = new Vector3(0, 0.03, 0);
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2, rot = (x, z) => new Vector3(x * Math.cos(ang) + z * Math.sin(ang), 42.4, -x * Math.sin(ang) + z * Math.cos(ang));
    const rib = (x, z, w) => P.add(lime, bar(rot(x, z).add(up), apex.clone().add(up), w), lo);
    rib(-3.2, 3.2, 0.14); rib(-1.05, 3.2, 0.07); rib(0, 3.2, 0.07); rib(1.05, 3.2, 0.07); // hip rib, then seams
  }
  P.col(lime, 0, 0, 0.45, 0.45, 46.8, 47.0, lo);
  P.add('aluminium', new CylinderGeometry(0.06, 0.12, 1.5, 8).translate(0, 47.7, 0));
  P.add('aluminium', new SphereGeometry(0.17, 10, 8).translate(0, 47.75, 0));
  P.add('aluminium', new CylinderGeometry(0.005, 0.06, 0.9, 8).translate(0, 48.35, 0));

  // ---- bells and bell frame (visible through the arches) ----
  const bellProf = [[0.46, 0], [0.4, 0.12], [0.28, 0.4], [0.22, 0.62], [0.12, 0.72], [0.001, 0.75]].map(([x, y]) => new Vector2(x, y));
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) {
    P.add('brass', new LatheGeometry(bellProf, 12).translate(x, 38.1, z), { color: 0x6b5a3a });
    P.box('steel_dark', x - 0.05, 38.85, z - 0.05, x + 0.05, 39.1, z + 0.05, { color: 0x222222 });
  }
  P.box('steel_dark', -1.2, 39.1, -1.2, 1.2, 39.3, 1.2, { color: 0x3b3b3b });

  for (let k = 0; k < 4; k++) F.rotInto(P, k);
  if (opts.shaftTexture) { // photo-texture hook: facades.json bell-shaft.jpg (5.18 x 6.27 m brick bay), one plane per bay per face, panel width 4.7 m
    const pos = [], uv = [], bays = [[1.55, 5.4], [5.86, 11.8], [12.26, 18.2], [18.66, 24.6], [25.06, 31.0]];
    for (let k = 0; k < 4; k++) for (const [y0, y1] of bays) {
      const c = Math.cos((k * Math.PI) / 2), s = Math.sin((k * Math.PI) / 2), v1 = (y1 - y0) / 6.27;
      const p = (x, y) => [x * c + 3.205 * s, y, -x * s + 3.205 * c];
      for (const [x, y, u, v] of [[-2.35, y0, 0, 0], [2.35, y0, 1, 0], [2.35, y1, 1, v1], [-2.35, y0, 0, 0], [2.35, y1, 1, v1], [-2.35, y1, 0, v1]]) { pos.push(...p(x, y)); uv.push(u, v); }
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    const mesh = new Mesh(g, new MeshStandardMaterial({ map: opts.shaftTexture, roughness: 0.9 })); mesh.castShadow = mesh.receiveShadow = true; near.add(mesh);
  }
  const trisNear = P.build(near, mats);

  // far LOD: silhouette only
  const D = new Parts();
  D.col(brick, 0, 0, 3.5, 3.5, 0, 31.0, bo); D.col(lime, 0, 0, 3.55, 3.55, 31.0, 36.0, lo);
  D.col(lime, 0, 0, 3.0, 3.0, 36.0, 42.4, lo); D.col('steel_dark', 0, 0, 3.02, 3.02, 37.1, 39.9, { color: 0x4a4a46 });
  D.add(slate, pyramid(3.2, 42.4, 46.8), so); D.add('aluminium', new CylinderGeometry(0.03, 0.1, 2.4, 6).translate(0, 47.6, 0));
  const trisFar = D.build(far, mats);

  // ---- clock dials and hands (own meshes: UV texture, moving parts) ----
  const dialTex = dialTexture();
  const dialMat = new MeshStandardMaterial({ map: dialTex, roughness: 0.5, emissive: 0xffe9b0, emissiveMap: dialTex, emissiveIntensity: 0 });
  const handMat = new MeshStandardMaterial({ color: 0x15130f, roughness: 0.6 });
  const dialGeo = new CircleGeometry(0.78, 40), hands = [];
  const hand = (len, w) => { // tapered hand with a short tail
    const s = new Shape([new Vector2(-w, -0.18), new Vector2(w, -0.18), new Vector2(w * 0.5, len), new Vector2(-w * 0.5, len)]);
    return new ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false });
  };
  const hourG = hand(0.46, 0.035), minG = hand(0.7, 0.025);
  for (let k = 0; k < 4; k++) {
    const f = new Group(); f.rotation.y = (k * Math.PI) / 2;
    const d = new Mesh(dialGeo, dialMat); d.position.set(0, dialY, 3.065); f.add(d);
    const hh = new Group(), mm = new Group(); hh.position.set(0, dialY, 3.08); mm.position.set(0, dialY, 3.095);
    hh.add(new Mesh(hourG, handMat)); mm.add(new Mesh(minG, handMat)); f.add(hh, mm); hands.push([hh, mm]);
    near.add(f);
  }
  const setTime = (sec) => {
    const m = sec / 60, h = m / 60;
    for (const [hh, mm] of hands) { hh.rotation.z = -(h % 12) / 12 * Math.PI * 2; mm.rotation.z = -(m % 60) / 60 * Math.PI * 2; }
  };
  const clock = opts.clock || (() => { const d = new Date(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); });
  setTime(clock());

  // ---- plaza furniture: four black lamp posts, bronze time-capsule plaque ----
  const L = new Parts();
  const glass = new MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd58a, emissiveIntensity: 0, roughness: 0.3 });
  const posts = [];
  for (const [x, z] of [[-10.5, -10.5], [10.5, -10.5], [-10.5, 10.5], [10.5, 10.5]]) {
    const blk = { color: 0x101010 };
    L.add('steel_dark', new CylinderGeometry(0.3, 0.38, 0.5, 10).translate(x, 0.25, z), blk);
    L.add('steel_dark', new CylinderGeometry(0.07, 0.15, 3.3, 10).translate(x, 2.15, z), blk);
    L.add('steel_dark', new CylinderGeometry(0.2, 0.1, 0.18, 10).translate(x, 3.9, z), blk);
    L.add('steel_dark', new CylinderGeometry(0.1, 0.27, 0.16, 8).translate(x, 4.55, z), blk); // lantern roof
    L.add('steel_dark', new SphereGeometry(0.07, 8, 6).translate(x, 4.7, z), blk);
    posts.push([x, z]);
    const gl = new Mesh(new CylinderGeometry(0.17, 0.12, 0.5, 8).translate(x, 4.2, z), glass); near.add(gl); far.add(gl.clone());
  }
  L.build(near, mats); L.build(far, mats, false);
  const plaque = new Mesh(new CircleGeometry(0.95, 48).rotateX(-Math.PI / 2).translate(0, 0.055, 7.4),
    new MeshStandardMaterial({ map: plaqueTexture(), roughness: 0.45, metalness: 0.6 }));
  plaque.receiveShadow = true; near.add(plaque);

  // ---- night option: floodlit belfry, lit dials, warm lanterns ----
  const glow = new MeshBasicMaterial({ color: 0xfff0c8 });
  const night = new Group(); night.visible = false;
  for (let k = 0; k < 4; k++) {
    const g = new Group(); g.rotation.y = (k * Math.PI) / 2;
    for (const x of [-1.225, 1.225]) g.add(new Mesh(new BoxGeometry(1.3, 2.6, 0.02).translate(x, 38.5, 1.7), glow));
    night.add(g);
  }
  const lamp = new PointLight(0xffe0a0, 0, 16, 1.6); lamp.position.set(0, 38.6, 0); night.add(lamp);
  near.add(night);
  const setNight = (on) => {
    night.visible = on; lamp.intensity = on ? 140 : 0; dialMat.emissiveIntensity = on ? 0.9 : 0; glass.emissiveIntensity = on ? 3 : 0;
  };
  setNight(!!opts.night);

  const lod = new LOD(); lod.addLevel(near, 0); lod.addLevel(far, 140); group.add(lod);
  group.position.set(...at);
  let last = 0;
  const update = (t) => { if (t - last > 1) { last = t; setTime(clock()); } };
  const colliders = [{ min: [at[0] - BELLTOWER_HALF, at[1], at[2] - BELLTOWER_HALF], max: [at[0] + BELLTOWER_HALF, at[1] + H, at[2] + BELLTOWER_HALF] }];
  const tris = trisNear + 4 * (dialGeo.index ? dialGeo.index.count / 3 : 0) + 8 * 4 + 4 * 14;
  return { group, colliders, update, setNight, setTime, tris: Math.round(tris), trisFar, height: H };
}
