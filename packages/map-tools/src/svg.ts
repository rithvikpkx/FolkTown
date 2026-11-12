import { signedArea } from './geo.ts';
import type { Campus, Pt } from './types.ts';

const d = (r: Pt[]) => `M${r.map(([x, z]) => `${x.toFixed(1)} ${z.toFixed(1)}`).join('L')}Z`;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function toSvg(c: Campus): string {
  const all = c.buildings.flatMap((b) => b.outer);
  const x0 = Math.min(...all.map((p) => p[0]));
  const x1 = Math.max(...all.map((p) => p[0]));
  const z0 = Math.min(...all.map((p) => p[1]));
  const z1 = Math.max(...all.map((p) => p[1]));
  const o = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${z0} ${x1 - x0} ${z1 - z0}" width="2400" style="background:#f4f1ea">`,
  ];
  for (const g of c.grass)
    o.push(
      `<path d="${[g.outer, ...g.holes].map(d).join('')}" fill="#cfe3b4" fill-rule="evenodd"/>`,
    );
  for (const w of c.water)
    o.push(
      `<path d="${[w.outer, ...w.holes].map(d).join('')}" fill="#9cc9e8" fill-rule="evenodd"/>`,
    );
  for (const p of c.paths) {
    const road = p.kind === 'road';
    const pts = p.points
      .map(([x, z], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${z.toFixed(1)}`)
      .join('');
    o.push(
      `<path d="${pts}" fill="none" stroke="${road ? '#b9b3a6' : '#d9a066'}" stroke-width="${road ? 5 : 1.2}"/>`,
    );
  }
  for (const t of c.trees)
    o.push(
      `<circle cx="${t.x.toFixed(1)}" cy="${t.z.toFixed(1)}" r="2.5" fill="#5f9b4a" opacity=".7"/>`,
    );
  for (const b of c.buildings)
    o.push(
      `<path d="${[b.outer, ...b.holes].map(d).join('')}" fill="#8d8a86" stroke="#4a4846" stroke-width=".4" fill-rule="evenodd"/>`,
    );
  o.push('<circle r="4" fill="red"/>'); // origin = Bell Tower
  for (const b of c.buildings) {
    if (!b.name || signedArea(b.outer) < 1200) continue;
    const cx = b.outer.reduce((s, p) => s + p[0], 0) / b.outer.length;
    const cz = b.outer.reduce((s, p) => s + p[1], 0) / b.outer.length;
    o.push(
      `<text x="${cx.toFixed(1)}" y="${cz.toFixed(1)}" font-size="9" text-anchor="middle" font-family="sans-serif" fill="#111" stroke="#fff" stroke-width=".3" paint-order="stroke">${esc(b.name)}</text>`,
    );
  }
  o.push('</svg>');
  return o.join('\n');
}
