// Campus level: builds the Saltline level object from a FolkTown ZoneData (data/zones/*.json).
// Buildings = extruded footprints (merged per 64 m chunk) + polygon-prism colliders in the physics grid.
// Optional sibling modules (ground.js, vegetation.js, landmarks.js, owned by other workers) are used only if present:
//   export function build(G, zone, root) -> void | Object3D   (called after the base level is assembled)
import { BufferGeometry, BufferAttribute, ExtrudeGeometry, Group, InstancedMesh, Matrix4, Mesh, PlaneGeometry, Shape, CylinderGeometry, Vector3 } from 'three';
import { Kn, Z0 } from '../game/common.js';

const CHUNK = 64;
const optional = import.meta.glob('./{ground,vegetation,landmarks}.js', { eager: true });

export async function fetchZone(name = 'purdue-mall') {
  return (await import(`../../../../data/zones/${name}.json`)).default;
}

// Pure data prep (no THREE objects): flat polygons, AABBs, a drop of degenerate rings.
export function loadCampus(zone) {
  const b = zone.bounds;
  const footprints = [];
  for (const c of zone.colliders) {
    if (!c.poly || c.poly.length < 3) continue;
    const poly = new Array(c.poly.length * 2);
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    c.poly.forEach(([x, z], i) => {
      poly[i * 2] = x;
      poly[i * 2 + 1] = z;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    });
    const [fx, fz] = c.poly[0], [lx, lz] = c.poly[c.poly.length - 1];
    if (fx === lx && fz === lz) poly.length -= 2; // tolerate closed rings
    footprints.push({ id: c.id, poly, base: c.baseY, top: Math.max(c.topY, c.baseY + 0.5), minX, maxX, minZ, maxZ });
  }
  return {
    zone,
    bounds: b,
    size: { x: b.maxX - b.minX, z: b.maxZ - b.minZ },
    center: { x: (b.minX + b.maxX) / 2, z: (b.minZ + b.maxZ) / 2 },
    footprints,
    trees: zone.props,
    spawns: zone.spawns,
  };
}

// Extrude one footprint; returns {caps, sides} float arrays in world space (x, y up, z).
function extrude(f) {
  const shape = new Shape();
  for (let i = 0; i < f.poly.length; i += 2) {
    // shape y = -z so the (x, y, z) -> (x, z, -y) rotation below keeps winding
    i ? shape.lineTo(f.poly[i], -f.poly[i + 1]) : shape.moveTo(f.poly[i], -f.poly[i + 1]);
  }
  const g = new ExtrudeGeometry(shape, { depth: f.top - f.base, bevelEnabled: false });
  const p = g.attributes.position.array, nrm = g.attributes.normal.array, uv = g.attributes.uv.array;
  const out = { caps: [], sides: [] };
  g.groups.forEach((grp) => {
    const dst = grp.materialIndex === 0 ? out.caps : out.sides;
    for (let v = grp.start; v < grp.start + grp.count; v++)
      dst.push(p[v * 3], f.base + p[v * 3 + 2], -p[v * 3 + 1], nrm[v * 3], nrm[v * 3 + 2], -nrm[v * 3 + 1], uv[v * 2], uv[v * 2 + 1]);
  });
  g.dispose();
  return out;
}

function toGeometry(floats) {
  const a = new Float32Array(floats), n = a.length / 8;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    pos.set(a.subarray(i * 8, i * 8 + 3), i * 3);
    nor.set(a.subarray(i * 8 + 3, i * 8 + 6), i * 3);
    uv.set(a.subarray(i * 8 + 6, i * 8 + 8), i * 2);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('normal', new BufferAttribute(nor, 3));
  g.setAttribute('uv', new BufferAttribute(uv, 2));
  g.computeBoundingSphere();
  return g;
}

export function buildBuildings(G, data, root) {
  const chunks = new Map();
  for (const f of data.footprints) {
    let e;
    try { e = extrude(f); } catch (err) { console.warn('[campus] bad footprint', f.id, err); continue; }
    const key = `${Math.floor((f.minX + f.maxX) / 2 / CHUNK)},${Math.floor((f.minZ + f.maxZ) / 2 / CHUNK)}`;
    const c = chunks.get(key) || { caps: [], sides: [] };
    for (const k of ['caps', 'sides']) for (const v of e[k]) c[k].push(v);
    chunks.set(key, c);
  }
  const wall = G.mats.get('brick'), roof = G.mats.get('concrete_dirty');
  let tris = 0;
  for (const c of chunks.values()) {
    for (const [k, m] of [['sides', wall], ['caps', roof]]) {
      if (!c[k].length) continue;
      const mesh = new Mesh(toGeometry(c[k]), m);
      mesh.castShadow = mesh.receiveShadow = true;
      root.add(mesh);
      tris += c[k].length / 24;
    }
  }
  return { chunks: chunks.size, tris };
}

export function addCollision(physics, data) {
  for (const f of data.footprints) physics.addPrism(f.poly, f.base, f.top, { surface: 'concrete', noNav: true });
  for (const t of data.trees) {
    const r = t.radius;
    physics.addBox([t.x - r, t.baseY, t.z - r], [t.x + r, t.topY, t.z + r], { surface: 'wood', noNav: true });
  }
}

// Keep the sun's shadow frustum (fixed size) centred on the player, snapped to shadow texels so it does not shimmer.
export function makeSunFollow(G, centerY) {
  const sun = G.render && G.render.sun;
  if (!sun) return () => {};
  const d = Z0.dir.clone().normalize();
  const right = new Vector3().crossVectors(d.clone().negate(), new Vector3(0, 1, 0)).normalize(); // light camera right
  const up = new Vector3().crossVectors(right, d.clone().negate()).normalize();
  const c = new Vector3();
  return () => {
    const cam = sun.shadow.camera, p = G.player && G.player.pos;
    if (!p) return;
    const texel = (cam.right - cam.left) / (sun.shadow.mapSize.x || 2048);
    c.set(p.x, centerY, p.z);
    const sr = Math.round(c.dot(right) / texel) * texel - c.dot(right);
    const su = Math.round(c.dot(up) / texel) * texel - c.dot(up);
    c.addScaledVector(right, sr).addScaledVector(up, su);
    sun.target.position.copy(c);
    sun.position.copy(c).addScaledVector(d, 200);
    sun.target.updateMatrixWorld(true);
    sun.updateMatrixWorld(true);
  };
}

export async function buildCampus(G, zone) {
  zone = zone || (await fetchZone(G.params.zone || 'purdue-mall'));
  const data = loadCampus(zone);
  const { bounds: b, size, center } = data;
  const root = new Group();
  root.name = 'level';
  G.scene.add(root);

  // physics world: flat ground, no sea, zone-sized bounds
  Object.assign(Kn, { groundY: 0, seaY: -300, quayX: 1e9 });
  Kn.min.set(b.minX, 0, b.minZ);
  Kn.max.set(b.maxX, 80, b.maxZ);
  G.physics.bounds.min.copy(Kn.min);
  G.physics.bounds.max.copy(Kn.max);
  G.physics.resetGrid();

  // ground: one plane at zone size, UVs in metres (same convention as the harbour's fg() planes)
  const gg = new PlaneGeometry(size.x, size.z).rotateX(-Math.PI / 2);
  const uv = gg.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * size.x, uv.getY(i) * size.z);
  const ground = new Mesh(gg, G.mats.get('concrete'));
  ground.position.set(center.x, 0, center.z);
  ground.receiveShadow = true;
  root.add(ground);

  const stats = buildBuildings(G, data, root);
  addCollision(G.physics, data);

  const hasVeg = !!optional['./vegetation.js'];
  if (!hasVeg && data.trees.length) {
    // stand-in trunks until vegetation.js exists
    const geo = new CylinderGeometry(1, 1, 1, 8).translate(0, 0.5, 0);
    const im = new InstancedMesh(geo, G.mats.get('steel_dark'), data.trees.length);
    const m = new Matrix4();
    data.trees.forEach((t, i) => im.setMatrixAt(i, m.makeScale(t.radius, t.topY - t.baseY, t.radius).setPosition(t.x, t.baseY, t.z)));
    im.castShadow = im.receiveShadow = true;
    im.frustumCulled = false;
    root.add(im);
  }
  for (const mod of Object.values(optional)) {
    try { mod.build && mod.build(G, zone, root); } catch (e) { console.error('[campus] optional module failed', e); }
  }

  const s0 = data.spawns[0] || { x: center.x, z: center.z, yaw: 0 };
  const follow = makeSunFollow(G, 21);
  return {
    root,
    campus: data,
    playerStart: { pos: new Vector3(s0.x, 0, s0.z), yaw: s0.yaw || 0 },
    spawns: data.spawns,
    objectives: [],
    extraction: null,
    enemySpawns: [], // shortcut: nav grid is still harbour-sized, bots need a campus nav pass
    zones: [],
    interiorBoxes: [],
    cinematicPath: [],
    coverPoints: [],
    skylights: [],
    shedLights: [],
    stats: { ...stats, buildings: data.footprints.length, props: data.trees.length },
    placed: [],
    explosives: [],
    groundSurfaceAt: () => 'concrete',
    update() {
      follow();
      if (G.campusTick) { const t = performance.now() / 1000; for (const f of G.campusTick) f(t); }
    },
  };
}
