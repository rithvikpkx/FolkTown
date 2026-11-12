// Campus collision timing + building screenshot. Needs a built Saltline (run tools/saltline-check.mjs first).
// Adds 1400 synthetic footprints to the live physics world and times moveCapsule / raycast; saves tools/shots/campus-building.png.
import { mkdirSync, writeFileSync } from 'node:fs';

process.env.DIST = 'packages/saltline/dist';
const { requireDist, sleep, withPage } = await import('./chrome.mjs');
requireDist();
await withPage([], { uncapped: false }, async ({ send, ev }) => {
  for (let i = 0; i < 80 && !(await ev('window.__ready === true')); i++) await sleep(250);
  await ev("[...document.querySelectorAll('button')].find((b) => /deploy/i.test(b.textContent))?.click()");
  await sleep(1500);
  const r = await ev(`(() => {
    const G = window.__G, P = G.physics, b = P.bounds;
    let s = 12345; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const base = P.boxes.length, added = [];
    for (let i = 0; i < 1400; i++) {
      const cx = b.min.x + rnd() * (b.max.x - b.min.x), cz = b.min.z + rnd() * (b.max.z - b.min.z), r = 4 + rnd() * 10, poly = [];
      for (let k = 0; k < 10; k++) { const a = (k / 10) * 6.2832, rr = r * (0.7 + rnd() * 0.3); poly.push(cx + Math.cos(a) * rr, cz + Math.sin(a) * rr); }
      added.push(P.addPrism(poly, 0, 8 + rnd() * 30, {}));
    }
    const V = G.THREE.Vector3, pos = new V(), vel = new V(), o = new V(), d = new V();
    const N = 20000;
    let t0 = performance.now(), walls = 0;
    for (let i = 0; i < N; i++) {
      pos.set(b.min.x + rnd() * (b.max.x - b.min.x), 0, b.min.z + rnd() * (b.max.z - b.min.z));
      vel.set((rnd() - 0.5) * 12, 0, (rnd() - 0.5) * 12);
      walls += P.moveCapsule(pos, vel, 1 / 60, 0.32, 1.8, true).hitWall ? 1 : 0;
    }
    const tMove = ((performance.now() - t0) * 1000) / N;
    t0 = performance.now();
    let hits = 0;
    for (let i = 0; i < N; i++) {
      o.set(b.min.x + rnd() * (b.max.x - b.min.x), 1.6, b.min.z + rnd() * (b.max.z - b.min.z));
      const a = rnd() * 6.2832; d.set(Math.cos(a), (rnd() - 0.5) * 0.1, Math.sin(a)).normalize();
      hits += P.raycast(o, d, 200) ? 1 : 0;
    }
    const tRay = ((performance.now() - t0) * 1000) / N;
    const total = P.boxes.length;
    added.forEach((x) => P.removeBox(x));
    return { boxes: total, moveUs: +tMove.toFixed(2), rayUs: +tRay.toFixed(2), wallHits: walls, rayHits: hits };
  })()`);
  console.log(JSON.stringify(r));
  // building shot: stand 45 m north of the Bell Tower footprint, looking at it
  await ev(`(() => { const G = window.__G, c = G.level.campus.footprints.find((f) => f.id === 'way/301837711');
    G.player.pos.set((c.minX + c.maxX) / 2, 0, c.minZ - 45); G.player.yaw = Math.PI; })()`);
  await sleep(1500);
  const png = await send('Page.captureScreenshot', { format: 'png' });
  mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
  writeFileSync(new URL('shots/campus-building.png', import.meta.url), Buffer.from(png.data, 'base64'));
});
