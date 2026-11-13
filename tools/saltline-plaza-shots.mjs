// Screenshots of the ?walk=1 prototype at 1.7 m eye height into tools/shots/walk-*.png (serves packages/saltline/dist-walk).
import { mkdirSync, writeFileSync } from 'node:fs';

process.env.DIST = 'packages/saltline/dist-walk';
const { sleep, withPage } = await import('./chrome.mjs');
const poses = {
  oblique: '-30,42,-40,36,0,-8',
  eye1: '22,1.7,-36,36,3,-8',
  eye2: '30,1.7,22,34,4,-20',
  eye3: '12,1.7,-1,44,6,-8',
  tower: '9,1.7,-12,0,8,0',
};
mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
for (const [name, cam] of Object.entries(poses)) {
  process.env.PAGE = `index.html?walk=1&cam=${cam}`;
  await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
    for (let i = 0; i < 120 && !(await ev('window.__ready === true')); i++) await sleep(250);
    await sleep(6000);
    const png = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(new URL(`shots/plaza-${name}.png`, import.meta.url), Buffer.from(png.data, 'base64'));
    console.log(name, 'walcTris', JSON.stringify(await ev('window.__walcTris')), JSON.stringify({ errors: await ev('window.__errors'), fatal: await ev('window.__fatal') }), logs.length ? logs : '');
  });
}
