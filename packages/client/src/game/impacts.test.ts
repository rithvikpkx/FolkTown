import type { GameEvent, ZoneData } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import zoneJson from '../../../../data/zones/engineering-mall.json';
import { impactsFor } from './impacts';

const zone = zoneJson as unknown as ZoneData;
const origin = { x: 0, y: 1.65, z: -200 };
const shot = (dir: { x: number; y: number; z: number }): GameEvent => ({
  type: 'shot',
  tick: 1,
  shooter: 0,
  weapon: 'rifle',
  origin,
  dir,
});

describe('impactsFor', () => {
  it('puts a mark on the ground for a downward shot with no wall', () => {
    const r = impactsFor([shot({ x: 0, y: -0.5, z: -1 })], zone, () => null, origin);
    expect(r).toHaveLength(1);
    expect(r[0]?.ny).toBe(1);
    expect(r[0]?.y).toBeCloseTo(0);
  });
  it('uses the wall hit when nearer than the ground', () => {
    const wall = { x: 0, y: 1, z: -205, nx: 0, ny: 0, nz: 1, t: 5 };
    const r = impactsFor([shot({ x: 0, y: -0.1, z: -1 })], zone, () => wall, origin);
    expect(r[0]?.z).toBe(-205);
  });
  it('leaves no mark for a shot that hit a player', () => {
    const hit: GameEvent = {
      type: 'hit',
      tick: 1,
      shooter: 0,
      target: 1,
      damage: 20,
      point: origin,
    };
    expect(impactsFor([shot({ x: 0, y: 0, z: -1 }), hit], zone, () => null, origin)).toHaveLength(
      0,
    );
  });
});
