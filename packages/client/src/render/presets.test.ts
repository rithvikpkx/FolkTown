import { expect, test } from 'vitest';
import { lowerPreset, MIN_SCALE, PRESETS, parseFx, renderSize, stepScale } from './presets';

test('render size honours the pixel budget and never upscales', () => {
  const { w, h } = renderSize(2880, 1626, 1, 1.2, 1);
  expect(w * h).toBeLessThanOrEqual(1.2e6 * 1.01);
  expect(w / h).toBeCloseTo(2880 / 1626, 2);
  expect(renderSize(800, 450, 1, 1.2, 1)).toEqual({ w: 800, h: 450 });
  expect(renderSize(1440, 813, 2, 1.2, 0.5).w).toBeLessThan(900);
});

test('dynamic scale steps with frame time and stays in range', () => {
  expect(stepScale(1, 30)).toBe(0.9);
  expect(stepScale(MIN_SCALE, 60)).toBe(MIN_SCALE);
  expect(stepScale(0.8, 8)).toBe(0.9);
  expect(stepScale(1, 5)).toBe(1);
  expect(stepScale(0.8, 16)).toBe(0.8);
});

test('url parsing and preset ladder', () => {
  expect(parseFx('')).toEqual({ enabled: true, preset: 'medium' });
  expect(parseFx('?fx=0&q=high')).toEqual({ enabled: false, preset: 'high' });
  expect(parseFx('?q=bogus').preset).toBe('medium');
  expect(lowerPreset('high')).toBe('medium');
  expect(lowerPreset('low')).toBeNull();
  expect(PRESETS.medium.budgetMP).toBe(1.2);
});
