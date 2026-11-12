// WALC watertightness check. Opens ?walk=1 in headless Chrome and raycasts window.__walcRoot (near LOD, no props) in the page:
//  A) from probe points inside every enclosed volume, Fibonacci-sphere rays that reach 400 m (downward rays: the y=0 ground) without hitting the shell = hole;
//  B) from ring points at 0.3 / 1.7 / 4 m around the building, segments to the probes that arrive unblocked = see-through
//     (how the owner saw it: standing outside, looking past the glazing at a point behind it).
// Prints a report (and writes docs/walc-holes.md with --write). Exit 1 when holes remain.   usage: node tools/walc-holes.mjs [--write]
import { writeFileSync } from 'node:fs';

process.env.DIST = 'packages/saltline/dist-walk';
process.env.PAGE = 'index.html?walk=1&cam=0,1.7,0,41,7,-2';
const { sleep, withPage } = await import('./chrome.mjs');
const page = () => {
  const root = window.__walcRoot, tri = [], CS = 4, grid = new Map();
  const skip = (o) => { for (let q = o; q; q = q.parent) if (q.name === 'far' || q.name === 'props') return true; return false; };
  root.updateMatrixWorld(true);
  root.traverse((m) => {
    if (!m.isMesh || skip(m)) return;
    const g = m.geometry, P = g.attributes.position, I = g.index, e = m.matrixWorld.elements, n = I ? I.count : P.count;
    const v = (i) => { const x = P.getX(i), y = P.getY(i), z = P.getZ(i); return [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]]; };
    for (let i = 0; i < n; i += 3) { const t = [v(I ? I.getX(i) : i), v(I ? I.getX(i + 1) : i + 1), v(I ? I.getX(i + 2) : i + 2)]; t.tile = m.material.name === 'tile'; tri.push(t); }
  });
  tri.forEach((t, k) => {
    const lo = [0, 1, 2].map((a) => Math.min(t[0][a], t[1][a], t[2][a])), hi = [0, 1, 2].map((a) => Math.max(t[0][a], t[1][a], t[2][a]));
    for (let x = Math.floor(lo[0] / CS); x <= Math.floor(hi[0] / CS); x++) for (let y = Math.floor(lo[1] / CS); y <= Math.floor(hi[1] / CS); y++) for (let z = Math.floor(lo[2] / CS); z <= Math.floor(hi[2] / CS); z++) {
      const key = x + ',' + y + ',' + z; let a = grid.get(key); if (!a) grid.set(key, (a = [])); a.push(k);
    }
  });
  const stamp = new Int32Array(tri.length); let sid = 0;
  // nearest hit along o + t d for t in (1e-3, tmax), Moller-Trumbore, both sides; Infinity if none. Voxels are sampled every 1 m (voxel 4 m).
  const hit = (o, d, tmax) => {
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
        if (u < -1e-6 || u > 1 + 1e-6) continue;
        const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]);
        if (v < -1e-6 || u + v > 1 + 1e-6) continue;
        const tt = f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
        if (window.__collect && tt > 1e-3) window.__collect.push([tt, k]);
        if (tt > 1e-3 && tt < best) { best = tt; window.__lastK = k; }
      }
    }
    return best < tmax ? best : Infinity;
  };
  window.__hit = hit; window.__tri = tri; // for ad-hoc probing
  // enclosed volumes: [name, x0, x1, z0, z1, heights]
  const VOL = window.__walcVol || [
    ['north pavilion', 46, 96, -51, -37, [2.5, 7.9, 13.7, 16.7, 17.8]], ['south pavilion', 46, 96, 10, 25, [2.5, 7.9, 13.7, 16.7, 17.8]],
    ['mid block', 52, 88, -30, 3, [2.5, 7.6, 13, 15.6]], ['east wing', 91.5, 94.5, -20, 0, [2.5, 5.5]], ['south bulge', 49, 59, 29.5, 31, [2.5, 7, 12]],
  ];
  const probes = [];
  for (const [nm, x0, x1, z0, z1, ys] of VOL) for (const y of ys) for (let x = x0; x <= x1 + 0.01; x += Math.max(4, (x1 - x0) / 6)) for (let z = z0; z <= z1 + 0.01; z += Math.max(4, (z1 - z0) / 3)) probes.push({ nm, p: [x, y, z] });
  const polyPts = window.__walcEdges.slice(0, -1).map((e) => e[0]);
  const inside = (x, z) => { let c = false; for (let i = 0, j = polyPts.length - 1; i < polyPts.length; j = i++) { const [xi, zi] = polyPts[i], [xj, zj] = polyPts[j]; if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
  const exitAt = (p, d) => { let t = 0; while (t < 150 && inside(p[0] + d[0] * t, p[2] + d[2] * t)) t += 0.25; return [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t]; }; // where the escaping ray leaves the footprint: the hole's neighbourhood
  const bad = new Map(), note = (k, s, cell = s) => { const e = bad.get(k) || { n: 0, ex: [], cells: new Map() }; e.n++; e.cells.set(cell, (e.cells.get(cell) || 0) + 1); if (e.ex.length < 3) e.ex.push(s); bad.set(k, e); };
  const r1 = (a) => a.map((v) => +v.toFixed(1)).join(',');
  let nA = 0, nB = 0, tA = 0, tB = 0;
  const N = 300, ga = Math.PI * (3 - Math.sqrt(5));
  for (const { nm, p } of probes) {
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), d = [Math.cos(ga * i) * r, y, Math.sin(ga * i) * r]; tA++;
      if (hit(p, d, d[1] < 0 ? p[1] / -d[1] : 400) === Infinity && d[1] >= 0) { nA++; note('A ' + nm, 'exit ' + r1(exitAt(p, d)), r1(exitAt(p, d).map((v) => Math.round(v / 2) * 2))); }
    }
  }
  // C: looking up from the ground / 1.7 m around the building (incl. under the eaves): the first thing hit must not be a roof tile seen from its underside (= missing soffit)
  let tC = 0, nC = 0;
  const near = [];
  for (const [x0, x1, z0, z1] of [[34, 106, -62, -34], [34, 106, 6, 36], [34, 46, -34, 6], [96, 106, -34, 6]]) for (let x = x0; x <= x1; x += 3) for (let z = z0; z <= z1; z += 3) if (!inside(x, z)) for (const y of [0.3, 1.7]) near.push([x, y, z]);
  for (const o of near) for (let i = 0; i < 60; i++) {
    const az = i * ga * 2, el = 0.15 + (i % 6) * 0.22, d = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)]; tC++;
    window.__collect = []; const best = hit(o, d, 80); if (best === Infinity) continue;
    const t = tri[window.__lastK]; if (!t.tile || window.__collect.some(([tt, k]) => tt < best + 0.05 && !tri[k].tile)) continue; // a wall meeting the tile within 5 cm is a joint, not a hole
    const e1 = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], e2 = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; if (n[1] < 0) n = n.map((v) => -v); // roof tile normals point up
    if (d[0] * n[0] + d[1] * n[1] + d[2] * n[2] > 0) { nC++; note('C roof underside seen from below', 'from ' + r1(o) + ' dir ' + r1(d.map((v) => v * 10)), r1(o.map((v) => Math.round(v / 6) * 6))); }
  }
  window.__collect = null;
  const ring = [];
  for (let x = 28; x <= 116; x += 6) for (let z = -72; z <= 46; z += 6) if (x < 38 || x > 104 || z < -62 || z > 36 || (x > 100 && z > -33)) for (const y of [0.3, 1.7, 4]) ring.push([x, y, z]);
  for (const o of ring) for (const { nm, p } of probes) {
    if (Math.abs(Math.floor(o[0] * 7 + o[2] * 3 + p[0] * 5 + p[1] * 11 + p[2] * 13)) % 9) continue; // sparse subset: ~1/9 of the pairs
    const d = [p[0] - o[0], p[1] - o[1], p[2] - o[2]], L = Math.hypot(...d); d[0] /= L; d[1] /= L; d[2] /= L; tB++;
    if (hit(o, d, L - 0.05) === Infinity) { nB++; note('B ' + nm, 'from ' + r1(o) + ' to ' + r1(p)); }
  }
  return { tris: tri.length, probes: probes.length, rays: tA, nA, raysB: tB, nB, nC, tC, bad: [...bad].map(([k, v]) => [k, { n: v.n, ex: v.ex, cells: [...v.cells].sort((a, b) => b[1] - a[1]).slice(0, 12) }]) };
};
let res;
await withPage([], { uncapped: false }, async ({ ev, logs }) => {
  for (let i = 0; i < 160 && !(await ev('window.__ready === true && !!window.__walcRoot')); i++) await sleep(250);
  res = await ev(`(${page})()`);
  if (logs.length) console.log('page errors:', logs);
});
const lines = [`tris ${res.tris}, probes ${res.probes}; A escapes ${res.nA}/${res.rays}; B see-through ${res.nB}/${res.raysB}; C tile-from-below ${res.nC}/${res.tC}`];
for (const [k, v] of res.bad.sort()) lines.push(`${k}: ${v.n}  e.g. ${v.ex.join(' | ')}${v.cells.length > 1 || v.cells[0][0].startsWith('f') ? '' : ''}\n    top cells (2 m): ${v.cells.map(([c, n]) => c.replace(/^from.*\|/, '') + ' x' + n).join('; ')}`);
console.log(lines.join('\n'));
if (process.argv.includes('--write'))
  writeFileSync(
    new URL('../docs/walc-holes.md', import.meta.url),
    `# WALC hole check (tools/walc-holes.mjs)\n\nRaycasts the near-LOD WALC mesh in headless Chrome. A: rays from probe points inside each enclosed volume must hit the shell; B: segments from ring points outside to those probes must be blocked; C: rays looking up from 0.3 / 1.7 m around the building must never see a roof tile from its underside.\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n`,
  );
process.exit(res.nA + res.nB + res.nC ? 1 : 0);
