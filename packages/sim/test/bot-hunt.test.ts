import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MatchConfig, PlayerInput, ZoneData } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import { BotController, Match } from '../src/index.ts';

const zone = JSON.parse(
  readFileSync(
    join(import.meta.dirname, '..', '..', '..', 'data', 'zones', 'engineering-mall.json'),
    'utf8',
  ),
) as ZoneData;

describe('bots hunt a stationary player', () => {
  it.each([1, 2, 3, 4])('seed %i: the human is shot at within 120 s', (seed) => {
    const cfg: MatchConfig = {
      mode: 'ffa',
      difficulty: 'normal',
      botCount: 7,
      scoreLimit: 25,
      timeLimit: 600,
    };
    const m = new Match(cfg, zone, seed);
    const c = new BotController(m, seed);
    m.addPlayer({ id: 0, name: 'You', team: 0, isBot: false });
    for (let i = 1; i <= 7; i++) {
      m.addPlayer({ id: i, name: `b${i}`, team: 1, isBot: true });
      c.addBot(i);
    }
    const idle = (tick: number): PlayerInput => ({
      tick,
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
    });
    const me = m.getPlayer(0);
    let hurt = false;
    for (let t = 0; t < 120 * 60 && !hurt; t++) {
      const inp = c.inputs();
      inp.set(0, idle(t));
      m.step(inp);
      hurt = (me?.health ?? 100) < 100 || !me?.alive;
    }
    expect(hurt).toBe(true);
  });
});
