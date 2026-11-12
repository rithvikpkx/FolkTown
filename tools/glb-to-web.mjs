// GLB -> compact web JSON + webp textures. Usage: node tools/glb-to-web.mjs in.glb out-dir [height-m=48.8] [name=belltower-scan]
// Bakes node transforms, scales to `height` m (y-up, base at y=0, centred on x/z), merges per material, quantises
// (pos int16 over bbox, normal int8, uv uint16 over range, index uint16/32), base64 little-endian.
import { mkdirSync, writeFileSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';

const [inp, out, h = '48.8', name = 'belltower-scan'] = process.argv.slice(2);
const doc = await new NodeIO().read(inp);
const root = doc.getRoot();
mkdirSync(out, { recursive: true });
const groups = new Map();
const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
const mul = (m, [x, y, z]) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
const mulN = (m, [x, y, z]) => { const v = [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z]; const l = Math.hypot(...v) || 1; return v.map((c) => c / l); };
(root.getDefaultScene() || root.listScenes()[0]).traverse((node) => {
  const mesh = node.getMesh(); if (!mesh) return;
  const m = node.getWorldMatrix();
  for (const p of mesh.listPrimitives()) {
    const mat = p.getMaterial(), key = mat ? mat.getName() : 'none';
    if (!groups.has(key)) groups.set(key, { mat, pos: [], nrm: [], uv: [], idx: [] });
    const g = groups.get(key);
    const P = p.getAttribute('POSITION'), N = p.getAttribute('NORMAL'), T = p.getAttribute('TEXCOORD_0'), I = p.getIndices();
    const base = g.pos.length;
    for (let i = 0; i < P.getCount(); i++) {
      const v = mul(m, P.getElement(i, [0, 0, 0])); g.pos.push(v);
      for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], v[k]); mx[k] = Math.max(mx[k], v[k]); }
      g.nrm.push(N ? mulN(m, N.getElement(i, [0, 0, 0])) : [0, 1, 0]);
      g.uv.push(T ? T.getElement(i, [0, 0]) : [0, 0]);
    }
    const n = I ? I.getCount() : P.getCount();
    for (let i = 0; i < n; i++) g.idx.push(base + (I ? I.getScalar(i) : i));
  }
});
const s = Number(h) / (mx[1] - mn[1]), cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
const b64 = (ta) => Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength).toString('base64');
const q = (v, lo, hi, max) => Math.round(((v - lo) / (hi - lo || 1)) * max);
const res = { name, height: Number(h), scale: s, materials: [] };
let tris = 0;
const tex = new Map();
for (const [key, g] of groups) {
  const pos = g.pos.map(([x, y, z]) => [(x - cx) * s, (y - mn[1]) * s, (z - cz) * s]);
  const lo = [0, 1, 2].map((k) => Math.min(...pos.map((p) => p[k]))), hi = [0, 1, 2].map((k) => Math.max(...pos.map((p) => p[k])));
  const ulo = [0, 1].map((k) => Math.min(...g.uv.map((p) => p[k]))), uhi = [0, 1].map((k) => Math.max(...g.uv.map((p) => p[k])));
  const P = new Int16Array(pos.length * 3), N = new Int8Array(pos.length * 3), U = new Uint16Array(pos.length * 2);
  pos.forEach((p, i) => { for (let k = 0; k < 3; k++) { P[i * 3 + k] = q(p[k], lo[k], hi[k], 65535) - 32768; N[i * 3 + k] = Math.round(g.nrm[i][k] * 127); } for (let k = 0; k < 2; k++) U[i * 2 + k] = q(g.uv[i][k], ulo[k], uhi[k], 65535); });
  const I = pos.length > 65535 ? new Uint32Array(g.idx) : new Uint16Array(g.idx);
  let map = null;
  const t = g.mat && g.mat.getBaseColorTexture();
  if (t) {
    if (!tex.has(t)) {
      const f = `${name}-${tex.size}.webp`;
      const w = Math.min(1024, t.getSize()[0]);
      await sharp(Buffer.from(t.getImage())).resize(w, w).webp({ quality: 82 }).toFile(`${out}/${f}`);
      tex.set(t, f);
    }
    map = tex.get(t);
  }
  tris += g.idx.length / 3;
  res.materials.push({ name: key, color: g.mat ? g.mat.getBaseColorFactor().slice(0, 3) : [1, 1, 1], metal: g.mat ? g.mat.getMetallicFactor() : 0, map, lo, hi, ulo, uhi, wide: I.BYTES_PER_ELEMENT === 4, pos: b64(P), nrm: b64(N), uv: b64(U), idx: b64(I), tris: g.idx.length / 3 });
}
res.tris = tris;
writeFileSync(`${out}/${name}.json`, JSON.stringify(res));
console.log(name, 'tris', tris, 'bbox m', ((mx[0] - mn[0]) * s).toFixed(1), ((mx[2] - mn[2]) * s).toFixed(1), 'scale', s, res.materials.map((m) => `${m.name}:${m.tris}:${m.map || ''}`).join(' '));
