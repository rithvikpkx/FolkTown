import { readFileSync, writeFileSync } from 'node:fs';
import type { Campus } from './types.ts';

export type Heights = Record<string, { h: number; n: number }>;

/** Set `heightLidar` (metres above ground) on every building that has a LiDAR sample. */
export function mergeHeights(campus: Campus, heights: Heights): number {
  let n = 0;
  for (const b of campus.buildings) {
    const s = heights[b.id];
    if (s && s.h > 0) {
      b.heightLidar = s.h;
      n++;
    }
  }
  return n;
}

if (import.meta.main) {
  const dir = new URL('../../../data/', import.meta.url);
  const campus = JSON.parse(readFileSync(new URL('campus.json', dir), 'utf8')) as Campus;
  const heights = JSON.parse(readFileSync(new URL('heights.json', dir), 'utf8')) as Heights;
  console.log('merged', mergeHeights(campus, heights), 'of', campus.buildings.length);
  writeFileSync(new URL('campus.json', dir), JSON.stringify(campus));
  const known = [
    [/bell tower/i, 48.8],
    [/armstrong hall/i, 16.5],
  ] as const;
  for (const [re, k] of known)
    for (const b of campus.buildings.filter((x) => re.test(x.name ?? '')))
      console.log(b.name, 'lidar', b.heightLidar, 'known', k);
}
