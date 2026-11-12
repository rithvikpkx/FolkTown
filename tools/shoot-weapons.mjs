// Screenshots each weapon at the hip and aimed: node tools/shoot-weapons.mjs (needs a client build).
import { mkdirSync, writeFileSync } from 'node:fs';
import { requireDist, sleep, withPage } from './chrome.mjs';

process.env.PAGE ??= 'play.html?bots=7';
requireDist();
const dir = new URL('shots/', import.meta.url);
mkdirSync(dir, { recursive: true });
await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
  for (let i = 0; i < 40 && !(await ev('window.__ft?.n > 5')); i++) await sleep(250);
  for (const w of ['rifle', 'pistol', 'shotgun'])
    for (const ads of [false, true]) {
      await ev(`__game.session.player.weapon='${w}'; __game.input.ads=${ads}`);
      await sleep(1200);
      const png = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(
        new URL(`wp-${w}-${ads ? 'ads' : 'hip'}.png`, dir),
        Buffer.from(png.data, 'base64'),
      );
    }
  console.log(logs.join('\n'));
});
