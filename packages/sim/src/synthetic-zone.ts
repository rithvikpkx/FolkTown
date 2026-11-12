import type { ColliderData, SpawnData, ZoneData } from '@folktown/shared';

function box(
  id: string,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  topY: number,
): ColliderData {
  return {
    id,
    poly: [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ],
    baseY: 0,
    topY,
  };
}

/**
 * Test zone: 200x200 m flat ground at y=0 centred on the origin.
 * Buildings (10 m tall): "b1" x 10..20, z -10..0; "b2" x -30..-20, z 20..40; "b3" x 40..60, z 40..50.
 * "low" is a 0.4 m step box x -5..-3, z -5..-3; "high" is a 1.2 m box x -5..-3, z 5..7.
 * One tree prop at (0, -20) radius 0.5.
 */
export function makeSyntheticZone(): ZoneData {
  const spawns: SpawnData[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    spawns.push({
      x: Math.round(Math.cos(a) * 60),
      z: Math.round(Math.sin(a) * 60),
      yaw: a + Math.PI,
      team: (i % 2) as 0 | 1,
    });
  }
  return {
    name: 'synthetic',
    bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
    ground: { x0: -100, z0: -100, cell: 200, cols: 2, rows: 2, heights: [0, 0, 0, 0] },
    colliders: [
      box('b1', 10, -10, 20, 0, 10),
      box('b2', -30, 20, -20, 40, 10),
      box('b3', 40, 40, 60, 50, 10),
      box('low', -5, -5, -3, -3, 0.4),
      box('high', -5, 5, -3, 7, 1.2),
    ],
    props: [{ x: 0, z: -20, radius: 0.5, baseY: 0, topY: 6 }],
    spawns,
    nav: {
      nodes: [
        { id: 0, x: 0, z: 0 },
        { id: 1, x: 30, z: 0 },
        { id: 2, x: 0, z: 30 },
      ],
      edges: [
        [0, 1],
        [0, 2],
      ],
    },
  };
}
