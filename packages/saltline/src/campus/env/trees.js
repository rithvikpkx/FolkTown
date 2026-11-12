// Walk-mode trees: six deciduous/evergreen species, lumpy 3D leaf clusters (ragged via a procedural leaf mask, not flat cards),
// forked trunks with branches, wind sway, seasonal colour (?season=), 3 LODs. Instanced, one geometry set per species.
import {
  BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial,
  PlaneGeometry, Quaternion, RepeatWrapping, ShaderChunk, SRGBColorSpace, Vector3, LinearMipmapLinearFilter,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SEASON, S } from './season.js';

const rng = (seed) => () => ((seed = (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) | 0), ((seed ^ (seed >>> 14)) >>> 0) / 4294967296);
const hash2 = (x, z) => rng(Math.imul(Math.round(x * 31), 73856093) ^ Math.imul(Math.round(z * 31), 19349663))();
const col = (h) => new Color(h);

// hold: share of trees still in leaf in late autumn; pal: leaf colours per season (autumn matches the late-autumn WALC photo: rust, orange, straw yellow)
const SPECIES = {
  oak:    { w: 0.28, trunkH: 4.2, trunkR: 0.34, forks: 4, crown: [5.6, 4.2, 5.6], cy: 8.0, clusters: 40, cr: 1.7, hold: 0.85, bark: '#4a4038',
            pal: { autumn: ['#9a4a1e', '#b8651f', '#7a3a1c', '#a8741f'], summer: ['#2f5a24', '#3b6a2a', '#274c20'], spring: ['#7fa03a', '#6c9a34'], winter: ['#5a4a30'] } },
  maple:  { w: 0.24, trunkH: 3.4, trunkR: 0.3, forks: 5, crown: [4.8, 4.6, 4.8], cy: 7.0, clusters: 44, cr: 1.5, hold: 0.6, bark: '#6a625a',
            pal: { autumn: ['#c2401c', '#d8661e', '#e08a22', '#a8321a'], summer: ['#2f6a26', '#3a7a2c'], spring: ['#a0b040', '#8aa838'], winter: ['#6a5a40'] } },
  locust: { w: 0.18, trunkH: 4.6, trunkR: 0.24, forks: 5, crown: [5.2, 3.0, 5.2], cy: 8.6, clusters: 34, cr: 1.25, hold: 0.2, bark: '#3d352e',
            pal: { autumn: ['#d2b33c', '#c9a534', '#dcc14e'], summer: ['#5a8a30', '#4c7c2a'], spring: ['#9ec04c'], winter: ['#6a5a40'] } },
  linden: { w: 0.12, trunkH: 3.0, trunkR: 0.28, forks: 3, crown: [3.6, 5.8, 3.6], cy: 7.8, clusters: 40, cr: 1.45, hold: 0.45, bark: '#5a524a',
            pal: { autumn: ['#b8a838', '#a29a34', '#c4a83c'], summer: ['#3a6a2a', '#2e5a24'], spring: ['#8cb040'], winter: ['#6a5a40'] } },
  pear:   { w: 0.06, trunkH: 2.4, trunkR: 0.16, forks: 3, crown: [2.6, 3.8, 2.6], cy: 5.0, clusters: 26, cr: 1.1, hold: 0.75, bark: '#6a6258',
            pal: { autumn: ['#8a2a26', '#a63a2a', '#6a2a30'], summer: ['#3a6a30'], spring: ['#e8e4e0', '#d9d4d0'], winter: ['#6a5a50'] } },
  spruce: { w: 0.12, trunkH: 2.0, trunkR: 0.26, forks: 0, crown: [2.9, 6.5, 2.9], cy: 7.4, clusters: 34, cr: 1.4, hold: 1, evergreen: true, cone: true, bark: '#4a3a30',
            pal: { autumn: ['#1f3d2c', '#27493a'], summer: ['#1f3d2c', '#27493a'], spring: ['#24442f'], winter: ['#1f3d2c', '#27493a'] } },
};
const NAMES = Object.keys(SPECIES);

function barkTexture() {
  const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d'), R = rng(21);
  c.fillStyle = '#9a9288'; c.fillRect(0, 0, S, S);
  for (let i = 0; i < 260; i++) {
    const x = R() * S, w = 2 + R() * 7, l = 30 + R() * 110, y = R() * S, g = 70 + R() * 120 | 0;
    c.fillStyle = `rgba(${g},${g * 0.93 | 0},${g * 0.85 | 0},.55)`;
    for (const dy of [0, -S, S]) c.fillRect(x, y + dy, w, l);
  }
  const t = new CanvasTexture(cv);
  t.wrapS = t.wrapT = RepeatWrapping; t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.minFilter = LinearMipmapLinearFilter;
  return t;
}

// tapered limb from a to b
function limb(a, b, r0, r1, seg) {
  const d = b.clone().sub(a), L = d.length();
  const g = new CylinderGeometry(r1, r0, L, seg, 1, true).translate(0, L / 2, 0);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize());
  g.applyQuaternion(q).translate(a.x, a.y, a.z);
  return g;
}

function trunkGeometry(sp, seed, seg) {
  const R = rng(seed), parts = [];
  const lean = new Vector3((R() - 0.5) * 0.5, 0, (R() - 0.5) * 0.5);
  const top = new Vector3(lean.x, sp.trunkH, lean.z);
  const base = new CylinderGeometry(sp.trunkR * 1.05, sp.trunkR * 1.7, 0.7, seg, 1, true).translate(0, 0.35, 0); // root flare
  parts.push(base, limb(new Vector3(0, 0.6, 0), top, sp.trunkR * 1.1, sp.trunkR * (sp.forks ? 0.8 : 0.35), seg));
  const [rx, ry, rz] = sp.crown;
  if (sp.forks) {
    for (let i = 0; i < sp.forks; i++) {
      const a = (i / sp.forks) * 6.2832 + R() * 0.8, up = 0.55 + R() * 0.5, len = ry * (0.55 + R() * 0.35);
      const p0 = top.clone().add(new Vector3(0, -0.3 - R() * 0.4, 0));
      const p1 = p0.clone().add(new Vector3(Math.cos(a) * rx * 0.55, up * len, Math.sin(a) * rz * 0.55));
      parts.push(limb(p0, p1, sp.trunkR * 0.36, sp.trunkR * 0.1, Math.max(4, seg - 2)));
      for (let k = 0; k < 3; k++) { // secondary twigs, bare-tree silhouette
        const t = 0.45 + k * 0.2, q0 = p0.clone().lerp(p1, t), a2 = a + (R() - 0.5) * 2.2;
        parts.push(limb(q0, q0.clone().add(new Vector3(Math.cos(a2) * rx * 0.4, 0.9 + R() * 1.4, Math.sin(a2) * rz * 0.4)), sp.trunkR * 0.12, sp.trunkR * 0.03, 4));
      }
    }
  }
  const g = mergeGeometries(parts.map((p) => p.index ? p.toNonIndexed() : p));
  return g;
}

function crownGeometry(sp, seed, detail) {
  const R = rng(seed), parts = [], [rx, ry, rz] = sp.crown, C = new Vector3(0, sp.cy, 0), pal = sp.pal[SEASON].map(col), avg = pal.reduce((a, c) => a.add(c), new Color(0, 0, 0)).multiplyScalar(1 / pal.length);
  const n = detail ? Math.round(sp.clusters * 1.9) : Math.ceil(sp.clusters * 0.5);
  for (let i = 0; i < n; i++) {
    let p;
    if (sp.cone) { // tiers: wide low, narrow high
      const t = R(), a = R() * 6.2832, rr = (1 - t) * rx * (0.55 + R() * 0.45);
      p = new Vector3(Math.cos(a) * rr, sp.cy - ry + t * ry * 2, Math.sin(a) * rr);
    } else {
      do p = new Vector3(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1); while (p.lengthSq() > 1);
      p.setLength(Math.max(0.3, Math.cbrt(p.length())) * 1.02).multiply(new Vector3(rx, ry, rz)).add(C);
      if (p.y < sp.trunkH + 1.2) { i--; continue; }
    }
    const r = sp.cr * (0.75 + R() * 0.5) * (detail ? 0.62 : 1.3);
    const g = new IcosahedronGeometry(1, detail ? 1 : 0);
    const pos = g.attributes.position, nrm = new Float32Array(pos.count * 3), cc = pal[(R() * pal.length) | 0].clone().lerp(avg, 0.45);
    const sd = R() * 6.28, flat = sp.cone ? 0.55 : 0.78, m = new Matrix4().makeRotationY(R() * 6.28);
    const out = p.clone().sub(C); out.y *= 0.6; out.normalize();
    const v = new Vector3(), n0 = new Vector3(), colr = new Float32Array(pos.count * 3);
    // each triangle is displaced as a unit (flat-ish facets), then shaded by height within the crown and distance from the centre
    for (let f = 0; f < pos.count; f += 3) {
      for (let j = 0; j < 3; j++) {
        v.fromBufferAttribute(pos, f + j).normalize();
        const k = 1 + 0.26 * Math.sin(v.x * 5.3 + sd) * Math.cos(v.y * 4.7 + v.z * 3.1 + sd * 1.7); // per-vertex so shared corners stay joined
        n0.copy(v).lerp(out, 0.85).normalize();
        v.multiplyScalar(r * k).applyMatrix4(m); v.y *= flat;
        pos.setXYZ(f + j, v.x + p.x, v.y + p.y, v.z + p.z);
        nrm.set([n0.x, n0.y * 0.85 + 0.15, n0.z], (f + j) * 3);
      }
      const hh = Math.min(1, Math.max(0, (p.y - (sp.cy - ry)) / (2 * ry))), dist = p.clone().sub(C).divide(new Vector3(rx, ry, rz)).length();
      const shade = (0.5 + 0.5 * hh) * (0.7 + 0.3 * Math.min(1, dist)) * (0.85 + R() * 0.3);
      for (let j = 0; j < 3; j++) colr.set([cc.r * shade, cc.g * shade, cc.b * shade], (f + j) * 3);
    }
    g.setAttribute('normal', new Float32BufferAttribute(nrm, 3));
    g.setAttribute('color', new Float32BufferAttribute(colr, 3));
    g.deleteAttribute('uv');
    parts.push(g);
  }
  return mergeGeometries(parts);
}

const SWAY = `
  uniform float uTime, uWind;
  varying vec3 vLP;`;

function patch(m, leaf) {
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = m.userData.uTime; s.uniforms.uWind = { value: 1 };
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>' + SWAY)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vLP = position;
        { vec2 ph = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
          float hgt = max(position.y, 0.0), k = hgt * hgt * 0.0009 + ${leaf ? '0.012' : '0.0'};
          float g = sin(uTime * 1.1 + ph.x * 0.31 + ph.y * 0.23) * 0.7 + sin(uTime * 2.3 + ph.x * 0.7) * 0.3;
          transformed.x += g * k * 2.2 * uWind; transformed.z += sin(uTime * 0.9 + ph.y * 0.4) * k * 1.5 * uWind;
          ${leaf ? 'transformed += 0.05 * vec3(sin(uTime * 5.0 + position.x * 3.0), sin(uTime * 4.3 + position.y * 3.0), sin(uTime * 4.7 + position.z * 3.0));' : ''} }`);
    if (leaf) {
      s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vLP;
        float lh(vec3 p){ p = fract(p * 0.3183 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float lf(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(mix(lh(i),lh(i+vec3(1,0,0)),f.x),mix(lh(i+vec3(0,1,0)),lh(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(lh(i+vec3(0,0,1)),lh(i+vec3(1,0,1)),f.x),mix(lh(i+vec3(0,1,1)),lh(i+vec3(1,1,1)),f.x),f.y),f.z); }`)
        .replace('#include <normal_fragment_begin>', ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0'))
        .replace('#include <map_fragment>', `#include <map_fragment>
        diffuseColor.rgb *= 0.8 + 0.5 * lf(vLP * 9.0 + 4.0);`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { float fr = abs(dot(normalize(normal), normalize(vViewPosition)));
          float lm = lf(vLP * 7.0) * 0.55 + lf(vLP * 19.0) * 0.45;   // leaf-scale holes, more of them toward the silhouette: ragged edge, light through the crown
          if (lm < 0.2 + 0.34 * pow(1.0 - fr, 1.4)) discard; }`);
    }
  };
  m.customProgramCacheKey = () => 'walk_tree_' + (leaf ? 'leaf' : 'wood');
  return m;
}

function billboard(sp, seed) {
  const W = 256, H = 384, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), R = rng(seed), pal = sp.pal[SEASON];
  c.fillStyle = sp.bark; c.fillRect(W / 2 - 6, H * 0.5, 12, H * 0.5);
  const cone = sp.cone, wd = cone ? 0.28 : 0.47;
  for (let i = 0; i < 700; i++) {
    const a = R() * 6.2832, rr = Math.sqrt(R()), y0 = cone ? H * (0.08 + R() * 0.7) : H * 0.34 + Math.sin(a) * rr * H * 0.3;
    const x = W / 2 + (cone ? (R() - 0.5) * 2 * W * wd * (y0 / H) * 1.8 : Math.cos(a) * rr * W * wd);
    c.fillStyle = pal[(R() * pal.length) | 0]; c.globalAlpha = 0.9;
    c.beginPath(); c.ellipse(x, y0, 8 + R() * 8, 5 + R() * 4, R() * 6.28, 0, 6.28); c.fill();
  }
  const t = new CanvasTexture(cv); t.colorSpace = SRGBColorSpace; t.minFilter = LinearMipmapLinearFilter;
  return t;
}

export const windTime = { value: 0 };
const LOD_NEAR = 60, LOD_MID = 150, LOD_FAR = 650;

export function buildWalkTrees(zone) {
  const src = zone.trees?.length ? zone.trees : zone.props ?? [];
  const y0 = zone.ground?.heights?.[0] ?? 0, pick = (h) => { let a = 0; for (const k of NAMES) { a += SPECIES[k].w; if (h < a) return k; } return 'oak'; };
  const trees = src.map((t) => {
    const h = hash2(t.x, t.z), h2 = hash2(t.z, t.x), sp = t.sp || pick(h2 * 0.999), s = SPECIES[sp];
    const hold = h < (s.evergreen ? 2 : S.cover * s.hold + (SEASON === 'summer' || SEASON === 'spring' ? 1 : 0));
    return { x: t.x, z: t.z, y: t.y ?? y0, sp, s: t.scale ?? 0.75 + h * 0.5, sx: 0.85 + hash2(t.x + 9, t.z) * 0.35, yaw: (h * 25.13) % 6.2832, leaves: t.sp ? true : hold, tint: new Color().setHSL(0, 0, 0.85 + h2 * 0.3) };
  });
  const N = trees.length, time = windTime, bark = barkTexture();
  const woodM = patch(new MeshStandardMaterial({ vertexColors: false, map: bark, roughness: 0.95, side: DoubleSide }), false);
  woodM.userData.uTime = time;
  const leafM = patch(new MeshStandardMaterial({ vertexColors: true, roughness: 0.78, side: DoubleSide }), true);
  leafM.userData.uTime = time;
  const inst = (geo, mat, shadow, color) => {
    const m = new InstancedMesh(geo, mat, Math.max(N, 1)); m.count = 0; m.frustumCulled = false; m.castShadow = shadow; m.receiveShadow = true;
    if (color) m.setColorAt(0, new Color()); return m;
  };
  const g = new Group(); g.name = 'campus_trees';
  const set = {};
  for (const [i, k] of NAMES.entries()) {
    const sp = SPECIES[k], wm = woodM.clone(); wm.userData.uTime = time; wm.color = col(sp.bark).multiplyScalar(4); patch(wm, false); wm.customProgramCacheKey = () => 'walk_tree_wood';
    const bm = new MeshStandardMaterial({ map: billboard(sp, 30 + i), alphaTest: 0.5, side: DoubleSide, roughness: 0.9 });
    set[k] = {
      nearW: inst(trunkGeometry(sp, 5 + i, 8), wm, true, true), nearL: inst(crownGeometry(sp, 7 + i, 1), leafM, true, true),
      midW: inst(trunkGeometry(sp, 5 + i, 5), wm, false, true), midL: inst(crownGeometry(sp, 9 + i, 0), leafM, false, true),
      far: inst(new PlaneGeometry(10.5, 15.75).translate(0, 15.75 / 2 - 0.2, 0), bm, false, false),
    };
    g.add(...Object.values(set[k]));
  }
  const M = new Matrix4(), Q = new Quaternion(), Y = new Vector3(0, 1, 0), P = new Vector3(), Sc = new Vector3();
  let lastX = 1e9, lastZ = 1e9, lastYaw = 1e9;
  g.stats = { near: 0, mid: 0, far: 0, total: N };
  g.update = (camera) => {
    time.value = performance.now() / 1000;
    const cx = camera.position.x, cz = camera.position.z, yaw = Math.atan2(camera.matrixWorld.elements[8], camera.matrixWorld.elements[10]);
    if (Math.abs(cx - lastX) + Math.abs(cz - lastZ) < 0.5 && Math.abs(yaw - lastYaw) < 0.02) return;
    lastX = cx; lastZ = cz; lastYaw = yaw;
    const cnt = {}; for (const k of NAMES) cnt[k] = { nw: 0, nl: 0, mw: 0, ml: 0, f: 0 };
    let a = 0, b = 0, c = 0;
    for (const t of trees) {
      const dx = t.x - cx, dz = t.z - cz, d = Math.hypot(dx, dz), S_ = set[t.sp], n = cnt[t.sp];
      P.set(t.x, t.y, t.z);
      if (d < LOD_NEAR) {
        Q.setFromAxisAngle(Y, t.yaw); Sc.set(t.s * t.sx, t.s, t.s * t.sx); M.compose(P, Q, Sc);
        S_.nearW.setMatrixAt(n.nw, M); S_.nearW.setColorAt(n.nw++, t.tint);
        if (t.leaves) { S_.nearL.setMatrixAt(n.nl, M); S_.nearL.setColorAt(n.nl++, t.tint); }
        a++;
      } else if (d < LOD_MID) {
        Q.setFromAxisAngle(Y, t.yaw); Sc.set(t.s * t.sx, t.s, t.s * t.sx); M.compose(P, Q, Sc);
        S_.midW.setMatrixAt(n.mw, M); S_.midW.setColorAt(n.mw++, t.tint);
        if (t.leaves) { S_.midL.setMatrixAt(n.ml, M); S_.midL.setColorAt(n.ml++, t.tint); }
        b++;
      } else if (d < LOD_FAR && t.leaves) {
        Q.setFromAxisAngle(Y, Math.atan2(dx, dz) + Math.PI); Sc.setScalar(t.s * 0.95); M.compose(P, Q, Sc);
        S_.far.setMatrixAt(n.f++, M); c++;
      }
    }
    for (const k of NAMES) {
      const S_ = set[k], n = cnt[k];
      S_.nearW.count = n.nw; S_.nearL.count = n.nl; S_.midW.count = n.mw; S_.midL.count = n.ml; S_.far.count = n.f;
      for (const m of Object.values(S_)) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    }
    g.stats.near = a; g.stats.mid = b; g.stats.far = c;
  };
  return g;
}
