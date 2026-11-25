// Rivet hammer: a procedural cross-peen riveting hammer used as the third (melee) weapon.
// Steel head with a chamfered flat face and a cross peen, a handle wrapped in black and old-gold bands with grip tape
// at the hand, and a gold ferrule and pommel cap. Built in code (no external asset). The handle runs along the pistol
// grip axis so the right hand can reuse the pistol's solved grip pose (with the index finger curled round the handle).
import * as THREE from 'three';

const GOLD = '#CFB991';
const T = { windup: 0.13, strike: 0.09, follow: 0.12, recover: 0.26 };
const T_HIT = T.windup + T.strike * 0.85; // contact moment
const T_END = T.windup + T.strike + T.follow + T.recover;

// swing keys for the pivot (rad / metres, pivot-local): rest -> windup -> strike -> follow -> rest
const K = {
  rest: { r: [0, 0, 0], p: [0, 0, 0] },
  windup: { r: [0.6, -0.3, -0.2], p: [0.04, 0.07, 0] },
  strike: { r: [-0.6, 0.05, 0.35], p: [-0.1, 0.2, -0.15] },
  follow: { r: [-1.2, 0.1, 0.35], p: [-0.1, 0.15, -0.14] },
};

const easeIn = (t) => t * t * t;
const easeOut = (t) => 1 - (1 - t) ** 3;
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

function gripTexture() {
  const W = 256,
    H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const bump = document.createElement('canvas');
  bump.width = W;
  bump.height = H;
  const cx = cv.getContext('2d'),
    bx = bump.getContext('2d');
  const img = cx.createImageData(W, H),
    bim = bx.createImageData(W, H);
  const tapeTop = Math.round(H * 0.47); // rows below this are grip tape (row 0 is the top of the handle)
  const gold = [207, 185, 145];
  let seed = 1337;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let c, b;
      if (y < tapeTop) {
        // helical black / gold wrap, seamless round the handle (integer number of turns per u)
        const ph = (y / 46 + (x / W) * 2) % 1;
        const isGold = ph < 0.32;
        const edge = Math.min(Math.abs(ph - 0.32), ph, 1 - ph) * 46; // distance to a band edge, rows
        const n = 0.9 + rnd() * 0.1;
        c = isGold ? gold.map((v) => v * n) : [16 * n, 16 * n, 17 * n];
        b = edge < 1.4 ? 70 : isGold ? 200 : 170;
      } else {
        // grip tape: black grit with thin gold pinstripes spiralling the other way
        const ph = (y / 60 - (x / W) * 3 + 10) % 1;
        const stripe = ph < 0.05;
        const g = rnd();
        const n = 0.75 + g * 0.5;
        c = stripe ? gold.map((v) => v * 0.85 * n) : [12 * n, 12 * n, 13 * n];
        b = 110 + g * 120;
        if (y < tapeTop + 6) (c = [8, 8, 8]), (b = 60); // tape edge
      }
      img.data[i] = c[0];
      img.data[i + 1] = c[1];
      img.data[i + 2] = c[2];
      img.data[i + 3] = 255;
      bim.data[i] = bim.data[i + 1] = bim.data[i + 2] = b;
      bim.data[i + 3] = 255;
    }
  cx.putImageData(img, 0, 0);
  bx.putImageData(bim, 0, 0);
  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const bumpMap = new THREE.CanvasTexture(bump);
  bumpMap.anisotropy = 8;
  return { map, bumpMap };
}

function headGeometry() {
  // side profile in (z, y): face end at -z, cross peen tapering to a horizontal edge at +z, cheeks round the eye
  const pts = [
    [-0.034, -0.012],
    [-0.014, -0.0128],
    [-0.0095, -0.0158],
    [0.0095, -0.0158],
    [0.0155, -0.0122],
    [0.0645, -0.0026],
    [0.0672, 0],
    [0.0645, 0.0026],
    [0.0155, 0.0122],
    [0.0095, 0.0158],
    [-0.0095, 0.0158],
    [-0.014, 0.0128],
    [-0.034, 0.012],
  ];
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const depth = 0.019;
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.0018, bevelSize: 0.0012, bevelSegments: 2, curveSegments: 4 });
  g.translate(0, 0, -depth / 2);
  g.rotateY(-Math.PI / 2); // shape x -> z, extrusion -> x
  g.computeVertexNormals();
  return g;
}

/**
 * d: the I5 rig context {G, S, arms}; h: helpers from hands.js {holds, ol, di, tn, Ot, Un, motion}.
 * Returns a rig compatible with hands.js I5 (same fields as the rifle / pistol rigs) plus swing().
 */
export function makeHammer(d, h) {
  const G = d.G,
    S = d.S;
  const gd = h.holds.shapes.gripDim;
  const c = new THREE.Vector3().fromArray(gd.c);
  const root = new THREE.Group();
  root.name = 'viewmodel-hammer';
  const P0 = c.clone().add(new THREE.Vector3(0, -0.05, 0.15)); // swing pivot: wrist / forearm
  const pivot = new THREE.Group();
  pivot.position.copy(P0);
  root.add(pivot);
  const tool = new THREE.Group();
  tool.position.copy(c).sub(P0);
  tool.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -gd.rake);
  pivot.add(tool);

  const tex = gripTexture();
  const mats = {
    head: new THREE.MeshStandardMaterial({ name: 'hammer_steel', color: 0x6b6e72, metalness: 1, roughness: 0.42 }),
    strike: new THREE.MeshStandardMaterial({ name: 'hammer_polished', color: 0xb9bcc0, metalness: 1, roughness: 0.22 }),
    grip: new THREE.MeshStandardMaterial({ name: 'hammer_wrap', map: tex.map, bumpMap: tex.bumpMap, bumpScale: 1.2, roughness: 0.82, metalness: 0 }),
    ferrule: new THREE.MeshStandardMaterial({ name: 'hammer_ferrule', color: GOLD, metalness: 1, roughness: 0.35 }),
  };
  const add = (name, geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.name = name;
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    m.frustumCulled = false;
    tool.add(m);
    return m;
  };
  const rx = gd.hw * 0.95,
    rz = gd.hd * 0.8;
  const yBot = -gd.hl - 0.03,
    yHead = gd.hl + 0.15,
    yTop = yHead + 0.012;
  // handle: tapered elliptical cylinder, wrap texture runs bottom (tape) to top (bands)
  const hg = new THREE.CylinderGeometry(0.82, 1, yTop - yBot, 32, 8);
  hg.scale(rx, 1, rz);
  hg.translate(0, (yTop + yBot) / 2, 0);
  add('hammer_grip', hg, mats.grip);
  // pommel cap and collar (ferrule) under the head
  const cap = new THREE.CylinderGeometry(1.02, 0.9, 0.008, 32);
  cap.scale(rx, 1, rz);
  add('hammer_ferrule', cap, mats.ferrule, 0, yBot - 0.004, 0);
  const col = new THREE.CylinderGeometry(0.86, 0.9, 0.012, 32);
  col.scale(rx, 1, rz);
  add('hammer_ferrule', col, mats.ferrule, 0, yHead - 0.022, 0);
  // head
  add('hammer_head', headGeometry(), mats.head, 0, yHead, 0);
  // flat striking face (chamfered cylinder, axis z) and the polished peen edge
  const face = new THREE.CylinderGeometry(0.0145, 0.0145, 0.013, 32);
  face.rotateX(Math.PI / 2);
  add('hammer_strike', face, mats.strike, 0, yHead, -0.0405);
  const cham = new THREE.CylinderGeometry(0.0128, 0.0145, 0.0025, 32);
  cham.rotateX(-Math.PI / 2);
  add('hammer_strike', cham, mats.strike, 0, yHead, -0.0482);
  add('hammer_strike', new THREE.BoxGeometry(0.0225, 0.0016, 0.004), mats.strike, 0, yHead, 0.0662);
  // wedge on top of the eye
  add('hammer_head', new THREE.BoxGeometry(0.004, 0.0015, 0.016), mats.head, 0, yHead + 0.0166, 0);

  // a dummy flash so the shared firing code can poke its uniforms (never shown)
  const flash = new THREE.Object3D();
  flash.visible = false;
  flash.material = { uniforms: { uSeed: { value: 0 }, uJet: { value: 0 }, uInt: { value: 0 }, uHeat: { value: 0 } } };

  // hand: the pistol grip pose, index finger curled like the middle finger (a fist round the handle)
  const gripPose = Float32Array.from(h.holds.grip.pose);
  for (let k = 0; k < 4; k++) gripPose[4 + k] = gripPose[8 + k];
  const relaxed = h.di.relaxed;

  const zero = { p: [0, 0, 0], r: [0, 0, 0] };
  const HIP = { p: [0.17, -0.18, -0.55], r: [0.15, 0.25, 0.2] };
  const pose = {
    name: 'hammer',
    HIP,
    ADS: HIP,
    SPRINT: { p: [-0.02, -0.06, 0.05], r: [-0.4, 0.35, 0.15] },
    SPRINT_ARC: zero,
    RELOAD: zero,
    RACK: zero,
  };

  let t = -1, // swing clock (-1 idle)
    hit = false,
    queued = false,
    debugT = -1;
  const e = new THREE.Euler(),
    qa = new THREE.Quaternion(),
    qb = new THREE.Quaternion(),
    va = new THREE.Vector3(),
    vb = new THREE.Vector3();
  const lerp3 = (a, b, k, out) => out.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
  function keyAt(tt) {
    let a, b, k;
    if (tt < T.windup) (a = K.rest), (b = K.windup), (k = easeOut(tt / T.windup));
    else if (tt < T.windup + T.strike) (a = K.windup), (b = K.strike), (k = easeIn((tt - T.windup) / T.strike));
    else if (tt < T.windup + T.strike + T.follow) (a = K.strike), (b = K.follow), (k = easeOut((tt - T.windup - T.strike) / T.follow));
    else (a = K.follow), (b = K.rest), (k = smooth(clamp01((tt - T.windup - T.strike - T.follow) / T.recover)));
    lerp3(a.r, b.r, k, va);
    lerp3(a.p, b.p, k, vb);
  }
  function applyPivot(tt) {
    if (tt < 0) {
      pivot.quaternion.identity();
      pivot.position.copy(P0);
      return;
    }
    keyAt(tt);
    pivot.quaternion.setFromEuler(e.set(va.x, va.y, va.z, 'YXZ'));
    pivot.position.copy(P0).add(vb);
  }

  // short-range cone check in front of the eye: centre ray plus a ring of rays ~7 degrees out
  const dir = new THREE.Vector3(),
    o = new THREE.Vector3(),
    tmp = new THREE.Vector3();
  const OFFS = [
    [0, 0],
    [0.12, 0],
    [-0.12, 0],
    [0, 0.1],
    [0, -0.12],
    [0.09, -0.08],
    [-0.09, -0.08],
  ];
  function strike() {
    const cam = G.camera,
      pl = G.player;
    o.copy((pl && pl.eye) || cam.position);
    const range = rig.def.range;
    let best = null;
    for (const [ox, oy] of OFFS) {
      tmp.set(ox, oy, -1).normalize().applyQuaternion(cam.quaternion);
      let wall = null;
      try {
        wall = G.physics.raycast(o, tmp, range);
      } catch {}
      let en = null;
      try {
        en = G.enemies.raycast(o, tmp, wall ? wall.dist : range);
      } catch {}
      if (en && (!best || en.dist < best.dist)) (best = en), dir.copy(tmp);
    }
    if (!best) dir.set(0, 0, -1).applyQuaternion(cam.quaternion);
    let res = null;
    try {
      res = G.combat.playerShot(o, dir, { damage: rig.def.damage, range: range + (best ? 0.6 : 0), impulse: 1.6 });
    } catch {}
    if (res && res.point) {
      try {
        G.audio.play('shell_bounce_metal', { pos: res.point, gain: 1.5, pitch: 0.55 });
        G.audio.play('reload_magout', { pos: res.point, gain: 1.1, pitch: 0.62 });
      } catch {}
      S.kP.v -= 1.6;
      S.bump.v += 0.25;
      pl && pl.addShake && pl.addShake(res.enemy ? 0.3 : 0.2);
      G.events.emit('weapon:meleeHit', { point: res.point, enemy: res.enemy || null, killed: !!res.killed });
    }
    rig.lastHit = res;
    return res;
  }

  let tris = 0,
    meshes = 0;
  root.traverse((m) => {
    if (m.isMesh) {
      meshes++;
      tris += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
    }
  });

  const rig = {
    id: 'hammer',
    name: 'Rivet Hammer',
    root,
    flash,
    muzzle: [0, 0.05, -0.2],
    eject: [0, 0.05, -0.1],
    sight: [0, 0, 0],
    info: { tris: Math.round(tris), meshes },
    slot: { id: 'hammer', name: 'Rivet Hammer', ammo: 1, magSize: 1, reserve: 1 / 0 },
    def: {
      melee: !0,
      magSize: 1,
      reserve: 1 / 0,
      rpm: 100,
      damage: 70,
      range: 2.2,
      auto: !1,
      adsTime: 0.2,
      inspect: !1,
      flashLight: 0,
      flashScale: 0,
      smoke: !1,
      spread: { hip: 0.01, ads: 0.01, moveHip: 0, moveAds: 0, bloomHip: 0, bloomAds: 0, air: 0, crouch: 0, shot: 0, decay: 3 },
    },
    views: [pose],
    view: 0,
    pose,
    setView() {},
    motion: h.motion,
    mats,
    keys: K,
    get swinging() {
      return t >= 0;
    },
    /** start a swing; returns false while one is already in its strike half */
    swing() {
      if (t >= 0 && t < T_END - T.recover * 0.5) return (queued = t > T_HIT), !1;
      t = 0;
      hit = false;
      queued = false;
      G.events.emit('weapon:melee', { weapon: 'hammer' });
      return !0;
    },
    /** hold the swing at a fixed time for screenshots (no hits); -1 releases */
    debugSwing(tt) {
      debugT = tt == null ? -1 : +tt;
      applyPivot(debugT);
    },
    reloadTime: () => 0.01,
    reset() {
      t = -1;
      hit = false;
      queued = false;
      applyPivot(debugT);
    },
    cancelReload() {},
    reload() {},
    endReload() {},
    shot() {},
    recoil() {},
    parts(dt) {
      if (debugT >= 0) return applyPivot(debugT);
      if (t < 0) return applyPivot(-1);
      t += dt;
      if (!hit && t >= T_HIT) (hit = true), strike();
      if (t >= T_END) {
        t = -1;
        if (queued) rig.swing();
      }
      applyPivot(t);
    },
    armTargets(a, dt) {
      // right hand: the grip pose, carried by the swing pivot
      tool.updateMatrix();
      pivot.updateMatrix();
      qa.copy(pivot.quaternion).multiply(tool.quaternion);
      qb.copy(tool.quaternion).invert();
      // grip p/q are in pistol rig space == tool's parent space at rest (tool rotation is the grip rake),
      // so express them relative to the tool's rest frame and re-apply the live pivot
      a.r.p.copy(h.holds.grip.p).sub(c).applyQuaternion(qb).applyQuaternion(qa).add(tmp.copy(tool.position).applyQuaternion(pivot.quaternion)).add(pivot.position);
      a.r.q.copy(qa).multiply(qb).multiply(h.holds.grip.q);
      a.r.pose.set(gripPose);
      a.r.trig = 0;
      const sp = Math.min(1, Math.max(0, S.spV.x));
      a.r.pole.fromArray(h.ol.poleR).lerp(tmp.fromArray(h.ol.sprintPoleR), sp);
      a.r.sh.fromArray(h.ol.shR).lerp(tmp.fromArray(h.ol.sprintShR), sp);
      // left hand: relaxed, down out of view
      a.l.p.set(-0.2, -0.42, 0.22);
      a.l.q.identity();
      a.l.pose.set(relaxed);
      a.l.trig = 0;
      a.l.pole.fromArray(h.ol.poleL);
      a.l.sh.fromArray(h.ol.shL);
    },
    snapArms() {},
    setLocked() {},
    get locked() {
      return !1;
    },
  };
  return rig;
}
