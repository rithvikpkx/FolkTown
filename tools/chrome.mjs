// Headless Chrome driven over DevTools: serves packages/client/dist, opens a pose, hands a session to fn.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'packages/client/dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
export const poses = JSON.parse(readFileSync(join(root, 'tools/poses.json'), 'utf8'));
// Poses named mall-* are cameras over the Purdue Mall zone in play.html; the rest are the plaza test scene.
export function usePose(name, pose) {
  if (name.startsWith('mall-'))
    process.env.PAGE = `play.html?zone=purdue-mall&cam=${pose.join(',')}`;
  else delete process.env.PAGE;
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function requireDist() {
  if (!existsSync(join(dist, 'index.html'))) throw new Error('client build missing');
}

// PAGE=play.html?bots=7 opens that page as-is (no ?cam=) instead of index.html with the pose.
export async function withPage(pose, { uncapped }, fn) {
  const server = createServer((req, res) => {
    const raw = normalize(new URL(req.url, 'http://x').pathname).replace(/^(\.\.[/\\])+/, '');
    const p = raw === '/' ? '/index.html' : raw;
    try {
      const body = readFileSync(join(dist, p));
      res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  }).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const url = process.env.PAGE?.startsWith('http')
    ? process.env.PAGE
    : process.env.PAGE
      ? base + process.env.PAGE
      : `${base}?cam=${pose.join(',')}`;
  const prof = mkdtempSync(join(tmpdir(), 'ft-'));
  const port = 9300 + Math.floor(Math.random() * 600);
  const chrome = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      ...(process.env.HEADFUL ? [] : ['--headless=new']),
      '--use-angle=metal',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      ...(uncapped ? ['--disable-gpu-vsync', '--disable-frame-rate-limit'] : []),
      '--hide-scrollbars',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1440,900',
      `--force-device-scale-factor=${process.env.DPR ?? 1}`,
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${prof}`,
      '--no-first-run',
      url,
    ],
    { stdio: 'ignore' },
  );
  try {
    let target;
    for (let i = 0; i < 40 && !target; i++) {
      await sleep(250);
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
        target = list.find((x) => x.type === 'page' && x.url.startsWith('http'));
      } catch {}
    }
    if (!target) throw new Error('chrome did not start');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => {
      ws.onopen = r;
    });
    let id = 0;
    const pend = {};
    const logs = [];
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      pend[d.id]?.(d.result);
      if (d.method === 'Runtime.exceptionThrown')
        logs.push(d.params.exceptionDetails.exception?.description);
      if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error')
        logs.push(d.params.args.map((a) => a.value ?? a.description).join(' '));
    };
    const send = (method, params) =>
      new Promise((r) => {
        pend[++id] = r;
        ws.send(JSON.stringify({ id, method, params }));
      });
    const ev = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description);
      return r.result.value;
    };
    await send('Runtime.enable');
    await sleep(500);
    return await fn({ send, ev, logs });
  } finally {
    chrome.kill();
    server.close();
    await sleep(500); // let chrome stop writing to its profile
    rmSync(prof, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
