// ?walk=1 campus-region shots + numbers (serves packages/saltline/dist-walk): node tools/saltline-campus-shots.mjs [pose...]
// Writes tools/shots/campus-<pose>.jpg and prints draw stats and fps (frames over 4 s) per pose. UNCAPPED=1 disables vsync.
import { mkdirSync, writeFileSync } from 'node:fs';

process.env.DIST = 'packages/saltline/dist-walk';
const { sleep, withPage } = await import('./chrome.mjs');
const poses = {
  'aerial-union': '-20,130,-60,230,0,250', // from above the Bell Tower toward the Union
  'aerial-elliott': '0,110,60,-70,10,-70',
  'aerial-mall': '10,120,-40,10,0,250',
  'eye-union': '8,1.7,6,230,6,250',
  'eye-elliott': '8,1.7,-6,-80,10,-70',
  'eye-mall': '8,1.7,10,-5,6,250',
};
mkdirSync(new URL('shots/', import.meta.url), { recursive: true });
const only = process.argv.slice(2);
for (const [name, cam] of Object.entries(poses)) {
  if (only.length && !only.includes(name)) continue;
  process.env.PAGE = `index.html?walk=1&cam=${cam}`;
  await withPage([], { uncapped: !!process.env.UNCAPPED }, async ({ send, ev, logs }) => {
    for (let i = 0; i < 240 && !(await ev('window.__ready === true')); i++) await sleep(250);
    await sleep(5000);
    const f0 = await ev('window.__frames');
    await sleep(4000);
    const f1 = await ev('window.__frames');
    const tri = await ev(`(() => { const G = window.__G; let t = 0; const vis = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
      G.scene.traverse((o) => { if (o.isMesh && o.geometry && vis(o)) t += ((o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3) * (o.isInstancedMesh ? o.count : 1); });
      return Math.round(t); })()`).catch(() => ''); // visible scene triangles, main pass, no frustum cull
    const png = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
    writeFileSync(new URL(`shots/campus-${name}.jpg`, import.meta.url), Buffer.from(png.data, 'base64'));
    console.log(name, 'sceneTris', tri, 'fps', ((f1 - f0) / 4).toFixed(1), JSON.stringify(await ev('window.__stats && window.__stats()')), JSON.stringify({ errors: await ev('window.__errors'), fatal: await ev('window.__fatal') }), logs.length ? logs : '');
  });
}
