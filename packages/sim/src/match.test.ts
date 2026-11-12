import type { GameEvent, MatchConfig, PlayerInput } from '@folktown/shared';
import { RESPAWN_DELAY, TICK_DT, WEAPONS } from '@folktown/shared';
import { describe, expect, it } from 'vitest';
import { falloffFactor, Match, makeSyntheticZone } from './index.ts';

const EAST = -Math.PI / 2;

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

function cfg(over: Partial<MatchConfig> = {}): MatchConfig {
  return {
    mode: 'ffa',
    difficulty: 'normal',
    botCount: 0,
    scoreLimit: 10,
    timeLimit: 600,
    ...over,
  };
}

/** Player 1 at (-50,0,0) facing -z, player 2 `d` metres ahead. Spawn protection cleared. */
function duel(d: number, over: Partial<MatchConfig> = {}, seed = 1) {
  const m = new Match(cfg(over), makeSyntheticZone(), seed);
  const a = m.addPlayer({ id: 1, name: 'a', team: 0, isBot: false });
  const b = m.addPlayer({ id: 2, name: 'b', team: over.mode === 'tdm' ? 0 : 1, isBot: false });
  a.pos = { x: -50, y: 0, z: 0 };
  a.yaw = 0;
  b.pos = { x: -50, y: 0, z: -d };
  a.spawnProtection = 0;
  b.spawnProtection = 0;
  return { m, a, b };
}

function run(m: Match, inp: Partial<PlayerInput>, ticks: number, shooter = 1): GameEvent[] {
  const out: GameEvent[] = [];
  for (let i = 0; i < ticks; i++) {
    out.push(...m.step(new Map([[shooter, input({ ...inp, tick: i })]]), TICK_DT));
  }
  return out;
}

const hits = (e: GameEvent[]) => e.filter((x) => x.type === 'hit');
const dmgOf = (e: GameEvent | undefined) => (e?.type === 'hit' ? e.damage : -1);

describe('weapons', () => {
  it('falloff is full up close, minimum far, linear between', () => {
    const r = WEAPONS.rifle;
    expect(falloffFactor(r, 5)).toBe(1);
    expect(falloffFactor(r, 200)).toBe(r.minDamageFraction);
    expect(falloffFactor(r, 55)).toBeCloseTo(0.75, 6);
  });

  it('damage falls off with distance in a real shot', () => {
    const near = duel(5);
    const far = duel(40);
    const n = hits(run(near.m, { fire: true, ads: true, pitch: -0.05 }, 1));
    const f = hits(run(far.m, { fire: true, ads: true, pitch: -0.01 }, 1));
    expect(n).toHaveLength(1);
    expect(f).toHaveLength(1);
    expect(dmgOf(n[0])).toBeCloseTo(28, 3);
    expect(dmgOf(f[0])).toBeGreaterThan(24);
    expect(dmgOf(f[0])).toBeLessThan(26);
  });

  it('headshot does double damage', () => {
    const { m } = duel(10);
    const e = hits(run(m, { fire: true, ads: true, pitch: Math.atan2(0.03, 10) }, 1));
    expect(dmgOf(e[0])).toBeCloseTo(56, 3);
    expect(e[0]?.type === 'hit' && e[0].headshot).toBe(true);
  });

  it('body shot is single damage', () => {
    const { m } = duel(10);
    const e = hits(run(m, { fire: true, ads: true, pitch: -0.05 }, 1));
    expect(dmgOf(e[0])).toBeCloseTo(28, 3);
  });

  it('shotgun fires several pellets, summed into one hit', () => {
    const { m, b } = duel(4);
    run(m, { switchWeapon: 'shotgun' }, 20);
    b.health = 1000;
    const e = hits(run(m, { fire: true, ads: true, pitch: -0.08 }, 1));
    expect(e).toHaveLength(1);
    expect(dmgOf(e[0])).toBeGreaterThan(WEAPONS.shotgun.damage * 3);
    expect(b.health).toBeLessThan(1000 - WEAPONS.shotgun.damage * 3);
  });

  it('a wall blocks bullets', () => {
    // b1 spans x 10..20, z -10..0. Shooter at x=0 facing east, target behind the wall at x=30.
    const { m, a, b } = duel(30);
    a.pos = { x: 0, y: 0, z: -5 };
    b.pos = { x: 30, y: 0, z: -5 };
    const e = run(m, { fire: true, ads: true, yaw: EAST, pitch: -0.02 }, 20);
    expect(e.some((x) => x.type === 'shot')).toBe(true);
    expect(hits(e)).toHaveLength(0);
    expect(b.health).toBe(100);
  });

  it('rate of fire and ammo limit shots, reload refills', () => {
    const { m, a } = duel(10);
    const shots = run(m, { fire: true, pitch: 0.5 }, 60).filter((x) => x.type === 'shot');
    // 650 rpm is about 10.8 per second.
    expect(shots.length).toBeGreaterThanOrEqual(10);
    expect(shots.length).toBeLessThanOrEqual(12);
    expect(a.ammo.rifle).toBe(30 - shots.length);
    run(m, { reload: true }, 1);
    expect(a.reloadLeft).toBeGreaterThan(0);
    run(m, { fire: true }, 30); // cannot fire while reloading
    expect(a.ammo.rifle).toBe(30 - shots.length);
    run(m, {}, 150);
    expect(a.reloadLeft).toBe(0);
    expect(a.ammo.rifle).toBe(30);
  });

  it('empty magazine starts a reload', () => {
    const { m, a } = duel(10);
    a.ammo.pistol = 0;
    run(m, { switchWeapon: 'pistol' }, 1);
    run(m, { fire: true }, 1);
    expect(a.reloadLeft).toBeGreaterThan(0);
  });

  it('recoil accumulates while firing and recovers', () => {
    const { m, a } = duel(10);
    run(m, { fire: true, pitch: 0.5 }, 30);
    expect(a.recoilPitch).toBeGreaterThan(0.005);
    expect(a.shotsInBurst).toBeGreaterThan(1);
    run(m, {}, 120);
    expect(a.recoilPitch).toBe(0);
    expect(a.shotsInBurst).toBe(0);
  });
});

describe('match rules', () => {
  it('kill credits the shooter, victim respawns after the delay with protection', () => {
    const { m, a, b } = duel(10);
    const e = run(m, { fire: true, ads: true, pitch: Math.atan2(0.03, 10) }, 30);
    const kill = e.find((x) => x.type === 'kill');
    expect(kill).toMatchObject({ killer: 1, victim: 2 });
    expect(a.kills).toBe(1);
    expect(b.deaths).toBe(1);
    expect(b.alive).toBe(false);
    const after = run(m, {}, Math.round(RESPAWN_DELAY / TICK_DT) + 2);
    expect(after.some((x) => x.type === 'respawn' && x.player === 2)).toBe(true);
    expect(b.alive).toBe(true);
    expect(b.health).toBe(100);
    expect(b.spawnProtection).toBeGreaterThan(0);
  });

  it('respawn picks a spawn far from the enemy', () => {
    const { m, a, b } = duel(10);
    b.alive = false;
    b.respawnIn = 0.01;
    a.pos = { x: 60, y: 0, z: 0 }; // on top of spawn 0
    run(m, {}, 2);
    expect(Math.hypot(b.pos.x - a.pos.x, b.pos.z - a.pos.z)).toBeGreaterThan(90);
  });

  it('spawn protection blocks damage', () => {
    const { m, b } = duel(10);
    b.spawnProtection = 5;
    const e = hits(run(m, { fire: true, ads: true, pitch: -0.05 }, 1));
    expect(e).toHaveLength(0);
    expect(b.health).toBe(100);
  });

  it('FFA ends when a player reaches the score limit', () => {
    const { m, a, b } = duel(10, { scoreLimit: 2 });
    a.kills = 1;
    const e = run(m, { fire: true, ads: true, pitch: Math.atan2(0.03, 10) }, 30);
    expect(e.find((x) => x.type === 'matchEnd')).toMatchObject({ winner: 1 });
    expect(m.snapshot().ended).toBe(true);
    expect(m.snapshot().winner).toBe(1);
    expect(b.alive).toBe(false);
    const tick = m.snapshot().tick;
    run(m, {}, 10);
    expect(m.snapshot().tick).toBe(tick);
  });

  it('time limit ends the match with the leader as winner', () => {
    const { m, a } = duel(10, { timeLimit: 1 });
    a.kills = 3;
    const e = run(m, {}, 61);
    expect(e.find((x) => x.type === 'matchEnd')).toMatchObject({ winner: 1 });
  });

  it('TDM: no friendly fire, enemy kills score for the team', () => {
    const { m, a, b } = duel(10, { mode: 'tdm', scoreLimit: 1 });
    const e = hits(run(m, { fire: true, ads: true, pitch: -0.05 }, 20));
    expect(e).toHaveLength(0);
    expect(b.health).toBe(100);
    b.team = 1;
    const e2 = run(m, { fire: true, ads: true, pitch: Math.atan2(0.03, 10) }, 30);
    expect(e2.some((x) => x.type === 'kill')).toBe(true);
    expect(a.kills).toBe(1);
    expect(m.snapshot().teamScores).toEqual([1, 0]);
    expect(m.snapshot().winner).toBe(0);
  });

  it('TDM spawns players at their own team spawns', () => {
    const m = new Match(cfg({ mode: 'tdm' }), makeSyntheticZone(), 5);
    const zone = makeSyntheticZone();
    for (let i = 0; i < 6; i++) {
      const p = m.addPlayer({ id: i, name: `p${i}`, team: (i % 2) as 0 | 1, isBot: false });
      const ok = zone.spawns.some((s) => s.team === p.team && s.x === p.pos.x && s.z === p.pos.z);
      expect(ok).toBe(true);
    }
  });

  it('is deterministic: same seed gives an identical snapshot after 600 ticks', () => {
    const play = (seed: number) => {
      const m = new Match(cfg({ scoreLimit: 999 }), makeSyntheticZone(), seed);
      for (let i = 0; i < 4; i++) m.addPlayer({ id: i, name: `p${i}`, team: 0, isBot: i > 0 });
      for (let t = 0; t < 600; t++) {
        const inputs = new Map<number, PlayerInput>();
        for (let i = 0; i < 4; i++) {
          inputs.set(
            i,
            input({
              tick: t,
              moveZ: 1,
              moveX: Math.sin((t + i * 17) / 40),
              yaw: ((t * (i + 1)) / 30) % (Math.PI * 2),
              fire: t % 7 < 4,
              reload: t % 200 === 150,
              jump: t % 90 === i,
            }),
          );
        }
        m.step(inputs);
      }
      return JSON.stringify(m.snapshot());
    };
    expect(play(42)).toBe(play(42));
    expect(play(42)).not.toBe(play(43));
  });
});
