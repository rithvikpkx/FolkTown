// Wilmeth Active Learning Center (WALC, way/508846031, local ~(70,-2)), generated in code (no glb). buildWalc(G) -> Group.
// Everything below is MEASURED (docs/walc-hifi.md), in the campus frame (x east, z south, y up from the LiDAR ground), not taken from the OSM polygon
// (that polygon traces the roof edge, about 2 m outside the walls):
//   plan, ridges, eaves, flat roofs, monitor, notches: Google mesh top-down height/ortho (0.087 m px) + horizontal slices, cross-checked with LiDAR (data/pilot/roofs.json);
//   facades (bays, windows, belts, piers, lettering band): Apple Maps frames west-mid / east-mid / south-mid rectified with fitted camera poses (tools/walc-apple.json);
//   colonnade glazing, canopies, doors, pavilion proportions: Street View 2021 frame (heights rescaled to the Apple datum, they were 17% too tall before);
//   north face: the 2018 Purdue photo (reference/purdue-photos/walc-news-plant-wilmeth-now2LO.jpg), cross-ratio along the face, east half mirrored.
// Massing: two 3-storey brick pavilions under clay-tile hips joined on the west by a gabled bar (7 glazed bays between limestone piers over an open colonnade),
// a flat-roofed block with a glazed monitor in the middle, stair towers and a low lobe on the east, a 3-sided bay on the south.
// One mesh per material; near (detail) / far (textured boxes) LOD; roofs always drawn.
import { CanvasTexture, CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, NoColorSpace, RepeatWrapping, SphereGeometry, SRGBColorSpace, TextureLoader, Vector2 } from 'three';
import { Bucket, ring, offset, cap } from './facades.js';

const BASE = import.meta.env.BASE_URL + 'campus/walk/walc/';
const FAR = 140;
// ---- measured levels (m) ----
const TOP = 16.55, YE = 17.0, SL = 0.42, YF = 16.2, YL = 7.2, DECK = 0.24; // pavilion wall top = soffit, tile edge, hip pitch (22.8 deg), flat roof, lobe roof, plaza deck
const BANDS = [[0, 1.0, 0.08], [4.8, 5.35, 0.09], [14.5, 14.72, 0.05], [15.75, TOP, 0.06]]; // limestone plinth, belt, string at the 3rd-floor heads, frieze: [y0, y1, proud]
const HIPS = [{ X0: 41.4, X1: 101.0, Z0: -56.05, Z1: -33.0, notch: [65.5, 67.95, -38.0] }, { X0: 41.5, X1: 101.0, Z0: 5.45, Z1: 30.55, notch: [66.8, 74.4, 10.5] }]; // roof edges; notch [x0, x1, z depth] cut into the inner slope
const BAR = { xw: 45.2, yw: 16.0, xs: 43.95, xr: 54.4, xe: 60.3, s: 0.41 }; // west bar gable: eave x / height, stair-bay eave x, ridge x, east edge x, pitch
const COLX = 48.4, PD = 0.7, PW = 1.08, CZ0 = -28.1, CZ1 = 7.5, PITCH = (CZ1 - CZ0) / 7, STORE = 2.2, TOPC = 15.6; // colonnade: glazing plane, pier depth/width, z range, bay pitch 5.086 m, storefront recess, soffit
const IX = 89.5, EX = 99.9, LX = 95.9; // inner block east wall, tower / wing east faces, lobe east wall
// wall footprint, interior on the left (outward normal = (dz, -dx))
const RING = [[43.4, -54.5], [98.9, -54.5], [98.9, -36.4], [EX, -36.4], [EX, -27.6], [EX, -21.75], [LX, -21.75], [LX, 0.9], [EX, 0.9], [EX, 7.5], [EX, 16.25], [98.9, 16.25], [98.9, 28.6],
  [63.4, 28.6], [59.0, 33.3], [48.9, 33.3], [44.5, 28.6], [43.5, 28.6], [43.5, 7.5], [COLX, 7.5], [COLX, CZ0], [46.0, CZ0], [46.0, -35.0], [43.4, -35.0]];
const pierU = (k) => Math.max(0, Math.min(CZ1 - CZ0, k * PITCH)); // pier centres along the colonnade, from the south end
// collision (walk.js): the footprint with the open colonnade walkway carved out, plus the free-standing piers; floor = plaza deck under the colonnade
export const WALC_SOLIDS = [RING.map((p) => (p[0] === COLX ? [COLX + STORE, p[1]] : p)), ...[1, 2, 3, 4, 5, 6].map((k) => { const z = CZ1 - k * PITCH; return [[COLX - PD, z - PW / 2], [COLX, z - PW / 2], [COLX, z + PW / 2], [COLX - PD, z + PW / 2]]; })];
export const walcFloor = (x, z) => (x > 45.9 && x < COLX + STORE + 0.1 && z > CZ0 - 0.1 && z < CZ1 + 0.1 ? DECK : undefined);

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const cv = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const tex = (c, srgb = true) => { const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = SRGBColorSpace; return t; };

// ---------- generated textures (small, runtime) ----------
function innerTexture() { // interior seen through the glazing, 6 x 6 m: dim rooms, ceiling light strips, a few lit bays
  const c = cv(256, 256), g = c.getContext('2d');
  g.fillStyle = '#211e1b'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${150 + rnd() * 90 | 0},${130 + rnd() * 70 | 0},${95 + rnd() * 50 | 0},${0.05 + rnd() * 0.12})`; g.fillRect(rnd() * 256, rnd() * 256, 20 + rnd() * 60, 30 + rnd() * 70); }
  for (let r = 0; r < 4; r++) { g.fillStyle = 'rgba(255,226,170,.55)'; for (let k = 0; k < 7; k++) g.fillRect(k * 37 + 6, r * 64 + 8, 22, 2); g.fillStyle = 'rgba(8,7,6,.6)'; g.fillRect(0, r * 64 + 58, 256, 6); }
  return tex(c);
}
function flatTexture(base, speck) { // membrane / gravel, 6 m tile
  const c = cv(256, 256), g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { g.fillStyle = rnd() < 0.5 ? `rgba(255,255,255,${speck})` : `rgba(0,0,0,${speck})`; g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 3, 1 + rnd() * 3); }
  if (speck < 0.1) { g.fillStyle = 'rgba(0,0,0,.22)'; for (let k = 0; k < 2; k++) g.fillRect(0, k * 128, 256, 2); g.fillStyle = 'rgba(210,205,190,.10)'; for (let i = 0; i < 5; i++) g.fillRect(rnd() * 200, rnd() * 240, 30 + rnd() * 50, 4 + rnd() * 8); }
  return tex(c);
}
function farTexture() { // one 5.08 m bay x one storey of brick wall with a paired window, for the distant boxes
  const w = 128, h = 128, c = cv(w, h), g = c.getContext('2d');
  g.fillStyle = '#8c6657'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,25,18,.2)' : 'rgba(200,120,95,.15)'; g.fillRect(rnd() * w, rnd() * h, 6, 2); }
  g.fillStyle = '#ddd5bf'; g.fillRect(20, 30, 88, 66); g.fillRect(0, 118, w, 8); g.fillStyle = '#2c3338'; g.fillRect(24, 36, 38, 54); g.fillRect(68, 36, 36, 54);
  return tex(c);
}
function letterTexture() { // the name over the colonnade: dark bronze letters, transparent ground; 4096 px over 20.6 m (about 200 px/m)
  const c = cv(4096, 128), g = c.getContext('2d'), s = 'THOMAS S. AND HARVEY D. WILMETH ACTIVE LEARNING CENTER';
  g.font = '600 130px "Helvetica Neue", Helvetica, Arial, sans-serif'; g.textBaseline = 'alphabetic'; g.fillStyle = '#2b2622';
  try { g.letterSpacing = '4px'; } catch { /* older canvases: default spacing */ }
  const w = g.measureText(s).width; g.setTransform(4080 / w, 0, 0, 1, 8, 0); g.fillText(s, 0, 111);
  const t = tex(c); t.anisotropy = 16; return t;
}

function materials() {
  const std = (o) => new MeshStandardMaterial({ side: DoubleSide, ...o });
  const load = (u, srgb = true) => { const t = new TextureLoader().load(BASE + u); t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 8; t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace; return t; };
  const bn = load('brick-n.jpg', false), rn = load('roof-tile-n.jpg', false), rt = load('roof-tile.jpg'), ns = (v) => new Vector2(v, v);
  return {
    brick: std({ map: load('brick-hifi.jpg'), normalMap: bn, normalScale: ns(0.9), roughness: 0.93 }),
    diaper: std({ map: load('brick-diaper.jpg'), normalMap: bn, normalScale: ns(0.9), roughness: 0.93 }),
    stone: std({ map: load('limestone-hifi.jpg'), roughness: 0.82 }),
    roof: std({ map: rt, normalMap: rn, normalScale: ns(1.3), roughness: 0.8, name: 'tile' }),
    ridge: std({ map: rt, color: 0xfff0e6, roughness: 0.8, name: 'tile-trim' }), // ridge / hip caps and eave tile ends (not 'tile': tools/walc-holes.mjs only tests roof planes)
    flat: std({ map: flatTexture('#55585b', 0.05), roughness: 0.92 }), // dark grey membrane (Apple frames: 121,121,120 sunlit)
    gravel: std({ map: flatTexture('#8f857e', 0.16), roughness: 1 }), // ballasted lobe roof (154,143,137 sunlit)
    pave: std({ map: flatTexture('#b9b2a4', 0.07), roughness: 0.95 }),
    dark: std({ color: 0x2a2623, roughness: 0.6, metalness: 0.3 }), // bronze-brown soffits, fascias, rafter tails, brackets
    frame: std({ color: 0x33302c, roughness: 0.45, metalness: 0.55 }), // dark bronze window frames
    steel: std({ color: 0x4a4f4e, roughness: 0.4, metalness: 0.7 }),
    canopy: std({ color: 0x74b9b3, emissive: 0x0f2a28, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.7, depthWrite: false }), // teal glass canopies (31,49,57 shade / 180,191,190 sun)
    inner: std({ map: innerTexture(), emissive: 0xffc890, emissiveMap: innerTexture(), emissiveIntensity: 0.22, roughness: 1 }),
    glass: std({ vertexColors: true, roughness: 0.05, metalness: 0.6, envMapIntensity: 1.3, transparent: true, opacity: 0.72, depthWrite: false }),
    letters: std({ map: letterTexture(), transparent: true, alphaTest: 0.4, roughness: 0.5, metalness: 0.5 }),
    far: std({ map: farTexture(), roughness: 0.9 }),
  };
}

export async function buildWalc(G) {
  seed = 7;
  const M = materials(), buckets = new Map();
  const bk = (key, mat, colored, sx = 1) => { const b = new Bucket(mat, colored); b.sx = b.sy = sx; buckets.set(key, b); return b; };
  const W = bk('brick', M.brick, false, 1 / 2.4384), WD = bk('diaper', M.diaper, false, 1 / 2.4384), S = bk('stone', M.stone, false, 1 / 1.6), RF = bk('roof', M.roof), RC = bk('ridge', M.ridge), TE = bk('tile-ends', M.ridge),
    DK = bk('dark', M.dark), TL = bk('tails', M.dark), FD = bk('frame', M.frame), ST = bk('steel', M.steel), CG = bk('canopy', M.canopy), GL = bk('glass', M.glass, true), IN = bk('inner', M.inner, false, 1 / 6),
    FL = bk('flat', M.flat, false, 1 / 6), GV = bk('gravel', M.gravel, false, 1 / 4), PV = bk('pave', M.pave, false, 1 / 3), TX = bk('letters', M.letters), FW = bk('far', M.far), MG = bk('mglass', M.glass, true), MF = bk('mframe', M.frame);
  const ROOT = new Set(['roof', 'ridge', 'flat', 'gravel', 'dark', 'mglass', 'mframe']); // always visible
  const tint = () => { const v = 0.55 + rnd() * 0.5; return [0.10 * v, 0.14 * v, 0.17 * v]; };
  const uvq = (B, p) => p.map(([u, v]) => [u * B.sx, v * B.sy]);

  // ---------- face-local drawing: u along the wall, v = height, o = offset along the outward normal ----------
  const face = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), tx = dx / L, tz = dz / L; return { a, b, L, uo: (a[0] + a[1]) % 2.4384, P: (u, y, o = 0) => [a[0] + tx * u + tz * o, y, a[1] + tz * u - tx * o] }; };
  const rect = (F, B, u0, v0, u1, v1, o = 0, col) => B.q(F.P(u0, v0, o), F.P(u0, v1, o), F.P(u1, v1, o), F.P(u1, v0, o), col, uvq(B, [[u0 + F.uo, v0], [u0 + F.uo, v1], [u1 + F.uo, v1], [u1 + F.uo, v0]]));
  const side = (F, B, u, v0, v1, o0, o1) => B.q(F.P(u, v0, o0), F.P(u, v1, o0), F.P(u, v1, o1), F.P(u, v0, o1), null, uvq(B, [[o0, v0], [o0, v1], [o1, v1], [o1, v0]]));
  const ledge = (F, B, u0, u1, v, o0, o1) => B.q(F.P(u0, v, o0), F.P(u0, v, o1), F.P(u1, v, o1), F.P(u1, v, o0), null, uvq(B, [[u0, o0], [u0, o1], [u1, o1], [u1, o0]]));
  const box = (F, B, u0, v0, u1, v1, o0, o1, f = 'flrtb') => { // f: front (at o1), left (u0), right (u1), top, bottom, k = back (at o0)
    if (f.includes('f')) rect(F, B, u0, v0, u1, v1, o1); if (f.includes('k')) rect(F, B, u0, v0, u1, v1, o0);
    if (f.includes('l')) side(F, B, u0, v0, v1, o0, o1); if (f.includes('r')) side(F, B, u1, v0, v1, o0, o1);
    if (f.includes('t')) ledge(F, B, u0, u1, v1, o0, o1); if (f.includes('b')) ledge(F, B, u0, u1, v0, o0, o1);
  };
  // wall sheet with rectangular holes [u0, v0, u1, v1]
  const panel = (F, B, u0, v0, u1, v1, holes = [], o = 0) => {
    const cut = (a, lo, hi) => [...new Set([lo, hi, ...a.filter((x) => x > lo + 1e-6 && x < hi - 1e-6)])].sort((x, y) => x - y);
    const us = cut(holes.flatMap((h) => [h[0], h[2]]), u0, u1), vs = cut(holes.flatMap((h) => [h[1], h[3]]), v0, v1);
    for (let j = 0; j < vs.length - 1; j++) {
      const vc = (vs[j] + vs[j + 1]) / 2; let s = null;
      for (let i = 0; i < us.length; i++) {
        const uc = (us[i] + us[i + 1]) / 2, open = i === us.length - 1 || holes.some((h) => uc > h[0] && uc < h[2] && vc > h[1] && vc < h[3]);
        if (!open && s === null) s = us[i];
        if (open && s !== null) { rect(F, B, s, vs[j], us[i], vs[j + 1], o); s = null; }
      }
    }
  };
  const band = (F, v0, v1, pr, holes = []) => { // limestone course standing proud, broken where an opening crosses it
    let u = 0;
    for (const h of [...holes.filter((q) => q[1] < v1 - 0.01 && q[3] > v0 + 0.01).sort((a, b) => a[0] - b[0]), [F.L, 0, F.L, 0]]) { if (h[0] > u + 0.01) box(F, S, u, v0, h[0], v1, 0, pr); u = Math.max(u, h[2]); }
  };
  // one framed light: glass, bronze frame with returns, muntins. rows = count or fractions of the height
  const light = (F, a, s0, b, s1, o, pc, rows, door) => {
    const fw = 0.055, fd = 0.07;
    rect(F, GL, a, s0, b, s1, o, tint());
    box(F, FD, a, s0, a + fw, s1, o, o + fd, 'fr'); box(F, FD, b - fw, s0, b, s1, o, o + fd, 'fl'); box(F, FD, a + fw, s1 - fw, b - fw, s1, o, o + fd, 'fb'); box(F, FD, a + fw, s0, b - fw, s0 + fw, o, o + fd, 'ft');
    const gw = (b - a - 2 * fw) / pc, H = s1 - s0 - 2 * fw, fr = Array.isArray(rows) ? rows : Array(rows).fill(1 / rows);
    for (let i = 1; i < pc; i++) box(F, FD, a + fw + i * gw - 0.02, s0 + fw, a + fw + i * gw + 0.02, s1 - fw, o, o + 0.045, 'flr');
    let y = s0 + fw;
    for (let j = 0; j < fr.length - 1; j++) { y += fr[j] * H; box(F, FD, a + fw, y - 0.02, b - fw, y + 0.02, o, o + 0.04, 'ftb'); }
    if (door) { // glass door leaves: bottom rail, head rail at 2.3 m, push bars
      const m = (a + b) / 2;
      box(F, ST, a + fw, s0 + fw, b - fw, s0 + 0.3, o, o + 0.06, 'ft'); box(F, ST, a + fw, s0 + 2.25, b - fw, s0 + 2.37, o, o + 0.08, 'ftb'); box(F, ST, m - 0.05, s0 + fw, m + 0.05, s0 + 2.25, o, o + 0.08, 'flr');
      for (const q of [-1, 1]) box(F, ST, m + q * 0.14 - 0.02, s0 + 0.9, m + q * 0.14 + 0.02, s0 + 1.35, o + 0.08, o + 0.14, 'flrtb');
    }
  };
  // opening: reveals with depth, limestone sill and lintel, limestone mullions between lights, limestone transoms, framed lights
  const win = (F, h, q = {}) => {
    const [u0, v0, u1, v1] = h, d = q.d ?? 0.24, n = q.lights ?? 1, mw = q.mw ?? 0.3, o0 = q.o ?? 0, RB = q.reveal ?? W;
    side(F, RB, u0, v0, v1, o0 - d, o0); side(F, RB, u1, v0, v1, o0 - d, o0); ledge(F, RB, u0, u1, v1, o0 - d, o0);
    if (q.sill === false) ledge(F, S, u0, u1, v0, o0 - d, o0);
    else { ledge(F, S, u0 - 0.06, u1 + 0.06, v0, o0 - d, o0 + 0.07); rect(F, S, u0 - 0.06, v0 - 0.14, u1 + 0.06, v0, o0 + 0.07); ledge(F, S, u0 - 0.06, u1 + 0.06, v0 - 0.14, o0, o0 + 0.07); }
    if (q.lintel) box(F, S, u0 - 0.14, v1, u1 + 0.14, v1 + 0.26, o0, o0 + 0.04, 'fblr');
    if (q.jambs !== false) { box(F, S, u0 - 0.14, v0, u0, v1, o0, o0 + 0.03, 'fl'); box(F, S, u1, v0, u1 + 0.14, v1, o0, o0 + 0.03, 'fr'); } // limestone surround (cream frames in the Apple frames)
    const lw = (u1 - u0 - (n - 1) * mw) / n, segs = []; let lo = v0;
    for (const [t0, t1] of q.trans ?? []) { segs.push([lo, t0]); box(F, S, u0, t0, u1, t1, o0 - d, o0 + 0.02, 'ftb'); lo = t1; }
    segs.push([lo, v1]);
    for (let i = 0; i < n; i++) {
      const a = u0 + i * (lw + mw);
      if (i) box(F, S, a - mw, v0, a, v1, o0 - d, o0 + 0.02, 'flr');
      segs.forEach(([s0, s1], k) => light(F, a, s0, a + lw, s1, o0 - d, q.pc ?? 2, Array.isArray(q.pr) ? q.pr[k] ?? 2 : q.pr ?? 3, q.door && k === 0));
    }
    return h;
  };
  const pipe = (F, u, v0, v1, o = 0) => { box(F, DK, u - 0.06, v0, u + 0.06, v1 - 0.5, o, o + 0.13, 'flr'); box(F, DK, u - 0.16, v1 - 0.5, u + 0.16, v1, o, o + 0.22, 'flrb'); }; // square downpipe with a leader head
  // wall around the openings: brick (diaper bond between belt and string on the west pavilion faces), limestone courses, interior backdrop, far-LOD sheet
  const shell = (F, holes, q = {}) => {
    const y0 = q.y0 ?? 0, top = q.top ?? TOP;
    if (q.diaper) { panel(F, W, 0, y0, F.L, 5.35, holes); panel(F, WD, 0, 5.35, F.L, 14.5, holes); panel(F, W, 0, 14.5, F.L, top, holes); } else panel(F, q.mat ?? W, 0, y0, F.L, top, holes);
    for (const [v0, v1, pr] of q.bands ?? BANDS) if (v0 >= y0 - 0.01 && v1 <= top + 0.01) band(F, v0, v1, pr, holes);
    if (q.coping) box(F, S, 0, top, F.L, top + 0.1, -0.3, 0.1, 'fktb');
    if (holes.length) rect(F, IN, 0, y0, F.L, top, -(q.bd ?? 0.9));
    FW.q(F.P(0, y0), F.P(0, top), F.P(F.L, top), F.P(F.L, y0), null, [[0, 0], [0, (top - y0) / 5.2], [F.L / PITCH, (top - y0) / 5.2], [F.L / PITCH, 0]]);
    for (const u of q.pipes ?? []) pipe(F, u, 0.3, top - 0.9);
    return F;
  };
  // standard pavilion face: bays {c, w, n lights, g: ground 'win' | 'door' | 'none'} on three floors (levels shared by every measured face)
  const pav = (F, bays, q = {}) => {
    const holes = [];
    for (const b of bays) {
      const u0 = b.c - b.w / 2, u1 = b.c + b.w / 2, n = b.n ?? 1, g = b.g ?? 'win';
      if (g !== 'none') holes.push(win(F, [u0, g === 'door' ? 0.12 : 1.0, u1, 4.6], { lights: n, trans: [[3.85, 4.2]], pr: [2, 1], sill: g !== 'door', door: g === 'door' }));
      holes.push(win(F, [u0, 7.4, u1, 9.95], { lights: n, lintel: true }), win(F, [u0, 12.0, u1, 14.5], { lights: n }));
    }
    return shell(F, holes, q);
  };
  const stairWin = (c, v0, v1, tr) => (F) => {
    for (let k = 0, y = 0.3; y < v1 - 1; k++, y += 1.75) { // stair flights and handrails seen through the glass
      const a = c + (k % 2 ? 1.5 : -1.5), b = c - (k % 2 ? 1.5 : -1.5);
      for (const [dy, t, B] of [[0, 0.22, S], [1.0, 0.05, ST]]) B.q(F.P(a, y + dy, -1.1), F.P(b, y + dy + 1.75, -1.1), F.P(b, y + dy + 1.75 + t, -1.1), F.P(a, y + dy + t, -1.1));
    }
    return win(F, [c - 1.8, v0, c + 1.8, v1], { lights: 2, mw: 0.45, trans: tr, pr: 2 });
  }; // tall two-light stair window with limestone transoms
  // glass canopy on the face: flat teal glass in a steel frame, two tie rods
  const canopy = (F, u0, u1, v, o0, o1) => {
    CG.q(F.P(u0, v, o0), F.P(u0, v, o1), F.P(u1, v, o1), F.P(u1, v, o0));
    box(F, ST, u0, v - 0.1, u1, v + 0.04, o1 - 0.06, o1, 'fktb'); box(F, ST, u0, v - 0.1, u0 + 0.06, v + 0.04, o0, o1, 'lrb'); box(F, ST, u1 - 0.06, v - 0.1, u1, v + 0.04, o0, o1, 'lrb');
    for (const u of [u0 + 0.05, u1 - 0.05]) ST.q(F.P(u - 0.02, v, o1 - 0.1), F.P(u + 0.02, v, o1 - 0.1), F.P(u + 0.02, v + 1.5, o0 + 0.02), F.P(u - 0.02, v + 1.5, o0 + 0.02));
  };
  const R = RING, E = (i) => face(R[i], R[(i + 1) % R.length]);

  // ---------- pavilion and service faces ----------
  { // north face (photo-measured): end bays of two narrow singles, a slit window, and a centre section standing 0.3 m proud with four tall three-light windows
    const F = E(0), holes = [];
    for (const c of [2.6, 5.5, 50.0, 52.9]) holes.push(win(F, [c - 0.6, 1.0, c + 0.6, 4.6], { trans: [[3.85, 4.2]], pr: [2, 1], pc: 1 }), win(F, [c - 0.6, 7.4, c + 0.6, 9.95], { lintel: true, pc: 1 }), win(F, [c - 0.6, 12.0, c + 0.6, 14.5], { pc: 1 }));
    for (const c of [14.5, 41.0]) holes.push(win(F, [c - 0.4, 7.0, c + 0.4, 14.5], { pc: 1, pr: 7 }));
    holes.push([15.5, 0, 40.0, TOP]); shell(F, holes, { pipes: [11.5, 44.0] });
    const C = face([R[0][0] + 15.5, R[0][1] - 0.3], [R[0][0] + 40.0, R[0][1] - 0.3]), ch = [];
    for (const c of [4.6, 9.7, 14.8, 19.9]) ch.push(win(C, [c - 1.35, 6.8, c + 1.35, 14.5], { lights: 3, mw: 0.12, pc: 1, pr: 8, d: 0.3 }), win(C, [c - 1.35, 1.0, c + 1.35, 4.6], { lights: 2, mw: 0.2, trans: [[3.85, 4.2]], pr: [2, 1], pc: 1 }));
    shell(C, ch, { bd: 1.2, pipes: [0.25, 12.25, 24.25] }); side(C, W, 0, 0, TOP, -0.3, 0); side(C, W, C.L, 0, TOP, -0.3, 0);
    box(C, S, 0, 15.2, C.L, 15.75, 0, 0.12, 'ftblr'); // stepped limestone cornice over the tall windows
  }
  pav(E(1), [3.1, 6.3, 13.1, 16.3].map((c) => ({ c, w: 1.5 })), { pipes: [0.3] }); // north pavilion, east face: four singles (east-mid)
  shell(E(2), []); // stair tower north return
  { const F = E(3); shell(F, [stairWin(4.1, 3.9, 14.35, [[6.4, 6.6], [8.8, 9.4], [11.8, 12.0]])(F)], { bands: [BANDS[0], BANDS[1], [14.6, 14.95, 0.05]], bd: 2 }); } // north stair tower (flat-roofed south of the hip)
  const portal = (F) => { // lobe entrance wing: limestone surround, glazed doors, glass canopy
    const h = win(F, [0.9, 0.12, F.L - 0.9, 4.2], { lights: 2, mw: 0.12, sill: false, door: true, trans: [[2.9, 3.0]], pr: [1, 1], pc: 2, reveal: S });
    shell(F, [h], { top: 7.5, mat: S, bands: [], coping: true, bd: 2 }); canopy(F, 0.7, F.L - 0.7, 4.45, 0, 1.9);
  };
  portal(E(4)); shell(E(5), [], { top: 7.5, bands: [BANDS[0], BANDS[1]], coping: true });
  { const F = E(6), holes = [4.35, 9.5, 14.65].map((u) => win(F, [u, 2.75, u + 4.12, 4.05], { lights: 3, mw: 0.25, pr: 2, pc: 2, lintel: true })); shell(F, holes, { top: 7.5, bands: [[0, 1.7, 0.08], BANDS[1]], coping: true }); } // lobe east face: three ribbon windows
  shell(E(7), [], { top: 7.5, bands: [BANDS[0], BANDS[1]], coping: true }); portal(E(8));
  for (const [a, b] of [[[EX, -21.6], [EX + 0.7, -21.6]], [[EX + 0.7, -21.6], [EX + 0.7, 0.75]], [[EX + 0.7, 0.75], [EX, 0.75]]]) { const F = face(a, b); panel(F, W, 0, 0, F.L, 1.1); panel(F, W, 0, 0, F.L, 1.1, [], -0.3); box(F, S, 0, 1.1, F.L, 1.2, -0.36, 0.06, 'fktb'); } // low garden wall between the two entrance wings
  { const F = E(9); shell(F, [stairWin(4.6, 3.9, 14.35, [[6.4, 6.6], [8.8, 9.4], [11.8, 12.0]])(F)], { bands: [BANDS[0], BANDS[1], [14.6, 14.95, 0.05]], bd: 2 }); } // south stair tower, under the hip
  shell(E(10), []);
  { const F = pav(E(11), [{ c: 1.15, w: 1.4 }, { c: 5.45, w: 5.0, n: 3, g: 'door' }, { c: 10.35, w: 1.4 }], { pipes: [12.0] }); canopy(F, 2.7, 8.2, 4.68, 0, 2.0); } // south pavilion east face: single, triple over the east entrance, single
  { // south face: eight singles on the upper floors (six + two), service ground floor with louvre, dock door and canopy, two tall doors
    const F = E(12), holes = [], xs = [68.7, 71.95, 75.1, 78.25, 81.5, 84.7, 94.5, 97.1].map((x) => 98.9 - x);
    for (const c of xs) holes.push(win(F, [c - 0.75, 7.4, c + 0.75, 9.95], { lintel: true }), win(F, [c - 0.75, 12.0, c + 0.75, 14.5]));
    for (const c of xs.slice(6)) holes.push(win(F, [c - 0.75, 0.12, c + 0.75, 4.6], { sill: false, door: true, trans: [[2.5, 2.7]], pr: [1, 2], pc: 2 }));
    const lv = [98.9 - 69.5, 3.1, 98.9 - 67.0, 4.5], dock = [98.9 - 76.5, 0.1, 98.9 - 72.5, 2.9]; holes.push(lv, dock);
    box(F, DK, lv[0], lv[1], lv[2], lv[3], -0.2, -0.1, 'f'); for (let y = 3.2; y < 4.45; y += 0.16) box(F, ST, lv[0], y, lv[2], y + 0.03, -0.1, 0, 'ftb'); // louvre
    box(F, ST, dock[0], dock[1], dock[2], dock[3], -0.3, -0.2, 'f'); for (let y = 0.4; y < 2.8; y += 0.3) box(F, DK, dock[0], y, dock[2], y + 0.02, -0.2, -0.18, 'f'); // roller door
    for (const h of [lv, dock]) { side(F, W, h[0], h[1], h[3], -0.3, 0); side(F, W, h[2], h[1], h[3], -0.3, 0); ledge(F, W, h[0], h[2], h[3], -0.3, 0); }
    shell(F, holes, { pipes: [98.9 - 86.6, 98.9 - 64.9] }); canopy(F, 98.9 - 77.1, 98.9 - 71.6, 3.3, 0, 2.2);
  }
  { // south bay (bulge): tall four-tier windows, two on the south face and one on each splay; flat roof at 16.05 behind a coped parapet
    const tall = (F, c) => win(F, [c - 1.33, 5.5, c + 1.33, 14.45], { lights: 2, trans: [[7.0, 7.55], [9.3, 9.55], [11.75, 12.3]], pr: 2 });
    const bb = [[0, 1.3, 0.08], [4.95, 5.5, 0.09], [14.55, 14.9, 0.05]];
    for (const [i, cs] of [[13, [0.5]], [14, [3.15, 7.25]], [15, [0.5]]]) { const F = E(i); shell(F, cs.map((c) => tall(F, c < 1 ? F.L * c : c)), { top: 16.15, bands: bb, coping: true, bd: 1.5 }); }
    shell(E(16), []); shell(face(R[13], R[16]), [], { y0: 16.05, bands: [] }); // short return west of the bay; pavilion wall above the bay roof
  }
  pav(E(17), [2.7, 7.75, 12.8, 17.85].map((c) => ({ c, w: 3.3, n: 2 })), { diaper: true, pipes: [0.3, 20.8] }); // south pavilion west face: four pairs (west-mid, Street View)
  shell(E(18), [], { pipes: [] }); // south pavilion north return at the colonnade
  shell(E(20), [], { top: TOPC, bands: [BANDS[0], BANDS[1]] }); // stair bay south return
  { const F = E(21); shell(F, [stairWin(4.17, 3.6, 13.25, [[5.9, 6.05], [8.4, 8.85], [10.9, 11.05]])(F)], { top: 15.1, bands: [BANDS[0], BANDS[1]], bd: 2 }); } // stair bay west face
  shell(E(22), []);
  pav(E(23), [{ c: 3.1, w: 1.4 }, { c: 7.2, w: 3.4, n: 2 }, { c: 12.25, w: 3.4, n: 2 }, { c: 16.4, w: 1.4 }], { diaper: true, pipes: [0.3, 19.2] }); // north pavilion west face: single, pair, pair, single (west-mid)
  // walls standing on the lobe roof: inner block east face (pair + six triples on two floors, east-mid), stair strip south face, south pavilion north face
  { const F = face([IX, -27.6], [IX, 7.5]), holes = [];
    for (let k = 0; k < 7; k++) { const u = k < 6 ? 0.3 + k * 5.11 : 30.7, w = k < 6 ? 4.1 : 2.5, n = k < 6 ? 3 : 2; holes.push(win(F, [u, 8.0, u + w, 10.3], { lights: n, mw: 0.28, lintel: true }), win(F, [u, 12.6, u + w, 14.95], { lights: n, mw: 0.28, lintel: true })); }
    shell(F, holes, { y0: YL, bands: [[15.2, 15.4, 0.04]], coping: true }); }
  shell(face([EX, -27.6], [IX, -27.6]), [], { y0: YL, bands: [], coping: true }); shell(face([IX, 7.5], [EX, 7.5]), [], { y0: YL, bands: [[14.5, 14.72, 0.05], BANDS[3]] });

  // ---------- west bar: seven glazed bays between limestone piers over the colonnade ----------
  {
    const C = E(19), L = C.L;
    box(C, S, 0, 4.85, L, 6.6, 0, PD, 'ftb'); rect(C, S, 0, 4.6, L, 4.85, 0); // frieze beam, flush with the pier faces (the lettering runs across the piers)
    TX.q(C.P(28.1, 5.58, PD + 0.02), C.P(28.1, 6.12, PD + 0.02), C.P(7.5, 6.12, PD + 0.02), C.P(7.5, 5.58, PD + 0.02), null, [[0, 0], [0, 1], [1, 1], [1, 0]]); // z -20.6..0.0, cap height 0.45 m
    for (let k = 0; k <= 7; k++) {
      const uc = pierU(k), u0 = Math.max(0, uc - PW / 2), u1 = Math.min(L, uc + PW / 2);
      box(C, S, u0, 6.6, u1, TOPC, 0, PD, 'flr'); box(C, S, u0, 0, u1, 4.85, 0, PD, 'flrk'); box(C, S, u0 - 0.07, 0, u1 + 0.07, 0.95, -0.07, PD + 0.07, 'flrkt'); // upper pier, free-standing column, base block
      box(C, S, u0 - 0.05, 14.1, u1 + 0.05, 14.3, 0, PD + 0.05, 'flrtb'); // necking under the brackets
      for (const q of [-0.27, 0.27]) { // paired bronze brackets carrying the eave
        const ub = Math.max(0.08, Math.min(L - 0.08, uc + q));
        box(C, DK, ub - 0.07, 14.35, ub + 0.07, TOPC, PD, PD + 0.28, 'flrb'); box(C, DK, ub - 0.07, 15.34, ub + 0.07, TOPC, PD + 0.28, PD + 2.3, 'flrb');
        for (const s of [-0.07, 0.07]) DK.q(C.P(ub + s, 14.4, PD + 0.28), C.P(ub + s, 14.62, PD + 0.28), C.P(ub + s, 15.34, PD + 1.7), C.P(ub + s, 15.34, PD + 1.45));
        DK.q(C.P(ub - 0.07, 14.4, PD + 0.28), C.P(ub + 0.07, 14.4, PD + 0.28), C.P(ub + 0.07, 15.34, PD + 1.45), C.P(ub - 0.07, 15.34, PD + 1.45));
      }
    }
    for (let k = 0; k < 7; k++) {
      const ua = pierU(k) + PW / 2, ub = pierU(k + 1) - PW / 2, g = -0.15, cs = 0.2, mw = 0.22, lw = (ub - ua - 2 * cs - mw) / 2;
      // bronze window unit 6.6..13.7 (Street View): casing, centre mullion, transom bar at 11.15, lights of 2 panes with short top and bottom rows
      box(C, FD, ua, 6.6, ua + cs, 13.7, g, 0.12, 'frt'); box(C, FD, ub - cs, 6.6, ub, 13.7, g, 0.12, 'flt'); box(C, FD, ua + cs, 13.5, ub - cs, 13.7, g, 0.12, 'fbt'); box(C, FD, ua + cs, 6.6, ub - cs, 6.8, g, 0.12, 'ft');
      box(C, FD, ua + cs + lw, 6.8, ua + cs + lw + mw, 13.5, g, 0.12, 'flr'); box(C, FD, ua + cs, 11.04, ub - cs, 11.26, g, 0.16, 'ftb');
      for (const a of [ua + cs, ua + cs + lw + mw]) { light(C, a, 6.8, a + lw, 11.04, g, 2, [0.11, 0.78, 0.11]); light(C, a, 11.26, a + lw, 13.5, g, 2, [0.3, 0.7]); }
      rect(C, FD, ua, 13.7, ub, TOPC, 0.05); for (let i = 1; i < 4; i++) box(C, DK, ua + (i * (ub - ua)) / 4 - 0.04, 13.7, ua + (i * (ub - ua)) / 4 + 0.04, TOPC, 0.05, 0.16, 'flr'); // bronze spandrel with ribs under the soffit
      // ground floor: storefront set back behind the colonnade, entrance doors in the south bay (Street View), glass canopy between the piers
      const sa = pierU(k), sb = pierU(k + 1), n = 3, w = (sb - sa) / n;
      for (let i = 0; i < n; i++) light(C, sa + i * w, DECK, sa + (i + 1) * w, 4.3, -STORE, 1, [0.72, 0.28], k === 0 && i === 1);
      canopy(C, ua + 0.06, ub - 0.06, 3.95, 0, PD + 1.7);
    }
    box(C, FD, 0, 4.3, L, 4.6, -STORE - 0.1, -STORE + 0.06, 'fb'); ledge(C, DK, 0, L, 4.6, -STORE, 0); // storefront head, walkway ceiling
    side(C, W, 0, 0, 4.6, -STORE, 0); side(C, W, L, 0, 4.6, -STORE, 0);
    rect(C, IN, 0, 0, L, 4.6, -STORE - 2.5); rect(C, IN, 0, 4.6, L, TOPC, -3.2); // interior: ground-floor lobby, two-storey reading room
    FW.q(C.P(0, 0), C.P(0, TOPC), C.P(L, TOPC), C.P(L, 0), null, [[0, 0], [0, 3], [7, 3], [7, 0]]);
  }

  // ---------- roofs ----------
  const V = (x, y, z) => [x, y, z], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = (a) => Math.hypot(a[0], a[1], a[2]);
  const along = (a, d, t) => [a[0] + d[0] * t, a[1] + d[1] * t, a[2] + d[2] * t], unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // clay-tile slope: convex polygon (first two points on the eave), uv in tile metres (4.0 m across, 5.92 m up the slope per texture)
  const tiles = (pts, o = pts[0], e = unit(sub(pts[1], pts[0]))) => { // o, e: shared origin and eave direction, so pieces of one slope keep one tile grid
    const n = unit(cross(sub(pts[1], pts[0]), sub(pts[pts.length - 1], pts[0]))), s0 = unit(cross(n, e)), s = s0[1] < 0 ? s0.map((v) => -v) : s0;
    const uv = (p) => [dot(sub(p, o), e) / 4.0, dot(sub(p, o), s) / 5.92];
    for (let i = 1; i < pts.length - 1; i++) RF.t(pts[0], pts[i], pts[i + 1], [uv(pts[0]), uv(pts[i]), uv(pts[i + 1])]);
  };
  const clip = (pts, ax, lim, keepLess) => { // clip a plan polygon [x, z] by a line x = lim or z = lim
    const out = [], ins = (p) => (keepLess ? p[ax] <= lim : p[ax] >= lim);
    pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; if (ins(p)) out.push(p); if (ins(p) !== ins(q)) { const t = (lim - p[ax]) / (q[ax] - p[ax]); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } });
    return out;
  };
  // half-round clay cap along a ridge or hip, and half-round tile ends along an eave (a: start, b: end, s: up-slope unit)
  const capLine = (a, b, r = 0.15) => {
    const d = unit(sub(b, a)), h = unit(cross(d, [0, 1, 0])), up = unit(cross(h, d));
    const L = len(sub(b, a)), n = Math.max(1, Math.round(L / 0.45)), ring4 = (p, q) => [0, 1, 2, 3, 4].map((k) => along(along(p, h, q * Math.cos((k * Math.PI) / 4)), up, q * Math.sin((k * Math.PI) / 4) - 0.03));
    for (let i = 0; i < n; i++) { // one tapered cap tile per 0.45 m, each lapping the next
      const A = ring4(along(a, d, (i * L) / n), r), B = ring4(along(a, d, Math.min(L, ((i + 1) * L) / n + 0.05)), r * 0.8);
      for (let k = 0; k < 4; k++) RC.q(A[k], B[k], B[k + 1], A[k + 1], null, [[0.02, 0.01], [0.1, 0.01], [0.1, 0.05], [0.02, 0.05]]);
      RC.q(A[0], A[1], A[3], A[4], null, [[0.02, 0.01], [0.03, 0.01], [0.03, 0.02], [0.02, 0.02]]); RC.t(A[1], A[2], A[3], [[0, 0], [0.01, 0], [0, 0.01]]);
    }
  };
  const eaveTiles = (a, b, s) => {
    const e = unit(sub(b, a)), n0 = unit(cross(e, s)), n = n0[1] < 0 ? n0.map((v) => -v) : n0, L = len(sub(b, a)), r = 0.085, uv = [[0.02, 0.01], [0.04, 0.01], [0.04, 0.03], [0.02, 0.03]], N = 5;
    for (let t = 0.1; t < L - 0.05; t += 0.25) {
      const p = along(a, e, t), q = along(along(p, s, 0.32), n, -0.05), arc = (c, k) => along(along(c, e, r * Math.cos((k * Math.PI) / N)), n, r * Math.sin((k * Math.PI) / N));
      for (let k = 1; k < N - 1; k++) TE.t(arc(p, 0), arc(p, k), arc(p, k + 1), uv); TE.t(arc(p, 0), arc(p, N - 1), arc(p, N), uv); for (let k = 0; k < N; k++) TE.q(arc(p, k), arc(q, k), arc(q, k + 1), arc(p, k + 1), null, uv);
    }
  };
  // rafter tails under a soffit: every 0.8 m along a -> b, running inwards (dir) from the fascia
  const tails = (a, b, dir, y, depth) => {
    const e = unit(sub(b, a)), L = len(sub(b, a)), n = Math.max(1, Math.round(L / 0.8));
    for (let i = 0; i <= n; i++) {
      const t = Math.min(L - 0.08, Math.max(0.08, (i * L) / n)), p = along(a, e, t), q = (du, dv, dy) => [p[0] + e[0] * du + dir[0] * dv, y + dy, p[2] + e[2] * du + dir[2] * dv];
      TL.q(q(-0.05, 0.12, -0.2), q(0.05, 0.12, -0.2), q(0.05, depth, -0.2), q(-0.05, depth, -0.2)); TL.q(q(-0.05, 0.12, 0), q(-0.05, 0.12, -0.2), q(-0.05, depth, -0.2), q(-0.05, depth, 0));
      TL.q(q(0.05, depth, 0), q(0.05, depth, -0.2), q(0.05, 0.12, -0.2), q(0.05, 0.12, 0)); TL.q(q(-0.05, 0.04, 0), q(0.05, 0.04, 0), q(0.05, 0.12, -0.2), q(-0.05, 0.12, -0.2)); TL.t(q(-0.05, 0.04, 0), q(-0.05, 0.12, -0.2), q(-0.05, 0.12, 0), [[0, 0], [1, 0], [0, 1]]); TL.t(q(0.05, 0.04, 0), q(0.05, 0.12, -0.2), q(0.05, 0.12, 0), [[0, 0], [1, 0], [0, 1]]);
    }
  };
  const hq = (B, x0, z0, x1, z1, y) => B.q([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0], null, uvq(B, [[x0, z0], [x0, z1], [x1, z1], [x1, z0]])); // horizontal quad
  const vq = (B, a, b, y0, y1) => B.q([a[0], y0, a[1]], [a[0], y1, a[1]], [b[0], y1, b[1]], [b[0], y0, b[1]], null, uvq(B, [[0, y0], [0, y1], [Math.hypot(b[0] - a[0], b[1] - a[1]), y1], [Math.hypot(b[0] - a[0], b[1] - a[1]), y0]])); // vertical quad over a plan segment

  HIPS.forEach((h, hi) => {
    const { X0, X1, Z0, Z1 } = h, hd = (Z1 - Z0) / 2, zc = (Z0 + Z1) / 2, ry = YE + SL * hd, north = hi === 0, [nx0, nx1, nz] = h.notch;
    const yAt = (x, z) => YE + SL * Math.min(x - X0, X1 - x, z - Z0, Z1 - z), P3 = ([x, z]) => V(x, yAt(x, z), z);
    const outer = north ? [[X0, Z0], [X1, Z0], [X1 - hd, zc], [X0 + hd, zc]] : [[X1, Z1], [X0, Z1], [X0 + hd, zc], [X1 - hd, zc]]; // slope facing away from the courtyard
    const inner = north ? [[X1, Z1], [X0, Z1], [X0 + hd, zc], [X1 - hd, zc]] : [[X0, Z0], [X1, Z0], [X1 - hd, zc], [X0 + hd, zc]], ze = north ? Z1 : Z0; // slope with the notch
    tiles(outer.map(P3)); tiles([[X0, Z1], [X0, Z0], [X0 + hd, zc]].map(P3)); tiles([[X1, Z0], [X1, Z1], [X1 - hd, zc]].map(P3));
    const io = P3(inner[0]), ie = unit(sub(P3(inner[1]), io));
    for (const piece of [clip(inner, 0, nx0, true), clip(inner, 0, nx1, false), clip(clip(clip(inner, 0, nx0, false), 0, nx1, true), 1, nz, north)]) if (piece.length > 2) tiles(piece.map(P3), io, ie);
    // notch: side walls, back wall, floor at the flat-roof level
    for (const x of [nx0, nx1]) S.q(V(x, YF, ze), V(x, YF, nz), V(x, yAt(x, nz), nz), V(x, YE, ze)); vq(S, [nx0, nz], [nx1, nz], YF, yAt(nx0, nz)); hq(FL, nx0, Math.min(ze, nz), nx1, Math.max(ze, nz), YF);
    // ridge and hip caps
    capLine(V(X0 + hd, ry, zc), V(X1 - hd, ry, zc)); for (const [cx, cz, rx] of [[X0, Z0, X0 + hd], [X0, Z1, X0 + hd], [X1, Z0, X1 - hd], [X1, Z1, X1 - hd]]) capLine(V(cx, YE, cz), V(rx, ry, zc), 0.13);
    // eave: fascia at the tile edge, flat soffit back to the walls, rafter tails, half-round tile ends. The courtyard edge only has an open eave at its ends
    const edges = [[[X0, Z0], [X1, Z0], [0, 1]], [[X1, Z0], [X1, Z1], [-1, 0]], [[X1, Z1], [X0, Z1], [0, -1]], [[X0, Z1], [X0, Z0], [1, 0]]], ci = north ? 2 : 0;
    edges.forEach(([a, b, d], i) => {
      const s = unit([d[0], SL, d[1]]);
      if (i !== ci) { vq(DK, a, b, TOP - 0.05, YE); eaveTiles(V(a[0], YE, a[1]), V(b[0], YE, b[1]), s); tails(V(a[0], TOP, a[1]), V(b[0], TOP, b[1]), [d[0], 0, d[1]], TOP, i % 2 ? 1.95 : north && i === 0 ? 1.45 : 1.95); return; }
      for (const [p, q] of north ? [[X1, nx1], [nx0, X0]] : [[X0, nx0], [nx1, X1]]) { vq(DK, [p, ze], [q, ze], TOP - 0.05, YE); eaveTiles(V(p, YE, ze), V(q, YE, ze), s); } // courtyard edge, split at the notch
    });
    const wz0 = north ? -54.5 : 7.5, wz1 = north ? -35.0 : 28.6; // pavilion wall lines; soffit ring runs 0.3 m in over the wall tops
    hq(DK, X0, Z0, 43.8, Z1, TOP); hq(DK, 98.5, Z0, X1, Z1, TOP); // west and east eaves
    if (north) { hq(DK, X0, Z0, X1, wz0 + 0.3, TOP); hq(DK, X0, wz1 - 0.3, 48.7, Z1, TOP); tails(V(46.0, TOP, Z1), V(X0, TOP, Z1), [0, 0, -1], TOP, 1.95); }
    else { hq(DK, X0, wz1 - 0.3, X1, Z1, TOP); hq(DK, X0, Z0, 48.7, wz0 + 0.3, TOP); hq(DK, IX - 0.3, Z0, X1, wz0 + 0.3, TOP); tails(V(X0, TOP, Z0), V(46.0, TOP, Z0), [0, 0, 1], TOP, 1.95); tails(V(IX + 0.5, TOP, Z0), V(X1, TOP, Z0), [0, 0, 1], TOP, 1.95); }
    // courtyard edge over the flat roof and the bar: fascia carried down to the flat roof (16.2); a wedge closes the gap above the bar's lower eave
    for (const [p, q] of [[47.6, Math.min(nx0, north ? EX : IX)], [nx1, north ? EX : IX]]) vq(DK, [p, ze], [q, ze], YF, TOP - 0.05);
    const xb = north ? BAR.xs : BAR.xw, yb = BAR.yw - BAR.s * (BAR.xw - xb); DK.t(V(xb, yb, ze), V(xb + (TOP - 0.05 - yb) / BAR.s, TOP - 0.05, ze), V(xb, TOP - 0.05, ze), [[0, 0], [1, 0], [0, 1]]);
  });
  { // west bar gable between the hips: slopes run in under the hip tiles (to the hip ridge lines), so the valleys come out of the intersection
    const { xw, yw, xs, xr, xe, s } = BAR, zn = (HIPS[0].Z0 + HIPS[0].Z1) / 2, zs = (HIPS[1].Z0 + HIPS[1].Z1) / 2, yr = yw + s * (xr - xw), ye = yr - s * (xe - xr), ys = yw - s * (xw - xs);
    const wo = V(xw, yw, zs), we = [0, 0, -1];
    tiles([V(xs, ys, CZ0), V(xs, ys, zn), V(xr, yr, zn), V(xr, yr, CZ0)], wo, we); tiles([V(xw, yw, zs), V(xw, yw, CZ0), V(xr, yr, CZ0), V(xr, yr, zs)], wo, we); // west slope: stair-bay strip (eave 1.2 m further out and lower), main strip
    tiles([V(xe, ye, zn), V(xe, ye, zs), V(xr, yr, zs), V(xr, yr, zn)]); // east slope
    vq(DK, [xe, HIPS[0].Z1], [xe, HIPS[1].Z0], YF, ye); // inner fascia down to the flat roof
    const j = (h, inner) => (yr - YE) / SL * (inner ? -1 : 1) + h; capLine(V(xr, yr, j(HIPS[0].Z1, true)), V(xr, yr, j(HIPS[1].Z0, false)));
    // colonnade eave: fascia, soffit at 15.6 back to the glazing, tile ends, rafter tails between the pier brackets
    vq(DK, [xw, CZ0], [xw, CZ1], TOPC, yw); hq(DK, xw, CZ0, COLX + 0.3, CZ1, TOPC); eaveTiles(V(xw, yw, HIPS[1].Z0), V(xw, yw, CZ0), unit([1, s, 0])); tails(V(xw, TOPC, CZ1), V(xw, TOPC, CZ0), [1, 0, 0], TOPC, COLX - PD - xw);
    // stair-bay eave (lower): fascia, soffit at 15.1, closing gable where the two eaves step
    vq(DK, [xs, -35.0], [xs, CZ0], 15.1, ys); hq(DK, xs, -35.0, 46.3, CZ0, 15.1); eaveTiles(V(xs, ys, CZ0), V(xs, ys, HIPS[0].Z1), unit([1, s, 0])); tails(V(xs, 15.1, CZ0), V(xs, 15.1, -35.0), [1, 0, 0], 15.1, 1.9);
    DK.q(V(xs, 15.1, CZ0), V(46.0, 15.1, CZ0), V(46.0, ys + s * (46.0 - xs), CZ0), V(xs, ys, CZ0));
  }
  // flat roofs: courtyard block and stair strip (16.2), lobe (7.2, ballast), south bay (16.0)
  hq(FL, BAR.xe, HIPS[0].Z1, IX, HIPS[1].Z0, YF); hq(FL, IX, HIPS[0].Z1, EX, -27.6, YF); box(face([EX, HIPS[0].Z1], [EX, -27.6]), S, 0, TOP, 5.4, TOP + 0.1, -0.3, 0.1, 'fktb');
  hq(GV, IX, -27.6, EX, -21.75, YL); hq(GV, IX, -21.75, LX, 0.9, YL); hq(GV, IX, 0.9, EX, 7.5, YL);
  cap(FL, ring([63.4, 28.6, 59.0, 33.3, 48.9, 33.3, 44.5, 28.6]), 16.05);
  { // glazed monitor over the atrium: x 64.3..75.9, z -24.2..3.6, top 19.4 (LiDAR); curb, glazing with mullions every 1.16 m, dark roof slab; plus a few roof vents
    const x0 = 64.3, x1 = 75.9, z0 = -24.2, z1 = 3.6, yb = YF + 0.5, yt = YF + 2.75;
    for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) {
      const F = face(a, b), n = Math.round(F.L / 1.16);
      rect(F, MF, 0, YF, F.L, yb, 0.04); rect(F, MG, 0, yb, F.L, yt, 0, tint()); box(F, MF, 0, yt - 0.1, F.L, yt, 0, 0.06, 'fb'); box(F, MF, 0, (yb + yt) / 2 - 0.03, F.L, (yb + yt) / 2 + 0.03, 0, 0.05, 'ftb');
      for (let k = 0; k <= n; k++) { const u = Math.min(F.L - 0.04, Math.max(0.04, (k * F.L) / n)); box(F, MF, u - 0.04, yb, u + 0.04, yt, 0, 0.08, 'flr'); }
    }
    hq(FL, x0 - 0.4, z0 - 0.4, x1 + 0.4, z1 + 0.4, YF + 3.2); hq(DK, x0 - 0.4, z0 - 0.4, x1 + 0.4, z1 + 0.4, yt); for (const [a, b] of [[[x0 - 0.4, z0 - 0.4], [x1 + 0.4, z0 - 0.4]], [[x1 + 0.4, z0 - 0.4], [x1 + 0.4, z1 + 0.4]], [[x1 + 0.4, z1 + 0.4], [x0 - 0.4, z1 + 0.4]], [[x0 - 0.4, z1 + 0.4], [x0 - 0.4, z0 - 0.4]]]) vq(DK, a, b, yt, YF + 3.2);
    for (const [x, z, w] of [[62.5, -29, 0.9], [80, -29.5, 0.7], [84, -12, 1.1], [79.5, 1.5, 0.8], [86.5, -22, 0.6]]) { for (const [a, b] of [[[x, z], [x + w, z]], [[x + w, z], [x + w, z + w]], [[x + w, z + w], [x, z + w]], [[x, z + w], [x, z]]]) vq(MF, a, b, YF, YF + 0.55); hq(MF, x, z, x + w, z + w, YF + 0.55); }
  }
  // ---------- ground: paving apron under the eaves (the campus ground stops at the old roof-edge footprint), raised terrace on the plaza side ----------
  cap(PV, offset(ring(R.flat()), 2.7), 0.03); cap(DK, ring(R.flat()), 0.2);
  cap(PV, ring([40.9, -45.7, 43.4, -45.7, 43.4, -35.0, 46.0, -35.0, 46.0, CZ0, COLX + STORE, CZ0, COLX + STORE, CZ1, 43.5, CZ1, 43.5, 25.1, 41.3, 25.1, 41.3, 5.6, 45.1, 5.6, 45.1, -26.4, 43.9, -26.4, 43.9, -32.7, 40.9, -32.7]), DECK + 0.012);
  vq(PV, [40.9, -45.7], [43.4, -45.7], 0, DECK); vq(PV, [41.3, 25.1], [43.5, 25.1], 0, DECK);

  // ---------- assemble ----------
  const root = new Group(), near = new Group(), far = new Group();
  let tris = 0, trisFar = 0;
  for (const [k, b] of buckets) {
    if (!b.p.length) continue;
    const m = b.mesh();
    if (b.mat.transparent) { m.castShadow = false; m.renderOrder = 2; }
    if (k === 'far') { far.add(m); trisFar += b.p.length / 9; } else { (ROOT.has(k) ? root : near).add(m); tris += b.p.length / 9; }
  }
  // ---------- site details: lamp posts on the terrace ----------
  const props = new Group(), lampMat = new MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffe2a8, emissiveIntensity: 0.6 });
  const pole = new CylinderGeometry(0.05, 0.08, 4.4, 8).translate(0, 2.2, 0), base = new CylinderGeometry(0.14, 0.18, 0.5, 8).translate(0, 0.25, 0), glob = new SphereGeometry(0.2, 10, 8).translate(0, 4.65, 0), cage = new CylinderGeometry(0.12, 0.22, 0.2, 8).translate(0, 4.4, 0);
  const add = (geo, mat, x, y, z) => { const m = new Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = mat !== lampMat; m.receiveShadow = true; props.add(m); tris += geo.index.count / 3; };
  for (const z of [-25.5, -15.4, -5.2, 5.0]) { add(pole, M.dark, 44.6, DECK, z); add(base, M.dark, 44.6, DECK, z); add(cage, M.dark, 44.6, DECK, z); add(glob, lampMat, 44.6, DECK, z); }
  near.name = 'near'; far.name = 'far'; props.name = 'props';
  root.add(near, far, props);
  const c = { x: 70, z: -12 }, upd = () => { const d = Math.hypot(G.camera.position.x - c.x, G.camera.position.z - c.z) > FAR; near.visible = !d; far.visible = d; }; // runs with the campus ticks while walking; posed screenshots (?cam=) always show the detail LOD
  if (G.camera) (G.campusTick = G.campusTick || []).push(upd);
  root.userData.stats = { tris: Math.round(tris), trisFar: Math.round(trisFar + [...buckets].filter(([k]) => ROOT.has(k)).reduce((s, [, b]) => s + b.p.length / 9, 0)) };
  if (typeof window !== 'undefined') {
    window.__walcEdges = [...R.map((a, i) => [a, R[(i + 1) % R.length], 'wall', TOP]), [[IX, -27.6], [IX, 7.5], 'inner', TOP]]; // tools/walc-holes.mjs: footprint (last entry is not part of the ring)
    // probe volumes for the hole checker, inside the measured plan (clear of the two roof notches, which are open air)
    window.__walcVol = [['north pavilion', 46, 96, -51, -39.5, [2.5, 7.9, 13.7, 16.2, 17.8]], ['south pavilion', 46, 96, 11.5, 25, [2.5, 7.9, 13.7, 16.2, 17.8]], ['mid block', 52, 88, -30, 3, [2.5, 7.6, 13, 15.6]],
      ['east wing', 91.5, 94.5, -20, 0, [2.5, 5.5]], ['south bulge', 49, 59, 29.5, 31, [2.5, 7, 12]], ['north stair tower', 99.2, 99.6, -35, -29, [3, 10, 15]], ['south stair tower', 99.2, 99.6, 9, 15, [3, 10, 15]], ['colonnade lobby', 51.5, 51.6, -26, 5, [1.5, 3.5]]];
    window.__walcRoot = root; window.__walcTris = root.userData.stats; window.__walcSpecs = ['hifi: plan from Google mesh + LiDAR, facades from Apple Maps frames, north from the 2018 photo'];
  }
  return root;
}
