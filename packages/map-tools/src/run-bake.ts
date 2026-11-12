import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { type BakeOptions, bakeZone, ENGINEERING_MALL } from './bake-zone.ts';
import type { Campus } from './types.ts';

// usage: pnpm map:bake [zone ...]   (default: every zone in data/zones.config.json)
const root = new URL('../../../data/', import.meta.url);
const campus = JSON.parse(readFileSync(new URL('campus.json', root), 'utf8')) as Campus;
const config = JSON.parse(readFileSync(new URL('zones.config.json', root), 'utf8')) as Record<
  string,
  Partial<BakeOptions>
>;
const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(config);
mkdirSync(new URL('zones/', root), { recursive: true });
for (const name of names) {
  const cfg = config[name];
  if (!cfg) throw new Error(`unknown zone "${name}"; known: ${Object.keys(config).join(', ')}`);
  const t0 = performance.now();
  const zone = bakeZone(campus, { ...ENGINEERING_MALL, ...cfg });
  const json = JSON.stringify(zone);
  writeFileSync(new URL(`zones/${name}.json`, root), json);
  console.log(name, {
    ms: Math.round(performance.now() - t0),
    bytes: json.length,
    colliders: zone.colliders.length,
    props: zone.props.length,
    spawns: zone.spawns.length,
    navNodes: zone.nav.nodes.length,
    navEdges: zone.nav.edges.length,
    landmarks: zone.landmarks,
  });
}
