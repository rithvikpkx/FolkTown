import { expect, test } from 'vitest';
import { AX, Batch, UP } from './batch';

type V = [number, number, number];

/** Count triangles whose winding disagrees with the vertex normal (or, if given, point inward). */
function windingErrors(batch: Batch, centre?: V) {
  const g = batch.geometry();
  const p = g.getAttribute('position');
  const n = g.getAttribute('normal');
  const ix = g.getIndex();
  if (!ix) throw new Error('no index');
  let bad = 0;
  for (let t = 0; t < ix.count; t += 3) {
    const a = ix.getX(t);
    const b = ix.getX(t + 1);
    const c = ix.getX(t + 2);
    const e1: V = [p.getX(b) - p.getX(a), p.getY(b) - p.getY(a), p.getZ(b) - p.getZ(a)];
    const e2: V = [p.getX(c) - p.getX(a), p.getY(c) - p.getY(a), p.getZ(c) - p.getZ(a)];
    const f: V = [
      e1[1] * e2[2] - e1[2] * e2[1],
      e1[2] * e2[0] - e1[0] * e2[2],
      e1[0] * e2[1] - e1[1] * e2[0],
    ];
    if (f[0] * n.getX(a) + f[1] * n.getY(a) + f[2] * n.getZ(a) <= 1e-9) bad++;
    if (centre) {
      const out =
        f[0] * (p.getX(a) - centre[0]) +
        f[1] * (p.getY(a) - centre[1]) +
        f[2] * (p.getZ(a) - centre[2]);
      if (out <= 0) bad++;
    }
  }
  return bad;
}

test('box faces wind CCW from outside and point away from the centre', () => {
  const b = new Batch();
  b.box(0, 0, 0, 2, 3, 4);
  expect(windingErrors(b, [1, 1.5, 2])).toBe(0);
});

test('cylinder and cone (with caps) wind outward', () => {
  const b = new Batch();
  b.cyl([0, 0, 0], [0, 2, 0], 0.5, 0.3, 12);
  expect(windingErrors(b, [0, 1, 0])).toBe(0);
  const c = new Batch();
  c.cyl([0, 0, 0], [3, 0, 0], 0.4, 0.4, 8); // sideways axis
  expect(windingErrors(c, [1.5, 0, 0])).toBe(0);
});

test('rect normal is U x V', () => {
  const b = new Batch();
  b.rect([0, 0, 0], AX, UP, 1, 1);
  const n = b.geometry().getAttribute('normal');
  expect([n.getX(0), n.getY(0), n.getZ(0)]).toEqual([0, 0, 1]);
});

test('uvs scale with world size and tile length', () => {
  const small = new Batch();
  const big = new Batch();
  small.rect([0, 0, 0], AX, UP, 1, 1, 2);
  big.rect([0, 0, 0], AX, UP, 4, 6, 2);
  const a = small.geometry().getAttribute('uv');
  const c = big.geometry().getAttribute('uv');
  expect([a.getX(2), a.getY(2)]).toEqual([0.5, 0.5]);
  expect([c.getX(2), c.getY(2)]).toEqual([2, 3]);
  const wide = new Batch();
  wide.rect([0, 0, 0], AX, UP, 4, 6, 2, 0, 0, 3);
  expect(wide.geometry().getAttribute('uv').getY(2)).toBe(2);
});

test('shade function sets per-vertex colour by height', () => {
  const b = new Batch();
  b.shade = (y) => (y < 1 ? 0.5 : 1);
  b.rect([0, 0, 0], AX, UP, 1, 2);
  const c = b.geometry().getAttribute('color');
  expect([c.getX(0), c.getX(3)]).toEqual([0.5, 1]);
});
