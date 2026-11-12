// Pure parts of the effects chain: presets, pixel budget and render-scale maths. No three.js here.

export type PresetName = 'low' | 'medium' | 'high';

export interface Preset {
  /** Pixel budget in megapixels (1.2 = 1x on the baseline machine). */
  budgetMP: number;
  shadowSize: number;
  /** Re-render the sun shadow map every second frame (moving actors) instead of once. */
  shadowEveryOther: boolean;
  aoTaps: number; // 0 = off
  hazeSteps: number; // 0 = off
  bloomLevels: number;
}

export const PRESETS: Record<PresetName, Preset> = {
  low: {
    budgetMP: 0.8,
    shadowSize: 1024,
    shadowEveryOther: false,
    aoTaps: 0,
    hazeSteps: 8,
    bloomLevels: 4,
  },
  medium: {
    budgetMP: 1.2,
    shadowSize: 2048,
    shadowEveryOther: false,
    aoTaps: 8,
    hazeSteps: 12,
    bloomLevels: 5,
  },
  high: {
    budgetMP: 2.3,
    shadowSize: 2048,
    shadowEveryOther: true,
    aoTaps: 12,
    hazeSteps: 16,
    bloomLevels: 6,
  },
};
export const DEFAULT_PRESET: PresetName = 'medium';
const ORDER: PresetName[] = ['low', 'medium', 'high'];

/** `?fx=0` turns the chain off; `?q=low|medium|high` picks a preset. */
export function parseFx(search: string): { enabled: boolean; preset: PresetName } {
  const p = new URLSearchParams(search);
  const q = p.get('q') as PresetName | null;
  return { enabled: p.get('fx') !== '0', preset: q && q in PRESETS ? q : DEFAULT_PRESET };
}

/** The next cheaper preset, or null when already at the bottom. */
export const lowerPreset = (p: PresetName): PresetName | null =>
  ORDER[ORDER.indexOf(p) - 1] ?? null;

export const MIN_SCALE = 0.6;

/**
 * Internal render size: the native size shrunk (never grown) to fit the pixel budget, then times the
 * dynamic scale (a linear factor in [MIN_SCALE, 1]).
 */
export function renderSize(
  cssW: number,
  cssH: number,
  dpr: number,
  budgetMP: number,
  scale: number,
) {
  const nativeW = cssW * dpr;
  const nativeH = cssH * dpr;
  const k = Math.min(1, Math.sqrt((budgetMP * 1e6) / (nativeW * nativeH))) * scale;
  return { w: Math.max(16, Math.round(nativeW * k)), h: Math.max(16, Math.round(nativeH * k)) };
}

/** Dynamic scale: step down 0.1 when the average frame is over target, up when well under. */
export function stepScale(scale: number, avgMs: number, targetMs = 18): number {
  const s = avgMs > targetMs * 1.15 ? scale - 0.1 : avgMs < targetMs * 0.6 ? scale + 0.1 : scale;
  return Math.round(Math.min(1, Math.max(MIN_SCALE, s)) * 10) / 10;
}
