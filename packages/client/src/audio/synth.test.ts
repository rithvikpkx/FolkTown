import { describe, expect, it } from 'vitest';
import { makeRng, RECIPES, renderSynth } from './synth';

const rms = (x: Float32Array, from: number, to: number, sr: number) => {
  let s = 0;
  const a = Math.round(from * sr);
  const b = Math.min(x.length, Math.round(to * sr));
  for (let i = a; i < b; i++) s += (x[i] as number) ** 2;
  return Math.sqrt(s / Math.max(1, b - a));
};

describe('synth recipes', () => {
  it('every recipe renders finite, bounded, non-silent audio of a sensible length', () => {
    const t0 = performance.now();
    for (const [id, rec] of Object.entries(RECIPES)) {
      for (let v = 0; v < rec.variants; v++) {
        const x = renderSynth(id, v) as Float32Array;
        expect(x, id).toBeInstanceOf(Float32Array);
        let max = 0;
        for (const s of x) {
          expect(Number.isFinite(s), id).toBe(true);
          max = Math.max(max, Math.abs(s));
        }
        expect(max, id).toBeGreaterThan(0.9);
        expect(max, id).toBeLessThanOrEqual(0.97 + 1e-6);
        expect(x.length / 44100, id).toBeGreaterThan(0.05);
        expect(x.length / 44100, id).toBeLessThan(1);
      }
    }
    // the whole bank is rendered once at start-up; keep it cheap
    expect(performance.now() - t0).toBeLessThan(60_000);
  });

  it('is deterministic per seed and varies between variants and seeds', () => {
    const a = renderSynth('rifle-shot', 0, 44100, 1) as Float32Array;
    const b = renderSynth('rifle-shot', 0, 44100, 1) as Float32Array;
    const c = renderSynth('rifle-shot', 1, 44100, 1) as Float32Array;
    const d = renderSynth('rifle-shot', 0, 44100, 2) as Float32Array;
    expect(Array.from(a.subarray(0, 4000))).toEqual(Array.from(b.subarray(0, 4000)));
    expect(Array.from(a.subarray(0, 4000))).not.toEqual(Array.from(c.subarray(0, 4000)));
    expect(Array.from(a.subarray(0, 4000))).not.toEqual(Array.from(d.subarray(0, 4000)));
  });

  it('a gunshot is a loud report that dies away, and the rifle rings longer than the pistol', () => {
    const rifle = renderSynth('rifle-shot') as Float32Array;
    const pistol = renderSynth('pistol-shot') as Float32Array;
    expect(rms(rifle, 0, 0.05, 44100)).toBeGreaterThan(rms(rifle, 0.4, 0.6, 44100) * 10);
    expect(rms(rifle, 0.1, 0.3, 44100) / rms(rifle, 0, 0.05, 44100)).toBeGreaterThan(
      rms(pistol, 0.1, 0.3, 44100) / rms(pistol, 0, 0.05, 44100),
    );
    expect(rifle.length).toBeGreaterThan(pistol.length);
  });

  it('works at other sample rates and returns null for an unknown recipe', () => {
    const x = renderSynth('step', 0, 22050) as Float32Array;
    expect(x.length).toBeCloseTo(0.3 * 22050, -1);
    expect(renderSynth('nope')).toBeNull();
  });

  it('the seeded generator is uniform in [0, 1)', () => {
    const r = makeRng(7);
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 10000).toBeCloseTo(0.5, 1);
  });
});
