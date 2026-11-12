import { describe, expect, it } from 'vitest';
import { pickSource, pitchRate, VoiceLimiter, validateManifest } from './manifest';

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

describe('synth backend', () => {
  it('accepts synth-only sounds and reads the backend switch', () => {
    const { manifest, errors } = validateManifest({
      backend: 'synth',
      sounds: { a: { synth: 'rifle-shot' }, b: { files: ['b.ogg'], synth: 'step' } },
    });
    expect(errors).toEqual([]);
    expect(manifest.backend).toBe('synth');
    expect(manifest.sounds.a).toMatchObject({ files: [], synth: 'rifle-shot' });
    expect(validateManifest({ backend: 'nonsense' }).manifest.backend).toBe('files');
    expect(validateManifest({}).manifest.backend).toBe('files');
  });
  it('picks the source: files by default, synth when asked or when the file is missing', () => {
    const both = { files: ['a.ogg'], synth: 'x' };
    expect(pickSource('files', both, true, true)).toBe('file');
    expect(pickSource('synth', both, true, true)).toBe('synth');
    expect(pickSource('files', both, true, false)).toBe('synth'); // fallback
    expect(pickSource('synth', both, false, true)).toBe('file'); // unknown recipe
    expect(pickSource('files', { files: ['a.ogg'] }, true, false)).toBe('none');
    expect(pickSource('synth', { files: ['a.ogg'] }, true, true)).toBe('file');
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
