// Iron-sight overlay for a lab GLB: a thin black front post with a bright dot on its tip and a clean rear aperture ring,
// both centred on the ADS eye line. Configured by the "sights" block of weapons.json (gun-space metres, -z forward).
import { BoxGeometry, CircleGeometry, Color, Group, Mesh, MeshBasicMaterial, RingGeometry, Vector3 } from 'three';

const DOT = { gold: '#CFB991', green: '#5CFF7A' };

/** Adds the sight meshes to rig.root and moves every ADS pose so the eye looks down the post. Returns the overlay group. */
export function addIronSights(rig, model, cfg, layer) {
  const eyeY = cfg.eyeY;
  for (const name of cfg.hide || []) {
    const o = model.getObjectByName(name);
    if (o) o.visible = false;
  }
  const g = new Group();
  g.name = 'iron-sights';
  const black = new MeshBasicMaterial({ color: 0x050505 });
  black.name = 'sight_black';
  // the dot stays bright in the HDR buffer, so exposure and the tone curve cannot dull it
  const dot = new MeshBasicMaterial({ color: new Color(cfg.front.color in DOT ? DOT[cfg.front.color] : cfg.front.color).multiplyScalar(cfg.front.glow ?? 2.2) });
  dot.name = 'sight_dot';
  dot.toneMapped = false;
  const add = (geo, mat, x, y, z) => {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    m.frustumCulled = false;
    m.userData.noSkin = true;
    g.add(m);
    return m;
  };
  // front post: rises from the front sight base to the eye line, dot centred on the tip
  const f = cfg.front;
  const postH = eyeY - f.base;
  add(new BoxGeometry(f.width, postH, f.depth ?? 0.003), black, 0, f.base + postH / 2, f.z);
  add(new CircleGeometry(f.dot, 24), dot, 0, eyeY, f.z + (f.depth ?? 0.003) / 2 + 2e-4);
  // rear: a thin dark aperture ring with a fine gold inner edge, on a short stem from the sight base
  const r = cfg.rear;
  add(new RingGeometry(r.inner, r.outer, 48), black, 0, eyeY, r.z);
  const edge = new MeshBasicMaterial({ color: new Color(DOT.gold).multiplyScalar(0.55) });
  edge.name = 'sight_edge';
  add(new RingGeometry(r.inner, r.inner + (r.edge ?? 0.0004), 48), edge, 0, eyeY, r.z + 2e-4);
  if (r.stem) {
    const top = eyeY - r.outer + 3e-4;
    add(new BoxGeometry(r.stemWidth ?? 0.004, top - r.stem, 0.002), black, 0, (top + r.stem) / 2, r.z);
  }
  g.traverse((o) => o.layers.set(layer));
  rig.root.add(g);
  // ADS lines the eye up with (0, eyeY): every view preset of this rig
  for (const v of rig.views || [rig.pose]) if (v && v.ADS) v.ADS.p[1] = -eyeY;
  if (rig.sight) rig.sight[1] = eyeY;
  rig.sightOverlay = { group: g, eyeY, outer: r.outer, front: new Vector3(0, eyeY, f.z), rear: new Vector3(0, eyeY, r.z) };
  return g;
}

/** Screen-space check: where the rear ring centre and the front dot land, in pixels from the screen centre. */
export function sightReport(G, rig) {
  const s = rig && rig.sightOverlay;
  if (!s) return null;
  const cam = G.viewCamera || G.camera;
  rig.root.updateMatrixWorld(true);
  const px = (p) => {
    const v = p.clone().applyMatrix4(rig.root.matrixWorld).project(cam);
    return [+(v.x * innerWidth * 0.5).toFixed(2), +(-v.y * innerHeight * 0.5).toFixed(2)];
  };
  const w = rig.root.matrixWorld;
  const scale = (r) => {
    const a = s.rear.clone().applyMatrix4(w).project(cam);
    const b = s.rear.clone().add(new Vector3(r, 0, 0)).applyMatrix4(w).project(cam);
    return +(Math.abs(b.x - a.x) * innerWidth * 0.5).toFixed(1);
  };
  return { rear: px(s.rear), front: px(s.front), ringPx: scale(s.outer), apertureFrac: +((Math.PI * scale(s.outer) ** 2) / (innerWidth * innerHeight)).toFixed(4) };
}
