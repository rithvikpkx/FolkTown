import { Color, PerspectiveCamera, Scene } from 'three';
import { Batch, UP } from './batch';
import { MATERIAL_NAMES, type MaterialName, type makeMaterials, TILING } from './materials';

type Mats = Awaited<ReturnType<typeof makeMaterials>>;

/** Empty scene and an eye-height camera; `buildPlaza` fills it once the materials exist. */
export function createScene(aspect: number) {
  const scene = new Scene();
  scene.background = new Color(0xd9b48a); // only seen if rendering falls back before the sky is added
  const camera = new PerspectiveCamera(70, aspect, 0.05, 2000);
  camera.position.set(0, 1.7, 0);
  return { scene, camera };
}

/** Material test plaza: pavers, grass, road, two brick buildings with limestone trim, and street furniture. */
export function buildPlaza(scene: Scene, mats: Mats) {
  const b = Object.fromEntries(MATERIAL_NAMES.map((n) => [n, new Batch()])) as Record<
    MaterialName,
    Batch
  >;
  const t = (n: MaterialName) => TILING[n].tile;

  b.grass.box(-120, -0.5, -140, 120, 0, 100, t('grass'));
  b.pavers.box(-16, 0, -38, 12, 0.05, -7, t('pavers'));
  b.asphalt.box(-120, 0, -7, 120, 0.03, 8, t('asphalt'));

  const building = (x0: number, z0: number, x1: number, z1: number, h: number) => {
    b.brick.shade = (y) => 0.7 + 0.3 * Math.min(1, y / 3); // darker brick near the ground
    b.brick.box(x0, 0.9, z0, x1, h, z1, t('brick'));
    b.brick.shade = null;
    b.limestone.box(x0 - 0.1, 0, z0 - 0.1, x1 + 0.1, 0.9, z1 + 0.1, t('limestone')); // base course
    b.limestone.box(x0 - 0.3, h - 0.8, z0 - 0.3, x1 + 0.3, h, z1 + 0.3, t('limestone')); // cornice
    const cx = (x0 + x1) / 2;
    b.limestone.box(cx - 1.4, 0.9, z1, cx - 1.0, 4.2, z1 + 0.25, t('limestone')); // entrance pilasters
    b.limestone.box(cx + 1.0, 0.9, z1, cx + 1.4, 4.2, z1 + 0.25, t('limestone'));
    b.limestone.box(cx - 1.6, 4.2, z1, cx + 1.6, 4.9, z1 + 0.35, t('limestone')); // lintel
    for (let y = 2; y < h - 1.5; y += 4)
      for (let x = x0 + 2; x < x1 - 1.5; x += 3.5)
        if (Math.abs(x + 0.5 - cx) > 2 || y > 5)
          b.limestone.box(x, y, z1, x + 1, y + 1.6, z1 + 0.12, t('limestone')); // window surrounds
  };
  building(-30, -48, -16, -34, 11);
  building(8, -52, 24, -36, 14);

  b.bark.cyl([-8, 0, -17], [-8, 6, -17], 0.38, 0.26, 14, t('bark'));
  b.bark.cyl([-8, 3.5, -17], [-6.8, 5.5, -17.4], 0.12, 0.07, 8, t('bark'), false);
  b.bark.box(-1.6, 0.42, -11.3, 0.4, 0.5, -10.8, t('bark')); // bench seat slats
  b.bark.box(-1.6, 0.7, -11.3, 0.4, 0.78, -11.2, t('bark'));
  b.metal.box(-1.5, 0, -11.3, -1.4, 0.42, -10.8, t('metal')); // bench legs
  b.metal.box(0.2, 0, -11.3, 0.3, 0.42, -10.8, t('metal'));
  b.metal.cyl([-3, 0, -9], [-3, 5, -9], 0.07, 0.05, 10, t('metal'));
  b.metal.cyl([-3, 5, -9], [-2.2, 5.2, -9], 0.04, 0.04, 6, t('metal'));
  b.polymer.box(-4.2, 0, -9.3, -3.7, 0.9, -8.8, t('polymer')); // bin
  b.fabric.rect([-2.9, 2.6, -8.95], [1, 0, 0], UP, 0.6, 1.6, t('fabric')); // banner

  for (const n of MATERIAL_NAMES) scene.add(b[n].mesh(mats[n]));
}
