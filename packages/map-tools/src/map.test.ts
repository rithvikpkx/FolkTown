import { describe, expect, it } from 'vitest';
import { makeProjector, signedArea, wind } from './geo.ts';
import { mergeHeights } from './merge-heights.ts';
import { assemble, type El } from './osm.ts';
import type { Campus, Pt } from './types.ts';

describe('mergeHeights', () => {
  it('sets heightLidar only where a positive sample exists', () => {
    const b = (id: string) => ({ id, outer: [], holes: [], tags: {} });
    const campus = { buildings: [b('a'), b('b'), b('c')] } as unknown as Campus;
    const n = mergeHeights(campus, { a: { h: 12.3, n: 40 }, b: { h: -1, n: 3 } });
    expect(n).toBe(1);
    expect(campus.buildings.map((x) => x.heightLidar)).toEqual([12.3, undefined, undefined]);
  });
});

describe('projection', () => {
  it('matches known distances within 0.5%', () => {
    const P = makeProjector(40.4249, -86.9138);
    // 0.01 deg lat = 1111.95 m; 0.01 deg lon at 40.4249 = 1111.95 * cos(lat) = 846.4 m
    const [, z] = P(40.4349, -86.9138);
    expect(Math.abs(-z - 1111.95) / 1111.95).toBeLessThan(0.005);
    const [x] = P(40.4249, -86.9038);
    expect(Math.abs(x - 846.4) / 846.4).toBeLessThan(0.005);
  });
  it('puts north at -z and east at +x', () => {
    const P = makeProjector(40, -86);
    expect(P(40.001, -86)[1]).toBeLessThan(0);
    expect(P(40, -85.999)[0]).toBeGreaterThan(0);
  });
});

describe('winding', () => {
  const sq: Pt[] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];
  it('normalises outer to CCW and holes to CW, dropping the closing point', () => {
    const o = wind(sq, true);
    const h = wind(sq, false);
    expect(o).toHaveLength(4);
    expect(signedArea(o)).toBe(100);
    expect(signedArea(h)).toBe(-100);
  });
});

describe('multipolygon assembly', () => {
  const sq = (a: number, b: number, s: number) => [
    { lat: a, lon: b },
    { lat: a, lon: b + s },
    { lat: a + s, lon: b + s },
    { lat: a + s, lon: b },
    { lat: a, lon: b },
  ];
  it('joins split outer ways and assigns the hole', () => {
    const o = sq(0, 0, 10);
    const el: El = {
      type: 'relation',
      id: 1,
      members: [
        { type: 'way', role: 'outer', geometry: o.slice(0, 3) },
        { type: 'way', role: 'outer', geometry: o.slice(2) },
        { type: 'way', role: 'inner', geometry: sq(3, 3, 2) },
      ],
    };
    const r = assemble(el);
    expect(r).toHaveLength(1);
    expect(r?.[0]?.holes).toHaveLength(1);
    expect(r?.[0]?.outer).toHaveLength(5);
  });
  it('returns null when a ring does not close', () => {
    const el: El = {
      type: 'relation',
      id: 2,
      members: [{ type: 'way', role: 'outer', geometry: sq(0, 0, 10).slice(0, 3) }],
    };
    expect(assemble(el)).toBeNull();
  });
});
