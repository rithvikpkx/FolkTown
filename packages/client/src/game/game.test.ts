import type { MatchConfig, ZoneData } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import zoneJson from '../../../../data/zones/engineering-mall.json';
import { cameraPose } from './camera';
import { InputState } from './input';
import { GameSession } from './session';

const zone = zoneJson as unknown as ZoneData;
const config: MatchConfig = {
  mode: 'ffa',
  difficulty: 'normal',
  botCount: 3,
  scoreLimit: 25,
  timeLimit: 600,
};

describe('input', () => {
  it('moving the mouse right turns right (negative yaw) and up looks up', () => {
    const s = new InputState();
    s.look(100, -50);
    expect(s.yaw).toBeLessThan(0);
    expect(s.pitch).toBeGreaterThan(0);
  });
  it('reload and switch are one-shot; movement follows keys', () => {
    const s = new InputState();
    s.keyDown('KeyW');
    s.keyDown('KeyR');
    s.keyDown('Digit2');
    const a = s.sample();
    expect(a.moveZ).toBe(1);
    expect(a.reload).toBe(true);
    expect(a.switchWeapon).toBe('pistol');
    const b = s.sample();
    expect(b.reload).toBe(false);
    expect(b.switchWeapon).toBeUndefined();
  });
});

describe('session', () => {
  it('steps at 60 Hz, forward input moves the player along the yaw', () => {
    const g = new GameSession(zone, config, 1);
    const inp = new InputState(g.player.yaw);
    inp.keyDown('KeyW');
    const start = { ...g.player.pos };
    for (let i = 0; i < 60; i++) g.advance(1 / 60, () => inp.sample());
    const d = Math.hypot(g.player.pos.x - start.x, g.player.pos.z - start.z);
    expect(d).toBeGreaterThan(1);
    expect(g.match.snapshot().tick).toBeGreaterThanOrEqual(55);
  });
  it('camera yaw subtracts recoil yaw, pitch adds recoil pitch', () => {
    const g = new GameSession(zone, config, 1);
    const p = { ...g.player, recoilPitch: 0.1, recoilYaw: 0.02 };
    const c = cameraPose(p, p.pos, { yaw: 1, pitch: 0.2 });
    expect(c.yaw).toBeCloseTo(0.98);
    expect(c.pitch).toBeCloseTo(0.3);
  });
});
