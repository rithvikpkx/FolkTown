import { describe, expect, it } from 'vitest';
import { CameraFeel, FEEL, type FeelInput } from './feel';

const walk: FeelInput = {
  speed: 4.5,
  rightVel: 0,
  vy: 0,
  onGround: true,
  sprinting: false,
  crouching: false,
  alive: true,
  ads: 0,
};
const still = { ...walk, speed: 0 };
const run = (f: CameraFeel, s: FeelInput, secs: number) => {
  let o = f.update(1 / 60, s);
  for (let i = 1; i < secs * 60; i++) o = f.update(1 / 60, s);
  return o;
};

describe('CameraFeel', () => {
  it('bobs while walking, not while standing, less when aiming, more when sprinting', () => {
    const peak = (s: FeelInput) => {
      const f = new CameraFeel();
      let m = 0;
      for (let i = 0; i < 240; i++) m = Math.max(m, Math.abs(f.update(1 / 60, s).y));
      return m;
    };
    expect(peak(still)).toBeLessThan(1e-6);
    expect(peak(walk)).toBeGreaterThan(FEEL.bobY * 0.8);
    expect(peak({ ...walk, ads: 1 })).toBeLessThan(peak(walk) * 0.4);
    expect(peak({ ...walk, sprinting: true, speed: 7 })).toBeGreaterThan(peak(walk));
  });

  it('bob is locked to distance: one cycle per stride', () => {
    const f = new CameraFeel();
    let crossings = 0;
    let prev = 0;
    // 10 s at 4.5 m/s is 45 m: 29 cycles of 1.55 m.
    for (let i = 0; i < 600; i++) {
      const y = f.update(1 / 60, walk).y;
      if (i > 60 && prev < 0 && y >= 0) crossings++;
      prev = y;
    }
    expect(crossings).toBeGreaterThanOrEqual(24);
    expect(crossings).toBeLessThanOrEqual(30);
  });

  it('a hard landing dips the eye then recovers; a short hop does nothing', () => {
    const f = new CameraFeel();
    run(f, still, 0.5);
    run(f, { ...still, onGround: false, vy: -9 }, 0.4);
    let min = 0;
    for (let i = 0; i < 90; i++) min = Math.min(min, f.update(1 / 60, still).y);
    expect(min).toBeLessThan(-0.05);
    expect(min).toBeGreaterThanOrEqual(-FEEL.landDipMax - 0.01);
    expect(Math.abs(f.update(1 / 60, still).y)).toBeLessThan(0.005);

    const g = new CameraFeel();
    run(g, { ...still, onGround: false, vy: -3 }, 0.08);
    expect(Math.abs(run(g, still, 0.5).y)).toBeLessThan(0.005);
  });

  it('shake decays to nothing and grows faster than linearly', () => {
    const amp = (trauma: number) => {
      const f = new CameraFeel();
      f.addShake(trauma);
      let m = 0;
      for (let i = 0; i < 6; i++) {
        const o = f.update(1 / 60, still);
        m = Math.max(m, Math.abs(o.roll), Math.abs(o.pitch), Math.abs(o.yaw));
      }
      return m;
    };
    expect(amp(1)).toBeGreaterThan(amp(0.5) * 2.5);
    const f = new CameraFeel();
    f.addShake(1);
    const o = run(f, still, 1 / FEEL.shakeDecay + 0.2);
    expect(Math.abs(o.roll) + Math.abs(o.pitch) + Math.abs(o.yaw)).toBeLessThan(1e-9);
  });

  it('kicks the FOV while sprinting only, and rolls into a strafe', () => {
    const f = new CameraFeel();
    expect(run(f, { ...walk, sprinting: true, speed: 7 }, 1).fov).toBeCloseTo(FEEL.fovSprint, 1);
    expect(run(f, walk, 1).fov).toBeLessThan(0.1);
    const right = run(new CameraFeel(), { ...still, rightVel: 4.5 }, 1).roll;
    const left = run(new CameraFeel(), { ...still, rightVel: -4.5 }, 1).roll;
    expect(right).toBeLessThan(0);
    expect(left).toBeGreaterThan(0);
  });

  it('turns game events into shake for the local player only', () => {
    const hit = (target: number) =>
      ({
        type: 'hit',
        tick: 1,
        shooter: 2,
        target,
        damage: 28,
        point: { x: 0, y: 0, z: 0 },
      }) as const;
    const f = new CameraFeel();
    f.onEvents([hit(3)], 1);
    expect(f.update(1 / 60, still).roll).toBe(0);
    f.onEvents([hit(1)], 1);
    let m = 0;
    for (let i = 0; i < 6; i++) m = Math.max(m, Math.abs(f.update(1 / 60, still).roll));
    expect(m).toBeGreaterThan(0.001);
  });
});
