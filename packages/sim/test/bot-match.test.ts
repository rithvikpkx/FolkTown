import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MatchConfig, ZoneData } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import { navGraphFor, runBotMatch } from '../src/index.ts';

const load = (name: string) =>
  JSON.parse(
    readFileSync(
      join(import.meta.dirname, '..', '..', '..', 'data', 'zones', `${name}.json`),
      'utf8',
    ),
  ) as ZoneData;

function cfg(mode: 'ffa' | 'tdm'): MatchConfig {
  return {
    mode,
    difficulty: 'normal',
    botCount: 32,
    scoreLimit: mode === 'ffa' ? 25 : 40,
    timeLimit: 600,
  };
}

function summary(r: ReturnType<typeof runBotMatch>): string {
  const s = r.match.snapshot();
  return JSON.stringify([s.teamScores, s.winner, s.players.map((p) => [p.kills, p.deaths])]);
}

describe.each(['engineering-mall', 'purdue-mall'])('%s', (zoneName) => {
  const zone = load(zoneName);
  describe('nav', () => {
    it('A* finds a path between spawns on the real zone', () => {
      const g = navGraphFor(zone);
      const s0 = zone.spawns[0];
      const s1 = zone.spawns[12];
      expect(s0).toBeDefined();
      expect(s1).toBeDefined();
      const p = g.path(g.nearest(s0?.x ?? 0, s0?.z ?? 0), g.nearest(s1?.x ?? 0, s1?.z ?? 0));
      expect(p).not.toBeNull();
      expect(p?.length ?? 0).toBeGreaterThan(2);
    });
  });

  describe('32-bot headless match', () => {
    for (const mode of ['ffa', 'tdm'] as const) {
      it(`${mode}: runs start to finish`, () => {
        const t0 = performance.now();
        const r = runBotMatch(cfg(mode), zone, 42, 60 * 600);
        const secs = (performance.now() - t0) / 1000;
        console.log(
          `${mode}: ${r.ticks} ticks (${(r.ticks / 60).toFixed(0)} s game time) in ${secs.toFixed(2)} s`,
        );
        expect(r.ended).toBe(true);
        expect(r.events.some((e) => e.type === 'matchEnd')).toBe(true);
        expect(r.events.filter((e) => e.type === 'kill').length).toBeGreaterThan(10);
        const b = zone.bounds;
        for (const p of r.match.playerList) {
          expect(Number.isFinite(p.pos.x + p.pos.y + p.pos.z + p.yaw + p.pitch)).toBe(true);
          expect(p.pos.x).toBeGreaterThan(b.minX - 3);
          expect(p.pos.x).toBeLessThan(b.maxX + 3);
          expect(p.pos.z).toBeGreaterThan(b.minZ - 3);
          expect(p.pos.z).toBeLessThan(b.maxZ + 3);
        }
        // 32 bots must fit well inside a 16 ms tick on the larger zone too.
        expect((secs * 1000) / r.ticks).toBeLessThan(3);
      }, 90_000);

      it(`${mode}: same seed gives the same result`, () => {
        const a = runBotMatch(cfg(mode), zone, 7, 60 * 120);
        const b = runBotMatch(cfg(mode), zone, 7, 60 * 120);
        expect(summary(a)).toBe(summary(b));
        expect(a.ticks).toBe(b.ticks);
      }, 60_000);
    }
  });
});
