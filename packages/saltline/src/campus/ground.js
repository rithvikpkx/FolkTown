// Campus ground: one big PBR plane (CC0 grass, pavers, asphalt) blended by a path/road mask rasterised from zone.paths.
// Standalone: only imports three. Lit by Saltline's rig because it is a MeshStandardMaterial (shadow/fog chunks are global).
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  NoColorSpace,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Matrix3,
  Vector2,
  Vector4,
} from 'three';

const BASE = (import.meta.env?.BASE_URL ?? '/') + 'campus/';
const MARGIN = 60; // mask covers bounds + this; beyond it the ground is plain grass
const FAR = 600; // ground plane extends this far past bounds
const MASK_PX = 2048;
// half-width in metres; r = footway (pavers), g = road (asphalt)
const WIDTH = { footway: 1.3, path: 1, pedestrian: 2.2, cycleway: 1.3, track: 1.5, corridor: 1, service: 2.4, residential: 3.6, unclassified: 3.2, tertiary: 4, secondary: 4.5, primary: 5, primary_link: 3, secondary_link: 3, tertiary_link: 3 };
const ROAD = new Set(['service', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'primary_link', 'secondary_link', 'tertiary_link']);

/** Attach derived paths (from public/campus/mall-paths.json, a trim of data/campus.json) to a zone that has none. */
export const withPaths = (zone, extra) => (zone.paths?.length ? zone : { ...zone, paths: extra.paths });

const masks = new WeakMap();
/** Shared by ground and grass: r path, g road, b building footprint. Cached per zone object. */
export function getMask(zone) {
  if (masks.has(zone)) return masks.get(zone);
  const b = zone.bounds;
  const x0 = b.minX - MARGIN, z0 = b.minZ - MARGIN;
  const size = new Vector2(b.maxX - b.minX + 2 * MARGIN, b.maxZ - b.minZ + 2 * MARGIN);
  const cv = document.createElement('canvas');
  cv.width = cv.height = MASK_PX;
  const c = cv.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, MASK_PX, MASK_PX);
  c.globalCompositeOperation = 'lighter';
  c.lineCap = c.lineJoin = 'round';
  const sx = MASK_PX / size.x, sy = MASK_PX / size.y;
  const P = ([x, z]) => [(x - x0) * sx, (z - z0) * sy];
  const trace = (pts, close) => {
    c.beginPath();
    pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](...P(p)));
    if (close) c.closePath();
  };
  // roads first would double-add where they cross footways; 'lighter' clamps so the sum is fine
  for (const p of zone.paths ?? []) {
    const hw = p.hw ?? p.highway ?? 'footway';
    if (!(hw in WIDTH)) continue;
    c.strokeStyle = ROAD.has(hw) ? '#0f0' : '#f00';
    c.lineWidth = WIDTH[hw] * 2 * sx;
    trace(p.points);
    c.stroke();
  }
  c.fillStyle = '#00f';
  for (const k of zone.colliders ?? []) if (k.poly.length > 2 && k.topY > 3) (trace(k.poly, true), c.fill());
  const texture = new CanvasTexture(cv);
  texture.flipY = false; // canvas row 0 is z0
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = NoColorSpace;
  const m = { texture, origin: new Vector2(x0, z0), size, canvas: cv };
  masks.set(zone, m);
  return m;
}


const decals = new WeakMap();
// Painted/worn/curb decals over the walk box at ~7 cm/px: r paint (cycleway edge lines, bike symbols, crosswalk bars), g worn desire paths, b curb + gutter.
export function getDecals(zone) {
  if (decals.has(zone)) return decals.get(zone);
  const b = zone.bounds, w = b.maxX - b.minX, h = b.maxZ - b.minZ, PX = 3072;
  const cv = document.createElement('canvas');
  cv.width = PX; cv.height = Math.round((PX * h) / w);
  const sx = cv.width / w, sy = cv.height / h, c = cv.getContext('2d');
  const view = () => c.setTransform(sx, 0, 0, sy, -b.minX * sx, -b.minZ * sy);
  c.fillStyle = '#000'; c.fillRect(0, 0, cv.width, cv.height);
  c.lineCap = 'butt'; c.lineJoin = 'round';
  const paths = (zone.paths ?? []).filter((p) => p.points.length > 1);
  const isRoad = (p) => ROAD.has(p.hw ?? p.highway);
  const isWalk = (p) => ['footway', 'path', 'pedestrian', 'cycleway'].includes(p.hw ?? p.highway);
  const poly = (pts, off = 0) => {
    c.beginPath();
    pts.forEach(([x, z], i) => {
      const a = pts[Math.max(0, i - 1)], d = pts[Math.min(pts.length - 1, i + 1)];
      const L = Math.hypot(d[0] - a[0], d[1] - a[1]) || 1;
      const px = x + (-(d[1] - a[1]) / L) * off, pz = z + ((d[0] - a[0]) / L) * off;
      i ? c.lineTo(px, pz) : c.moveTo(px, pz);
    });
  };
  view();
  const add = (fn) => { c.globalCompositeOperation = 'lighter'; fn(); c.globalCompositeOperation = 'source-over'; };
  // curb: light concrete strip at the road edge, thin dark gutter just inside (blue channel; value 1 = curb, 0.5 = gutter)
  for (const p of paths.filter(isRoad)) {
    const hw = WIDTH[p.hw ?? p.highway];
    for (const sgn of [-1, 1]) {
      view(); c.strokeStyle = '#0000ff'; c.lineWidth = 0.22; poly(p.points, sgn * (hw + 0.05)); c.stroke();
      c.strokeStyle = '#000080'; c.lineWidth = 0.14; poly(p.points, sgn * (hw - 0.35)); c.stroke();
    }
  }
  // cycleways: continuous white edge lines inset 0.2 m, a bike stencil every ~30 m on the right-hand lane
  for (const p of paths.filter((q) => (q.hw ?? q.highway) === 'cycleway')) {
    const hw = WIDTH.cycleway;
    c.strokeStyle = '#ff0000'; c.lineWidth = 0.09;
    for (const sgn of [-1, 1]) { poly(p.points, sgn * (hw - 0.22)); add(() => c.stroke()); }
    let acc = 14;
    for (let i = 0; i + 1 < p.points.length; i++) {
      const [x0, z0] = p.points[i], [x1, z1] = p.points[i + 1], L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0);
      for (let t = 0; t < L; t += 1) {
        if ((acc += 1) < 30) continue;
        acc = 0;
        const x = x0 + ((x1 - x0) * t) / L, z = z0 + ((z1 - z0) * t) / L;
        view(); c.translate(x - Math.sin(ang) * 0.6, z + Math.cos(ang) * 0.6); c.rotate(ang);
        c.strokeStyle = '#ff0000'; c.lineWidth = 0.07;
        // bike glyph (metres): two wheels, frame, bars
        c.beginPath(); c.arc(-0.42, 0, 0.26, 0, 6.3); c.moveTo(0.68, 0); c.arc(0.42, 0, 0.26, 0, 6.3);
        c.moveTo(-0.42, 0); c.lineTo(-0.1, -0.3); c.lineTo(0.3, -0.3); c.lineTo(0.42, 0); c.moveTo(-0.1, -0.3); c.lineTo(0.05, 0); c.lineTo(-0.42, 0); c.moveTo(0.3, -0.3); c.lineTo(0.36, -0.46); c.lineTo(0.52, -0.46);
        add(() => c.stroke());
      }
    }
  }
  // zebra bars where a walkway crosses a road
  const seg = (a, b, d, e) => { // segment intersection
    const r = [b[0] - a[0], b[1] - a[1]], s = [e[0] - d[0], e[1] - d[1]], den = r[0] * s[1] - r[1] * s[0];
    if (!den) return null;
    const t = ((d[0] - a[0]) * s[1] - (d[1] - a[1]) * s[0]) / den, u = ((d[0] - a[0]) * r[1] - (d[1] - a[1]) * r[0]) / den;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + r[0] * t, a[1] + r[1] * t, t, u] : null;
  };
  const roads = paths.filter(isRoad), crossings = [];
  for (const p of paths.filter(isWalk)) for (let i = 0; i + 1 < p.points.length; i++) for (const rd of roads) for (let j = 0; j + 1 < rd.points.length; j++) {
    const hit = seg(p.points[i], p.points[i + 1], rd.points[j], rd.points[j + 1]);
    if (!hit) continue;
    const hw = WIDTH[rd.hw ?? rd.highway], pa = p.points[i], pb = p.points[i + 1], ang = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]);
    crossings.push({ x: hit[0], z: hit[1], ang, hw });
    view(); c.translate(hit[0], hit[1]); c.rotate(ang);
    c.fillStyle = '#ff0000';
    // shortcut: assumes the walkway meets the road near 90 deg; bars long axis then runs along traffic
    for (let k = -hw + 0.3; k < hw - 0.2; k += 0.8) add(() => c.fillRect(k, -1.4, 0.4, 2.8));
  }
  // desire paths: where a footway turns sharply, a worn chord cuts the corner across the lawn
  for (const p of paths.filter((q) => ['footway', 'path'].includes(q.hw ?? q.kind))) {
    for (let i = 1; i + 1 < p.points.length; i++) {
      const a = p.points[i - 1], m = p.points[i], d = p.points[i + 1];
      const v1 = [m[0] - a[0], m[1] - a[1]], v2 = [d[0] - m[0], d[1] - m[1]], l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
      if (l1 < 6 || l2 < 6 || (v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2) > 0.45) continue;
      const k = 4.5, P = [m[0] - (v1[0] / l1) * k, m[1] - (v1[1] / l1) * k], Q = [m[0] + (v2[0] / l2) * k, m[1] + (v2[1] / l2) * k];
      view(); c.strokeStyle = '#00ff00'; c.lineWidth = 0.55; c.lineCap = 'round';
      c.beginPath(); c.moveTo(P[0], P[1]); c.quadraticCurveTo(m[0] * 0.35 + (P[0] + Q[0]) * 0.325, m[1] * 0.35 + (P[1] + Q[1]) * 0.325, Q[0], Q[1]); add(() => c.stroke());
    }
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  const texture = new CanvasTexture(cv);
  texture.flipY = false; texture.colorSpace = NoColorSpace; texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearMipmapLinearFilter; texture.generateMipmaps = true; texture.anisotropy = 8;
  const d = { texture, origin: new Vector2(b.minX, b.minZ), size: new Vector2(w, h), crossings };
  decals.set(zone, d);
  return d;
}

function loadSet(name, aniso, tiles, dir = '', only) {
  const L = new TextureLoader();
  const out = {};
  for (const [k, cs] of [['albedo', SRGBColorSpace], ['normal', NoColorSpace], ['roughness', NoColorSpace]]) {
    if (only && !only.includes(k)) continue;
    const t = L.load(`${BASE}${dir}${name}-${k}.jpg`);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.colorSpace = cs;
    t.anisotropy = aniso;
    out[k] = t;
  }
  tiles.push(out);
  return out;
}

const GLSL_NOISE = /* glsl */ `
float gh(vec2 p){ p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(gh(i), gh(i+vec2(1,0)), f.x), mix(gh(i+vec2(0,1)), gh(i+vec2(1,1)), f.x), f.y); }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
// anti-tiling: two lookups at different scale/rotation blended by low-frequency noise
vec4 tex2(sampler2D t, vec2 p, float w){ return mix(texture2D(t, p), texture2D(t, rot(0.9) * p * 0.43 + vec2(0.37, 0.71)), w); }
`;

/** Returns a Group (mesh = group.children[0]) with .mask, heightAt(x,z). */
export function buildGround(zone, mats, opts = {}) {
  const b = zone.bounds;
  const mask = getMask(zone);
  const aniso = Math.min(16, opts.aniso ?? 8);
  const tiles = [];
  const grass = loadSet('grass', aniso, tiles, opts.dir, ['albedo', 'normal']), pave = loadSet(opts.paveName ?? 'pavers', aniso, tiles, opts.dir, ['albedo', 'normal']), asph = loadSet('asphalt', aniso, tiles, opts.dir, ['albedo']); // GPU samplers are scarce (16 per stage): roughness maps dropped
  const u = {
    uMask: { value: mask.texture }, uOrg: { value: mask.origin }, uSize: { value: mask.size },
    gA: { value: grass.albedo }, gN: { value: grass.normal },
    pA: { value: pave.albedo }, pN: { value: pave.normal },
    aA: { value: asph.albedo },
  };
  // optional aerial orthophoto (walk mode): {texture, xMin, zMin, w, h}; blended in beyond `near` metres from the camera so PBR detail stays close
  const o = opts.ortho, X = !!opts.decals; // X: walk extras (decals, wear, seams, leaf litter, georeferenced ortho)
  if (X) {
    const dc = getDecals(zone), dirt = loadSet('dirt', aniso, tiles, opts.dir, ['albedo']), lv = loadSet('leaves', aniso, tiles, opts.dir, ['albedo']);
    Object.assign(u, { uDecal: { value: dc.texture }, uDO: { value: dc.origin }, uDS: { value: dc.size }, dA: { value: dirt.albedo }, lA: { value: lv.albedo },
      uLeaf: { value: opts.leaf ?? 0.8 }, uDry: { value: opts.dry ?? 0.5 } });
  }
  if (o && o.fit) {
    const f = o.fit, c = Math.cos(f.theta), sn = Math.sin(f.theta);
    Object.assign(u, { uOM: { value: new Matrix3().set(c, -sn, 0, sn, c, 0, 0, 0, 1) }, uOC: { value: new Vector2(f.cx, f.cz) }, uOD: { value: new Vector2(f.dx, f.dz) } });
  }
  if (o) { u.uOrtho = { value: o.texture }; u.uOB = { value: new Vector4(o.xMin, o.zMin, o.w, o.h) }; u.uONear = { value: o.near ?? 7 }; }
  const mat = new MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
  mat.name = 'campus_ground';
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWP;\nuniform sampler2D uMask,gA,gN,pA,pN,aA; uniform vec2 uOrg,uSize;\n${o ? 'uniform sampler2D uOrtho; uniform vec4 uOB; uniform float uONear;' : ''}${o && o.fit ? 'uniform mat3 uOM; uniform vec2 uOC, uOD;' : ''}${X ? 'uniform sampler2D uDecal,dA,lA; uniform vec2 uDO,uDS; uniform float uLeaf,uDry;' : ''}\n${GLSL_NOISE}`)
      .replace('#include <map_fragment>', /* glsl */ `
        vec2 wp = vWP.xz;
        vec4 mk = texture2D(uMask, (wp - uOrg) / uSize);
        float n1 = vn(wp * 0.4), n2 = vn(wp * 0.05 + 7.0), n3 = vn(wp * 2.3), n4 = vn(wp * 0.011 + 3.0);
        float ej = (n1 - 0.5) * 0.35 + (n3 - 0.5) * 0.2;
        float road = smoothstep(0.40, 0.58, mk.g + ej * 0.5);
        float path = smoothstep(0.40, 0.58, mk.r + ej) * (1.0 - road);
        float rim = smoothstep(0.15, 0.42, max(mk.r, mk.g) + ej) * (1.0 - max(path, road)); // lip of dirt/overgrowth at edges
        float aw = smoothstep(0.25, 0.75, n2);
        // grass: 2.6 m tile, anti-tiled, macro hue/value patches at 20-90 m
        vec2 gp = wp / 2.6;
        vec3 ga = tex2(gA, gp, aw).rgb, gnn = tex2(gN, gp, aw).xyz * 2.0 - 1.0; float gr = 0.92;
        vec3 lush = vec3(0.62, 1.12, 0.42), dry = vec3(0.92, 1.08, 0.50);
        ga *= mix(lush, dry, smoothstep(0.35, 0.8, n4)) * (0.82 + 0.36 * n2) * (0.9 + 0.2 * n3);
        // pavers 1.2 m, asphalt 2 m
        vec2 pp = wp / ${(opts.paveTile ?? 1.2).toFixed(2)}, ap = wp / 2.0;
        float pw = smoothstep(0.3, 0.7, n1);
        vec3 pa = tex2(pA, pp, ${opts.paveName ? '0.0' : 'pw'}).rgb, pnn = tex2(pN, pp, ${opts.paveName ? '0.0' : 'pw'}).xyz * 2.0 - 1.0; float pr = 0.8;
        pa = mix(vec3(dot(pa, vec3(0.333))), pa, ${opts.paveName ? '0.85' : '0.45'}) * (0.95 + 0.3 * n2) * mix(0.95, 1.12, n3); pnn.xy *= ${opts.paveName ? '0.8' : '0.45'}; // smooth concrete-ish walk, not cobbles
        vec3 aa = tex2(aA, ap, aw).rgb, ann = vec3(0.0, 0.0, 1.0); float ar_ = 0.88;
        aa *= 0.75 + 0.5 * n2;
        ga = mix(ga, ga * vec3(0.55, 0.5, 0.35), rim * 0.8);
        vec3 alb = mix(mix(ga, pa, path), aa, road);
        vec3 nn = mix(mix(gnn, pnn, path), ann, road);
        float rgh = mix(mix(gr, pr, path), ar_, road);
        ${X ? `{
          vec4 dc = texture2D(uDecal, (wp - uDO) / uDS);
          float dist = length(vWP - cameraPosition);
          float lawn = (1.0 - path) * (1.0 - road);
          // autumn/dry lawn: warm the grass, lift it a little
          ga = mix(ga, vec3(0.46, 0.38, 0.20) * (0.55 + 1.6 * dot(ga, vec3(0.333))) * (0.8 + 0.4 * n2), uDry * 0.8 * (0.8 + 0.2 * smoothstep(0.0, 0.5, n4 + 0.45)));
          alb = mix(mix(ga, pa, path), aa, road);
          // worn desire paths: bare dirt through the lawn, ragged edge
          float wear = smoothstep(0.25, 0.7, dc.g + (n3 - 0.5) * 0.5) * lawn;
          vec2 dp = wp / 2.0; vec3 da = texture2D(dA, dp).rgb; vec3 dn = vec3(0.0, 0.0, 1.0);
          alb = mix(alb, da * vec3(0.9, 0.82, 0.7), wear * 0.85); nn = mix(nn, dn, wear * 0.8); rgh = mix(rgh, 0.95, wear);
          // paving seams every 1.5 m (scored concrete) on walks
          vec2 sc = wp / 1.5 + vec2(0.37, 0.11); vec2 fa = abs(fract(sc) - 0.5); vec2 fw = fwidth(sc) * 1.2;
          float seam = smoothstep(0.494 - fw.x, 0.5, max(fa.x, fa.y)) * (1.0 - smoothstep(18.0, 40.0, dist)) * path;
          alb *= 1.0 - 0.28 * seam;
          // curb strip and gutter at road edges
          float cb = smoothstep(0.55, 0.95, dc.b), gt = smoothstep(0.3, 0.5, dc.b) * (1.0 - cb);
          alb = mix(alb, vec3(0.5, 0.49, 0.46) * (0.9 + 0.2 * n3), cb * 0.95); alb *= 1.0 - 0.45 * gt;
          // white paint: worn through
          float paint = smoothstep(0.3, 0.8, dc.r) * (0.6 + 0.4 * smoothstep(0.35, 0.6, vn(wp * 9.0)));
          alb = mix(alb, vec3(0.82, 0.82, 0.78), paint * 0.9); rgh = mix(rgh, 0.7, paint);
          // fallen leaves: dense along path/road edges, a few on the walks
          float edge = smoothstep(0.02, 0.3, max(mk.r, mk.g) + ej * 0.4) * lawn;
          float lf = (edge * smoothstep(0.35, 0.7, vn(wp * 1.3) * 0.7 + vn(wp * 6.0) * 0.5) + path * smoothstep(0.7, 0.95, vn(wp * 0.9 + 3.0) * vn(wp * 5.0 + 1.0) * 1.7) * 0.45) * uLeaf;
          vec3 la = texture2D(lA, wp / 1.1).rgb;
          alb = mix(alb, mix(vec3(dot(la, vec3(0.333))), la, 0.6) * vec3(1.0, 0.82, 0.6), clamp(lf, 0.0, 0.7));
        }` : ''}
        ${o ? `{ ${o.fit ? 'vec2 wq = (uOM * vec3(wp - uOC, 0.0)).xy + uOC + uOD;' : 'vec2 wq = wp;'}
          vec2 ou = (wq - uOB.xy) / uOB.zw;
          float inb = step(0.0, ou.x) * step(ou.x, 1.0) * step(0.0, ou.y) * step(ou.y, 1.0);
          vec3 oc = texture2D(uOrtho, clamp(ou, 0.0, 1.0)).rgb;
          // the ortho is a leaf-off spring flight: keep its layout and tone but rebuild lawns and carry fine PBR detail through the blend
          float ol = dot(oc, vec3(0.3, 0.59, 0.11));
          ${X ? `float lw = (1.0 - path) * (1.0 - road); vec3 lawnc = ga * (0.55 + 1.1 * ol);
          oc = mix(oc * 1.0, lawnc, lw * 0.55 * smoothstep(0.0, 0.4, 1.0 - mk.b));
          float dl = dot(alb, vec3(0.3, 0.59, 0.11)); oc *= clamp(0.85 + 0.9 * (dl - 0.2), 0.6, 1.35);` : ''}
          float ow = inb * smoothstep(uONear, uONear * 4.0, length(vWP - cameraPosition)) * ${X ? '0.8' : '0.85'};
          alb = mix(alb, oc * 0.95, ow); }` : ''}
        gRough = clamp(rgh, 0.35, 1.0);
        gWN = normalize(vec3(nn.x * 0.9, 1.0, -nn.y * 0.9));
        diffuseColor.rgb *= alb;
      `)
      .replace('void main() {', 'float gRough; vec3 gWN;\nvoid main() {')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = gRough;')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = normalize((viewMatrix * vec4(gWN, 0.0)).xyz);');
  };
  mat.customProgramCacheKey = () => 'campus_ground_v2' + (o ? 'o' : '') + (X ? 'x' : '') + (opts.paveName ?? '');

  const w = b.maxX - b.minX + 2 * FAR, h = b.maxZ - b.minZ + 2 * FAR;
  const geo = new PlaneGeometry(w, h, 1, 1).rotateX(-Math.PI / 2);
  geo.translate((b.minX + b.maxX) / 2, zone.ground?.heights?.[0] ?? 0, (b.minZ + b.maxZ) / 2);
  const mesh = new Mesh(geo, mat);
  mesh.name = 'campus_ground_mesh';
  mesh.receiveShadow = true;
  const g = new Group();
  g.name = 'campus_ground';
  g.add(mesh);
  // shortcut: flat plane at heights[0] (purdue-mall's grid is 2x2 equal); upgrade by sampling zone.ground for sloped zones
  g.userData.heightAt = () => zone.ground?.heights?.[0] ?? 0;
  g.heightAt = g.userData.heightAt;
  g.mask = mask;
  g.material = mat;
  return g;
}
