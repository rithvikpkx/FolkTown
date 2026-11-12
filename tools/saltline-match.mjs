// Headless Saltline match test: 16 bots on the Mall, short timer; runs to the end screen, fails on any page error.
// Saves tools/shots/saltline-bots.png (bots in view mid-match). Usage: node tools/saltline-match.mjs [mode=ffa|tdm]
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const mode = process.argv[2] || 'ffa';
process.env.DIST = 'packages/saltline/dist';
process.env.PAGE = `?mode=${mode}&bots=16&time=40&killlimit=999&difficulty=normal&autostart=1&noaudio=1&q=low`;
execSync('npx -y pnpm@12.18.0 --filter @folktown/saltline build', { stdio: 'ignore' });
const { requireDist, sleep, withPage } = await import('./chrome.mjs');
requireDist();
await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
  for (let i = 0; i < 120 && !(await ev('window.__ready === true')); i++) await sleep(250);
  await sleep(14000);
  // stand 14 m from the nearest live bot, facing it, for the screenshot
  const aim = await ev(`(() => { const G = window.__G, e = G.enemies.list.find((x) => x.alive); if (!e) return 'no bot';
    const dx = e.pos.x - G.player.pos.x, dz = e.pos.z - G.player.pos.z, d = Math.hypot(dx, dz) || 1;
    G.player.pos.set(e.pos.x - (dx / d) * 14, 0, e.pos.z - (dz / d) * 14); G.player.yaw = Math.atan2(-dx, -dz);
    G.player.invulnerable = true; return 'alive bots ' + G.enemies.aliveCount(); })()`);
  console.log(aim);
  await sleep(1500);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
  writeFileSync(new URL('shots/saltline-bots.png', import.meta.url), Buffer.from(shot.data, 'base64'));
  let over = false;
  for (let i = 0; i < 120 && !over; i++) { await sleep(500); over = await ev('window.__G.modes.over'); }
  const sum = await ev(`JSON.stringify((() => { const m = window.__G.modes.state; return { over: m.over, t: +m.t.toFixed(1), winner: m.winner, bots: m.ents.length - 1,
    top: [...m.ents].sort((a, b) => b.kills - a.kills).slice(0, 3).map((e) => e.name + ' ' + e.kills + '/' + e.deaths), you: m.player.kills + '/' + m.player.deaths,
    errors: window.__errors, fatal: window.__fatal }; })())`);
  console.log(sum, 'console errors:', JSON.stringify(logs));
  const r = JSON.parse(sum);
  process.exitCode = r.over && !r.errors.length && !r.fatal && !logs.length ? 0 : 1;
});
