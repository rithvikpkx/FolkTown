import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { RAW, RAW_GZ } from './fetch.ts';
import { type El, project } from './osm.ts';
import { toSvg } from './svg.ts';

const raw = existsSync(RAW)
  ? readFileSync(RAW, 'utf8')
  : gunzipSync(readFileSync(RAW_GZ)).toString();
const { elements } = JSON.parse(raw) as { elements: El[] };

const bell = elements.find(
  (e) =>
    /bell tower/i.test(e.tags?.name ?? '') &&
    (e.tags?.building || e.tags?.tourism || e.tags?.man_made),
);
if (!bell) throw new Error('Bell Tower not found in OSM data');
const pts =
  bell.type === 'node'
    ? [{ lat: bell.lat as number, lon: bell.lon as number }]
    : (bell.geometry ?? bell.members?.flatMap((m) => m.geometry ?? []) ?? []).filter(
        (p) => p != null,
      );
const origin = {
  lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
  lon: pts.reduce((s, p) => s + p.lon, 0) / pts.length,
  name: bell.tags?.name ?? 'Bell Tower',
};

const campus = project(elements, origin);
const out = new URL('../../../data/', import.meta.url);
mkdirSync(new URL('debug/', out), { recursive: true });
writeFileSync(new URL('campus.json', out), JSON.stringify(campus));
writeFileSync(new URL('debug/campus.svg', out), toSvg(campus));
const b = campus.buildings;
console.log({
  origin,
  buildings: b.length,
  named: b.filter((x) => x.name).length,
  heightOrLevels: b.filter((x) => x.tags.height || x.tags['building:levels']).length,
  paths: campus.paths.length,
  trees: campus.trees.length,
  water: campus.water.length,
  grass: campus.grass.length,
  ...campus.stats,
  bytes: statSync(new URL('campus.json', out)).size,
});
