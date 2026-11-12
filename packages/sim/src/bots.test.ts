import type { Difficulty, MatchConfig, ZoneData } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import { navGraphFor, runBotMatch } from './index.ts';
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
