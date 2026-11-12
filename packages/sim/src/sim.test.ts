import type { PlayerInput, PlayerState } from '@folktown/shared';
import { PLAYER_RADIUS, SPRINT_SPEED, TICK_DT, WALK_SPEED } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import { createPlayerState, makeSyntheticZone, stepController, ZoneCollision } from './index.ts';

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
    run(p, { moveZ: 1, jump: true, yaw: 0 }, 30);
    run(p, {}, 60);
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
    expect(30 - w.pos.z).toBeCloseTo(WALK_SPEED, 1);
    const s = createPlayerState(2, 0, 0, 0, 30);
    run(s, {}, 2);
    run(s, { moveZ: 1, yaw: 0, sprint: true }, 60);
    expect(30 - s.pos.z).toBeCloseTo(SPRINT_SPEED, 1);
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

  it('hits a roof from above and a prop', () => {
    const roof = zone.raycast({ x: 15, y: 20, z: -5 }, { x: 0, y: -1, z: 0 }, 100);
    expect(roof?.t).toBeCloseTo(10, 5);
    const tree = zone.raycast({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -1 }, 100);
    expect(tree?.id).toBe('prop:0');
    expect(tree?.t).toBeCloseTo(19.5, 5);
  });
});
