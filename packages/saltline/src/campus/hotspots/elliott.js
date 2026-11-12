// Elliott Hall of Music (OSM way/74151922, ELLT), generated in code. build(G, zone) -> { id, group, solids, update, stats }.
// NOT a dome: it is a rectangular brick auditorium (56.4 x 58.6 m) with a hipped terracotta roof around a flat top (LiDAR plane 33.7 deg, flat top ~22.8 m), a fly tower
// on the SW-end corner, a half-round drum ("rotunda", R 21 m) on the +u end, a low annex on the -u end, and limestone porticoes on both long faces.
// Plan frame: u/v axes from the OSM footprint (origin at its north vertex (-72.7,-109.4), u along the 56.4 m NW edge, v across). Measured from Street View + LiDAR + Google mesh
// where noted `m:`; `g:` = guessed. Closed solids only (walls + roofs + soffits + caps, all DoubleSide), merged per material. Near detail / far box swap at 140 m.
import { BoxGeometry, CanvasTexture, Group, Mesh, MeshBasicMaterial } from 'three';
import { Buf, fillPoly, ribbon, std, tex, rng } from './lib/common.js';
import data from './data/elliott.json';

const O = [-72.7, -109.4], U = [-0.77272841, 0.6347368], V = [0.6347368, 0.77272841];
const W = (u, v) => [O[0] + U[0] * u + V[0] * v, O[1] + U[1] * u + V[1] * v];
const FAR = 140;
// m: hall block, eave and flat-top heights from the LiDAR planes (flat 22.5-23.5, hip 33.7 deg); g: eave 17.5, basement 5.2
const HALL = { u0: 0, u1: 56.4, v0: 0, v1: 58.6 }, EAVE = 17.5, TOP = 22.8, OV = 0.7, PL = 5.2, TAN = Math.tan((33.7 * Math.PI) / 180);
const TOWER = { u0: 34, u1: 56.4, v0: 30, v1: 58.6, top: 31 }; // g: fly tower, 31 m (LiDAR box clipped before it; aerial shows ~ +8 m over the hall roof)
const DRUM = { cu: 66.4, cv: 29.1, R: 21, v0: 8, v1: 50.2, h: 12.5 }; // m: arc fitted to OSM ring (max u 87.5); g: height 12.5
const ANNEX = { u0: -9.7, u1: 0, v0: 3, v1: 55.5, h: 4.2 }; // m: LiDAR flat plane 3.3-4 m

function brickTex() { // 1.6 m tile: 8 bricks x 20 courses, deep red-brown with flashed dark units
  const R = rng(11), c = Object.assign(document.createElement('canvas'), { width: 512, height: 512 }), g = c.getContext('2d');
  g.fillStyle = '#a69d8e'; g.fillRect(0, 0, 512, 512);
  const bw = 64, bh = 25.6;
  for (let r = 0; r < 20; r++) for (let k = -1; k < 8; k++) {
    const x = k * bw + (r % 2 ? bw / 2 : 0), q = R(), dk = R() < 0.16 ? 0.72 : 1;
    g.fillStyle = `rgb(${(100 + q * 30) * dk | 0},${(40 + q * 14) * dk | 0},${(31 + q * 10) * dk | 0})`; g.fillRect(x + 1.5, r * bh + 1.5, bw - 3, bh - 3);
  }
  return c;
}
function tileTex() { // 1 m clay tile, 5 courses
  const R = rng(5), c = Object.assign(document.createElement('canvas'), { width: 256, height: 256 }), g = c.getContext('2d');
  g.fillStyle = '#6a3224'; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 5; r++) for (let k = -1; k < 5; k++) {
    const q = R(), x = k * 51.2 + (r % 2 ? 25 : 0); g.fillStyle = `rgb(${150 + q * 28 | 0},${68 + q * 18 | 0},${52 + q * 12 | 0})`; g.fillRect(x + 1.5, r * 51.2 + 1, 48, 47);
    g.fillStyle = 'rgba(40,12,6,.3)'; g.fillRect(x + 1.5, r * 51.2 + 42, 48, 7);
  }
  return c;
}
const ct = (c) => { const t = new CanvasTexture(c); t.wrapS = t.wrapT = 1000; t.anisotropy = 8; t.colorSpace = 'srgb'; return t; };

export async function build(G, zone) {
  const POFF = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
  const brick = std({ map: ct(brickTex()), roughness: 0.93 }), stone = std({ color: 0xbdb7a6, roughness: 0.88 }),
    tile = std({ map: ct(tileTex()), roughness: 0.7 }), dark = std({ color: 0x241d1a, roughness: 0.8 }), flat = std({ color: 0x8b8a86, roughness: 0.95 }),
    glass = std({ color: 0x25313a, roughness: 0.15, metalness: 0.5 }), iron = std({ color: 0x1c1c1e, roughness: 0.5, metalness: 0.6 }),
    conc = std({ map: tex('walk/concrete-albedo.jpg'), roughness: 0.95, ...POFF }), asph = std({ map: tex('walk/asphalt-albedo.jpg'), roughness: 0.95, ...POFF }),
    awning = std({ color: 0x1f5a3a, roughness: 0.7 });
  const B = Object.fromEntries(Object.entries({ brick, stone, tile, dark, flat, glass, iron, conc, asph, awning }).map(([k, m]) => [k, new Buf(m)]));
  const F = Object.fromEntries(Object.entries({ brick, stone, tile, flat, dark }).map(([k, m]) => [k + 'F', new Buf(m)])); // far LOD: closed prisms only
  const S = { brick: 1 / 1.6, stone: 1 / 2.5 };
  const wall = (buf, A, Bp, y0, y1, k) => buf.q([A[0], y0, A[1]], [Bp[0], y0, Bp[1]], [Bp[0], y1, Bp[1]], [A[0], y1, A[1]], k, k);
  const box = (buf, x0, y0, z0, x1, y1, z1, k = 1) => { // axis-aligned in world x/z, closed
    const a = [x0, z0], b = [x1, z0], c = [x1, z1], d = [x0, z1];
    wall(buf, a, b, y0, y1, k); wall(buf, b, c, y0, y1, k); wall(buf, c, d, y0, y1, k); wall(buf, d, a, y0, y1, k);
    buf.q([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], k, k); buf.q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], k, k);
  };
  const ubox = (buf, u0, v0, u1, v1, y0, y1, k = 1) => { // closed box in the building's u/v frame
    const c = [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)];
    c.forEach((p, i) => wall(buf, p, c[(i + 1) % 4], y0, y1, k));
    for (const y of [y0, y1]) buf.q([c[0][0], y, c[0][1]], [c[1][0], y, c[1][1]], [c[2][0], y, c[2][1]], [c[3][0], y, c[3][1]], k, k);
  };
  // a face runs from uv a to uv b with outward normal n (uv); P(s,y,o) = world point s m along, y up, o m out
  const face = (a, b, n) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), du = (b[0] - a[0]) / L, dv = (b[1] - a[1]) / L; return { L, P: (s, y, o = 0) => { const w = W(a[0] + du * s + n[0] * o, a[1] + dv * s + n[1] * o); return [w[0], y, w[1]]; } }; };
  const quad = (buf, f, s0, y0, s1, y1, o, k = 1) => buf.q(f.P(s0, y0, o), f.P(s1, y0, o), f.P(s1, y1, o), f.P(s0, y1, o), k, k, [[s0 * k, y0 * k], [s1 * k, y0 * k], [s1 * k, y1 * k], [s0 * k, y1 * k]]);
  const HOLES = new Map(); // wall with rectangular holes (windows): grid of cells, uv continuous in metres
  const hole = (f, s0, y0, s1, y1) => { if (!HOLES.has(f)) HOLES.set(f, []); HOLES.get(f).push([s0, y0, s1, y1]); };
  const holey = (buf, f, y0, y1, k) => {
    const hs = (HOLES.get(f) || []).filter((h) => h[3] > y0 && h[1] < y1), xs = [...new Set([0, f.L, ...hs.flatMap((h) => [h[0], h[2]])])].sort((a, b) => a - b), ys = [...new Set([y0, y1, ...hs.flatMap((h) => [Math.max(y0, h[1]), Math.min(y1, h[3])])])].sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < ys.length; j++) {
      const cs = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2; if (hs.some((h) => cs > h[0] && cs < h[2] && cy > h[1] && cy < h[3])) continue;
      quad(buf, f, xs[i], ys[j], xs[i + 1], ys[j + 1], 0, k);
    }
  };
  const sillBox = (f, s0, y0, s1, y1, o) => { // closed stone block proud of a face by o
    const P = f.P; B.stone.q(P(s0, y0, o), P(s1, y0, o), P(s1, y1, o), P(s0, y1, o), 1, 1);
    B.stone.q(P(s0, y1, 0), P(s1, y1, 0), P(s1, y1, o), P(s0, y1, o), 1, 1); B.stone.q(P(s0, y0, 0), P(s1, y0, 0), P(s1, y0, o), P(s0, y0, o), 1, 1);
    B.stone.q(P(s0, y0, 0), P(s0, y1, 0), P(s0, y1, o), P(s0, y0, o), 1, 1); B.stone.q(P(s1, y0, 0), P(s1, y1, 0), P(s1, y1, o), P(s1, y0, o), 1, 1);
  };
  const win = (f, s0, y0, s1, y1, dep = 0.25) => { // recessed window: glass at -dep, 4 stone reveals, mullion, sill and lintel
    quad(B.glass, f, s0, y0, s1, y1, -dep);
    B.stone.q(f.P(s0, y0, 0), f.P(s0, y0, -dep), f.P(s0, y1, -dep), f.P(s0, y1, 0), 1, 1); B.stone.q(f.P(s1, y0, 0), f.P(s1, y0, -dep), f.P(s1, y1, -dep), f.P(s1, y1, 0), 1, 1);
    B.stone.q(f.P(s0, y1, 0), f.P(s1, y1, 0), f.P(s1, y1, -dep), f.P(s0, y1, -dep), 1, 1); B.stone.q(f.P(s0, y0, 0), f.P(s1, y0, 0), f.P(s1, y0, -dep), f.P(s0, y0, -dep), 1, 1);
    quad(B.stone, f, (s0 + s1) / 2 - 0.04, y0, (s0 + s1) / 2 + 0.04, y1, -dep + 0.02);
    sillBox(f, s0 - 0.12, y0 - 0.14, s1 + 0.12, y0, 0.16); sillBox(f, s0 - 0.1, y1, s1 + 0.1, y1 + 0.2, 0.1);
  };

  // ---------------- hall block (closed prism) ----------------
  const H = HALL, hc = [[H.u0, H.v0], [H.u1, H.v0], [H.u1, H.v1], [H.u0, H.v1]];
  const faces = { nw: face([H.u0, H.v0], [H.u1, H.v0], [0, -1]), se: face([H.u1, H.v1], [H.u0, H.v1], [0, 1]), sw: face([H.u1, H.v0], [H.u1, H.v1], [1, 0]), ne: face([H.u0, H.v1], [H.u0, H.v0], [-1, 0]) };
  const PN = [21, 35.6], PS = [31.4, 45.4]; // porticoes (s along each face)
  const WINS = [];
  for (const f of [faces.nw, faces.se]) {
    for (let q = 3; q < f.L - 2; q += 6.4) { if ((f === faces.nw && q > 19 && q < 38) || (f === faces.se && ((q > 29 && q < 47) || q < 14))) continue; WINS.push([f, q, 1.5, q + 1.3, 3.2, 0.3]); }
    for (const q of f === faces.nw ? [6, 12, 44, 50] : [18, 24, 50, 54]) for (const [y0, y1] of [[7.4, 8.6], [10.0, 11.0], [13.0, 14.0]]) WINS.push([f, q, y0, q + 0.9, y1, 0.2]);
  }
  for (const [f, a, b, c, d] of WINS) hole(f, a, b, c, d);
  hole(faces.nw, PN[0], 5.4, PN[1], 14.6); hole(faces.se, PS[0], 5.4, PS[1], 14.6); // portico recesses
  for (const f of Object.values(faces)) {
    holey(B.stone, f, 0, PL, S.stone); holey(B.brick, f, PL, EAVE, S.brick); quad(F.stoneF, f, 0, 0, f.L, PL, 0, S.stone); quad(F.brickF, f, 0, PL, f.L, EAVE, 0, S.brick);
    // belt courses and frieze/cornice (m: Street View shows a string course at the basement top, one at ~half height and a deep cornice under the eave)
    for (const [y0, y1, o] of [[PL - 0.05, PL + 0.45, 0.2], [11.1, 11.6, 0.14], [15.6, 16.4, 0.15], [16.4, EAVE, 0.45]]) sillBox(f, 0, y0, f.L, y1, o);
    for (let s = 0.4; s < f.L - 0.4; s += 0.55) sillBox(f, s, 15.15, s + 0.28, 15.6, 0.22); // dentils
  }
  // roof: four trapezoids to the flat top + overhang soffit + fascia (closed, outer ring at EAVE - OV*TAN)
  const yo = EAVE - OV * TAN, inset = (TOP - yo) / TAN - OV;
  const out = hc.map(([u, v], i) => [u + (i === 0 || i === 3 ? -OV : OV), v + (i < 2 ? -OV : OV)]), inn = [[H.u0 + inset, H.v0 + inset], [H.u1 - inset, H.v0 + inset], [H.u1 - inset, H.v1 - inset], [H.u0 + inset, H.v1 - inset]];
  const pt = (uv, y) => { const w = W(uv[0], uv[1]); return [w[0], y, w[1]]; };
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4, a = pt(out[i], yo), b = pt(out[j], yo), c = pt(inn[j], TOP), d = pt(inn[i], TOP);
    const w = Math.hypot(b[0] - a[0], b[2] - a[2]), hh = Math.hypot((c[0] + d[0] - a[0] - b[0]) / 2, c[1] - a[1], (c[2] + d[2] - a[2] - b[2]) / 2), off = (w - Math.hypot(c[0] - d[0], c[2] - d[2])) / 2;
    B.tile.q(a, b, c, d, 1, 1, [[0, 0], [w, 0], [w - off, hh], [off, hh]]); F.tileF.q(a, b, c, d, 1, 1, [[0, 0], [w, 0], [w - off, hh], [off, hh]]);
    const e0 = pt(hc[i], EAVE), e1 = pt(hc[j], EAVE), o0 = pt(out[i], yo), o1 = pt(out[j], yo);
    B.dark.q(e0, e1, o1, o0, 1, 1); B.dark.q(o0, o1, [o1[0], yo + 0.5, o1[2]], [o0[0], yo + 0.5, o0[2]], 1, 1); // soffit + fascia
    for (let s = 0.45; s < w - 0.45; s += 0.9) { // raised tile seams every 0.9 m up the slope
      const t = s / w, base = [a[0] + (b[0] - a[0]) * t, a[1], a[2] + (b[2] - a[2]) * t], topP = [d[0] + (c[0] - d[0]) * t, TOP, d[2] + (c[2] - d[2]) * t];
      const nx = (-(b[2] - a[2]) / w) * 0.03, nz = ((b[0] - a[0]) / w) * 0.03;
      B.tile.q([base[0] - nx, base[1] + 0.04, base[2] - nz], [base[0] + nx, base[1] + 0.04, base[2] + nz], [topP[0] + nx, topP[1] + 0.04, topP[2] + nz], [topP[0] - nx, topP[1] + 0.04, topP[2] - nz], 0.2, 0.2);
    }
  }
  const topPts = inn.map((p) => W(p[0], p[1]));
  fillPoly(B.flat, topPts, TOP, 0.3); fillPoly(F.flatF, topPts, TOP, 0.3);
  const rr = rng(3); // g: rooftop plant
  for (let i = 0; i < 6; i++) { const [x, z] = W(inn[0][0] + 3 + rr() * 24, inn[0][1] + 3 + rr() * 34); box(B.flat, x, TOP, z, x + 1.5 + rr() * 2.5, TOP + 1 + rr() * 1.2, z + 1.5 + rr() * 2, 0.4); }

  // ---------------- fly tower (g footprint; brick, flat dark roof) ----------------
  { const T = TOWER, tc = [[T.u0, T.v0], [T.u1, T.v0], [T.u1, T.v1], [T.u0, T.v1]];
    const tf = [face([T.u0, T.v0], [T.u1, T.v0], [0, -1]), face([T.u1, T.v0], [T.u1, T.v1], [1, 0]), face([T.u1, T.v1], [T.u0, T.v1], [0, 1]), face([T.u0, T.v1], [T.u0, T.v0], [-1, 0])];
    for (const f of tf) {
      quad(B.brick, f, 0, EAVE - 0.3, f.L, T.top, 0, S.brick); quad(F.brickF, f, 0, EAVE - 0.3, f.L, T.top, 0, S.brick);
      sillBox(f, 0, T.top - 1.4, f.L, T.top - 0.9, 0.18); sillBox(f, 0, T.top - 0.9, f.L, T.top, 0.4); sillBox(f, 0, 23.0, f.L, 23.5, 0.14);
    }
    const tp = tc.map(([u, v]) => W(u, v)); fillPoly(B.dark, tp, T.top, 0.3); fillPoly(F.darkF, tp, T.top, 0.3);
  }

  // ---------------- rotunda drum (half cylinder R 21 + straight infill), closed ----------------
  { const D = DRUM, arc = [[56.4, D.v0], [D.cu, D.v0]], N = 40, cw = W(D.cu, D.cv);
    for (let i = 1; i < N; i++) { const a = -Math.PI / 2 + (Math.PI * i) / N; arc.push([D.cu + D.R * Math.cos(a), D.cv + D.R * Math.sin(a)]); }
    arc.push([D.cu, D.v1], [56.4, D.v1]);
    const pts = arc.map(([u, v]) => W(u, v)), n = pts.length, grow = (p, k) => [p[0] + ((p[0] - cw[0]) / D.R) * k, p[1] + ((p[1] - cw[1]) / D.R) * k];
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      wall(B.stone, a, b, 0, 4.6, S.stone); wall(B.brick, a, b, 4.6, D.h - 1.3, S.brick); wall(B.stone, a, b, D.h - 1.3, D.h, S.stone); wall(F.stoneF, a, b, 0, 4.6, S.stone); wall(F.brickF, a, b, 4.6, D.h - 1.3, S.brick);
      if (i >= 2 && i < n - 3) { // cornice overhang, pilasters, two window bands (g)
        const a2 = grow(a, 0.4), b2 = grow(b, 0.4);
        wall(B.stone, a2, b2, D.h - 0.5, D.h + 0.15, S.stone); B.stone.q([a2[0], D.h + 0.15, a2[1]], [b2[0], D.h + 0.15, b2[1]], [b[0], D.h + 0.15, b[1]], [a[0], D.h + 0.15, a[1]], 1, 1);
        B.stone.q([a[0], D.h - 0.5, a[1]], [b[0], D.h - 0.5, b[1]], [b2[0], D.h - 0.5, b2[1]], [a2[0], D.h - 0.5, a2[1]], 1, 1);
        if (i % 2 === 0) wall(B.stone, grow(a, 0.3), grow([a[0] + (b[0] - a[0]) * 0.35, a[1] + (b[1] - a[1]) * 0.35], 0.3), 4.6, D.h - 1.3, 1);
        for (const [y0, y1] of [[6.2, 7.6], [9.2, 10.6]]) {
          const wa = grow([a[0] + (b[0] - a[0]) * 0.18, a[1] + (b[1] - a[1]) * 0.18], 0.04), wb = grow([a[0] + (b[0] - a[0]) * 0.62, a[1] + (b[1] - a[1]) * 0.62], 0.04);
          B.glass.q([wa[0], y0, wa[1]], [wb[0], y0, wb[1]], [wb[0], y1, wb[1]], [wa[0], y1, wa[1]], 1, 1);
        }
      }
    }
    fillPoly(B.flat, pts, D.h, 0.3); fillPoly(F.flatF, pts, D.h, 0.3);
  }

  // ---------------- annex (m: LiDAR flat 3.3-4 m) ----------------
  { const A = ANNEX; ubox(B.brick, A.u0, A.v0, A.u1, A.v1, 0, A.h, S.brick); ubox(F.brickF, A.u0, A.v0, A.u1, A.v1, 0, A.h, S.brick); }

  // ---------------- porticoes (m: Street View shows one on each long face, six limestone pilasters, stair to a podium) ----------------
  const portico = (f, c0, c1) => {
    const pb = PL + 0.2, pt2 = 14.6;
    sillBox(f, c0 - 0.8, 0, c1 + 0.8, 1.7, 3.6);
    for (let k = 0; k < 6; k++) sillBox(f, c0 + 0.2, k * 0.28, c1 - 0.2, (k + 1) * 0.28, 3.6 + (6 - k) * 0.42);
    quad(B.stone, f, c0, pb, c1, pt2, -0.6, S.stone); for (const sx of [c0, c1]) B.stone.q(f.P(sx, pb, 0), f.P(sx, pb, -0.6), f.P(sx, pt2, -0.6), f.P(sx, pt2, 0), 1, 1); B.stone.q(f.P(c0, pt2, 0), f.P(c1, pt2, 0), f.P(c1, pt2, -0.6), f.P(c0, pt2, -0.6), 1, 1);
    quad(B.glass, f, c0 + 0.5, 6.4, c1 - 0.5, 13.0, -0.65);
    for (let k = 0; k < 7; k++) { const s = c0 + 0.15 + (k * (c1 - c0 - 0.7)) / 6; sillBox(f, s, 1.7, s + 0.7, 15.0, 0.75); }
    sillBox(f, c0 - 0.5, 15.0, c1 + 0.5, 16.4, 1.1); sillBox(f, c0 - 0.3, 14.2, c1 + 0.3, 15.0, 0.8);
    for (let k = 0; k < 5; k++) { const s = c0 + 1.3 + k * 2.6; quad(B.iron, f, s, 1.7, s + 1.6, 4.8, -0.02); }
  };
  portico(faces.nw, PN[0], PN[1]); portico(faces.se, PS[0], PS[1]);
  for (const [f, a, b, c, d, dep] of WINS) win(f, a, b, c, d, dep);
  { const f = faces.se; // entrance stair with iron rails and planter at the tower end, green awning just before the portico (m: Street View frame XvC h0); s counts from the +u end
    for (let k = 0; k < 5; k++) sillBox(f, 3.0, k * 0.2, 11, (k + 1) * 0.2, 0.9 + (5 - k) * 0.5);
    for (const s of [2.8, 11.2]) sillBox(f, s - 0.05, 0, s + 0.05, 1.8, 3.6);
    sillBox(f, 11.8, 0, 17, 0.9, 3.4);
    const a0 = 24.4, a1 = 30.2; sillBox(f, a0 - 0.3, 3.1, a1 + 0.3, 3.35, 2.7);
    B.awning.q(f.P(a0, 3.35, 0), f.P(a1, 3.35, 0), f.P(a1, 3.9, 2.7), f.P(a0, 3.9, 2.7), 1, 1); B.awning.q(f.P(a0, 3.1, 2.7), f.P(a1, 3.1, 2.7), f.P(a1, 3.9, 2.7), f.P(a0, 3.9, 2.7), 1, 1);
    for (const s of [a0, a1]) { const q = f.P(s, 0, 2.6); box(B.iron, q[0] - 0.05, 0, q[2] - 0.05, q[0] + 0.05, 3.4, q[2] + 0.05, 1); }
  }
  // ---------------- site: paving from OSM within 130 m ----------------
  const cx = W(40, 40);
  for (const p of data.paths) {
    if (!p.points.some(([x, z]) => Math.hypot(x - cx[0], z - cx[1]) < 130) || p.hw === 'steps') continue;
    const road = p.kind === 'road' && p.hw !== 'pedestrian', w = p.hw === 'service' ? 5.5 : road ? 7 : p.hw === 'pedestrian' ? 4.5 : p.hw === 'cycleway' ? 2.6 : 2.4;
    ribbon(road ? B.asph : B.conc, p.points, w, 0.05, 0.35);
  }

  const near3 = new Group(), far3 = new Group();
  for (const b of Object.values(B)) if (b.p.length) near3.add(b.mesh());
  for (const b of Object.values(F)) if (b.p.length) far3.add(b.mesh());
  const group = new Group(); group.name = 'elliott'; group.add(near3, far3); far3.visible = false;
  // near/far swap at FAR m from the building centre, driven by the render camera (hysteresis 10 m)
  const C = W(40, 30), pump = new Mesh(new BoxGeometry(0.01, 0.01, 0.01), new MeshBasicMaterial({ visible: false })); pump.frustumCulled = false;
  pump.onBeforeRender = (r, sc, camera) => { const d = Math.hypot(camera.position.x - C[0], camera.position.z - C[1]), f = d > FAR + (far3.visible ? -10 : 0); far3.visible = f; near3.visible = !f; };
  group.add(pump);
  const tris = Object.values(B).reduce((s, b) => s + b.tris, 0), trisFar = Object.values(F).reduce((s, b) => s + b.tris, 0);
  const solids = [data.ring.map(([x, z]) => [x, z]), [W(20.2, -3.6), W(36.4, -3.6), W(36.4, 0), W(20.2, 0)]];
  return { id: 'elliott', group, solids, stats: { tris, trisFar }, update() {} };
}
