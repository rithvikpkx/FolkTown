import { LinearFilter as x0, DataTexture as li, RGBAFormat as $0, UnsignedByteType as wi, RepeatWrapping as qs, ClampToEdgeWrapping as Vi, LinearMipmapLinearFilter as yn, NoColorSpace as ci, CanvasTexture as Rs, Vector3 as K, Vector4 as Jt, Matrix4 as Je, Vector2 as We, MeshStandardMaterial as L0, PlaneGeometry as w0, Mesh as ht, PerspectiveCamera as zn, WebGLRenderTarget as Zn, HalfFloatType as ro, LinearSRGBColorSpace as Wr, Plane as wo, MathUtils as ks, BufferGeometry as pt, BufferAttribute as nt, Sphere as an, InstancedBufferGeometry as Ra, InstancedBufferAttribute as Xs, ShaderMaterial as vn, AdditiveBlending as wr, DoubleSide as ln, Group as At, BoxGeometry as R0, CylinderGeometry as io } from 'three';
import { ar } from './ns.js';
import { Kn, T0, Z0 } from './common.js';

export var Lv = {};
  ar(Lv, { create: () => Vg, showcase: () => BP });
  export function Ug(n, e, t) {
    let i = Math.imul(n | 0, 374761393) ^ Math.imul(e | 0, 668265263) ^ Math.imul(t | 0, 1274126177);
    return ((i = Math.imul(i ^ (i >>> 13), 1274126177)), ((i ^ (i >>> 16)) >>> 0) / 4294967296);
  }
  export function zw(n, e, t, i) {
    let s = Math.floor(n),
      o = Math.floor(e),
      r = n - s,
      a = e - o,
      l = r * r * (3 - 2 * r),
      c = a * a * (3 - 2 * a),
      u = s,
      f = s + 1,
      h = o,
      p = o + 1;
    i && ((u = ((u % i) + i) % i), (f = ((f % i) + i) % i), (h = ((h % i) + i) % i), (p = ((p % i) + i) % i));
    let d = Ug(u, h, t),
      m = Ug(f, h, t),
      x = Ug(u, p, t),
      v = Ug(f, p, t);
    return d + (m - d) * l + (x - d) * c + (d - m - x + v) * l * c;
  }
  export function ps(n, e, t, i = 4, s = 0) {
    let o = 0,
      r = 0.5,
      a = 0;
    for (let l = 0; l < i; l++) ((o += r * zw(n, e, t + l * 17, s)), (a += r), (n *= 2), (e *= 2), (s *= 2), (r *= 0.5));
    return o / a;
  }
  export var zo = (n) => (n < 0 ? 0 : n > 1 ? 1 : n),
    du = (n, e, t) => {
      let i = zo((t - n) / (e - n));
      return i * i * (3 - 2 * i);
    },
    wP = 0.385,
    Fi = { x0: -44, z0: -40, size: 80 },
    Pw = [
      [-30.5, 6.6, 2.6, 1.7, 0.24],
      [-19.5, 5.2, 7.5, 1.5, 0.27],
      [-11.5, 7, 5, 1.2, 0.24],
      [-7.6, 5.6, 2.3, 1.7, 0.2],
      [5.6, 4.7, 3.3, 1.35, 0.26],
      [13, 6.6, 2.6, 1.2, 0.2],
      [-13, -1.3, 4.6, 1.5, 0.2],
      [1, -1.6, 3.4, 1.4, 0.18],
      [12.5, -1.4, 2.4, 1.3, 0.18],
      [-3.5, -8.2, 4.4, 1.6, 0.2],
      [-20, -8.6, 3.6, 1.6, 0.18],
      [14.6, -19.5, 2, 3.6, 0.2],
      [23.5, 6.9, 3.2, 2, 0.22],
      [23.2, -7.6, 3.4, 1.8, 0.2],
      [20.8, 1.5, 1.4, 3.6, 0.16],
      [23.5, 22.5, 3, 2, 0.2],
      [24, -25, 2.8, 2.6, 0.2],
      [-1, 16.5, 7, 1.7, 0.2],
      [11.5, 16.9, 3.6, 1.4, 0.18],
      [-17, 15.8, 3.2, 1.5, 0.18],
      [8.6, 12.3, 1.5, 3.4, 0.17],
      [-7.8, 19.5, 1.7, 3.6, 0.17],
      [-8, 25.8, 6, 1.3, 0.18],
      [9, 25.9, 4, 1.2, 0.18],
      [-32, -4, 2.6, 3.4, 0.18],
      [-31, 18, 3, 4, 0.18],
    ],
    Iw = 1,
    EP = 0.02;
  export function SP(n, e) {
    let t = 0.5 + (ps(n / 8.5, e / 8.5, 11, 4) - 0.47) * 0.3 + (ps(n / 2.4, e / 2.4, 23, 3) - 0.5) * 0.14;
    for (let i = 0; i < Pw.length; i++) {
      let s = Pw[i],
        o = (n - s[0]) / (s[2] * Iw),
        r = (e - s[1]) / (s[3] * Iw),
        a = o * o + r * r;
      a < 9 && (t -= (s[4] + EP) * Math.exp(-a * a));
    }
    if (n > -37 && n < 29) {
      let i = 0.5 + 0.5 * zw(n / 6, 3.1, 5),
        s = (e - 4.9) / 0.5,
        o = (e - 7.1) / 0.5,
        r = (e - 15.4) / 0.5,
        a = (e - 17.2) / 0.5,
        l = du(0.14, 0.34, ps(n / 9, 7.7, 19, 2)) * du(-27, -24, n) * (1 - du(14, 17, n));
      t -=
        0.22 * (0.55 + 0.45 * i) * l * (Math.exp(-s * s) + Math.exp(-o * o)) +
        0.09 * i * (1 - du(0.3, 0.6, ps(n / 9, 7.7, 19, 2))) * (Math.exp(-r * r) + Math.exp(-a * a));
    }
    return ((t += 0.25 * du(28.6, 29.8, n)), t);
  }
  export function Dw(n) {
    let e = new Uint8Array(n * n * 4),
      { x0: t, z0: i, size: s } = Fi,
      o = s / n;
    for (let r = 0; r < n; r++) {
      let a = i + (r + 0.5) * o;
      for (let l = 0; l < n; l++) {
        let c = t + (l + 0.5) * o,
          u = (r * n + l) * 4,
          f = SP(c, a);
        ((e[u] = Math.round(zo(0.5 + (f - wP) * 2.5) * 255)),
          (e[u + 1] = Math.round(zo(0.5 + (ps(c / 5.5, a / 5.5, 41, 3) - 0.5) * 1.5 + (0.5 - f) * 0.9) * 255)));
        let h = du(0.6, 0.78, ps(c / 1.4, a / 1.4, 77, 4)) * du(0.47, 0.62, ps(c / 9, a / 9, 91, 2));
        ((e[u + 2] = Math.round(zo(h) * 255)),
          (e[u + 3] = Math.round(zo(ps(c / 22, a / 0.9, 57, 3) * 0.6 + ps(c / 13, a / 13, 63, 3) * 0.4) * 255)));
      }
    }
    return e;
  }
  export function Bg(n, e, t, i, s) {
    let o = ((t - Fi.x0) / Fi.size) * e - 0.5,
      r = ((i - Fi.z0) / Fi.size) * e - 0.5;
    ((o = o < 0 ? 0 : o > e - 1.001 ? e - 1.001 : o), (r = r < 0 ? 0 : r > e - 1.001 ? e - 1.001 : r));
    let a = o | 0,
      l = r | 0,
      c = o - a,
      u = r - l,
      f = (l * e + a) * 4 + s,
      h = e * 4;
    return ((n[f] * (1 - c) + n[f + 4] * c) * (1 - u) + (n[f + h] * (1 - c) + n[f + h + 4] * c) * u) / 255;
  }
  export function Lw(n) {
    let e = new Uint8Array(n * n * 4),
      t = new Uint8Array(n * n * 4),
      i = new Float32Array(n * n),
      s = new Float32Array(n * n);
    for (let r = 0; r < n; r++)
      for (let a = 0; a < n; a++) {
        let l = a / n,
          c = r / n,
          u = r * n + a,
          f = ps(l * 96, c * 96, 3, 2, 96) * 0.6 + ps(l * 40, c * 40, 9, 2, 40) * 0.4,
          h = ps(l * 6, c * 6, 21, 4, 6),
          p = (ps(l * 8, c * 8, 31, 2, 8) - 0.5) * 0.25,
          d = (ps(l * 8, c * 8, 37, 2, 8) - 0.5) * 0.25,
          m = 1 - Math.abs(2 * ps((l + p) * 5, (c + d) * 5, 43, 3, 5) - 1),
          x = ps(l * 28, c * 28, 51, 3, 28);
        ((e[u * 4] = Math.round(zo(f) * 255)),
          (e[u * 4 + 1] = Math.round(zo(h) * 255)),
          (e[u * 4 + 2] = Math.round(zo(m) * 255)),
          (e[u * 4 + 3] = Math.round(zo(x) * 255)),
          (i[u] = f),
          (s[u] = ps(l * 9, c * 9, 71, 4, 9)));
      }
    let o = (r) => (r + n) % n;
    for (let r = 0; r < n; r++)
      for (let a = 0; a < n; a++) {
        let l = r * n + a,
          c = (i[r * n + o(a + 1)] - i[r * n + o(a - 1)]) * 2.2,
          u = (i[o(r + 1) * n + a] - i[o(r - 1) * n + a]) * 2.2,
          f = (s[r * n + o(a + 2)] - s[r * n + o(a - 2)]) * 9,
          h = (s[o(r + 2) * n + a] - s[o(r - 2) * n + a]) * 9;
        ((t[l * 4] = Math.round(zo(0.5 - c) * 255)),
          (t[l * 4 + 1] = Math.round(zo(0.5 - u) * 255)),
          (t[l * 4 + 2] = Math.round(zo(0.5 - f) * 255)),
          (t[l * 4 + 3] = Math.round(zo(0.5 - h) * 255)));
      }
    return { det: e, nrm: t };
  }
  export function Hg(n, e, { repeat: t = !0, aniso: i = 1 } = {}) {
    let s = new li(n, e, e, $0, wi);
    return (
      (s.wrapS = s.wrapT = t ? qs : Vi),
      (s.magFilter = x0),
      (s.minFilter = yn),
      (s.generateMipmaps = !0),
      (s.anisotropy = i),
      (s.colorSpace = ci),
      (s.needsUpdate = !0),
      s
    );
  }
  export var Ha = { x0: -40, z0: -30, w: 70, h: 60 };
  export function Fw(n, e = 1) {
    let t = document.createElement("canvas");
    t.width = t.height = n;
    let i = t.getContext("2d");
    ((i.fillStyle = "#000"), i.fillRect(0, 0, n, n));
    let s = n / Ha.w,
      o = n / Ha.h;
    (i.setTransform(s, 0, 0, o, -Ha.x0 * s, -Ha.z0 * o), (i.globalCompositeOperation = "lighter"));
    let r = "#ff0000",
      a = "#00ff00",
      l = '"Big Shoulders Display", "Barlow Condensed", Impact, "Arial Narrow", sans-serif',
      c = 90210,
      u = () => {
        ((c |= 0), (c = (c + 1831565813) | 0));
        let E = Math.imul(c ^ (c >>> 15), 1 | c);
        return ((E = (E + Math.imul(E ^ (E >>> 7), 61 | E)) ^ E), ((E ^ (E >>> 14)) >>> 0) / 4294967296);
      },
      f = (E, M, _, T, w, S, R) => {
        ((i.strokeStyle = S),
          (i.lineWidth = w),
          (i.lineCap = "butt"),
          i.setLineDash(R || []),
          i.beginPath(),
          i.moveTo(E, M),
          i.lineTo(_, T),
          i.stroke(),
          i.setLineDash([]));
      },
      h = (E, M, _, T, w, S) => {
        ((i.strokeStyle = S), (i.lineWidth = w), i.setLineDash([]), i.strokeRect(E, M, _ - E, T - M));
      },
      p = (E, M, _, T, w) => {
        ((i.fillStyle = w), i.fillRect(E, M, _ - E, T - M));
      },
      d = (E, M, _, T, w, S) => {
        (i.save(),
          i.translate(M, _),
          i.rotate(w),
          i.scale(T / 100, T / 100),
          (i.font = `900 100px ${l}`),
          (i.textAlign = "left"),
          (i.textBaseline = "middle"),
          (i.fillStyle = S));
        let z = -i.measureText(E).width / 2;
        (i.fillText(E, z, 0), (i.globalCompositeOperation = "source-over"), (i.fillStyle = "#000"));
        for (let I of E) {
          let L = i.measureText(I).width;
          (" I1".includes(I) || i.fillRect(z + L * 0.36, -60, 4.5, 120), (z += L));
        }
        ((i.globalCompositeOperation = "lighter"), i.restore());
      },
      m = (E, M, _, T, w, S = 1.1, R = 0.14) => {
        (i.save(), i.beginPath(), i.rect(E, M, _ - E, T - M), i.clip());
        let z = _ - E + (T - M);
        for (let I = 0; I < z; I += S) f(E + I, M, E + I - (T - M), T, R, w);
        (i.restore(), h(E, M, _, T, 0.15, w));
      },
      x = (E, M, _, T) => {
        (i.save(),
          i.translate(E, M),
          i.scale(_, 1),
          (i.fillStyle = T),
          i.beginPath(),
          i.moveTo(-1.6, -0.14),
          i.lineTo(0.5, -0.14),
          i.lineTo(0.5, -0.5),
          i.lineTo(1.7, 0),
          i.lineTo(0.5, 0.5),
          i.lineTo(0.5, 0.14),
          i.lineTo(-1.6, 0.14),
          i.closePath(),
          i.fill(),
          i.restore());
      };
    (f(-25.6, 3.6, 16.2, 3.6, 0.15, r),
      f(-25.6, 8.4, -5.6, 8.4, 0.15, r),
      f(10.4, 8.4, 16.2, 8.4, 0.15, r),
      f(-24, 6, -3, 6, 0.12, a, [3, 4.5]),
      f(6, 6, 15.5, 6, 0.12, a, [3, 4.5]),
      f(-23, 14, 16.2, 14, 0.15, r),
      f(-23, 18.6, 16.2, 18.6, 0.15, r),
      f(-23, 16.3, 15.5, 16.3, 0.1, a, [2, 6]),
      f(-23, -3.6, 16.2, -3.6, 0.12, r),
      f(-23, 0.56, 16.2, 0.56, 0.12, r),
      f(-23, 24.2, 16.2, 24.2, 0.12, r),
      f(-37.5, 2.6, -26.4, 2.6, 0.15, a),
      f(-37.5, 9.2, -26.4, 9.2, 0.15, a),
      x(-14, 4.7, 1, a),
      x(13, 7.3, -1, a),
      x(-16, 15.2, 1, a),
      x(2, 17.5, -1, a),
      p(-26.2, 3.6, -25.75, 8.4, a));
    for (let E = 2.75; E < 9; E += 1) p(-31.2, E, -28.2, E + 0.5, a);
    (d("SLOW", -21.4, 6, 1.7, Math.PI / 2, a),
      d("10", -19, 6, 1.8, Math.PI / 2, a),
      (i.strokeStyle = a),
      (i.lineWidth = 0.14),
      i.beginPath(),
      i.ellipse(-19, 6, 1.35, 1.8, 0, 0, Math.PI * 2),
      i.stroke(),
      f(-30.4, 2.6, -30.4, -10.2, 0.12, a),
      f(-29, 2.6, -29, -8.8, 0.12, a),
      f(-30.4, -10.2, -7, -10.2, 0.12, a),
      f(-29, -8.8, -7, -8.8, 0.12, a));
    for (let E = -28; E < -7.5; E += 2.2) f(E, -10.2, E + 0.9, -8.8, 0.1, a);
    for (let E = -7.5; E < 2; E += 2.2) f(-30.4, E, -29, E + 0.9, 0.1, a);
    let v = [
        [-22.5, -10.3],
        [-5.3, 6.9],
        [10.5, 16.6],
      ],
      y = (E, M, _, T, w, S) => {
        v.forEach((R, z) => {
          if (S && z === 1) return;
          let I = z === 2 ? 1 : 2,
            L = M - E > 4 ? 2 : 1;
          for (let U = 0; U < I; U++)
            for (let k = 0; k < L; k++) {
              let C = R[0] + ((R[1] - R[0]) * U) / I,
                A = R[0] + ((R[1] - R[0]) * (U + 1)) / I,
                F = E + ((M - E) * k) / L,
                H = E + ((M - E) * (k + 1)) / L;
              h(C - 0.12, F - 0.12, A + 0.12, H + 0.12, 0.1, a);
            }
          d(_ + (z + 1), (R[0] + R[1]) / 2, T, 0.85, w, r);
        });
      };
    (y(-6.34, -3.9, "D0", -2.9, Math.PI, !1),
      y(0.86, 3.3, "C0", -0.15, 0, !1),
      y(8.7, 13.64, "B0", 14.75, Math.PI, !0),
      y(18.9, 23.84, "A0", 17.85, 0, !1));
    for (let E of [-10.3, -5.3, 6.9, 10.5])
      f(E + (E === -10.3 || E === 6.9 ? 0.35 : -0.35), -6.3, E + (E === -10.3 || E === 6.9 ? 0.35 : -0.35), 23.8, 0.1, r, [1.5, 1.5]);
    (m(-6.6, -10.9, -0.4, -8.9, r, 0.9, 0.12),
      m(12.2, -22.6, 16.2, -16.4, r),
      m(-0.9, 5.4, 3.9, 9.9, r, 0.95, 0.13),
      d("KEEP CLEAR", 1.5, 10.6, 0.62, 0, r),
      m(19.8, -4.2, 27.2, 4.2, r, 1.2, 0.16),
      d("KEEP CLEAR", 17.4, -19.5, 0.8, Math.PI / 2, r),
      f(16.9, -29.5, 16.9, 27.5, 0.15, r),
      f(17.7, -29.5, 17.7, 27.5, 0.1, r, [1, 1]),
      f(19.3, -29.5, 19.3, 27.5, 0.1, r, [1, 1]),
      f(27.7, -29.5, 27.7, 27.5, 0.1, r, [1, 1]),
      d("BERTH 4", 23.5, 21.6, 1.9, 0, a),
      d("BERTH 4", 23.5, -7.7, 1.7, Math.PI, a));
    for (let E = -27; E < 27; E += 9) d(String(400 + Math.round((E + 27) / 9) * 5), 26.9, E + 2, 0.5, Math.PI / 2, a);
    i.lineCap = "round";
    let b = (E, M, _, T, w, S) => {
      for (let R of [-0.95, 0.95])
        for (let z of [-0.16, 0.16])
          ((i.strokeStyle = `rgba(0,0,255,${S})`),
            (i.lineWidth = 0.26),
            i.beginPath(),
            i.moveTo(E, M + R + z),
            i.quadraticCurveTo((E + _) / 2, (M + T) / 2 + w + R + z, _, T + R + z),
            i.stroke());
    };
    for (let E = 0; E < 46; E++) {
      let M = u() < 0.68 ? 6 : 16.3,
        _ = M + (u() - 0.5) * 2.6,
        T = -36 + u() * 40,
        w = 8 + u() * 26;
      b(T, _, Math.min(T + w, 28), _ + (u() - 0.5) * 1.6, (u() - 0.5) * 1.4, 0.1 + u() * 0.22);
    }
    for (let E = 0; E < 12; E++) {
      let M = u() < 0.5 ? 6 : 16.3,
        _ = u() < 0.5 ? -1 : 1,
        T = 0.12 + u() * 0.2;
      ((i.strokeStyle = `rgba(0,0,255,${T})`),
        (i.lineWidth = 0.3),
        i.beginPath(),
        i.moveTo(10 + u() * 4, M + (u() - 0.5) * 2),
        i.quadraticCurveTo(21 + u() * 3, M, 22 + u() * 4, M + _ * (8 + u() * 10)),
        i.stroke());
    }
    for (let E = 0; E < 60; E++) {
      let M = -34 + u() * 62,
        _ = -8 + u() * 34,
        T = 0.6 + u() * 2.5,
        w = (u() - 0.5) * 0.5;
      ((i.strokeStyle = `rgba(0,0,255,${0.15 + u() * 0.3})`),
        (i.lineWidth = 0.12 + u() * 0.2),
        i.beginPath(),
        i.moveTo(M, _),
        i.lineTo(M + Math.cos(w) * T, _ + Math.sin(w) * T),
        i.stroke());
    }
    let g = new Rs(t);
    return (
      (g.flipY = !1),
      (g.colorSpace = ci),
      (g.wrapS = g.wrapT = Vi),
      (g.minFilter = yn),
      (g.magFilter = x0),
      (g.generateMipmaps = !0),
      (g.anisotropy = e),
      (g.needsUpdate = !0),
      g
    );
  }
  export var TP = `
uniform float uTime, uRain, uWetG, uReflOn, uReflLod, uMarkRes, uMaskRes;
uniform sampler2D uMask, uMarks, uDetail, uDetailN, uRefl;
uniform vec3 uMaskRect; uniform vec4 uMarkRect; uniform mat4 uReflMatrix; uniform vec2 uReflScale;
varying vec3 vGWorld;
float gRough; vec2 gNxz; float gPuddle; float gWet; float gFilm; float gSoak;
vec3 gHash3(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); q += dot(q, q.yzx + 33.33); return fract((q.xxy + q.yzz) * q.zyx); }
float gH1(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float gVN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(gH1(i), gH1(i + vec2(1.0, 0.0)), f.x), mix(gH1(i + vec2(0.0, 1.0)), gH1(i + vec2(1.0, 1.0)), f.x), f.y); }
// 4-tap B-spline bicubic of the base level: no texel edge of a data map can ever show, however close the camera is
vec4 gBicubic(sampler2D t, vec2 uv, float res){
  vec2 p = uv * res - 0.5; vec2 i = floor(p); vec2 f = p - i; vec2 f2 = f * f, f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0, w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0, w3 = f3 / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3;
  vec2 h0 = (i + w1 / g0 - 0.5) / res, h1 = (i + w3 / g1 + 1.5) / res;
  return (textureLod(t, vec2(h0.x, h0.y), 0.0) * g0.x + textureLod(t, vec2(h1.x, h0.y), 0.0) * g1.x) * g0.y
       + (textureLod(t, vec2(h0.x, h1.y), 0.0) * g0.x + textureLod(t, vec2(h1.x, h1.y), 0.0) * g1.x) * g1.y;
}
// one sparse layer of rain rings: every cell gets a new drop (position, size, strength) each cycle, thin soft crest
// that fades as it expands. Returns a slope (xz) contribution.
vec2 gRipple(vec2 p, float t, float cell, float seed){
  vec2 q = p / cell + seed * 17.3; vec2 id = floor(q); vec2 f = fract(q);
  vec3 h0 = gHash3(id + seed);
  float tt = t * (0.5 + 0.55 * h0.x) + h0.y * 9.0;
  float cyc = floor(tt), life = fract(tt);
  vec3 h = gHash3(id + seed + cyc * 7.31);
  vec3 hc = gHash3(id.yx + cyc * 3.71 + seed * 5.0);
  float on = step(h.z, 0.16 + 0.5 * uRain);
  float rmax = mix(0.1, 0.36, h.x * h.x);
  vec2 c = mix(vec2(rmax + 0.05), vec2(0.95 - rmax), hc.xy);
  vec2 dv = (f - c) * cell; float d = length(dv);
  float r = life * rmax * cell;
  float w = 0.005 + 0.02 * life;
  float x = (d - r) / w;
  float ring = x * exp(-x * x) * 2.3;
  float amp = 1.0 - life; amp = amp * amp * on * mix(0.3, 1.0, h.y) * smoothstep(0.0, 0.06, life);
  return (dv / max(d, 1e-4)) * ring * amp;
}
`,
    AP = `
{
  vec2 gxz = vGWorld.xz;
  float gDist = length(cameraPosition - vGWorld);
  // ---- unique large-scale masks (puddle height, dampness, oil, wear) ----
  vec2 muv = (gxz - uMaskRect.xy) * uMaskRect.z;
  float mIn = smoothstep(0.0, 0.05, min(min(muv.x, 1.0 - muv.x), min(muv.y, 1.0 - muv.y)));
  vec4 mk = mix(vec4(0.66, 0.5, 0.0, 0.5), gBicubic(uMask, muv, uMaskRes), mIn);
  // ---- tiling detail ----
  vec4 d1 = texture2D(uDetail, gxz * 0.21);
  vec4 d2 = texture2D(uDetail, gxz * 1.37 + 0.37);
  vec4 n1 = texture2D(uDetailN, gxz * 1.37 + 0.37);
  vec4 n0 = texture2D(uDetailN, gxz * 0.21);
  float grain = d2.r;
  // ---- slabs: 6 m expansion joints with tar sealing ----
  vec2 sj = gxz / 6.0;
  vec2 sf = (0.5 - abs(fract(sj) - 0.5)) * 6.0;
  float jd = min(sf.x, sf.y) + (d1.a - 0.5) * 0.035;
  float jaa = fwidth(jd) + 1e-5;
  float tarW = 0.022 + 0.03 * d1.g;
  float tar = (1.0 - smoothstep(tarW - jaa, tarW + jaa, jd)) * clamp(tarW / jaa, 0.0, 1.0);
  float groove = (1.0 - smoothstep(0.004, 0.012 + jaa, jd)) * clamp(0.02 / jaa, 0.0, 1.0);
  vec2 sid = floor(sj);
  float sh = fract(sin(dot(sid, vec2(127.1, 311.7))) * 43758.5453);
  float sh2 = fract(sh * 7.31 + 0.13);
  // ---- cracks, some sealed with tar ----
  float crArea = smoothstep(0.6, 0.76, mk.a * 0.7 + sh * 0.45);
  float cfw = fwidth(d1.b) * 1.5 + 0.004;
  float crack = smoothstep(0.955 - cfw, 0.975, d1.b) * crArea;
  float seal = smoothstep(0.915 - cfw, 0.94, d1.b) * crArea * step(0.72, sh2);
  // ---- base albedo: worn asphalt in the yard, concrete slabs on the quay ----
  float conc = smoothstep(15.6, 16.6, gxz.x + (d1.g - 0.5) * 0.6);
  vec3 alb = mix(vec3(0.125, 0.125, 0.13), vec3(0.22, 0.215, 0.2), conc);
  alb *= (0.8 + 0.4 * sh2) * (0.8 + 0.4 * d1.g) * (0.62 + 0.76 * grain);
  alb += vec3(0.11, 0.105, 0.095) * smoothstep(0.58, 0.78, d2.a) * (1.0 - conc * 0.6);    // pale aggregate
  float polish = smoothstep(0.38, 0.72, mk.a);                                            // traffic-polished lanes
  alb *= mix(1.0, 0.78, polish);
  alb = mix(alb, vec3(0.018, 0.018, 0.02), max(max(tar, seal * 0.4) * 0.94, crack * 0.9));
  alb *= 1.0 - 0.62 * mk.b;                                                               // oil
  // ---- painted markings (worn, chipped) + tyre rubber ----
  vec2 kuv = (gxz - uMarkRect.xy) * uMarkRect.zw;
  float kIn = step(0.0, kuv.x) * step(kuv.x, 1.0) * step(0.0, kuv.y) * step(kuv.y, 1.0);
  vec3 mp = texture2D(uMarks, kuv).rgb;
  float kpx = max(fwidth(kuv.x), fwidth(kuv.y)) * uMarkRes;
  if (kpx < 1.0) mp = mix(gBicubic(uMarks, kuv, uMarkRes).rgb, mp, smoothstep(0.5, 1.0, kpx));   // magnified: no texel blocks
  mp *= kIn;
  float kw = clamp(kpx * 0.5, 0.16, 0.5);
  // chips: world-space procedural noise down to sub-centimetre (never the texels of a map)
  float chipN = 0.5;
  if (max(mp.r, mp.g) > 0.02) {
    float cf2 = 1.0 - smoothstep(6.0, 18.0, gDist), cf3 = 1.0 - smoothstep(2.5, 7.0, gDist);
    chipN = gVN(gxz * 17.0) * 0.45 + mix(0.5, gVN(gxz * 57.0 + 11.0), cf2) * 0.33 + mix(0.5, gVN(gxz * 181.0 + 5.0), cf3) * 0.22;
  }
  float chip = chipN * 0.62 + d1.a * 0.38;
  float wear = clamp(mk.a * 1.25 - 0.22 + mp.b * 0.6, 0.0, 1.0);
  float wt = mix(0.24, 0.55, wear);
  float keep = smoothstep(wt - 0.045, wt + 0.045, chip) * (1.0 - max(tar, crack));
  float eN = (chipN - 0.5) * 0.55 * (1.0 - kw * 2.0);
  float pY = smoothstep(0.5 - kw, 0.5 + kw, mp.r + eN) * keep;
  float pW = smoothstep(0.5 - kw, 0.5 + kw, mp.g + eN) * keep;
  alb *= 1.0 - 0.6 * mp.b * (1.0 - 0.5 * conc);
  float fade = 0.72 + 0.28 * d1.g;
  alb = mix(alb, vec3(0.52, 0.34, 0.035) * fade, pY * 0.94);
  alb = mix(alb, vec3(0.47, 0.47, 0.44) * fade, pW * 0.94);
  float paint = max(pY, pW);
  // ---- water: one continuous gradient  standing water -> soaked band -> damp -> drier patches ----
  // organic shoreline: world-space noise (40 / 15 / 5 cm) on the water-level comparison, independent of the mask res
  float sf2 = 1.0 - smoothstep(25.0, 60.0, gDist), sf3 = 1.0 - smoothstep(8.0, 22.0, gDist);
  float sn1 = gVN(gxz * 2.5 + 3.0), sn2 = mix(0.5, gVN(gxz * 6.7 + 17.0), sf2), sn3 = mix(0.5, gVN(gxz * 20.0 + 9.0), sf3);
  float sn = sn1 * 0.5 + sn2 * 0.3 + sn3 * 0.2;
  float depth = 0.5 - mk.r + (sn - 0.5) * 0.11 + (d1.g - 0.5) * 0.03 + (grain - 0.5) * 0.012 + groove * 0.04 + crack * 0.02 - paint * 0.01;
  float puddle = smoothstep(0.0, 0.035, depth) * uWetG;                 // mirror weight (~5 cm ramp)
  float deep = smoothstep(0.0, 0.22, depth);                           // 0 at the rim (bed shows) .. 1 a hand deep
  float bandW = 0.05 + 0.15 * sn1 * sn1 + 0.05 * d1.g;                  // soaked band, roughly 10-30 cm, varies along the shore
  float soak = smoothstep(-bandW, 0.0, depth) * uWetG;
  float fringe = smoothstep(-0.65, -0.02, depth);                      // damp halo, about a metre
  float dryP = 1.0 - smoothstep(0.2, 0.42, mk.g + fringe * 0.55 + (d1.g - 0.5) * 0.25 + (sn - 0.5) * 0.12);
  float damp = (1.0 - dryP) * uWetG;
  float wet = clamp(damp * 0.7 + soak * 0.3, 0.0, 1.0);
  float film = clamp(soak * (1.0 - smoothstep(0.35, 0.95, grain + (1.0 - soak) * 0.6)) + groove * 0.5, 0.0, 1.0) * (1.0 - paint * 0.4);
  alb *= mix(0.95, mix(0.7, 0.54, 1.0 - paint), damp);
  alb *= mix(1.0, 0.5, soak);
  // standing water: shallow rim shows the wet bed, deeper water goes murky and dark (never a black cut-out)
  alb = mix(alb, alb * mix(0.85, 0.4, deep) + vec3(0.004, 0.006, 0.0065) * deep, puddle);
  diffuseColor.rgb *= alb;
  // ---- roughness: dry ~0.72 -> damp 0.36..0.56 -> soaked 0.1..0.2 -> water 0.055, all smooth ramps ----
  float rough = mix(0.74, 0.42, damp) + (grain - 0.5) * 0.24 + (d1.g - 0.5) * 0.16 + conc * 0.03 - paint * 0.05;
  rough -= polish * 0.07 + mk.b * 0.16 + max(tar, seal) * 0.1;
  rough = mix(rough, 0.2 + (grain - 0.5) * 0.14, soak * 0.9);
  rough = mix(rough, 0.13, film * 0.8);
  rough += smoothstep(10.0, 80.0, gDist) * 0.04;
  rough = mix(clamp(rough, 0.1, 1.0), 0.055, puddle);
  // ---- normal (world xz slope): aggregate grain + lumps break up the mirror outside puddles ----
  vec2 nxz = (n1.rg - 0.5) * mix(2.1, 0.7, max(film, soak * 0.6)) + (n0.ba - 0.5) * 0.3;
  nxz *= 1.0 - puddle;
  float wsum = puddle + film * 0.2;
  vec2 wv = texture2D(uDetailN, gxz * 0.13 + uTime * vec2(0.031, 0.017)).ba - 0.5;
  vec2 wv2 = texture2D(uDetailN, gxz.yx * 0.31 - uTime * vec2(0.043, 0.027)).ba - 0.5;
  if (wsum > 0.004) {
    float rf = 1.0 - smoothstep(10.0, 34.0, gDist);
    vec2 rip = vec2(0.0);
    if (rf > 0.0) {
      vec2 gp2 = vec2(0.8 * gxz.x - 0.6 * gxz.y, 0.6 * gxz.x + 0.8 * gxz.y);
      vec2 r2 = gRipple(gp2, uTime * 0.87, 1.31, 2.0);
      rip = gRipple(gxz, uTime, 0.83, 1.0) + vec2(0.8 * r2.x + 0.6 * r2.y, -0.6 * r2.x + 0.8 * r2.y) * 0.9 + gRipple(gxz.yx, uTime * 1.13, 0.57, 3.0).yx * 0.6;
      rip *= rf * (0.3 + 0.7 * uRain) * 0.3 * smoothstep(0.0, 0.08, depth);
    }
    nxz += (rip + (wv * 0.03 + wv2 * 0.018) * (0.4 + 0.6 * deep)) * wsum;
    rough += (1.0 - rf) * 0.03 * puddle * uRain;
  }
  gSoak = soak;
  gRough = rough; gNxz = nxz; gPuddle = puddle; gWet = wet; gFilm = film;
}
`,
    RP = `
{
  vec3 gV = normalize(cameraPosition - vGWorld);
  vec4 rc = uReflMatrix * vec4(vGWorld.x, 0.0, vGWorld.z, 1.0);
  vec2 ruv = rc.xy / max(rc.w, 1e-4);
  vec2 gf = normalize(-gV.xz + vec2(1e-5)); vec2 gs = vec2(-gf.y, gf.x);
  float sinE = clamp(gV.y, 0.03, 1.0);
  float dk = (gPuddle + gFilm * 0.15 + 0.03) / (1.0 + length(cameraPosition - vGWorld) * 0.07);
  vec2 tilt = vec2(dot(gNxz, gs) * sinE, dot(gNxz, gf)) * dk;
  tilt = clamp(tilt, vec2(-0.12), vec2(0.12));
  ruv += tilt * uReflScale;
  float r = material.roughness;
  // puddles: sharp mirror. Damp asphalt: only a heavily blurred, vertically stretched reflection that tightens a
  // little at grazing angles (so it reads as a sheen, not as a second mirror)
  float graz = pow(1.0 - clamp(gV.y, 0.0, 1.0), 5.0);
  float lodP = clamp(r * 9.5 - 0.45, 0.0, 6.5) + 0.9;      // puddles: a touch soft, never razor sharp
  float lodD = clamp(3.0 + r * 6.5 - 3.4 * graz, 2.0, 7.5);
  float lod = mix(mix(lodD, min(lodD, 2.6 + r * 5.0), gSoak), lodP, gPuddle) + uReflLod;
  vec2 st = vec2(0.0, r * 0.11 + (1.0 - gPuddle) * 0.05);
  vec2 lo = vec2(0.002), hi = vec2(0.998);
  vec3 pr = textureLod(uRefl, clamp(ruv, lo, hi), lod).rgb * 0.5
          + textureLod(uRefl, clamp(ruv + st, lo, hi), lod + 0.6).rgb * 0.25
          + textureLod(uRefl, clamp(ruv - st * 0.6, lo, hi), lod + 0.6).rgb * 0.25;
  pr = min(pr, vec3(48.0));
  float pw = mix(1.0 - smoothstep(0.55, 0.9, r), 1.0, max(gPuddle, gSoak)) * uReflOn;
  radiance = mix(radiance, pr, pw);
}
`;
  export function Nw(n, e) {
    let t = {
        uTime: { value: 0 },
        uRain: { value: 0.6 },
        uWetG: (n.mats && n.mats.uniforms && n.mats.uniforms.wet) || { value: 1 },
        uReflOn: { value: 0 },
        uReflLod: { value: 0 },
        uMarkRes: { value: e.marks.image.width },
        uMaskRes: { value: e.mask.image.width },
        uMask: { value: e.mask },
        uMarks: { value: e.marks },
        uDetail: { value: e.detail },
        uDetailN: { value: e.detailN },
        uRefl: { value: e.black },
        uMaskRect: { value: new K(Fi.x0, Fi.z0, 1 / Fi.size) },
        uMarkRect: { value: new Jt(Ha.x0, Ha.z0, 1 / Ha.w, 1 / Ha.h) },
        uReflMatrix: { value: new Je() },
        uReflScale: { value: new We(0.5, 0.5) },
      },
      i = new L0({ color: 16777215, roughness: 1, metalness: 0 });
    ((i.name = "apron_wet"),
      (i.onBeforeCompile = (r) => {
        (Object.assign(r.uniforms, t),
          (r.vertexShader =
            `varying vec3 vGWorld;
` +
            r.vertexShader.replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
  vGWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
            )),
          (r.fragmentShader = r.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>
` + TP,
            )
            .replace("#include <map_fragment>", AP)
            .replace("#include <roughnessmap_fragment>", "float roughnessFactor = gRough;")
            .replace(
              "#include <normal_fragment_maps>",
              `#include <normal_fragment_maps>
  normal = normalize(mat3(viewMatrix) * normalize(vec3(-gNxz.x, 1.0, -gNxz.y)));`,
            )
            .replace(
              "#include <lights_physical_fragment>",
              `#include <lights_physical_fragment>
  material.specularColor = mix(material.specularColor, vec3(0.075), max(gPuddle, gSoak * 0.5));`,
            )
            .replace(
              "#include <lights_fragment_maps>",
              `#include <lights_fragment_maps>
` + RP,
            )
            .replace(
              "#include <lights_fragment_end>",
              `#include <lights_fragment_end>
  reflectedLight.directSpecular = min(reflectedLight.directSpecular, vec3(40.0));`,
            )));
      }),
      (i.customProgramCacheKey = () => "saltline-apron-3"));
    let s = new w0(190, 320, 1, 1).rotateX(-Math.PI / 2).translate(-65, 0, 0),
      o = new ht(s, i);
    return (
      (o.receiveShadow = !0),
      (o.castShadow = !1),
      (o.name = "apron"),
      (o.matrixAutoUpdate = !1),
      o.updateMatrix(),
      { mesh: o, material: i, uniforms: t }
    );
  }
  export function Uw(n, e, t) {
    let i = new zn();
    (i.layers.set(0), (i.matrixAutoUpdate = !0));
    let s = new Zn(16, 16, {
      type: ro,
      format: $0,
      colorSpace: Wr,
      minFilter: yn,
      magFilter: x0,
      generateMipmaps: !0,
      depthBuffer: !0,
      stencilBuffer: !1,
      samples: 0,
    });
    s.texture.name = "planarReflection";
    let o = new K(),
      r = new K(),
      a = new Je(),
      l = new We(),
      c = new wo(),
      u = new Jt(),
      f = new Jt(),
      h = new Je().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1),
      p = [],
      d = { target: s, camera: i, enabled: !0, active: !1 };
    function m(x, v, y) {
      let b = n.quality.planar || 0;
      if (!d.enabled || b <= 0) {
        ((e.uReflOn.value = 0), (d.active = !1));
        return;
      }
      if ((o.setFromMatrixPosition(y.matrixWorld), o.y < 0.03)) {
        ((e.uReflOn.value = 0), (d.active = !1));
        return;
      }
      let g = n.render && n.render.resolution;
      g && g.x > 8 ? l.copy(g) : x.getDrawingBufferSize(l);
      let E = Math.max(64, Math.round((l.x * b) / 16) * 16),
        M = Math.max(32, Math.round((l.y * b) / 8) * 8);
      ((s.width !== E || s.height !== M) && s.setSize(E, M),
        a.extractRotation(y.matrixWorld),
        r.set(0, 0, -1).applyMatrix4(a).add(o),
        i.position.set(o.x, -o.y, o.z),
        i.up.set(0, 1, 0).applyMatrix4(a),
        (i.up.y = -i.up.y),
        (r.y = -r.y),
        i.lookAt(r),
        (i.near = y.near),
        (i.far = y.far),
        i.updateMatrixWorld(!0),
        i.matrixWorldInverse.copy(i.matrixWorld).invert(),
        i.projectionMatrix.copy(y.projectionMatrix),
        e.uReflMatrix.value.copy(h).multiply(i.projectionMatrix).multiply(i.matrixWorldInverse),
        c.normal.set(0, 1, 0),
        (c.constant = 0.01),
        c.applyMatrix4(i.matrixWorldInverse),
        u.set(c.normal.x, c.normal.y, c.normal.z, c.constant));
      let _ = i.projectionMatrix.elements;
      ((f.x = (Math.sign(u.x) + _[8]) / _[0]),
        (f.y = (Math.sign(u.y) + _[9]) / _[5]),
        (f.z = -1),
        (f.w = (1 + _[10]) / _[14]),
        u.multiplyScalar(2 / u.dot(f)),
        (_[2] = u.x),
        (_[6] = u.y),
        (_[10] = u.z + 1),
        (_[14] = u.w),
        i.projectionMatrixInverse.copy(i.projectionMatrix).invert());
      let T = y.projectionMatrix.elements;
      (e.uReflScale.value.set(T[0] * 0.5, T[5] * 0.5), (e.uReflLod.value = Math.log2(Math.max(M, 1) / 270)));
      for (let w = 0; w < t.length; w++) ((p[w] = t[w].visible), (t[w].visible = !1));
      try {
        n.render.renderWorld(i, s);
      } finally {
        for (let w = 0; w < t.length; w++) t[w].visible = p[w];
      }
      ((e.uRefl.value = s.texture), (e.uReflOn.value = 1), (d.active = !0));
    }
    return ((d.pass = m), d);
  }
  export var Og = [
      [-0.92, 0.39, 9.5, 0.06],
      [-0.75, -0.66, 5.7, 0.04],
      [-0.99, 0.12, 3.3, 0.026],
      [-0.5, 0.87, 2, 0.016],
    ],
    Bw = [
      [-0.8, 0.6, 1.31, 0.02],
      [-0.95, -0.31, 0.83, 0.014],
      [-0.35, -0.94, 0.57, 0.01],
      [-0.6, 0.8, 0.39, 0.007],
      [-1, 0.05, 0.27, 0.005],
      [0.3, 0.95, 0.47, 0.006],
      [-0.86, -0.51, 0.21, 0.0035],
    ];
  for (let n of Og.concat(Bw)) {
    let e = Math.hypot(n[0], n[1]);
    ((n[0] /= e), (n[1] /= e), (n[4] = (2 * Math.PI) / n[2]), (n[5] = Math.sqrt(9.81 * n[4])));
  }
  export var ui = (n) => (Number.isInteger(n) ? n.toFixed(1) : n.toFixed(5));
  export function Hw(n, e, t) {
    let i = 1 - ks.smoothstep(Math.hypot(n - 30, e), 50, 220),
      s = 0;
    for (let o of Og) s += o[3] * Math.sin(o[4] * (o[0] * n + o[1] * e) - o[5] * t);
    return Kn.seaY + s * i;
  }
  export var CP = Og.map(
      (n) =>
        `  { float ph = ${ui(n[4])} * dot(vec2(${ui(n[0])}, ${ui(n[1])}), swp.xz) - ${ui(n[5])} * uTime; sdisp.y += ${ui(n[3])} * sin(ph); sdisp.xz += vec2(${ui(n[0])}, ${ui(n[1])}) * (${ui(n[3] * 0.6)} * cos(ph)); }`,
    ).join(`
`),
    kP = Og.map(
      (n) =>
        `  slopeA += vec2(${ui(n[0])}, ${ui(n[1])}) * (${ui(n[3] * n[4])} * cos(${ui(n[4])} * dot(vec2(${ui(n[0])}, ${ui(n[1])}), sxz) - ${ui(n[5])} * uTime));`,
    ).join(`
`),
    PP = Bw.map(
      (n) =>
        `  slopeB += vec2(${ui(n[0])}, ${ui(n[1])}) * (${ui(n[3] * n[4])} * cos(${ui(n[4])} * dot(vec2(${ui(n[0])}, ${ui(n[1])}), sxz) - ${ui(n[5])} * uTime));`,
    ).join(`
`),
    IP = `
uniform float uTime; uniform sampler2D uDetail, uDetailN; uniform vec3 uHazeA, uHazeB, uSunDirW;
varying vec3 vGWorld; varying float vSAmp;
float gRough; vec2 gNxz; float gOcc; float gSDist; float gSpark;
`,
    zP = `
{
  vec2 sxz = vGWorld.xz;
  float sd = length(cameraPosition - vGWorld); gSDist = sd;
  vec2 slopeA = vec2(0.0), slopeB = vec2(0.0);
${kP}
${PP}
  float nearB = 1.0 - smoothstep(25.0, 110.0, sd);
  vec2 t1 = texture2D(uDetailN, sxz * 0.113 + uTime * vec2(-0.021, 0.009)).ba - 0.5;
  vec2 t2 = texture2D(uDetailN, sxz * 0.031 + uTime * vec2(-0.007, -0.004)).ba - 0.5;
  vec2 t3 = texture2D(uDetailN, sxz.yx * 0.39 + uTime * vec2(0.031, -0.027)).ba - 0.5;
  gNxz = slopeA * vSAmp + slopeB * nearB + t1 * 0.2 + t2 * 0.24 + t3 * 0.1 * nearB;
  // foam / scum along the quay wall (x = 30) and around the moored hull x[33,49] z[-60,-9]
  float dq = sxz.x - 30.0;
  vec2 hq = abs(sxz - vec2(41.0, -34.5)) - vec2(4.0, 21.5);
  float dh = length(max(hq, 0.0)) + min(max(hq.x, hq.y), 0.0) - 4.0;
  float de = min(dq, dh);
  vec4 fn = texture2D(uDetail, sxz * 0.41 + uTime * vec2(-0.012, 0.007));
  vec4 fn2 = texture2D(uDetail, sxz * 0.093 + uTime * vec2(0.004, 0.003));
  float band = 1.0 - smoothstep(0.0, 0.2 + fn2.g * fn2.g * 2.2, de);
  float foam = clamp(band * smoothstep(0.5, 0.68, fn.a * 0.55 + fn.r * 0.25 + fn2.g * 0.3 + band * 0.2), 0.0, 1.0) * step(-0.3, de);
  float scum = (1.0 - smoothstep(0.0, 5.0, de)) * smoothstep(0.4, 0.7, fn2.g);
  vec3 alb = vec3(0.0045, 0.013, 0.017);
  alb = mix(alb, vec3(0.03, 0.04, 0.034), scum * 0.6);
  alb = mix(alb, vec3(0.3, 0.32, 0.3), foam * 0.7);
  diffuseColor.rgb *= alb;
  // wind structure: broad cat's-paw patches (ruffled, darker, duller) between calmer slicks, plus long swell shading
  vec4 fn3 = texture2D(uDetail, sxz * 0.0123 + uTime * vec2(0.0016, 0.0011));
  float gust = smoothstep(0.38, 0.62, fn2.g * 0.45 + fn3.g * 0.75 - 0.1);
  float swell = sin(dot(sxz, vec2(-0.118, 0.05)) - uTime * 0.55 + fn3.a * 5.0) * 0.5 + 0.5;
  gNxz = gNxz * mix(0.4, 1.35, gust) + vec2(-0.92, 0.39) * (swell - 0.5) * 0.07;
  gSpark = mix(0.55, 1.0, swell) * mix(1.0, 0.6, gust);
  diffuseColor.rgb *= mix(1.0, 0.6, gust);
  gRough = mix(mix(0.1, 0.32, smoothstep(12.0, 380.0, sd)) * mix(0.62, 1.5, gust), 0.65, max(foam, scum * 0.3));
  gNxz *= 1.0 - foam * 0.6;
  gOcc = mix(0.3, 1.0, smoothstep(0.0, 8.0, de)) * mix(0.8, 1.05, swell);
}
`,
    DP = `
{
  vec3 sdir = normalize(vGWorld - cameraPosition);
  float toSun = pow(max(dot(normalize(sdir.xz + vec2(1e-5)), normalize(uSunDirW.xz)), 0.0), 3.0);
  vec3 hz = mix(uHazeA, uHazeB, toSun);
  outgoingLight = mix(outgoingLight, hz, smoothstep(220.0, 860.0, gSDist) * 0.8);
}
`;
  export function Dv(n, e, t, i, s) {
    let o = [n],
      r = n,
      a = t;
    for (; r < e - 0.001;) ((r = Math.min(e, r + a)), o.push(r), (a = Math.min(s, a * i)));
    return o;
  }
  export function Ow(n, e) {
    let t = Kn.seaY,
      i = Dv(27.5, 880, 0.75, 1.075, 120),
      s = Dv(48, 880, 0.9, 1.085, 120),
      r = s
        .map((_) => -_)
        .reverse()
        .concat(Dv(-48 + 0.9, 48 - 0.9, 0.9, 1, 0.9), s.slice(0)),
      a = i.length,
      l = r.length,
      c = 12,
      u = new Float32Array((a * l + c) * 3),
      f = [],
      h = 0;
    for (let _ = 0; _ < l; _++) for (let T = 0; T < a; T++) ((u[h++] = i[T]), (u[h++] = t), (u[h++] = r[_]));
    for (let _ = 0; _ < l - 1; _++)
      for (let T = 0; T < a - 1; T++) {
        let w = _ * a + T,
          S = w + 1,
          R = w + a,
          z = R + 1;
        f.push(w, R, S, S, R, z);
      }
    let p = (_, T, w, S) => {
      let R = h / 3;
      for (let [z, I] of [
        [_, T],
        [w, T],
        [_, S],
        [w, S],
      ])
        ((u[h++] = z), (u[h++] = t), (u[h++] = I));
      f.push(R, R + 2, R + 1, R + 1, R + 2, R + 3);
    };
    (p(-880, -880, 27.5, -158), p(-880, 158, 27.5, 880), p(-880, -158, -158, 158));
    let d = new pt();
    d.setAttribute("position", new nt(u, 3));
    let m = new Float32Array(u.length);
    for (let _ = 1; _ < m.length; _ += 3) m[_] = 1;
    (d.setAttribute("normal", new nt(m, 3)), d.setIndex(f), (d.boundingSphere = new an(new K(0, t, 0), 1300)));
    let x = T0.horizonAway.clone().multiplyScalar(0.85),
      v = T0.horizon.clone().multiplyScalar(0.8),
      y = {
        uTime: { value: 0 },
        uDetail: { value: e.detail },
        uDetailN: { value: e.detailN },
        uHazeA: { value: x },
        uHazeB: { value: v },
        uSunDirW: { value: Z0.dir.clone() },
      },
      b = new L0({ color: 16777215, roughness: 0.1, metalness: 0 });
    ((b.name = "sea"),
      (b.onBeforeCompile = (_) => {
        (Object.assign(_.uniforms, y),
          (_.vertexShader =
            `uniform float uTime; varying vec3 vGWorld; varying float vSAmp;
` +
            _.vertexShader.replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
  vec3 swp = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vSAmp = 1.0 - smoothstep(50.0, 220.0, distance(swp.xz, vec2(30.0, 0.0)));
  vec3 sdisp = vec3(0.0);
${CP}
  transformed += sdisp * vSAmp;
  vGWorld = swp;`,
            )),
          (_.fragmentShader = _.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>
` + IP,
            )
            .replace("#include <map_fragment>", zP)
            .replace("#include <roughnessmap_fragment>", "float roughnessFactor = gRough;")
            .replace(
              "#include <normal_fragment_maps>",
              `#include <normal_fragment_maps>
  normal = normalize(mat3(viewMatrix) * normalize(vec3(-gNxz.x, 1.0, -gNxz.y)));`,
            )
            .replace(
              "#include <lights_fragment_maps>",
              `#include <lights_fragment_maps>
  radiance *= gOcc; iblIrradiance *= gOcc;`,
            )
            .replace(
              "#include <lights_fragment_end>",
              `#include <lights_fragment_end>
  { // sun glitter: strongest along the sun's azimuth, calmer to the sides; broken by swell and cat's paws
    vec3 sv = normalize(vGWorld - cameraPosition);
    float az = max(dot(normalize(sv.xz + vec2(1e-5)), normalize(uSunDirW.xz)), 0.0);
    reflectedLight.directSpecular = min(reflectedLight.directSpecular, vec3(40.0)) * gSpark * mix(0.3, 1.0, az * az * az);
  }`,
            )
            .replace(
              "#include <opaque_fragment>",
              DP +
                `
#include <opaque_fragment>`,
            )));
      }),
      (b.customProgramCacheKey = () => "saltline-sea-1"));
    let g = new ht(d, b);
    ((g.name = "sea"), (g.receiveShadow = !0), (g.castShadow = !1), (g.frustumCulled = !1), (g.matrixAutoUpdate = !1));
    let E = new L0({ color: 724238, roughness: 0.55, metalness: 0 }),
      M = new ht(new w0(320, 4.4).rotateY(Math.PI / 2).translate(29.88, -2.18, 0), E);
    return ((M.name = "quaySkirt"), (M.receiveShadow = !0), (M.matrixAutoUpdate = !1), { mesh: g, skirt: M, uniforms: y, material: b });
  }
  export var Ww = `
uniform vec3 uBoxMin[4]; uniform vec3 uBoxMax[4];
bool wInside(vec3 p){
  for (int i = 0; i < 4; i++) { if (all(greaterThan(p, uBoxMin[i])) && all(lessThan(p, uBoxMax[i]))) return true; }
  return false;
}
float wPhase(float c){ float g = 0.72; return (1.0 - g * g) / (12.566 * pow(1.0 + g * g - 2.0 * g * c, 1.5)); }
`,
    LP = `
uniform float uTime, uRain, uPix, uDrip; uniform vec3 uVel, uBox, uSunDir, uSunCol, uAmb;
attribute vec4 aSeed;
varying vec3 vCol; varying float vA; varying vec2 vUv;
${Ww}
uniform vec4 uSky[8];   // roof openings (x, z, half w, half d): rain falls through these into the shed
bool wSky(vec3 p){
  for (int i = 0; i < 8; i++) { if (abs(p.x - uSky[i].x) < uSky[i].z && abs(p.z - uSky[i].y) < uSky[i].w) return true; }
  return false;
}
void main(){
  vUv = position.xy;
  float sp = 0.82 + 0.36 * aSeed.w;
  vec3 vel = uVel * sp;
  vec3 p; float len; float kill = 0.0;
  if (aSeed.w < 0.0) {                       // eave drip line (shed south eave), free-fall from 7 m
    float T = 1.19; float t = fract(uTime / T * (0.9 + 0.2 * aSeed.y) + aSeed.z) * T;
    p = vec3(mix(-16.0, 12.0, aSeed.x), 7.0 - 4.9 * t * t, -10.72 + 0.05 * sin(aSeed.x * 911.0));
    vel = vec3(0.0, -9.81 * t - 0.3, 0.0); len = 0.022 * length(vel) + 0.03;
    kill = 1.0 - uDrip;
    if (fract(aSeed.x * 37.7) > 0.55 + 0.45 * uRain) kill = 1.0;
  } else {
    p = aSeed.xyz * uBox + vel * uTime;
    p = mod(p - cameraPosition + 0.5 * uBox, uBox) - 0.5 * uBox + cameraPosition;
    len = 0.03 * length(vel);
    if (fract(aSeed.w * 7.13 + aSeed.x) > uRain) kill = 1.0;
    if (wInside(p) && !wSky(p)) kill = 1.0;
  }
  if (p.y < (p.x > 30.0 ? -1.6 : 0.0)) kill = 1.0;
  vec3 dir = normalize(vel);
  vec3 toP = p - cameraPosition; float dist = length(toP);
  vec3 side = normalize(cross(dir, toP));
  float w0 = 0.005 + 0.004 * fract(aSeed.w * 3.7);
  float w = max(w0, dist * uPix * 0.75);
  vec3 wp = p + dir * (len * (position.y - 0.5)) + side * (w * position.x);
  float a = (w0 / w) * smoothstep(0.7, 2.6, dist) * (1.0 - smoothstep(0.38, 0.5, dist / uBox.x));
  float c = dot(toP / max(dist, 1e-3), uSunDir);
  vCol = uAmb + uSunCol * wPhase(c);
  vA = a * (0.55 + 0.45 * fract(aSeed.w * 13.3));
  gl_Position = kill > 0.5 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * viewMatrix * vec4(wp, 1.0);
}`,
    FP = `
varying vec3 vCol; varying float vA; varying vec2 vUv;
void main(){
  float x = 1.0 - abs(vUv.x) * 2.0;
  float e = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
  gl_FragColor = vec4(vCol, vA * x * e);
}`,
    NP = `
uniform float uTime, uRain; uniform vec3 uSunDir, uSunCol, uAmb, uMaskRect; uniform sampler2D uMask;
attribute vec4 aSeed;
varying vec3 vCol; varying float vA; varying vec2 vUv; varying float vLife;
${Ww}
vec2 sHash(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
void main(){
  vUv = position.xy;
  float period = 0.26 + 0.14 * aSeed.z;
  float tt = uTime / period + aSeed.w * 10.0; float cyc = floor(tt); float life = fract(tt);
  vec2 r = sHash(aSeed.xy * 91.7 + cyc * 0.371);
  vec2 rr = r - 0.5; rr *= 0.35 + 1.3 * abs(rr);                    // denser near the player
  vec2 snap = floor(cameraPosition.xz / 4.0) * 4.0;
  vec3 p = vec3(snap.x + rr.x * 30.0, 0.0, snap.y + rr.y * 30.0);
  float kill = 0.0;
  vec2 muv = (p.xz - uMaskRect.xy) * uMaskRect.z;
  float inM = step(0.0, muv.x) * step(muv.x, 1.0) * step(0.0, muv.y) * step(muv.y, 1.0);
  float pud = step(textureLod(uMask, muv, 0.0).r, 0.49) * inM;
  float k = fract(aSeed.w * 5.3 + cyc * 0.17);
  if (pud < 0.5 && k > 0.3) kill = 1.0;
  if (k > 0.2 + 0.8 * uRain) kill = 1.0;
  if (p.x > 29.7 || wInside(p + vec3(0.0, 0.2, 0.0))) kill = 1.0;
  float sz = mix(0.04, 0.08, aSeed.z) * mix(0.65, 1.0, pud);
  float wd = sz * (0.7 + 1.5 * life), ht = sz * (0.4 + 1.3 * sin(life * 3.14159));
  vec3 toP = p - cameraPosition; float dist = length(toP);
  vec3 side = normalize(vec3(toP.z, 0.0, -toP.x));
  vec3 wp = p + side * (wd * position.x * 2.0) + vec3(0.0, ht * position.y + 0.004, 0.0);
  float c = dot(toP / max(dist, 1e-3), uSunDir);
  vCol = uAmb * 1.4 + uSunCol * wPhase(c) * 0.8;
  vA = (1.0 - life) * (1.0 - smoothstep(11.0, 15.0, dist)) * mix(0.5, 1.0, pud);
  vLife = life;
  gl_Position = kill > 0.5 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * viewMatrix * vec4(wp, 1.0);
}`,
    UP = `
varying vec3 vCol; varying float vA; varying vec2 vUv; varying float vLife;
void main(){
  float x = vUv.x * 2.0, y = vUv.y;
  // little crown: a rim arc that opens outward, plus a few thrown droplets
  float dome = smoothstep(1.0, 0.25, length(vec2(x * 1.15, y * 1.5)));
  float crown = dome * (0.35 + 0.65 * smoothstep(0.25, 0.75, length(vec2(x, y * 1.4))));
  float core = smoothstep(0.5, 0.0, length(vec2(x * 1.6, (y - 0.25) * 1.6))) * (1.0 - vLife);
  float dots = smoothstep(0.16, 0.05, length(vec2(abs(x) - 0.75, y - 0.82))) + smoothstep(0.14, 0.04, length(vec2(x - 0.2, y - 0.93)));
  float a = clamp(crown * 0.5 + core * 0.8 + dots * 0.0, 0.0, 1.0) * vA * 0.6;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol, a);
}`;
  export function Vw(n, e, t) {
    let i = new Ra();
    (i.setAttribute("position", new nt(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, -0.5, 1, 0, 0.5, 1, 0]), 3)),
      i.setIndex([0, 1, 2, 2, 1, 3]));
    let s = new Float32Array((n + e) * 4);
    for (let o = 0; o < (n + e) * 4; o++) s[o] = t();
    for (let o = n; o < n + e; o++) s[o * 4 + 3] = -1;
    return (i.setAttribute("aSeed", new Xs(s, 4)), (i.instanceCount = n + e), (i.boundingSphere = new an(new K(), 1e5)), i);
  }
  export function Gw(n, e) {
    let t = n.rng && n.rng.fork ? n.rng.fork() : Math.random,
      i = Math.max(0.15, n.quality.rain || 0.5),
      s = Math.round(9e3 * i),
      o = 260,
      r = Math.round(900 * i),
      a = [0, 1, 2, 3].map(() => new K()),
      l = [0, 1, 2, 3].map(() => new K()),
      c = Z0.color.clone().multiplyScalar(1.9),
      u = T0.fog.clone().multiplyScalar(0.15),
      f = {
        uTime: { value: 0 },
        uRain: { value: 0.6 },
        uBoxMin: { value: a },
        uBoxMax: { value: l },
        uSunDir: { value: Z0.dir.clone() },
        uSunCol: { value: c },
        uAmb: { value: u },
      },
      h = [0, 1, 2, 3, 4, 5, 6, 7].map(() => new Jt(0, 0, -1, -1)),
      p = {
        ...f,
        uSky: { value: h },
        uPix: { value: 0.002 },
        uDrip: { value: 0 },
        uVel: { value: new K(-2.6, -9.4, 1.1) },
        uBox: { value: new K(26, 15, 26) },
      },
      d = new vn({ uniforms: p, vertexShader: LP, fragmentShader: FP, transparent: !0, depthWrite: !1, blending: wr, side: ln, fog: !1 }),
      m = new ht(Vw(s, o, t), d);
    ((m.frustumCulled = !1), (m.renderOrder = 900), (m.name = "rain"), (m.matrixAutoUpdate = !1), (m.castShadow = m.receiveShadow = !1));
    let x = { ...f, uMask: { value: e.mask }, uMaskRect: { value: new K(Fi.x0, Fi.z0, 1 / Fi.size) } },
      v = new vn({ uniforms: x, vertexShader: NP, fragmentShader: UP, transparent: !0, depthWrite: !1, blending: wr, side: ln, fog: !1 }),
      y = new ht(Vw(r, 0, t), v);
    ((y.frustumCulled = !1), (y.renderOrder = 890), (y.name = "rainSplash"), (y.matrixAutoUpdate = !1));
    let b = 0.6,
      g = 0.6,
      E = 22 + t() * 25,
      M = 0,
      _ = new We();
    return {
      rain: m,
      splash: y,
      wind: p.uVel.value,
      setRain(w) {
        g = Math.min(1, Math.max(0, w));
      },
      get rainLevel() {
        return b;
      },
      update(w) {
        ((M += w), (b += (g - b) * Math.min(1, w * 0.8)), (f.uTime.value = M), (f.uRain.value = b), (m.visible = y.visible = b > 0.01));
        let S = n.camera;
        if (S) {
          let I = n.render && n.render.resolution;
          (I && I.x > 8 ? _.copy(I) : n.renderer.getDrawingBufferSize(_),
            (p.uPix.value = (2 * Math.tan((S.fov * Math.PI) / 360)) / Math.max(1, _.y)));
        }
        let R = (n.level && n.level.interiorBoxes) || [];
        for (let I = 0; I < 4; I++) {
          let L = R[I];
          L && L.min && L.max
            ? (a[I].set(L.min.x - 0.15, L.min.y - 1, L.min.z - 0.15), l[I].set(L.max.x + 0.15, L.max.y + 0.3, L.max.z + 0.15))
            : (a[I].set(0, 0, 0), l[I].set(0, 0, 0));
        }
        p.uDrip.value = R.length ? 1 : 0;
        let z = (n.level && n.level.skylights) || [];
        for (let I = 0; I < 8; I++) {
          let L = z[I];
          L && L.w > 0 ? h[I].set(L.x, L.z, L.w * 0.5, (L.d || L.w) * 0.5) : h[I].set(0, 0, -1, -1);
        }
        ((E -= w), E <= 0 && ((E = 30 + t() * 30), n.events.emit("thunder", { intensity: 0.3 + 0.7 * t() })));
      },
    };
  }
  export async function Vg(n) {
    let e = (n.quality.tex || 512) >= 1024,
      t = Math.min(8, n.renderer.capabilities.getMaxAnisotropy ? n.renderer.capabilities.getMaxAnisotropy() : 1),
      i = e ? 1024 : 512,
      s = Dw(i),
      o = Hg(s, i, { repeat: !1, aniso: 2 }),
      r = e ? 512 : 256,
      { det: a, nrm: l } = Lw(r),
      c = Hg(a, r, { aniso: t }),
      u = Hg(l, r, { aniso: t });
    try {
      document.fonts &&
        document.fonts.load &&
        (await Promise.race([document.fonts.load('900 40px "Big Shoulders Display"'), new Promise((_) => setTimeout(_, 350))]));
    } catch {}
    let f = Fw(e ? 2048 : 1024, t),
      h = new li(new Uint8Array([0, 0, 0, 255]), 1, 1);
    h.needsUpdate = !0;
    let p = { mask: o, detail: c, detailN: u, marks: f, black: h },
      d = new At();
    d.name = "ground";
    let m = Nw(n, p),
      x = Ow(n, p),
      v = Gw(n, p);
    (d.add(m.mesh, x.mesh, x.skirt, v.rain, v.splash), n.scene.add(d));
    let y = Uw(n, m.uniforms, [m.mesh, x.mesh, v.rain, v.splash]);
    n.render && n.render.addPrePass && n.render.addPrePass(y.pass);
    let b = (_, T) => {
        let w = n.level && n.level.interiorBoxes;
        if (!w) return !1;
        for (let S = 0; S < w.length; S++) {
          let R = w[S];
          if (R && R.min && _ > R.min.x && _ < R.max.x && T > R.min.z && T < R.max.z) return !0;
        }
        return !1;
      },
      g = (_, T) => _ > Fi.x0 && _ < Fi.x0 + Fi.size && T > Fi.z0 && T < Fi.z0 + Fi.size,
      E = 0,
      M = {
        root: d,
        apron: m.mesh,
        sea: x.mesh,
        rain: v.rain,
        planar: y,
        reflectionTarget: y.target,
        reflectionCamera: y.camera,
        maskTexture: o,
        uniforms: m.uniforms,
        puddleDepth(_, T) {
          return _ > Kn.quayX || !g(_, T) || b(_, T) ? -0.2 : 0.5 - Bg(s, i, _, T, 0);
        },
        isPuddle(_, T) {
          return M.puddleDepth(_, T) > 0.015;
        },
        wetnessAt(_, T) {
          if (_ > Kn.quayX) return 1;
          if (b(_, T)) return 0.12;
          if (!g(_, T)) return 0.6;
          let w = 0.5 - Bg(s, i, _, T, 0);
          if (w > 0.015) return 1;
          let S = ks.smoothstep,
            R = S(w, -0.11, 0),
            z = S(w, -0.65, -0.02),
            I = 1 - S(Bg(s, i, _, T, 1) + z * 0.55, 0.2, 0.42);
          return Math.min(0.95, 0.25 + (1 - I) * 0.4 + R * 0.3);
        },
        seaHeight(_, T) {
          return Hw(_, T, E);
        },
        setRain(_) {
          v.setRain(_);
        },
        get rainLevel() {
          return v.rainLevel;
        },
        setReflections(_) {
          y.enabled = !!_;
        },
        update(_) {
          ((E += _), v.update(_), (m.uniforms.uTime.value = E), (m.uniforms.uRain.value = v.rainLevel), (x.uniforms.uTime.value = E));
        },
      };
    return M;
  }
  export async function BP(n) {
    let e = n.scene.children.find(
      (o) => o.isMesh && o.geometry && o.geometry.type === "PlaneGeometry" && o.geometry.parameters && o.geometry.parameters.width === 80,
    );
    (e && n.scene.remove(e), (n.ground = await Vg(n)));
    let t = new At(),
      i = (o, r, a, l, c, u = 0) => {
        let f = new ht(o, r);
        return (f.position.set(a, l, c), (f.rotation.y = u), (f.castShadow = f.receiveShadow = !0), t.add(f), f);
      },
      s = (o) => n.mats.get(o);
    return (
      i(new R0(6.06, 2.59, 2.44), s("paint_red"), 3, 1.295, -0.2),
      i(new R0(6.06, 2.59, 2.44), s("paint_blue"), 9.4, 1.295, -0.2),
      i(new R0(6.06, 2.59, 2.44), s("paint_teal"), 9.4, 3.885, -0.2),
      i(new R0(12.19, 2.59, 2.44), s("paint_yellow"), 3, 1.295, 11.2),
      i(new R0(6.06, 2.59, 2.44), s("paint_white"), 12.4, 1.295, 11.2),
      i(new R0(1.1, 1.1, 1.1), s("paint_orange"), 5.6, 0.55, 4.7, 0.4),
      i(new io(0.29, 0.29, 0.88, 20), s("plastic_blue"), 3.9, 0.44, 6.3),
      i(new io(0.29, 0.29, 0.88, 20), s("steel_rust"), 4.6, 0.44, 6.6),
      i(new io(0.06, 0.06, 5, 10), s("steel_galv"), 12.5, 2.5, 6.2),
      i(new R0(0.08, 1.6, 0.08), n.mats.emissive(16726556, 6), 6.6, 0.82, 2.6),
      i(new R0(0.08, 1.6, 0.08), n.mats.emissive(3524863, 5), 2.2, 0.82, 3.2),
      i(new R0(2.4, 0.08, 0.06), n.mats.emissive(16773328, 6), 9.4, 2.2, 1.06),
      i(new R0(0.3, 0.12, 0.3), n.mats.emissive(16760944, 12), 12.5, 5, 6.2),
      i(new R0(0.06, 1.2, 0.06), n.mats.emissive(5832570, 5), 23, 0.62, 8.2),
      i(new R0(1.2, 1.2, 1.2), s("steel_dark"), 22.4, 0.6, 9.6, 0.3),
      n.scene.add(t),
      { cam: [-9, 1.65, 5.6], target: [14, 0.4, 5] }
    );
  }
