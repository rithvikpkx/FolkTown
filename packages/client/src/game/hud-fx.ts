/**
 * Pure logic behind the HUD polish ported from Saltline (docs/saltline-gameplay-findings.md):
 * damage direction arcs, the hurt pulse and low-health vignette, hit-marker kinds, the ammo cue and
 * the segmented health bar. No DOM, so it is unit tested.
 */

/** Palette (Saltline's tokens): bone for text, signal amber for warnings, alarm red for danger. */
export const HUD_COLORS = { bone: '#e8e4da', signal: '#ffb347', alarm: '#ff5a40' } as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Smoothstep from `a` (0) to `b` (1); `a` may be larger than `b`. */
function smooth(a: number, b: number, v: number): number {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/**
 * Screen angle in degrees, clockwise from straight up, of a damage source seen from a player at `me`
 * looking along `yaw` (yaw 0 faces -z, positive turns left). 0 = ahead, 90 = right, 180 = behind.
 */
export function damageArcAngle(
  src: { x: number; z: number },
  me: { x: number; z: number },
  yaw: number,
): number {
  const a = Math.atan2(src.x - me.x, -(src.z - me.z)) + yaw;
  return (a * 180) / Math.PI;
}

/** 0 at health >= 55%, rising to 1 at health <= 12%: how strongly to show the low-health vignette. */
export function lowHealth(frac: number): number {
  return smooth(0.55, 0.12, frac);
}

export type HitKind = 'hit' | 'head' | 'kill';

/** Hit-marker look: a kill beats a headshot beats a plain hit. */
export function hitMarkerKind(headshot: boolean, killed: boolean): HitKind {
  return killed ? 'kill' : headshot ? 'head' : 'hit';
}
/** Milliseconds the hit marker stays up. */
export const HIT_MARKER_MS: Record<HitKind, number> = { hit: 240, head: 240, kill: 420 };

export interface AmmoCue {
  text: string;
  level: 'none' | 'low' | 'empty' | 'reloading';
}

/** The line under the ammo count: Reloading, Reload (R) when empty, Low ammo at 27% of a magazine. */
export function ammoCue(ammo: number, mag: number, reloading: boolean): AmmoCue {
  if (reloading) return { text: 'Reloading', level: 'reloading' };
  if (ammo <= 0) return { text: 'Reload (R)', level: 'empty' };
  if (ammo <= Math.ceil(mag * 0.27)) return { text: 'Low ammo', level: 'low' };
  return { text: '', level: 'none' };
}

/** Segments lit out of `n`, and whether the bar should turn alarm red (3 or fewer left). */
export function healthSegments(
  health: number,
  max: number,
  n = 10,
): { lit: number; crit: boolean } {
  const lit = Math.max(0, Math.min(n, Math.ceil((health / max) * n)));
  return { lit, crit: lit <= 3 };
}

export interface ArcState {
  /** Degrees clockwise from up. */
  deg: number;
  opacity: number;
}

const ARC_LIFE = 1.5;
const ARC_FADE = 0.6;
/** Red-edge pulse: grows with damage, decays at this per second. */
const PULSE_DECAY = 1.9;

/**
 * Damage feedback state: a few direction arcs (the oldest is reused) and the hurt pulse that drives
 * the red screen edge. `hit` when the player is damaged; `update` once per frame.
 */
export class DamageFx {
  private readonly arcs = Array.from({ length: 4 }, () => ({ x: 0, z: 0, life: 0 }));
  pulse = 0;

  hit(damage: number, src?: { x: number; z: number }) {
    this.pulse = Math.min(1, this.pulse + 0.35 + damage / 40);
    if (!src) return;
    let slot = this.arcs[0] as { x: number; z: number; life: number };
    for (const a of this.arcs) {
      if (a.life <= 0) {
        slot = a;
        break;
      }
      if (a.life < slot.life) slot = a;
    }
    slot.x = src.x;
    slot.z = src.z;
    slot.life = ARC_LIFE;
  }

  reset() {
    this.pulse = 0;
    for (const a of this.arcs) a.life = 0;
  }

  update(dt: number, me: { x: number; z: number }, yaw: number): ArcState[] {
    this.pulse = Math.max(0, this.pulse - PULSE_DECAY * dt);
    return this.arcs.map((a) => {
      if (a.life <= 0) return { deg: 0, opacity: 0 };
      a.life -= dt;
      return {
        deg: damageArcAngle(a, me, yaw),
        opacity: Math.round(clamp01(a.life / ARC_FADE) * 20) / 20,
      };
    });
  }
}
