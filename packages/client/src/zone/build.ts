import type { ColliderData, PropData, ZoneData } from '@folktown/shared';
import {
  Color,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  type Material,
  Matrix4,
  type Mesh,
  MeshStandardMaterial,
  Object3D,
  type Scene,
} from 'three';
import { Batch } from '../batch';
import {
  Batches,
  buildFacade,
  buildLowDetail,
  type FacadeStyle,
  type Footprint,
} from '../facade/build';
import { glassMaterial } from '../facade/glass';
import { buildBellTower } from '../landmarks/belltower';
import { buildFountain } from '../landmarks/fountain';
import { type MaterialName, type makeMaterials, TILING } from '../materials';

type Mats = Awaited<ReturnType<typeof makeMaterials>>;

/** Beyond this distance (metres) a building is drawn as a plain Tier 3 extrusion. */
export const NEAR_DISTANCE = 150;
/** Hysteresis so a building at the threshold does not flip every check. */
const NEAR_HYST = 15;

/** Where the landmarks stand (world metres). The Bell Tower is the map origin, south of the zone. */
export const LANDMARKS = {
  bellTower: [0, 0, 0] as [number, number, number],
  fountain: { x: 0, z: -165 },
};

/** Collider rings are open, either winding; the facade code orients them itself. */
export function footprintOf(c: ColliderData): Footprint {
  return { outer: c.poly.map(([x, z]) => [x, z] as [number, number]) };
}

/** Deterministic wall choice so the same building always gets the same look. */
export function wallFor(id: string): 'brick' | 'limestone' {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h % 4 === 0 ? 'limestone' : 'brick';
}

export function centroid(poly: readonly [number, number][]): [number, number] {
  let x = 0;
  let z = 0;
  for (const p of poly) {
    x += p[0];
    z += p[1];
  }
  return [x / poly.length, z / poly.length];
}

/** Squared-free distance from a point to the nearest vertex of a ring; good enough for LOD. */
export function nearestVertex(poly: readonly [number, number][], x: number, z: number): number {
  let best = Number.POSITIVE_INFINITY;
  for (const p of poly) best = Math.min(best, Math.hypot(p[0] - x, p[1] - z));
  return best;
}

const STYLE: Omit<FacadeStyle, 'wall'> = {
  bayWidth: 3.4,
  window: 'punched',
  roof: 'flat',
  trim: true,
};

interface Building {
  c: ColliderData;
  wall: 'brick' | 'limestone';
  near: Mesh[] | null;
  far: Mesh[] | null;
  group: Group;
  isNear: boolean;
}

export interface ZoneView {
  group: Group;
  /** Call now and then (a few times a second) with the camera position. */
  updateLod(x: number, z: number): void;
  buildings: number;
}

function treeMeshes(props: PropData[], mats: Mats): Object3D[] {
  const n = props.length;
  const trunkGeo = new CylinderGeometry(0.22, 0.32, 1, 7);
  trunkGeo.translate(0, 0.5, 0);
  const crownGeo = new IcosahedronGeometry(1, 1);
  const trunks = new InstancedMesh(trunkGeo, mats.bark as Material, n);
  const crowns = new InstancedMesh(
    crownGeo,
    new MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }),
    n,
  );
  trunks.castShadow = crowns.castShadow = true;
  trunks.receiveShadow = crowns.receiveShadow = true;
  const m = new Matrix4();
  const o = new Object3D();
  const col = new Color();
  props.forEach((p, i) => {
    const h = Math.max(2, p.topY - p.baseY);
    // deterministic variety from position
    const r = Math.abs(Math.sin(p.x * 12.9898 + p.z * 78.233) * 43758.5453) % 1;
    const trunkH = h * 0.45;
    o.position.set(p.x, p.baseY, p.z);
    o.scale.set(Math.max(0.5, p.radius / 0.35), trunkH, Math.max(0.5, p.radius / 0.35));
    o.rotation.set(0, 0, 0);
    o.updateMatrix();
    trunks.setMatrixAt(i, m.copy(o.matrix));
    const cr = h * (0.28 + 0.08 * r);
    o.position.set(p.x, p.baseY + trunkH + cr * 0.7, p.z);
    o.scale.set(cr, cr * 0.85, cr);
    o.rotation.set(0, r * 6.28, 0);
    o.updateMatrix();
    crowns.setMatrixAt(i, m.copy(o.matrix));
    crowns.setColorAt(i, col.setHSL(0.24 + 0.05 * r, 0.42, 0.2 + 0.08 * r));
  });
  return [trunks, crowns];
}

/** Ground, buildings (detailed near, Tier 3 far), trees and landmarks for a baked zone. */
export function buildZone(scene: Scene, mats: Mats, zone: ZoneData): ZoneView {
  const group = new Group();
  const t = (n: MaterialName) => TILING[n].tile;

  // Ground: one grass slab covering the zone and a margin so the edge is not a cliff in view.
  const { bounds: b } = zone;
  const gy = zone.ground.heights[0] ?? 0;
  const margin = 220;
  const ground = new Batch();
  ground.box(
    b.minX - margin,
    gy - 0.5,
    b.minZ - margin,
    b.maxX + margin,
    gy,
    b.maxZ + margin,
    t('grass'),
  );
  group.add(ground.mesh(mats.grass as Material));

  const facadeMats: Record<string, Material> = {
    brick: mats.brick as Material,
    limestone: mats.limestone as Material,
    stone: mats.limestone as Material,
    roof: new MeshStandardMaterial({ color: 0x4a4a4e, roughness: 0.8 }),
    glass: glassMaterial(),
  };

  const buildings: Building[] = zone.colliders.map((c) => {
    const g = new Group();
    group.add(g);
    return { c, wall: wallFor(c.id), near: null, far: null, group: g, isNear: false };
  });

  const make = (bd: Building, near: boolean) => {
    const B = new Batches();
    const fp = footprintOf(bd.c);
    const h = bd.c.topY - bd.c.baseY;
    if (near) buildFacade(B, fp, h, { ...STYLE, wall: bd.wall });
    else buildLowDetail(B, fp, h, { wall: bd.wall });
    const meshes = B.meshes(facadeMats);
    for (const m of meshes) {
      m.position.y = bd.c.baseY;
      bd.group.add(m);
    }
    return meshes;
  };
  const show = (bd: Building, near: boolean) => {
    if (near) bd.near ??= make(bd, true);
    else bd.far ??= make(bd, false);
    for (const m of bd.near ?? []) m.visible = near;
    for (const m of bd.far ?? []) m.visible = !near;
    bd.isNear = near;
  };
  // Start everything far; updateLod promotes the near ones.
  for (const bd of buildings) show(bd, false);

  for (const o of treeMeshes(zone.props, mats)) group.add(o);

  const lm = new Group();
  buildBellTower(scene, mats, LANDMARKS.bellTower);
  lm.add(buildFountain(mats, LANDMARKS.fountain.x, LANDMARKS.fountain.z));
  group.add(lm);
  scene.add(group);

  return {
    group,
    buildings: buildings.length,
    updateLod(x, z) {
      for (const bd of buildings) {
        const d = nearestVertex(bd.c.poly, x, z);
        const wantNear = bd.isNear ? d < NEAR_DISTANCE + NEAR_HYST : d < NEAR_DISTANCE;
        if (wantNear !== bd.isNear) show(bd, wantNear);
      }
    },
  };
}
