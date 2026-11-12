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
renderer.setAnimationLoop(() => renderer.render(scene, camera));
