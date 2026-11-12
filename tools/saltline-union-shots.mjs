// Screenshots of the Memorial Union hotspot (packages/saltline/demo-union.html, vite dev server) into tools/shots/union-*.png.
// usage: node tools/saltline-union-shots.mjs [pose names]; prints tri stats and page errors.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)), port = 5400 + Math.floor(Math.random() * 400);
const { sleep, withPage } = await import('./chrome.mjs');
// Street View frames (fov 90 = centre-square crop of the 16:9 shot): poses from tools/union-rectify.py; eye 2.5 m (Google car)
const sv = (x, y, z, h) => `${x},${y},${z},${(x + 10 * Math.sin((h * Math.PI) / 180)).toFixed(3)},${y},${(z - 10 * Math.cos((h * Math.PI) / 180)).toFixed(3)}&fov=90`;
const poses = {
  'sv-north': sv(238.0, 2.5, 180.2, 180), // pano -6pw5fD2pW12NluOYWf8SQ 2009-06, south: north wing wall
  'sv-east': sv(309.3, 2.5, 271.7, 270), // pano 11UvcOX8EMp8eaLSIDAdCA 2017-07, west: SE-wing east gable
  sketchup: '170,48,372,252,6,248&fov=38', // like the SketchUp 3D Warehouse view: from the south-west, ~30 deg down
  south: '248,1.7,345,248,10,300&fov=60',
  portal: '232,1.7,330,250,6,303&fov=55',
  west: '160,1.7,245,210,8,245&fov=60',
  aerial: '330,95,170,248,8,255&fov=45',
  'north-oblique': '215,18,150,235,8,215&fov=55',
  far: '0,30,60,248,8,250&fov=40', // > 140 m: far LOD
};
const only = process.argv.slice(2);
const vite = spawn('node_modules/.bin/vite', ['--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root + 'packages/saltline', stdio: 'ignore' });
try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/demo-union.html`)).ok) break; } catch {} await sleep(500); }
  mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
  for (const [name, cam] of Object.entries(poses)) {
    if (only.length && !only.includes(name)) continue;
    process.env.PAGE = `http://127.0.0.1:${port}/demo-union.html?cam=${cam}${name === 'far' ? '&far=1' : ''}`;
    await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
      for (let i = 0; i < 160 && !(await ev('window.__ready === true')); i++) await sleep(250);
      await sleep(3000);
      const png = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(new URL(`shots/union-${name}.png`, import.meta.url), Buffer.from(png.data, 'base64'));
      console.log(name, JSON.stringify(await ev('window.__unionTris && {tris: window.__unionTris.tris, farLodTotal: window.__unionTris.farTotal}')), logs.length ? logs : 'no errors');
    });
  }
} finally { vite.kill(); }
