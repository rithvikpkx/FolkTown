import type { GameEvent, Vec3, ZoneData } from '@folktown/shared';
import { groundHeightAt } from '@folktown/sim';

export interface Impact {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
}

type Cast = (
  o: Vec3,
  d: Vec3,
  max: number,
) => { x: number; y: number; z: number; nx: number; ny: number; nz: number; t: number } | null;

/**
 * Where visible bullet marks go for this batch of events. A shot that has a `hit` event from the
 * same shooter in the batch hit a player, so it leaves no wall mark. Purely visual: the sim has
 * no ground hit-scan (known-gaps 9), so the ground is intersected here.
 */
export function impactsFor(
  events: readonly GameEvent[],
  zone: ZoneData,
  cast: Cast,
  near: Vec3,
  maxNear = 90,
): Impact[] {
  const hitters = new Set<number>();
  for (const e of events) if (e.type === 'hit') hitters.add(e.shooter);
  const out: Impact[] = [];
  for (const e of events) {
    if (e.type !== 'shot' || hitters.has(e.shooter)) continue;
    if (Math.hypot(e.origin.x - near.x, e.origin.z - near.z) > 400) continue;
    const wall = cast(e.origin, e.dir, 300);
    const gy = groundHeightAt(zone, e.origin.x, e.origin.z);
    const tg = e.dir.y < -1e-4 ? (gy - e.origin.y) / e.dir.y : Number.POSITIVE_INFINITY;
    if (tg > 0 && tg < 300 && (!wall || tg < wall.t)) {
      out.push({
        x: e.origin.x + e.dir.x * tg,
        y: gy,
        z: e.origin.z + e.dir.z * tg,
        nx: 0,
        ny: 1,
        nz: 0,
      });
    } else if (wall) {
      out.push({ x: wall.x, y: wall.y, z: wall.z, nx: wall.nx, ny: wall.ny, nz: wall.nz });
    }
  }
  return out.filter((i) => Math.hypot(i.x - near.x, i.z - near.z) < maxNear + 300);
}
