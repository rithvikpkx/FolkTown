// Screenshots each weapon at the hip and aimed: node tools/shoot-weapons.mjs (needs a client build).
import { mkdirSync, writeFileSync } from 'node:fs';
import { requireDist, sleep, withPage } from './chrome.mjs';

// VARIANT=name previews that manifest variant, ONLY=rifle limits the weapons, OUT=prefix names the files.
process.env.PAGE ??= `play.html?bots=3${process.env.VARIANT ? `&variant=${process.env.VARIANT}` : ''}`;
requireDist();
const dir = new URL('shots/', import.meta.url);
mkdirSync(dir, { recursive: true });
await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
  for (let i = 0; i < 40 && !(await ev('window.__ft?.n > 5')); i++) await sleep(250);
  for (const w of process.env.ONLY?.split(',') ?? ['rifle', 'pistol', 'shotgun'])
    for (const ads of [false, true]) {
      await ev(`__game.session.player.weapon='${w}'; __game.input.ads=${ads}`);
      await sleep(2500);
      const png = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(
        new URL(`${process.env.OUT ?? 'wp'}-${w}-${ads ? 'ads' : 'hip'}.png`, dir),
        Buffer.from(png.data, 'base64'),
      );
    }
  console.log(logs.join('\n'));
});
