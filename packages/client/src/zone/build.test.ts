import { describe, expect, it } from 'vitest';
import zone from '../../../../data/zones/engineering-mall.json';
import { centroid, footprintOf, nearestVertex, wallFor } from './build';

describe('zone build helpers', () => {
  const colliders = zone.colliders as never as Parameters<typeof footprintOf>[0][];
  it('turns every baked collider into a footprint', () => {
    for (const c of colliders) {
      const fp = footprintOf(c);
      expect(fp.outer.length).toBe(c.poly.length);
      expect(c.topY).toBeGreaterThan(c.baseY);
    }
  });
  it('picks walls deterministically', () => {
    expect(wallFor('way/1')).toBe(wallFor('way/1'));
  });
  it('measures distance to a ring', () => {
    const sq: [number, number][] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    expect(nearestVertex(sq, 13, 0)).toBe(3);
    expect(centroid(sq)).toEqual([5, 5]);
  });
});
