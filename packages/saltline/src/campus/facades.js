// Facades for the campus buildings: buildFacades(G, data, root, opts?) -> { chunks, tris, trisFar, maxBuilding, update(camPos) }.
// Per footprint (data.footprints: {id, poly:[x,z,...], base, top}) and a style from building-styles.json:
//   near: recessed windows (reveals, sills, frame plate, per-pane tinted glass), base course, cornice, parapet or eave roof;
//   far (> FAR m from the camera): one textured wall mesh + flat roof. Both merged per 64 m chunk, one mesh per material.
// Collision is untouched (it uses the footprints). Materials come from G.mats (Saltline's set); glass is a tinted metal-ish standard material.
import { BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, CanvasTexture, Color, RepeatWrapping, SRGBColorSpace, Shape, ShapeGeometry } from 'three';
import STYLES from './building-styles.json';

const CHUNK = 64, FAR = 150, BUDGET = 4000;

// ---------- styles ----------
const mix = (...os) => os.reduce((a, o) => {
  for (const k in o || {}) a[k] = o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? mix(a[k] || {}, o[k]) : o[k];
  return a;
}, {});
export function styleFor(id, styles = STYLES) {
  const b = styles.buildings[id] || {};
  return mix(styles.default, styles.presets[b.style || 'default'], b);
}

// ---------- merged geometry buckets ----------
class Bucket {
  constructor(mat, colored) { this.mat = mat; this.p = []; this.n = []; this.uv = []; this.c = colored ? [] : null; }
  // quad a,b,c,d (counter-clockwise from the visible side); optional colour and uv corners
  q(a, b, c, d, col, uvs) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const u = uvs || [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (const i of [0, 1, 2, 0, 2, 3]) {
      const v = [a, b, c, d][i];
      this.p.push(v[0], v[1], v[2]); this.n.push(nx, ny, nz); this.uv.push(u[i][0], u[i][1]);
      if (this.c) this.c.push(col[0], col[1], col[2]);
    }
  }
  t(a, b, c, uvs) { // triangle, counter-clockwise from the visible side
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    [a, b, c].forEach((v, i) => { this.p.push(v[0], v[1], v[2]); this.n.push(nx / l, ny / l, nz / l); this.uv.push(...uvs[i]); });
  }
  mesh() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new Float32BufferAttribute(this.uv, 2));
    if (this.c) g.setAttribute('color', new Float32BufferAttribute(this.c, 3));
    g.computeBoundingSphere();
    const m = new Mesh(g, this.mat);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
}

// ---------- footprint helpers ----------
function ring(poly) { // [[x,z]...] counter-clockwise (area > 0 in x,z), no repeats
  const r = [];
  for (let i = 0; i < poly.length; i += 2) {
    const p = [poly[i], poly[i + 1]], q = r[r.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.05) r.push(p);
  }
  let a = 0;
  r.forEach((p, i) => { const q = r[(i + 1) % r.length]; a += p[0] * q[1] - q[0] * p[1]; });
  return a < 0 ? r.reverse() : r;
}
const edgeNorm = (p, q) => { const dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1; return [dz / l, -dx / l]; };
// miter offset (outward positive); falls back to a plain normal offset at spikes
function offset(r, dist) {
  return r.map((p, i) => {
    const a = edgeNorm(r[(i + r.length - 1) % r.length], p), b = edgeNorm(p, r[(i + 1) % r.length]);
    const k = 1 + a[0] * b[0] + a[1] * b[1];
    return k < 0.25 ? [p[0] + b[0] * dist, p[1] + b[1] * dist] : [p[0] + (a[0] + b[0]) / k * dist, p[1] + (a[1] + b[1]) / k * dist];
  });
}
function cap(bucket, r, y) {
  const s = new Shape();
  r.forEach((p, i) => (i ? s.lineTo(p[0], -p[1]) : s.moveTo(p[0], -p[1])));
  const g = new ShapeGeometry(s), pos = g.attributes.position, ix = g.index.array;
  for (let i = 0; i < ix.length; i += 3) {
    const v = [0, 1, 2].map((k) => [pos.getX(ix[i + k]), y, -pos.getY(ix[i + k])]);
    bucket.t(v[0], v[1], v[2], v.map((p) => [p[0], p[2]]));
  }
  g.dispose();
}

// ---------- far-LOD wall texture (one bay x one floor, tiled) ----------
const farTex = new Map();
function farTexture(S, key) {
  if (farTex.has(key)) return farTex.get(key);
  const ppm = 28, w = Math.round(S.bay * ppm), h = Math.round(S.floorH * ppm);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), wc = new Color(S.wall.color);
  g.fillStyle = `rgb(${wc.r * 200 | 0},${wc.g * 150 | 0},${wc.b * 140 | 0})`; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${i & 1 ? '60,30,20' : '230,200,180'},0.07)`; g.fillRect(Math.random() * w, Math.random() * h, 3, 2); }
  const ww = S.winW * ppm, wh = S.winH * ppm, x0 = (w - ww) / 2, y0 = h - (S.sill + S.winH) * ppm;
  g.fillStyle = '#1b1b1d'; g.fillRect(x0 - 2, y0 - 2, ww + 4, wh + 4);
  const gr = g.createLinearGradient(0, y0, 0, y0 + wh); gr.addColorStop(0, '#6b8196'); gr.addColorStop(1, '#1f2e3c');
  g.fillStyle = gr; g.fillRect(x0, y0, ww, wh);
  g.fillStyle = '#1b1b1d'; for (let i = 1; i < S.panes[0]; i++) g.fillRect(x0 + ww * i / S.panes[0] - 1, y0, 2, wh);
  g.fillStyle = 'rgb(215,205,185)'; g.fillRect(x0 - 3, y0 + wh, ww + 6, 3);
  const t = new CanvasTexture(cv); t.wrapS = t.wrapT = RepeatWrapping; t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
  farTex.set(key, t);
  return t;
}

// ---------- one building ----------
// Emits into get(kind, colored?) buckets; returns the triangle count. level: 3 full, 2 no right reveal / single pane, 1 glass + top reveal only.
function building(f, S, level, get) {
  const R = ring(f.poly), n = R.length, y0 = f.base, top = f.top, H = top - y0;
  const zone = Math.min(S.cornice.h, H * 0.2);
  const nF = Math.max(1, Math.round((H - zone) / S.floorH)), fh = (H - zone) / nF;
  const sill0 = Math.max(S.sill, S.base.h + 0.15), wH = Math.min(S.winH, fh - sill0 - 0.5);
  const d = S.depth, RV = S.reveal === 'trim' ? get('trim') : get('wall'), W = get('wall'), T = get('trim'), FR = get('frame'), GL = get('glass', true), RF = get('roof');
  const count = () => W.p.length + T.p.length + FR.p.length + GL.p.length + RF.p.length;
  const t0 = count() + (RV === W || RV === T ? 0 : 0);
  // point on edge i: u along the edge, height y, o outward
  const P = (i, u, y, o) => {
    const a = R[i], b = R[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L;
    return [a[0] + dx * u + dz * o, y, a[1] + dz * u - dx * o];
  };
  // quad on edge i facing outward (bottom-left, top-left, top-right, bottom-right)
  const face = (B, i, u0, ya, u1, yb, o, col) => B.q(P(i, u0, ya, o), P(i, u0, yb, o), P(i, u1, yb, o), P(i, u1, ya, o), col);
  // ring strip from (oA,yA) to (oB,yB) around the footprint: faces outward if it rises, down if it moves outward, up if it moves inward
  const strip = (B, oA, yA, oB, yB) => {
    const A = offset(R, oA), C = offset(R, oB);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      B.q([A[i][0], yA, A[i][1]], [C[i][0], yB, C[i][1]], [C[j][0], yB, C[j][1]], [A[j][0], yA, A[j][1]]);
    }
  };
  for (let i = 0; i < n; i++) {
    const e = R[(i + 1) % n], L = Math.hypot(e[0] - R[i][0], e[1] - R[i][1]);
    const nb = wH < 0.6 ? 0 : Math.floor((L - 1.8) / S.bay);
    if (nb < 1) { face(W, i, 0, y0, L, top - zone, 0); continue; }
    const bay = (L - 1.8) / nb, ww = Math.min(bay - 0.5, S.winW);
    for (let k = 0; k < nF; k++) {
      const fa = y0 + k * fh, wa = fa + (k ? S.sill : sill0), wb = wa + wH;
      face(W, i, 0, fa, L, wa, 0); face(W, i, 0, wb, L, fa + fh, 0);
      let u = 0;
      for (let w = 0; w < nb; w++) {
        const x0 = 0.9 + w * bay + (bay - ww) / 2, x1 = x0 + ww;
        face(W, i, u, wa, x0, wb, 0); u = x1;
        face(FR, i, x0, wa, x1, wb, -d);
        const pc = level >= 3 ? S.panes[0] : 1, pr = level >= 3 ? S.panes[1] : 1;
        for (let a = 0; a < pc; a++) for (let b = 0; b < pr; b++) {
          const g0 = x0 + 0.05 + (ww - 0.1) * a / pc + (a ? 0.07 : 0), g1 = x0 + 0.05 + (ww - 0.1) * (a + 1) / pc - (a < pc - 1 ? 0.07 : 0);
          const h0 = wa + 0.05 + (wH - 0.1) * b / pr + (b ? 0.07 : 0), h1 = wa + 0.05 + (wH - 0.1) * (b + 1) / pr - (b < pr - 1 ? 0.07 : 0);
          const v = 0.7 + ((k * 7 + w * 13 + a * 5 + b * 3 + i * 11) % 7) / 7 * 0.6; // per-pane brightness
          face(GL, i, g0, h0, g1, h1, -d + 0.04, [S.gc.r * v, S.gc.g * v, S.gc.b * v]);
        }
        RV.q(P(i, x0, wb, -d), P(i, x0, wb, 0), P(i, x1, wb, 0), P(i, x1, wb, -d)); // top reveal, faces down
        if (level >= 2) {
          RV.q(P(i, x0, wa, -d), P(i, x0, wa, 0), P(i, x0, wb, 0), P(i, x0, wb, -d)); // left reveal
          T.q(P(i, x0, wa, -d), P(i, x1, wa, -d), P(i, x1, wa, 0.08), P(i, x0, wa, 0.08)); // sill top
          face(T, i, x0 - 0.05, wa - 0.1, x1 + 0.05, wa, 0.08); // sill front
        }
        if (level >= 3) RV.q(P(i, x1, wa, -d), P(i, x1, wb, -d), P(i, x1, wb, 0), P(i, x1, wa, 0)); // right reveal
      }
      face(W, i, u, wa, L, wb, 0);
    }
  }
  if (S.base.h > 0) { strip(T, 0.06, y0, 0.06, y0 + S.base.h); strip(T, 0.06, y0 + S.base.h, 0, y0 + S.base.h); } // water table
  if (S.roof.type === 'eave') {
    const e = S.roof.eave, ins = S.roof.inset;
    strip(T, 0, top - zone, 0, top);
    strip(FR, 0, top, e, top); // soffit
    strip(RF, e, top, e, top + 0.25); // fascia
    strip(RF, e, top + 0.25, -ins, top + S.roof.rise);
    cap(RF, offset(R, -ins), top + S.roof.rise);
  } else {
    const out = S.cornice.out;
    strip(T, 0, top - zone, 0, top);
    if (out > 0) { strip(T, out, top - zone, out, top); strip(T, 0, top - zone, out, top - zone); strip(T, out, top, 0, top); }
    if (S.parapet > 0) { strip(T, 0, top, 0, top + S.parapet); strip(T, 0, top + S.parapet, -0.25, top + S.parapet); strip(RF, -0.25, top + S.parapet, -0.25, top); }
    cap(RF, R, top + 0.01);
  }
  return (count() - t0) / 9;
}

function farBuilding(f, get) {
  const R = ring(f.poly), n = R.length, S = get.S, top = f.top, y0 = f.base, W = get('farwall');
  for (let i = 0; i < n; i++) {
    const a = R[i], b = R[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nb = Math.max(1, Math.round(L / S.bay)), v1 = (top - y0) / S.floorH;
    W.q([a[0], y0, a[1]], [a[0], top, a[1]], [b[0], top, b[1]], [b[0], y0, b[1]], null, [[0, 0], [0, v1], [nb, v1], [nb, 0]]);
  }
  cap(get('roof'), R, top);
}

// ---------- everything ----------
export function buildFacades(G, data, root, opts = {}) {
  const styles = opts.styles || STYLES, chunks = new Map(), matCache = new Map();
  const glassMat = new MeshStandardMaterial({ vertexColors: true, color: 0xffffff, roughness: 0.08, metalness: 0.35, envMapIntensity: 1.6 });
  const mat = (key, make) => (matCache.has(key) ? matCache.get(key) : (matCache.set(key, make()), matCache.get(key)));
  const hex = (c) => new Color(c).getHex();
  // bucket getter for one style into one map of buckets (keyed per material variant)
  const getter = (S, map) => {
    const get = (kind, colored) => {
      let key, make;
      if (kind === 'wall') { key = `wall|${S.wall.mat}|${S.wall.color}|${S.wall.scale}`; make = () => G.mats.get(S.wall.mat, { triplanar: true, scale: S.wall.scale, color: hex(S.wall.color) }); }
      else if (kind === 'trim') { key = `trim|${S.trim.mat}|${S.trim.color}`; make = () => G.mats.get(S.trim.mat, { triplanar: true, scale: 2, color: hex(S.trim.color) }); }
      else if (kind === 'frame') { key = `frame|${S.frame.mat}|${S.frame.color}`; make = () => G.mats.get(S.frame.mat, { triplanar: true, ...(S.frame.color ? { color: hex(S.frame.color) } : {}) }); }
      else if (kind === 'roof') { key = `roof|${S.roof.mat}|${S.roof.color}`; make = () => G.mats.get(S.roof.mat, { triplanar: true, scale: 3, color: hex(S.roof.color) }); }
      else if (kind === 'glass') { key = 'glass'; make = () => glassMat; }
      else { key = `farwall|${S.wall.color}|${S.bay}|${S.floorH}|${S.winW}|${S.winH}|${S.sill}|${S.panes}`; make = () => new MeshStandardMaterial({ map: farTexture(S, key), roughness: 0.85, metalness: 0 }); }
      if (!map.has(key)) map.set(key, new Bucket(mat(key, make), colored));
      return map.get(key);
    };
    get.S = S;
    return get;
  };
  let tris = 0, maxB = 0;
  for (const f of data.footprints) {
    const S = styleFor(f.id, styles);
    S.gc = new Color(S.glass);
    const key = `${Math.floor((f.minX + f.maxX) / 2 / CHUNK)},${Math.floor((f.minZ + f.maxZ) / 2 / CHUNK)}`;
    const ch = chunks.get(key) || { near: new Map(), far: new Map(), pts: [] };
    chunks.set(key, ch);
    ch.pts.push([f.minX, f.minZ], [f.maxX, f.maxZ]);
    let level = 3; // richest level that fits the budget
    for (let tries = 0; ; tries++) {
      for (level = 3; level >= 1; level--) if (building(f, S, level, getter(S, new Map())) <= BUDGET) break;
      if (level >= 1 || tries > 3) { level = Math.max(level, 1); break; }
      S.bay *= 1.5; S.winW *= 1.5; // still too heavy at the minimal level: fewer, wider windows
    }
    const t = building(f, S, level, getter(S, ch.near));
    tris += t; maxB = Math.max(maxB, t);
    farBuilding(f, getter(S, ch.far));
  }
  let trisFar = 0;
  const lod = [];
  for (const ch of chunks.values()) {
    const g = { near: new Group(), far: new Group() };
    for (const b of ch.near.values()) g.near.add(b.mesh());
    for (const b of ch.far.values()) { g.far.add(b.mesh()); trisFar += b.p.length / 9; }
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of ch.pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    root.add(g.near, g.far);
    lod.push({ ...g, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, r: Math.hypot(x1 - x0, z1 - z0) / 2 });
  }
  const update = (p, far = FAR) => {
    for (const c of lod) { const nearIt = Math.hypot(p.x - c.cx, p.z - c.cz) - c.r < far; c.near.visible = nearIt; c.far.visible = !nearIt; }
  };
  if (G.camera) (G.campusTick = G.campusTick || []).push(() => update(G.camera.position));
  return { chunks: chunks.size, tris: Math.round(tris), trisFar: Math.round(trisFar), maxBuilding: Math.round(maxB), update };
}
