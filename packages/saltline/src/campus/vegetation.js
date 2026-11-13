// Campus vegetation: GPU-placed grass tufts around the camera, and instanced trees with 3 LODs (cards, cheap cards, billboard).
// Standalone: imports three and ground.js (shared path mask, so grass stays off pavement and building footprints).
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  ShaderChunk,
  SRGBColorSpace,
  Vector2,
  Vector3,
  LinearMipmapLinearFilter,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMask } from './ground.js';
import { buildWalkTrees } from './env/trees.js';

/** walk.js sets walk=true before buildCampus so buildTrees returns the species-based walk trees */
export const vegMode = { walk: false };

// small deterministic RNG so every client sees the same trees
const rng = (seed) => () => ((seed = (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) | 0), ((seed ^ (seed >>> 14)) >>> 0) / 4294967296);
const hash2 = (x, z) => rng(Math.imul(Math.round(x * 31), 73856093) ^ Math.imul(Math.round(z * 31), 19349663))();

/* ------------------------------------------------------------------ grass */

const GRASS_N = 180; // tufts per side of the camera-following window
const GRASS_S = 0.26; // metres between tuft cells => 47 m window, fade ends well inside it

function tuftGeometry() {
  // 5 blades per tuft, each 3 triangles: position = (across, along 0..1, blade id)
  const pos = [], idx = [];
  for (let b = 0; b < 5; b++) {
    const o = pos.length / 3;
    pos.push(-1, 0, b, 1, 0, b, -0.62, 0.5, b, 0.62, 0.5, b, 0, 1, b);
    idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2, o + 2, o + 3, o + 4);
  }
  const g = new InstancedBufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  const cells = new Float32Array(GRASS_N * GRASS_N * 2);
  for (let i = 0; i < GRASS_N; i++) for (let j = 0; j < GRASS_N; j++) cells.set([i, j], (i * GRASS_N + j) * 2);
  g.setAttribute('aCell', new InstancedBufferAttribute(cells, 2));
  g.instanceCount = GRASS_N * GRASS_N;
  return g;
}

/** Returns a Mesh with update(camera, time). Call update every frame. */
export function buildGrass(zone, opts = {}) {
  const mask = getMask(zone);
  const u = {
    uCam: { value: new Vector3() }, uTime: { value: 0 },
    uMask: { value: mask.texture }, uOrg: { value: mask.origin }, uSize: { value: mask.size },
    uFar: { value: opts.far ?? 22 }, uY: { value: zone.ground?.heights?.[0] ?? 0 },
  };
  const mat = new MeshStandardMaterial({ roughness: 0.85, metalness: 0, side: DoubleSide });
  mat.name = 'campus_grass';
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uCam; uniform float uTime, uFar, uY; uniform sampler2D uMask; uniform vec2 uOrg, uSize;
        attribute vec2 aCell; varying float vT; varying vec3 vTint;
        vec3 h3(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.xxy + q.yzz) * q.zyx); }
        float vnz(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h3(i).x, h3(i+vec2(1,0)).x, f.x), mix(h3(i+vec2(0,1)).x, h3(i+vec2(1,1)).x, f.x), f.y); }`)
      .replace('#include <beginnormal_vertex>', `
        float GN = ${GRASS_N}.0, GS = ${(opts.step ?? GRASS_S).toFixed(3)};
        vec2 base = floor(uCam.xz / GS) - GN * 0.5;
        vec2 cell = base + mod(aCell - base, GN);
        vec3 r = h3(cell), r2 = h3(cell + 91.7);
        vec2 wpos = (cell + r.xy) * GS;
        float d = length(wpos - uCam.xz);
        float keep = step(r2.x, 1.0 - 0.7 * smoothstep(uFar * 0.45, uFar, d));
        float fade = 1.0 - smoothstep(uFar * 0.8, uFar, d);
        vec4 mk = texture2D(uMask, (wpos - uOrg) / uSize);
        float ok = 1.0 - smoothstep(0.03, 0.14, max(max(mk.r, mk.g), mk.b));
        float patch_ = 0.55 + 0.9 * vnz(wpos * 0.13);
        float hgt = (0.11 + 0.15 * r.z + (r2.y > 0.96 ? 0.16 : 0.0)) * patch_ * fade * keep * ok;
        float bid = position.z;
        float ang = r.x * 6.2832 + bid * 1.7;
        vec2 face = vec2(cos(ang), sin(ang));
        vec3 objectNormal = normalize(vec3(-face.y * 0.35, 1.0, face.x * 0.35));`)
      .replace('#include <begin_vertex>', `
        float t = position.y;
        vec2 rootOff = 0.07 * vec2(cos(bid * 1.3 + r.y * 6.28), sin(bid * 1.3 + r.y * 6.28));
        float sway = sin(uTime * 1.7 + wpos.x * 0.45 + wpos.y * 0.3) * 0.045 + sin(uTime * 3.1 + wpos.x * 1.3) * 0.012;
        float lean = (0.10 + 0.22 * r2.z) * t * t * hgt;
        vec2 xz = wpos + rootOff + face * position.x * 0.019 * fade + vec2(face.y, -face.x) * (lean + sway * t * t * hgt * 4.0);
        vec3 transformed = vec3(xz.x, uY + t * hgt, xz.y);
        vT = t;
        vTint = mix(vec3(0.9, 1.0, 0.8), vec3(1.15, 1.0, 0.55), vnz(wpos * 0.04)) * (0.8 + 0.4 * r2.z);`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vT; varying vec3 vTint;')
      .replace('#include <normal_fragment_begin>', ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0'))
      .replace('#include <map_fragment>', `
        vec3 gBase = mix(vec3(0.030, 0.095, 0.014), vec3(0.09, 0.07, 0.02), ${(opts.dry ?? 0).toFixed(2)}), gTip = mix(vec3(0.19, 0.40, 0.075), vec3(0.42, 0.34, 0.14), ${(opts.dry ?? 0).toFixed(2)});
        diffuseColor.rgb = mix(gBase, gTip, vT) * vTint * (0.65 + 0.35 * vT);`);
  };
  mat.customProgramCacheKey = () => 'campus_grass_v1' + (opts.dry ?? 0);
  const mesh = new Mesh(tuftGeometry(), mat);
  mesh.name = 'campus_grass';
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.update = (camera, time) => {
    u.uCam.value.copy(camera.position);
    u.uTime.value = time;
  };
  return mesh;
}

/* ------------------------------------------------------------------ trees */

function leafTexture() {
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d'), R = rng(7);
  const leaf = (x, y, a, len, wid, col) => {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, len, wid, 0, 0, 6.2832); c.fill();
    c.strokeStyle = 'rgba(10,30,5,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-len, 0); c.lineTo(len, 0); c.stroke();
    c.restore();
  };
  for (let i = 0; i < 150; i++) {
    const a = R() * 6.2832, rad = Math.sqrt(R()) * S * 0.4, x = S / 2 + Math.cos(a) * rad, y = S / 2 + Math.sin(a) * rad;
    const l = 20 + R() * 20, hue = 78 + R() * 40, lit = 20 + R() * 24 + (y < S / 2 ? 6 : 0);
    leaf(x, y, R() * 6.2832, l, l * 0.38, `hsl(${hue},${45 + R() * 20}%,${lit}%)`);
  }
  const t = new CanvasTexture(cv);
  t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.minFilter = LinearMipmapLinearFilter;
  return t;
}

function billboardTexture() {
  const W = 256, H = 384, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), R = rng(11);
  c.fillStyle = '#3a2c20'; c.fillRect(W / 2 - 7, H * 0.55, 14, H * 0.45);
  for (let i = 0; i < 900; i++) {
    const a = R() * 6.2832, rr = Math.sqrt(R()), x = W / 2 + Math.cos(a) * rr * W * 0.47, y = H * 0.36 + Math.sin(a) * rr * H * 0.32;
    const lit = 18 + (1 - (y / H - 0.1) * 1.6) * 14 + R() * 12;
    c.fillStyle = `hsl(${80 + R() * 35},${42 + R() * 18}%,${Math.max(12, lit)}%)`;
    c.beginPath(); c.ellipse(x, y, 7 + R() * 7, 3.5 + R() * 3, R() * 6.2832, 0, 6.2832); c.fill();
  }
  const t = new CanvasTexture(cv);
  t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.minFilter = LinearMipmapLinearFilter;
  return t;
}

const CROWN = new Vector3(0, 8.4, 0), RAD = new Vector3(4.8, 3.8, 4.8);
function cardGeometry(n, size, seed) {
  const R = rng(seed), parts = [], m = new Matrix4(), q = new Quaternion(), up = new Vector3(0, 0, 1);
  for (let i = 0; i < n; i++) {
    let p;
    do p = new Vector3(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1); while (p.lengthSq() > 1);
    p.setLength(Math.max(0.35, Math.cbrt(p.length() * p.length()) * 1.05)).multiply(RAD).add(CROWN);
    if (p.y < 4.6) { i--; continue; }
    const out = p.clone().sub(CROWN).divide(RAD).divide(RAD).normalize();
    const g = new PlaneGeometry(1, 1);
    const f = out.clone().add(new Vector3(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.8)).normalize();
    q.setFromUnitVectors(up, f);
    q.multiply(new Quaternion().setFromAxisAngle(up, R() * 6.2832));
    const s = size * (0.75 + R() * 0.5);
    m.compose(p, q, new Vector3(s, s, 1));
    g.applyMatrix4(m);
    // spherical normals: the crown shades as one soft volume instead of n flat cards
    const nrm = new Float32Array(12);
    for (let k = 0; k < 4; k++) nrm.set([out.x, out.y * 0.8 + 0.2, out.z], k * 3);
    g.setAttribute('normal', new BufferAttribute(nrm, 3));
    parts.push(g);
  }
  return mergeGeometries(parts);
}

function trunkGeometry(seg) {
  const parts = [], R = rng(3);
  const stem = new CylinderGeometry(0.14, 0.38, 7, seg, 1, true);
  stem.translate(0, 3.5, 0);
  parts.push(stem);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 6.2832 + R();
    const br = new CylinderGeometry(0.05, 0.14, 3.6, Math.max(4, seg - 2), 1, true);
    br.translate(0, 1.8, 0).rotateZ(-0.65).rotateY(a).translate(0, 4.2 + R() * 1.2, 0);
    parts.push(br);
  }
  return mergeGeometries(parts);
}

function leafMaterial(map) {
  const m = new MeshStandardMaterial({ map, alphaTest: 0.45, side: DoubleSide, roughness: 0.78, metalness: 0 });
  m.onBeforeCompile = (s) => {
    // one-sided lighting: back faces use the same spherical normal as front faces
    s.fragmentShader = s.fragmentShader.replace(
      '#include <normal_fragment_begin>',
      ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0'),
    );
  };
  m.customProgramCacheKey = () => 'campus_leaf_v1';
  return m;
}

const LOD_NEAR = 55, LOD_MID = 140, LOD_FAR = 650;

/** Returns a Group with update(camera). Trees come from zone.trees, else zone.props (trunk cylinders in purdue-mall.json). */
export function buildTrees(zone) {
  if (vegMode.walk) return buildWalkTrees(zone);
  const src = zone.trees?.length ? zone.trees : zone.props ?? [];
  const trees = src.map((t) => {
    const h = hash2(t.x, t.z);
    return { x: t.x, z: t.z, y: zone.ground?.heights?.[0] ?? 0, s: 0.7 + h * 0.65, yaw: h * 25.13 % 6.2832, tint: new Color().setHSL(0.22 + hash2(t.z, t.x) * 0.07, 0.4, 0.78 + h * 0.3) };
  });
  const N = trees.length, leafTex = leafTexture(), billTex = billboardTexture();
  const lm = leafMaterial(leafTex);
  const bark = new MeshStandardMaterial({ color: 0x4a3b2d, roughness: 1, side: DoubleSide });
  const bm = new MeshStandardMaterial({ map: billTex, alphaTest: 0.5, side: DoubleSide, roughness: 0.9, color: 0xcfd8c0 });
  const inst = (geo, mat, shadow, color) => {
    const m = new InstancedMesh(geo, mat, Math.max(N, 1));
    m.count = 0; m.frustumCulled = false; m.castShadow = shadow; m.receiveShadow = true;
    if (color) m.setColorAt(0, new Color());
    return m;
  };
  const near = { trunk: inst(trunkGeometry(8), bark, true), leaf: inst(cardGeometry(120, 2.9, 5), lm, true, true) };
  const mid = { trunk: inst(trunkGeometry(5), bark, false), leaf: inst(cardGeometry(26, 4.6, 9), lm, false, true) };
  const bgeo = new PlaneGeometry(11.5, 17.25).translate(0, 17.25 / 2 - 0.2, 0);
  const far = inst(bgeo, bm, false);
  const g = new Group();
  g.name = 'campus_trees';
  g.add(near.trunk, near.leaf, mid.trunk, mid.leaf, far);
  const M = new Matrix4(), Q = new Quaternion(), Y = new Vector3(0, 1, 0), P = new Vector3(), S = new Vector3();
  let lastX = 1e9, lastZ = 1e9, lastYaw = 1e9;
  g.stats = { near: 0, mid: 0, far: 0, total: N };
  g.update = (camera) => {
    const cx = camera.position.x, cz = camera.position.z;
    // billboards only need a refresh when the view moved; buckets only change with position
    const yaw = Math.atan2(camera.matrixWorld.elements[8], camera.matrixWorld.elements[10]);
    if (Math.abs(cx - lastX) + Math.abs(cz - lastZ) < 0.5 && Math.abs(yaw - lastYaw) < 0.02) return;
    lastX = cx; lastZ = cz; lastYaw = yaw;
    let a = 0, b = 0, c = 0;
    for (const t of trees) {
      const dx = t.x - cx, dz = t.z - cz, d = Math.hypot(dx, dz);
      P.set(t.x, t.y, t.z);
      if (d < LOD_NEAR) {
        Q.setFromAxisAngle(Y, t.yaw); S.setScalar(t.s);
        M.compose(P, Q, S);
        near.trunk.setMatrixAt(a, M); near.leaf.setMatrixAt(a, M); near.leaf.setColorAt(a++, t.tint);
      } else if (d < LOD_MID) {
        Q.setFromAxisAngle(Y, t.yaw); S.setScalar(t.s);
        M.compose(P, Q, S);
        mid.trunk.setMatrixAt(b, M); mid.leaf.setMatrixAt(b, M); mid.leaf.setColorAt(b++, t.tint);
      } else if (d < LOD_FAR) {
        Q.setFromAxisAngle(Y, Math.atan2(dx, dz) + Math.PI); S.setScalar(t.s * 0.95);
        M.compose(P, Q, S);
        far.setMatrixAt(c++, M);
      }
    }
    near.trunk.count = near.leaf.count = a; mid.trunk.count = mid.leaf.count = b; far.count = c;
    for (const m of [near.trunk, near.leaf, mid.trunk, mid.leaf, far]) {
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    g.stats.near = a; g.stats.mid = b; g.stats.far = c;
  };
  return g;
}
