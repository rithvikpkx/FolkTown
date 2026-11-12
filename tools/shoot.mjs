import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { poses, requireDist, sleep, usePose, withPage } from './chrome.mjs';

const [name, poseName = Object.keys(poses)[0]] = process.argv.slice(2);
if (!name || !poses[poseName]) throw new Error(`usage: pnpm shoot <name> [${Object.keys(poses)}]`);
execSync('npx -y pnpm@12.18.0 --filter @folktown/client build', { stdio: 'ignore' });
requireDist();
const dir = new URL('shots/', import.meta.url);
mkdirSync(dir, { recursive: true });
usePose(poseName, poses[poseName]);
await withPage(poses[poseName], { uncapped: false }, async ({ send, ev }) => {
  for (let i = 0; i < 40 && !(await ev('window.__ft?.n > 5')); i++) await sleep(250);
  const png = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL(`${name}.png`, dir), Buffer.from(png.data, 'base64'));
});
console.log(`tools/shots/${name}.png`);
