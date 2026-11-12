// Top-down orthographic render of the Google 3D tiles mesh (data/google/mall-area.glb, campus frame: x east, y up, z south).
// Headless Chrome + Three.js, unlit (the glb is KHR_materials_unlit), no shadows. Writes 2048 px tiles:
//   <out>/c_<col>_<row>.png  colour;  <out>/h_<col>_<row>.png  height (y metres, 16 bit: R high byte, G low byte, (y+20)/140*65535)
//   <out>/meta.json  region + pixel size. Image x = east, image y = south (row 0 = minZ). tools/google-roofs.py builds mosaic, canopy mask, roofs, ground.
// Usage: GLB=path/to/mall-area.glb node tools/google-topdown.mjs [outDir]   (region/res: REGION=-200,-350,320,365 MPP=0.0873)
// Rights: Google imagery, owner states usage rights; logged needs-clearance in docs/assets.md.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const glb = process.env.GLB ?? join(root, 'data/google/mall-area.glb');
const out = process.argv[2] ?? join(root, 'data/google/topdown');
const [x0, z0, x1, z1] = (process.env.REGION ?? '-200,-350,320,365').split(',').map(Number);
const mpp = Number(process.env.MPP ?? 0.0873), T = 2048;
const cols = Math.ceil((x1 - x0) / mpp / T), rows = Math.ceil((z1 - z0) / mpp / T);
mkdirSync(out, { recursive: true });

const page = `<!doctype html><body><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const r = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
r.setPixelRatio(1); r.setSize(${T}, ${T}); r.setClearColor(0x000000, 1);
const gltf = await new GLTFLoader().loadAsync('/mall.glb');
const scene = new THREE.Scene(); scene.add(gltf.scene);
const hm = new THREE.ShaderMaterial({ side: THREE.DoubleSide,
  vertexShader: 'varying float vy; void main(){ vy = (modelMatrix * vec4(position,1.0)).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'varying float vy; void main(){ float v = clamp((vy + 20.0) / 140.0, 0.0, 1.0) * 65535.0; float hi = floor(v / 256.0); gl_FragColor = vec4(hi / 255.0, (v - hi * 256.0) / 255.0, 0.0, 1.0); }' });
window.tile = (mode, x0, z0, x1, z1) => {
  const w = (x1 - x0) / 2, d = (z1 - z0) / 2; // view right = east, view up = north (-z): image rows run south
  const cam = new THREE.OrthographicCamera(-w, w, d, -d, 1, 800);
  cam.position.set((x0 + x1) / 2, 400, (z0 + z1) / 2); cam.up.set(0, 0, -1); cam.lookAt(cam.position.x, 0, cam.position.z);
  scene.overrideMaterial = mode === 'h' ? hm : null;
  r.render(scene, cam);
  return r.domElement.toDataURL('image/png');
};
window.ready = true;
</script>`;

const mime = { '.js': 'text/javascript', '.html': 'text/html' };
const server = createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  try {
    if (p === '/') res.writeHead(200, { 'content-type': 'text/html' }).end(page);
    else if (p === '/mall.glb') res.writeHead(200, { 'content-type': 'model/gltf-binary' }).end(readFileSync(glb));
    else if (p.startsWith('/three/') && !p.includes('..')) {
      const f = join(root, 'packages/saltline/node_modules/three', p.slice(7));
      res.writeHead(200, { 'content-type': mime[p.slice(p.lastIndexOf('.'))] ?? 'application/octet-stream' }).end(readFileSync(f));
    } else res.writeHead(404).end();
  } catch { res.writeHead(404).end(); }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
process.env.DIST = 'tools'; // chrome.mjs only needs a dir; PAGE is a full URL
process.env.PAGE = `http://127.0.0.1:${server.address().port}/`;
const { withPage, sleep } = await import('./chrome.mjs');
await withPage([], { uncapped: false }, async ({ ev, logs }) => {
  for (let i = 0; i < 480 && !(await ev('window.ready === true')); i++) await sleep(250);
  if (!(await ev('window.ready === true'))) throw new Error('glb did not load ' + logs.join('|'));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = x0 + i * T * mpp, b = z0 + j * T * mpp;
    for (const m of ['c', 'h']) {
      const url = await ev(`window.tile('${m}', ${a}, ${b}, ${a + T * mpp}, ${b + T * mpp})`);
      writeFileSync(join(out, `${m}_${i}_${j}.png`), Buffer.from(url.split(',')[1], 'base64'));
    }
    console.log('tile', i, j);
  }
  writeFileSync(join(out, 'meta.json'), JSON.stringify({ x0, z0, mpp, tile: T, cols, rows }));
  if (logs.length) console.log(logs.slice(0, 5));
});
server.close();
