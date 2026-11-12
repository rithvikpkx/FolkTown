// Scanned/modelled Bell Tower (?tower=scan): "Purdue University Bell Tower" by Olivia Bultinck, CC BY 4.0,
// https://sketchfab.com/3d-models/purdue-university-bell-tower-37db7dfc51c347849b8e5975d8a89812 (converted by tools/glb-to-web.mjs).
// loadBellTowerScan(G, at, opts) -> { group, colliders, tris, trisFar, height, half } like buildBellTower, but async. Origin = tower centre, y = 0.
import { BufferAttribute, BufferGeometry, Color, Group, LOD, Mesh, MeshStandardMaterial, SRGBColorSpace, TextureLoader } from 'three';

export const SCAN_CREDIT = 'Bell Tower model: "Purdue University Bell Tower" by Olivia Bultinck, CC BY 4.0 (sketchfab.com)';
const BASE = import.meta.env.BASE_URL + 'campus/walk/';
const u8 = (s) => { const b = atob(s), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a.buffer; };
// model material -> Saltline material (G.mats key + colour; triplanar so it needs no UVs) or null = keep the model's own texture
const MAP = {
  M_Stone: ['paint_white', 0xefeadc], M_Stone2: ['paint_white', 0xe6dfcc], M_White: ['paint_white', 0xf2eee2],
  M_Brick: ['brick', 0xb8795f], M_Maroon: ['paint_grey', 0x2c2638], M_Brass: ['brass', null], M_Clock: null, openPBR_shader1: null,
};

function geo(m) {
  const g = new BufferGeometry(), P = new Int16Array(u8(m.pos)), N = new Int8Array(u8(m.nrm)), U = new Uint16Array(u8(m.uv)), I = m.wide ? new Uint32Array(u8(m.idx)) : new Uint16Array(u8(m.idx));
  const pos = new Float32Array(P.length), uv = new Float32Array(U.length);
  for (let i = 0; i < P.length; i++) pos[i] = m.lo[i % 3] + ((P[i] + 32768) / 65535) * (m.hi[i % 3] - m.lo[i % 3]);
  for (let i = 0; i < U.length; i++) uv[i] = m.ulo[i % 2] + (U[i] / 65535) * (m.uhi[i % 2] - m.ulo[i % 2]);
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('normal', new BufferAttribute(N, 3, true));
  g.setAttribute('uv', new BufferAttribute(uv, 2));
  g.setIndex(new BufferAttribute(I, 1));
  return g;
}

export async function loadBellTowerScan(G, at = [0, 0, 0], opts = {}) {
  const j = await (await fetch(BASE + 'belltower-scan.json')).json();
  const rotY = opts.rotY ?? 0, texCache = {};
  const tex = (f) => texCache[f] || (texCache[f] = new Promise((r) => new TextureLoader().load(BASE + f, (t) => { t.colorSpace = SRGBColorSpace; t.anisotropy = 8; t.flipY = false; r(t); }, undefined, () => r(null))));
  const near = new Group(), far = new Group(), group = new Group();
  let min = [1e9, 1e9], max = [-1e9, -1e9];
  for (const m of j.materials) {
    const g = geo(m), map = MAP[m.name], kind = map && !opts.model ? map : null;
    min = [Math.min(min[0], m.lo[0]), Math.min(min[1], m.lo[2])]; max = [Math.max(max[0], m.hi[0]), Math.max(max[1], m.hi[2])];
    let mat;
    if (kind) {
      mat = G.mats.get(kind[0], kind[1] == null ? { triplanar: true } : { triplanar: true, color: kind[1] });
    } else {
      const t = m.map ? await tex(m.map) : null;
      mat = new MeshStandardMaterial({ map: t, color: t ? 0xffffff : new Color(...m.color), roughness: 0.7, metalness: 0 });
    }
    const mesh = new Mesh(g, mat); mesh.castShadow = mesh.receiveShadow = true; near.add(mesh);
  }
  // far LOD: same meshes merged per material minus the heavy detail meshes
  for (const mm of near.children) if (mm.geometry.index.count / 3 < 6000) { const c = mm.clone(); far.add(c); }
  near.rotation.y = far.rotation.y = rotY;
  const lod = new LOD(); lod.addLevel(near, 0); lod.addLevel(far, 140); group.add(lod);
  group.position.set(...at);
  const half = Math.max(max[0] - min[0], max[1] - min[1]) / 2 + 0.2;
  const colliders = [{ min: [at[0] - half, at[1], at[2] - half], max: [at[0] + half, at[1] + j.height, at[2] + half] }];
  return { group, colliders, tris: j.tris, trisFar: far.children.reduce((a, m) => a + m.geometry.index.count / 3, 0), height: j.height, half, update() {}, setNight() {} };
}
