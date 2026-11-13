// Eye-level shots of photographed buildings in ?walk=1: node tools/saltline-facade-shots.mjs <tag> [id...]  -> tools/shots/facade-<tag>-<id>.jpg
// tag "before" adds &facades=0 (photo tiles off). Camera = the chosen Street View pano position looking at the building centre. Build first: pnpm saltline:walk-build
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
process.env.DIST = 'packages/saltline/dist-walk';
const { sleep, withPage } = await import('./chrome.mjs');
const tag = process.argv[2] || 'after', J = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url)));
const zone = J('../data/zones/mall-union.json'), sel = J('../data/raw/streetview-tiles/selection.json'), panos = J('../data/raw/streetview-tiles/panos.json');
const man = J('../packages/saltline/public/campus/facades/manifest.json');
const ids = process.argv.length > 3 ? process.argv.slice(3) : ['way/74340895', 'way/75498146', 'way/301932784', 'way/158307858', 'way/117147171', 'way/117146489', 'way/117146482', 'way/117147178'];
const R = 6371008.8, rad = Math.PI / 180, O = [40.42728706, -86.91406754];
mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
for (const id of ids) {
  const c = zone.colliders.find((z) => z.id === id), pk = sel[id].picks.find((p) => p.panoId === man[id]?.pano) || sel[id].picks[0], m = panos[pk.panoId];
  const x = R * (m.lng - O[1]) * rad * Math.cos(O[0] * rad), z = -R * (m.lat - O[0]) * rad;
  const cx = c.poly.reduce((s, p) => s + p[0], 0) / c.poly.length, cz = c.poly.reduce((s, p) => s + p[1], 0) / c.poly.length;
  process.env.PAGE = `index.html?walk=1${tag === 'before' ? '&facades=0' : ''}&cam=${x.toFixed(1)},1.7,${z.toFixed(1)},${cx.toFixed(1)},7,${cz.toFixed(1)}`;
  await withPage([], { uncapped: false }, async ({ send, ev }) => {
    for (let i = 0; i < 240 && !(await ev('window.__ready === true')); i++) await sleep(250);
    await sleep(3000);
    await ev(`window.__G.player.pos.set(${x}, 0, ${z})`); // the LOD ticks follow the player, not the shot camera
    await sleep(1500);
    const png = await send('Page.captureScreenshot', { format: 'jpeg', quality: 84 });
    writeFileSync(new URL(`shots/facade-${tag}-${id.replace('/', '-')}.jpg`, import.meta.url), Buffer.from(png.data, 'base64'));
    console.log(id, tag, JSON.stringify({ errors: await ev('window.__errors'), fatal: await ev('window.__fatal') }));
  });
}
