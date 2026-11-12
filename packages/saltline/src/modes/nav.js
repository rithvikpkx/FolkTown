// Campus nav grid: blocked cells = building footprints + trees + zone bounds, with the same interface as the
// harbour's physics.nav (cell, isWalkable, findPath, randomPoint, clearLine, _grid) so the enemies module is unchanged.
import { Vector3 } from 'three';

const CELL = 2, FOOT_R = 1.4, TREE_R = 1.0;

function segDist2(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l)) : 0;
  const x = ax + dx * t - px, z = az + dz * t - pz;
  return x * x + z * z;
}

function inPoly(poly, x, z) {
  let c = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2)
    if ((poly[i + 1] > z) !== (poly[j + 1] > z) && x < ((poly[j] - poly[i]) * (z - poly[i + 1])) / (poly[j + 1] - poly[i + 1]) + poly[i]) c = !c;
  return c;
}

// data = loadCampus(zone) result: {bounds, footprints:[{poly:[x,z,...]}], trees:[{x,z,radius}]}
export function buildNav(data) {
  const { bounds: b } = data;
  const x0 = b.minX, z0 = b.minZ, w = Math.ceil((b.maxX - x0) / CELL), h = Math.ceil((b.maxZ - z0) / CELL);
  const blocked = new Uint8Array(w * h);
  const idx = (x, z) => {
    const cx = Math.floor((x - x0) / CELL), cz = Math.floor((z - z0) / CELL);
    return cx < 0 || cz < 0 || cx >= w || cz >= h ? -1 : cz * w + cx;
  };
  const cx2x = (i) => x0 + ((i % w) + 0.5) * CELL, cz2z = (i) => z0 + (Math.floor(i / w) + 0.5) * CELL;
  for (let i = 0; i < w; i++) blocked[i] = blocked[(h - 1) * w + i] = 1;
  for (let j = 0; j < h; j++) blocked[j * w] = blocked[j * w + w - 1] = 1;
  const cellRange = (min, max, o, n) => [Math.max(0, Math.floor((min - o) / CELL)), Math.min(n - 1, Math.floor((max - o) / CELL))];
  for (const f of data.footprints) {
    const [ax, bx] = cellRange(f.minX - FOOT_R, f.maxX + FOOT_R, x0, w), [cz0, cz1] = cellRange(f.minZ - FOOT_R, f.maxZ + FOOT_R, z0, h);
    for (let cz = cz0; cz <= cz1; cz++)
      for (let cx = ax; cx <= bx; cx++) {
        const i = cz * w + cx;
        if (blocked[i]) continue;
        const px = cx2x(i), pz = cz2z(i);
        let hit = inPoly(f.poly, px, pz);
        for (let k = 0, j = f.poly.length - 2; !hit && k < f.poly.length; j = k, k += 2)
          hit = segDist2(px, pz, f.poly[j], f.poly[j + 1], f.poly[k], f.poly[k + 1]) < FOOT_R * FOOT_R;
        if (hit) blocked[i] = 1;
      }
  }
  for (const t of data.trees) {
    const r = t.radius + TREE_R;
    const [ax, bx] = cellRange(t.x - r, t.x + r, x0, w), [cz0, cz1] = cellRange(t.z - r, t.z + r, z0, h);
    for (let cz = cz0; cz <= cz1; cz++)
      for (let cx = ax; cx <= bx; cx++) {
        const i = cz * w + cx;
        if ((cx2x(i) - t.x) ** 2 + (cz2z(i) - t.z) ** 2 < r * r) blocked[i] = 1;
      }
  }

  const isWalkable = (x, z) => { const i = idx(x, z); return i >= 0 && !blocked[i]; };
  const toV = (i) => new Vector3(cx2x(i), 0, cz2z(i));
  // nearest open cell within 12 rings (start/goal may sit just inside an inflated obstacle)
  const snap = (x, z) => {
    const cx = Math.max(0, Math.min(w - 1, Math.floor((x - x0) / CELL))), cz = Math.max(0, Math.min(h - 1, Math.floor((z - z0) / CELL)));
    if (!blocked[cz * w + cx]) return cz * w + cx;
    for (let s = 1; s <= 12; s++) {
      let best = -1, bd = 1e9;
      for (let dz = -s; dz <= s; dz++)
        for (let dx = -s; dx <= s; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== s) continue;
          const X = cx + dx, Z = cz + dz;
          if (X < 0 || Z < 0 || X >= w || Z >= h || blocked[Z * w + X]) continue;
          if (dx * dx + dz * dz < bd) { bd = dx * dx + dz * dz; best = Z * w + X; }
        }
      if (best >= 0) return best;
    }
    return -1;
  };
  const clearLine = (a, c) => {
    const n = Math.ceil(Math.hypot(c.x - a.x, c.z - a.z) / (CELL * 0.5));
    for (let s = 0; s <= n; s++) if (!isWalkable(a.x + ((c.x - a.x) * s) / n, a.z + ((c.z - a.z) * s) / n)) return false;
    return true;
  };

  // A* (8-neighbour, no corner cutting) with a binary heap; stamps avoid clearing the arrays per query.
  const g = new Float32Array(w * h), from = new Int32Array(w * h), seen = new Uint32Array(w * h), done = new Uint32Array(w * h);
  let stamp = 0;
  const heap = [], hf = [];
  const push = (n, f) => {
    let i = heap.length;
    heap.push(n); hf.push(f);
    while (i) { const p = (i - 1) >> 1; if (hf[p] <= f) break; heap[i] = heap[p]; hf[i] = hf[p]; i = p; }
    heap[i] = n; hf[i] = f;
  };
  const pop = () => {
    const top = heap[0], n = heap.pop(), f = hf.pop();
    if (heap.length) {
      let i = 0;
      for (;;) {
        let c = 2 * i + 1;
        if (c >= heap.length) break;
        if (c + 1 < heap.length && hf[c + 1] < hf[c]) c++;
        if (hf[c] >= f) break;
        heap[i] = heap[c]; hf[i] = hf[c]; i = c;
      }
      heap[i] = n; hf[i] = f;
    }
    return top;
  };
  const astar = (s, e) => {
    stamp++; heap.length = hf.length = 0;
    const ex = e % w, ez = (e / w) | 0;
    const hh = (n) => { const dx = Math.abs((n % w) - ex), dz = Math.abs(((n / w) | 0) - ez); return dx + dz + (Math.SQRT2 - 2) * Math.min(dx, dz); };
    g[s] = 0; seen[s] = stamp; from[s] = -1; push(s, hh(s));
    while (heap.length) {
      const n = pop();
      if (done[n] === stamp) continue;
      done[n] = stamp;
      if (n === e) { const p = []; for (let k = e; k >= 0; k = from[k]) p.push(k); return p.reverse(); }
      const nx = n % w, nz = (n / w) | 0;
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dz) continue;
          const X = nx + dx, Z = nz + dz;
          if (X < 0 || Z < 0 || X >= w || Z >= h) continue;
          const m = Z * w + X;
          if (blocked[m] || (dx && dz && (blocked[nz * w + X] || blocked[Z * w + nx]))) continue;
          const ng = g[n] + (dx && dz ? Math.SQRT2 : 1);
          if (seen[m] !== stamp || ng < g[m]) { seen[m] = stamp; g[m] = ng; from[m] = n; push(m, ng + hh(m)); }
        }
    }
    return null;
  };

  return {
    cell: CELL,
    isWalkable,
    clearLine,
    findPath(a, c) {
      const s = snap(a.x, a.z), e = snap(c.x, c.z);
      if (s < 0 || e < 0) return null;
      if (s === e) return [new Vector3(c.x, 0, c.z)];
      const cells = astar(s, e);
      if (!cells) return null;
      const pts = cells.map(toV), out = [];
      let i = 0; // string-pull: jump to the farthest cell still in line of sight
      while (i < pts.length - 1) {
        let j = i + 1;
        for (let k = pts.length - 1; k > i + 1; k--) if (clearLine(pts[i], pts[k])) { j = k; break; }
        out.push(pts[j]); i = j;
      }
      if (isWalkable(c.x, c.z) && out.length) out[out.length - 1].set(c.x, 0, c.z);
      return out;
    },
    randomPoint(m, r) {
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * 6.2832, d = Math.sqrt(Math.random()) * r, x = m.x + Math.cos(a) * d, z = m.z + Math.sin(a) * d;
        if (isWalkable(x, z)) return new Vector3(x, 0, z);
      }
      const s = snap(m.x, m.z);
      return s >= 0 ? toV(s) : new Vector3(m.x, 0, m.z);
    },
    // open points on a coarse lattice, used as extra bot spawns
    lattice(step) {
      const out = [];
      for (let z = z0 + step / 2; z < b.maxZ; z += step) for (let x = x0 + step / 2; x < b.maxX; x += step) if (isWalkable(x, z)) out.push(new Vector3(x, 0, z));
      return out;
    },
    _grid: () => ({ blocked, w, h, minX: x0, minZ: z0, cell: CELL }),
  };
}
