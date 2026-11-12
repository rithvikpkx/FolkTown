// Bell Tower shots of the ?walk=1 build into tools/shots/bt-*.png (run saltline:walk-build first).
// Usage: node tools/saltline-belltower-shots.mjs '{"name":"x,y,z,tx,ty,tz"}' [extra-query]
import { mkdirSync, writeFileSync } from 'node:fs';
process.env.DIST = 'packages/saltline/dist-walk';
const { sleep, withPage } = await import('./chrome.mjs');
const poses = JSON.parse(process.argv[2] || '{}');
const extra = process.argv[3] || '';
mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
for (const [name, cam] of Object.entries(poses)) {
  process.env.PAGE = `index.html?walk=1&cam=${cam}${extra}`;
  await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
    for (let i = 0; i < 120 && !(await ev('window.__ready === true')); i++) await sleep(250);
    await sleep(5000);
    const png = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(new URL(`shots/bt-${name}.png`, import.meta.url), Buffer.from(png.data, 'base64'));
    console.log(name, JSON.stringify({ errors: await ev('window.__errors'), fatal: await ev('window.__fatal') }), logs.length ? logs : '');
  });
}
