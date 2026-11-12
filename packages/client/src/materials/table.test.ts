import { expect, test } from 'vitest';
import { MATERIAL_NAMES, TILING } from './table';

test('every material has a positive tile and a power-of-two texture size', () => {
  for (const n of MATERIAL_NAMES) {
    const t = TILING[n];
    expect(t.tile).toBeGreaterThan(0);
    expect(Math.log2(t.size) % 1).toBe(0);
  }
});

test('brick course is about 7.5 cm', () => {
  expect(TILING.brick.tile / 24).toBeCloseTo(0.075, 3);
});
