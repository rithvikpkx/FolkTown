import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { bakeZone } from './bake-zone.ts';
import type { Campus } from './types.ts';

const root = new URL('../../../data/', import.meta.url);
const campus = JSON.parse(readFileSync(new URL('campus.json', root), 'utf8')) as Campus;
const zone = bakeZone(campus);
mkdirSync(new URL('zones/', root), { recursive: true });
const json = JSON.stringify(zone);
writeFileSync(new URL('zones/engineering-mall.json', root), json);
console.log({
  bytes: json.length,
  colliders: zone.colliders.length,
  props: zone.props.length,
  spawns: zone.spawns.length,
  navNodes: zone.nav.nodes.length,
  navEdges: zone.nav.edges.length,
});
