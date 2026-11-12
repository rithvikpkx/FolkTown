import type { ZoneData } from '@folktown/shared';
import { Vector3 } from 'three';
import zoneJson from '../../../data/zones/engineering-mall.json';
import { makeMaterials } from './materials';
import { createRenderer, parseFx } from './render';
import { createScene } from './scene';
import { buildZone } from './zone/build';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const { scene, camera } = createScene(innerWidth / innerHeight);
const zone = zoneJson as unknown as ZoneData;
const cx = (zone.bounds.minX + zone.bounds.maxX) / 2;
const cz = (zone.bounds.minZ + zone.bounds.maxZ) / 2;
const fx = createRenderer(canvas, scene, camera, {
  ...parseFx(location.search),
  shadow: { center: new Vector3(cx, 0, cz), size: 340 },
});
addEventListener('resize', () => fx.resize());
const view = buildZone(scene, await makeMaterials(fx.webgl), zone);
fx.invalidateShadow();

const cam = new URLSearchParams(location.search).get('cam')?.split(',').map(Number);
const [x = cx, y = 40, z = zone.bounds.maxZ + 30, yaw = 0, pitch = -20] =
  cam?.length === 5 && cam.every(Number.isFinite) ? cam : [];
camera.position.set(x, y, z);
camera.rotation.set((pitch * Math.PI) / 180, (yaw * Math.PI) / 180, 0, 'YXZ');
view.updateLod(x, z);
let last = performance.now();
fx.webgl.setAnimationLoop((now: number) => {
  fx.render(Math.min((now - last) / 1000, 0.1));
  last = now;
});
