// Test page for the facade generator: awkward shapes, detailed row in front, Tier 3 row behind.
import {
  AmbientLight,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Batches, buildFacade, buildLowDetail, type FacadeStyle } from './facade/build';
import type { Footprint } from './facade/geom';
import { glassMaterial } from './facade/glass';
import { samples } from './facade/samples';
import { shapes } from './facade/shapes';

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(0xc9b99a);
scene.add(new HemisphereLight(0xbcc8e0, 0x6a5a44, 0.9), new AmbientLight(0xffffff, 0.2));
const sun = new DirectionalLight(0xffd9a8, 3.2);
sun.position.set(-160, 90, 120);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
const sc = sun.shadow.camera;
sc.left = sc.bottom = -300;
sc.right = sc.top = 300;
sc.far = 600;
scene.add(sun);
const ground = new Mesh(new PlaneGeometry(900, 400), new MeshStandardMaterial({ color: 0x7a8456 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const mats = {
  brick: new MeshStandardMaterial({ color: 0x9a4a36, roughness: 0.9 }),
  limestone: new MeshStandardMaterial({ color: 0xcfc3a4, roughness: 0.9 }),
  stone: new MeshStandardMaterial({ color: 0xd8cfb6, roughness: 0.85 }),
  roof: new MeshStandardMaterial({ color: 0x4a4a4e, roughness: 0.8 }),
  glass: glassMaterial(),
};

const style: FacadeStyle = {
  wall: 'brick',
  bayWidth: 3.4,
  window: 'punched',
  roof: 'flat',
  trim: true,
};
type Entry = [string, Footprint, number, Partial<FacadeStyle>];
const list: Entry[] = [
  ['triangle', shapes.triangle as Footprint, 14, {}],
  ['L', shapes.L as Footprint, 12, {}],
  ['U', shapes.U as Footprint, 16, { wall: 'limestone', window: 'ribbon' }],
  ['H', shapes.H as Footprint, 14, {}],
  ['courtyard', shapes.courtyard as Footprint, 15, { wall: 'limestone' }],
  ['gabled rect', shapes.rect as Footprint, 9, { roof: 'gabled' }],
  ['notch', shapes.notch as Footprint, 12, {}],
  ...Object.values(samples).map((s): Entry => [s.name, s, s.height, {}]),
];

const info: string[] = [];
list.forEach(([name, fp, h, over], i) => {
  const x = (i - (list.length - 1) / 2) * 62;
  const place = (B: Batches, z: number) => {
    for (const m of B.meshes(mats)) {
      m.position.set(x, 0, z);
      scene.add(m);
    }
  };
  const d = new Batches();
  buildFacade(d, fp, h, { ...style, ...over });
  const t = new Batches();
  buildLowDetail(t, fp, h, { ...style, ...over });
  place(d, 0);
  place(t, -70);
  info.push(`${name}: ${d.triangles} tris / tier3 ${t.triangles}`);
});
(document.getElementById('info') as HTMLElement).textContent = info.join('\n');

const camera = new PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 2000);
const cam = new URLSearchParams(location.search).get('cam')?.split(',').map(Number);
camera.position.set(cam?.[0] ?? 0, cam?.[1] ?? 70, cam?.[2] ?? 190);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(cam?.[3] ?? 0, cam?.[4] ?? 5, cam?.[5] ?? -20);
controls.update();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});
renderer.setAnimationLoop(() => renderer.render(scene, camera));
(window as unknown as { __ft: unknown }).__ft = { n: 100 };
