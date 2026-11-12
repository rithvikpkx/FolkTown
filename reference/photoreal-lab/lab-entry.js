import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
(async()=>{


const $ = (s) => document.querySelector(s);
const V3 = THREE.Vector3;
const QS = new URLSearchParams(location.search); // local testing only: ?scene=walc&preset=balanced&view=1&nomeasure=1
const bytes = (id) => {
  const bin = atob(document.getElementById(`asset-${id}`).textContent.trim());
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
};
const json = (id) => JSON.parse(document.getElementById(`asset-${id}`).textContent);
const MAN = json('manifest.json');
const POLYS = json('osm_polys.json');
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// ---------- renderer and settings ----------
const canvas = $('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.info.autoReset = false;
const pmrem = new THREE.PMREMGenerator(renderer);

const PRESETS = {
  balanced: { budget: 1.2e6, msaa: 0, fxaa: true, shadow: 2048, shadows: true, ibl: true, ao: false, bloom: true, dof: false, aa: true, grain: true, micro: false, maps: true },
  ultra: { budget: 2.3e6, msaa: 4, fxaa: false, shadow: 4096, shadows: true, ibl: true, ao: true, bloom: true, dof: true, aa: true, grain: true, micro: true, maps: true },
};
const CHIPS = [['maps', 'PBR maps'], ['ibl', 'Image-based light'], ['shadows', 'Shadows'], ['ao', 'GTAO'], ['aa', 'Anti-aliasing'], ['bloom', 'Bloom'], ['dof', 'Depth of field'], ['grain', 'Grain + vignette'], ['micro', 'Micro-detail']];
let S = { ...PRESETS.ultra }, presetName = 'ultra';

const texCache = new Map();
function loadTex(file, srgb) {
  const key = file + (srgb ? 's' : 'l');
  if (!texCache.has(key)) texCache.set(key, Promise.race([createImageBitmap(new Blob([bytes(file)], { type: 'image/webp' })), new Promise((_, j) => setTimeout(() => j(new Error('decoding ' + file + ' timed out')), 20000))]).then((bmp) => {
    const t = new THREE.Texture(bmp);
    t.flipY = false; // bitmaps upload as stored, the glTF convention; tiling sets compensate with normalScale.y = -1
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }));
  return texCache.get(key);
}
const canvasTex = (cv, srgb) => {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
};

// Tiling fine-grain normal (RG) and smudge (B) for assets whose own maps are flat.
function detailTexture() {
  const N = 256, h = new Float32Array(N * N), b = new Float32Array(N * N), g = new Float32Array(256);
  const w = (i) => (i + N) % N;
  for (let i = 0; i < N * N; i++) h[i] = rnd();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let s = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += h[w(y + j) * N + w(x + i)]; b[y * N + x] = s / 9; }
  for (let i = 0; i < 256; i++) g[i] = rnd();
  const d = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = b[y * N + w(x + 1)] - b[y * N + w(x - 1)], dy = b[w(y + 1) * N + x] - b[w(y - 1) * N + x];
    const fx = x / 16, fy = y / 16, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0, G = (a, c) => g[(c & 15) * 16 + (a & 15)];
    const lo = (G(x0, y0) * (1 - tx) + G(x0 + 1, y0) * tx) * (1 - ty) + (G(x0, y0 + 1) * (1 - tx) + G(x0 + 1, y0 + 1) * tx) * ty;
    const o = (y * N + x) * 4;
    d[o] = 128 + dx * 600; d[o + 1] = 128 + dy * 600; d[o + 2] = lo * 255; d[o + 3] = 255;
  }
  const t = new THREE.DataTexture(d, N, N);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
  return t;
}
const DETAIL = { uDetail: { value: detailTexture() }, uDetailScale: { value: 26 }, uDetailStrength: { value: 0 }, uRoughVar: { value: 0 } };
function addMicro(mat) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, DETAIL);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uDetail; uniform float uDetailScale, uDetailStrength, uRoughVar;')
      .replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.replace('mapN.xy *= normalScale;', 'mapN.xy *= normalScale; mapN.xy += (texture2D(uDetail, vNormalMapUv * uDetailScale).rg * 2.0 - 1.0) * uDetailStrength;'))
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n#ifdef USE_ROUGHNESSMAP\nroughnessFactor = clamp(roughnessFactor + (texture2D(uDetail, vRoughnessMapUv * uDetailScale * 0.21).b - 0.5) * uRoughVar, 0.05, 1.0);\n#endif');
  };
}

// ---------- geometry builder: quads grouped by material, UVs in metres ----------
const _e1 = new V3(), _e2 = new V3(), _n = new V3(), _u = new V3(), _v = new V3(), _t = new V3();
class Builder {
  constructor() { this.g = new Map(); }
  buf(m) { let b = this.g.get(m); if (!b) this.g.set(m, (b = { p: [], n: [], uv: [] })); return b; }
  poly(m, pts, { ts = 1, origin = pts[0], uv = null, jit = 0, nrm = null } = {}) {
    const B = this.buf(m), a = pts[0];
    _e1.subVectors(pts[1], a); _e2.subVectors(pts[pts.length - 1], a);
    _n.crossVectors(_e1, _e2).normalize();
    _u.copy(_e1).normalize(); _v.crossVectors(_n, _u);
    let nx = _n.x, ny = _n.y, nz = _n.z;
    if (nrm) { nx = nrm.x; ny = nrm.y; nz = nrm.z; }
    if (jit) { nx += (rnd() - 0.5) * jit; ny += (rnd() - 0.5) * jit; nz += (rnd() - 0.5) * jit; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l; }
    const idx = pts.length === 3 ? [0, 1, 2] : [0, 1, 2, 0, 2, 3];
    for (const i of idx) {
      const p = pts[i];
      B.p.push(p.x, p.y, p.z); B.n.push(nx, ny, nz);
      if (uv) B.uv.push(uv[i][0], uv[i][1]);
      else { _t.subVectors(p, origin); B.uv.push(_t.dot(_u) / ts, _t.dot(_v) / ts); }
    }
  }
  quad(m, a, b, c, d, o) { this.poly(m, [a, b, c, d], o); }
  tri(m, a, b, c, o) { this.poly(m, [a, b, c], o); }
  // c[i][j][k]: i along s, j up, k outward
  hexa(m, c, o, faces = 'flrtb') {
    const q = (a, b, cc, d) => this.quad(m, a, b, cc, d, o);
    if (faces.includes('f')) q(c[0][0][1], c[1][0][1], c[1][1][1], c[0][1][1]);
    if (faces.includes('k')) q(c[1][0][0], c[0][0][0], c[0][1][0], c[1][1][0]);
    if (faces.includes('r')) q(c[1][0][1], c[1][0][0], c[1][1][0], c[1][1][1]);
    if (faces.includes('l')) q(c[0][0][0], c[0][0][1], c[0][1][1], c[0][1][0]);
    if (faces.includes('t')) q(c[0][1][1], c[1][1][1], c[1][1][0], c[0][1][0]);
    if (faces.includes('b')) q(c[0][0][0], c[1][0][0], c[1][0][1], c[0][0][1]);
  }
  cyl(m, x, z, y0, y1, r0, r1, seg = 10) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const p = (a, r, y) => new V3(x + Math.sin(a) * r, y, z + Math.cos(a) * r);
      this.quad(m, p(a0, r0, y0), p(a1, r0, y0), p(a1, r1, y1), p(a0, r1, y1));
    }
  }
  meshes(mats, group) {
    let tris = 0;
    for (const [m, b] of this.g) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
      const mesh = new THREE.Mesh(geo, mats[m]);
      mesh.castShadow = m !== 'glass' && m !== 'canopy' && m !== 'ground';
      mesh.receiveShadow = true;
      mesh.name = m;
      group.add(mesh);
      tris += b.p.length / 9;
    }
    return tris;
  }
}

// A wall edge as a local frame: s along the edge, y up, d outward.
function frame(B, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz), tx = dx / len, tz = dz / len, nx = -tz, nz = tx;
  const O = new V3(ax, 0, az);
  const P = (s, y, d) => new V3(ax + tx * s + nx * d, y, az + tz * s + nz * d);
  const F = { len, O, P, mid: [ax + dx / 2, az + dz / 2], n: [nx, nz] };
  F.q = (m, s0, s1, y0, y1, d, o) => B.quad(m, P(s0, y0, d), P(s1, y0, d), P(s1, y1, d), P(s0, y1, d), { origin: O, ...o });
  F.box = (m, s0, s1, y0, y1, d0, d1, o, faces) => {
    const S = [s0, s1], Y = [y0, y1], D = [d0, d1];
    B.hexa(m, S.map((s) => Y.map((y) => D.map((d) => P(s, y, d)))), { origin: O, ...o }, faces);
  };
  F.wall = (m, s0, s1, y0, y1, ops, { ts = 1, reveal = 0.22, revealMat = m } = {}) => {
    const cut = (lo, hi, a, b) => [...new Set([lo, hi, ...ops.flatMap((o) => [o[a], o[b]])])].filter((v) => v >= lo && v <= hi).sort((p, q) => p - q);
    const SS = cut(s0, s1, 's0', 's1'), YY = cut(y0, y1, 'y0', 'y1');
    for (let i = 0; i < SS.length - 1; i++) for (let j = 0; j < YY.length - 1; j++) {
      const cs = (SS[i] + SS[i + 1]) / 2, cy = (YY[j] + YY[j + 1]) / 2;
      if (!ops.some((o) => cs > o.s0 && cs < o.s1 && cy > o.y0 && cy < o.y1)) F.q(m, SS[i], SS[i + 1], YY[j], YY[j + 1], 0, { ts });
    }
    for (const o of ops) {
      const r = -reveal, Q = (a, b, c, d) => B.quad(revealMat, a, b, c, d, { ts });
      Q(P(o.s0, o.y0, 0), P(o.s0, o.y0, r), P(o.s0, o.y1, r), P(o.s0, o.y1, 0));
      Q(P(o.s1, o.y0, r), P(o.s1, o.y0, 0), P(o.s1, o.y1, 0), P(o.s1, o.y1, r));
      Q(P(o.s0, o.y0, 0), P(o.s1, o.y0, 0), P(o.s1, o.y0, r), P(o.s0, o.y0, r));
      Q(P(o.s0, o.y1, r), P(o.s1, o.y1, r), P(o.s1, o.y1, 0), P(o.s0, o.y1, 0));
    }
  };
  // Glazing unit: one quad per pane (jittered normals), perimeter frame and bars.
  F.window = (o, { nc = 2, cuts = [0.36, 0.68], heavyC = [], heavyR = [], dBase = -0.2, bar = 0.05, heavy = 0.13, fr = 0.07, barD = 0.07 } = {}) => {
    const xs = [], ys = [o.y0, ...cuts.map((f) => o.y0 + f * (o.y1 - o.y0)), o.y1];
    for (let i = 0; i <= nc; i++) xs.push(o.s0 + ((o.s1 - o.s0) * i) / nc);
    for (let i = 0; i < nc; i++) for (let j = 0; j < ys.length - 1; j++) F.q('glass', xs[i], xs[i + 1], ys[j], ys[j + 1], dBase, { jit: 0.03 });
    const d1 = dBase + barD;
    F.box('bronze', o.s0, o.s0 + fr, o.y0, o.y1, dBase, d1, {}, 'fr');
    F.box('bronze', o.s1 - fr, o.s1, o.y0, o.y1, dBase, d1, {}, 'fl');
    F.box('bronze', o.s0, o.s1, o.y0, o.y0 + fr, dBase, d1, {}, 'ft');
    F.box('bronze', o.s0, o.s1, o.y1 - fr, o.y1, dBase, d1, {}, 'fb');
    for (let i = 1; i < nc; i++) { const w = heavyC.includes(i) ? heavy : bar; F.box('bronze', xs[i] - w / 2, xs[i] + w / 2, o.y0, o.y1, dBase, d1 + (heavyC.includes(i) ? 0.05 : 0), {}, 'flr'); }
    for (let j = 1; j < ys.length - 1; j++) { const w = heavyR.includes(j) ? heavy : bar; F.box('bronze', o.s0, o.s1, ys[j] - w / 2, ys[j] + w / 2, dBase, d1 + (heavyR.includes(j) ? 0.05 : 0), {}, 'ftb'); }
  };
  return F;
}

const TS = { brick: 1.6, lime: 2.4, roof: 2.6, pavers: 2.0, grass: 2.2, conc: 2.0 };
function edgesOf(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
  const pts = a > 0 ? [...poly].reverse() : poly; // outward must be t × up
  return pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
}
// Brick front with a limestone base, optional belt course, frieze and paired windows.
function facade(F, H, rows, belt) {
  const L = F.len, cols = [];
  if (L >= 8) { const n = Math.round(L / 5.4); for (let i = 0; i < n; i++) { const c = ((i + 0.5) * L) / n; cols.push([c - 1.45, c - 0.25], [c + 0.25, c + 1.45]); } }
  else if (L >= 3.2) cols.push([L / 2 - 0.6, L / 2 + 0.6]);
  const zones = belt ? [[0.9, belt[0]], [belt[1], H - 0.9]] : [[0.9, H - 0.9]];
  for (const [z0, z1] of zones) {
    const ops = [];
    for (const [y0, y1] of rows) if (y0 >= z0 && y1 <= z1) for (const [s0, s1] of cols) ops.push({ s0, s1, y0, y1 });
    F.wall('brick', 0, L, z0, z1, ops, { ts: TS.brick });
    for (const o of ops) {
      F.window(o);
      F.box('lime', o.s0 - 0.08, o.s1 + 0.08, o.y0 - 0.14, o.y0, 0, 0.07, { ts: TS.lime });
      F.box('lime', o.s0 - 0.1, o.s1 + 0.1, o.y1, o.y1 + 0.26, -0.01, 0.03, { ts: TS.lime }, 'fb');
    }
  }
  F.box('lime', -0.05, L + 0.05, 0, 0.9, 0, 0.06, { ts: TS.lime }, 'ft');
  if (belt) F.box('lime', -0.06, L + 0.06, belt[0], belt[1], 0, 0.07, { ts: TS.lime }, 'ftb');
  F.box('lime', -0.03, L + 0.03, H - 0.9, H, 0, 0.03, { ts: TS.lime }, 'fb');
}
function hipRoof(B, x0, x1, z0, z1, y, pitch, ov, mat = 'roof', trim = true) {
  const X0 = x0 - ov, X1 = x1 + ov, Z0 = z0 - ov, Z1 = z1 + ov, o = { ts: TS.roof };
  const alongX = X1 - X0 >= Z1 - Z0, half = (alongX ? Z1 - Z0 : X1 - X0) / 2, h = half * Math.tan(pitch);
  const p = (x, yy, z) => new V3(x, yy, z);
  if (alongX) {
    const zc = (Z0 + Z1) / 2;
    B.quad(mat, p(X0, y, Z1), p(X1, y, Z1), p(X1 - half, y + h, zc), p(X0 + half, y + h, zc), o);
    B.quad(mat, p(X1, y, Z0), p(X0, y, Z0), p(X0 + half, y + h, zc), p(X1 - half, y + h, zc), o);
    B.tri(mat, p(X0, y, Z0), p(X0, y, Z1), p(X0 + half, y + h, zc), o);
    B.tri(mat, p(X1, y, Z1), p(X1, y, Z0), p(X1 - half, y + h, zc), o);
  } else {
    const xc = (X0 + X1) / 2;
    B.quad(mat, p(X1, y, Z1), p(X1, y, Z0), p(xc, y + h, Z0 + half), p(xc, y + h, Z1 - half), o);
    B.quad(mat, p(X0, y, Z0), p(X0, y, Z1), p(xc, y + h, Z1 - half), p(xc, y + h, Z0 + half), o);
    B.tri(mat, p(X0, y, Z1), p(X1, y, Z1), p(xc, y + h, Z1 - half), o);
    B.tri(mat, p(X1, y, Z0), p(X0, y, Z0), p(xc, y + h, Z0 + half), o);
  }
  if (!trim) return;
  const f = 0.3;
  B.quad('soffit', p(X0, y - f, Z0), p(X1, y - f, Z0), p(X1, y - f, Z1), p(X0, y - f, Z1));
  B.quad('bronze', p(X0, y - f, Z1), p(X1, y - f, Z1), p(X1, y + 0.03, Z1), p(X0, y + 0.03, Z1));
  B.quad('bronze', p(X1, y - f, Z0), p(X0, y - f, Z0), p(X0, y + 0.03, Z0), p(X1, y + 0.03, Z0));
  B.quad('bronze', p(X1, y - f, Z1), p(X1, y - f, Z0), p(X1, y + 0.03, Z0), p(X1, y + 0.03, Z1));
  B.quad('bronze', p(X0, y - f, Z0), p(X0, y - f, Z1), p(X0, y + 0.03, Z1), p(X0, y + 0.03, Z0));
}
function cap(B, poly, y, mat) {
  const c = poly.map((p) => new THREE.Vector2(p[0], p[1]));
  for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(c, [])) {
    const a = new V3(c[i].x, y, c[i].y), b = new V3(c[j].x, y, c[j].y), d = new V3(c[k].x, y, c[k].y);
    _e1.subVectors(b, a); _e2.subVectors(d, a);
    if (_n.crossVectors(_e1, _e2).y > 0) B.tri(mat, a, b, d, { ts: 3 }); else B.tri(mat, a, d, b, { ts: 3 });
  }
}

const EAVE = 14.6;
// The limestone west hall: colonnade, name band, seven two-storey bronze window bays, bracketed eave.
function westHall(B, F, letters) {
  const L = F.len, n = 7, bw = L / n, o = { ts: TS.lime }, low = [], high = [];
  for (let i = 0; i < n; i++) {
    low.push({ s0: i * bw + 0.55, s1: (i + 1) * bw - 0.55, y0: 0, y1: 4.2 });
    high.push({ s0: i * bw + 0.62, s1: (i + 1) * bw - 0.62, y0: 6.1, y1: 13.4 });
  }
  F.wall('lime', 0, L, 0, 5.6, low, { ...o, reveal: 0.9 });
  F.wall('lime', 0, L, 5.6, EAVE, high, { ...o, reveal: 0.3, revealMat: 'bronze' });
  for (const w of high) {
    F.window(w, { nc: 4, cuts: [0.21, 0.42, 0.63, 0.815], heavyC: [2], heavyR: [3], dBase: -0.28, barD: 0.09 });
    // bronze surround standing proud of the stone
    F.box('bronze', w.s0 - 0.16, w.s0, w.y0 - 0.16, w.y1 + 0.16, 0, 0.16);
    F.box('bronze', w.s1, w.s1 + 0.16, w.y0 - 0.16, w.y1 + 0.16, 0, 0.16);
    F.box('bronze', w.s0, w.s1, w.y1, w.y1 + 0.16, 0, 0.16);
    F.box('bronze', w.s0 - 0.22, w.s1 + 0.22, w.y0 - 0.3, w.y0, 0, 0.22);
  }
  for (let i = 0; i <= n; i++) {
    const s = Math.min(Math.max(i * bw, 0.5), L - 0.5);
    F.box('lime', s - 0.46, s + 0.46, 5.7, EAVE - 0.3, 0, 0.09, o, 'flr');
    F.box('lime', s - 0.56, s + 0.56, 0, 0.5, 0, 0.16, o);
    for (const k of [-0.2, 0.2]) {
      const a = s + k - 0.055, b = s + k + 0.055, y0 = EAVE - 2.7, y1 = EAVE - 0.5, d0 = 0.09, d1 = 1.45, th = 0.17;
      B.hexa('bronze', [a, b].map((ss) => [0, th].map((t) => [[d0, y0], [d1, y1]].map(([d, y]) => F.P(ss, y + t, d)))), {}, 'flrtb');
      F.box('bronze', a, b, y0 - 0.5, EAVE - 0.3, 0.09, 0.2, {}, 'flrb');
    }
  }
  F.box('lime', 0, L, 5.45, 5.7, 0, 0.1, o, 'ftb');
  // colonnade: ceiling, end returns, recessed shopfront
  F.box('lime', 0, L, 4.2, 4.3, -3, 0, o, 'b');
  B.quad('brick', F.P(0, 0, 0), F.P(0, 0, -3), F.P(0, 4.2, -3), F.P(0, 4.2, 0), { ts: TS.brick });
  B.quad('brick', F.P(L, 0, -3), F.P(L, 0, 0), F.P(L, 4.2, 0), F.P(L, 4.2, -3), { ts: TS.brick });
  const shop = low.map((w) => ({ s0: w.s0 + 0.1, s1: w.s1 - 0.1, y0: 0.35, y1: 3.75 }));
  const FB = frame(B, ...F.P(0, 0, -3).toArray().filter((_, i) => i !== 1), ...F.P(L, 0, -3).toArray().filter((_, i) => i !== 1));
  FB.wall('brick', 0, L, 0, 4.2, shop, { ts: TS.brick, reveal: 0.12 });
  for (const w of shop) FB.window(w, { nc: 3, cuts: [0.72], dBase: -0.1 });
  // canopies between the piers
  for (const w of low) {
    F.box('canopy', w.s0 + 0.05, w.s1 - 0.05, 3.5, 3.54, 0.02, 1.5, {}, 'ftb');
    F.box('bronze', w.s0 + 0.05, w.s1 - 0.05, 3.44, 3.58, 1.5, 1.56);
    for (const s of [w.s0 + 0.05, w.s1 - 0.11, (w.s0 + w.s1) / 2 - 0.03]) F.box('bronze', s, s + 0.06, 3.4, 3.5, 0.02, 1.5, {}, 'lrb');
  }
  // the name, in metal letters on the stone band
  const lw = Math.min(L - 3, (letters.image.width / letters.image.height) * 0.52), s0 = L / 2 - lw / 2;
  B.quad('letters', F.P(s0, 4.52, 0.03), F.P(s0 + lw, 4.52, 0.03), F.P(s0 + lw, 5.04, 0.03), F.P(s0, 5.04, 0.03), { uv: [[0, 0], [1, 0], [1, 1], [0, 1]] });
}

function tree(B, x, z, s = 1) {
  B.cyl('bark', x, z, 0, 2.3 * s, 0.09 * s, 0.06 * s, 7);
  const c = new V3(x, 3.7 * s, z), a = new V3(), b = new V3(), p = new V3(), nrm = new V3();
  const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (let i = 0; i < 520; i++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1), r = (0.4 + 0.6 * Math.sqrt(rnd())) * (0.8 + 0.35 * Math.sin(th * 3 + x) * Math.sin(ph * 2 + z));
    p.set(Math.sin(ph) * Math.cos(th) * 1.5, Math.cos(ph) * 1.55, Math.sin(ph) * Math.sin(th) * 1.5).multiplyScalar(r * s).add(c);
    nrm.subVectors(p, c).normalize().add(new V3(0, 0.35, 0)).normalize();
    a.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(0.5 * s);
    b.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).cross(a).normalize().multiplyScalar(0.5 * s);
    const q = [p.clone().sub(a).sub(b), p.clone().add(a).sub(b), p.clone().add(a).add(b), p.clone().sub(a).add(b)];
    B.quad('leaf', q[0], q[1], q[2], q[3], { uv, nrm });
    B.quad('leaf', q[1], q[0], q[3], q[2], { uv: [uv[1], uv[0], uv[3], uv[2]], nrm });
  }
}
function lamp(B, x, z) {
  B.cyl('black', x, z, 0, 0.6, 0.15, 0.1, 8);
  B.cyl('black', x, z, 0.6, 3.5, 0.06, 0.05, 8);
  B.cyl('black', x, z, 3.5, 3.62, 0.2, 0.2, 8);
  B.cyl('lantern', x, z, 3.62, 4.2, 0.17, 0.21, 6);
  B.cyl('black', x, z, 4.2, 4.45, 0.26, 0.03, 6);
}

function buildCampus(mats, letters) {
  const B = new Builder(), P = (x, y, z) => new V3(x, y, z);
  // WALC
  const edges = edgesOf(POLYS.walc);
  for (const [a, b] of edges) {
    const F = frame(B, a[0], a[1], b[0], b[1]);
    if (F.len > 25 && F.mid[0] < -23 && Math.abs(F.mid[1]) < 12 && F.n[0] < -0.9) westHall(B, F, letters);
    else facade(F, EAVE, [[1.3, 4.3], [6.3, 8.9], [10.2, 12.8]], [5.0, 5.35]);
  }
  cap(B, POLYS.walc, EAVE - 0.28, 'soffit');
  const pitch = (22 * Math.PI) / 180;
  hipRoof(B, -27.9, 30.9, -51, -20.8, EAVE, pitch, 1.4);
  hipRoof(B, -27.5, 31.6, 9.7, 32, EAVE, pitch, 1.4);
  hipRoof(B, -23.8, -8, -21.5, 10.5, EAVE, pitch, 1.6);
  hipRoof(B, 11, 26.9, -21.5, 10.5, EAVE, pitch, 1.6);
  hipRoof(B, -22.9, -5.6, 30, 36.6, EAVE, pitch, 0.6);
  B.quad('membrane', P(-9.6, EAVE + 0.2, -21), P(-9.6, EAVE + 0.2, 10), P(12.6, EAVE + 0.2, 10), P(12.6, EAVE + 0.2, -21), { ts: 3 });
  for (const [x0, z0, x1, z1] of [[-5, 6, 8, 6], [8, 6, 8, -17], [8, -17, -5, -17], [-5, -17, -5, 6]]) frame(B, x0, z0, x1, z1).q('glass', 0, Math.hypot(x1 - x0, z1 - z0), EAVE + 0.2, EAVE + 2, 0, { jit: 0.02 });
  hipRoof(B, -5, 8, -17, 6, EAVE + 2, (14 * Math.PI) / 180, 0.2, 'glass', false);
  // neighbours: real footprints, invented heights
  for (const [id, H, fl] of [['potr', 17.5, 4], ['me', 14, 3], ['rail', 9, 2]]) {
    const fh = (H - 1.2) / fl, rows = [];
    for (let f = 0; f < fl; f++) rows.push([1.3 + f * fh, 1.3 + f * fh + 2.3]);
    for (const [a, b] of edgesOf(POLYS[id])) facade(frame(B, a[0], a[1], b[0], b[1]), H, rows, null);
    cap(B, POLYS[id], H - 0.5, 'membrane');
  }
  // ground: plaza in strips with concrete bands between, lawn beyond
  B.quad('ground', P(-400, -0.03, 400), P(400, -0.03, 400), P(400, -0.03, -400), P(-400, -0.03, -400), { ts: TS.grass, origin: P(0, 0, 0) });
  const bands = [-62, -41, -40, -15.6, -14.6, 14, 15, 47];
  for (let i = 0; i < bands.length - 1; i++) {
    const z0 = bands[i], z1 = bands[i + 1], m = z1 - z0 < 2 ? 'conc' : 'pavers';
    B.quad(m, P(-78, 0, z1), P(44, 0, z1), P(44, 0, z0), P(-78, 0, z0), { ts: m === 'conc' ? TS.conc : TS.pavers, origin: P(0, 0, 0) });
  }
  const fw = frame(B, -34, -30, -34, 20); // furniture line parallel to the west front, d grows away from the building
  for (const s of [8.5, 24.5, 40.5]) {
    fw.box('limeRough', s, s + 5.2, 0, 0.42, 4.6, 5.45, { ts: 1.3 }, 'fklr');
    fw.box('lime', s - 0.06, s + 5.26, 0.42, 0.52, 4.54, 5.51, { ts: TS.lime }, 'fklrt');
  }
  for (const s of [6, 22, 38]) {
    fw.box('lime', s, s + 11, 0, 0.28, -1.5, 2.6, { ts: TS.lime }, 'fklrt');
    B.quad('ground', fw.P(s + 0.25, 0.29, 2.35), fw.P(s + 10.75, 0.29, 2.35), fw.P(s + 10.75, 0.29, -1.25), fw.P(s + 0.25, 0.29, -1.25), { ts: TS.grass });
  }
  for (const s of [14.5, 30.5, 40.5]) tree(B, ...fw.P(s, 0, 0.5).toArray().filter((_, i) => i !== 1), 0.9 + rnd() * 0.3);
  tree(B, -63, -40, 1.9); tree(B, -66, 24, 2.1); tree(B, -52, 36, 1.5);
  for (const [x, z] of [[-41.5, -9], [-41.5, 11.5], [-41.5, 31], [-60, -12]]) lamp(B, x, z);
  const group = new THREE.Group();
  const tris = B.meshes(mats, group);
  return { group, tris };
}

function lettersTexture() {
  const cv = document.createElement('canvas'), text = 'THOMAS S. AND HARVEY D. WILMETH ACTIVE LEARNING CENTER';
  const font = '700 140px "Barlow Condensed", "Arial Narrow", "Helvetica Neue", Arial, sans-serif';
  let ctx = cv.getContext('2d'); ctx.font = font;
  let w = 0; for (const ch of text) w += ctx.measureText(ch).width + 14;
  cv.width = Math.ceil(w + 32); cv.height = 192;
  ctx = cv.getContext('2d'); ctx.font = font; ctx.fillStyle = '#231f1b'; ctx.textBaseline = 'middle';
  let x = 16; for (const ch of text) { ctx.fillText(ch, x, 100); x += ctx.measureText(ch).width + 14; }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function leafTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d');
  for (let i = 0; i < 70; i++) {
    c.save(); c.translate(18 + rnd() * 220, 18 + rnd() * 220); c.rotate(rnd() * 6.3);
    c.fillStyle = `hsl(${76 + rnd() * 26}, ${28 + rnd() * 16}%, ${20 + rnd() * 18}%)`;
    c.beginPath(); c.ellipse(0, 0, 15, 6.5, 0, 0, 6.3); c.fill(); c.restore();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// Limestone ashlar: brightened concrete with coursed joints drawn into colour and normal.
async function limestone() {
  const [c, n] = await Promise.all([loadTex('concrete012_c.webp', true), loadTex('concrete012_n.webp', false)]);
  const mk = (img, draw) => { const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const x = cv.getContext('2d'); x.drawImage(img, 0, 0, 1024, 1024); draw(x); return cv; };
  const joints = (x, fn) => { for (let r = 0; r < 4; r++) { fn(0, r * 256, 1024, 0); for (let k = 0; k < 2; k++) fn(((k + (r % 2) * 0.5) * 512 + 90) % 1024, r * 256, 0, 256); } };
  const col = mk(c.image, (x) => {
    x.globalCompositeOperation = 'screen'; x.fillStyle = 'rgb(118,108,88)'; x.fillRect(0, 0, 1024, 1024);
    x.globalCompositeOperation = 'source-over'; x.strokeStyle = 'rgba(70,62,50,0.55)'; x.lineWidth = 2.5;
    joints(x, (px, py, w, h) => { x.beginPath(); x.moveTo(px, py + 1); x.lineTo(px + w, py + 1 + h); x.stroke(); });
  });
  const nor = mk(n.image, (x) => {
    joints(x, (px, py, w, h) => {
      const hz = h === 0;
      x.fillStyle = hz ? 'rgb(128,40,200)' : 'rgb(216,128,200)'; x.fillRect(px - (hz ? 0 : 2), py - (hz ? 2 : 0), hz ? w : 2, hz ? 2 : h);
      x.fillStyle = hz ? 'rgb(128,216,200)' : 'rgb(40,128,200)'; x.fillRect(px + (hz ? 0 : 1), py + (hz ? 1 : 0), hz ? w : 2, hz ? 2 : h);
    });
  });
  return { map: canvasTex(col, true), normalMap: canvasTex(nor, false) };
}

// ---------- scenes ----------
const scenes = {}, ORDER = ['m4a1', 'pistol', 'shotgun', 'boltrifle', 'walc'];
const LABEL = { m4a1: 'Rifle', pistol: 'Pistol', shotgun: 'Shotgun', boltrifle: 'Bolt rifle', walc: 'WALC' };
const CAPTION = {
  m4a1: 'M4A1, CC0, 9,256 triangles, 2K maps. The game\'s current rifle model; its colour and normal maps are nearly flat, so the micro-detail layer does visible work here.',
  pistol: 'Service pistol with its loaded magazine, Poly Haven, CC0, 16,650 triangles, 2K maps.',
  shotgun: 'Pump shotgun, CC0, 1,740 triangles, 2K maps. The game\'s current shotgun model.',
  boltrifle: 'Bolt-action rifle 7.62, Poly Haven, CC0, 19,985 triangles. Not a FolkTown weapon; here as the quality reference.',
  walc: 'Wilmeth Active Learning Center, west front. Built in code from the OpenStreetMap footprint and two reference photographs; heights are estimates.',
};
let studioEnv = null;
function studio() {
  if (!studioEnv) {
    const d = new RGBELoader().parse(bytes('studio.hdr').buffer);
    const t = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type);
    t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.LinearSRGBColorSpace;
    t.minFilter = t.magFilter = THREE.LinearFilter; t.flipY = true; t.needsUpdate = true;
    studioEnv = pmrem.fromEquirectangular(t).texture;
  }
  return studioEnv;
}
function countTris(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
  return Math.round(n);
}
function swapMaps(sc) { // remember each material's maps so the PBR switch can drop and restore them
  sc.pbr = [];
  sc.scene.traverse((o) => {
    if (!o.isMesh || !o.material.isMeshStandardMaterial || sc.pbr.some((e) => e.m === o.material)) return;
    const m = o.material;
    sc.pbr.push({ m, normalMap: m.normalMap, roughnessMap: m.roughnessMap, metalnessMap: m.metalnessMap, aoMap: m.aoMap, metalness: m.metalness, roughness: m.roughness });
  });
}

async function gunScene(id) {
  const cfg = MAN[id], PH = id === 'pistol' || id === 'boltrifle';
  const gltf = await new GLTFLoader().parseAsync(bytes(cfg.glb).buffer, '');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070708);
  const jobs = [];
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = true;
    const m = o.material, t = cfg.mats[m.name];
    if (m.transmission > 0 || /glass/.test(m.name)) { m.transmission = 0; m.transparent = false; m.opacity = 1; m.color.set(0x05070a); m.roughness = 0.04; m.metalness = 0; m.userData.glass = true; return; }
    if (!t || m.userData.done) return;
    m.userData.done = true;
    jobs.push(Promise.all([loadTex(t.map, true), loadTex(t.normal, false), loadTex(t.orm, false)]).then(([c, n, orm]) => {
      m.map = c; m.normalMap = n; m.roughnessMap = m.metalnessMap = orm; m.roughness = 1; m.metalness = 1;
      if (PH) m.aoMap = orm;
      if (!PH) addMicro(m);
      m.needsUpdate = true;
    }));
  });
  await Promise.all(jobs);
  // lay the weapon on its side, long axis along x, resting on the table
  const pivot = new THREE.Group(); pivot.add(gltf.scene); scene.add(pivot);
  let box = new THREE.Box3().setFromObject(pivot), size = box.getSize(new V3());
  const ax = ['x', 'y', 'z'], thin = ax.reduce((a, b) => (size[a] < size[b] ? a : b)), long = ax.reduce((a, b) => (size[a] > size[b] ? a : b));
  if (thin === 'x') pivot.rotation.z = Math.PI / 2; else if (thin === 'z') pivot.rotation.x = Math.PI / 2;
  const outer = new THREE.Group(); scene.remove(pivot); outer.add(pivot); scene.add(outer);
  if ((thin === 'x' && long === 'z') || (thin === 'y' && long === 'z') || (thin === 'z' && long === 'y')) outer.rotation.y = Math.PI / 2;
  box = new THREE.Box3().setFromObject(outer); size = box.getSize(new V3());
  const ctr = box.getCenter(new V3());
  outer.position.set(-ctr.x, -box.min.y + 0.0005, -ctr.z);
  const L = size.x;
  // table
  const [tc, tn, to] = await Promise.all([loadTex('concrete012_c.webp', true), loadTex('concrete012_n.webp', false), loadTex('concrete012_o.webp', false)]);
  const tm = new THREE.MeshStandardMaterial({ map: tc, normalMap: tn, roughnessMap: to, color: 0x5d5f66, roughness: 1, metalness: 0 });
  tm.normalScale.set(0.3, -0.3);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), tm);
  table.geometry.attributes.uv.array.forEach((v, i, a) => (a[i] = v * 5));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
  scene.fog = new THREE.Fog(0x070708, L * 2.2, L * 5.5);
  // lights
  const key = new THREE.DirectionalLight(0xfff0dc, 3.2);
  key.position.set(-0.55 * L, 1.0 * L, -0.75 * L); key.castShadow = true;
  const sc = key.shadow.camera; sc.left = -L * 0.75; sc.right = L * 0.75; sc.top = L * 0.75; sc.bottom = -L * 0.75; sc.near = 0.05; sc.far = L * 4;
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.002;
  const fill = new THREE.DirectionalLight(0xbcd0ff, 0.5); fill.position.set(L, 0.5 * L, L);
  const hemi = new THREE.HemisphereLight(0x8a8f99, 0x25221e, 0); // only when image-based light is switched off
  scene.add(key, fill, hemi);
  const env = studio();
  scene.environmentRotation.y = 1.9; scene.environmentIntensity = 0.85;
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.02, 40);
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = false; controls.enableDamping = true; controls.maxPolarAngle = 1.5; controls.minDistance = L * 0.25; controls.maxDistance = L * 3.2;
  controls.target.set(0, size.y * 0.5, 0);
  const views = [
    { name: 'Three-quarter', dir: [0.32, 0.92, 0.9], k: 1.18 },
    { name: 'Top', dir: [0.02, 1, 0.12], k: 1.12 },
    { name: 'Close', dir: [-0.5, 0.42, 0.75], k: 0.52, at: [-0.12 * L, 0, 0] },
  ];
  const sceneObj = { id, scene, camera, controls, key, hemi, env, tris: countTris(gltf.scene), exposure: 1.0, sat: 1.05, gun: true, L, views, aoRadius: Math.max(0.02, L * 0.05), bloom: 0.16,
    setView(v) {
      const h = 2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect), dist = (L * v.k) / (2 * Math.tan(h / 2));
      controls.target.set(...(v.at ?? [0, 0, 0])).add(new V3(0, size.y * 0.5, 0));
      camera.position.copy(new V3(...v.dir).normalize().multiplyScalar(dist)).add(controls.target);
    } };
  swapMaps(sceneObj);
  return sceneObj;
}

async function walcScene() {
  const scene = new THREE.Scene();
  const set = async (name, opt = {}) => {
    const [c, n, o] = await Promise.all([loadTex(`${name}_c.webp`, true), loadTex(`${name}_n.webp`, false), loadTex(`${name}_o.webp`, false)]);
    const m = new THREE.MeshStandardMaterial({ map: c, normalMap: n, roughnessMap: o, aoMap: o, roughness: 1, metalness: 0, ...opt });
    m.normalScale.set(1, -1);
    return m;
  };
  const lime = await limestone(), conc = await loadTex('concrete012_o.webp', false), concN = await loadTex('concrete012_n.webp', false), concC = await loadTex('concrete012_c.webp', true);
  const leaf = leafTexture(), letters = lettersTexture();
  const mats = {
    brick: await set('bricks101', { color: 0xc9a79a }),
    lime: new THREE.MeshStandardMaterial({ ...lime, roughnessMap: conc, roughness: 1, color: 0xf4ecdc }),
    limeRough: new THREE.MeshStandardMaterial({ map: lime.map, normalMap: concN, roughnessMap: conc, roughness: 1, color: 0xe6dccb }),
    roof: await set('clay_roof_tiles_02', { color: 0xffc9a8 }),
    pavers: await set('herringbone_pavement', { color: 0xe2dcd8 }),
    ground: await set('grass004', { color: 0xc4cf9a }),
    conc: new THREE.MeshStandardMaterial({ map: concC, normalMap: concN, roughnessMap: conc, roughness: 1, color: 0xd9d6cf }),
    membrane: new THREE.MeshStandardMaterial({ color: 0x2c2b2a, roughness: 0.9 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x5a4c40, roughness: 0.5, metalness: 0.55 }),
    soffit: new THREE.MeshStandardMaterial({ color: 0x33291f, roughness: 0.7, metalness: 0.2 }),
    black: new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.45, metalness: 0.6 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x3d3229, roughness: 0.95 }),
    lantern: new THREE.MeshStandardMaterial({ color: 0xfff1cf, emissive: 0xffd9a0, emissiveIntensity: 0.6, roughness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fb4c4, roughness: 0.04, metalness: 0.9, envMapIntensity: 1.0 }),
    canopy: new THREE.MeshPhysicalMaterial({ color: 0x8fb8a6, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.55, ior: 1.6, side: THREE.DoubleSide }),
    letters: new THREE.MeshStandardMaterial({ map: letters, alphaTest: 0.5, roughness: 0.5, metalness: 0.5 }),
    leaf: new THREE.MeshStandardMaterial({ map: leaf, alphaTest: 0.5, roughness: 0.8, color: 0xffffff }),
  };
  mats.ground.roughnessMap = null; mats.ground.roughness = 0.93; // the source roughness is too glossy
  for (const k of ['lime', 'limeRough', 'conc']) mats[k].normalScale.set(1, k === 'lime' ? 1 : -1);
  mats.limeRough.normalScale.multiplyScalar(2.2);
  const { group, tris } = buildCampus(mats, letters);
  scene.add(group);
  group.traverse((o) => {
    if (o.name === 'leaf') { o.receiveShadow = false; o.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leaf, alphaTest: 0.5 }); o.userData.noAO = true; }
    if (o.name === 'letters' || o.name === 'canopy') { o.castShadow = false; o.userData.noAO = true; }
  });
  // sky and sun: low, warm, from the west-north-west
  const sky = new Sky(); sky.scale.setScalar(1500); sky.userData.noAO = true;
  const sunDir = new V3(-0.80, 0.37, -0.47).normalize();
  Object.assign(sky.material.uniforms.turbidity, { value: 2.2 }); sky.material.uniforms.rayleigh.value = 2.8;
  sky.material.uniforms.mieCoefficient.value = 0.004; sky.material.uniforms.mieDirectionalG.value = 0.82;
  sky.material.uniforms.sunPosition.value.copy(sunDir);
  // the stock sky is far brighter than the sunlit ground, which tone-maps to grey; pull it down and keep its blue
  sky.material.fragmentShader = sky.material.fragmentShader.replace('gl_FragColor = vec4( retColor, 1.0 );', 'retColor = mix(vec3(dot(retColor, vec3(0.3333))), retColor, 1.45) * 0.4; gl_FragColor = vec4( max(retColor, 0.0), 1.0 );');
  scene.add(sky);
  const key = new THREE.DirectionalLight(0xffd6a6, 4.3);
  key.position.copy(sunDir).multiplyScalar(260).add(new V3(-12, 0, -6)); key.target.position.set(-12, 0, -6);
  key.castShadow = true;
  const c = key.shadow.camera; c.left = -86; c.right = 86; c.top = 70; c.bottom = -70; c.near = 20; c.far = 520;
  key.shadow.bias = -0.0002; key.shadow.normalBias = 0.06;
  const hemi = new THREE.HemisphereLight(0x9db4d6, 0x6b5a48, 0);
  scene.add(key, key.target, hemi);
  scene.fog = new THREE.FogExp2(0xbfb6a6, 0.0015);
  { // distant tree line so the lawn does not meet the sky on a bare edge
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 64;
    const x = cv.getContext('2d');
    for (let i = 0; i < 520; i++) { const px = rnd() * 1024, r = 8 + rnd() * 16, py = 64 - rnd() * 26; x.fillStyle = `hsl(${92 + rnd() * 22}, 28%, ${13 + rnd() * 9}%)`; for (const dx of [-1024, 0, 1024]) { x.beginPath(); x.arc(px + dx, py, r, 0, 6.3); x.fill(); } }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.x = 10;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(430, 430, 30, 72, 1, true), new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.BackSide }));
    ring.position.y = 14.5; ring.userData.noAO = true; scene.add(ring);
  }
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.3, 3000);
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = false; controls.enableDamping = true; controls.maxPolarAngle = 1.56; controls.minDistance = 3; controls.maxDistance = 260;
  const views = [
    { name: 'Plaza', pos: [-45.5, 1.8, -25], at: [-24, 7.4, 6] },
    { name: 'Front', pos: [-58, 6, -7], at: [-24, 7.5, -6.5] },
    { name: 'Colonnade', pos: [-29.5, 1.75, -24], at: [-24.5, 4.6, -6] },
    { name: 'Aerial', pos: [-105, 52, 42], at: [-8, 6, -4] },
  ];
  const sc = { id: 'walc', scene, camera, controls, key, hemi, env: null, tris, exposure: 0.74, sat: 1.12, gun: false, views, aoRadius: 0.9, bloom: 0.1,
    setView(v) { camera.position.set(...v.pos); controls.target.set(...v.at); } };
  // reflection probe from the plaza: sky, ground and building in one environment
  const first = pmrem.fromScene(new THREE.Scene().add(sky.clone()), 0, 1, 2000).texture;
  scene.environment = first; scene.environmentIntensity = 1.5;
  const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cube = new THREE.CubeCamera(0.5, 2000, rt); cube.position.set(-44, 2.6, -6);
  cube.update(renderer, scene);
  sc.env = pmrem.fromCubemap(rt.texture).texture;
  rt.dispose(); first.dispose();
  swapMaps(sc);
  $('#walcTris').textContent = tris.toLocaleString('en-US');
  return sc;
}

// ---------- post chain ----------
const Final = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.03 }, uVig: { value: 0.5 }, uSat: { value: 1.0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uGrain, uVig, uSat; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - 0.5;
      float n = h(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5, l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb = mix(vec3(l), c.rgb, uSat) * (1.0 - uVig * dot(q, q)) + n * uGrain * (1.0 - 0.6 * l); gl_FragColor = c; }`,
};
// Scene render into its own multisampled target, so only this pass pays for MSAA (not every post pass).
class ScenePass extends Pass {
  constructor(scene, camera, samples) {
    super(); this.scene = scene; this.camera = camera; this.needsSwap = true;
    this.rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples });
    this.quad = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.clone(CopyShader.uniforms), vertexShader: CopyShader.vertexShader, fragmentShader: CopyShader.fragmentShader }));
  }
  setSize(w, h) { this.rt.setSize(w, h); }
  render(renderer, writeBuffer) {
    renderer.setRenderTarget(this.rt); renderer.clear(); renderer.render(this.scene, this.camera);
    this.quad.material.uniforms.tDiffuse.value = this.rt.texture;
    renderer.setRenderTarget(writeBuffer); this.quad.render(renderer);
  }
  dispose() { this.rt.dispose(); this.quad.dispose(); }
}
let cur = null, composer = null, bokeh = null, final = null, frameNo = 0;
function buildComposer() {
  composer?.renderTarget1.dispose(); composer?.renderTarget2.dispose();
  for (const p of composer?.passes ?? []) p.dispose?.();
  const sz = renderer.getDrawingBufferSize(new THREE.Vector2());
  const aa = S.aa ? S.msaa : 0;
  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(sz.x, sz.y, { type: THREE.HalfFloatType }));
  composer.setPixelRatio(1); composer.setSize(sz.x, sz.y);
  composer.addPass(aa ? new ScenePass(cur.scene, cur.camera, aa) : new RenderPass(cur.scene, cur.camera));
  if (S.ao) {
    const g = new GTAOPass(cur.scene, cur.camera, sz.x, sz.y);
    g.updateGtaoMaterial({ radius: cur.aoRadius, distanceExponent: 1.4, thickness: 1.2, scale: 1.15, samples: 12, screenSpaceRadius: false });
    g.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 8 });
    g.blendIntensity = 0.95;
    const ov = g.overrideVisibility.bind(g);
    g.overrideVisibility = function () { ov(); this.scene.traverse((o) => { if (o.userData.noAO) o.visible = false; }); };
    composer.addPass(g);
    g.setSize(Math.ceil(sz.x / 2), Math.ceil(sz.y / 2)); // half-size occlusion, upsampled by the blend
  }
  bokeh = null;
  if (S.dof && cur.gun) {
    bokeh = new BokehPass(cur.scene, cur.camera, { focus: 1, aperture: 0.012 / cur.L, maxblur: 0.0055 });
    bokeh.setSize(sz.x, sz.y);
    composer.addPass(bokeh);
  }
  if (S.bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(sz.x, sz.y), cur.bloom, 0.5, 1.0));
  composer.addPass(new OutputPass());
  if (S.aa && S.fxaa) { const f = new ShaderPass(FXAAShader); f.material.uniforms.resolution.value.set(1 / sz.x, 1 / sz.y); composer.addPass(f); }
  final = new ShaderPass(Final); composer.addPass(final);
  final.uniforms.uGrain.value = S.grain ? 0.03 : 0; final.uniforms.uVig.value = S.grain ? 0.5 : 0; final.uniforms.uSat.value = cur.sat;
}
function apply() {
  if (!cur) return;
  const w = canvas.clientWidth || 800, h = canvas.clientHeight || 450;
  const pr = Math.min(Math.sqrt(S.budget / (w * h)), Math.max(window.devicePixelRatio || 1, S.budget > 2e6 ? 2 : 1));
  renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
  cur.camera.aspect = w / h; cur.camera.updateProjectionMatrix();
  renderer.toneMappingExposure = cur.exposure;
  const k = cur.key;
  k.castShadow = S.shadows;
  if (k.shadow.mapSize.x !== S.shadow) { k.shadow.mapSize.set(S.shadow, S.shadow); k.shadow.map?.dispose(); k.shadow.map = null; }
  cur.scene.environment = S.ibl ? cur.env : null;
  cur.hemi.intensity = S.ibl ? 0 : cur.gun ? 0.6 : 1.1;
  DETAIL.uDetailStrength.value = S.micro ? 0.5 : 0; DETAIL.uRoughVar.value = S.micro ? 0.22 : 0;
  if (cur.mapsOn !== S.maps) {
    cur.mapsOn = S.maps;
    for (const e of cur.pbr) {
      const m = e.m;
      m.normalMap = S.maps ? e.normalMap : null; m.roughnessMap = S.maps ? e.roughnessMap : null; m.metalnessMap = S.maps ? e.metalnessMap : null; m.aoMap = S.maps ? e.aoMap : null;
      m.metalness = S.maps ? e.metalness : e.metalnessMap ? 0.6 : e.metalness; m.roughness = S.maps ? e.roughness : e.roughnessMap ? 0.6 : e.roughness;
      m.needsUpdate = true;
    }
  }
  buildComposer();
  ui();
}
function draw() {
  cur.controls.update();
  if (bokeh) { bokeh.uniforms.focus.value = cur.camera.position.distanceTo(cur.controls.target); bokeh.uniforms.nearClip.value = cur.camera.near; bokeh.uniforms.farClip.value = cur.camera.far; }
  final.uniforms.uTime.value = (frameNo++ % 600) / 60;
  renderer.info.reset();
  composer.render();
}

// ---------- measuring ----------
const results = {}, TRIS = {}, px = new Uint8Array(4);
const nextFrame = () => new Promise((r) => { requestAnimationFrame(r); setTimeout(r, 120); });
async function measure() {
  const gl = renderer.getContext(), flush = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  for (let i = 0; i < 4; i++) draw();
  flush();
  const out = [];
  for (let k = 0; k < 7; k++) {
    await nextFrame();
    const t0 = performance.now();
    for (let i = 0; i < 8; i++) draw();
    flush();
    out.push((performance.now() - t0) / 8);
  }
  out.sort((a, b) => a - b);
  return out[3];
}
let busy = false;
const setBusy = (b, msg = 'measuring…') => { busy = b; $('#busy').hidden = !b; $('#busy').textContent = msg; for (const el of document.querySelectorAll('.viewer button, .viewer input')) el.disabled = b; };
async function show(id) {
  if (!scenes[id]) scenes[id] = id === 'walc' ? walcScene() : gunScene(id);
  const sc = await scenes[id];
  if (cur) cur.controls.enabled = false;
  cur = sc; sc.controls.enabled = true; TRIS[id] = sc.tris;
  if (!sc.viewed) { sc.viewed = true; apply(); sc.setView(sc.views[0]); } else apply();
  $('#cap').textContent = CAPTION[id];
  return sc;
}
async function record(id) {
  const sz = renderer.getDrawingBufferSize(new THREE.Vector2());
  (results[id] ??= {})[presetName] = { ms: await measure(), mp: (sz.x * sz.y) / 1e6 };
  table();
}
async function measureAll(ids) {
  setBusy(true);
  const back = cur.id, keep = presetName, keepS = { ...S };
  for (const id of ids) {
    await show(id);
    for (const p of ['balanced', 'ultra']) { preset(p); await record(id); }
  }
  await show(back); presetName = keep; S = keepS; apply(); views();
  await breakdown();
  setBusy(false);
}
async function breakdown() {
  const keep = { ...S }, kp = presetName, base = { ...PRESETS.ultra };
  const run = async (o) => { S = { ...base, ...o }; apply(); return measure(); };
  const full = await run({});
  const rows = [['Resolution 2.3 → 1.2 MP', { budget: 1.2e6 }], ['MSAA 4× → FXAA', { msaa: 0, fxaa: true }], ['GTAO', { ao: false }], ['Shadows 4096 → 2048', { shadow: 2048 }], ['Shadows (all)', { shadows: false }], ['Bloom', { bloom: false }], ['Grain + vignette', { grain: false }], ['Image-based light', { ibl: false }]];
  if (cur.gun) rows.splice(3, 0, ['Depth of field', { dof: false }]);
  const out = [];
  for (const [name, o] of rows) out.push([name, await run(o)]);
  const full2 = (full + (await run({}))) / 2; // baseline again at the end, to average out drift
  for (const r of out) r[1] = full2 - r[1];
  S = keep; presetName = kp; apply();
  const max = Math.max(0.5, ...out.map((r) => Math.abs(r[1])));
  $('#breakTitle').textContent = `${LABEL[cur.id]}, Ultra preset (${full.toFixed(1)} ms), one technique removed at a time. Longer bar means that technique costs more.`;
  $('#bars').innerHTML = out.map(([n, d]) => `<span>${n}</span><span class="track"><span class="fill${d < 0 ? ' neg' : ''}" style="display:block;width:${Math.min(100, (Math.abs(d) / max) * 100).toFixed(0)}%"></span></span><span class="v">${d >= 0 ? '' : '−'}${Math.abs(d).toFixed(1)} ms</span>`).join('');
}

// ---------- interface ----------
function table() {
  const cell = (r) => (r ? `${r.ms.toFixed(1)} ms <small>· ${Math.round(1000 / r.ms)} fps · ${r.mp.toFixed(1)} MP</small>` : '<small>open the tab</small>');
  $('#matrix tbody').innerHTML = ORDER.map((id) => `<tr><td>${LABEL[id]}</td><td class="n">${TRIS[id]?.toLocaleString('en-US') ?? ''}</td><td class="n">${cell(results[id]?.balanced)}</td><td class="n">${cell(results[id]?.ultra)}</td></tr>`).join('');
}
function ui() {
  for (const p of ['balanced', 'ultra']) $(`#p-${p}`).setAttribute('aria-pressed', String(presetName === p));
  for (const [k] of CHIPS) { const el = $(`#c-${k}`); el.checked = S[k]; }
  for (const b of document.querySelectorAll('#tabs button')) b.setAttribute('aria-selected', String(b.dataset.id === cur?.id));
}
function preset(p) { presetName = p; S = { ...PRESETS[p] }; apply(); }
for (const id of ORDER) {
  const b = document.createElement('button'); b.textContent = LABEL[id]; b.dataset.id = id; b.setAttribute('role', 'tab');
  b.onclick = async () => { if (busy) return; setBusy(true, 'loading…'); await show(id); views(); if (!results[id]?.[presetName]) await record(id); setBusy(false); };
  $('#tabs').append(b);
}
for (const [k, name] of CHIPS) {
  const l = document.createElement('label'); l.className = 'chip';
  l.innerHTML = `<input type="checkbox" id="c-${k}"> ${name}`;
  l.firstChild.onchange = (e) => { S[k] = e.target.checked; presetName = 'custom'; apply(); };
  $('#chips').append(l);
}
function views() {
  $('#views').innerHTML = '';
  cur.views.forEach((v) => { const b = document.createElement('button'); b.textContent = v.name; b.onclick = () => cur.setView(v); $('#views').append(b); });
}
$('#p-balanced').onclick = () => preset('balanced');
$('#p-ultra').onclick = () => preset('ultra');
$('#remeasure').onclick = () => { if (!busy) measureAll(Object.keys(results).length ? Object.keys(results) : [cur.id]); };
new ResizeObserver(() => { if (cur && !busy) apply(); }).observe(canvas);

let hudSet = false;
const hud = () => { hudSet = true; const sz = renderer.getDrawingBufferSize(new THREE.Vector2()); $('#hud').innerHTML = `<b>${LABEL[cur.id]}</b> · ${presetName}<br>${cur.tris.toLocaleString('en-US')} triangles<br>${sz.x}×${sz.y}`; };
let visible = true, last = performance.now(), acc = 0, n = 0, fps = 0;
new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
function loop(t) {
  requestAnimationFrame(loop);
  if (!cur || busy || !visible || document.hidden) { last = t; if (cur && !hudSet) hud(); return; }
  draw();
  acc += t - last; last = t; n++;
  if (acc > 600) {
    fps = (n * 1000) / acc; acc = 0; n = 0;
    const sz = renderer.getDrawingBufferSize(new THREE.Vector2()), r = results[cur.id]?.[presetName];
    $('#hud').innerHTML = `<b>${LABEL[cur.id]}</b> · ${presetName}<br>${cur.tris.toLocaleString('en-US')} triangles <i>(${renderer.info.render.triangles.toLocaleString('en-US')} drawn per frame, ${renderer.info.render.calls} calls)</i><br>${sz.x}×${sz.y} <i>(${((sz.x * sz.y) / 1e6).toFixed(2)} MP)</i> · ${fps.toFixed(0)} fps on screen<br>render time ${r ? `<b>${r.ms.toFixed(1)} ms</b>` : '<i>not measured for this setting</i>'}`;
  }
}

try {
  const first = QS.get('scene') ?? 'walc';
  $('#hud').textContent = 'loading scene…';
  if (document.fonts?.load) await Promise.race([document.fonts.load('700 70px "Barlow Condensed"'), new Promise((r) => setTimeout(r, 1500))]);
  const sc = await show(first);
  views(); table();
  if (QS.get('preset')) preset(QS.get('preset'));
  if (QS.get('view')) sc.setView(sc.views[Number(QS.get('view'))]);
  for (const k of (QS.get('off') ?? '').split(',').filter(Boolean)) { S[k] = false; apply(); }
  draw(); hud();
  requestAnimationFrame(loop);
  window.__ready = true;
  if (!QS.get('nomeasure')) {
    const wide = matchMedia('(min-width: 760px)').matches; // phones measure a scene when its tab is opened
    for (const id of wide ? ORDER : [first]) TRIS[id] = (await (scenes[id] ??= id === 'walc' ? walcScene() : gunScene(id))).tris;
    await measureAll(wide ? ORDER : [first]);
  }
  window.__done = true;
} catch (e) {
  console.error(e); setBusy(false);
  $('#hud').textContent = 'Viewer failed to start.';
  $('#stage').insertAdjacentHTML('afterend', `<p class="err">The 3D viewer could not start: ${String(e.message ?? e)}</p>`);
  window.__ready = window.__done = true; window.__err = String(e.stack ?? e);
}

addEventListener('unhandledrejection', (ev) => { $('#hud').textContent = 'Error: ' + String(ev.reason?.message ?? ev.reason); });
})();
