// Street furniture, understory and small ground detail for the walk scene. Everything is instanced code geometry (no glb).
// Real data: footway/cycleway/road polylines (OSM, mall-paths.json), WALC footprint, OSM tree positions (tree grates), crossings found by intersecting walkways with roads.
// Guessed: which spots get benches, racks, bins, hydrants, planters, shrubs, flagpoles, utility boxes (none of these exist as OSM nodes in the area; ortho placement was not hand-read).
import {
  BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, PlaneGeometry, Quaternion,
  RingGeometry, SphereGeometry, TorusGeometry, TubeGeometry, Vector3, ConeGeometry, Euler,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SEASON } from './season.js';
import { windTime } from './trees.js';

const rng = (seed) => () => ((seed = (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) | 0), ((seed ^ (seed >>> 14)) >>> 0) / 4294967296);
const inPoly = (x, z, poly) => { let r = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [a, b] = poly[j], [c, d] = poly[i]; if ((b > z) !== (d > z) && x < ((c - a) * (z - b)) / (d - b) + a) r = !r; } return r; };
const distSeg = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
const BOX = { minX: -50, maxX: 160, minZ: -70, maxZ: 50 };
const inBox = (x, z) => x > BOX.minX + 2 && x < BOX.maxX - 2 && z > BOX.minZ + 2 && z < BOX.maxZ - 2;

export const MATS = {
  dark: () => new MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.45, metalness: 0.7 }),
  wood: () => new MeshStandardMaterial({ color: 0x86603a, roughness: 0.8 }),
  stone: () => new MeshStandardMaterial({ color: 0xcdc3ad, roughness: 0.92 }),
  green: () => new MeshStandardMaterial({ color: 0x2b4636, roughness: 0.6, metalness: 0.2 }),
  blue: () => new MeshStandardMaterial({ color: 0x2a4a78, roughness: 0.6, metalness: 0.2 }),
  red: () => new MeshStandardMaterial({ color: 0xa82a22, roughness: 0.5, metalness: 0.3 }),
  utility: () => new MeshStandardMaterial({ color: 0x55624f, roughness: 0.6, metalness: 0.3 }),
  yellow: () => new MeshStandardMaterial({ color: 0xcaa52a, roughness: 0.85 }),
  glass: () => new MeshStandardMaterial({ color: 0xfff0cc, emissive: 0xffe0a0, emissiveIntensity: 0.5, roughness: 0.3 }),
  tint: () => new MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.4 }), // instance-coloured (bike frames)
  iron: () => new MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.7, metalness: 0.6 }),
  soil: () => new MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 }),
  steel: () => new MeshStandardMaterial({ color: 0x8c8f93, roughness: 0.35, metalness: 0.9 }),
  flag: () => new MeshStandardMaterial({ color: 0xb0282a, roughness: 0.8, side: DoubleSide }),
};

const limb = (a, b, r, seg = 6) => {
  const d = b.clone().sub(a), L = d.length(), g = new CylinderGeometry(r, r, L, seg, 1, false).translate(0, L / 2, 0);
  return g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize())).translate(a.x, a.y, a.z);
};
const V = (x, y, z) => new Vector3(x, y, z);
const T = (g, x, y, z) => g.translate(x, y, z);
const nonIdx = (g) => (g.index ? g.toNonIndexed() : g);

// prototypes: name -> { matKey: [geometries] }; each is merged to one geometry per material
export const PROTO = {
  lamp: { dark: [T(new CylinderGeometry(0.075, 0.1, 3.9, 8), 0, 1.95, 0), T(new CylinderGeometry(0.2, 0.26, 0.7, 8), 0, 0.35, 0), T(new CylinderGeometry(0.15, 0.15, 0.1, 8), 0, 3.95, 0), T(new ConeGeometry(0.3, 0.32, 8), 0, 4.74, 0), T(new SphereGeometry(0.05, 6, 6), 0, 4.95, 0), T(new TorusGeometry(0.27, 0.015, 4, 12).rotateX(Math.PI / 2), 0, 4.55, 0)],
    glass: [T(new SphereGeometry(0.21, 10, 8).scale(1, 1.55, 1), 0, 4.3, 0)] },
  bench: { wood: [0, 0.07, 0.14, 0.21].map((z) => T(new BoxGeometry(1.8, 0.04, 0.09), 0, 0.46, z - 0.1)).concat([0.7, 0.84].map((y) => T(new BoxGeometry(1.8, 0.1, 0.035), 0, y, -0.2))),
    dark: [-0.85, 0.85].flatMap((x) => [T(new BoxGeometry(0.05, 0.46, 0.5), x, 0.23, 0), T(new BoxGeometry(0.05, 0.5, 0.05), x, 0.72, -0.22), T(new BoxGeometry(0.06, 0.04, 0.45), x, 0.66, 0)]) },
  bollard: { dark: [T(new CylinderGeometry(0.09, 0.1, 0.85, 10), 0, 0.425, 0), T(new SphereGeometry(0.09, 8, 4, 0, 6.3, 0, 1.6), 0, 0.85, 0)], glass: [T(new CylinderGeometry(0.092, 0.092, 0.07, 10), 0, 0.72, 0)] },
  rack: { steel: [new TubeGeometry(new CatmullRomCurve3([V(-0.36, 0, 0), V(-0.36, 0.62, 0), V(-0.28, 0.8, 0), V(0.28, 0.8, 0), V(0.36, 0.62, 0), V(0.36, 0, 0)], false, 'catmullrom', 0.2), 24, 0.022, 6)] },
  bike: { dark: [...[-0.55, 0.55].map((x) => T(new TorusGeometry(0.33, 0.022, 5, 18), x, 0.34, 0)), T(new BoxGeometry(0.2, 0.04, 0.1), -0.12, 0.98, 0), T(new BoxGeometry(0.06, 0.04, 0.5), 0.46, 1.05, 0)],
    tint: [limb(V(-0.55, 0.34, 0), V(-0.1, 0.9, 0), 0.02), limb(V(-0.1, 0.9, 0), V(0.4, 0.88, 0), 0.02), limb(V(-0.55, 0.34, 0), V(0.0, 0.34, 0), 0.016), limb(V(0.0, 0.34, 0), V(-0.1, 0.9, 0), 0.02), limb(V(0.0, 0.34, 0), V(0.4, 0.88, 0), 0.02), limb(V(0.4, 0.88, 0), V(0.55, 0.34, 0), 0.018), limb(V(0.4, 0.88, 0), V(0.46, 1.05, 0), 0.016)] },
  repair: { dark: [T(new CylinderGeometry(0.05, 0.05, 1.3, 8), 0, 0.65, 0), T(new BoxGeometry(0.34, 0.5, 0.1), 0, 1.25, 0)], steel: [T(new CylinderGeometry(0.02, 0.02, 0.5, 6).rotateZ(1.2), 0.2, 0.95, 0)] },
  bin: { green: [T(new CylinderGeometry(0.3, 0.27, 0.95, 12), 0, 0.5, 0)], dark: [T(new CylinderGeometry(0.31, 0.31, 0.08, 12), 0, 1.0, 0), T(new BoxGeometry(0.28, 0.2, 0.02), 0, 0.7, 0.3)] },
  recycle: { blue: [T(new CylinderGeometry(0.3, 0.27, 0.95, 12), 0, 0.5, 0)], dark: [T(new CylinderGeometry(0.31, 0.31, 0.08, 12), 0, 1.0, 0)] },
  hydrant: { red: [T(new CylinderGeometry(0.12, 0.14, 0.7, 10), 0, 0.4, 0), T(new SphereGeometry(0.13, 8, 6), 0, 0.78, 0), T(new CylinderGeometry(0.06, 0.06, 0.4, 8).rotateZ(Math.PI / 2), 0, 0.5, 0)] },
  utility: { utility: [T(new BoxGeometry(0.9, 1.1, 0.6), 0, 0.55, 0)] },
  fountain: { steel: [T(new BoxGeometry(0.5, 0.12, 0.45), 0, 0.95, 0)], stone: [T(new BoxGeometry(0.38, 0.9, 0.38), 0, 0.45, 0)] },
  planter: { stone: [T(new BoxGeometry(3.4, 0.55, 1.15), 0, 0.275, 0), T(new BoxGeometry(3.5, 0.06, 1.25), 0, 0.58, 0)], soil: [T(new BoxGeometry(3.1, 0.04, 0.85), 0, 0.57, 0)] },
  seatwall: { stone: [T(new BoxGeometry(3.0, 0.46, 0.5), 0, 0.23, 0)] },
  flagpole: { steel: [T(new CylinderGeometry(0.04, 0.08, 9, 8), 0, 4.5, 0), T(new SphereGeometry(0.09, 6, 6), 0, 9.05, 0)], flag: [T(new PlaneGeometry(1.5, 0.95), 0.8, 8.3, 0)] },
  grate: { iron: [new RingGeometry(0.28, 0.62, 16).rotateX(-Math.PI / 2).translate(0, 0.02, 0), T(new BoxGeometry(1.25, 0.02, 0.1), 0, 0.025, 0.5), T(new BoxGeometry(1.25, 0.02, 0.1), 0, 0.025, -0.5)] },
  manhole: { iron: [T(new CylinderGeometry(0.4, 0.4, 0.02, 16), 0, 0.012, 0)] },
  drain: { iron: [T(new BoxGeometry(0.7, 0.02, 0.4), 0, 0.012, 0)] },
  tactile: { yellow: [T(new BoxGeometry(1.2, 0.02, 0.6), 0, 0.012, 0)] },
};

export function buildFurniture(G, zone, paths, trees) {
  const out = new Group(); out.name = 'walk_furniture';
  const R = rng(4242), mats = {}, place = {}, Q = new Quaternion(), E = new Euler(), M = new Matrix4(), Sc = new Vector3(1, 1, 1), P = new Vector3();
  const walc = zone.colliders.find((c) => c.id === 'way/508846031'), poly = walc && walc.poly;
  const solids = [[[-4.6, -4.6], [4.6, -4.6], [4.6, 4.6], [-4.6, 4.6]], ...(poly ? [poly] : [])];
  const free = (x, z, m = 0.6) => inBox(x, z) && !(G.plazaExclude && G.plazaExclude(x, z)) && !solids.some((s) => inPoly(x, z, s) || s.some((p, i) => distSeg(x, z, p, s[(i + 1) % s.length]) < m));
  const on = (name, x, z, yaw = 0, s = 1, y = 0, color) => { (place[name] = place[name] || []).push({ x, z, yaw, s, y, color }); };
  const walks = paths.filter((p) => ['footway', 'pedestrian', 'path', 'cycleway'].includes(p.hw));
  const roads = paths.filter((p) => !['footway', 'pedestrian', 'path', 'cycleway', 'corridor', 'track', 'steps'].includes(p.hw));
  const nearWalk = (x, z) => Math.min(...walks.flatMap((p) => p.points.slice(1).map((b, i) => distSeg(x, z, p.points[i], b))), 99);
  const nearRoad = (x, z) => Math.min(...roads.flatMap((p) => p.points.slice(1).map((b, i) => distSeg(x, z, p.points[i], b))), 99);
  const onPath = (x, z) => nearWalk(x, z) < 1.2 || nearRoad(x, z) < 3;

  // 1. lamps, benches, bins along walkways (guessed spacing on real polylines)
  let n = 0;
  for (const p of walks) {
    let acc = R() * 20;
    for (let i = 0; i + 1 < p.points.length; i++) {
      const [x0, z0] = p.points[i], [x1, z1] = p.points[i + 1], L = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / L, nz = (x1 - x0) / L;
      for (let s = 0; s < L; s += 2) {
        if ((acc += 2) < 26) continue;
        acc = 0; n++;
        const side = n % 2 ? 1 : -1, t = s / L, x = x0 + (x1 - x0) * t + nx * 2.7 * side, z = z0 + (z1 - z0) * t + nz * 2.7 * side, yaw = Math.atan2(-nx * side, -nz * side);
        if (!free(x, z, 1) || nearWalk(x, z) < 1.8) continue;
        const k = n % 6;
        if (k < 3) on('lamp', x, z);
        else if (k === 3) { on('bench', x, z, yaw); on('lamp', x + nx * side * -0.2 + (x1 - x0) / L * 2.6, z + (z1 - z0) / L * 2.6); }
        else if (k === 4) { on('bin', x, z); on('recycle', x + (x1 - x0) / L * 0.7, z + (z1 - z0) / L * 0.7); }
        else { on('bollard', x, z); on('bollard', x + (x1 - x0) / L * 3, z + (z1 - z0) / L * 3); }
      }
    }
  }
  // 2. WALC frontage: planters + seat walls, bike racks with parked bikes, flagpoles, fountain, utility boxes
  if (poly) {
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cz = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 8) continue;
      const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L; let nx = -dz, nz = dx;
      if ((a[0] - cx) * nx + (a[1] - cz) * nz < 0) { nx = -nx; nz = -nz; }
      const yaw = Math.atan2(-dz, dx); // local x along the edge
      for (let s = 3; s < L - 3; s += 9 + R() * 4) { // planters every ~11 m
        const x = a[0] + dx * s + nx * 2.3, z = a[1] + dz * s + nz * 2.3;
        if (free(x, z, 0.8) && !onPath(x, z)) on('planter', x, z, yaw);
      }
      for (let s = 10 + R() * 8; s < L - 6; s += 24 + R() * 10) { // rack groups of 5-6
        const rows = 5 + ((R() * 2) | 0);
        for (let r = 0; r < rows; r++) {
          const along = s + r * 0.9, x = a[0] + dx * along + nx * 5.2, z = a[1] + dz * along + nz * 5.2;
          if (!free(x, z, 1) || onPath(x, z)) continue;
          on('rack', x, z, yaw + Math.PI / 2 * 0 + 0);
          for (const sd of [-1, 1]) if (R() < 0.38) on('bike', x + dx * sd * 0.0 + nx * 0.0, z, yaw, 1, 0, new Color().setHSL(R(), 0.5, 0.35));
        }
        const x = a[0] + dx * s + nx * 5.2, z = a[1] + dz * s + nz * 5.2;
        if (free(x, z, 1) && !onPath(x, z)) on('repair', x - dx * 1.2, z - dz * 1.2, yaw);
      }
      for (let s = 6; s < L - 6; s += 30 + R() * 10) {
        const x = a[0] + dx * s + nx * 3.4, z = a[1] + dz * s + nz * 3.4;
        if (free(x, z, 1) && !onPath(x, z)) on(R() < 0.5 ? 'seatwall' : 'bench', x, z, yaw + (R() < 0.5 ? Math.PI : 0));
      }
      if (i === 0) { on('utility', a[0] + dx * 12 + nx * 1.0, a[1] + dz * 12 + nz * 1.0, yaw); on('fountain', a[0] + dx * (L * 0.6) + nx * 1.1, a[1] + dz * (L * 0.6) + nz * 1.1, yaw); }
      if (i === 1) on('utility', a[0] + dx * 4 + nx * 1.0, a[1] + dz * 4 + nz * 1.0, yaw);
      const fx = a[0] + dx * (L * 0.5) + nx * 8, fz = a[1] + dz * (L * 0.5) + nz * 8;
      if (L > 30 && free(fx, fz, 1) && !onPath(fx, fz)) for (let k = -1; k <= 1; k++) on('flagpole', fx + dx * k * 2.4, fz + dz * k * 2.4, yaw);
    }
  }
  // 3. roads: hydrants, manholes, storm drains at the kerb
  for (const p of roads) {
    const hw = { service: 2.4, residential: 3.6, unclassified: 3.2, tertiary: 4, secondary: 4.5, primary: 5 }[p.hw] ?? 3;
    let acc = 30;
    for (let i = 0; i + 1 < p.points.length; i++) {
      const [x0, z0] = p.points[i], [x1, z1] = p.points[i + 1], L = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / L, nz = (x1 - x0) / L;
      for (let s = 0; s < L; s += 2) {
        if ((acc += 2) < 38) continue;
        acc = 0; n++;
        const t = s / L, bx = x0 + (x1 - x0) * t, bz = z0 + (z1 - z0) * t, side = n % 2 ? 1 : -1;
        if (!inBox(bx, bz)) continue;
        on('manhole', bx, bz, 0);
        on('drain', bx + nx * (hw - 0.3) * side, bz + nz * (hw - 0.3) * side, Math.atan2(-(z1 - z0), x1 - x0));
        if (n % 3 === 0 && free(bx + nx * (hw + 1.2) * side, bz + nz * (hw + 1.2) * side, 1)) on('hydrant', bx + nx * (hw + 1.2) * side, bz + nz * (hw + 1.2) * side);
      }
    }
  }
  // 4. tree grates where an OSM tree stands within 3.5 m of a walkway (real tree positions)
  for (const t of trees) if (inBox(t.x, t.z) && nearWalk(t.x, t.z) < 3.5 && free(t.x, t.z, 0.2)) on('grate', t.x, t.z);
  // 5. tactile paving pads at both ends of each crossing (real intersections, computed in ground.getDecals)
  for (const c of G.walkCrossings || []) for (const sd of [-1, 1]) on('tactile', c.x + Math.cos(c.ang) * (c.hw + 0.6) * sd, c.z + Math.sin(c.ang) * (c.hw + 0.6) * sd, -c.ang);

  // build instanced meshes
  const counts = {};
  for (const [name, items] of Object.entries(place)) {
    counts[name] = items.length;
    for (const [key, geos] of Object.entries(PROTO[name])) {
      const geo = mergeGeometries(geos.map(nonIdx).map((g) => { const c = g.clone(); for (const a of Object.keys(c.attributes)) if (!['position', 'normal', 'uv'].includes(a)) c.deleteAttribute(a); if (!c.attributes.uv) c.setAttribute('uv', new Float32BufferAttribute(new Float32Array(c.attributes.position.count * 2), 2)); return c; }));
      mats[key] = mats[key] || MATS[key]();
      const m = new InstancedMesh(geo, mats[key], items.length);
      m.castShadow = !['grate', 'manhole', 'drain', 'tactile'].includes(name); m.receiveShadow = true;
      items.forEach((it, i) => {
        E.set(0, it.yaw, 0); Q.setFromEuler(E); P.set(it.x, it.y, it.z); Sc.setScalar(it.s); M.compose(P, Q, Sc); m.setMatrixAt(i, M);
        if (key === 'tint') m.setColorAt(i, it.color || new Color(0x884422));
      });
      m.instanceMatrix.needsUpdate = true;
      out.add(m);
    }
  }
  out.counts = counts; out.planters = place.planter || [];
  return out;
}

// ---------------------------------------------------------------- understory: ornamental grasses + shrubs in/around the WALC planters
function clumpGeometry(seed) {
  const R = rng(seed), pos = [], nor = [], col = [], idx = [];
  for (let b = 0; b < 46; b++) {
    const a = R() * 6.2832, lean = 0.25 + R() * 0.5, h = 0.55 + R() * 0.45, w = 0.022 + R() * 0.012, base = R() * 0.1;
    const dx = Math.cos(a), dz = Math.sin(a), ox = dx * base, oz = dz * base, o = pos.length / 3;
    for (let s = 0; s <= 4; s++) {
      const t = s / 4, bend = lean * t * t, ww = w * (1 - t * 0.85), y = h * t * (1 - 0.25 * t * lean);
      for (const sg of [-1, 1]) {
        pos.push(ox + dx * bend + -dz * ww * sg, y, oz + dz * bend + dx * ww * sg);
        nor.push(0, 1, 0);
        const c = 0.55 + 0.45 * t; col.push(c, c, c);
      }
    }
    for (let s = 0; s < 4; s++) idx.push(o + s * 2, o + s * 2 + 1, o + s * 2 + 2, o + s * 2 + 1, o + s * 2 + 3, o + s * 2 + 2);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new Float32BufferAttribute(nor, 3)); geo.setAttribute('color', new Float32BufferAttribute(col, 3)); geo.setIndex(idx);
  return geo;
}
export function buildUnderstory(G, zone, planters) {
  const grp = new Group(); grp.name = 'walk_understory';
  const R = rng(99), autumnal = SEASON === 'autumn' || SEASON === 'winter';
  const gm = new MeshStandardMaterial({ vertexColors: true, side: DoubleSide, roughness: 0.85, color: autumnal ? 0xc9a96a : SEASON === 'spring' ? 0xa6b46a : 0x86a04a });
  gm.onBeforeCompile = (s) => {
    s.uniforms.uTime = windTime;
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', `#include <begin_vertex>
      { vec2 ph = vec2(instanceMatrix[3].x, instanceMatrix[3].z); float k = position.y * position.y * 0.18;
        transformed.x += sin(uTime * 1.7 + ph.x * 0.9 + ph.y * 0.6) * k * 0.12; transformed.z += sin(uTime * 1.3 + ph.y * 0.8) * k * 0.08; }`);
  };
  const sm = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const clumps = [], shrubs = [];
  for (const p of planters) {
    const c = Math.cos(p.yaw), s = Math.sin(p.yaw); // planter local x runs along the wall
    for (let i = 0; i < 7; i++) { const lx = (R() - 0.5) * 2.7, lz = (R() - 0.5) * 0.7; clumps.push([p.x + lx * c + lz * s, p.z - lx * s + lz * c, 0.9 + R() * 0.7, R() * 6.28]); }
    for (let i = 0; i < 2; i++) { const lx = (R() - 0.5) * 2.4; shrubs.push([p.x + lx * c, p.z - lx * s, 0.45 + R() * 0.3, R() < 0.5 ? 0x5a4630 : 0x6b2f2a]); }
  }
  const clumpMesh = new InstancedMesh(clumpGeometry(5), gm, Math.max(clumps.length, 1)); clumpMesh.count = clumps.length;
  clumps.forEach((c, i) => { E_.set(0, c[3], 0); Q_.setFromEuler(E_); M_.compose(P_.set(c[0], 0.58, c[1]), Q_, S_.set(c[2], c[2], c[2])); clumpMesh.setMatrixAt(i, M_); });
  clumpMesh.castShadow = true; clumpMesh.receiveShadow = true; clumpMesh.frustumCulled = false;
  const sg = new SphereGeometry(1, 9, 7); // lumpy shrub: displaced sphere
  const sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) { const k = 1 + 0.18 * Math.sin(sp.getX(i) * 7 + sp.getZ(i) * 5) * Math.cos(sp.getY(i) * 6); sp.setXYZ(i, sp.getX(i) * k, sp.getY(i) * k * 0.7, sp.getZ(i) * k); }
  sg.computeVertexNormals();
  // low evergreen/dormant shrubs along the building base too
  const shrubMesh = new InstancedMesh(sg, sm, Math.max(shrubs.length, 1)); shrubMesh.count = shrubs.length;
  shrubs.forEach((c, i) => { M_.compose(P_.set(c[0], 0.6, c[1]), Q_.identity(), S_.set(c[2], c[2], c[2])); shrubMesh.setMatrixAt(i, M_); shrubMesh.setColorAt(i, new Color(autumnal ? c[3] : 0x3a5a2a)); });
  shrubMesh.castShadow = shrubMesh.receiveShadow = true;
  grp.add(clumpMesh, shrubMesh);
  return grp;
}
const E_ = new Euler(), Q_ = new Quaternion(), M_ = new Matrix4(), P_ = new Vector3(), S_ = new Vector3();
