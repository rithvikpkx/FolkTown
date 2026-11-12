import { DataTexture as li, RGBAFormat as $0, UnsignedByteType as wi, LinearFilter as x0, LinearMipmapLinearFilter as yn, ClampToEdgeWrapping as Vi, NoColorSpace as ci, CanvasTexture as Rs, SRGBColorSpace as In, Vector2 as We, InstancedBufferGeometry as Ra, BufferAttribute as nt, InstancedBufferAttribute as Xs, DynamicDrawUsage as Ao, ShaderMaterial as vn, DoubleSide as ln, CustomBlending as cp, AddEquation as pr, OneFactor as qc, OneMinusSrcAlphaFactor as Sc, ZeroFactor as up, Mesh as ht, LoopRepeat as px, TriangleFanDrawMode as vx, Matrix4 as Je, Quaternion as St, Vector3 as K, BoxGeometry as R0, MeshStandardMaterial as L0, InstancedMesh as Wo, Euler as _0, LatheGeometry as yr, BufferGeometry as pt, Color as Qe, Group as At, LessDepth as hp, PCFSoftShadowMap as lp, UnsignedShort5551Type as bp } from 'three';
import { ar } from './ns.js';
import { uv } from './props.js';
import { Z0, T0, Ei } from './common.js';
import { f0, lo } from './mats.js';
import { __late as __late_render } from './render.js';
import { __late as __late_mats } from './mats.js';
import { __late as __late_props } from './props.js';
import { __late as __late_level } from './level.js';
import { __late as __late_backdrop } from './backdrop.js';
// forward references, filled in by the owning later file (see README)
let py, vy, sr;
export const __late = {
  py(v) {
    py = v;
  },
  vy(v) {
    vy = v;
  },
  sr(v) {
    sr = v;
  },
};
__late_props.pz(pz);
__late_props.nz(nz);
__late_level.MI(MI);
__late_level.y0(y0);
__late_backdrop.dz(dz);

export var Wv = {};
  ar(Wv, { create: () => f1, showcase: () => KP });
  export function Nv(n) {
    let i = new Float32Array(4096),
      s = n >>> 0,
      o = () => {
        ((s |= 0), (s = (s + 1831565813) | 0));
        let l = Math.imul(s ^ (s >>> 15), 1 | s);
        return ((l = (l + Math.imul(l ^ (l >>> 7), 61 | l)) ^ l), ((l ^ (l >>> 14)) >>> 0) / 4294967296);
      };
    for (let l = 0; l < 4096; l++) i[l] = o();
    let r = (l, c) => {
      let u = Math.floor(l),
        f = Math.floor(c),
        h = l - u,
        p = c - f;
      ((h = h * h * (3 - 2 * h)), (p = p * p * (3 - 2 * p)));
      let d = u & 63,
        m = (u + 1) & 63,
        x = (f & 63) * 64,
        v = ((f + 1) & 63) * 64,
        y = i[x + d],
        b = i[x + m],
        g = i[v + d],
        E = i[v + m];
      return y + (b - y) * h + (g - y + (y - b - g + E) * h) * p;
    };
    return {
      noise: r,
      fbm: (l, c, u = 4) => {
        let f = 0,
          h = 0.5,
          p = 0;
        for (let d = 0; d < u; d++) ((f += r(l, c) * h), (p += h), (l = l * 2.03 + 17.1), (c = c * 2.03 + 9.7), (h *= 0.5));
        return f / p;
      },
      rnd: o,
    };
  }
  export var Do = (n, e, t) => {
      let i = (t - n) / (e - n);
      return ((i = i < 0 ? 0 : i > 1 ? 1 : i), i * i * (3 - 2 * i));
    },
    uh = 4,
    Wg = 2;
  export function qw(n = 128) {
    let e = n * uh,
      t = n * Wg,
      i = new Uint8Array(e * t * 4),
      s = Nv(9173),
      o = new Float32Array(n * n),
      r = new Float32Array(n * n),
      a = new Float32Array(n * n);
    for (let c = 0; c < uh * Wg; c++) {
      let u = c % uh,
        f = Math.floor(c / uh),
        h = c * 13.37 + 3.1,
        p = c * 7.77 + 1.3;
      for (let d = 0; d < n; d++)
        for (let m = 0; m < n; m++) {
          let x = ((m + 0.5) / n) * 2 - 1,
            v = ((d + 0.5) / n) * 2 - 1,
            y = 1 - Do(0.78, 0.98, Math.max(Math.abs(x), Math.abs(v))),
            b,
            g,
            E;
          if (c === 6) {
            let _ = v * 0.5 + 0.5,
              T = 0.16 + 0.5 * _ * _,
              w = (s.fbm(x * 2 + h, _ * 2 + p, 3) - 0.5) * 0.25,
              S = 1 - Do(T * 0.3, T, Math.abs(x + w * _)),
              R = s.fbm(x * 9 + h, _ * 2.2 + p, 4),
              z = 1 - Do(0.55, 0.95, _ - (s.noise(x * 6 + h, 3.3) - 0.5) * 0.35),
              I = Do(0, 0.12, _);
            ((b = S * z * I * Do(0.22, 0.7, R + 0.25 * (1 - _))), (g = S * z), (E = b * 0.5));
          } else {
            let _ = c === 7,
              T = _ ? 0.3 : 0.6,
              w = (s.fbm(x * 1.4 + h, v * 1.4 + p, 3) - 0.5) * T,
              S = (s.fbm(x * 1.4 + p + 5.2, v * 1.4 + h + 1.7, 3) - 0.5) * T,
              R = x + w,
              z = v + S,
              I = Math.sqrt(R * R + z * z),
              L = (s.fbm(R * 2.2 + h, z * 2.2 + p, 3) - 0.5) * 0.6,
              U = 1 - Do(0, _ ? 0.84 : 0.8, I + L),
              k = s.fbm(R * 4.2 + h * 2, z * 4.2 + p * 2, 5),
              C = U * (_ ? 0.8 + 0.7 * k : 0.25 + 1.5 * k);
            ((b = Do(_ ? 0.02 : 0.06, _ ? 0.7 : 0.95, C)), (g = U), (E = U * 0.55 + U * s.fbm(R * 3.1 + h * 3, z * 3.1 + p * 3, 3) * 0.9));
          }
          let M = d * n + m;
          ((r[M] = b * y), (a[M] = g), (o[M] = E * y));
        }
      for (let d = 0; d < n; d++)
        for (let m = 0; m < n; m++) {
          let x = Math.max(0, m - 2),
            v = Math.min(n - 1, m + 2),
            y = Math.max(0, d - 2),
            b = Math.min(n - 1, d + 2),
            g = ((o[d * n + v] - o[d * n + x]) * n) / 8,
            E = ((o[b * n + m] - o[y * n + m]) * n) / 8,
            M = 0.55,
            _ = -g * M,
            T = -E * M,
            w = 1 / Math.sqrt(_ * _ + T * T + 1);
          ((_ *= w), (T *= w));
          let S = ((f * n + d) * e + u * n + m) * 4,
            R = d * n + m;
          ((i[S] = Math.round((_ * 0.5 + 0.5) * 255)),
            (i[S + 1] = Math.round((T * 0.5 + 0.5) * 255)),
            (i[S + 2] = Math.min(255, a[R] * 255)),
            (i[S + 3] = Math.min(255, r[R] * 255)));
        }
    }
    let l = new li(i, e, t, $0, wi);
    return (
      (l.magFilter = x0),
      (l.minFilter = yn),
      (l.generateMipmaps = !0),
      (l.wrapS = l.wrapT = Vi),
      (l.colorSpace = ci),
      (l.needsUpdate = !0),
      l
    );
  }
  export var c1 = 4,
    Uv = 2,
    mo = 0,
    Bv = 1,
    Gl = 2,
    HP = 3,
    Hv = 4,
    Gg = 5,
    fh = 6,
    qg = 7;
  export function Xw(n = 128) {
    let e = n * c1,
      t = n * Uv,
      i = new Uint8Array(e * t * 4),
      s = Nv(4441),
      o = [0, 1].map(() => {
        let a = 7 + Math.floor(s.rnd() * 4),
          l = [];
        for (let c = 0; c < a; c++)
          l.push({
            a: (c / a + (s.rnd() - 0.5) * 0.12) * Math.PI * 2,
            l: 0.35 + s.rnd() * 0.6,
            w: 0.018 + s.rnd() * 0.05,
            g: 0.5 + s.rnd() * 0.5,
          });
        return l;
      });
    for (let a = 0; a < 8; a++) {
      let l = a % c1,
        c = Math.floor(a / c1);
      for (let u = 0; u < n; u++)
        for (let f = 0; f < n; f++) {
          let h = ((f + 0.5) / n) * 2 - 1,
            p = ((u + 0.5) / n) * 2 - 1,
            d = Math.sqrt(h * h + p * p),
            m = 1 - Do(0.86, 0.99, Math.max(Math.abs(h), Math.abs(p))),
            x = 0;
          if (a === mo) {
            let b = Math.max(0, 1 - d);
            x = b * b * b * 0.75 + Math.exp(-d * d * 22) * 0.5;
          } else if (a === Bv) {
            let b = Math.pow(Math.max(0, 1 - h * h), 1.5);
            x = Math.exp(-(p * p) / (0.42 * 0.42)) * b;
          } else if (a === Gl || a === HP) {
            let b = o[a - Gl],
              g = Math.atan2(p, h);
            for (let E of b) {
              let M = Math.abs(g - E.a) % (Math.PI * 2);
              M > Math.PI && (M = Math.PI * 2 - M);
              let _ = Math.sin(Math.min(M, 1.5)) * d;
              M < 1.5 && (x += E.g * Math.exp(-(_ * _) / (E.w * E.w * (0.4 + d))) * Math.pow(Math.max(0, 1 - d / E.l), 1.4));
            }
            x = x * (0.7 + 0.6 * s.fbm(h * 5 + a * 9, p * 5, 3)) + Math.exp(-d * d * 70) * 1.2 + Math.max(0, 1 - d * 2.2) * 0.06;
          } else if (a === Hv) {
            let b = Math.atan2(p, h),
              g = 0.78 + (s.noise(Math.cos(b) * 2 + 5, Math.sin(b) * 2 + 5) - 0.5) * 0.04;
            x =
              Math.exp(-((d - g) * (d - g)) / (0.03 * 0.03)) * (0.6 + 0.4 * s.noise(Math.cos(b) * 5 + 9, Math.sin(b) * 5 + 9)) +
              0.05 * Do(0.2, 0.78, d) * (1 - Do(0.78, 0.8, d));
          } else if (a === Gg) {
            let b = (s.fbm(h * 1.6 + 3.3, p * 1.6 + 8.1, 3) - 0.5) * 0.5,
              g = (s.fbm(h * 1.6 + 7.7, p * 1.6 + 2.2, 3) - 0.5) * 0.5,
              E = h + b,
              M = p + g,
              _ = Math.sqrt(E * E + M * M),
              T = 1 - Do(0, 0.84, _),
              w = s.fbm(E * 4 + 1.1, M * 4 + 6.6, 5);
            x = Do(0.04, 0.9, T * (0.3 + 1.4 * w)) * (0.45 + 0.75 * T);
          } else if (a === fh) x = 1 - Do(0.3, 0.62, d);
          else if (a === qg) {
            let b = h * 0.5 + 0.5,
              g = 0.22 + 0.3 * b,
              E = Math.exp(-(p * p) / (g * g)) * Math.pow(b, 1.8),
              M = (h - 0.8) / 0.16;
            (h > 0.8 && (E *= Math.max(0, 1 - M * M)), (x = E * 1.15));
          }
          x *= m;
          let v = Math.max(0, Math.min(255, x * 255)),
            y = ((c * n + u) * e + l * n + f) * 4;
          ((i[y] = i[y + 1] = i[y + 2] = v), (i[y + 3] = 255));
        }
    }
    let r = new li(i, e, t, $0, wi);
    return (
      (r.magFilter = x0),
      (r.minFilter = yn),
      (r.generateMipmaps = !0),
      (r.wrapS = r.wrapT = Vi),
      (r.colorSpace = ci),
      (r.needsUpdate = !0),
      r
    );
  }
  export var pu = 4,
    Fv = 2,
    Oa = { bullet_metal: [0, 1], bullet_concrete: [2, 3], bullet_wood: [4], scorch: [5], soot: [6], bullet_glass: [7] };
  export function Yw(n = 256) {
    let e = n * pu,
      t = n * Fv,
      i = document.createElement("canvas");
    ((i.width = e), (i.height = t));
    let s = document.createElement("canvas");
    ((s.width = e), (s.height = t));
    let o = document.createElement("canvas");
    ((o.width = e), (o.height = t));
    let r = i.getContext("2d"),
      a = s.getContext("2d"),
      l = o.getContext("2d", { willReadFrequently: !0 });
    ((l.fillStyle = "rgb(128,128,128)"), l.fillRect(0, 0, e, t));
    let c = (M, _) => {
        let T = l.createRadialGradient(0, 0, 0, 0, 0, _);
        for (let [w, S] of M) T.addColorStop(w, `rgb(${S},${S},${S})`);
        ((l.fillStyle = T), l.beginPath(), l.arc(0, 0, _, 0, Math.PI * 2), l.fill());
      },
      f = Nv(77123).rnd;
    ((a.fillStyle = "rgb(0,235,0)"), a.fillRect(0, 0, e, t));
    let h = Math.PI * 2,
      p = (M, _, T, w = 22, S = 1) => {
        M.beginPath();
        for (let R = 0; R < w; R++) {
          let z = (R / w) * h,
            I = _ * (1 + (f() - 0.5) * T),
            L = Math.cos(z) * I,
            U = Math.sin(z) * I * S;
          R ? M.lineTo(L, U) : M.moveTo(L, U);
        }
        M.closePath();
      },
      d = (M, _, T, w, S, R, z) => {
        M.beginPath();
        let I = T,
          L = _;
        M.moveTo(Math.cos(L) * I, Math.sin(L) * I);
        let U = 5 + Math.floor(f() * 4);
        for (let k = 1; k <= U; k++) ((I = T + ((w - T) * k) / U), (L += (f() - 0.5) * S), M.lineTo(Math.cos(L) * I, Math.sin(L) * I));
        ((M.strokeStyle = z), (M.lineWidth = R), (M.lineCap = "round"), (M.lineJoin = "round"), M.stroke());
      },
      m = (M, _) => {
        let T = ((M % pu) + 0.5) * n,
          w = (Math.floor(M / pu) + 0.5) * n,
          S = n / 2;
        for (let R of [r, a, l]) (R.save(), R.beginPath(), R.rect(T - S, w - S, n, n), R.clip(), R.translate(T, w));
        (_(S), r.restore(), a.restore(), l.restore());
      },
      x = (M, _, T, w) => {
        let S = M.createRadialGradient(0, 0, _, 0, 0, T);
        for (let [R, z] of w) S.addColorStop(R, z);
        return S;
      };
    for (let M of Oa.bullet_metal)
      m(M, (_) => {
        ((r.fillStyle = x(r, _ * 0.1, _ * 0.6, [
          [0, "rgba(14,13,12,0.4)"],
          [0.5, "rgba(18,17,16,0.14)"],
          [1, "rgba(20,20,20,0)"],
        ])),
          r.fillRect(-_, -_, 2 * _, 2 * _));
        let T = 6 + Math.floor(f() * 5);
        for (let k = 0; k < T; k++) {
          let C = f() * h;
          d(r, C, _ * 0.2, _ * (0.38 + f() * 0.45), 0.3, 0.8 + f() * 1, "rgba(8,8,8,0.55)");
        }
        let w = _ * (0.24 + f() * 0.08),
          S = 0.7 + f() * 0.5,
          R = f() * h,
          z = (k, C, A, F, H, N) => {
            for (let J of [r, a]) (J.save(), J.translate(k, C), J.rotate(F));
            let Z = [];
            for (let J = 0; J < N; J++) Z.push(1 + (f() - 0.5) * H);
            let Q = (J, G) => {
              J.beginPath();
              for (let te = 0; te < N; te++) {
                let oe = (te / N) * h,
                  ee = A * Z[te] * G,
                  le = Math.cos(oe) * ee,
                  xe = Math.sin(oe) * ee * S;
                te ? J.lineTo(le, xe) : J.moveTo(le, xe);
              }
              J.closePath();
            };
            (Q(r, 1), (r.lineJoin = "miter"), (r.strokeStyle = "rgba(92,54,36,0.95)"), (r.lineWidth = Math.max(1.5, A * 0.14)), r.stroke());
            let W = 150 + Math.floor(f() * 50);
            (Q(r, 1),
              (r.fillStyle = x(r, 0, A * 1.2, [
                [0, `rgb(${W - 30},${W - 26},${W - 20})`],
                [0.7, `rgb(${W + 30},${W + 33},${W + 36})`],
                [1, `rgb(${W},${W + 3},${W + 6})`],
              ])),
              r.fill(),
              Q(a, 1),
              (a.fillStyle = "rgb(0,85,255)"),
              a.fill(),
              r.restore(),
              a.restore());
          };
        z(0, 0, w, R, 0.75, 11);
        let I = 2 + Math.floor(f() * 4);
        for (let k = 0; k < I; k++) {
          let C = f() * h,
            A = w * (1 + f() * 0.7);
          z(Math.cos(C) * A, Math.sin(C) * A, w * (0.15 + f() * 0.3), f() * h, 0.8, 7);
        }
        for (let k = 0; k < 9; k++) {
          let C = f() * h,
            A = w * 0.3,
            F = w * (0.6 + f() * 0.3);
          (r.beginPath(),
            r.moveTo(Math.cos(C) * A, Math.sin(C) * A),
            r.lineTo(Math.cos(C + 0.1) * F, Math.sin(C + 0.1) * F),
            (r.strokeStyle = f() < 0.5 ? "rgba(245,246,248,0.7)" : "rgba(70,72,76,0.5)"),
            (r.lineWidth = 0.8),
            r.stroke());
        }
        let L = _ * (0.1 + f() * 0.025),
          U = 8 + Math.floor(f() * 5);
        for (let k = 0; k < U; k++) {
          if (f() < 0.15) continue;
          let C = ((k + (f() - 0.5) * 0.6) / U) * h,
            A = L * (1.25 + f() * 0.9),
            F = 0.16 + f() * 0.16,
            H = 205 + Math.floor(f() * 50);
          (r.beginPath(),
            r.moveTo(Math.cos(C - F) * L * 0.9, Math.sin(C - F) * L * 0.9),
            r.lineTo(Math.cos(C) * A, Math.sin(C) * A),
            r.lineTo(Math.cos(C + F) * L * 0.9, Math.sin(C + F) * L * 0.9),
            r.closePath(),
            (r.fillStyle = `rgb(${H},${H},${Math.min(255, H + 4)})`),
            r.fill(),
            (r.strokeStyle = "rgba(40,40,42,0.6)"),
            (r.lineWidth = 0.7),
            r.stroke());
        }
        (a.beginPath(),
          a.arc(0, 0, L * 1.8, 0, h),
          (a.fillStyle = "rgb(0,60,255)"),
          a.fill(),
          p(r, L, 0.3, 11),
          (r.fillStyle = x(r, 0, L, [
            [0, "#000000"],
            [0.8, "#040404"],
            [1, "#141414"],
          ])),
          r.fill(),
          c(
            [
              [0, 0],
              [0.26, 10],
              [0.36, 240],
              [0.5, 200],
              [0.62, 100],
              [1, 128],
            ],
            L * 3.4,
          ),
          p(a, L, 0.1, 11),
          (a.fillStyle = "rgb(0,250,0)"),
          a.fill());
      });
    for (let M of Oa.bullet_concrete)
      m(M, (_) => {
        ((r.fillStyle = x(r, _ * 0.2, _ * 0.9, [
          [0, "rgba(186,180,168,0.22)"],
          [0.6, "rgba(180,175,165,0.07)"],
          [1, "rgba(170,165,155,0)"],
        ])),
          r.fillRect(-_, -_, 2 * _, 2 * _));
        let T = 4 + Math.floor(f() * 4);
        for (let I = 0; I < T; I++) {
          let L = f() * h,
            U = _ * (0.5 + f() * 0.42);
          (d(r, L, _ * 0.25, U, 0.35, 1.3 + f() * 1.3, "rgba(20,19,18,0.75)"),
            f() < 0.5 && d(r, L + (f() - 0.5) * 0.6, U * 0.7, U * 1.05, 0.6, 0.9, "rgba(20,19,18,0.5)"));
        }
        let w = _ * (0.33 + f() * 0.09),
          S = 12,
          R = [];
        for (let I = 0; I < S; I++) R.push(1 + (f() - 0.5) * 0.6);
        let z = (I, L, U, k) => {
          I.beginPath();
          for (let C = 0; C < S; C++) {
            let A = (C / S) * h,
              F = w * R[C] * L;
            C ? I.lineTo(Math.cos(A) * F + U, Math.sin(A) * F + k) : I.moveTo(Math.cos(A) * F + U, Math.sin(A) * F + k);
          }
          I.closePath();
        };
        (z(r, 1.05, 1.5, 1.5),
          (r.fillStyle = "rgba(22,21,20,0.8)"),
          r.fill(),
          z(r, 1, 0, 0),
          (r.fillStyle = x(r, w * 0.1, w * 1.1, [
            [0, "#35332f"],
            [0.4, "#6f6b63"],
            [0.8, "#8f8b82"],
            [1, "#9a968c"],
          ])),
          r.fill(),
          z(r, 0.97, -1, -1),
          (r.strokeStyle = "rgba(206,201,190,0.55)"),
          (r.lineWidth = 1.2),
          r.stroke());
        for (let I = 0; I < 6; I++) {
          let L = f() * h;
          d(r, L, w * 0.2, w * 0.9, 0.5, 1, "rgba(28,27,25,0.5)");
        }
        for (let I = 0; I < 60; I++) {
          let L = f() * h,
            U = Math.sqrt(f()) * w * 0.85;
          ((r.fillStyle = f() < 0.55 ? "rgba(36,34,32,0.6)" : "rgba(196,191,180,0.6)"),
            r.beginPath(),
            r.arc(Math.cos(L) * U, Math.sin(L) * U, 0.7 + f() * 2, 0, h),
            r.fill());
        }
        (p(r, w * 0.3, 0.45, 9),
          (r.fillStyle = x(r, 0, w * 0.33, [
            [0, "#060606"],
            [0.7, "#161514"],
            [1, "#2c2a27"],
          ])),
          r.fill(),
          c(
            [
              [0, 0],
              [0.24, 20],
              [0.3, 70],
              [0.8, 112],
              [0.88, 150],
              [1, 128],
            ],
            w * 1.15,
          ));
        for (let I = 0; I < 22; I++) {
          let L = f() * h,
            U = w * (1.15 + f() * 1.3);
          ((r.fillStyle = f() < 0.5 ? "rgba(190,185,175,0.45)" : "rgba(30,29,27,0.45)"),
            r.beginPath(),
            r.arc(Math.cos(L) * U, Math.sin(L) * U, 0.6 + f() * 1.6, 0, h),
            r.fill());
        }
      });
    for (let M of Oa.bullet_wood)
      m(M, (_) => {
        (p(r, _ * 0.27, 0.7, 11, 1.45), (r.fillStyle = "rgba(206,182,140,0.85)"), r.fill());
        for (let T = 0; T < 46; T++) {
          let w = (f() - 0.5) * _ * 0.62,
            S = _ * (0.25 + f() * 0.6) * (1 - Math.abs(w) / (_ * 0.4)),
            R = (f() - 0.5) * _ * 0.2;
          (r.beginPath(),
            r.moveTo(w, R - S),
            r.lineTo(w + (f() - 0.5) * 5, R + S),
            (r.strokeStyle = f() < 0.5 ? "rgba(236,216,172,0.85)" : "rgba(88,62,38,0.7)"),
            (r.lineWidth = 0.8 + f() * 2.2),
            r.stroke());
        }
        (p(r, _ * 0.1, 0.5, 9, 1.1),
          (r.fillStyle = x(r, 0, _ * 0.12, [
            [0, "#050403"],
            [0.8, "#140f0a"],
            [1, "#3a2a1a"],
          ])),
          r.fill(),
          c(
            [
              [0, 0],
              [0.5, 30],
              [0.8, 140],
              [1, 128],
            ],
            _ * 0.17,
          ));
      });
    for (let M of Oa.scorch)
      m(M, (_) => {
        ((r.fillStyle = x(r, 0, _ * 0.98, [
          [0, "rgba(6,5,5,0.92)"],
          [0.3, "rgba(10,9,8,0.85)"],
          [0.55, "rgba(22,18,15,0.5)"],
          [0.8, "rgba(30,24,20,0.16)"],
          [1, "rgba(30,24,20,0)"],
        ])),
          r.fillRect(-_, -_, 2 * _, 2 * _));
        for (let T = 0; T < 90; T++) {
          let w = f() * h,
            S = _ * (0.1 + f() * 0.3),
            R = _ * (0.5 + f() * 0.46);
          (r.beginPath(),
            r.moveTo(Math.cos(w - 0.03) * S, Math.sin(w - 0.03) * S),
            r.lineTo(Math.cos(w) * R, Math.sin(w) * R),
            r.lineTo(Math.cos(w + 0.03) * S, Math.sin(w + 0.03) * S),
            r.closePath(),
            (r.fillStyle = `rgba(8,7,6,${0.12 + f() * 0.3})`),
            r.fill());
        }
        for (let T = 0; T < 60; T++) {
          let w = f() * h,
            S = _ * (0.15 + f() * 0.6);
          ((r.fillStyle = f() < 0.3 ? "rgba(150,140,128,0.25)" : "rgba(0,0,0,0.4)"),
            r.beginPath(),
            r.arc(Math.cos(w) * S, Math.sin(w) * S, 1 + f() * 4, 0, h),
            r.fill());
        }
      });
    for (let M of Oa.soot)
      m(M, (_) => {
        for (let T = 0; T < 14; T++) {
          let w = f() * h,
            S = f() * _ * 0.3,
            R = _ * (0.15 + f() * 0.3),
            z = Math.cos(w) * S,
            I = Math.sin(w) * S,
            L = r.createRadialGradient(z, I, 0, z, I, R);
          (L.addColorStop(0, "rgba(8,8,8,0.4)"), L.addColorStop(1, "rgba(8,8,8,0)"), (r.fillStyle = L), r.fillRect(-_, -_, 2 * _, 2 * _));
        }
        (p(r, _ * 0.1, 0.4, 12), (r.fillStyle = "rgba(0,0,0,0.9)"), r.fill());
      });
    for (let M of Oa.bullet_glass)
      m(M, (_) => {
        ((r.fillStyle = x(r, 0, _ * 0.5, [
          [0, "rgba(235,240,242,0.55)"],
          [1, "rgba(235,240,242,0)"],
        ])),
          r.fillRect(-_, -_, 2 * _, 2 * _));
        for (let T = 0; T < 13; T++) {
          let w = ((T + f() * 0.6) / 13) * h;
          d(r, w, _ * 0.07, _ * (0.5 + f() * 0.45), 0.12, 0.9 + f(), "rgba(240,246,248,0.85)");
        }
        for (let T = 0; T < 3; T++) {
          let w = _ * (0.2 + T * 0.17 + f() * 0.05);
          for (let S = 0; S < 9; S++) {
            if (f() < 0.45) continue;
            let R = (S / 9) * h;
            (r.beginPath(), r.arc(0, 0, w, R, R + 0.5), (r.strokeStyle = "rgba(240,246,248,0.6)"), (r.lineWidth = 1), r.stroke());
          }
        }
        (p(r, _ * 0.07, 0.3, 10), (r.fillStyle = "#060606"), r.fill());
      });
    let v = new Rs(i);
    ((v.colorSpace = In), (v.anisotropy = 4));
    let y = new Rs(s);
    y.colorSpace = ci;
    let b = 2 / n,
      g = (M) => {
        let _ = M % pu,
          T = Math.floor(M / pu);
        return [(_ + b) / pu, 1 - (T + 1 - b) / Fv, (_ + 1 - b) / pu, 1 - (T + b) / Fv];
      },
      E = null;
    try {
      let M = l.getImageData(0, 0, e, t),
        _ = M.data;
      if (_ && _.length === e * t * 4) {
        let T = l.createImageData(e, t),
          w = T.data,
          S = 5 / 255;
        for (let R = 0; R < t; R++) {
          let z = Math.max(0, R - 1) * e,
            I = Math.min(t - 1, R + 1) * e;
          for (let L = 0; L < e; L++) {
            let U = Math.max(0, L - 1),
              k = Math.min(e - 1, L + 1),
              C = (_[(R * e + k) * 4] - _[(R * e + U) * 4]) * S,
              A = (_[(I + L) * 4] - _[(z + L) * 4]) * S,
              F = 1 / Math.sqrt(C * C + A * A + 1),
              H = (R * e + L) * 4;
            ((w[H] = (-C * F * 0.5 + 0.5) * 255),
              (w[H + 1] = (A * F * 0.5 + 0.5) * 255),
              (w[H + 2] = (F * 0.5 + 0.5) * 255),
              (w[H + 3] = 255));
          }
        }
        (l.putImageData(T, 0, 0), (E = new Rs(o)), (E.colorSpace = ci));
      }
    } catch {
      E = null;
    }
    return { map: v, orm: y, nrm: E, uv: g };
  }
  export var OP = `
attribute vec4 aPos;    // xyz centre, w size (m)
attribute vec4 aAxis;   // mode 1: stretch axis (length = streak length); mode 2: plane normal; w = roll (rad)
attribute vec4 aCol;    // rgb (HDR), a
attribute vec4 aMisc;   // x atlas frame, y mode (0 billboard, 1 velocity-stretched, 2 surface-aligned), z age 0..1, w sun visibility
uniform vec2 uAtlas;
uniform float uPx;      // world size of one pixel at distance 1
varying vec2 vUv;
varying vec4 vCol;
varying vec3 vOff;
varying vec3 vToCam;
varying vec3 vInfo;     // view z, age, shade
varying float vSoftD;
varying vec3 vT;
varying vec3 vB;
void main() {
  vec2 c = position.xy;
  vec3 center = aPos.xyz; float size = aPos.w; float mode = aMisc.y;
  vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 camU = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 toCam = cameraPosition - center; float dist = length(toCam); toCam /= max(dist, 1e-4);
  float sn = sin(aAxis.w), cs = cos(aAxis.w);
  vec2 rc = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
  vec3 off; float comp = 1.0;
  if (mode < 0.5) {
    off = (camR * rc.x + camU * rc.y) * size;
    vT = camR * cs + camU * sn; vB = camU * cs - camR * sn;
  } else if (mode < 1.5) {
    float len = length(aAxis.xyz); vec3 d = aAxis.xyz / max(len, 1e-5);
    vec3 side = cross(d, toCam); float sl = length(side); side = sl > 1e-3 ? side / sl : camR;
    float w = max(size, dist * uPx * 1.4); comp = size / w;
    if (aMisc.w > 1.5) w = min(w, dist * uPx * aMisc.w);       // additive only: cap on-screen width (tracers near the lens)
    off = d * (c.x * max(len, w)) + side * (c.y * w);
    vT = d; vB = side;
  } else {
    vec3 n = normalize(aAxis.xyz);
    vec3 t = normalize(abs(n.y) > 0.9 ? cross(n, vec3(1.0, 0.0, 0.0)) : cross(vec3(0.0, 1.0, 0.0), n));
    vec3 b = cross(n, t);
    off = (t * rc.x + b * rc.y) * size;
    vT = t * cs + b * sn; vB = b * cs - t * sn;
  }
  vec4 mv = viewMatrix * vec4(center + off, 1.0);
  gl_Position = projectionMatrix * mv;
  float f = floor(aMisc.x + 0.5);
  float col = mod(f, uAtlas.x), row = floor(f / uAtlas.x);
  vUv = (vec2(col, row) + c + 0.5) / uAtlas;
  vCol = vec4(aCol.rgb * comp, aCol.a);
  vOff = off / max(size, 1e-4);
  vToCam = toCam;
  vInfo = vec3(mv.z, aMisc.z, aMisc.w);
  vSoftD = clamp(size * 0.4, 0.04, 0.7);
}`,
    Jw = `
uniform sampler2D uTex;
uniform sampler2D uDepth;
uniform vec2 uRes;
uniform vec2 uNearFar;
uniform float uSoft;
varying vec2 vUv;
varying vec4 vCol;
varying vec3 vOff;
varying vec3 vToCam;
varying vec3 vInfo;
varying float vSoftD;
varying vec3 vT;
varying vec3 vB;
float softFade() {
  float s = 1.0;
  if (uSoft > 0.5) {
    float d = texture2D(uDepth, gl_FragCoord.xy / uRes).x;
    float zs = (uNearFar.x * uNearFar.y) / ((uNearFar.y - uNearFar.x) * d - uNearFar.y);
    s = clamp((vInfo.x - zs) / vSoftD, 0.0, 1.0);
  }
  return s;
}`,
    VP =
      Jw +
      `
uniform vec3 uSun, uSunDir, uAmbLo, uAmbHi;
void main() {
  vec4 t = texture2D(uTex, vUv);
  float er = vInfo.y * 0.45;                                  // wisps erode as the puff ages
  float a = smoothstep(er, er + (vInfo.z > 1.5 ? 0.38 : 0.6), t.a) * vCol.a;   // fire lobes: denser body, crisper edge
  a *= softFade() * smoothstep(0.2, 0.9, -vInfo.x);           // soft intersection + fade right at the lens
  if (a < 0.004) discard;
  vec3 V = normalize(vToCam);
  vec3 q = vOff * 2.0; float r2 = min(dot(q, q), 1.0);
  vec3 Ns = q + V * (sqrt(1.0 - r2) * 0.9 + 0.05);            // overall sphere normal
  vec2 tn = t.rg * 2.0 - 1.0;                                 // billow normal from the flipbook
  vec3 Nb = vT * tn.x + vB * tn.y + V * sqrt(max(1.0 - dot(tn, tn), 0.0));
  vec3 N = normalize(Ns * 0.55 + Nb);
  float wrap = clamp((dot(N, uSunDir) + 0.45) / 1.45, 0.0, 1.0);
  float back = pow(clamp(dot(-V, uSunDir), 0.0, 1.0), 5.0);   // looking into the sun: forward scatter through thin edges
  float thin = 1.0 - t.b * smoothstep(0.0, 0.5, a);
  float hot = step(1.5, vInfo.z), shade = vInfo.z - 2.0 * hot;      // aMisc.w >= 2: emissive fire lobe (colour = emission)
  vec3 sun = uSun * (wrap * wrap * 0.85 + back * (0.15 + 1.3 * thin)) * shade;
  vec3 amb = mix(uAmbLo, uAmbHi, N.y * 0.5 + 0.5) * (1.0 - 0.35 * t.b);
  vec3 col = vCol.rgb * (amb + sun);
  if (hot > 0.5) {
    // alpha-blended fire: hot dense cores, dim orange skin, soot underneath. Because it is NOT additive, overlapping lobes
    // keep their shape and smoke in front can occlude them.
    float lump = clamp(dot(tn, vec2(0.6, 0.8)) * 0.6 + 0.5, 0.0, 1.0);
    float core = t.b * t.b * smoothstep(0.15, 0.9, t.a);
    vec3 fire = vCol.rgb * (0.10 + 1.7 * core) * (0.45 + 1.1 * lump);
    col = vec3(0.045, 0.042, 0.04) * (amb + sun) + fire;
  }
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb *= gl_FragColor.a;                         // premultiply after the (possibly no-op) output transform
}`,
    WP =
      Jw +
      `
void main() {
  float t = texture2D(uTex, vUv).r;
  float k = t * vCol.a * softFade();
  if (k < 0.002) discard;
  gl_FragColor = vec4(vCol.rgb * k, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
    $w = new We();
  export function Vv(n, e, { lit: t, tex: i, cols: s, rows: o, renderOrder: r, sun: a, sunDir: l, ambLo: c, ambHi: u }) {
    let f = new Ra();
    (f.setAttribute("position", new nt(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3)),
      f.setIndex([0, 1, 2, 0, 2, 3]));
    let h = (S) => {
        let R = new Xs(new Float32Array(e * 4), 4);
        return (R.setUsage(Ao), f.setAttribute(S, R), R);
      },
      p = h("aPos"),
      d = h("aAxis"),
      m = h("aCol"),
      x = h("aMisc");
    f.instanceCount = 0;
    let v = {
      uTex: { value: i },
      uAtlas: { value: new We(s, o) },
      uPx: { value: 0.001 },
      uDepth: { value: null },
      uRes: { value: new We(1, 1) },
      uNearFar: { value: new We(0.08, 900) },
      uSoft: { value: 0 },
    };
    t && Object.assign(v, { uSun: { value: a }, uSunDir: { value: l }, uAmbLo: { value: c }, uAmbHi: { value: u } });
    let y = new vn({
      uniforms: v,
      vertexShader: OP,
      fragmentShader: t ? VP : WP,
      transparent: !0,
      depthWrite: !1,
      depthTest: !0,
      side: ln,
      fog: !1,
      blending: cp,
      blendEquation: pr,
      blendSrc: qc,
      blendDst: t ? Sc : qc,
      blendSrcAlpha: up,
      blendDstAlpha: qc,
    });
    y.name = t ? "fx_lit" : "fx_add";
    let b = new ht(f, y);
    ((b.frustumCulled = !1),
      (b.renderOrder = r),
      (b.castShadow = !1),
      (b.receiveShadow = !1),
      (b.matrixAutoUpdate = !1),
      (b.name = y.name),
      (b.onBeforeRender = (S, R, z) => {
        let I = S.getRenderTarget(),
          L;
        I ? (L = I.height) : (S.getDrawingBufferSize($w), (L = $w.y));
        let U = z.projectionMatrix.elements;
        v.uPx.value = 2 / (Math.max(U[5], 0.001) * Math.max(L, 1));
        let k = n.render,
          C = k && k.depthTexture;
        C && C.image && z === n.camera && k.depthTextureIsLive !== !0 && n.params.fxsoft !== "0"
          ? ((v.uDepth.value = C),
            (v.uSoft.value = 1),
            k.resolution && k.resolution.x > 0
              ? v.uRes.value.set(k.resolution.x, k.resolution.y)
              : v.uRes.value.set(C.image.width || 1, C.image.height || 1),
            v.uNearFar.value.set(z.near, z.far))
          : ((v.uDepth.value = null), (v.uSoft.value = 0));
      }));
    let g = p.array,
      E = d.array,
      M = m.array,
      _ = x.array,
      T = {
        mesh: b,
        cap: e,
        n: 0,
        P: g,
        A: E,
        C: M,
        M: _,
        begin() {
          T.n = 0;
        },
        push(S, R, z, I, L, U, k, C, A, F, H, N, Z, Q, W, J) {
          let G = T.n;
          if (G >= e) return !1;
          let te = G * 4;
          return (
            (g[te] = S),
            (g[te + 1] = R),
            (g[te + 2] = z),
            (g[te + 3] = I),
            (E[te] = L),
            (E[te + 1] = U),
            (E[te + 2] = k),
            (E[te + 3] = C),
            (M[te] = A),
            (M[te + 1] = F),
            (M[te + 2] = H),
            (M[te + 3] = N),
            (_[te] = Z),
            (_[te + 1] = Q),
            (_[te + 2] = W),
            (_[te + 3] = J),
            (T.n = G + 1),
            !0
          );
        },
        end: null,
      },
      w = [p, d, m, x];
    return (
      (T.end = () => {
        let S = T.n;
        if (((f.instanceCount = S), (b.visible = S > 0), !!S))
          for (let R = 0; R < 4; R++) {
            let z = w[R];
            (z.clearUpdateRanges(), z.addUpdateRange(0, S * 4), (z.needsUpdate = !0));
          }
      }),
      T
    );
  }
  export var hh = 1,
    dh = 2,
    GP = 4,
    u1 = class {
      constructor(e, t) {
        ((this.cap = e), (this.sorted = t), (this.n = 0), (this.freeTop = e));
        let i = () => new Float32Array(e);
        ((this.px = i()),
          (this.py = i()),
          (this.pz = i()),
          (this.vx = i()),
          (this.vy = i()),
          (this.vz = i()),
          (this.age = i()),
          (this.life = i()),
          (this.s0 = i()),
          (this.s1 = i()),
          (this.sk = i()),
          (this.rot = i()),
          (this.rotv = i()),
          (this.r = i()),
          (this.g = i()),
          (this.b = i()),
          (this.a = i()),
          (this.drag = i()),
          (this.grav = i()),
          (this.wind = i()),
          (this.turb = i()),
          (this.seed = i()),
          (this.fin = i()),
          (this.fout = i()),
          (this.stretch = i()),
          (this.shade = i()),
          (this.key = i()),
          (this.gy = i()),
          (this.frame = new Uint8Array(e)),
          (this.mode = new Uint8Array(e)),
          (this.flags = new Uint8Array(e)),
          (this.ramp = new Uint8Array(e)),
          (this.order = new Uint16Array(e)),
          (this.free = new Uint16Array(e)));
        for (let s = 0; s < e; s++) this.free[s] = e - 1 - s;
      }
      clear() {
        ((this.n = 0), (this.freeTop = this.cap));
        for (let e = 0; e < this.cap; e++) this.free[e] = this.cap - 1 - e;
      }
      emit(e, t, i, s, o, r, a, l, c) {
        if (this.freeTop === 0) return -1;
        let u = this.free[--this.freeTop];
        return (
          (this.order[this.n++] = u),
          (this.px[u] = e),
          (this.py[u] = t),
          (this.pz[u] = i),
          (this.vx[u] = s),
          (this.vy[u] = o),
          (this.vz[u] = r),
          (this.age[u] = -1),
          (this.life[u] = a),
          (this.s0[u] = l),
          (this.s1[u] = c),
          (this.sk[u] = 2),
          (this.rot[u] = 0),
          (this.rotv[u] = 0),
          (this.r[u] = 1),
          (this.g[u] = 1),
          (this.b[u] = 1),
          (this.a[u] = 1),
          (this.drag[u] = 0),
          (this.grav[u] = 0),
          (this.wind[u] = 0),
          (this.turb[u] = 0),
          (this.seed[u] = Math.random() * 100),
          (this.fin[u] = 0),
          (this.fout[u] = 0.5),
          (this.stretch[u] = 0.02),
          (this.shade[u] = 1),
          (this.key[u] = 0),
          (this.gy[u] = 0),
          (this.frame[u] = 0),
          (this.mode[u] = 0),
          (this.flags[u] = 0),
          (this.ramp[u] = 0),
          u
        );
      }
      update(e, t, i, s, o) {
        let { px: r, py: a, pz: l, vx: c, vy: u, vz: f, age: h, life: p, order: d, flags: m } = this,
          x = i.x,
          v = i.y,
          y = i.z,
          b = 0,
          g = this.n;
        for (let E = 0; E < g; E++) {
          let M = d[E];
          if (h[M] < 0) h[M] = 0;
          else {
            if (((h[M] += e), h[M] >= p[M])) {
              this.free[this.freeTop++] = M;
              continue;
            }
            let _ = 1 - Math.exp(-this.drag[M] * e),
              T = this.wind[M];
            ((c[M] += (s.x * T - c[M]) * _), (u[M] += (s.y * T - u[M]) * _), (f[M] += (s.z * T - f[M]) * _), (u[M] -= this.grav[M] * e));
            let w = this.turb[M];
            if (w > 0) {
              let z = this.seed[M];
              ((c[M] += Math.sin(a[M] * 2.3 + z + o * 1.7) * w * e),
                (f[M] += Math.cos(r[M] * 1.9 + z * 1.3 + o * 1.3) * w * e),
                (u[M] += Math.sin(l[M] * 2.1 + z * 0.7 + o * 2.1) * w * 0.4 * e));
            }
            ((r[M] += c[M] * e), (a[M] += u[M] * e), (l[M] += f[M] * e), (this.rot[M] += this.rotv[M] * e));
            let S = m[M],
              R = this.gy[M] + 0.012;
            if (S && a[M] < R) {
              if (S & dh) {
                this.free[this.freeTop++] = M;
                continue;
              }
              S & hh
                ? ((a[M] = R), u[M] < 0 && ((u[M] = -u[M] * (0.25 + (this.seed[M] % 1) * 0.3)), (c[M] *= 0.65), (f[M] *= 0.65)))
                : S & GP && ((a[M] = R), (c[M] = u[M] = f[M] = 0));
            }
          }
          if (this.sorted) {
            let _ = r[M] - x,
              T = a[M] - v,
              w = l[M] - y;
            this.key[M] = _ * _ + T * T + w * w;
          }
          d[b++] = M;
        }
        if (((this.n = b), this.sorted && b > 1)) {
          let E = this.key;
          for (let M = 1; M < b; M++) {
            let _ = d[M],
              T = E[_],
              w = M - 1;
            for (; w >= 0 && E[d[w]] < T;) ((d[w + 1] = d[w]), w--);
            d[w + 1] = _;
          }
        }
        for (let E = 0; E < b; E++) {
          let M = d[E],
            _ = h[M] / p[M],
            T = 1 - _,
            w = 1 - Math.pow(T, this.sk[M]),
            S = this.s0[M] + (this.s1[M] - this.s0[M]) * w,
            R = this.a[M],
            z = this.fin[M],
            I = this.fout[M];
          if ((z > 0 && _ < z && (R *= _ / z), _ > I)) {
            let Z = 1 - (_ - I) / (1 - I);
            R *= Z * Z * (3 - 2 * Z);
          }
          let L = this.r[M],
            U = this.g[M],
            k = this.b[M],
            C = this.ramp[M];
          if (C === 1) ((L *= Math.pow(T, 0.5)), (U *= Math.pow(T, 1.4)), (k *= Math.pow(T, 3)));
          else if (C === 2) {
            let Z = 1 - Math.pow(_, 1.6),
              Q = Z * Math.sqrt(Z);
            ((L *= Q), (U *= (0.22 + 0.78 * Math.pow(Z, 1.3)) * Q), (k *= (0.04 + 0.96 * Math.pow(Z, 3.5)) * Q));
          } else if (C === 3) {
            let Z = 0.55 + 0.45 * Math.sin(o * 17 + this.seed[M] * 9);
            ((L *= Z), (U *= Z * (0.6 + 0.4 * T)), (k *= Z * T));
          }
          let A = this.mode[M],
            F = 0,
            H = 1,
            N = 0;
          if (A === 1) {
            let Z = this.stretch[M];
            ((F = c[M] * Z), (H = u[M] * Z), (N = f[M] * Z));
          }
          if (!t.push(r[M], a[M], l[M], S, F, H, N, this.rot[M], L, U, k, R, this.frame[M], A, _, this.shade[M])) break;
        }
      }
    },
    Yg = class {
      constructor(e = 48) {
        ((this.cap = e), (this.n = 0));
        let t = () => new Float32Array(e);
        ((this.fx = t()),
          (this.fy = t()),
          (this.fz = t()),
          (this.dx = t()),
          (this.dy = t()),
          (this.dz = t()),
          (this.dist = t()),
          (this.speed = t()),
          (this.trav = t()),
          (this.len = t()),
          (this.width = t()),
          (this.r = t()),
          (this.g = t()),
          (this.b = t()),
          (this.frames = new Uint8Array(e)));
      }
      clear() {
        this.n = 0;
      }
      add(e, t, i, s, o, r, a) {
        let l = this.n;
        l >= this.cap ? (l = 0) : this.n++;
        let c = t.x - e.x,
          u = t.y - e.y,
          f = t.z - e.z,
          h = Math.sqrt(c * c + u * u + f * f);
        if (h < 0.001) {
          l === this.n - 1 && this.n--;
          return;
        }
        ((this.fx[l] = e.x),
          (this.fy[l] = e.y),
          (this.fz[l] = e.z),
          (this.dx[l] = c / h),
          (this.dy[l] = u / h),
          (this.dz[l] = f / h),
          (this.dist[l] = h),
          (this.speed[l] = r),
          (this.trav[l] = 0),
          (this.len[l] = Math.min(Math.max(r * 0.022, 2), 7)),
          (this.width[l] = a),
          (this.r[l] = i),
          (this.g[l] = s),
          (this.b[l] = o),
          (this.frames[l] = 0));
      }
      update(e, t, i, s) {
        let o = this.n;
        for (let r = 0; r < o; r++) {
          let a = this.speed[r],
            l = this.dist[r],
            c = this.len[r];
          this.frames[r] === 0
            ? (this.trav[r] = Math.min(l, a * Math.max(e, 0.008) * (0.35 + Math.random() * 0.4)))
            : (this.trav[r] += a * e);
          let u = Math.min(this.trav[r], l),
            f = Math.max(0, this.trav[r] - c);
          if (f >= l) {
            if (this.frames[r] >= 2) {
              if ((o--, r !== o)) {
                for (let T of qP) this[T][r] = this[T][o];
                this.frames[r] = this.frames[o];
              }
              r--;
              continue;
            }
            ((f = Math.max(0, l - c * 0.5)), (u = l));
          }
          this.frames[r] = Math.min(250, this.frames[r] + 1);
          let h = (u + f) * 0.5,
            p = Math.max(u - f, 0.05),
            d = this.dx[r],
            m = this.dy[r],
            x = this.dz[r],
            v = this.width[r],
            y = this.fx[r] + d * h,
            b = this.fy[r] + m * h,
            g = this.fz[r] + x * h,
            E = this.r[r],
            M = this.g[r],
            _ = this.b[r];
          (t.push(y, b, g, v, d * p, m * p, x * p, 0, E, M, _, 1, i, 1, 0, 5),
            t.push(y, b, g, v * 6, d * p * 1.05, m * p * 1.05, x * p * 1.05, 0, E * 0.04, M * 0.032, _ * 0.028, 1, i, 1, 0, 28),
            t.push(
              this.fx[r] + d * u,
              this.fy[r] + m * u,
              this.fz[r] + x * u,
              v * 5,
              0,
              1,
              0,
              0,
              E * 0.2,
              M * 0.16,
              _ * 0.12,
              1,
              s,
              0,
              0,
              1,
            ));
        }
        this.n = o;
      }
    },
    qP = ["fx", "fy", "fz", "dx", "dy", "dz", "dist", "speed", "trav", "len", "width", "r", "g", "b"],
    Ds = new Je(),
    Zo = new St(),
    $g = new K(),
    Zg = new K(),
    Zw = new K();
__late_render.hh(hh);
  export function XP() {
    let n = new R0(1, 1, 1, 2, 1, 2),
      e = n.attributes.position,
      t = 1234.5,
      i = () => ((t = Math.sin(t * 12.9898 + 78.233) * 43758.5453), (t -= Math.floor(t)), t),
      s = new Map();
    for (let o = 0; o < e.count; o++) {
      let r = e.getX(o).toFixed(3) + "," + e.getY(o).toFixed(3) + "," + e.getZ(o).toFixed(3),
        a = s.get(r);
      if (!a) {
        let l = e.getX(o),
          c = e.getY(o),
          u = e.getZ(o),
          h = Math.abs(l) > 0.49 && Math.abs(u) > 0.49 ? 0.72 + i() * 0.2 : 1;
        ((l = l * h + (i() - 0.5) * 0.14),
          (u = u * h + (i() - 0.5) * 0.14),
          (c = c * (0.8 + i() * 0.3) + (i() - 0.5) * 0.1),
          (a = [l, c, u]),
          s.set(r, a));
      }
      e.setXYZ(o, a[0], a[1], a[2]);
    }
    return ((n = n.toNonIndexed()), n.computeVertexNormals(), n);
  }
  export var jg = class {
      constructor(e, t = 256) {
        ((this.G = e), (this.cap = t), (this.next = 0), (this.live = 0));
        let i = new L0({ color: 16777215, roughness: 0.82, metalness: 0.05 });
        i.name = "fx_debris";
        let s = (this.mesh = new Wo(XP(), i, t));
        (s.instanceMatrix.setUsage(Ao),
          (s.instanceColor = new Xs(new Float32Array(t * 3).fill(1), 3)),
          (s.frustumCulled = !1),
          (s.castShadow = !1),
          (s.receiveShadow = !0),
          (s.name = "fx_debris"));
        let o = () => new Float32Array(t);
        ((this.px = o()),
          (this.py = o()),
          (this.pz = o()),
          (this.vx = o()),
          (this.vy = o()),
          (this.vz = o()),
          (this.ax = o()),
          (this.ay = o()),
          (this.az = o()),
          (this.ang = o()),
          (this.spin = o()),
          (this.sx = o()),
          (this.sy = o()),
          (this.sz = o()),
          (this.age = o()),
          (this.life = o()),
          (this.floor = o()),
          (this.state = new Uint8Array(t)),
          Ds.makeScale(0, 0, 0));
        for (let r = 0; r < t; r++) Ds.toArray(s.instanceMatrix.array, r * 16);
        s.visible = !1;
      }
      clear() {
        (this.state.fill(0), Ds.makeScale(0, 0, 0));
        for (let e = 0; e < this.cap; e++) Ds.toArray(this.mesh.instanceMatrix.array, e * 16);
        ((this.mesh.instanceMatrix.needsUpdate = !0), (this.live = 0), (this.mesh.visible = !1));
      }
      add(e, t, i, s, o, r, a, l, c, u, f, h, p, d) {
        let m = this.next;
        ((this.next = (m + 1) % this.cap),
          (this.px[m] = e),
          (this.py[m] = t),
          (this.pz[m] = i),
          (this.vx[m] = s),
          (this.vy[m] = o),
          (this.vz[m] = r));
        let x = Math.random() - 0.5,
          v = Math.random() - 0.5,
          y = Math.random() - 0.5,
          b = Math.hypot(x, v, y) || 1;
        ((this.ax[m] = x / b),
          (this.ay[m] = v / b),
          (this.az[m] = y / b),
          (this.ang[m] = Math.random() * 6.28),
          (this.spin[m] = (Math.random() - 0.5) * 50),
          (this.sx[m] = a),
          (this.sy[m] = l),
          (this.sz[m] = c),
          (this.age[m] = 0),
          (this.life[m] = p),
          (this.floor[m] = d),
          (this.state[m] = 1));
        let g = this.mesh.instanceColor.array;
        ((g[m * 3] = u), (g[m * 3 + 1] = f), (g[m * 3 + 2] = h), (this.mesh.instanceColor.needsUpdate = !0));
      }
      update(e) {
        let t = this.state,
          i = this.mesh.instanceMatrix.array,
          s = 0,
          o = !1;
        for (let r = 0; r < this.cap; r++) {
          let a = t[r];
          if (!a) continue;
          this.age[r] += e;
          let l = this.life[r] - this.age[r];
          if (l <= 0) {
            ((t[r] = 0), Ds.makeScale(0, 0, 0), Ds.toArray(i, r * 16), (o = !0));
            continue;
          }
          if ((s++, a === 2 && l > 0.5)) continue;
          if (a === 1) {
            ((this.vy[r] -= 9.81 * e),
              (this.px[r] += this.vx[r] * e),
              (this.py[r] += this.vy[r] * e),
              (this.pz[r] += this.vz[r] * e),
              (this.ang[r] += this.spin[r] * e));
            let u = this.floor[r] + Math.min(this.sx[r], this.sy[r], this.sz[r]) * 0.5;
            this.py[r] < u &&
              this.vy[r] < 0 &&
              ((this.py[r] = u),
              this.vy[r] > -1.2
                ? ((t[r] = 2), (this.vx[r] = this.vy[r] = this.vz[r] = 0))
                : ((this.vy[r] = -this.vy[r] * 0.32), (this.vx[r] *= 0.55), (this.vz[r] *= 0.55), (this.spin[r] *= 0.5)));
          }
          let c = l < 0.5 ? l / 0.5 : 1;
          (Zw.set(this.ax[r], this.ay[r], this.az[r]),
            Zo.setFromAxisAngle(Zw, this.ang[r]),
            $g.set(this.px[r], this.py[r], this.pz[r]),
            Zg.set(this.sx[r] * c, this.sy[r] * c, this.sz[r] * c),
            Ds.compose($g, Zo, Zg),
            Ds.toArray(i, r * 16),
            (o = !0));
        }
        ((this.live = s), (this.mesh.visible = s > 0), o && (this.mesh.instanceMatrix.needsUpdate = !0));
      }
    },
    Ov = { pos: new K(), surface: "concrete" },
    YP = new K(0, -1, 0),
    jw = new K(),
    Kw = new St(),
    Xg = new _0();
  export function $P() {
    let t = [
        [0, 0],
        [0.006076, 0],
        [0.0062, 0.0012],
        [0.005083999999999999, 0.0022],
        [0.005083999999999999, 0.0034],
        [0.006013999999999999, 0.0046],
        [0.005889999999999999, 0.036399999999999995],
        [0.004092, 0.0416],
        [0.003968, 0.052],
        [0.003224, 0.052],
        [0.0031, 0.044719999999999996],
      ],
      i = new yr(
        t.map((s) => new We(s[0], s[1] - 0.052 / 2)),
        10,
      );
    return (i.computeVertexNormals(), i);
  }
  export var Kg = class {
    constructor(e, t = 60) {
      ((this.G = e), (this.cap = t), (this.next = 0));
      let i;
      try {
        i = e.mats.get("brass");
      } catch {
        i = null;
      }
      (!i || !i.isMaterial) && (i = new L0({ color: 11570492, roughness: 0.3, metalness: 1 }));
      let s = (this.mesh = new Wo($P(), i, t));
      (s.instanceMatrix.setUsage(Ao), (s.frustumCulled = !1), (s.castShadow = !1), (s.receiveShadow = !0), (s.name = "fx_shells"));
      let o = () => new Float32Array(t);
      ((this.px = o()),
        (this.py = o()),
        (this.pz = o()),
        (this.vx = o()),
        (this.vy = o()),
        (this.vz = o()),
        (this.qx = o()),
        (this.qy = o()),
        (this.qz = o()),
        (this.qw = o().fill(1)),
        (this.wx = o()),
        (this.wy = o()),
        (this.wz = o()),
        (this.age = o()),
        (this.rest = o()),
        (this.floor = o()),
        (this.state = new Uint8Array(t)),
        (this.bounces = new Uint8Array(t)),
        Ds.makeScale(0, 0, 0));
      for (let r = 0; r < t; r++) Ds.toArray(s.instanceMatrix.array, r * 16);
      ((s.visible = !1), (this.surface = new Array(t).fill("concrete")));
    }
    clear() {
      (this.state.fill(0), Ds.makeScale(0, 0, 0));
      for (let e = 0; e < this.cap; e++) Ds.toArray(this.mesh.instanceMatrix.array, e * 16);
      ((this.mesh.instanceMatrix.needsUpdate = !0), (this.mesh.visible = !1));
    }
    _floorAt(e) {
      let t = this.G.physics;
      if (((this.floor[e] = 0), (this.surface[e] = "concrete"), t && t.raycast)) {
        jw.set(this.px[e], this.py[e] + 0.25, this.pz[e]);
        let i = t.raycast(jw, YP, 6);
        i ? ((this.floor[e] = i.point.y), (this.surface[e] = i.surface || "concrete")) : (this.floor[e] = -50);
      }
    }
    add(e, t) {
      let i = this.next;
      ((this.next = (i + 1) % this.cap),
        (this.px[i] = e.x),
        (this.py[i] = e.y),
        (this.pz[i] = e.z),
        (this.vx[i] = t.x),
        (this.vy[i] = t.y),
        (this.vz[i] = t.z),
        Xg.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28),
        Zo.setFromEuler(Xg),
        (this.qx[i] = Zo.x),
        (this.qy[i] = Zo.y),
        (this.qz[i] = Zo.z),
        (this.qw[i] = Zo.w),
        (this.wx[i] = (Math.random() - 0.5) * 40),
        (this.wy[i] = (Math.random() - 0.5) * 20),
        (this.wz[i] = (Math.random() - 0.5) * 40),
        (this.age[i] = 0),
        (this.rest[i] = 0),
        (this.state[i] = 1),
        (this.bounces[i] = 0),
        this._floorAt(i));
    }
    update(e) {
      let t = this.state,
        i = this.mesh.instanceMatrix.array,
        s = 0,
        o = !1;
      for (let r = 0; r < this.cap; r++) {
        let a = t[r];
        if (!a) continue;
        (s++, (this.age[r] += e));
        let l = 1;
        if (a === 1) {
          ((this.vy[r] -= 9.81 * e), (this.px[r] += this.vx[r] * e), (this.py[r] += this.vy[r] * e), (this.pz[r] += this.vz[r] * e));
          let c = this.wx[r],
            u = this.wy[r],
            f = this.wz[r],
            h = this.qx[r],
            p = this.qy[r],
            d = this.qz[r],
            m = this.qw[r],
            x = 0.5 * e,
            v = h + x * (c * m + u * d - f * p),
            y = p + x * (u * m + f * h - c * d),
            b = d + x * (f * m + c * p - u * h),
            g = m - x * (c * h + u * p + f * d),
            E = 1 / (Math.hypot(v, y, b, g) || 1);
          ((this.qx[r] = v * E), (this.qy[r] = y * E), (this.qz[r] = b * E), (this.qw[r] = g * E));
          let M = this.floor[r] + 0.0065;
          if (this.py[r] < M && this.vy[r] < 0) {
            this.py[r] = M;
            let _ = this.bounces[r]++;
            (_ < 2 &&
              (Ov.pos.set(this.px[r], this.py[r], this.pz[r]), (Ov.surface = this.surface[r]), this.G.events.emit("shell:bounce", Ov)),
              this.vy[r] > -0.9 || _ >= 4
                ? ((t[r] = 2),
                  (this.vx[r] = this.vy[r] = this.vz[r] = 0),
                  Xg.set(Math.PI / 2, 0, Math.random() * 6.28, "ZXY"),
                  Zo.setFromEuler(Xg),
                  (this.qx[r] = Zo.x),
                  (this.qy[r] = Zo.y),
                  (this.qz[r] = Zo.z),
                  (this.qw[r] = Zo.w))
                : ((this.vy[r] = -this.vy[r] * (0.32 + Math.random() * 0.16)),
                  (this.vx[r] = this.vx[r] * 0.6 + (Math.random() - 0.5) * 0.6),
                  (this.vz[r] = this.vz[r] * 0.6 + (Math.random() - 0.5) * 0.6),
                  (this.wx[r] = (Math.random() - 0.5) * 50),
                  (this.wy[r] = (Math.random() - 0.5) * 30),
                  (this.wz[r] = (Math.random() - 0.5) * 50),
                  _ === 0 && this._floorAt(r)));
          }
          this.age[r] > 8 && (t[r] = 2);
        } else {
          if (((this.rest[r] += e), this.rest[r] < 4 && this.rest[r] > e * 1.5)) continue;
          if (this.rest[r] >= 4.7) {
            ((t[r] = 0), Ds.makeScale(0, 0, 0), Ds.toArray(i, r * 16), (o = !0));
            continue;
          }
          this.rest[r] >= 4 && (l = 1 - (this.rest[r] - 4) / 0.7);
        }
        (Kw.set(this.qx[r], this.qy[r], this.qz[r], this.qw[r]),
          $g.set(this.px[r], this.py[r], this.pz[r]),
          Zg.set(l, l, l),
          Ds.compose($g, Kw, Zg),
          Ds.toArray(i, r * 16),
          (o = !0));
      }
      ((this.mesh.visible = s > 0), o && (this.mesh.instanceMatrix.needsUpdate = !0));
    }
  };
  export var ZP = { bullet_metal: 0.25, bullet_concrete: 0.34, bullet_wood: 0.24, scorch: 2.4, soot: 0.3, bullet_glass: 0.3 },
    Qw = 14,
    Jg = class {
      constructor(e, t = 160) {
        ((this.cap = t), (this.next = 0), (this.count = 0));
        let i = (this.atlas = Yw(256)),
          s = new pt();
        ((this.pos = new nt(new Float32Array(t * 12), 3)),
          this.pos.setUsage(Ao),
          (this.nor = new nt(new Float32Array(t * 12), 3)),
          this.nor.setUsage(Ao),
          (this.uv = new nt(new Float32Array(t * 8), 2)),
          this.uv.setUsage(Ao),
          (this.col = new nt(new Float32Array(t * 16), 4)),
          this.col.setUsage(Ao),
          (this.baseA = new Float32Array(t)),
          s.setAttribute("position", this.pos),
          s.setAttribute("normal", this.nor),
          s.setAttribute("uv", this.uv),
          s.setAttribute("color", this.col));
        let o = new Uint16Array(t * 6);
        for (let l = 0; l < t; l++) {
          let c = l * 4,
            u = l * 6;
          ((o[u] = c), (o[u + 1] = c + 1), (o[u + 2] = c + 2), (o[u + 3] = c), (o[u + 4] = c + 2), (o[u + 5] = c + 3));
        }
        s.setIndex(new nt(o, 1));
        let r = new L0({
          map: i.map,
          roughnessMap: i.orm,
          metalnessMap: i.orm,
          roughness: 1,
          metalness: 1,
          transparent: !0,
          vertexColors: !0,
          depthWrite: !1,
          polygonOffset: !0,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
        });
        (i.nrm && ((r.normalMap = i.nrm), (r.normalScale = new We(1, 1))), (r.name = "fx_decals"));
        let a = (this.mesh = new ht(s, r));
        ((a.frustumCulled = !1),
          (a.castShadow = !1),
          (a.receiveShadow = !0),
          (a.renderOrder = -5),
          (a.matrixAutoUpdate = !1),
          (a.name = "fx_decals"),
          (a.visible = !1),
          (this.uvs = {}));
        for (let l in Oa) this.uvs[l] = Oa[l].map((c) => i.uv(c));
      }
      clear() {
        (this.col.array.fill(0),
          this.pos.array.fill(0),
          (this.col.needsUpdate = this.pos.needsUpdate = !0),
          (this.next = 0),
          (this.count = 0),
          (this.mesh.visible = !1));
      }
      add(e, t, i, s, o = 1, r = 1) {
        let a = this.uvs[i] || this.uvs.bullet_concrete,
          l = a[(Math.random() * a.length) | 0],
          c = (s || ZP[i] || 0.25) * (0.85 + Math.random() * 0.3) * 0.5,
          u = this.next;
        ((this.next = (u + 1) % this.cap), this.count < this.cap && this.count++);
        let f = t.x,
          h = t.y,
          p = t.z,
          d = Math.hypot(f, h, p) || 1;
        ((f /= d), (h /= d), (p /= d));
        let m, x, v;
        Math.abs(h) > 0.9 ? ((m = 1), (x = 0), (v = 0)) : ((m = -p), (x = 0), (v = f));
        let y = m * f + x * h + v * p;
        ((m -= f * y), (x -= h * y), (v -= p * y));
        let b = Math.hypot(m, x, v) || 1;
        ((m /= b), (x /= b), (v /= b));
        let g = h * v - p * x,
          E = p * m - f * v,
          M = f * x - h * m,
          _ = i === "bullet_wood" ? (Math.random() - 0.5) * 0.3 : Math.random() * 6.283,
          T = Math.cos(_),
          w = Math.sin(_),
          S = (m * T + g * w) * c,
          R = (x * T + E * w) * c,
          z = (v * T + M * w) * c,
          I = (g * T - m * w) * c,
          L = (E * T - x * w) * c,
          U = (M * T - v * w) * c,
          k = 0.004 + (u % 7) * 3e-4,
          C = e.x + f * k,
          A = e.y + h * k,
          F = e.z + p * k,
          H = this.pos.array,
          N = this.nor.array,
          Z = this.uv.array,
          Q = this.col.array,
          W = u * 12;
        ((H[W] = C - S - I),
          (H[W + 1] = A - R - L),
          (H[W + 2] = F - z - U),
          (H[W + 3] = C + S - I),
          (H[W + 4] = A + R - L),
          (H[W + 5] = F + z - U),
          (H[W + 6] = C + S + I),
          (H[W + 7] = A + R + L),
          (H[W + 8] = F + z + U),
          (H[W + 9] = C - S + I),
          (H[W + 10] = A - R + L),
          (H[W + 11] = F - z + U));
        for (let J = 0; J < 4; J++) ((N[W + J * 3] = f), (N[W + J * 3 + 1] = h), (N[W + J * 3 + 2] = p));
        ((W = u * 8),
          (Z[W] = l[0]),
          (Z[W + 1] = l[1]),
          (Z[W + 2] = l[2]),
          (Z[W + 3] = l[1]),
          (Z[W + 4] = l[2]),
          (Z[W + 5] = l[3]),
          (Z[W + 6] = l[0]),
          (Z[W + 7] = l[3]),
          (W = u * 16),
          (this.baseA[u] = r));
        for (let J = 0; J < 4; J++) ((Q[W + J * 4] = o), (Q[W + J * 4 + 1] = o), (Q[W + J * 4 + 2] = o), (Q[W + J * 4 + 3] = r));
        if (this.count >= this.cap)
          for (let J = 0; J < Qw; J++) {
            let G = (this.next + J) % this.cap,
              te = (this.baseA[G] * (J + 1)) / (Qw + 1),
              oe = G * 16;
            Q[oe + 3] = Q[oe + 7] = Q[oe + 11] = Q[oe + 15] = te;
          }
        ((this.pos.needsUpdate = this.nor.needsUpdate = this.uv.needsUpdate = this.col.needsUpdate = !0), (this.mesh.visible = !0));
      }
    };
  export var e6 = 1400,
    t6 = 3200,
    Et = Math.random,
    lt = (n, e) => n + (e - n) * Math.random(),
    Ut = new K(),
    jt = new K(),
    Qg = new K(),
    st = new K(),
    Ls = new K(),
    jo = new K(),
    Ri = new K(0, 1, 0),
    jP = new K(0, -1, 0),
    e5 = new Qe(),
    Lo = [1, 1, 1];
  export function ph(n, e, t, i) {
    return (
      n == null
        ? ((Lo[0] = e), (Lo[1] = t), (Lo[2] = i))
        : Array.isArray(n)
          ? ((Lo[0] = n[0]), (Lo[1] = n[1]), (Lo[2] = n[2]))
          : n.isColor
            ? ((Lo[0] = n.r), (Lo[1] = n.g), (Lo[2] = n.b))
            : (e5.set(n), (Lo[0] = e5.r), (Lo[1] = e5.g), (Lo[2] = e5.b)),
      Lo
    );
  }
  export function go(n, e, t) {
    let i = Et() * 2 - 1,
      s = Et() * 2 - 1,
      o = Et() * 2 - 1,
      r = Math.hypot(i, s, o) || 1,
      a = (e * Math.cbrt(Et())) / r;
    t.set(n.x + i * a, n.y + s * a, n.z + o * a);
    let l = t.length();
    return (l < 1e-4 ? t.copy(n) : t.multiplyScalar(1 / l), t);
  }
  export async function f1(n) {
    let e = n.scene || (n.render && n.render.scene),
      t = new K(-0.8, 0, 0.3),
      i = new K(Z0.color.r, Z0.color.g, Z0.color.b).multiplyScalar((Z0.intensity / Math.PI) * 0.9),
      s = new K(
        T0.zenith.r * 0.6 + T0.horizonAway.r * 0.5 + T0.fog.r * 0.25,
        T0.zenith.g * 0.6 + T0.horizonAway.g * 0.5 + T0.fog.g * 0.25,
        T0.zenith.b * 0.6 + T0.horizonAway.b * 0.5 + T0.fog.b * 0.25,
      ),
      o = new K(
        T0.horizonAway.r * 0.3 + T0.fog.r * 0.14,
        T0.horizonAway.g * 0.3 + T0.fog.g * 0.14,
        T0.horizonAway.b * 0.3 + T0.fog.b * 0.14,
      ),
      r = Vv(n, e6, {
        lit: !0,
        tex: qw(128),
        cols: uh,
        rows: Wg,
        renderOrder: 10,
        sun: i,
        sunDir: Z0.dir.clone().normalize(),
        ambLo: o,
        ambHi: s,
      }),
      a = Vv(n, t6, { lit: !1, tex: Xw(128), cols: c1, rows: Uv, renderOrder: 20 }),
      l = new u1(e6, !0),
      c = new u1(t6 - 160, !1),
      u = new Yg(48),
      f = new jg(n, 256),
      h = new Kg(n, 60),
      p = new Jg(n, 160),
      d = new At();
    ((d.name = "fx"), d.add(p.mesh, f.mesh, h.mesh, r.mesh, a.mesh), e.add(d));
    let m = 0,
      x = -1,
      v = -1,
      y = () => n.render && n.render.lightPool,
      b = (j, O, q, ue, de) => {
        let $ = y();
        $ && $.flash(j, O, q, ue, de);
      };
    function g(j, O) {
      let q = n.physics;
      if (!q || !q.raycast) return 1;
      (Ls.copy(j), O && Ls.addScaledVector(O, 0.08), (Ls.y += 0.03));
      let ue = null;
      try {
        ue = q.raycast(Ls, Z0.dir, 90);
      } catch {
        ue = null;
      }
      return ue ? 0.2 : 1;
    }
    function E(j) {
      let O = n.physics;
      if (!O || !O.raycast) return 0;
      (Ls.copy(j), (Ls.y += 0.1));
      let q = null;
      try {
        q = O.raycast(Ls, jP, 12);
      } catch {
        q = null;
      }
      return q ? q.point.y : -50;
    }
    function M(j, O, q, ue, de, $, se, fe, me, ge, ce, P, D, B, X, re, Y, he) {
      let V = l.emit(j, O, q, ue, de, $, se, fe, me);
      return V < 0
        ? -1
        : ((l.r[V] = ge),
          (l.g[V] = ce),
          (l.b[V] = P),
          (l.a[V] = D),
          (l.shade[V] = B),
          (l.drag[V] = X),
          (l.grav[V] = -re),
          (l.wind[V] = Y),
          (l.turb[V] = 0.5),
          (l.rot[V] = Et() * 6.283),
          (l.rotv[V] = (Et() - 0.5) * 1.2),
          (l.frame[V] = he < 0 ? (Et() * 6) | 0 : he),
          (l.fin[V] = 0.06),
          (l.fout[V] = 0.3),
          (l.sk[V] = 2.5),
          V);
    }
    function _(j, O, q, ue, de, $, se, fe, me, ge, ce, P) {
      let D = c.emit(j, O, q, ue, de, $, se, fe, fe * 0.5);
      return D < 0
        ? -1
        : ((c.mode[D] = 1),
          (c.frame[D] = Bv),
          (c.stretch[D] = 0.03),
          (c.grav[D] = 9.81),
          (c.drag[D] = 0.9),
          (c.ramp[D] = 1),
          (c.r[D] = me * 0.6),
          (c.g[D] = ge * 0.6),
          (c.b[D] = ce * 0.6),
          (c.fout[D] = 0.55),
          (c.flags[D] = P),
          (c.sk[D] = 1),
          D);
    }
    function T(j, O, q, ue, de, $, se, fe, me, ge, ce, P) {
      for (let D = 0; D < q; D++) {
        go(O, $, st);
        let B = lt(ue, de) * (0.35 + 0.65 * Et());
        _(j.x, j.y, j.z, st.x * B, st.y * B, st.z * B, lt(se, fe), lt(0.01, 0.02), me * lt(0.6, 1.2), ge * lt(0.6, 1.2), ce, P);
      }
    }
    function w(j, O, q, ue, de, $, se, fe, me, ge) {
      let ce = c.emit(j, O, q, 0, 0, 0, ue, de, $);
      return ce < 0
        ? -1
        : ((c.frame[ce] = ge),
          (c.r[ce] = se),
          (c.g[ce] = fe),
          (c.b[ce] = me),
          (c.fout[ce] = 0.2),
          (c.rot[ce] = Et() * 6.283),
          (c.sk[ce] = 1.5),
          ce);
    }
    function S(j, O, q, ue, de, $, se, fe, me) {
      let ge = c.emit(j, O, q, 0, 0, 0, ue, de, $);
      return ge < 0
        ? -1
        : ((c.mode[ge] = 2),
          (c.frame[ge] = Hv),
          (c.r[ge] = se),
          (c.g[ge] = fe),
          (c.b[ge] = me),
          (c.fout[ge] = 0.15),
          (c.fin[ge] = 0.08),
          (c.sk[ge] = 2.2),
          (c.rot[ge] = Et() * 6.283),
          ge);
    }
    function R(j, O, q, ue, de, $, se, fe, me, ge, ce, P, D, B, X, re) {
      for (let Y = 0; Y < q; Y++) {
        go(O, X, st);
        let he = lt(ue, de),
          V = lt(0.8, 1.15);
        f.add(
          j.x + st.x * 0.02,
          j.y + st.y * 0.02,
          j.z + st.z * 0.02,
          st.x * he,
          st.y * he + 0.8,
          st.z * he,
          lt($, se),
          lt(fe, me),
          lt(ge, ce),
          P * V,
          D * V,
          B * V,
          lt(3.5, 6),
          re,
        );
      }
    }
    function z(j, O, q = 12) {
      (jt.copy(O || Ri),
        jt.lengthSq() < 1e-6 && jt.copy(Ri),
        jt.normalize(),
        T(j, jt, q, 5, 18, 0.6, 0.15, 0.5, 36, 22, 9, hh),
        w(j.x, j.y, j.z, 0.05, 0.2, 0.35, 10, 6.5, 3, mo));
    }
    function I(j, O = {}) {
      let q = O.size || 1,
        ue = O.life || 2.5,
        de = O.rise === void 0 ? 0.6 : O.rise,
        $ = ph(O.color, 0.32, 0.32, 0.33),
        se = O.vel,
        fe = g(j, null),
        me = O.count || 3;
      for (let ge = 0; ge < me; ge++)
        M(
          j.x + (Et() - 0.5) * 0.2 * q,
          j.y + (Et() - 0.5) * 0.2 * q,
          j.z + (Et() - 0.5) * 0.2 * q,
          (se ? se.x : 0) + (Et() - 0.5) * 0.4,
          (se ? se.y : 0) + Et() * 0.3,
          (se ? se.z : 0) + (Et() - 0.5) * 0.4,
          ue * lt(0.75, 1.2),
          q * 0.3,
          q * lt(1, 1.5),
          $[0],
          $[1],
          $[2],
          O.alpha || 0.4,
          fe,
          1.2,
          de,
          1,
          -1,
        );
    }
    function L(j, O, q = 1, ue = 0.5, de = 0.48, $ = 0.45) {
      (Ut.copy(O || Ri), Ut.lengthSq() < 1e-6 && Ut.copy(Ri), Ut.normalize());
      let se = g(j, Ut);
      for (let fe = 0; fe < 8; fe++) {
        go(Ut, 0.5, st);
        let me = lt(1, 4.5) * q,
          ge = lt(0.85, 1.1);
        M(
          j.x + Ut.x * 0.03,
          j.y + Ut.y * 0.03,
          j.z + Ut.z * 0.03,
          st.x * me,
          st.y * me,
          st.z * me,
          lt(0.5, 1.1),
          0.08 * q,
          lt(0.35, 0.7) * q,
          ue * ge,
          de * ge,
          $ * ge,
          0.9,
          se,
          3.5,
          0.15,
          0.6,
          fe < 3 ? 7 : -1,
        );
      }
      for (let fe = 0; fe < 2; fe++)
        M(
          j.x + Ut.x * 0.15,
          j.y + Ut.y * 0.15,
          j.z + Ut.z * 0.15,
          Ut.x * 0.5 + (Et() - 0.5) * 0.3,
          Ut.y * 0.5 + 0.1,
          Ut.z * 0.5 + (Et() - 0.5) * 0.3,
          lt(2.2, 3.6),
          0.25 * q,
          lt(0.9, 1.5) * q,
          ue,
          de,
          $,
          0.28,
          se,
          1.5,
          0.1,
          1,
          -1,
        );
      return se;
    }
    function U(j, O = {}) {
      let q;
      if (O.color !== void 0) q = ph(O.color, 0.4, 0.4, 0.4);
      else if (O.mat) {
        let me = null;
        try {
          me = typeof O.mat == "string" ? n.mats.get(O.mat) : O.mat;
        } catch {
          me = null;
        }
        q = ph(me && me.color ? me.color : null, 0.4, 0.4, 0.4);
      } else q = ph(null, 0.4, 0.39, 0.37);
      let ue = q[0],
        de = q[1],
        $ = q[2],
        se = O.size || 0.06,
        fe = O.speed || 5;
      (Ut.copy(O.normal || Ri).normalize(),
        R(
          j,
          Ut,
          Math.min(O.count || 6, 40),
          fe * 0.4,
          fe * 1.3,
          se * 0.4,
          se * 1.2,
          se * 0.3,
          se * 0.9,
          se * 0.4,
          se * 1.2,
          ue,
          de,
          $,
          O.spread || 1,
          E(j),
        ));
    }
    function k(j, O = 1) {
      let q = g(j, Ri),
        ue = j.y;
      for (let ge = 0; ge < 5; ge++) {
        let ce = lt(0.35, 0.6) * O,
          P = M(
            j.x + (Et() - 0.5) * 0.08 * O,
            ue + 0.1 * O,
            j.z + (Et() - 0.5) * 0.08 * O,
            (Et() - 0.5) * 0.5,
            lt(1.6, 2.8) * Math.sqrt(O),
            (Et() - 0.5) * 0.5,
            lt(0.4, 0.65),
            ce * 0.3,
            ce,
            0.72,
            0.78,
            0.84,
            0.95,
            q,
            0.5,
            -7,
            0,
            6,
          );
        P >= 0 && ((l.rot[P] = (Et() - 0.5) * 0.3), (l.rotv[P] = 0), (l.turb[P] = 0), (l.sk[P] = 3), (l.fout[P] = 0.4));
      }
      for (let ge = 0; ge < 2; ge++)
        M(
          j.x,
          ue + 0.15 * O,
          j.z,
          (Et() - 0.5) * 0.6,
          0.5,
          (Et() - 0.5) * 0.6,
          lt(0.7, 1.1),
          0.2 * O,
          0.7 * O,
          0.7,
          0.75,
          0.8,
          0.14,
          q,
          2,
          0,
          0.8,
          -1,
        );
      let de = 1.9 * q + 0.35,
        $ = 1.5 * q + 0.45,
        se = 1.05 * q + 0.55,
        fe = Math.round(14 * Math.min(O, 1.6));
      for (let ge = 0; ge < fe; ge++) {
        go(Ri, 0.75, st);
        let ce = lt(1.5, 4.8) * Math.sqrt(O),
          P = c.emit(j.x, ue + 0.03, j.z, st.x * ce, Math.abs(st.y) * ce, st.z * ce, lt(0.5, 1), lt(0.012, 0.024), 0.01);
        P >= 0 &&
          ((c.mode[P] = 1),
          (c.frame[P] = fh),
          (c.stretch[P] = 0.012),
          (c.grav[P] = 9.81),
          (c.drag[P] = 0.4),
          (c.r[P] = de),
          (c.g[P] = $),
          (c.b[P] = se),
          (c.fout[P] = 0.7),
          (c.flags[P] = dh),
          (c.sk[P] = 1),
          (c.gy[P] = ue));
      }
      S(j.x, ue + 0.012, j.z, 0.9, 0.12 * O, 1.5 * O, 0.3 * q + 0.08, 0.27 * q + 0.09, 0.22 * q + 0.1);
      let me = S(j.x, ue + 0.012, j.z, 1.3, 0.05 * O, 1 * O, 0.2 * q + 0.05, 0.18 * q + 0.06, 0.15 * q + 0.07);
      me >= 0 && (c.fin[me] = 0.35);
    }
    let C = { p: new K() };
    function A(j, O, q, ue, de) {
      (Ut.copy(O || Ri),
        Ut.lengthSq() < 1e-6 && Ut.copy(Ri),
        Ut.normalize(),
        ue && ue.lengthSq() > 1e-6 ? jt.copy(ue).normalize() : jt.copy(Ut).negate(),
        Qg.copy(jt)
          .addScaledVector(Ut, -2 * jt.dot(Ut))
          .normalize());
      let $ = C.p.copy(j);
      if ((de && (q = "enemy"), q !== "enemy" && q !== "water" && Ut.y > 0.7 && n.ground && n.ground.isPuddle))
        try {
          n.ground.isPuddle($.x, $.z) && $.y < 0.08 && (q = "water");
        } catch {}
      let fe = (n.camera ? n.camera.position : Ls.set(0, 0, 0)).distanceToSquared($) > 3025,
        me = fe ? 0.5 : 1,
        ge = Ut.x,
        ce = Ut.y,
        P = Ut.z;
      switch (q) {
        case "metal": {
          (st.copy(Qg).addScaledVector(Ut, 0.6).normalize(),
            jt.copy(st),
            T($, jt, Math.round(18 * me), 6, 24, 0.55, 0.1, 0.38, 40, 25, 10.5, 0),
            T($, jt, 2 + ((Et() * 2) | 0), 9, 18, 0.9, 0.7, 1.3, 32, 18, 7, hh),
            w($.x + ge * 0.03, $.y + ce * 0.03, $.z + P * 0.03, 0.05, 0.25, 0.45, 16, 11, 5.5, mo),
            w($.x + ge * 0.04, $.y + ce * 0.04, $.z + P * 0.04, 0.04, 0.35, 0.5, 9, 6, 2.6, Gl + ((Et() * 2) | 0)),
            m - x > 0.09 && ((x = m), Ls.copy($).addScaledVector(Ut, 0.12), b(Ls, 16760944, 10, 5, 0.05)));
          let D = g($, Ut);
          for (let B = 0; B < 2; B++)
            M(
              $.x + ge * 0.04,
              $.y + ce * 0.04,
              $.z + P * 0.04,
              ge * 0.8 + (Et() - 0.5) * 0.5,
              ce * 0.8 + 0.2,
              P * 0.8 + (Et() - 0.5) * 0.5,
              lt(0.5, 0.9),
              0.06,
              lt(0.3, 0.5),
              0.4,
              0.4,
              0.41,
              0.4,
              D,
              2.5,
              0.3,
              0.8,
              -1,
            );
          (fe || R($, Ut, 2, 1.5, 4, 0.012, 0.03, 0.003, 0.005, 0.01, 0.025, 0.2, 0.21, 0.23, 0.8, E($)), p.add($, Ut, "bullet_metal"));
          break;
        }
        case "wood": {
          let D = L($, Ut, 0.75, 0.5, 0.42, 0.32);
          (R($, Ut, fe ? 3 : 7, 2, 6, 0.004, 0.009, 0.03, 0.1, 0.004, 0.012, 0.62, 0.5, 0.33, 0.7, E($)),
            D > 0.5 && Et() < 0.3 && w($.x, $.y, $.z, 0.04, 0.1, 0.2, 3, 2, 1, mo),
            p.add($, Ut, "bullet_wood"));
          break;
        }
        case "water": {
          k($, 1);
          break;
        }
        case "rubber":
        case "dirt": {
          let D = g($, Ut),
            B = q === "dirt",
            X = B ? 0.3 : 0.14,
            re = B ? 0.25 : 0.14,
            Y = B ? 0.19 : 0.14;
          for (let he = 0; he < 5; he++) {
            go(Ut, 0.6, st);
            let V = lt(0.6, 2.6);
            M(
              $.x + ge * 0.03,
              $.y + ce * 0.03,
              $.z + P * 0.03,
              st.x * V,
              st.y * V,
              st.z * V,
              lt(0.5, 1),
              0.07,
              lt(0.3, 0.55),
              X,
              re,
              Y,
              0.85,
              D,
              3.5,
              0.1,
              0.6,
              he < 2 ? 7 : -1,
            );
          }
          (R($, Ut, 3, 1.5, 4, 0.01, 0.03, 0.008, 0.02, 0.01, 0.03, X * 0.8, re * 0.8, Y * 0.8, 0.7, E($)),
            p.add($, Ut, "soot", 0.2, 1, 0.8));
          break;
        }
        case "glass": {
          for (let D = 0; D < 12; D++) {
            go(Ut, 0.9, st);
            let B = lt(1.5, 6),
              X = c.emit($.x, $.y, $.z, st.x * B, st.y * B, st.z * B, lt(0.4, 0.9), lt(0.012, 0.02), 0.008);
            X >= 0 &&
              ((c.mode[X] = 1),
              (c.frame[X] = fh),
              (c.stretch[X] = 0.01),
              (c.grav[X] = 9.81),
              (c.r[X] = 2.6),
              (c.g[X] = 2.7),
              (c.b[X] = 2.8),
              (c.flags[X] = dh),
              (c.ramp[X] = 3));
          }
          (R($, Ut, 4, 1.5, 5, 0.01, 0.03, 0.002, 0.004, 0.01, 0.03, 0.62, 0.72, 0.74, 0.8, E($)),
            M($.x, $.y, $.z, ge * 0.6, ce * 0.6 + 0.2, P * 0.6, 0.6, 0.08, 0.4, 0.75, 0.8, 0.82, 0.2, g($, Ut), 2.5, 0.2, 0.8, -1),
            p.add($, Ut, "bullet_glass"));
          break;
        }
        case "enemy": {
          (st.copy(Qg).addScaledVector(Ut, 0.8).normalize(),
            jt.copy(st),
            T($, jt, Math.round(13 * me), 5, 20, 0.9, 0.12, 0.45, 42, 29, 14, 0),
            T($, jt, 2, 6, 12, 1, 0.6, 1.1, 32, 18, 7, hh),
            w($.x, $.y, $.z, 0.06, 0.3, 0.55, 18, 12, 6, mo),
            w($.x, $.y, $.z, 0.04, 0.3, 0.45, 8, 5, 2.4, Gl + ((Et() * 2) | 0)),
            m - x > 0.09 && ((x = m), b($, 16756832, 8, 4.5, 0.05)));
          let D = g($, Ut);
          for (let B = 0; B < 2; B++)
            M(
              $.x,
              $.y,
              $.z,
              ge * 0.5 + (Et() - 0.5) * 0.4,
              ce * 0.5 + 0.3,
              P * 0.5 + (Et() - 0.5) * 0.4,
              lt(0.6, 1.1),
              0.06,
              lt(0.3, 0.5),
              0.13,
              0.13,
              0.14,
              0.65,
              D,
              2.2,
              0.5,
              0.9,
              -1,
            );
          if (!fe) {
            let B = Et() < 0.35;
            R($, Ut, 3, 2, 6, 0.012, 0.035, 0.004, 0.008, 0.012, 0.03, 0.6, B ? 0.2 : 0.62, B ? 0.05 : 0.64, 0.8, E($));
          }
          break;
        }
        default: {
          (L($, Ut, 1, 0.52, 0.5, 0.47),
            R($, Ut, fe ? 2 : 4, 1.5, 5.5, 0.012, 0.035, 0.008, 0.02, 0.012, 0.035, 0.42, 0.41, 0.39, 0.7, E($)),
            st.copy(Qg).addScaledVector(Ut, 0.7).normalize(),
            jt.copy(st));
          for (let D = 0; D < 4; D++) {
            go(jt, 0.5, st);
            let B = lt(3, 9),
              X = M($.x, $.y, $.z, st.x * B, st.y * B, st.z * B, lt(0.25, 0.45), 0.03, 0.09, 0.6, 0.58, 0.54, 0.7, 1, 2, -6, 0.2, 7);
            X >= 0 && (l.turb[X] = 0);
          }
          (Et() < 0.3 && T($, jt, 3, 4, 10, 0.6, 0.08, 0.2, 26, 15, 6, 0), p.add($, Ut, "bullet_concrete"));
        }
      }
    }
    function F(j, O, q = {}) {
      let ue = ph(q.color, 1, 0.8, 0.46),
        de = q.intensity || 16;
      if ((u.add(j, O, ue[0] * de, ue[1] * de, ue[2] * de, q.speed || 260, q.width || 0.024), m - v > 0.07 && q.trail !== !1)) {
        ((v = m), st.subVectors(O, j));
        let $ = st.length();
        if ($ > 2) {
          st.multiplyScalar(1 / $);
          let se = 5,
            fe = Math.min($, 7),
            me = g(j, null);
          for (let ge = 0; ge < se; ge++) {
            let ce = 0.6 + ((ge + Et()) / se) * (fe - 0.6),
              P = M(
                j.x + st.x * ce,
                j.y + st.y * ce,
                j.z + st.z * ce,
                st.x * 0.6,
                0.05,
                st.z * 0.6,
                lt(0.45, 0.8),
                0.04,
                lt(0.12, 0.2),
                0.6,
                0.6,
                0.62,
                0.1,
                me,
                2,
                0.1,
                0.7,
                -1,
              );
            P >= 0 && (l.fin[P] = 0.25);
          }
        }
      }
    }
    function H(j, O, q = {}) {
      let ue = q.scale || 1;
      (jt.copy(O || Ri), jt.lengthSq() < 1e-6 && jt.set(0, 0, -1), jt.normalize());
      let de = ph(q.color, 1, 0.68, 0.32),
        $ = j.x,
        se = j.y,
        fe = j.z,
        me = de[0],
        ge = de[1],
        ce = de[2];
      (w($ + jt.x * 0.1 * ue, se + jt.y * 0.1 * ue, fe + jt.z * 0.1 * ue, 0.045, 0.75 * ue, 1.15 * ue, 34 * me, 34 * ge, 34 * ce, Gl),
        w(
          $ + jt.x * 0.14 * ue,
          se + jt.y * 0.14 * ue,
          fe + jt.z * 0.14 * ue,
          0.035,
          0.5 * ue,
          0.85 * ue,
          22 * me,
          22 * ge,
          22 * ce,
          Gl + 1,
        ),
        w(
          $ + jt.x * 0.05 * ue,
          se + jt.y * 0.05 * ue,
          fe + jt.z * 0.05 * ue,
          0.045,
          0.13 * ue,
          0.2 * ue,
          22,
          22 * (ge + 0.25),
          22 * (ce + 0.3),
          mo,
        ),
        w($, se, fe, 0.05, 0.8 * ue, 1.1 * ue, 0.4 * me, 0.4 * ge, 0.4 * ce, mo));
      let P = c.emit($ + jt.x * 0.4 * ue, se + jt.y * 0.4 * ue, fe + jt.z * 0.4 * ue, -jt.x, -jt.y, -jt.z, 0.04, 0.11 * ue, 0.14 * ue);
      P >= 0 &&
        ((c.mode[P] = 1),
        (c.frame[P] = qg),
        (c.stretch[P] = 0.9 * ue),
        (c.r[P] = 18 * me),
        (c.g[P] = 18 * ge),
        (c.b[P] = 18 * ce),
        (c.fout[P] = 0.3));
      for (let D = 0; D < 3; D++) {
        go(jt, 0.25, st);
        let B = lt(8, 22);
        _($, se, fe, st.x * B, st.y * B, st.z * B, lt(0.08, 0.22), 0.012, 30, 18, 7, 0);
      }
      (M(
        $ + jt.x * 0.2,
        se + jt.y * 0.2,
        fe + jt.z * 0.2,
        jt.x * 1.5,
        jt.y * 1.5 + 0.2,
        jt.z * 1.5,
        lt(0.5, 0.9),
        0.08 * ue,
        0.45 * ue,
        0.5,
        0.5,
        0.52,
        0.16,
        1,
        3,
        0.3,
        0.8,
        -1,
      ),
        Ls.copy(j).addScaledVector(jt, 0.25),
        b(Ls, 16756832, 16 * ue, 7 * ue, 0.05));
    }
    function N(j, O) {
      h.add(j, O);
    }
    let Z = { pos: new K(), size: 1 };
    function Q(j, O = 1) {
      let q = Math.max(0.4, Math.min(O, 4)),
        ue = j.x,
        de = j.y,
        $ = j.z,
        se = Math.sqrt(q),
        fe = E(j),
        me = de - fe < 1.4 * q,
        ge = g(j, Ri);
      (Ls.set(ue, de + 0.4, $), b(Ls, 16769712, 320 * q, 10 + 9 * q, 0.08), b(Ls, 16747056, 55 * q, 8 + 6 * q, 0.45));
      let ce = de + 0.35 * q;
      (w(ue, ce, $, 0.055, 1.5 * q, 2.3 * q, 16, 13.5, 9.5, mo),
        w(ue, ce, $, 0.05, 2.6 * q, 4.2 * q, 7, 5, 2.4, Gl + ((Et() * 2) | 0)),
        w(ue, ce, $, 0.3, 3.5 * q, 5.5 * q, 0.35, 0.2, 0.08, mo));
      let P = Math.round(13 + 5 * q);
      for (let X = 0; X < P; X++) {
        (go(Ri, 1.6, st), me && st.y < -0.1 && (st.y = -st.y * 0.5));
        let re = lt(2.2, 7.5) * se,
          Y = lt(0.7, 1.15),
          he = l.emit(
            ue + st.x * 0.3 * q,
            ce + st.y * 0.3 * q,
            $ + st.z * 0.3 * q,
            st.x * re,
            st.y * re + 1.4,
            st.z * re,
            lt(0.55, 1.05),
            0.85 * q,
            lt(1.8, 2.7) * q,
          );
        he >= 0 &&
          ((l.frame[he] = X % 4 === 0 ? 7 : (Et() * 6) | 0),
          (l.ramp[he] = 2),
          (l.r[he] = 5.8 * Y),
          (l.g[he] = 2.4 * Y),
          (l.b[he] = 0.5 * Y),
          (l.a[he] = 0.96),
          (l.shade[he] = 2 + ge),
          (l.drag[he] = 4),
          (l.grav[he] = -2.6),
          (l.wind[he] = 0.6),
          (l.turb[he] = 1.5),
          (l.rot[he] = Et() * 6.283),
          (l.rotv[he] = (Et() - 0.5) * 2.5),
          (l.sk[he] = 3),
          (l.fin[he] = 0),
          (l.fout[he] = 0.6));
      }
      for (let X = 0; X < 5; X++) {
        go(Ri, 1.4, st);
        let re = lt(2, 5) * se,
          Y = c.emit(
            ue + st.x * 0.3 * q,
            ce + st.y * 0.3 * q,
            $ + st.z * 0.3 * q,
            st.x * re,
            Math.abs(st.y) * re + 1.2,
            st.z * re,
            lt(0.3, 0.55),
            0.6 * q,
            lt(1.2, 1.8) * q,
          );
        Y >= 0 &&
          ((c.frame[Y] = Gg),
          (c.ramp[Y] = 2),
          (c.r[Y] = 2.4),
          (c.g[Y] = 1.1),
          (c.b[Y] = 0.3),
          (c.drag[Y] = 4),
          (c.grav[Y] = -2.5),
          (c.rot[Y] = Et() * 6.283),
          (c.sk[Y] = 3),
          (c.fout[Y] = 0.4));
      }
      let D = Math.round(11 + 5 * q);
      for (let X = 0; X < D; X++) {
        let re = X % 2 === 0;
        (go(Ri, 1.4, st), me && st.y < 0 && (st.y = -st.y * 0.4));
        let Y = (re ? lt(4.5, 9) : lt(1.5, 5)) * se,
          he = lt(0.04, 0.1),
          V = re ? 0.75 : 0.3,
          ne = M(
            ue + st.x * V * q,
            ce + st.y * V * q,
            $ + st.z * V * q,
            st.x * Y,
            st.y * Y + 0.8,
            st.z * Y,
            lt(2.8, 4.8),
            (re ? 0.8 : 1.2) * q,
            lt(2.6, 4.2) * q,
            he,
            he * 0.95,
            he * 0.9,
            re ? 0.7 : 0.8,
            ge,
            3.4,
            lt(0.8, 1.7),
            1,
            X % 3 === 0 ? 7 : -1,
          );
        ne >= 0 && ((l.fin[ne] = re ? 0.025 : 0.16), (l.fout[ne] = 0.35), (l.turb[ne] = 1.2));
      }
      G(ue, de + 0.3 * q, $, "smolder", 1.3 + 0.3 * q, q, ge);
      let B = Math.min(90, Math.round(34 * q));
      for (let X = 0; X < B; X++) {
        (go(Ri, 1.5, st), me && st.y < 0 && (st.y = -st.y));
        let re = lt(6, 26) * se,
          Y = _(ue, de + 0.05, $, st.x * re, st.y * re, st.z * re, lt(0.5, 1.5), lt(0.014, 0.028), 40, 23, 8, hh);
        Y >= 0 && ((c.drag[Y] = 1.4), (c.stretch[Y] = 0.035));
      }
      for (let X = 0; X < 10 * q; X++) {
        go(Ri, 1.2, st);
        let re = lt(1, 5),
          Y = c.emit(ue, de + 0.3, $, st.x * re, Math.abs(st.y) * re + 1, st.z * re, lt(1.4, 3), 0.035, 0.02);
        Y >= 0 &&
          ((c.frame[Y] = mo),
          (c.ramp[Y] = 3),
          (c.r[Y] = 9),
          (c.g[Y] = 4),
          (c.b[Y] = 1),
          (c.drag[Y] = 1.2),
          (c.grav[Y] = 0.6),
          (c.turb[Y] = 3),
          (c.wind[Y] = 1),
          (c.fout[Y] = 0.5));
      }
      if (me) {
        let X = fe + 0.015;
        S(ue, X, $, 0.32, 0.6 * q, 9 * q, 1.6, 1.2, 0.75);
        let re = Math.round(12 + 3 * q);
        for (let Y = 0; Y < re; Y++) {
          let he = ((Y + Et()) / re) * 6.283,
            V = lt(5, 10) * se,
            ne = lt(0.42, 0.55),
            ye = M(
              ue + Math.cos(he) * 0.4 * q,
              X + 0.2,
              $ + Math.sin(he) * 0.4 * q,
              Math.cos(he) * V,
              lt(0.2, 0.9),
              Math.sin(he) * V,
              lt(1.2, 2.2),
              0.4 * q,
              lt(1.2, 1.9) * q,
              ne,
              ne * 0.96,
              ne * 0.9,
              0.26,
              ge,
              3,
              0.15,
              0.7,
              -1,
            );
          ye >= 0 && (l.fin[ye] = 0.1);
        }
        (jo.set(ue, fe, $), p.add(jo, Ri, "scorch", 2.3 * q, 1, 0.92));
      }
      (jo.set(ue, Math.max(de, fe + 0.1), $),
        R(jo, Ri, Math.round(13 + 6 * q), 4, 13 * se, 0.04, 0.13, 0.025, 0.08, 0.04, 0.13, 0.07, 0.066, 0.062, 1.1, fe),
        Z.pos.copy(j),
        (Z.size = O),
        n.events.emit("explosion", Z));
    }
    let W = [];
    for (let j = 0; j < 24; j++) {
      let O = { active: !1, kind: "steam", pos: new K(), acc: 0, acc2: 0, ttl: 1 / 0, scale: 1, shade: 1, t: 0, light: null, drop: -1 };
      ((O.stop = () => {
        ((O.active = !1), O.light && (O.light.release(), (O.light = null)));
      }),
        (O.setPos = (q) => {
          O.pos.copy(q);
        }),
        W.push(O));
    }
    let J = { active: !1, pos: new K(), stop() {}, setPos() {} };
    function G(j, O, q, ue, de, $, se) {
      let fe = null;
      for (let me = 0; me < W.length; me++)
        if (!W[me].active) {
          fe = W[me];
          break;
        }
      if (!fe) return J;
      if (
        ((fe.active = !0),
        (fe.kind = ue),
        fe.pos.set(j, O, q),
        (fe.acc = 0),
        (fe.acc2 = 0),
        (fe.ttl = de),
        (fe.scale = $),
        (fe.t = 0),
        (fe.drop = -1),
        (fe.shade = se === void 0 ? g(fe.pos, null) : se),
        ue === "fire")
      ) {
        let me = y();
        ((fe.light = me && me.acquire ? me.acquire() : null),
          fe.light && (fe.light.light.color.set(16747066), (fe.light.light.distance = 9), fe.light.light.position.set(j, O + 0.5, q)));
      }
      return fe;
    }
    function te(j, O = "steam", q = {}) {
      return G(j.x, j.y, j.z, O, q.ttl || 1 / 0, q.scale || 1, void 0);
    }
    function oe(j) {
      for (let O = 0; O < W.length; O++) {
        let q = W[O];
        if (!q.active) continue;
        if (((q.t += j), q.t > q.ttl)) {
          q.stop();
          continue;
        }
        let ue = q.pos.x,
          de = q.pos.y,
          $ = q.pos.z,
          se = q.scale;
        if (q.kind === "steam")
          for (q.acc += j * 13; q.acc > 1;) {
            q.acc -= 1;
            let fe = M(
              ue + (Et() - 0.5) * 0.08,
              de,
              $ + (Et() - 0.5) * 0.08,
              (Et() - 0.5) * 0.4,
              lt(1.4, 2.4),
              (Et() - 0.5) * 0.4,
              lt(1.8, 3),
              0.12 * se,
              lt(0.8, 1.3) * se,
              0.8,
              0.82,
              0.85,
              0.2,
              q.shade,
              1.3,
              0.5,
              1,
              -1,
            );
            fe >= 0 && ((l.fin[fe] = 0.12), (l.turb[fe] = 0.9));
          }
        else if (q.kind === "smolder")
          for (q.acc += j * 9 * (1 - q.t / q.ttl); q.acc > 1;) {
            q.acc -= 1;
            let fe = lt(0.05, 0.11),
              me = M(
                ue + (Et() - 0.5) * 0.5 * se,
                de,
                $ + (Et() - 0.5) * 0.5 * se,
                (Et() - 0.5) * 0.6,
                lt(1.2, 2.4),
                (Et() - 0.5) * 0.6,
                lt(2.4, 3.8),
                0.5 * se,
                lt(1.6, 2.6) * se,
                fe,
                fe,
                fe,
                0.6,
                q.shade,
                1,
                0.9,
                1,
                -1,
              );
            me >= 0 && ((l.fin[me] = 0.12), (l.turb[me] = 1));
          }
        else if (q.kind === "embers")
          for (q.acc += j * 8; q.acc > 1;) {
            q.acc -= 1;
            let fe = c.emit(
              ue + (Et() - 0.5) * 0.4 * se,
              de,
              $ + (Et() - 0.5) * 0.4 * se,
              (Et() - 0.5) * 0.6,
              lt(0.6, 1.8),
              (Et() - 0.5) * 0.6,
              lt(1.5, 3.2),
              lt(0.02, 0.04),
              0.012,
            );
            fe >= 0 &&
              ((c.frame[fe] = mo),
              (c.ramp[fe] = 3),
              (c.r[fe] = 10),
              (c.g[fe] = 4.2),
              (c.b[fe] = 1),
              (c.drag[fe] = 0.8),
              (c.grav[fe] = -0.5),
              (c.turb[fe] = 3.5),
              (c.wind[fe] = 1),
              (c.fout[fe] = 0.5));
          }
        else if (q.kind === "fire") {
          for (q.acc += j * 24; q.acc > 1;) {
            q.acc -= 1;
            let fe = c.emit(
              ue + (Et() - 0.5) * 0.3 * se,
              de + 0.1 * se,
              $ + (Et() - 0.5) * 0.3 * se,
              (Et() - 0.5) * 0.5,
              lt(1.2, 2.6) * se,
              (Et() - 0.5) * 0.5,
              lt(0.35, 0.65),
              0.45 * se,
              lt(0.2, 0.35) * se,
            );
            fe >= 0 &&
              ((c.frame[fe] = Gg),
              (c.ramp[fe] = 2),
              (c.r[fe] = 9),
              (c.g[fe] = 5.5),
              (c.b[fe] = 2.2),
              (c.drag[fe] = 1),
              (c.rot[fe] = Et() * 6.283),
              (c.rotv[fe] = (Et() - 0.5) * 4),
              (c.fin[fe] = 0.12),
              (c.fout[fe] = 0.4),
              (c.wind[fe] = 1),
              (c.turb[fe] = 2));
          }
          for (q.acc2 += j * 4; q.acc2 > 1;) {
            q.acc2 -= 1;
            let fe = lt(0.05, 0.1),
              me = M(
                ue,
                de + 0.8 * se,
                $,
                (Et() - 0.5) * 0.4,
                lt(1.2, 2),
                (Et() - 0.5) * 0.4,
                lt(2.2, 3.4),
                0.3 * se,
                lt(1.1, 1.8) * se,
                fe,
                fe,
                fe,
                0.5,
                q.shade,
                0.9,
                0.8,
                1,
                -1,
              );
            me >= 0 && ((l.fin[me] = 0.2), (l.turb[me] = 1));
            let ge = c.emit(
              ue + (Et() - 0.5) * 0.3,
              de + 0.3,
              $ + (Et() - 0.5) * 0.3,
              Et() - 0.5,
              lt(1.5, 3),
              Et() - 0.5,
              lt(1, 2.2),
              0.03,
              0.012,
            );
            ge >= 0 &&
              ((c.frame[ge] = mo),
              (c.ramp[ge] = 3),
              (c.r[ge] = 10),
              (c.g[ge] = 4.2),
              (c.b[ge] = 1),
              (c.drag[ge] = 0.8),
              (c.grav[ge] = -0.6),
              (c.turb[ge] = 4),
              (c.wind[ge] = 1));
          }
          q.light && (q.light.light.intensity = (14 + 6 * Math.sin(q.t * 23) + 4 * Math.sin(q.t * 37.7)) * se);
        } else if (q.kind === "drip") {
          if (((q.acc += j * 1.6), q.drop >= 0 && ((q.drop -= j), q.drop < 0))) {
            let fe = q.shade;
            S(ue, 0.014, $, 0.8, 0.05, 0.55, 0.4 * fe + 0.14, 0.36 * fe + 0.16, 0.3 * fe + 0.18);
            for (let me = 0; me < 3; me++) {
              go(Ri, 0.7, st);
              let ge = c.emit(ue, 0.03, $, st.x * 1.2, Math.abs(st.y) * 1.6, st.z * 1.2, 0.35, 0.012, 0.008);
              ge >= 0 &&
                ((c.mode[ge] = 1),
                (c.frame[ge] = fh),
                (c.stretch[ge] = 0.012),
                (c.grav[ge] = 9.81),
                (c.r[ge] = 1.6 * fe + 0.3),
                (c.g[ge] = 1.3 * fe + 0.4),
                (c.b[ge] = 0.9 * fe + 0.5),
                (c.flags[ge] = dh));
            }
          }
          for (; q.acc > 1;) {
            q.acc -= 1 + Et() * 0.6;
            let fe = Math.sqrt((2 * Math.max(de, 0.05)) / 9.81),
              me = c.emit(ue, de, $, 0, -0.2, 0, fe + 0.05, 0.014, 0.014);
            (me >= 0 &&
              ((c.mode[me] = 1),
              (c.frame[me] = fh),
              (c.stretch[me] = 0.02),
              (c.grav[me] = 9.81),
              (c.r[me] = 1.4 * q.shade + 0.4),
              (c.g[me] = 1.2 * q.shade + 0.5),
              (c.b[me] = 0.9 * q.shade + 0.6),
              (c.flags[me] = dh),
              (c.fout[me] = 0.98)),
              (q.drop = fe));
          }
        }
      }
    }
    n.events.on("impact", (j) => {
      !j || !j.point || A(j.point, j.normal, j.surface, j.dir, j.enemy);
    });
    let ee = (j, O) => {
      try {
        return !!(n.ground && n.ground.isPuddle && n.ground.isPuddle(j, O));
      } catch {
        return !1;
      }
    };
    (n.events.on("player:step", (j) => {
      let O = (j && j.pos) || (n.player && n.player.pos);
      O && ((j && j.surface === "water") || ee(O.x, O.z)) && (jo.set(O.x, Math.max(0, O.y), O.z), k(jo, j && j.sprint ? 0.55 : 0.4));
    }),
      n.events.on("player:land", (j) => {
        let O = n.player && n.player.pos;
        if (O) {
          if ((jo.set(O.x, Math.max(0, O.y), O.z), (j && j.surface === "water") || ee(O.x, O.z))) k(jo, 0.9);
          else if (j && j.speed > 5) {
            let q = g(jo, Ri);
            for (let ue = 0; ue < 6; ue++) {
              let de = Et() * 6.283;
              M(
                jo.x + Math.cos(de) * 0.2,
                jo.y + 0.08,
                jo.z + Math.sin(de) * 0.2,
                Math.cos(de) * 1.6,
                0.3,
                Math.sin(de) * 1.6,
                lt(0.7, 1.2),
                0.15,
                lt(0.5, 0.8),
                0.45,
                0.44,
                0.42,
                0.22,
                q,
                3,
                0.1,
                0.8,
                -1,
              );
            }
          }
        }
      }));
    function le(j) {
      (j > 0 || (j = 0), (m += j), oe(j));
      let O = n.camera ? n.camera.position : Ls.set(0, 0, 0);
      (r.begin(),
        l.update(j, r, O, t, m),
        r.end(),
        a.begin(),
        c.update(j, a, O, t, m),
        u.update(j, a, qg, mo),
        a.end(),
        f.update(j),
        h.update(j));
    }
    function xe() {
      (l.clear(), c.clear(), u.clear(), f.clear(), h.clear(), p.clear());
      for (let j of W) j.active && j.stop();
      (r.begin(), r.end(), a.begin(), a.end());
    }
    return {
      update: le,
      clear: xe,
      muzzleFlash: H,
      tracer: F,
      impact: A,
      sparks: z,
      smoke: I,
      dust: L,
      explosion: Q,
      shell: N,
      splash: k,
      addEmitter: te,
      debris: U,
      decal(j, O, q = "bullet_concrete", ue) {
        (Ut.copy(O || Ri), p.add(j, Ut, q, ue));
      },
      wind: t,
      root: d,
      stats() {
        return { lit: l.n, add: c.n, tracers: u.n, debris: f.live, drawCalls: 5 };
      },
    };
  }
  export function KP(n) {
    let e = n.fx,
      t = n.params.fxshow || "all",
      i = new At(),
      s = (N, Z, Q, W, J) => {
        let G = new ht(N, n.mats.get(Z));
        return (G.position.set(Q, W, J), (G.castShadow = G.receiveShadow = !0), i.add(G), G);
      };
    (s(Ei(2.6, 2.2, 0.3, 0.02), "concrete", -3.2, 1.1, 0),
      s(Ei(2.2, 2, 0.08, 0.01), "paint_blue", 0, 1, 0),
      s(Ei(1.2, 1.2, 1.2, 0.015), "wood_pallet", 3.2, 0.6, 0),
      n.scene.add(i),
      n.physics.addBox([-4.5, 0, -0.15], [-1.9, 2.2, 0.15], { surface: "concrete" }),
      n.physics.addBox([-1.1, 0, -0.04], [1.1, 2, 0.04], { surface: "metal" }),
      n.physics.addBox([2.6, 0, -0.6], [3.8, 1.2, 0.6], { surface: "wood" }));
    let o = (N, Z, Q) => new K(N, Z, Q),
      r = o(-6.5, 1.5, 7),
      a = o(6.5, 1.4, 7),
      l = o(5.2, 1.3, 3.2),
      c = o(-4.6, 1.35, 4.2),
      u = o(0, 0, 0),
      f = o(0, 0, 0),
      h = o(0, 0, 0),
      p = o(0, 1, 0),
      d = { point: o(0, 0, 0), normal: o(0, 1, 0), surface: "concrete", dir: o(0, 0, 0), enemy: null, from: "player" },
      m = Math.random,
      x = 0,
      v = 0,
      y = 0,
      b = 0,
      g = 0,
      E = 0.2,
      M = 0,
      _ = 3.4,
      T = !1,
      w = t === "all" || t === "impact",
      S = t === "all" || t === "explosion",
      R = t === "all" || t === "tracer",
      z = t === "explosion" ? 2.4 : 3.5;
    (t === "explosion" && (_ = 0.6),
      (t === "all" || t === "impact") &&
        (e.addEmitter(o(-6.2, 0.05, -1.5), "steam"), e.addEmitter(o(5.6, 0, 1.6), "fire"), e.addEmitter(o(0.4, 2.6, 1.6), "drip")));
    function I(N) {
      let Z = y++ % 2 ? a : r;
      if (((d.enemy = null), (d.from = "player"), N === 5)) {
        (d.point.set(-1.5 + m() * 0.3, 2.5 + m() * 0.3, 0.8),
          d.normal.copy(Z).sub(d.point).normalize(),
          (d.surface = "enemy"),
          (d.enemy = {}),
          d.dir.copy(d.point).sub(Z).normalize(),
          e.tracer(Z, d.point),
          n.events.emit("impact", d));
        return;
      }
      (N === 0
        ? u.set(-3.2 + (m() - 0.5) * 2, 0.4 + m() * 1.5, 0)
        : N === 1 || N === 7
          ? u.set((m() - 0.5) * 1.8, 0.3 + m() * 1.5, 0)
          : N === 2
            ? u.set(3.2 + (m() - 0.5) * 0.9, 0.2 + m() * 0.9, 0.6)
            : N === 3
              ? u.set(-1.6 + (m() - 0.5) * 1.2, 0, 2.2 + m())
              : N === 4
                ? u.set(1.5 + (m() - 0.5) * 0.8, 0, 2.6 + m() * 0.8)
                : u.set(3.4 + (m() - 0.5), 0, 2.4 + m() * 0.6),
        f.copy(u).sub(Z).normalize());
      let Q = n.physics.raycast(Z, f, 100);
      Q &&
        (d.point.copy(Q.point),
        d.normal.copy(Q.normal),
        d.dir.copy(f),
        (d.surface = N === 4 ? "water" : N === 6 ? "dirt" : Q.surface),
        e.tracer(Z, d.point),
        n.events.emit("impact", d));
    }
    let L = n.params.fxhold,
      U = o(0, 1.3, 3),
      k = o(1, 0, 0);
    function C(N) {
      if (
        ((x += N),
        L === "muzzle" &&
          (e.muzzleFlash(U, k, { scale: 1 }),
          (U.x = 2.5),
          k.set(-0.5, 0, 0.86),
          e.muzzleFlash(U, k, { scale: 1.6 }),
          (U.x = 0),
          k.set(1, 0, 0)),
        w)
      )
        for (g -= N; g <= 0;) ((g += t === "impact" ? 0.09 : 0.13), I(v++ % 8));
      if (
        (R &&
          ((E -= N),
          E <= 0 &&
            ((E += t === "tracer" ? 0.16 : 0.45),
            h.set(-5 + m() * 3, 1.2 + m() * 0.8, 6 + m() * 2),
            f.copy(h).sub(l).normalize(),
            e.muzzleFlash(l, f, { scale: 1 }),
            e.tracer(l, h, { color: 16730658, speed: 120 }),
            t === "tracer" && (h.set(6, 1 + m() * 1.5, -6 - m() * 6), u.set(-7, 1.6, 6.5), e.tracer(u, h, { speed: 200 }))),
          (M -= N),
          M <= 0 && ((M += 0.22), h.set(1.6 + m() * 0.8, 1.6 + m() * 0.8, 0.4 + (m() - 0.5) * 0.8), e.shell(c, h))),
        S && ((_ -= N), _ <= 0))
      ) {
        _ += z;
        let Z = +(n.params.fxsize || 0) || 1 + (b++ % 3);
        (h.set(t === "explosion" ? 0 : 7, 0.25, t === "explosion" ? 3.5 : -3.5), e.explosion(h, Z));
      }
    }
    let A = !1,
      F = e.update;
    e.update = (N) => {
      A || F(N);
    };
    let H = window.__setShot;
    return (
      H &&
        (window.__setShot = (N) => {
          if (N && N.fxage !== void 0) {
            (e.clear(), h.set(0, 0.25, 3.5), e.explosion(h, +(N.fxsize || 1.2)));
            let Z = +N.fxage;
            for (let Q = 0; Q < Z - 1e-6; Q += 1 / 60) F(1 / 60);
            (F(0), (A = !0));
          }
          H(N);
        }),
      {
        cam: t === "explosion" ? [0, 2, 12.5] : [0.3, 1.6, 7.2],
        target: t === "explosion" ? [0, 2.2, 3.5] : [0.2, 1, 0],
        update(N) {
          if (!T) {
            T = !0;
            let Z = +(n.params.fxt || 0);
            for (let Q = 0; Q < Z; Q += 1 / 30) (C(1 / 30), e.update(1 / 30));
          }
          A || C(N);
        },
      }
    );
  }
  export var at = Math.PI * 2;
  export function as(n) {
    let e = n >>> 0;
    return () => {
      ((e |= 0), (e = (e + 1831565813) | 0));
      let t = Math.imul(e ^ (e >>> 15), 1 | e);
      return ((t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t), ((t ^ (t >>> 14)) >>> 0) / 4294967296);
    };
  }
  export function Gv(n) {
    let e = 2166136261;
    for (let t = 0; t < n.length; t++) ((e ^= n.charCodeAt(t)), (e = Math.imul(e, 16777619)));
    return e >>> 0;
  }
  export var it = (n, e) => new Float32Array(Math.max(1, Math.round(n * e))),
    Dt = (n, e, t) => e + (t - e) * n(),
    qt = (n) => 440 * Math.pow(2, (n - 69) / 12);
  export function e0(n, e, t) {
    let i = it(n, e);
    for (let s = 0; s < i.length; s++) i[s] = t() * 2 - 1;
    return i;
  }
  export function mu(n, e, t, i) {
    let s = (at * Math.max(10, Math.min(e, i * 0.47))) / i,
      o = Math.cos(s),
      r = Math.sin(s),
      a = r / (2 * t),
      l,
      c,
      u,
      f = 1 + a,
      h = -2 * o,
      p = 1 - a;
    return (
      n === "lp"
        ? ((l = (1 - o) / 2), (c = 1 - o), (u = l))
        : n === "hp"
          ? ((l = (1 + o) / 2), (c = -(1 + o)), (u = l))
          : ((l = a), (c = 0), (u = -a)),
      [l / f, c / f, u / f, h / f, p / f]
    );
  }
  export function kt(n, e, t, i, s) {
    let [o, r, a, l, c] = mu(e, t, i, s),
      u = 0,
      f = 0;
    for (let h = 0; h < n.length; h++) {
      let p = n[h],
        d = o * p + u;
      ((u = r * p - l * d + f), (f = a * p - c * d), (n[h] = d));
    }
    return n;
  }
  export function y0(n, e, t, i, s, o = 1) {
    let r = n.length;
    for (let a = 0; a < o; a++) {
      let l = 0,
        c = 0,
        u = null;
      a > 0 && ((l = y0.z1), (c = y0.z2));
      let f = a === o - 1 ? n : null;
      for (let h = 0; h < r; h++) {
        (h & 31) === 0 && (u = mu(e, t(h / r), typeof i == "function" ? i(h / r) : i, s));
        let p = n[h],
          d = u[0] * p + l;
        ((l = u[1] * p - u[3] * d + c), (c = u[2] * p - u[4] * d), f && (f[h] = d));
      }
      ((y0.z1 = l), (y0.z2 = c));
    }
    return n;
  }
  export var ei =
    (n, e, t = 1) =>
    (i) =>
      n * Math.pow(e / n, Math.pow(i, t));
  export function Mn(n, e, t) {
    for (let i = 0; i < n.length; i++) n[i] *= t(i / e);
    return n;
  }
  export var ms = (n, e = 0) => (e > 0 ? (t) => (1 - Math.exp(-t / e)) * Math.exp(-t / n) : (t) => Math.exp(-t / n));
__late_mats.ms(ms);
  export function Se(n, e, t, i, s) {
    let o = Math.round(t * s),
      r = Math.min(e.length, n.length - o);
    for (let a = Math.max(0, -o); a < r; a++) n[o + a] += e[a] * i;
    return n;
  }
  export function Ni(n, e, t, i, s) {
    let o = n.length,
      r = Math.round(t * s) % o;
    r < 0 && (r += o);
    for (let a = 0; a < e.length; a++) ((n[r] += e[a] * i), ++r >= o && (r = 0));
    return n;
  }
  export function Pr(n) {
    let e = 0;
    for (let t = 0; t < n.length; t++) {
      let i = Math.abs(n[t]);
      i > e && (e = i);
    }
    return e;
  }
  export function ls(n, e) {
    for (let t = 0; t < n.length; t++) n[t] *= e;
    return n;
  }
  export function fi(n, e) {
    let t = 1 / Math.tanh(e);
    for (let i = 0; i < n.length; i++) n[i] = Math.tanh(n[i] * e) * t;
    return n;
  }
  export function n6(n, e, t, i) {
    let s = Math.min(n.length >> 1, Math.round(t * e)),
      o = Math.min(n.length >> 1, Math.round(i * e));
    for (let r = 0; r < s; r++) n[r] *= r / s;
    for (let r = 0; r < o; r++) {
      let a = r / o;
      n[n.length - 1 - r] *= a * a;
    }
    return n;
  }
  export function xt(n, e, t, i, s = {}) {
    let o = e0(n, t, e);
    (s.hp && kt(o, "hp", s.hp, 0.707, n),
      s.lp && kt(o, "lp", s.lp, 0.707, n),
      s.bp && kt(o, "bp", s.bp, s.q || 1, n),
      Mn(o, n, ms(i, s.att || 0)));
    let r = Pr(o);
    return r > 0 ? ls(o, 1 / r) : o;
  }
  export function Gn(n, e, t, i, s, o, r = 6e-4) {
    let a = it(n, e),
      l = 0;
    for (let c = 0; c < a.length; c++) {
      let u = c / n;
      ((l += (at * (i + (t - i) * Math.exp(-u / s))) / n), (a[c] = Math.sin(l) * Math.exp(-u / o) * (1 - Math.exp(-u / r))));
    }
    return a;
  }
  export function Va(n, e, t, i, s = !0) {
    let o = it(n, e),
      r = 0,
      a = o.length;
    for (let l = 0; l < a; l++) {
      let c = l / a;
      ((r += (at * t * Math.pow(i / t, c)) / n), (o[l] = Math.sin(r) * (s ? Math.sin(Math.PI * c) : 1)));
    }
    return o;
  }
  export function Xt(n, e, t, i) {
    let s = it(n, e);
    for (let [r, a, l] of t) {
      if (r > n * 0.46) continue;
      let c = (at * r) / n,
        u = i ? i() * at : 0,
        f = Math.exp(-1 / (a * n)),
        h = 2 * f * Math.cos(c),
        p = f * f,
        d = Math.min(s.length, Math.ceil(Math.log(1e-5 / Math.max(l, 1e-5)) / Math.log(f)) + 1),
        m = (l / f) * Math.sin(u - c),
        x = l * Math.sin(u);
      for (let v = 0; v < d; v++) {
        s[v] += x;
        let y = h * x - p * m;
        ((m = x), (x = y));
      }
    }
    let o = Math.min(s.length, Math.round(4e-4 * n));
    for (let r = 0; r < o; r++) s[r] *= r / o;
    return s;
  }
  export function Wa(n, e, t, i, s = {}) {
    let o = it(n, t),
      r = s.from || 0,
      a = s.fall || 1;
    for (let l = 0; l < i; l++) {
      let c = r + (t - r - 0.02) * Math.pow(e(), a),
        u = Math.round(c * n),
        f = Math.round(Dt(e, s.minLen || 0.001, s.maxLen || 0.004) * n),
        h = Dt(e, 0.2, 1) * (s.ampFall ? Math.exp(-c / s.ampFall) : 1);
      for (let p = 0; p < f && u + p < o.length; p++) o[u + p] += (e() * 2 - 1) * h * Math.exp((-4 * p) / f);
    }
    return (s.hp && kt(o, "hp", s.hp, 0.707, n), s.lp && kt(o, "lp", s.lp, 0.707, n), s.bp && kt(o, "bp", s.bp, s.q || 1, n), o);
  }
  export function t5(n, e, t) {
    let i = n.length - e,
      s = new Float32Array(e);
    s.set(n.subarray(0, e));
    for (let o = 0; o < i; o++) {
      let r = (o + 0.5) / i,
        a = t ? Math.sin((r * Math.PI) / 2) : r,
        l = t ? Math.cos((r * Math.PI) / 2) : 1 - r;
      s[o] = n[o] * a + n[e + o] * l;
    }
    return s;
  }
  export function gu(n, e, t, i, s = 0.4) {
    let o = e0(n, e + s, t);
    return (i(o), t5(o, Math.round(n * e), !0));
  }
  export function qv(n, ...e) {
    let t = new Float32Array(n);
    for (let [i, s] of e) for (let o = 0; o < Math.min(n, i.length); o++) t[o] += i[o] * s;
    return t;
  }
  export var C0 = (n, e = 1) => {
    let t = Pr(n);
    return t > 0 ? ls(n, e / t) : n;
  };
  export function n5(n, e) {
    let t = it(n, e * 12);
    for (let i = 0; i < t.length; i++) {
      let s = i / n / e;
      t[i] = (1 - s) * Math.exp(-s);
    }
    return t;
  }
  export function s6(n, e, t, i, s, o) {
    let r = Math.exp(-1 / (s * e)),
      a = Math.exp(-1 / (o * e)),
      l = 1 / i - 1,
      c = 0;
    for (let u = 0; u < n.length; u++) {
      let f = Math.abs(n[u]);
      ((c = f > c ? r * c + (1 - r) * f : a * c + (1 - a) * f), c > t && (n[u] *= Math.pow(c / t, l)));
    }
    return n;
  }
  export function JP(n, e, t, i, s = 1) {
    let o = Math.max(1, Math.round(t * e)),
      r = new Float32Array(n.length);
    for (let l = 0; l < n.length; l++) r[l] = n[l] + (l >= o ? r[l - o] * i : 0);
    let a = 1 - i * 0.5;
    for (let l = 0; l < n.length; l++) n[l] = n[l] * (1 - s) + r[l] * a * s;
    return n;
  }
  export function Fn(n, e, t, i = {}) {
    let s = 0.004;
    for (let a of t) s = Math.max(s, a[1]);
    let o = it(n, Math.min(0.5, s * 7 + 0.004)),
      r = i.jit == null ? 0.02 : i.jit;
    return (
      Se(
        o,
        Xt(
          n,
          o.length / n,
          t.map(([a, l, c]) => [a * (1 + (e() * 2 - 1) * r), l, c]),
          e,
        ),
        0,
        i.ring == null ? 0.6 : i.ring,
        n,
      ),
      i.tick !== 0 && Se(o, xt(n, e, 0.006, i.tickTau || 9e-4, { hp: i.hp || 2500 }), 0, i.tick == null ? 0.7 : i.tick, n),
      o
    );
  }
  export function h1(n, e, t, i, s, o = {}) {
    let r = e0(n, t, e),
      a = o.q || 1.8,
      l = o.rough || 200,
      c = o.rough1 || l,
      u = r.length;
    if ((y0(r, "bp", ei(i, s, o.curve || 1), a, n), o.hi)) {
      let m = e0(n, t, e);
      y0(m, "bp", ei(i * 2.37, s * 2.37, o.curve || 1), a * 1.5, n);
      for (let x = 0; x < u; x++) r[x] += m[x] * o.hi;
    }
    let f = 0.5,
      h = 0.5,
      p = 0,
      d = o.env || ((m) => Math.sin(Math.PI * Math.pow(m, 0.7)));
    for (let m = 0; m < u; m++) {
      let x = m / u;
      (m >= p && ((h = 0.2 + e() * 0.8), (p = m + (n / (l + (c - l) * x)) * (0.6 + e() * 0.8))), (f += (h - f) * 0.03), (r[m] *= f * d(x)));
    }
    return C0(r);
  }
  export function Yv(n, e, t, i, s, o) {
    let r = e0(n, t, e),
      a = r.length;
    y0(r, "bp", ei(i, s), 0.7, n);
    let l = e0(n, t, e);
    kt(l, "lp", 420, 0.7, n);
    let c = 0.4,
      u = 0.6,
      f = 0,
      h = 0.5,
      p = 0.5;
    for (let d = 0; d < a; d++) {
      let m = d / a;
      (d >= f && ((u = 0.15 + e() * 0.85), (f = d + n * (0.006 + e() * 0.016))),
        (d & 63) === 0 && (p = 0.5 + e() * 0.5),
        (c += (u - c) * 0.004),
        (h += (p - h) * 0.05),
        (r[d] = (r[d] * c * h + l[d] * 0.9 * c) * o(m)));
    }
    return C0(r);
  }
  export var hi = (n, e, t = 28) => kt(n, "hp", t, 0.707, e);
  export function o6(n, e, t, i = 0.72, s = 0.0012) {
    for (let o = 0; o < n.length; o++) n[o] *= i + (1 - i) * Math.exp(-Math.max(0, o / e - t) / s);
    return n;
  }
  export var d1 =
      (n, e = 1) =>
      (t) =>
        Math.pow(t < n ? t / n : (1 - t) / (1 - n), e),
    QP = {
      len: 0.64,
      n: 5,
      pitch: [1, 0.965, 1.035, 0.985, 1.018],
      bright: [1, 1.07, 0.94, 1.04, 0.97],
      layers: [
        [85, 220, 1.75, 0.115, 0.125],
        [220, 950, 2.2, 0.1, 0.052],
        [950, 5e3, 1.5, 0.055, 0.026],
      ],
      hold: 0.022,
      holdTau: 0.0095,
      drive: 1.6,
      tPlus: 4e-4,
      blast: 2.5,
      f0: 150,
      f1: 62,
      tauF: 0.03,
      tauA: 0.055,
      thump: 0.2,
      lpEnd: 800,
      lpMid: 2600,
      lpMidTau: 0.07,
      lpTop: 15e3,
      lpTopTau: 0.0028,
      shelfF: 230,
      shelf: 0.55,
      plateau: 0.8,
      reDrive: 1.5,
      mech: [
        [
          0.021,
          0.05,
          [
            [2180, 0.007, 1],
            [3460, 0.006, 0.7],
            [1840, 0.009, 0.5],
          ],
          3e3,
        ],
        [
          0.058,
          0.07,
          [
            [1930, 0.009, 1],
            [2910, 0.007, 0.75],
            [4380, 0.005, 0.5],
            [860, 0.014, 0.4],
          ],
          2400,
        ],
      ],
      spring: [
        [706, 0.055, 1],
        [1418, 0.035, 0.4],
      ],
      springG: 0.02,
    },
    eI = {
      len: 0.44,
      n: 4,
      pitch: [1, 1.04, 0.962, 1.02],
      bright: [1, 0.95, 1.06, 1.02],
      layers: [
        [100, 270, 1.3, 0.16, 0.055],
        [270, 1400, 2.2, 0.2, 0.038],
        [1400, 5500, 1.8, 0.12, 0.016],
      ],
      hold: 0.01,
      holdTau: 0.005,
      drive: 1.5,
      tPlus: 45e-5,
      blast: 2.5,
      f0: 230,
      f1: 105,
      tauF: 0.014,
      tauA: 0.028,
      thump: 0.25,
      lpEnd: 1e3,
      lpMid: 2200,
      lpMidTau: 0.04,
      lpTop: 15e3,
      lpTopTau: 0.0024,
      shelfF: 260,
      shelf: 0.2,
      plateau: 0.78,
      reDrive: 1.5,
      mech: [
        [
          0.016,
          0.09,
          [
            [2920, 0.006, 1],
            [4410, 0.005, 0.8],
            [1650, 0.007, 0.4],
          ],
          3400,
        ],
        [
          0.046,
          0.12,
          [
            [3380, 0.008, 1],
            [5180, 0.007, 0.8],
            [1230, 0.01, 0.35],
          ],
          3e3,
        ],
      ],
      spring: [
        [1180, 0.02, 1],
        [2390, 0.012, 0.4],
      ],
      springG: 0.015,
    };
  export function r6(n, e, t, i) {
    let s = t % i.n,
      o = i.pitch[s],
      r = i.bright[s],
      a = 5e-4,
      l = it(n, i.len),
      c = l.length - Math.round(0.004 * n),
      u = new Float32Array(c);
    for (let [p, d, m, x, v] of i.layers) {
      let y = new Float32Array(c);
      for (let R = 0; R < c; R++) y[R] = e() * 2 - 1;
      (kt(y, "hp", p * o, 0.707, n), kt(y, "hp", p * o, 0.707, n), kt(y, "lp", d * o * r, 0.707, n));
      let b = 0,
        g = Math.min(c, Math.round(0.12 * n));
      for (let R = 0; R < g; R++) b += y[R] * y[R];
      let E = 1 / Math.sqrt(b / g + 1e-12),
        M = Math.exp(-1 / (v * n)),
        _ = Math.exp(-1 / (i.holdTau * n)),
        T = Math.round(i.hold * n),
        w = x,
        S = m;
      for (let R = 0; R < c; R++) ((u[R] += y[R] * E * (S + w)), (w *= M), R >= T && (S *= _));
    }
    (Se(u, Gn(n, 0.3, i.f0 * o, i.f1 * o, i.tauF, i.tauA, 0.001), 0, i.thump, n), Se(u, n5(n, i.tPlus / o), 0, i.blast, n));
    for (let p = 0; p < c; p++) u[p] = Math.tanh(u[p] * i.drive);
    let f = (p) => {
      let d = (p * c) / n;
      return (i.lpEnd + i.lpMid * Math.exp(-d / i.lpMidTau)) * r + i.lpTop * Math.exp(-d / i.lpTopTau);
    };
    (y0(u, "lp", f, 0.6, n), y0(u, "lp", f, 0.6, n));
    let h = Float32Array.from(u);
    kt(h, "lp", i.shelfF, 0.707, n);
    for (let p = 0; p < c; p++) u[p] += h[p] * i.shelf;
    hi(u, n, 30);
    {
      let p = 0,
        d = Math.round(0.004 * n),
        m = Math.round((i.hold + 0.004) * n);
      for (let x = d; x < m; x++) p += u[x] * u[x];
      ls(u, i.plateau / Math.sqrt(p / (m - d) + 1e-12));
    }
    (fi(u, i.reDrive), Se(l, u, a, 1, n));
    for (let p = 0; p < i.mech.length; p++) {
      let [d, m, x, v] = i.mech[p],
        y = a + d * Dt(e, 0.94, 1.06);
      (Se(
        l,
        Fn(
          n,
          e,
          x.map(([b, g, E]) => [b * o, g, E]),
          { hp: v, tick: 0.6, ring: 0.7 },
        ),
        y,
        m,
        n,
      ),
        p === i.mech.length - 1 &&
          Se(
            l,
            Xt(
              n,
              0.22,
              i.spring.map(([b, g, E]) => [b * o, g, E]),
              e,
            ),
            y + 0.002,
            i.springG,
            n,
          ));
    }
    return l;
  }
  export var a6 = (n, e, t) => r6(n, e, t, QP),
    l6 = (n, e, t) => r6(n, e, t, eI),
    ql = (n) => Math.pow(10, n / 20),
    c6 = (n, e) => {
      for (let t = 0; t < n.length; t++) n[t] = e * Math.tanh(n[t] / e);
      return n;
    },
    xu = (n, e, t) => {
      let i = 0;
      ((e = Math.max(0, e | 0)), (t = Math.min(n.length, t | 0)));
      for (let s = e; s < t; s++) i += n[s] * n[s];
      return Math.sqrt(i / Math.max(1, t - e));
    };
  export function i6(n, e) {
    let t = Math.round(0.01 * e),
      i = Math.round(0.002 * e),
      s = 0;
    for (let o = 0; o + t <= n.length; o += i) s = Math.max(s, xu(n, o, o + t));
    return s;
  }
  export function u6(n, e, t, i) {
    let s = Math.floor(e() * 1e9),
      o = as(s),
      r = i.len,
      a = i.ref,
      l = i.slaps[t % i.slaps.length].map(([m, x, v, y, b]) => {
        let g = e0(n, 0.16, o);
        return (
          kt(g, "hp", 300, 0.7, n),
          kt(g, "lp", v, 0.7, n),
          Mn(g, n, (E) => (1 - Math.exp(-E / 0.002)) * (E < i.slapHold ? 1 : Math.exp(-(E - i.slapHold) / i.slapTau))),
          C0(g),
          JP(g, n, b / 1e3, 0.5, 0.7),
          Se(
            g,
            Xt(
              n,
              0.1,
              [
                [Dt(o, 110, 190), 0.05, 1],
                [Dt(o, 240, 420), 0.035, 0.6],
              ],
              o,
            ),
            0.002,
            0.12,
            n,
          ),
          { b: ls(g, (a * ql(x)) / i6(g, n)), t: m - 0.007, pan: y }
        );
      }),
      c = e0(n, r, o),
      u = xt(n, o, 0.6, 0.14, { hp: 80, lp: 650, att: 0.04 });
    ls(u, (a * ql(i.far)) / i6(u, n));
    let f = e0(n, r - 0.1, o);
    (kt(f, "lp", 130, 0.7, n),
      kt(f, "hp", 34, 0.7, n),
      Mn(f, n, (m) => (1 - Math.exp(-m / 0.05)) * Math.exp(-Math.pow(m / i.lateT, 2))),
      ls(f, (a * ql(i.rumble)) / xu(f, 0.1 * n, 0.3 * n)));
    let h = Math.round(0.1 * n),
      p = Math.round(0.2 * n),
      d = (m) => {
        let x = as(s + 101 + m * 977),
          v = it(n, r),
          y = m ? 1 : -1,
          b = e0(n, r, x),
          g = it(n, r);
        for (let M = 0; M < g.length; M++) g[M] = c[M] * 0.72 + b[M] * 0.68;
        (y0(g, "lp", ei(i.lp0, i.lp1, 0.55), 0.6, n), kt(g, "hp", 140, 0.7, n));
        let E = Float32Array.from(g);
        (Mn(E, n, (M) => (1 - Math.exp(-M / 0.003)) * Math.exp(-M / i.earlyTau)),
          Mn(g, n, (M) => (1 - Math.exp(-M / 0.03)) * Math.exp(-Math.pow(M / i.lateT, 2))),
          Se(v, E, 0.004, (a * ql(i.early)) / xu(E, 0, 0.05 * n), n),
          Se(v, g, 0.004, (a * ql(i.floor)) / xu(g, h, p), n));
        for (let M of l) Se(v, M.b, M.t + (M.pan * y > 0 ? 0 : Math.abs(M.pan) * 9e-4), 1 + 0.4 * M.pan * y, n);
        return (Se(v, u, i.farT + (m ? 7e-4 : 0), m ? 0.85 : 1.1, n), Se(v, f, 0.03, 1, n), c6(v, i.ceil));
      };
    return [d(0), d(1)];
  }
  export function f6(n, e, t, i) {
    let s = Math.floor(e() * 1e9),
      o = as(s),
      r = i.len,
      a = i.ref,
      l = e0(n, r, o),
      c = 18,
      u = [];
    for (let m = 0; m < c; m++)
      u.push([0.006 + 0.085 * Math.pow((m + o()) / c, 1.3), Math.pow(0.9, m) * Dt(o, 0.6, 1.1), o() * 2 - 1, Dt(o, 3200, 7500)]);
    let f = t & 1 ? 0.051 : 0.046,
      h = Math.round(0.1 * n),
      p = Math.round(0.2 * n),
      d = (m) => {
        let x = as(s + 211 + m * 613),
          v = it(n, r),
          y = m ? 1 : -1,
          b = it(n, 0.5);
        for (let [_, T, w, S] of u)
          Se(b, xt(n, x, 0.03, 0.005, { hp: 350, lp: S, att: 4e-4 }), _ + (w * y > 0 ? 0 : 6e-4), T * (1 + 0.4 * w * y), n);
        for (let _ = 1; _ < 8; _++)
          Se(b, xt(n, x, 0.04, 0.007, { hp: 600, lp: 5200 / (1 + _ * 0.3) }), f * _ * (m ? 1.012 : 0.99), 0.45 * Math.pow(0.72, _), n);
        Se(v, b, 0, (a * ql(i.early)) / xu(b, 0, 0.05 * n), n);
        let g = e0(n, r, x),
          E = it(n, r);
        for (let _ = 0; _ < E.length; _++) E[_] = l[_] * 0.7 + g[_] * 0.7;
        (y0(E, "lp", ei(i.lp0, i.lp1, 0.5), 0.6, n), kt(E, "hp", 170, 0.7, n), Mn(E, n, ms(i.tau, 0.006)));
        let M = (a * ql(i.level)) / xu(E, h, p);
        Se(v, E, 0.004, M, n);
        for (let [_, T] of [
          [57, 1],
          [86, 0.8],
          [123, 0.6],
          [171, 0.4],
        ]) {
          let w = e0(n, Math.min(r - 0.05, 0.9), x);
          (kt(w, "bp", _ * (t & 1 ? 1.05 : 1), 8, n),
            Mn(w, n, ms(i.tau * 1.25, 0.02)),
            Se(v, w, 0.01, (T * a * ql(i.modes)) / xu(w, h, p), n));
        }
        return c6(v, i.ceil);
      };
    return [d(0), d(1)];
  }
  export var tI = [
      [
        [0.078, -11.6, 4400, -0.8, 2.7],
        [0.124, -11.6, 3400, 0.7, 3.6],
        [0.171, -12, 2500, -0.3, 2.2],
        [0.262, -19, 1500, 0.5, 4.1],
      ],
      [
        [0.084, -11.4, 4200, 0.8, 3.1],
        [0.131, -11.6, 3600, -0.6, 2.4],
        [0.177, -12, 2400, 0.35, 3.9],
        [0.286, -19, 1400, -0.5, 2.9],
      ],
    ],
    nI = {
      len: 2.2,
      ref: 0.7,
      ceil: 0.75,
      slaps: tI,
      slapHold: 0.024,
      slapTau: 0.009,
      lp0: 3600,
      lp1: 600,
      early: -15,
      earlyTau: 0.03,
      floor: -14.1,
      lateT: 0.8,
      farT: 0.42,
      far: -18,
      rumble: -22,
    },
    iI = {
      len: 1.5,
      ref: 0.53,
      slaps: [
        [
          [0.076, -11.8, 5200, -0.7, 2.1],
          [0.121, -12, 3900, 0.75, 2.9],
          [0.168, -12.8, 2800, -0.25, 3.4],
        ],
      ],
      slapHold: 0.015,
      slapTau: 0.008,
      ceil: 0.6,
      lp0: 4400,
      lp1: 700,
      early: -15,
      earlyTau: 0.03,
      floor: -14.6,
      lateT: 0.55,
      farT: 0.34,
      far: -22,
      rumble: -28,
    },
    sI = { len: 1.3, ref: 0.7, ceil: 0.7, lp0: 7800, lp1: 1300, tau: 0.15, early: -13, level: -9, modes: -21 },
    oI = { len: 0.9, ref: 0.53, ceil: 0.55, lp0: 8500, lp1: 1700, tau: 0.105, early: -13, level: -10, modes: -27 },
    h6 = (n, e, t) => u6(n, e, t, nI),
    d6 = (n, e, t) => f6(n, e, t, sI),
    p6 = (n, e, t) => u6(n, e, t, iI),
    m6 = (n, e, t) => f6(n, e, t, oI);
  export function g6(n, e) {
    let t = it(n, 0.2),
      i = 5e-4;
    return (
      Se(
        t,
        Fn(
          n,
          e,
          [
            [2260, 0.005, 1],
            [3640, 0.0045, 0.75],
            [5880, 0.003, 0.5],
            [8100, 0.002, 0.3],
          ],
          { hp: 2200, tick: 0.9 },
        ),
        i,
        1,
        n,
      ),
      Se(
        t,
        Xt(
          n,
          0.05,
          [
            [640, 0.009, 1],
            [1180, 0.007, 0.6],
          ],
          e,
        ),
        i,
        0.3,
        n,
      ),
      Se(t, xt(n, e, 0.02, 0.004, { lp: 900 }), i, 0.22, n),
      Se(
        t,
        Fn(
          n,
          e,
          [
            [3050, 0.003, 1],
            [4700, 0.0025, 0.6],
          ],
          { hp: 3200, tick: 0.5 },
        ),
        i + 0.0125,
        0.16,
        n,
      ),
      Se(
        t,
        Xt(
          n,
          0.18,
          [
            [742, 0.04, 1],
            [1493, 0.028, 0.45],
            [2260, 0.016, 0.2],
          ],
          e,
        ),
        i + 0.002,
        0.045,
        n,
      ),
      hi(t, n, 60)
    );
  }
  export function x6(n, e) {
    let t = it(n, 0.14),
      i = 5e-4;
    return (
      Se(
        t,
        Fn(
          n,
          e,
          [
            [3480, 0.0038, 1],
            [5350, 0.003, 0.7],
            [7900, 0.0022, 0.45],
            [1950, 0.005, 0.4],
          ],
          { hp: 3e3, tick: 0.8 },
        ),
        i,
        1,
        n,
      ),
      Se(
        t,
        Xt(
          n,
          0.03,
          [
            [980, 0.006, 1],
            [1620, 0.005, 0.5],
          ],
          e,
        ),
        i,
        0.22,
        n,
      ),
      Se(
        t,
        Fn(
          n,
          e,
          [
            [4300, 0.0025, 1],
            [6600, 0.002, 0.5],
          ],
          { hp: 3800, tick: 0.5 },
        ),
        i + 0.009,
        0.14,
        n,
      ),
      Se(
        t,
        Xt(
          n,
          0.09,
          [
            [1310, 0.018, 1],
            [2650, 0.012, 0.4],
          ],
          e,
        ),
        i + 0.002,
        0.03,
        n,
      ),
      hi(t, n, 90)
    );
  }
  export function v6(n, e) {
    let t = it(n, 0.38),
      i = 0.003;
    (Se(
      t,
      Fn(
        n,
        e,
        [
          [3340, 0.004, 1],
          [5210, 0.003, 0.6],
          [1880, 0.006, 0.45],
          [7600, 0.002, 0.3],
        ],
        { hp: 2600, tick: 0.75 },
      ),
      i,
      0.62,
      n,
    ),
      Se(t, h1(n, e, 0.17, 2700, 1450, { rough: 210, rough1: 130, env: d1(0.25, 0.8) }), i + 0.018, 0.4, n));
    let s = e0(n, 0.24, e);
    (kt(s, "hp", 4200, 0.7, n), Mn(s, n, (a) => Math.pow(Math.sin((Math.PI * a) / 0.24), 2)), Se(t, C0(s), i + 0.05, 0.075, n));
    let o = e0(n, 0.22, e);
    (y0(o, "bp", ei(520, 260), 0.8, n), Mn(o, n, (a) => Math.pow(Math.sin((Math.PI * a) / 0.22), 2)), Se(t, C0(o), i + 0.08, 0.1, n));
    let r = i + 0.2;
    return (
      Se(
        t,
        Xt(
          n,
          0.12,
          [
            [418, 0.026, 1],
            [1135, 0.016, 0.6],
            [2280, 0.009, 0.4],
            [3420, 0.005, 0.25],
          ],
          e,
        ),
        r,
        0.3,
        n,
      ),
      Se(t, xt(n, e, 0.05, 0.009, { lp: 1e3 }), r, 0.3, n),
      Se(t, xt(n, e, 0.004, 8e-4, { hp: 2800 }), r, 0.18, n),
      hi(t, n, 70)
    );
  }
  export function y6(n, e) {
    let t = it(n, 0.26),
      i = 0.004;
    (Se(
      t,
      Fn(
        n,
        e,
        [
          [2210, 0.004, 1],
          [3580, 0.003, 0.6],
        ],
        { hp: 2400, tick: 0.5 },
      ),
      i,
      0.3,
      n,
    ),
      Se(
        t,
        Xt(
          n,
          0.06,
          [
            [520, 0.014, 1],
            [1240, 0.009, 0.5],
          ],
          e,
        ),
        i,
        0.26,
        n,
      ),
      Se(
        t,
        h1(n, e, 0.19, 1e3, 3300, { rough: 140, rough1: 320, hi: 0.35, env: (s) => Math.pow(s, 0.8) * (s > 0.93 ? (1 - s) / 0.07 : 1) }),
        i + 0.012,
        0.62,
        n,
      ));
    for (let [s, o] of [
      [0.085, 0.14],
      [0.142, 0.2],
    ])
      Se(
        t,
        Fn(
          n,
          e,
          [
            [2850, 0.003, 1],
            [4420, 0.0025, 0.6],
          ],
          { hp: 3e3, tick: 0.6 },
        ),
        i + s,
        o,
        n,
      );
    return (Se(t, xt(n, e, 0.03, 0.006, { bp: 720, q: 1 }), i + 0.2, 0.22, n), hi(t, n, 70));
  }
  export function b6(n, e) {
    let t = it(n, 0.21),
      i = 8e-4,
      s = i + 0.031;
    return (
      Se(
        t,
        Fn(
          n,
          e,
          [
            [2390, 0.0055, 1],
            [3760, 0.0045, 0.75],
            [5640, 0.0035, 0.5],
            [1270, 0.007, 0.45],
          ],
          { hp: 2400, tick: 0.95, tickTau: 8e-4 },
        ),
        i,
        0.62,
        n,
      ),
      Se(t, Gn(n, 0.08, 172, 74, 0.014, 0.02, 8e-4), i, 0.5, n),
      Se(t, xt(n, e, 0.04, 0.008, { lp: 720 }), i, 0.3, n),
      Se(
        t,
        Xt(
          n,
          0.07,
          [
            [432, 0.016, 1],
            [915, 0.011, 0.6],
          ],
          e,
        ),
        i,
        0.2,
        n,
      ),
      Se(
        t,
        Fn(
          n,
          e,
          [
            [3130, 0.011, 1],
            [4690, 0.009, 0.85],
            [7160, 0.006, 0.55],
            [1890, 0.012, 0.5],
            [9420, 0.0035, 0.3],
          ],
          { hp: 2800, tick: 1.1, tickTau: 0.001 },
        ),
        s,
        1.05,
        n,
      ),
      Se(t, xt(n, e, 0.012, 0.0022, { bp: 2600, q: 0.8 }), s, 0.4, n),
      Se(
        t,
        Xt(
          n,
          0.16,
          [
            [1485, 0.028, 1],
            [2215, 0.024, 0.6],
            [3320, 0.016, 0.35],
          ],
          e,
        ),
        s + 8e-4,
        0.11,
        n,
      ),
      hi(fi(C0(t), 1.5), n, 45)
    );
  }
  export function M6(n, e, t) {
    let i = t === 1,
      s = i ? 0.085 : 0.15,
      o = it(n, i ? 0.16 : 0.26),
      r = 0.001;
    (Se(
      o,
      Fn(
        n,
        e,
        [
          [2710, 0.004, 1],
          [4130, 0.003, 0.6],
          [1560, 0.006, 0.4],
        ],
        { hp: 2600, tick: 0.7 },
      ),
      r,
      i ? 0.4 : 0.45,
      n,
    ),
      Se(
        o,
        h1(n, e, s, 1350, i ? 2e3 : 2650, { rough: 260, rough1: 420, hi: 0.5, q: 2.2, env: (u) => 0.35 + 0.65 * u }),
        r + 0.006,
        0.34,
        n,
      ));
    let a = i ? 4 : 8;
    for (let u = 0; u < a; u++) {
      let f = (u + 0.5) / a,
        h = r + 0.01 + s * Math.pow(f, 0.85),
        p = 1900 + 1500 * f;
      Se(
        o,
        Fn(
          n,
          e,
          [
            [p, 0.003, 1],
            [p * 1.62, 0.0025, 0.6],
            [p * 2.71, 0.0018, 0.3],
          ],
          { hp: 2800, tick: 0.6, jit: 0.04 },
        ),
        h,
        0.2 + 0.2 * f,
        n,
      );
    }
    let l = it(n, s),
      c = 0;
    for (let u = 0; u < l.length; u++) {
      let f = u / l.length;
      ((c += (at * (470 + 300 * f)) / n), (l[u] = (Math.sin(c) + 0.4 * Math.sin(2.02 * c)) * f * Math.min(1, (1 - f) * 12)));
    }
    if ((Se(o, l, r + 0.008, 0.055, n), i)) Se(o, xt(n, e, 0.02, 0.004, { bp: 1500, q: 1 }), r + 0.012 + s, 0.3, n);
    else {
      let u = r + 0.012 + s;
      (Se(
        o,
        Fn(
          n,
          e,
          [
            [1660, 0.012, 1],
            [2750, 0.01, 0.7],
            [4210, 0.006, 0.5],
            [6300, 0.004, 0.3],
          ],
          { hp: 2e3, tick: 1 },
        ),
        u,
        0.75,
        n,
      ),
        Se(o, Gn(n, 0.05, 205, 100, 0.012, 0.014, 8e-4), u, 0.35, n));
    }
    return hi(fi(C0(o), 1.2), n, 60);
  }
  export function _6(n, e) {
    let t = it(n, 0.33),
      i = 8e-4,
      s = i + 0.019;
    Se(
      t,
      Fn(
        n,
        e,
        [
          [2950, 0.003, 1],
          [4580, 0.0025, 0.6],
        ],
        { hp: 3e3, tick: 0.6 },
      ),
      i,
      0.11,
      n,
    );
    let o = e0(n, 0.018, e);
    return (
      y0(o, "bp", ei(1700, 5600), 2.5, n),
      Mn(o, n, (r) => Math.pow(r / 0.018, 1.6)),
      Se(t, C0(o), i + 0.001, 0.16, n),
      Se(
        t,
        Mn(Va(n, 0.018, 850, 2500, !1), n, (r) => Math.pow(r / 0.018, 2)),
        i + 0.001,
        0.05,
        n,
      ),
      Se(t, xt(n, e, 0.02, 0.0016, { hp: 1400 }), s, 1.15, n),
      Se(t, xt(n, e, 0.04, 0.007, { hp: 500, lp: 1900 }), s, 0.95, n),
      Se(
        t,
        Xt(
          n,
          0.08,
          [
            [820, 0.012, 1],
            [1240, 0.011, 0.9],
            [1710, 0.009, 0.7],
          ],
          e,
        ),
        s,
        0.4,
        n,
      ),
      Se(t, Gn(n, 0.07, 255, 104, 0.01, 0.02, 6e-4), s, 0.55, n),
      Se(
        t,
        Xt(
          n,
          0.2,
          [
            [2290, 0.024, 1],
            [3420, 0.02, 0.85],
            [4640, 0.016, 0.6],
            [2880, 0.018, 0.5],
            [6410, 0.008, 0.35],
            [8350, 0.005, 0.25],
          ].map(([r, a, l]) => [r * Dt(e, 0.985, 1.015), a, l]),
          e,
        ),
        s,
        0.46,
        n,
      ),
      Se(
        t,
        Xt(
          n,
          0.28,
          [
            [706, 0.07, 1],
            [1421, 0.045, 0.35],
          ],
          e,
        ),
        s + 0.002,
        0.07,
        n,
      ),
      hi(fi(C0(t), 1.6), n, 45)
    );
  }
  export function w6(n, e) {
    let t = it(n, 0.27),
      i = 0.003;
    (Se(
      t,
      Fn(
        n,
        e,
        [
          [4120, 0.0035, 1],
          [6340, 0.0028, 0.6],
          [2480, 0.005, 0.4],
        ],
        { hp: 3200, tick: 0.7 },
      ),
      i,
      0.6,
      n,
    ),
      Se(t, h1(n, e, 0.09, 3100, 2050, { rough: 300, rough1: 200, hi: 0.4, q: 2.4, env: d1(0.2, 0.8) }), i + 0.012, 0.42, n),
      Se(
        t,
        Xt(
          n,
          0.1,
          [
            [3320, 0.02, 1],
            [5150, 0.014, 0.5],
          ],
          e,
        ),
        i + 0.02,
        0.05,
        n,
      ));
    let s = e0(n, 0.14, e);
    return (
      kt(s, "hp", 4500, 0.7, n),
      Mn(s, n, (o) => Math.pow(Math.sin((Math.PI * o) / 0.14), 2)),
      Se(t, C0(s), i + 0.04, 0.05, n),
      Se(
        t,
        Fn(
          n,
          e,
          [
            [1720, 0.008, 1],
            [2960, 0.006, 0.6],
            [690, 0.012, 0.5],
          ],
          { hp: 2600, tick: 0.4 },
        ),
        i + 0.108,
        0.3,
        n,
      ),
      hi(t, n, 90)
    );
  }
  export function E6(n, e) {
    let t = it(n, 0.19),
      i = 0.003;
    return (
      Se(
        t,
        Fn(
          n,
          e,
          [
            [2900, 0.0035, 1],
            [4650, 0.003, 0.6],
          ],
          { hp: 2800, tick: 0.5 },
        ),
        i,
        0.3,
        n,
      ),
      Se(
        t,
        h1(n, e, 0.115, 1650, 4300, {
          rough: 220,
          rough1: 420,
          hi: 0.4,
          q: 2.2,
          env: (s) => Math.pow(s, 0.7) * (s > 0.92 ? (1 - s) / 0.08 : 1),
        }),
        i + 0.01,
        0.6,
        n,
      ),
      Se(
        t,
        Fn(
          n,
          e,
          [
            [3700, 0.003, 1],
            [5600, 0.0025, 0.5],
          ],
          { hp: 3200, tick: 0.6 },
        ),
        i + 0.07,
        0.16,
        n,
      ),
      hi(t, n, 90)
    );
  }
  export function S6(n, e) {
    let t = it(n, 0.15),
      i = 8e-4,
      s = i + 0.013;
    return (
      Se(
        t,
        Fn(
          n,
          e,
          [
            [2620, 0.004, 1],
            [4050, 0.0035, 0.7],
            [1480, 0.006, 0.4],
          ],
          { hp: 2600, tick: 0.8 },
        ),
        i,
        0.55,
        n,
      ),
      Se(t, Gn(n, 0.05, 215, 108, 0.01, 0.013, 8e-4), i, 0.3, n),
      Se(t, xt(n, e, 0.03, 0.006, { hp: 350, lp: 1600 }), i, 0.4, n),
      Se(
        t,
        Xt(
          n,
          0.04,
          [
            [760, 0.008, 1],
            [1330, 0.007, 0.7],
          ],
          e,
        ),
        i,
        0.25,
        n,
      ),
      Se(
        t,
        Fn(
          n,
          e,
          [
            [3610, 0.008, 1],
            [5420, 0.0065, 0.75],
            [8130, 0.004, 0.45],
            [2110, 0.008, 0.4],
          ],
          { hp: 3200, tick: 1 },
        ),
        s,
        1,
        n,
      ),
      Se(
        t,
        Xt(
          n,
          0.08,
          [
            [1920, 0.016, 1],
            [2870, 0.012, 0.5],
          ],
          e,
        ),
        s + 6e-4,
        0.07,
        n,
      ),
      hi(fi(C0(t), 1.4), n, 60)
    );
  }
  export function T6(n, e) {
    let t = it(n, 0.2),
      i = 8e-4,
      s = i + 0.012;
    Se(
      t,
      Fn(
        n,
        e,
        [
          [3900, 0.0028, 1],
          [5900, 0.0022, 0.6],
        ],
        { hp: 3400, tick: 0.6 },
      ),
      i,
      0.13,
      n,
    );
    let o = e0(n, 0.011, e);
    return (
      y0(o, "bp", ei(2400, 7200), 2.5, n),
      Mn(o, n, (r) => Math.pow(r / 0.011, 1.5)),
      Se(t, C0(o), i + 0.001, 0.17, n),
      Se(t, xt(n, e, 0.012, 0.0011, { hp: 2400 }), s, 1.1, n),
      Se(t, xt(n, e, 0.025, 0.005, { hp: 700, lp: 2400 }), s, 0.8, n),
      Se(
        t,
        Xt(
          n,
          0.05,
          [
            [1180, 0.008, 1],
            [1760, 0.007, 0.8],
          ],
          e,
        ),
        s,
        0.3,
        n,
      ),
      Se(t, Gn(n, 0.04, 330, 165, 0.007, 0.011, 5e-4), s, 0.32, n),
      Se(
        t,
        Xt(
          n,
          0.12,
          [
            [3060, 0.012, 1],
            [4490, 0.011, 0.85],
            [6920, 0.008, 0.6],
            [9350, 0.005, 0.35],
            [1710, 0.012, 0.4],
          ].map(([r, a, l]) => [r * Dt(e, 0.985, 1.015), a, l]),
          e,
        ),
        s,
        0.5,
        n,
      ),
      Se(
        t,
        Xt(
          n,
          0.1,
          [
            [1190, 0.022, 1],
            [2400, 0.014, 0.4],
          ],
          e,
        ),
        s + 0.002,
        0.05,
        n,
      ),
      hi(fi(C0(t), 1.5), n, 70)
    );
  }
  export function $v(n, e, t, i, s, o) {
    for (let r of i) {
      let a = o * Dt(t, 0.85, 1.2);
      Se(
        n,
        Fn(
          e,
          t,
          [
            [a, 0.005, 1],
            [a * 1.47, 0.004, 0.6],
            [a * 2.3, 0.003, 0.3],
          ],
          { hp: 3500, tick: 0.4 },
        ),
        r,
        s * Dt(t, 0.5, 1),
        e,
      );
    }
  }
  export function A6(n, e) {
    let t = it(n, 0.31);
    return (
      Se(t, Yv(n, e, 0.26, 2500, 900, d1(0.32, 1.2)), 0.004, 0.7, n),
      $v(t, n, e, [0.055, 0.112, 0.168], 0.2, 4100),
      Se(t, Gn(n, 0.07, 125, 68, 0.02, 0.022, 0.003), 0.215, 0.5, n),
      Se(t, xt(n, e, 0.05, 0.012, { lp: 520 }), 0.215, 0.45, n),
      Se(
        t,
        Xt(
          n,
          0.05,
          [
            [610, 0.012, 1],
            [1340, 0.008, 0.5],
          ],
          e,
        ),
        0.217,
        0.14,
        n,
      ),
      hi(t, n, 50)
    );
  }
  export function R6(n, e) {
    let t = it(n, 0.29);
    (Se(t, Yv(n, e, 0.22, 900, 2800, d1(0.5, 1.2)), 0.004, 0.65, n), $v(t, n, e, [0.04, 0.097, 0.15], 0.17, 4600));
    let i = 0.205;
    return (
      Se(
        t,
        Xt(
          n,
          0.06,
          [
            [615, 0.012, 1],
            [1510, 0.008, 0.6],
            [2920, 0.005, 0.4],
          ],
          e,
        ),
        i,
        0.4,
        n,
      ),
      Se(t, xt(n, e, 0.02, 0.004, { lp: 1400 }), i, 0.45, n),
      Se(t, xt(n, e, 0.004, 8e-4, { hp: 2600 }), i, 0.3, n),
      Se(
        t,
        Fn(
          n,
          e,
          [
            [2480, 0.004, 1],
            [3900, 0.003, 0.6],
          ],
          { hp: 2800, tick: 0.5 },
        ),
        i + 0.022,
        0.14,
        n,
      ),
      hi(t, n, 60)
    );
  }
  export function C6(n, e, t) {
    let i = it(n, 0.2),
      s = t % 2 === 0;
    return (
      Se(i, Yv(n, e, 0.17, s ? 1100 : 2300, s ? 2400 : 1200, d1(0.4, 1.3)), 0.004, 0.8, n),
      $v(i, n, e, [0.03 + 0.02 * t, 0.11], 0.1, 4300),
      hi(i, n, 80)
    );
  }
  export var rI = [
    [4180, 1],
    [6830, 0.7],
    [9760, 0.5],
    [11900, 0.3],
    [2470, 0.3],
  ];
  export function Xv(n, e, t, i, s) {
    return Xt(
      n,
      i * 6,
      rI.map(([o, r], a) => [o * t, i / (1 + a * 0.35), r]),
      e,
    );
  }
  export function k6(n, e, t) {
    let i = it(n, 0.5),
      s = [1, 1.09, 0.93, 1.04][t & 3],
      o = 6e-4,
      r = 1,
      a = 2 + (t !== 1 ? 1 : 0);
    for (let l = 0; l < a; l++) {
      let c = s * (l & 1 ? 1.19 : 1) * Dt(e, 0.97, 1.04);
      (Se(i, Xv(n, e, c, Dt(e, 0.016, 0.03)), o, r * 0.5, n),
        Se(i, xt(n, e, 0.004, 8e-4, { hp: 3200 }), o, r * 0.5, n),
        Se(i, xt(n, e, 0.012, 0.0025, { bp: 1900, q: 0.8 }), o, r * 0.3, n),
        (o += Dt(e, 0.085, 0.15) * (l ? 0.72 : 1)),
        (r *= Dt(e, 0.42, 0.6)));
    }
    return hi(i, n, 200);
  }
  export function P6(n, e, t) {
    let i = it(n, 0.7),
      s = [1, 1.11, 0.94][t % 3],
      o = 6e-4,
      r = 1;
    for (let a = 0; a < 3; a++) {
      let l = s * (a & 1 ? 1.19 : 1) * Dt(e, 0.97, 1.04);
      (Se(i, Xv(n, e, l, Dt(e, 0.045, 0.075)), o, r * 0.5, n),
        Se(i, xt(n, e, 0.003, 6e-4, { hp: 4500 }), o, r * 0.55, n),
        Se(
          i,
          Xt(
            n,
            0.3,
            [
              [1320 * s, 0.05, 1],
              [2130 * s, 0.04, 0.6],
              [3350 * s, 0.028, 0.4],
              [640 * s, 0.03, 0.3],
            ],
            e,
          ),
          o,
          r * 0.16,
          n,
        ),
        (o += Dt(e, 0.075, 0.13) * (a ? 0.7 : 1)),
        (r *= Dt(e, 0.5, 0.66)));
    }
    if (t !== 1)
      for (let a = 0; a < 6; a++) (Se(i, Xv(n, e, s * Dt(e, 1, 1.25), 0.012), o, r * 0.3, n), (o += 0.016 + 0.004 * a), (r *= 0.75));
    return hi(i, n, 200);
  }
  export function I6(n, e, t) {
    let i = it(n, 2.2),
      s = t ? 0.9 : 1,
      o = 5e-4,
      r = it(n, 0.08);
    (Se(r, n5(n, 9e-4), 0, 1.2, n), Se(r, xt(n, e, 0.03, 0.005, { hp: 1500 }), 0, 1.5, n), fi(C0(r, 2), 2));
    let a = it(n, 2.1);
    Se(a, Gn(n, 0.9, 122 * s, 47, 0.08, 0.16, 0.001), 0, 1, n);
    let l = e0(n, 1.4, e);
    (y0(l, "lp", ei(3e3, 240, 0.5), 0.7, n),
      Se(a, C0(Mn(l, n, ms(0.2, 0.002))), 0, 1.3, n),
      Se(a, xt(n, e, 0.45, 0.08, { bp: 500 * s, q: 1.2 }), 0, 0.8, n));
    let c = e0(n, 2, e);
    (kt(c, "lp", 115, 0.7, n), Se(a, C0(Mn(c, n, ms(0.45, 0.03))), 0, 0.4, n));
    for (let [u, f, h] of [
      [0.13, 0.3, 1900],
      [0.235, 0.2, 1300],
      [0.41, 0.12, 800],
    ])
      Se(a, xt(n, e, 0.25, 0.045, { hp: 110, lp: h, att: 0.004 }), u * (t ? 1.1 : 1), f, n);
    (s6(C0(a), n, 0.3, 4, 5e-4, 0.09),
      fi(C0(a, 1.6), 1.8),
      Se(i, r, o, 1, n),
      Se(i, a, o, 0.8, n),
      Se(i, C0(Wa(n, e, 1.9, 70, { from: 0.2, fall: 1.5, hp: 1500, lp: 9e3, ampFall: 0.6, maxLen: 0.008 })), 0, 0.3, n));
    for (let u = 0; u < 5; u++) {
      let f = Dt(e, 1e3, 3800);
      Se(
        i,
        Xt(
          n,
          0.2,
          [
            [f, Dt(e, 0.02, 0.05), 1],
            [f * 1.61, 0.02, 0.5],
          ],
          e,
        ),
        Dt(e, 0.35, 1.5),
        Dt(e, 0.03, 0.08),
        n,
      );
    }
    return o6(fi(C0(hi(i, n, 22), 2.2), 1.6), n, o);
  }
  export function* z6(n, e, t) {
    let i = it(n, 4.2),
      s = t ? 0.93 : 1,
      o = 5e-4,
      r = it(n, 0.12);
    (Se(r, n5(n, 0.0014), 0, 1.3, n),
      Se(r, xt(n, e, 0.03, 0.004, { hp: 2e3 }), 0, 1.6, n),
      Se(r, xt(n, e, 0.1, 0.016, { hp: 500, lp: 8e3 }), 0, 1.1, n),
      fi(C0(r, 2.4), 2.4));
    let a = it(n, 4.1);
    (Se(a, Gn(n, 2.4, 52 * s, 29, 0.28, 0.42, 0.004), 0, 1, n), Se(a, Gn(n, 1.4, 104 * s, 60, 0.2, 0.26, 0.002), 0, 0.7, n), yield);
    let l = e0(n, 2.6, e);
    (y0(l, "lp", ei(4200, 170, 0.45), 0.7, n),
      Se(a, C0(Mn(l, n, ms(0.36, 0.003))), 0, 1.5, n),
      Se(a, xt(n, e, 0.8, 0.14, { bp: 300 * s, q: 1 }), 0, 1, n),
      yield);
    let c = e0(n, 4, e);
    (kt(c, "lp", 95, 0.7, n), Se(a, C0(Mn(c, n, ms(1, 0.05))), 0, 1, n));
    let u = e0(n, 4, e);
    y0(u, "lp", ei(420, 110, 0.6), 0.7, n);
    let f = [];
    for (let d = 0; d < 6; d++) f.push([Dt(e, 0.5, 2.8), Dt(e, 0.12, 0.35), Dt(e, 0.4, 1)]);
    let h = (d) => {
      let m = 0.3;
      for (let [x, v, y] of f) {
        let b = (d - x) / v;
        m += y * Math.exp(-b * b);
      }
      return m * Math.exp(-d / 1.3) * (1 - Math.exp(-d / 0.15));
    };
    for (let d = 0, m = 0, x = 0; d < u.length; d++)
      ((d & 63) === 0 && ((m = h(d / n)), (x = (h((d + 64) / n) - m) / 64)), (u[d] *= m), (m += x));
    (Se(a, C0(u), 0, 0.55, n), yield);
    for (let [d, m, x] of [
      [0.16, 0.42, 1700],
      [0.29, 0.34, 1300],
      [0.47, 0.26, 950],
      [0.79, 0.17, 700],
      [1.22, 0.1, 520],
    ])
      Se(a, xt(n, e, 0.5, 0.05 + d * 0.07, { hp: 70, lp: x, att: 0.006 }), d * (t ? 1.08 : 1), m, n);
    (s6(C0(a), n, 0.4, 3, 5e-4, 0.1),
      fi(C0(a, 1.7), 1.8),
      Se(i, r, o, 1, n),
      Se(i, a, o, 0.85, n),
      yield,
      Se(i, C0(Wa(n, e, 3.4, 170, { from: 0.3, fall: 1.6, hp: 1200, lp: 9e3, ampFall: 1, maxLen: 0.01 })), 0, 0.42, n));
    for (let d = 0; d < 11; d++) {
      let m = Dt(e, 900, 4200);
      Se(
        i,
        Xt(
          n,
          0.3,
          [
            [m, Dt(e, 0.02, 0.07), 1],
            [m * 1.61, 0.025, 0.5],
            [m * 2.4, 0.012, 0.25],
          ],
          e,
        ),
        Dt(e, 0.35, 2.7),
        Dt(e, 0.04, 0.11),
        n,
      );
    }
    let p = Dt(e, 0.95, 1.3);
    for (let [d, m] of [
      [0, 1],
      [0.21, 0.5],
      [0.33, 0.28],
    ])
      (Se(
        i,
        Xt(
          n,
          1,
          [
            [312 * s, 0.2, 1],
            [489 * s, 0.16, 0.8],
            [744 * s, 0.12, 0.6],
            [1183 * s, 0.08, 0.4],
            [1735 * s, 0.05, 0.3],
            [2620 * s, 0.03, 0.2],
          ],
          e,
        ),
        p + d,
        0.12 * m,
        n,
      ),
        Se(i, xt(n, e, 0.02, 0.004, { hp: 900, lp: 5e3 }), p + d, 0.1 * m, n));
    return o6(fi(C0(hi(i, n, 18), 2.2), 1.6), n, o);
  }
  export function D6(n, e, t) {
    let i = it(n, 0.26),
      s = [1, 1.08, 0.93][t % 3],
      o = 5e-4,
      r = 0;
    Se(i, xt(n, e, 0.006, 9e-4, { hp: 4200 }), o, 0.9, n);
    let a = it(n, 0.085);
    for (let l = 0; l < a.length; l++) {
      let c = l / n,
        u = (520 + 2300 * Math.exp(-c / 0.014)) * s;
      r += u / n;
      let f = Math.sign(Math.sin(at * r)) * 0.6 + (2 * (r * 1.5 - Math.floor(r * 1.5)) - 1) * 0.5;
      a[l] = f * (0.75 + 0.25 * Math.sin(at * 310 * c)) * Math.exp(-c / 0.02);
    }
    return (
      kt(a, "hp", 700 * s, 0.8, n),
      kt(a, "lp", 5200, 0.8, n),
      Se(i, C0(a), o, 1, n),
      Se(i, xt(n, e, 0.12, 0.022, { hp: 2600, lp: 9500, att: 0.0015 }), o + 0.002, 0.5, n),
      Se(i, xt(n, e, 0.05, 0.009, { bp: 1750 * s, q: 2.5 }), o, 0.4, n),
      Se(
        i,
        Fn(
          n,
          e,
          [
            [3450 * s, 0.005, 1],
            [5300, 0.004, 0.6],
            [2050, 0.007, 0.4],
          ],
          { hp: 3200, tick: 0.5 },
        ),
        o + 0.024,
        0.24,
        n,
      ),
      hi(fi(C0(i), 1.5), n, 350)
    );
  }
  export function L6(n, e, t) {
    let i = it(n, 0.42),
      s = [1, 0.94, 1.06][t % 3],
      o = 5e-4,
      r = 0,
      a = 0;
    Se(i, xt(n, e, 0.008, 0.0013, { hp: 2800 }), o, 0.8, n);
    let l = it(n, 0.17);
    for (let u = 0; u < l.length; u++) {
      let f = u / n,
        h = (150 + 760 * Math.exp(-f / 0.028)) * s;
      ((r += h / n), (a += (h * 2.76 + 90) / n));
      let p = 2 * (r - Math.floor(r)) - 1;
      l[u] = (p * 0.8 + Math.sin(at * r) * Math.sin(at * a) * 0.9) * Math.exp(-f / 0.04) * (1 - Math.exp(-f / 6e-4));
    }
    (kt(l, "hp", 170, 0.8, n),
      kt(l, "lp", 3600, 0.8, n),
      Se(i, C0(l), o, 1, n),
      Se(i, Gn(n, 0.09, 210 * s, 92 * s, 0.016, 0.024, 8e-4), o, 0.6, n),
      Se(i, xt(n, e, 0.07, 0.014, { bp: 640 * s, q: 1.8 }), o, 0.55, n));
    let c = e0(n, 0.3, e);
    return (
      y0(c, "bp", ei(3800, 1500), 0.9, n),
      Mn(c, n, ms(0.065, 0.012)),
      Se(i, C0(c), o + 0.03, 0.34, n),
      Se(
        i,
        Fn(
          n,
          e,
          [
            [1380 * s, 0.012, 1],
            [2260 * s, 0.009, 0.7],
            [3540, 0.006, 0.45],
          ],
          { hp: 1800, tick: 0.6 },
        ),
        o + 0.062,
        0.26,
        n,
      ),
      hi(fi(C0(i), 1.7), n, 80)
    );
  }
  export function F6(n, e, t) {
    let i = it(n, 0.32),
      s = e0(n, 0.3, e),
      o = [5200, 4300, 6100][t % 3],
      r = [1300, 1e3, 1700][t % 3],
      a = 0.05;
    y0(s, "bp", ei(o, r, 0.8), 3.5, n);
    for (let l = 0; l < s.length; l++) {
      let c = (l / n - a) / (l / n < a ? 0.018 : 0.055);
      s[l] *= Math.exp(-c * c);
    }
    return (
      Se(i, C0(s), 0, 1, n),
      Se(i, n5(n, 18e-5), a - 0.002, 0.5, n),
      Se(i, xt(n, e, 0.006, 7e-4, { hp: 3500 }), a - 0.002, 0.55, n),
      Se(i, Va(n, 0.2, o * 0.5, r * 0.6), 0, 0.03, n),
      hi(i, n, 300)
    );
  }
  export var Ci = {
      bpm: 96,
      beat: 0.625,
      bar: 2.5,
      s16: 0.15625,
      cycleBars: 8,
      formBars: 16,
      sr: 22050,
      srLo: 16e3,
      key: "D minor (aeolian)",
      scale: [2, 4, 5, 7, 9, 10, 0],
      swing: 0.01,
      riserPeak: 5,
      chords: ["Dm", "Bb/D", "Gm/D", "Dsus2 | Am7/D"],
      motif: { call: ["D4", "A4", "Bb4", "F4"], answer: ["D4", "G4", "A4", "E4"], resolve: ["F4", "E4", "D4"] },
      cells: [
        [62, 69],
        [70, 65],
        [62, 67],
        [69, 64],
      ],
      cellSecond: 0.9375,
      loops: { music_drone: 16, music_strings: 8, music_pulse: 16, music_ticks: 6, music_drums: 8, music_brass: 8, music_lift: 8 },
    },
    Ct = Ci.bar,
    qa = Ci.beat,
    qn = Ci.s16,
    Ko = Ci.sr,
    i5 = Ci.srLo,
    N6 = [57, 58, 58, 57],
    lI = [65, 65, 67, 64],
    U6 = [69, 70, 70, 69],
    cI = [74, 74, 74, 76],
    Zv = [57, 58, 58, 57],
    uI = [53, 53, 55, 52],
    fI = [
      [38, 50, 57],
      [38, 53, 58],
      [38, 55, 58],
      [38, 52, 57],
    ],
    hI = [
      [50, 57, 62],
      [53, 58, 62],
      [55, 58, 62],
      [52, 57, 64],
    ],
    bu = { drone: 0.071, strings: 0.062, pulse: 0.078, ticks: 0.03, drums: 0.122, brass: 0.08, lift: 0.071 };
  export function Mu(n, e) {
    let t = 0,
      i = 0;
    for (let o of n) {
      for (let r = 0; r < o.length; r++) t += o[r] * o[r];
      i += o.length;
    }
    let s = e / Math.sqrt(t / i || 1);
    for (let o of n) ls(o, s);
    return n;
  }
  export var dI = [0, 3, 6, 8, 11, 14],
    pI = (n, e, t) => Math.min(t, Math.max(e, n));
  export function Xl(n, e) {
    let t = Math.sqrt(1 + e * e) / e;
    for (let i = 0; i < n.length; i++) {
      let s = n[i] * e;
      n[i] = (s / Math.sqrt(1 + s * s)) * t;
    }
    return n;
  }
  export function Jo(n, e, t, i, s = {}) {
    let o = e0(n, t, e);
    (s.hp && kt(o, "hp", s.hp, 0.707, n), s.lp && kt(o, "lp", s.lp, 0.707, n), s.bp && kt(o, "bp", s.bp, s.q || 1, n));
    let r = Math.exp(-1 / (i * n)),
      a = s.att > 0 ? Math.exp(-1 / (s.att * n)) : 0,
      l = 1,
      c = 1,
      u = 0;
    for (let f = 0; f < o.length; f++) {
      let h = o[f] * l * (1 - c);
      ((o[f] = h), (l *= r), (c *= a), h > u ? (u = h) : -h > u && (u = -h));
    }
    return u > 0 ? ls(o, 1 / u) : o;
  }
  export function s5(n, e, t, i, s, o, r = 6e-4) {
    let a = it(n, e),
      l = Math.exp(-1 / (s * n)),
      c = Math.exp(-1 / (o * n)),
      u = Math.exp(-1 / (r * n)),
      f = (at * i) / n,
      h = 0,
      p = (at * (t - i)) / n,
      d = 1,
      m = 1;
    for (let x = 0; x < a.length; x++)
      ((h += f + p), h > at && (h -= at), (a[x] = Math.sin(h) * d * (1 - m)), (p *= l), (d *= c), (m *= u));
    return a;
  }
  export function xo(n, e, t, i, s, o = 0.4) {
    let [r, a, l, c, u] = mu(e, t, i, s),
      f = n.length,
      h = 0,
      p = 0;
    for (let d = Math.max(0, f - Math.round(o * s)); d < f; d++) {
      let m = n[d],
        x = r * m + h;
      ((h = a * m - c * x + p), (p = l * m - u * x));
    }
    for (let d = 0; d < f; d++) {
      let m = n[d],
        x = r * m + h;
      ((h = a * m - c * x + p), (p = l * m - u * x), (n[d] = x));
    }
    return n;
  }
  export function o5(n, e, t, i, s = 0.4) {
    let o = n.length,
      r = Math.max(0, o - Math.round(s * i)),
      a = 0,
      l = 0,
      c = null;
    for (let u = r; u < o; u++) {
      ((u & 63) === 0 || u === r) && (c = mu("lp", e(u / o), t, i));
      let f = n[u],
        h = c[0] * f + a;
      ((a = c[1] * f - c[3] * h + l), (l = c[2] * f - c[4] * h));
    }
    for (let u = 0; u < o; u++) {
      (u & 63) === 0 && (c = mu("lp", e(u / o), t, i));
      let f = n[u],
        h = c[0] * f + a;
      ((a = c[1] * f - c[3] * h + l), (l = c[2] * f - c[4] * h), (n[u] = h));
    }
    return n;
  }
  export function _u(n, e, t, i) {
    let s = n.length,
      o = i ? Math.max(0, s - Math.round(0.3 * e)) : s;
    for (let [r, a, l] of t) {
      let c = Math.sqrt(1 + l),
        u = (at * r) / e,
        f = Math.sin(u) / (2 * a),
        h = Math.cos(u),
        p = 1 + f / c,
        d = (1 + f * c) / p,
        m = (-2 * h) / p,
        x = (1 - f * c) / p,
        v = (-2 * h) / p,
        y = (1 - f / c) / p,
        b = 0,
        g = 0;
      for (let E = o; E < s; E++) {
        let M = n[E],
          _ = d * M + b;
        ((b = m * M - v * _ + g), (g = x * M - y * _));
      }
      for (let E = 0; E < s; E++) {
        let M = n[E],
          _ = d * M + b;
        ((b = m * M - v * _ + g), (g = x * M - y * _), (n[E] = _));
      }
    }
    return n;
  }
  export var g1 = [
    [520, 1.4, 0.35],
    [1350, 1.6, 0.22],
  ];
  export function B6(n, e, t, i = 13, s = 2.2, o = 0.3) {
    return (
      n.forEach((r, a) => {
        let l = r.length,
          c = r.slice(),
          u = a * 2.1,
          f = o * (a ? -1 : 1),
          h = (m) => (i + s * Math.sin((at * t * m) / l + u) + (a ? 3.1 : 0)) * 0.001 * e,
          p = h(0),
          d = 0;
        for (let m = 0; m < l; m++) {
          (m & 63) === 0 && ((p = h(m)), (d = (h(m + 64) - p) / 64));
          let x = m - p;
          ((p += d), x < 0 && (x += l));
          let v = x | 0,
            y = x - v;
          r[m] = c[m] + f * (c[v] + (c[v + 1 < l ? v + 1 : 0] - c[v]) * y);
        }
      }),
      n
    );
  }
  export function mI(n, e, t, i = 40, s = 120) {
    let o = n.length,
      r = new Float32Array(o),
      a = new Float32Array(o);
    for (let l = 0; l < o; l++) ((r[l] = 0.5 * (n[l] + e[l])), (a[l] = 0.5 * (n[l] - e[l])));
    (xo(r, "hp", i, 0.707, t, 0.6), xo(a, "hp", s, 0.707, t), xo(a, "hp", s, 0.707, t));
    for (let l = 0; l < o; l++) ((n[l] = r[l] + a[l]), (e[l] = r[l] - a[l]));
  }
  export var gI = [0.0297, 0.0371, 0.0411, 0.0437, 0.0533, 0.0617, 0.0683, 0.0741];
  export function xI(n, e, t = {}, i = 1) {
    let s = e / 2,
      o = n.length,
      r = o >> 1,
      a = new Float32Array(r),
      l = t.rt || 2.4,
      c = t.size || 1,
      u = t.damp ?? 0.3,
      f = Math.round((t.pre ?? 0.018) * e) & -2,
      h = 1 - u,
      p = gI.map((X) => Math.round(X * c * s) | 1),
      d = p.map((X) => Math.pow(10, (-3 * X) / s / l)),
      m = new Float32Array(p[0]),
      x = new Float32Array(p[1]),
      v = new Float32Array(p[2]),
      y = new Float32Array(p[3]),
      b = new Float32Array(p[4]),
      g = new Float32Array(p[5]),
      E = new Float32Array(p[6]),
      M = new Float32Array(p[7]),
      [_, T, w, S, R, z, I, L] = p,
      [U, k, C, A, F, H, N, Z] = d,
      Q = 0,
      W = 0,
      J = 0,
      G = 0,
      te = 0,
      oe = 0,
      ee = 0,
      le = 0,
      xe = 0,
      j = 0,
      O = 0,
      q = 0,
      ue = 0,
      de = 0,
      $ = 0,
      se = 0,
      fe = Math.round(0.0051 * s) | 1,
      me = Math.round(0.0127 * s) | 1,
      ge = new Float32Array(fe),
      ce = new Float32Array(me),
      P = 0,
      D = 0;
    for (let X = 0; X < r; X++) {
      let re = 2 * X - f,
        Y = re >= 3 && re < o - 3 ? (16 * n[re] + 9 * (n[re - 1] + n[re + 1]) - (n[re - 3] + n[re + 3])) * 0.0109375 : 0;
      {
        let Ge = ge[P],
          _e = Y + 0.6 * Ge;
        ((ge[P] = _e), (Y = Ge - 0.6 * _e), ++P === fe && (P = 0));
      }
      {
        let Ge = ce[D],
          _e = Y + 0.6 * Ge;
        ((ce[D] = _e), (Y = Ge - 0.6 * _e), ++D === me && (D = 0));
      }
      let he = m[Q],
        V = x[W],
        ne = v[J],
        ye = y[G],
        Te = b[te],
        Re = g[oe],
        Ue = E[ee],
        Ve = M[le],
        ze = (he + V + ne + ye + Te + Re + Ue + Ve) * 0.25;
      ((xe += (he - ze - xe) * h),
        (m[Q] = xe * U + Y),
        ++Q === _ && (Q = 0),
        (j += (V - ze - j) * h),
        (x[W] = j * k + Y),
        ++W === T && (W = 0),
        (O += (ne - ze - O) * h),
        (v[J] = O * C + Y),
        ++J === w && (J = 0),
        (q += (ye - ze - q) * h),
        (y[G] = q * A + Y),
        ++G === S && (G = 0),
        (ue += (Te - ze - ue) * h),
        (b[te] = ue * F + Y),
        ++te === R && (te = 0),
        (de += (Re - ze - de) * h),
        (g[oe] = de * H + Y),
        ++oe === z && (oe = 0),
        ($ += (Ue - ze - $) * h),
        (E[ee] = $ * N + Y),
        ++ee === I && (ee = 0),
        (se += (Ve - ze - se) * h),
        (M[le] = se * Z + Y),
        ++le === L && (le = 0),
        (a[X] = (he - V + ne - ye + Te - Re + Ue - Ve) * 0.5));
    }
    kt(a, "hp", t.hp || 180, 0.707, s);
    let B = i;
    for (let X = 2; X < r - 3; X++)
      ((n[2 * X] += a[X] * B),
        (n[2 * X + 1] += (3 * (a[X - 2] + a[X + 3]) - 25 * (a[X - 1] + a[X + 2]) + 150 * (a[X] + a[X + 1])) * (B / 256)));
    return n;
  }
  export function Yl(n, e, t, i) {
    return xI(n, e, i, t);
  }
  export function gs(n, e, t, i, s, o) {
    let r = n[0].length,
      a = n.length > 1,
      l = o.n || 5,
      c = o.det ?? 8,
      u = o.att ?? 0.5,
      f = o.rel ?? 0.6,
      h = o.rng,
      p = (o.g ?? 1) / Math.sqrt(l),
      d = o.swell ? o.swell[0] : 1,
      m = o.swell ? o.swell[1] : 1,
      x = o.swp || 1,
      v = Math.min(f * 3, o.tail ?? 99),
      y = Math.round((s + v) * e),
      b = ((Math.round(i * e) % r) + r) % r,
      g = a ? (o.width ?? 0.75) : 0,
      E = o.pan || 0,
      M = o.drift ?? 0.0012,
      _ = o.trem,
      T = n[0],
      w = a ? n[1] : null;
    for (let S = 0; S < l; S++) {
      let R = l > 1 ? (S / (l - 1)) * 2 - 1 : 0,
        z = t * Math.pow(2, (R * c + (h() - 0.5) * c * 0.4) / 1200),
        I = l > 1 ? (((S * 3 + 1) % l) / (l - 1)) * 2 - 1 : 0,
        L = pI(E + I * g, -1, 1),
        U = a ? Math.cos(((L + 1) * Math.PI) / 4) * p * Math.SQRT2 : p,
        k = a ? Math.sin(((L + 1) * Math.PI) / 4) * p * Math.SQRT2 : 0,
        C = u * (0.65 + 0.7 * h()),
        A = M * (0.5 + h()),
        F = at * (0.07 + 0.2 * h()),
        H = h() * at,
        N = _ ? at * _.rate * (0.93 + 0.14 * h()) : 0,
        Z = h() * at,
        Q = _ ? _.depth : 0,
        W = (oe) => {
          let ee = oe < C ? 0.5 - 0.5 * Math.cos((Math.PI * oe) / C) : 1;
          if (oe < s) d !== m ? (ee *= d + (m - d) * (x === 1 ? oe / s : Math.pow(oe / s, x))) : (ee *= d);
          else {
            let le = oe - s;
            ee *= m * Math.exp(-le / f) * Math.max(0, 1 - le / v);
          }
          return (Q && (ee *= 1 - Q * (0.5 - 0.5 * Math.cos(N * oe + Z))), ee);
        },
        J = h(),
        G = b,
        te = W(0);
      for (let oe = 0; oe < y; oe += 32) {
        let ee = oe / e,
          le = te;
        te = W((oe + 32) / e);
        let xe = (te - le) / 32,
          j = (z * (1 + A * Math.sin(F * ee + H))) / e,
          O = 1 - j,
          q = Math.min(32, y - oe),
          ue = le;
        if (G + q <= r) {
          if (w)
            for (let de = 0; de < q; de++, G++) {
              ((J += j), J >= 1 && (J -= 1));
              let $ = J + J - 1;
              if (J < j) {
                let se = J / j;
                $ -= se + se - se * se - 1;
              } else if (J > O) {
                let se = (J - 1) / j;
                $ -= se * se + se + se + 1;
              }
              (($ *= ue), (ue += xe), (T[G] += $ * U), (w[G] += $ * k));
            }
          else
            for (let de = 0; de < q; de++, G++) {
              ((J += j), J >= 1 && (J -= 1));
              let $ = J + J - 1;
              if (J < j) {
                let se = J / j;
                $ -= se + se - se * se - 1;
              } else if (J > O) {
                let se = (J - 1) / j;
                $ -= se * se + se + se + 1;
              }
              ((T[G] += $ * ue * U), (ue += xe));
            }
          G === r && (G = 0);
        } else
          for (let de = 0; de < q; de++) {
            ((J += j), J >= 1 && (J -= 1));
            let $ = J + J - 1;
            if (J < j) {
              let se = J / j;
              $ -= se + se - se * se - 1;
            } else if (J > O) {
              let se = (J - 1) / j;
              $ -= se * se + se + se + 1;
            }
            (($ *= ue), (ue += xe), (T[G] += $ * U), w && (w[G] += $ * k), ++G >= r && (G = 0));
          }
      }
    }
  }
  export function mh(n, e) {
    let t = n.length,
      i = new Float32Array(t * 2),
      s = e ? (o) => n[(o + t) % t] : (o) => (o < 0 || o >= t ? 0 : n[o]);
    for (let o = 0; o < t; o++)
      ((i[2 * o] = n[o]),
        (i[2 * o + 1] =
          o >= 2 && o < t - 3
            ? (3 * (n[o - 2] + n[o + 3]) - 25 * (n[o - 1] + n[o + 2]) + 150 * (n[o] + n[o + 1])) / 256
            : (3 * (s(o - 2) + s(o + 3)) - 25 * (s(o - 1) + s(o + 2)) + 150 * (s(o) + s(o + 1))) / 256));
    return i;
  }
  export function Ya(n, e, t, i) {
    let s = e < 400,
      o = s ? n / 2 : n,
      r = i.n || 4,
      a = i.det ?? 7,
      l = i.vel ?? 0.8,
      c = i.att ?? 0.045,
      u = i.rel ?? 0.16,
      f = i.rng,
      h = i.swell || [1, 1],
      p = i.swp || 1.6,
      d = Math.round((t + u * 3.5) * o),
      m = new Float32Array(d),
      x = Math.max(h[0], h[1]),
      v = 1 - Math.exp(-t / c),
      y = Math.ceil(d / 32) + 1,
      b = (U) => (U < t ? (1 - Math.exp(-U / c)) * (h[0] + (h[1] - h[0]) * Math.pow(U / t, p)) : v * h[1] * Math.exp(-(U - t) / u)),
      g = i.scoop ?? -35,
      E = i.bright ?? 8,
      M = i.vib ?? 1,
      _ = 0.8 / Math.sqrt(r),
      T = new Float32Array(y),
      w = new Float32Array(y);
    for (let U = 0; U < y; U++) {
      let k = (U * 32) / o;
      ((T[U] = b(k)),
        (w[U] = Math.pow(2, (g * Math.exp(-k / 0.028)) / 1200) * (1 + 0.0035 * M * Math.sin(at * 5.2 * k) * Math.min(1, k / 0.7))));
    }
    for (let U = 0; U < r; U++) {
      let k = (e * Math.pow(2, ((r > 1 ? (U / (r - 1)) * 2 - 1 : 0) * a + (f() - 0.5) * 3) / 1200)) / o,
        C = f();
      for (let A = 0, F = 0; A < d; A += 32, F++) {
        let H = k * w[F],
          N = 1 - H,
          Z = Math.min(d, A + 32);
        for (let Q = A; Q < Z; Q++) {
          ((C += H), C >= 1 && (C -= 1));
          let W = C + C - 1;
          if (C < H) {
            let J = C / H;
            W -= J + J - J * J - 1;
          } else if (C > N) {
            let J = (C - 1) / H;
            W -= J * J + J + J + 1;
          }
          m[Q] += W;
        }
      }
    }
    let S = (U) => mu("lp", Math.min(o * 0.42, e * (1.3 + E * l * Math.pow(T[Math.min(y - 1, U)] / x, 1.4))), 0.9, o),
      R = 0,
      z = 0,
      I = S(0);
    for (let U = 0, k = 0; U < d; U += 32, k++) {
      let C = I;
      I = S(k + 1);
      let A = Math.min(d, U + 32),
        F = (T[Math.min(y - 1, k + 1)] - T[k]) / 32,
        H = (I[0] - C[0]) / 32,
        N = (I[1] - C[1]) / 32,
        Z = (I[2] - C[2]) / 32,
        Q = (I[3] - C[3]) / 32,
        W = (I[4] - C[4]) / 32,
        J = T[k],
        G = C[0],
        te = C[1],
        oe = C[2],
        ee = C[3],
        le = C[4];
      for (let xe = U; xe < A; xe++) {
        let j = m[xe] * _,
          O = G * j + R;
        ((R = te * j - ee * O + z), (z = oe * j - le * O));
        let q = O * J * 1.3;
        ((m[xe] = (q / Math.sqrt(1 + q * q)) * 0.8), (J += F), (G += H), (te += N), (oe += Z), (ee += Q), (le += W));
      }
    }
    Se(m, Jo(o, f, 0.05, 0.014, { bp: Math.min(2400, e * 5), q: 0.8, att: 0.004 }), 0, 0.05 * l, o);
    let L = Math.min(d, Math.round(0.02 * o));
    for (let U = 0; U < L; U++) m[d - 1 - U] *= U / L;
    return s ? mh(m, !1) : m;
  }
  export function H6(n, e, t, i, s = {}) {
    let o = s.dur || 0.5,
      r = Math.round(o * n),
      a = new Float32Array(r),
      l = n / e,
      c = s.damp ?? 0.5 - 0.22 * t,
      u = s.tau || 0.2,
      f = Math.floor(l - c - 0.1),
      h = l - c - f,
      p = (1 - h) / (1 + h),
      d = Math.exp(-l / (n * u * 2.2)),
      m = new Float32Array(f),
      x = 0,
      v = 0,
      y = 0.16 + 0.62 * t;
    for (let S = 0; S < f; S++) ((x += (i() * 2 - 1 - x) * y), (m[S] = x), (v += x));
    v /= f;
    let b = Math.max(1, Math.round(f * 0.19)),
      g = new Float32Array(f);
    for (let S = 0; S < f; S++) g[S] = m[S] - v - 0.55 * (m[(S + b) % f] - v);
    let E = 0,
      M = 0;
    for (let S = 0; S < r; S++) {
      let R = S >= f ? a[S - f] : 0,
        z = S > f ? a[S - f - 1] : 0,
        I = (1 - c) * R + c * z,
        L = p * I + E - p * M;
      ((E = I), (M = L), (a[S] = (S < f ? g[S] : 0) + d * L));
    }
    let _ = s.mute || 0.14;
    for (let S = 0; S < r; S++) {
      let R = S / n;
      a[S] *= Math.exp(-R / _) * Math.min(1, S / (0.0012 * n));
    }
    Se(a, Jo(n, i, 0.03, 0.007, { lp: 500 }), 0, 0.12 * Pr(a) * t, n);
    let T = Pr(a);
    T > 0 && ls(a, 1 / T);
    let w = Math.round(0.02 * n);
    for (let S = 0; S < w; S++) a[r - 1 - S] *= S / w;
    return a;
  }
  export function vI(n, e, t) {
    let i = it(n, e),
      s = 0;
    for (let o of t) s = Math.max(s, o[2]);
    for (let [o, r, a] of t) {
      if (o > n * 0.46 || a < s * 0.001) continue;
      let l = (at * o) / n,
        c = Math.exp(-1 / (r * n)),
        u = 2 * c * Math.cos(l),
        f = c * c,
        h = Math.min(i.length, Math.ceil(Math.log((s * 0.001) / a) / Math.log(c)) + 1),
        p = (-a / c) * Math.sin(l),
        d = 0;
      for (let m = 0; m < h; m++) {
        i[m] += d;
        let x = u * d - f * p;
        ((p = d), (d = x));
      }
    }
    return i;
  }
  export function Xa(n, e, t, i, s) {
    let o = n / 2,
      r = 32e-5 * Math.pow(e / 262, 1.2),
      a = Math.min(8, Math.floor((0.46 * o) / e)),
      l = [];
    for (let h = 1; h <= a; h++) {
      let p = h * e * Math.sqrt(1 + r * h * h),
        d = Math.pow(h, -1.45) * Math.abs(Math.sin((Math.PI * h) / 7.6)) * Math.pow(t, (h - 1) * 0.3),
        m = (i * 0.36) / (1 + 0.33 * (h - 1));
      h <= 2 ? l.push([p * 0.9996, m, d * 0.55], [p * 1.0006, m * 0.82, d * 0.45]) : l.push([p, m, d]);
    }
    let c = vI(o, i, l),
      u = Math.round(0.007 * o);
    for (let h = 0; h < u; h++) c[h] *= h / u;
    Se(c, Jo(o, s, 0.06, 0.014, { lp: 420, att: 0.003 }), 0, 0.1 * t, o);
    let f = Math.round(0.25 * o);
    for (let h = 0; h < f && h < c.length; h++) c[c.length - 1 - h] *= h / f;
    return mh(ls(c, t), !1);
  }
  export function m1(n, e, t, i) {
    let s = it(n, 0.9);
    return (
      Se(s, s5(n, 0.9, t * (1.5 + 0.6 * i), t, 0.016, 0.16 + 0.1 * i, 0.0012), 0, 1, n),
      Se(s, s5(n, 0.35, t * 1.59 * 1.25, t * 1.59, 0.02, 0.07, 0.001), 0, 0.3, n),
      Se(
        s,
        Xt(
          n,
          0.25,
          [
            [t * 2.3, 0.05, 0.16],
            [t * 2.65, 0.04, 0.11],
            [t * 3.16, 0.03, 0.08],
            [t * 3.6, 0.025, 0.05],
          ],
          e,
        ),
        0,
        1,
        n,
      ),
      Se(s, Jo(n, e, 0.14, 0.026, { bp: 520, q: 0.6 }), 0, 0.2 + 0.32 * i, n),
      Se(s, Jo(n, e, 0.012, 0.0022, { hp: 2200 }), 0, 0.1 + 0.2 * i, n),
      Xl(s, 1.2 + 0.5 * i)
    );
  }
  export function yu(n, e, t = 1) {
    let i = it(n, 1.6);
    return (
      Se(i, s5(n, 1.6, 124, 55, 0.045, 0.34 * t, 0.002), 0, 1, n),
      Se(i, Jo(n, e, 0.5, 0.09, { lp: 150 }), 0, 0.7, n),
      Se(i, Jo(n, e, 0.16, 0.03, { bp: 700, q: 0.5 }), 0, 0.3, n),
      Se(i, Jo(n, e, 0.02, 0.004, { hp: 1800 }), 0, 0.12, n),
      Xl(i, 1.5)
    );
  }
  export function gh(n, e, t, i, s = 1) {
    let o = [];
    for (let [l, c] of [
      [1, 1],
      [2.756, 0.7],
      [5.404, 0.5],
      [8.933, 0.32],
      [13.34, 0.2],
    ])
      o.push([t * l * (1 + (e() - 0.5) * 0.01), (i * 0.3) / (1 + (l - 1) * 0.16), c * Math.pow(s, Math.log2(l))]);
    for (let l = 0; l < 14; l++) {
      let c = 1.2 + 9 * Math.pow(e(), 1.4);
      o.push([t * c, ((i * 0.2) / (1 + (c - 1) * 0.3)) * (0.5 + e()), 0.22 * e() * Math.pow(s, Math.log2(c))]);
    }
    let r = Xt(n, i, o, e);
    Se(r, Jo(n, e, 0.01, 0.0018, { hp: 1500 }), 0, 0.5 * s, n);
    let a = Pr(r);
    return Xl(ls(r, 1 / a), 1.4);
  }
  export function yI(n, e, t) {
    let i = n.length,
      s = Math.round(qt(38) * t) / t,
      o = s / e,
      r = at * o,
      a = 2 * Math.cos(r),
      l = 0,
      c = 1,
      u = 0,
      f = -Math.sin(r);
    for (let h = 0; h < i; h++) {
      (h & 255) === 0 && ((c = 0.8 + 0.2 * Math.sin((at * 4 * h) / i - 1.2)), (u = Math.sin(r * h)), (f = Math.sin(r * (h - 1))));
      let p = l < 0.25 ? 4 * l : l < 0.75 ? 2 - 4 * l : 4 * l - 4,
        d = (0.8 * u + 0.24 * p) * 1.5 * c;
      n[h] += (d / Math.sqrt(1 + d * d)) * 0.105;
      let m = a * u - f;
      ((f = u), (u = m), (l += o), l >= 1 && (l -= 1));
    }
  }
  export var r5 = (n, e, t = 1) => {
    for (let i = 0; i < n.length; i++) n[i] += e[i] * t;
    return n;
  };
  export function O6(n, e, t) {
    let i = n.length;
    for (let s = 0; s < t.length; s++) {
      let [o, r] = t[s],
        a = (s + 1) * e;
      for (let l = 0; l < i; l++) {
        let c = l - a;
        (c < 0 && (c += i), (n[l] += r * o[c]));
      }
    }
    return n;
  }
  export function* bI(n, e) {
    let t = n / 2,
      i = 16 * Ct,
      s = Math.round(i * t),
      o = new Float32Array(s),
      r = new Float32Array(s),
      a = new Float32Array(s),
      l = [r, a];
    (yI(o, t, i), yield);
    {
      let u = Math.round(4 * Ct * t),
        f = new Float32Array(u),
        h = new Float32Array(u);
      (gs([f], t, qt(38), -0.9, 4 * Ct - 1, { n: 3, det: 6, att: 1.5, rel: 0.9, g: 0.15, swell: [0.8, 1], rng: e }),
        yield,
        gs([h], t, qt(50), -0.9, 4 * Ct - 1, { n: 3, det: 8, att: 1.7, rel: 0.9, g: 0.16, swell: [0.85, 1], rng: e }),
        yield);
      for (let p = 0; p < 4; p++) (Ni(o, f, p * 4 * Ct, 1, t), Ni(o, h, (p * 4 + 2) * Ct, 1, t));
    }
    (o5(o, (u) => 520 + 150 * Math.sin(at * u - 0.6) + 70 * Math.sin(at * 3 * u + 1), 0.8, t),
      yield,
      gs(l, t, qt(62), -1, 8 * Ct - 0.8, { n: 2, det: 7, att: 2.2, rel: 0.8, g: 0.085, width: 0.5, rng: e }),
      yield);
    for (let u = 0; u < 4; u++) {
      let f = u * 2 * Ct - 0.7;
      (gs(l, t, qt(N6[u]), f, 2 * Ct - 0.1, { n: 3, det: 9, att: 1.4, rel: 0.7, g: 0.12, width: 0.8, swell: [0.75, 1], rng: e }),
        yield,
        gs(l, t, qt(lI[u]), f + 0.25, 2 * Ct - 0.35, { n: 3, det: 10, att: 1.7, rel: 0.75, g: 0.095, width: 0.9, swell: [0.7, 1], rng: e }),
        yield);
    }
    for (let u = 0; u < 4; u++)
      (gs(l, t, qt(N6[u]), (8 + u * 2) * Ct - 0.7, 2 * Ct - 0.1, {
        n: 4,
        det: 10,
        att: 1.6,
        rel: 0.75,
        g: 0.16,
        width: 0.85,
        swell: [0.8, 1],
        rng: e,
      }),
        yield);
    (gs(l, t, qt(74), 8 * Ct + 0.5, 6 * Ct, { n: 2, det: 5, att: 3.5, rel: 1.2, g: 0.045, width: 0.9, swell: [0.6, 1], rng: e }),
      yield,
      gs(l, t, qt(81), 10 * Ct, 3.5 * Ct, { n: 2, det: 4, att: 3, rel: 1.3, g: 0.02, width: 0.9, rng: e }),
      yield,
      gs(l, t, qt(60), 14 * Ct - 0.4, 2 * Ct - 0.4, { n: 3, det: 9, att: 1.5, rel: 0.7, g: 0.09, width: 0.7, rng: e }),
      yield,
      gs(l, t, qt(64), 14 * Ct - 0.1, 2 * Ct - 0.7, { n: 3, det: 9, att: 1.7, rel: 0.7, g: 0.085, width: 0.9, rng: e }),
      yield);
    for (let u of l)
      (o5(u, (f) => 1250 + 380 * Math.sin(at * 2 * f + 0.5) + 160 * Math.sin(at * 5 * f), 0.75, t),
        yield,
        _u(
          u,
          t,
          [
            [290, 1.3, 0.4],
            [1050, 1.6, 0.3],
          ],
          !0,
        ),
        yield);
    (B6(l, t, 7), yield, r5(r, o), r5(a, o), mI(r, a, t, 42, 120), yield, Mu(l, bu.drone));
    let c = mh(r, !0);
    return (yield, [c, mh(a, !0)]);
  }
  export function* MI(n, e) {
    let t = Math.round(8 * Ct * n),
      i = new Float32Array(t),
      s = new Float32Array(t),
      o = [i, s];
    for (let r = 0; r < 4; r++) {
      let a = r * 2 * Ct - 0.35,
        l = { rate: 12.8, depth: 0.5 };
      (gs(o, n, qt(U6[r]), a, 2 * Ct - 0.15, {
        n: 4,
        det: 10,
        att: 0.9,
        rel: 0.45,
        g: 0.1,
        width: 0.9,
        pan: -0.15,
        swell: [0.5, 1],
        swp: 1.5,
        trem: l,
        rng: e,
      }),
        yield,
        gs(o, n, qt(cI[r]), a + 0.1, 2 * Ct - 0.25, {
          n: 4,
          det: 11,
          att: 1.1,
          rel: 0.45,
          g: 0.085,
          width: 0.9,
          pan: 0.15,
          swell: [0.45, 1],
          swp: 1.5,
          trem: l,
          rng: e,
        }),
        yield,
        gs(o, n, qt(U6[r] - 12), a, 2 * Ct - 0.15, { n: 2, det: 8, att: 1.2, rel: 0.5, g: 0.05, width: 0.6, swell: [0.6, 1], rng: e }),
        yield);
    }
    (gs(o, n, qt(86), 0.4, 8 * Ct - 2.2, { n: 2, det: 4, att: 3, rel: 0.5, g: 0.012, width: 1, swell: [0.7, 1], rng: e }), yield);
    for (let r of o)
      (o5(r, (a) => 2900 + 800 * Math.sin(at * 4 * a - 1.57) + 300 * Math.sin(at * 3 * a), 0.7, n),
        yield,
        _u(
          r,
          n,
          [
            [480, 1.4, 0.3],
            [1500, 1.8, 0.28],
          ],
          !0,
        ),
        yield);
    return (B6(o, n, 5, 11, 1.8, 0.25), xo(i, "hp", 240, 0.707, n), xo(s, "hp", 240, 0.707, n), Mu(o, bu.strings));
  }
  export function V6(n, e) {
    let t = (n >> 1) & 3,
      i = n >= 8,
      s = [],
      o = 50 + e,
      r = [1, 0.42, 0.52, 0.86, 0.4, 0.5, 0.8, 0.46, 0.95, 0.4, 0.52, 0.82, 0.42, 0.5, 0.76, 0.5];
    for (let a = 0; a < 16; a++) {
      if (i && (a === 5 || a === 13)) continue;
      let l = o,
        c = r[a];
      (a === 3 || a === 11 ? (l = Zv[t] + e) : (a === 6 || a === 14) && (l = uI[t] + 12 + e),
        i && (a === 6 && (l = 62 + e), a === 14 && (l = Zv[t] + e), a === 8 && (c = 1)),
        n === 15 && (c = Math.min(1, 0.45 + 0.04 * a + (dI.includes(a) ? 0.12 : 0))),
        n % 4 === 3 && a === 15 && (l = Zv[t] + e),
        s.push([a, l, c]));
    }
    return s;
  }
  export function* _I(n, e) {
    let t = Math.round(16 * Ct * n),
      i = new Float32Array(t),
      s = new Float32Array(t),
      o = new Map(),
      r = (u, f) => {
        let h = u * 4 + f,
          p = o.get(h);
        return (p || o.set(h, (p = H6(n, qt(u), [0.4, 0.7, 1][f], e, { mute: 0.12 + 0.05 * f }))), p);
      },
      a = (() => {
        let u = Math.round(0.3 * n),
          f = new Float32Array(u),
          h = qt(38),
          p = 0,
          d = 0;
        for (let x = 0; x < u; x++) {
          let v = x / n,
            y = (v * h) % 1 < 0.5 ? 1 : -1,
            b = 1 - Math.exp((-at * (90 + 380 * Math.exp(-v / 0.05))) / n);
          ((p += (y - p) * b), (d += (p - d) * b), (f[x] = d * Math.exp(-v / 0.11) * Math.min(1, x / 60)));
        }
        let m = Math.round(0.03 * n);
        for (let x = 0; x < m; x++) f[u - 1 - x] *= x / m;
        return f;
      })();
    for (let u = 0; u < 16; u++) {
      for (let [f, h, p] of V6(u, 0)) {
        let d = p * (0.93 + 0.14 * e());
        Ni(i, r(h, d > 0.78 ? 2 : d > 0.55 ? 1 : 0), u * Ct + f * qn, 0.3 * (0.35 + 0.65 * d), n);
      }
      (Ni(s, a, u * Ct, 0.2, n), Ni(s, a, u * Ct + 2 * qa, 0.14, n), yield);
    }
    xo(i, "hp", 115, 0.707, n);
    let l = i.slice();
    xo(l, "lp", 1900, 0.7, n);
    let c = l.slice();
    return (
      xo(c, "lp", 1200, 0.7, n),
      yield,
      O6(i, Math.round(3 * qn * n), [
        [l, 0.27],
        [c, 0.1],
      ]),
      r5(i, s),
      ls(i, 1 / Pr(i)),
      Xl(i, 1.6),
      Mu([i], bu.pulse)[0]
    );
  }
  export function* wI(n, e) {
    let t = Math.round(6 * Ct * n),
      i = new Float32Array(t),
      s = Xt(n, 0.06, [
        [2349.3, 0.011, 1],
        [3520, 0.006, 0.4],
        [5870, 0.004, 0.2],
      ]),
      o = Xt(n, 0.06, [
        [1760, 0.012, 1],
        [2637, 0.007, 0.35],
        [4186, 0.004, 0.15],
      ]);
    (Se(s, Jo(n, e, 0.004, 0.001, { hp: 3e3 }), 0, 0.5, n), Se(o, Jo(n, e, 0.004, 0.001, { hp: 2500 }), 0, 0.4, n));
    let r = [];
    for (let c = 0; c < 6; c++) r.push(Jo(n, e, 0.07, 0.012 + 0.012 * (c % 3), { hp: 5200 + 900 * (c % 2), att: 0.0012 }));
    let a = gh(n, e, qt(86), 0.5, 0.7),
      l = [
        [0.9, 0.3, 0.45, 0.7, 0.28, 0.4, 0.75, 0.3, 0.85, 0.3, 0.45, 0.7, 0.3, 0.42, 0.72, 0.4],
        [0.9, 0.25, 0.5, 0.65, 0.3, 0.3, 0.8, 0.45, 0.8, 0.25, 0.3, 0.75, 0.35, 0.5, 0.7, 0.55],
        [0.85, 0.35, 0.4, 0.75, 0.25, 0.5, 0.7, 0.25, 0.9, 0.4, 0.5, 0.65, 0.25, 0.35, 0.8, 0.6],
      ];
    for (let c = 0; c < 6; c++) {
      let u = l[c % 3];
      for (let f = 0; f < 16; f++) {
        let h = c * Ct + f * qn;
        f % 4 === 0 ? Ni(i, s, h, f === 0 ? 0.42 : 0.32, n) : f % 4 === 2 && Ni(i, o, h, 0.24, n);
        let p = u[(f + (c >= 3 ? 8 : 0)) % 16] * (0.9 + 0.2 * e());
        Ni(i, r[(f * 5 + c) % 6], h + (f & 1 ? Ci.swing : 0), 0.2 * p, n);
      }
      yield;
    }
    return (Ni(i, a, 2 * Ct + 14 * qn, 0.1, n), Ni(i, a, 5 * Ct + 11 * qn, 0.08, n), xo(i, "hp", 1100, 0.707, n), Mu([i], bu.ticks)[0]);
  }
  export var p1 = null,
    jv = 0;
  export function W6(n) {
    if (p1 && p1.sr === n) {
      let o = p1;
      return (++jv >= 4 && ((p1 = null), (jv = 0)), o);
    }
    let e = as(23063 + n),
      t = (o, r, a, l) => {
        let c = new Float32Array(Math.round(l * n));
        return (c.set(o.subarray(0, Math.min(o.length, c.length))), Yl(c, n, r, a));
      },
      i = { rt: 2.3, size: 1.25, damp: 0.3, pre: 0.022, hp: 170 },
      s = { lo: [], mid: [], hi: [] };
    for (let o of [0.55, 1])
      (s.lo.push(t(m1(n, e, 55, o), 0.3, i, 2)),
        s.mid.push(t(m1(n, e, 73.42, o), 0.28, i, 1.8)),
        s.hi.push(t(m1(n, e, 110, o), 0.26, i, 1.6)));
    return (
      (s.big = t(yu(n, e, 1), 0.55, { rt: 3.2, size: 1.5, damp: 0.35, pre: 0.03, hp: 150 }, 3.6)),
      (s.steel = t(gh(n, e, qt(57), 1.6, 0.8), 0.5, { rt: 2.8, size: 1.4, damp: 0.22, pre: 0.025, hp: 250 }, 3)),
      (s.sr = n),
      (p1 = s),
      (jv = 1),
      s
    );
  }
  export function* EI(n, e) {
    let t = Math.round(8 * Ct * n),
      i = new Float32Array(t),
      s = W6(n);
    yield;
    let o = (r, a, l, c) => Ni(i, s[r][a], l, c, n);
    for (let r = 0; r < 8; r++) {
      let a = r * Ct,
        l = r & 1,
        c = r === 7;
      (o("lo", 1, a, 0.62),
        o("lo", 1, a + 8 * qn, c ? 0.4 : 0.5),
        c ||
          (o("mid", 0, a + 3 * qn, 0.3),
          o("mid", 1, a + 6 * qn, 0.4),
          l
            ? (o("hi", 1, a + 12 * qn, 0.36),
              o("hi", 0, a + 13 * qn, 0.2),
              o("mid", 1, a + 14 * qn, 0.44),
              r === 3 && o("lo", 0, a + 15 * qn, 0.3))
            : (o("hi", 0, a + 11 * qn, 0.3), o("mid", 1, a + 14 * qn, 0.42))),
        (r === 0 || r === 4) && Ni(i, s.big, a, r === 0 ? 0.6 : 0.5, n),
        (r === 2 || r === 6) && Ni(i, s.steel, a + 8 * qn, r === 2 ? 0.2 : 0.16, n),
        yield);
    }
    return (xo(i, "hp", 38, 0.707, n, 0.6), Mu([Xl(i, 1.15)], bu.drums)[0]);
  }
  export function* SI(n, e) {
    let t = Math.round(8 * Ct * n),
      i = new Float32Array(t),
      s = (r, a, l) => {
        let c = (r >> 1) & 3;
        for (let u of fI[c])
          Ni(
            i,
            Ya(n, qt(u), 0.2, { vel: l, att: 0.012, rel: 0.07, n: 3, det: 8, bright: 9, rng: e }),
            r * Ct + a * qn - 0.006,
            0.17 * (0.5 + 0.5 * l) * (u === 38 ? 0.8 : 1),
            n,
          );
      },
      o = (r, a, l, c) => {
        let u = (r >> 1) & 3;
        for (let f of hI[u])
          Ni(
            i,
            Ya(n, qt(f), l, { vel: c, att: 0.25, rel: 0.1, swell: [0.12, 1], swp: 2.2, n: 3, det: 9, bright: 7, rng: e }),
            r * Ct + a * qn,
            0.15,
            n,
          );
      };
    return (
      s(0, 0, 1),
      s(0, 11, 0.6),
      yield,
      o(1, 4, 12 * qn - 0.05, 0.9),
      yield,
      s(2, 0, 0.9),
      s(2, 6, 0.7),
      yield,
      s(3, 3, 0.55),
      s(3, 14, 0.75),
      yield,
      s(4, 0, 1),
      s(4, 8, 0.6),
      yield,
      o(5, 4, 12 * qn - 0.05, 0.9),
      yield,
      s(6, 0, 0.9),
      s(6, 6, 0.7),
      s(6, 11, 0.55),
      yield,
      o(7, 0, 16 * qn - 0.05, 1),
      yield,
      xo(i, "hp", 60, 0.707, n, 0.5),
      _u(i, n, g1, !0),
      ls(i, 1 / Pr(i)),
      Xl(i, 1.3),
      Mu([i], bu.brass)[0]
    );
  }
  export function* TI(n, e) {
    let t = Math.round(8 * Ct * n),
      i = new Float32Array(t),
      s = new Float32Array(t),
      o = new Map(),
      r = (l, c) => {
        let u = l * 4 + c,
          f = o.get(u);
        return (f || o.set(u, (f = H6(n, qt(l), [0.55, 0.8, 1][c], e, { mute: 0.1 + 0.03 * c, dur: 0.4 }))), f);
      };
    for (let l = 0; l < 8; l++) {
      for (let [c, u, f] of V6(l + (l >= 4 ? 8 : 0), 12)) {
        let h = Math.min(1, f * 1.08 * (0.93 + 0.14 * e()));
        Ni(i, r(u, h > 0.78 ? 2 : h > 0.55 ? 1 : 0), l * Ct + c * qn, 0.22 * (0.4 + 0.6 * h), n);
      }
      yield;
    }
    (xo(i, "hp", 230, 0.707, n),
      [74, 76, 77, 79, 81, 82, 84, 86].forEach((l, c) => {
        (gs([s], n, qt(l), c * Ct - 0.12, Ct - 0.1, {
          n: 3,
          det: 11,
          att: 0.35,
          rel: 0.3,
          g: 0.1,
          swell: [0.55, 1],
          swp: 1.4,
          trem: { rate: 12.8, depth: 0.4 },
          rng: e,
        }),
          gs([s], n, qt(l - 12), c * Ct - 0.12, Ct - 0.1, { n: 2, det: 8, att: 0.4, rel: 0.3, g: 0.06, swell: [0.6, 1], rng: e }));
      }),
      yield,
      o5(s, (l) => 3300 + 900 * Math.sin(at * l - 1.57), 0.7, n),
      xo(s, "hp", 300, 0.707, n),
      yield);
    let a = i.slice();
    return (xo(a, "lp", 2600, 0.7, n), O6(i, Math.round(3 * qn * n), [[a, 0.22]]), Mu([r5(i, s)], bu.lift)[0]);
  }
  export var G6 = { rt: 3, size: 1.45, damp: 0.3, pre: 0.03, hp: 200 };
  export function* AI(n, e, t) {
    let i = it(n, 5.4),
      [s, o] = Ci.cells[t];
    return (
      Se(i, Xa(n, qt(s), 0.62, 3.2, e), 0.002, 0.55, n),
      yield,
      Se(i, Xa(n, qt(o), 0.8, 4.3, e), Ci.cellSecond + 0.002, 0.6, n),
      Se(i, Xa(n, qt(o - 12), 0.5, 4, e), Ci.cellSecond + 0.002, 0.2, n),
      yield,
      Yl(i, n, 0.5, G6),
      i
    );
  }
  export function* RI(n, e, t) {
    let i = it(n, 4.8),
      [s, o] = Ci.cells[t];
    for (let r of [-12, 0])
      (Se(
        i,
        Ya(n, qt(s + r), Ci.cellSecond - 0.1, { vel: 0.7, att: 0.05, rel: 0.09, n: 4, det: 8, bright: 6.5, rng: e }),
        0,
        r ? 0.3 : 0.36,
        n,
      ),
        yield,
        Se(
          i,
          Ya(n, qt(o + r), 2.5, { vel: 0.9, att: 0.07, rel: 0.25, swell: [0.75, 1], swp: 0.7, n: 4, det: 9, bright: 6.5, rng: e }),
          Ci.cellSecond,
          r ? 0.34 : 0.4,
          n,
        ),
        yield);
    return (kt(i, "hp", 110, 0.707, n), _u(i, n, g1), Yl(i, n, 0.3, { rt: 2.4, size: 1.3, damp: 0.3, pre: 0.025, hp: 220 }), i);
  }
  export function* CI(n, e, t) {
    let i = it(n, Ct + 1.1),
      s = W6(n);
    yield;
    let o = (a, l, c, u) => Se(i, s[a][l], c * qn, u, n);
    t === 0
      ? ([8, 9, 10, 11, 12, 13, 14, 15].forEach((a, l) => o(l < 4 ? "mid" : "lo", l % 2 ? 0 : 1, a, 0.28 + 0.06 * l)), o("hi", 1, 6, 0.4))
      : t === 1
        ? (o("hi", 1, 0, 0.4),
          o("hi", 0, 2, 0.26),
          o("hi", 1, 3, 0.42),
          o("mid", 1, 6, 0.46),
          o("mid", 0, 8, 0.3),
          o("mid", 1, 9, 0.48),
          o("lo", 1, 12, 0.56),
          o("lo", 0, 14, 0.4),
          o("lo", 1, 15, 0.6))
        : (o("lo", 1, 8, 0.5),
          o("mid", 1, 11, 0.5),
          o("hi", 1, 12, 0.4),
          o("hi", 1, 13, 0.46),
          o("lo", 1, 14, 0.62),
          o("lo", 0, 15, 0.42),
          Se(i, s.steel, 4 * qn, 0.2, n));
    let r = i.length - Math.round(0.35 * n);
    for (let a = r; a < i.length; a++) i[a] *= 1 - (a - r) / (i.length - r);
    return Xl(i, 1.1);
  }
  export function* kI(n, e, t) {
    let i = it(n, 4.6);
    return (
      Se(i, yu(n, e, 1.2), 0.03, t ? 0.5 : 0.9, n),
      yield,
      t && (Se(i, gh(n, e, qt(45), 2.6, 0.55), 0.03, 0.4, n), Se(i, gh(n, e, qt(50) * 1.012, 2.2, 0.5), 0.09, 0.22, n), yield),
      kt(i, "lp", t ? 1500 : 500, 0.7, n),
      Yl(i, n, 1.1, { rt: 3.6, size: 1.6, damp: 0.4, pre: 0.045, hp: 120 }),
      i
    );
  }
  export function PI(n, e, t, i, s) {
    let o = n.length,
      r = [s(), s(), s(), s(), s()],
      a = [-11, -5, 0, 6, 12].map((h) => Math.pow(2, h / 1200) / t),
      l = 0,
      c = 0,
      u = 0,
      f = 0;
    for (let h = 0; h < o; h++) {
      if ((h & 15) === 0) {
        let d = h / t,
          m = Math.min(1, d / i);
        ((c = qt(50) * Math.pow(2, Math.pow(m, 1.8))),
          (l += (16 * (3.2 + 9.6 * m * m)) / t),
          (u = (d < i ? Math.pow(m, 2.2) : Math.exp(-(d - i) / 0.07)) * (1 - 0.3 * (0.5 - 0.5 * Math.cos(at * l)) * m) * 0.2),
          (f = (d < i ? Math.pow(m, 2.6) : Math.exp(-(d - i) / 0.05)) * 1.6));
      }
      let p = 0;
      for (let d = 0; d < 5; d++) {
        let m = c * a[d],
          x = r[d] + m;
        (x >= 1 && (x -= 1), (r[d] = x));
        let v = x + x - 1;
        if (x < m) {
          let y = x / m;
          v -= y + y - y * y - 1;
        } else if (x > 1 - m) {
          let y = (x - 1) / m;
          v -= y * y + y + y + 1;
        }
        p += v;
      }
      ((n[h] = p * u), (e[h] *= f));
    }
  }
  export function* II(n, e) {
    let t = Ci.riserPeak,
      i = it(n, t + 0.6),
      s = i.length,
      o = e0(n, t + 0.6, e);
    (y0(o, "bp", (a) => 320 * Math.pow(18, Math.min(1, (a * (t + 0.6)) / t)), 1.3, n), yield);
    let r = new Float32Array(s);
    (PI(r, o, n, t, e),
      yield,
      y0(r, "lp", (a) => 350 * Math.pow(11, Math.min(1, (a * (t + 0.6)) / t)), 0.9, n),
      kt(r, "hp", 200, 0.707, n));
    for (let a = 0; a < s; a++) i[a] = r[a] + o[a];
    return i;
  }
  export function* zI(n, e) {
    let t = it(n, 5);
    (Se(t, yu(n, e, 1.25), 0, 1, n),
      Se(t, m1(n, e, 55, 1), 0, 0.7, n),
      yield,
      Se(t, gh(n, e, qt(50), 2.4, 0.9), 0, 0.3, n),
      Se(t, gh(n, e, qt(57) * 0.99, 1.8, 0.8), 0.004, 0.16, n),
      yield);
    let i = it(n, 4);
    for (let [s, o] of [
      [38, 1],
      [45, 0.8],
      [50, 0.9],
      [57, 0.5],
    ])
      (Se(
        i,
        Ya(n, qt(s), 1.3, { vel: 1, att: 0.02, rel: 0.4, swell: [1, 0.3], swp: 0.5, n: 5, det: 12, bright: 7, scoop: -60, rng: e }),
        0,
        0.24 * o,
        n,
      ),
        yield);
    return (Se(t, _u(i, n, g1), 0, 1, n), Yl(t, n, 0.45, { rt: 3.4, size: 1.55, damp: 0.3, pre: 0.03, hp: 160 }), Xl(t, 1.3));
  }
  export function* DI(n, e) {
    let t = it(n, 5);
    (Se(t, Xa(n, qt(65), 0.7, 1.6, e), 0.002, 0.6, n),
      Se(t, Xa(n, qt(64), 0.7, 1.6, e), 0.002 + qa / 2, 0.58, n),
      yield,
      Se(t, Xa(n, qt(62), 0.9, 4.2, e), 0.002 + qa, 0.72, n),
      Se(t, Xa(n, qt(50), 0.6, 4, e), 0.002 + qa, 0.3, n),
      Se(t, Xa(n, qt(74), 0.55, 3, e), 0.002 + qa * 2.5, 0.3, n),
      yield);
    let i = it(n, 4.6);
    for (let [s, o] of [
      [50, 1],
      [57, 0.9],
      [62, 0.8],
    ])
      (Se(
        i,
        Ya(n, qt(s), 1.9, { vel: 0.55, att: 0.3, rel: 0.5, swell: [0.6, 1], swp: 0.8, n: 4, det: 8, bright: 5, scoop: 0, rng: e }),
        qa - 0.1,
        0.2 * o,
        n,
      ),
        yield);
    return (Se(t, _u(i, n, g1), 0, 1, n), Se(t, yu(n, e, 1), qa, 0.3, n), Yl(t, n, 0.5, G6), t);
  }
  export function LI(n, e, t, i) {
    let s = n.length,
      o = [],
      r = [];
    for (let c = 0; c < t.length * 3; c++)
      (o.push(i()), r.push((qt(t[(c / 3) | 0]) * Math.pow(2, (((c % 3) - 1) * 9 + (i() - 0.5) * 4) / 1200)) / e));
    let a = 1,
      l = 0;
    for (let c = 0; c < s; c++) {
      if ((c & 15) === 0) {
        let f = c / e;
        ((a = Math.pow(2, (-16 / 12) * Math.pow(Math.min(1, f / 4.2), 1.35))),
          (l = 0.07 * (1 - Math.exp(-f / 0.03)) * Math.pow(Math.max(0, 1 - f / 4.4), 1.2)));
      }
      let u = 0;
      for (let f = 0; f < o.length; f++) {
        let h = r[f] * a,
          p = o[f] + h;
        (p >= 1 && (p -= 1), (o[f] = p));
        let d = p + p - 1;
        if (p < h) {
          let m = p / h;
          d -= m + m - m * m - 1;
        } else if (p > 1 - h) {
          let m = (p - 1) / h;
          d -= m * m + m + m + 1;
        }
        u += d;
      }
      n[c] = u * l;
    }
  }
  export function* FI(n, e) {
    let t = it(n, 5.2),
      i = it(n / 2, 5.2),
      s = [50, 57, 62, 65];
    return (
      LI(i, n / 2, s, e),
      yield,
      y0(i, "lp", ei(2400, 140, 0.6), 0.9, n / 2),
      kt(i, "hp", 60, 0.707, n / 2),
      Se(t, mh(i, !1), 0, 1, n),
      Se(t, yu(n, e, 1.2), 0, 0.75, n),
      Se(t, s5(n, 2.6, 98, 41, 0.9, 0.9, 0.004), 0.02, 0.4, n),
      yield,
      Yl(t, n, 0.5, { rt: 3.4, size: 1.5, damp: 0.4, pre: 0.03, hp: 150 }),
      t
    );
  }
  export function* NI(n, e) {
    let t = it(n, 12.5),
      i = it(n / 2, 12.5),
      s = [i],
      o = (c, u, f, h, p) => {
        for (let d of f)
          gs(s, n / 2, qt(d), c - 0.25, u, { n: 3, det: 9, att: 0.5, rel: 0.7, g: h * (d < 48 ? 1.1 : 0.8), swell: p, tail: 2.2, rng: e });
      };
    (o(0, Ct, [46, 53, 58, 62], 0.075, [0.7, 1]),
      yield,
      o(Ct, Ct, [48, 55, 60, 64], 0.08, [0.75, 1]),
      yield,
      o(2 * Ct, 2.6 * Ct, [38, 45, 50, 57, 62], 0.085, [1, 0.5]),
      yield,
      y0(i, "lp", (c) => 1700 - 700 * c, 0.75, n / 2),
      kt(i, "hp", 45, 0.707, n / 2),
      Se(t, mh(i, !1), 0, 1, n),
      yield);
    let r = it(n, 12.5);
    for (let [c, u] of [
      [46, 0.8],
      [58, 1],
    ])
      Se(
        r,
        Ya(n, qt(c), Ct - 0.2, { vel: 0.6, att: 0.2, rel: 0.2, swell: [0.6, 1], n: 3, det: 8, bright: 5, scoop: 0, rng: e }),
        0,
        0.13 * u,
        n,
      );
    for (let [c, u] of [
      [48, 0.8],
      [60, 1],
    ])
      Se(
        r,
        Ya(n, qt(c), Ct - 0.2, { vel: 0.7, att: 0.2, rel: 0.2, swell: [0.65, 1], n: 3, det: 8, bright: 5.5, scoop: 0, rng: e }),
        Ct,
        0.14 * u,
        n,
      );
    yield;
    for (let [c, u] of [
      [38, 0.9],
      [50, 1],
      [57, 0.8],
    ])
      Se(
        r,
        Ya(n, qt(c), 2 * Ct, { vel: 0.7, att: 0.1, rel: 0.8, swell: [1, 0.3], swp: 0.8, n: 3, det: 8, bright: 5, scoop: -20, rng: e }),
        2 * Ct,
        0.15 * u,
        n,
      );
    (Se(t, _u(r, n, g1), 0, 1, n), yield);
    let a = (c, u, f, h, p) => Se(t, Xa(n, qt(u), f, h, e), c + 0.002, p, n);
    (a(0, 65, 0.7, 2.6, 0.5),
      a(2 * qa, 67, 0.72, 2.4, 0.5),
      a(Ct, 69, 0.85, 3.4, 0.6),
      a(Ct, 57, 0.5, 3, 0.2),
      yield,
      a(2 * Ct, 62, 0.9, 5.5, 0.7),
      a(2 * Ct, 50, 0.7, 5.5, 0.4),
      a(2 * Ct + Ci.cellSecond, 69, 0.7, 5, 0.5),
      a(3 * Ct, 74, 0.6, 4.5, 0.4),
      a(3 * Ct + 2 * qa, 78, 0.45, 4.4, 0.3),
      yield,
      Se(t, yu(n, e, 1), 0, 0.35, n),
      Se(t, m1(n, e, 55, 0.8), Ct, 0.3, n),
      Se(t, yu(n, e, 1.25), 2 * Ct, 0.6, n),
      Yl(t, n, 0.5, { rt: 3.6, size: 1.55, damp: 0.3, pre: 0.03, hp: 190 }));
    let l = Math.round(10.4 * n);
    for (let c = l; c < t.length; c++) t[c] *= Math.pow(1 - (c - l) / (t.length - l), 1.5);
    return t;
  }
  export var vu = (n, e) => ({ gen: n, n: 1, sr: e, peak: 0.9, fixed: 1, loop: 1, music: 1 }),
    Ga = (n, e, t, i, s = 2) => ({ gen: n, n: e, sr: t, peak: i, bus: "music", max: s, pri: 9 }),
    q6 = {
      music_drone: vu(bI, Ko),
      music_strings: vu(MI, Ko),
      music_pulse: vu(_I, i5),
      music_ticks: vu(wI, Ko),
      music_drums: vu(EI, i5),
      music_brass: vu(SI, i5),
      music_lift: vu(TI, Ko),
      mus_cell: Ga(AI, 4, Ko, 0.5),
      mus_horn: Ga(RI, 4, Ko, 0.6),
      mus_fill: Ga(CI, 3, i5, 0.6),
      mus_hit: Ga(kI, 2, Ko, 0.6),
      mus_riser: Ga(II, 1, Ko, 0.6, 1),
      mus_impact: Ga(zI, 1, Ko, 0.8, 1),
      objective: Ga(DI, 1, Ko, 0.7, 1),
      death: Ga(FI, 1, Ko, 0.85, 1),
      complete: Ga(NI, 1, Ko, 0.8, 1),
    },
    $l = Object.keys(Ci.loops);
  export function UI(n, e, t) {
    let i = it(n, 0.3),
      s = [1, 1.07, 0.94, 1.03][t & 3];
    (Se(i, Gn(n, 0.06, 112 * s, 58 * s, 0.018, 0.02, 0.002), 0, 0.75, n),
      Se(i, xt(n, e, 0.06, 0.016, { lp: 720 * s }), 0, 0.9, n),
      Se(i, xt(n, e, 0.1, 0.028, { bp: 2500 * s, q: 0.7, att: 0.004 }), 0.012, 0.22, n));
    let o = xt(n, e, 0.2, 0.05, { hp: 3800, att: 0.01 }),
      r = 1;
    for (let a = 0; a < o.length; a++) (a % 70 === 0 && (r = 0.3 + e() * 0.7), (o[a] *= r));
    return (Se(i, o, 0.02, 0.16, n), i);
  }
  export function Y6(n, e, t, i) {
    let s = it(n, t),
      o = e0(n, t * 0.9, e);
    (y0(o, "bp", ei(1500, 520), 0.8, n),
      Se(s, Mn(o, n, ms(0.085 * i, 0.007)), 0, 0.9, n),
      Se(s, xt(n, e, t * 0.8, 0.07 * i, { hp: 3e3, att: 0.012 }), 0.01, 0.25, n));
    let r = Math.round(5 * i);
    for (let a = 0; a < r; a++) {
      let l = Dt(e, 500, 1700);
      Se(s, Va(n, Dt(e, 0.008, 0.02), l, l * Dt(e, 1.3, 1.9)), Dt(e, 0.03, t * 0.6), Dt(e, 0.1, 0.3), n);
    }
    return s;
  }
  export function BI(n, e, t) {
    let i = Y6(n, e, 0.46, 1 + t * 0.08);
    return (Se(i, Gn(n, 0.06, 100, 55, 0.02, 0.02, 0.002), 0, 0.5, n), i);
  }
  export function HI(n, e, t) {
    let i = it(n, 0.38),
      s = [1, 1.08, 0.92][t % 3];
    return (
      Se(i, Gn(n, 0.06, 120, 62, 0.018, 0.02, 0.002), 0, 0.6, n),
      Se(i, xt(n, e, 0.04, 0.008, { lp: 2400 }), 0, 0.6, n),
      Se(
        i,
        Xt(
          n,
          0.36,
          [
            [178 * s, 0.09, 1],
            [412 * s, 0.075, 0.8],
            [733 * s, 0.06, 0.55],
            [1214 * s, 0.045, 0.4],
            [1958 * s, 0.03, 0.3],
            [3130 * s, 0.016, 0.18],
          ],
          e,
        ),
        0.001,
        0.3,
        n,
      ),
      Se(i, xt(n, e, 0.08, 0.02, { bp: 3e3, q: 0.8, att: 0.003 }), 0.01, 0.1, n),
      i
    );
  }
  export function OI(n, e) {
    let t = it(n, 0.45);
    (Se(t, Gn(n, 0.14, 124, 44, 0.03, 0.045, 0.002), 0, 1, n),
      Se(t, xt(n, e, 0.14, 0.035, { lp: 520 }), 0, 1, n),
      Se(t, xt(n, e, 0.2, 0.06, { bp: 1500, q: 0.7, att: 0.01 }), 0.01, 0.16, n));
    for (let i of [0.022, 0.05, 0.088]) Se(t, xt(n, e, 0.012, 0.003, { bp: Dt(e, 2200, 4200), q: 2 }), i, Dt(e, 0.1, 0.22), n);
    return (Se(t, xt(n, e, 0.2, 0.05, { hp: 3500, att: 0.01 }), 0.015, 0.1, n), fi(t, 1.2));
  }
  export function VI(n, e) {
    let t = it(n, 0.26);
    return (
      Se(t, xt(n, e, 0.2, 0.05, { bp: 900, q: 0.7, att: 0.02 }), 0, 0.6, n),
      Se(t, xt(n, e, 0.1, 0.025, { bp: 2600, q: 0.8, att: 0.004 }), 0.005, 0.35, n),
      Se(t, Gn(n, 0.05, 95, 60, 0.02, 0.018, 0.003), 0, 0.4, n),
      t
    );
  }
  export function WI(n, e) {
    let t = it(n, 0.5);
    return (
      Se(t, Gn(n, 0.25, 92, 38, 0.04, 0.06, 0.0015), 0, 1.1, n),
      Se(t, xt(n, e, 0.2, 0.04, { lp: 320 }), 0, 1.2, n),
      Se(t, xt(n, e, 0.06, 0.01, { bp: 820, q: 1 }), 0, 0.55, n),
      Se(t, xt(n, e, 0.03, 0.004, { hp: 1800, lp: 5e3 }), 0, 0.2, n),
      fi(t, 1.6)
    );
  }
  export function GI(n) {
    let e = it(n, 2.4);
    for (let t = 0; t < e.length; t++) {
      let i = t / n;
      e[t] =
        (Math.sin(at * 3150 * i) + 0.7 * Math.sin(at * 4013 * i + 1) + 0.35 * Math.sin(at * 5310 * i + 2)) *
        (1 - Math.exp(-i / 0.12)) *
        Math.exp(-i / 0.55);
    }
    return e;
  }
  export function qI(n, e, t) {
    let i = it(n, 0.5),
      s = [640, 880, 745][t % 3] * Dt(e, 0.97, 1.03);
    return (
      Se(i, xt(n, e, 0.015, 0.003, { hp: 1500 }), 0, 1, n),
      Se(i, xt(n, e, 0.04, 0.008, { lp: 1800 }), 0, 0.6, n),
      Se(
        i,
        Xt(
          n,
          0.48,
          [1, 1.58, 2.24, 2.92, 3.71, 4.93, 6.31, 8.1].map((r, a) => [s * r, 0.13 / (1 + a * 0.55), 1 / (1 + a * 0.5)]),
          e,
        ),
        5e-4,
        0.42,
        n,
      ),
      i
    );
  }
  export function XI(n, e, t) {
    let i = it(n, 0.36),
      s = [1, 1.1, 0.9][t % 3];
    return (
      Se(i, xt(n, e, 0.06, 0.013, { lp: 950 * s }), 0, 1.1, n),
      Se(i, Gn(n, 0.05, 150 * s, 70, 0.012, 0.016), 0, 0.6, n),
      Se(i, xt(n, e, 0.012, 0.002, { hp: 2e3 }), 0, 0.6, n),
      Se(i, xt(n, e, 0.12, 0.024, { bp: 3500 * s, q: 0.7 }), 0.003, 0.3, n),
      Se(i, Wa(n, e, 0.34, 16, { from: 0.03, fall: 1.8, hp: 1800, ampFall: 0.1 }), 0, 0.35, n),
      i
    );
  }
  export function YI(n, e, t) {
    let i = it(n, 0.26),
      s = t ? 1.14 : 1;
    return (
      Se(
        i,
        Xt(
          n,
          0.2,
          [
            [238 * s, 0.03, 1],
            [512 * s, 0.022, 0.8],
            [893 * s, 0.016, 0.6],
            [1410 * s, 0.01, 0.4],
          ],
          e,
        ),
        0,
        0.6,
        n,
      ),
      Se(i, xt(n, e, 0.03, 0.006, { lp: 2100 }), 0, 0.8, n),
      Se(i, xt(n, e, 0.01, 0.002, { hp: 3e3 }), 0, 0.5, n),
      Se(i, Wa(n, e, 0.2, 6, { from: 0.01, fall: 2, bp: 2600, q: 1.5 }), 0, 0.3, n),
      i
    );
  }
  export function $I(n, e, t) {
    let i = Y6(n, e, 0.5, 0.8 + t * 0.2);
    return (Se(i, Va(n, 0.035, 420, 1150), 0, 0.5, n), i);
  }
  export function ZI(n, e, t) {
    let i = it(n, 0.3),
      s = [1, 1.12, 0.9][t % 3];
    (Se(i, xt(n, e, 0.03, 0.007, { hp: 4e3 }), 0, 0.9, n),
      Se(
        i,
        Xt(
          n,
          0.12,
          [
            [2920 * s, 0.022, 1],
            [4730 * s, 0.018, 0.8],
            [7310 * s, 0.012, 0.6],
            [1180 * s, 0.03, 0.5],
          ],
          e,
        ),
        0,
        0.4,
        n,
      ),
      Se(i, xt(n, e, 0.05, 0.012, { bp: 320 * s, q: 1.5 }), 0, 0.9, n));
    let o = e0(n, 0.06, e);
    kt(o, "bp", 2400, 1, n);
    for (let r = 0; r < o.length; r++) {
      let a = r / n;
      o[r] *= (Math.sin(at * 118 * a) > 0.2 ? 1 : 0.1) * Math.exp(-a / 0.02);
    }
    return (Se(i, o, 0.004, 0.5, n), Se(i, Wa(n, e, 0.28, 10, { from: 0.02, fall: 1.6, hp: 5e3, ampFall: 0.08 }), 0, 0.3, n), i);
  }
  export function jI(n, e) {
    let t = it(n, 0.45);
    Se(t, xt(n, e, 0.01, 0.002, { hp: 2500 }), 0, 1, n);
    for (let i = 0; i < 9; i++) {
      let s = Dt(e, 3200, 9500);
      Se(
        t,
        Xt(
          n,
          0.1,
          [
            [s, Dt(e, 0.01, 0.03), 1],
            [s * 1.47, 0.01, 0.5],
          ],
          e,
        ),
        Math.pow(e(), 2) * 0.3,
        Dt(e, 0.1, 0.35),
        n,
      );
    }
    return t;
  }
  export function KI(n, e, t) {
    let i = it(n, 0.75),
      s = [3300, 2700, 3900][t % 3],
      o = [820, 1100, 700][t % 3],
      r = 0,
      a = e0(n, 0.75, e);
    for (let l = 0; l < i.length; l++) {
      let c = l / n,
        u = o + (s - o) * Math.exp(-c / 0.16),
        f = 1 + 0.035 * Math.sin(at * (18 + 30 * c) * c);
      ((r += (at * u * f) / n), (i[l] = (Math.sin(r) + 0.3 * Math.sin(2 * r)) * (1 - Math.exp(-c / 0.004)) * Math.exp(-c / 0.19)));
    }
    return (
      y0(a, "bp", (l) => o + (s - o) * Math.exp((-l * 0.75) / 0.16), 6, n),
      Se(i, Mn(a, n, ms(0.15, 0.003)), 0, 1.6, n),
      Se(i, xt(n, e, 0.01, 0.002, { hp: 2500 }), 0, 0.7, n),
      i
    );
  }
  export var Kv = (n, e) => Math.round(n * e) / e;
  export function* JI(n, e) {
    let i = n * 2,
      s = new Float32Array(i),
      o = [
        [184, 2.5],
        [207.5, 3.5],
        [233, 2],
        [258.5, 4.5],
      ];
    for (let [l, c] of o) {
      let u = Kv(l, 2),
        f = Kv(c, 2),
        h = e() * at,
        p = e() * at;
      for (let d = 0; d < i; d++) {
        let m = d / n,
          x = at * u * m + h;
        s[d] +=
          (Math.sin(x) + 0.5 * Math.sin(2 * x + 1) + 0.3 * Math.sin(3 * x + 2) + 0.16 * Math.sin(4 * x) + 0.08 * Math.sin(6 * x)) *
          (0.72 + 0.28 * Math.sin(at * f * m + p)) *
          0.25;
      }
      yield;
    }
    let r = gu(
        n,
        2,
        e,
        (l) => {
          (kt(l, "hp", 1100, 0.7, n), kt(l, "lp", 5200, 0.7, n));
        },
        0.25,
      ),
      a = Kv(46, 2);
    for (let l = 0; l < i; l++) s[l] += r[l] * (0.55 + 0.45 * Math.sin((at * a * l) / n)) * 0.5;
    return s;
  }
  export function QI(n, e) {
    let i = n * 2,
      s = new Float32Array(i);
    for (let r = 0; r < i; r++) {
      let a = r / n,
        l = 1.1 * Math.sin(at * 0.5 * a) + 0.5 * Math.sin(at * 1.5 * a + 1),
        c = at * 310 * a + l,
        u = 0.7 + 0.3 * Math.sin(at * 1.5 * a),
        f = (Math.sin(c) + 0.45 * Math.sin(2 * c + l) + 0.2 * Math.sin(4 * c + 0.5)) * 0.3 * u,
        h = at * 62 * a;
      ((f += (Math.sin(h) + 0.5 * Math.sin(2 * h) + 0.33 * Math.sin(3 * h) + 0.2 * Math.sin(5 * h)) * 0.28), (s[r] = f));
    }
    let o = gu(
      n,
      2,
      e,
      (r) => {
        (kt(r, "hp", 2800, 0.7, n), kt(r, "lp", 7e3, 0.7, n));
      },
      0.25,
    );
    for (let r = 0; r < i; r++) s[r] += o[r] * 0.12 * (0.6 + 0.4 * Math.sin((at * 1.5 * r) / n + 2));
    return s;
  }
  export function ez(n, e) {
    let i = n * 2,
      s = new Float32Array(i);
    for (let r = 0; r < i; r++) {
      let a = r / n,
        l = at * 50 * a;
      s[r] =
        (Math.sin(l) * 0.5 +
          Math.sin(2 * l + 0.4) +
          0.5 * Math.sin(3 * l + 1) +
          0.3 * Math.sin(4 * l) +
          0.22 * Math.sin(6 * l + 2) +
          0.12 * Math.sin(10 * l)) *
          0.3 *
          (0.9 + 0.1 * Math.sin(at * 0.5 * a)) +
        Math.sin(at * 4100 * a) * 0.012 * (0.6 + 0.4 * Math.sin(at * 1 * a)) +
        Math.sin(at * 1250 * a + 0.6 * Math.sin(at * 2 * a)) * 0.02;
    }
    let o = gu(n, 2, e, (r) => kt(r, "bp", 2100, 1.2, n), 0.25);
    for (let r = 0; r < i; r++) s[r] += o[r] * 0.16 * Math.pow(0.5 + 0.5 * Math.sin((at * 100 * r) / n), 3);
    return s;
  }
  export function tz(n, e, t) {
    let i = it(n, 0.42),
      s = [1, 1.07, 0.93][t % 3];
    Se(i, Va(n, 0.035, 920 * s, 610 * s), 0, 0.06, n);
    let o = 0.03;
    return (
      Se(i, Gn(n, 0.2, 84 * s, 41, 0.03, 0.05, 0.002), o, 1.1, n),
      Se(i, xt(n, e, 0.12, 0.03, { lp: 360 }), o, 1.1, n),
      Se(i, xt(n, e, 0.03, 0.006, { lp: 2600, hp: 500 }), o, 0.4, n),
      Se(
        i,
        Xt(
          n,
          0.12,
          [
            [522 * s, 0.026, 1],
            [1133 * s, 0.02, 0.7],
            [1871 * s, 0.014, 0.5],
            [3040 * s, 0.008, 0.3],
          ],
          e,
        ),
        o,
        0.2,
        n,
      ),
      Se(i, xt(n, e, 0.14, 0.04, { hp: 3e3, att: 0.006 }), o + 0.01, 0.06, n),
      fi(i, 1.5)
    );
  }
  export function nz(n, e) {
    let t = it(n, 1.5),
      i = [0, 0, 0, 0];
    Se(t, xt(n, e, 0.02, 0.004, { hp: 2500 }), 0, 0.9, n);
    let s = [184, 207, 233, 258];
    for (let a = 0; a < Math.round(1.1 * n); a++) {
      let l = a / n,
        c = Math.pow(0.16, l / 1) * (1 + 0.06 * Math.sin(at * (9 - 5 * l) * l)),
        u = 0;
      for (let h = 0; h < 4; h++)
        ((i[h] += (at * s[h] * c) / n), (u += Math.sin(i[h]) + 0.5 * Math.sin(2 * i[h]) + 0.3 * Math.sin(3 * i[h])));
      let f = 0.6 + 0.4 * Math.sign(Math.sin(at * (26 - 16 * l) * l));
      t[a] += u * 0.16 * f * Math.exp(-l / 0.55) * (1 - Math.exp(-l / 0.01));
    }
    let o = e0(n, 1, e);
    (y0(o, "bp", ei(3200, 500), 1, n), Se(t, Mn(o, n, ms(0.35, 0.01)), 0, 0.3, n));
    let r = 0.72;
    return (
      Se(t, xt(n, e, 0.2, 0.035, { lp: 3e3 }), r, 1, n),
      Se(t, Gn(n, 0.12, 130, 55, 0.02, 0.035), r, 0.8, n),
      Se(
        t,
        Xt(
          n,
          0.4,
          [
            [705, 0.07, 1],
            [1490, 0.05, 0.7],
            [2610, 0.035, 0.5],
            [4020, 0.02, 0.3],
          ],
          e,
        ),
        r,
        0.28,
        n,
      ),
      Se(t, Wa(n, e, 0.7, 26, { from: 0.02, fall: 1.7, hp: 1500, ampFall: 0.2, maxLen: 0.008 }), r, 0.5, n),
      Se(
        t,
        Xt(
          n,
          0.2,
          [
            [1900, 0.03, 1],
            [3350, 0.02, 0.6],
          ],
          e,
        ),
        r + 0.19,
        0.14,
        n,
      ),
      fi(t, 1.4)
    );
  }
  export function iz(n, e) {
    let t = it(n, 1.9),
      i = 0,
      s = 0,
      o = it(n, 1.3);
    for (let r = 0; r < o.length; r++) {
      let a = r / n,
        l = 30 + 112 * Math.pow(1 - a / 1.3, 1.6);
      ((i += l / n),
        (s += (180 + 1050 * Math.exp(-a / 0.3)) / n),
        (o[r] =
          (2 * (i - Math.floor(i)) - 1) * (1 - Math.exp(-a / 0.02)) * Math.pow(1 - a / 1.3, 0.7) +
          Math.sin(at * s) * 0.25 * Math.exp(-a / 0.4)));
    }
    (y0(o, "lp", ei(1100, 160), 2.5, n), Se(t, o, 0, 0.55, n), Se(t, xt(n, e, 0.03, 0.006, { hp: 2e3 }), 0, 0.5, n));
    for (let [r, a, l] of [
      [0.62, 1, 1],
      [0.84, 0.75, 1.22],
      [0.98, 0.5, 0.86],
      [1.17, 0.42, 1.4],
      [1.33, 0.22, 1.1],
    ])
      (Se(t, Gn(n, 0.1, 105 * l, 48, 0.02, 0.035), r, a * 0.9, n),
        Se(t, xt(n, e, 0.08, 0.016, { lp: 2400 }), r, a * 0.8, n),
        Se(
          t,
          Xt(
            n,
            0.3,
            [
              [388 * l, 0.07, 1],
              [861 * l, 0.05, 0.7],
              [1540 * l, 0.035, 0.5],
              [2750 * l, 0.02, 0.35],
            ],
            e,
          ),
          r,
          a * 0.3,
          n,
        ));
    return (Se(t, Wa(n, e, 1, 22, { from: 0, fall: 1.2, hp: 1800, ampFall: 0.4, maxLen: 0.007 }), 0.62, 0.3, n), fi(ls(t, 0.55), 1.5));
  }
  export function sz(n, e, t) {
    let i = it(n, 0.52),
      s = t ? 622 : 1320,
      o = s * 1.4142,
      r = 0,
      a = (l, c, u, f) => {
        let h = Math.round(c * n),
          p = Math.round(l * n);
        for (let d = 0; d < h; d++) {
          let m = d / h,
            x = d / n;
          r += (at * u * (1 + f * m)) / n;
          let v = Math.sin(r + 1.6 * Math.sin(r * 0.25) + 0.4 * Math.sin(at * 71 * x));
          i[p + d] += Math.tanh(v * 2.2) * Math.min(1, d / (0.004 * n), (h - d) / (0.012 * n));
        }
      };
    return (
      a(0, 0.09, s, 0),
      a(0.12, 0.17, o, -0.05),
      t && a(0.3, 0.2, s * 0.5, 0.5),
      kt(i, "bp", t ? 1100 : 2100, 0.6, n),
      Se(i, xt(n, e, 0.4, 0.2, { hp: 4e3, att: 0.02 }), 0, 0.03, n),
      i
    );
  }
  export function oz(n, e, t) {
    let i = it(n, 0.6),
      s = i.length,
      o = 0.55,
      r = 0,
      a = 0;
    for (let c = 0; c < s; c++) {
      let u = c / n,
        f = Math.min(1, u / o),
        h = Math.pow(f, 1.4) * (u < o ? 1 : Math.exp(-(u - o) / 0.008));
      if (t) {
        ((r += (170 + 380 * f * f) / n), (a += (680 + 900 * f) / n));
        let p = 2 * (r - Math.floor(r)) - 1;
        i[c] = (p * (0.7 + 0.3 * Math.sin(at * 38 * u)) + 0.35 * Math.sin(at * a)) * h;
      } else
        ((r += (620 + 1900 * f * f * f) / n),
          (a += ((1240 + 3800 * f * f * f) * 1.003) / n),
          (i[c] =
            (Math.sin(at * r) + 0.4 * Math.sin(at * a) + 0.25 * Math.sign(Math.sin(at * r * 0.5))) *
            h *
            (0.8 + 0.2 * Math.sin(at * (20 + 60 * f) * u))));
    }
    (kt(i, "lp", t ? 2600 : 7e3, 0.7, n), kt(i, "hp", t ? 120 : 400, 0.7, n));
    let l = t ? 7 : 5;
    for (let c = 0; c < l; c++) {
      let u = o * Math.sqrt(c / l);
      Se(
        i,
        Xt(
          n,
          0.03,
          [
            [t ? 1500 : 3800, 0.004, 1],
            [t ? 2600 : 6100, 0.003, 0.6],
          ],
          e,
        ),
        u,
        0.12 + (0.2 * c) / l,
        n,
      );
    }
    return i;
  }
  export function rz(n, e) {
    let t = it(n, 1.7);
    Se(t, xt(n, e, 0.01, 0.002, { hp: 2500 }), 0, 1, n);
    let i = e0(n, 0.5, e);
    kt(i, "bp", 3e3, 0.8, n);
    let s = 1;
    for (let l = 0; l < i.length; l++) {
      let c = l / n;
      (l % 220 === 0 && (s = e() < 0.55 + 0.4 * (1 - c / 0.5) ? 1 : 0),
        (i[l] =
          (i[l] * (Math.sin(at * 100 * c) > -0.2 ? 1 : 0.15) + 0.35 * Math.sign(Math.sin(at * 100 * c)) * (e() - 0.3)) *
          s *
          Math.exp(-c / 0.3)));
    }
    Se(t, i, 0.005, 0.8, n);
    let o = it(n, 1.25),
      r = 0,
      a = 0;
    for (let l = 0; l < o.length; l++) {
      let c = l / n,
        u = Math.pow(0.22, c / 1.2);
      ((r += (at * 100 * u) / n),
        (a += (at * (150 + 1900 * Math.pow(1 - c / 1.25, 2.2))) / n),
        (o[l] =
          ((Math.sin(r) + 0.6 * Math.sin(2 * r) + 0.4 * Math.sin(3 * r) + 0.25 * Math.sin(5 * r)) * 0.5 + Math.sin(a) * 0.22) *
          Math.pow(1 - c / 1.25, 1.2) *
          (1 - Math.exp(-c / 0.03))));
    }
    return (Se(t, o, 0.4, 0.8, n), Se(t, Gn(n, 0.12, 140, 60, 0.03, 0.04), 0.4, 0.5, n), fi(t, 1.3));
  }
  export function* az(n, e, t) {
    let i = it(n, 6.5),
      s = e0(n, 6.4, e);
    (yield, y0(s, "lp", ei(t ? 520 : 380, 70, 0.6), 0.7, n), yield);
    let o = [];
    for (let u = 0; u < 9; u++) o.push([Dt(e, 0.05, 3.6), Dt(e, 0.12, 0.5), Dt(e, 0.4, 1)]);
    let r = 0,
      a = 0,
      l = (u) => {
        let f = 0;
        for (let [h, p, d] of o) {
          let m = (u - h) / p;
          f += d * Math.exp(-m * m);
        }
        return (0.25 + f) * Math.exp(-u / 1.9) * (1 - Math.exp(-u / 0.05));
      };
    for (let u = 0; u < s.length; u++) ((u & 31) === 0 && ((r = l(u / n)), (a = (l((u + 32) / n) - r) / 32)), (s[u] *= r), (r += a));
    (Se(i, s, 0, 1, n), yield);
    let c = e0(n, 6, e);
    return (
      kt(c, "bp", 48, 1.2, n),
      Se(i, Mn(c, n, ms(2, 0.2)), 0.05, 3, n),
      t && Se(i, xt(n, e, 0.3, 0.06, { hp: 300, lp: 2500 }), 0.02, 0.25, n),
      i
    );
  }
  export var X6 = [0, 1, 0.435, 0.268, 0.19, 0.145, 0.116, 0.097];
  export function lz(n, e) {
    let t = it(n, 5),
      i = t.length;
    for (let s = 0; s < i; s++) {
      let o = s / n,
        r = 0.0025 * Math.sin(at * 4.3 * o),
        a = Math.min(1, o / 0.45) * Math.min(1, (5 - o) / 1.5) * (o < 3.2 ? 1 : Math.exp(-(o - 3.2) / 0.7)),
        l = 0;
      for (let c = 1; c <= 7; c++) l += Math.sin(at * 92.5 * c * o * (1 + r) + c) * X6[c];
      for (let c = 1; c <= 4; c++) l += 0.45 * Math.sin(at * 138.6 * c * o + c * 2) * X6[c];
      t[s] = l * a;
    }
    return (kt(t, "lp", 520, 0.7, n), t);
  }
  export function cz(n, e, t) {
    let i = it(n, 1.4),
      s = t ? 3 : 4,
      o = 0.02;
    for (let r = 0; r < s; r++) {
      let a = Dt(e, 0.17, 0.26) * (t ? 1.4 : 1),
        l = Math.round(a * n),
        c = Math.round(o * n),
        u = (t ? 1250 : 1550) * (1 - r * 0.04),
        f = 0;
      for (let h = 0; h < l && c + h < i.length; h++) {
        let p = h / l,
          d = u * (1 + 0.55 * Math.sin(Math.PI * Math.pow(p, 0.6)) - 0.25 * p);
        f += (at * d) / n;
        let m = 1 + 0.3 * Math.sin((at * 63 * h) / n);
        i[c + h] +=
          (Math.sin(f) + 0.6 * Math.sin(2 * f + 0.5) + 0.35 * Math.sin(3 * f) + 0.15 * Math.sin(4 * f)) *
          m *
          Math.pow(Math.sin(Math.PI * p), 0.7) *
          (1 - r * 0.14);
      }
      o += a + Dt(e, 0.05, 0.12);
    }
    return (kt(i, "lp", 4200, 0.7, n), i);
  }
  export function uz(n, e, t) {
    let i = it(n, 1.1),
      s = t ? 1.19 : 1,
      o = 0.01,
      r = t ? 3 : 4;
    for (let a = 0; a < r; a++)
      (Se(
        i,
        Xt(
          n,
          0.5,
          [
            [2310 * s, Dt(e, 0.06, 0.13), 1],
            [3740 * s, 0.07, 0.7],
            [5910 * s, 0.04, 0.5],
            [8130 * s, 0.025, 0.3],
            [1012 * s, 0.03, 0.3],
          ],
          e,
        ),
        o,
        Dt(e, 0.35, 1),
        n,
      ),
        Se(i, xt(n, e, 0.004, 0.001, { hp: 3e3 }), o, 0.3, n),
        (o += Dt(e, 0.09, 0.26)));
    return i;
  }
  export function fz(n, e) {
    let t = it(n, 2.8),
      i = it(n, 2.2);
    return (
      Se(
        i,
        Xt(
          n,
          2.2,
          [
            [47, 0.7, 1],
            [77, 0.55, 0.9],
            [121, 0.4, 0.7],
            [163, 0.3, 0.5],
            [214, 0.22, 0.4],
            [330, 0.12, 0.25],
          ],
          e,
        ),
        0,
        0.5,
        n,
      ),
      Se(i, xt(n, e, 0.5, 0.11, { lp: 420 }), 0, 1, n),
      Se(t, i, 0, 1, n),
      Se(t, i, 0.36, 0.3, n),
      Se(t, i, 0.61, 0.12, n),
      t
    );
  }
  export function hz(n, e) {
    let t = it(n, 0.09);
    return (
      Se(
        t,
        Xt(
          n,
          0.08,
          [
            [1820, 0.009, 1],
            [2730, 0.007, 0.6],
            [640, 0.012, 0.5],
          ],
          e,
        ),
        0,
        1,
        n,
      ),
      Se(t, xt(n, e, 0.004, 0.001, { hp: 2500 }), 0, 0.5, n),
      t
    );
  }
  export function dz(n, e) {
    let t = it(n, 0.06);
    return (
      Se(
        t,
        Xt(
          n,
          0.05,
          [
            [3200, 0.008, 1],
            [4800, 0.005, 0.3],
          ],
          e,
        ),
        0,
        1,
        n,
      ),
      t
    );
  }
  export function* pz(n, e) {
    let i = function* (s) {
      let o = gu(n, 6, s, (u) => {
        (kt(u, "hp", 900, 0.6, n), kt(u, "lp", 8500, 0.6, n));
      });
      yield;
      let r = gu(n, 6, s, (u) => {
          kt(u, "bp", 420, 0.5, n);
        }),
        a = o.length,
        l = qv(a, [o, 0.5], [r, 0.75]),
        c = new Float32Array(a);
      for (let u = 0; u < 1020; u++) {
        let f = Math.floor(s() * a),
          h = Math.round(Dt(s, 6e-4, 0.003) * n),
          p = Math.pow(s(), 3) * 1.6 + 0.15;
        for (let d = 0; d < h; d++) ((c[f] += (s() * 2 - 1) * p * Math.exp((-5 * d) / h)), ++f >= a && (f = 0));
      }
      (yield, y0(c, "hp", () => 2200, 0.7, n, 2), yield);
      for (let u = 0; u < 30; u++) {
        let f = Dt(s, 700, 2100);
        Ni(c, Va(n, Dt(s, 0.008, 0.02), f, f * 1.7), s() * 6, Dt(s, 0.08, 0.3), n);
      }
      for (let u = 0; u < a; u++) l[u] += c[u] * 0.55;
      return l;
    };
    return [yield* i(as(Math.floor(e() * 1e9))), yield* i(as(Math.floor(e() * 1e9)))];
  }
  export function* mz(n, e) {
    let i = function* (s) {
      let o = gu(n, 6, s, (c) => {
          (kt(c, "lp", 1300, 0.6, n), kt(c, "hp", 110, 0.7, n));
        }),
        r = o.length,
        a = new Float32Array(r);
      for (let c = 0; c < 1560; c++) a[Math.floor(s() * r)] += (s() * 2 - 1) * (0.2 + Math.pow(s(), 4) * 3);
      let l = qv(r, [o, 0.8]);
      for (let [c, u, f] of [
        [1820, 14, 1],
        [2740, 16, 0.8],
        [4150, 18, 0.6],
        [6200, 14, 0.35],
        [940, 8, 0.7],
      ]) {
        let h = Float32Array.from(a);
        y0(h, "bp", () => c, u, n, 2);
        for (let p = 0; p < r; p++) l[p] += h[p] * f * 5;
        yield;
      }
      for (let c = 0; c < 4; c++) {
        let u = Dt(s, 900, 1600);
        Ni(l, Va(n, 0.014, u, u * 1.8), s() * 6, 0.25, n);
      }
      return l;
    };
    return [yield* i(as(Math.floor(e() * 1e9))), yield* i(as(Math.floor(e() * 1e9)))];
  }
  export function gz(n, e) {
    let s = e0(n, 8.5, e),
      o = Float32Array.from(s);
    (y0(
      s,
      "bp",
      (r) => {
        let a = r * 8.5;
        return 380 + 190 * Math.sin((at * a) / 8) + 90 * Math.sin((at * a) / 2.667 + 1);
      },
      1.3,
      n,
    ),
      y0(
        o,
        "bp",
        (r) => {
          let a = r * 8.5;
          return 1350 + 260 * Math.sin((at * a) / 4 + 2);
        },
        9,
        n,
      ));
    for (let r = 0; r < s.length; r++) {
      let a = r / n;
      s[r] = s[r] * (0.7 + 0.3 * Math.sin((at * a) / 8 + 0.5)) + o[r] * 0.22 * Math.pow(0.5 + 0.5 * Math.sin((at * a) / 4 + 1), 2);
    }
    return t5(s, n * 8, !0);
  }
  export function* xz(n, e) {
    let s = e0(n, 8.5, e),
      o = e0(n, 8 + 0.5, e),
      r = e0(n, 8 + 0.5, e);
    (yield, kt(s, "lp", 1100, 0.6, n), kt(s, "hp", 70, 0.7, n), kt(o, "hp", 2400, 0.7, n), kt(r, "bp", 520, 1.2, n), yield);
    for (let a = 0; a < s.length; a++) {
      let l = a / n,
        c = (l % 4) / 4,
        u = Math.pow(0.5 - 0.5 * Math.cos(at * c), 1.5),
        f = Math.exp(-Math.pow((c - 0.5) / 0.05, 2)),
        h = Math.exp(-Math.pow((c - 0.68) / 0.16, 2)),
        p = 0.5 - 0.5 * Math.cos((at * ((l + 1.3) % 2.667)) / 2.667);
      s[a] = s[a] * (0.3 + 0.7 * u + 0.25 * p) + r[a] * f * 1.8 + o[a] * h * 0.35;
    }
    return t5(s, n * 8, !0);
  }
  export function vz(n, e) {
    let t = (i, s) => {
      let o = it(n, 1.4),
        r = [
          [0.062, 0.55],
          [0.089, 0.42],
          [0.118, 0.36],
          [0.151, 0.26],
          [0.178, 0.2],
          [0.243, 0.1],
        ];
      for (let [l, c] of r)
        Se(o, xt(n, i, 0.01, 0.0018, { hp: 700, lp: 5500 }), l * (s ? 1.07 : 0.96) + Dt(i, 0, 0.006), c * Dt(i, 0.6, 1.15), n);
      let a = e0(n, 1.3, i);
      return (kt(a, "hp", 300, 0.7, n), y0(a, "lp", ei(6e3, 900, 0.6), 0.7, n), Se(o, Mn(a, n, ms(0.27, 0.04)), 0.04, 0.045, n), o);
    };
    return [t(as(Math.floor(e() * 1e9)), 0), t(as(Math.floor(e() * 1e9)), 1)];
  }
  export function yz(n, e) {
    let t = (i, s) => {
      let o = it(n, 2.2),
        r = e0(n, 2.18, i);
      (y0(r, "lp", ei(5200, 650, 0.5), 0.7, n), Se(o, Mn(r, n, ms(0.33, 0.006)), 0.012, 0.3, n));
      let a = e0(n, 2.1, i);
      (kt(a, "lp", 260, 0.7, n), Se(o, Mn(a, n, ms(0.4, 0.01)), 0.012, 0.5, n));
      for (let [l, c] of [
        [0.018, 0.7],
        [0.031, 0.55],
        [0.047, 0.45],
        [0.093, 0.3],
        [0.139, 0.2],
      ])
        Se(o, xt(n, i, 0.008, 0.0015, { lp: 4500 }), l * (s ? 1.09 : 0.95), c, n);
      return o;
    };
    return [t(as(Math.floor(e() * 1e9)), 0), t(as(Math.floor(e() * 1e9)), 1)];
  }
