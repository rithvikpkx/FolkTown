// ?walk=1: the 'mall-union' campus region (Bell Tower origin; region.js massing + hotspot modules), walk-only, to judge visual fidelity.
// Hooks: boot.js (quality/input/level/player/game swaps when params.walk) and campus/index.js (G.walk options).
// Reuses buildCampus (ground, grass, trees, facades, Bell Tower, sun-follow); everything else (weapons, bots, HUD, menus) is stubbed in boot.
// Pilot data: ortho.jpg is blended into the ground beyond ~7 m (ground.js opts.ortho); LiDAR roof shapes/plant boxes of WALC from data/pilot/roofs.json.
import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, TextureLoader, LinearMipmapLinearFilter, Vector3 } from 'three';
import { BELLTOWER_HALF } from './belltower.js';
import { fetchZone, buildCampus } from './index.js';
import { buildWalc } from './walc.js';
import { buildContext } from './env/context.js';
import { getDecals } from './ground.js';
import { buildFurniture, buildUnderstory } from './env/furniture.js';
import { vegMode } from './vegetation.js';
import roofs from '../../../../data/pilot/roofs.json';
import { applyEarly, installSky } from './env/sky.js';
import { S as SEASON } from './env/season.js';
import { buildPlaza, inPlaza, plazaFloor, plazaTrees } from './env/plaza.js';
import { loadBellTowerScan, SCAN_CREDIT } from './env/belltower-scan.js';
import { addRoofs } from './env/roofs.js';
import { loadFacadePhotos } from './facades.js';
import { fetchRegion, loadHotspots, massingOpts, addHips, regionSolids } from './region.js';

const TOWER = (typeof location !== 'undefined' && /[?&]tower=(scan|code)/.exec(location.search)?.[1]) || 'code'; // ?tower=scan|code; code wins the comparison (docs/assets.md)

// sun/fog constants are cloned by render init, so they must change at import time, and only in walk mode
if (typeof location !== 'undefined' && (import.meta.env.VITE_WALK ? !/[?&]walk=0/.test(location.search) : /[?&]walk=(?!0)/.test(location.search))) applyEarly();

export const BOX = { minX: -50, maxX: 160, minZ: -70, maxZ: 50 }; // the detailed WALC/plaza box (furniture), inside the ortho (x -50..190, z -200..50)
export const REGION = { minX: -200, maxX: 320, minZ: -350, maxZ: 365 }; // walkable 'mall-union' zone (ZONE_BBOX in map-tools)
const EDGE = 14; // soft boundary: walking slows to a crawl over the last EDGE metres
const KEEP = ['way/301837711', 'way/508846031']; // Bell Tower, WALC: every other building is clipped
const BASE = import.meta.env.BASE_URL + 'campus/';
const EYE = 1.7, R = 0.4;

export const walkQuality = (q) => ({ ...q, shadow: 6144, tex: 2048, ao: true, bloom: true, msaa: 4, scale: 1 });

const inBox = (x, z) => x > BOX.minX && x < BOX.maxX && z > BOX.minZ && z < BOX.maxZ;
const inRegion = (x, z) => x > REGION.minX && x < REGION.maxX && z > REGION.minZ && z < REGION.maxZ;

function loadOrtho() {
  return fetch(BASE + 'pilot/ortho.json').then((r) => r.json()).then((j) => {
    const t = new TextureLoader().load(BASE + 'pilot/' + j.image);
    t.colorSpace = SRGBColorSpace; t.flipY = false; t.anisotropy = 8; t.minFilter = LinearMipmapLinearFilter;
    const b = j.bounds;
    return { texture: t, xMin: b.xMin, zMin: b.zMin, w: b.xMax - b.xMin, h: b.zMax - b.zMin, fit: j.fit };
  }).catch(() => null); // pilot data absent: PBR ground only
}

// far-field photo albedo (tools/google-roofs.py): canopy and cast shadows removed, exposure matched to the PBR grass
function loadFar() {
  return fetch(BASE + 'walk/ground-far.json').then((r) => r.json()).then((j) => {
    const t = new TextureLoader().load(BASE + 'walk/ground-far.jpg');
    t.colorSpace = SRGBColorSpace; t.flipY = false; t.anisotropy = 8; t.minFilter = LinearMipmapLinearFilter;
    return { texture: t, xMin: j.xMin, zMin: j.zMin, w: j.w, h: j.h };
  }).catch(() => null);
}

// lamps and benches along the footways, a few metres off the path
function furniture(G, boxPaths) {
  const g = new Group(), dark = G.mats.get('steel_dark'), wood = G.mats.get('wood') || dark;
  const pole = new CylinderGeometry(0.06, 0.09, 4.2, 8).translate(0, 2.1, 0);
  const head = new BoxGeometry(0.36, 0.5, 0.36).translate(0, 4.3, 0);
  const lampMat = new MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffe2a8, emissiveIntensity: 0.6 });
  const seat = new BoxGeometry(1.8, 0.07, 0.5).translate(0, 0.46, 0), back = new BoxGeometry(1.8, 0.5, 0.06).translate(0, 0.8, -0.24);
  const leg = new BoxGeometry(0.08, 0.46, 0.45);
  let n = 0;
  for (const p of paths) {
    if (!['footway', 'pedestrian', 'path', 'cycleway'].includes(p.hw)) continue;
    let acc = 0, side = 1;
    for (let i = 0; i + 1 < p.points.length; i++) {
      const [x0, z0] = p.points[i], [x1, z1] = p.points[i + 1], L = Math.hypot(x1 - x0, z1 - z0);
      for (let s = 0; s < L; s += 2) {
        acc += 2;
        if (acc < 28) continue;
        acc = 0; side = -side; n++;
        const t = s / L, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, nx = -(z1 - z0) / L, nz = (x1 - x0) / L, off = 2.6 * side;
        const px = x + nx * off, pz = z + nz * off;
        if (!inBox(px, pz) || Math.hypot(px, pz) < 8) continue;
        const grp = new Group(); grp.position.set(px, 0, pz);
        if (n % 3) { grp.add(new Mesh(pole, dark), new Mesh(head, lampMat)); }
        else { // bench facing the path
          grp.rotation.y = Math.atan2(-nx * side, -nz * side);
          grp.add(new Mesh(seat, wood), new Mesh(back, wood), new Mesh(leg, dark).translateX(-0.8), new Mesh(leg, dark).translateX(0.8));
        }
        grp.traverse((o) => { if (o.isMesh) { o.castShadow = o.material !== lampMat; o.receiveShadow = true; } });
        g.add(grp);
      }
    }
  }
  return g;
}

export async function buildWalk(G) {
  const zone = await fetchRegion();
  const hot = await loadHotspots(G, zone, KEEP);
  const paths = zone.paths, boxPaths = paths.filter((p) => p.points.some(([x, z]) => inBox(x, z)));
  const walc = roofs.buildings.find((b) => b.id === 'way/508846031');
  const skip = [KEEP[1], ...hot.replaced]; // massing skips WALC (walc.js) and every footprint a hotspot module replaced
  const colliders = zone.colliders.filter((c) => !(TOWER === 'scan' && c.id === KEEP[0])).map((c) => (c.id === KEEP[1] ? { ...c, topY: walc.eaveH } : c));
  const z = {
    ...zone, bounds: REGION, colliders, paths,
    props: zone.props.filter((t) => !inPlaza(t.x, t.z, 1)).concat(plazaTrees()),
    landmarks: TOWER === 'code' ? { bellTower: zone.landmarks.bellTower, fountain: zone.landmarks.fountain } : {}, // scan mode draws its own tower below
  };
  vegMode.walk = true;
  const ortho = await loadOrtho(), far = await loadFar();
  G.bellShaftTexture = await new Promise((r) => new TextureLoader().load(BASE + 'walk/tex/bell-shaft.jpg', (t) => { t.colorSpace = SRGBColorSpace; t.anisotropy = 8; r(t); }, undefined, () => r(null)));
  G.walk = { ground: { dir: 'walk/', aniso: 16, ortho, far, paveName: 'concrete', paveTile: 2.4, decals: true, leaf: SEASON.leaf, dry: Math.min(1, SEASON.dry * 1.4) }, grass: { step: 0.17, far: 14, dry: SEASON.dry }, facades: { ...massingOpts(zone, skip), photos: /[?&]facades=0/.test(location.search) ? {} : await loadFacadePhotos(BASE + 'facades/') } };
  const level = await buildCampus(G, z);
  level.root.add(await buildWalc(G, colliders.find((c) => c.id === KEEP[1]).poly)); // code-generated WALC (walc.js); facades.js skips it
  hot.groups.forEach((g) => level.root.add(g));
  const hipTris = addHips(zone, level.root, skip);
  addRoofs(zone, level.root, [...skip, ...zone.colliders.filter((c) => c.hip).map((c) => c.id)]); // hip roofs carry the real colour already
  let scanHalf = BELLTOWER_HALF;
  if (TOWER === 'scan') {
    const bt = zone.landmarks.bellTower, t = await loadBellTowerScan(G, [bt.x, 0, bt.z], { rotY: Number(/[?&]trot=(-?[\d.]+)/.exec(location.search)?.[1] || 0), model: /[?&]tex=model/.test(location.search) });
    level.root.add(t.group); scanHalf = t.half; G.walkTower = t;
    console.log('[walk] tower scan tris', t.tris, 'far', t.trisFar);
  }
  try { await installSky(G); } catch (e) { console.error('[walk] sky failed', e); }
  G.walkCrossings = getDecals(z).crossings;
  G.plazaExclude = (x, z) => inPlaza(x, z, 1.5); G.walkFloor = plazaFloor;
  try {
    const fur = buildFurniture(G, z, boxPaths, z.props);
    level.root.add(fur, buildUnderstory(G, z, fur.planters));
    console.log('[walk] furniture', JSON.stringify(fur.counts));
  } catch (e) { console.error('[walk] furniture failed', e); level.root.add(furniture(G, boxPaths)); }
  const plaza = buildPlaza(G, z); level.root.add(plaza);
  // collision shapes: building polygons, tower plinth, tree trunks
  let ctx = { solids: [] };
  if (!/[?&]ctx=0/.test(location.search)) try { ctx = buildContext(G, zone, level.root, { box: REGION, keep: KEEP, ortho, facades: false, centre: [60, 7] }); console.log('[walk] context', JSON.stringify({ ...ctx, solids: ctx.solids.length }), 'massing', JSON.stringify({ ...level.stats, update: undefined, hipTris, hotspots: hot.names, failed: hot.failed })); } catch (e) { console.error('[walk] context failed', e); }
  G.walkSolids = [
    ...regionSolids(zone, [...skip, KEEP[0]], hot),
    ...colliders.filter((c) => c.id === KEEP[1]).map((c) => c.poly),
    [[-scanHalf, -scanHalf], [scanHalf, -scanHalf], [scanHalf, scanHalf], [-scanHalf, scanHalf]],
    ...plaza.solids,
  ];
  G.walkTrees = z.props;
  return level;
}

// push a circle out of a polygon (inside or within R of an edge)
function pushOut(pos, poly) {
  let inside = false, best = Infinity, bx = 0, bz = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j], [cx, cz] = poly[i];
    if ((az > pos.z) !== (cz > pos.z) && pos.x < ((cx - ax) * (pos.z - az)) / (cz - az) + ax) inside = !inside;
    const dx = cx - ax, dz = cz - az, t = Math.max(0, Math.min(1, ((pos.x - ax) * dx + (pos.z - az) * dz) / (dx * dx + dz * dz || 1)));
    const qx = ax + dx * t, qz = az + dz * t, d = Math.hypot(pos.x - qx, pos.z - qz);
    if (d < best) { best = d; bx = qx; bz = qz; }
  }
  if (!inside && best >= R) return;
  const d = best || 1e-6, k = inside ? -1 : 1; // inside: step to the nearest edge point, then R beyond it
  const nx = (k * (pos.x - bx)) / d, nz = (k * (pos.z - bz)) / d;
  pos.x = bx + nx * R; pos.z = bz + nz * R;
}

export function walkInput() {
  const keys = new Set(), look = { dx: 0, dy: 0 };
  const el = () => document.getElementById('view');
  addEventListener('keydown', (e) => keys.add(e.code));
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  addEventListener('mousemove', (e) => { if (document.pointerLockElement === el()) { look.dx += e.movementX; look.dy += e.movementY; } });
  const hint = Object.assign(document.createElement('div'), { textContent: 'Click to look around  ·  WASD walk  ·  Shift run  ·  Space jump  ·  Esc releases the mouse' + (TOWER === 'scan' ? '  ·  ' + SCAN_CREDIT : '') });
  hint.style.cssText = 'position:absolute;left:50%;bottom:6%;transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:4px;background:rgba(0,0,0,.55);color:#eee;font:13px system-ui,sans-serif;pointer-events:none;transition:opacity 1.5s;white-space:nowrap';
  document.getElementById('app').appendChild(hint);
  const fade = () => (hint.style.opacity = 0);
  setTimeout(fade, 14000);
  document.addEventListener('pointerlockchange', () => document.pointerLockElement && setTimeout(fade, 3000));
  addEventListener('mousedown', () => { try { el().requestPointerLock(); } catch {} });
  return { keys, look, update() {}, endFrame() { look.dx = look.dy = 0; }, requestLock() {}, exitLock() {}, down: () => false, pressed: () => false };
}

export function walkPlayer(G) {
  const p = {
    pos: new Vector3(8, 0, 0), vel: new Vector3(), yaw: -Math.PI / 2, pitch: 0, health: 100, maxHealth: 100, alive: true, onGround: true,
    sprinting: false, crouching: false, ads: 0, speed: 0, eye: new Vector3(8, EYE, 0), forward: new Vector3(1, 0, 0), enabled: true,
    reset() {}, damage() {}, heal() {}, addRecoil() {}, addShake() {}, update() {},
  };
  const cam = G.camera;
  cam.rotation.order = 'YXZ';
  G.game = {
    state: 'playing', start() {},
    update(dt) {
      const { keys, look } = G.input;
      p.yaw -= look.dx * 0.0022; p.pitch = Math.max(-1.5, Math.min(1.5, p.pitch - look.dy * 0.0022));
      const f = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0), r = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
      p.sprinting = keys.has('ShiftLeft') || keys.has('ShiftRight');
      const sp = (p.sprinting ? 7.2 : 3.9) / Math.hypot(f || 0, r || 0, 1e-9) * (f || r ? 1 : 0);
      const s = Math.sin(p.yaw), c = Math.cos(p.yaw);
      // soft edge: the last EDGE metres slow walking to 15% so the world end is felt, not hit
      const e = Math.min(p.pos.x - REGION.minX, REGION.maxX - p.pos.x, p.pos.z - REGION.minZ, REGION.maxZ - p.pos.z), soft = e >= EDGE ? 1 : 0.15 + 0.85 * Math.max(0, e) / EDGE;
      p.pos.x += (-s * f + c * r) * sp * soft * dt; p.pos.z += (-c * f - s * r) * sp * soft * dt;
      p.speed = f || r ? sp / 1 : 0;
      if (p.onGround && keys.has('Space')) { p.vel.y = 5; p.onGround = false; }
      p.vel.y -= 14 * dt; p.pos.y += p.vel.y * dt;
      const fl = G.walkFloor ? G.walkFloor(p.pos.x, p.pos.z) : 0;
      if (p.pos.y <= fl) { p.pos.y = fl; p.vel.y = 0; p.onGround = true; }
      for (let k = 0; k < 2; k++) {
        for (const poly of G.walkSolids || []) pushOut(p.pos, poly);
        for (const t of G.walkTrees || []) {
          const dx = p.pos.x - t.x, dz = p.pos.z - t.z, d = Math.hypot(dx, dz), m = R + (t.radius || 0.3);
          if (d < m) { p.pos.x = t.x + (dx / (d || 1)) * m; p.pos.z = t.z + (dz / (d || 1)) * m; }
        }
      }
      p.pos.x = Math.max(REGION.minX + 0.5, Math.min(REGION.maxX - 0.5, p.pos.x));
      p.pos.z = Math.max(REGION.minZ + 0.5, Math.min(REGION.maxZ - 0.5, p.pos.z));
      p.eye.set(p.pos.x, p.pos.y + EYE, p.pos.z);
      cam.position.copy(p.eye); cam.rotation.set(p.pitch, p.yaw, 0);
      p.forward.set(-s, 0, -c);
    },
  };
  return p;
}
