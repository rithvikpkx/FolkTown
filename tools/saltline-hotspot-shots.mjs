// Renders the v5 hotspots (elliott, memorial-mall) in the Saltline renderer via packages/saltline/demo-hotspot.html (vite dev server) -> tools/shots/hs-<name>.png.
// Poses are Street View frames: lat/lon from data/raw/streetview manifest -> local metres, plus a fitted offset (dx, dz, dh), because the pano positions sit several metres off.
// Usage: node tools/saltline-hotspot-shots.mjs [name ...]      (no names = all poses; extra poses: tools/hotspot-poses.json)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
process.env.DIST ??= 'packages/saltline/dist';
const { sleep, withPage } = await import('./chrome.mjs');
const root = fileURLToPath(new URL('..', import.meta.url));
const LAT0 = 40.42728706, LON0 = -86.91406754;
const local = (lat, lon) => [(lon - LON0) * 111320 * Math.cos((LAT0 * Math.PI) / 180), -(lat - LAT0) * 110574];
const poses = existsSync(root + 'tools/hotspot-poses.json') ? JSON.parse(readFileSync(root + 'tools/hotspot-poses.json', 'utf8')) : {};
// pose: { h, lat, lon, heading, dx, dz, eye, pitch, fov } ; or { h, cam:"x,y,z,tx,ty,tz" }
const want = process.argv.slice(2).map((a) => { const i = a.indexOf(':{'); if (i > 0) { poses[a.slice(0, i)] = JSON.parse(a.slice(i + 1)); return a.slice(0, i); } return a; }), names = want.length ? want : Object.keys(poses);
const port = 5300 + Math.floor(Math.random() * 500);
const vite = spawn('node', ['node_modules/vite/bin/vite.js', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root + 'packages/saltline', stdio: 'ignore' });
try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/demo-hotspot.html`)).ok) break; } catch {} await sleep(250); }
  mkdirSync(root + 'tools/shots', { recursive: true });
  for (const name of names) {
    const p = poses[name]; if (!p) { console.error('no pose', name); continue; }
    let cam = p.cam;
    if (!cam) {
      const [x0, z0] = local(p.lat, p.lon), x = x0 + (p.dx || 0), z = z0 + (p.dz || 0), a = (p.heading * Math.PI) / 180, e = p.eye ?? 2.5, d = 50, pit = Math.tan(((p.pitch ?? 0) * Math.PI) / 180);
      cam = [x, e, z, x + Math.sin(a) * d, e + d * pit, z - Math.cos(a) * d].map((v) => v.toFixed(2)).join(',');
    }
    const size = p.size || 640;
    process.env.PAGE = `http://127.0.0.1:${port}/demo-hotspot.html?h=${p.h}&cam=${cam}&fov=${p.fov ?? 90}&w=${size}&hh=${size}${p.q || ''}`;
    await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
      for (let i = 0; i < 240 && !(await ev('window.__ready === true')); i++) await sleep(250);
      await sleep(2500); // textures
      const png = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
      writeFileSync(root + `tools/shots/hs-${name}.png`, Buffer.from(png.data, 'base64'));
      console.log(name, JSON.stringify(await ev('window.__stats')), logs.length ? logs : 'no errors');
    });
  }
} finally { vite.kill(); }
