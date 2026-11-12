import type { WeaponDef, WeaponId } from './types.ts';

export const TICK_RATE = 60;
export const TICK_DT = 1 / TICK_RATE;

export const PLAYER_RADIUS = 0.4;
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_HEIGHT_CROUCH = 1.1;
export const EYE_HEIGHT = 1.65;
export const EYE_HEIGHT_CROUCH = 0.95;

/** Metres per second. */
export const WALK_SPEED = 4.5;
export const SPRINT_SPEED = 7;
export const CROUCH_SPEED = 2.2;

/** Metres per second squared, and metres per second. Apex of a jump is about 1.05 m. */
export const GRAVITY = 20;
export const JUMP_SPEED = 6.5;
/** Highest ledge the player walks up without jumping. */
export const STEP_HEIGHT = 0.5;
/**
 * Horizontal acceleration, metres per second squared (from Saltline's feel, docs/saltline-gameplay-findings.md).
 * Ground speed changes at ACCEL_GROUND while a direction is held and DECEL_GROUND when released; in the air
 * ACCEL_AIR steers toward the wish velocity and AIR_DRIFT bleeds momentum when no direction is held.
 */
export const ACCEL_GROUND = 34;
export const DECEL_GROUND = 26;
export const ACCEL_AIR = 9;
export const AIR_DRIFT = 0.6;
/** Seconds after leaving the ground in which a jump still works, and seconds a jump press is remembered before landing. */
export const COYOTE_TIME = 0.12;
export const JUMP_BUFFER = 0.13;
/** Walking backwards is this fraction of forward speed at full back; aiming down sights caps walk speed. */
export const BACKWARD_SPEED_FACTOR = 0.82;
export const ADS_SPEED = 3;

export const MAX_HEALTH = 100;

/** Speed (m/s) at which movement spread is full. */
export const SPREAD_FULL_SPEED = 6;

/** Recoil entries are [pitch up, yaw right] in radians added per shot, repeating the last. */
export const WEAPONS: Record<WeaponId, WeaponDef> = {
  rifle: {
    id: 'rifle',
    damage: 28,
    falloffStart: 30,
    falloffEnd: 80,
    minDamageFraction: 0.5,
    rpm: 650,
    mag: 30,
    reloadTime: 2.2,
    reloadTimeEmpty: 2.7,
    spreadHip: 0.03,
    spreadAds: 0.006,
    spreadMove: 0.015,
    spreadAir: 0.025,
    spreadCrouch: 0.005,
    pellets: 1,
    auto: true,
    recoil: [
      [0.004, 0],
      [0.005, 0.001],
      [0.006, -0.001],
      [0.006, 0.002],
      [0.005, -0.002],
    ],
  },
  pistol: {
    id: 'pistol',
    damage: 22,
    falloffStart: 15,
    falloffEnd: 45,
    minDamageFraction: 0.4,
    rpm: 360,
    mag: 12,
    reloadTime: 1.5,
    reloadTimeEmpty: 1.9,
    spreadHip: 0.02,
    spreadAds: 0.004,
    spreadMove: 0.01,
    spreadAir: 0.02,
    spreadCrouch: 0.003,
    pellets: 1,
    auto: false,
    recoil: [[0.008, 0]],
  },
  shotgun: {
    id: 'shotgun',
    damage: 11,
    falloffStart: 8,
    falloffEnd: 25,
    minDamageFraction: 0.15,
    rpm: 70,
    mag: 6,
    reloadTime: 3,
    reloadTimeEmpty: 3.4,
    spreadHip: 0.07,
    spreadAds: 0.045,
    spreadMove: 0.02,
    spreadAir: 0.03,
    spreadCrouch: 0.01,
    pellets: 8,
    auto: false,
    recoil: [[0.03, 0]],
  },
};

export const WEAPON_ORDER: readonly WeaponId[] = ['rifle', 'pistol', 'shotgun'];

/** Seconds a dead player waits before respawning. */
export const RESPAWN_DELAY = 3;
/** Seconds of damage immunity after spawning. */
export const SPAWN_PROTECTION = 2;
/** Headshot damage multiplier, and the height of the head zone below the top of the body (metres). */
export const HEADSHOT_MULTIPLIER = 2;
export const HEAD_ZONE = 0.25;

/** Most bots in a single-player match: 31 bots plus the player is the 32-player Stage 2 target. Raise to 63 only after a Mac benchmark. */
export const MAX_BOTS = 31;
