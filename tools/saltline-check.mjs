// Builds Saltline, opens it in headless Chrome, waits for window.__ready, prints errors, saves tools/shots/saltline.png.
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

process.env.DIST = 'packages/saltline/dist';
execSync('npx -y pnpm@12.18.0 --filter @folktown/saltline build', { stdio: 'ignore' });
const { requireDist, sleep, withPage } = await import('./chrome.mjs');
requireDist();
await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
  for (let i = 0; i < 80 && !(await ev('window.__ready === true')); i++) await sleep(250);
  await sleep(2000);
  // press DEPLOY and run the game for a few seconds so gameplay code paths are exercised too
  await ev(
    "[...document.querySelectorAll('button')].find((b) => /deploy/i.test(b.textContent))?.click()",
  );
  await sleep(5000);
  console.log('frames after deploy:', await ev('window.__frames'));
  const s = await ev(
    'JSON.stringify({ready: window.__ready, frames: window.__frames, fatal: window.__fatal, errors: window.__errors})',
  );
  console.log(s, 'console errors:', JSON.stringify(logs));
  const dir = new URL('shots/', import.meta.url);
  mkdirSync(dir, { recursive: true });
  const png = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL('saltline.png', dir), Buffer.from(png.data, 'base64'));
  console.log('tools/shots/saltline.png');
  process.exitCode = JSON.parse(s).ready && !logs.length ? 0 : 1;
});
