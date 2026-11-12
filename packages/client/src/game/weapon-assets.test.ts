import { WEAPONS } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import manifestJson from '../../public/models/weapons.json';
import { validateManifest } from './weapon-assets';

const files = Object.keys(import.meta.glob('../../public/models/**/*', { query: '?url' }));
const manifest = manifestJson as Record<string, any>;
const ids = Object.keys(WEAPONS);

describe('weapon manifest', () => {
  it('is valid and covers every weapon', () => {
    expect(validateManifest(manifest, ids)).toEqual([]);
  });
  it('points at model files that exist and records source and licence', () => {
    for (const e of Object.values(manifest) as {
      variants: Record<string, { url: string; maps?: Record<string, Record<string, string>> }>;
    }[])
      for (const v of Object.values(e.variants)) {
        for (const f of [v.url, ...Object.values(v.maps ?? {}).flatMap((t) => Object.values(t))])
          expect(files.includes(`../../public/${f}`)).toBe(true);
      }
  });
  it('rejects bad data', () => {
    const bad = structuredClone(manifest);
    bad.rifle.variant = 'nope';
    bad.pistol.variants[bad.pistol.variant].scale = 0;
    bad.shotgun.variants[bad.shotgun.variant].offset = [1, 2];
    delete bad.shotgun.variants[bad.shotgun.variant]['assets-notes'];
    delete bad.extra;
    const errs = validateManifest(bad, [...ids, 'sniper']);
    expect(errs.join('\n')).toMatch(/rifle: variant "nope"/);
    expect(errs.join('\n')).toMatch(/scale/);
    expect(errs.join('\n')).toMatch(/offset must be 3 numbers/);
    expect(errs.join('\n')).toMatch(/assets-notes/);
    expect(errs).toContain('sniper: missing');
  });
});
