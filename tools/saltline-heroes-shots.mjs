// v6 hero-building eye-level shots in the ?walk=1 scene (packages/saltline/dist-walk) -> tools/shots/<tag>-<name>.png.   usage: node tools/saltline-heroes-shots.mjs <tag> [pose names]
import { mkdirSync, writeFileSync } from 'node:fs';
process.env.DIST = 'packages/saltline/dist-walk';
const { sleep, withPage } = await import('./chrome.mjs');
const poses = {
  'union-north': '238,1.7,172,238,6,202&fov=75',
  'union-east': '322,1.7,276,296,6,276&fov=75',
  'union-south': '236,1.7,338,250,9,300&fov=70',
  'union-west': '165,1.7,262,200,8,262&fov=70',
  'ell-nw': '-112,1.7,-114,-94,8,-92&fov=75',
  'ell-se': '-40,1.7,-27,-57,8,-46&fov=75',
  'ell-sw': '-118,1.7,-34,-98,8,-51&fov=75',
  'walc-north': '71,1.7,-80,71,8,-51&fov=75',
  'walc-east': '128,1.7,-15,96,8,-15&fov=75',
};
const [tag, ...only] = process.argv.slice(2);
mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
for (const [name, cam] of Object.entries(poses)) {
  if (only.length && !only.includes(name)) continue;
  process.env.PAGE = `index.html?walk=1&cam=${cam}`;
  await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
    for (let i = 0; i < 160 && !(await ev('window.__ready === true')); i++) await sleep(250);
    await sleep(6000);
    const png = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1000, height: 640, scale: 1 } });
    writeFileSync(new URL(`shots/${tag}-${name}.png`, import.meta.url), Buffer.from(png.data, 'base64'));
    console.log(name, logs.length ? logs : 'ok');
  });
}
