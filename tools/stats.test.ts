import { expect, it } from 'vitest';
import { fpsStats } from './stats.ts';

it('computes median and 1% low fps', () => {
  const ms = [...Array(99).fill(10), 100];
  expect(fpsStats(ms).median).toBe(100);
  expect(fpsStats(ms).low).toBe(10);
  expect(fpsStats([])).toEqual({ median: 0, low: 0 });
});
