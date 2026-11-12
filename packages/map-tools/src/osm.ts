import { joinRings, makeProjector, pointInRing, wind } from './geo.ts';
import type { Area, Campus, Path, Pt } from './types.ts';

type G = { lat: number; lon: number } | null;
export interface El {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  geometry?: G[];
  members?: { type: string; role: string; geometry?: G[] }[];
}

type LL = [number, number];
const ll = (g: G[]): LL[] => g.filter((p) => p != null).map((p) => [p.lat, p.lon]);
// Ring-point coordinates are lat/lon here, so pointInRing's (x, z) = (lat, lon) is fine for containment.

/** Rings (outer + holes) for a closed way or a multipolygon relation; null on failure. */
export function assemble(el: El): { outer: LL[]; holes: LL[][] }[] | null {
  if (el.type === 'way') {
    const g = ll(el.geometry ?? []);
    return g.length >= 4 ? [{ outer: g, holes: [] }] : null;
  }
  const m = el.members?.filter((x) => x.type === 'way' && x.geometry) ?? [];
  const outers = joinRings(m.filter((x) => x.role !== 'inner').map((x) => ll(x.geometry ?? [])));
  const inners = joinRings(m.filter((x) => x.role === 'inner').map((x) => ll(x.geometry ?? [])));
  if (!outers?.length || !inners) return null;
  const res = outers.map((outer) => ({ outer, holes: [] as LL[][] }));
  for (const h of inners)
    (res.find((r) => pointInRing(h[0] as Pt, r.outer as Pt[])) ?? res[0])?.holes.push(h);
  return res;
}

const ROADS = [
  'pedestrian',
  'service',
  'residential',
  'primary',
  'secondary',
  'tertiary',
  'unclassified',
  'living_street',
  'track',
];
const PATHS = ['footway', 'path', 'steps', 'cycleway'];

export function project(elements: El[], origin: Campus['origin']): Campus {
  const P = makeProjector(origin.lat, origin.lon);
  const pr = (r: LL[]): Pt[] => r.map(([a, o]) => P(a, o));
  const c: Campus = {
    origin,
    buildings: [],
    paths: [],
    trees: [],
    water: [],
    grass: [],
    stats: { failedRelations: 0, skippedElements: 0 },
  };

  for (const el of elements) {
    const tags = el.tags ?? {};
    const id = `${el.type}/${el.id}`;
    if (el.type === 'node') {
      if (tags.natural === 'tree' && el.lat != null && el.lon != null) {
        const [x, z] = P(el.lat, el.lon);
        c.trees.push({ id, x, z, tags });
      }
      continue;
    }
    let list: Area[] | null = null;
    if (tags.building || tags['building:part']) list = c.buildings;
    else if (tags.natural === 'water') list = c.water;
    else if (tags.landuse === 'grass' || tags.landuse === 'recreation_ground' || tags.leisure)
      list = c.grass;
    else if (el.type === 'way' && tags.highway) {
      const g = ll(el.geometry ?? []);
      if (g.length < 2) {
        c.stats.skippedElements++;
        continue;
      }
      const kind = PATHS.includes(tags.highway)
        ? (tags.highway as Path['kind'])
        : ROADS.includes(tags.highway)
          ? 'road'
          : 'other';
      c.paths.push({ id, kind, ...(tags.name ? { name: tags.name } : {}), points: pr(g), tags });
      continue;
    }
    if (!list) continue;
    const rings = assemble(el);
    if (!rings) {
      if (el.type === 'relation') c.stats.failedRelations++;
      else c.stats.skippedElements++;
      continue;
    }
    rings.forEach((r, i) => {
      list.push({
        id: rings.length > 1 ? `${id}#${i}` : id,
        ...(tags.name ? { name: tags.name } : {}),
        outer: wind(pr(r.outer), true),
        holes: r.holes.map((h) => wind(pr(h), false)),
        tags,
      });
    });
  }
  return c;
}
