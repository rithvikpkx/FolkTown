// Screenshots each Saltline gun at the hip and aiming down sights into tools/shots/sl-<gun>-<hip|ads>.png (build first).
import { mkdirSync, writeFileSync } from 'node:fs';

process.env.DIST = 'packages/saltline/dist';
const { requireDist, sleep, withPage } = await import('./chrome.mjs');
requireDist();
const dir = new URL('shots/', import.meta.url);
mkdirSync(dir, { recursive: true });
await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
  for (let i = 0; i < 80 && !(await ev('window.__ready === true')); i++) await sleep(250);
  await ev("[...document.querySelectorAll('button')].find((b) => /deploy/i.test(b.textContent))?.click()");
  await sleep(4000);
  for (const gun of ['rifle', 'pistol'])
    for (const ads of [false, true]) {
      await ev(`__G.weapon.equip('${gun}'); __G.weapon.debug.ads = ${ads}`);
      await sleep(2500);
      const png = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(new URL(`sl-${gun}-${ads ? 'ads' : 'hip'}.png`, dir), Buffer.from(png.data, 'base64'));
    }
  console.log('errors:', JSON.stringify(logs), await ev('JSON.stringify(window.__errors)'));
});
