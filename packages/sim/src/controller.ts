import type { PlayerInput, PlayerState, Team } from '@folktown/shared';
import {
  ACCEL_AIR,
  ACCEL_GROUND,
  ADS_SPEED,
  AIR_DRIFT,
  BACKWARD_SPEED_FACTOR,
  COYOTE_TIME,
  DECEL_GROUND,
  CROUCH_SPEED,
  GRAVITY,
  JUMP_BUFFER,
  JUMP_SPEED,
  MAX_HEALTH,
  PLAYER_HEIGHT,
  PLAYER_HEIGHT_CROUCH,
  PLAYER_RADIUS,
  SPRINT_SPEED,
  STEP_HEIGHT,
  WALK_SPEED,
  WEAPONS,
} from '@folktown/shared';
import { pointInPoly, type Solid, type ZoneCollision } from './collision.ts';

const MAX_SUBSTEP = 1 / 60;
const EPS = 1e-6;

export function createPlayerState(
  id: number,
  team: Team,
  x: number,
  y: number,
  z: number,
  yaw = 0,
): PlayerState {
  return {
    id,
    name: `P${id}`,
    isBot: false,
    team,
    pos: { x, y, z },
    vel: { x: 0, y: 0, z: 0 },
    yaw,
    pitch: 0,
    onGround: false,
    coyote: 0,
    jumpBuffer: 0,
    crouching: false,
    health: MAX_HEALTH,
    alive: true,
    weapon: 'rifle',
    ammo: { rifle: WEAPONS.rifle.mag, pistol: WEAPONS.pistol.mag, shotgun: WEAPONS.shotgun.mag },
    reloadLeft: 0,
    fireCooldown: 0,
    shotsInBurst: 0,
    respawnIn: 0,
    spawnProtection: 0,
    recoilPitch: 0,
    recoilYaw: 0,
    kills: 0,
    deaths: 0,
  };
}

/** Does this solid block a body whose feet are at feetY and whose height is h? */
function blocks(s: Solid, feetY: number, h: number): boolean {
  return s.topY > feetY + STEP_HEIGHT + EPS && s.baseY < feetY + h;
}

/** Push (x,z) out of the solid if the circle overlaps it. Returns whether it moved. */
function resolve(s: Solid, pos: { x: number; z: number }, r: number): boolean {
  if (!s.poly) {
    const dx = pos.x - s.cx;
    const dz = pos.z - s.cz;
    const d = Math.hypot(dx, dz);
    const min = s.r + r;
    if (d >= min) return false;
    if (d < EPS) {
      pos.x = s.cx + min;
      return true;
    }
    pos.x = s.cx + (dx / d) * min;
    pos.z = s.cz + (dz / d) * min;
    return true;
  }
  const p = s.poly;
  let bestD2 = Number.POSITIVE_INFINITY;
  let bx = 0;
  let bz = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [ax, az] = p[j] as [number, number];
    const [cx, cz] = p[i] as [number, number];
    const ex = cx - ax;
    const ez = cz - az;
    const l2 = ex * ex + ez * ez;
    let t = l2 > 0 ? ((pos.x - ax) * ex + (pos.z - az) * ez) / l2 : 0;
    t = Math.min(1, Math.max(0, t));
    const qx = ax + ex * t;
    const qz = az + ez * t;
    const d2 = (pos.x - qx) ** 2 + (pos.z - qz) ** 2;
    if (d2 < bestD2) {
      bestD2 = d2;
      bx = qx;
      bz = qz;
    }
  }
  const inside = pointInPoly(p, pos.x, pos.z);
  if (!inside && bestD2 >= r * r) return false;
  const d = Math.sqrt(bestD2);
  if (inside) {
    // Out through the nearest edge, then clear it by r.
    if (d < EPS) return false;
    const nx = (bx - pos.x) / d;
    const nz = (bz - pos.z) / d;
    pos.x = bx + nx * r;
    pos.z = bz + nz * r;
  } else {
    const nx = (pos.x - bx) / d;
    const nz = (pos.z - bz) / d;
    pos.x = bx + nx * r;
    pos.z = bz + nz * r;
  }
  return true;
}

/** Highest surface the player's centre stands over that they can reach. */
function floorHeight(col: ZoneCollision, x: number, z: number, feetY: number): number {
  let floor = col.groundHeight(x, z);
  for (const idx of col.query(x, z, 0)) {
    const s = col.solids[idx] as Solid;
    if (s.topY > feetY + STEP_HEIGHT + EPS || s.topY <= floor) continue;
    const over = s.poly
      ? pointInPoly(s.poly, x, z)
      : (x - s.cx) ** 2 + (z - s.cz) ** 2 <= s.r * s.r;
    if (over) floor = s.topY;
  }
  return floor;
}

/**
 * Advance one player by dt seconds. Mutates and returns `state`. Deterministic: no clocks,
 * no randomness, fixed iteration order. Large dt is split into 1/60 s sub-steps.
 * Does not touch weapons or health.
 */
export function stepController(
  state: PlayerState,
  input: PlayerInput,
  zone: ZoneCollision,
  dt: number,
): PlayerState {
  state.yaw = input.yaw;
  state.pitch = input.pitch;
  const n = Math.max(1, Math.ceil(dt / MAX_SUBSTEP - 1e-9));
  const h = dt / n;
  for (let i = 0; i < n; i++) substep(state, input, zone, h);
  return state;
}

function substep(state: PlayerState, input: PlayerInput, col: ZoneCollision, dt: number): void {
  const pos = state.pos;
  const vel = state.vel;

  // Crouch: stand up only if there is headroom.
  const wantCrouch = input.crouch;
  if (state.crouching && !wantCrouch) {
    let clear = true;
    for (const idx of col.query(pos.x, pos.z, PLAYER_RADIUS)) {
      const s = col.solids[idx] as Solid;
      if (s.baseY >= pos.y + PLAYER_HEIGHT_CROUCH && s.baseY < pos.y + PLAYER_HEIGHT) {
        if (overlaps(s, pos.x, pos.z)) clear = false;
      }
    }
    if (clear) state.crouching = false;
  } else if (wantCrouch) {
    state.crouching = true;
  }
  const height = state.crouching ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT;

  // Wish direction. Yaw 0 faces -z; positive yaw turns left.
  let mx = clamp(input.moveX, -1, 1);
  let mz = clamp(input.moveZ, -1, 1);
  const ml = Math.hypot(mx, mz);
  if (ml > 1) {
    mx /= ml;
    mz /= ml;
  }
  const sy = Math.sin(input.yaw);
  const cy = Math.cos(input.yaw);
  const wishX = mx * cy - mz * sy;
  const wishZ = -mx * sy - mz * cy;
  // Sprint is forward-only (Saltline: forward > 0.55, strafe < 0.6) and drops when aiming.
  const sprinting =
    input.sprint && input.moveZ > 0.55 && Math.abs(input.moveX) < 0.6 && !state.crouching;
  let speed = state.crouching ? CROUCH_SPEED : sprinting && !input.ads ? SPRINT_SPEED : WALK_SPEED;
  if (input.ads) speed = Math.min(speed, ADS_SPEED);
  if (input.moveZ < 0) speed *= 1 + (BACKWARD_SPEED_FACTOR - 1) * Math.min(1, -input.moveZ);
  const tx = wishX * speed;
  const tz = wishZ * speed;
  const wishing = ml > 0.1;
  // Move velocity toward the target at a fixed acceleration, snapping when within one step.
  let accel: number;
  if (state.onGround) accel = wishing ? ACCEL_GROUND : DECEL_GROUND;
  else accel = wishing ? ACCEL_AIR : AIR_DRIFT;
  let dvx = tx - vel.x;
  let dvz = tz - vel.z;
  // In the air with no input the target is "keep going": only drift toward zero slowly.
  const step = accel * dt;
  const dv = Math.hypot(dvx, dvz);
  if (dv <= step || dv < 1e-6) {
    if (state.onGround || wishing) {
      vel.x = tx;
      vel.z = tz;
    }
  } else {
    dvx /= dv;
    dvz /= dv;
    vel.x += dvx * step;
    vel.z += dvz * step;
  }

  state.coyote = state.onGround ? COYOTE_TIME : Math.max(0, state.coyote - dt);
  state.jumpBuffer = input.jump ? JUMP_BUFFER : Math.max(0, state.jumpBuffer - dt);
  if (state.jumpBuffer > 0 && state.coyote > 0 && !state.crouching) {
    vel.y = JUMP_SPEED;
    state.onGround = false;
    state.coyote = 0;
    state.jumpBuffer = 0;
  }

  // Horizontal move, then push out of anything solid.
  pos.x += vel.x * dt;
  pos.z += vel.z * dt;
  const r = PLAYER_RADIUS;
  for (let pass = 0; pass < 4; pass++) {
    let moved = false;
    for (const idx of col.query(pos.x, pos.z, r)) {
      const s = col.solids[idx] as Solid;
      if (!blocks(s, pos.y, height)) continue;
      if (resolve(s, pos, r)) moved = true;
    }
    if (!moved) break;
  }

  // Vertical.
  vel.y -= GRAVITY * dt;
  pos.y += vel.y * dt;
  const floor = floorHeight(col, pos.x, pos.z, pos.y);
  if (pos.y <= floor) {
    pos.y = floor;
    vel.y = 0;
    state.onGround = true;
  } else {
    state.onGround = false;
  }
}

function overlaps(s: Solid, x: number, z: number): boolean {
  return s.poly
    ? pointInPoly(s.poly, x, z)
    : (x - s.cx) ** 2 + (z - s.cz) ** 2 <= (s.r + PLAYER_RADIUS) ** 2;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
