// Purdue Memorial Union (OSM "Purdue Student Union", way/117146490), generated in code, built at its true Bell-Tower-local position (x 196..296, z 197..305).
// Hotspot contract: export async function build(G, zone) -> { id: 'union', group, solids: [[x,z]...][], update(t) }.
// Facts used: OSM footprint (FP, embedded), Google 3D-tiles mesh heights (wall line ~9 m, slate plateau ~13 m, tower ~19-20 m, west pavilion ~17 m, low front pavilion 3-7 m),
//   Street View north wing (2009) and SE-wing east gable (2017) for window rhythm / materials, SketchUp 3D Warehouse screenshot for plan, roof forms and the entrance (reference only).
// Form: red-brick Collegiate Gothic; slate hip skirt (5.2 m wide) round a flat membrane roof; limestone-framed windows, gabled dormers; entrance tower with stone portal and steps
//   on the south front; west pavilion with porte-cochere; low limestone front pavilion. Closed volumes: every wall is double sided, roofs are double sided with soffits,
//   each box has a floor and a back, and the flat roofs underlay the slate so no hole shows the sky.
// Textures (public/campus/hotspots/union/, from tools/union-rectify.py): brick-tile.jpg + limestone-tile.jpg rectified from Street View; slate is procedural (colour from the photo).
// LOD: near (windows, dormers, stone detail) / far (> FAR m: one textured quad per wall); roofs always drawn.
import { BoxGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, SphereGeometry, TextureLoader } from 'three';
import { Bucket, cap, offset, ring } from '../facades.js';

const BASE = import.meta.env.BASE_URL + 'campus/hotspots/union/';
const FAR = 140, EAVE = 8.2, RIDGE = 13.2, DEP = 5.2, OH = 0.4, SLOPE = (RIDGE - EAVE + 0.3) / (DEP + OH);
// OSM outline (merged), local metres x east / z south of the Bell Tower
const FP = [[289.1, 298.3], [292.1, 298.3], [292.1, 297.7], [295.2, 297.7], [295.2, 296.6], [296.5, 296.6], [296.5, 271.3], [291.7, 271.3], [291.7, 267.2], [287.1, 267.2], [287.1, 263.8], [270.9, 263.8], [270.9, 276.3], [255.1, 276.3], [255.1, 273.4], [257.8, 273.3], [257.8, 257.8], [253.6, 257.9], [253.5, 244.9], [258.2, 244.9], [258.2, 220.5], [253.1, 220.5], [253.1, 202.2], [215.5, 202.2], [215.5, 197.0], [210.0, 197.0], [210.0, 202.8], [200.6, 202.8], [200.6, 211.3], [201.5, 211.3], [201.6, 230.4], [200.6, 230.4], [200.6, 234.5], [199.5, 234.5], [199.5, 237.1], [196.5, 237.1], [196.5, 243.4], [199.3, 243.4], [199.3, 246.2], [201.3, 246.2], [201.4, 253.7], [199.4, 255.3], [199.4, 257.9], [201.4, 259.3], [201.4, 281.9], [196.9, 281.9], [196.9, 287.1], [201.0, 287.1], [201.0, 301.7], [247.3, 301.5], [247.3, 305.1], [254.6, 305.1], [254.6, 301.8], [258.2, 301.8], [258.2, 296.5], [276.0, 296.5], [276.0, 298.9], [273.7, 298.9], [273.7, 301.2], [280.3, 302.1], [280.3, 301.3], [283.4, 301.3], [283.4, 298.3]];
// simplified main body (walls + slate skirt + plateau); everything else is a "bay" box below
const MAIN = [[201.2, 202.2], [253.1, 202.2], [253.1, 276.3], [270.9, 276.3], [270.9, 263.8], [287.1, 263.8], [287.1, 271.3], [296.5, 271.3], [296.5, 297], [201.2, 297]];
// bays: x0 z0 x1 z1 height, omit = outward normal of the face that touches the main body, roof: flat | tower | pav (pavilion with parapet)
const BAYS = [
  { id: 'north-bay', x0: 210, z0: 197, x1: 215.5, z1: 202.2, h: 8.2, omit: [0, 1] },
  { id: 'east-bay-1', x0: 253.1, z0: 220.5, x1: 258.2, z1: 244.9, h: 8.2, omit: [-1, 0] },
  { id: 'east-bay-2', x0: 253.1, z0: 257.9, x1: 257.8, z1: 273.4, h: 8.2, omit: [-1, 0] },
  { id: 'west-pavilion', x0: 196.5, z0: 234, x1: 210.5, z1: 246.5, h: 17, omit: null, style: 'pavilion' },
  { id: 'west-bay', x0: 196.9, z0: 281.9, x1: 201.2, z1: 287.1, h: 6.2, omit: [1, 0] },
  { id: 'front-low', x0: 201.2, z0: 297, x1: 226.5, z1: 301.6, h: 3.6, omit: [0, -1], style: 'pavilion', walls: 'stone' },
  { id: 'front-high', x0: 226.5, z0: 297, x1: 247.3, z1: 301.6, h: 6.8, omit: [0, -1], style: 'pavilion', walls: 'stone' },
  { id: 'tower', x0: 243, z0: 285, x1: 255.6, z1: 299.4, h: 19, omit: null, style: 'tower' },
  { id: 'portal', x0: 247.3, z0: 299.4, x1: 254.6, z1: 305.1, h: 9.6, omit: [0, -1], omit2: [0, 1], style: 'portal' },
  { id: 'se-bay-1', x0: 254.6, z0: 296.5, x1: 258.2, z1: 301.8, h: 6, omit: [0, -1] },
  { id: 'se-bay-2', x0: 273.7, z0: 296.5, x1: 283.4, z1: 301.4, h: 4.6, omit: [0, -1] },
];
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const cv = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const tx = (c) => { const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 8; t.colorSpace = SRGBColorSpace; return t; };
const tri = (B, a, b, c, col) => B.q(a, b, c, c, col); // triangle through the quad path so coloured buckets get vertex colours
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function slateTexture() { // 1 m x 1 m: 5 courses of 0.2 m, slates ~0.3 m wide, purple-grey (2009 sunlit roof patch mean 97,88,95)
  const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#23252b'; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) {
    const q = rnd(), x = k * 51.2 - (r % 2 ? 25 : 0), v = 80 + q * 32, w = rnd() < 0.15 ? 1.08 : 1;
    g.fillStyle = `rgb(${(v + 4) * w | 0},${v * 0.92 * w | 0},${(v + 2) * w | 0})`; g.fillRect(x + 1, r * 51.2 + 1, 49, 47);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 1, r * 51.2 + 41, 49, 7);
  }
  return tx(c);
}
function farTexture() { // one bay x one storey of brick wall with a stone-framed window
  const w = 96, h = 150, c = cv(w, h), g = c.getContext('2d'); g.fillStyle = '#8a4b3d'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 300; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,25,18,.2)' : 'rgba(210,130,100,.15)'; g.fillRect(rnd() * w, rnd() * h, 6, 2); }
  g.fillStyle = '#d9cfb4'; g.fillRect(14, 30, 68, 96); g.fillStyle = '#566676'; g.fillRect(19, 35, 58, 86); g.fillStyle = '#d9cfb4'; g.fillRect(46, 35, 4, 86); g.fillRect(19, 76, 58, 4);
  return tx(c);
}
function membraneTexture() { const c = cv(128, 128), g = c.getContext('2d'); g.fillStyle = '#3d4044'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '20,22,24' : '90,92,95'},.12)`; g.fillRect(rnd() * 128, rnd() * 128, 5 + rnd() * 18, 3 + rnd() * 10); } return tx(c); }

function materials() {
  const std = (o) => new MeshStandardMaterial({ side: DoubleSide, ...o });
  const load = (m, file, tint) => new TextureLoader().load(BASE + file, (t) => { t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 8; t.colorSpace = SRGBColorSpace; m.map = t; m.color.set(0xffffff); m.needsUpdate = true; }, undefined, () => m.color.set(tint));
  const brick = std({ color: 0x8c4c3c, roughness: 0.93, vertexColors: true }), stone = std({ color: 0xcdbfa2, roughness: 0.82 });
  load(brick, 'brick-tile.jpg', 0x8c4c3c); load(stone, 'limestone-tile.jpg', 0xcdbfa2);
  return {
    brick, stone, far: std({ map: farTexture(), roughness: 0.9 }), slate: std({ map: slateTexture(), roughness: 0.7 }), flat: std({ map: membraneTexture(), roughness: 0.95 }),
    dark: std({ color: 0x3a332d, roughness: 0.75 }), frame: std({ color: 0xd8cfb8, roughness: 0.55 }), wood: std({ color: 0x4b3020, roughness: 0.65 }),
    plate: std({ color: 0x2b3640, roughness: 0.6, metalness: 0.3 }), steel: std({ color: 0x777a7e, roughness: 0.4, metalness: 0.7 }), copper: std({ color: 0x5f8c78, roughness: 0.6, metalness: 0.4 }),
    glass: std({ vertexColors: true, color: 0xffffff, roughness: 0.05, metalness: 0.4, envMapIntensity: 0.9 }),
  };
}

export async function build(G, zone) {
  const M = materials(), buckets = new Map();
  const bk = (k, mat, colored, sx = 1, sy = 1) => { if (!buckets.has(k)) { const b = new Bucket(mat, colored); b.sx = sx; b.sy = sy; buckets.set(k, b); } return buckets.get(k); };
  const W = bk('brick', M.brick, true, 1 / 0.9, 1 / 1.1), S = bk('stone', M.stone, false, 0.5, 0.5), SL = bk('slate', M.slate), FL = bk('flat', M.flat, false, 0.25, 0.25), CS = bk('cstone', M.stone, false, 0.5, 0.5),
    DK = bk('dark', M.dark), FR = bk('frame', M.frame), PL = bk('plate', M.plate), GL = bk('glass', M.glass, true), WD = bk('wood', M.wood), ST = bk('steel', M.steel), CU = bk('copper', M.copper), FW = bk('far', M.far), CW = bk('cbrick', M.brick, true, 1 / 0.9, 1 / 1.1);
  const ROOT = new Set(['slate', 'flat', 'cstone', 'cbrick', 'copper']), far = new Group(), near = new Group(), root = new Group(), rect = [];
  const tint = () => { const v = 0.9 + rnd() * 0.2; return [v, v * (0.97 + rnd() * 0.06), v * (0.96 + rnd() * 0.08)]; };
  const glassCol = () => { const v = 0.9 + rnd() * 0.6; return [0.2 * v, 0.29 * v, 0.35 * v]; }; // Street View: pale sky-blue panes in cream frames
  const coverage = [];

  // ----- one wall face from a to b (outward normal on the right of a->b in x,z), y from base to top -----
  function facade(a, b, base, top, st = {}) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 0.25) return;
    const ux = dx / L, uz = dz / L, nx = uz, nz = -ux, uo = (a[0] * 0.37 + a[1] * 0.61) % 1.7;
    const P = (u, y, o = 0) => [a[0] + ux * u + nx * o, y, a[1] + uz * u + nz * o];
    const uvf = (B, u, y) => [(u + uo) * B.sx, y * B.sy];
    const face = (B, u0, y0, u1, y1, o = 0, col) => B.q(P(u0, y0, o), P(u0, y1, o), P(u1, y1, o), P(u1, y0, o), col, [[u0, y0], [u0, y1], [u1, y1], [u1, y0]].map(([u, y]) => uvf(B, u, y)));
    const wall = (u0, y0, u1, y1, o = 0) => { if (u1 - u0 > 0.02 && y1 - y0 > 0.02) face(st.stoneWalls ? S : W, u0, y0, u1, y1, o, tint()); };
    const bar = (B, u0, y0, u1, y1, o, d) => {
      face(B, u0, y0, u1, y1, o + d);
      B.q(P(u0, y0, o), P(u0, y1, o), P(u0, y1, o + d), P(u0, y0, o + d)); B.q(P(u1, y0, o + d), P(u1, y1, o + d), P(u1, y1, o), P(u1, y0, o)); B.q(P(u0, y1, o + d), P(u1, y1, o + d), P(u1, y1, o), P(u0, y1, o));
    };
    const H = top - base, SB = st.stone || S;
    FW.q(P(0, base, 0), P(0, top, 0), P(L, top, 0), P(L, base, 0), null, [[0, 0], [0, H / 5], [L / 3.4, H / 5], [L / 3.4, 0]]);
    // plinth, belt course, cornice
    if (!st.noPlinth) { face(S, 0, base, L, base + 0.6, 0.07); S.q(P(0, base + 0.6, 0.07), P(L, base + 0.6, 0.07), P(L, base + 0.6, 0), P(0, base + 0.6, 0)); }
    for (const by of st.belts || []) { face(S, 0, by - 0.15, L, by + 0.15, 0.1); S.q(P(0, by + 0.15, 0.1), P(L, by + 0.15, 0.1), P(L, by + 0.15, 0), P(0, by + 0.15, 0)); S.q(P(0, by - 0.15, 0), P(L, by - 0.15, 0), P(L, by - 0.15, 0.1), P(0, by - 0.15, 0.1)); }
    if (st.cornice !== false) { // stone cornice + coping (roof bays) or eave band (under the slate)
      face(CS, 0, top - 0.45, L, top - 0.1, 0.18); CS.q(P(0, top - 0.1, 0.18), P(L, top - 0.1, 0.18), P(L, top - 0.1, 0), P(0, top - 0.1, 0)); CS.q(P(0, top - 0.45, 0), P(L, top - 0.45, 0), P(L, top - 0.45, 0.18), P(0, top - 0.45, 0.18));
    }
    // frame + glass: openings are {u0,u1,ya,yb,cols,rows,arch,tr (transom y)}
    const lights = (w, o) => {
      const { u0, u1, ya, yb } = w, cols = w.cols || 2, rows = w.rows || 3, spring = w.arch ? yb - (u1 - u0) / 2 : yb, gw = (u1 - u0) / cols, gh = (spring - ya) / rows, uc = (u0 + u1) / 2, r = (u1 - u0) / 2;
      face(PL, u0, ya, u1, spring, o);
      for (let c = 0; c < cols; c++) for (let q = 0; q < rows; q++) face(GL, u0 + c * gw + 0.04, ya + q * gh + 0.04, u0 + (c + 1) * gw - 0.04, ya + (q + 1) * gh - 0.04, o + 0.03, glassCol());
      for (let c = 1; c < cols; c++) bar(FR, u0 + c * gw - 0.04, ya, u0 + c * gw + 0.04, w.arch ? yb - 0.05 : spring, o, 0.11);
      for (let q = 1; q < rows; q++) bar(FR, u0, ya + q * gh - 0.035, u1, ya + q * gh + 0.035, o, 0.09);
      if (w.arch) { // semicircular head: dark plate fan + glass fan, ring of stone
        const N = 8; let prev = [uc - r, spring];
        for (let i = 1; i <= N; i++) {
          const th = Math.PI - (i * Math.PI) / N, cur = [uc + r * Math.cos(th), spring + r * Math.sin(th)];
          PL.q(P(prev[0], prev[1], o), P(uc, spring, o), P(uc, spring, o), P(cur[0], cur[1], o));
          tri(GL, P(prev[0] * 0.96 + uc * 0.04, prev[1] * 0.96 + spring * 0.04, o + 0.03), P(uc, spring + 0.02, o + 0.03), P(cur[0] * 0.96 + uc * 0.04, cur[1] * 0.96 + spring * 0.04, o + 0.03), glassCol());
          S.q(P(prev[0] * 1.08 - uc * 0.08, spring + (prev[1] - spring) * 1.08, o + 0.02), P(prev[0], prev[1], o + 0.02), P(cur[0], cur[1], o + 0.02), P(cur[0] * 1.08 - uc * 0.08, spring + (cur[1] - spring) * 1.08, o + 0.02));
          prev = cur;
        }
      }
    };
    const opening = (w) => {
      const d = 0.25, { u0, u1, ya, yb } = w, sp = w.arch ? yb - (u1 - u0) / 2 : yb, uc = (u0 + u1) / 2, r = (u1 - u0) / 2;
      // reveals
      W.q(P(u0, ya, 0), P(u0, sp, 0), P(u0, sp, -d), P(u0, ya, -d), tint()); W.q(P(u1, ya, -d), P(u1, sp, -d), P(u1, sp, 0), P(u1, ya, 0), tint());
      if (!w.arch) W.q(P(u0, yb, 0), P(u0, yb, -d), P(u1, yb, -d), P(u1, yb, 0), tint());
      else for (let i = 0; i < 8; i++) { const ta = Math.PI - ((i + 0.5) * Math.PI) / 8; tri(W, P(uc + r * Math.cos(Math.PI - (i * Math.PI) / 8), sp + r * Math.sin(Math.PI - (i * Math.PI) / 8), 0), P(uc + r * Math.cos(Math.PI - ((i + 1) * Math.PI) / 8), sp + r * Math.sin(Math.PI - ((i + 1) * Math.PI) / 8), 0), P(ta > Math.PI / 2 ? u0 : u1, yb, 0), tint()); const t0 = Math.PI - (i * Math.PI) / 8, t1 = Math.PI - ((i + 1) * Math.PI) / 8; W.q(P(uc + r * Math.cos(t0), sp + r * Math.sin(t0), 0), P(uc + r * Math.cos(t0), sp + r * Math.sin(t0), -d), P(uc + r * Math.cos(t1), sp + r * Math.sin(t1), -d), P(uc + r * Math.cos(t1), sp + r * Math.sin(t1), 0), tint()); }
      S.q(P(u0 - 0.06, ya, 0.09), P(u1 + 0.06, ya, 0.09), P(u1 + 0.06, ya, -d), P(u0 - 0.06, ya, -d)); face(S, u0 - 0.06, ya - 0.13, u1 + 0.06, ya, 0.09); // sill
      lights(w, -d);
      if (w.surround !== false) { bar(S, u0 - 0.2, ya - 0.13, u0, w.arch ? sp : yb + 0.28, 0, 0.07); bar(S, u1, ya - 0.13, u1 + 0.2, w.arch ? sp : yb + 0.28, 0, 0.07); if (!w.arch) bar(S, u0, yb, u1, yb + 0.28, 0, 0.07); }
    };
    // layout: rows of openings; pieces of brick around them
    const rows = st.rows ? st.rows(L, base, top) : [];
    if (!rows.length || L < 2.4) { wall(0, base, L, top); }
    else {
      let prev = base;
      for (const row of rows) {
        const ws = row.wins.slice().sort((p, q) => p.u0 - q.u0);
        wall(0, prev, L, row.ya); let cur = 0;
        for (const w of ws) { wall(cur, row.ya, w.u0, row.yb); cur = w.u1; const o = { ya: row.ya, yb: row.yb, ...w }; wall(w.u0, row.ya, w.u1, o.ya); wall(w.u0, o.yb, w.u1, row.yb); opening(o); }
        wall(cur, row.ya, L, row.yb); prev = row.yb;
      }
      wall(0, prev, L, top);
    }
    for (const f of st.extra || []) f({ P, face, bar, wall, L, base, top, ux, uz, nx, nz });
    if (st.dormers && L > 12) dormers(a, b, L, P, st.dormerPitch || 9.6);
    return { P, L };
  }

  // ----- row builders -----
  const pitchRow = (L, pitch, w, ya, yb, o = {}) => { const n = Math.max(1, Math.floor((L - 1.4) / pitch)), m = (L - n * pitch) / 2, wins = []; for (let k = 0; k < n; k++) { const c = m + (k + 0.5) * pitch; wins.push({ u0: c - w / 2, u1: c + w / 2, ...o }); } return { ya, yb, wins }; };
  const STYLES = {
    // tall 3-light stone-mullioned windows, 3.4 x 4.8 m at 5.2 m pitch (north wing, Street View 2009 fitted at 22 m from the wall)
    hall: (L, b, t) => [pitchRow(L, 5.2, 3.4, b + 1.5, b + 6.3, { cols: 3, rows: 4 })],
    punched: (L, b, t) => [pitchRow(L, 3.6, 1.5, b + 1.0, b + 3.4, { cols: 2, rows: 3 }), pitchRow(L, 3.6, 1.5, b + 5.3, b + 7.5, { cols: 2, rows: 3 })],
    arcade: (L, b, t) => [pitchRow(L, 3.6, 1.5, b + 1.2, b + 4.4, { cols: 2, rows: 3, arch: true }), pitchRow(L, 3.6, 1.5, b + 5.4, b + 7.6, { cols: 2, rows: 3 })],
    pavilion: (L, b, t) => [pitchRow(L, 3.2, 1.2, b + 1.1, Math.min(b + 2.9, t - 0.9), { cols: 2, rows: 2 })],
    tower: (L, b, t) => [pitchRow(L, 3.4, 1.3, b + 14.2, b + 17.6, { cols: 2, rows: 3 })],
    none: () => [],
  };

  // measured east gable (Street View 2017, rectified east-gable.jpg): stone-framed arched triple 2.8 m wide, sill 2.0, crown 5.9, 0.9 m from the north corner; tall pair 7 m south of it; upper row of pairs
  const EASTROWS = (L) => [ // measured east gable (Street View 2017 fitted 12.8 m from the wall, rectified east-gable.jpg); u = 0 at the NORTH corner. Arched triple 4.0 m wide, sill 2.3, crown 6.1, u 8.2..12.2; window pairs 2.0..3.8 m
    { ya: 1.0, yb: 6.1, wins: [{ u0: 2.0, u1: 3.8, ya: 1.2, yb: 3.5, cols: 2, rows: 3 }, { u0: 8.2, u1: 12.2, ya: 2.3, yb: 6.1, cols: 3, rows: 3, arch: true }, ...pitchRow(L - 14.5, 3.6, 1.5, 1.2, 3.5, { cols: 2, rows: 3 }).wins.map((w) => ({ ...w, u0: w.u0 + 14.5, u1: w.u1 + 14.5 }))] },
    { ya: 6.2, yb: 7.9, wins: [{ u0: 2.0, u1: 3.8, cols: 2, rows: 2 }, ...pitchRow(L - 14.5, 3.6, 1.5, 6.2, 7.9, { cols: 2, rows: 2 }).wins.map((w) => ({ ...w, u0: w.u0 + 14.5, u1: w.u1 + 14.5 }))] }];
  // ----- slate skirt, plateau, dormers -----
  const R = ring(MAIN.flat()), Ro = offset(R, OH), Ri = offset(R, -DEP);
  const ySl = (d) => EAVE - 0.3 + SLOPE * (d + OH); // slate height at inward depth d from the wall line
  function dormers(a, b, L, P, pit) { // gabled stone-framed dormers on the slope behind this wall, every ~9.6 m
    const n = Math.floor((L - 6) / pit); if (n < 1) return;
    const m0 = (L - (n - 1) * pit) / 2, d0 = 0.9, y0 = ySl(d0) - 0.15, hw = 2.2, hp = 1.0, Wd = 2.4;
    for (let k = 0; k < n; k++) {
      const c = m0 + k * pit, u0 = c - Wd / 2, u1 = c + Wd / 2, o = -d0, ye = y0 + hw, yp = ye + hp, dE = (ye - (EAVE - 0.3)) / SLOPE - OH, dP = (yp - (EAVE - 0.3)) / SLOPE - OH;
      const p = (u, y, d) => P(u, y, -d);
      S.q(p(u0, y0, d0), p(u0, ye, d0), p(u1, ye, d0), p(u1, y0, d0), null, [[0, 0], [0, 2], [2, 2], [2, 0]]); // front wall (limestone)
      S.t(p(u0, ye, d0), p(c, yp, d0), p(u1, ye, d0), [[0, 0], [1, 1], [2, 0]]);
      PL.q(p(u0 + 0.25, y0 + 0.5, d0 - 0.02), p(u0 + 0.25, ye - 0.25, d0 - 0.02), p(u1 - 0.25, ye - 0.25, d0 - 0.02), p(u1 - 0.25, y0 + 0.5, d0 - 0.02));
      for (let i = 0; i < 2; i++) GL.q(p(u0 + 0.3 + i * 0.9, y0 + 0.55, d0 - 0.04), p(u0 + 0.3 + i * 0.9, ye - 0.3, d0 - 0.04), p(u0 + 0.9 + i * 0.9, ye - 0.3, d0 - 0.04), p(u0 + 0.9 + i * 0.9, y0 + 0.55, d0 - 0.04), glassCol());
      for (const s of [-1, 1]) { // cheek (slate) and roof plane
        const ue = c + s * (Wd / 2);
        SL.t(p(ue, y0, d0), p(ue, ye, d0), p(ue, ye, dE), [[0, 0], [0, hw], [dE - d0, hw]]);
        SL.q(p(ue, ye, d0 - 0.2), p(c, yp, d0 - 0.2), p(c, yp, dP), p(ue, ye, dE), null, [[0, 0], [Wd / 2, 0], [Wd / 2, dP - d0], [0, dE - d0]]);
      }
      void o;
    }
  }
  // slate strips (hips and valleys fall out of the mitred offsets), soffit, fascia
  const yE = EAVE - 0.3;
  R.forEach((p, i) => {
    const j = (i + 1) % R.length, a = Ro[i], b = Ro[j], c = Ri[j], d = Ri[i], w = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const A = [a[0], yE, a[1]], B = [b[0], yE, b[1]], C = [c[0], RIDGE, c[1]], D = [d[0], RIDGE, d[1]], hh = dist([(A[0] + B[0]) / 2, yE, (A[2] + B[2]) / 2], [(C[0] + D[0]) / 2, RIDGE, (C[2] + D[2]) / 2]);
    SL.q(A, B, C, D, null, [[0, 0], [w, 0], [w - 1.5, hh], [1.5, hh]]);
    DK.q([R[i][0], EAVE - 0.5, R[i][1]], [R[j][0], EAVE - 0.5, R[j][1]], [b[0], yE - 0.1, b[1]], [a[0], yE - 0.1, a[1]]); // soffit
    DK.q([a[0], yE - 0.1, a[1]], [b[0], yE - 0.1, b[1]], [b[0], yE + 0.12, b[1]], [a[0], yE + 0.12, a[1]]); // fascia
  });
  cap(FL, Ri, RIDGE);
  { const pr = RIDGE + 0.45; for (let i = 0; i < Ri.length; i++) { const j = (i + 1) % Ri.length; CW.q([Ri[i][0], RIDGE, Ri[i][1]], [Ri[i][0], pr, Ri[i][1]], [Ri[j][0], pr, Ri[j][1]], [Ri[j][0], RIDGE, Ri[j][1]], tint(), [[0, 0], [0, 0.4], [3, 0.4], [3, 0]]); } } // low parapet round the plateau
  cap(FL, ring(FP.flat()), 0.02); // floor of the whole footprint (closed underside)

  // ----- main-body walls -----
  R.forEach((a, i) => {
    const b = R[(i + 1) % R.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = dz / L, nz = -dx / L;
    let style = 'punched';
    if (nz < -0.9 && a[1] < 205) style = 'hall';
    else if (nz > 0.9) style = 'arcade';
    const east = nx > 0.9 && a[0] > 290; // SE-wing east gable end: u = 0 is its NORTH end (ring is counter-clockwise)
    // the east gable face is measured; the rest are guessed or copied (coverage table)
    facade(a, b, 0, EAVE, { rows: east ? EASTROWS : STYLES[style], belts: style === 'hall' ? [6.6] : east ? [] : [4.4], dormers: true, dormerPitch: style === 'hall' ? 13.1 : 9.6 });
    coverage.push([`main edge ${i} ${style}${east ? ' (east gable)' : ''}`, L.toFixed(1)]);
  });
  // ----- bays -----
  const bayRect = (bay) => ring([bay.x0, bay.z0, bay.x1, bay.z0, bay.x1, bay.z1, bay.x0, bay.z1]);
  for (const bay of BAYS) {
    const Rb = bayRect(bay), st = bay.style || 'plain', flatRoof = st !== 'tower';
    Rb.forEach((a, i) => {
      const b = Rb[(i + 1) % Rb.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = dz / L, nz = -dx / L;
      if ([bay.omit, bay.omit2].some((o) => o && Math.abs(nx - o[0]) < 0.1 && Math.abs(nz - o[1]) < 0.1)) return;
      const rows = st === 'tower' || st === 'portal' ? null : bay.h > 10 ? (L2, b0, t0) => [...STYLES.punched(L2, b0, t0), pitchRow(L2, 3.6, 1.5, 9.6, 12.3, { cols: 2, rows: 3 }), pitchRow(L2, 3.6, 1.5, 13.6, 16.0, { cols: 2, rows: 3 })] : bay.h > 6 ? STYLES.punched : STYLES.pavilion;
      facade(a, b, 0, bay.h, { rows: st === 'tower' ? (L2, b0, t0) => [pitchRow(L2, 3.4, 1.3, 14.2, 17.4, { cols: 2, rows: 3 })] : rows, belts: bay.h > 10 ? [4.4, 9.0] : [], cornice: true, stoneWalls: bay.walls === 'stone' });
    });
    // flat roof with parapet
    cap(FL, Rb, bay.h);
    if (st !== 'portal') for (let i = 0; i < Rb.length; i++) { const j = (i + 1) % Rb.length; CW.q([Rb[i][0], bay.h, Rb[i][1]], [Rb[i][0], bay.h + 0.6, Rb[i][1]], [Rb[j][0], bay.h + 0.6, Rb[j][1]], [Rb[j][0], bay.h, Rb[j][1]], tint(), [[0, 0], [0, 0.6], [3, 0.6], [3, 0]]); }
    cap(FL, Rb, 0.02);
  }
  const FEAT = featureBuilders({ bk, S, CS, DK, WD, GL, PL, ST, CU, CW, FL, FR, glassCol, tint, SL });
  FEAT.tower(); FEAT.portal(); FEAT.westPavilion(); FEAT.roofStuff();

  // ----- assemble -----
  let tris = 0, trisFar = 0, trisRoot = 0;
  for (const [k, b] of buckets) {
    const m = b.mesh(), n = b.p.length / 9;
    if (k === 'far') { far.add(m); trisFar += n; } else { (ROOT.has(k) ? root : near).add(m); tris += n; if (ROOT.has(k)) trisRoot += n; }
  }
  const props = new Group(); FEAT.props(props); root.add(near, far, props);
  const c = { x: 248, z: 250 }, upd = () => { if (!G || !G.camera) return; const d = Math.hypot(G.camera.position.x - c.x, G.camera.position.z - c.z) > FAR; near.visible = !d; far.visible = d; };
  if (G && G.camera) (G.campusTick = G.campusTick || []).push(upd);
  upd();
  const group = new Group(); group.name = 'union'; group.add(root); group.userData.stats = { tris: Math.round(tris), trisFar: Math.round(trisFar), trisRoot: Math.round(trisRoot), farTotal: Math.round(trisRoot + trisFar), coverage };
  if (typeof window !== 'undefined') window.__unionTris = group.userData.stats;
  const solids = [FP.map((p) => [p[0], p[1]]), [[246.4, 305.1], [255.5, 305.1], [255.5, 307.8], [246.4, 307.8]]];
  return { id: 'union', group, solids, update: upd };
}

// ---------- hand-built features: tower, entrance portal with steps, west pavilion entrance and canopy, roof stuff, props ----------
function featureBuilders(K) {
  const { S, CS, DK, WD, GL, PL, ST, CU, CW, FL, FR, glassCol, tint, SL } = K, tri = (B, a, b, c, col) => B.q(a, b, c, c, col);
  const box = (B, x0, y0, z0, x1, y1, z1, uvs) => {
    const q = (a, b, c, d) => B.q(a, b, c, d, B.c ? tint() : undefined);
    q([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]); q([x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]);
    q([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]); q([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]); q([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]); q([x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1]);
    void uvs;
  };
  const pyramid = (B, cx, cz, hw, y0, y1) => { const c = [cx, y1, cz], k = [[cx - hw, cz - hw], [cx + hw, cz - hw], [cx + hw, cz + hw], [cx - hw, cz + hw]]; for (let i = 0; i < 4; i++) { const p = k[i], q = k[(i + 1) % 4]; B.q([p[0], y0, p[1]], [q[0], y0, q[1]], c, c, B.c ? glassCol() : undefined); } };
  const archFront = (B, xc, zf, r, ySp, yTop, dep, sgn) => { // stone spandrel above a round arch opening on a face at z = zf (normal sgn*z), plus intrados
    const N = 10; for (let i = 0; i < N; i++) {
      const t0 = Math.PI - (i * Math.PI) / N, t1 = Math.PI - ((i + 1) * Math.PI) / N, x0 = xc + r * Math.cos(t0), x1 = xc + r * Math.cos(t1), y0 = ySp + r * Math.sin(t0), y1 = ySp + r * Math.sin(t1);
      B.q([x0, y0, zf], [x0, yTop, zf], [x1, yTop, zf], [x1, y1, zf]);
      B.q([x0, y0, zf], [x1, y1, zf], [x1, y1, zf - sgn * dep], [x0, y0, zf - sgn * dep]);
    }
  };
  return {
    tower() { // x 243..255.6, z 285..299.4, 19 m: stone corner pilasters, stone-framed arched window group over the portal, crenellated parapet, pinnacles
      const x0 = 243, x1 = 255.6, z0 = 285, z1 = 299.4, yt = 19, xc = (x0 + x1) / 2;
      for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { box(S, px - (px === x0 ? 0.15 : 0.75), 0.5, pz - (pz === z0 ? 0.15 : 0.75), px + (px === x0 ? 0.75 : 0.15), yt - 0.4, pz + (pz === z0 ? 0.75 : 0.15)); box(CS, px - 0.45, yt - 0.4, pz - 0.45, px + 0.45, yt + 0.9, pz + 0.45); pyramid(CS, px, pz, 0.45, yt + 0.9, yt + 2.2); }
      box(CS, x0, yt - 1.5, z0, x1, yt - 1.2, z1); // string course
      for (let i = 0; i < 7; i++) { const mx = x0 + 1.0 + i * ((x1 - x0 - 2.0) / 6); for (const zz of [z0 + 0.15, z1 - 0.35]) box(CS, mx - 0.4, yt, zz, mx + 0.4, yt + 0.9, zz + 0.2); } // merlons front/back
      for (let i = 0; i < 6; i++) { const mz = z0 + 1.2 + i * ((z1 - z0 - 2.4) / 5); for (const xx of [x0 + 0.15, x1 - 0.35]) box(CS, xx, yt, mz - 0.4, xx + 0.2, yt + 0.9, mz + 0.4); }
      // big arched window group, front (south, +z) face above the portal: stone frame, 3 lights, tracery bars
      const zf = z1, wx = 4.2, ya = 12.2, ys = 15.6, r = wx / 2, zo = zf;
      box(S, xc - wx / 2 - 0.55, ya - 0.2, zo, xc - wx / 2, ys + 0.2, zo + 0.18); box(S, xc + wx / 2, ya - 0.2, zo, xc + wx / 2 + 0.55, ys + 0.2, zo + 0.18); box(S, xc - wx / 2 - 0.55, ya - 0.5, zo, xc + wx / 2 + 0.55, ya - 0.2, zo + 0.3);
      PL.q([xc - r, ya, zo + 0.02], [xc - r, ys, zo + 0.02], [xc + r, ys, zo + 0.02], [xc + r, ya, zo + 0.02]);
      for (let i = 0; i < 3; i++) for (let q = 0; q < 3; q++) GL.q([xc - r + 0.05 + i * (wx / 3), ya + 0.05 + q * ((ys - ya) / 3), zo + 0.06], [xc - r + 0.05 + i * (wx / 3), ya + (q + 1) * ((ys - ya) / 3) - 0.05, zo + 0.06], [xc - r + (i + 1) * (wx / 3) - 0.05, ya + (q + 1) * ((ys - ya) / 3) - 0.05, zo + 0.06], [xc - r + (i + 1) * (wx / 3) - 0.05, ya + 0.05 + q * ((ys - ya) / 3), zo + 0.06], glassCol());
      for (const mx of [-r / 3, r / 3]) box(FR, xc + mx - 0.05, ya, zo + 0.02, xc + mx + 0.05, ys + 0.8, zo + 0.14);
      const N = 12; for (let i = 0; i < N; i++) { const t0 = Math.PI - (i * Math.PI) / N, t1 = Math.PI - ((i + 1) * Math.PI) / N; const q = (t, k) => [xc + k * r * Math.cos(t), ys + k * r * Math.sin(t), zo + 0.1]; S.q(q(t0, 1), q(t0, 1.15), q(t1, 1.15), q(t1, 1)); PL.t(q(t0, 0.97), [xc, ys, zo + 0.03], q(t1, 0.97), [[0, 0], [1, 0], [0, 1]]); tri(GL, [q(t0, 0.94)[0], q(t0, 0.94)[1], zo + 0.06], [xc, ys + 0.02, zo + 0.06], [q(t1, 0.94)[0], q(t1, 0.94)[1], zo + 0.06], glassCol()); }
      void CW;
    },
    portal() { // stone portal: x 247.3..254.6 z 301.5..305.1, arch to 5.4, pylons to 10.2, door recess, 5 steps
      const x0 = 247.3, x1 = 254.6, zf = 305.1, xc = 250.95, r = 1.75, ySp = 4.4, h = 9.6, dep = 2.4;
      box(CS, x0 - 0.1, 0.9, 301.4, x0 + 1.9, 11.4, zf); box(CS, x1 - 1.9, 0.9, 301.4, x1 + 0.1, 11.4, zf); // pylons
      for (const px of [x0 - 0.1, x1 - 1.9]) { box(S, px - 0.2, 0.9, zf, px + 2.1, 1.7, zf + 0.25); pyramid(CS, px + 1.0, zf - 1.8, 0.95, 11.4, 13.0); box(S, px + 0.55, 8.4, zf, px + 1.45, 10.4, zf + 0.12); box(S, px - 0.15, 10.9, zf - 2.0, px + 2.15, 11.15, zf + 0.15); }
      box(CS, x0 + 1.9, 0.9, 301.4, x1 - 1.9, ySp, zf - dep); // solid wall either side of the recess is the pylons; this closes the back of the recess above the door
      archFront(CS, xc, zf, r, ySp, h, dep, 1);
      box(CS, x0 + 1.9, h, 301.4, x1 - 1.9, h + 0.35, zf); // coping
      // doors in the recess: dark wood leaves, leaded fan light (blue-green, as seen in the lobby frame)
      const zb = zf - dep + 0.05;
      for (let i = 0; i < 2; i++) { const a = xc - r + i * r, b = a + r; box(WD, a + 0.04, 0.95, zb, b - 0.04, ySp, zb + 0.08); for (let q = 0; q < 3; q++) GL.q([a + 0.3, 1.9 + q * 0.5, zb + 0.1], [a + 0.3, 2.3 + q * 0.5, zb + 0.1], [b - 0.3, 2.3 + q * 0.5, zb + 0.1], [b - 0.3, 1.9 + q * 0.5, zb + 0.1], [0.08, 0.2, 0.28]); }
      PL.q([xc - r, ySp, zb], [xc - r, ySp, zb], [xc + r, ySp, zb], [xc + r, ySp, zb]);
      for (let i = 0; i < 10; i++) { const t0 = Math.PI - (i * Math.PI) / 10, t1 = Math.PI - ((i + 1) * Math.PI) / 10; tri(GL, [xc + r * 0.95 * Math.cos(t0), ySp + r * 0.95 * Math.sin(t0), zb + 0.05], [xc, ySp, zb + 0.05], [xc + r * 0.95 * Math.cos(t1), ySp + r * 0.95 * Math.sin(t1), zb + 0.05], [0.1, 0.3, 0.34]); }
      // steps: 5 treads, rise 0.18, 0.4 deep, wider than the portal, with cheek walls
      for (let s = 0; s < 5; s++) box(S, x0 - 1.0 + s * 0.1, 0.9 - (s + 1) * 0.18, zf + s * 0.4, x1 + 1.0 - s * 0.1, 0.9 - s * 0.18, zf + (s + 1) * 0.4);
      for (const sx of [x0 - 1.1, x1 + 0.7]) box(CS, sx, 0, zf, sx + 0.4, 1.3, zf + 2.0);
      box(S, x0 - 1.1, 0.0, zf - 0.01, x1 + 1.1, 0.9, zf + 0.0);
    },
    westPavilion() { // 17 m box x 196.5..210.5, z 234..246.5: arched lobby door on the west face with a porte-cochere canopy on stone piers
      const x0 = 196.5, zc = 240.25, r = 1.2, ySp = 2.8, xf = x0, dep = 0.8;
      for (const s of [-1, 1]) box(S, xf - 0.25, 0.5, zc + s * (r + 0.55) - 0.25, xf, 6.5, zc + s * (r + 0.55) + 0.25);
      box(S, xf - 0.25, 0.5, zc - r - 0.3, xf, 0.9, zc + r + 0.3); box(CS, xf - 0.2, 6.5, zc - r - 0.8, xf, 7.1, zc + r + 0.8);
      const N = 8; for (let i = 0; i < N; i++) { const t0 = Math.PI - (i * Math.PI) / N, t1 = Math.PI - ((i + 1) * Math.PI) / N; tri(GL, [xf - 0.02, ySp + r * Math.sin(t0), zc + r * Math.cos(t0)], [xf - 0.02, ySp, zc], [xf - 0.02, ySp + r * Math.sin(t1), zc + r * Math.cos(t1)], [0.1, 0.3, 0.34]); }
      box(WD, xf - 0.05, 0.9, zc - r, xf - 0.02, ySp, zc + r);
      box(FL, x0 - 6.4, 3.5, 236.0, x0 - 0.2, 3.9, 244.5); box(S, x0 - 6.4, 3.9, 236.0, x0 - 6.2, 4.4, 244.5); // canopy slab (SketchUp: two stone-edged canopies) on piers
      for (const zz of [236.5, 244.0]) for (const xx of [x0 - 6.0]) box(S, xx, 0, zz - 0.3, xx + 0.6, 3.5, zz + 0.3);
      box(S, x0 - 6.4, 3.9, 236.0, x0 - 0.2, 4.0, 244.5);
    },
    roofStuff() { // plateau clutter from the Google mesh (boxes at 15-20 m): chimneys, plant, a glazed pyramid skylight (SketchUp), two stair bulkheads
      for (const [x, z] of [[226, 215], [244, 262], [226.5, 282]]) { box(CW, x - 0.7, RIDGE, z - 0.7, x + 0.7, RIDGE + 3.4, z + 0.7); box(CS, x - 0.85, RIDGE + 3.4, z - 0.85, x + 0.85, RIDGE + 3.7, z + 0.85); }
      for (const [x0, z0, x1, z1, y] of [[213, 209, 222, 217, 2.2], [229, 255, 237, 261, 1.5], [225, 276, 229, 281, 1.8]]) { box(CW, x0, RIDGE, z0, x1, RIDGE + y, z1); box(FL, x0 - 0.2, RIDGE + y, z0 - 0.2, x1 + 0.2, RIDGE + y + 0.2, z1 + 0.2); }
      pyramid(GL, 230, 262, 3.4, RIDGE + 0.4, RIDGE + 2.6); box(CS, 226.6, RIDGE, 258.6, 233.4, RIDGE + 0.4, 265.4);
      void ST; void CU; void DK; void SL; void tint;
    },
    props(g) {
      const lamp = new MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffe2a8, emissiveIntensity: 0.5 }), dark = new MeshStandardMaterial({ color: 0x1b1a1a, roughness: 0.7 });
      const pole = new CylinderGeometry(0.05, 0.08, 4.2, 8).translate(0, 2.1, 0), glob = new SphereGeometry(0.2, 10, 8).translate(0, 4.4, 0), cone = new ConeGeometry(0.2, 0.3, 8).translate(0, 4.7, 0);
      for (const [x, z] of [[245.5, 308.3], [256.5, 308.3], [236, 303.2], [210, 303.2]]) { for (const [geo, mat] of [[pole, dark], [glob, lamp], [cone, dark]]) { const m = new Mesh(geo, mat); m.position.set(x, 0, z); m.castShadow = mat === dark; g.add(m); } }
      void BoxGeometry; void Color;
    },
  };
}
