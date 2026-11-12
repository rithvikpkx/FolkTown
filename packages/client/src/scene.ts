import { Color, PerspectiveCamera, Scene } from 'three';

export function createScene(aspect: number) {
  const scene = new Scene();
  scene.background = new Color(0xd9b48a); // placeholder warm late-afternoon sky
  const camera = new PerspectiveCamera(70, aspect, 0.05, 2000);
  camera.position.set(0, 1.7, 0);
  return { scene, camera };
}
