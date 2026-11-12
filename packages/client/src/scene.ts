import { Color, MeshStandardMaterial, PerspectiveCamera, Scene } from 'three';
import { Batch } from './batch';

/** Test scene for the effects chain: a ground plane and a few boxes, so shadows and haze are visible. */
export function createScene(aspect: number) {
  const scene = new Scene();
  scene.background = new Color(0xd9b48a); // only seen if rendering falls back before the sky is added
  const camera = new PerspectiveCamera(70, aspect, 0.05, 2000);
  camera.position.set(0, 1.7, 0);

  const ground = new Batch();
  ground.box(-120, -0.5, -140, 120, 0, 100, 4);
  scene.add(ground.mesh(new MeshStandardMaterial({ color: 0x7b7a62, roughness: 0.95 })));

  const stone = new Batch();
  stone.box(7, 0, -30, 15, 8, -22, 3); // blocks the low sun, so shafts fan out around it
  stone.box(-16, 0, -34, -8, 7, -26, 3);
  stone.box(-3, 0, -14, -1, 4, -12, 3);
  stone.box(2, 0, -8, 3, 1.2, -4, 3); // low wall: sharp at the contact, soft further out
  stone.box(-30, 0, -60, -18, 16, -44, 3);
  stone.box(22, 0, -64, 36, 13, -50, 3);
  scene.add(stone.mesh(new MeshStandardMaterial({ color: 0xb8a58a, roughness: 0.85 })));
  return { scene, camera };
}
