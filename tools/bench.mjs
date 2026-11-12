import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { poses, requireDist, sleep, withPage } from './chrome.mjs';
import { fpsStats } from './stats.ts';

execSync('npx -y pnpm@12.18.0 --filter @folktown/client build', { stdio: 'ignore' });
requireDist();
const rows = ['| pose | median fps | 1% low fps | GPU |', '|---|---|---|---|'];
for (const [name, pose] of Object.entries(poses)) {
  const r = await withPage(pose, { uncapped: true }, async ({ ev }) => {
    for (let i = 0; i < 40 && !(await ev('window.__ft?.n > 0')); i++) await sleep(250);
    if (!(await ev('window.__ft?.n > 0')))
      throw new Error(
        `no frame: ${await ev('location.href + typeof window.__ft + document.readyState')}`,
      );
    await sleep(2000); // warm-up
    await ev('window.__ft.n = 0'); // restart the ring; 600 frames is the sample window
    await sleep(4000);
    const n = await ev('window.__ft.n');
    const all = JSON.parse(await ev('JSON.stringify(Array.from(window.__ft.times))'));
    return {
      ...fpsStats(all.slice(0, Math.min(n, all.length))),
      gpu: await ev('window.__ft.renderer'),
    };
  });
  rows.push(`| ${name} | ${r.median.toFixed(0)} | ${r.low.toFixed(0)} | ${r.gpu} |`);
}
const table = rows.join('\n');
console.log(table);
if (process.argv.includes('--save'))
  writeFileSync(new URL('baseline.md', import.meta.url), `${table}\n`);
