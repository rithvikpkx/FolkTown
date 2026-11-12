// Headless play.html check: fakes pointer lock, drives window.__game input and logs what happens.
// usage: node tools/play-check.mjs [query ...]   e.g. "mode=ffa&diff=normal&bots=7" (default: three configs)
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { requireDist, sleep, withPage } from './chrome.mjs';

execSync('npx -y pnpm@12.18.0 --filter @folktown/client build', { stdio: 'ignore' });
requireDist();
const dir = new URL('shots/', import.meta.url);
mkdirSync(dir, { recursive: true });
const configs = process.argv.slice(2);
if (!configs.length)
  configs.push(
    'mode=ffa&diff=normal&bots=7',
    'mode=tdm&diff=hard&bots=7',
    'mode=ffa&diff=easy&bots=7',
  );

const LOCK = `Object.defineProperty(document,'pointerLockElement',{get:()=>document.querySelector('canvas'),configurable:true});`;
const H = `window.H = {
  g: window.__game, me: () => window.__game.session.player,
  bots: () => window.__game.session.match.playerList.filter(p => p.isBot),
  aim(t, dy = 1.1) { const m = H.me(), dx = t.pos.x - m.pos.x, dz = t.pos.z - m.pos.z;
    H.g.input.yaw = Math.atan2(-dx, -dz); H.g.input.pitch = Math.atan2(t.pos.y + dy - (m.pos.y + 1.6), Math.hypot(dx, dz)); },
  nearest(alive = true) { const m = H.me(); return H.bots().filter(b => !alive || b.alive).sort((a, b) =>
    Math.hypot(a.pos.x - m.pos.x, a.pos.z - m.pos.z) - Math.hypot(b.pos.x - m.pos.x, b.pos.z - m.pos.z))[0]; },
};`;

for (const [ci, query] of configs.entries()) {
  process.env.PAGE = `play.html?${query}`;
  console.log(`\n== ${query}`);
  await withPage([], { uncapped: false }, async ({ send, ev, logs }) => {
    for (let i = 0; i < 80 && !(await ev('!!window.__game')); i++) await sleep(250);
    await ev(`${LOCK}${H};0`);
    const fps = await ev('window.__ft.n');
    await sleep(1000);
    console.log('frames/s', (await ev('window.__ft.n')) - fps);

    // 1. idle player 30 s: bot positions and states
    const snap = () =>
      ev(
        `JSON.stringify(H.bots().map(b => [b.id, +b.pos.x.toFixed(0), +b.pos.z.toFixed(0), b.alive, Math.round(b.health), +Math.hypot(b.vel.x, b.vel.z).toFixed(1)]))`,
      );
    const first = JSON.parse(await snap());
    for (let t = 0; t < 6; t++) {
      await sleep(5000);
      if (t === 5) {
        const now = JSON.parse(await snap());
        const moved = now.map((b, i) =>
          Math.hypot(b[1] - first[i][1], b[2] - first[i][2]).toFixed(0),
        );
        console.log('bot displacement after 30 s (m):', moved.join(' '));
      }
    }
    console.log('player hp after 30 s idle:', await ev('Math.round(H.me().health)'));

    // 2. movement: walk, sprint, jump (teleport to the open mall centre first)
    await ev(`H.me().pos.x = -30; H.me().pos.z = -290; H.g.input.yaw = 0;`);
    const p0 = JSON.parse(await ev('JSON.stringify(H.me().pos)'));
    await ev(`H.g.input.keys.add('KeyW')`);
    await sleep(1500);
    const p1 = JSON.parse(await ev('JSON.stringify(H.me().pos)'));
    await ev(`H.g.input.keys.add('ShiftLeft')`);
    await sleep(1500);
    const p2 = JSON.parse(await ev('JSON.stringify(H.me().pos)'));
    await ev(`H.g.input.keys.clear(); H.g.input.keys.add('Space')`);
    let maxY = 0;
    for (let i = 0; i < 10; i++) {
      await sleep(80);
      maxY = Math.max(maxY, await ev('H.me().pos.y'));
    }
    await ev(`H.g.input.keys.clear()`);
    console.log(
      `walk 1.5 s: ${Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(1)} m, +sprint 1.5 s: ${Math.hypot(p2.x - p1.x, p2.z - p1.z).toFixed(1)} m, jump apex ${maxY.toFixed(2)} m`,
    );

    // 3. building collision: walk into the first collider's nearest vertex-edge midpoint
    const col = JSON.parse(
      await ev(`(() => { const z = H.g.session.match.zone, c = z.colliders.find(c => c.poly && c.poly.length > 3);
        const a = c.poly[0], b = c.poly[1], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
        let nx = b[1] - a[1], nz = a[0] - b[0]; const l = Math.hypot(nx, nz); nx /= l; nz /= l;
        return JSON.stringify({ mx, mz, nx, nz }); })()`),
    );
    for (const sgn of [1, -1]) {
      await ev(`H.me().pos.x = ${col.mx + sgn * col.nx * 4}; H.me().pos.z = ${col.mz + sgn * col.nz * 4}; H.me().pos.y = 0;
        H.g.input.yaw = Math.atan2(${sgn * col.nx}, ${sgn * col.nz}); H.g.input.keys.add('KeyW');`);
      await sleep(2500);
      const d = await ev(
        `Math.hypot(H.me().pos.x - ${col.mx}, H.me().pos.z - ${col.mz}).toFixed(2)`,
      );
      console.log(
        `walk 2.5 s into wall from side ${sgn}: ends ${d} m from the wall midpoint (start 4, 0 = through)`,
      );
      await ev(`H.g.input.keys.clear()`);
    }

    // 4. shoot a bot: teleport 12 m from the nearest bot, aim, fire
    await ev(
      `(() => { const b = H.nearest(); const m = H.me(); m.pos.x = b.pos.x + 12; m.pos.z = b.pos.z; m.pos.y = 0; m.health = 100; m.spawnProtection = 99; })()`,
    );
    const hp0 = await ev('Math.round(H.nearest().health)');
    await ev(`H.g.input.fire = true`);
    let killed = false;
    for (let i = 0; i < 40 && !killed; i++) {
      await ev(
        `(() => { const b = H.nearest(false); window.__tgt = b; if (b.alive) H.aim(b); })()`,
      );
      await sleep(100);
      killed = !(await ev('window.__tgt.alive'));
    }
    await ev(`H.g.input.fire = false`);
    console.log(
      `shoot: target hp ${hp0} -> ${await ev('Math.round(window.__tgt.health)')}, killed ${killed}, player kills ${await ev('H.me().kills')}`,
    );

    // 5. bots chase and shoot back: put player 25 m from a bot, still, watch 20 s
    await ev(
      `(() => { const b = H.nearest(); const m = H.me(); m.spawnProtection = 0; m.health = 100; m.pos.x = b.pos.x + 20; m.pos.z = b.pos.z; m.pos.y = 0; window.__tgt = b; })()`,
    );
    const log = [];
    await ev(
      `document.querySelectorAll('div').forEach(d => { if (d.textContent.startsWith('Click to play')) d.style.display = 'none'; }); H.aim(H.nearest())`,
    );
    for (let i = 0; i < 4; i++) {
      await sleep(i === 0 ? 700 : 500);
      await ev(`H.aim(H.nearest())`);
      if (ci === 0 && i < 2) {
        await sleep(100);
        writeFileSync(
          new URL(`play-hip${i}.png`, dir),
          Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'),
        );
      }
      log.push(
        await ev(
          `(() => { const b = H.nearest(false), m = H.me(); return [Math.hypot(b.pos.x - m.pos.x, b.pos.z - m.pos.z).toFixed(0), Math.round(m.health)].join('/'); })()`,
        ),
      );
    }
    console.log('nearest-bot distance/player hp each 1.5 s:', log.join('  '));

    // 6. death and respawn: wait until the player dies (bots shoot an idle player), then respawn
    let died = false;
    for (let i = 0; i < 120 && !died; i++) {
      await ev(`H.me().alive || 0`);
      died = !(await ev('H.me().alive'));
      if (!died) await sleep(500);
    }
    console.log('player died:', died, 'deaths', await ev('H.me().deaths'));
    if (died) {
      for (let i = 0; i < 40 && !(await ev('H.me().alive')); i++) await sleep(250);
      console.log(
        'respawned alive:',
        await ev('H.me().alive'),
        'hp',
        await ev('Math.round(H.me().health)'),
      );
    }

    // 7. match end: shrink the time limit and look for the match-over panel
    await ev(`H.g.session.match.config.timeLimit = 1`);
    await sleep(2500);
    const over = await ev(`document.body.innerText.match(/Victory|Defeat|Draw/)?.[0] ?? null`);
    console.log('match over panel:', over, 'ended', await ev('H.g.session.match.isEnded'));
    if (ci === 0)
      writeFileSync(
        new URL('play-over.png', dir),
        Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'),
      );
    console.log('page errors:', logs.length ? logs.slice(0, 5) : 'none');
  });
}
