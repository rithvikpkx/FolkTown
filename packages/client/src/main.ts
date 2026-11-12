import { Vector3 } from 'three';
import { makeMaterials } from './materials';
import { createRenderer, parseFx } from './render';
import { buildPlaza, createScene } from './scene';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const { scene, camera } = createScene(innerWidth / innerHeight);
const fxOpts = parseFx(location.search);
const fx = createRenderer(canvas, scene, camera, {
  ...fxOpts,
  shadow: { center: new Vector3(0, 0, -20), size: 90 },
});
addEventListener('resize', () => fx.resize());
// F toggles the whole chain on and off
addEventListener('keydown', (e) => {
  if (e.code === 'KeyF' && !e.repeat) fx.setEnabled(!fx.state.enabled);
});

// ?cam=x,y,z,yaw,pitch (degrees) places the camera; used by tools/ for benches and shots
const cam = new URLSearchParams(location.search).get('cam')?.split(',').map(Number);
if (cam?.length === 5 && cam.every(Number.isFinite)) {
  const [x = 0, y = 0, z = 0, yaw = 0, pitch = 0] = cam;
  camera.position.set(x, y, z);
  camera.rotation.set((pitch * Math.PI) / 180, (yaw * Math.PI) / 180, 0, 'YXZ');
}

// frame-time ring buffer (ms) for the bench harness
const ft = { times: new Float32Array(600), n: 0, renderer: '', texMs: 0 };
(window as unknown as { __ft: typeof ft }).__ft = ft;
const gl = fx.webgl.getContext();
const dbg = gl.getExtension('WEBGL_debug_renderer_info');
ft.renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : 'unknown';
const t0 = performance.now();
buildPlaza(scene, await makeMaterials(fx.webgl));
fx.invalidateShadow();
ft.texMs = Math.round(performance.now() - t0);
let last = performance.now();
fx.webgl.setAnimationLoop((now: number) => {
  ft.times[ft.n++ % ft.times.length] = now - last;
  fx.render(Math.min((now - last) / 1000, 0.1));
  last = now;
});
