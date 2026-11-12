import { type PlayerState, WEAPONS, type WeaponId } from '@folktown/shared';
import {
  AdditiveBlending,
  Box3,
  type Camera,
  CanvasTexture,
  DoubleSide,
  Group,
  type Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  PlaneGeometry,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Batch } from '../batch';
import { type MaterialName, type makeMaterials, TILING } from '../materials';
import {
  loadManifest,
  type PartNames,
  type Vec3,
  type WeaponManifest,
  type WeaponVariant,
} from './weapon-assets';

type Mats = Awaited<ReturnType<typeof makeMaterials>>;

/** Where each weapon sits on screen: hip and aimed (camera space, metres), and the flash point. */
interface Pose {
  hip: Vec3;
  ads: Vec3;
  flash: Vec3;
  fov: number;
}
/** Poses of the generated fallback guns; a manifest variant replaces them. */
const FALLBACK: Record<WeaponId, Pose> = {
  rifle: { hip: [0.2, -0.22, -0.36], ads: [0, -0.064, -0.5], flash: [0, 0, -0.84], fov: 52 },
  pistol: { hip: [0.18, -0.2, -0.34], ads: [0, -0.06, -0.42], flash: [0, 0.02, -0.26], fov: 62 },
  shotgun: { hip: [0.2, -0.22, -0.36], ads: [0, -0.064, -0.5], flash: [0, 0, -0.9], fov: 60 },
};
export const HIP_FOV = 70;

interface Part {
  node: Object3D;
  base: Vector3;
  kind: keyof PartNames;
}

/** Swap the generated gun body for the manifest's model; the generated hands stay. On any failure the generated gun stays. */
function loadModel(g: Group, v: WeaponVariant, pose: Pose, parts: Part[]) {
  const old = g.getObjectByName('model');
  if (old) g.remove(old);
  parts.length = 0;
  new GLTFLoader()
    .loadAsync(`${import.meta.env.BASE_URL}${v.url}`)
    .then((gltf) => {
      const o = gltf.scene;
      const root = new Group();
      root.name = 'model';
      root.add(o);
      root.scale.setScalar(v.scale);
      root.rotation.set(...(v.rotation.map((d) => (d * Math.PI) / 180) as Vec3));
      root.position.set(...v.offset);
      for (const c of [...g.children]) if (c.name === 'metal' || c.name === 'polymer') g.remove(c);
      o.traverse((c) => {
        c.frustumCulled = false;
      });
      for (const kind of Object.keys(v.parts ?? {}) as (keyof PartNames)[]) {
        const node = o.getObjectByName(v.parts?.[kind] as string);
        if (node) parts.push({ node, base: node.position.clone(), kind });
        else console.warn(`weapon part "${v.parts?.[kind]}" not found in ${v.url}`);
      }
      pose.hip = v.hip;
      pose.ads = v.ads;
      pose.flash = v.flash;
      pose.fov = v.adsFov;
      g.add(root);
    })
    .catch((e) => console.error(`weapon model ${v.url} failed, using generated gun`, e));
}

/**
 * Gun models generated in code, in "gun space": the bore is the z axis, +s is forward (toward
 * -z), y up, x right. Idea ported from reference/fidelity-test.html (buildGun): a receiver with
 * rail and sights, handguard, barrel, stock, grip and magazine, a gloved left hand forward and a
 * right hand on the grip, sleeves running off the bottom of the screen. Much simplified.
 */
function buildGun(id: WeaponId, mats: Mats): Group {
  const bt = (n: MaterialName) => TILING[n].tile;
  const b: Record<'metal' | 'polymer' | 'fabric', Batch> = {
    metal: new Batch(),
    polymer: new Batch(),
    fabric: new Batch(),
  };
  /** Box from forward distance s0..s1. */
  const bx = (
    k: keyof typeof b,
    s0: number,
    s1: number,
    y0: number,
    y1: number,
    x0: number,
    x1: number,
  ) => b[k].box(x0, y0, -s1, x1, y1, -s0, bt(k));
  const cy = (
    k: keyof typeof b,
    s0: number,
    s1: number,
    y: number,
    x: number,
    r0: number,
    r1 = r0,
  ) => b[k].cyl([x, y, -s0], [x, y, -s1], r0, r1, 14, bt(k));

  if (id === 'rifle') {
    bx('metal', -0.1, 0.16, -0.04, 0.03, -0.022, 0.022); // receiver
    bx('metal', -0.09, 0.45, 0.03, 0.045, -0.011, 0.011); // top rail
    bx('metal', -0.08, -0.05, 0.045, 0.058, -0.008, 0.008); // rear sight
    bx('metal', 0.42, 0.44, 0.045, 0.07, -0.003, 0.003); // front post
    cy('polymer', 0.16, 0.455, 0.0, 0, 0.03, 0.029); // handguard
    cy('metal', 0.45, 0.62, 0.0, 0, 0.0095); // barrel
    cy('metal', 0.6, 0.79, 0.0, 0, 0.02); // suppressor
    bx('polymer', -0.3, -0.1, -0.06, 0.04, -0.02, 0.02); // stock
    bx('polymer', -0.1, -0.05, -0.2, -0.04, -0.017, 0.017); // grip
    bx('metal', 0.04, 0.1, -0.26, -0.04, -0.015, 0.015); // magazine
  } else if (id === 'pistol') {
    bx('metal', -0.08, 0.14, 0.0, 0.04, -0.016, 0.016); // slide
    bx('polymer', -0.08, 0.1, -0.03, 0.0, -0.018, 0.018); // frame
    bx('polymer', -0.08, -0.03, -0.13, -0.03, -0.018, 0.018); // grip
    bx('metal', -0.075, -0.06, 0.04, 0.05, -0.008, 0.008); // rear sight
    bx('metal', 0.12, 0.135, 0.04, 0.05, -0.003, 0.003); // front sight
    cy('metal', 0.14, 0.17, 0.02, 0, 0.007); // barrel tip
  } else {
    bx('metal', -0.1, 0.2, -0.04, 0.035, -0.024, 0.024); // receiver
    cy('metal', 0.2, 0.8, 0.012, 0, 0.016); // barrel
    cy('metal', 0.2, 0.6, -0.02, 0, 0.02); // magazine tube
    bx('polymer', 0.25, 0.5, -0.045, -0.005, -0.03, 0.03); // pump
    bx('polymer', -0.32, -0.1, -0.07, 0.04, -0.02, 0.02); // stock
    bx('polymer', -0.1, -0.05, -0.17, -0.04, -0.017, 0.017); // grip
    bx('metal', 0.78, 0.8, 0.028, 0.045, -0.003, 0.003); // bead
  }

  // hands and sleeves (fabric = glove and sleeve in one, good enough at this size)
  const fore = id === 'rifle' ? 0.3 : id === 'shotgun' ? 0.38 : 0.04;
  if (id !== 'pistol') {
    bx('fabric', fore - 0.06, fore + 0.06, -0.055, 0.045, -0.04, 0.04); // left hand under the handguard
    b.fabric.cyl(
      [-0.02, -0.04, -fore + 0.05],
      [-0.12, -0.7, -fore + 0.12],
      0.04,
      0.06,
      12,
      bt('fabric'),
    );
  }
  bx('fabric', -0.1, -0.03, -0.14, -0.05, -0.03, 0.03); // right hand on the grip
  b.fabric.cyl([0.0, -0.1, 0.0], [0.08, -0.7, 0.12], 0.04, 0.06, 12, bt('fabric'));

  const g = new Group();
  for (const k of ['metal', 'polymer', 'fabric'] as const) {
    const m = b[k].mesh(mats[k] as Material, false);
    m.frustumCulled = false;
    m.name = k;
    g.add(m);
  }
  return g;
}

function flashTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d') as CanvasRenderingContext2D;
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,245,200,1)');
  gr.addColorStop(0.35, 'rgba(255,170,60,0.8)');
  gr.addColorStop(1, 'rgba(255,100,0,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

/** First-person gun, hands, ADS blend, bob, recoil kick, reload dip and muzzle flash. */
export class ViewModel {
  readonly root = new Group();
  private readonly guns = new Map<WeaponId, Group>();
  private readonly flashes = new Map<WeaponId, Mesh>();
  private ads = 0;
  private phase = 0;
  private flashT = 0;
  private lastFov = HIP_FOV;

  constructor(
    mats: Mats,
    private readonly camera: Camera & { fov: number; updateProjectionMatrix(): void },
  ) {
    const fm = new MeshBasicMaterial({
      map: flashTexture(),
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      fog: false,
    });
    for (const id of Object.keys(FALLBACK) as WeaponId[]) {
      const g = buildGun(id, mats);
      const f = new Mesh(new PlaneGeometry(0.28, 0.28), fm);
      this.poses.set(id, { ...FALLBACK[id] });
      f.visible = false;
      g.add(f);
      g.visible = false;
      this.guns.set(id, g);
      this.flashes.set(id, f);
      this.root.add(g);
    }
    camera.add(this.root);
    // ?variant=name previews that variant of every weapon that has it (tuning page)
    const want = new URLSearchParams(globalThis.location?.search).get('variant');
    void loadManifest(import.meta.env.BASE_URL, Object.keys(FALLBACK)).then((m) => {
      this.manifest = m;
      if (m)
        for (const id of this.ids()) this.use(id, want && m[id]?.variants[want] ? want : undefined);
    });
  }

  manifest: WeaponManifest | null = null;
  private readonly poses = new Map<WeaponId, Pose>();
  private readonly parts = new Map<WeaponId, Part[]>();
  private readonly tmp = new Matrix4();

  private ids() {
    return [...this.guns.keys()];
  }

  /** Load a manifest variant (default: the entry's chosen one) onto a weapon. Also used by the tuning page. */
  use(id: WeaponId, variant?: string) {
    const e = this.manifest?.[id];
    const v = e?.variants[variant ?? e.variant];
    if (!v) return;
    const parts: Part[] = [];
    this.parts.set(id, parts);
    loadModel(this.guns.get(id) as Group, v, this.poses.get(id) as Pose, parts);
  }

  /** Tuning aid: the loaded model's bounds in gun space ([min, max]) or null while it loads. */
  measure(id: WeaponId, node?: string): [Vec3, Vec3] | null {
    const g = this.guns.get(id) as Group;
    const m = g.getObjectByName('model');
    const t = node ? m?.getObjectByName(node) : m;
    if (!t) return null;
    g.updateMatrixWorld(true);
    const b = new Box3().setFromObject(t);
    const inv = new Matrix4().copy(g.matrixWorld).invert();
    b.applyMatrix4(inv);
    return [b.min.toArray(), b.max.toArray()];
  }

  /** Slide, bolt and pump kick back with the shot, the magazine drops with the reload. */
  private animateParts(id: WeaponId, kick: number, dip: number) {
    const g = this.guns.get(id) as Group;
    for (const p of this.parts.get(id) ?? []) {
      const par = p.node.parent;
      if (!par) continue;
      // gun-space offset -> the part's parent space
      const d =
        p.kind === 'magazine' ? new Vector3(0, -0.12 * dip, 0) : new Vector3(0, 0, 0.03 * kick);
      this.tmp.copy(par.matrixWorld).invert().multiply(g.matrixWorld);
      const o = new Vector3().applyMatrix4(this.tmp);
      p.node.position.copy(p.base).add(d.applyMatrix4(this.tmp).sub(o));
    }
  }

  /** The player fired this tick. */
  fired() {
    this.flashT = 0.045;
  }

  /** `aiming` is the player's ADS intent; `speed` is horizontal m/s. */
  update(dt: number, me: PlayerState, aiming: boolean) {
    const id = me.weapon;
    for (const [k, g] of this.guns) g.visible = k === id && me.alive;
    const pose = this.poses.get(id) as Pose;
    const reloading = me.reloadLeft > 0;
    const target = aiming && me.alive && !reloading ? 1 : 0;
    this.ads += (target - this.ads) * Math.min(1, dt * 14);
    const a = this.ads;

    const speed = Math.hypot(me.vel.x, me.vel.z);
    this.phase += dt * speed * 1.7;
    const bob = me.onGround ? Math.min(1, speed / 4.5) * (1 - 0.85 * a) : 0;
    const bx = Math.sin(this.phase) * 0.006 * bob;
    const by = Math.abs(Math.cos(this.phase)) * 0.008 * bob;

    let dip = 0;
    if (reloading) {
      const w = WEAPONS[id];
      const p = 1 - me.reloadLeft / (me.ammo[id] <= 0 ? w.reloadTimeEmpty : w.reloadTime);
      dip = Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
    }
    const kick = me.recoilPitch;
    const g = this.guns.get(id) as Group;
    g.position.set(
      pose.hip[0] + (pose.ads[0] - pose.hip[0]) * a + bx,
      pose.hip[1] + (pose.ads[1] - pose.hip[1]) * a + by - dip * 0.14,
      pose.hip[2] + (pose.ads[2] - pose.hip[2]) * a + kick * 1.2,
    );
    g.rotation.set(kick * 1.5 + dip * 0.6 + (me.crouching ? 0 : 0), -0.05 * (1 - a), dip * 0.3);

    const fl = this.flashes.get(id) as Mesh;
    this.flashT = Math.max(0, this.flashT - dt);
    fl.visible = this.flashT > 0;
    fl.rotation.z = Math.random() * 6.28;
    fl.position.set(...pose.flash);
    // the generated sleeves would cover the sights and the model; hide them when aimed
    const hands = g.getObjectByName('fabric');
    if (hands) hands.visible = a < 0.6;
    this.animateParts(id, this.flashT / 0.045, dip);

    const fov = HIP_FOV + (pose.fov - HIP_FOV) * a;
    if (Math.abs(fov - this.lastFov) > 0.01) {
      this.lastFov = fov;
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }
}
