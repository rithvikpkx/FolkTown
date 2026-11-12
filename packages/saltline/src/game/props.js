import { Group as At, BufferGeometry as pt, BufferAttribute as nt, PlaneGeometry as w0, SphereGeometry as Gi, LatheGeometry as yr, Vector2 as We, Euler as _0, Quaternion as St, Matrix4 as Je, Vector3 as K, Mesh as ht, MathUtils as ks, AudioListener as r2, Color as Qe, BoxGeometry as R0, ShapeUtils as As, TorusGeometry as jn, LoopRepeat as px, ConstantAlphaFactor as nx } from 'three';
import * as ut from 'three';
import { ar } from './ns.js';
import { ns, ot, Kr, vt, bn, Jr, su, th } from './common.js';
// forward references, filled in by the owning later file (see README)
let cu, sl, pz, nz;
export const __late = {
  cu(v) {
    cu = v;
  },
  sl(v) {
    sl = v;
  },
  pz(v) {
    pz = v;
  },
  nz(v) {
    nz = v;
  },
};

export var hv = {};
  ar(hv, { PROP_SIZES: () => Yi, create: () => fv, register: () => Si, showcase: () => Tk });
  export var Yi = {
      container20: [6.06, 2.59, 2.44, "paint_red", "metal"],
      container40: [12.19, 2.59, 2.44, "paint_blue", "metal"],
      container40hc: [12.19, 2.9, 2.44, "paint_green", "metal"],
      jersey_barrier: [3, 0.81, 0.6, "concrete", "concrete"],
      light_mast: [0.5, 14, 0.5, "steel_galv", "metal"],
      fence_panel: [3, 2.4, 0.08, "chainlink", "metal"],
      guard_booth: [2.6, 2.7, 2.2, "paint_white", "metal"],
      gate_arm: [5, 1.1, 0.3, "hazard_stripes", "metal"],
      bollard_mooring: [0.7, 0.6, 0.7, "steel_dark", "metal"],
      bollard_post: [0.17, 1, 0.17, "paint_yellow", "metal"],
      relay_node: [1.2, 2.4, 0.8, "paint_grey", "metal"],
      shelf_rack: [2.7, 4.2, 1.1, "paint_orange", "metal"],
      stairs_metal: [3, 2.6, 1, "diamond_plate", "metal"],
      catwalk: [3, 1.1, 1.2, "diamond_plate", "metal"],
      reefer_unit: [0.5, 2.3, 2.3, "paint_white", "metal"],
      barrel: [0.6, 0.9, 0.6, "paint_blue", "metal"],
      pallet: [1.2, 0.144, 1, "wood_pallet", "wood"],
      pallet_stack: [1.2, 1.15, 1, "wood_pallet", "wood"],
      crate_wood: [1.1, 1, 0.9, "wood_pallet", "wood"],
      crate_stack: [1.2, 1.9, 1, "wood_pallet", "wood"],
      ibc_tote: [1.2, 1.16, 1, "plastic_grey", "metal"],
      forklift: [3.4, 2.2, 1.25, "paint_yellow", "metal"],
      cable_reel: [1.3, 1.3, 0.8, "wood_dark", "wood"],
      tire_stack: [0.8, 1, 0.8, "tire", "rubber"],
      dumpster: [1.9, 1.35, 1.1, "paint_green", "metal"],
      generator: [2.2, 1.4, 1, "paint_yellow", "metal"],
      jerry_can: [0.35, 0.47, 0.17, "paint_green", "metal"],
      traffic_cone: [0.36, 0.7, 0.36, "plastic_red", "rubber"],
      gas_cylinders: [0.9, 1.6, 0.5, "steel_dark", "metal"],
      tarp_cargo: [2.4, 1.5, 1.4, "tarp", "dirt"],
      sandbags: [2, 0.9, 0.6, "tarp", "dirt"],
      toolbox_cart: [0.9, 0.95, 0.5, "plastic_red", "metal"],
      floodlight_stand: [1, 2.2, 1, "paint_yellow", "metal"],
      cardboard_boxes: [1, 0.8, 0.8, "cardboard", "wood"],
      pipe_stack: [6, 0.9, 1.2, "steel_rust", "metal"],
      sign_post: [0.6, 2.4, 0.08, "paint_white", "metal"],
    },
    uv = {};
  export function Si(n, e) {
    uv[n] = e;
  }
  export function fv(n) {
    return {
      names: () => Object.keys(Yi),
      has: (e) => !!Yi[e],
      build(e, t = {}) {
        if (uv[e])
          try {
            let o = uv[e](n, t);
            if (o) return ((o.userData.prop = e), o);
          } catch (o) {
            console.error(`[props] builder "${e}" threw`, o);
          }
        let i = Yi[e] || [1, 1, 1, "concrete", "concrete"];
        Yi[e] || console.warn(`[props] unknown prop "${e}"`);
        let s = new At();
        return (
          s.add(ns(ot(i[0], i[1], i[2], "bottom"), n.mats.get(i[3]))),
          (s.userData.colliders = [{ min: [-i[0] / 2, 0, -i[2] / 2], max: [i[0] / 2, i[1], i[2] / 2], surface: i[4] }]),
          (s.userData.size = [i[0], i[1], i[2]]),
          (s.userData.prop = e),
          s
        );
      },
    };
  }
  export function Tk(n) {
    let e = n.params.names ? n.params.names.split(",") : Object.keys(Yi),
      t = 0,
      i = 0,
      s = 0,
      o = 0;
    for (let a of e) {
      let l = n.props.build(a, { seed: 7, doors: a.startsWith("container") ? 0.6 : 0 }),
        c = l.userData.size || Yi[a] || [1, 1, 1];
      (t + c[0] > 26 && ((t = 0), (i += s + 1.5), (s = 0)),
        l.position.set(t + c[0] / 2, 0, i),
        n.scene.add(l),
        (t += c[0] + 1),
        (s = Math.max(s, c[2])),
        (o = Math.max(o, t)));
    }
    let r = Math.min(o, 26) / 2;
    return { cam: [r - 4, 2.2, i + s + 6], target: [r, 1, i / 2] };
  }
  export function Fl(n) {
    let e = ((n | 0) * 2654435761) | 0;
    return () => {
      e = (e + 1831565813) | 0;
      let t = Math.imul(e ^ (e >>> 15), 1 | e);
      return ((t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t), ((t ^ (t >>> 14)) >>> 0) / 4294967296);
    };
  }
  export function dg(n, e) {
    let t = Math.sin(n * 127.1 + e * 311.7) * 43758.5453;
    return t - Math.floor(t);
  }
  export function Jn(n, e) {
    let t = Math.floor(n),
      i = Math.floor(e),
      s = n - t,
      o = e - i,
      r = s * s * (3 - 2 * s),
      a = o * o * (3 - 2 * o),
      l = dg(t, i),
      c = dg(t + 1, i),
      u = dg(t, i + 1),
      f = dg(t + 1, i + 1);
    return l + (c - l) * r + (u - l) * a + (l - c - u + f) * r * a;
  }
  export var Ak = (n) => Math.max(0, Math.min(1, n)),
    H0 = (n, e, t) => {
      let i = Ak((t - n) / (e - n));
      return i * i * (3 - 2 * i);
    },
    Qr = (n, e, t) => [n[0] + (e[0] - n[0]) * t, n[1] + (e[1] - n[1]) * t, n[2] + (e[2] - n[2]) * t];
  export function y_(n, e, t, i = 0.01, s = "center") {
    i = Math.max(5e-4, Math.min(i, n / 2 - 1e-4, e / 2 - 1e-4, t / 2 - 1e-4));
    let o = n / 2,
      r = e / 2,
      a = t / 2,
      l = new Float32Array(72),
      c = new Float32Array(72),
      u = new Float32Array(48),
      f = (v, y, b, g) => ((v > 0 ? 1 : 0) + (y > 0 ? 2 : 0) + (b > 0 ? 4 : 0)) * 3 + g;
    for (let v of [-1, 1])
      for (let y of [-1, 1])
        for (let b of [-1, 1]) {
          let g = [
              [v * o, y * (r - i), b * (a - i)],
              [v * (o - i), y * r, b * (a - i)],
              [v * (o - i), y * (r - i), b * a],
            ],
            E = [
              [v, 0, 0],
              [0, y, 0],
              [0, 0, b],
            ];
          for (let M = 0; M < 3; M++) {
            let _ = f(v, y, b, M);
            (l.set(g[M], _ * 3),
              c.set(E[M], _ * 3),
              M === 0
                ? ((u[_ * 2] = g[M][2]), (u[_ * 2 + 1] = g[M][1]))
                : M === 1
                  ? ((u[_ * 2] = g[M][0]), (u[_ * 2 + 1] = g[M][2]))
                  : ((u[_ * 2] = g[M][0]), (u[_ * 2 + 1] = g[M][1])));
          }
        }
    let h = [],
      p = (v, y, b) => {
        let g = l[v * 3],
          E = l[v * 3 + 1],
          M = l[v * 3 + 2],
          _ = l[y * 3] - g,
          T = l[y * 3 + 1] - E,
          w = l[y * 3 + 2] - M,
          S = l[b * 3] - g,
          R = l[b * 3 + 1] - E,
          z = l[b * 3 + 2] - M,
          I = T * z - w * R,
          L = w * S - _ * z,
          U = _ * R - T * S,
          k = g + (_ + S) / 3,
          C = E + (T + R) / 3,
          A = M + (w + z) / 3;
        I * k + L * C + U * A >= 0 ? h.push(v, y, b) : h.push(v, b, y);
      },
      d = (v, y, b, g) => {
        (p(v, y, b), p(v, b, g));
      },
      m = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];
    for (let v of [-1, 1])
      (d(...m.map(([y, b]) => f(v, y, b, 0))), d(...m.map(([y, b]) => f(y, v, b, 1))), d(...m.map(([y, b]) => f(y, b, v, 2))));
    for (let v of [-1, 1])
      for (let y of [-1, 1])
        (d(f(-1, v, y, 1), f(1, v, y, 1), f(1, v, y, 2), f(-1, v, y, 2)),
          d(f(v, -1, y, 0), f(v, 1, y, 0), f(v, 1, y, 2), f(v, -1, y, 2)),
          d(f(v, y, -1, 0), f(v, y, 1, 0), f(v, y, 1, 1), f(v, y, -1, 1)));
    for (let v of [-1, 1]) for (let y of [-1, 1]) for (let b of [-1, 1]) p(f(v, y, b, 0), f(v, y, b, 1), f(v, y, b, 2));
    let x = new pt();
    return (
      x.setAttribute("position", new nt(l, 3)),
      x.setAttribute("normal", new nt(c, 3)),
      x.setAttribute("uv", new nt(u, 2)),
      x.setIndex(h),
      s === "bottom" && x.translate(0, e / 2, 0),
      x
    );
  }
  export function b_(n, e, t, i, s, o) {
    let r = 0;
    for (let a = t; a < i; a += 9) {
      let l = n[a + 3] - n[a],
        c = n[a + 4] - n[a + 1],
        u = n[a + 5] - n[a + 2],
        f = n[a + 6] - n[a],
        h = n[a + 7] - n[a + 1],
        p = n[a + 8] - n[a + 2],
        d = c * p - u * h,
        m = u * f - l * p,
        x = l * h - c * f;
      r +=
        d * ((n[a] + n[a + 3] + n[a + 6]) / 3 - s[0]) +
        m * ((n[a + 1] + n[a + 4] + n[a + 7]) / 3 - s[1]) +
        x * ((n[a + 2] + n[a + 5] + n[a + 8]) / 3 - s[2]);
    }
    if (r < 0 != !!o)
      for (let a = t; a < i; a += 9) {
        for (let c = 0; c < 3; c++) {
          let u = n[a + 3 + c];
          ((n[a + 3 + c] = n[a + 6 + c]), (n[a + 6 + c] = u));
        }
        let l = (a / 3) * 2;
        for (let c = 0; c < 2; c++) {
          let u = e[l + 2 + c];
          ((e[l + 2 + c] = e[l + 4 + c]), (e[l + 4 + c] = u));
        }
      }
  }
  export function Fa(n, e, t, { closed: i = !1, center: s = null, inward: o = !1, caps: r = !1 } = {}) {
    let a = [],
      l = [],
      c = n.length,
      u = i ? c : c - 1,
      f = [0];
    for (let x = 0; x < u; x++) {
      let v = n[x],
        y = n[(x + 1) % c];
      f.push(f[x] + Math.hypot(y[0] - v[0], y[1] - v[1]));
    }
    for (let x = 0; x < e.length - 1; x++) {
      let v = e[x],
        y = e[x + 1];
      for (let b = 0; b < u; b++) {
        let g = n[b],
          E = n[(b + 1) % c],
          M = t(g[0], g[1], v, x),
          _ = t(E[0], E[1], v, x),
          T = t(E[0], E[1], y, x + 1),
          w = t(g[0], g[1], y, x + 1);
        (a.push(...M, ..._, ...T, ...M, ...T, ...w), l.push(f[b], v, f[b + 1], v, f[b + 1], y, f[b], v, f[b + 1], y, f[b], y));
      }
    }
    let h = a.length,
      p = null,
      d = () => {
        if (s) return s;
        if (!p) {
          p = [0, 0, 0];
          for (let v = 0; v < h; v += 3) ((p[0] += a[v]), (p[1] += a[v + 1]), (p[2] += a[v + 2]));
          let x = 3 / h;
          ((p[0] *= x), (p[1] *= x), (p[2] *= x));
        }
        return p;
      };
    if ((b_(a, l, 0, h, d(), o), r && i)) {
      let x = 0,
        v = 0;
      for (let y of n) ((x += y[0]), (v += y[1]));
      ((x /= c), (v /= c));
      for (let y of [0, e.length - 1]) {
        let b = a.length,
          g = e[y],
          E = t(x, v, g, y);
        for (let M = 0; M < c; M++) {
          let _ = n[M],
            T = n[(M + 1) % c];
          (a.push(...E, ...t(_[0], _[1], g, y), ...t(T[0], T[1], g, y)), l.push(x, v, _[0], _[1], T[0], T[1]));
        }
        b_(a, l, b, a.length, d(), o);
      }
    }
    let m = new pt();
    return (
      m.setAttribute("position", new nt(new Float32Array(a), 3)),
      m.setAttribute("uv", new nt(new Float32Array(l), 2)),
      m.computeVertexNormals(),
      m
    );
  }
  export function Rk(n, e, t, i, s) {
    let o = n % e;
    o < 0 && (o += e);
    let r = e - i - 2 * s;
    return o <= i ? 0 : o < i + s ? (-t * (o - i)) / s : o <= i + s + r ? -t : -t * (1 - (o - i - s - r) / s);
  }
  export function sh(n, e, t, i, s, o, r = n) {
    let a = t - s - 2 * o,
      l = [0, s, s + o, s + o + a],
      c = [n],
      u = Math.floor((n - r) / t) - 1,
      f = Math.ceil((e - r) / t) + 1;
    for (let h = u; h <= f; h++)
      for (let p of l) {
        let d = r + h * t + p;
        d > n + 1e-4 && d < e - 1e-4 && c.push(d);
      }
    return (c.push(e), c.map((h) => [h, Rk(h - r, t, i, s, o)]));
  }
  export function Ar(n, e, t = 5) {
    let i = [],
      s = Math.min(n, e) / 2,
      o = n / 2 - s,
      r = e / 2 - s;
    for (let u = 0; u < 4; u++)
      for (let f = 0; f <= t; f++) {
        let h = ((u + f / t) * Math.PI) / 2;
        i.push([Math.cos(h) * s + (u === 0 || u === 3 ? o : -o), Math.sin(h) * s + (u < 2 ? r : -r)]);
      }
    let a = [],
      l = [];
    for (let u = 0; u < i.length; u++) {
      let f = i[u],
        h = i[(u + 1) % i.length];
      (a.push(0, 0, 0, f[0], f[1], 0, h[0], h[1], 0), l.push(0.5, 0.5, f[0] / n + 0.5, f[1] / e + 0.5, h[0] / n + 0.5, h[1] / e + 0.5));
    }
    let c = new pt();
    return (
      c.setAttribute("position", new nt(new Float32Array(a), 3)),
      c.setAttribute("uv", new nt(new Float32Array(l), 2)),
      c.computeVertexNormals(),
      c
    );
  }
  export function D0(n, e) {
    return new w0(n, e);
  }
  export function oh(n, e) {
    let t = new w0(n, e),
      i = t.attributes.uv;
    for (let s = 0; s < i.count; s++) i.setXY(s, i.getX(s) * n, i.getY(s) * e);
    return t;
  }
  export function Ck(n) {
    let e = n.index ? n.toNonIndexed() : n;
    return (e.computeVertexNormals(), e);
  }
  export function Rr(n, e = 10, t = 6, i = Math.PI * 2, s = 0, o = Math.PI) {
    return new Gi(n, e, t, 0, i, s, o);
  }
  export function vg(n, e = 16) {
    return new yr(
      n.map((t) => new We(t[0], t[1])),
      e,
    );
  }
  export var pg = new _0(),
    ih = new St(),
    M_ = new Je(),
    mg = new K(),
    gg = new K(1, 1, 1);
  export function ct(n, e = 0, t = 0, i = 0, s = null) {
    return (
      s ? (pg.set(s[0], s[1], s[2]), ih.setFromEuler(pg)) : ih.identity(),
      mg.set(e, t, i),
      M_.compose(mg, ih, gg),
      n.applyMatrix4(M_),
      n
    );
  }
  export function Co(n = 0, e = 0, t = 0, i = null) {
    return (i ? (pg.set(i[0], i[1], i[2]), ih.setFromEuler(pg)) : ih.identity(), mg.set(n, e, t), new Je().compose(mg, ih, gg));
  }
  export var On = class {
    constructor(e) {
      ((this.G = e), (this.buckets = new Map()), (this.stack = []), (this.m = null), (this.defCol = new Map()));
    }
    M(e, t) {
      return this.G.mats.get(e, t);
    }
    push(e) {
      return (this.stack.push(this.m), (this.m = this.m ? this.m.clone().multiply(e) : e.clone()), this);
    }
    pop() {
      return ((this.m = this.stack.pop()), this);
    }
    add(e, t, i, s) {
      this.m && t.applyMatrix4(this.m);
      let o = i || this.defCol.get(e);
      o && Kr(t, o);
      let r = this.buckets.get(e);
      return (r || ((r = { mat: e, geos: [], cast: !s }), this.buckets.set(e, r)), r.geos.push(t), t);
    }
    box(e, t, i, s, o, r, a, l = {}) {
      return this.add(
        e,
        ct(l.r === 0 ? ot(t, i, s) : y_(t, i, s, l.r || Math.min(0.012, Math.min(t, i, s) * 0.25)), o, r, a, l.rot),
        l.col,
      );
    }
    cyl(e, t, i, s, o, r, a, l = {}) {
      let c = vt(t, i, s, l.seg || 12, !!l.open);
      return (l.flat && (c = Ck(c)), this.add(e, ct(c, o, r, a, l.rot), l.col));
    }
    tube(e, t, i, s = {}) {
      return this.add(e, bn(t, i, s.seg || 6, !1, s.tension === void 0 ? 0.5 : s.tension), s.col);
    }
    bar(e, t, i, s, o = {}) {
      let r = new K(i[0] - t[0], i[1] - t[1], i[2] - t[2]),
        a = r.length(),
        l = vt(o.r2 === void 0 ? s : o.r2, s, a, o.seg || 6, !o.caps),
        c = new St().setFromUnitVectors(new K(0, 1, 0), r.normalize());
      return (
        l.applyMatrix4(new Je().compose(new K((t[0] + i[0]) / 2, (t[1] + i[1]) / 2, (t[2] + i[2]) / 2), c, gg)),
        this.add(e, l, o.col)
      );
    }
    beam(e, t, i, s, o, r = {}) {
      let a = new K(i[0] - t[0], i[1] - t[1], i[2] - t[2]),
        l = a.length(),
        c = r.r === 0 ? ot(s, l, o) : y_(s, l, o, r.r || Math.min(s, o) * 0.2),
        u = new St().setFromUnitVectors(new K(0, 1, 0), a.normalize());
      return (
        r.twist && u.multiply(new St().setFromAxisAngle(new K(0, 1, 0), r.twist)),
        c.applyMatrix4(new Je().compose(new K((t[0] + i[0]) / 2, (t[1] + i[1]) / 2, (t[2] + i[2]) / 2), u, gg)),
        this.add(e, c, r.col)
      );
    }
    decal(e, t, i, s, o, r, a) {
      return this.add(e.material, ct(D0(a || t * e.aspect, t), i, s, o, r), null, !0);
    }
    parts() {
      let e = [];
      for (let t of this.buckets.values()) e.push({ mat: t.mat, geo: Jr(t.geos), cast: t.cast });
      return e;
    }
    group(e) {
      return dv(this.parts(), e);
    }
  };
  export function dv(n, e) {
    let t = new At();
    for (let i of n) {
      let s = new ht(i.geo, (e && e.get(i.mat)) || i.mat);
      ((s.castShadow = i.cast), (s.receiveShadow = !0), t.add(s));
    }
    return t;
  }
  export function $i(n, e, t, i) {
    return ((n.userData.size = t), (n.userData.colliders = i), (n.name = e), n);
  }
  export var xg = new WeakMap();
  export function Ti(n, e, t) {
    let i = xg.get(n.mats);
    i || ((i = new Map()), xg.set(n.mats, i));
    let s = "L|" + e + "|" + JSON.stringify(t || {});
    if (!i.has(s)) {
      let o;
      try {
        o = n.mats.label(e, t || {});
      } catch {
        o = null;
      }
      i.set(s, o && o.material ? o : { material: n.mats.get("paint_white"), aspect: Math.max(1, e.length * 0.6) });
    }
    return i.get(s);
  }
  export function Vn(n, e) {
    let t = xg.get(n.mats);
    t || ((t = new Map()), xg.set(n.mats, t));
    let i = "D|" + e;
    if (!t.has(i)) {
      let s;
      try {
        s = n.mats.decal(e);
      } catch {
        s = null;
      }
      t.set(i, s && s.material ? s : { material: n.mats.get("paint_white"), aspect: 1 });
    }
    return t.get(i);
  }
  export var rh = 2.438,
    T_ = {
      container20: { type: "22G1", gross: "30,480", tare: "2,230", net: "28,250", cu: "33.2", def: "red" },
      container40: { type: "42G1", gross: "32,500", tare: "3,750", net: "28,750", cu: "67.7", def: "blue" },
      container40hc: { type: "45G1", gross: "32,500", tare: "3,940", net: "28,560", cu: "76.3", def: "green" },
    },
    yg = ["SLTU 482915 7", "HBMU 307144 2", "NRDU 665201 9", "OKTU 119873 4", "VSLU 850362 1", "TQLU 274590 6"],
    __ = ["logo_a", "logo_b", "logo_c", "logo_d"],
    pv = ["red", "blue", "green", "yellow", "orange", "white", "grey", "teal"],
    E0 = { body: !0 },
    kk = 6,
    w_ = new Map(),
    E_ = 0.178,
    n1 = 0.118,
    S_ = 0.162,
    Xo = { P: 0.278, d: 0.036, fo: 0.072, sl: 0.068 },
    bg = { P: 0.209, d: 0.02, fo: 0.09, sl: 0.03 },
    Mg = { P: 0.25, d: 0.042, fo: 0.07, sl: 0.06 };
  export function Pk(n, e, t, i, s) {
    let o = Yi[e][0],
      r = Yi[e][1],
      a = T_[e],
      l = Fl(1e3 + t * 77 + e.length * 13),
      c = new On(n),
      u = c.M("steel_galv"),
      f = c.M("wood_pallet"),
      h = rh / 2,
      p = o / 2,
      d = h - 0.012,
      m = -p + 0.085,
      x = p - 0.135,
      v = 0.167,
      y = r - 0.06,
      b = [],
      g = Math.round((1 + l() * 2.4) * (0.4 + s)),
      E = [
        [-p * 0.75, -p * 0.05],
        [p - 2.2, p],
      ];
    for (let ee = 0; ee < g; ee++) {
      let le = l() < 0.5 ? 1 : -1,
        xe = 0,
        j = 0;
      do ((xe = (l() * 2 - 1) * (p - 0.9)), j++);
      while (j < 8 && E.some((O) => xe > O[0] - 0.4 && xe < O[1] + 0.4 && l() < 0.9));
      b.push({ side: le, x: le * xe, y: 0.45 + l() * 1.3, r: 0.22 + l() * 0.3, depth: 0.025 + l() * 0.04 });
    }
    let M = [],
      _ = Math.round((o / 2.2) * (0.5 + s) * (0.6 + l()));
    for (let ee = 0; ee < _ * 2; ee++)
      M.push({ side: ee % 2 ? 1 : -1, x: (l() * 2 - 1) * (p - 0.3), w: 0.05 + l() * 0.12, k: 0.4 + l() * 0.6 });
    let T = [0.5, 0.44, 0.38],
      w = [0.62, 0.38, 0.24],
      S = t * 9.7,
      R = (ee, le, xe) => {
        let j = 1 + (Jn(ee * 0.9 + S, le * 1.7 + xe * 0.4) - 0.5) * 0.16 * (0.5 + s);
        j *= 0.94 + 0.06 * Jn(ee * 6.1 + xe * 3.3, le * 5 + S);
        let O = [j, j, j],
          q = H0(0.62, 0.02, le) * (0.45 + 0.5 * s) * (0.75 + 0.5 * Jn(ee * 2.3 + xe, S));
        return ((O = Qr(O, [T[0] * j, T[1] * j, T[2] * j], Math.min(1, q))), O);
      };
    c.defCol.set(E0, R);
    let z = (ee, le, xe) => {
        let j = 0;
        for (let O of b)
          if (O.side === xe) {
            let q = Math.hypot(ee - O.x, (le - O.y) * 0.9) / O.r;
            if (q < 1) {
              let ue = 1 - q * q;
              j += O.depth * ue * ue;
            }
          }
        return j;
      },
      I = [0.035, 0.035, 0.04];
    for (let ee of [-1, 1])
      for (let le of [0, 1])
        for (let xe of [-1, 1]) {
          let j = ee * (p - E_ / 2),
            O = le ? r - n1 / 2 : n1 / 2,
            q = xe * (h - S_ / 2);
          (c.box(E0, E_, n1, S_, j, O, q, { r: 0.012 }),
            c.add(E0, ct(Ar(0.078, 0.052, 3), j, O, xe * (h + 0.0012), [0, xe > 0 ? 0 : Math.PI, 0]), I),
            c.add(E0, ct(Ar(0.064, 0.05, 3), ee * (p + 0.0012), O, q, [0, (ee * Math.PI) / 2, 0]), I),
            le && c.add(E0, ct(Ar(0.124, 0.064, 3), j, r + 0.0012, q, [-Math.PI / 2, 0, 0]), I));
        }
    for (let ee of [-1, 1])
      (c.box(E0, 0.085, r - 2 * n1 + 0.01, 0.15, -p + 0.0465, r / 2, ee * (h - 0.079), { r: 0.014 }),
        c.box(E0, 0.14, r - 2 * n1 + 0.01, 0.056, p - 0.074, r / 2, ee * (h - 0.032), { r: 0.012 }),
        c.box(E0, o - 0.2, 0.062, 0.062, -0.02, r - 0.031, ee * (h - 0.035), { r: 0.008 }),
        c.box(E0, o - 0.2, 0.158, 0.05, -0.02, 0.012 + 0.079, ee * (h - 0.029), { r: 0.008 }));
    if (
      (c.box(E0, 0.062, 0.062, rh - 0.2, -p + 0.035, r - 0.031, 0, { r: 0.008 }),
      c.box(E0, 0.05, 0.158, rh - 0.2, -p + 0.029, 0.091, 0, { r: 0.008 }),
      c.box(E0, 0.13, 0.12, rh - 0.12, p - 0.072, r - 0.06, 0, { r: 0.01 }),
      c.box(E0, 0.13, 0.158, rh - 0.12, p - 0.072, 0.091, 0, { r: 0.01 }),
      c.box(E0, 0.03, 0.012, rh - 0.4, p - 0.012, r - 0.125, 0, { r: 0.003, rot: [0, 0, -0.5] }),
      e === "container20")
    )
      for (let ee of [-1, 1])
        for (let le of [-1.025, 1.025]) {
          (c.add(E0, ct(D0(0.36, 0.112), le, 0.075, ee * (h - 0.0035), [0, ee > 0 ? 0 : Math.PI, 0]), I),
            c.box(E0, 0.46, 0.018, 0.012, le, 0.142, ee * (h - 0.002), { r: 0.003 }));
          for (let xe of [-1, 1]) c.box(E0, 0.018, 0.13, 0.01, le + xe * 0.19, 0.078, ee * (h - 0.003), { r: 0.003 });
        }
    let L = [v, 0.44, 1.25, r - 0.5, y],
      U = sh(m, x, Xo.P, Xo.d, Xo.fo, Xo.sl, m + 0.02);
    for (let ee of [-1, 1]) {
      let le = Fa(U, L, (O, q, ue) => [O, ue, ee * (d + q - z(O, ue, ee))], { center: [0, r / 2, 0] });
      le.computeVertexNormals();
      let xe = le.attributes.position,
        j = new Float32Array(xe.count * 3);
      for (let O = 0; O < xe.count; O++) {
        let q = xe.getX(O),
          ue = xe.getY(O),
          de = xe.getZ(O),
          $ = R(q, ue, de),
          se = d - Math.abs(de),
          fe = H0(0.008, 0.034, se);
        $ = [$[0] * (1 - 0.17 * fe), $[1] * (1 - 0.18 * fe), $[2] * (1 - 0.18 * fe)];
        let me = H0(r - 0.75, y, ue);
        if (me > 0) {
          for (let ce of M)
            if (ce.side === ee) {
              let P = Math.abs(q - ce.x) / ce.w;
              P < 1 && ($ = Qr($, [$[0] * w[0], $[1] * w[1], $[2] * w[2]], me * me * ce.k * (1 - P * P) * (0.45 + 0.55 * s)));
            }
        }
        let ge = z(q, ue, ee);
        (ge > 0.004 && ($ = Qr($, [$[0] * 0.66, $[1] * 0.46, $[2] * 0.36], Math.min(0.8, ge * 22))),
          (j[O * 3] = $[0]),
          (j[O * 3 + 1] = $[1]),
          (j[O * 3 + 2] = $[2]));
      }
      (le.setAttribute("color", new nt(j, 3)), c.buckets.get(E0).geos.push(le));
    }
    for (let ee of [-1, 1])
      for (let le of o > 7 ? [-1, 1] : [1]) {
        let xe = ee * le * (p - 0.62),
          j = r - 0.165,
          O = ee * (d - 0.004);
        c.box(E0, 0.24, 0.1, 0.03, xe, j, O, { r: 0.008 });
        for (let q = -1; q <= 1; q++) c.add(E0, ct(D0(0.18, 0.012), xe, j + q * 0.026, ee * (d + 0.0116), [0, ee > 0 ? 0 : Math.PI, 0]), I);
      }
    {
      let ee = sh(-h + 0.155, h - 0.155, Mg.P, Mg.d, Mg.fo, Mg.sl, -h + 0.155 + 0.03),
        le = Fa(ee, [v, 1.25, y], (j, O, q) => [-(p - 0.014 + O), q, j], { center: [0, r / 2, 0] }),
        xe = -(p - 0.014);
      c.add(E0, le, (j, O, q) => {
        let ue = R(j, O, q),
          de = H0(0.008, 0.038, j - xe);
        return [ue[0] * (1 - 0.17 * de), ue[1] * (1 - 0.18 * de), ue[2] * (1 - 0.18 * de)];
      });
    }
    {
      let ee = sh(-p + 0.07, p - 0.13, bg.P, bg.d, bg.fo, bg.sl, -p + 0.1),
        le = r - 0.008,
        xe = Fa(
          ee,
          o > 7 ? [-(h - 0.066), h - 0.066] : [-(h - 0.066), 0, h - 0.066],
          (j, O, q) => [j, le + O + (Math.abs(q) < 0.01 ? 0.006 : 0), q],
          { center: [0, r / 2, 0] },
        );
      c.add(E0, xe, (j, O, q) => {
        let ue = 0.78 + 0.3 * Jn(j * 0.8 + S, q * 1.1),
          de = H0(0.004, 0.018, le - O);
        return [ue * (1 - 0.25 * de), ue * (1 - 0.3 * de) * 0.97, ue * (1 - 0.32 * de) * 0.94];
      });
    }
    let k = i > 0.03,
      C = 0.172;
    if (k) {
      let ee = (j, O, q) => {
          let de = (0.16 + 0.62 * H0(-p, p, j) * H0(-p, p, j)) * (0.8 + 0.2 * H0(0.2, 1.4, O));
          return [de, de, de];
        },
        le = sh(m, x, Xo.P, Xo.d, Xo.fo, Xo.sl, m + 0.02);
      for (let j of [-1, 1])
        c.add(
          E0,
          Fa(le, [C, y - 0.02], (O, q, ue) => [O, ue, j * (d + q - 0.004)], { center: [0, r / 2, 0], inward: !0 }),
          ee,
        );
      (c.add(E0, ct(D0(x - m, 2 * d), (m + x) / 2, y - 0.03, 0, [Math.PI / 2, 0, 0]), ee),
        c.add(E0, ct(D0(2 * d, y - C), m + 0.03, (C + y) / 2, 0, [0, Math.PI / 2, 0]), ee));
      let xe = oh(x - m + 0.1, 2 * d - 0.02);
      (c.add(f, ct(xe, (m + x) / 2 + 0.05, C, 0, [-Math.PI / 2, 0, 0]), (j) => {
        let O = 0.3 + 0.6 * H0(-p, p, j) ** 2;
        return [O, O * 0.97, O * 0.93];
      }),
        c.box(u, 0.05, 0.006, 2 * d - 0.1, p - 0.11, C + 0.001, 0, { r: 0.002 }));
    }
    let A = 0.175,
      F = r - 0.124,
      H = F - A,
      N = h - 0.058 - 0.004,
      Z = p - 0.066,
      Q = (ee, le, xe) => R(ee, le, xe),
      W = [];
    for (let ee of [1, -1]) {
      let le = i * (ee > 0 ? 1 : 0.88) * ks.degToRad(ee > 0 ? 112 : 100),
        xe = ee * (h - 0.058);
      c.push(Co(Z, 0, xe, [0, -ee * le, 0]));
      let j = (re) => -ee * re,
        O = (A + F) / 2;
      c.box(E0, 0.034, H, N - 0.006, 0, O, j(N / 2), { r: 0.008, col: Q });
      let q = e === "container40hc" ? 7 : 6,
        ue = A + 0.085,
        de = F - 0.085,
        $ = (de - ue) / q,
        se = 0.019,
        fe = 0.031,
        me = [];
      for (let re = 0; re < q; re++) {
        let Y = ue + re * $;
        me.push([Y, se], [Y + 0.022, se], [Y + 0.05, fe], [Y + $ - 0.05, fe], [Y + $ - 0.022, se]);
      }
      (me.push([de, se]),
        c.add(
          E0,
          Fa(me, [0.075, N - 0.085], (re, Y, he) => [Y, re, j(he)], { center: [-1, O, j(N / 2)] }),
          (re, Y, he) => R(re, Y, he),
        ));
      let ge = (re) => ue + (re + 0.5) * $,
        ce = [0.05, 0.05, 0.05];
      (c.box(E0, 0.022, H + 0.012, 0.018, 0.004, O, j(N + 0.001), { r: 0, col: ce }),
        c.box(E0, 0.022, 0.016, N, 0.004, F + 0.004, j(N / 2), { r: 0, col: ce }),
        c.box(E0, 0.022, 0.016, N, 0.004, A - 0.004, j(N / 2), { r: 0, col: ce }));
      let P = e === "container40hc" ? 5 : 4;
      for (let re = 0; re < P; re++) {
        let Y = A + 0.16 + (re * (H - 0.32)) / (P - 1);
        (c.box(E0, 0.012, 0.062, 0.15, 0.021, Y, j(0.085), { r: 0 }),
          c.cyl(u, 0.013, 0.013, 0.086, 0.026, Y, j(-0.002), { seg: 6, open: !0 }));
      }
      for (let re of [0.31, 0.83]) {
        c.cyl(u, 0.0155, 0.0155, H + 0.2, 0.052, O, j(re), { seg: 7, open: !0 });
        for (let ne of [-1, 1])
          (c.add(u, ct(ot(0.03, 0.045, 0.085), 0.052 - 0.004, O + ne * (H / 2 + 0.065), j(re))),
            c.box(E0, 0.03, 0.05, 0.075, 0.052 - 0.012, O + ne * (H / 2 - 0.035), j(re), { r: 0 }));
        for (let ne of [A + H * 0.3, A + H * 0.72]) c.box(E0, 0.026, 0.04, 0.07, 0.052 - 0.012, ne, j(re), { r: 0 });
        let he = 1.02 + (re > 0.5 ? 0 : 0.13),
          V = re > 0.5 ? -1 : 1;
        (c.box(u, 0.02, 0.05, 0.05, 0.052 + 0.008, he, j(re), { r: 0 }),
          c.box(u, 0.011, 0.032, 0.36, 0.052 + 0.016, he, j(re + V * 0.19), { r: 0.004 }),
          c.box(E0, 0.03, 0.07, 0.05, 0.052 - 0.008, he, j(re + V * 0.33), { r: 0 }),
          c.box(u, 0.012, 0.085, 0.012, 0.052 + 0.012, he + 0.005, j(re + V * 0.33), { r: 0 }));
      }
      let D = 0.031 + 0.0025,
        B = [0, Math.PI / 2, 0],
        X = (re, Y, he, V, ne) => {
          let ye = Y * re.aspect;
          (ne && ye > ne && ((Y *= ne / ye), (ye = ne)), c.add(re.material, ct(D0(ye, Y), D, he, j(V), B), null, !0));
        };
      if (ee < 0) {
        (X(Ti(n, yg[t % yg.length], { color: "white", font: "stencil", distress: 0.3 }), 0.115, ge(q - 1), N / 2, N - 0.24),
          X(Ti(n, a.type, { color: "white", font: "stencil", distress: 0.3 }), 0.1, ge(q - 2), N / 2 + 0.2, 0.4));
        let re = { color: "white", font: "sans", distress: 0.2 };
        (X(Ti(n, "MAX GROSS " + a.gross + " KG", re), 0.052, ge(q - 3) + 0.062, N / 2 - 0.01, 0.44),
          X(Ti(n, "TARE " + a.tare + " KG   NET " + a.net + " KG", re), 0.045, ge(q - 3), N / 2 - 0.01, 0.44),
          X(Ti(n, "CU.CAP. " + a.cu + " CU.M", re), 0.045, ge(q - 3) - 0.062, N / 2 - 0.01, 0.44));
      } else
        (X(Vn(n, __[t % 4]), 0.2, ge(q - 1), N / 2, N - 0.36),
          X(Vn(n, "csc_plate"), 0.17, ge(1), N / 2 + 0.05, 0.36),
          e === "container40hc" && X(Vn(n, "caution_stripes"), 0.1, F - 0.04, N / 2, N - 0.1));
      if ((c.pop(), k))
        for (let re = 0; re < 3; re++) {
          let Y = (N * re) / 3,
            he = (N * (re + 1)) / 3,
            V = [Z + Math.sin(le) * Y, xe - ee * Math.cos(le) * Y],
            ne = [Z + Math.sin(le) * he, xe - ee * Math.cos(le) * he];
          W.push({
            min: [Math.min(V[0], ne[0]) - 0.03, A, Math.min(V[1], ne[1]) - 0.03],
            max: [Math.max(V[0], ne[0]) + 0.03, F, Math.max(V[1], ne[1]) + 0.03],
            surface: "metal",
          });
        }
    }
    for (let ee of [1, -1])
      for (let le of [0.31, 0.83])
        for (let xe of [-1, 1]) {
          let j = ee * (h - 0.058) - ee * le;
          c.add(E0, ct(ot(0.035, 0.05, 0.11), p - 0.03, xe > 0 ? r - 0.07 : 0.115, j));
        }
    let J = (ee, le, xe, j, O, q) => {
        let ue = O * ee.aspect;
        q && ue > q && ((O *= q / ue), (ue = q));
        let de = xe - ue / 2,
          $ = xe + ue / 2,
          se = le > 0 ? de : -$,
          fe = le > 0 ? $ : -de,
          me = sh(Math.max(m, se), Math.min(x, fe), Xo.P, Xo.d, Xo.fo, Xo.sl, m + 0.02),
          ge = j - O / 2,
          ce = j + O / 2,
          P = Fa(me, [ge, ce], (X, re, Y) => [X, Y, le * (d + re + 0.003 - z(X, Y, le))], { center: [0, r / 2, 0] }),
          D = P.attributes.position,
          B = P.attributes.uv;
        for (let X = 0; X < D.count; X++) {
          let re = (D.getX(X) - se) / (fe - se);
          B.setXY(X, le > 0 ? re : 1 - re, (D.getY(X) - ge) / O);
        }
        return (c.add(ee.material, P, null, !0), ue);
      },
      G = Ti(n, yg[t % yg.length], { color: "white", font: "stencil", distress: 0.3 }),
      te = Ti(n, a.type, { color: "white", font: "stencil", distress: 0.3 }),
      oe = Vn(n, __[t % 4]);
    for (let ee of [-1, 1]) {
      let le = Math.min(r * 0.4, 1.05),
        xe = Math.min(le * oe.aspect, e === "container20" ? 2.2 : 3.4);
      J(oe, ee, e === "container20" ? -0.75 : -p * 0.42, r * 0.52, xe / oe.aspect, xe);
      let j = Math.min(0.14 * G.aspect, 1.9);
      J(G, ee, p - 0.3 - j / 2, r - 0.32, 0.14, 1.9);
      let O = Math.min(0.11 * te.aspect, 0.6);
      J(te, ee, p - 0.3 - O / 2, r - 0.52, 0.11, 0.6);
      let q = Math.round((1 + l() * 2) * (0.4 + s) * (o > 7 ? 1.6 : 1));
      for (let ue = 0; ue < q; ue++) {
        let de = Vn(n, l() < 0.6 ? "rust_run" : "grime_streak"),
          $ = 0.5 + l() * 0.7,
          se = Math.min(0.5, Math.max(0.16, $ * de.aspect));
        J({ material: de.material, aspect: se / $ }, ee, (l() * 2 - 1) * (p - 0.6), y - $ / 2 - 0.005, $);
      }
    }
    return (
      k
        ? W.push(
            { min: [-p, 0, -h], max: [p, C, h], surface: "wood" },
            { min: [-p, r - 0.09, -h], max: [p, r, h], surface: "metal" },
            { min: [-p, 0, -h], max: [p, r, -h + 0.07], surface: "metal" },
            { min: [-p, 0, h - 0.07], max: [p, r, h], surface: "metal" },
            { min: [-p, 0, -h], max: [-p + 0.07, r, h], surface: "metal" },
          )
        : W.push({ min: [-p, 0, -h], max: [p, r, h], surface: "metal" }),
      { parts: c.parts(), colliders: W }
    );
  }
  export function A_(n, e, t = {}) {
    let i = T_[e],
      s = t.seed === void 0 ? 0 : Math.abs(Math.floor(t.seed)),
      o = s % kk,
      r = Math.round(ks.clamp(t.doors || 0, 0, 1) * 10) / 10,
      a = Math.round(ks.clamp(t.wear === void 0 ? 0.5 : t.wear, 0, 1) * 2) / 2,
      l = e + "|" + o + "|" + r + "|" + a,
      c = w_.get(n.mats);
    (c || ((c = new Map()), w_.set(n.mats, c)), c.has(l) || c.set(l, Pk(n, e, o, r, a)));
    let u = c.get(l),
      f = t.color;
    pv.includes(f) || (f = t.seed === void 0 ? i.def : pv[(s * 7 + 3) % pv.length]);
    let h = dv(u.parts, new Map([[E0, n.mats.get("paint_" + f, { vertexColors: !0 })]])),
      p = Yi[e];
    return (
      (h.userData.color = f),
      (h.userData.doors = r),
      $i(
        h,
        e,
        [p[0], p[1], p[2]],
        u.colliders.map((d) => ({ min: d.min.slice(), max: d.max.slice(), surface: d.surface })),
      )
    );
  }
  export var Na = (n) => Yi[n].slice(0, 3),
    F0 = Math.PI;
  export function k_(n, e = {}) {
    let t = new On(n),
      i = e.seed | 0,
      s = Fl(i + 11),
      o = i * 3.7,
      r = t.M("concrete", { vertexColors: !0 }),
      a = [
        [-0.3, 0],
        [0.3, 0],
        [0.3, 0.076],
        [0.127, 0.33],
        [0.1, 0.57],
        [0.077, 0.79],
        [0.06, 0.81],
        [-0.06, 0.81],
        [-0.077, 0.79],
        [-0.1, 0.57],
        [-0.127, 0.33],
        [-0.3, 0.076],
      ],
      l = [-1.5, -1.47];
    for (let h = -1.25; h <= 1.26; h += 0.25) l.push(h);
    l.push(1.47, 1.5);
    let c = [];
    for (let h = 0; h < 7; h++) c.push([(s() * 2 - 1) * 1.5, s() * 0.8, 0.08 + s() * 0.14, s() < 0.5 ? 1 : -1]);
    let u = Fa(
      a,
      l,
      (h, p, d) => {
        let m = Math.abs(d) > 1.49 ? 1 : 0;
        return [d, p - m * 0.022 * (p / 0.81), h * (1 - m * 0.09)];
      },
      { closed: !0, caps: !0 },
    );
    t.add(r, u, (h, p, d) => {
      let m = 0.86 + 0.2 * Jn(h * 1.3 + o, p * 3 + d * 2) + 0.08 * Jn(h * 7, p * 9 + o),
        x = [m, m * 0.99, m * 0.97];
      x = Qr(x, [m * 0.5, m * 0.48, m * 0.44], H0(0.3, 0, p) * 0.8);
      let v = H0(0.55, 0.8, Jn(h * 4.5 + o, 3.3)) * H0(0.25, 0.8, p);
      x = Qr(x, [m * 0.62, m * 0.6, m * 0.56], v * 0.6);
      let y = H0(0.6, 0.85, Jn(h * 2.1 + o * 2, d * 3)) * H0(0.2, 0.33, p) * H0(0.62, 0.4, p);
      x = Qr(x, [0.22, 0.22, 0.22], y * 0.65);
      for (let b of c)
        if (Math.sign(d || 1) === b[3]) {
          let g = Math.hypot(h - b[0], p - b[1]) / b[2];
          g < 1 && (x = Qr(x, [1.12, 1.1, 1.05], (1 - g) * 0.7));
        }
      return (Math.abs(h) > 1.4 && (x = Qr(x, [1.08, 1.06, 1.02], 0.4 * Jn(p * 9, d * 9 + o))), x);
    });
    let f = [0.05, 0.05, 0.05];
    for (let h of [-1, 1])
      for (let p of [-0.85, 0.85])
        (t.add(r, ct(D0(0.3, 0.058), p, 0.03, h * 0.3008, [0, h > 0 ? 0 : F0, 0]), f),
          t.box(r, 0.34, 0.012, 0.012, p, 0.064, h * 0.3, { r: 0.003, col: [0.7, 0.7, 0.68] }));
    for (let h of [-0.9, 0.9])
      t.tube(
        t.M("steel_rust"),
        [
          [h - 0.05, 0.8, 0],
          [h - 0.04, 0.85, 0],
          [h + 0.04, 0.85, 0],
          [h + 0.05, 0.8, 0],
        ],
        0.008,
        { seg: 5 },
      );
    if (e.stripe) {
      let h = t.M("hazard_stripes");
      t.add(h, ct(oh(2.9, 0.118), 0, 0.8125, 0, [-F0 / 2, 0, 0]));
      for (let p of [-1, 1]) t.add(h, ct(oh(2.9, 0.2), 0, 0.68, p * 0.0905, [p > 0 ? -0.108 : 0.108, p > 0 ? 0 : F0, 0]));
    }
    return $i(t.group(), "jersey_barrier", Na("jersey_barrier"), [
      { min: [-1.5, 0, -0.3], max: [1.5, 0.33, 0.3], surface: "concrete" },
      { min: [-1.5, 0.33, -0.13], max: [1.5, 0.81, 0.13], surface: "concrete" },
    ]);
  }
  export function R_(n, e, t, i, s, o, r, a, l) {
    (n.push(Co(s, o, r, [0, a, 0])),
      n.push(Co(0, 0, 0, [0, 0, l])),
      n.box(t, 0.1, 0.34, 0.46, 0.09, 0, 0, { r: 0.014 }),
      n.add(i, ct(D0(0.4, 0.28), 0.1415, 0, 0, [0, F0 / 2, 0]), null, !0),
      n.box(t, 0.012, 0.018, 0.47, 0.146, 0.156, 0, { r: 0 }),
      n.box(t, 0.012, 0.018, 0.47, 0.146, -0.156, 0, { r: 0 }),
      n.box(t, 0.012, 0.33, 0.018, 0.146, 0, 0.222, { r: 0 }),
      n.box(t, 0.012, 0.33, 0.018, 0.146, 0, -0.222, { r: 0 }),
      n.box(t, 0.09, 0.008, 0.48, 0.17, 0.175, 0, { r: 0, rot: [0, 0, -0.12] }));
    for (let c = -3; c <= 3; c++) n.add(t, ct(ot(0.045, 0.3, 0.008), 0.02, 0, c * 0.062));
    (n.pop(), n.box(e, 0.03, 0.05, 0.56, 0.02, -0.02, 0, { r: 0.004 }));
    for (let c of [-1, 1]) n.box(e, 0.1, 0.05, 0.012, 0.05, -0.02, c * 0.275, { r: 0, rot: [0, 0, l * 0.5] });
    n.pop();
  }
  export function P_(n, e = {}) {
    let t = new On(n),
      i = t.M("steel_galv"),
      s = t.M("concrete", { vertexColors: !0 }),
      o = t.M("steel_dark"),
      r = n.mats.emissive(16769981, e.on === !1 ? 0.02 : 8);
    (t.box(s, 0.8, 0.32, 0.8, 0, 0.16, 0, {
      r: 0.03,
      col: (v, y, b) => {
        let g = 0.62 + 0.36 * H0(0, 0.3, y) + 0.1 * Jn(v * 5, b * 5);
        return [g, g, g * 0.97];
      },
    }),
      t.box(i, 0.5, 0.03, 0.5, 0, 0.335, 0, { r: 0.006 }));
    for (let v = 0; v < 8; v++) {
      let y = ((v + 0.5) * F0) / 4,
        b = Math.cos(y) * 0.215,
        g = Math.sin(y) * 0.215;
      (t.cyl(i, 0.014, 0.014, 0.1, b, 0.38, g, { seg: 6 }), t.cyl(i, 0.027, 0.027, 0.024, b, 0.362, g, { seg: 6, flat: !0 }));
    }
    let a = 0.35,
      l = 13.3,
      c = 0.168,
      u = 0.07,
      f = (v) => c + ((u - c) * (v - a)) / (l - a),
      h = [
        [a, 4.75, 0],
        [4.6, 9.15, 0.007],
        [9, l, 0.014],
      ];
    for (let [v, y, b] of h) t.cyl(i, f(y) + b, f(v) + b, y - v, 0, (v + y) / 2, 0, { seg: 8, flat: !0, open: !0, rot: [0, F0 / 8, 0] });
    for (let v = 0; v < 4; v++) {
      let y = (v * F0) / 2;
      t.box(i, 0.012, 0.2, 0.12, Math.cos(y) * 0.2, 0.45, -Math.sin(y) * 0.2, { r: 0, rot: [0, y + F0 / 2, 0] });
    }
    (t.cyl(i, 0.2, 0.2, 0.02, 0, 0.36, 0, { seg: 8, rot: [0, F0 / 8, 0] }),
      t.cyl(i, 0.09, 0.09, 0.03, 0, l, 0, { seg: 8, rot: [0, F0 / 8, 0] }));
    let p = f(1.05) * 0.924;
    (t.box(i, 0.13, 0.52, 0.012, 0, 1.05, p + 0.005, { r: 0.004 }),
      t.box(o, 0.03, 0.045, 0.012, 0.04, 1.05, p + 0.013, { r: 0.003 }),
      t.decal(Vn(n, "hazard_voltage"), 0.09, -0.01, 1.2, p + 0.0125, null),
      t.tube(
        o,
        [
          [-0.3, 0.3, 0.28],
          [-0.3, 0.52, 0.28],
          [-0.24, 0.72, 0.2],
          [-0.1, 0.8, 0.1],
        ],
        0.024,
        { seg: 6 },
      ),
      t.cyl(o, 0.034, 0.034, 0.03, -0.3, 0.335, 0.28, { seg: 8 }),
      t.bar(i, [0.1, 3, -0.13], [0.42, 3, -0.13], 0.012),
      t.bar(i, [0.1, 3, 0.13], [0.42, 3, 0.13], 0.012),
      t.bar(i, [0.42, 3, -0.16], [0.42, 3, 0.16], 0.012, { caps: !0 }),
      t.bar(i, [0.42, 3, -0.13], [0.42, 3.09, -0.13], 0.012, { caps: !0 }),
      t.bar(i, [0.42, 3, 0.13], [0.42, 3.09, 0.13], 0.012, { caps: !0 }),
      t.cyl(i, f(3) + 0.012, f(3) + 0.012, 0.05, 0, 3, 0, { seg: 8, rot: [0, F0 / 8, 0] }));
    let d = 0;
    for (let v = 3.45; v < 12.9; v += 0.38, d++) {
      let y = d % 2 ? 1 : -1;
      t.bar(i, [0, v, y * f(v) * 0.8], [0, v, y * (f(v) + 0.15)], 0.009, { seg: 5, caps: !0 });
    }
    let m = l + 0.12;
    (t.box(i, 0.1, 0.1, 1.9, 0, m, 0, { r: 0.012 }),
      t.box(i, 0.5, 0.07, 0.07, 0, m + 0.085, 0.55, { r: 0.01 }),
      t.box(i, 0.5, 0.07, 0.07, 0, m + 0.085, -0.55, { r: 0.01 }),
      t.beam(i, [0, l - 0.5, 0.08], [0, m - 0.03, 0.7], 0.04, 0.04),
      t.beam(i, [0, l - 0.5, -0.08], [0, m - 0.03, -0.7], 0.04, 0.04));
    for (let v of [-0.55, 0.55]) (R_(t, i, o, r, 0.22, m - 0.14, v, 0, -0.62), R_(t, i, o, r, -0.22, m - 0.14, v, F0, -0.62));
    (t.box(o, 0.16, 0.2, 0.12, 0, l - 0.25, -0.14, { r: 0.01 }), t.bar(i, [0, m, 0], [0, 14, 0], 0.012, { r2: 0.003, seg: 5, caps: !0 }));
    let x = t.group();
    x.userData.lamps = [];
    for (let v of [-0.55, 0.55])
      for (let y of [-1, 1]) x.userData.lamps.push({ pos: [y * 0.34, m - 0.22, v], dir: [y * 0.81, -0.58, 0], color: 16769981 });
    return $i(x, "light_mast", Na("light_mast"), [
      { min: [-0.4, 0, -0.4], max: [0.4, 0.32, 0.4], surface: "concrete" },
      { min: [-0.17, 0.32, -0.17], max: [0.17, 14, 0.17], surface: "metal" },
    ]);
  }
  export function I_(n, e = {}) {
    let t = new On(n),
      i = Fl((e.seed | 0) + 5),
      s = t.M("steel_galv"),
      o = t.M("concrete", { vertexColors: !0 }),
      r = t.M("chainlink", { doubleSide: !0 }),
      a = e.posts || "both",
      l = e.lean === 1 ? 1 : -1,
      c = a === "both" ? [-1.5, 1.5] : a === "left" ? [-1.5] : a === "right" ? [1.5] : [];
    for (let p of c) {
      (t.box(o, 0.32, 0.09, 0.32, p, 0.035, 0, {
        r: 0.02,
        col: (d, m) => {
          let x = 0.6 + 0.4 * H0(0, 0.08, m);
          return [x, x, x];
        },
      }),
        t.cyl(s, 0.03, 0.03, 2.02, p, 1.05, 0, { seg: 8, open: !0 }),
        t.cyl(s, 0.05, 0.05, 0.012, p, 0.086, 0, { seg: 8 }),
        t.bar(s, [p, 2.02, 0], [p, 2.4 - 0.02, l * 0.36], 0.019, { seg: 6, caps: !0 }),
        t.cyl(s, 0.034, 0.034, 0.05, p, 2.03, 0, { seg: 8 }));
      for (let d of [0.2, 1.05, 1.9]) t.cyl(s, 0.034, 0.034, 0.03, p, d, 0, { seg: 8, open: !0 });
    }
    t.bar(s, [-1.5, 2, 0.036], [1.5, 2, 0.036], 0.021, { seg: 7 });
    for (let p of [0.09, 1.02]) t.bar(s, [-1.5, p, 0.012], [1.5, p, 0.012], 0.0035, { seg: 4 });
    (t.box(s, 0.008, 1.9, 0.02, -1.462, 1.03, 0.012, { r: 0 }), t.box(s, 0.008, 1.9, 0.02, 1.462, 1.03, 0.012, { r: 0 }));
    let u = new w0(2.92, 1.93, 6, 3),
      f = u.attributes.position,
      h = u.attributes.uv;
    for (let p = 0; p < f.count; p++) {
      let d = f.getX(p),
        m = f.getY(p);
      (h.setXY(p, d + 1.5, m + 1), f.setZ(p, 0.012 + 0.02 * (Jn(d * 1.3 + (e.seed | 0), m * 1.5) - 0.5) * (1 - Math.abs(d) / 1.46)));
    }
    (u.computeVertexNormals(), t.add(r, ct(u, 0, 1.025, 0)));
    for (let p = 0; p < 3; p++) {
      let d = 0.3 + p * 0.33,
        m = 2.02 + d * 0.36,
        x = l * d * 0.36;
      t.bar(s, [-1.5, m, x], [1.5, m, x], 0.0032, { seg: 4 });
      for (let v = -1.42 + (p % 2) * 0.09; v < 1.45; v += 0.18) t.add(s, ct(ot(0.004, 0.032, 0.004), v, m, x, [i() * 3, 0, 0.8 + i()]));
    }
    for (let p = 0; p < 5; p++) t.add(s, ct(ot(0.012, 0.012, 0.03), -1.2 + p * 0.6, 2, 0.02));
    return $i(t.group(), "fence_panel", Na("fence_panel"), [{ min: [-1.5, 0, -0.04], max: [1.5, 2.4, 0.04], surface: "metal" }]);
  }
  export function z_(n, e = {}) {
    let t = new On(n),
      i = e.seed | 0,
      s = i * 1.3,
      o = 2.6,
      r = 2.2,
      a = o / 2,
      l = r / 2,
      c = t.M("paint_" + (["white", "grey", "teal"].includes(e.color) ? e.color : "white"), { vertexColors: !0 }),
      u = t.M("steel_dark"),
      f = t.M("steel_galv"),
      h = t.M("glass", { doubleSide: !0 }),
      p = t.M("wood_dark"),
      d = t.M("polymer_black"),
      m = (z, I, L) => {
        let U = (0.9 + 0.14 * Jn(z * 2 + s, I * 2 + L)) * (0.6 + 0.4 * H0(0.1, 0.7, I)) * (1 - 0.25 * H0(2.25, 2.45, I));
        return [U, U * 0.985, U * 0.96];
      };
    t.defCol.set(c, m);
    let x = 0.12,
      v = 1,
      y = 2.08,
      b = 2.42;
    t.box(u, o, 0.12, r, 0, 0.06, 0, { r: 0.015 });
    for (let z of [-0.7, 0.7]) t.box(u, o + 0.06, 0.06, 0.1, 0, 0.03, z, { r: 0.01 });
    for (let z of [-1, 1]) for (let I of [-1, 1]) t.box(c, 0.09, b - x, 0.09, z * (a - 0.045), (b + x) / 2, I * (l - 0.045), { r: 0.012 });
    let g = 0.3,
      E = 1.12,
      M = (z, I) => {
        let L = I > 0 ? [[-a + 0.09, g - 0.04]] : [[-a + 0.09, a - 0.09]];
        for (let [U, k] of L) {
          (t.box(c, k - U, v - x, 0.05, (U + k) / 2, (v + x) / 2, z, { r: 0.006 }),
            t.box(c, k - U, 0.05, 0.075, (U + k) / 2, v + 0.01, z + I * 0.005, { r: 0.008 }),
            t.box(h, k - U, y - v - 0.03, 0.008, (U + k) / 2, (v + y) / 2 + 0.01, z, { r: 0 }));
          let C = k - U > 1.6 ? 2 : 1;
          for (let A = 1; A <= C; A++) t.box(c, 0.04, y - v, 0.05, U + ((k - U) * A) / (C + 1), (v + y) / 2, z, { r: 0.006 });
          for (let A = 1; A < 3; A++) t.box(c, 0.006, v - x - 0.04, 0.056, U + ((k - U) * A) / 3, (v + x) / 2, z, { r: 0 });
        }
        t.box(c, o - 0.18, b - y, 0.05, 0, (b + y) / 2, z, { r: 0.006 });
      };
    (M(l - 0.03, 1), M(-l + 0.03, -1));
    for (let z of [-1, 1]) {
      let I = z * (a - 0.03);
      (t.box(c, 0.05, v - x, r - 0.18, I, (v + x) / 2, 0, { r: 0.006 }),
        t.box(c, 0.075, 0.05, r - 0.18, I + z * 0.005, v + 0.01, 0, { r: 0.008 }),
        t.box(h, 0.008, y - v - 0.03, r - 0.18, I, (v + y) / 2 + 0.01, 0, { r: 0 }),
        t.box(c, 0.05, y - v, 0.04, I, (v + y) / 2, 0, { r: 0.006 }),
        t.box(c, 0.05, b - y, r - 0.18, I, (b + y) / 2, 0, { r: 0.006 }));
    }
    let _ = l - 0.03;
    (t.box(c, 0.05, y - x, 0.07, g - 0.015, (y + x) / 2, _, { r: 0.006 }),
      t.box(c, 0.05, y - x, 0.07, E + 0.015, (y + x) / 2, _, { r: 0.006 }),
      t.box(c, a - 0.09 - E - 0.04, y - x, 0.05, (a - 0.09 + E + 0.04) / 2, (y + x) / 2, _, { r: 0.006 }));
    let T = E - g - 0.02,
      w = (g + E) / 2;
    (t.box(c, T, v - x - 0.01, 0.04, w, (v + x) / 2, _ + 0.005, { r: 0.006 }),
      t.box(c, T, 0.07, 0.04, w, y - 0.04, _ + 0.005, { r: 0.006 }));
    for (let z of [-1, 1]) t.box(c, 0.07, y - v, 0.04, w + z * (T / 2 - 0.035), (v + y) / 2, _ + 0.005, { r: 0.006 });
    (t.box(h, T - 0.12, y - v - 0.08, 0.008, w, (v + y) / 2 - 0.02, _ + 0.005, { r: 0 }),
      t.box(f, T - 0.06, 0.22, 0.004, w, x + 0.14, _ + 0.027, { r: 0 }),
      t.box(f, 0.03, 0.14, 0.02, g + 0.09, 1.05, _ + 0.035, { r: 0.004 }),
      t.bar(f, [g + 0.09, 1, _ + 0.06], [g + 0.2, 1, _ + 0.06], 0.009, { caps: !0 }));
    for (let z of [0.4, 1.75]) t.cyl(f, 0.012, 0.012, 0.1, E + 0.002, z, _ + 0.03, { seg: 6 });
    (t.box(u, 0.9, 0.03, 0.3, w, 0.105, l + 0.15, { r: 0.006 }),
      t.box(c, o + 0.36, 0.1, r + 0.4, 0, b + 0.05, 0, {
        r: 0.02,
        col: (z, I, L) => {
          let U = 0.72 + 0.2 * Jn(z * 1.5, L * 1.5 + s);
          return [U, U, U * 0.97];
        },
      }),
      t.box(u, o + 0.3, 0.03, r + 0.34, 0, b + 0.112, 0, { r: 0.01 }));
    for (let z of [-1, 1]) t.box(f, o + 0.36, 0.06, 0.08, 0, b - 0.005, z * (l + 0.2 + 0.03), { r: 0.012 });
    t.tube(
      f,
      [
        [-a - 0.16, b - 0.03, l + 0.23],
        [-a - 0.1, b - 0.2, l + 0.1],
        [-a - 0.03, b - 0.4, l + 0.03],
        [-a - 0.03, 0.2, l + 0.03],
        [-a - 0.1, 0.06, l + 0.1],
      ],
      0.03,
      { seg: 6, tension: 0.2 },
    );
    let S = -a - 0.17;
    (t.box(c, 0.3, 0.52, 0.78, S, 0.62, -0.25, { r: 0.02 }),
      t.add(c, ct(Ar(0.44, 0.44, 6), S - 0.151, 0.62, -0.14, [0, -F0 / 2, 0]), [0.06, 0.06, 0.06]));
    for (let z = -3; z <= 3; z++)
      t.add(u, ct(ot(0.006, 0.008, Math.sqrt(0.22 * 0.22 - (z * 0.06) ** 2) * 2), S - 0.154, 0.62 + z * 0.06, -0.14));
    t.cyl(u, 0.05, 0.05, 0.012, S - 0.156, 0.62, -0.14, { seg: 8, rot: [0, 0, F0 / 2] });
    for (let z of [-0.55, 0.05]) t.beam(u, [-a, 0.32, z], [S - 0.1, 0.34, z], 0.03, 0.03, { r: 0 });
    (t.tube(
      t.M("rubber"),
      [
        [S + 0.05, 0.86, 0.14],
        [S + 0.06, 1, 0.2],
        [-a - 0.02, 1.25, 0.24],
        [-a - 0.02, 2.2, 0.24],
      ],
      0.014,
      { seg: 5 },
    ),
      t.add(t.M("floor_epoxy"), ct(oh(o - 0.1, r - 0.1), 0, 0.122, 0, [-F0 / 2, 0, 0])),
      t.box(p, 0.6, 0.04, r - 0.3, -a + 0.4, 0.76, 0, { r: 0.008 }));
    for (let z of [-0.85, 0.85]) t.box(u, 0.5, 0.64, 0.03, -a + 0.4, 0.44, z, { r: 0.005 });
    (t.box(d, 0.05, 0.32, 0.5, -a + 0.3, 1.02, -0.3, { r: 0.01, rot: [0, 0.25, 0] }),
      t.add(n.mats.emissive(9418984, 1.6), ct(D0(0.45, 0.27), -a + 0.3 + 0.027, 1.02, -0.3 - 0.007, [0, F0 / 2 + 0.25, 0]), null, !0),
      t.box(d, 0.05, 0.1, 0.06, -a + 0.28, 0.83, -0.3, { r: 0.008 }),
      t.box(d, 0.18, 0.015, 0.22, -a + 0.28, 0.787, -0.3, { r: 0.004 }),
      t.box(d, 0.14, 0.02, 0.42, -a + 0.52, 0.79, -0.25, { r: 0.004 }),
      t.box(d, 0.46, 0.07, 0.46, -a + 1, 0.5, -0.2, { r: 0.02, rot: [0, 0.3, 0] }),
      t.box(d, 0.07, 0.55, 0.42, -a + 1.22, 0.86, -0.13, { r: 0.02, rot: [0, 0.3, -0.12] }),
      t.cyl(u, 0.025, 0.025, 0.36, -a + 1, 0.3, -0.2, { seg: 6 }));
    for (let z = 0; z < 5; z++) {
      let I = z * F0 * 0.4;
      t.beam(u, [-a + 1, 0.16, -0.2], [-a + 1 + Math.cos(I) * 0.26, 0.14, -0.2 + Math.sin(I) * 0.26], 0.03, 0.025, { r: 0 });
    }
    (t.box(u, 0.2, 0.07, 0.1, w, y + 0.19, l + 0.03, { r: 0.012 }),
      t.add(n.mats.emissive(16767398, e.on === !1 ? 0.02 : 5), ct(D0(0.17, 0.05), w, y + 0.152, l + 0.035, [F0 / 2, 0, 0]), null, !0),
      t.decal(Ti(n, "GATE CONTROL", { color: "black", font: "stencil", distress: 0.2 }), 0.1, -0.45, (b + y) / 2, l - 0.003, null, 0.9),
      t.decal(Vn(n, "berth4"), 0.34, a - 0.003, 0.56, 0.3, [0, F0 / 2, 0]),
      t.decal(Vn(n, "no_entry"), 0.2, w, 0.72, _ + 0.0265, null),
      t.decal(Vn(n, "grime_streak"), 0.7, -0.6, 0.55, l - 0.003, null, 0.3),
      t.decal(Vn(n, "rust_run"), 0.6, -a + 0.003 - 0, 0.6, 0.55, [0, -F0 / 2, 0], 0.25));
    let R = t.group();
    return (
      (R.userData.lamps = [{ pos: [w, y + 0.14, l + 0.04], dir: [0, -1, 0.2], color: 16767398 }]),
      $i(R, "guard_booth", Na("guard_booth"), [{ min: [-a, 0, -l], max: [a, 2.54, l], surface: "metal" }])
    );
  }
  export function D_(n, e = {}) {
    let t = new On(n),
      i = ks.clamp(e.open || 0, 0, 1),
      s = t.M("paint_orange", { vertexColors: !0 }),
      o = t.M("paint_white"),
      r = t.M("paint_red"),
      a = t.M("steel_dark"),
      l = t.M("steel_galv"),
      c = t.M("paint_yellow"),
      u = -2.5 + 0.19,
      f = 0.92;
    (t.box(t.M("concrete"), 0.5, 0.06, 0.46, u, 0.03, 0, { r: 0.015 }),
      t.box(s, 0.36, 1, 0.3, u, 0.56, 0, {
        r: 0.02,
        col: (y, b) => {
          let g = 0.6 + 0.4 * H0(0.05, 0.5, b);
          return [g, g, g];
        },
      }),
      t.box(a, 0.4, 0.04, 0.34, u, 1.075, 0, { r: 0.012 }),
      t.box(s, 0.3, 0.6, 0.012, u, 0.5, 0.151, { r: 0.004, col: [0.9, 0.9, 0.9] }),
      t.cyl(l, 0.012, 0.012, 0.016, u + 0.1, 0.5, 0.16, { seg: 6, rot: [F0 / 2, 0, 0] }),
      t.decal(Vn(n, "hazard_general"), 0.14, u, 0.9, 0.153, null),
      t.decal(Vn(n, "caution_stripes"), 0.08, u, 0.12, 0.153, null, 0.34),
      t.cyl(a, 0.03, 0.03, 0.05, u, 1.12, 0, { seg: 8 }),
      t.add(n.mats.emissive(16734750, 2.2), ct(vt(0.026, 0.026, 0.045, 8), u, 1.165, 0), null, !0),
      t.push(Co(u, f, 0, [0, 0, i * 1.48])),
      t.cyl(a, 0.075, 0.075, 0.36, 0, 0, 0, { seg: 10, rot: [F0 / 2, 0, 0] }));
    for (let y of [-1, 1]) t.box(a, 0.62, 0.11, 0.012, 0.05, 0, y * 0.175, { r: 0.004 });
    t.box(a, 0.3, 0.16, 0.3, -0.33, -0.02, 0, { r: 0.02 });
    let h = 4.62,
      p = 0.12,
      d = 9,
      m = h / d;
    for (let y = 0; y < d; y++) t.box(y % 2 ? o : r, m + 0.001, 0.1 - y * 0.003, 0.05, p + m * (y + 0.5), 0, 0, { r: 0.008 });
    (t.box(a, 0.03, 0.11, 0.06, p + h + 0.012, 0, 0, { r: 0.008 }),
      t.add(n.mats.emissive(16722450, 1.5), ct(ot(0.05, 0.03, 0.054), p + h - 0.5, 0.058, 0), null, !0),
      t.pop());
    let x = 2.5 - 0.1;
    (t.box(t.M("concrete"), 0.3, 0.05, 0.3, x, 0.025, 0, { r: 0.012 }),
      t.cyl(c, 0.04, 0.04, 0.8, x, 0.45, 0, { seg: 8 }),
      t.box(c, 0.14, 0.02, 0.16, x, 0.855, 0, { r: 0.005 }));
    for (let y of [-1, 1]) t.box(c, 0.14, 0.14, 0.014, x, 0.93, y * 0.073, { r: 0.004 });
    t.cyl(l, 0.07, 0.07, 0.01, x, 0.055, 0, { seg: 8 });
    let v = [
      { min: [u - 0.2, 0, -0.17], max: [u + 0.2, 1.1, 0.17], surface: "metal" },
      { min: [x - 0.07, 0, -0.08], max: [x + 0.07, 1, 0.08], surface: "metal" },
    ];
    return (
      i < 0.5 && v.push({ min: [u, f - 0.07, -0.04], max: [x, f + 0.07, 0.04], surface: "metal" }),
      $i(t.group(), "gate_arm", Na("gate_arm"), v)
    );
  }
  export function L_(n, e = {}) {
    let t = new On(n),
      i = (e.seed | 0) * 2.1,
      s = t.M("steel_dark", { vertexColors: !0 }),
      o = t.M("steel_rust"),
      r = (a, l, c) => {
        let u = H0(0.3, 0.4, l) * H0(0.47, 0.4, l),
          f = 0.75 + 0.4 * Jn(a * 6 + i, c * 6 + l * 4) + u * 0.9;
        return [f, f * 0.97, f * 0.93];
      };
    (t.defCol.set(s, r), t.cyl(s, 0.34, 0.35, 0.045, 0, 0.0225, 0, { seg: 20 }), t.cyl(o, 0.37, 0.37, 0.006, 0, 0.003, 0, { seg: 20 }));
    for (let a = 0; a < 6; a++) {
      let l = (a * F0) / 3 + 0.3;
      (t.cyl(o, 0.026, 0.026, 0.03, Math.cos(l) * 0.285, 0.058, Math.sin(l) * 0.285, { seg: 6, flat: !0 }),
        t.cyl(o, 0.013, 0.013, 0.022, Math.cos(l) * 0.285, 0.08, Math.sin(l) * 0.285, { seg: 6 }));
    }
    (t.add(
      s,
      vg(
        [
          [0.25, 0.045],
          [0.21, 0.08],
          [0.165, 0.16],
          [0.145, 0.27],
          [0.15, 0.36],
          [0.17, 0.43],
          [0.19, 0.5],
          [0.17, 0.57],
          [0.1, 0.6],
          [0, 0.602],
        ],
        18,
      ),
    ),
      t.cyl(s, 0.105, 0.115, 0.5, 0, 0.485, 0, { seg: 14, open: !0, rot: [0, 0, F0 / 2] }));
    for (let a of [-1, 1]) {
      let l = Rr(0.108, 14, 8);
      (l.scale(0.55, 1, 1),
        t.add(s, ct(l, a * 0.25, 0.485, 0)),
        t.cyl(s, 0.125, 0.125, 0.03, a * 0.235, 0.485, 0, { seg: 14, rot: [0, 0, F0 / 2] }));
    }
    return $i(t.group(), "bollard_mooring", Na("bollard_mooring"), [{ min: [-0.3, 0, -0.22], max: [0.3, 0.6, 0.22], surface: "metal" }]);
  }
  export function F_(n, e = {}) {
    let t = new On(n),
      i = (e.seed | 0) * 1.7,
      s = t.M("paint_yellow", { vertexColors: !0 }),
      o = t.M("steel_galv"),
      r = 0.083,
      a = (u) => (u > 0.6 && u < 0.69) || (u > 0.78 && u < 0.87),
      l = [0.012, 0.3, 0.6, 0.6001, 0.69, 0.6901, 0.78, 0.7801, 0.87, 0.8701, 0.955];
    for (let u = 0; u < l.length - 1; u++) {
      let f = l[u],
        h = l[u + 1];
      if (h - f < 0.001) continue;
      let p = a((f + h) / 2);
      t.cyl(s, r, r, h - f, 0, (f + h) / 2, 0, {
        seg: 14,
        open: !0,
        col: (d, m, x) => {
          if (p) return [0.05, 0.05, 0.05];
          let v = (0.55 + 0.45 * H0(0, 0.35, m)) * (0.9 + 0.2 * Jn(d * 30 + i, m * 6 + x * 30));
          return [v, v * 0.97, v * 0.9];
        },
      });
    }
    let c = Rr(r, 14, 5, F0 * 2, 0, F0 / 2);
    (c.scale(1, 0.55, 1),
      t.add(s, ct(c, 0, 0.955, 0), [0.95, 0.93, 0.88]),
      t.cyl(o, 0.085, 0.085, 0.012, 0, 0.006, 0, { seg: 4, rot: [0, F0 / 4, 0] }),
      t.box(o, 0.17, 0.012, 0.17, 0, 0.006, 0, { r: 0.004 }));
    for (let u of [-1, 1]) for (let f of [-1, 1]) t.cyl(o, 0.011, 0.011, 0.012, u * 0.066, 0.017, f * 0.066, { seg: 6 });
    return (
      t.cyl(s, r + 0.006, r + 0.006, 0.02, 0, 0.022, 0, { seg: 14, open: !0, col: [0.5, 0.48, 0.42] }),
      $i(t.group(), "bollard_post", Na("bollard_post"), [{ min: [-0.085, 0, -0.085], max: [0.085, 1, 0.085], surface: "metal" }])
    );
  }
  export var mv = ["hazard_general", "no_entry", "hazard_voltage", "berth4", "arrow", "hazard_flammable"],
    C_ = ["AUTHORISED PERSONNEL ONLY", "NO PEDESTRIANS", "HI-VIS AND HELMET", "AUTOMATED VEHICLES", "KEEP CLEAR"];
  export function N_(n, e = {}) {
    let t = new On(n),
      i = e.seed | 0,
      s = t.M("steel_galv"),
      o = t.M("aluminium"),
      r = t.M("paint_white"),
      a = t.M("paint_yellow"),
      l = mv.includes(e.sign) ? e.sign : mv[i % mv.length];
    (t.box(t.M("concrete"), 0.3, 0.07, 0.3, 0, 0.03, 0, { r: 0.015 }),
      t.box(s, 0.05, 2.38, 0.05, 0, 1.2, 0, { r: 0.006 }),
      t.box(s, 0.058, 0.012, 0.058, 0, 2.395, 0, { r: 0.004 }),
      t.box(s, 0.13, 0.012, 0.13, 0, 0.07, 0, { r: 0.003 }));
    let c = ((i % 5) - 2) * 0.006;
    (t.push(Co(0, 0, 0, [0, 0, c])),
      t.box(o, 0.6, 0.6, 0.004, 0, 2.02, 0.031, { r: 0.0015 }),
      t.box(l.startsWith("hazard") ? a : r, 0.58, 0.58, 0.002, 0, 2.02, 0.034, { r: 8e-4 }),
      t.decal(Vn(n, l), 0.5, 0, 2.02, 0.0362, null, 0.5),
      t.box(o, 0.6, 0.22, 0.004, 0, 1.56, 0.031, { r: 0.0015 }),
      t.box(r, 0.58, 0.2, 0.002, 0, 1.56, 0.034, { r: 8e-4 }),
      t.decal(Ti(n, e.text || C_[i % C_.length], { color: "black", font: "sans", distress: 0.15 }), 0.07, 0, 1.56, 0.0362, null, 0.52));
    for (let u of [1.85, 2.2, 1.56])
      (t.box(s, 0.5, 0.03, 0.012, 0, u, 0.024, { r: 0 }), t.box(s, 0.09, 0.04, 0.07, 0, u, -0.002, { r: 0.004 }));
    for (let [u, f] of [
      [-0.26, 2.28],
      [0.26, 2.28],
      [-0.26, 1.76],
      [0.26, 1.76],
    ])
      t.cyl(s, 0.008, 0.008, 0.004, u, f, 0.0365, { seg: 6, rot: [F0 / 2, 0, 0] });
    return (
      t.pop(),
      $i(t.group(), "sign_post", Na("sign_post"), [
        { min: [-0.03, 0, -0.03], max: [0.03, 2.4, 0.03], surface: "metal" },
        { min: [-0.3, 1.44, 0.02], max: [0.3, 2.33, 0.04], surface: "metal", bulletOnly: !0 },
      ])
    );
  }
  export function U_(n, e = {}) {
    let t = new On(n),
      i = e.seed | 0,
      s = Fl(i + 3),
      o = t.M("paint_yellow"),
      r = t.M("steel_dark"),
      a = t.M("aluminium"),
      l = t.M("rubber"),
      c = n.mats.emissive(16773596, e.on === !1 ? 0.02 : 10);
    (t.cyl(a, 0.021, 0.021, 1.1, 0, 0.75, 0, { seg: 8, open: !0 }),
      t.cyl(a, 0.016, 0.016, 0.9, 0, 1.6, 0, { seg: 8, open: !0 }),
      t.cyl(r, 0.03, 0.03, 0.06, 0, 1.3, 0, { seg: 8 }),
      t.bar(r, [0.03, 1.3, 0], [0.085, 1.3, 0], 0.008, { caps: !0 }),
      t.box(r, 0.02, 0.03, 0.05, 0.09, 1.3, 0, { r: 0.005 }),
      t.cyl(r, 0.032, 0.032, 0.07, 0, 0.82, 0, { seg: 8 }),
      t.cyl(r, 0.03, 0.03, 0.05, 0, 0.36, 0, { seg: 8 }));
    for (let d = 0; d < 3; d++) {
      let m = (d * F0 * 2) / 3 + 0.5,
        x = Math.cos(m),
        v = Math.sin(m);
      (t.bar(a, [x * 0.035, 0.82, v * 0.035], [x * 0.5, 0.025, v * 0.5], 0.013, { seg: 6 }),
        t.bar(a, [x * 0.03, 0.36, v * 0.03], [x * 0.3, 0.37, v * 0.3], 0.008, { seg: 5 }),
        t.add(l, ct(Rr(0.028, 8, 5), x * 0.5, 0.02, v * 0.5)));
    }
    t.box(r, 0.05, 0.04, 0.72, 0, 2.03, 0, { r: 0.008 });
    for (let d of [-1, 1]) {
      (t.push(Co(0.03, 2.03, d * 0.2, [0, d * -0.12, 0])),
        t.push(Co(0, 0, 0, [0, 0, -0.22])),
        t.box(o, 0.075, 0.24, 0.32, 0.06, 0.02, 0, { r: 0.012 }),
        t.add(c, ct(D0(0.28, 0.2), 0.0985, 0.02, 0, [0, F0 / 2, 0]), null, !0),
        t.box(r, 0.012, 0.25, 0.012, 0.1, 0.02, 0.157, { r: 0 }),
        t.box(r, 0.012, 0.25, 0.012, 0.1, 0.02, -0.157, { r: 0 }),
        t.box(r, 0.012, 0.012, 0.33, 0.1, 0.143, 0, { r: 0 }),
        t.box(r, 0.012, 0.012, 0.33, 0.1, -0.103, 0, { r: 0 }));
      for (let m = -3; m <= 3; m++) t.add(r, ct(ot(0.035, 0.2, 0.006), 0.008, 0.02, m * 0.043));
      (t.tube(
        o,
        [
          [0.05, 0.14, -0.1],
          [0.05, 0.2, -0.06],
          [0.05, 0.2, 0.06],
          [0.05, 0.14, 0.1],
        ],
        0.008,
        { seg: 5 },
      ),
        t.pop(),
        t.pop());
    }
    let u = s() * F0 * 2,
      f = Math.cos(u),
      h = Math.sin(u);
    (t.tube(
      l,
      [
        [0, 2, 0.03],
        [-0.03, 1.7, 0.04],
        [0.035, 1.25, 0.02],
        [-0.03, 0.9, 0.03],
        [0.05, 0.5, 0.06],
        [0.12, 0.08, 0.1],
        [0.25, 0.012, 0.16],
        [0.3 + f * 0.3, 0.012, 0.2 + h * 0.3],
        [0.2 + f * 0.75 - h * 0.2, 0.012, 0.1 + h * 0.75 + f * 0.2],
        [f * 1.2, 0.012, h * 1.2],
      ],
      0.011,
      { seg: 5 },
    ),
      t.box(o, 0.09, 0.05, 0.06, f * 1.24, 0.026, h * 1.24, { r: 0.01, rot: [0, -u, 0] }));
    let p = t.group();
    return (
      (p.userData.lamps = [{ pos: [0.14, 2.03, 0], dir: [0.976, -0.218, 0], color: 16773596 }]),
      $i(p, "floodlight_stand", Na("floodlight_stand"), [{ min: [-0.12, 0, -0.12], max: [0.12, 2.2, 0.12], surface: "metal" }])
    );
  }
  export var _g = (n) => Yi[n].slice(0, 3),
    Ai = Math.PI;
  export function H_(n, e = {}) {
    let t = new On(n),
      i = t.M("diamond_plate"),
      s = t.M("steel_dark"),
      o = t.M("paint_yellow"),
      r = t.M("steel_galv"),
      a = 12,
      l = 0.2,
      c = 0.2,
      u = -1.5,
      f = 0.5,
      h = u + a * c,
      p = [];
    for (let x = 0; x < a; x++) {
      let v = (x + 1) * l,
        y = u + x * c;
      (t.box(i, 0.25, 0.03, 0.9, y + 0.125, v - 0.015, 0, { r: 0.005 }),
        t.box(o, 0.035, 0.034, 0.9, y + 0.016, v - 0.015, 0, { r: 0.006 }));
      for (let b of [-1, 1]) t.box(s, 0.2, 0.05, 0.01, y + 0.13, v - 0.05, b * 0.452, { r: 0 });
      p.push({ min: [y, 0, -f], max: [y + c, v, f], surface: "metal" });
    }
    for (let x of [-1, 1]) {
      (t.beam(s, [u + 0.07, 0.13, x * 0.465], [h + 0.04, 2.5, x * 0.465], 0.24, 0.014, { r: 0.004 }),
        t.box(r, 0.3, 0.012, 0.12, u + 0.06, 0.006, x * 0.465, { r: 0 }));
      for (let v of [-0.08, 0.1]) t.cyl(r, 0.012, 0.012, 0.02, u + 0.06 + v, 0.02, x * 0.5, { seg: 6 });
    }
    let d = (a + 1) * l;
    (t.box(i, 0.64, 0.035, 0.96, h + 0.3, d - 0.0175, 0, { r: 0.005 }),
      t.box(o, 0.035, 0.038, 0.96, h + 0.016, d - 0.0175, 0, { r: 0.006 }));
    for (let x of [-1, 1]) t.box(s, 0.66, 0.16, 0.06, h + 0.3, d - 0.115, x * 0.47, { r: 0.008 });
    (t.box(s, 0.06, 0.16, 0.96, 1.47, d - 0.115, 0, { r: 0.008 }), t.box(s, 0.06, 0.12, 0.9, h + 0.02, d - 0.1, 0, { r: 0.008 }));
    for (let x of [-1, 1])
      (t.box(s, 0.08, d - 0.19, 0.08, 1.44, (d - 0.19) / 2, x * 0.45, { r: 0.008 }),
        t.box(r, 0.18, 0.012, 0.18, 1.44, 0.006, x * 0.45, { r: 0 }),
        t.beam(s, [1.44, 1.5, x * 0.45], [h + 0.1, d - 0.2, x * 0.45], 0.05, 0.05, { r: 0.006 }));
    (t.beam(s, [1.44, 0.15, -0.42], [1.44, 2.2, 0.42], 0.045, 0.008, { r: 0 }),
      t.beam(s, [1.44, 0.15, 0.42], [1.44, 2.2, -0.42], 0.045, 0.008, { r: 0 }),
      t.box(s, 0.06, 0.06, 0.82, 1.44, 1.2, 0, { r: 0.006 }),
      p.push({ min: [h, d - 0.2, -f], max: [1.5, d, f], surface: "metal" }));
    for (let x of [-1, 1]) p.push({ min: [1.4, 0, x * 0.45 - 0.04], max: [1.48, d - 0.2, x * 0.45 + 0.04], surface: "metal" });
    let m = (x) => ((x - u) / c) * l + l;
    for (let x of [-1, 1]) {
      let v = x * 0.485,
        y = [
          [u + 0.1, m(u + 0.1)],
          [u + 0.9, m(u + 0.9) - 0.1],
          [u + 1.7, m(u + 1.7) - 0.1],
          [h + 0.03, d],
          [1.47, d],
        ];
      for (let [b, g] of y)
        (t.bar(o, [b, g - 0.12, v], [b, g + 1, v], 0.019, { seg: 7 }), t.box(s, 0.07, 0.1, 0.012, b, g - 0.1, v - x * 0.012, { r: 0 }));
      for (let b of [1, 0.52]) {
        let g = b === 1 ? 0.021 : 0.016;
        (t.bar(o, [y[0][0], y[0][1] + b, v], [y[3][0], y[3][1] + b, v], g, { seg: 7 }),
          t.bar(o, [y[3][0], y[3][1] + b, v], [y[4][0], y[4][1] + b, v], g, { seg: 7 }),
          t.add(o, ct(Rr(g * 1.05, 7, 5), y[3][0], y[3][1] + b, v)),
          t.add(o, ct(Rr(g * 1.05, 7, 5), y[0][0], y[0][1] + b, v)),
          t.add(o, ct(Rr(g * 1.05, 7, 5), y[4][0], y[4][1] + b, v)));
      }
      (t.box(s, 0.6, 0.1, 0.008, h + 0.3, d + 0.05, x * 0.476, { r: 0 }),
        p.push({ min: [h, d, v - 0.03], max: [1.5, d + 1.02, v + 0.03], surface: "metal" }));
    }
    return $i(t.group(), "stairs_metal", _g("stairs_metal"), p);
  }
  export function O_(n, e = {}) {
    let t = new On(n),
      i = t.M("steel_dark"),
      s = t.M("paint_yellow"),
      o = t.M("steel_galv"),
      r = e.rails || "both",
      a = r === "both" ? [-1, 1] : r === "left" ? [-1] : r === "right" ? [1] : [],
      l = 0.05;
    for (let u = -0.51; u <= 0.511; u += 0.034) t.add(o, ct(ot(2.98, 0.03, 0.004), 0, l - 0.015, u));
    for (let u = -1.45; u <= 1.451; u += 0.1) t.add(o, ct(ot(0.006, 0.006, 1.04), u, l - 0.004, 0));
    for (let u of [-1, 1])
      (t.add(o, ct(ot(2.99, 0.032, 0.005), 0, l - 0.016, u * 0.525)), t.add(o, ct(ot(0.005, 0.032, 1.05), u * 1.493, l - 0.016, 0)));
    for (let u of [-1, 1]) t.box(i, 3, 0.18, 0.06, 0, l - 0.09, u * 0.565, { r: 0.008 });
    for (let u of [-1.45, -0.5, 0.5, 1.45]) t.box(i, 0.05, 0.1, 1.08, u, l - 0.085, 0, { r: 0.006 });
    let c = [{ min: [-1.5, l - 0.08, -0.6], max: [1.5, l, 0.6], surface: "metal" }];
    for (let u of a) {
      let f = u * 0.565;
      t.box(i, 3, 0.1, 0.008, 0, l + 0.05, u * 0.535, { r: 0 });
      for (let h of [-1.42, 0, 1.42])
        (t.box(s, 0.045, 1.07, 0.045, h, l + 0.52, f, { r: 0.006 }), t.box(i, 0.09, 0.012, 0.09, h, l + 0.006, f, { r: 0 }));
      (t.bar(s, [-1.5, l + 1.05, f], [1.5, l + 1.05, f], 0.021, { seg: 7, caps: !0 }),
        t.bar(s, [-1.5, l + 0.55, f], [1.5, l + 0.55, f], 0.016, { seg: 6, caps: !0 }),
        c.push({ min: [-1.5, l, f - 0.035], max: [1.5, l + 1.05, f + 0.035], surface: "metal" }));
    }
    return $i(t.group(), "catwalk", _g("catwalk"), c);
  }
  export function B_(n, e, t, i, s) {
    for (let o = -2; o <= 2; o++) n.add(e, ct(ot(0.14 + (o === 0 ? 0.02 : 0), 0.022, 1), t + o * 0.2525, i + 0.133, s));
    for (let o of [-1, 0, 1]) n.add(e, ct(ot(1.15, 0.022, 0.1), t, i + 0.111, s + o * 0.45));
    for (let o of [-1, 0, 1]) for (let r of [-1, 0, 1]) n.add(e, ct(ot(0.14, 0.078, 0.1), t + r * 0.505, i + 0.061, s + o * 0.45));
    for (let o of [-1, 0, 1]) n.add(e, ct(ot(1.15, 0.022, 0.1), t, i + 0.011, s + o * 0.45));
  }
  export function Ik(n, e, t, i, s, o, r) {
    B_(n, e.wood, i, s, o);
    let a = s + 0.144;
    if (t === "cartons") {
      let l = 2 + Math.floor(r() * 2),
        c = 0.36;
      for (let u = 0; u < l; u++)
        for (let f of [-1, 1])
          for (let h of [-1, 1])
            (u === l - 1 && r() < 0.25) ||
              (n.box(
                e.card,
                0.53,
                c - 0.006,
                0.46,
                i + f * 0.272 + (r() - 0.5) * 0.02,
                a + c * (u + 0.5),
                o + h * 0.237 + (r() - 0.5) * 0.02,
                { r: 0.008, rot: [0, (r() - 0.5) * 0.05, 0] },
              ),
              n.add(e.tape, ct(ot(0.535, 0.002, 0.05), i + f * 0.272, a + c * (u + 1) - 0.004, o + h * 0.237)));
      for (let u of [-0.3, 0.3])
        (n.add(e.poly, ct(ot(0.016, l * c + 0.004, 0.002), i + u, a + (l * c) / 2, o + 0.475)),
          n.add(e.poly, ct(ot(0.016, l * c + 0.004, 0.002), i + u, a + (l * c) / 2, o - 0.475)));
    } else if (t === "wrapped") {
      let l = 0.9 + r() * 0.25;
      (n.box(e.card, 1.08, l, 0.92, i, a + l / 2, o, { r: 0.012 }),
        n.box(e.wrap, 1.1, l + 0.012, 0.94, i, a + l / 2 + 0.002, o, { r: 0.03 }));
      for (let c of [-1, 1])
        for (let u of [-1, 1]) n.box(e.card, 0.05, l * 0.96, 0.05, i + c * 0.535, a + l / 2, o + u * 0.455, { r: 0.004 });
      n.decal(
        Ti(n.G, "LOT " + (1e3 + Math.floor(r() * 8999)), { color: "black", font: "sans", distress: 0.1 }),
        0.06,
        i + 0.2,
        a + l * 0.7,
        o + 0.474,
        null,
        0.3,
      );
    } else if (t === "drums") {
      for (let l of [-1, 1])
        for (let c of [-1, 1]) {
          let u = i + l * 0.285,
            f = o + c * 0.24,
            h = r() < 0.3 ? e.drum2 : e.drum;
          n.cyl(h, 0.225, 0.225, 0.86, u, a + 0.43, f, { seg: 14, open: !0 });
          for (let p of [0.29, 0.58]) n.cyl(h, 0.233, 0.233, 0.022, u, a + p, f, { seg: 14, open: !0 });
          (n.cyl(h, 0.232, 0.232, 0.02, u, a + 0.85, f, { seg: 14, open: !0 }),
            n.cyl(h, 0.232, 0.232, 0.02, u, a + 0.01, f, { seg: 14, open: !0 }),
            n.add(e.dark, ct(Ar(0.44, 0.44, 4), u, a + 0.845, f, [-Ai / 2, 0, 0])),
            n.cyl(e.dark, 0.03, 0.03, 0.02, u + 0.13, a + 0.855, f, { seg: 6 }));
        }
      (n.add(e.poly, ct(ot(1.04, 0.03, 0.002), i, a + 0.6, o + 0.468)), n.add(e.poly, ct(ot(1.04, 0.03, 0.002), i, a + 0.6, o - 0.468)));
    } else if (t === "pallets") {
      let l = 2 + Math.floor(r() * 4);
      for (let c = 0; c < l; c++) B_(n, e.wood, i + (r() - 0.5) * 0.04, a + c * 0.146, o + (r() - 0.5) * 0.04);
    }
  }
  export function V_(n, e = {}) {
    let t = new On(n),
      i = e.seed | 0,
      s = Fl(i + 21),
      o = t.M("paint_blue", { vertexColors: !0 }),
      r = t.M("paint_orange"),
      a = t.M("steel_galv"),
      l = {
        wood: t.M("wood_pallet"),
        card: t.M("cardboard"),
        tape: t.M("polymer_tan"),
        poly: t.M("polymer_black"),
        wrap: t.M("glass_dirty"),
        drum: t.M("plastic_blue"),
        drum2: t.M("paint_red"),
        dark: t.M("steel_dark"),
      },
      c = 4.2,
      u = 1.305,
      f = 0.5,
      h = [0.04, 0.04, 0.05];
    for (let m of [-1, 1]) {
      for (let v of [-1, 1]) {
        (t.box(o, 0.09, c, 0.07, m * u, c / 2, v * f, {
          r: 0.008,
          col: (y, b) => {
            let g = 0.7 + 0.3 * H0(0, 0.5, b);
            return [g, g, g];
          },
        }),
          t.box(a, 0.14, 0.01, 0.12, m * u, 0.005, v * f, { r: 0 }));
        for (let y of [-0.05, 0.05]) t.cyl(a, 0.01, 0.01, 0.02, m * u + y, 0.016, v * f, { seg: 6 });
        for (let y = 0.12; y < c - 0.05; y += 0.1)
          for (let b of [-0.022, 0.022]) t.add(o, ct(D0(0.014, 0.034), m * u + b, y, v * (f + 0.0356), [0, v > 0 ? 0 : Ai, 0]), h);
      }
      let x = [0.2, 1.1, 2, 2.9, 3.8];
      for (let v = 0; v < x.length; v++)
        (t.box(o, 0.03, 0.03, 2 * f - 0.07, m * u, x[v], 0, { r: 0 }),
          v < x.length - 1 &&
            t.beam(o, [m * u, x[v], v % 2 ? f - 0.04 : -f + 0.04], [m * u, x[v + 1], v % 2 ? -f + 0.04 : f - 0.04], 0.03, 0.03, { r: 0 }));
      t.box(t.M("paint_yellow"), 0.14, 0.4, 0.02, m * u, 0.2, f + 0.06, { r: 0.006 });
    }
    let p = [1.45, 2.86];
    for (let m of p) {
      for (let x of [-1, 1]) {
        t.box(r, 2 * u - 0.09, 0.12, 0.05, 0, m, x * (f + 0.01), { r: 0.008 });
        for (let v of [-1, 1]) t.box(r, 0.012, 0.2, 0.065, v * (u - 0.051), m - 0.02, x * (f + 0.005), { r: 0 });
      }
      for (let x of [-0.85, 0, 0.85]) t.add(a, ct(ot(0.04, 0.025, 2 * f), x, m + 0.045, 0));
      for (let x = -0.45; x <= 0.451; x += 0.1) t.add(a, ct(ot(2 * u - 0.1, 0.005, 0.005), 0, m + 0.062, x));
      for (let x = -1.2; x <= 1.201; x += 0.2) t.add(a, ct(ot(0.005, 0.005, 2 * f + 0.04), x, m + 0.066, 0));
    }
    (t.decal(
      Ti(n, "BAY " + String.fromCharCode(65 + (i % 6)) + "-" + (10 + (i % 40)), { color: "black", font: "sans", distress: 0.1 }),
      0.07,
      0,
      p[0],
      f + 0.0365,
      null,
      0.34,
    ),
      t.decal(Ti(n, "MAX 2000 KG / LEVEL", { color: "black", font: "sans", distress: 0.1 }), 0.045, 0.6, p[1], f + 0.0365, null, 0.5));
    let d = ["cartons", "wrapped", "drums", "cartons", "wrapped", "pallets", "none"];
    return (
      [0, p[0] + 0.068, p[1] + 0.068].forEach((m, x) => {
        for (let v of [-1, 1]) {
          let y = d[Math.floor(s() * d.length)];
          (x === 2 && y === "drums" && (y = "wrapped"),
            y !== "none" && Ik(t, l, y, v * 0.615 + (s() - 0.5) * 0.03, m, (s() - 0.5) * 0.05, s));
        }
      }),
      $i(t.group(), "shelf_rack", _g("shelf_rack"), [{ min: [-1.35, 0, -0.55], max: [1.35, 4.2, 0.55], surface: "metal" }])
    );
  }
  export function W_(n, e = {}) {
    let t = new On(n),
      i = e.seed | 0,
      s = i * 2.3,
      o = t.M("paint_white", { vertexColors: !0 }),
      r = t.M("steel_dark"),
      a = t.M("steel_galv"),
      l = t.M("paint_grey"),
      c = t.M("brass"),
      u = t.M("rubber"),
      f = t.M("aluminium"),
      h = (x, v, y) => {
        let b = (0.86 + 0.18 * Jn(y * 2 + s, v * 2)) * (0.62 + 0.38 * H0(0, 0.6, v));
        return [b, b * 0.985, b * 0.955];
      };
    t.defCol.set(o, h);
    let p = [0.05, 0.05, 0.055];
    e.flip || t.push(Co(0, 0, 0, [0, Ai, 0]));
    let d = 0.13;
    t.box(o, 0.38, 2.3, 2.3, -0.06, 1.15, 0, { r: 0.012 });
    for (let x of [-1, 1]) t.box(o, 0.12, 2.3, 0.09, 0.19, 1.15, x * 1.105, { r: 0.012 });
    (t.box(o, 0.12, 0.09, 2.12, 0.19, 2.255, 0, { r: 0.012 }),
      t.box(o, 0.12, 0.1, 2.12, 0.19, 0.05, 0, { r: 0.012 }),
      t.box(o, 0.1, 0.06, 2.12, 0.18, 1.42, 0, { r: 0.01 }),
      t.box(o, 0.1, 0.06, 2.12, 0.18, 0.9, 0, { r: 0.01 }));
    for (let x of [0.3, 0.9, 1.5, 2.1])
      for (let v of [-1, 1]) t.cyl(a, 0.014, 0.014, 0.012, 0.255, x, v * 1.105, { seg: 6, rot: [0, 0, Ai / 2] });
    for (let x of [-0.8, -0.3, 0.3, 0.8])
      for (let v of [0.05, 2.255]) t.cyl(a, 0.014, 0.014, 0.012, 0.255, v, x, { seg: 6, rot: [0, 0, Ai / 2] });
    for (let x of [-1, 1]) {
      let v = x * 0.53,
        y = 1.83;
      (t.add(o, ct(Ar(0.66, 0.66, 6), d + 0.004, y, v, [0, Ai / 2, 0]), p),
        t.cyl(o, 0.335, 0.345, 0.1, d + 0.05, y, v, { seg: 20, open: !0, rot: [0, 0, Ai / 2] }),
        t.cyl(o, 0.36, 0.36, 0.014, d + 0.006, y, v, { seg: 20, open: !0, rot: [0, 0, Ai / 2] }));
      for (let b = 0; b < 3; b++) t.add(r, ct(ot(0.012, 0.6, 0.12), d + 0.04, y, v, [(b * Ai) / 3 + x * 0.4, 0.5, 0]));
      t.cyl(r, 0.07, 0.07, 0.06, d + 0.05, y, v, { seg: 10, rot: [0, 0, Ai / 2] });
      for (let b = 0; b < 8; b++) {
        let g = (b * Ai) / 4;
        t.add(a, ct(ot(0.005, 0.66, 0.005), d + 0.098, y, v, [g, 0, 0]));
      }
      for (let b of [0.12, 0.22, 0.32]) t.cyl(a, b, b, 0.006, d + 0.1, y, v, { seg: 20, open: !0, rot: [0, 0, Ai / 2] });
    }
    t.decal(
      Ti(n, "KELVAR  MARINE  REFRIGERATION", { color: "black", font: "sans", distress: 0.2 }),
      0.05,
      0.2505,
      2.255,
      0,
      [0, Ai / 2, 0],
      1.2,
    );
    for (let x of [-1, 1]) {
      t.add(o, ct(D0(0.98, 0.44), d + 0.004, 1.16, x * 0.53, [0, Ai / 2, 0]), p);
      for (let v = 0; v < 9; v++) t.box(o, 0.06, 0.006, 0.98, d + 0.035, 0.965 + v * 0.049, x * 0.53, { r: 0, rot: [0, 0, -0.75] });
      t.box(o, 0.05, 0.46, 0.03, d + 0.03, 1.16, x * 0.53, { r: 0.005 });
    }
    (t.add(o, ct(D0(1, 0.76), d + 0.004, 0.49, -0.53, [0, Ai / 2, 0]), p),
      t.cyl(r, 0.15, 0.15, 0.46, d + 0.1, 0.36, -0.58, { seg: 14, open: !0, rot: [Ai / 2, 0, 0] }));
    for (let x of [-1, 1]) {
      let v = Rr(0.15, 14, 6);
      (v.scale(1, 1, 0.45), t.add(r, ct(v, d + 0.1, 0.36, -0.58 + x * 0.23)));
    }
    (t.box(r, 0.26, 0.03, 0.5, d + 0.1, 0.19, -0.58, { r: 0.006 }),
      t.cyl(f, 0.07, 0.07, 0.4, d + 0.07, 0.5, -0.17, { seg: 10 }),
      t.tube(
        c,
        [
          [d + 0.1, 0.5, -0.5],
          [d + 0.1, 0.68, -0.5],
          [d + 0.08, 0.78, -0.4],
          [d + 0.08, 0.8, -0.2],
          [d + 0.07, 0.72, -0.17],
        ],
        0.012,
        { seg: 6 },
      ),
      t.tube(
        c,
        [
          [d + 0.12, 0.42, -0.36],
          [d + 0.14, 0.6, -0.33],
          [d + 0.1, 0.84, -0.34],
          [d + 0.06, 0.88, -0.6],
          [d + 0.03, 0.88, -0.9],
        ],
        0.009,
        { seg: 6 },
      ),
      t.tube(
        c,
        [
          [d + 0.1, 0.36, -0.82],
          [d + 0.1, 0.36, -0.93],
          [d + 0.06, 0.6, -0.96],
          [d + 0.04, 0.86, -0.96],
        ],
        0.012,
        { seg: 6 },
      ),
      t.box(t.M("paint_red"), 0.04, 0.05, 0.05, d + 0.12, 0.6, -0.33, { r: 0.008 }));
    let m = 0.55;
    (t.box(l, 0.11, 0.56, 0.74, d + 0.055, 0.5, m, { r: 0.012 }),
      t.box(l, 0.012, 0.5, 0.68, d + 0.114, 0.5, m, { r: 0.004 }),
      t.add(r, ct(D0(0.26, 0.11), d + 0.1215, 0.66, m - 0.1, [0, Ai / 2, 0])),
      t.add(n.mats.emissive(16757850, 2.4), ct(D0(0.15, 0.05), d + 0.122, 0.665, m - 0.06, [0, Ai / 2, 0]), null, !0),
      t.add(n.mats.emissive(5832570, 3), ct(D0(0.014, 0.014), d + 0.122, 0.66, m - 0.2, [0, Ai / 2, 0]), null, !0));
    for (let x = 0; x < 4; x++)
      for (let v = 0; v < 2; v++) t.box(r, 0.008, 0.03, 0.03, d + 0.122, 0.5 - v * 0.045, m - 0.04 - x * 0.045, { r: 0.003 });
    return (
      t.box(t.M("paint_red"), 0.03, 0.09, 0.03, d + 0.13, 0.42, m + 0.22, { r: 0.006 }),
      t.cyl(a, 0.012, 0.012, 0.1, d + 0.124, 0.5, m + 0.325, { seg: 6 }),
      t.decal(Vn(n, "hazard_voltage"), 0.11, d + 0.1215, 0.64, m + 0.2, [0, Ai / 2, 0]),
      t.tube(
        u,
        [
          [d + 0.06, 0.78, m + 0.2],
          [d + 0.06, 0.95, m + 0.25],
          [d + 0.05, 1.4, m + 0.5],
          [d + 0.05, 1.5, m - 0],
        ],
        0.012,
        { seg: 5 },
      ),
      t.tube(
        u,
        [
          [d + 0.06, 0.78, m - 0.2],
          [d + 0.06, 0.92, m - 0.3],
          [d + 0.05, 0.93, -0.1],
        ],
        0.01,
        { seg: 5 },
      ),
      t.cyl(a, 0.022, 0.022, 0.04, d + 0.06, 0.2, m + 0.2, { seg: 8 }),
      t.tube(
        u,
        [
          [d + 0.06, 0.2, m + 0.2],
          [d + 0.08, 0.12, m + 0.1],
          [d + 0.1, 0.16, m - 0.15],
          [d + 0.1, 0.2, m - 0.3],
          [d + 0.1, 0.13, m - 0.36],
          [d + 0.09, 0.12, m - 0.1],
          [d + 0.09, 0.14, m + 0.05],
        ],
        0.016,
        { seg: 6 },
      ),
      t.box(t.M("paint_blue"), 0.07, 0.07, 0.12, d + 0.09, 0.14, m + 0.1, { r: 0.015 }),
      t.decal(Vn(n, "grime_streak"), 0.8, 0.2512, 0.5, -1.105, [0, Ai / 2, 0], 0.08),
      e.flip || t.pop(),
      $i(t.group(), "reefer_unit", _g("reefer_unit"), [{ min: [-0.25, 0, -1.15], max: [0.25, 2.3, 1.15], surface: "metal" }])
    );
  }
  export var is = Math.PI,
    gv = new Qe(16752680),
    zk = new Qe(16721940),
    Dk = new Qe(16767392);
  export function G_(n, e = {}) {
    let t = e.seed | 0,
      i = t * 1.9,
      s = e.id || e.label || "ABC"[t % 3],
      o = new On(n),
      r = new On(n),
      a = new On(n),
      l = new On(n),
      c = o.M("paint_grey", { vertexColors: !0 }),
      u = o.M("steel_dark"),
      f = o.M("steel_galv"),
      h = o.M("aluminium"),
      p = o.M("rubber"),
      d = o.M("concrete", { vertexColors: !0 }),
      m = (ce, P, D) => {
        let B = (0.88 + 0.2 * Jn(ce * 3 + i, P * 3 + D * 2)) * (0.6 + 0.4 * H0(0.16, 0.7, P));
        return [B, B, B * 0.98];
      };
    (o.defCol.set(c, m),
      r.defCol.set(c, (ce, P, D) => {
        let B = 0.9 + 0.14 * Jn(ce * 4 + i, P * 3);
        return [B, B, B];
      }));
    let x = [0.035, 0.035, 0.04],
      v = { em: !0 };
    (o.box(d, 1.36, 0.16, 0.96, 0, 0.08, 0, {
      r: 0.025,
      col: (ce, P, D) => {
        let B = 0.6 + 0.38 * H0(0, 0.15, P) + 0.1 * Jn(ce * 5, D * 5);
        return [B, B, B * 0.97];
      },
    }),
      o.decal(Vn(n, "caution_stripes"), 0.1, 0, 0.085, 0.4815, null, 1.2));
    for (let ce of [-1, 1])
      for (let P of [-1, 1])
        (o.cyl(f, 0.016, 0.016, 0.03, ce * 0.44, 0.185, P * 0.36, { seg: 6 }),
          o.box(f, 0.1, 0.012, 0.1, ce * 0.44, 0.166, P * 0.36, { r: 0 }));
    let y = -0.5,
      b = 0.5,
      g = 0.18,
      E = 1.62,
      M = -0.3,
      _ = 0.3,
      T = 0.025,
      w = (g + E) / 2,
      S = E - g;
    o.box(c, 1, S, T, 0, w, M + T / 2, { r: 0.006 });
    for (let ce of [-1, 1]) o.box(c, T, S, 0.6, ce * (0.5 - T / 2), w, 0, { r: 0.006 });
    (o.box(c, 1, T, 0.6, 0, g + T / 2, 0, { r: 0.006 }),
      o.box(c, 1, T, 0.6, 0, E - T / 2, 0, { r: 0.006 }),
      o.box(c, T, S, 0.58, 0, w, 0, { r: 0.004 }),
      o.box(c, 1, 0.12, T, 0, E - 0.06, _ - T / 2, { r: 0.006 }),
      o.box(c, 1, 0.07, T, 0, g + 0.035, _ - T / 2, { r: 0.006 }),
      o.box(u, 1.04, 0.04, 0.64, 0, g - 0.01, 0, { r: 0.008 }),
      o.box(c, 1.12, 0.05, 0.74, 0, E + 0.025, 0.01, { r: 0.012 }));
    for (let ce of [-1, 1])
      o.tube(
        f,
        [
          [ce * 0.4 - 0.04, E + 0.05, 0.2],
          [ce * 0.4 - 0.03, E + 0.1, 0.2],
          [ce * 0.4 + 0.03, E + 0.1, 0.2],
          [ce * 0.4 + 0.04, E + 0.05, 0.2],
        ],
        0.008,
        { seg: 5 },
      );
    let R = (ce, P, D) => [0.16, 0.16, 0.17];
    (o.add(c, ct(D0(0.45, S - 0.06), -0.25, w, M + T + 0.002), R),
      o.add(c, ct(D0(0.55, S - 0.06), y + T + 0.002, w, 0, [0, is / 2, 0]), R),
      o.add(c, ct(D0(0.55, S - 0.06), -T / 2 - 0.002, w, 0, [0, -is / 2, 0]), R));
    for (let ce = 0; ce < 5; ce++) {
      let P = 0.42 + ce * 0.22;
      (o.box(u, 0.42, 0.17, 0.4, -0.25, P, -0.05, { r: 0.008 }), o.box(h, 0.4, 0.02, 0.012, -0.25, P + 0.06, 0.152, { r: 0 }));
      for (let D = 0; D < 4; D++) a.add(v, ct(D0(0.012, 0.012), -0.41 + D * 0.035, P - 0.04, 0.1512));
      for (let D = 0; D < 3; D++) o.add(u, ct(Ar(0.03, 0.022, 2), -0.2 + D * 0.06, P - 0.03, 0.1512), x);
    }
    let z = [p, p, p];
    for (let ce = 0; ce < 4; ce++)
      o.tube(
        z[ce % 3],
        [
          [-0.2 + (ce % 3) * 0.06, 0.39 + ce * 0.22, 0.15],
          [-0.14 + (ce % 3) * 0.05, 0.36 + ce * 0.22, 0.24],
          [-0.07, 0.55 + ce * 0.22, 0.22],
          [-0.2 + ((ce + 1) % 3) * 0.06, 0.61 + ce * 0.22, 0.15],
        ],
        0.007,
        { seg: 5 },
      );
    let I = 0.474,
      L = 1.3,
      U = 0.9,
      k = (ce, P, D) => {
        let B = P + I / 2,
          X = 0;
        (ce.box(c, I, L, 0.024, B, U, X, { r: 0.006 }), ce.box(c, I - 0.07, L - 0.07, 0.006, B, U, X + 0.013, { r: 0.003 }));
        for (let he of [U + 0.36, U - 0.4]) {
          ce.add(c, ct(D0(I - 0.14, 0.3), B, he, X + 0.0165), x);
          for (let V = 0; V < 7; V++) ce.box(c, I - 0.13, 0.034, 0.005, B, he - 0.125 + V * 0.042, X + 0.027, { r: 0, rot: [0.75, 0, 0] });
          (ce.box(c, 0.02, 0.31, 0.02, B - (I - 0.13) / 2, he, X + 0.022, { r: 0.003 }),
            ce.box(c, 0.02, 0.31, 0.02, B + (I - 0.13) / 2, he, X + 0.022, { r: 0.003 }));
        }
        let re = D ? P + 0.07 : P + I - 0.07;
        (ce.box(u, 0.045, 0.2, 0.02, re, U - 0.02, X + 0.026, { r: 0.006 }),
          ce.box(f, 0.028, 0.13, 0.018, re, U + 0, X + 0.042, { r: 0.006 }),
          ce.cyl(f, 0.012, 0.012, 0.012, re, U - 0.09, X + 0.04, { seg: 8, rot: [is / 2, 0, 0] }));
        let Y = D ? P + I : P;
        for (let he of [U - 0.5, U, U + 0.5]) ce.cyl(f, 0.011, 0.011, 0.09, Y, he, X + 0.016, { seg: 6 });
      };
    (o.push(Co(0, 0, _ - 0.004)),
      k(o, 0.013, !0),
      o.decal(
        Ti(n, "RELAY " + s, { color: "yellow", font: "stencil", distress: 0.15 }),
        0.12,
        0.013 + I / 2,
        U + 0.02,
        0.018,
        null,
        I - 0.1,
      ),
      o.decal(
        Ti(n, "HARBORMASTER UPLINK", { color: "white", font: "sans", distress: 0.15 }),
        0.034,
        0.013 + I / 2,
        U - 0.1,
        0.018,
        null,
        I - 0.1,
      ),
      o.decal(Vn(n, "hazard_voltage"), 0.13, 0.013 + I / 2 + 0.1, U + 0.14, 0.018, null),
      o.pop());
    let C = [-0.487, 0, _ - 0.004];
    (k(r, 0, !1),
      r.decal(Vn(n, "hazard_general"), 0.13, I / 2, U + 0.1, 0.018, null),
      r.box(c, I - 0.1, 0.03, 0.014, I / 2, U + 0.55, -0.018, { r: 0.003 }),
      r.box(c, I - 0.1, 0.03, 0.014, I / 2, U - 0.55, -0.018, { r: 0.003 }),
      r.box(c, 0.03, 1.1, 0.014, 0.07, U, -0.018, { r: 0.003 }),
      r.box(c, 0.03, 1.1, 0.014, I - 0.07, U, -0.018, { r: 0.003 }),
      r.box(u, 0.24, 0.3, 0.02, I / 2, U - 0.05, -0.02, { r: 0.004 }),
      r.add(
        Ti(n, "WIRING DIAGRAM  SLT-R4", { color: "white", font: "sans", distress: 0.1 }).material,
        ct(D0(0.2, 0.03), I / 2, U + 0.03, -0.0305, [0, is, 0]),
        null,
        !0,
      ));
    for (let ce of [U + 0.36, U - 0.4]) r.add(c, ct(D0(I - 0.14, 0.3), I / 2, ce, -0.0125, [0, is, 0]), x);
    r.decal(Ti(n, "ISOLATE BEFORE SERVICE", { color: "white", font: "sans", distress: 0.15 }), 0.03, I / 2, U - 0.03, 0.018, null, I - 0.1);
    for (let ce of [-1, 1]) {
      o.box(h, 0.012, 0.98, 0.5, ce * 0.506, 1.06, 0, { r: 0.003 });
      for (let P = -6; P <= 6; P++) o.add(h, ct(ot(0.06, 0.94, 0.007), ce * 0.54, 1.06, P * 0.038));
      o.box(c, 0.075, 0.03, 0.52, ce * 0.54, 1.56, 0, { r: 0.006 });
    }
    for (let ce = 0; ce < 3; ce++) {
      let P = -0.17 + ce * 0.17,
        D = 0.44 - ce * 0.02,
        B = 0.86 + ce * 0.07;
      (o.tube(
        p,
        [
          [0.5, D, P],
          [0.6, D, P],
          [0.72 + ce * 0.04, D - 0.06, P],
          [B - 0.02, 0.16, P + 0.02],
          [B, -0.03, P + 0.02],
        ],
        0.04,
        { seg: 8, tension: 0.4 },
      ),
        o.cyl(f, 0.055, 0.055, 0.05, 0.515, D, P, { seg: 8, flat: !0, rot: [0, 0, is / 2] }),
        o.cyl(f, 0.06, 0.066, 0.03, B, 0.015, P + 0.02, { seg: 8 }));
    }
    (o.tube(
      p,
      [
        [-0.3, 0.35, M],
        [-0.3, 0.33, M - 0.1],
        [-0.34, 0.2, M - 0.2],
        [-0.5, 0.165, M - 0.3],
        [-0.9, 0.02, M - 0.36],
        [-1.5, 0.018, M - 0.2],
      ],
      0.022,
      { seg: 6 },
    ),
      o.box(u, 0.3, 0.22, 0.1, 0.2, 0.75, M - 0.05, { r: 0.012 }),
      o.tube(
        p,
        [
          [0.2, 0.86, M - 0.06],
          [0.2, 1.2, M - 0.04],
          [-0.1, 1.55, M - 0.03],
          [-0.3, 1.66, -0.16],
        ],
        0.012,
        { seg: 5 },
      ));
    let A = -0.3,
      F = -0.14,
      H = E + 0.05,
      N = 2.5,
      Z = [0, 1, 2].map((ce) => [A + Math.cos(ce * 2.094 + 0.52) * 0.085, F + Math.sin(ce * 2.094 + 0.52) * 0.085]);
    o.box(f, 0.24, 0.012, 0.24, A, H + 0.006, F, { r: 0 });
    for (let ce = 0; ce < 3; ce++) {
      let P = Z[ce],
        D = Z[(ce + 1) % 3];
      o.bar(f, [P[0], H, P[1]], [P[0], N, P[1]], 0.011, { seg: 6 });
      let B = 5,
        X = (N - H) / B;
      for (let re = 0; re < B; re++)
        (o.bar(f, [P[0], H + re * X, P[1]], [D[0], H + (re + 1) * X, D[1]], 0.005, { seg: 4 }),
          o.bar(f, [P[0], H + (re + 1) * X, P[1]], [D[0], H + (re + 1) * X, D[1]], 0.005, { seg: 4 }));
    }
    (o.cyl(f, 0.11, 0.11, 0.014, A, N + 0.007, F, { seg: 10 }), o.cyl(u, 0.05, 0.06, 0.1, A, N + 0.06, F, { seg: 10 }));
    let Q = (ce, P, D) => {
      (o.cyl(u, 0.016, 0.02, 0.07, ce, E + 0.085, P, { seg: 8 }),
        o.cyl(f, 0.011, 0.011, 0.06, ce, E + 0.15, P, { seg: 6 }),
        o.bar(u, [ce, E + 0.17, P], [ce + 0.02, D, P - 0.015], 0.005, { r2: 0.0018, seg: 5, caps: !0 }));
    };
    (Q(0.4, -0.24, 3.15),
      Q(0.26, -0.24, 2.72),
      o.cyl(u, 0.03, 0.03, 0.26, 0.42, E + 0.18, 0.18, { seg: 8 }),
      o.add(u, ct(Rr(0.03, 8, 4, is * 2, 0, is / 2), 0.42, E + 0.31, 0.18)));
    let W = vg(
      [
        [0, 0],
        [0.06, 0.006],
        [0.12, 0.024],
        [0.18, 0.054],
        [0.215, 0.078],
        [0.222, 0.078],
        [0.185, 0.05],
        [0.12, 0.016],
        [0.06, -0.003],
        [0, -0.01],
      ],
      18,
    );
    (W.computeVertexNormals(),
      l.add(h, ct(W, 0, 0.3, 0.02, [is / 2 - 0.12, 0, 0])),
      l.cyl(h, 0.022, 0.03, 0.2, 0, 0.1, 0, { seg: 8 }),
      l.box(h, 0.07, 0.1, 0.06, 0, 0.26, -0.02, { r: 0.01 }));
    for (let ce of [0.5, 2.6, 4.7]) l.bar(h, [Math.cos(ce) * 0.2, 0.3 + Math.sin(ce) * 0.2, 0.09], [0, 0.325, 0.25], 0.0045, { seg: 4 });
    l.cyl(h, 0.022, 0.016, 0.05, 0, 0.325, 0.25, { seg: 8, rot: [is / 2, 0, 0] });
    let J = [A, N + 0.11, F];
    (o.box(u, 0.9, 0.07, 0.03, 0, E - 0.06, _ + 0.012, { r: 0.008 }), a.add(v, ct(D0(0.84, 0.036), 0, E - 0.06, _ + 0.0275)));
    for (let ce = 1; ce < 6; ce++) o.add(u, ct(ot(0.008, 0.05, 0.006), -0.42 + ce * 0.14, E - 0.06, _ + 0.028));
    (o.box(u, 0.6, 0.06, 0.03, 0, E - 0.06, M - 0.012, { r: 0.008 }), a.add(v, ct(D0(0.54, 0.03), 0, E - 0.06, M - 0.0275, [0, is, 0])));
    for (let ce of [-1, 1])
      (o.box(u, 0.03, 1.2, 0.03, ce * 0.5, 0.86, _, { r: 0.008, rot: [0, is / 4, 0] }),
        a.add(v, ct(D0(0.014, 1.14), ce * 0.5, 0.86, _ + 0.0215, [0, (ce * is) / 4, 0]).translate(ce * 0.0152, 0, 0)),
        a.add(v, ct(D0(0.014, 0.9), ce * 0.5715, 1.06, 0.262, [0, (ce * is) / 2, 0])));
    for (let ce of [-1, 1])
      (o.box(u, 0.03, 0.06, 0.46, ce * 0.587, E - 0.01, 0, { r: 0.008 }),
        a.add(v, ct(D0(0.4, 0.032), ce * 0.6025, E - 0.01, 0, [0, (ce * is) / 2, 0])));
    (o.cyl(u, 0.028, 0.028, 0.02, A + 0.2, E + 0.06, F, { seg: 8 }),
      o.bar(f, [A + 0.2, E + 0.06, F], [A + 0.2, 2.64, F], 0.009, { seg: 6 }),
      a.add(v, ct(vt(0.045, 0.045, 0.1, 10), A + 0.2, 2.69, F)),
      o.cyl(u, 0.05, 0.05, 0.014, A + 0.2, 2.747, F, { seg: 10 }),
      o.cyl(u, 0.05, 0.05, 0.014, A + 0.2, 2.633, F, { seg: 10 }),
      o.decal(Vn(n, "rust_run"), 0.5, 0.5135, 0.3, 0.2, [0, is / 2, 0], 0.14),
      o.decal(Vn(n, "grime_streak"), 0.6, -0.2, 1.2, M - 0.001, [0, is, 0], 0.2));
    let G = o.group(),
      te = new At();
    ((te.userData.noMerge = !0), (te.name = "relay_dynamic"), G.add(te));
    let oe = n.mats.emissive(16752680, 4);
    oe = oe.clone();
    let ee = new ht(Jr(a.buckets.get(v).geos), oe);
    ((ee.userData.noMerge = !0), te.add(ee));
    let le = r.group().children.slice();
    for (let ce of le) (ce.position.set(C[0], C[1], C[2]), (ce.userData.noMerge = !0), te.add(ce));
    let xe = l.group().children.slice();
    for (let ce of xe) (ce.position.set(J[0], J[1], J[2]), (ce.userData.noMerge = !0), te.add(ce));
    let j = new Qe(),
      O = (ce, P) => {
        if (oe.userData && typeof oe.userData.setEmissive == "function") {
          oe.userData.setEmissive(ce, P);
          return;
        }
        oe.emissive && oe.emissive.isColor && oe.isMeshStandardMaterial
          ? (oe.emissive.copy(ce), (oe.emissiveIntensity = P))
          : oe.uniforms && oe.uniforms.color && oe.uniforms.color.value && oe.uniforms.color.value.isColor
            ? (oe.uniforms.color.value.copy(ce).multiplyScalar(P), oe.uniforms.intensity && (oe.uniforms.intensity.value = 1))
            : oe.color && oe.color.isColor && oe.color.copy(ce).multiplyScalar(P);
      },
      q = "live",
      ue = (t % 7) * 0.9,
      de = 0,
      $ = 0.7,
      se = 0,
      fe = 0,
      me = 0,
      ge = G.userData;
    if (
      ((ge.state = q),
      (ge.beacon = [A + 0.2, 2.68, F]),
      (ge.interact = [0, 1, 0.75]),
      (ge.emissiveMaterial = oe),
      (ge.level = 0),
      (ge.setState = (ce) => {
        (ce !== "live" && ce !== "cutting" && ce !== "cut") ||
          (ce !== q && ((q = ce), (ge.state = ce), ce === "cut" && ((de = 0), (me = 1.32), (fe = 2.5)), ce === "live" && (me = 0)));
      }),
      (ge.update = (ce) => {
        ((ce = Math.min(ce || 0, 0.1)), (ue += ce));
        let P = 0,
          D = gv,
          B = 0.7;
        if (q === "live") P = 5.5 + 3 * Math.sin(ue * 2.2);
        else if (q === "cutting") {
          let X = Math.sin(ue * 2 * is * 5.5) > 0;
          ((P = X ? 9 : 0.5), (D = X ? Dk : gv), (B = 2.6 + Math.sin(ue * 9) * 1.5));
        } else if (((de += ce), (D = zk), (B = 0), de < 0.3)) P = 9;
        else if (de < 2.6) {
          let X = 1 - (de - 0.3) / 2.3;
          P = 7 * X * X * (Math.sin(de * 37) * Math.sin(de * 13.3) > -0.2 ? 1 : 0.08);
        } else P = 0;
        if (((ge.level = P), O(j.copy(D), P), ($ += (B - $) * Math.min(1, ce * (q === "cut" ? 1.6 : 3))), Math.abs($) > 0.001))
          for (let X of xe) X.rotateY($ * ce);
        if (Math.abs(me - se) > 1e-4 || Math.abs(fe) > 0.001) {
          fe += (-(se - me) * 30 - fe * 3.2) * ce;
          let X = se + fe * ce;
          (X < 0 && ((X = 0), (fe = Math.abs(fe) * 0.3)), X > 1.9 && ((X = 1.9), (fe = -Math.abs(fe) * 0.4)));
          let re = X - se;
          se = X;
          for (let Y of le) Y.rotateY(-re);
        }
      }),
      e.state === "cut")
    ) {
      ge.setState("cut");
      for (let ce = 0; ce < 80; ce++) ge.update(0.05);
    } else (e.state === "cutting" && ge.setState("cutting"), ge.update(0), q === "live" && O(j.copy(gv), 6));
    return $i(G, "relay_node", Yi.relay_node.slice(0, 3), [
      { min: [-0.68, 0, -0.48], max: [0.68, 0.16, 0.48], surface: "concrete" },
      { min: [-0.57, 0.16, -0.32], max: [0.57, 1.67, 0.33], surface: "metal" },
      { min: [-0.42, 1.67, -0.26], max: [-0.18, 2.5, -0.02], surface: "metal", bulletOnly: !0 },
    ]);
  }
  for (let n of ["container20", "container40", "container40hc"]) Si(n, (e, t) => A_(e, n, t));
  Si("jersey_barrier", k_);
  Si("light_mast", P_);
  Si("fence_panel", I_);
  Si("guard_booth", z_);
  Si("gate_arm", D_);
  Si("bollard_mooring", L_);
  Si("bollard_post", F_);
  Si("sign_post", N_);
  Si("floodlight_stand", U_);
  Si("stairs_metal", H_);
  Si("catwalk", O_);
  Si("shelf_rack", V_);
  Si("reefer_unit", W_);
  Si("relay_node", G_);
  export var Vt = Math.PI,
    gt = Math.PI / 2,
    Di = (n, e, t) => Math.min(t, Math.max(e, n));
  export function Nl(n, e, t) {
    let i = Math.imul(n, 374761393) ^ Math.imul(e, 668265263) ^ Math.imul(t, 2147483647);
    return ((i = Math.imul(i ^ (i >>> 13), 1274126177)), ((i ^ (i >>> 16)) >>> 0) / 4294967296);
  }
  export function O0(n, e = 0, t = 0) {
    let i = Math.floor(n),
      s = Math.floor(e),
      o = Math.floor(t),
      r = n - i,
      a = e - s,
      l = t - o;
    ((r = r * r * (3 - 2 * r)), (a = a * a * (3 - 2 * a)), (l = l * l * (3 - 2 * l)));
    let c = (u, f, h) => u + (f - u) * h;
    return c(
      c(c(Nl(i, s, o), Nl(i + 1, s, o), r), c(Nl(i, s + 1, o), Nl(i + 1, s + 1, o), r), a),
      c(c(Nl(i, s, o + 1), Nl(i + 1, s, o + 1), r), c(Nl(i, s + 1, o + 1), Nl(i + 1, s + 1, o + 1), r), a),
      l,
    );
  }
  export function s1(n, e, t, i) {
    let s = new pt();
    return (
      s.setAttribute("position", new nt(new Float32Array(n), 3)),
      e && s.setAttribute("normal", new nt(new Float32Array(e), 3)),
      s.setAttribute("uv", new nt(new Float32Array(t), 2)),
      i && s.setIndex(i),
      e || s.computeVertexNormals(),
      s
    );
  }
  export function hs(n, e = 16) {
    let t = n.length,
      i = [],
      s = [],
      o = [],
      r = [],
      a = [],
      l = [],
      c = [],
      u = 0,
      f = 0;
    for (let h = 0; h < t; h++) {
      let p = 0,
        d = 0;
      if (h > 0) {
        let x = n[h][0] - n[h - 1][0],
          v = n[h][1] - n[h - 1][1],
          y = Math.hypot(x, v);
        y > 1e-6 && ((p += x / y), (d += v / y), (f += y));
      }
      if (h < t - 1) {
        let x = n[h + 1][0] - n[h][0],
          v = n[h + 1][1] - n[h][1],
          y = Math.hypot(x, v);
        y > 1e-6 && ((p += x / y), (d += v / y));
      }
      let m = Math.hypot(p, d) || 1;
      (a.push(d / m), l.push(-p / m), c.push(f), (u = Math.max(u, n[h][0])));
    }
    for (let h = 0; h < t; h++)
      for (let p = 0; p <= e; p++) {
        let d = (p / e) * Vt * 2,
          m = Math.cos(d),
          x = Math.sin(d);
        (i.push(n[h][0] * m, n[h][1], n[h][0] * x), s.push(a[h] * m, l[h], a[h] * x), o.push((p / e) * Vt * 2 * u, c[h]));
      }
    for (let h = 0; h < t - 1; h++)
      if (!(Math.hypot(n[h + 1][0] - n[h][0], n[h + 1][1] - n[h][1]) < 1e-6))
        for (let p = 0; p < e; p++) {
          let d = h * (e + 1) + p,
            m = d + e + 1,
            x = m + 1,
            v = d + 1;
          (n[h][0] > 1e-6 && r.push(d, m, v), n[h + 1][0] > 1e-6 && r.push(m, x, v));
        }
    return s1(i, s, o, r);
  }
  export function tt(n, e, t, i = 0.008, s = "center") {
    let o = [n / 2, e / 2, t / 2];
    i = Math.min(i, o[0] * 0.9, o[1] * 0.9, o[2] * 0.9);
    let r = [],
      a = [],
      l = [],
      c = [];
    for (let p = 0; p < 8; p++)
      for (let d = 0; d < 3; d++) {
        let m = [p & 1 ? 1 : -1, p & 2 ? 1 : -1, p & 4 ? 1 : -1],
          x = [0, 1, 2].map((v) => m[v] * (o[v] - (v !== d ? i : 0)));
        (r.push(x[0], x[1], x[2]),
          a.push(d === 0 ? m[0] : 0, d === 1 ? m[1] : 0, d === 2 ? m[2] : 0),
          d === 0 ? l.push(x[2], x[1]) : d === 1 ? l.push(x[0], x[2]) : l.push(x[0], x[1]));
      }
    let u = (p, d) => p * 3 + d,
      f = (p, d, m, x, v, y) => {
        let b = r[d * 3] - r[p * 3],
          g = r[d * 3 + 1] - r[p * 3 + 1],
          E = r[d * 3 + 2] - r[p * 3 + 2],
          M = r[m * 3] - r[p * 3],
          _ = r[m * 3 + 1] - r[p * 3 + 1],
          T = r[m * 3 + 2] - r[p * 3 + 2];
        (g * T - E * _) * x + (E * M - b * T) * v + (b * _ - g * M) * y >= 0 ? c.push(p, d, m) : c.push(p, m, d);
      };
    for (let p = 0; p < 3; p++) {
      let d = (p + 1) % 3,
        m = (p + 2) % 3;
      for (let x of [0, 1]) {
        let v = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ].map(([b, g]) => (x << p) | (b << d) | (g << m)),
          y = [0, 0, 0];
        ((y[p] = x ? 1 : -1), f(u(v[0], p), u(v[1], p), u(v[2], p), ...y), f(u(v[0], p), u(v[2], p), u(v[3], p), ...y));
      }
      for (let x of [0, 1])
        for (let v of [0, 1]) {
          let y = (x << d) | (v << m),
            b = y | (1 << p),
            g = [0, 0, 0];
          ((g[d] = x ? 1 : -1), (g[m] = v ? 1 : -1), f(u(y, d), u(b, d), u(b, m), ...g), f(u(y, d), u(b, m), u(y, m), ...g));
        }
    }
    for (let p = 0; p < 8; p++) f(u(p, 0), u(p, 1), u(p, 2), p & 1 ? 1 : -1, p & 2 ? 1 : -1, p & 4 ? 1 : -1);
    let h = s1(r, a, l, c);
    return (s === "bottom" && h.translate(0, e / 2, 0), h);
  }
  export function uo(n, e, t, i = 0.03, s = 3, o = 3, r = 3, a = "center") {
    let l = new R0(n, e, t, s, o, r),
      c = l.attributes.position,
      u = l.attributes.normal,
      f = l.attributes.uv,
      h = n / 2,
      p = e / 2,
      d = t / 2;
    i = Math.min(i, h * 0.95, p * 0.95, d * 0.95);
    let m = (v, y, b) => {
        if (Math.abs(v) > y - 1e-6 || b < 3) return v;
        let g = (2 * y) / b;
        return (v * (y - i)) / (y - g);
      },
      x = new K();
    for (let v = 0; v < c.count; v++) {
      let y = m(c.getX(v), h, s),
        b = m(c.getY(v), p, o),
        g = m(c.getZ(v), d, r),
        E = Di(y, -(h - i), h - i),
        M = Di(b, -(p - i), p - i),
        _ = Di(g, -(d - i), d - i);
      (x.set(y - E, b - M, g - _),
        (Math.abs(y) > h - 1e-5 ? 1 : 0) + (Math.abs(b) > p - 1e-5 ? 1 : 0) + (Math.abs(g) > d - 1e-5 ? 1 : 0) >= 2 &&
          x.lengthSq() > 1e-12 &&
          (x.normalize(), (y = E + x.x * i), (b = M + x.y * i), (g = _ + x.z * i), u.setXYZ(v, x.x, x.y, x.z)),
        c.setXYZ(v, y, b, g));
      let w = Math.abs(u.getX(v)),
        S = Math.abs(u.getY(v)),
        R = Math.abs(u.getZ(v));
      w >= S && w >= R ? f.setXY(v, g, b) : S >= w && S >= R ? f.setXY(v, y, g) : f.setXY(v, y, b);
    }
    return (a === "bottom" && l.translate(0, e / 2, 0), l);
  }
  export function fo(n, e) {
    let t = n.attributes.position,
      i = new K();
    for (let s = 0; s < t.count; s++) (i.fromBufferAttribute(t, s), e(i, s), t.setXYZ(s, i.x, i.y, i.z));
    return n;
  }
  export function Cr(n) {
    let e = n.attributes.position,
      t = n.index,
      i = e.count,
      s = new Map(),
      o = (h) => Math.round(e.getX(h) * 2e3) + "," + Math.round(e.getY(h) * 2e3) + "," + Math.round(e.getZ(h) * 2e3),
      r = new Array(i);
    for (let h = 0; h < i; h++) r[h] = o(h);
    let a = new K(),
      l = new K(),
      c = new K(),
      u = t ? t.count : i;
    for (let h = 0; h < u; h += 3) {
      let p = t ? t.getX(h) : h,
        d = t ? t.getX(h + 1) : h + 1,
        m = t ? t.getX(h + 2) : h + 2;
      (a.fromBufferAttribute(e, p), l.fromBufferAttribute(e, d), c.fromBufferAttribute(e, m), l.sub(a), c.sub(a), l.cross(c));
      for (let x of [p, d, m]) {
        let v = s.get(r[x]);
        (v || ((v = [0, 0, 0]), s.set(r[x], v)), (v[0] += l.x), (v[1] += l.y), (v[2] += l.z));
      }
    }
    let f = new Float32Array(i * 3);
    for (let h = 0; h < i; h++) {
      let p = s.get(r[h]) || [0, 1, 0],
        d = Math.hypot(p[0], p[1], p[2]) || 1;
      ((f[h * 3] = p[0] / d), (f[h * 3 + 1] = p[1] / d), (f[h * 3 + 2] = p[2] / d));
    }
    return (n.setAttribute("normal", new nt(f, 3)), n);
  }
  export function Eg(n) {
    if (n.index) {
      let t = n.index.array;
      for (let i = 0; i < t.length; i += 3) {
        let s = t[i + 1];
        ((t[i + 1] = t[i + 2]), (t[i + 2] = s));
      }
    } else
      for (let t of Object.keys(n.attributes)) {
        let i = n.attributes[t],
          s = i.itemSize,
          o = i.array;
        for (let r = 0; r < i.count; r += 3)
          for (let a = 0; a < s; a++) {
            let l = o[(r + 1) * s + a];
            ((o[(r + 1) * s + a] = o[(r + 2) * s + a]), (o[(r + 2) * s + a] = l));
          }
      }
    let e = n.attributes.normal.array;
    for (let t = 0; t < e.length; t++) e[t] = -e[t];
    return n;
  }
  export function vv(n, e) {
    let t = n.groups[e];
    if (!t) return n;
    let i = Array.from(n.index.array);
    (i.splice(t.start, t.count), n.setIndex(i));
    for (let s of n.groups) s.start > t.start && (s.start -= t.count);
    return ((t.count = 0), n);
  }
  export var q_ = new St(),
    Lk = new K(0, 1, 0),
    wg = new K(),
    X_ = new Je();
  export function V0(n, e, t = 0.02, i = 6, s = !1, o = t) {
    wg.set(e[0] - n[0], e[1] - n[1], e[2] - n[2]);
    let r = wg.length();
    wg.normalize();
    let a = vt(o, t, r, i, !s);
    return (
      q_.setFromUnitVectors(Lk, wg),
      X_.compose(new K((n[0] + e[0]) / 2, (n[1] + e[1]) / 2, (n[2] + e[2]) / 2), q_, new K(1, 1, 1)),
      a.applyMatrix4(X_),
      a
    );
  }
  export function ko(n, e, { soft: t = 0.6, caps: i = !0 } = {}) {
    let s = n.length,
      o = [],
      r = [],
      a = [],
      l = [],
      c = e / 2,
      u = [],
      f = 0,
      h = [0];
    for (let d = 0; d < s; d++) {
      let m = n[d],
        x = n[(d + 1) % s],
        v = x[0] - m[0],
        y = x[1] - m[1],
        b = Math.hypot(v, y) || 1;
      (u.push([y / b, -v / b]), (f += b), h.push(f));
    }
    let p = (d, m) => {
      let x = u[d],
        v = u[(m + s) % s];
      if (x[0] * v[0] + x[1] * v[1] > Math.cos(t)) {
        let y = x[0] + v[0],
          b = x[1] + v[1],
          g = Math.hypot(y, b) || 1;
        return [y / g, b / g];
      }
      return x;
    };
    for (let d = 0; d < s; d++) {
      let m = n[d],
        x = n[(d + 1) % s],
        v = p(d, d - 1),
        y = p(d, d + 1),
        b = o.length / 3;
      (o.push(m[0], m[1], c, m[0], m[1], -c, x[0], x[1], -c, x[0], x[1], c),
        r.push(v[0], v[1], 0, v[0], v[1], 0, y[0], y[1], 0, y[0], y[1], 0),
        a.push(h[d], c, h[d], -c, h[d + 1], -c, h[d + 1], c),
        l.push(b, b + 1, b + 2, b, b + 2, b + 3));
    }
    if (i) {
      let d = As.triangulateShape(
        n.map((m) => new We(m[0], m[1])),
        [],
      );
      for (let m of [1, -1]) {
        let x = o.length / 3;
        for (let v of n) (o.push(v[0], v[1], m * c), r.push(0, 0, m), a.push(v[0], v[1]));
        for (let v of d) m > 0 ? l.push(x + v[0], x + v[1], x + v[2]) : l.push(x + v[0], x + v[2], x + v[1]);
      }
    }
    return s1(o, r, a, l);
  }
  export function kr(n, e, t = !0) {
    let i = n.length,
      s = [],
      o = [],
      r = [],
      a = 0,
      l = Math.hypot(e[0], e[1], e[2]) * 2;
    for (let p = 0; p < i; p++)
      (p && (a += Math.hypot(n[p][0] - n[p - 1][0], n[p][1] - n[p - 1][1], n[p][2] - n[p - 1][2])),
        s.push(n[p][0] - e[0], n[p][1] - e[1], n[p][2] - e[2], n[p][0] + e[0], n[p][1] + e[1], n[p][2] + e[2]),
        o.push(a, 0, a, l));
    for (let p = 0; p < i - 1; p++) {
      let d = p * 2;
      r.push(d, d + 1, d + 3, d, d + 3, d + 2);
    }
    let c = s1(s, null, o, r);
    if (!t) return c;
    let u = c.clone(),
      f = u.index.array;
    for (let p = 0; p < f.length; p += 3) {
      let d = f[p + 1];
      ((f[p + 1] = f[p + 2]), (f[p + 2] = d));
    }
    let h = u.attributes.normal.array;
    for (let p = 0; p < h.length; p++) h[p] = -h[p];
    return Jr([c, u]);
  }
  export function i1(n, e) {
    return new w0(n, e);
  }
  export function Fk(n, e, t, i = 4) {
    let s = [],
      o = [],
      r = [],
      a = [];
    for (let l = 0; l <= i; l++) {
      let c = ((l / i - 0.5) * e) / n,
        u = Math.sin(c),
        f = Math.cos(c);
      (s.push(n * u, -t / 2, n * f, n * u, t / 2, n * f), o.push(u, 0, f, u, 0, f), r.push(l / i, 0, l / i, 1));
    }
    for (let l = 0; l < i; l++) {
      let c = l * 2;
      a.push(c, c + 2, c + 3, c, c + 3, c + 1);
    }
    return s1(s, o, r, a);
  }
  export function Ul(n, e, t = 6, i = 12, s = Vt * 2) {
    let o = new jn(n, e, t, i, s),
      r = o.attributes.uv;
    for (let a = 0; a < r.count; a++) r.setXY(a, r.getX(a) * s * n, r.getY(a) * 2 * Vt * e);
    return o;
  }
  export function J_(n, e = 8, t = 6) {
    let i = new Gi(n, e, t),
      s = i.attributes.uv;
    for (let o = 0; o < s.count; o++) s.setXY(o, s.getX(o) * 2 * Vt * n, s.getY(o) * Vt * n);
    return i;
  }
  export function Nk(n, e) {
    let t = n.attributes.position.count,
      i = n.attributes.color;
    if ((i || ((i = new nt(new Float32Array(t * 3).fill(1), 3)), n.setAttribute("color", i)), e === 1 || e == null)) return n;
    let s = i.array;
    if (typeof e == "function") {
      let l = n.attributes.position;
      for (let c = 0; c < t; c++) {
        let u = e(l.getX(c), l.getY(c), l.getZ(c));
        typeof u == "number"
          ? ((s[c * 3] *= u), (s[c * 3 + 1] *= u), (s[c * 3 + 2] *= u))
          : ((s[c * 3] *= u[0]), (s[c * 3 + 1] *= u[1]), (s[c * 3 + 2] *= u[2]));
      }
      return n;
    }
    let o = typeof e == "number" ? e : e[0],
      r = typeof e == "number" ? e : e[1],
      a = typeof e == "number" ? e : e[2];
    for (let l = 0; l < t; l++) ((s[l * 3] *= o), (s[l * 3 + 1] *= r), (s[l * 3 + 2] *= a));
    return n;
  }
  export var Y_ = {
    red: ["paint_red", 1],
    blue: ["paint_blue", 1],
    green: ["paint_green", 1],
    yellow: ["paint_yellow", 1],
    orange: ["paint_orange", 1],
    white: ["paint_white", 1],
    grey: ["paint_grey", 1],
    teal: ["paint_teal", 1],
    rust: ["steel_rust", 1],
    black: ["paint_grey", [0.2, 0.2, 0.22]],
    olive: ["paint_green", [0.75, 0.8, 0.45]],
  };
  export function Bl(n, e = "blue") {
    return Y_[n] || Y_[e];
  }
  export var EF = new Je(),
    $_ = new St(),
    Z_ = new _0(),
    j_ = new K(),
    xv = new K();
  export function Uk({ p: n = [0, 0, 0], r: e = [0, 0, 0], s: t = 1 } = {}) {
    return (
      Z_.set(e[0], e[1], e[2]),
      $_.setFromEuler(Z_),
      j_.set(n[0], n[1], n[2]),
      typeof t == "number" ? xv.set(t, t, t) : xv.set(t[0], t[1], t[2]),
      new Je().compose(j_, $_, xv)
    );
  }
  export var Wn = class {
      constructor(e, t, i = 1) {
        ((this.G = e),
          (this.name = t),
          (this.seed = Math.abs(i | 0)),
          (this.rng = su((this.seed + 1) * 7919 + t.length * 131)),
          (this.b = new Map()),
          (this.stack = [new Je()]));
      }
      push(e) {
        return (this.stack.push(this.stack[this.stack.length - 1].clone().multiply(Uk(e))), this);
      }
      pop() {
        return (this.stack.pop(), this);
      }
      mat(e, t) {
        return this.G.mats.get(e, { vertexColors: !0, ...(t || {}) });
      }
      add(e, t, i, s = 1, { raw: o = !1, cast: r = !0 } = {}) {
        let a = typeof e == "string" ? this.mat(e) : e;
        (i && th(t, i), t.applyMatrix4(this.stack[this.stack.length - 1]), o || Nk(t, s));
        let l = a.uuid + (r ? "c" : "n"),
          c = this.b.get(l);
        return (c || ((c = { mat: a, geos: [], raw: o, cast: r }), this.b.set(l, c)), c.geos.push(t), this);
      }
      decal(e, t, i, s) {
        return this.add(e.material, i1(t, s || t / (e.aspect || 1)), i, 1, { raw: !0, cast: !1 });
      }
      label(e, t, i, s, o) {
        let r = this.G.mats.label(e, t),
          a = Math.min(i, s * (r.aspect || 1));
        return this.add(r.material, i1(a, a / (r.aspect || 1)), o, 1, { raw: !0, cast: !1 });
      }
      cdecal(e, t, i, s, o) {
        return this.add(e.material, Fk(t, i, o || i / (e.aspect || 1)), s, 1, { raw: !0, cast: !1 });
      }
      finish({ size: e, colliders: t, grime: i = 1, surface: s } = {}) {
        let o = new At(),
          r = this.seed * 3.71;
        for (let c of this.b.values()) {
          let u = Jr(c.geos);
          if (!c.raw && i > 0 && u.attributes.color) {
            let h = u.attributes.position,
              p = u.attributes.normal,
              d = u.attributes.color.array;
            for (let m = 0; m < h.count; m++) {
              let x = h.getX(m),
                v = h.getY(m),
                y = h.getZ(m),
                b = p.getY(m),
                g = O0(x * 1.9 + r, v * 1.9, y * 1.9 + 5.3),
                E = O0(x * 9 + 2.1, v * 9 + r, y * 9),
                M = (0.82 + 0.18 * g) * (0.92 + 0.08 * E) * (0.76 + 0.24 * Di(b * 0.6 + 0.62, 0, 1)),
                _ = Di(1 - v / 0.2, 0, 1);
              ((M *= 1 - 0.42 * _ * _ * (0.55 + 0.45 * E)),
                (M = 1 + (M - 1) * i),
                (d[m * 3] *= M),
                (d[m * 3 + 1] *= M * (1 - 0.05 * _ * i)),
                (d[m * 3 + 2] *= M * (1 - 0.12 * _ * i)));
            }
          }
          let f = new ht(u, c.mat);
          ((f.castShadow = c.cast), (f.receiveShadow = !0), o.add(f));
        }
        let a = Yi[this.name] || [1, 1, 1, "", "metal"],
          l = e || [a[0], a[1], a[2]];
        return (
          (o.userData.size = l),
          (o.userData.colliders = t || [{ min: [-l[0] / 2, 0, -l[2] / 2], max: [l[0] / 2, l[1], l[2] / 2], surface: s || a[4] }]),
          o
        );
      }
    },
    K_ = new Map();
  export function o1(n, e) {
    let t = K_.get(n);
    return (t || ((t = e()), K_.set(n, t)), t.clone(!0));
  }
  export var tw = (n, e, t) => {
    let i = Di((t - n) / (e - n), 0, 1);
    return i * i * (3 - 2 * i);
  };
  export function Q_(n, e, t = 0, i = 0) {
    let s = new ut.PlaneGeometry(n, e),
      o = s.attributes.uv,
      r = s.attributes.position;
    for (let a = 0; a < o.count; a++) o.setXY(a, r.getX(a) + t, r.getY(a) + i);
    return s;
  }
  export var Sg = { pz: [0, 0, 0], nz: [0, Vt, 0], px: [0, gt, 0], nx: [0, -gt, 0] };
  export function Bk(n) {
    let t = [
      [0, 0.016],
      [0.262, 0.016],
      [0.262, 0.016],
      [0.268, 0.002],
      [0.288, 0],
      [0.295, 0.008],
      [0.295, 0.022],
      [0.284, 0.034],
    ];
    for (let i of [0.305, 0.595]) t.push([0.283, i - 0.03], [0.291, i - 0.018], [0.297, i], [0.291, i + 0.018], [0.283, i + 0.03]);
    return (
      t.push([0.284, 0.866], [0.295, 0.878], [0.295, 0.892], [0.288, 0.9], [0.268, 0.898]),
      n
        ? t.push([0.268, 0.898], [0.272, 0.888], [0.272, 0.03], [0.272, 0.03], [0, 0.03])
        : t.push([0.262, 0.884], [0.262, 0.884], [0, 0.884]),
      t
    );
  }
  export function Hk(n, e, t) {
    let i = new Wn(n, "barrel", t),
      s = i.rng,
      o = 22,
      [r, a] = Bl(e.color, "blue");
    e.lying && i.push({ p: [-0.45, 0.297, 0], r: [0, 0, -gt] });
    let l = hs(Bk(!!e.open), o),
      c = [];
    for (let d = 0; d < 2 + (t % 2); d++) c.push([s() * Vt * 2, s.range(0.12, 0.78), s.range(0.07, 0.13), s.range(0.006, 0.014)]);
    (fo(l, (d) => {
      let m = Math.hypot(d.x, d.z);
      if (m < 0.27) return;
      let x = Math.atan2(d.z, d.x);
      for (let v of c) {
        let y = Math.abs(x - v[0]) % (Vt * 2);
        y > Vt && (y = Vt * 2 - y);
        let b = Math.hypot(y * 0.285, d.y - v[1]);
        if (b < v[2]) {
          let g = 1 - (v[3] * (0.5 + 0.5 * Math.cos((Vt * b) / v[2]))) / m;
          ((d.x *= g), (d.z *= g));
        }
      }
    }),
      l.computeVertexNormals());
    let u = l.attributes.normal,
      f = l.attributes.position.count / (o + 1);
    for (let d = 0; d < f; d++) {
      let m = d * (o + 1),
        x = m + o,
        v = u.getX(m) + u.getX(x),
        y = u.getY(m) + u.getY(x),
        b = u.getZ(m) + u.getZ(x),
        g = Math.hypot(v, y, b) || 1;
      (u.setXYZ(m, v / g, y / g, b / g), u.setXYZ(x, v / g, y / g, b / g));
    }
    let h = t * 2.37,
      p = e.color === "rust";
    return (
      i.add(r, l, null, (d, m, x) => {
        let v = Math.hypot(d, x),
          y = Math.atan2(x, d);
        if (v < 0.27) {
          let w = m > 0.5 ? 0.62 + 0.3 * O0(d * 9 + h, x * 9) : 0.6;
          return [w, w, w];
        }
        let b = Math.pow(O0(y * 2.6 + h, 3.1), 2.2),
          g = m > 0.6 ? (0.88 - m) / 0.28 : m > 0.31 ? (0.6 - m) / 0.29 : (0.31 - m) / 0.31,
          E = 1 - 0.55 * b * (1 - 0.6 * Di(g, 0, 1)),
          _ = (v > 0.289 ? 1 : 0) * (0.35 + 0.65 * O0(y * 7 + h, m * 20)),
          T = [E * (1 - 0.25 * _), E * (1 - 0.42 * _), E * (1 - 0.55 * _)];
        return (typeof a != "number" && ((T[0] *= a[0]), (T[1] *= a[1]), (T[2] *= a[2])), T);
      }),
      e.open ||
        (i.add("steel_galv", vt(0.036, 0.038, 0.016, 8), { p: [0.17, 0.891, 0.02] }, 0.8),
        i.add("steel_galv", vt(0.017, 0.018, 0.014, 8), { p: [-0.16, 0.89, -0.08] }, 0.8)),
      !p && t % 3 !== 2 && i.cdecal(n.mats.decal("hazard_flammable"), 0.2855, 0.15, { p: [0, 0.455, 0], r: [0, 0.9 + t, 0] }),
      t % 2 === 0 &&
        i.cdecal(
          n.mats.label("UN 1202", {
            color: p || e.color === "white" || e.color === "yellow" ? "black" : "white",
            font: "stencil",
            distress: 0.5,
          }),
          0.2855,
          0.2,
          { p: [0, 0.74, 0], r: [0, 2.6 + t, 0] },
        ),
      i.finish(e.lying ? { size: [0.9, 0.6, 0.6] } : {})
    );
  }
  export function Ag(n, e, { broken: t = !1, stamp: i = !0, bevel: s = !1 } = {}) {
    let o = s ? (u, f, h) => tt(u, f, h, 0.004) : (u, f, h) => ot(u, f, h),
      r = () => {
        let u = e.range(0.62, 1),
          f = e.range(0.9, 1);
        return [u, u * (0.93 + 0.07 * f), u * (0.82 + 0.18 * f)];
      },
      a = (u = 0.003) => e.range(-u, u);
    for (let [u, f] of [
      [-0.45, 0.1],
      [0, 0.145],
      [0.45, 0.1],
    ])
      n.add("wood_pallet", o(1.2, 0.022, f), { p: [a(), 0.011, u + a()], r: [0, a(0.006), 0] }, r());
    let l = (u, f, h = 0.012) => [
      [-u / 2 + h, -f / 2],
      [u / 2 - h, -f / 2],
      [u / 2, -f / 2 + h],
      [u / 2, f / 2 - h],
      [u / 2 - h, f / 2],
      [-u / 2 + h, f / 2],
      [-u / 2, f / 2 - h],
      [-u / 2, -f / 2 + h],
    ];
    for (let u of [-0.5275, 0, 0.5275])
      for (let f of [-0.45, 0, 0.45])
        n.add(
          "wood_pallet",
          ko(l(0.145, f === 0 ? 0.145 : 0.1), 0.078, { caps: !1, soft: 0 }),
          { p: [u + a(), 0.061, f + a()], r: [-gt, a(0.03), 0] },
          r().map((h) => h * 0.8),
        );
    for (let u of [-0.5275, 0, 0.5275]) n.add("wood_pallet", o(0.145, 0.022, 1), { p: [u + a(), 0.111, a()], r: [0, a(0.006), 0] }, r());
    if (
      ([
        [-0.4275, 0.145],
        [-0.215, 0.1],
        [0, 0.145],
        [0.215, 0.1],
        [0.4275, 0.145],
      ].forEach(([u, f], h) => {
        (t && h === 3) || n.add("wood_pallet", o(1.2, 0.022, f), { p: [a(), 0.133, u + a(0.006)], r: [a(0.004), a(0.008), 0] }, r());
      }),
      i)
    ) {
      let u = n.G.mats.label("EUR", { color: "black", font: "sans", distress: 0.6 });
      (n.decal(u, 0.085, { p: [-0.5275, 0.062, 0.5015] }), n.decal(u, 0.085, { p: [0.5275, 0.062, -0.5015], r: [0, Vt, 0] }));
    }
  }
  export function Ok(n, e, t) {
    let i = new Wn(n, "pallet", t);
    return (Ag(i, i.rng, { broken: !!e.broken, bevel: !0 }), i.finish());
  }
  export function Vk(n, e) {
    let t = new Wn(n, "pallet_stack", e.seed || 0),
      i = t.rng,
      s = Di(e.count | 0 || 8, 1, 12);
    for (let o = 0; o < s; o++) {
      let r = o === s - 1;
      (t.push({
        p: [o ? i.range(-0.028, 0.028) : 0, o * 0.144, o ? i.range(-0.022, 0.022) : 0],
        r: [0, i.range(-0.035, 0.035) + (i() < 0.3 ? Vt : 0) + (r ? i.range(-0.06, 0.06) : 0), 0],
      }),
        Ag(t, i, { broken: !r && i() < 0.2, stamp: o % 3 === 0, bevel: r }),
        t.pop());
    }
    return t.finish({ size: [1.2, s * 0.144, 1] });
  }
  export function Tg(n, e, t, i, { detail: s = !0, label: o = "FRAGILE", code: r = "B4-117", skids: a = !0 } = {}) {
    let l = n.rng,
      c = n.G,
      u = 0.022,
      f = 0.07,
      h = a ? 0.07 : 0,
      p = t - h,
      d = h + p / 2,
      m = (R = 1) => {
        let z = l.range(0.7, 1) * R;
        return [z, z * l.range(0.92, 1), z * l.range(0.82, 0.95)];
      },
      x = s ? (R, z, I) => tt(R, z, I, 0.004) : (R, z, I) => ot(R, z, I);
    if (a)
      for (let R of [-(e / 2 - 0.13), 0, e / 2 - 0.13]) n.add("wood_pallet", tt(0.09, h, i - 0.02, 0.006), { p: [R, h / 2, 0] }, m(0.6));
    n.add("wood_dark", ot(e - 2 * u - 0.012, p - u - 0.012, i - 2 * u - 0.012), { p: [0, h + (p - u - 0.012) / 2 + 0.002, 0] }, 0.25);
    let v = Math.max(3, Math.round(p / 0.125)),
      y = p / v;
    for (let R = 0; R < v; R++) {
      let z = h + y * (R + 0.5);
      for (let [I, L, U] of [
        ["pz", e, i / 2 - u],
        ["nz", e, i / 2 - u],
        ["px", i, e / 2 - u],
        ["nx", i, e / 2 - u],
      ]) {
        let k = U - l.range(0, 0.004),
          C = I === "pz" ? [0, z, k] : I === "nz" ? [0, z, -k] : I === "px" ? [k, z, 0] : [-k, z, 0];
        n.add("wood_pallet", Q_(L - 0.03, y - 0.005, l() * 3, l() * 3), { p: C, r: Sg[I] }, m());
      }
    }
    let b = Math.max(3, Math.round(i / 0.13)),
      g = (i - 0.02) / b;
    for (let R = 0; R < b; R++)
      n.add(
        "wood_pallet",
        Q_(e - 0.03, g - 0.005, l() * 3, l() * 3),
        { p: [0, t - u - l.range(0, 0.003), -i / 2 + 0.01 + g * (R + 0.5)], r: [-gt, 0, 0] },
        m(),
      );
    let E = Math.atan2(p - 2 * f, e - 2 * f),
      M = Math.hypot(e - 2 * f, p - 2 * f);
    for (let R of [1, -1]) {
      let z = R * (i / 2 - u / 2);
      (n.add("wood_pallet", x(e, f, u), { p: [0, h + f / 2, z] }, m(0.85)),
        n.add("wood_pallet", x(e, f, u), { p: [0, t - f / 2, z] }, m(0.85)));
      for (let U of [1, -1]) n.add("wood_pallet", x(f, p - 2 * f, u), { p: [U * (e / 2 - f / 2), d, z] }, m(0.85));
      s && n.add("wood_pallet", tt(M, f * 0.85, u * 0.8, 0.004), { p: [0, d, R * (i / 2 - u * 0.6)], r: [0, 0, R * E] }, m(0.8));
      let I = R * (e / 2 - u / 2),
        L = i - 2 * u;
      for (let U of [1, -1]) n.add("wood_pallet", x(u, p, f), { p: [I, d, U * (L / 2 - f / 2)] }, m(0.85));
      (n.add("wood_pallet", x(u, f, L - 2 * f), { p: [I, h + f / 2, 0] }, m(0.85)),
        n.add("wood_pallet", x(u, f, L - 2 * f), { p: [I, t - f / 2, 0] }, m(0.85)),
        n.add("wood_pallet", x(e, u, f), { p: [0, t - u / 2, R * (i / 2 - f / 2)] }, m(0.85)),
        n.add("wood_pallet", x(f, u, i - 2 * f), { p: [R * (e / 2 - f / 2), t - u / 2, 0] }, m(0.85)));
    }
    s && n.add("wood_pallet", tt(f, u, i - 2 * f, 0.004), { p: [0, t - u / 2, 0] }, m(0.85));
    let _ = 0.085,
      T = () => {
        let R = l.range(0.55, 0.9);
        return [R, R * 0.9, R * 0.8];
      };
    for (let R of [1, -1])
      for (let z of [1, -1])
        for (let I of s ? [1, 0] : [1]) {
          let L = I ? t - _ / 2 : h + _ / 2,
            U = T();
          (n.add("steel_galv", ot(_, _, 0.003), { p: [R * (e / 2 - _ / 2), L, z * (i / 2 + 0.0015)] }, U),
            n.add("steel_galv", ot(0.003, _, _), { p: [R * (e / 2 + 0.0015), L, z * (i / 2 - _ / 2)] }, U),
            I && n.add("steel_galv", ot(_, 0.003, _), { p: [R * (e / 2 - _ / 2), t + 0.0015, z * (i / 2 - _ / 2)] }, U));
        }
    let w = i / 2 - u + 0.003,
      S = Math.min(0.11, p * 0.15);
    (o &&
      (n.label(o, { color: "black", font: "stencil", distress: 0.25 }, e * 0.4, S, { p: [-e * 0.2, t - f - S * 0.95, w] }),
      n.label(o, { color: "black", font: "stencil", distress: 0.25 }, e * 0.4, S, { p: [e * 0.2, t - f - S * 0.95, -w], r: [0, Vt, 0] }),
      n.decal(c.mats.decal("arrow"), Math.min(0.14, p * 0.2), { p: [e * 0.27, h + f + p * 0.16, w], r: [0, 0, gt] })),
      r &&
        n.label(r, { color: "black", font: "stencil", distress: 0.3 }, i * 0.5, S * 0.9, {
          p: [e / 2 - u + 0.003, d + p * 0.12, 0],
          r: Sg.px,
        }),
      s && n.decal(c.mats.decal("logo_b"), Math.min(0.2, p * 0.25), { p: [-(e / 2 - u + 0.003), d - p * 0.05, 0], r: Sg.nx }));
  }
  export function Wk(n, e) {
    let t = new Wn(n, "crate_wood", e.seed || 0);
    return (
      Tg(t, 1.1, 1, 0.9, {
        label: e.label === void 0 ? ["FRAGILE", "THIS SIDE UP", "KEEP DRY", "MACHINE PARTS"][t.seed % 4] : e.label,
        code: e.code || "B4-" + [117, 204, 318][t.seed % 3],
      }),
      t.finish()
    );
  }
  export function Gk(n, e) {
    let t = new Wn(n, "crate_stack", e.seed || 0),
      i = t.rng;
    Tg(t, 1.2, 0.95, 1, { label: "HEAVY", code: "SLT 04" + (t.seed % 2) });
    let s = { x: i.range(-0.1, 0.02), z: i.range(-0.05, 0.05), th: (i() < 0.5 ? -1 : 1) * i.range(0.1, 0.16), L: 0.86, W: 0.72 };
    (t.push({ p: [s.x, 0.95, s.z], r: [0, s.th, 0] }),
      Tg(t, s.L, 0.6, s.W, { detail: !1, skids: !1, label: "FRAGILE", code: "B4-204" }),
      t.pop());
    let o = { x: s.x + i.range(-0.05, 0.05), z: s.z + i.range(-0.04, 0.04), th: i.range(-0.12, 0.12) };
    (t.push({ p: [o.x, 1.55, o.z], r: [0, o.th, 0] }), Tg(t, 0.55, 0.35, 0.45, { detail: !1, skids: !1, label: "", code: "" }), t.pop());
    let r = (a, l, c, u, f) => {
      let h = (a - l.x - f * u * Math.sin(c)) / Math.cos(c);
      return l.z - h * Math.sin(c) + f * u * Math.cos(c);
    };
    for (let a of [-0.2, 0.17]) {
      let c = [],
        u = (f) => [
          [a, 0.09, f * 0.506],
          [a, 0.956, f * 0.506],
          [a, 1.556, r(a, s, s.th, s.W / 2, f) + f * 0.006],
          [a, 1.906, r(a, o, o.th, 0.225, f) + f * 0.006],
        ];
      (c.push(...u(1), ...u(-1).reverse()),
        t.add("paint_orange", kr(c, [0.02, 0, 0]), null, [1, 0.8, 0.5]),
        t.add("steel_worn", tt(0.06, 0.09, 0.025, 0.006), { p: [a, 0.62, 0.5 + 0.016] }, 0.8),
        t.add("steel_dark", V0([a - 0.035, 0.66, 0.53], [a + 0.035, 0.66, 0.53], 0.008, 6, !0), null, 0.8));
    }
    return t.finish();
  }
  export function qk(n, e) {
    let t = new Wn(n, "ibc_tote", e.seed || 0),
      i = t.rng,
      s = () => i.range(0.75, 1);
    for (let y of [-0.44, 0, 0.44]) t.add("steel_galv", ot(1.2, 0.028, 0.1), { p: [0, 0.014, y] }, s());
    for (let y of [-0.54, 0, 0.54])
      for (let b of [-0.44, 0, 0.44]) t.add("steel_galv", tt(0.12, 0.074, 0.1, 0.008), { p: [y, 0.065, b] }, s() * 0.85);
    for (let y of [-0.48, 0.48]) t.add("steel_galv", tt(1.2, 0.03, 0.04, 0.006), { p: [0, 0.115, y] }, s());
    for (let y of [-0.58, 0.58]) t.add("steel_galv", tt(0.04, 0.03, 0.92, 0.006), { p: [y, 0.115, 0] }, s());
    t.add("steel_galv", ot(1.12, 0.012, 0.92), { p: [0, 0.124, 0] }, 0.6);
    let o = 1.1,
      r = 0.95,
      a = 0.9,
      l = 0.13 + r / 2,
      c = uo(o, r, a, 0.07, 8, 6, 8);
    (fo(c, (y) => {
      let b = y.x / (o / 2),
        g = y.y / (r / 2),
        E = y.z / (a / 2),
        M = Math.cos(gt * g) * Math.cos(gt * E),
        _ = Math.cos(gt * b) * Math.cos(gt * E),
        T = Math.cos(gt * b) * Math.cos(gt * g);
      (Math.abs(b) > 0.9 && (y.x += Math.sign(b) * (0.016 * M + 0.004 * Math.abs(Math.sin((y.y * Vt) / 0.22)) * M)),
        Math.abs(E) > 0.9 && (y.z += Math.sign(E) * (0.016 * T + 0.004 * Math.abs(Math.sin((y.y * Vt) / 0.22)) * T)),
        g > 0.9 && (y.y += 0.012 * _ - 0.01 * Math.max(0, 1 - Math.hypot(y.x, y.z) / 0.3)));
    }),
      Cr(c));
    let u = 0.13 + r * i.range(0.45, 0.8),
      f = t.seed * 1.3,
      h = t.mat("plastic_grey", { color: 14278096 });
    (t.add(h, c, { p: [0, l, 0] }, (y, b, g) => {
      let E = tw(u - 0.03, u + 0.03, b + 0.02 * O0(y * 3 + f, g * 3)),
        M = 0.9 + 0.1 * O0(y * 6, b * 6 + f, g * 6);
      return [M * (0.52 + 0.48 * E), M * (0.6 + 0.4 * E), M * (0.66 + 0.34 * E)];
    }),
      t.add(h, vt(0.12, 0.125, 0.03, 14), { p: [0, 0.13 + r + 0.005, 0] }, 0.9),
      t.add(
        "plastic_red",
        hs(
          [
            [0.105, 0],
            [0.105, 0.042],
            [0.105, 0.042],
            [0.09, 0.05],
            [0, 0.05],
          ],
          14,
        ),
        { p: [0, 0.13 + r + 0.015, 0] },
        0.9,
      ));
    for (let y = 0; y < 8; y++) {
      let b = (y * Vt) / 4;
      t.add("plastic_red", ot(0.012, 0.04, 0.02), { p: [Math.cos(b) * 0.108, 0.13 + r + 0.036, Math.sin(b) * 0.108], r: [0, -b, 0] }, 0.8);
    }
    let p = 0.575,
      d = 0.475,
      m = 0.13,
      x = 1.1,
      v = 0.011;
    for (let y of [0.2, 0.42, 0.64, 0.86, x]) {
      let b = y === x ? 0.014 : v;
      for (let g of [1, -1])
        (t.add("steel_galv", V0([-p, y, g * d], [p, y, g * d], b, 5), null, s()),
          t.add("steel_galv", V0([g * p, y, -d], [g * p, y, d], b, 5), null, s()));
    }
    for (let y of [1, -1]) {
      for (let b = -0.46; b <= 0.461; b += 0.184)
        t.add("steel_galv", V0([b, m, y * (d - 0.012)], [b, x, y * (d - 0.012)], v, 5), null, s());
      for (let b = -0.36; b <= 0.361; b += 0.18) t.add("steel_galv", V0([y * (p - 0.012), m, b], [y * (p - 0.012), x, b], v, 5), null, s());
      t.add("steel_galv", V0([y * 0.28, x + 0.01, -d], [y * 0.28, x + 0.01, d], 0.013, 5), null, s());
    }
    return (
      t.add("aluminium", tt(0.42, 0.3, 0.004, 0.0015), { p: [-0.1, 0.72, d + 0.014] }, 0.85),
      t.label("IBC 1000 L", { color: "black", font: "sans", distress: 0.2 }, 0.36, 0.06, { p: [-0.1, 0.8, d + 0.0175] }),
      t.decal(n.mats.decal(["hazard_flammable", "hazard_general"][t.seed % 2]), 0.15, { p: [-0.19, 0.67, d + 0.0175] }),
      t.decal(n.mats.decal("numbers_0_9"), 0.2, { p: [0, 0.66, d + 0.0175] }),
      t.decal(n.mats.decal("leak_stain"), 0.3, { p: [p + 0.004, 0.3, 0.02], r: Sg.px }),
      t.add("polymer_black", V0([0.52, 0.2, 0], [0.575, 0.2, 0], 0.05, 10, !0), null, 1),
      t.add("plastic_red", V0([0.575, 0.2, 0], [0.598, 0.2, 0], 0.045, 10, !0), null, 0.9),
      t.add("plastic_red", tt(0.02, 0.022, 0.13, 0.005), { p: [0.55, 0.262, 0.02], r: [0, 0.4, 0] }, 0.9),
      t.add("polymer_black", vt(0.012, 0.012, 0.03, 6), { p: [0.55, 0.245, 0] }),
      t.finish()
    );
  }
  export function ew(n, e, t, i = 0) {
    let s = [],
      o = (2 * n) / e;
    for (let r = 0; r < e; r++) {
      let a = -n + r * o + 0.003,
        l = -n + (r + 1) * o - 0.003,
        c = [a, (a + l) / 2, l],
        u = [],
        f = [],
        h = [],
        p = [],
        d = (y) => Math.sqrt(Math.max(0, n * n - y * y)),
        m = t() * 2,
        x = t() * 2;
      for (let y of c) (u.push(y, -d(y), 0, y, d(y), 0), f.push(0, 0, 1, 0, 0, 1), h.push(-d(y) + m, y + x, d(y) + m, y + x));
      p.push(0, 2, 3, 0, 3, 1, 2, 4, 5, 2, 5, 3);
      let v = new ut.BufferGeometry();
      (v.setAttribute("position", new ut.BufferAttribute(new Float32Array(u), 3)),
        v.setAttribute("normal", new ut.BufferAttribute(new Float32Array(f), 3)),
        v.setAttribute("uv", new ut.BufferAttribute(new Float32Array(h), 2)),
        v.setIndex(p),
        s.push(v));
    }
    return s;
  }
  export function Xk(n, e) {
    let t = new Wn(n, "cable_reel", e.seed || 0),
      i = t.rng,
      s = 0.65,
      o = s,
      r = 0.4,
      a = 0.045,
      l = (y = 1) => {
        let b = i.range(0.7, 1) * y;
        return [b, b * i.range(0.93, 1), b * i.range(0.85, 0.97)];
      },
      c = i.range(-0.5, 0.5);
    t.push({ p: [0, o, 0], r: [0, 0, c] });
    for (let y of [1, -1]) {
      for (let b of ew(s - 0.004, 9, i)) t.add("wood_dark", b, { p: [0, 0, y * (r + i.range(0, 0.003))], r: [0, y > 0 ? 0 : Vt, 0] }, l());
      for (let b of ew(s - 0.004, 9, i)) t.add("wood_dark", b, { p: [0, 0, y * (r - a)], r: [0, y > 0 ? Vt : 0, gt] }, l(0.8));
      (t.add("wood_dark", vt(s, s, a, 24, !0), { p: [0, 0, y * (r - a / 2)], r: [gt, 0, 0] }, l(0.75)),
        t.add("steel_dark", vt(0.105, 0.105, 0.008, 12), { p: [0, 0, y * (r + 0.006)], r: [gt, 0, 0] }, 0.9),
        t.add("polymer_black", vt(0.04, 0.04, 0.004, 10), { p: [0, 0, y * (r + 0.0105)], r: [gt, 0, 0] }, 0.3));
      for (let b = 0; b < 6; b++) {
        let g = (b * Vt) / 3 + 0.3;
        t.add(
          "steel_galv",
          vt(0.017, 0.017, 0.014, 6),
          { p: [Math.cos(g) * 0.3, Math.sin(g) * 0.3, y * (r + 0.006)], r: [gt, 0, 0] },
          i.range(0.5, 0.9),
        );
      }
      (t.label(y > 0 ? "NYY-J 4x95 mm2  500 m" : "SALTLINE TERMINAL", { color: "white", font: "stencil", distress: 0.45 }, 0.7, 0.085, {
        p: [0, 0.4, y * (r + 0.006)],
        r: [0, y > 0 ? 0 : Vt, 0],
      }),
        y > 0 && t.decal(n.mats.decal("arrow"), 0.2, { p: [0.36, -0.2, r + 0.006], r: [0, 0, -1.2] }));
    }
    let u = 16,
      f = r - a,
      h = (2 * f) / u,
      p = 0.47,
      d = [];
    for (let y = 0; y <= u; y++) (d.push([p - 0.017, -f + y * h]), y < u && d.push([p, -f + (y + 0.5) * h]));
    let m = t.seed * 0.7;
    (t.add("rubber", hs(d, 20), { r: [gt, 0, 0] }, (y, b, g) => 0.7 + 0.5 * O0(Math.atan2(b, y) * 2 + m, g * 30)), t.pop());
    let x = 0.2,
      v = [];
    for (let y = 1.9; y >= -0.25; y -= 0.36) v.push([Math.cos(y) * (p + 0.012), o + Math.sin(y) * (p + 0.012), x + (1.9 - y) * 0.02]);
    (v.push(
      [0.53, 0.3, x + 0.05],
      [0.56, 0.08, x + 0.06],
      [0.5, 0.024, x + 0.02],
      [0.3, 0.022, x - 0.1],
      [0.05, 0.022, x - 0.02],
      [-0.2, 0.022, x + 0.06],
      [-0.38, 0.022, x - 0.05],
    ),
      t.add("rubber", bn(v, 0.02, 6, !1, 0.5), null, 0.9),
      t.add("brass", V0([-0.38, 0.022, x - 0.05], [-0.41, 0.022, x - 0.07], 0.014, 6, !0), null, 0.9));
    for (let y of [r - a / 2, -(r - a / 2)])
      (t.add(
        "wood_pallet",
        ko(
          [
            [0.14, 0],
            [0.37, 0],
            [0.37, 0.1],
          ],
          0.1,
          { soft: 0 },
        ),
        { p: [0, 0, y] },
        l(0.8),
      ),
        t.add(
          "wood_pallet",
          ko(
            [
              [-0.37, 0],
              [-0.14, 0],
              [-0.37, 0.1],
            ],
            0.1,
            { soft: 0 },
          ),
          { p: [0, 0, y] },
          l(0.8),
        ));
    return t.finish();
  }
  export function yv(n, e, t, i = 20) {
    let s = n - t,
      o = Math.min(0.011, s * 0.08),
      r = [
        [t, e * 0.18],
        [t + s * 0.45, e * 0.035],
        [n - s * 0.2, e * 0.02],
        [n - s * 0.06, e * 0.07],
        [n, e * 0.17],
        [n, e * 0.17],
        [n, e * 0.355],
        [n - o, e * 0.385],
        [n, e * 0.415],
        [n, e * 0.585],
        [n - o, e * 0.615],
        [n, e * 0.645],
        [n, e * 0.83],
        [n, e * 0.83],
        [n - s * 0.06, e * 0.93],
        [n - s * 0.2, e * 0.98],
        [t + s * 0.45, e * 0.965],
        [t, e * 0.82],
        [t, e * 0.82],
        [t, e * 0.18],
      ],
      a = hs(r, i),
      l = a.attributes.uv,
      c = r.length,
      u = [0];
    for (let m = 1; m < c; m++) u.push(u[m - 1] + Math.hypot(r[m][0] - r[m - 1][0], r[m][1] - r[m - 1][1]));
    let f = (u[8] + u[9]) / 2,
      h = f - u[4],
      p = u[4] - u[0],
      d = Math.max(1, Math.round((2 * Vt * n) / 0.5)) * 0.5;
    for (let m = 0; m < c; m++) {
      let x = m >= c - 2 ? -(h + p) : u[m] - f,
        v = Math.abs(x),
        y = Math.sign(x) * (v <= h + 1e-6 ? (v / h) * 0.126 : 0.126 + Math.min(1, (v - h) / p) * 0.022);
      for (let b = 0; b <= i; b++) l.setXY(m * (i + 1) + b, (b / i) * d, y);
    }
    return a;
  }
  export function Yk(n, e) {
    let t = new Wn(n, "tire_stack", e.seed || 0),
      i = t.rng,
      s = Di(e.count | 0 || 4, 1, 5);
    for (let o = 0; o < s; o++) {
      let r = yv(0.39, 0.25, 0.215, s > 4 ? 16 : 20),
        a = { p: [o ? i.range(-0.022, 0.022) : 0, o * 0.25 - (o ? 0.004 : 0), o ? i.range(-0.022, 0.022) : 0], r: [0, i() * 6, 0] },
        l = i.range(0.75, 1),
        c = o * 3.1;
      t.add("tire", r, a, (u, f, h) => {
        let p = Math.hypot(u - a.p[0], h - a.p[2]);
        return l * (p < 0.23 ? 0.5 : 0.8 + 0.2 * O0(Math.atan2(h, u) * 3 + c, p * 30));
      });
    }
    return t.finish({ size: [0.8, s * 0.25, 0.8] });
  }
  export function $k(n, e, t) {
    let i = new Wn(n, "jerry_can", t),
      [s, o] = Bl(e.color, "olive"),
      r = uo(0.336, 0.36, 0.156, 0.022, 3, 3, 3, "bottom"),
      a = (v, y) => (y > 0.3 && v > 0.04 ? y - (v - 0.04) * 0.5 : y);
    (fo(r, (v) => {
      ((v.y = a(v.x, v.y)), Math.abs(v.z) > 0.07 && Math.abs(v.x) < 0.14 && v.y > 0.04 && v.y < 0.3 && (v.z *= 1.02));
    }),
      r.computeVertexNormals(),
      i.add(s, r, null, o),
      i.add(
        s,
        ko(
          [
            [-0.172, 0],
            [0.172, 0],
            [0.172, 0.297],
            [0.045, 0.364],
            [-0.172, 0.364],
          ],
          0.007,
          { soft: 0 },
        ),
        null,
        typeof o == "number" ? 0.8 : o.map((v) => v * 0.8),
      ));
    let l = 0.24,
      c = 0.2,
      u = -0.025,
      f = 0.165,
      h = Math.hypot(l, c) - 0.02,
      p = Math.atan2(c, l);
    for (let v of [1, -1]) {
      let y = v * 0.079;
      for (let b of [1, -1]) i.add(s, tt(l, 0.016, 0.007, 0.003), { p: [u, f + (b * c) / 2, y] }, o);
      for (let b of [1, -1]) i.add(s, tt(0.016, c, 0.007, 0.003), { p: [u + (b * l) / 2, f, y] }, o);
      for (let b of [1, -1]) i.add(s, tt(h, 0.018, 0.008, 0.003), { p: [u, f, y], r: [0, 0, b * p] }, o);
    }
    for (let v of [-0.042, 0, 0.042])
      i.add(
        s,
        bn(
          [
            [-0.135, 0.35, v],
            [-0.125, 0.42, v],
            [-0.09, 0.44, v],
            [-0.02, 0.44, v],
            [0.01, 0.42, v],
            [0.02, 0.35, v],
          ],
          0.0105,
          5,
          !1,
          0.5,
        ),
        null,
        o,
      );
    let d = [0.1, 0.33, 0],
      m = [0.42, 0.9, 0],
      x = (v) => [d[0] + m[0] * v, d[1] + m[1] * v, 0];
    return (
      i.add(s, V0(x(-0.02), x(0.07), 0.03, 8, !0), null, o),
      i.add("steel_dark", V0(x(0.07), x(0.1), 0.036, 8, !0), null, 0.9),
      i.add("steel_galv", tt(0.07, 0.008, 0.02, 0.002), { p: x(0.108), r: [0, 0, -0.44] }, 0.8),
      i.decal(n.mats.decal("hazard_flammable"), 0.055, { p: [0.125, 0.25, 0.0795] }),
      i.decal(n.mats.decal("hazard_flammable"), 0.055, { p: [-0.125, 0.25, -0.0795], r: [0, Vt, 0] }),
      i.finish()
    );
  }
  export function Zk(n, e, t) {
    let i = new Wn(n, "traffic_cone", t),
      s = i.rng,
      o = t * 4.1;
    e.lying && (i.push({ p: [-0.34, 0.18, 0], r: [0, s() * 6, 0] }), i.push({ r: [0, 0, -gt + 0.16] }));
    let r = (f) => 0.128 + ((0.031 - 0.128) * (f - 0.05)) / (0.685 - 0.05);
    i.add("rubber", tt(0.36, 0.03, 0.36, 0.008, "bottom"), null, 0.9);
    let a = (f, h, p) => {
        let d = O0(Math.atan2(p, f) * 3 + o, h * 14);
        return d > 0.68 ? 0.45 : 0.85 + 0.15 * d;
      },
      l = (f, h, p = [], d = []) => hs([...p, [r(f), f], [r(h), h], ...d], 16),
      c = i.mat("plastic_red", { color: 12734234 }),
      u = i.mat("plastic_grey", { color: 13224386 });
    return (
      i.add(
        c,
        l(0.05, 0.36, [
          [0.165, 0.03],
          [0.15, 0.04],
          [0.136, 0.05],
        ]),
        null,
        a,
      ),
      i.add(u, l(0.36, 0.5), null, (f, h, p) => 0.85 * a(f, h, p)),
      i.add(c, l(0.5, 0.56), null, a),
      i.add(u, l(0.56, 0.61), null, (f, h, p) => 0.85 * a(f, h, p)),
      i.add(
        c,
        l(
          0.61,
          0.685,
          [],
          [
            [0.028, 0.696],
            [0.018, 0.7],
            [0.018, 0.7],
            [0, 0.7],
          ],
        ),
        null,
        a,
      ),
      e.lying && (i.pop(), i.pop()),
      i.finish(e.lying ? { size: [0.72, 0.36, 0.36] } : {})
    );
  }
  export function jk(n, e) {
    let t = new Wn(n, "gas_cylinders", e.seed || 0),
      i = t.rng,
      s = 12,
      o = () => i.range(0.6, 0.9);
    t.add("diamond_plate", tt(0.9, 0.016, 0.5, 0.004, "bottom"), null, 0.8);
    for (let u of [-0.43, 0.43])
      (t.add("steel_dark", tt(0.04, 1.14, 0.04, 0.005), { p: [u, 0.585, -0.225] }, o()),
        t.add("steel_dark", tt(0.036, 0.036, 0.43, 0.005), { p: [u, 1.06, -0.01] }, o()),
        t.add("steel_dark", tt(0.036, 0.036, 0.43, 0.005), { p: [u, 0.3, -0.01] }, o()),
        t.add("steel_dark", tt(0.036, 0.32, 0.036, 0.005), { p: [u, 0.16, 0.19] }, o()),
        t.add("steel_galv", Ul(0.016, 0.004, 4, 8), { p: [u - Math.sign(u) * 0, 1.06, 0.215], r: [0, gt, 0] }, 0.8));
    for (let u of [0.45, 1.06]) t.add("steel_dark", tt(0.9, 0.04, 0.036, 0.005), { p: [0, u, -0.225] }, o());
    (t.add("paint_yellow", tt(0.3, 0.2, 0.004, 0.001), { p: [0, 0.76, -0.245] }, 0.9),
      t.decal(n.mats.decal("hazard_flammable"), 0.15, { p: [0, 0.76, -0.2475], r: [0, Vt, 0] }));
    let r = [
        ["paint_red", 1],
        ["paint_white", 1],
        ["paint_blue", 1],
        ["paint_yellow", 1],
        ["paint_grey", 0.5],
      ],
      a = [
        ["paint_grey", 0.75],
        ["paint_grey", 0.55],
        ["paint_red", [0.55, 0.4, 0.4]],
        ["paint_blue", 0.8],
      ];
    for (let u = 0; u < 3; u++) {
      let f = (u - 1) * 0.272,
        h = 1 - i.range(0, 0.05),
        p = 0.115,
        d = r[(t.seed + u * 2) % r.length],
        m = a[(t.seed + u) % a.length],
        x = u * 5.3 + t.seed,
        v = i() * 6;
      (t.push({ p: [f, 0.016, 0.015 + i.range(-0.01, 0.01)], r: [0, v, 0], s: [1, h, 1] }),
        t.add(
          m[0],
          hs(
            [
              [0, 0.012],
              [0.095, 0.012],
              [0.095, 0.012],
              [0.1, 0],
              [0.111, 0],
              [p, 0.008],
              [p, 0.4],
              [p, 0.8],
              [p, 1.22],
            ],
            s,
          ),
          null,
          (y, b, g) => {
            let E = O0(Math.atan2(g, y) * 3 + x, b * 5),
              M = E > 0.7 ? 0.55 : 1,
              _ = typeof m[1] == "number" ? [m[1], m[1], m[1]] : m[1];
            return [_[0] * M, _[1] * M * (E > 0.7 ? 0.85 : 1), _[2] * M * (E > 0.7 ? 0.7 : 1)];
          },
        ),
        t.add(
          d[0],
          hs(
            [
              [p, 1.22],
              [0.111, 1.285],
              [0.098, 1.34],
              [0.075, 1.385],
              [0.052, 1.41],
              [0.04, 1.42],
            ],
            s,
          ),
          null,
          d[1],
        ),
        t.add(
          "steel_dark",
          hs(
            [
              [0.04, 1.42],
              [0.057, 1.42],
              [0.057, 1.42],
              [0.057, 1.448],
              [0.057, 1.448],
              [0.05, 1.452],
              [0.053, 1.53],
              [0.046, 1.565],
              [0.026, 1.585],
              [0, 1.588],
            ],
            s,
          ),
          null,
          0.8,
        ));
      for (let y of [0, Vt])
        t.add("polymer_black", vt(0.016, 0.016, 0.004, 6), { p: [Math.cos(y) * 0.052, 1.5, Math.sin(y) * 0.052], r: [0, -y, gt] }, 0.2);
      (u !== 1 &&
        t.cdecal(n.mats.decal(u ? "hazard_general" : "hazard_flammable"), p + 0.0015, 0.1, {
          p: [0, 1.08, 0],
          r: [0, i.range(-0.5, 0.5) - v, 0],
        }),
        t.cdecal(
          n.mats.label(["ACETYLENE", "OXYGEN", "ARGON", "PROPANE"][(t.seed + u) % 4], { color: "white", font: "stencil", distress: 0.4 }),
          p + 0.0015,
          0.2,
          { p: [0, 0.86, 0], r: [0, i.range(-0.4, 0.4) - v, 0] },
        ),
        t.pop());
    }
    let l = 19,
      c = (u) => {
        let f = 0.215;
        for (let h = -1; h <= 1; h++) {
          let p = u - h * 0.272;
          Math.abs(p) < 0.115 && (f = Math.max(f, 0.015 + Math.sqrt(0.123 * 0.123 - p * p) + 0));
        }
        return Math.max(f, 0.1);
      };
    for (let u = 0; u < l; u++) {
      let f = u / (l - 1),
        h = -0.425 + 0.85 * f,
        p = Math.max(c(h), c(h - 0.03), c(h + 0.03)) + 0.004,
        d = 1.05 - 0.035 * Math.sin(Vt * ((f * 3) % 1)) - 0.01;
      t.add("steel_galv", Ul(0.017, 0.0045, 3, 6), { p: [h, d, p], r: [u % 2 ? gt : 0.15, 0, 0], s: [1.35, 1, 1] }, i.range(0.6, 0.95));
    }
    return t.finish();
  }
  export function Kk(n, e) {
    let t = new Wn(n, "pipe_stack", e.seed || 0),
      i = t.rng,
      s = 0.1365,
      o = 0.012,
      r = 0.08,
      a = 14,
      l = (f = 1) => {
        let h = i.range(0.6, 0.95) * f;
        return [h, h * 0.95, h * 0.86];
      };
    for (let f of [-2.2, 0, 2.2]) {
      t.add("wood_dark", tt(0.11, r, 1.2, 0.008), { p: [f + i.range(-0.1, 0.1), r / 2, 0], r: [0, i.range(-0.03, 0.03), 0] }, l());
      for (let h of [1, -1])
        t.add(
          "wood_pallet",
          ko(
            h > 0
              ? [
                  [0, 0],
                  [0.158, 0],
                  [0.158, 0.1],
                ]
              : [
                  [-0.158, 0],
                  [0, 0],
                  [-0.158, 0.1],
                ],
            0.1,
            { soft: 0 },
          ),
          { p: [f, r, h * 0.44], r: [0, -gt, 0] },
          l(0.9),
        );
    }
    let c = [4, 3, 2],
      u = 2 * s * Math.sin(Vt / 3);
    c.forEach((f, h) => {
      for (let p = 0; p < f; p++) {
        let d = (p - (f - 1) / 2) * 2 * s,
          m = r + s + h * u,
          x = i.range(5.78, 5.92),
          v = i.range(-3, 3 - x) * 0.999 + 0,
          y = Math.max(-3, Math.min(3 - x, v)) + x / 2,
          b = i() < 0.7 ? "steel_rust" : "steel_dark",
          g = i() * 50,
          E = i.range(0.75, 1),
          M = new ut.CylinderGeometry(s, s, x, a, 4, !0);
        {
          let w = M.attributes.uv,
            S = M.attributes.position;
          for (let R = 0; R < w.count; R++) w.setXY(R, w.getX(R) * 2 * Vt * s, S.getY(R));
        }
        let _ = { p: [y, m, d], r: [i() * 6, 0, gt] };
        t.add(b, M, _, (w, S, R) => E * (0.75 + 0.35 * O0(w * 1.3 + g, R * 9, S * 9)));
        let T = Eg(vt(s - o, s - o, x - 0.002, a, !0));
        t.add(
          "steel_rust",
          T,
          _,
          (w) => 0.16 + 0.5 * tw(x / 2 + Math.abs(y) - 0.9, x / 2 + Math.abs(y) + 0.2, Math.abs(w - y) + Math.abs(y)),
        );
        for (let w of [1, -1])
          t.add(
            b,
            hs(
              w > 0
                ? [
                    [s, 0],
                    [s - o, 0],
                  ]
                : [
                    [s - o, 0],
                    [s, 0],
                  ],
              a,
            ),
            { p: [y + (w * x) / 2, m, d], r: [0, 0, -gt] },
            E * 1.1,
          );
      }
    });
    for (let f of [-1.35, 1.5]) {
      let p = 2 * s,
        d = r + s + 2 * u + s + 0.004,
        m = [],
        x = [
          [-(1.5 * p + s + 0.004), r + s],
          [-(0.5 * p + s * 0.5 + 0.004), r + s + 2 * u + s * 0.87],
          [-0.5 * p, d],
          [0.5 * p, d],
          [0.5 * p + s * 0.5 + 0.004, r + s + 2 * u + s * 0.87],
          [1.5 * p + s + 0.004, r + s],
          [1.5 * p, r - 0.004],
          [-1.5 * p, r - 0.004],
          [-(1.5 * p + s + 0.004), r + s],
        ];
      for (let v of x) m.push([f, v[1], v[0]]);
      (t.add("steel_dark", kr(m, [0.016, 0, 0]), null, 0.7),
        t.add("steel_galv", tt(0.04, 0.012, 0.05, 0.003), { p: [f, d + 0.005, 0.03] }, 0.8));
    }
    return (
      t.cdecal(
        n.mats.label("API 5L X52  273.1 x 12.5  HEAT 40719", { color: "white", font: "stencil", distress: 0.5 }),
        s + 0.002,
        0.2,
        { p: [0.9, r + s + 2 * u, s], r: [-gt + 0.9, 0, gt] },
        1.6,
      ),
      t.finish()
    );
  }
  export function nw(n) {
    (n("barrel", (e, t = {}) => {
      let i = Math.abs(t.seed | 0) % 4;
      return o1(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${i}`, () => Hk(e, t, i));
    }),
      n("pallet", (e, t = {}) => {
        let i = Math.abs(t.seed | 0) % 4;
        return o1(`pallet|${!!t.broken}|${i}`, () => Ok(e, t, i));
      }),
      n("pallet_stack", (e, t = {}) => Vk(e, t)),
      n("crate_wood", (e, t = {}) => Wk(e, t)),
      n("crate_stack", (e, t = {}) => Gk(e, t)),
      n("ibc_tote", (e, t = {}) => qk(e, t)),
      n("cable_reel", (e, t = {}) => Xk(e, t)),
      n("tire_stack", (e, t = {}) => Yk(e, t)),
      n("jerry_can", (e, t = {}) => {
        let i = Math.abs(t.seed | 0) % 2;
        return o1(`jerry|${t.color}|${i}`, () => $k(e, t, i));
      }),
      n("traffic_cone", (e, t = {}) => {
        let i = Math.abs(t.seed | 0) % 3;
        return o1(`cone|${!!t.lying}|${i}`, () => Zk(e, t, i));
      }),
      n("gas_cylinders", (e, t = {}) => jk(e, t)),
      n("pipe_stack", (e, t = {}) => Kk(e, t)));
  }
  export var sw = (n, e, t) => {
    let i = Di((t - n) / (e - n), 0, 1);
    return i * i * (3 - 2 * i);
  };
  export function bv(n, e, t = 0, i = 0) {
    let s = new ut.PlaneGeometry(n, e),
      o = s.attributes.uv,
      r = s.attributes.position;
    for (let a = 0; a < o.count; a++) o.setXY(a, r.getX(a) + t, r.getY(a) + i);
    return s;
  }
  export function Jk(n, e) {
    let t = new Wn(n, "tarp_cargo", e.seed || 0),
      i = t.rng,
      s = t.seed * 1.7,
      o = 0.144,
      r = [
        [-1.06, -0.12, -0.58, 0.58, i.range(0.98, 1.12)],
        [-0.06, 1.06, -0.58, 0.12, i.range(1.32, 1.42)],
        [0.02, 0.62, 0.16, 0.58, i.range(0.72, 0.86)],
        [0.66, 1.06, 0.18, 0.56, i.range(0.5, 0.62)],
      ];
    for (let N of [-0.6, 0.6]) (t.push({ p: [N, 0, 0], r: [0, 0, 0] }), Ag(t, i, { stamp: !1 }), t.pop());
    for (let N of r) {
      let Z = N[1] - N[0],
        Q = N[3] - N[2],
        W = N[4] - o,
        J = (N[0] + N[1]) / 2,
        G = (N[2] + N[3]) / 2,
        te = i.range(0.7, 0.95);
      (t.add("wood_pallet", tt(Z, W, Q, 0.006), { p: [J, o + W / 2, G] }, [te, te * 0.95, te * 0.88]),
        t.add("wood_pallet", ot(Z + 0.012, 0.07, Q + 0.012), { p: [J, o + 0.04, G] }, te * 0.75));
    }
    let a = 1.9,
      l = 22,
      c = 14,
      u = -1.125,
      f = 1.125,
      h = -0.645,
      p = 0.645,
      d = 5,
      m = (N, Z) => {
        let Q = 0.3;
        for (let W of r) {
          let J = Math.max(W[0] - N, 0, N - W[1]),
            G = Math.max(W[2] - Z, 0, Z - W[3]),
            te = Math.hypot(J, G);
          Q = Math.max(Q, W[4] - 0.95 * te - 0.9 * te * te);
        }
        return Q + 0.016 + 0.022 * O0(N * 5 + s, Z * 5) + 0.008 * Math.sin(N * 23 + Z * 7 + s) + 0.006 * Math.sin(Z * 31 - N * 5);
      },
      x = [],
      v = [],
      y = [],
      b = (N, Z) => Z * (l + 1) + N;
    for (let N = 0; N <= c; N++)
      for (let Z = 0; Z <= l; Z++) {
        let Q = u + ((f - u) * Z) / l,
          W = h + ((p - h) * N) / c;
        (x.push(Q, m(Q, W), W), v.push(Q * a, W * a));
      }
    for (let N = 0; N < c; N++)
      for (let Z = 0; Z < l; Z++) {
        let Q = b(Z, N),
          W = b(Z + 1, N),
          J = b(Z + 1, N + 1),
          G = b(Z, N + 1);
        y.push(Q, G, W, W, G, J);
      }
    let g = [];
    for (let N = 0; N < l; N++) g.push([N, 0, 0, -1]);
    for (let N = 0; N < c; N++) g.push([l, N, 1, 0]);
    for (let N = l; N > 0; N--) g.push([N, c, 0, 1]);
    for (let N = c; N > 0; N--) g.push([0, N, -1, 0]);
    let E = g.length,
      M = (l + 1) * (c + 1),
      _ = new Map(),
      T = i() * E;
    g.forEach((N, Z) => {
      _.set(N[0] + "," + N[1], Z);
      let Q = (N[0] === 0 || N[0] === l) && (N[1] === 0 || N[1] === c),
        W = N[2],
        J = N[3];
      Q && ((W = N[0] === 0 ? -0.707 : 0.707), (J = N[1] === 0 ? -0.707 : 0.707));
      let G = b(N[0], N[1]),
        te = x[G * 3],
        oe = x[G * 3 + 1],
        ee = x[G * 3 + 2],
        le = Math.abs(Z - T);
      le = Math.min(le, E - le);
      let xe = 0.17 + 0.07 * Math.sin(Z * 0.55 + s) + 0.07 * O0(Z * 0.31 + s, 2.2) + 0.3 * Math.exp((-le * le) / 14),
        j = i() * 6;
      for (let O = 1; O <= d; O++) {
        let q = O / d,
          ue = oe + (xe - oe) * (0.25 * q + 0.75 * q * q) - (O === 1 ? 0.02 : 0),
          de = (N[0] === 5 || N[0] === 16) && N[2] === 0 ? 0.035 * Math.sin(Math.PI * q) : 0,
          $ = q * (0.04 * Math.sin(Z * 1.7 + j * 0.2) + 0.028 * Math.sin(Z * 0.83 + 1.3 + s)) + 0.02 * q * O0(Z * 0.8, O * 0.9 + s) - de,
          se = (O === 1 ? 0.028 : 0.04 + 0.03 * q) + $ + (Q ? 0.012 * q : 0),
          fe = Di(te + W * se, -1.2, 1.2),
          me = Di(ee + J * se, -0.7, 0.7),
          ge = oe - ue;
        (x.push(fe, ue, me), v.push((te + W * (se + ge)) * a, (ee + J * (se + ge)) * a));
      }
    });
    let w = (N, Z) => (Z === 0 ? b(g[N][0], g[N][1]) : M + N * d + (Z - 1));
    for (let N = 0; N < E; N++)
      for (let Z = 0; Z < d; Z++) {
        let Q = (N + 1) % E,
          W = w(N, Z),
          J = w(Q, Z),
          G = w(Q, Z + 1),
          te = w(N, Z + 1);
        y.push(W, J, te, J, G, te);
      }
    let S = new ut.BufferGeometry();
    (S.setAttribute("position", new ut.BufferAttribute(new Float32Array(x), 3)),
      S.setAttribute("uv", new ut.BufferAttribute(new Float32Array(v), 2)),
      S.setIndex(y),
      S.computeVertexNormals());
    let R = S.attributes.normal,
      z = S.attributes.position,
      I = (N, Z) => [z.getX(N) + R.getX(N) * Z, z.getY(N) + R.getY(N) * Z, z.getZ(N) + R.getZ(N) * Z],
      L = [];
    for (let N of [5, 16]) {
      let Z = [],
        Q = _.get(N + ",0"),
        W = _.get(N + "," + c);
      Z.push([z.getX(w(Q, d)), 0.11, -0.52]);
      for (let J = d; J >= 1; J--) Z.push(I(w(Q, J), 0.007));
      for (let J = 0; J <= c; J++) Z.push(I(b(N, J), 0.007));
      for (let J = 1; J <= d; J++) Z.push(I(w(W, J), 0.007));
      (Z.push([z.getX(w(W, d)), 0.11, 0.52]), L.push(Z));
    }
    let U = 6,
      k = [],
      C = _.get("0," + U),
      A = _.get(l + "," + U);
    k.push([-1.1, 0.1, z.getZ(w(C, d))]);
    for (let N = d; N >= 1; N -= 2) k.push(I(w(C, N), 0.012));
    for (let N = 0; N <= l; N += 2) k.push(I(b(N, U), 0.012));
    for (let N = 1; N <= d; N += 2) k.push(I(w(A, N), 0.012));
    (k.push([1.1, 0.1, z.getZ(w(A, d))]),
      t.add(t.mat("tarp", { doubleSide: !0 }), S, null, (N, Z, Q) => {
        let W = O0(N * 2.3 + s, Z * 2.3, Q * 2.3),
          J = O0(N * 11, Z * 11, Q * 11 + s);
        return (0.72 + 0.28 * W) * (0.9 + 0.1 * J) * (0.8 + 0.2 * sw(0.15, 0.6, Z));
      }));
    for (let N of L) {
      t.add("paint_orange", kr(N, [0.024, 0, 0]), null, [1, 0.82, 0.5]);
      let Z = N[N.length - 4];
      (t.add("steel_worn", tt(0.065, 0.1, 0.03, 0.006), { p: [Z[0], Z[1], Z[2] + 0.014], r: [0.25, 0, 0] }, 0.8),
        t.add("steel_dark", tt(0.02, 0.09, 0.012, 0.003), { p: [Z[0] + 0.03, Z[1] + 0.06, Z[2] + 0.04], r: [0.9, 0, 0] }, 0.8));
    }
    t.add("rope", bn(k, 0.009, 4, !1, 0.5), null, 0.85);
    let F = [2.4, 1.5, 1.4],
      H = Math.max(...r.map((N) => N[4])) + 0.04;
    return t.finish({ size: F, colliders: [{ min: [-1.2, 0, -0.7], max: [1.2, H, 0.7], surface: "dirt" }] });
  }
  export function Qk(n, e, t, i) {
    let s = vv(uo(n, e, t, Math.min(e * 0.46, 0.075), 3, 3, 3), 3),
      o = i() * 9,
      r = i.range(-0.05, 0.05),
      a = i.range(0.4, 1);
    return (
      fo(s, (l) => {
        let c = l.x / (n / 2),
          u = l.z / (t / 2),
          f = l.y / (e / 2),
          h = 1 - 0.22 * Math.pow(Math.abs(c), 2.5);
        ((l.z *= h * (f < 0 ? 1.05 : 1)),
          (l.y = (l.y + e / 2) * (1 - 0.3 * Math.pow(Math.abs(c), 3)) - e / 2),
          f > 0 && (l.y += 0.016 * Math.cos(gt * c) * Math.cos(gt * u)),
          (l.y -= a * 0.018 * Math.abs(c) * Math.abs(c) * (f > -0.9 ? 1 : 0) + r * l.x * 0.3));
        let p = O0(l.x * 9 + o, l.y * 9, l.z * 9 + o) - 0.5;
        ((l.x += p * 0.014), (l.z += p * 0.016), f > -0.9 && (l.y += p * 0.014));
      }),
      Cr(s)
    );
  }
  export function eP(n, e) {
    let t = new Wn(n, "sandbags", e.seed || 0),
      i = t.rng,
      s = 0.18,
      o = Di(e.courses | 0 || 5, 1, 7),
      r = t.mat(iw[0], iw[1]),
      a = (l, c, u, f) => {
        let h = s * i.range(1.02, 1.12),
          p = i() < 0.3 ? i.range(0.55, 0.75) : i.range(0.82, 1),
          d = i() * 30,
          m = {
            p: [u[0] + i.range(-0.012, 0.012), u[1] + h / 2 - 0.004, u[2] + i.range(-0.012, 0.012)],
            r: [i.range(-0.03, 0.03), f + i.range(-0.06, 0.06), 0],
          };
        t.add(r, Qk(l, h, c, i), m, (x, v, y) => {
          let b = O0(x * 7 + d, v * 7, y * 7);
          return [p * (0.85 + 0.15 * b), p * (0.84 + 0.15 * b), p * (0.8 + 0.16 * b)];
        });
        for (let x of [1, -1])
          t.add(
            r,
            kr(
              [
                [x * (l / 2 - 0.004), i.range(-0.008, 0.008), -c * 0.27],
                [x * (l / 2 - 0.002), i.range(-0.008, 0.008), c * 0.27],
              ],
              [x * 0.009, 0.001, 0],
            ),
            m,
            p * 0.9,
          );
      };
    for (let l = 0; l < o; l++) {
      let c = l * s,
        u = l === o - 1;
      if (l % 2 === 0)
        for (let f = 0; f < 3; f++)
          for (let h of [1, -1]) (u && f === 2 && h === 1 && o > 2) || a(0.655, 0.3, [(f - 1) * 0.655, c, h * 0.148], 0);
      else for (let f = 0; f < 5; f++) (u && f === 0 && o > 2) || a(0.585, 0.385, [(f - 2) * 0.392, c, 0], gt);
    }
    return t.finish({ size: [2, o * s, 0.6], surface: "dirt" });
  }
  export var iw = ["glove_fabric", { color: 9207134 }];
  export function ah(n, e, t, i, s, { crush: o = 0, damp: r = 0.3, open: a = !1, tape: l = !0, label: c = "", arrow: u = !1, tint: f = 1 } = {}) {
    let h = n.rng,
      p = n.G,
      d = h() * 40;
    n.push(s);
    let m = (M) => {
        if (!o) return;
        let _ = Di(M.y / t, 0, 1),
          T = _ * _;
        ((M.y -= o * t * 0.32 * T * (0.55 + 0.45 * Math.cos(((Vt * M.x) / e) * 0.9 + 0.5)) * (0.8 + 0.2 * Math.cos((Vt * M.z) / i))),
          (M.z *= 1 + 0.1 * o * Math.sin(Vt * _)),
          (M.x += 0.12 * o * t * _ + 0.02 * o * Math.sin(Vt * _) * Math.sign(M.x)));
      },
      x = uo(e, t, i, 0.007, 4, 5, 4, "bottom");
    (a && vv(x, 2), o && (fo(x, m), Cr(x)));
    let v = r * t,
      y = (M, _, T) => {
        let w = O0(M * 6 + d, _ * 3, T * 6 + d),
          S = sw(v - 0.03, v + 0.04, _ + 0.08 * (w - 0.5)),
          R = (0.86 + 0.14 * O0(M * 13, _ * 13 + d, T * 13)) * f;
        return [R * (0.5 + 0.5 * S), R * (0.47 + 0.53 * S), R * (0.42 + 0.58 * S)];
      };
    {
      let M = x.attributes.position,
        _ = new Float32Array(M.count * 3);
      for (let T = 0; T < M.count; T++) {
        let w = y(M.getX(T), M.getY(T), M.getZ(T));
        ((_[T * 3] = w[0]), (_[T * 3 + 1] = w[1]), (_[T * 3 + 2] = w[2]));
      }
      x.setAttribute("color", new ut.BufferAttribute(_, 3));
    }
    n.add("cardboard", x);
    let b = 0.0025;
    if (a) {
      let M = Math.min(0.16, t * 0.6);
      n.add("cardboard", bv(e - 0.012, i - 0.012), { p: [0, t - M, 0], r: [-gt, 0, 0] }, 0.45 * f);
      for (let [T, w, S] of [
        [0, e, i / 2],
        [Vt, e, i / 2],
        [gt, i, e / 2],
        [-gt, i, e / 2],
      ])
        n.add(
          "cardboard",
          Eg(bv(w - 0.012, M)),
          { p: [Math.sin(T) * (S - 0.006), t - M / 2, Math.cos(T) * (S - 0.006)], r: [0, T, 0] },
          0.55 * f,
        );
      let _ = (T, w, S) => {
        let R = Math.sin(S),
          z = Math.cos(S);
        return [T, w, R, z];
      };
      for (let T of [1, -1]) {
        let w = h.range(0.3, 1.9),
          S = i / 2 - 0.01;
        n.add(
          "cardboard",
          kr(
            [
              [0, t, (T * i) / 2],
              [0, t + Math.sin(w) * S * 0.5, T * (i / 2 + Math.cos(w) * S * 0.5)],
              [0, t + Math.sin(w) * S, T * (i / 2 + Math.cos(w) * S + 0.01)],
            ],
            [e / 2 - 0.004, 0, 0],
          ),
          null,
          0.9 * f,
        );
      }
      for (let T of [1, -1]) {
        let w = h.range(0.9, 2.3),
          S = i / 2 - 0.02;
        n.add(
          "cardboard",
          kr(
            [
              [(T * e) / 2, t, 0],
              [T * (e / 2 + Math.cos(w) * S), t + Math.sin(w) * S, 0],
            ],
            [0, 0, i / 2 - 0.004],
          ),
          null,
          0.82 * f,
        );
      }
    } else if (l) {
      let _ = [];
      _.push([-e / 2 - b, t - 0.075, 0]);
      for (let w = 0; w <= 8; w++) _.push([(-0.5 + w / 8) * (e + 2 * b), t + b, 0]);
      _.push([e / 2 + b, t - 0.075, 0]);
      let T = new ut.Vector3();
      for (let w of _) (T.set(w[0], w[1], w[2]), m(T), (w[0] = T.x), (w[1] = T.y + (o ? 0.004 : 0)), (w[2] = T.z));
      n.add("polymer_tan", kr(_, [0, 0, 0.025], !1), null, 0.9);
    }
    let g = i / 2 + b,
      E = Math.min(0.055, t * 0.2);
    if (
      (c &&
        !o &&
        (n.label(c, { color: "black", font: "sans", distress: 0.3 }, e * 0.6, E, { p: [-e * 0.1, t * 0.62, g] }),
        n.add("paint_white", bv(0.11, 0.075), { p: [e * 0.26, t * 0.3, g - 0.001] }, 0.9, { cast: !1 }),
        n.decal(p.mats.decal("numbers_0_9"), 0.095, { p: [e * 0.26, t * 0.3, g + 6e-4] })),
      u && !o)
    )
      for (let M of [1, -1])
        n.decal(p.mats.decal("arrow"), Math.min(0.09, t * 0.3), { p: [M * (e / 2 + b), t * 0.55, M * i * 0.2], r: [0, M * gt, gt] });
    n.pop();
  }
  export function tP(n, e) {
    let t = new Wn(n, "cardboard_boxes", e.seed || 0),
      i = t.rng,
      s = () => i.range(-0.015, 0.015),
      o = () => i.range(0.82, 1);
    return (
      ah(
        t,
        0.5,
        0.38,
        0.44,
        { p: [-0.23 + s(), 0, -0.16 + s()], r: [0, i.range(-0.05, 0.05), 0] },
        { damp: 0.45, label: "FRAGILE", arrow: !0, tint: o() },
      ),
      ah(
        t,
        0.42,
        0.33,
        0.4,
        { p: [0.26 + s(), 0, -0.17 + s()], r: [0, i.range(-0.08, 0.08), 0] },
        { damp: 0.5, label: "KEEP DRY", tint: o() },
      ),
      ah(
        t,
        0.46,
        0.28,
        0.4,
        { p: [-0.24 + s(), 0.38, -0.15 + s()], r: [0, i.range(-0.2, 0.2), 0] },
        { crush: 1, damp: 0.75, tint: o() * 0.92 },
      ),
      ah(
        t,
        0.33,
        0.26,
        0.32,
        { p: [0.27 + s(), 0.33, -0.18 + s()], r: [0, i.range(-0.3, 0.3), 0] },
        { open: !0, damp: 0.1, label: "", arrow: !0, tint: o() },
      ),
      ah(
        t,
        0.3,
        0.16,
        0.24,
        { p: [-0.26 + s(), 0.565, -0.16 + s()], r: [0.03, i.range(-0.5, 0.5), -0.09] },
        { damp: 0.2, label: "HX-2291", tint: o() },
      ),
      ah(
        t,
        0.36,
        0.26,
        0.3,
        { p: [0.06 + s(), 0.105, 0.2], r: [0.62, i.range(-0.25, 0.25), 0] },
        { damp: 0.9, crush: 0.25, tint: o() * 0.85 },
      ),
      t.finish()
    );
  }
  export function ow(n) {
    (n("tarp_cargo", (e, t = {}) => Jk(e, t)), n("sandbags", (e, t = {}) => eP(e, t)), n("cardboard_boxes", (e, t = {}) => tP(e, t)));
  }
  export var rw = new ut.Quaternion(),
    nP = new ut.Vector3(0, 1, 0),
    Rg = new ut.Vector3(),
    aw = new ut.Matrix4();
  export function ea(n, e, t, i, s = 0.006, o = !1) {
    Rg.set(e[0] - n[0], e[1] - n[1], e[2] - n[2]);
    let r = Rg.length();
    Rg.normalize();
    let a = o ? ot(t, r, i) : tt(t, r, i, s);
    return (
      rw.setFromUnitVectors(nP, Rg),
      aw.compose(new ut.Vector3((n[0] + e[0]) / 2, (n[1] + e[1]) / 2, (n[2] + e[2]) / 2), rw, new ut.Vector3(1, 1, 1)),
      a.applyMatrix4(aw),
      a
    );
  }
  export var iP = (n) => {
    let e = 0;
    for (let t = 0; t < n.length; t++) {
      let i = n[t],
        s = n[(t + 1) % n.length];
      e += i[0] * s[1] - s[0] * i[1];
    }
    return e < 0 ? n.slice().reverse() : n;
  };
  export function lw(n, e, t, i, s, o, r, a, l, c) {
    let u = yv(t, i, r, a);
    (n.push({ p: [e, t, o > 0 ? s - i / 2 : -(s - i / 2)], r: [o > 0 ? gt : -gt, 0, 0] }), n.push({ r: [0, c() * 6, 0] }));
    let f = c() * 20;
    n.add("tire", u, null, (p, d, m) => {
      let x = Math.hypot(p, m);
      return x < r + 0.01 ? 0.45 : 0.78 + 0.22 * O0(Math.atan2(m, p) * 3 + f, x * 30);
    });
    let h = i * 0.8;
    (n.add(
      "paint_yellow",
      hs(
        [
          [r + 0.006, h + 0.012],
          [r - 0.012, h + 0.016],
          [r - 0.03, h - 0.02],
          [r * 0.62, h - 0.05],
          [r * 0.5, h - 0.02],
          [r * 0.42, h - 0.012],
          [0, h - 0.012],
        ],
        14,
      ),
      null,
      (p, d, m) => (Math.hypot(p, m) > r * 0.7 ? [0.55, 0.5, 0.42] : [0.8, 0.78, 0.7]),
    ),
      n.add(
        "steel_dark",
        hs(
          [
            [0, i * 0.2],
            [r + 0.004, i * 0.2],
          ],
          10,
        ),
        null,
        0.4,
      ),
      n.add("steel_dark", vt(r * 0.2, r * 0.24, 0.035, 8), { p: [0, h, 0] }, 0.7));
    for (let p = 0; p < 6; p++) {
      let d = (p * Vt) / 3;
      n.add(
        "steel_galv",
        vt(0.011, 0.012, 0.016, 6),
        { p: [Math.cos(d) * r * 0.33, h - 0.006, Math.sin(d) * r * 0.33] },
        c.range(0.5, 0.8),
      );
    }
    (n.pop(), n.pop());
  }
  export function sP(n, e) {
    let t = new Wn(n, "forklift", e.seed || 0),
      i = t.rng,
      s = Di(+e.forksUp || 0, 0, 1),
      o = s * 1.5,
      r = o / 2,
      [a, l] = Bl(e.color, "yellow"),
      c = (Q = 1) => (typeof l == "number" ? l * Q : l.map((W) => W * Q)),
      u = "steel_dark",
      f = () => i.range(0.68, 0.95),
      h = e.number || ["04", "07", "12", "22"][t.seed % 4],
      p = 0.33,
      d = 0.23,
      m = 0.22,
      x = 0.47,
      v = 0.27,
      y = 0.18,
      b = -1.1,
      g = 0.46;
    for (let Q of [1, -1]) (lw(t, m, p, d, x, Q, 0.195, 24, 0, i), lw(t, b, v, y, g, Q, 0.155, 20, 0, i));
    (t.add(u, V0([m, p, -0.4], [m, p, 0.4], 0.07, 8), null, 0.5),
      t.add(u, tt(0.12, 0.1, 0.78, 0.01), { p: [b, v, 0] }, 0.5),
      t.add(u, tt(1.95, 0.34, 0.68, 0.02), { p: [-0.425, 0.37, 0] }, 0.55));
    for (let Q of [1, -1]) {
      (t.add(a, tt(0.6, 0.3, 0.17, 0.02), { p: [-0.47, 0.4, Q * 0.42] }, c(0.92)),
        t.add("diamond_plate", tt(0.3, 0.012, 0.16, 0.003), { p: [-0.32, 0.556, Q * 0.42] }, 0.7),
        t.add(u, vt(0.03, 0.03, 0.02, 8), { p: [-0.62, 0.56, Q * 0.42] }, 0.6));
      let W = [],
        J = p + 0.035,
        G = p + 0.06;
      for (let te = 0; te <= 7; te++) {
        let oe = 0.12 + ((Vt - 0.5) * te) / 7;
        W.push([m + Math.cos(oe) * G, p + Math.sin(oe) * G]);
      }
      for (let te = 7; te >= 0; te--) {
        let oe = 0.12 + ((Vt - 0.5) * te) / 7;
        W.push([m + Math.cos(oe) * J, p + Math.sin(oe) * J]);
      }
      t.add(a, ko(W, 0.27, { soft: 0.7 }), { p: [0, 0, Q * 0.475] }, c(0.95));
    }
    t.add("diamond_plate", ot(0.66, 0.016, 0.68), { p: [0.2, 0.548, 0] }, 0.6);
    for (let Q of [-0.12, 0.1]) t.add("rubber", tt(0.1, 0.02, 0.07, 0.006), { p: [0.33, 0.6, Q], r: [0, 0, 0.5] }, 0.8);
    let E = uo(0.62, 0.63, 1.12, 0.12, 3, 3, 3);
    (fo(E, (Q) => {
      if (Q.y > 0.1) {
        let W = (Q.y - 0.1) / 0.215;
        Q.x += 0.03 * W * (Q.x < 0 ? 1 : 0);
      }
    }),
      t.add(a, Cr(E), { p: [-1.39, 0.915, 0] }, c(0.97)),
      t.add(a, tt(0.56, 0.37, 0.64, 0.05), { p: [-1.4, 0.43, 0] }, c(0.85)),
      t.add("hazard_stripes", tt(0.014, 0.085, 0.84, 0.004), { p: [-1.702, 0.77, 0] }, 0.95),
      t.label(h, { color: "black", font: "stencil", distress: 0.35 }, 0.4, 0.2, { p: [-1.703, 0.96, 0], r: [0, -gt, 0] }));
    for (let Q of [1, -1])
      (t.add(n.mats.emissive(16722450, 0.16), tt(0.012, 0.05, 0.11, 0.004), { p: [-1.69, 1.1, Q * 0.37] }, 1, { raw: !0 }),
        t.add(u, tt(0.016, 0.066, 0.126, 0.004), { p: [-1.684, 1.1, Q * 0.37] }, 0.4),
        t.label("SALTLINE", { color: "black", font: "sans", distress: 0.3 }, 0.42, 0.085, {
          p: [-1.39, 0.99, Q * 0.5625],
          r: [0, Q > 0 ? 0 : Vt, 0],
        }),
        t.add(u, tt(0.06, 0.05, 0.02, 0.004), { p: [-1.67, 0.44, Q * 0.05] }, 0.5));
    (t.add("steel_worn", vt(0.02, 0.02, 0.13, 8), { p: [-1.68, 0.44, 0] }, 0.7),
      t.add(a, tt(0.98, 0.46, 0.94, 0.04), { p: [-0.59, 0.79, 0] }, c()));
    for (let Q of [1, -1]) {
      (t.label(h, { color: "black", font: "stencil", distress: 0.35 }, 0.3, 0.19, {
        p: [-0.84, 0.8, Q * 0.4715],
        r: [0, Q > 0 ? 0 : Vt, 0],
      }),
        t.add(u, ot(0.34, 0.2, 0.004), { p: [-0.36, 0.8, Q * 0.47] }, 0.2));
      for (let W = 0; W < 5; W++) t.add(a, ot(0.34, 0.03, 0.006), { p: [-0.36, 0.72 + W * 0.04, Q * 0.474], r: [Q * 0.5, 0, 0] }, c(0.85));
    }
    t.add(u, tt(0.4, 0.05, 0.4, 0.01), { p: [-0.54, 1.045, 0] }, 0.5);
    let M = uo(0.46, 0.1, 0.46, 0.04, 3, 3, 3);
    (fo(M, (Q) => {
      Q.y > 0 && (Q.y -= 0.018 * Math.cos(Q.x * 5) * Math.cos(Q.z * 5));
    }),
      t.add("rubber", Cr(M), { p: [-0.53, 1.115, 0] }, 1));
    let _ = uo(0.1, 0.5, 0.44, 0.04, 3, 4, 3);
    (fo(_, (Q) => {
      Q.x > 0 && (Q.x -= 0.02 * Math.cos(Q.z * 5.5));
    }),
      t.add("rubber", Cr(_), { p: [-0.8, 1.39, 0], r: [0, 0, 0.16] }, 1));
    for (let Q of [1, -1]) t.add(u, ea([-0.78, 1.08, Q * 0.24], [-0.82, 1.3, Q * 0.24], 0.03, 0.012, 0.004), null, 0.5);
    t.add(
      a,
      ko(
        [
          [0.2, 0.55],
          [0.54, 0.55],
          [0.54, 1],
          [0.46, 1.12],
          [0.3, 1.14],
          [0.21, 1.02],
        ],
        0.7,
        { soft: 0.5 },
      ),
      null,
      c(),
    );
    let T = Math.atan2(0.12, 0.09);
    (t.push({ p: [0.253, 1.082, 0], r: [0, 0, T] }),
      t.add(u, tt(0.012, 0.13, 0.44, 0.004), { p: [-0.006, 0, 0] }, 0.45),
      t.add(n.mats.emissive(9429168, 0.3), i1(0.09, 0.05), { p: [-0.0135, 0.01, 0.1], r: [0, -gt, 0] }, 1, { raw: !0, cast: !1 }),
      t.decal(n.mats.decal("csc_plate"), 0.09, { p: [-0.0135, 0, -0.12], r: [0, -gt, 0] }),
      t.add("plastic_red", vt(0.016, 0.016, 0.02, 8), { p: [-0.02, 0, 0.19], r: [0, 0, gt] }, 0.9),
      t.add("steel_bare", vt(0.009, 0.009, 0.02, 6), { p: [-0.018, -0.03, -0.01], r: [0, 0, gt] }, 0.9),
      t.pop());
    let w = [0.3, 1.1, 0.04],
      S = [0.1, 1.31, 0.04];
    (t.add(u, V0(w, S, 0.024, 8), null, 0.5),
      t.push({ p: S, r: [0, 0, Math.atan2(S[1] - w[1], S[0] - w[0])] }),
      t.add("rubber", Ul(0.165, 0.014, 6, 18), { r: [0, gt, 0] }, 1));
    for (let Q = 0; Q < 3; Q++) {
      let W = (Q * Vt * 2) / 3 + 0.5;
      t.add(u, V0([-0.01, 0, 0], [0, Math.cos(W) * 0.16, Math.sin(W) * 0.16], 0.009, 5), null, 0.5);
    }
    (t.add(u, vt(0.035, 0.04, 0.03, 10), { p: [-0.005, 0, 0], r: [0, 0, gt] }, 0.5),
      t.add("rubber", vt(0.016, 0.014, 0.045, 8), { p: [0.03, 0.16, 0.02], r: [0, 0, gt] }, 1),
      t.pop());
    for (let Q = 0; Q < 3; Q++) {
      let W = -0.2 - Q * 0.055,
        J = [0.33, 1.12, W],
        G = [0.25 - Q * 0.012, 1.3 - Q * 0.01, W - 0.01];
      (t.add("steel_bare", V0(J, G, 0.007, 5), null, 0.8), t.add("rubber", J_(0.02, 7, 5), { p: G }, 1));
    }
    {
      let Q = [0.3, 1.1, 0.27],
        W = [0.2, 1.24, 0.29];
      (t.add("steel_bare", V0(Q, W, 0.008, 5), null, 0.8), t.add("plastic_red", vt(0.016, 0.016, 0.07, 7), { p: W, r: [0, 0, 0.6] }, 0.9));
    }
    let R = 2.045,
      z = [];
    for (let Q of [1, -1]) {
      let W = [0.47, 1.08, Q * 0.4],
        J = [0.27, R, Q * 0.46],
        G = [-1, 1, Q * 0.44],
        te = [-0.95, R, Q * 0.46];
      (t.add(u, ea(W, J, 0.06, 0.05, 0.01), null, f()),
        t.add(u, ea(G, te, 0.06, 0.05, 0.01), null, f()),
        t.add(u, ea([0.3, R, Q * 0.46], [-0.98, R, Q * 0.46], 0.05, 0.06, 0.01), null, f()),
        t.add(u, tt(0.09, 0.012, 0.08, 0.003), { p: [0.47, 1.085, Q * 0.4] }, 0.5),
        t.add(u, tt(0.09, 0.012, 0.08, 0.003), { p: [-1, 1.024, Q * 0.44] }, 0.5));
      let oe = 0.36,
        ee = 1.66;
      (t.add(u, uo(0.085, 0.1, 0.13, 0.02, 3, 3, 3), { p: [oe + 0.045, ee, Q * 0.47] }, 0.45),
        t.add(n.mats.emissive(16773330, 0.7), tt(0.006, 0.075, 0.105, 0.002), { p: [oe + 0.089, ee, Q * 0.47] }, 1, { raw: !0 }),
        t.add(u, V0([0.385, 1.5, Q * 0.42], [0.42, 1.52, Q * 0.57], 0.008, 5), null, 0.5),
        t.add(u, tt(0.022, 0.17, 0.1, 0.006), { p: [0.42, 1.52, Q * 0.573], r: [0, Q * 0.25, 0] }, 0.5),
        t.add("steel_bare", ot(0.002, 0.15, 0.084), { p: [0.408, 1.52, Q * 0.57], r: [0, Q * 0.25, 0] }, 1),
        z.push(
          { min: [-1.03, 1, Q > 0 ? 0.41 : -0.5], max: [-0.92, R, Q > 0 ? 0.5 : -0.41], surface: "metal" },
          { min: [0.24, 1.08, Q > 0 ? 0.37 : -0.5], max: [0.5, R, Q > 0 ? 0.5 : -0.37], surface: "metal" },
        ));
    }
    for (let Q of [0.28, -0.96]) t.add(u, tt(0.05, 0.06, 0.92, 0.01), { p: [Q, R, 0] }, f());
    for (let Q = 0; Q < 8; Q++) t.add(u, tt(0.03, 0.028, 0.9, 0.006), { p: [-0.83 + Q * 0.139, R + 0.012, 0] }, f());
    (t.add(
      u,
      bn(
        [
          [0.44, 1.2, 0.44],
          [0.47, 1.25, 0.49],
          [0.41, 1.55, 0.5],
          [0.36, 1.6, 0.455],
        ],
        0.011,
        5,
        !1,
        0.5,
      ),
      null,
      0.5,
    ),
      t.add(u, vt(0.045, 0.05, 0.03, 10), { p: [-0.86, R + 0.045, 0.3] }, 0.5),
      t.add(
        n.mats.emissive(16747026, 0.9),
        hs(
          [
            [0.04, 0],
            [0.04, 0.06],
            [0.03, 0.082],
            [0, 0.09],
          ],
          10,
        ),
        { p: [-0.86, R + 0.06, 0.3] },
        1,
        { raw: !0 },
      ));
    let I = -1.4,
      L = 1.23 + 0.05 + 0.155;
    for (let Q of [-0.2, 0.2])
      (t.add(u, tt(0.3, 0.07, 0.04, 0.008), { p: [I, 1.262, Q] }, 0.5),
        t.add(u, vt(0.159, 0.159, 0.035, 16, !0), { p: [I, L, Q], r: [gt, 0, 0] }, 0.35));
    (t.add(
      "steel_galv",
      hs(
        [
          [0, -0.37],
          [0.08, -0.36],
          [0.132, -0.33],
          [0.155, -0.27],
          [0.155, 0.27],
          [0.132, 0.33],
          [0.08, 0.36],
          [0, 0.37],
        ],
        16,
      ),
      { p: [I, L, 0], r: [gt, 0, 0] },
      (Q, W, J) => 0.8 + 0.2 * O0(Q * 8, W * 8, J * 8),
    ),
      t.add("steel_galv", vt(0.09, 0.09, 0.07, 12, !0), { p: [I, L, 0.39], r: [gt, 0, 0] }, 0.7),
      t.add("steel_galv", vt(0.02, 0.02, 0.05, 8), { p: [I, L, 0.39], r: [gt, 0, 0] }, 0.9),
      t.add(
        "rubber",
        bn(
          [
            [I, L, 0.41],
            [I + 0.05, L - 0.02, 0.46],
            [I + 0.2, L - 0.15, 0.44],
            [-1.07, 1.1, 0.38],
            [-1, 0.98, 0.36],
          ],
          0.012,
          5,
          !1,
          0.5,
        ),
        null,
        1,
      ),
      t.push({ p: [I, L, 0], r: [0, 0, 0.7] }),
      t.cdecal(n.mats.decal("hazard_flammable"), 0.157, 0.12, { p: [0, 0, -0.05], r: [-gt, 0, 0] }),
      t.cdecal(n.mats.label("LPG", { color: "red", font: "stencil", distress: 0.3 }), 0.157, 0.16, { p: [0, 0, 0.14], r: [-gt, 0, 0] }),
      t.pop());
    let U = 0.6,
      k = 0.73,
      C = 0.375,
      A = 0.08,
      F = 2.02;
    for (let Q of [1, -1]) {
      let W = Q * C,
        J = [
          [U, W],
          [k, W],
          [k, W - Q * 0.065],
          [k - 0.014, W - Q * 0.065],
          [k - 0.014, W - Q * 0.014],
          [U + 0.014, W - Q * 0.014],
          [U + 0.014, W - Q * 0.065],
          [U, W - Q * 0.065],
        ];
      (t.add(u, ko(iP(J.map((q) => [q[0], -q[1]])), F - A, { soft: 0 }), { p: [0, (A + F) / 2, 0], r: [-gt, 0, 0] }, f()),
        t.add(u, tt(0.085, 1.86, 0.036, 0.006), { p: [0.665, 0.13 + r + 0.93, Q * 0.335] }, f() * 1.25),
        t.decal(n.mats.decal("hazard_general"), 0.1, { p: [0.665, 1.3, Q * (C + 0.002)], r: [0, Q > 0 ? 0 : Vt, 0] }));
      let G = [0.36, 0.66, Q * 0.3],
        te = [0.6, 0.86, Q * 0.33],
        oe = [0.5, 0.777, Q * 0.317];
      (t.add(u, V0(G, oe, 0.034, 8, !0), null, 0.55), t.add("steel_bare", V0(oe, te, 0.018, 6), null, 1));
      let ee = Q * 0.13,
        le = 1.9 + r,
        xe = 0.055,
        j = [
          [0.725, 0.5 + o, ee],
          [0.725, le, ee],
        ];
      for (let q = 0.5; q < Vt; q += 0.55) j.push([0.67 + Math.cos(q) * xe, le + Math.sin(q) * xe, ee]);
      j.push([0.615, le, ee], [0.615, 1, ee]);
      let O = 0;
      for (let q = 0; q < j.length - 1; q++) {
        let ue = j[q],
          de = j[q + 1],
          $ = Math.hypot(de[0] - ue[0], de[1] - ue[1]),
          se = Math.max(1, Math.round($ / 0.058));
        for (let fe = 0; fe < se; fe++, O++) {
          let me = fe / se,
            ge = (fe + 0.86) / se,
            ce = (P) => [ue[0] + (de[0] - ue[0]) * P, ue[1] + (de[1] - ue[1]) * P, ee];
          t.add("steel_worn", ea(ce(me), ce(ge), 0.011, O % 2 ? 0.034 : 0.022, 0, !0), null, O % 2 ? 0.55 : 0.75);
        }
      }
      t.add(u, vt(xe - 0.006, xe - 0.006, 0.04, 12), { p: [0.67, le, ee], r: [gt, 0, 0] }, 0.7);
    }
    (t.add(u, tt(0.04, 0.09, 0.78, 0.008), { p: [U - 0.012, 1.96, 0] }, f()),
      t.add(u, tt(0.04, 0.12, 0.78, 0.008), { p: [U - 0.012, 0.42, 0] }, f()),
      t.add(u, tt(0.07, 0.09, 0.66, 0.008), { p: [0.665, 1.99 + r, 0] }, f()),
      t.add(u, vt(0.048, 0.048, 1.15, 10), { p: [0.645, 0.72, 0] }, 0.6),
      t.add(u, vt(0.055, 0.055, 0.05, 10), { p: [0.645, 1.3, 0] }, 0.5),
      t.add("steel_bare", vt(0.027, 0.027, 0.64 + r, 8, !0), { p: [0.645, 1.31 + (0.64 + r) / 2, 0] }, 1),
      t.label("MAX 2500 kg", { color: "yellow", font: "stencil", distress: 0.3 }, 0.5, 0.05, { p: [U - 0.033, 0.42, 0], r: [0, -gt, 0] }));
    for (let Q of [0.21, 0.245])
      t.add(
        "rubber",
        bn(
          [
            [0.6, 1.25, Q],
            [0.59, 1.65 + r * 0.6, Q],
            [0.655, 1.86 + r, Q + 0.005],
            [0.735, 1.6 + r * 1.2, Q],
            [0.74, 0.56 + o, Q],
          ],
          0.011,
          5,
          !1,
          0.5,
        ),
        null,
        1,
      );
    t.push({ p: [0, o, 0] });
    let H = 0.06;
    for (let Q of [H + 0.12, H + 0.5]) t.add(u, tt(0.04, 0.1, 1.02, 0.008), { p: [0.755, Q, 0] }, f());
    t.add("hazard_stripes", ot(0.003, 0.06, 0.4), { p: [0.7765, H + 0.5, 0] }, 0.9);
    for (let Q of [1, -1])
      (t.add(u, tt(0.03, 0.5, 0.06, 0.006), { p: [0.745, H + 0.31, Q * 0.3] }, f()),
        t.add(u, tt(0.11, 0.36, 0.022, 0.005), { p: [0.685, H + 0.31, Q * 0.305] }, f()),
        t.add(u, tt(0.03, 0.78, 0.04, 0.006), { p: [0.755, H + 0.94, Q * 0.5] }, f()),
        t.add("steel_worn", vt(0.04, 0.04, 0.03, 10), { p: [0.67, H + 0.2, Q * 0.325], r: [gt, 0, 0] }, 0.7));
    (t.add(u, tt(0.03, 0.04, 1.04, 0.006), { p: [0.755, H + 1.33, 0] }, f()),
      t.add(u, tt(0.02, 0.03, 1, 0.004), { p: [0.755, H + 0.94, 0] }, f()));
    for (let Q = -2; Q <= 2; Q++) t.add(u, tt(0.02, 0.76, 0.02, 0.004), { p: [0.755, H + 0.94, Q * 0.165] }, f());
    let N = 0.035;
    for (let Q of [1, -1]) {
      let W = ko(
        [
          [0.777, N],
          [1.45, N],
          [1.7, N + 0.006],
          [1.7, N + 0.016],
          [0.87, N + 0.046],
          [0.826, N + 0.075],
          [0.822, N + 0.62],
          [0.777, N + 0.62],
        ],
        0.1,
        { soft: 0.45 },
      );
      (t.add("steel_worn", W, { p: [0, 0, Q * 0.26] }, (J, G, te) => {
        let oe = Di((J - 0.8) / 0.9, 0, 1),
          ee = O0(J * 14, te * 30 + Q);
        return (0.5 + 0.5 * oe) * (0.8 + 0.2 * ee);
      }),
        t.add(u, tt(0.075, 0.05, 0.112, 0.006), { p: [0.772, H + 0.575, Q * 0.26] }, 0.55),
        t.add(u, tt(0.03, 0.04, 0.112, 0.006), { p: [0.79, H + 0.07, Q * 0.26] }, 0.55));
    }
    t.pop();
    let Z = Math.max(2.2, 0.06 + o + 1.36, 2.04 + r);
    return t.finish({
      size: [3.4, Z, 1.25],
      colliders: [
        { min: [-1.7, 0, -0.6], max: [0.58, 1.24, 0.6], surface: "metal" },
        { min: [-1.56, 1.24, -0.4], max: [-1.22, 1.6, 0.4], surface: "metal" },
        { min: [-0.88, 1.24, -0.24], max: [-0.7, 1.66, 0.24], surface: "rubber" },
        { min: [0.56, 0, -0.42], max: [0.78, 2.04 + r, 0.42], surface: "metal" },
        { min: [0.72, o, -0.53], max: [0.8, o + 1.42, 0.53], surface: "metal" },
        { min: [0.8, o, -0.33], max: [1.7, o + 0.1, 0.33], surface: "metal" },
        { min: [-1.02, 2, -0.5], max: [0.32, 2.1, 0.5], surface: "metal" },
        ...z,
      ],
    });
  }
  export function oP(n, e) {
    let t = new Wn(n, "generator", e.seed || 0),
      i = t.rng,
      [s, o] = Bl(e.color, "yellow"),
      r = (g = 1) => (typeof o == "number" ? o * g : o.map((E) => E * g)),
      a = "steel_dark",
      l = 0.46,
      c = 1.03,
      u = 0.3,
      f = 1.16,
      h = (u + f) / 2;
    for (let g of [1, -1]) {
      t.add(a, tt(2.2, 0.14, 0.1, 0.012), { p: [0, 0.07, g * 0.4] }, 0.6);
      for (let E of [-0.45, 0.45]) t.add(a, ot(0.22, 0.075, 0.004), { p: [E, 0.075, g * 0.451] }, 0.12);
    }
    for (let g of [-0.85, 0, 0.85]) t.add(a, ot(0.1, 0.1, 0.72), { p: [g, 0.07, 0] }, 0.55);
    (t.add(a, tt(2.1, 0.17, 0.94, 0.012), { p: [0, 0.215, 0] }, 0.8),
      t.add(s, tt(2.06, f - u, l * 2, 0.025), { p: [0, h, 0] }, r()),
      t.add(s, tt(2.13, 0.045, 0.99, 0.014), { p: [0, f + 0.02, 0] }, r(0.9)));
    for (let g of [-0.52, 0.52]) t.add(s, ot(0.04, 0.012, 0.95), { p: [g, f + 0.046, 0] }, r(0.85));
    for (let g of [1, -1]) {
      let E = g > 0 ? 0 : Vt;
      ([-0.66, 0, 0.66].forEach((M, _) => {
        (t.add(s, tt(0.62, 0.72, 0.012, 0.006), { p: [M, h + 0.01, g * (l + 0.004)] }, r(i.range(0.9, 1))),
          t.add(a, ot(0.03, 0.11, 0.016), { p: [M + 0.27, h, g * (l + 0.012)] }, 0.6),
          t.add("steel_galv", ot(0.012, 0.03, 0.006), { p: [M + 0.27, h + 0.03, g * (l + 0.022)] }, 0.8));
        for (let T of [-0.25, 0.25]) t.add("steel_galv", vt(0.009, 0.009, 0.06, 5, !0), { p: [M - 0.305, h + T, g * (l + 0.012)] }, 0.7);
        if (_ > 0) {
          let T = _ === 2 ? 8 : 5,
            w = 0.42,
            S = _ === 2 ? h + 0.14 : h - 0.16;
          t.add(a, ot(w, T * 0.05, 0.004), { p: [M - 0.03, S, g * (l + 0.0105)] }, 0.12);
          for (let R = 0; R < T; R++)
            t.add(s, ot(w, 0.04, 0.005), { p: [M - 0.03, S + (R - (T - 1) / 2) * 0.05, g * (l + 0.018)], r: [g * 0.6, 0, 0] }, r(0.82));
          _ === 2 && t.decal(n.mats.decal("rust_run"), 0.3, { p: [M - 0.03, S - 0.36, g * (l + 0.011)], r: [0, E, 0] });
        }
      }),
        t.label(e.label || "GEN-0" + (1 + (t.seed % 2)), { color: "black", font: "stencil", distress: 0.35 }, 0.5, 0.13, {
          p: [-0.66 * g, h + 0.17, g * (l + 0.0108)],
          r: [0, E, 0],
        }),
        t.decal(n.mats.decal("hazard_voltage"), 0.15, { p: [-0.66 * g - g * 0.18, h - 0.17, g * (l + 0.0108)], r: [0, E, 0] }));
    }
    t.add(a, ot(0.004, 0.66, 0.74), { p: [c + 0.001, h, 0] }, 0.1);
    for (let g = 0; g < 11; g++) t.add(s, ot(0.006, 0.046, 0.74), { p: [c + 0.012, h - 0.3 + g * 0.06, 0], r: [0, 0, -0.6] }, r(0.8));
    for (let g of [1, -1])
      (t.add(s, ot(0.03, 0.72, 0.03), { p: [c + 0.012, h, g * 0.385] }, r(0.9)),
        t.add(s, ot(0.03, 0.03, 0.8), { p: [c + 0.012, h + g * 0.345, 0] }, r(0.9)));
    let p = -c - 0.004,
      d = 0.14;
    (t.add(a, tt(0.01, 0.44, 0.52, 0.004), { p: [p, 0.87, d] }, 0.45),
      t.add(s, tt(0.075, 0.014, 0.56, 0.004), { p: [p - 0.03, 1.1, d], r: [0, 0, 0.12] }, r(0.9)));
    for (let g of [1, -1]) t.add(s, ot(0.06, 0.44, 0.012), { p: [p - 0.025, 0.87, d + g * 0.268] }, r(0.9));
    let m = p - 0.0055,
      x = [0, -gt, 0];
    (t.add(n.mats.emissive(8840104, 0.32), i1(0.13, 0.07), { p: [m - 0.001, 0.99, d - 0.12], r: x }, 1, { raw: !0, cast: !1 }),
      t.add(a, tt(0.008, 0.09, 0.15, 0.003), { p: [m + 0.003, 0.99, d - 0.12] }, 0.3),
      t.add("steel_galv", vt(0.02, 0.02, 0.012, 10), { p: [m - 0.004, 1, d + 0.19], r: [0, 0, gt] }, 0.7),
      t.add(n.mats.emissive(4063082, 3.2), vt(0.013, 0.013, 0.014, 10), { p: [m - 0.009, 1, d + 0.19], r: [0, 0, gt] }, 1, { raw: !0 }),
      t.add(s, vt(0.042, 0.042, 0.006, 12), { p: [m - 0.003, 0.8, d + 0.17], r: [0, 0, gt] }, 1),
      t.add(
        "plastic_red",
        hs(
          [
            [0, 0],
            [0.018, 0],
            [0.018, 0.018],
            [0.03, 0.02],
            [0.03, 0.034],
            [0.02, 0.042],
            [0, 0.044],
          ],
          10,
        ),
        { p: [m - 0.004, 0.8, d + 0.17], r: [0, 0, gt] },
        0.95,
      ));
    for (let g = 0; g < 3; g++) {
      let E = d - 0.2 + g * 0.105;
      (t.add("aluminium", vt(0.04, 0.042, 0.012, 10), { p: [m - 0.004, 0.86, E], r: [0, 0, gt] }, 0.8),
        t.add("aluminium", vt(0.034, 0.034, 0.002, 10), { p: [m - 0.0105, 0.86, E], r: [0, 0, gt] }, 1),
        t.add(a, ot(0.002, 0.028, 0.004), { p: [m - 0.0125, 0.868, E + 0.005], r: [i.range(-1, 1), 0, 0] }, 0.3));
    }
    for (let g = 0; g < 5; g++)
      t.add(
        g === 0 ? "plastic_red" : a,
        ot(0.014, 0.04, 0.022),
        { p: [m - 0.006, 0.74, d - 0.2 + g * 0.03], r: [0, 0, i() < 0.5 ? 0.25 : -0.25] },
        0.8,
      );
    (t.decal(n.mats.decal("hazard_voltage"), 0.13, { p: [-c - 0.002, 0.95, -0.28], r: x }),
      t.label("DANGER", { color: "red", font: "stencil", distress: 0.3 }, 0.22, 0.05, { p: [-c - 0.002, 0.82, -0.28], r: x }));
    let v = [
      ["plastic_red", 0.02],
      ["plastic_blue", 0.2],
      ["plastic_blue", -0.25],
    ];
    for (let [g, E] of v)
      (t.add(a, tt(0.02, 0.12, 0.1, 0.006), { p: [-c - 0.008, 0.5, E] }, 0.4),
        t.add(g, V0([-c - 0.01, 0.5, E], [-c - 0.06, 0.47, E], 0.036, 10, !0), null, 0.9));
    (t.add("plastic_blue", V0([-c - 0.06, 0.47, 0.2], [-c - 0.068, 0.39, 0.2], 0.03, 8, !0, 0.02), null, 0.85),
      t.add(
        "rubber",
        bn(
          [
            [-c - 0.066, 0.4, 0.2],
            [-c - 0.064, 0.25, 0.21],
            [-c - 0.05, 0.06, 0.26],
            [-c + 0.05, 0.016, 0.4],
            [-c + 0.3, 0.016, 0.478],
            [-0.35, 0.016, 0.486],
          ],
          0.014,
          5,
          !1,
          0.5,
        ),
        null,
        1,
      ));
    let y = f + 0.0425;
    (t.add(a, tt(0.2, 0.012, 0.14, 0.004), { p: [0, y + 0.004, 0] }, 0.6),
      t.add("steel_galv", Ul(0.045, 0.014, 5, 10), { p: [0, y + 0.058, 0] }, 0.7));
    let b = [0.72, y, 0.24];
    return (
      t.add("steel_rust", vt(0.062, 0.066, 0.025, 12), { p: [b[0], y + 0.012, b[2]] }, 0.6),
      t.add(
        "steel_rust",
        vt(0.04, 0.04, 0.17, 12, !0),
        { p: [b[0], y + 0.085, b[2]] },
        (g, E) => 0.45 + 0.55 * Di((y + 0.17 - E) / 0.17, 0, 1),
      ),
      t.add("steel_rust", vt(0.034, 0.034, 0.002, 10), { p: [b[0], y + 0.15, b[2]] }, 0.08),
      t.add("steel_rust", vt(0.046, 0.046, 0.005, 12), { p: [b[0] - 0.012, y + 0.186, b[2]], r: [0, 0, 0.5] }, 0.6),
      t.decal(n.mats.decal("scorch"), 0.3, { p: [b[0], y + 0.001, b[2]], r: [-gt, 0, 0] }),
      t.add(a, V0([-0.72, 0.25, 0.46], [-0.72, 0.32, 0.5], 0.03, 8, !0), null, 0.6),
      t.add("plastic_red", V0([-0.72, 0.32, 0.5], [-0.72, 0.338, 0.51], 0.037, 10, !0), null, 0.9),
      t.decal(n.mats.decal("hazard_flammable"), 0.11, { p: [-0.52, 0.215, 0.4712] }),
      t.label("DIESEL", { color: "white", font: "stencil", distress: 0.4 }, 0.2, 0.05, { p: [-0.34, 0.215, 0.4712] }),
      t.finish({ colliders: [{ min: [-1.1, 0, -0.5], max: [1.1, 1.21, 0.5], surface: "metal" }] })
    );
  }
  export function rP(n, e) {
    let t = new Wn(n, "dumpster", e.seed || 0),
      i = t.rng,
      [s, o] = Bl(e.color, "green"),
      r = (_ = 1) => (typeof o == "number" ? o * _ : o.map((T) => T * _)),
      a = 0.89,
      l = 0.2,
      c = 1.12,
      u = 0.3,
      f = 0.5,
      h = -0.44,
      p = -0.5,
      d = 0.022,
      m = [
        [-f, c],
        [-u, l],
        [-h, l],
        [-p, c],
        [-p - d, c],
        [-h - d * 0.8, l + d],
        [-u + d * 0.8, l + d],
        [-f + d, c],
      ],
      x = t.seed * 2.3;
    t.add(s, ko(m, a * 2, { soft: 0 }), { r: [0, gt, 0] }, (_, T, w) => {
      let S = Math.abs(w) < 0.4 && T > l + 0.01 && T < c - 0.01 && Math.abs(_) < a - 0.01;
      return r(0.9 + 0.1 * O0(_ * 3 + x, T * 3));
    });
    for (let _ of [1, -1]) {
      (t.add(
        s,
        ko(
          [
            [-f, c],
            [-u, l],
            [-h, l],
            [-p, c],
          ],
          d,
          { soft: 0 },
        ),
        { p: [_ * (a - d / 2), 0, 0], r: [0, gt, 0] },
        r(0.95),
      ),
        t.add(s, tt(0.05, 0.045, f - p + 0.04, 0.008), { p: [_ * a, c, 0] }, r(0.9)));
      for (let T of [-0.22, 0.14]) t.add(s, tt(0.03, 0.84, 0.05, 0.006), { p: [_ * (a + 0.012), 0.66, T] }, r(0.9));
      (t.add(s, tt(0.035, 0.1, 0.84, 0.008), { p: [_ * (a + 0.014), 0.93, 0] }, r(0.85)),
        t.add("steel_worn", V0([_ * (a + 0.01), 0.93, 0.3], [_ * (a + 0.065), 0.93, 0.3], 0.03, 10, !0), null, 0.7),
        t.add("steel_worn", vt(0.042, 0.042, 0.008, 10), { p: [_ * (a + 0.064), 0.93, 0.3], r: [0, 0, gt] }, 0.6));
    }
    (t.add(s, tt(a * 2 + 0.04, 0.045, 0.05, 0.008), { p: [0, c, f] }, r(0.9)),
      t.add(s, tt(a * 2 + 0.04, 0.045, 0.05, 0.008), { p: [0, c, p] }, r(0.9)));
    let v = Math.atan2(f - u, c - l),
      y = Math.atan2(p - h, c - l);
    for (let _ of [-0.6, -0.2, 0.2, 0.6])
      (t.add(s, ea([_, l + 0.03, u + 0.022], [_, c - 0.04, f + 0.012], 0.055, 0.03, 0.006), null, r(0.9)),
        t.add(s, ea([_, l + 0.03, h - 0.016], [_, c - 0.04, p - 0.012], 0.055, 0.03, 0.006), null, r(0.9)));
    t.add(
      s,
      ea([-a, l + 0.5, u + 0.022 + (0.5 * (f - u)) / (c - l)], [a, l + 0.5, u + 0.022 + (0.5 * (f - u)) / (c - l)], 0.03, 0.06, 0.006),
      { r: [0, 0, 0] },
      r(0.88),
    );
    let b = (_) => u + ((_ - l) * (f - u)) / (c - l) + 0.003;
    (t.label(e.label || "B4 WASTE " + (11 + (t.seed % 2)), { color: "white", font: "stencil", distress: 0.5 }, 0.36, 0.09, {
      p: [-0.4, 0.93, b(0.93)],
      r: [-v, 0, 0],
    }),
      t.decal(n.mats.decal("grime_streak"), 0.36, { p: [0.4, 0.82, b(0.82)], r: [-v, 0, 0] }),
      t.decal(n.mats.decal("rust_run"), 0.3, { p: [0, 0.5, b(0.5)], r: [-v, 0, 0] }),
      t.decal(n.mats.decal("logo_c"), 0.26, { p: [0.4, 0.42, b(0.42)], r: [-v, 0, 0] }),
      t.decal(n.mats.decal("leak_stain"), 0.34, { p: [-0.4, 0.45, b(0.45)], r: [-v, 0, 0] }));
    let g = c + 0.045,
      E = p - 0.02;
    t.add("steel_galv", V0([-a - 0.02, g, E], [a + 0.02, g, E], 0.013, 6, !0), null, 0.7);
    let M = (_, T) => {
      t.push({ p: [_, g, E], r: [T, 0, 0] });
      let w = 1.07,
        S = uo(0.885, 0.04, w, 0.016, 3, 3, 4);
      (fo(S, (z) => {
        z.y > 0 && (z.y += 0.018 * Math.cos((z.z / w) * Vt) * Math.cos((z.x / 0.885) * Vt));
      }),
        S.computeVertexNormals());
      let R = i.range(0.75, 0.95);
      t.add("plastic_grey", S, { p: [0, 0.005, w / 2] }, R);
      for (let z of [-0.26, 0.26]) t.add("plastic_grey", tt(0.07, 0.016, w - 0.16, 0.006), { p: [z, 0.036, w / 2] }, R * 0.9);
      t.add("plastic_grey", tt(0.3, 0.035, 0.05, 0.01), { p: [0, 0.02, w + 0.01] }, R * 0.8);
      for (let z of [-0.3, 0.3]) t.add("plastic_grey", tt(0.08, 0.03, 0.09, 0.008), { p: [z, 0.005, 0.03] }, R * 0.8);
      t.pop();
    };
    (M(-0.45, 0), M(0.45, gt + 0.07 + i.range(0, 0.05)));
    for (let [_, T, w, S] of [
      [0.45, 0.93, 0.05, 1],
      [0.66, 0.9, -0.24, 0.8],
      [0.22, 0.86, -0.2, 0.85],
    ]) {
      let R = uo(0.46 * S, 0.4 * S, 0.42 * S, 0.17 * S, 3, 3, 3),
        z = i() * 20;
      (fo(R, (I) => {
        let L = O0(I.x * 9 + z, I.y * 9, I.z * 9) - 0.5;
        ((I.x += L * 0.06), (I.z += L * 0.06), (I.y += L * 0.04));
      }),
        t.add("polymer_black", Cr(R), { p: [_, T, w], r: [i() * 0.5, i() * 6, 0] }, 0.8));
    }
    t.add(
      "cardboard",
      kr(
        [
          [0.2, 0.9, 0.2],
          [0.24, 1.14, 0.26],
          [0.3, 1.2, 0.33],
        ],
        [0.16, 0, -0.05],
      ),
      null,
      0.7,
    );
    for (let _ of [-0.7, 0.7])
      for (let T of [-0.3, 0.17]) {
        (t.push({ p: [_, 0, T], r: [0, i() * 6, 0] }), t.add("steel_galv", tt(0.13, 0.012, 0.11, 0.003), { p: [0, 0.194, 0] }, 0.7));
        for (let w of [1, -1]) t.add("steel_galv", ea([0, 0.19, w * 0.034], [0.035, 0.08, w * 0.034], 0.05, 0.006, 0, !0), null, 0.65);
        (t.add("rubber", vt(0.08, 0.08, 0.045, 14), { p: [0.035, 0.08, 0], r: [gt, 0, 0] }, 0.9),
          t.add("steel_galv", vt(0.035, 0.035, 0.05, 8), { p: [0.035, 0.08, 0], r: [gt, 0, 0] }, 0.6),
          t.pop());
      }
    return t.finish({ colliders: [{ min: [-0.95, 0.05, -0.56], max: [0.95, 1.2, 0.55], surface: "metal" }] });
  }
  export function aP(n, e) {
    let t = new Wn(n, "toolbox_cart", e.seed || 0),
      i = t.rng,
      [s, o] = Bl(e.color, "red"),
      r = (y = 1) => (typeof o == "number" ? o * y : o.map((b) => b * y)),
      a = 0.04,
      l = 0.74,
      c = 0.125,
      u = 0.785,
      f = 0.23;
    (t.add(s, tt(l, u - c, f * 2, 0.012), { p: [a, (c + u) / 2, 0] }, r()),
      t.add("steel_dark", tt(l + 0.01, 0.02, f * 2 + 0.01, 0.006), { p: [a, c + 0.004, 0] }, 0.5));
    let h = [0.075, 0.075, 0.1, 0.13, 0.19],
      p = 1 + (t.seed % 3),
      d = u - 0.03;
    (h.forEach((y, b) => {
      let g = b === p ? 0.05 : i() < 0.3 ? 0.004 : 0,
        E = d - y / 2;
      if (
        (t.add(s, tt(l - 0.05, y - 0.01, 0.014, 0.004), { p: [a, E, f + 0.005 + g] }, r(i.range(0.9, 1))),
        t.add("aluminium", tt(l - 0.09, 0.016, 0.016, 0.004), { p: [a, E + y / 2 - 0.02, f + 0.019 + g] }, 0.85),
        g > 0.01)
      ) {
        (t.add("steel_dark", ot(l - 0.07, y - 0.02, g), { p: [a, E, f + g / 2] }, 0.4),
          t.add("polymer_black", ot(l - 0.08, 0.004, g), { p: [a, E + y / 2 - 0.012, f + g / 2] }, 0.3));
        for (let M = 0; M < 4; M++)
          t.add(
            "steel_bare",
            V0([a - 0.25 + M * 0.15, E + y / 2 - 0.016, f + 0.008], [a - 0.23 + M * 0.15, E + y / 2 - 0.014, f + g - 0.012], 0.007, 5, !0),
            null,
            0.8,
          );
      }
      d -= y;
    }),
      t.add("steel_bare", vt(0.011, 0.011, 0.008, 8), { p: [a + l / 2 - 0.06, u - 0.016, f + 0.004], r: [gt, 0, 0] }, 0.8),
      t.add("rubber", ot(l - 0.04, 0.006, f * 2 - 0.04), { p: [a, u + 0.003, 0] }, 0.9),
      t.add(s, tt(l, 0.03, 0.014, 0.004), { p: [a, u + 0.013, -f + 0.007] }, r(0.95)));
    for (let y of [1, -1]) t.add(s, tt(0.014, 0.03, f * 2, 0.004), { p: [a + y * (l / 2 - 0.007), u + 0.013, 0] }, r(0.95));
    t.add(
      "aluminium",
      bn(
        [
          [a - l / 2, 0.56, -0.17],
          [-0.41, 0.6, -0.17],
          [-0.435, 0.73, -0.17],
          [-0.435, 0.73, 0.17],
          [-0.41, 0.6, 0.17],
          [a - l / 2, 0.56, 0.17],
        ],
        0.012,
        6,
        !1,
        0.2,
      ),
      null,
      0.85,
    );
    for (let y of [1, -1])
      for (let b of [1, -1]) {
        (t.push({ p: [a + y * (l / 2 - 0.07), 0, b * (f - 0.06)], r: [0, y > 0 ? i() * 6 : 0, 0] }),
          t.add("steel_galv", tt(0.08, 0.008, 0.07, 0.002), { p: [0, 0.119, 0] }, 0.7));
        for (let g of [1, -1]) t.add("steel_galv", ea([0, 0.117, g * 0.022], [0.02, 0.05, g * 0.022], 0.035, 0.004, 0, !0), null, 0.65);
        (t.add("rubber", vt(0.05, 0.05, 0.03, 12), { p: [0.02, 0.05, 0], r: [gt, 0, 0] }, 0.9),
          t.add("steel_galv", vt(0.02, 0.02, 0.034, 6), { p: [0.02, 0.05, 0], r: [gt, 0, 0] }, 0.6),
          t.pop());
      }
    (t.label(e.label || "MAINT " + (1 + (t.seed % 2)), { color: "white", font: "stencil", distress: 0.4 }, 0.3, 0.07, {
      p: [a + l / 2 + 0.002, 0.6, 0],
      r: [0, gt, 0],
    }),
      t.decal(n.mats.decal("logo_d"), 0.2, { p: [a + l / 2 + 0.002, 0.42, 0], r: [0, gt, 0] }),
      t.decal(n.mats.decal("grime_streak"), 0.3, { p: [a, 0.45, -f - 0.002], r: [0, Vt, 0] }));
    let m = u + 0.006;
    (t.push({ p: [a - 0.18, m, 0.08], r: [0, 0.5, 0] }),
      t.add("steel_bare", tt(0.2, 0.006, 0.02, 0.002), { p: [0, 0.004, 0] }, 0.9),
      t.add("steel_bare", Ul(0.016, 0.006, 4, 10), { p: [0.11, 0.005, 0], r: [gt, 0, 0] }, 0.9),
      t.add("steel_bare", Ul(0.017, 0.006, 4, 7, Vt * 1.4), { p: [-0.112, 0.005, 0], r: [gt, 0, 2.2] }, 0.9),
      t.pop(),
      t.push({ p: [a + 0.02, m, -0.1], r: [0, -0.3, 0] }),
      t.add("wood_pallet", V0([-0.14, 0.014, 0], [0.12, 0.016, 0], 0.012, 6, !0, 0.01), null, 0.9),
      t.add("steel_dark", tt(0.032, 0.03, 0.1, 0.006), { p: [0.125, 0.017, 0.005] }, 0.8),
      t.pop(),
      t.push({ p: [a + 0.2, m, 0.1], r: [0, 0.12, 0] }),
      t.add("polymer_black", tt(0.22, 0.014, 0.05, 0.004), { p: [0, 0.007, 0] }, 0.6));
    for (let y = 0; y < 6; y++)
      t.add("steel_bare", vt(0.008 + y * 0.0014, 0.008 + y * 0.0014, 0.03, 8), { p: [-0.085 + y * 0.034, 0.029, 0] }, 0.9);
    (t.pop(),
      t.add("plastic_blue", vt(0.032, 0.032, 0.13, 12), { p: [a + 0.28, m + 0.065, -0.12] }, 0.9),
      t.add(
        "steel_bare",
        hs(
          [
            [0.032, 0],
            [0.028, 0.012],
            [0.014, 0.018],
            [0.014, 0.018],
            [0.014, 0.03],
            [0, 0.03],
          ],
          10,
        ),
        { p: [a + 0.28, m + 0.13, -0.12] },
        0.9,
      ),
      t.add("plastic_red", vt(0.012, 0.012, 0.014, 8), { p: [a + 0.28, m + 0.165, -0.12] }, 0.95),
      t.add("paint_yellow", V0([a - 0.3, m + 0.012, -0.13], [a - 0.2, m + 0.012, -0.16], 0.014, 7, !0), null, 0.9),
      t.add("steel_bare", V0([a - 0.2, m + 0.012, -0.16], [a - 0.08, m + 0.01, -0.196], 0.004, 5, !0), null, 0.9));
    let x = uo(0.2, 0.02, 0.15, 0.009, 4, 3, 4),
      v = i() * 9;
    return (
      fo(x, (y) => {
        ((y.y += 0.012 * O0(y.x * 30 + v, y.z * 30) * (y.y > 0 ? 1 : 0)), (y.x += 0.012 * (O0(y.z * 20, v) - 0.5)));
      }),
      t.add(t.mat("glove_fabric", { color: 8203044 }), Cr(x), { p: [a - 0.26, m + 0.01, 0.12], r: [0, 0.8, 0] }, 0.9),
      t.finish()
    );
  }
  export function cw(n) {
    (n("forklift", (e, t = {}) => sP(e, t)),
      n("generator", (e, t = {}) => oP(e, t)),
      n("dumpster", (e, t = {}) => rP(e, t)),
      n("toolbox_cart", (e, t = {}) => aP(e, t)));
  }
  nw(Si);
  ow(Si);
  cw(Si);
