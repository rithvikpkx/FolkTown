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
/** Fraction of ground control kept while airborne (1 = full). */
export const AIR_CONTROL = 0.3;

export const MAX_HEALTH = 100;

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
    spreadHip: 0.03,
    spreadAds: 0.006,
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
    spreadHip: 0.02,
    spreadAds: 0.004,
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
    spreadHip: 0.07,
    spreadAds: 0.045,
    pellets: 8,
    auto: false,
    recoil: [[0.03, 0]],
  },
};

export const WEAPON_ORDER: readonly WeaponId[] = ['rifle', 'pistol', 'shotgun'];
