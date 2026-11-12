// pnpm map:streetview : official Street View Static API images around target buildings. Costs money.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Campus, Pt } from '../types.ts';
import { getKey, parseArgs, REPO, redact } from './env.ts';
import { unproject } from './math.ts';

export const TARGETS: [slug: string, match: RegExp][] = [
  ['walc', /\(WALC\)/],
  ['bell-tower', /Bell Tower/],
  ['dsai', /\(DSAI\)/],
  ['forney', /\(FRNY\)/],
  ['mechanical-engineering', /\(ME\)/],
  ['msee', /\(MSEE\)/],
  ['bhee', /\(BHEE\)/],
  ['duncan-annex', /Duncan Annex/],
  ['hovde', /\(HOVD\)/],
  ['stanley-coulter', /Stanley Coulter/],
  ['psychological-sciences', /\(PSYC\)/],
  ['elliott-hall-of-music', /\(ELLT\)/],
];
const USD_PER_IMAGE = 0.007; // list price at time of writing; check the current Street View Static pricing.

export interface Shot {
  building: string;
  x: number;
  z: number;
  lat: number;
  lon: number;
  heading: number;
}

const bearing = (x0: number, z0: number, x1: number, z1: number) =>
  ((Math.atan2(x1 - x0, -(z1 - z0)) * 180) / Math.PI + 360) % 360; // 0 = north (-z), 90 = east

/**
 * 4 camera positions per footprint (the points where the N/E/S/W rays from the centroid leave the
 * ring, pushed `offset` m outward, roughly the sidewalk), each with 4 headings: toward the building,
 * then +90, +180, +270.
 */
export function cameraShots(building: string, ring: Pt[], offset = 12): Shot[] {
  const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length;
  const cz = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  const out: Shot[] = [];
  for (const [dx, dz] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ] as const) {
    let t = 0; // farthest ray/edge crossing = outer boundary on that side
    for (let i = 0; i < ring.length; i++) {
      const [x1, z1] = ring[i] as Pt;
      const [x2, z2] = ring[(i + 1) % ring.length] as Pt;
      const ex = x2 - x1,
        ez = z2 - z1;
      const den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const tt = ((x1 - cx) * ez - (z1 - cz) * ex) / den;
      const u = ((x1 - cx) * dz - (z1 - cz) * dx) / den;
      if (tt > t && u >= 0 && u <= 1) t = tt;
    }
    const x = cx + dx * (t + offset),
      z = cz + dz * (t + offset);
    const [lat, lon] = unproject(x, z);
    const base = bearing(x, z, cx, cz);
    for (const k of [0, 90, 180, 270])
      out.push({ building, x, z, lat, lon, heading: (base + k) % 360 });
  }
  return out;
}

interface Meta {
  status: string;
  pano_id?: string;
  date?: string;
  copyright?: string;
  location?: { lat: number; lng: number };
}

export async function runStreetview(o: {
  key: string;
  campus: Campus;
  outDir: string;
  size: string;
  maxImages: number;
  yes: boolean;
  dryRun: boolean;
  base?: string;
  pitch?: number;
}) {
  const base = o.base ?? 'https://maps.googleapis.com/maps/api/streetview';
  const shots = TARGETS.flatMap(([slug, re]) => {
    const b = o.campus.buildings
      .filter((x) => x.name && re.test(x.name))
      .sort((a, c) => c.outer.length - a.outer.length)[0];
    return b ? cameraShots(slug, b.outer) : [];
  });
  const covered: (Shot & { meta: Meta })[] = [];
  const seen = new Set<string>();
  let metaCalls = 0;
  for (const s of shots) {
    metaCalls++;
    const u = `${base}/metadata?location=${s.lat},${s.lon}&radius=30&source=outdoor&key=${o.key}`;
    const r = await fetch(u);
    if (!r.ok) throw new Error(`metadata HTTP ${r.status} ${redact(u)}`);
    const meta = (await r.json()) as Meta;
    const id = `${meta.pano_id}/${s.heading.toFixed(0)}`;
    if (meta.status === 'OK' && !seen.has(id)) {
      seen.add(id);
      covered.push({ ...s, meta });
    }
  }
  const todo = covered.slice(0, o.maxImages);
  const cost = todo.length * USD_PER_IMAGE;
  console.log(
    `positions x headings ${shots.length}, with coverage ${covered.length}, to fetch ${todo.length} (cap ${o.maxImages})`,
  );
  console.log(
    `estimated cost ~ $${cost.toFixed(2)} at $${USD_PER_IMAGE}/image (metadata calls are free)`,
  );
  const summary = {
    shots: shots.length,
    covered: covered.length,
    toFetch: todo.length,
    metaCalls,
    estCostUsd: cost,
    fetched: 0,
  };
  if (o.dryRun) return summary;
  if (!o.yes) throw new Error('refusing to download paid images without --yes');
  const manifest: unknown[] = [];
  for (const s of todo) {
    const dir = join(o.outDir, s.building);
    mkdirSync(dir, { recursive: true });
    const file = `${s.meta.pano_id}_h${s.heading.toFixed(0)}.jpg`;
    const u = `${base}?size=${o.size}&location=${s.lat},${s.lon}&heading=${s.heading.toFixed(1)}&pitch=${o.pitch ?? 5}&fov=90&source=outdoor&key=${o.key}`;
    if (!existsSync(join(dir, file))) {
      const r = await fetch(u);
      if (!r.ok) {
        console.error(`HTTP ${r.status} ${redact(u)}`);
        continue;
      }
      writeFileSync(join(dir, file), Buffer.from(await r.arrayBuffer()));
      summary.fetched++;
    }
    manifest.push({
      building: s.building,
      file: `${s.building}/${file}`,
      lat: s.lat,
      lon: s.lon,
      heading: s.heading,
      pitch: o.pitch ?? 5,
      panoId: s.meta.pano_id,
      date: s.meta.date,
      copyright: s.meta.copyright,
    });
  }
  mkdirSync(o.outDir, { recursive: true });
  writeFileSync(join(o.outDir, 'manifest.json'), JSON.stringify(manifest, null, 1));
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = parseArgs(process.argv.slice(2));
  runStreetview({
    key: a.base ? (process.env.GOOGLE_MAPS_API_KEY ?? 'mock') : getKey(),
    base: typeof a.base === 'string' ? a.base : undefined,
    campus: JSON.parse(readFileSync(`${REPO}data/campus.json`, 'utf8')),
    outDir: typeof a.out === 'string' ? a.out : `${REPO}data/raw/streetview`,
    size: typeof a.size === 'string' ? a.size : '640x640',
    maxImages: a['max-images'] ? Number(a['max-images']) : 300,
    yes: !!a.yes,
    dryRun: !!a['dry-run'],
  }).then(
    (s) => console.log(JSON.stringify(s)),
    (e) => {
      console.error(redact(String(e.message ?? e)));
      process.exit(1);
    },
  );
}
