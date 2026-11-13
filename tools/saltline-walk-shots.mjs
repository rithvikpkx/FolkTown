// Screenshots of the ?walk=1 prototype at 1.7 m eye height into tools/shots/walk-*.png (serves packages/saltline/dist-walk).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

process.env.DIST = 'packages/saltline/dist-walk';
const { sleep, withPage } = await import('./chrome.mjs');
const poses = {
  'tower-to-walc': '9,1.7,0,41,7,-2',
  'walc-to-tower': '35,1.7,-1,0,14,0',
  'along-path': '17,1.7,6,40,2,5',
  oblique: '22,1.7,36,70,9,-14',
  'walc-nw': '18,1.7,-78,62,10,-44',
  'walc-s': '40,1.7,58,75,10,26',
  'walc-w': '20,1.7,-12,50,8,-6',
  'walc-aerial': '-4,48,44,66,6,-14', // high oblique from the south-west above the plaza, like the design render
  'am-top': '70,190,-13,70,0,-14&fov=32', // same views as the Apple Maps reference frames (data/raw/apple-maps-walc): top-down,
  'am-west': '-95,115,-14,62,8,-14&fov=30', // west face at the steeper tilt (west-mid.png),
  'am-sw': '-45,95,125,70,6,-14&fov=32', // and from the south-west at about 45 degrees
  'walc-bay': '27,1.7,-10,45,9,-10',
  'v5-bay': '28,1.7,-10,45,8,-10', // owner shot 18: plaza facing the west glazed bay (no back wall behind the curtain wall)
  'v5-sw-up': '108,1.7,2,96,11,-8', // owner shot 19 area: the pavilions and the low wing between them, seen from the south-east, looking up at the eaves
};
// Street View frames (data/raw/streetview/walc): fov 90, heading h (0 = north, 90 = east). Positions are FITTED to the photos (tools/walc-rectify.py): the manifest lat/lon
// project ~8 m away from where the frames sit against the OSM footprint (pano 1 manifest (33.3,-2.2), fitted (25.1,5.5); pano 3 manifest (70.2,40.2), fitted ~(66,53)).
const sv = (x, y, z, h) => `${x},${y},${z},${(x + 10 * Math.sin((h * Math.PI) / 180)).toFixed(3)},${y},${(z - 10 * Math.cos((h * Math.PI) / 180)).toFixed(3)}&fov=90`;
Object.assign(poses, {
  'sv-west': sv(25.1, 1.7, 5.5, 90), // pano CAoSF0NJ...TbWdF 2021-09, east: colonnade + south pavilion west face
  'sv-south': sv(66, 2.4, 53, 0), // pano _2SMIz...jQiA 2017-09, north: south bulge + long south wall
});
// Apple Maps frames (data/raw/apple-maps-walc): camera poses fitted to the roof (tools/walc-apple.py -> tools/walc-apple.json). Rendered at the Maps window size
// (1600 x 949 pt @2x); crop x 0, y 104, 3056 x 1794 to match the frame.
const apple = JSON.parse(readFileSync(new URL('walc-apple.json', import.meta.url), 'utf8'));
for (const [n, p] of Object.entries(apple)) poses['apple-' + n] = `${p.cam.join(',')}&fov=${p.fov}`;
Object.assign(poses, {
  'hifi-front': '27,1.94,-10,48,8,-10', // plaza, facing the seven glazed bays and the lettering
  'hifi-oblique': '24,1.94,-40,50,9,-8',
  'hifi-colonnade': '40.5,1.94,3,48.4,5.5,-9', // close, under the canopies
  'hifi-nw': '30,1.7,-68,62,9,-48', // the 2018 photo's corner (north face + west face)
  'hifi-east': '120,1.7,-12,96,8,-12',
  'hifi-south': '60,1.7,62,62,9,30',
});
mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
const only = process.argv.slice(2); // optional pose names
for (const [name, cam] of Object.entries(poses)) {
  if (only.length && !only.includes(name)) continue;
  process.env.PAGE = `index.html?walk=1&cam=${cam}`;
  await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
    if (name.startsWith('apple-')) await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 949, deviceScaleFactor: 2, mobile: false });
    for (let i = 0; i < 120 && !(await ev('window.__ready === true')); i++) await sleep(250);
    await sleep(6000);
    const png = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(new URL(`shots/walk-${name}.png`, import.meta.url), Buffer.from(png.data, 'base64'));
    console.log(name, 'walcTris', JSON.stringify(await ev('window.__walcTris')), JSON.stringify(await ev('window.__walcSpecs')), JSON.stringify({ errors: await ev('window.__errors'), fatal: await ev('window.__fatal') }), logs.length ? logs : '');
  });
}
