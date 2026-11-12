// Campus-region loader for ?walk=1: the 'mall-union' zone (data/zones/mall-union.json, baked by `pnpm map:bake-region`).
//  - massing: every footprint becomes a facades.js building (chunked per 64 m, near/far LOD, LiDAR height, per-building wall/roof colour
//    from the bake, hip roofs on the brick halls). The far LOD stays visible at any distance and is the skyline layer.
//  - hotspots: src/campus/hotspots/*.js each export `build(G, zone) -> { id, group, solids, update?(t) }`; they replace the massing of
//    the footprints they cover (same id, or >30% overlap with a returned solid). Absent or throwing modules fall back to massing.
import { Group } from 'three';
import STYLES from './building-styles.json';
import { fetchZone, loadCampus } from './index.js';
import { hip } from './env/context.js';
import { roofOf } from './env/roofs.js';

const modules = import.meta.glob('./hotspots/*.js'); // lazy: one chunk per hotspot, none present is fine
const inPoly = (x, z, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > z) !== (p[j][1] > z) && x < ((p[j][0] - p[i][0]) * (z - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };

export const fetchRegion = () => fetchZone('mall-union');

// true when a footprint is mostly covered by any of the solids
function covered(poly, solids) {
  const xs = poly.map((p) => p[0]), zs = poly.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  let n = 0, hit = 0;
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
    const x = x0 + ((i + 0.5) / 10) * (x1 - x0), z = z0 + ((j + 0.5) / 10) * (z1 - z0);
    if (!inPoly(x, z, poly)) continue;
    n++; if (solids.some((s) => inPoly(x, z, s))) hit++;
  }
  return n > 0 && hit / n > 0.3;
}

/** Build every present hotspot; returns { groups, solids, replaced:Set<id>, names:[...] } */
export async function loadHotspots(G, zone, protect = []) {
  const out = { groups: [], solids: [], replaced: new Set(), names: [], failed: [] };
  for (const [path, load] of Object.entries(modules)) {
    const name = path.replace(/^.*\/|\.js$/g, '');
    try {
      const h = await (await load()).build(G, zone);
      if (!h || !h.group) throw new Error('build returned no group');
      const solids = h.solids || [];
      for (const c of zone.colliders) if (!protect.includes(c.id) && (c.id === h.id || covered(c.poly, solids))) out.replaced.add(c.id);
      out.groups.push(h.group); out.solids.push(...solids); out.names.push(name);
      if (h.update) (G.campusTick = G.campusTick || []).push((t) => h.update(t));
    } catch (e) { console.warn('[region] hotspot', name, 'failed, using massing', e); out.failed.push(name); }
  }
  return out;
}

/** buildFacades options: per-building styles from the bake (wall/roof colours) layered under building-styles.json, skip list, LOD distance */
export function massingOpts(zone, skip, far = 95) {
  const own = {};
  for (const c of zone.colliders) if (c.style) own[c.id] = c.style;
  const buildings = { ...own, ...STYLES.buildings };
  for (const id of Object.keys(buildings)) { const r = roofOf(id); if (r) buildings[id] = { ...buildings[id], roof: { ...buildings[id].roof, color: r.color } }; } // real roof colour from the Google mosaic
  for (const c of zone.colliders) { const r = roofOf(c.id); if (r && !buildings[c.id]) buildings[c.id] = { roof: { color: r.color } }; }
  return { skip, far, styles: { ...STYLES, buildings } };
}

/** hip roofs of the brick halls (the baked colliders carry `hip`); returns triangle count */
export function addHips(zone, root, skip) {
  const g = new Group(); g.name = 'region_hips';
  const wanted = new Map(zone.colliders.filter((c) => c.hip && !skip.includes(c.id)).map((c) => [c.id, c.hip]));
  let tris = 0;
  for (const f of loadCampus({ ...zone, colliders: zone.colliders.filter((c) => wanted.has(c.id)), landmarks: {} }).footprints) {
    const h = wanted.get(f.id), B = hip(f, h.rise, parseInt((roofOf(f.id)?.color ?? h.color).slice(1), 16)), m = B.mesh();
    m.castShadow = true; g.add(m); tris += B.p.length / 9;
  }
  root.add(g);
  return tris;
}

/** collision polygons ([[x,z]...]) of every massing building plus hotspot solids */
export const regionSolids = (zone, skip, hot) => [
  ...zone.colliders.filter((c) => !skip.includes(c.id) && c.poly.length > 2).map((c) => c.poly),
  ...hot.solids,
];
