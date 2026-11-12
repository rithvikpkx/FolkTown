import type { GameEvent } from '@folktown/shared';

/**
 * First-person camera feel, ported from Saltline's controller (docs/saltline-gameplay-findings.md):
 * footstep-locked head bob, a landing dip on a spring, strafe roll, FOV kick while sprinting and
 * trauma-style camera shake. Pure maths, no DOM or three.js, so it is tested headless.
 */
export const FEEL = {
  /** Metres per bob cycle. */
  stride: { walk: 1.55, sprint: 2.1, crouch: 1.05 },
  bobY: 0.024,
  bobX: 0.013,
  bobSprint: 1.9,
  bobAds: 0.22,
  bobCrouch: 0.7,
  /** Speed at which bob reaches 1x. */
  bobSpeed: 4.5,
  bobRate: 9,
  rollStrafe: 0.02,
  rollRate: 8,
  /** Landing dip: spring stiffness and damping, dip per m/s of fall, caps. */
  landK: 150,
  landD: 17,
  landDip: 0.36,
  landDipMax: 0.2,
  landDipPerHit: 3.2,
  landMinAir: 0.12,
  fovSprint: 6,
  fovRate: 7,
  shakeDecay: 1.7,
  shakePitch: 0.03,
  shakeYaw: 0.03,
  shakeRoll: 0.045,
} as const;

export interface FeelInput {
  /** Horizontal speed, m/s. */
  speed: number;
  /** Velocity component to the player's right, m/s (strafe). */
  rightVel: number;
  vy: number;
  onGround: boolean;
  sprinting: boolean;
  crouching: boolean;
  alive: boolean;
  /** 0..1 aim-down-sights blend. */
  ads: number;
}

export interface FeelOutput {
  /** Eye offset in metres: vertical, and to the player's right. */
  y: number;
  x: number;
  /** Radians added to the camera's pitch, yaw and roll. */
  pitch: number;
  yaw: number;
  roll: number;
  /** Degrees added to the field of view. */
  fov: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Exponential approach: moves `v` toward `to` at `rate` per second, frame-rate independent. */
const approach = (v: number, to: number, rate: number, dt: number) =>
  to + (v - to) * Math.exp(-rate * dt);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export class CameraFeel {
  private phase = 0;
  private bobAmp = 0;
  private roll = 0;
  private dip = 0;
  private dipV = 0;
  private trauma = 0;
  private time = 0;
  private fovKick = 0;
  private airTime = 0;
  private fall = 0;
  private wasGround = true;

  /** Add camera shake, 0..1 (it saturates; the effect grows with its square). */
  addShake(amount: number) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  /** Shake from the frame's game events, for the local player `selfId`. */
  onEvents(events: readonly GameEvent[], selfId: number, shotShake = 0.12) {
    for (const e of events) {
      if (e.type === 'hit' && e.target === selfId) this.addShake(0.22 + e.damage / 70);
      else if (e.type === 'shot' && e.shooter === selfId) this.addShake(shotShake);
      else if (e.type === 'kill' && e.victim === selfId) this.addShake(0.6);
    }
  }

  update(dt: number, s: FeelInput): FeelOutput {
    this.time += dt;
    // Land: the fall speed is the fastest downward speed seen while airborne.
    if (!s.onGround) {
      this.airTime += dt;
      this.fall = Math.max(this.fall, -s.vy);
    } else if (!this.wasGround && this.airTime > FEEL.landMinAir) {
      this.dipV -= Math.min(this.fall * FEEL.landDip, FEEL.landDipPerHit);
      if (this.fall > 7.5) this.addShake(Math.min(0.5, (this.fall - 7.5) * 0.06));
    }
    if (s.onGround) {
      this.airTime = 0;
      this.fall = 0;
    }
    this.wasGround = s.onGround;

    const stride = s.crouching
      ? FEEL.stride.crouch
      : s.sprinting
        ? FEEL.stride.sprint
        : FEEL.stride.walk;
    if (s.onGround && s.speed > 0.5) this.phase += (s.speed * dt) / stride;
    else if (s.onGround) this.phase = approach(this.phase, Math.round(this.phase), 8, dt);
    const target = s.onGround
      ? clamp(s.speed / FEEL.bobSpeed, 0, 1) *
        (s.sprinting ? FEEL.bobSprint : 1) *
        lerp(1, FEEL.bobAds, s.ads) *
        (s.crouching ? FEEL.bobCrouch : 1)
      : 0;
    this.bobAmp = approach(this.bobAmp, target, FEEL.bobRate, dt);
    const bobY = -Math.cos(this.phase * Math.PI * 2) * FEEL.bobY * this.bobAmp;
    const bobX = Math.sin(this.phase * Math.PI) * FEEL.bobX * this.bobAmp;

    this.roll = approach(
      this.roll,
      (-s.rightVel / 6.4) * FEEL.rollStrafe * lerp(1, 0.4, s.ads),
      FEEL.rollRate,
      dt,
    );

    // Landing spring, only ever dips down.
    this.dipV += (-this.dip * FEEL.landK - this.dipV * FEEL.landD) * dt;
    this.dip = clamp(this.dip + this.dipV * dt, -FEEL.landDipMax, 0.05);

    this.trauma = Math.max(0, this.trauma - FEEL.shakeDecay * dt);
    const q = this.trauma * this.trauma;
    const t = this.time;
    const sp = q * FEEL.shakePitch * (Math.sin(t * 43.1) + 0.6 * Math.sin(t * 71.7 + 1.3));
    const sy = q * FEEL.shakeYaw * (Math.sin(t * 37.3 + 2.1) + 0.6 * Math.sin(t * 83.9));
    const sr = q * FEEL.shakeRoll * (Math.sin(t * 29.7 + 0.7) + 0.5 * Math.sin(t * 61.3 + 4));

    this.fovKick = approach(
      this.fovKick,
      s.sprinting && s.alive ? FEEL.fovSprint : 0,
      FEEL.fovRate,
      dt,
    );
    return {
      y: bobY + this.dip,
      x: bobX,
      pitch: sp + this.dip * 0.12,
      yaw: sy,
      roll: this.roll + sr + bobX * 0.35,
      fov: this.fovKick,
    };
  }
}
