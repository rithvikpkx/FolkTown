import type { PlayerInput, PlayerState } from '@folktown/shared';
import {
  ACCEL_AIR,
  ACCEL_GROUND,
  ADS_SPEED,
  BACKWARD_SPEED_FACTOR,
  COYOTE_TIME,
  DECEL_GROUND,
  PLAYER_RADIUS,
  SPREAD_FULL_SPEED,
  SPRINT_SPEED,
  TICK_DT,
  WALK_SPEED,
  WEAPONS,
} from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import { createPlayerState, makeSyntheticZone, stepController, ZoneCollision } from './index.ts';
import { shotSpread } from './weapons.ts';

const zone = new ZoneCollision(makeSyntheticZone());

function input(over: Partial<PlayerInput> = {}): PlayerInput {
  return {
    tick: 0,
    moveX: 0,
    moveZ: 0,
    yaw: 0,
    pitch: 0,
    jump: false,
    sprint: false,
    crouch: false,
    fire: false,
    ads: false,
    reload: false,
    ...over,
  };
}

function run(p: PlayerState, inp: Partial<PlayerInput>, ticks: number): PlayerState {
  for (let i = 0; i < ticks; i++) stepController(p, input({ ...inp, tick: i }), zone, TICK_DT);
  return p;
}

// Yaw -PI/2 faces +x (east).
const EAST = -Math.PI / 2;

describe('controller', () => {
  it('a wall blocks movement', () => {
    const p = createPlayerState(1, 0, 0, 0, -5); // b1 west face is x=10, z -10..0
    run(p, { moveZ: 1, yaw: EAST }, 300);
    expect(p.pos.x).toBeCloseTo(10 - PLAYER_RADIUS, 3);
  });

  it('slides along a wall when moving diagonally', () => {
    const p = createPlayerState(1, 0, 5, 0, -5);
    // Heading east-south-east: wish = forward(east) + a little south.
    run(p, { moveZ: 1, moveX: 0, yaw: EAST + 0.6 }, 90); // yaw nearer -z... turns left = toward north
    expect(p.pos.x).toBeLessThanOrEqual(10 - PLAYER_RADIUS + 1e-6);
    expect(Math.abs(p.pos.z - -5)).toBeGreaterThan(2); // kept moving along the wall
  });

  it('cannot walk through a building', () => {
    const p = createPlayerState(1, 0, 0, 0, -5);
    run(p, { moveZ: 1, yaw: EAST }, 600);
    expect(p.pos.x).toBeLessThan(10);
  });

  it('steps onto a 0.4 m box by walking but is blocked by a 1.2 m box', () => {
    const low = createPlayerState(1, 0, -8, 0, -4);
    run(low, { moveZ: 1, yaw: EAST }, 60);
    expect(low.pos.y).toBeCloseTo(0.4, 3);
    expect(low.pos.x).toBeGreaterThan(-5);

    const high = createPlayerState(2, 0, -8, 0, 6);
    run(high, { moveZ: 1, yaw: EAST }, 60);
    expect(high.pos.x).toBeLessThan(-5);
  });

  it('jumps onto a low box and stands on it', () => {
    const p = createPlayerState(1, 0, -4, 0, 0);
    run(p, {}, 5);
    // Jump toward north (-z, yaw 0) onto the box at z -5..-3 from z=-2.
    p.pos.z = -2;
    p.pos.x = -4;
    run(p, { moveZ: 1, jump: true }, 20);
    run(p, {}, 60);
    expect(p.pos.y).toBeCloseTo(0.4, 3);
    expect(p.onGround).toBe(true);
  });

  it('jumps onto the 1.2 m box', () => {
    const p = createPlayerState(1, 0, -4, 0, 9);
    run(p, {}, 3);
    run(p, { moveZ: 1, yaw: 0 }, 8); // a running start: air control is weak
    run(p, { moveZ: 1, jump: true, yaw: 0 }, 1);
    run(p, {}, 90); // momentum carries the jump; hands off
    // Jump apex ~1.05 m puts the feet within the 0.5 m step of the 1.2 m top.
    expect(p.pos.y).toBeCloseTo(1.2, 3);
    expect(p.onGround).toBe(true);
  });

  it('is deterministic', () => {
    const a = createPlayerState(1, 0, 0, 0, 0);
    const b = createPlayerState(1, 0, 0, 0, 0);
    for (let i = 0; i < 500; i++) {
      const inp = input({
        tick: i,
        moveX: Math.sin(i * 0.1),
        moveZ: Math.cos(i * 0.07),
        yaw: i * 0.01,
        jump: i % 37 === 0,
        sprint: i % 5 === 0,
        crouch: i % 91 < 10,
      });
      stepController(a, inp, zone, TICK_DT);
      stepController(b, inp, zone, TICK_DT);
    }
    expect(a).toEqual(b);
  });

  it('walks and sprints at the specified speeds', () => {
    const w = createPlayerState(1, 0, 0, 0, 30);
    run(w, {}, 2);
    run(w, { moveZ: 1, yaw: 0 }, 60);
    expect(Math.hypot(w.vel.x, w.vel.z)).toBeCloseTo(WALK_SPEED, 3);
    const s = createPlayerState(2, 0, 0, 0, 30);
    run(s, {}, 2);
    run(s, { moveZ: 1, yaw: 0, sprint: true }, 60);
    expect(Math.hypot(s.vel.x, s.vel.z)).toBeCloseTo(SPRINT_SPEED, 3);
  });

  it('accelerates instead of snapping, and stops within a few ticks', () => {
    const p = createPlayerState(1, 0, 0, 0, 30);
    run(p, {}, 2);
    run(p, { moveZ: 1, yaw: 0 }, 1);
    const first = Math.hypot(p.vel.x, p.vel.z);
    expect(first).toBeGreaterThan(0.3);
    expect(first).toBeCloseTo(ACCEL_GROUND * TICK_DT, 3);
    run(p, { moveZ: 1, yaw: 0 }, 7);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBe(WALK_SPEED); // 34 m/s2 reaches 4.5 in 8 ticks
    run(p, {}, Math.ceil(WALK_SPEED / DECEL_GROUND / TICK_DT) + 1);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBe(0);
  });

  it('walks backwards slower, sprints only forward, and aiming caps speed', () => {
    const back = createPlayerState(1, 0, 0, 0, 30);
    run(back, { moveZ: -1, sprint: true, yaw: 0 }, 60);
    expect(Math.hypot(back.vel.x, back.vel.z)).toBeCloseTo(WALK_SPEED * BACKWARD_SPEED_FACTOR, 3);
    const strafe = createPlayerState(2, 0, 0, 0, 30);
    run(strafe, { moveX: 1, moveZ: 0.6, sprint: true, yaw: 0 }, 60);
    expect(Math.hypot(strafe.vel.x, strafe.vel.z)).toBeCloseTo(WALK_SPEED, 3);
    const ads = createPlayerState(3, 0, 0, 0, 30);
    run(ads, { moveZ: 1, sprint: true, ads: true, yaw: 0 }, 60);
    expect(Math.hypot(ads.vel.x, ads.vel.z)).toBeCloseTo(ADS_SPEED, 3);
  });

  it('air steering is weak and momentum is kept with no input', () => {
    const p = createPlayerState(1, 0, 0, 0, 30);
    run(p, { moveZ: 1, yaw: 0 }, 30);
    run(p, { moveZ: 1, jump: true, yaw: 0 }, 1);
    expect(p.onGround).toBe(false);
    const vz = p.vel.z;
    run(p, {}, 20); // 1/3 s in the air, hands off
    expect(Math.abs(p.vel.z)).toBeGreaterThan(Math.abs(vz) * 0.95);
    run(p, { moveX: 1, yaw: 0 }, 6); // 0.1 s of full strafe adds at most ACCEL_AIR * 0.1
    expect(p.vel.x).toBeLessThan(ACCEL_AIR * 0.1 + 1e-6);
    expect(p.vel.x).toBeGreaterThan(0.5);
  });

  it('coyote time allows a late jump and the buffer allows an early one', () => {
    const p = createPlayerState(1, 0, 0, 0, 30);
    run(p, {}, 3);
    // walk off nothing: simulate leaving the ground by hand
    p.onGround = false;
    p.coyote = COYOTE_TIME;
    run(p, { jump: true }, 1);
    expect(p.vel.y).toBeGreaterThan(5);
    const q = createPlayerState(2, 0, 0, 0, 30);
    q.pos.y = 0.1; // falling, press jump slightly before landing
    run(q, { jump: true }, 1);
    run(q, {}, 9);
    expect(q.vel.y).toBeGreaterThan(0);
  });

  it('crouching slows the player and shrinks nothing it cannot undo under a roof', () => {
    const p = createPlayerState(1, 0, 0, 0, 30);
    run(p, { crouch: true }, 2);
    expect(p.crouching).toBe(true);
    run(p, {}, 2);
    expect(p.crouching).toBe(false);
  });
});

describe('raycast', () => {
  it('hits a wall at the right distance with its normal', () => {
    const hit = zone.raycast({ x: 0, y: 1.5, z: -5 }, { x: 1, y: 0, z: 0 }, 100);
    expect(hit?.id).toBe('b1');
    expect(hit?.t).toBeCloseTo(10, 5);
    expect(hit?.nx).toBeCloseTo(-1, 5);
  });

  it('misses when the ray is too short or passes over', () => {
    expect(zone.raycast({ x: 0, y: 1.5, z: -5 }, { x: 1, y: 0, z: 0 }, 5)).toBeNull();
    expect(zone.raycast({ x: 0, y: 12, z: -5 }, { x: 1, y: 0, z: 0 }, 100)).toBeNull();
  });

  it('stops at the flat ground', () => {
    const hit = zone.raycast({ x: 50, y: 2, z: 50 }, { x: 0, y: -1, z: 0 }, 100);
    expect(hit?.id).toBe('ground');
    expect(hit?.t).toBeCloseTo(2, 5);
    expect(zone.raycast({ x: 50, y: 2, z: 50 }, { x: 0, y: 1, z: 0 }, 100)).toBeNull();
  });

  it('hits a roof from above and a prop', () => {
    const roof = zone.raycast({ x: 15, y: 20, z: -5 }, { x: 0, y: -1, z: 0 }, 100);
    expect(roof?.t).toBeCloseTo(10, 5);
    const tree = zone.raycast({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -1 }, 100);
    expect(tree?.id).toBe('prop:0');
    expect(tree?.t).toBeCloseTo(19.5, 5);
  });
});

describe('shotSpread', () => {
  const def = WEAPONS.rifle;
  const still = { ads: false, speed: 0, onGround: true, crouching: false };
  it('grows with speed and air, shrinks crouched and aiming', () => {
    const base = shotSpread(def, still);
    expect(base).toBe(def.spreadHip);
    expect(shotSpread(def, { ...still, speed: SPREAD_FULL_SPEED })).toBeCloseTo(
      def.spreadHip + def.spreadMove,
    );
    expect(shotSpread(def, { ...still, speed: 99 })).toBeCloseTo(def.spreadHip + def.spreadMove);
    expect(shotSpread(def, { ...still, onGround: false })).toBeCloseTo(def.spreadHip + def.spreadAir);
    expect(shotSpread(def, { ...still, crouching: true })).toBeCloseTo(
      def.spreadHip - def.spreadCrouch,
    );
    const ads = shotSpread(def, { ...still, ads: true });
    expect(ads).toBeCloseTo(def.spreadAds);
    // moving while aiming costs 30% of the hip movement penalty, and crouching no longer helps
    expect(shotSpread(def, { ...still, ads: true, speed: SPREAD_FULL_SPEED })).toBeCloseTo(
      def.spreadAds + def.spreadMove * 0.3,
    );
    expect(shotSpread(def, { ...still, ads: true, crouching: true })).toBeCloseTo(ads);
  });
  it('an empty weapon takes longer to reload than a tactical reload', () => {
    for (const w of Object.values(WEAPONS)) expect(w.reloadTimeEmpty).toBeGreaterThan(w.reloadTime);
  });
});
