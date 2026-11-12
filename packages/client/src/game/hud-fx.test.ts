import { describe, expect, it } from 'vitest';
import {
  ammoCue,
  DamageFx,
  damageArcAngle,
  healthSegments,
  hitMarkerKind,
  lowHealth,
} from './hud-fx';

describe('damage direction', () => {
  const me = { x: 0, z: 0 };
  it('points ahead, right, behind and left for a player facing -z', () => {
    expect(damageArcAngle({ x: 0, z: -5 }, me, 0)).toBeCloseTo(0);
    expect(damageArcAngle({ x: 5, z: 0 }, me, 0)).toBeCloseTo(90);
    expect(Math.abs(damageArcAngle({ x: 0, z: 5 }, me, 0))).toBeCloseTo(180);
    expect(damageArcAngle({ x: -5, z: 0 }, me, 0)).toBeCloseTo(-90);
  });
  it('turns with the player: after turning left 90 degrees an attacker to the east is behind', () => {
    expect(Math.abs(damageArcAngle({ x: 5, z: 0 }, me, Math.PI / 2))).toBeCloseTo(180);
    // turned right 90 degrees (facing +x) the same attacker is dead ahead
    expect(damageArcAngle({ x: 5, z: 0 }, me, -Math.PI / 2)).toBeCloseTo(0);
  });
});

describe('DamageFx', () => {
  it('pulses harder for bigger hits, then fades', () => {
    const a = new DamageFx();
    a.hit(10);
    const small = a.pulse;
    const b = new DamageFx();
    b.hit(40);
    expect(b.pulse).toBeGreaterThan(small);
    expect(small).toBeGreaterThan(0.5);
    for (let i = 0; i < 60; i++) a.update(1 / 60, { x: 0, z: 0 }, 0);
    expect(a.pulse).toBe(0);
  });
  it('shows an arc toward the shooter, fades it out, and reuses the oldest slot', () => {
    const fx = new DamageFx();
    fx.hit(10, { x: 5, z: 0 });
    let arcs = fx.update(0.016, { x: 0, z: 0 }, 0);
    expect(arcs[0]?.deg).toBeCloseTo(90);
    expect(arcs[0]?.opacity).toBe(1);
    arcs = fx.update(1.2, { x: 0, z: 0 }, 0); // 1.5 s life, last 0.6 s fade
    expect(arcs[0]?.opacity).toBeLessThan(1);
    arcs = fx.update(1, { x: 0, z: 0 }, 0);
    expect(arcs[0]?.opacity).toBe(0);
    for (let i = 0; i < 6; i++) fx.hit(5, { x: i, z: -10 });
    expect(fx.update(0.016, { x: 0, z: 0 }, 0).filter((a) => a.opacity > 0)).toHaveLength(4);
  });
  it('a hit with no known source pulses but draws no arc', () => {
    const fx = new DamageFx();
    fx.hit(20);
    expect(fx.update(0.016, { x: 0, z: 0 }, 0).every((a) => a.opacity === 0)).toBe(true);
  });
});

describe('hud state helpers', () => {
  it('low health vignette ramps between 55% and 12%', () => {
    expect(lowHealth(1)).toBe(0);
    expect(lowHealth(0.55)).toBe(0);
    expect(lowHealth(0.12)).toBe(1);
    expect(lowHealth(0)).toBe(1);
    expect(lowHealth(0.3)).toBeGreaterThan(lowHealth(0.4));
  });
  it('hit marker kinds rank kill over head over hit', () => {
    expect(hitMarkerKind(false, false)).toBe('hit');
    expect(hitMarkerKind(true, false)).toBe('head');
    expect(hitMarkerKind(true, true)).toBe('kill');
  });
  it('ammo cue', () => {
    expect(ammoCue(30, 30, false).level).toBe('none');
    expect(ammoCue(8, 30, false)).toEqual({ text: 'Low ammo', level: 'low' });
    expect(ammoCue(9, 30, false).level).toBe('low'); // ceil(27% of 30)
    expect(ammoCue(10, 30, false).level).toBe('none');
    expect(ammoCue(0, 30, false).level).toBe('empty');
    expect(ammoCue(0, 30, true).level).toBe('reloading');
  });
  it('health segments light proportionally and go critical at three', () => {
    expect(healthSegments(100, 100)).toEqual({ lit: 10, crit: false });
    expect(healthSegments(31, 100)).toEqual({ lit: 4, crit: false });
    expect(healthSegments(30, 100)).toEqual({ lit: 3, crit: true });
    expect(healthSegments(0, 100)).toEqual({ lit: 0, crit: true });
    expect(healthSegments(-5, 100).lit).toBe(0);
  });
});
