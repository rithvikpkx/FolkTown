import type { PlayerState } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import { menuQuery, needsMenu } from './menu';
import { sortScores } from './scoreboard';

const p = (id: number, team: 0 | 1, kills: number, deaths: number) =>
  ({ id, name: `P${id}`, team, kills, deaths }) as PlayerState;

describe('ui helpers', () => {
  it('sorts ffa by kills then deaths', () => {
    const r = sortScores([p(1, 0, 2, 1), p(2, 0, 5, 3), p(3, 0, 5, 1)], 'ffa');
    expect(r.map((x) => x.id)).toEqual([3, 2, 1]);
  });
  it('groups tdm by team', () => {
    const r = sortScores([p(1, 1, 9, 0), p(2, 0, 1, 0), p(3, 0, 4, 0)], 'tdm');
    expect(r.map((x) => x.id)).toEqual([3, 2, 1]);
  });
  it('builds and detects menu queries', () => {
    expect(menuQuery('tdm', 'hard', 99)).toBe('?mode=tdm&diff=hard&bots=31');
    expect(needsMenu('')).toBe(true);
    expect(needsMenu('?bots=3')).toBe(false);
  });
});
