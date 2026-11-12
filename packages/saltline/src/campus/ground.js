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
  Vector2,
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

function loadSet(name, aniso, tiles) {
  const L = new TextureLoader();
  const out = {};
  for (const [k, cs] of [['albedo', SRGBColorSpace], ['normal', NoColorSpace], ['roughness', NoColorSpace]]) {
    const t = L.load(`${BASE}${name}-${k}.jpg`);
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
  const aniso = Math.min(8, opts.aniso ?? 8);
  const tiles = [];
  const grass = loadSet('grass', aniso, tiles), pave = loadSet('pavers', aniso, tiles), asph = loadSet('asphalt', aniso, tiles);
  const u = {
    uMask: { value: mask.texture }, uOrg: { value: mask.origin }, uSize: { value: mask.size },
    gA: { value: grass.albedo }, gN: { value: grass.normal }, gR: { value: grass.roughness },
    pA: { value: pave.albedo }, pN: { value: pave.normal }, pR: { value: pave.roughness },
    aA: { value: asph.albedo }, aN: { value: asph.normal }, aR: { value: asph.roughness },
  };
  const mat = new MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
  mat.name = 'campus_ground';
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWP;\nuniform sampler2D uMask,gA,gN,gR,pA,pN,pR,aA,aN,aR; uniform vec2 uOrg,uSize;\n${GLSL_NOISE}`)
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
        vec3 ga = tex2(gA, gp, aw).rgb, gnn = tex2(gN, gp, aw).xyz * 2.0 - 1.0; float gr = tex2(gR, gp, aw).r;
        vec3 lush = vec3(0.62, 1.12, 0.42), dry = vec3(0.92, 1.08, 0.50);
        ga *= mix(lush, dry, smoothstep(0.35, 0.8, n4)) * (0.82 + 0.36 * n2) * (0.9 + 0.2 * n3);
        // pavers 1.2 m, asphalt 2 m
        vec2 pp = wp / 1.2, ap = wp / 2.0;
        float pw = smoothstep(0.3, 0.7, n1);
        vec3 pa = tex2(pA, pp, pw).rgb, pnn = tex2(pN, pp, pw).xyz * 2.0 - 1.0; float pr = tex2(pR, pp, pw).r;
        pa = mix(vec3(dot(pa, vec3(0.333))), pa, 0.45) * (0.95 + 0.3 * n2) * mix(0.95, 1.12, n3); pnn.xy *= 0.45; // smooth concrete-ish walk, not cobbles
        vec3 aa = tex2(aA, ap, aw).rgb, ann = tex2(aN, ap, aw).xyz * 2.0 - 1.0; float ar_ = tex2(aR, ap, aw).r;
        aa *= 0.75 + 0.5 * n2;
        ga = mix(ga, ga * vec3(0.55, 0.5, 0.35), rim * 0.8);
        vec3 alb = mix(mix(ga, pa, path), aa, road);
        vec3 nn = mix(mix(gnn, pnn, path), ann, road);
        float rgh = mix(mix(gr, pr, path), ar_, road);
        gRough = clamp(rgh, 0.35, 1.0);
        gWN = normalize(vec3(nn.x * 0.9, 1.0, -nn.y * 0.9));
        diffuseColor.rgb *= alb;
      `)
      .replace('void main() {', 'float gRough; vec3 gWN;\nvoid main() {')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = gRough;')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = normalize((viewMatrix * vec4(gWN, 0.0)).xyz);');
  };
  mat.customProgramCacheKey = () => 'campus_ground_v1';

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
