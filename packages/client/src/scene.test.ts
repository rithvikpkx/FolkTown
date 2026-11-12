import { expect, test } from 'vitest';
import { createScene } from './scene';

test('blank scene has a sky colour and an eye-height camera', () => {
  const { scene, camera } = createScene(16 / 9);
  expect(scene.background).toBeTruthy();
  expect(camera.position.y).toBe(1.7);
  expect(camera.aspect).toBeCloseTo(16 / 9);
});
