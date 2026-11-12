import type {
  GameEvent,
  MatchConfig,
  MatchState,
  PlayerInput,
  PlayerState,
  Team,
  Vec3,
  ZoneData,
} from '@folktown/shared';
import {
  EYE_HEIGHT,
  EYE_HEIGHT_CROUCH,
  HEAD_ZONE,
  HEADSHOT_MULTIPLIER,
  MAX_HEALTH,
  PLAYER_HEIGHT,
  PLAYER_HEIGHT_CROUCH,
  PLAYER_RADIUS,
  RESPAWN_DELAY,
  SPAWN_PROTECTION,
  TICK_DT,
  WEAPONS,
} from '@folktown/shared';
import { ZoneCollision } from './collision.ts';
import { createPlayerState, stepController } from './controller.ts';
import { Rng } from './rng.ts';
import { falloffFactor, offsetCone, rayCylinder, viewDir } from './weapons.ts';

export interface NewPlayer {
  id: number;
  name: string;
  team: Team;
  isBot: boolean;
}

const MAX_RANGE = 300;
/** Seconds without firing before the recoil pattern restarts. */
const BURST_RESET = 0.25;
/** Per-second exponential rate at which view recoil recovers. */
const RECOIL_RECOVERY = 8;
/** Spread grows by this fraction of base per consecutive shot, up to SPREAD_MAX_SHOTS. */
const SPREAD_GROWTH = 0.12;
const SPREAD_MAX_SHOTS = 8;
const SWITCH_DELAY = 0.25;

interface Internal {
  prevFire: boolean;
  sinceFire: number;
}

const IDLE: PlayerInput = {
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
};

type Inputs = ReadonlyMap<number, PlayerInput> | Record<number, PlayerInput>;

/** Authoritative match rules. Pure: no rendering, DOM or node imports. Stepped at 60 Hz. */
export class Match {
  readonly config: MatchConfig;
  readonly zone: ZoneData;
  readonly collision: ZoneCollision;
  private readonly rng: Rng;
  private readonly players: PlayerState[] = [];
  private readonly byId = new Map<number, PlayerState>();
  private readonly internal = new Map<number, Internal>();
  private tick = 0;
  private time = 0;
  private teamScores: [number, number] = [0, 0];
  private ended = false;
  private winner: number | null = null;
  private pending: GameEvent[] = [];

  constructor(config: MatchConfig, zone: ZoneData, seed: number) {
    this.config = config;
    this.zone = zone;
    this.collision = new ZoneCollision(zone);
    this.rng = new Rng(seed);
  }

  /** Adds a player and spawns them. Returns the live state (mutating it is for tests only). */
  addPlayer(p: NewPlayer): PlayerState {
    const st = createPlayerState(p.id, p.team, 0, 0, 0);
    st.name = p.name;
    st.isBot = p.isBot;
    this.players.push(st);
    this.byId.set(p.id, st);
    this.internal.set(p.id, { prevFire: false, sinceFire: 99 });
    this.spawn(st);
    return st;
  }

  /** Live player states in join order. Read-only by contract: bots and tools read, never write. */
  get playerList(): readonly PlayerState[] {
    return this.players;
  }

  get isEnded(): boolean {
    return this.ended;
  }

  getPlayer(id: number): PlayerState | undefined {
    return this.byId.get(id);
  }

  /**
   * Advance one tick. Returns the events of this tick (plus spawns from `addPlayer` since the
   * last step). Does nothing once the match has ended.
   */
  step(inputsById: Inputs, dt = TICK_DT): GameEvent[] {
    const events = this.pending;
    this.pending = [];
    if (this.ended) return events;
    this.tick++;
    this.time += dt;
    const get = (id: number): PlayerInput | undefined =>
      inputsById instanceof Map
        ? inputsById.get(id)
        : (inputsById as Record<number, PlayerInput>)[id];

    for (const p of this.players) {
      if (!p.alive) {
        p.respawnIn -= dt;
        if (p.respawnIn <= 1e-9) this.spawn(p, events);
        continue;
      }
      const input = get(p.id) ?? { ...IDLE, yaw: p.yaw, pitch: p.pitch };
      p.spawnProtection = Math.max(0, p.spawnProtection - dt);
      stepController(p, input, this.collision, dt);
      this.stepWeapon(p, input, dt, events);
      if (this.ended) return events;
    }
    if (this.time >= this.config.timeLimit - 1e-9) this.finishOnTime(events);
    return events;
  }

  snapshot(): MatchState {
    // JSON round trip: a deep copy without needing DOM typings.
    return JSON.parse(
      JSON.stringify({
        config: this.config,
        tick: this.tick,
        time: this.time,
        players: this.players,
        teamScores: this.teamScores,
        ended: this.ended,
        winner: this.winner,
      }),
    );
  }

  // ---- weapons ----

  private stepWeapon(p: PlayerState, input: PlayerInput, dt: number, events: GameEvent[]): void {
    const it = this.internal.get(p.id) as Internal;
    p.fireCooldown = Math.max(0, p.fireCooldown - dt);
    it.sinceFire += dt;

    if (input.switchWeapon && input.switchWeapon !== p.weapon) {
      p.weapon = input.switchWeapon;
      p.reloadLeft = 0;
      p.fireCooldown = Math.max(p.fireCooldown, SWITCH_DELAY);
      p.shotsInBurst = 0;
    }
    const def = WEAPONS[p.weapon];

    if (p.reloadLeft > 0) {
      p.reloadLeft -= dt;
      if (p.reloadLeft <= 1e-9) {
        p.reloadLeft = 0;
        p.ammo[p.weapon] = def.mag;
      }
    } else if (
      (input.reload || (input.fire && p.ammo[p.weapon] <= 0)) &&
      p.ammo[p.weapon] < def.mag
    ) {
      p.reloadLeft = def.reloadTime;
    }

    const pressed = input.fire && (def.auto || !it.prevFire);
    it.prevFire = input.fire;
    if (pressed && p.reloadLeft === 0 && p.fireCooldown <= 1e-9 && p.ammo[p.weapon] > 0) {
      if (it.sinceFire > BURST_RESET) p.shotsInBurst = 0;
      this.fire(p, input, events);
      p.ammo[p.weapon]--;
      p.fireCooldown += 60 / def.rpm;
      it.sinceFire = 0;
      const r = def.recoil[Math.min(p.shotsInBurst, def.recoil.length - 1)] as [number, number];
      p.recoilPitch += r[0];
      p.recoilYaw += r[1];
      p.shotsInBurst++;
    } else if (it.sinceFire > BURST_RESET) {
      p.shotsInBurst = 0;
    }
    if (it.sinceFire > 0.05) {
      const k = Math.exp(-RECOIL_RECOVERY * dt);
      p.recoilPitch *= k;
      p.recoilYaw *= k;
      if (Math.abs(p.recoilPitch) < 1e-6) p.recoilPitch = 0;
      if (Math.abs(p.recoilYaw) < 1e-6) p.recoilYaw = 0;
    }
  }

  private fire(p: PlayerState, input: PlayerInput, events: GameEvent[]): void {
    const def = WEAPONS[p.weapon];
    const eye: Vec3 = {
      x: p.pos.x,
      y: p.pos.y + (p.crouching ? EYE_HEIGHT_CROUCH : EYE_HEIGHT),
      z: p.pos.z,
    };
    // Recoil yaw is to the right, which is negative yaw.
    const base = viewDir(p.yaw - p.recoilYaw, p.pitch + p.recoilPitch);
    const growth = 1 + SPREAD_GROWTH * Math.min(p.shotsInBurst, SPREAD_MAX_SHOTS);
    const spread = (input.ads ? def.spreadAds : def.spreadHip) * growth;
    events.push({
      type: 'shot',
      tick: this.tick,
      shooter: p.id,
      weapon: p.weapon,
      origin: eye,
      dir: base,
    });

    const dealt = new Map<number, { damage: number; point: Vec3; head: boolean }>();
    for (let i = 0; i < def.pellets; i++) {
      const dir = offsetCone(
        base,
        spread * Math.sqrt(this.rng.next()),
        this.rng.next() * Math.PI * 2,
      );
      const wall = this.collision.raycast(eye, dir, MAX_RANGE);
      let bestT = wall ? wall.t : MAX_RANGE;
      let target: PlayerState | null = null;
      let head = false;
      for (const q of this.players) {
        if (q === p || !q.alive || q.spawnProtection > 0) continue;
        if (this.config.mode === 'tdm' && q.team === p.team) continue;
        const h = q.crouching ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT;
        const t = rayCylinder(
          eye,
          dir,
          q.pos.x,
          q.pos.z,
          PLAYER_RADIUS,
          q.pos.y,
          q.pos.y + h,
          bestT,
        );
        if (t !== null && t < bestT) {
          bestT = t;
          target = q;
          head = eye.y + dir.y * t >= q.pos.y + h - HEAD_ZONE;
        }
      }
      if (!target) continue;
      const dmg = def.damage * falloffFactor(def, bestT) * (head ? HEADSHOT_MULTIPLIER : 1);
      const point = {
        x: eye.x + dir.x * bestT,
        y: eye.y + dir.y * bestT,
        z: eye.z + dir.z * bestT,
      };
      const acc = dealt.get(target.id);
      if (acc) {
        acc.damage += dmg;
        acc.head = acc.head || head;
      } else dealt.set(target.id, { damage: dmg, point, head });
    }
    for (const [id, d] of dealt) {
      const target = this.byId.get(id) as PlayerState;
      target.health -= d.damage;
      events.push({
        type: 'hit',
        tick: this.tick,
        shooter: p.id,
        target: id,
        damage: d.damage,
        point: d.point,
        headshot: d.head,
      });
      if (target.health <= 0) this.kill(p, target, events);
      if (this.ended) return;
    }
  }

  private kill(killer: PlayerState, victim: PlayerState, events: GameEvent[]): void {
    victim.health = 0;
    victim.alive = false;
    victim.respawnIn = RESPAWN_DELAY;
    victim.vel = { x: 0, y: 0, z: 0 };
    victim.deaths++;
    killer.kills++;
    if (this.config.mode === 'tdm') this.teamScores[killer.team]++;
    events.push({
      type: 'kill',
      tick: this.tick,
      killer: killer.id,
      victim: victim.id,
      weapon: killer.weapon,
    });
    const limit = this.config.scoreLimit;
    if (this.config.mode === 'tdm') {
      if (this.teamScores[killer.team] >= limit) this.end(killer.team, events);
    } else if (killer.kills >= limit) this.end(killer.id, events);
  }

  private end(winner: number | null, events: GameEvent[]): void {
    this.ended = true;
    this.winner = winner;
    events.push({ type: 'matchEnd', tick: this.tick, winner });
  }

  private finishOnTime(events: GameEvent[]): void {
    let winner: number | null = null;
    if (this.config.mode === 'tdm') {
      const [a, b] = this.teamScores;
      winner = a === b ? null : a > b ? 0 : 1;
    } else {
      let best = -1;
      for (const p of this.players) {
        if (p.kills > best) {
          best = p.kills;
          winner = p.id;
        } else if (p.kills === best) winner = null;
      }
    }
    this.end(winner, events);
  }

  // ---- spawning ----

  private spawn(p: PlayerState, events: GameEvent[] = this.pending): void {
    let spawns = this.zone.spawns;
    if (this.config.mode === 'tdm') {
      const mine = spawns.filter((s) => s.team === p.team);
      if (mine.length > 0) spawns = mine;
    }
    // Score each spawn by distance to the nearest living enemy; pick randomly among the best three.
    const scored = spawns.map((s, i) => {
      let d = 1e9;
      for (const q of this.players) {
        if (q === p || !q.alive) continue;
        if (this.config.mode === 'tdm' && q.team === p.team) continue;
        d = Math.min(d, Math.hypot(q.pos.x - s.x, q.pos.z - s.z));
      }
      return { s, d, i };
    });
    scored.sort((a, b) => b.d - a.d || a.i - b.i);
    const top = scored.slice(0, Math.min(3, scored.length));
    const pick = top[Math.floor(this.rng.next() * top.length)]?.s ?? { x: 0, z: 0, yaw: 0 };
    p.pos = { x: pick.x, y: this.collision.groundHeight(pick.x, pick.z), z: pick.z };
    p.vel = { x: 0, y: 0, z: 0 };
    p.yaw = pick.yaw;
    p.pitch = 0;
    p.health = MAX_HEALTH;
    p.alive = true;
    p.respawnIn = 0;
    p.spawnProtection = SPAWN_PROTECTION;
    p.weapon = 'rifle';
    p.ammo = {
      rifle: WEAPONS.rifle.mag,
      pistol: WEAPONS.pistol.mag,
      shotgun: WEAPONS.shotgun.mag,
    };
    p.reloadLeft = 0;
    p.fireCooldown = 0;
    p.shotsInBurst = 0;
    p.recoilPitch = 0;
    p.recoilYaw = 0;
    events.push({ type: 'respawn', tick: this.tick, player: p.id, pos: { ...p.pos } });
  }
}
