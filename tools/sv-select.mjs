// Choose up to 2 panos per non-hotspot building: Google-captured, 8-60 m from a wall that faces the pano and is not blocked by other footprints.
// -> data/raw/streetview-tiles/selection.json + inventory table + tile estimate. Usage: node tools/sv-select.mjs [zoom=4]
import fs from 'node:fs';
import { DIR, toXZ } from './sv-common.mjs';
const zone = JSON.parse(fs.readFileSync(new URL('../data/zones/mall-union.json', import.meta.url)));
const panos = Object.values(JSON.parse(fs.readFileSync(DIR + 'panos.json')));
const HOT = new Set(['way/508846031', 'way/117146490', 'way/74151922', 'way/301837711']); // WALC, Union, Elliott, Bell Tower
const ccw = (a, b, c) => (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
const cross = (a, b, c, d) => ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) if ((poly[i][1] > pt[1]) !== (poly[j][1] > pt[1]) && pt[0] < ((poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1])) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c; return c; };
// Google captures >= 13312 px, contributor panos >= 5000 px; panos inside any footprint (interiors) dropped
const ok = panos.filter((p) => p.imageWidth >= (p.copyright.endsWith('Google') ? 13312 : 5000)).map((p) => ({ ...p, xz: toXZ(p.lat, p.lng) })).filter((p) => !zone.colliders.some((o) => inside(p.xz, o.poly)));
const sel = {}, rows = [];
for (const c of zone.colliders) {
  if (HOT.has(c.id) || c.poly.length < 3) continue;
  const poly = c.poly, others = zone.colliders.filter((o) => o !== c && !(o.id === 'way/301837711')).map((o) => o.poly);
  const cand = [];
  for (const p of ok) {
    if (inside(p.xz, poly)) continue;
    let best = null;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 8) continue;
      let vis = 0, d = 0, cos = 0;
      for (let k = 0; k < 5; k++) {
        const t = (k + 0.5) / 5, s = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        const dx = p.xz[0] - s[0], dz = p.xz[1] - s[1], dd = Math.hypot(dx, dz);
        const nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L, cs = Math.abs(dx * nx + dz * nz) / dd; // wall normal vs view
        const near = [s[0] + dx / dd * 0.3, s[1] + dz / dd * 0.3]; // nudge off the wall toward the pano
        const front = !inside(near, poly);
        const blocked = others.some((o) => { for (let m = 0; m < o.length; m++) if (cross(p.xz, near, o[m], o[(m + 1) % o.length])) return true; return false; });
        if (front && !blocked) { vis++; d += dd; cos += cs; }
      }
      if (vis < 2) continue;
      d /= vis; cos /= vis;
      if (d < 8 || d > 80) continue;
      const score = (vis / 5) * Math.min(L, 40) * cos / (1 + Math.abs(d - 22) / 20) * (+p.date.slice(0, 4) >= 2019 ? 1.3 : 1);
      if (!best || score > best.score) best = { score, edge: i, L: Math.round(L), d: Math.round(d), cos: +cos.toFixed(2), vis };
    }
    if (best) cand.push({ panoId: p.panoId, date: p.date, w: p.imageWidth, copyright: p.copyright, ...best });
  }
  cand.sort((a, b) => b.score - a.score);
  const pick = [];
  for (const k of cand) if (pick.length < 2 && pick.every((q) => q.edge !== k.edge || q.panoId === k.panoId)) pick.push(k);
  sel[c.id] = { name: c.name || null, picks: pick, ncand: cand.length };
  rows.push(`${c.id.padEnd(18)} ${(c.name || '-').slice(0, 30).padEnd(30)} cand ${String(cand.length).padStart(3)}  ` + pick.map((k) => `${k.panoId.slice(0, 6)} ${k.date} d${k.d} L${k.L} q${k.score.toFixed(0)}`).join(' | '));
}
const Z = +process.argv[2] || 4, uniq = new Map();
for (const s of Object.values(sel)) for (const k of s.picks) uniq.set(k.panoId, k.w);
const tiles = [...uniq.values()].reduce((n, w) => n + Math.ceil(w / 2 ** (5 - Z) / 512) * Math.ceil(w / 2 / 2 ** (5 - Z) / 512), 0);
fs.writeFileSync(DIR + 'selection.json', JSON.stringify(sel, null, 1));
console.log(rows.join('\n'));
console.log(`buildings ${rows.length}, none ${Object.values(sel).filter((s) => !s.picks.length).length}, unique panos ${uniq.size}, zoom ${Z} tiles ${tiles}, cost at $2/1000 (no free tier) $${(tiles / 500).toFixed(2)}`);
