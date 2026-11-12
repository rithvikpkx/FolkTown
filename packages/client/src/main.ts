import { WebGLRenderer } from 'three';
import { createScene } from './scene';

const renderer = new WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
document.body.appendChild(renderer.domElement);
const { scene, camera } = createScene(innerWidth / innerHeight);

function resize() {
  renderer.setPixelRatio(1); // pixel budget: 1x by default, dynamic scale comes with WP4
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ?cam=x,y,z,yaw,pitch (degrees) places the camera; used by tools/ for benches and shots
const cam = new URLSearchParams(location.search).get('cam')?.split(',').map(Number);
if (cam?.length === 5 && cam.every(Number.isFinite)) {
  const [x = 0, y = 0, z = 0, yaw = 0, pitch = 0] = cam;
  camera.position.set(x, y, z);
  camera.rotation.set((pitch * Math.PI) / 180, (yaw * Math.PI) / 180, 0, 'YXZ');
}

// frame-time ring buffer (ms) for the bench harness
const ft = { times: new Float32Array(600), n: 0, renderer: '' };
(window as unknown as { __ft: typeof ft }).__ft = ft;
const gl = renderer.getContext();
const dbg = gl.getExtension('WEBGL_debug_renderer_info');
ft.renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : 'unknown';
let last = performance.now();
renderer.setAnimationLoop((now: number) => {
  ft.times[ft.n++ % ft.times.length] = now - last;
  last = now;
  renderer.render(scene, camera);
});
