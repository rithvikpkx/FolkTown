// Wilmeth Active Learning Center (WALC, way/508846031, local ~(70,-2)), generated in code (no glb).
// buildWalc(G, poly) -> Group. Facts: OSM footprint (poly), LiDAR roof raster (data/pilot/roofs.json), photos in reference/purdue-photos.
//   Two 3-storey brick pavilions (north z -55..-33, south z 6..28) under hipped roofs (eave 17.2 m, ridge 21.8 m, slope 22.4 deg,
//   deep eaves, dark soffit, rafter tails) joined by a lower flat-roofed block (16.2 m) whose long faces are recessed behind a colonnade.
// Facade kinds: glazed (tall paired lights between brick piers), punched (paired windows, limestone surrounds), colonnade (open ground floor).
// One mesh per material; near (windows) / far (textured box) LOD for the wall detail. Optional photo-texture manifest: public/campus/walk/facades.json
//   { walc: { brick: { map, normalMap }, limestone: { map } } } (urls relative to campus/walk/); absent -> procedural brick/limestone.
import { BoxGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, RepeatWrapping, SphereGeometry, SRGBColorSpace, TextureLoader } from 'three';
import { Bucket, ring, offset, cap } from './facades.js';

const BASE = import.meta.env.BASE_URL + 'campus/';
const FAR = 140, BAY = 3.6, SLOPE = Math.tan((22.4 * Math.PI) / 180), EAVE = 1.6;
const HIPS = [{ x0: 41.17, x1: 99.92, z0: -55.44, z1: -33 }, { x0: 41.59, x1: 100.76, z0: 5.7, z1: 28.3 }]; // from the LiDAR ridge lines
const MID = [-33, 5.7]; // z range of the lower flat-roofed block between the pavilions
const SPLIT = [-33, -26, 5.7], XL = 90.5, LOW = 7.6; // east two-storey wing (LiDAR 7-8 m) sits east of x 90.5, z -26..5.7; the 16.2 m block steps back to x 90.5
const inLow = (x, z) => x > XL && z > -26 && z < 5.8;
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const cv = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const tex = (c, srgb = true) => { const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = SRGBColorSpace; return t; };

// ---------- procedural materials ----------
// brick tile: 6 bricks x 16 courses = 1.35 x 1.2 m. Real WALC brick is red-brown with dark flashed units, light grey mortar.
function brickTextures() {
  const W = 512, H = 512, c = cv(W, H), g = c.getContext('2d'), b = cv(W, H), bg = b.getContext('2d');
  g.fillStyle = '#b3aa9b'; g.fillRect(0, 0, W, H); bg.fillStyle = '#000'; bg.fillRect(0, 0, W, H);
  const bw = W / 6, bh = H / 16;
  for (let r = 0; r < 16; r++) {
    const cols = []; for (let k = 0; k < 7; k++) cols.push(rnd());
    cols[6] = cols[0];
    for (let k = 0; k < 7; k++) {
      const x = k * bw - (r % 2 ? bw / 2 : 0), q = cols[k], dark = rnd() < 0.18 ? 0.72 : 1;
      g.fillStyle = `rgb(${(150 + q * 40) * dark | 0},${(66 + q * 20) * dark | 0},${(50 + q * 14) * dark | 0})`;
      g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 3);
      const v = 150 + rnd() * 90 | 0; bg.fillStyle = `rgb(${v},${v},${v})`; bg.fillRect(x + 2, r * bh + 2, bw - 4, bh - 3);
      for (let s = 0; s < 6; s++) { g.fillStyle = rnd() < 0.5 ? 'rgba(40,15,10,.16)' : 'rgba(235,170,140,.12)'; g.fillRect(x + 3 + rnd() * (bw - 10), r * bh + 3 + rnd() * (bh - 7), 3 + rnd() * 9, 2); }
    }
  }
  return [tex(c), tex(b, false)];
}
function stoneTexture() { // cream Indiana limestone
  const c = cv(256, 256), g = c.getContext('2d');
  g.fillStyle = '#e8dfc6'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(150,130,90,.07)' : 'rgba(255,250,235,.1)'; g.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 14, 2 + rnd() * 6); }
  g.fillStyle = 'rgba(120,105,80,.25)'; g.fillRect(0, 0, 256, 1); g.fillRect(0, 0, 1, 256);
  return tex(c);
}
// clay roof tile, 1 m x 1 m tile: 4 courses x 5 tiles. Colour from the Purdue design render (terracotta); the 2018 photo only shows the dark soffits of the big hips and a red-brown roof on the low east wing.
function tileTexture() {
  const c = cv(256, 256), g = c.getContext('2d');
  g.fillStyle = '#4a2418'; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) {
    const q = rnd(), x = k * 51.2 - (r % 2 ? 25 : 0);
    g.fillStyle = `rgb(${150 + q * 38 | 0},${68 + q * 22 | 0},${40 + q * 14 | 0})`; g.fillRect(x + 1.5, r * 64 + 1, 48, 58);
    g.fillStyle = 'rgba(30,10,5,.28)'; g.fillRect(x + 1.5, r * 64 + 50, 48, 9); // shadow under each course
  }
  return tex(c);
}
function farTexture() { // one bay x one storey of brick wall with a window, for the distant box
  const w = 90, h = 140, c = cv(w, h), g = c.getContext('2d');
  g.fillStyle = '#8f4a39'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 300; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,25,18,.2)' : 'rgba(200,120,95,.15)'; g.fillRect(rnd() * w, rnd() * h, 6, 2); }
  g.fillStyle = '#e4dcc4'; g.fillRect(14, 28, 62, 92); g.fillStyle = '#4c6272'; g.fillRect(18, 32, 54, 84);
  g.fillStyle = '#e4dcc4'; g.fillRect(44, 32, 3, 84); g.fillRect(18, 72, 54, 3); g.fillRect(0, 130, w, 6);
  return tex(c);
}

async function manifest() {
  try { return ((j) => (j.buildings || j).walc || {})(await (await fetch(BASE + 'walk/facades.json')).json()); } catch { return {}; }
}

function materials(m) {
  const std = (o) => new MeshStandardMaterial({ side: DoubleSide, ...o });
  const [bm, bb] = brickTextures();
  const brick = std({ map: bm, bumpMap: bb, bumpScale: 1.5, roughness: 0.92 }), stone = std({ map: stoneTexture(), roughness: 0.8 });
  const load = (u) => { const t = new TextureLoader().load(BASE + 'walk/' + u); t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 8; return t; };
  if (m.brick && m.brick.map) { brick.map = load(m.brick.map); brick.map.colorSpace = SRGBColorSpace; brick.bumpMap = null; if (m.brick.normalMap) brick.normalMap = load(m.brick.normalMap); }
  if (m.limestone && m.limestone.map) { stone.map = load(m.limestone.map); stone.map.colorSpace = SRGBColorSpace; }
  const far = std({ map: farTexture(), roughness: 0.9 });
  return {
    brick, stone, far,
    roof: std({ map: tileTexture(), roughness: 0.75 }),
    flat: std({ color: 0xc8c5bc, roughness: 0.9 }),
    steel: std({ color: 0x8d9094, roughness: 0.4, metalness: 0.7 }),
    dark: std({ color: 0x1b1a1a, roughness: 0.7 }),
    frame: std({ color: 0xe6dfcc, roughness: 0.5, metalness: 0.2 }),
    plate: std({ color: 0x1d2024, roughness: 0.6, metalness: 0.4 }),
    pipe: std({ color: 0x3b2f28, roughness: 0.6, metalness: 0.4 }),
    mech: std({ color: 0x9a9c9e, roughness: 0.6, metalness: 0.5 }),
    glass: std({ vertexColors: true, color: 0xffffff, roughness: 0.04, metalness: 0.45, envMapIntensity: 0.9 }),
  };
}

// ---------- footprint ----------
function refine(poly) { // CCW ring, split where the roof level changes
  const R = ring(poly.flat()), out = [];
  R.forEach((p, i) => {
    const q = R[(i + 1) % R.length]; out.push(p);
    for (const z of SPLIT) if ((p[1] - z) * (q[1] - z) < 0) { const t = (z - p[1]) / (q[1] - p[1]); out.push([p[0] + (q[0] - p[0]) * t, z]); }
  });
  return out;
}

export async function buildWalc(G, poly, opts = {}) {
  const M = materials(await manifest());
  const buckets = new Map(), bk = (key, mat, colored, sx = 1, sy = 1) => {
    if (!buckets.has(key)) { const b = new Bucket(mat, colored); b.sx = sx; b.sy = sy; buckets.set(key, b); }
    return buckets.get(key);
  };
  const W = bk('brick', M.brick, false, 1 / 1.35, 1 / 1.2), S = bk('stone', M.stone, false, 0.8, 0.8), RF = bk('roof', M.roof), DK = bk('dark', M.dark),
    FR = bk('frame', M.frame), PL = bk('plate', M.plate), PP = bk('pipe', M.pipe), GL = bk('glass', M.glass, true), FW = bk('far', M.far),
    FL = bk('flat', M.flat), ST = bk('steel', M.steel), MG = bk('mglass', M.glass, true), MF = bk('mfr', M.frame);
  const ROOT = new Set(['roof', 'flat', 'dark', 'mglass', 'mfr']); // always visible (roofs, rooftop monitor)
  const R = refine(poly), n = R.length, root = new Group(), near = new Group(), far = new Group();
  const glassCol = () => { const v = 0.55 + rnd() * 0.5; return [0.1 * v, 0.19 * v, 0.26 * v]; }; // dark blue-grey, reflections add the sky
  const box = (B, x0, y0, z0, x1, y1, z1) => { // axis-aligned box, sides and top
    B.q([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]); B.q([x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]);
    B.q([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]); B.q([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]); B.q([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]);
  };
  const rect = (B, x0, z0, x1, z1, y) => B.q([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const rfq = (a, b, c, d) => { // clay tile quad: a,b eave, c,d ridge; tile uvs in metres
    const w = dist(a, b), hh = dist([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2, (c[2] + d[2]) / 2]), off = (w - dist(c, d)) / 2;
    RF.q(a, b, c, d, null, [[0, 0], [w, 0], [w - off, hh], [off, hh]]);
  };

  const edgeInfo = R.map((a, i) => {
    const b = R[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = dz / L, nz = -dx / L, mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    const low = inLow(mx, mz), mid = !low && mz > MID[0] && mz < MID[1], bulge = mz > 28.6, top = low ? LOW : mid || bulge ? 16.2 : 17.2;
    let kind = 'plain';
    if (L >= 5) kind = mid ? (L >= 18 ? 'colonnade' : 'punched') : low || Math.abs(nx) > Math.abs(nz) ? 'punched' : 'glazed';
    return { i, a, b, dx, dz, L, nx, nz, mx, mz, top, kind, hip: !mid && !bulge && !low, base: 0 };
  });
  // inner east face of the 16.2 m block, standing on the roof of the low east wing (not in the OSM footprint)
  edgeInfo.push({ i: n, a: [XL, -26], b: [XL, 5.7], dx: 0, dz: 31.7, L: 31.7, nx: 1, nz: 0, mx: XL, mz: -10, top: 16.2, kind: 'punched', hip: false, base: LOW });

  for (const e of edgeInfo) {
    const { i, L, kind, base } = e, top = e.top - base, uo = i * 0.37;
    const P = (u, y, o) => [e.a[0] + (e.dx / L) * u + (e.dz / L) * o, y + base, e.a[1] + (e.dz / L) * u - (e.dx / L) * o];
    const face = (B, u0, ya, u1, yb, o, col) => B.q(P(u0, ya, o), P(u0, yb, o), P(u1, yb, o), P(u1, ya, o), col,
      [[u0 + uo, ya], [u0 + uo, yb], [u1 + uo, yb], [u1 + uo, ya]].map(([u, v]) => [u * B.sx, v * B.sy]));
    const rq = (B, a, b, c, d, w, h) => B.q(a, b, c, d, null, [[0, 0], [0, h], [w, h], [w, 0]].map(([u, v]) => [u * B.sx, v * B.sy])); // a,b,c,d = BL,TL,TR,BR
    // box standing proud of plane o by depth d: front, two sides, top (mullions with depth, limestone piers, door stiles)
    const bar = (B, u0, y0, u1, y1, o, d) => {
      face(B, u0, y0, u1, y1, o + d);
      rq(B, P(u0, y0, o), P(u0, y1, o), P(u0, y1, o + d), P(u0, y0, o + d), d, y1 - y0); rq(B, P(u1, y0, o + d), P(u1, y1, o + d), P(u1, y1, o), P(u1, y0, o), d, y1 - y0);
      B.q(P(u0, y1, o + d), P(u1, y1, o + d), P(u1, y1, o), P(u0, y1, o));
    };
    // far LOD: textured box
    FW.q(P(0, 0, 0), P(0, top, 0), P(L, top, 0), P(L, 0, 0), null, [[0, 0], [0, top / 5.5], [L / BAY, top / 5.5], [L / BAY, 0]]);

    const H = top - 0.6, lowish = base || e.top < 9, nF = lowish ? 2 : Math.max(1, Math.round(H / 5.5)), g0 = nF > 1 ? (lowish ? H / 2 : 5.0) : H, fl = [0];
    for (let f = 1; f <= nF; f++) fl.push(f === nF ? H : g0 + ((H - g0) * (f - 1)) / (nF - 1));
    const nb = L < 5 ? 0 : Math.max(1, Math.round((L - 2.2) / BAY)), m0 = 1.1, pitch = nb ? (L - 2 * m0) / nb : 0;
    const colon = kind === 'colonnade', doorK = !base && !colon && L >= 12 && nb ? Math.floor(nb / 2) : -1;
    // ---- shared pieces: plinth, belt courses, cornice or eave
    if (!colon && !base) { face(S, 0, 0, L, 0.7, 0.07); S.q(P(0, 0.7, 0.07), P(L, 0.7, 0.07), P(L, 0.7, 0), P(0, 0.7, 0)); }
    if (nF > 1) {
      face(S, 0, fl[1] - 0.18, L, fl[1] + 0.12, 0.09); S.q(P(0, fl[1] + 0.12, 0.09), P(L, fl[1] + 0.12, 0.09), P(L, fl[1] + 0.12, 0), P(0, fl[1] + 0.12, 0));
      S.q(P(0, fl[1] - 0.18, 0), P(L, fl[1] - 0.18, 0), P(L, fl[1] - 0.18, 0.09), P(0, fl[1] - 0.18, 0.09));
    }
    if (nF > 2) face(S, 0, fl[2] - 0.1, L, fl[2] + 0.1, 0.05);
    face(W, 0, H, L, top, 0); // frieze
    if (!e.hip) { // flat roof: stone cornice and coping
      face(S, 0, top - 0.55, L, top - 0.3, 0.14); face(S, 0, top - 0.3, L, top, 0.3);
      S.q(P(0, top - 0.3, 0), P(L, top - 0.3, 0), P(L, top - 0.3, 0.3), P(0, top - 0.3, 0.3)); S.q(P(0, top, 0.3), P(L, top, 0.3), P(L, top, 0), P(0, top, 0));
    }
    if (!nb) { face(W, 0, 0, L, H, 0); continue; }

    // framed lights at plane offset o: dark plate, dark tinted glass per pane, cream mullions and transoms standing proud
    const lights = (x0, x1, wa, wb, o, pc, pr, md = 0.12) => {
      face(PL, x0, wa, x1, wb, o);
      const gw = (x1 - x0) / pc, gh = (wb - wa) / pr;
      for (let a = 0; a < pc; a++) for (let b = 0; b < pr; b++) face(GL, x0 + a * gw + 0.05, wa + b * gh + 0.05, x0 + (a + 1) * gw - 0.05, wa + (b + 1) * gh - 0.05, o + 0.03, glassCol());
      for (let a = 1; a < pc; a++) bar(FR, x0 + a * gw - 0.045, wa, x0 + a * gw + 0.045, wb, o, md);
      for (let b = 1; b < pr; b++) bar(FR, x0, wa + b * gh - 0.04, x1, wa + b * gh + 0.04, o, md - 0.02);
      face(FR, x0, wa, x1, wa + 0.07, o + md); face(FR, x0, wb - 0.07, x1, wb, o + md); face(FR, x0, wa, x0 + 0.07, wb, o + md); face(FR, x1 - 0.07, wa, x1, wb, o + md);
    };
    // double glass door in steel stiles with push bars and a stone threshold
    const door = (x0, x1, o) => {
      const w = (x1 - x0) / 2, h = 2.45;
      for (let j = 0; j < 2; j++) {
        const a = x0 + j * w + 0.04, b = x0 + (j + 1) * w - 0.04;
        bar(ST, a, 0.1, a + 0.07, h, o, 0.1); bar(ST, b - 0.07, 0.1, b, h, o, 0.1); bar(ST, a, h - 0.1, b, h, o, 0.1); bar(ST, a, 0.1, b, 0.55, o, 0.06);
        bar(ST, j ? x0 + w + 0.16 : x0 + w - 0.19, 0.95, j ? x0 + w + 0.19 : x0 + w - 0.16, 1.45, o, 0.2);
      }
      bar(S, x0 - 0.1, 0, x1 + 0.1, 0.12, o, 0.5);
    };
    const opening = (x0, x1, wa, wb, pc, pr, surround, isDoor) => {
      const d = 0.28, h = wb - wa;
      rq(W, P(x0, wb, 0), P(x0, wb, -d), P(x1, wb, -d), P(x1, wb, 0), x1 - x0, d); // head
      rq(W, P(x0, wa, 0), P(x0, wb, 0), P(x0, wb, -d), P(x0, wa, -d), d, h); rq(W, P(x1, wa, -d), P(x1, wb, -d), P(x1, wb, 0), P(x1, wa, 0), d, h);
      lights(x0, x1, wa, wb, -d, pc, pr);
      if (isDoor) door(x0, x1, -d);
      else { S.q(P(x0 - 0.05, wa, 0.08), P(x1 + 0.05, wa, 0.08), P(x1 + 0.05, wa, -d), P(x0 - 0.05, wa, -d)); face(S, x0 - 0.05, wa - 0.12, x1 + 0.05, wa, 0.08); } // sill
      if (surround) { bar(S, x0 - 0.22, wa - 0.12, x0, wb + 0.3, 0, 0.07); bar(S, x1, wa - 0.12, x1 + 0.22, wb + 0.3, 0, 0.07); bar(S, x0, wb, x1, wb + 0.3, 0, 0.07); }
    };
    const pier = (u, y0, y1) => { // brick pilaster, projecting
      face(W, u - 0.35, y0, u + 0.35, y1, 0.14);
      rq(W, P(u - 0.35, y0, 0), P(u - 0.35, y1, 0), P(u - 0.35, y1, 0.14), P(u - 0.35, y0, 0.14), 0.14, y1 - y0); rq(W, P(u + 0.35, y0, 0.14), P(u + 0.35, y1, 0.14), P(u + 0.35, y1, 0), P(u + 0.35, y0, 0), 0.14, y1 - y0);
    };
    const pipeAt = (u) => { face(PP, u - 0.06, 0.3, u + 0.06, H, 0.2); PP.q(P(u - 0.06, 0.3, 0), P(u - 0.06, H, 0), P(u - 0.06, H, 0.2), P(u - 0.06, 0.3, 0.2)); PP.q(P(u + 0.06, 0.3, 0.2), P(u + 0.06, H, 0.2), P(u + 0.06, H, 0), P(u + 0.06, 0.3, 0)); };

    for (let f = 0; f < nF; f++) {
      const fa = fl[f], fb = fl[f + 1];
      if (colon && f === 0) { // open ground floor: slender limestone piers to the roof, glazed back wall with entrance doors, glass canopies
        const Rd = 2.2, hb = fb - 0.65;
        DK.q(P(0, hb, -Rd), P(L, hb, -Rd), P(L, hb, 0), P(0, hb, 0)); face(S, 0, hb, L, fb, 0.04);
        for (const u of [0, L]) rq(W, P(u, 0, 0), P(u, fb, 0), P(u, fb, -Rd), P(u, 0, -Rd), Rd, fb);
        for (let k = 0; k <= nb; k++) bar(S, m0 + k * pitch - 0.25, 0, m0 + k * pitch + 0.25, H, -0.5, 0.7);
        face(W, 0, 0, m0 + 0.3, hb, -Rd); face(W, L - m0 - 0.3, 0, L, hb, -Rd);
        for (let k = 0; k < nb; k++) {
          const x0 = m0 + k * pitch + 0.3, x1 = m0 + (k + 1) * pitch - 0.3;
          lights(x0, x1, 0.1, hb, -Rd, 2, 2); if (k % 2) door(x0, x1, -Rd);
          GL.q(P(x0, hb - 0.12, 0.2), P(x1, hb - 0.12, 0.2), P(x1, hb - 0.4, 2.3), P(x0, hb - 0.4, 2.3), [0.16, 0.22, 0.26]); // canopy
          bar(ST, x0, hb - 0.5, x1, hb - 0.36, 2.2, 0.08);
        }
        continue;
      }
      if (colon) { // upper floors: one curtain wall, a tall pane per bay and floor pair, between the piers
        if (f === 1) {
          for (let k = 0; k < nb; k++) lights(m0 + k * pitch + 0.25, m0 + (k + 1) * pitch - 0.25, fl[1] + 0.1, H - 0.1, -0.25, 1, 2, 0.16);
          face(W, 0, fl[1], m0 - 0.25, H, 0); face(W, L - m0 + 0.25, fl[1], L, H, 0);
        }
        continue;
      }
      const gl = kind !== 'punched';
      let wa, wb;
      if (!gl) { wa = fa + (f ? 1.05 : 0.95); wb = Math.min(wa + (f ? 2.75 : 2.6), fb - 0.4); } else { wa = fa + (f ? 0.5 : 0.8); wb = fb - 0.45; if (f === 0 && nF > 1) wb = Math.min(wb, 4.35); }
      let u = 0;
      for (let k = 0; k < nb; k++) {
        const xc = m0 + (k + 0.5) * pitch, isDoor = f === 0 && k === doorK;
        const slots = isDoor ? [[xc - 1.2, xc + 1.2]] : gl ? [[xc - (pitch - 1.0) / 2, xc + (pitch - 1.0) / 2]] : [[xc - 1.3, xc - 0.2], [xc + 0.2, xc + 1.3]]; // punched: a pair of narrow windows per bay
        for (const [x0, x1] of slots) {
          face(W, u, fa, x0, fb, 0); u = x1;
          if (!isDoor) face(W, x0, fa, x1, wa, 0);
          face(W, x0, wb, x1, fb, 0);
          opening(x0, x1, isDoor ? 0.12 : wa, isDoor ? Math.max(wb, 3.3) : wb, gl ? 3 : 1, gl ? 2 : 3, !gl || isDoor, isDoor);
        }
      }
      face(W, u, fa, L, fb, 0);
    }
    if (kind === 'glazed') for (let k = 0; k <= nb; k++) pier(m0 + k * pitch, 0.7, H);
    for (let k = 0; k <= nb; k += k === 0 || k === nb ? 1 : 4) pipeAt(k === 0 ? 0.35 : k === nb ? L - 0.35 : m0 + k * pitch);
    if (colon) { // deep tiled overhang over the bay, on the piers: eave 16.1 m, rises to meet the flat roof
      const ye = 16.1, oe = 2.8;
      rfq(P(0, ye, oe), P(L, ye, oe), P(L, 16.95, -0.3), P(0, 16.95, -0.3));
      face(DK, 0, ye - 0.35, L, ye + 0.04, oe); DK.q(P(0, ye - 0.35, oe), P(L, ye - 0.35, oe), P(L, ye - 0.35, 0), P(0, ye - 0.35, 0));
      for (const u of [0, L]) DK.q(P(u, ye - 0.35, 0), P(u, ye - 0.35, oe), P(u, ye + 0.04, oe), P(u, 16.95, -0.3));
    }
    e.P = P; e.nbk = nb;
  }

  // ---------- roofs: clay-tile hips from the LiDAR ridge lines, flat membrane over the middle block, glazed rooftop monitor ----------
  const strip = (B, A, yA, C, yC) => { for (let i = 0; i < A.length; i++) { const j = (i + 1) % A.length; B.q([A[i][0], yA, A[i][1]], [C[i][0], yC, C[i][1]], [C[j][0], yC, C[j][1]], [A[j][0], yA, A[j][1]]); } };
  for (const [x0, z0, x1, z1] of [[45.2, -33, XL, 5.7], [43.95, -33, 45.2, -26.5], [XL, -33, 99.9, -26]]) rect(FL, x0, z0, x1, z1, 16.25);
  for (const [x0, z0, x1, z1] of [[XL, -21.5, 95.9, 1.3], [XL, -26, 99.8, -21.5], [XL, 1.3, 100.1, 5.7]]) rect(FL, x0, z0, x1, z1, LOW + 0.1); // low east wing roof
  cap(FL, ring([46.19, 28.3, 49.91, 32.75, 60.03, 32.2, 63.43, 28.3]), 16.25);
  const yt = 17.2, tip = yt - SLOPE * EAVE, soff = yt - 0.9;
  for (const h of HIPS) {
    const hd = (h.z1 - h.z0) / 2, zc = (h.z0 + h.z1) / 2, ry = yt + SLOPE * hd, X0 = h.x0 - EAVE, X1 = h.x1 + EAVE, Z0 = h.z0 - EAVE, Z1 = h.z1 + EAVE;
    const tipP = (x, z) => [x, tip, z], r0 = [h.x0 + hd, ry, zc], r1 = [h.x1 - hd, ry, zc];
    rfq(tipP(X0, Z0), tipP(X1, Z0), r1, r0); rfq(tipP(X1, Z1), tipP(X0, Z1), r0, r1);
    for (const [a, b, c] of [[tipP(X0, Z1), tipP(X0, Z0), r0], [tipP(X1, Z0), tipP(X1, Z1), r1]]) { const w = dist(a, b), hh = Math.hypot(c[0] - a[0], c[2] - (a[2] + b[2]) / 2, c[1] - a[1]); RF.t(a, b, c, [[0, 0], [w, 0], [w / 2, hh]]); }
    const wallR = [[h.x0, h.z0], [h.x1, h.z0], [h.x1, h.z1], [h.x0, h.z1]], outR = [[X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1]];
    strip(DK, wallR, soff, outR, soff); strip(DK, outR, soff, outR, tip + 0.06); // soffit + fascia
    for (let s = 0; s < 4; s++) { // exposed rafter tails under the soffit, every 1.2 m
      const a = outR[s], b = outR[(s + 1) % 4], w = wallR[s], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, vx = (w[0] - a[0]) / EAVE, vz = (w[1] - a[1]) / EAVE;
      for (let u = 1.6; u < L - 1.4; u += 1.2) {
        const px = a[0] + ux * u, pz = a[1] + uz * u, q = (du, dv, y) => [px + ux * du + vx * dv, y, pz + uz * du + vz * dv];
        DK.q(q(-0.06, 0.1, soff - 0.28), q(0.06, 0.1, soff - 0.28), q(0.06, EAVE - 0.1, soff - 0.28), q(-0.06, EAVE - 0.1, soff - 0.28));
        DK.q(q(-0.06, 0.1, soff), q(-0.06, 0.1, soff - 0.28), q(-0.06, EAVE - 0.1, soff - 0.28), q(-0.06, EAVE - 0.1, soff));
        DK.q(q(0.06, EAVE - 0.1, soff), q(0.06, EAVE - 0.1, soff - 0.28), q(0.06, 0.1, soff - 0.28), q(0.06, 0.1, soff));
      }
    }
    box(DK, h.x0 + hd, ry, zc - 0.12, h.x1 - hd, ry + 0.22, zc + 0.12); // ridge cap
  }
  // glazed rooftop monitor on the flat roof (LiDAR plant box x 64..75, z -24..4, +3.3 m): cream frame, dark glass, white overhanging roof slab
  { const x0 = 64, x1 = 75, z0 = -23.5, z1 = 3.5, y0 = 16.25, yb = y0 + 0.55, yt2 = y0 + 2.85;
    for (const [ax, az, bx, bz] of [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]]) {
      const L = Math.hypot(bx - ax, bz - az), m = Math.max(1, Math.round(L / 1.7)), ux = (bx - ax) / L, uz = (bz - az) / L;
      MG.q([ax, yb, az], [ax, yt2, az], [bx, yt2, bz], [bx, yb, bz], glassCol());
      for (let k = 0; k < m; k++) { const cx = ax + ux * (k * L) / m, cz = az + uz * (k * L) / m; box(MF, cx - 0.05, yb, cz - 0.05, cx + 0.05, yt2, cz + 0.05); }
    }
    box(MF, x0 - 0.05, y0, z0 - 0.05, x1 + 0.05, yb, z1 + 0.05); box(FL, x0 - 0.45, yt2, z0 - 0.45, x1 + 0.45, yt2 + 0.4, z1 + 0.45);
  }

  // ---------- assemble ----------
  let tris = 0, trisFar = 0;
  for (const [k, b] of buckets) {
    const m = b.mesh();
    if (k === 'far') { far.add(m); trisFar += b.p.length / 9; } else { (ROOT.has(k) ? root : near).add(m); tris += b.p.length / 9; }
  }
  // rooftop plant (LiDAR: ~3 m above the flat roof)
  const mech = (x0, x1, z0, z1, y0, y1) => { const m = new Mesh(new BoxGeometry(x1 - x0, y1 - y0, z1 - z0), M.mech); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; root.add(m); tris += 12; };
  mech(52, 58, -30, 5, 16.25, 19.4);

  // ---------- site details: entrance canopy, lamp posts, limestone seat walls ----------
  const props = new Group(), lampMat = new MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffe2a8, emissiveIntensity: 0.6 });
  const pole = new CylinderGeometry(0.05, 0.08, 4.4, 8).translate(0, 2.2, 0), base = new CylinderGeometry(0.14, 0.18, 0.5, 8).translate(0, 0.25, 0), glob = new SphereGeometry(0.2, 10, 8).translate(0, 4.65, 0), cage = new CylinderGeometry(0.12, 0.22, 0.2, 8).translate(0, 4.4, 0);
  const add = (geo, mat, x, y, z, ry = 0) => { const m = new Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = mat !== lampMat; m.receiveShadow = true; props.add(m); tris += 20; return m; };
  const place = (e, u, o) => [e.a[0] + (e.dx / e.L) * u + (e.dz / e.L) * o, e.a[1] + (e.dz / e.L) * u - (e.dx / e.L) * o];
  const colonE = edgeInfo.filter((e) => e.kind === 'colonnade').sort((a, b) => b.L - a.L)[0], south = edgeInfo.filter((e) => e.nz > 0.9).sort((a, b) => b.L - a.L)[0];
  for (const [e, us, o] of [[colonE, [3, 9.5, 19, 25.5], 6.5], [south, [6, 18, 31], 5]]) {
    if (!e) continue;
    for (const u of us) { const [x, z] = place(e, Math.min(u, e.L - 2), o); add(pole, M.dark, x, 0, z); add(base, M.dark, x, 0, z); add(cage, M.dark, x, 0, z); add(glob, lampMat, x, 0, z); }
  }
  if (colonE) {
    const yaw = -Math.atan2(colonE.dz, colonE.dx), seat = new BoxGeometry(3.6, 0.5, 0.55);
    for (const u of [4, 12, 22]) { const [x, z] = place(colonE, u, 4.2); add(seat, M.stone, x, 0.25, z, yaw); }
  }
  root.add(near, far, props);
  const c = { x: 70, z: -2 }, upd = () => { const d = Math.hypot(G.camera.position.x - c.x, G.camera.position.z - c.z) > FAR; near.visible = !d; far.visible = d; };
  if (G.camera) (G.campusTick = G.campusTick || []).push(upd);
  root.userData.stats = { tris: Math.round(tris), trisFar: Math.round(trisFar) };
  if (typeof window !== 'undefined') window.__walcTris = root.userData.stats; // for tools/saltline-walk-shots.mjs
  return root;
}
