// Moonship: the six-wheeled campus delivery robot that replaces Saltline's robot-dog "hound" (internal key stays
// 'hound'). Built in code from the shared primitive builders and merged by the rig into one skinned mesh
// (4 material groups) plus one wordmark decal mesh, so 8 on screen stay cheap.
// Layout (metres, +z forward, ground at y=0): body about 1.0 long, 0.6 wide (0.75 over the wheels),
// lid top at 0.75, whip antenna with an old-gold crescent flag up to about 1.65.
import { Mesh, PlaneGeometry, Shape, ShapeGeometry, SphereGeometry } from 'three';
import { Ei, th, vt } from '../game/common.js';

export const MOONSHIP = {
  stand: 0.36, // body bone height above ground
  wheelR: 0.12, // rolling radius (tyre plus lugs)
  wheelY: 0.118,
  wheelX: 0.335,
  wheelZ: [0.34, 0, -0.34],
  tipX: 0.4, // pivot (outer wheel edge) when it tips over on death
  tipMax: 1.42,
  muzzle: 0.075, // zapper tip ahead of the gun bone
  headR: 0.13, // weak-point sphere round the camera puck
};

const al = Math.PI / 2;
const box = (w, h, d, r = 0.008) => Ei(w, h, d, r);
const at = (g, x, y, z, rx = 0, ry = 0, rz = 0, s = 1) => th(g, { p: [x, y, z], r: [rx, ry, rz], s });
const cylY = (a, b, h, n = 12) => vt(a, b, h, n);
const cylX = (a, b, h, n = 12) => th(vt(a, b, h, n), { r: [0, 0, -al] });
const cylZ = (a, b, h, n = 12) => th(vt(a, b, h, n), { r: [al, 0, 0] });

// vertex-colour multipliers on the shell (armor_white) and metal (gunmetal) materials
const WHITE = [1.1, 1.1, 1.12],
  TUB = [0.075, 0.075, 0.08],
  BLACK = [0.035, 0.035, 0.04],
  GOLD = [0.7, 0.54, 0.31], // old gold #CFB991, linearised
  HUB = [0.5, 0.51, 0.53],
  RUBBER = [0.04, 0.04, 0.045],
  LUG = [0.07, 0.07, 0.075],
  LIT = [1, 1, 1];

// crescent moon in the XY plane (normal +z), horns pointing +x, radius r; k sets the inner curve
function crescent(r, k = 0.45, tilt = -0.35, n = 16) {
  const s = new Shape(),
    c = Math.cos(tilt),
    si = Math.sin(tilt),
    pt = (x, y, first) => (first ? s.moveTo(x * c - y * si, x * si + y * c) : s.lineTo(x * c - y * si, x * si + y * c));
  for (let i = 0; i <= n; i++) {
    const t = al + (Math.PI * i) / n;
    pt(r * Math.cos(t), r * Math.sin(t), i === 0);
  }
  for (let i = n - 1; i > 0; i--) {
    const t = al + (Math.PI * i) / n;
    pt(k * r * Math.cos(t), r * Math.sin(t), false);
  }
  return new ShapeGeometry(s);
}

// Rig is the enemies.js bone/slot builder (class Oh); passed in to keep module imports one-way.
export function buildMoonship(Rig) {
  const M = MOONSHIP,
    e = new Rig();
  e.bone('root', null, 0, 0, 0);
  e.bone('body', 'root', 0, M.stand, 0);
  e.bone('lid', 'body', 0, 0.29, -0.49); // hinge at the rear top edge
  e.bone('head', 'lid', 0, 0.105, 0.84); // camera puck near the lid front
  e.bone('turret', 'body', 0, 0.035, 0.5); // zapper socket in the front face
  e.bone('gun', 'turret', 0, 0, 0);
  e.bone('antenna', 'body', 0.235, 0.2, -0.535);
  e.bone('antennaTip', 'antenna', 0, 0.56, 0);
  e.bone('flag', 'antennaTip', 0, 0.42, 0);
  e.bone('beacon', 'body', -0.2, 0.2, -0.5);
  for (let i = 0; i < 6; i++) e.bone('wheel' + i, 'root', (i % 2 ? -1 : 1) * M.wheelX, M.wheelY, M.wheelZ[i >> 1]);
  const t = (slot, bone, g, c, shade) => e.add(slot, bone, g, c, shade);

  // body: black lower tub, white upper shell, old-gold pinstripe between, dark seam under the lid
  t('shell', 'body', at(box(0.56, 0.21, 0.94, 0.06), 0, -0.115, 0), TUB);
  t('shell', 'body', at(box(0.6, 0.31, 0.98, 0.07), 0, 0.135, 0), WHITE);
  t('shell', 'body', at(box(0.606, 0.022, 0.986, 0.01), 0, -0.012, 0), GOLD);
  t('metal', 'body', at(box(0.595, 0.012, 0.975, 0.006), 0, 0.287, 0), BLACK);
  // front: dark face plate with status lights (lens slot: amber idle, red when hostile), bumper
  t('shell', 'body', at(box(0.46, 0.13, 0.03, 0.025), 0, 0.15, 0.48), BLACK);
  for (const x of [-0.15, 0.15]) t('lens', 'body', at(cylZ(0.022, 0.022, 0.012, 14), x, 0.165, 0.497), LIT, false);
  t('lens', 'body', at(box(0.17, 0.016, 0.008, 0.004), 0, 0.125, 0.496), LIT, false);
  for (const x of [-0.08, 0.08]) t('metal', 'body', at(cylZ(0.012, 0.012, 0.01, 10), x, 0.175, 0.497), HUB);
  t('shell', 'body', at(box(0.5, 0.06, 0.04, 0.02), 0, -0.17, 0.47), BLACK);
  // rear: dark panel, antenna clamp, tail-light housing (the blinking light is the beacon bone)
  t('shell', 'body', at(box(0.4, 0.1, 0.02, 0.01), 0, 0.15, -0.492), BLACK);
  t('shell', 'body', at(box(0.05, 0.12, 0.045, 0.01), 0.235, 0.18, -0.51), BLACK);
  t('metal', 'body', at(cylY(0.016, 0.016, 0.03, 10), 0.235, 0.215, -0.535), BLACK);
  t('glow', 'beacon', at(box(0.07, 0.024, 0.012, 0.004), 0, 0, -0.004), [6, 0.45, 0.12], false);
  // sides: black crescent beside the MOONSHIP wordmark (the wordmark is a separate decal mesh)
  for (const s of [1, -1]) t('shell', 'body', at(crescent(0.065), s * 0.3015, 0.14, 0.31, 0, s * al, 0), BLACK, false);
  // bogie rails and axle stubs carrying the six wheels
  for (const s of [1, -1]) {
    t('metal', 'body', at(box(0.03, 0.045, 0.76, 0.012), s * 0.283, M.wheelY - M.stand, 0), BLACK);
    for (const z of M.wheelZ) t('metal', 'body', at(cylX(0.018, 0.018, 0.04, 8), s * 0.3, M.wheelY - M.stand, z), BLACK);
  }

  // lid: white slab with a domed cap, seam line, front lip, hinge barrels and an old-gold crescent on top
  t('shell', 'lid', at(box(0.6, 0.085, 0.98, 0.04), 0, 0.0425, 0.49), WHITE);
  t('shell', 'lid', at(box(0.54, 0.03, 0.9, 0.014), 0, 0.09, 0.49), WHITE);
  t('metal', 'lid', at(box(0.606, 0.008, 0.986, 0.004), 0, 0.004, 0.49), BLACK);
  t('shell', 'lid', at(box(0.2, 0.025, 0.03, 0.01), 0, 0.03, 0.985), BLACK);
  for (const x of [-0.2, 0.2]) t('metal', 'lid', at(cylX(0.014, 0.014, 0.09, 8), x, 0.01, 0), BLACK);
  t('shell', 'lid', at(crescent(0.07, 0.45, 0.6), 0, 0.1055, 0.3, -al, 0, 0), GOLD, false);

  // camera puck (weak point): black base, smoked dome, forward lens
  t('shell', 'head', at(cylY(0.05, 0.056, 0.04, 16), 0, 0.02, 0), BLACK);
  t('shell', 'head', at(new SphereGeometry(0.044, 14, 7, 0, Math.PI * 2, 0, al), 0, 0.04, 0), [0.12, 0.13, 0.15]);
  t('lens', 'head', at(cylZ(0.014, 0.014, 0.008, 10), 0, 0.055, 0.04), LIT, false);

  // zapper: socket ring on the shell, short nozzle with old-gold coils, glowing tip (flares on telegraph)
  t('shell', 'turret', at(cylZ(0.05, 0.05, 0.02, 16), 0, 0, 0), BLACK);
  t('metal', 'gun', at(cylZ(0.026, 0.03, 0.06, 12), 0, 0, 0.035), BLACK);
  for (const z of [0.03, 0.05]) t('shell', 'gun', at(cylZ(0.032, 0.032, 0.01, 12), 0, 0, z), GOLD);
  t('lens', 'gun', at(cylZ(0.018, 0.018, 0.006, 10), 0, 0, 0.066), LIT, false);

  // whip antenna (two bones so it bends) with an old-gold flag bearing a black crescent on both faces
  t('metal', 'antenna', at(cylY(0.006, 0.008, 0.58, 6), 0, 0.29, 0), BLACK);
  t('metal', 'antennaTip', at(cylY(0.0045, 0.006, 0.52, 6), 0, 0.26, 0), BLACK);
  t('shell', 'antennaTip', at(new SphereGeometry(0.013, 8, 6), 0, 0.525, 0), GOLD);
  t('shell', 'flag', at(cylY(0.009, 0.009, 0.15, 8), 0, 0, 0), GOLD);
  t('shell', 'flag', at(box(0.006, 0.15, 0.24, 0.002), 0, 0, -0.125), GOLD);
  t('shell', 'flag', at(crescent(0.05, 0.45, -0.2), 0.0035, 0, -0.125, 0, al, 0), BLACK, false);
  t('shell', 'flag', at(crescent(0.05, 0.45, -0.2), -0.0035, 0, -0.125, 0, -al, 0), BLACK, false);

  // wheels: tyre, grey hub with black spokes (so the spin reads), old-gold cap, tread lugs
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? -1 : 1,
      b = 'wheel' + i;
    t('shell', b, cylX(0.106, 0.106, 0.075, 18), RUBBER);
    t('shell', b, cylX(0.07, 0.07, 0.079, 14), HUB);
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5;
      t('metal', b, at(box(0.006, 0.07, 0.018, 0.003), s * 0.041, Math.cos(a) * 0.035, Math.sin(a) * 0.035, a, 0, 0), BLACK);
    }
    t('shell', b, cylX(0.022, 0.022, 0.088, 10), GOLD);
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI * 2) / 12;
      t('shell', b, at(box(0.077, 0.016, 0.028, 0.004), 0, Math.cos(a) * 0.108, Math.sin(a) * 0.108, a, 0, 0), LUG);
    }
  }
  return e.build(['shell', 'metal', 'glow', 'lens']);
}

// "MOONSHIP" wordmark on both sides of the shell (canvas label texture from the shared mats system).
export function moonshipWordmark(G, merge) {
  const h = G.mats.label('MOONSHIP', { color: 'black', font: 'sans', distress: 0.08 }),
    w = 0.4,
    ht = Math.min(0.09, w / (h.aspect || 4)),
    a = new PlaneGeometry(w, ht),
    b = new PlaneGeometry(w, ht);
  a.rotateY(al);
  a.translate(0.3025, 0.14, -0.06);
  b.rotateY(-al);
  b.translate(-0.3025, 0.14, -0.06);
  const m = new Mesh(merge([a, b]), h.material);
  m.castShadow = false;
  m.receiveShadow = true;
  return m;
}
