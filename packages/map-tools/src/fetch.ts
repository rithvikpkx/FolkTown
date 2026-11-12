import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Roughly lat 40.418..40.434, lon -86.930..-86.903: Engineering Mall, Bell Tower, Union, WALC, with margin.
const BBOX = '40.418,-86.930,40.434,-86.903';
const SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
export const RAW = new URL('../../../data/raw/osm-campus.json', import.meta.url);
export const RAW_GZ = new URL('../../../data/raw/osm-campus.json.gz', import.meta.url);

const query = `[out:json][timeout:180];
(
  nwr["building"](${BBOX});
  nwr["building:part"](${BBOX});
  way["highway"](${BBOX});
  node["natural"="tree"](${BBOX});
  nwr["natural"="water"](${BBOX});
  nwr["landuse"~"^(grass|recreation_ground)$"](${BBOX});
  nwr["leisure"~"^(park|garden|pitch)$"](${BBOX});
);
out geom tags;`;

if (!process.argv.includes('--refresh') && (existsSync(RAW) || existsSync(RAW_GZ))) {
  console.log('cache hit, use --refresh to refetch');
} else {
  let text = '';
  for (let attempt = 0; !text; attempt++) {
    if (attempt >= 12) throw new Error('Overpass unavailable after 12 attempts');
    const url = SERVERS[attempt % SERVERS.length] as string;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'map-tools/0.1 (open-source campus map project)',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(240_000),
    }).catch(() => null);
    if (res?.ok) text = await res.text();
    else {
      console.log(`${url}: ${res?.status ?? 'network error'}, retrying`);
      await new Promise((r) => setTimeout(r, Math.min(60000, 5000 * 2 ** attempt)));
    }
  }
  mkdirSync(new URL('./', RAW), { recursive: true });
  if (text.length > 15e6) {
    writeFileSync(RAW_GZ, gzipSync(text));
    console.log(`wrote gz ${statSync(RAW_GZ).size} bytes (raw ${text.length})`);
  } else {
    writeFileSync(RAW, text);
    console.log(`wrote ${text.length} bytes`);
  }
}
