// Watertightness check for the generated hero hotspots (union, elliott); generalises tools/walc-holes.mjs. Serves packages/saltline with vite, opens demo-hotspot.html?h=<id> in headless Chrome and
// raycasts the near-LOD mesh (window.__hsRoot; far LOD, trees and props are skipped) in the page:
//  A) from probe points inside every enclosed volume, Fibonacci-sphere rays that reach 400 m (downward rays: the y=0 ground) without hitting the shell = hole;
//  B) from ring points at 0.3 / 1.7 / 4 m around the building, segments to the probes that arrive unblocked = see-through (looking past the glazing at a point behind it);
//  C) rays looking up from 0.3 / 1.7 m around the building: the first thing hit must not be a roof tile (material named 'tile') seen from its underside = missing soffit.
// Prints a report (and writes docs/hotspot-holes.md with --write). Exit 1 when holes remain.   usage: node tools/hotspot-holes.mjs [union|elliott ...] [--write]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)), port = 5800 + Math.floor(Math.random() * 300);
const { sleep, withPage } = await import('./chrome.mjs');
const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
// ---- volume definitions: { name, poly, inset (probe margin from the walls), ys (probe heights) } and the occupied footprints (ring points must be outside all of them)
const O = [-72.7, -109.4], U = [-0.77272841, 0.6347368], V = [0.6347368, 0.77272841], W = ([u, v]) => [O[0] + U[0] * u + V[0] * v, O[1] + U[1] * u + V[1] * v];
const drum = [[56.4, 8], [66.4, 8]]; for (let i = 1; i < 40; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 40; drum.push([66.4 + 21 * Math.cos(a), 29.1 + 21 * Math.sin(a)]); } drum.push([66.4, 50.2], [56.4, 50.2]);
const MAIN = [[201.2, 202.2], [253.1, 202.2], [253.1, 276.3], [270.9, 276.3], [270.9, 263.8], [287.1, 263.8], [287.1, 271.3], [296.5, 271.3], [296.5, 297], [201.2, 297]];
const BAYS = [[210, 197, 215.5, 202.2, 8.2], [253.1, 220.5, 258.2, 244.9, 8.2], [253.1, 257.9, 257.8, 273.4, 8.2], [196.5, 234, 210.5, 246.5, 17], [196.9, 281.9, 201.2, 287.1, 6.2], [201.2, 297, 226.5, 301.6, 3.6],
  [226.5, 297, 247.3, 301.6, 6.8], [243, 285, 255.6, 299.4, 20.5], [254.6, 296.5, 258.2, 301.8, 6], [273.7, 296.5, 283.4, 301.4, 4.6]];
const CFG = {
  union: {
    vols: [{ name: 'main body', poly: MAIN, inset: 1.2, ys: [1.5, 4.5, 7.5] }, { name: 'under plateau', poly: MAIN, inset: 6.5, ys: [9.5, 12] },
      ...BAYS.map(([x0, z0, x1, z1, h], i) => ({ name: 'bay ' + i + ' (h ' + h + ')', poly: rect(x0, z0, x1, z1), inset: 0.8, ys: h > 12 ? [1.5, 5, 9, 13, h - 1] : h > 6 ? [1.5, h - 1] : [1.5, Math.max(2, h - 1)] }))],
    occ: [MAIN, ...BAYS.map(([x0, z0, x1, z1]) => rect(x0, z0, x1, z1)), rect(246.7, 299.4, 255.2, 308), rect(196, 233.5, 210.5, 247)], foot: MAIN, ringBox: [185, 190, 310, 315],
    cam: '248,60,330,248,8,250',
  },
  elliott: {
    vols: [{ name: 'hall', poly: [[0, 0], [56.4, 0], [56.4, 58.6], [0, 58.6]].map(W), inset: 1.2, ys: [2, 6, 10, 14, 17] }, { name: 'under hip roof', poly: [[0, 0], [56.4, 0], [56.4, 58.6], [0, 58.6]].map(W), inset: 8.5, ys: [19.5, 21.5] },
      { name: 'fly tower', poly: [[34, 30], [56.4, 30], [56.4, 58.6], [34, 58.6]].map(W), inset: 1, ys: [19, 24, 29] }, { name: 'drum', poly: drum.map(W), inset: 1, ys: [2, 6, 10] },
      { name: 'annex', poly: [[-9.7, 3], [0, 3], [0, 55.5], [-9.7, 55.5]].map(W), inset: 0.8, ys: [1.5, 3] }],
    occ: [[[-9.7, 3], [56.4, 3], [87.5, 29], [56.4, 58.6], [-9.7, 58.6]].map(W), drum.map(W), [[0, 0], [56.4, 0], [56.4, 58.6], [0, 58.6]].map(W)], ringBox: [-175, -170, 0, 20],
    cam: '-20,60,-20,-85,10,-70',
  },
};

const page = (cfg) => {
  const root = window.__hsRoot, tri = [], CS = 4, grid = new Map();
  const skip = (o) => { for (let q = o; q; q = q.parent) if (!q.visible || q.name === 'far' || q.name === 'props' || q.isInstancedMesh) return true; return false; };
  root.updateMatrixWorld(true);
  root.traverse((m) => {
    if (!m.isMesh || skip(m) || !m.geometry.attributes.position) return;
    const g = m.geometry, P = g.attributes.position, I = g.index, e = m.matrixWorld.elements, n = I ? I.count : P.count;
    const v = (i) => { const x = P.getX(i), y = P.getY(i), z = P.getZ(i); return [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]]; };
    for (let i = 0; i < n; i += 3) { const t = [v(I ? I.getX(i) : i), v(I ? I.getX(i + 1) : i + 1), v(I ? I.getX(i + 2) : i + 2)]; t.tile = m.material.name === 'tile'; t.mn = m.material.color.getHexString() + (m.material.map ? 'm' : '') + (m.material.vertexColors ? 'v' : ''); tri.push(t); }
  });
  tri.forEach((t, k) => {
    const lo = [0, 1, 2].map((a) => Math.min(t[0][a], t[1][a], t[2][a]) - 0.55), hi = [0, 1, 2].map((a) => Math.max(t[0][a], t[1][a], t[2][a]) + 0.55); // padded by half the 1 m ray step so a corner-clipping ray still samples the voxel
    for (let x = Math.floor(lo[0] / CS); x <= Math.floor(hi[0] / CS); x++) for (let y = Math.floor(lo[1] / CS); y <= Math.floor(hi[1] / CS); y++) for (let z = Math.floor(lo[2] / CS); z <= Math.floor(hi[2] / CS); z++) {
      const key = x + ',' + y + ',' + z; let a = grid.get(key); if (!a) grid.set(key, (a = [])); a.push(k);
    }
  });
  const stamp = new Int32Array(tri.length); let sid = 0, collect = null, lastK = -1;
  const hit = (o, d, tmax) => { // nearest Moller-Trumbore hit along o + t d, t in (1e-3, tmax), both sides; voxels sampled every 1 m
    sid++; let best = Infinity;
    for (let t = 0; t < Math.min(tmax, best) + 1; t += 1) {
      const a = grid.get(Math.floor((o[0] + d[0] * t) / CS) + ',' + Math.floor((o[1] + d[1] * t) / CS) + ',' + Math.floor((o[2] + d[2] * t) / CS));
      if (!a) continue;
      for (const k of a) {
        if (stamp[k] === sid) continue; stamp[k] = sid;
        const [p0, p1, p2] = tri[k], e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], e2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
        const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], a0 = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
        if (Math.abs(a0) < 1e-12) continue;
        const f = 1 / a0, s = [o[0] - p0[0], o[1] - p0[1], o[2] - p0[2]], u = f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]);
        if (u < -1e-5 || u > 1 + 1e-5) continue;
        const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]);
        if (v < -1e-5 || u + v > 1 + 1e-5) continue;
        const tt = f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
        if (collect && tt > 1e-3) collect.push([tt, k]);
        if (tt > 1e-3 && tt < best) { best = tt; lastK = k; }
      }
    }
    return best < tmax ? best : Infinity;
  };
  window.__hit = hit; window.__tri = tri; // for ad-hoc probing
  const inPoly = (x, z, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, zi] = p[i], [xj, zj] = p[j]; if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
  const edgeDist = (x, z, p) => { let m = 1e9; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [ax, az] = p[j], [bx, bz] = p[i], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); m = Math.min(m, Math.hypot(x - ax - dx * t, z - az - dz * t)); } return m; };
  if (cfg.ray) { // debug: every triangle within 0.35 m of the segment o->t, with its material
    const [o, t] = [cfg.ray.slice(0, 3), cfg.ray.slice(3)], d = [t[0] - o[0], t[1] - o[1], t[2] - o[2]], L = Math.hypot(...d), out = [];
    d[0] /= L; d[1] /= L; d[2] /= L; collect = []; const b = hit(o, d, L); const hits = collect.map(([tt, k]) => [+tt.toFixed(2), tri[k].mn, tri[k].map((v) => v.map((q) => +q.toFixed(2)).join(',')).join(' ')]);
    return { ray: cfg.ray, first: b, hits: hits.sort((x, y) => x[0] - y[0]).slice(0, 12) };
  }
  const probes = [];
  for (const v of cfg.vols) {
    const xs = v.poly.map((p) => p[0]), zs = v.poly.map((p) => p[1]);
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += 4) for (let z = Math.min(...zs); z <= Math.max(...zs); z += 4) if (inPoly(x, z, v.poly) && edgeDist(x, z, v.poly) >= v.inset) for (const y of v.ys) probes.push({ nm: v.name, p: [x, y, z] });
  }
  const occupied = (x, z, m) => cfg.occ.some((p) => inPoly(x, z, p) || edgeDist(x, z, p) < m);
  const bad = new Map(), r1 = (a) => a.map((v) => +v.toFixed(1)).join(',');
  const note = (k, s, cell) => { const e = bad.get(k) || { n: 0, ex: [], cells: new Map() }; e.n++; e.cells.set(cell, (e.cells.get(cell) || 0) + 1); if (e.ex.length < 3) e.ex.push(s); bad.set(k, e); };
  const exitAt = (p, d) => { let t = 0; while (t < 150 && inPoly(p[0] + d[0] * t, p[2] + d[2] * t, cfg.foot)) t += 0.25; return [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t]; };
  let nA = 0, nB = 0, nC = 0, tA = 0, tB = 0, tC = 0;
  const N = 200, ga = Math.PI * (3 - Math.sqrt(5));
  for (const { nm, p } of probes) for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), d = [Math.cos(ga * i) * r, y, Math.sin(ga * i) * r]; tA++;
    if (hit(p, d, d[1] < 0 ? p[1] / -d[1] : 400) === Infinity && d[1] >= 0) { nA++; const ex = exitAt(p, d); note('A ' + nm, 'from ' + r1(p) + ' dir ' + r1(d.map((q) => q * 10)) + ' exit ' + r1(ex), r1(ex.map((v) => Math.round(v / 2) * 2))); }
  }
  const [bx0, bz0, bx1, bz1] = cfg.ringBox, ring = [];
  for (let x = bx0; x <= bx1; x += 4) for (let z = bz0; z <= bz1; z += 4) { if (occupied(x, z, 0.4)) continue; if (!cfg.occ.some((p) => edgeDist(x, z, p) < 14)) continue; ring.push([x, z]); }
  for (const [x, z] of ring) for (const y of [0.3, 1.7]) for (let i = 0; i < 48; i++) { // C: looking up
    const az = i * ga * 2, el = 0.15 + (i % 6) * 0.22, d = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)], o = [x, y, z]; tC++;
    collect = []; const best = hit(o, d, 80); if (best === Infinity) continue;
    const t = tri[lastK]; if (!t.tile || collect.some(([tt, k]) => tt < best + 0.05 && !tri[k].tile)) continue;
    const e1 = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], e2 = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; if (n[1] < 0) n = n.map((v) => -v); if (n[1] < 0.3 * Math.hypot(...n)) continue; // vertical cheeks (dormer sides) are walls, not roof planes
    if (d[0] * n[0] + d[1] * n[1] + d[2] * n[2] > 0) { nC++; note('C roof underside seen from below', 'from ' + r1(o) + ' dir ' + r1(d.map((v) => v * 10)), r1(o.map((v) => Math.round(v / 6) * 6))); }
  }
  collect = null;
  for (const [x, z] of ring) for (const y of [0.3, 1.7, 4]) for (let k = 0; k < probes.length; k++) {
    const { nm, p } = probes[k]; if (Math.abs(Math.floor(x * 7 + z * 3 + p[0] * 5 + p[1] * 11 + p[2] * 13)) % 25) continue;
    const o = [x, y, z], d = [p[0] - o[0], p[1] - o[1], p[2] - o[2]], L = Math.hypot(...d); d[0] /= L; d[1] /= L; d[2] /= L; tB++;
    if (hit(o, d, L - 0.05) === Infinity) { nB++; note('B ' + nm, 'from ' + r1(o) + ' to ' + r1(p), r1(o.map((v) => Math.round(v / 4) * 4))); }
  }
  return { tris: tri.length, probes: probes.length, rays: tA, nA, raysB: tB, nB, raysC: tC, nC, bad: [...bad].map(([k, v]) => [k, { n: v.n, ex: v.ex, cells: [...v.cells].sort((a, b) => b[1] - a[1]).slice(0, 10) }]) };
};

const args = process.argv.slice(2), rayArg = (args.find((a) => a.startsWith('--ray=')) || '').slice(6), names = args.filter((a) => CFG[a]), which = names.length ? names : Object.keys(CFG), out = [];
const vite = spawn('node', ['node_modules/vite/bin/vite.js', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root + 'packages/saltline', stdio: 'ignore' });
let bad = 0;
try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/demo-hotspot.html`)).ok) break; } catch {} await sleep(250); }
  for (const id of which) {
    const cfg = { ...CFG[id], foot: CFG[id].foot || CFG[id].occ[0], ray: rayArg ? rayArg.split(',').map(Number) : null };
    process.env.PAGE = `http://127.0.0.1:${port}/demo-hotspot.html?h=${id}&cam=${cfg.cam}&fov=60&w=400&hh=300`;
    let res;
    await withPage([], { uncapped: false }, async ({ ev, logs }) => {
      for (let i = 0; i < 240 && !(await ev('window.__ready === true && !!window.__hsRoot')); i++) await sleep(250);
      await sleep(1500);
      res = await ev(`(${page})(${JSON.stringify(cfg)})`);
      if (logs.length) console.log('page errors:', logs);
    });
    if (rayArg) { console.log(JSON.stringify(res, null, 1)); continue; }
    const lines = [`${id}: tris ${res.tris}, probes ${res.probes}; A escapes ${res.nA}/${res.rays}; B see-through ${res.nB}/${res.raysB}; C tile-from-below ${res.nC}/${res.raysC}`];
    for (const [k, v] of res.bad.sort()) lines.push(`  ${k}: ${v.n}  e.g. ${v.ex.join(' | ')}\n    top cells: ${v.cells.map(([c, n]) => c + ' x' + n).join('; ')}`);
    console.log(lines.join('\n')); out.push(...lines); bad += res.nA + res.nB + res.nC;
  }
} finally { vite.kill(); }
if (args.includes('--write'))
  writeFileSync(new URL('../docs/hotspot-holes.md', import.meta.url), `# Hotspot hole check (tools/hotspot-holes.mjs)\n\nRaycasts the near-LOD mesh of each hero hotspot in headless Chrome (demo-hotspot.html, far LOD, trees and props skipped).\nA: Fibonacci-sphere rays from probe points inside every enclosed volume must hit the shell (downward rays: the y=0 ground). B: segments from ring points outside (0.3 / 1.7 / 4 m) to those probes must be blocked (no see-through). C: rays looking up from 0.3 / 1.7 m around the building must not see a roof tile from its underside (missing soffit).\nRe-run: \`node tools/hotspot-holes.mjs union elliott --write\` (exit code 1 while any hole remains).\n\n\`\`\`\n${out.join('\n')}\n\`\`\`\n`);
process.exit(bad ? 1 : 0);
