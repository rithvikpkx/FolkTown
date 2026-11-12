import { describe, expect, it } from 'vitest';
import { pitchRate, VoiceLimiter, validateManifest } from './manifest';

describe('validateManifest', () => {
  it('applies defaults and clamps', () => {
    const { manifest, errors } = validateManifest({
      master: 5,
      sounds: { a: { files: ['a.ogg'], volume: -1, pitch: 9, maxVoices: 0 } },
    });
    expect(errors).toEqual([]);
    expect(manifest.master).toBe(1);
    expect(manifest.sounds.a).toMatchObject({ volume: 0, pitch: 0.5, maxVoices: 1, rate: 1 });
  });
  it('drops sounds without files and survives garbage', () => {
    const { manifest, errors } = validateManifest({ sounds: { a: {}, b: { files: [1] } } });
    expect(Object.keys(manifest.sounds)).toEqual([]);
    expect(errors).toHaveLength(2);
    expect(validateManifest(null).manifest.sounds).toEqual({});
  });
});

describe('pitchRate', () => {
  it('spans rate +- pitch', () => {
    const d = { rate: 1, pitch: 0.1 };
    expect(pitchRate(d, 0)).toBeCloseTo(0.9);
    expect(pitchRate(d, 0.5)).toBeCloseTo(1);
    expect(pitchRate(d, 0.999999)).toBeCloseTo(1.1, 4);
  });
});

describe('VoiceLimiter', () => {
  it('caps per sound and frees on release', () => {
    const l = new VoiceLimiter();
    const a = l.acquire('x', 2);
    expect(l.acquire('x', 2)).not.toBeNull();
    expect(l.acquire('x', 2)).toBeNull();
    expect(l.acquire('y', 2)).not.toBeNull();
    a?.();
    a?.(); // double release is harmless
    expect(l.acquire('x', 2)).not.toBeNull();
    expect(l.acquire('x', 2)).toBeNull();
  });
});
