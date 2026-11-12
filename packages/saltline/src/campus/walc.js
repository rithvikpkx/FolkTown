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
function farTexture() { // one bay x one storey of brick wall with a window, for the distant box
  const w = 90, h = 140, c = cv(w, h), g = c.getContext('2d');
  g.fillStyle = '#8f4a39'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 300; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,25,18,.2)' : 'rgba(200,120,95,.15)'; g.fillRect(rnd() * w, rnd() * h, 6, 2); }
  g.fillStyle = '#e4dcc4'; g.fillRect(14, 28, 62, 92); g.fillStyle = '#4c6272'; g.fillRect(18, 32, 54, 84);
  g.fillStyle = '#e4dcc4'; g.fillRect(44, 32, 3, 84); g.fillRect(18, 72, 54, 3); g.fillRect(0, 130, w, 6);
  return tex(c);
}

async function manifest() {
  try { return (await (await fetch(BASE + 'walk/facades.json')).json()).walc || {}; } catch { return {}; }
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
    roof: std({ color: 0x2c2f35, roughness: 0.5, metalness: 0.35 }),
    dark: std({ color: 0x1b1a1a, roughness: 0.7 }),
    frame: std({ color: 0xe6dfcc, roughness: 0.5, metalness: 0.2 }),
    plate: std({ color: 0x1d2024, roughness: 0.6, metalness: 0.4 }),
    pipe: std({ color: 0x3b2f28, roughness: 0.6, metalness: 0.4 }),
    mech: std({ color: 0x9a9c9e, roughness: 0.6, metalness: 0.5 }),
    glass: std({ vertexColors: true, color: 0xffffff, roughness: 0.05, metalness: 0.6, envMapIntensity: 1.6 }),
  };
}

// ---------- footprint ----------
function refine(poly) { // CCW ring, split where the roof level changes
  const R = ring(poly.flat()), out = [];
  R.forEach((p, i) => {
    const q = R[(i + 1) % R.length]; out.push(p);
    for (const z of MID) if ((p[1] - z) * (q[1] - z) < 0) { const t = (z - p[1]) / (q[1] - p[1]); out.push([p[0] + (q[0] - p[0]) * t, z]); }
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
    FR = bk('frame', M.frame), PL = bk('plate', M.plate), PP = bk('pipe', M.pipe), GL = bk('glass', M.glass, true), FW = bk('far', M.far);
  const R = refine(poly), n = R.length, root = new Group(), near = new Group(), far = new Group();
  const glassCol = (i) => { const v = 0.7 + rnd() * 0.6, warm = rnd() < 0.12; return warm ? [0.5 * v, 0.46 * v, 0.38 * v] : [0.26 * v, 0.36 * v, 0.43 * v]; };

  const edgeInfo = R.map((a, i) => {
    const b = R[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = dz / L, nz = -dx / L, mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    const mid = mz > MID[0] && mz < MID[1], bulge = mz > 28.6, top = mid || bulge ? 16.2 : 17.2;
    let kind = 'plain';
    if (L >= 5) kind = mid ? (L >= 18 ? 'colonnade' : 'punched') : Math.abs(nx) > Math.abs(nz) ? 'punched' : 'glazed';
    return { i, a, b, dx, dz, L, nx, nz, mx, mz, top, kind, hip: !mid && !bulge };
  });

  for (const e of edgeInfo) {
    const { i, L, top, kind } = e, uo = i * 0.37;
    const P = (u, y, o) => [e.a[0] + (e.dx / L) * u + (e.dz / L) * o, y, e.a[1] + (e.dz / L) * u - (e.dx / L) * o];
    const face = (B, u0, ya, u1, yb, o, col) => B.q(P(u0, ya, o), P(u0, yb, o), P(u1, yb, o), P(u1, ya, o), col,
      [[u0 + uo, ya], [u0 + uo, yb], [u1 + uo, yb], [u1 + uo, ya]].map(([u, v]) => [u * B.sx, v * B.sy]));
    const rq = (B, a, b, c, d, w, h) => B.q(a, b, c, d, null, [[0, 0], [0, h], [w, h], [w, 0]].map(([u, v]) => [u * B.sx, v * B.sy])); // a,b,c,d = BL,TL,TR,BR
    // far LOD: textured box
    FW.q(P(0, 0, 0), P(0, top, 0), P(L, top, 0), P(L, 0, 0), null, [[0, 0], [0, top / 5.5], [L / BAY, top / 5.5], [L / BAY, 0]]);

    const H = top - 0.6, nF = Math.max(1, Math.round(H / 5.5)), g0 = nF > 1 ? 5.0 : H, fl = [0];
    for (let f = 1; f <= nF; f++) fl.push(f === nF ? H : g0 + ((H - g0) * (f - 1)) / (nF - 1));
    const nb = L < 5 ? 0 : Math.max(1, Math.round((L - 2.2) / BAY)), m0 = 1.1, pitch = nb ? (L - 2 * m0) / nb : 0;
    const colon = kind === 'colonnade';
    // ---- shared pieces: plinth, belt courses, cornice or eave
    if (!colon) { face(S, 0, 0, L, 0.7, 0.07); S.q(P(0, 0.7, 0.07), P(L, 0.7, 0.07), P(L, 0.7, 0), P(0, 0.7, 0)); }
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

    // framed lights at plane offset o: dark plate, tinted glass per pane, cream mullions standing proud
    const lights = (x0, x1, wa, wb, o, pc, pr) => {
      face(PL, x0, wa, x1, wb, o);
      const mw = 0.07, gw = (x1 - x0 - 0.1) / pc, gh = (wb - wa - 0.1) / pr;
      for (let a = 0; a < pc; a++) for (let b = 0; b < pr; b++)
        face(GL, x0 + 0.05 + a * gw + (a ? mw / 2 : 0), wa + 0.05 + b * gh + (b ? mw / 2 : 0), x0 + 0.05 + (a + 1) * gw - (a < pc - 1 ? mw / 2 : 0), wa + 0.05 + (b + 1) * gh - (b < pr - 1 ? mw / 2 : 0), o + 0.025, glassCol(i));
      for (let a = 1; a < pc; a++) face(FR, x0 + 0.05 + a * gw - mw / 2, wa, x0 + 0.05 + a * gw + mw / 2, wb, o + 0.06);
      for (let b = 1; b < pr; b++) face(FR, x0, wa + 0.05 + b * gh - 0.05, x1, wa + 0.05 + b * gh + 0.05, o + 0.06);
      face(FR, x0, wa, x1, wa + 0.05, o + 0.06); face(FR, x0, wb - 0.05, x1, wb, o + 0.06);
      face(FR, x0, wa, x0 + 0.05, wb, o + 0.06); face(FR, x1 - 0.05, wa, x1, wb, o + 0.06);
    };
    const opening = (x0, x1, wa, wb, pc, pr, surround) => {
      const d = 0.28, h = wb - wa;
      rq(W, P(x0, wb, 0), P(x0, wb, -d), P(x1, wb, -d), P(x1, wb, 0), x1 - x0, d); // head
      rq(W, P(x0, wa, 0), P(x0, wb, 0), P(x0, wb, -d), P(x0, wa, -d), d, h); rq(W, P(x1, wa, -d), P(x1, wb, -d), P(x1, wb, 0), P(x1, wa, 0), d, h);
      lights(x0, x1, wa, wb, -d, pc, pr);
      S.q(P(x0 - 0.05, wa, 0.08), P(x1 + 0.05, wa, 0.08), P(x1 + 0.05, wa, -d), P(x0 - 0.05, wa, -d)); // sill top
      face(S, x0 - 0.05, wa - 0.12, x1 + 0.05, wa, 0.08);
      if (surround) { face(S, x0 - 0.2, wa, x0, wb + 0.3, 0.03); face(S, x1, wa, x1 + 0.2, wb + 0.3, 0.03); face(S, x0, wb, x1, wb + 0.3, 0.03); }
    };
    const pier = (u, y0, y1) => { // brick pilaster, projecting
      face(W, u - 0.35, y0, u + 0.35, y1, 0.14);
      rq(W, P(u - 0.35, y0, 0), P(u - 0.35, y1, 0), P(u - 0.35, y1, 0.14), P(u - 0.35, y0, 0.14), 0.14, y1 - y0); rq(W, P(u + 0.35, y0, 0.14), P(u + 0.35, y1, 0.14), P(u + 0.35, y1, 0), P(u + 0.35, y0, 0), 0.14, y1 - y0);
    };
    const pipeAt = (u) => { face(PP, u - 0.06, 0.3, u + 0.06, H, 0.2); PP.q(P(u - 0.06, 0.3, 0), P(u - 0.06, H, 0), P(u - 0.06, H, 0.2), P(u - 0.06, 0.3, 0.2)); PP.q(P(u + 0.06, 0.3, 0.2), P(u + 0.06, H, 0.2), P(u + 0.06, H, 0), P(u + 0.06, 0.3, 0)); };

    for (let f = 0; f < nF; f++) {
      const fa = fl[f], fb = fl[f + 1];
      if (colon && f === 0) { // open ground floor: columns, glazed back wall, beam
        const Rd = 2.2, hb = fb - 0.65;
        DK.q(P(0, hb, -Rd), P(L, hb, -Rd), P(L, hb, 0), P(0, hb, 0)); face(S, 0, hb, L, fb, 0.04);
        for (const u of [0, L]) rq(W, P(u, 0, 0), P(u, fb, 0), P(u, fb, -Rd), P(u, 0, -Rd), Rd, fb);
        for (let k = 0; k <= nb; k++) {
          const u = m0 + k * pitch;
          face(S, u - 0.22, 0, u + 0.22, hb, -0.05);
          S.q(P(u - 0.22, 0, -0.5), P(u - 0.22, hb, -0.5), P(u - 0.22, hb, -0.05), P(u - 0.22, 0, -0.05)); S.q(P(u + 0.22, 0, -0.05), P(u + 0.22, hb, -0.05), P(u + 0.22, hb, -0.5), P(u + 0.22, 0, -0.5));
        }
        face(W, 0, 0, m0 + 0.3, hb, -Rd); face(W, L - m0 - 0.3, 0, L, hb, -Rd);
        for (let k = 0; k < nb; k++) lights(m0 + k * pitch + 0.3, m0 + (k + 1) * pitch - 0.3, 0.1, hb, -Rd, 3, 2);
        continue;
      }
      const gl = kind !== 'punched';
      let wa, wb;
      if (!gl) { wa = fa + (f ? 1.05 : 0.95); wb = Math.min(wa + (f ? 2.75 : 2.6), fb - 0.4); } else { wa = fa + (f ? 0.5 : 0.8); wb = fb - 0.45; if (f === 0 && nF > 1) wb = Math.min(wb, 4.35); }
      face(W, 0, fa, L, wa, 0); face(W, 0, wb, L, fb, 0);
      let u = 0;
      for (let k = 0; k < nb; k++) {
        const xc = m0 + (k + 0.5) * pitch, ow = gl ? pitch - 1.0 : Math.min(1.9, pitch - 0.9), x0 = xc - ow / 2, x1 = xc + ow / 2;
        face(W, u, wa, x0, wb, 0); u = x1;
        opening(x0, x1, wa, wb, gl ? 3 : 2, gl ? 2 : 2, !gl);
      }
      face(W, u, wa, L, wb, 0);
    }
    if (kind === 'glazed' || colon) for (let k = 0; k <= nb; k++) pier(m0 + k * pitch, colon ? fl[1] : 0.7, H);
    for (let k = 0; k <= nb; k += k === 0 || k === nb ? 1 : 4) pipeAt(k === 0 ? 0.35 : k === nb ? L - 0.35 : m0 + k * pitch);
    e.P = P; e.nbk = nb;
  }

  // ---------- roofs: hips from the LiDAR ridge lines, flat cap over the middle block ----------
  const strip = (B, A, yA, C, yC) => { for (let i = 0; i < A.length; i++) { const j = (i + 1) % A.length; B.q([A[i][0], yA, A[i][1]], [C[i][0], yC, C[i][1]], [C[j][0], yC, C[j][1]], [A[j][0], yA, A[j][1]]); } };
  cap(RF, R, 16.25);
  const yt = 17.2, tip = yt - SLOPE * EAVE, soff = yt - 0.9;
  for (const h of HIPS) {
    const hd = (h.z1 - h.z0) / 2, zc = (h.z0 + h.z1) / 2, ry = yt + SLOPE * hd, X0 = h.x0 - EAVE, X1 = h.x1 + EAVE, Z0 = h.z0 - EAVE, Z1 = h.z1 + EAVE;
    const tipP = (x, z) => [x, tip, z], r0 = [h.x0 + hd, ry, zc], r1 = [h.x1 - hd, ry, zc];
    RF.q(tipP(X0, Z0), tipP(X1, Z0), r1, r0); RF.q(tipP(X1, Z1), tipP(X0, Z1), r0, r1);
    RF.t(tipP(X0, Z1), tipP(X0, Z0), r0, [[0, 0], [1, 0], [0.5, 1]]); RF.t(tipP(X1, Z0), tipP(X1, Z1), r1, [[0, 0], [1, 0], [0.5, 1]]);
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
  }

  // ---------- assemble ----------
  let tris = 0, trisFar = 0;
  for (const [k, b] of buckets) {
    const m = b.mesh();
    if (k === 'far') { far.add(m); trisFar += b.p.length / 9; } else { (k === 'roof' || k === 'dark' ? root : near).add(m); tris += b.p.length / 9; }
  }
  // rooftop plant (LiDAR: ~3 m above the flat roof)
  const mech = (x0, x1, z0, z1, y0, y1) => { const m = new Mesh(new BoxGeometry(x1 - x0, y1 - y0, z1 - z0), M.mech); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; root.add(m); tris += 12; };
  mech(52, 58, -30, 5, 16.25, 19.4); mech(64, 75, -24, 4, 16.25, 19.3);

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
    const L = colonE.L, yaw = -Math.atan2(colonE.dz, colonE.dx), seat = new BoxGeometry(3.6, 0.5, 0.55), slab = new BoxGeometry(6, 0.18, 2.4);
    for (const u of [4, 12, 22]) { const [x, z] = place(colonE, u, 4.2); add(seat, M.stone, x, 0.25, z, yaw); }
    const [cx, cz] = place(colonE, L / 2, 1.2); // entrance canopy: dark steel plate on two slim posts
    add(slab, M.plate, cx, 4.0, cz, yaw);
    for (const du of [-2.7, 2.7]) { const [x, z] = place(colonE, L / 2 + du, 2.2); add(new CylinderGeometry(0.06, 0.06, 4, 8).translate(0, 2, 0), M.plate, x, 0, z); }
  }
  root.add(near, far, props);
  const c = { x: 70, z: -2 }, upd = () => { const d = Math.hypot(G.camera.position.x - c.x, G.camera.position.z - c.z) > FAR; near.visible = !d; far.visible = d; };
  if (G.camera) (G.campusTick = G.campusTick || []).push(upd);
  root.userData.stats = { tris: Math.round(tris), trisFar: Math.round(trisFar) };
  return root;
}
