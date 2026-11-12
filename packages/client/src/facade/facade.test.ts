import { expect, test } from 'vitest';
import { Batches, bayCount, buildFacade, buildLowDetail, type FacadeStyle } from './build';
import { area2, edges, type Footprint, orient, type Pt } from './geom';
import { samples } from './samples';
import { shapes } from './shapes';

const style: FacadeStyle = {
  wall: 'brick',
  bayWidth: 3.4,
  window: 'punched',
  roof: 'flat',
  trim: true,
};
const all: Record<string, Footprint & { height?: number }> = { ...shapes, ...samples };

function inside(p: Pt, f: { outer: readonly Pt[]; holes: readonly (readonly Pt[])[] }) {
  const ray = (r: readonly Pt[]) => {
    let c = false;
    r.forEach((a, i) => {
      const b = r[(i + 1) % r.length] as Pt;
      if (
        a[1] > p[1] !== b[1] > p[1] &&
        p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
      )
        c = !c;
    });
    return c;
  };
  return ray(f.outer) && !f.holes.some(ray);
}

test('outward normals point out of the solid on every edge, outer rings and holes', () => {
  for (const f of Object.values(all)) {
    const o = orient(f);
    for (const ring of [o.outer, ...o.holes])
      for (const e of edges(ring)) {
        const mx = (e.a[0] + e.b[0]) / 2;
        const mz = (e.a[1] + e.b[1]) / 2;
        expect(inside([mx + e.nx * 0.05, mz + e.nz * 0.05], o)).toBe(false);
        expect(inside([mx - e.nx * 0.05, mz - e.nz * 0.05], o)).toBe(true);
      }
  }
});

test('orient fixes reversed input', () => {
  const o = orient({ outer: [...(shapes.L as Footprint).outer].reverse() });
  expect(area2(o.outer)).toBeLessThan(0);
});

test('short edges get no bays', () => {
  expect(bayCount(1, 3.4)).toBe(0);
  expect(bayCount(4, 3.4)).toBe(0);
  expect(bayCount(20, 3.4)).toBeGreaterThan(3);
  const B = new Batches();
  buildFacade(
    B,
    {
      outer: [
        [0, 0],
        [2, 0],
        [2, -2],
        [0, -2],
      ],
    },
    8,
    { ...style, trim: false },
  );
  expect(B.keys()).not.toContain('glass');
});

test('triangle counts: detailed is sane, Tier 3 is tiny', () => {
  for (const [k, f] of Object.entries(all)) {
    const h = f.height ?? 15;
    const d = new Batches();
    buildFacade(d, f, h, style);
    const t = new Batches();
    buildLowDetail(t, f, h, style);
    const n = f.outer.length + (f.holes ?? []).reduce((s, r) => s + r.length, 0);
    expect(d.triangles, k).toBeGreaterThan(t.triangles);
    expect(d.triangles, k).toBeLessThan(40000);
    expect(t.triangles, k).toBeLessThanOrEqual(3 * n);
  }
});

test('gabled rectangle gets a sloped roof; other shapes fall back to flat', () => {
  const g = new Batches();
  buildFacade(g, shapes.rect as Footprint, 12, { ...style, roof: 'gabled' });
  expect(g.get('roof').triangleCount).toBe(4);
  const l = new Batches();
  buildFacade(l, shapes.L as Footprint, 12, { ...style, roof: 'gabled' });
  expect(l.get('roof').triangleCount).toBe(4);
});

test('roof triangles face up', () => {
  const B = new Batches();
  buildLowDetail(B, shapes.courtyard as Footprint, 10, style);
  const n = B.get('roof').geometry().getAttribute('normal');
  for (let i = 0; i < n.count; i++) expect(n.getY(i)).toBeCloseTo(1);
});
