// pnpm map:tiles : download Photorealistic 3D Tiles (official Map Tiles API) around the MVP area.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pool, RequestCap, TileClient } from './client.ts';
import { getKey, parseArgs, REPO, redact } from './env.ts';
import { type Bbox, type BoundingVolume, MVP_BBOX } from './math.ts';
import { type Selected, type TileNode, traverse } from './traverse.ts';

export const DEFAULT_BASE = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export interface FetchOpts {
  key: string;
  base?: string;
  outDir: string;
  maxError: number;
  maxRequests: number;
  dryRun: boolean;
  concurrency?: number;
  bbox?: Bbox;
  backoffMs?: number;
}
export interface ManifestTile {
  uri: string;
  file: string;
  boundingVolume: BoundingVolume;
  geometricError: number;
  transform: number[];
  bytes: number;
  copyright?: string;
  skipped?: boolean;
}

/** Read asset.copyright from a binary glb without parsing the rest. */
export function glbCopyright(glb: Buffer): string | undefined {
  if (glb.length < 20 || glb.readUInt32LE(0) !== 0x46546c67) return undefined;
  const len = glb.readUInt32LE(12);
  try {
    return JSON.parse(glb.subarray(20, 20 + len).toString('utf8')).asset?.copyright;
  } catch {
    return undefined;
  }
}

const stripAuth = (u: string) => {
  const x = new URL(u);
  x.searchParams.delete('key');
  x.searchParams.delete('session');
  return x.toString();
};

export async function runFetch(o: FetchOpts) {
  const cap = new RequestCap(o.maxRequests);
  const client = new TileClient(o.key, cap, { backoffMs: o.backoffMs });
  const base = o.base ?? DEFAULT_BASE;
  let jsonRequests = 0;
  const loadJson = async (u: string) => {
    jsonRequests++;
    return JSON.parse((await client.get(u)).toString('utf8')) as { root: TileNode };
  };
  const selected: Selected[] = await traverse(base, loadJson, o.bbox ?? MVP_BBOX, o.maxError);
  const plan = selected.map((s) => ({
    s,
    uri: stripAuth(s.uri),
    file: `${createHash('sha1').update(new URL(s.uri).pathname).digest('hex').slice(0, 16)}.glb`,
  }));
  const dir = join(o.outDir, 'tiles');
  const todo = plan.filter((p) => !existsSync(join(dir, p.file)));
  const summary = {
    selectedTiles: plan.length,
    alreadyOnDisk: plan.length - todo.length,
    tilesetJsonRequests: jsonRequests,
    glbRequestsNeeded: todo.length,
    totalRequestsIncludingThisRun: jsonRequests + todo.length,
  };
  if (o.dryRun) return { summary, manifest: null, requests: cap.count };
  if (jsonRequests + todo.length > o.maxRequests)
    throw new Error(
      `request cap reached: ${jsonRequests + todo.length} needed, --max-requests ${o.maxRequests}`,
    );

  mkdirSync(dir, { recursive: true });
  const tiles: ManifestTile[] = [];
  await pool(plan, o.concurrency ?? 4, async (p) => {
    const f = join(dir, p.file);
    const t: ManifestTile = {
      uri: p.uri,
      file: p.file,
      boundingVolume: p.s.boundingVolume,
      geometricError: p.s.geometricError,
      transform: p.s.transform,
      bytes: 0,
    };
    try {
      let buf: Buffer;
      if (existsSync(f)) {
        buf = readFileSync(f);
        t.skipped = true;
      } else {
        buf = await client.get(p.s.uri);
        writeFileSync(f, buf);
      }
      t.bytes = buf.length;
      t.copyright = glbCopyright(buf);
    } catch (e) {
      console.error(redact(String((e as Error).message)));
    }
    tiles.push(t);
  });
  tiles.sort((a, b) => a.file.localeCompare(b.file));
  const attributions = [
    ...new Set(
      tiles.flatMap((t) => (t.copyright ?? '').split(';').map((x) => x.trim())).filter(Boolean),
    ),
  ];
  const manifest = {
    createdAt: new Date().toISOString(),
    maxError: o.maxError,
    bbox: o.bbox ?? MVP_BBOX,
    requests: cap.count,
    bytes: client.bytes,
    attributions,
    errors: client.errors,
    tiles,
  };
  writeFileSync(join(o.outDir, 'manifest.json'), JSON.stringify(manifest, null, 1));
  return { summary, manifest, requests: cap.count };
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const maxError = a.error ? Number(a.error) : a.detail === 'coarse' ? 20 : 0; // default: finest tiles
  const key = a.base ? (process.env.GOOGLE_MAPS_API_KEY ?? 'mock') : getKey(); // --base = local mock server
  const r = await runFetch({
    key,
    base: typeof a.base === 'string' ? a.base : undefined,
    outDir: typeof a.out === 'string' ? a.out : `${REPO}data/raw/tiles`,
    maxError,
    maxRequests: a['max-requests'] ? Number(a['max-requests']) : 3000,
    dryRun: !!a['dry-run'],
  });
  console.log(JSON.stringify(r.summary, null, 1));
  if (r.manifest) {
    console.log(`bytes ${r.manifest.bytes}, errors ${r.manifest.errors.length}`);
    console.log('Attribution:', r.manifest.attributions.join(' | ') || '(none returned)');
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(redact(String(e.message ?? e)));
    process.exit(1);
  });
}
