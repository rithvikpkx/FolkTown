// Screenshots of the ?walk=1 prototype at 1.7 m eye height into tools/shots/walk-*.png (serves packages/saltline/dist-walk).
import { mkdirSync, writeFileSync } from 'node:fs';

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
  'walc-bay': '27,1.7,-10,45,9,-10',
};
mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
const only = process.argv.slice(2); // optional pose names
for (const [name, cam] of Object.entries(poses)) {
  if (only.length && !only.includes(name)) continue;
  process.env.PAGE = `index.html?walk=1&cam=${cam}`;
  await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
    for (let i = 0; i < 120 && !(await ev('window.__ready === true')); i++) await sleep(250);
    await sleep(6000);
    const png = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(new URL(`shots/walk-${name}.png`, import.meta.url), Buffer.from(png.data, 'base64'));
    console.log(name, 'walcTris', JSON.stringify(await ev('window.__walcTris')), JSON.stringify({ errors: await ev('window.__errors'), fatal: await ev('window.__fatal') }), logs.length ? logs : '');
  });
}
