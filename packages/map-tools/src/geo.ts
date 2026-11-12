import type { Pt } from './types.ts';

const R = 6371008.8;
const rad = Math.PI / 180;

/** Local tangent-plane equirectangular projection. shortcut: flat-earth, fine within ~5 km. */
export function makeProjector(lat0: number, lon0: number) {
  const k = Math.cos(lat0 * rad);
  return (lat: number, lon: number): Pt => [R * (lon - lon0) * rad * k, -R * (lat - lat0) * rad];
}

/** Signed area, positive when counter-clockwise on a north-up map (x right, -z up). */
export function signedArea(ring: Pt[]): number {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, z1] = ring[i] as Pt;
    const [x2, z2] = ring[(i + 1) % ring.length] as Pt;
    s += x1 * -z2 - x2 * -z1;
  }
  return s / 2;
}

/** Return a copy, drop the repeated closing point, wind CCW (outer) or CW (hole). */
export function wind(ring: Pt[], ccw: boolean): Pt[] {
  let r = ring.slice();
  const f = r[0];
  const l = r[r.length - 1];
  if (r.length > 1 && f && l && f[0] === l[0] && f[1] === l[1]) r.pop();
  if (signedArea(r) > 0 !== ccw) r = r.reverse();
  return r;
}

type LL = [number, number]; // [lat, lon]
const same = (a: LL, b: LL) => a[0] === b[0] && a[1] === b[1];

/** Join open way segments end to end into closed rings; returns null if any fails to close. */
export function joinRings(segs: LL[][]): LL[][] | null {
  const rest = segs.filter((p) => p.length > 1).map((p) => p.slice());
  const rings: LL[][] = [];
  while (rest.length) {
    const cur = rest.pop() as LL[];
    while (!(cur.length > 3 && same(cur[0] as LL, cur[cur.length - 1] as LL))) {
      const end = cur[cur.length - 1] as LL;
      const i = rest.findIndex((s) => same(s[0] as LL, end) || same(s[s.length - 1] as LL, end));
      if (i < 0) return null;
      const s = rest.splice(i, 1)[0] as LL[];
      if (!same(s[0] as LL, end)) s.reverse();
      cur.push(...s.slice(1));
    }
    rings.push(cur);
  }
  return rings;
}

export function pointInRing(p: Pt, ring: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i] as Pt;
    const [xj, zj] = ring[j] as Pt;
    if (zi > p[1] !== zj > p[1] && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi)
      inside = !inside;
  }
  return inside;
}
