import type { Vec3, WeaponDef } from '@folktown/shared';

/** Damage multiplier by distance: 1 inside falloffStart, linear to minDamageFraction at falloffEnd, flat beyond. */
export function falloffFactor(def: WeaponDef, dist: number): number {
  if (dist <= def.falloffStart) return 1;
  if (dist >= def.falloffEnd) return def.minDamageFraction;
  const f = (dist - def.falloffStart) / (def.falloffEnd - def.falloffStart);
  return 1 + (def.minDamageFraction - 1) * f;
}

/** Unit view direction. Yaw 0 looks toward -z, positive yaw turns left. */
export function viewDir(yaw: number, pitch: number): Vec3 {
  const c = Math.cos(pitch);
  return { x: -Math.sin(yaw) * c, y: Math.sin(pitch), z: -Math.cos(yaw) * c };
}

/** Rotate unit `dir` by `angle` away from its axis, around it by `phi`. */
export function offsetCone(dir: Vec3, angle: number, phi: number): Vec3 {
  // Orthonormal basis (u, v) perpendicular to dir.
  const ax = Math.abs(dir.y) < 0.99 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
  let ux = dir.y * ax.z - dir.z * ax.y;
  let uy = dir.z * ax.x - dir.x * ax.z;
  let uz = dir.x * ax.y - dir.y * ax.x;
  const ul = Math.hypot(ux, uy, uz);
  ux /= ul;
  uy /= ul;
  uz /= ul;
  const vx = dir.y * uz - dir.z * uy;
  const vy = dir.z * ux - dir.x * uz;
  const vz = dir.x * uy - dir.y * ux;
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const a = Math.cos(phi) * s;
  const b = Math.sin(phi) * s;
  return {
    x: dir.x * c + ux * a + vx * b,
    y: dir.y * c + uy * a + vy * b,
    z: dir.z * c + uz * a + vz * b,
  };
}

/**
 * Ray (unit dir) against a vertical cylinder from yLow to yHigh. Returns the entry distance, or null.
 */
export function rayCylinder(
  o: Vec3,
  d: Vec3,
  cx: number,
  cz: number,
  r: number,
  yLow: number,
  yHigh: number,
  maxDist: number,
): number | null {
  let t0 = 0;
  let t1 = maxDist;
  const fx = o.x - cx;
  const fz = o.z - cz;
  const a = d.x * d.x + d.z * d.z;
  if (a > 1e-12) {
    const b = fx * d.x + fz * d.z;
    const c = fx * fx + fz * fz - r * r;
    const disc = b * b - a * c;
    if (disc < 0) return null;
    const sq = Math.sqrt(disc);
    t0 = Math.max(t0, (-b - sq) / a);
    t1 = Math.min(t1, (-b + sq) / a);
  } else if (fx * fx + fz * fz > r * r) return null;
  if (Math.abs(d.y) > 1e-12) {
    const ta = (yLow - o.y) / d.y;
    const tb = (yHigh - o.y) / d.y;
    t0 = Math.max(t0, Math.min(ta, tb));
    t1 = Math.min(t1, Math.max(ta, tb));
  } else if (o.y < yLow || o.y > yHigh) return null;
  return t0 <= t1 ? t0 : null;
}
