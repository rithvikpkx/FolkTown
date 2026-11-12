import type { Difficulty, MatchConfig, ZoneData } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import {
  aimErrorScale,
  BOT_PARAMS,
  BotBrain,
  createPlayerState,
  navGraphFor,
  runBotMatch,
  ZoneCollision,
} from './index.ts';
import { makeSyntheticZone } from './synthetic-zone.ts';

function gridZone(): ZoneData {
  const z = makeSyntheticZone();
  const nodes = [];
  const edges: [number, number][] = [];
  const n = 12;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const id = j * n + i;
      nodes.push({ id, x: -60 + i * 6, z: -60 + j * 6 });
      if (i > 0) edges.push([id, id - 1]);
      if (j > 0) edges.push([id, id - n]);
    }
  }
  return { ...z, nav: { nodes, edges } };
}

function duelConfig(difficulty: Difficulty): MatchConfig {
  return { mode: 'ffa', difficulty, botCount: 2, scoreLimit: 5, timeLimit: 240 };
}

describe('nav', () => {
  it('finds a path across a grid and the nearest node', () => {
    const g = navGraphFor(gridZone());
    expect(g.nearest(-59, -61)).toBe(0);
    const p = g.path(0, 143);
    expect(p?.[0]).toBe(0);
    expect(p?.at(-1)).toBe(143);
    expect(p?.length).toBe(23);
    expect(g.path(0, 0)).toEqual([0]);
  });
});

describe('bot duel', () => {
  it('two bots move, shoot and score kills', () => {
    const zone = gridZone();
    const r = runBotMatch(duelConfig('normal'), zone, 3, 60 * 240);
    const kills = r.events.filter((e) => e.type === 'kill').length;
    expect(kills).toBeGreaterThan(0);
    expect(r.events.some((e) => e.type === 'shot')).toBe(true);
    for (const p of r.match.playerList) {
      expect(Number.isFinite(p.pos.x + p.pos.y + p.pos.z)).toBe(true);
    }
  });

  it('hard is not worse than easy in aggregate', () => {
    const zone = gridZone();
    let hard = 0;
    let easy = 0;
    for (let seed = 1; seed <= 6; seed++) {
      const r = runBotMatch(duelConfig('normal'), zone, seed, 60 * 240, ['hard', 'easy']);
      hard += r.match.getPlayer(1)?.kills ?? 0;
      easy += r.match.getPlayer(2)?.kills ?? 0;
    }
    expect(hard).toBeGreaterThanOrEqual(easy);
    expect(hard).toBeGreaterThan(0);
  });
});

describe('bot perception upgrades', () => {
  const zone = gridZone();
  const col = new ZoneCollision(zone);

  it('aim error is worst on first sight and against fast targets', () => {
    expect(aimErrorScale(0, 0)).toBeGreaterThan(aimErrorScale(1, 0));
    expect(aimErrorScale(1, 0)).toBe(1);
    expect(aimErrorScale(1, 7)).toBeGreaterThan(aimErrorScale(1, 2));
    expect(aimErrorScale(5, -3)).toBe(1); // clamped
  });

  it('a shot heard from behind a building sends the bot to investigate', () => {
    const brain = new BotBrain(1, 'normal', zone, col, 'ffa', 1);
    const self = createPlayerState(1, 0, 0, 0, -5);
    const shooter = createPlayerState(2, 1, 30, 0, -5); // b1 (x 10.., z -10..0) is in between
    brain.think(self, [self, shooter], 1, 0.02);
    expect(brain.state).toBe('patrol');
    brain.hear(self, shooter, 0.05);
    brain.think(self, [self, shooter], 2, 0.07);
    expect(brain.state).toBe('chase');
  });

  it('ignores shots out of range, from itself, and from teammates', () => {
    const brain = new BotBrain(1, 'easy', zone, col, 'tdm', 1);
    const self = createPlayerState(1, 0, 0, 0, -5);
    const far = createPlayerState(2, 1, 30 + BOT_PARAMS.easy.hear, 0, -5);
    brain.hear(self, far, 1);
    brain.hear(self, self, 1);
    const mate = createPlayerState(3, 0, 25, 0, -5);
    brain.hear(self, mate, 1);
    brain.think(self, [self, far, mate], 3, 1.05);
    expect(brain.state).toBe('patrol');
  });

  it('caps how many bots fire at one target at once', () => {
    const peers = new Map<number, BotBrain>();
    const mk = (id: number) => {
      const b = new BotBrain(id, 'normal', zone, col, 'ffa', 1);
      b.peers = peers;
      peers.set(id, b);
      return b as unknown as Record<string, unknown> & BotBrain;
    };
    const [a, b, c] = [mk(1), mk(2), mk(3)];
    for (const x of [b, c]) {
      x.wasAlive = true;
      x.burstLeft = 1;
      x.visible = true;
      x.targetId = 9;
    }
    const count = (a as unknown as { shootersOn(t: number): number }).shootersOn(9);
    expect(count).toBe(2);
    expect(count).toBeGreaterThanOrEqual(BOT_PARAMS.normal.maxShooters);
    (c as Record<string, unknown>).targetId = 5;
    expect((a as unknown as { shootersOn(t: number): number }).shootersOn(9)).toBe(1);
  });
});
