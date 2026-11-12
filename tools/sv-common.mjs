// Street View Tiles API helpers (owner key from .env.local, never printed). Every request is counted in data/raw/streetview-tiles/usage.json.
import fs from 'node:fs';
const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]));
const KEY = env.GOOGLE_MAPS_API_KEY;
export const DIR = new URL('../data/raw/streetview-tiles/', import.meta.url).pathname;
fs.mkdirSync(DIR, { recursive: true });
const UF = DIR + 'usage.json';
export const usage = fs.existsSync(UF) ? JSON.parse(fs.readFileSync(UF)) : { session: 0, panoIds: 0, panoIdLocations: 0, metadata: 0, tiles: 0 };
export const saveUsage = () => fs.writeFileSync(UF, JSON.stringify(usage));
const B = 'https://tile.googleapis.com/v1/';
const R = 6371008.8, rad = Math.PI / 180, O = { lat: 40.42728706, lon: -86.91406754 };
export const toLL = (x, z) => [O.lat - z / (R * rad), O.lon + x / (R * rad * Math.cos(O.lat * rad))];
export const toXZ = (lat, lon) => [R * (lon - O.lon) * rad * Math.cos(O.lat * rad), -R * (lat - O.lat) * rad];
let session;
export async function getSession() {
  if (session) return session;
  const f = DIR + 'session.json';
  if (fs.existsSync(f)) { const s = JSON.parse(fs.readFileSync(f)); if (+s.expiry * 1000 > Date.now() + 36e5) return (session = s.session); }
  const r = await (await fetch(`${B}createSession?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mapType: 'streetview', language: 'en-US', region: 'US' }) })).json();
  usage.session++; saveUsage(); fs.writeFileSync(f, JSON.stringify(r)); return (session = r.session);
}
export async function panoIds(locs, radius = 30) {
  const s = await getSession();
  const r = await fetch(`${B}streetview/panoIds?session=${s}&key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locations: locs.map(([lat, lng]) => ({ lat, lng })), radius }) });
  usage.panoIds++; usage.panoIdLocations += locs.length; saveUsage();
  if (!r.ok) throw new Error('panoIds ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return (await r.json()).panoIds;
}
export async function metadata(panoId) {
  const s = await getSession();
  const r = await fetch(`${B}streetview/metadata?session=${s}&key=${KEY}&panoId=${encodeURIComponent(panoId)}`);
  usage.metadata++;
  if (!r.ok) throw new Error('metadata ' + r.status);
  return r.json();
}
export async function tile(panoId, z, x, y) {
  const s = await getSession();
  for (let k = 0; k < 3; k++) {
    const r = await fetch(`${B}streetview/tiles/${z}/${x}/${y}?session=${s}&key=${KEY}&panoId=${encodeURIComponent(panoId)}`);
    usage.tiles++;
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    if (r.status === 404) return null;
  }
  throw new Error('tile fail');
}
