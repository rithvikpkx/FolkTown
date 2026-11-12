import type {
  Difficulty,
  GameEvent,
  MatchConfig,
  PlayerInput,
  PlayerState,
  WeaponId,
  ZoneData,
} from '@folktown/shared';
import { EYE_HEIGHT, EYE_HEIGHT_CROUCH, TICK_DT, WEAPONS } from '@folktown/shared';
import type { ZoneCollision } from './collision.ts';
import { Match } from './match.ts';
import { type NavGraph, navGraphFor } from './nav.ts';
import { Rng } from './rng.ts';

export interface BotParams {
  /** Seconds between spotting an enemy and the first shot. */
  reaction: number;
  /** Std-ish angular noise on the aim point, radians. */
  aimError: number;
  /** Max view turn rate, radians per second. */
  turnSpeed: number;
  /** Seconds of continuous fire per burst, [min, max]. */
  burst: [number, number];
  /** Seconds of pause between bursts, [min, max]. */
  pause: [number, number];
  /** Metres at which an enemy can be noticed. */
  sight: number;
  /** Fraction of the weapon's recoil the bot cancels with its aim. */
  recoilControl: number;
  /** Aims down sights beyond this distance (Infinity = never). */
  adsRange: number;
}

export const BOT_PARAMS: Record<Difficulty, BotParams> = {
  easy: {
    reaction: 0.7,
    aimError: 0.07,
    turnSpeed: 2.5,
    burst: [0.25, 0.6],
    pause: [0.5, 1.2],
    sight: 35,
    recoilControl: 0.2,
    adsRange: Number.POSITIVE_INFINITY,
  },
  normal: {
    reaction: 0.35,
    aimError: 0.03,
    turnSpeed: 5,
    burst: [0.4, 1.0],
    pause: [0.25, 0.7],
    sight: 55,
    recoilControl: 0.6,
    adsRange: 18,
  },
  hard: {
    reaction: 0.15,
    aimError: 0.01,
    turnSpeed: 10,
    burst: [0.6, 1.5],
    pause: [0.1, 0.35],
    sight: 80,
    recoilControl: 0.95,
    adsRange: 10,
  },
};

type BotState = 'patrol' | 'chase' | 'attack' | 'cover';

/** Ticks between perception passes (LOS raycasts). Staggered per bot. */
const THINK_TICKS = 6;
const STUCK_CHECK_TICKS = 30;
/** Preferred fighting distance per weapon, metres. */
const PREFERRED: Record<WeaponId, number> = { rifle: 24, pistol: 14, shotgun: 5 };
const EFFECTIVE: Record<WeaponId, number> = { rifle: 75, pistol: 40, shotgun: 16 };
const LOW_HEALTH = 35;

interface Point {
  x: number;
  z: number;
}

function wrapAngle(a: number): number {
  let r = (a + Math.PI) % (2 * Math.PI);
  if (r < 0) r += 2 * Math.PI;
  return r - Math.PI;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** One bot's mind. Pure: reads player states and the zone, returns a PlayerInput each tick. */
export class BotBrain {
  readonly id: number;
  readonly params: BotParams;
  state: BotState = 'patrol';
  private readonly rng: Rng;
  private readonly nav: NavGraph;
  private readonly col: ZoneCollision;
  private readonly mode: MatchConfig['mode'];
  private readonly zone: ZoneData;

  private path: Point[] = [];
  private pathIdx = 0;
  private goal: Point | null = null;
  private repathAt = 0;

  private targetId = -1;
  private lastSeen: Point | null = null;
  private lastSeenTime = -99;
  private visible = false;
  private reactionLeft = 0;
  private noSightTime = 99;

  private aimOffYaw = 0;
  private aimOffPitch = 0;
  private aimOffUntil = 0;
  private yaw = 0;
  private pitch = 0;
  private yawInit = false;

  private burstLeft = 0;
  private pauseLeft = 0;
  private strafeDir = 1;
  private strafeUntil = 0;
  private lastSwitch = -9;

  private coverNode: Point | null = null;
  private coverWait = 0;
  private coverCooldown = 0;

  private stuckPos: Point = { x: 0, z: 0 };
  private stuckCount = 0;
  private unstickUntil = 0;
  private unstickDir = 1;
  private wantedMove = false;
  private wasAlive = false;

  constructor(
    id: number,
    difficulty: Difficulty,
    zone: ZoneData,
    col: ZoneCollision,
    mode: MatchConfig['mode'],
    seed: number,
  ) {
    this.id = id;
    this.params = BOT_PARAMS[difficulty];
    this.zone = zone;
    this.col = col;
    this.mode = mode;
    this.nav = navGraphFor(zone);
    this.rng = new Rng((seed * 2654435761 + id * 40503) >>> 0);
  }

  /** Compute this tick's input. `players` is the live player list (read only). */
  think(
    self: PlayerState,
    players: readonly PlayerState[],
    tick: number,
    time: number,
  ): PlayerInput {
    const dt = TICK_DT;
    const p = this.params;
    if (!self.alive) {
      this.wasAlive = false;
      return this.idle(tick, self);
    }
    if (!this.wasAlive) this.onSpawn(self);
    this.wasAlive = true;
    if (!this.yawInit) {
      this.yaw = self.yaw;
      this.yawInit = true;
    }
    this.coverCooldown = Math.max(0, this.coverCooldown - dt);
    this.noSightTime += dt;
    if (this.reactionLeft > 0) this.reactionLeft -= dt;

    // ---- perception (staggered, a few times per second) ----
    if ((tick + this.id) % THINK_TICKS === 0) this.perceive(self, players, time);
    else if (this.visible) {
      const t = this.target(players);
      if (t && t.alive) {
        this.lastSeen = { x: t.pos.x, z: t.pos.z };
        this.lastSeenTime = time;
      } else this.visible = false;
    }
    const target = this.visible ? this.target(players) : undefined;

    // ---- state transitions ----
    const threatened = time - this.lastSeenTime < 3;
    if (
      this.state !== 'cover' &&
      self.health < LOW_HEALTH &&
      threatened &&
      this.coverCooldown <= 0
    ) {
      this.enterCover(self);
    }
    if (this.state === 'cover') {
      const close = target && Math.hypot(target.pos.x - self.pos.x, target.pos.z - self.pos.z) < 10;
      if (this.coverWait <= 0 && this.coverNode === null) {
        this.state = 'patrol';
        this.coverCooldown = 10;
      } else if (close && this.coverNode === null) {
        this.state = 'attack';
        this.coverCooldown = 10;
      }
    } else if (target) this.state = 'attack';
    else if (this.lastSeen && time - this.lastSeenTime < 6) this.state = 'chase';
    else this.state = 'patrol';

    const input: PlayerInput = {
      tick,
      moveX: 0,
      moveZ: 0,
      yaw: this.yaw,
      pitch: this.pitch,
      jump: false,
      sprint: false,
      crouch: false,
      fire: false,
      ads: false,
      reload: false,
    };

    // ---- behaviours ----
    let moveDir: Point | null = null; // world direction to walk
    let sprint = false;
    let faceDir: Point | null = null; // world direction to look when not aiming
    let aimTarget: PlayerState | undefined;

    switch (this.state) {
      case 'patrol': {
        this.lastSeen = null;
        const wp = this.follow(self, time, () => this.pickPatrolGoal(self));
        moveDir = wp;
        sprint = false;
        faceDir = wp;
        if (self.ammo[self.weapon] < WEAPONS[self.weapon].mag * 0.5) input.reload = true;
        break;
      }
      case 'chase': {
        const ls = this.lastSeen as Point;
        const near = Math.hypot(ls.x - self.pos.x, ls.z - self.pos.z) < 3;
        if (near) {
          this.lastSeen = null;
        } else {
          moveDir = this.follow(self, time, () => ls);
          sprint = true;
          faceDir = moveDir;
        }
        break;
      }
      case 'attack': {
        aimTarget = target;
        if (target) moveDir = this.attackMove(self, target, time);
        break;
      }
      case 'cover': {
        if (this.coverNode) {
          const cn = this.coverNode;
          if (Math.hypot(cn.x - self.pos.x, cn.z - self.pos.z) < 2) {
            this.coverNode = null;
            this.coverWait = 2.5 + this.rng.next() * 2;
          } else {
            moveDir = this.follow(self, time, () => cn);
            sprint = true;
            faceDir = moveDir;
          }
        } else {
          this.coverWait -= dt;
          faceDir = this.lastSeen
            ? { x: this.lastSeen.x - self.pos.x, z: this.lastSeen.z - self.pos.z }
            : null;
          if (self.ammo[self.weapon] < WEAPONS[self.weapon].mag) input.reload = true;
        }
        break;
      }
    }

    // ---- aim ----
    let desiredYaw = this.yaw;
    let desiredPitch = 0;
    let aimErr = 99;
    if (aimTarget) {
      if (time >= this.aimOffUntil) {
        this.aimOffUntil = time + 0.25;
        const g = () => this.rng.next() + this.rng.next() + this.rng.next() - 1.5;
        this.aimOffYaw = g() * p.aimError * 2;
        this.aimOffPitch = g() * p.aimError * 2;
      }
      const eyeY = self.pos.y + (self.crouching ? EYE_HEIGHT_CROUCH : EYE_HEIGHT);
      const ty = aimTarget.pos.y + (aimTarget.crouching ? 0.75 : 1.25);
      const dx = aimTarget.pos.x - self.pos.x;
      const dz = aimTarget.pos.z - self.pos.z;
      const hd = Math.max(0.01, Math.hypot(dx, dz));
      desiredYaw = Math.atan2(-dx, -dz) + this.aimOffYaw + self.recoilYaw * p.recoilControl;
      desiredPitch =
        Math.atan2(ty - eyeY, hd) + this.aimOffPitch - self.recoilPitch * p.recoilControl;
    } else if (faceDir && Math.hypot(faceDir.x, faceDir.z) > 0.01) {
      desiredYaw = Math.atan2(-faceDir.x, -faceDir.z);
      desiredPitch = 0;
    }
    const maxStep = p.turnSpeed * dt;
    const dyaw = wrapAngle(desiredYaw - this.yaw);
    const dpitch = desiredPitch - this.pitch;
    this.yaw = wrapAngle(this.yaw + clamp(dyaw * Math.min(1, 10 * dt), -maxStep, maxStep));
    this.pitch = clamp(
      this.pitch + clamp(dpitch * Math.min(1, 10 * dt), -maxStep, maxStep),
      -1.3,
      1.3,
    );
    input.yaw = this.yaw;
    input.pitch = this.pitch;
    if (aimTarget) aimErr = Math.hypot(wrapAngle(desiredYaw - this.yaw), desiredPitch - this.pitch);

    // ---- fire control ----
    if (aimTarget) {
      const dist = Math.hypot(aimTarget.pos.x - self.pos.x, aimTarget.pos.z - self.pos.z);
      this.chooseWeapon(self, dist, time, input);
      const w = self.weapon;
      input.ads = dist > p.adsRange;
      const tolerance = Math.max(0.04, 0.6 / Math.max(dist, 1));
      const canShoot = this.reactionLeft <= 0 && aimErr < tolerance && dist < EFFECTIVE[w];
      if (canShoot) {
        if (this.burstLeft > 0) {
          this.burstLeft -= dt;
          input.fire = WEAPONS[w].auto || tick % 10 < 5;
          if (this.burstLeft <= 0)
            this.pauseLeft = p.pause[0] + this.rng.next() * (p.pause[1] - p.pause[0]);
        } else {
          this.pauseLeft -= dt;
          if (this.pauseLeft <= 0)
            this.burstLeft = p.burst[0] + this.rng.next() * (p.burst[1] - p.burst[0]);
        }
      }
      if (self.ammo[w] <= 0 && self.reloadLeft <= 0) {
        if (w !== 'pistol' && self.ammo.pistol > 0 && time - this.lastSwitch > 0.5) {
          input.switchWeapon = 'pistol';
          this.lastSwitch = time;
        } else input.reload = true;
      }
    } else {
      this.burstLeft = 0;
    }

    // ---- movement ----
    this.wantedMove = false;
    if (moveDir && Math.hypot(moveDir.x, moveDir.z) > 1e-6) {
      const l = Math.hypot(moveDir.x, moveDir.z);
      const wx = moveDir.x / l;
      const wz = moveDir.z / l;
      this.wantedMove = true;
      // Express the world direction in the view frame the controller expects.
      const sy = Math.sin(this.yaw);
      const cy = Math.cos(this.yaw);
      input.moveX = wx * cy - wz * sy;
      input.moveZ = -wx * sy - wz * cy;
      input.sprint = sprint && input.moveZ > 0.3;
    }
    this.stuckCheck(self, tick, time);
    if (time < this.unstickUntil) {
      input.moveX = this.unstickDir;
      input.moveZ = input.moveZ === 0 ? 0.5 : input.moveZ;
      input.jump = true;
      this.wantedMove = false;
    }
    return input;
  }

  // ---- internals ----

  private idle(tick: number, self: PlayerState): PlayerInput {
    return {
      tick,
      moveX: 0,
      moveZ: 0,
      yaw: self.yaw,
      pitch: self.pitch,
      jump: false,
      sprint: false,
      crouch: false,
      fire: false,
      ads: false,
      reload: false,
    };
  }

  private onSpawn(self: PlayerState): void {
    this.state = 'patrol';
    this.path = [];
    this.pathIdx = 0;
    this.goal = null;
    this.targetId = -1;
    this.lastSeen = null;
    this.visible = false;
    this.coverNode = null;
    this.coverWait = 0;
    this.coverCooldown = 0;
    this.burstLeft = 0;
    this.yaw = self.yaw;
    this.pitch = 0;
    this.stuckPos = { x: self.pos.x, z: self.pos.z };
    this.stuckCount = 0;
    this.unstickUntil = 0;
  }

  private target(players: readonly PlayerState[]): PlayerState | undefined {
    return players.find((q) => q.id === this.targetId);
  }

  private isEnemy(self: PlayerState, q: PlayerState): boolean {
    return q !== self && q.alive && (this.mode === 'ffa' || q.team !== self.team);
  }

  private eyeY(q: PlayerState): number {
    return q.pos.y + (q.crouching ? EYE_HEIGHT_CROUCH : EYE_HEIGHT);
  }

  private hasLos(self: PlayerState, q: PlayerState): boolean {
    const ox = self.pos.x;
    const oy = this.eyeY(self);
    const oz = self.pos.z;
    const dx = q.pos.x - ox;
    const dy = q.pos.y + 1.2 - oy;
    const dz = q.pos.z - oz;
    const len = Math.hypot(dx, dy, dz);
    if (len < 0.5) return true;
    const hit = this.col.raycast({ x: ox, y: oy, z: oz }, { x: dx, y: dy, z: dz }, len);
    return hit === null;
  }

  private perceive(self: PlayerState, players: readonly PlayerState[], time: number): void {
    // Candidates by distance; test LOS on the nearest few.
    const cands: { q: PlayerState; d: number }[] = [];
    for (const q of players) {
      if (!this.isEnemy(self, q) || q.spawnProtection > 0) continue;
      const d = Math.hypot(q.pos.x - self.pos.x, q.pos.z - self.pos.z);
      if (d <= this.params.sight) cands.push({ q, d });
    }
    cands.sort((a, b) => a.d - b.d || a.q.id - b.q.id);
    // Keep the current target if still visible, to avoid flip-flopping.
    const cur = this.visible ? this.target(players) : undefined;
    let found: PlayerState | undefined;
    if (cur && cands.some((c) => c.q === cur) && this.hasLos(self, cur)) found = cur;
    if (!found) {
      for (let i = 0; i < Math.min(3, cands.length); i++) {
        const c = cands[i] as { q: PlayerState; d: number };
        if (this.hasLos(self, c.q)) {
          found = c.q;
          break;
        }
      }
    }
    if (found) {
      if (!this.visible || found.id !== this.targetId) {
        if (this.noSightTime > 0.5 || found.id !== this.targetId)
          this.reactionLeft = this.params.reaction;
      }
      this.visible = true;
      this.targetId = found.id;
      this.lastSeen = { x: found.pos.x, z: found.pos.z };
      this.lastSeenTime = time;
      this.noSightTime = 0;
    } else {
      this.visible = false;
    }
  }

  private chooseWeapon(self: PlayerState, dist: number, time: number, input: PlayerInput): void {
    if (time - this.lastSwitch < 1.5 || self.reloadLeft > 0) return;
    let want: WeaponId = 'rifle';
    if (dist < 7 && self.ammo.shotgun > 0) want = 'shotgun';
    else if (self.ammo.rifle <= 0 && self.ammo.pistol > 0) want = 'pistol';
    if (want !== self.weapon) {
      input.switchWeapon = want;
      this.lastSwitch = time;
    }
  }

  private attackMove(self: PlayerState, t: PlayerState, time: number): Point {
    const dx = t.pos.x - self.pos.x;
    const dz = t.pos.z - self.pos.z;
    const d = Math.max(0.01, Math.hypot(dx, dz));
    const fx = dx / d;
    const fz = dz / d;
    if (time >= this.strafeUntil) {
      this.strafeUntil = time + 0.7 + this.rng.next() * 1.1;
      this.strafeDir = this.rng.next() < 0.5 ? -1 : 1;
    }
    const pref = PREFERRED[self.weapon];
    let fwd = 0;
    if (d > pref * 1.3) fwd = 1;
    else if (d < pref * 0.4 && self.weapon !== 'shotgun') fwd = -0.6;
    else if (self.weapon === 'shotgun' && d > 3) fwd = 1;
    let sd = this.strafeDir;
    // Do not strafe out of the playable area.
    const b = this.zone.bounds;
    const px = -fz * sd;
    const pz = fx * sd;
    const nx = self.pos.x + px * 4;
    const nz = self.pos.z + pz * 4;
    if (nx < b.minX + 2 || nx > b.maxX - 2 || nz < b.minZ + 2 || nz > b.maxZ - 2) sd = -sd;
    return { x: fx * fwd - fz * sd * 0.8, z: fz * fwd + fx * sd * 0.8 };
  }

  private enterCover(self: PlayerState): void {
    this.state = 'cover';
    this.coverNode = null;
    this.coverWait = 3;
    const enemy = this.lastSeen;
    if (!enemy) return;
    const nodes = this.nav.nodes;
    let best: Point | null = null;
    let bestD = Number.POSITIVE_INFINITY;
    const fake = {
      pos: { x: enemy.x, y: self.pos.y, z: enemy.z },
      crouching: false,
    } as PlayerState;
    for (let i = 0; i < 24; i++) {
      const nd = nodes[Math.floor(this.rng.next() * nodes.length)];
      if (!nd) break;
      const d = Math.hypot(nd.x - self.pos.x, nd.z - self.pos.z);
      if (d > 45 || d < 4) continue;
      const probe = { pos: { x: nd.x, y: self.pos.y, z: nd.z }, crouching: false } as PlayerState;
      // Out of the enemy's sight, and not closer to the enemy than we are.
      if (
        this.hasLos(probe, fake) ||
        Math.hypot(nd.x - enemy.x, nd.z - enemy.z) <
          Math.hypot(self.pos.x - enemy.x, self.pos.z - enemy.z)
      )
        continue;
      if (d < bestD) {
        bestD = d;
        best = { x: nd.x, z: nd.z };
      }
    }
    // No cover found: flee directly away from the last known enemy position.
    if (!best) {
      const dx = self.pos.x - enemy.x;
      const dz = self.pos.z - enemy.z;
      const l = Math.max(0.01, Math.hypot(dx, dz));
      const n = this.nav.nearest(self.pos.x + (dx / l) * 30, self.pos.z + (dz / l) * 30);
      const nd = nodes[n];
      if (nd) best = { x: nd.x, z: nd.z };
    }
    this.coverNode = best;
    this.goal = null;
  }

  private pickPatrolGoal(self: PlayerState): Point {
    const nodes = this.nav.nodes;
    const here = this.nav.nearest(self.pos.x, self.pos.z);
    for (let i = 0; i < 8; i++) {
      const nd = nodes[Math.floor(this.rng.next() * nodes.length)];
      if (!nd) break;
      if (Math.hypot(nd.x - self.pos.x, nd.z - self.pos.z) < 25) continue;
      if (here >= 0 && this.nav.component[nd.id] !== this.nav.component[here]) continue;
      return { x: nd.x, z: nd.z };
    }
    return { x: self.pos.x, z: self.pos.z };
  }

  /**
   * Walk toward `goalFn()` along an A* path. Re-plans when the goal changes by more than 5 m,
   * the path runs out, or every few seconds while chasing. Returns the world direction to walk.
   */
  private follow(self: PlayerState, time: number, goalFn: () => Point): Point | null {
    const done = this.goal !== null && this.pathIdx >= this.path.length;
    let need = this.goal === null || done || time >= this.repathAt;
    if (!need && this.state !== 'patrol') {
      const g = goalFn();
      if (this.goal && Math.hypot(g.x - this.goal.x, g.z - this.goal.z) > 5) need = true;
    }
    if (need) {
      const g = goalFn();
      this.goal = g;
      this.repathAt = time + (this.state === 'patrol' ? 12 : 1.5);
      const p = this.nav.pathBetween(self.pos.x, self.pos.z, g.x, g.z);
      this.path = p ?? [];
      this.pathIdx = 0;
      // Skip the first node if we are already past it.
      if (this.path.length > 1) {
        const a = this.path[0] as Point;
        const b = this.path[1] as Point;
        if (Math.hypot(b.x - self.pos.x, b.z - self.pos.z) < Math.hypot(b.x - a.x, b.z - a.z))
          this.pathIdx = 1;
      }
      const last = this.path[this.path.length - 1];
      if (!last || Math.hypot(g.x - last.x, g.z - last.z) < 8) this.path.push({ x: g.x, z: g.z });
      if (!p) {
        this.goal = null;
        return null;
      }
    }
    while (this.pathIdx < this.path.length) {
      const w = this.path[this.pathIdx] as Point;
      if (Math.hypot(w.x - self.pos.x, w.z - self.pos.z) < 1.3) this.pathIdx++;
      else return { x: w.x - self.pos.x, z: w.z - self.pos.z };
    }
    return null;
  }

  private stuckCheck(self: PlayerState, tick: number, time: number): void {
    if ((tick + this.id) % STUCK_CHECK_TICKS !== 0) return;
    const moved = Math.hypot(self.pos.x - this.stuckPos.x, self.pos.z - this.stuckPos.z);
    this.stuckPos = { x: self.pos.x, z: self.pos.z };
    if (this.wantedMove && moved < 0.8) this.stuckCount++;
    else this.stuckCount = 0;
    if (this.stuckCount >= 2) {
      this.stuckCount = 0;
      this.unstickUntil = time + 0.6;
      this.unstickDir = this.rng.next() < 0.5 ? -1 : 1;
      // Re-path from here; patrol picks a fresh waypoint.
      this.goal = null;
      this.path = [];
      this.pathIdx = 0;
    }
  }
}

/** Owns the brains for a match's bots and produces one input per bot per tick. */
export class BotController {
  private readonly brains = new Map<number, BotBrain>();
  private tick = 0;

  constructor(
    private readonly match: Match,
    private readonly seed = 1,
  ) {}

  addBot(id: number, difficulty: Difficulty = this.match.config.difficulty): BotBrain {
    const b = new BotBrain(
      id,
      difficulty,
      this.match.zone,
      this.match.collision,
      this.match.config.mode,
      this.seed,
    );
    this.brains.set(id, b);
    return b;
  }

  /** Inputs for the next `match.step`. Call once per tick. */
  inputs(): Map<number, PlayerInput> {
    this.tick++;
    const out = new Map<number, PlayerInput>();
    const players = this.match.playerList;
    const time = this.tick * TICK_DT;
    for (const p of players) {
      const brain = this.brains.get(p.id);
      if (brain) out.set(p.id, brain.think(p, players, this.tick, time));
    }
    return out;
  }
}

export interface BotMatchResult {
  match: Match;
  events: GameEvent[];
  ticks: number;
  ended: boolean;
}

/**
 * Add `config.botCount` bots (ids 1..N, alternating teams) and step to the end or `maxTicks`.
 * `difficulties[i]` overrides bot i+1's difficulty.
 */
export function runBotMatch(
  config: MatchConfig,
  zone: ZoneData,
  seed: number,
  maxTicks: number,
  difficulties?: readonly Difficulty[],
): BotMatchResult {
  const match = new Match(config, zone, seed);
  const ctl = new BotController(match, seed);
  for (let i = 0; i < config.botCount; i++) {
    const id = i + 1;
    match.addPlayer({ id, name: `Bot ${id}`, team: (i % 2) as 0 | 1, isBot: true });
    ctl.addBot(id, difficulties?.[i] ?? config.difficulty);
  }
  const events: GameEvent[] = [];
  let ticks = 0;
  while (ticks < maxTicks && !match.isEnded) {
    events.push(...match.step(ctl.inputs()));
    ticks++;
  }
  return { match, events, ticks, ended: match.isEnded };
}
