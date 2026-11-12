import { EYE_HEIGHT, EYE_HEIGHT_CROUCH, type PlayerState } from '@folktown/shared';

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

/**
 * Where the first-person camera sits for a player state. Yaw 0 looks toward -z and positive
 * yaw turns left. The sim aims along yaw - recoilYaw and pitch + recoilPitch, so the view does
 * too. `aim` is the player's own live mouse angles (alive) and `pos` the interpolated feet.
 */
export function cameraPose(
  p: PlayerState,
  pos: { x: number; y: number; z: number },
  aim: { yaw: number; pitch: number },
): CameraPose {
  if (!p.alive) {
    return { x: pos.x, y: pos.y + 0.4, z: pos.z, yaw: p.yaw, pitch: -0.6 };
  }
  return {
    x: pos.x,
    y: pos.y + (p.crouching ? EYE_HEIGHT_CROUCH : EYE_HEIGHT),
    z: pos.z,
    yaw: aim.yaw - p.recoilYaw,
    pitch: aim.pitch + p.recoilPitch,
  };
}
