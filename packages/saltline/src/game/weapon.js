import { Bone as qr, CanvasTexture as Rs, SRGBColorSpace as In, LinearMipmapLinearFilter as yn, MeshStandardMaterial as L0, DoubleSide as ln, BufferGeometry as pt, Float32BufferAttribute as et, Mesh as ht, Shape as Qi, ShapeGeometry as Wc, ShaderMaterial as vn, AdditiveBlending as wr, BufferAttribute as nt, Euler as _0, Matrix4 as Je, Path as xr, Vector2 as We, ExtrudeGeometry as vr, ShapeUtils as As, AddOperation as ox, Quaternion as St, ZeroFactor as up, Vector3 as K, MixOperation as sx, Light as br } from 'three';
import { ar } from './ns.js';
import { Z0, T0, Ei, Tr, bn } from './common.js';
import { ao } from './render.js';
import { hz, ms } from './fx.js';
import { kP } from './ground.js';
import { a_ } from './mats.js';
import { ta } from './level.js';
import { sw } from './props.js';
import { __late as __late_level } from './level.js';
import { __late as __late_fx } from './fx.js';
import { __late as __late_audio } from './audio.js';
// forward references, filled in by the owning later file (see README)
let I5, BD, bs, rb, ab, si, tb;
export const __late = {
  I5(v) {
    I5 = v;
  },
  BD(v) {
    BD = v;
  },
  bs(v) {
    bs = v;
  },
  rb(v) {
    rb = v;
  },
  ab(v) {
    ab = v;
  },
  si(v) {
    si = v;
  },
  tb(v) {
    tb = v;
  },
};
__late_level.z1(z1);
__late_audio.ly(ly);
__late_audio.dy(dy);

export var Zy = {};
  ar(Zy, { create: () => I5, showcase: () => BD });
  export var Qo = {
    model: [8, 8, 440, 112],
    p_model: [456, 8, 300, 112],
    rack: [764, 8, 420, 150],
    p_rack: [1192, 8, 340, 120],
    qr: [1540, 8, 150, 150],
    cart: [1698, 8, 230, 150],
    warn: [8, 166, 640, 170],
    optic: [656, 166, 420, 84],
    light: [1084, 166, 420, 84],
    p_name: [1512, 166, 340, 78],
    p_cal: [656, 258, 340, 50],
    p_sn: [1004, 258, 340, 50],
    sn: [1352, 258, 400, 50],
    proof: [1760, 258, 200, 60],
    maker: [8, 344, 880, 56],
    cal: [896, 344, 880, 56],
    prop: [8, 408, 1100, 56],
    p_maker: [1116, 408, 880, 56],
    p_prop: [8, 472, 900, 56],
    safe: [916, 472, 96, 60],
    semi: [1020, 472, 96, 60],
    auto: [1124, 472, 96, 60],
    dots: [1228, 472, 96, 60],
    nm: [1332, 472, 660, 50],
    tag: [8, 610, 560, 200],
    arrow: [580, 610, 120, 60],
    index: [710, 610, 60, 60],
  };
  for (let n = 0; n < 20; n++) Qo["r" + (2 + n * 2)] = [8 + n * 100, 540, 92, 60];
  export var y1 = 2048,
    b1 = 1024;
__late_level.y1(y1);
  export function Fz() {
    let n = document.createElement("canvas");
    ((n.width = y1), (n.height = b1));
    let e = n.getContext("2d");
    (e.clearRect(0, 0, y1, b1), (e.textBaseline = "middle"));
    let t = (h, p, d, m, x = "left") => {
        let [v, y, b, g] = Qo[h];
        ((e.font = d), (e.fillStyle = m), (e.textAlign = x), e.fillText(p, x === "left" ? v + 4 : v + b / 2, y + g / 2 + 2, b - 8));
      },
      i = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif',
      s = '"IBM Plex Mono", "Courier New", monospace',
      o = '"Big Shoulders Display", "Barlow Condensed", Impact, sans-serif',
      r = "rgba(158,160,158,0.92)",
      a = "rgba(206,198,160,0.92)",
      l = "rgba(196,52,36,0.95)";
    (t("model", "PAC-9", `700 104px ${o}`, r),
      t("maker", "FOLKTOWN ARMS  \xB7  WEST LAFAYETTE", `600 44px ${i}`, r),
      t("cal", "CAL 5.8\xD740   SN PA-004217", `500 38px ${s}`, r),
      t("prop", "PROPERTY OF PORT AUTHORITY \u2014 BERTH 4 ARMOURY", `600 40px ${i}`, r),
      t("sn", "PA-004217", `500 40px ${s}`, r, "center"),
      t("nm", "BARREL NUT 54 N\xB7m  \xB7  DO NOT OIL THREADS", `600 34px ${i}`, r),
      t("safe", "S", `700 46px ${i}`, r, "center"),
      t("semi", "1", `700 46px ${i}`, r, "center"),
      t("auto", "A", `700 46px ${i}`, l, "center"),
      t("rack", "B4-07", `800 142px ${o}`, a, "center"));
    for (let h = 0; h < 20; h++) t("r" + (2 + h * 2), "T" + (2 + h * 2), `600 40px ${s}`, "rgba(150,152,150,0.88)", "center");
    (t("optic", "HX-2 REFLEX", `700 62px ${i}`, r, "center"),
      t("light", "900 LM  IPX8", `600 56px ${i}`, r, "center"),
      t("p_model", "PAC-4", `700 104px ${o}`, r),
      t("p_name", "BLACK", `600 70px ${i}`, r),
      t("p_cal", "9\xD719  PA-SVC", `500 38px ${s}`, r),
      t("p_sn", "SN PB-011902", `500 38px ${s}`, r),
      t("p_rack", "B4-11", `800 112px ${o}`, a, "center"),
      t("p_maker", "FOLKTOWN ARMS  \xB7  WEST LAFAYETTE", `600 44px ${i}`, r),
      t("p_prop", "PROPERTY OF PORT AUTHORITY \u2014 BERTH 4", `600 40px ${i}`, r));
    {
      let [h, p] = Qo.warn;
      ((e.fillStyle = r),
        (e.textAlign = "left"),
        (e.font = `600 38px ${i}`),
        ["WARNING \u2014 CLEAR CHAMBER BEFORE", "STOWAGE. AUTHORISED BREACH", "PERSONNEL ONLY. PA-REG 44/7"].forEach((d, m) =>
          e.fillText(d, h + 4, p + 32 + m * 52, 630),
        ));
    }
    {
      let [h, p, d, m] = Qo.dots;
      ((e.fillStyle = r),
        e.beginPath(),
        e.arc(h + 24, p + m / 2, 11, 0, 7),
        e.fill(),
        (e.fillStyle = l),
        e.beginPath(),
        e.arc(h + 68, p + m / 2, 11, 0, 7),
        e.fill());
    }
    let c = 7,
      u = () => ((c = (c * 16807) % 2147483647), c / 2147483647);
    {
      let [h, p, d] = Qo.qr,
        m = 16,
        x = (d - 12) / m;
      e.fillStyle = r;
      for (let v = 0; v < m; v++)
        for (let y = 0; y < m; y++)
          (y === 0 ||
            v === m - 1 ||
            (v === 0 && y % 2 === 0) ||
            (y === m - 1 && v % 2 === 1) ||
            (y > 0 && v > 0 && y < m - 1 && v < m - 1 && u() > 0.52)) &&
            e.fillRect(h + 6 + y * x, p + 6 + v * x, x + 0.5, x + 0.5);
    }
    {
      let [h, p, d, m] = Qo.cart,
        x = h + d / 2,
        v = p + m / 2;
      ((e.strokeStyle = r),
        (e.fillStyle = r),
        (e.lineWidth = 6),
        e.beginPath(),
        e.ellipse(x, v, d / 2 - 8, m / 2 - 8, 0, 0, 7),
        e.stroke(),
        (e.lineWidth = 3),
        e.beginPath(),
        e.ellipse(x, v, d / 2 - 20, m / 2 - 20, 0, 0, 7),
        e.stroke(),
        (e.lineWidth = 7),
        e.beginPath(),
        e.moveTo(x, v - 36),
        e.lineTo(x, v + 30),
        e.moveTo(x - 16, v - 20),
        e.lineTo(x + 16, v - 20),
        e.stroke(),
        e.beginPath(),
        e.arc(x, v + 2, 30, 0.25, Math.PI - 0.25),
        e.stroke(),
        e.beginPath(),
        e.arc(x, v - 42, 7, 0, 7),
        e.stroke(),
        (e.font = `700 30px ${i}`),
        (e.textAlign = "center"),
        e.fillText("L", x - 62, v + 2),
        e.fillText("W", x + 62, v + 2));
    }
    {
      let [h, p, , d] = Qo.proof,
        m = p + d / 2;
      ((e.strokeStyle = r),
        (e.fillStyle = r),
        (e.lineWidth = 4),
        (e.font = `700 30px ${i}`),
        (e.textAlign = "center"),
        e.beginPath(),
        e.arc(h + 34, m, 24, 0, 7),
        e.stroke(),
        e.fillText("P", h + 34, m + 2),
        e.beginPath(),
        e.moveTo(h + 100, m - 26),
        e.lineTo(h + 126, m),
        e.lineTo(h + 100, m + 26),
        e.lineTo(h + 74, m),
        e.closePath(),
        e.stroke(),
        e.fillText("4", h + 100, m + 2),
        e.strokeRect(h + 144, m - 22, 44, 44),
        e.fillText("N", h + 166, m + 2));
    }
    {
      let [h, p, d, m] = Qo.tag;
      ((e.fillStyle = "rgba(186,184,174,0.97)"),
        e.fillRect(h + 4, p + 4, d - 8, m - 8),
        (e.fillStyle = "rgba(24,24,26,0.96)"),
        (e.textAlign = "left"),
        (e.font = `700 40px ${i}`),
        e.fillText("PORT AUTHORITY  \xB7  BERTH 4", h + 22, p + 38, d - 44),
        (e.font = `500 30px ${s}`),
        e.fillText("ASSET 0407-A   INSP 11/26", h + 22, p + 172, d - 44));
      let x = h + 22;
      for (; x < h + d - 30;) {
        let v = 2 + Math.floor(u() * 4) * 2;
        (e.fillRect(x, p + 66, v, 78), (x += v + 2 + Math.floor(u() * 3) * 2));
      }
    }
    {
      let [h, p, d, m] = Qo.arrow;
      ((e.fillStyle = r),
        e.beginPath(),
        e.moveTo(h + 8, p + m / 2 - 7),
        e.lineTo(h + d - 40, p + m / 2 - 7),
        e.lineTo(h + d - 40, p + 8),
        e.lineTo(h + d - 8, p + m / 2),
        e.lineTo(h + d - 40, p + m - 8),
        e.lineTo(h + d - 40, p + m / 2 + 7),
        e.lineTo(h + 8, p + m / 2 + 7),
        e.fill());
    }
    {
      let [h, p, d, m] = Qo.index;
      ((e.fillStyle = "rgba(214,214,208,0.95)"), e.fillRect(h + d / 2 - 5, p + 6, 10, m - 12));
    }
    e.globalCompositeOperation = "destination-out";
    for (let h = 0; h < 5200; h++) {
      e.fillStyle = `rgba(0,0,0,${0.2 + u() * 0.55})`;
      let p = u() < 0.92 ? 1 + u() * 2 : 3 + u() * 7;
      e.fillRect(u() * y1, u() * b1, p, p * (0.4 + u()));
    }
    {
      let [h, p, d, m] = Qo.rack;
      for (let x = 0; x < 260; x++) {
        e.fillStyle = `rgba(0,0,0,${0.3 + u() * 0.6})`;
        let v = 2 + u() * 9;
        e.fillRect(h + u() * d, p + u() * m, v * (0.5 + u() * 2), v * 0.6);
      }
    }
    let f = new Rs(n);
    return ((f.colorSpace = In), (f.anisotropy = 8), (f.generateMipmaps = !0), (f.minFilter = yn), f);
  }
  export var Nz = [
      [2, 1],
      [4, 3],
      [6, 15],
      [8, 17],
      [10, 19],
      [12, 21],
      [14, 23],
      [26, 35],
      [28, 37],
      [30, 39],
      [32, 41],
    ].map(([n, e]) => ["r" + n, 0, 0.04362, -0.09211 + e * 0.01001, 0.003, "T"]),
    ty = {
      rifle: [
        ["model", -0.01522, -0.035, 0.066, 0.0092, "L"],
        ["maker", -0.01522, -0.0452, 0.0672, 0.003, "L"],
        ["cal", -0.01522, -0.05, 0.0672, 0.0027, "L"],
        ["prop", -0.01522, -0.0712, 0.0675, 0.0024, "L"],
        ["cart", -0.01522, -0.061, 0.054, 0.008, "L"],
        ["proof", -0.01522, -0.0612, 0.08, 0.0034, "L"],
        ["auto", -0.01642, -0.0262, -0.0335, 0.0038, "L"],
        ["semi", -0.01642, -0.0252, -0.049, 0.0038, "L"],
        ["safe", -0.01642, -0.0362, -0.0605, 0.0038, "L"],
        ["warn", -0.01652, -0.0082, 0.033, 0.0058, "L"],
        ["qr", -0.01652, -0.007, -0.044, 0.0078, "L"],
        ["sn", -0.01652, -0.0098, -0.079, 0.0026, "L"],
        ["cal", -0.01812, 0.0244, 0, 0.0022, "L"],
        ["rack", -0.01702, -0.003, -0.203, 0.019, "L"],
        ["optic", -0.01935, 0.0735, 0.021, 0.0024, "L"],
        ["model", 0.01522, -0.035, 0.069, 0.0092, "R"],
        ["maker", 0.01522, -0.0452, 0.0672, 0.003, "R"],
        ["prop", 0.01522, -0.0712, 0.0675, 0.0024, "R"],
        ["tag", 0.01522, -0.06, 0.067, 0.0094, "R"],
        ["auto", 0.01642, -0.0262, -0.0335, 0.0038, "R"],
        ["semi", 0.01642, -0.0252, -0.049, 0.0038, "R"],
        ["safe", 0.01642, -0.0362, -0.0605, 0.0038, "R"],
        ["sn", 0.01652, -0.0098, -0.067, 0.003, "R"],
        ["proof", 0.01652, 0.001, 0.0808, 0.0036, "R"],
        ["nm", 0.01812, 0.0244, 0.05, 0.002, "R"],
        ["rack", 0.01702, -0.003, -0.203, 0.019, "R"],
        ["optic", 0.01935, 0.0725, 0.025, 0.0022, "R"],
        ...Nz,
      ],
      pistolSlide: [
        ["p_model", -0.01292, -6e-4, 0.047, 0.0066, "L"],
        ["p_name", -0.01292, -6e-4, 0.0225, 0.004, "L"],
        ["p_maker", -0.01292, -0.0038, -0.024, 0.0017, "L"],
        ["cart", -0.01292, 6e-4, -0.03, 0.0048, "L"],
        ["p_cal", 0.01292, -6e-4, 0.047, 0.0036, "R"],
        ["proof", 0.01292, -0.001, -0.035, 0.0026, "R"],
      ],
      pistolFrame: [
        ["p_prop", -0.01282, -0.0196, 0.061, 0.002, "L"],
        ["qr", -0.01282, -0.025, 0.086, 0.0048, "L"],
        ["p_sn", 0.01282, -0.0196, 0.064, 0.0024, "R"],
        ["p_rack", 0.01282, -0.025, 0.08, 0.0036, "R"],
      ],
    },
    bE = `vec3 dBump(vec3 N, float h){ vec3 dpdx = dFdx(-vViewPosition), dpdy = dFdy(-vViewPosition); float dhx = dFdx(h), dhy = dFdy(h);
  vec3 r1 = cross(dpdy, N), r2 = cross(N, dpdx); float det = dot(dpdx, r1); vec3 g = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * N - g); }
`,
    ny = null;
  export function Uz() {
    if (ny) return ny;
    let n = new L0({
      map: Fz(),
      transparent: !0,
      roughness: 0.78,
      metalness: 0,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
      side: ln,
    });
    return (
      (n.name = "weapon_markings"),
      (n.onBeforeCompile = (e) => {
        e.fragmentShader = e.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
` + bE,
          )
          .replace(
            "#include <normal_fragment_maps>",
            `#include <normal_fragment_maps>
normal = dBump(normal, -diffuseColor.a * 0.00005);`,
          );
      }),
      (n.customProgramCacheKey = () => "pac-markings-2"),
      (ny = n)
    );
  }
  export function M1(n) {
    let e = n && n[0] && n[0][0];
    e === "model" ? (n = ty.rifle) : e === "p_model" ? (n = ty.pistolSlide) : e === "p_prop" && (n = ty.pistolFrame);
    let t = [],
      i = [],
      s = [],
      o = [];
    for (let [l, c, u, f, h, p, d = 0] of n) {
      let [m, x, v, y] = Qo[l],
        b = (h * v) / y,
        g = m / y1,
        E = (m + v) / y1,
        M = 1 - x / b1,
        _ = 1 - (x + y) / b1,
        T = t.length / 3,
        w;
      if (
        (p === "L"
          ? (w = [
              [c, u - h / 2, -(f + b / 2)],
              [c, u - h / 2, -(f - b / 2)],
              [c, u + h / 2, -(f - b / 2)],
              [c, u + h / 2, -(f + b / 2)],
            ])
          : p === "R"
            ? (w = [
                [c, u - h / 2, -(f - b / 2)],
                [c, u - h / 2, -(f + b / 2)],
                [c, u + h / 2, -(f + b / 2)],
                [c, u + h / 2, -(f - b / 2)],
              ])
            : (w = [
                [c - b / 2, u, -(f - h / 2)],
                [c + b / 2, u, -(f - h / 2)],
                [c + b / 2, u, -(f + h / 2)],
                [c - b / 2, u, -(f + h / 2)],
              ]),
        d)
      ) {
        let R = Math.cos(d),
          z = Math.sin(d),
          I = u,
          L = -f;
        for (let U of w) {
          let k = U[1] - I,
            C = U[2] - L;
          ((U[1] = I + k * R - C * z), (U[2] = L + k * z + C * R));
        }
      }
      for (let R of w) t.push(R[0], R[1], R[2]);
      i.push(g, _, E, _, E, M, g, M);
      let S = p === "L" ? [-1, 0, 0] : p === "R" ? [1, 0, 0] : [0, 1, 0];
      for (let R = 0; R < 4; R++) s.push(S[0], S[1], S[2]);
      o.push(T, T + 1, T + 2, T, T + 2, T + 3);
    }
    let r = new pt();
    (r.setAttribute("position", new et(t, 3)), r.setAttribute("uv", new et(i, 2)), r.setAttribute("normal", new et(s, 3)), r.setIndex(o));
    let a = new ht(r, Uz());
    return ((a.renderOrder = 2), a);
  }
  export function ME(n, e) {
    let t = new Qi();
    (n.forEach((a, l) => (l ? t.lineTo(a[0], a[1]) : t.moveTo(a[0], a[1]))), t.closePath());
    let i = new Wc(t);
    i.translate(0, 0, -e);
    {
      let a = 1e9,
        l = -1e9,
        c = 1e9,
        u = -1e9;
      for (let p of n) ((a = Math.min(a, p[0])), (l = Math.max(l, p[0])), (c = Math.min(c, p[1])), (u = Math.max(u, p[1])));
      let f = i.attributes.position,
        h = i.attributes.uv;
      for (let p = 0; p < f.count; p++) h.setXY(p, (f.getX(p) - a) / (l - a), (f.getY(p) - c) / (u - c));
    }
    let s = new vn({
        transparent: !0,
        premultipliedAlpha: !0,
        depthWrite: !1,
        side: ln,
        uniforms: {
          uBright: { value: 7 },
          uSun: { value: Z0.dir.clone() },
          uSunCol: { value: Z0.color.clone() },
          uZen: { value: T0.zenith.clone() },
          uHor: { value: T0.horizonAway.clone() },
          uTilt: { value: 0.1 },
          uEnv: { value: 1 },
        },
        vertexShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uTilt;
      void main(){
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz;
        vFwd = (modelViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz; vRight = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz; vUp = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        vWPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vWN = normalize(mat3(modelMatrix) * normalize(vec3(0.0, -uTilt, 1.0)));   // real sights tilt the glass a few degrees
        gl_Position = projectionMatrix * mv;
      }`,
        fragmentShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uBright, uEnv; uniform vec3 uSun, uSunCol, uZen, uHor;
      void main(){
        vec3 d = normalize(vView), fw = normalize(vFwd);
        float k = max(dot(d, fw), 1e-3);
        vec2 a = vec2(dot(d, normalize(vRight)), dot(d, normalize(vUp))) / k;      // tangent of the angle off the bore axis
        float r = length(a), px = max(fwidth(r), 1e-5);
        float dotR = max(0.0011, px * 0.9), ringW = max(0.00045, px * 0.6);
        float dotI = 1.0 - smoothstep(dotR - px, dotR + px, r);
        float ring = 1.0 - smoothstep(ringW - px * 0.5, ringW + px, abs(r - 0.0128));
        float ang = atan(a.y, a.x);
        float tick = (1.0 - smoothstep(0.0, px * 1.2 + 0.0004, min(abs(a.x), abs(a.y)))) * step(0.0128, r) * (1.0 - smoothstep(0.0165, 0.0175, r));
        float ret = clamp(dotI + ring * 0.8 + tick * 0.8, 0.0, 1.0);
        // faint halo so the bloom has something to hold on to
        ret += 0.05 * exp(-r * r / 0.00002);
        vec3 retCol = vec3(1.0, 0.11, 0.045) * ret * uBright;
        // coated glass: sky/sun reflection through a ruby-teal dichroic coating, stronger at grazing angles
        vec3 wv = normalize(vWPos - cameraPosition); vec3 n = normalize(vWN); if (dot(n, wv) > 0.0) n = -n;
        vec3 rf = reflect(wv, n);
        float fres = pow(1.0 - abs(dot(wv, n)), 3.0);
        vec3 sky = mix(uHor, uZen, clamp(rf.y * 1.4 + 0.2, 0.0, 1.0));
        float sd = max(dot(rf, uSun), 0.0);
        sky += uSunCol * (pow(sd, 6.0) * 0.6 + pow(sd, 90.0) * 6.0);
        sky = mix(vec3(0.050, 0.047, 0.043), sky, uEnv); sd *= uEnv;               // under a roof the glass mirrors the room, not the sky
        // multi-layer dichroic coating: the reflected tint walks teal -> violet -> amber as the glass turns away from the
        // eye (thin-film path length grows with the angle), a soft diagonal sheen band, and a thin dark edge
        float band = smoothstep(0.25, 0.5, vUv.x * 0.6 + vUv.y) * (1.0 - smoothstep(0.62, 0.95, vUv.x * 0.6 + vUv.y));
        float ndv = abs(dot(wv, n)), ph = (1.0 - ndv) * 2.6 + vUv.y * 0.35 + vUv.x * 0.12;
        vec3 film = 0.5 + 0.5 * cos(6.2832 * (ph + vec3(0.62, 0.30, 0.12)));
        vec3 coat = mix(mix(vec3(0.30, 0.52, 0.95), vec3(1.0, 0.62, 0.28), clamp(fres * 2.2 + vUv.y * 0.75 - 0.15, 0.0, 1.0)), film * vec3(0.85, 1.0, 0.95), 0.28);
        vec2 e = abs(vUv - 0.5) * 2.0; float edge = smoothstep(0.90, 1.0, max(e.x, e.y));
        float refl = 0.12 + 0.60 * fres + 0.07 * band;
        // dust and a thumb smear on the outer surface: only where light rakes it
        vec2 dc = vUv * vec2(150.0, 100.0), di = floor(dc); float dh = fract(sin(dot(di, vec2(127.1, 311.7))) * 43758.5453);
        float speck = step(0.988, dh) * (1.0 - smoothstep(0.10, 0.36, length(fract(dc) - 0.5 - (fract(dh * 57.3) - 0.5) * 0.5)));
        vec2 sq = (vUv - vec2(0.70, 0.30)) * vec2(1.0, 1.7); float smudge = exp(-dot(sq, sq) * 9.0) * (0.6 + 0.4 * sin(vUv.x * 90.0 + vUv.y * 60.0));
        float lit = 0.06 + 1.6 * pow(sd, 3.0) + fres;
        // faint emitter glow that stays visible off-axis (what you see of a powered sight from the hip)
        vec2 eg = (vUv - vec2(0.5, 0.16)) * vec2(1.0, 1.6); retCol += vec3(1.0, 0.10, 0.04) * 0.20 * exp(-dot(eg, eg) * 60.0) * (1.0 - smoothstep(0.985, 0.9995, k));
        vec3 col = (sky * 1.5 + vec3(0.03, 0.035, 0.045)) * coat * refl * (1.0 - edge) + retCol;
        col += (uHor * 0.5 + uSunCol * 0.25) * lit * (speck * 0.45 + smudge * 0.03);
        float alpha = clamp(0.20 + 0.32 * fres + 0.05 * band + 0.6 * edge + speck * 0.2 * lit + smudge * 0.02, 0.0, 0.94);
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      }),
      o = new ht(i, s);
    o.renderOrder = 5;
    let r = 0;
    return (
      (o.onBeforeRender = (a, l) => {
        let c = l.environmentIntensity || 1;
        c > r && (r = c);
        let u = Math.min(1, Math.max(0, (c / r - 0.55) / 0.4));
        s.uniforms.uEnv.value += (u - s.uniforms.uEnv.value) * 0.12;
      }),
      o
    );
  }
  export function l5() {
    let n = [],
      e = [],
      t = [],
      i = [],
      s = (d, m, x, v, y) => {
        let b = n.length / 3;
        for (let g of [d, m, x, v]) n.push(g[0], g[1], g[2]);
        e.push(0, 0, 1, 0, 1, 1, 0, 1);
        for (let g = 0; g < 4; g++) t.push(y);
        i.push(b, b + 1, b + 2, b, b + 2, b + 3);
      };
    (s([-0.13, -0.13, -0.03], [0.13, -0.13, -0.03], [0.13, 0.13, -0.03], [-0.13, 0.13, -0.03], 0),
      s(
        [-0.13 * 0.7, -0.13 * 0.7, -0.09],
        [0.13 * 0.7, -0.13 * 0.7, -0.09],
        [0.13 * 0.7, 0.13 * 0.7, -0.09],
        [-0.13 * 0.7, 0.13 * 0.7, -0.09],
        0,
      ));
    let r = 0.065,
      a = 0.34;
    (s([-r, 0, 0.01], [r, 0, 0.01], [r, 0, -a], [-r, 0, -a], 1), s([0, -r, 0.01], [0, r, 0.01], [0, r, -a], [0, -r, -a], 1));
    let l = 0.17,
      c = 0.05,
      u = 0.035;
    (s([-l, -c, u], [l, -c, u], [l, c, u], [-l, c, u], 2),
      s([-l, 0, u + c], [l, 0, u + c], [l, 0, u - c], [-l, 0, u - c], 2),
      s([-0.05, -0.05, -0.01], [0.05, -0.05, -0.01], [0.05, 0.05, -0.01], [-0.05, 0.05, -0.01], 3),
      s([-0.03, -0.03, 0.02], [0.03, -0.03, 0.02], [0.03, 0.03, 0.02], [-0.03, 0.03, 0.02], 4));
    let f = new pt();
    (f.setAttribute("position", new et(n, 3)), f.setAttribute("uv", new et(e, 2)), f.setAttribute("aType", new et(t, 1)), f.setIndex(i));
    let h = new vn({
        transparent: !0,
        depthWrite: !1,
        blending: wr,
        side: ln,
        uniforms: { uSeed: { value: 0 }, uInt: { value: 0 }, uHeat: { value: 0 }, uJet: { value: 1 } },
        vertexShader: `attribute float aType; varying vec2 vUv; varying float vType;
      void main(){ vUv = uv; vType = aType; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vUv; varying float vType; uniform float uSeed, uInt, uHeat, uJet;
      float h1(float n){ return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453); }
      void main(){
        vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x); float I = 0.0; vec3 tintc = vec3(1.0, 0.50, 0.16);
        if (vType < 0.5) {
          float n1 = 3.0 + floor(h1(1.0) * 3.0), n2 = 5.0 + floor(h1(2.0) * 4.0);
          float pet = pow(abs(cos(a * n1 * 0.5 + h1(3.0) * 6.283)), 5.0) * (0.55 + 0.45 * h1(4.0));
          pet += pow(abs(cos(a * n2 * 0.5 + h1(5.0) * 6.283)), 14.0) * 0.55;
          float reach = 0.35 + 0.65 * pet;
          I = (0.25 + pet) * smoothstep(reach, reach * 0.15, r) * (0.75 + 0.25 * sin(r * 26.0 + h1(6.0) * 20.0));
        } else if (vType < 1.5) {
          float y = vUv.y, x = p.x * (1.0 + 0.5 * sin(y * 17.0 + h1(7.0) * 30.0) * y);
          float wdt = mix(0.20, 0.75, smoothstep(0.0, 0.35, y)) * (1.0 - y * 0.75);
          I = exp(-x * x / (wdt * wdt * 0.35)) * pow(1.0 - y, 1.4) * (0.7 + 0.3 * sin(y * 31.0 + h1(8.0) * 9.0)) * 0.9;
        } else if (vType < 2.5) {
          float u = abs(p.x), len = 0.55 + 0.45 * h1(9.0 + step(0.0, p.x));
          float wv = p.y * (1.0 + u * 3.0) + 0.12 * sin(u * 14.0 + h1(10.0) * 20.0) * u;
          I = exp(-wv * wv * 22.0) * smoothstep(len, 0.06, u) * smoothstep(0.02, 0.10, u) * 0.85 * uJet;
        } else if (vType < 3.5) {
          I = exp(-r * r * 5.0) * 2.4 * smoothstep(1.0, 0.6, r); tintc = vec3(1.0, 0.82, 0.58);
        } else {
          gl_FragColor = vec4(vec3(1.0, 0.28, 0.06) * exp(-r * r * 4.0) * smoothstep(1.0, 0.5, r) * uHeat, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          return;
        }
        vec3 col = mix(tintc, vec3(1.0, 0.90, 0.70), clamp(I * I * 0.7, 0.0, 1.0)) * I * uInt;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      }),
      p = new ht(f, h);
    return ((p.renderOrder = 10), (p.frustumCulled = !1), p);
  }
  export var iy = { value: 1 },
    Bz = {
      pac9_anodised: { kind: 0, color: [0.038, 0.039, 0.043], roughness: 0.54, metalness: 0.1 },
      pac9_phosphate: { kind: 1, color: [0.042, 0.042, 0.043], roughness: 0.66, metalness: 0.2 },
      pac9_polymer: { kind: 2, color: [0.034, 0.035, 0.038], roughness: 0.6, metalness: 0 },
      pac9_polymer_tan: { kind: 2, color: [0.15, 0.112, 0.068], roughness: 0.6, metalness: 0 },
      pac4_nitride: { kind: 3, color: [0.034, 0.035, 0.039], roughness: 0.47, metalness: 0.35 },
      pac9_matte: { kind: 4, color: [1, 1, 1], roughness: 0.86, metalness: 0 },
    },
    Hz =
      `
varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm; varying vec4 vSurf; uniform float uRain;
float dh3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float dn3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dh3(i), dh3(i + vec3(1,0,0)), f.x), mix(dh3(i + vec3(0,1,0)), dh3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh3(i + vec3(0,0,1)), dh3(i + vec3(1,0,1)), f.x), mix(dh3(i + vec3(0,1,1)), dh3(i + vec3(1,1,1)), f.x), f.y), f.z); }
vec2 dh2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
vec2 dDrops(vec2 uv, float cell, float seed, float thr){ vec2 g = uv / cell, i = floor(g), f = fract(g); float best = 0.0;
  for (int a = -1; a <= 1; a++) for (int b = -1; b <= 1; b++) { vec2 o = vec2(float(a), float(b)); vec2 r = dh2(i + o + seed);
    float keep = step(thr, fract(r.x * 7.31 + r.y * 3.17)); vec2 c = o + 0.2 + 0.6 * r; float rad = (0.14 + 0.20 * fract(r.x * 13.7)) * keep;
    float d = length(f - c); best = max(best, sqrt(max(rad * rad - d * d, 0.0))); }
  return vec2(best * cell, step(1e-6, best)); }
` + bE,
    Oz = `
vec3 dP = vObjP; vec3 dAn = abs(vONrm);
vec2 dUV = (dAn.y > dAn.x && dAn.y > dAn.z) ? dP.xz : (dAn.x > dAn.z ? dP.zy : dP.xy);
float dEdge = vSurf.x, dCav = vSurf.y, dBare = vSurf.z, dZone = vSurf.w;
float dPx = length(fwidth(dP));                                         // metres of surface per pixel
float dNear = 1.0 - smoothstep(0.00020, 0.00075, dPx);                  // micro detail fades out before it can alias
vec3 dQ = mat3(0.36, 0.48, -0.80, -0.80, 0.60, 0.0, 0.48, 0.64, 0.60) * dP;       // turned domain: the noise lattice never lines up with the gun
float dLo = dn3(dQ * 34.0), dMid = dn3(dQ * 180.0 + 7.0);
float dGr = (dh3(floor(dP * 2900.0)) - 0.5) * dNear;                    // finest grain: one hash
float dScr = dn3(dP * vec3(640.0, 640.0, 21.0) + 3.0);                  // long fine scratches along the bore
float dHt = 0.0, dR = 0.0; vec3 dAlb = diffuseColor.rgb;
float dBreak = dMid * 0.65 + dLo * 0.35;
float dPolish = smoothstep(0.15, 0.85, dEdge) * (0.35 + 0.65 * dLo);     // exposed edges are a little burnished, unevenly
float dWorn = smoothstep(0.60, 0.72, dBreak) * smoothstep(0.55, 0.95, dEdge);   // and worn through in a few patches (high-wear parts only)
float dScratch = smoothstep(0.80, 0.94, dScr) * (0.10 + 0.90 * dZone) * smoothstep(0.30, 0.62, dMid * 0.5 + dLo * 0.5) * (1.0 - smoothstep(0.0007, 0.0020, dPx));
#if D_KIND == 0
  float smear = smoothstep(0.52, 0.82, dn3(dQ * vec3(52.0, 30.0, 15.0) + 11.0));      // palm and finger oil on the flats
  dR = (dLo - 0.5) * 0.14 + (dMid - 0.5) * 0.08 + dGr * 0.10 - smear * 0.12;
  dHt = dGr * 0.000012;
  dAlb *= (0.90 + 0.20 * dLo) * (1.0 - 0.10 * smear);
  dAlb = mix(dAlb, dAlb * 1.7 + 0.005, dPolish * 0.55); dR -= dPolish * 0.06;
  dAlb = mix(dAlb, vec3(0.30, 0.31, 0.33), dScratch * 0.55); dR -= dScratch * 0.10; dHt -= dScratch * 0.000012;
  metalnessFactor = mix(metalnessFactor, 1.0, max(dWorn, dScratch * 0.5));
  dAlb = mix(dAlb, vec3(0.50, 0.51, 0.53), dWorn); dR = mix(dR, -0.10 + 0.12 * dMid, dWorn);
#elif D_KIND == 3
  float lay = dn3(vec3(dP.xy * 2600.0, dP.z * 36.0));                                  // surface-ground lay along the bore
  float smear = smoothstep(0.50, 0.80, dn3(dQ * vec3(60.0, 34.0, 20.0) + 11.0));
  dR = (dLo - 0.5) * 0.10 + (lay - 0.5) * 0.14 * dNear + dGr * 0.04 - smear * 0.11;
  dHt = lay * 0.000007 * dNear;
  dAlb *= (0.92 + 0.16 * dLo) * (1.0 - 0.12 * smear);
  dAlb = mix(dAlb, dAlb * 1.9 + 0.006, dPolish * 0.6); dR -= dPolish * 0.06;
  dAlb = mix(dAlb, vec3(0.16, 0.16, 0.17), dScratch * 0.35); dR -= dScratch * 0.06;
  float through = dWorn * 0.8;                                                         // holster wear: grey steel, not silver
  metalnessFactor = mix(metalnessFactor, 1.0, through); dAlb = mix(dAlb, vec3(0.36, 0.36, 0.37), through); dR = mix(dR, -0.06, through);
#elif D_KIND == 1
  float oil = smoothstep(0.30, 0.72, dn3(dQ * vec3(46.0, 46.0, 30.0) + 5.0));
  float lay = dn3(vec3(dP.xy * 1400.0, dP.z * 60.0));
  // phosphate: crystalline, porous, drinks oil
  float cR = (dLo - 0.5) * 0.14 + dGr * 0.14 - oil * 0.20, cH = dGr * 0.000022 + dMid * 0.000004;
  vec3 cA = dAlb * mix(1.22, 0.72, oil) * (0.94 + 0.12 * dMid);
  cA = mix(cA, cA * 1.8 + 0.006, dPolish * 0.6); cR -= dPolish * 0.10;
  float cM = metalnessFactor; float through = max(dWorn, dScratch * 0.6);
  cM = mix(cM, 1.0, through); cA = mix(cA, vec3(0.40, 0.40, 0.41), through); cR = mix(cR, -0.26 + 0.10 * dMid, through);
  // bare: turned or ground steel, faint lay, a little staining
  float bR = -0.30 + (lay - 0.5) * 0.20 + (dLo - 0.5) * 0.14, bH = lay * 0.000008 * dNear;
  vec3 bA = min(dAlb, vec3(0.78)) * (0.86 + 0.20 * dMid); bA = mix(bA, bA * vec3(0.72, 0.62, 0.50), smoothstep(0.62, 0.9, dLo) * 0.35);
  dAlb = mix(cA, bA, dBare); dR = mix(cR, bR, dBare); dHt = mix(cH, bH, dBare); metalnessFactor = mix(cM, 1.0, dBare);
#elif D_KIND == 4
  // rubber and matte liners (the 'plain' group, absolute vertex albedo): fine moulded grain, chalky bloom, shiny where rubbed
  float bloom = smoothstep(0.45, 0.80, dMid * 0.6 + dLo * 0.4);
  dR = (dLo - 0.5) * 0.10 + dGr * 0.08 - dPolish * 0.22; dHt = dGr * 0.000018;
  dAlb = mix(dAlb, dAlb * 1.5 + 0.012, bloom * 0.35) * (1.0 + 0.35 * dPolish);
#else
  float st = dn3(dP * 1500.0) * 0.6 + dh3(floor(dP * 3300.0)) * 0.4;                    // mould texture (VDI-ish spark finish)
  dR = (dLo - 0.5) * 0.14 + (st - 0.5) * 0.12 * dNear - smoothstep(0.55, 0.90, dMid) * 0.035;
  dHt = st * 0.000045 * dNear;
  dAlb *= 0.92 + 0.16 * dLo;
  // studded grip zones: 1.15 mm pyramids on a diagonal grid; past the range where they resolve they fold into roughness
  float zk = smoothstep(0.35, 0.60, dZone); vec2 q = vec2(dUV.x + dUV.y, dUV.x - dUV.y) / 0.00115, qc = abs(fract(q) - 0.5);
  float stud = 1.0 - smoothstep(0.10, 0.46, max(qc.x, qc.y)), studK = 1.0 - smoothstep(0.00024, 0.00056, dPx);   // gone before a stud is under two pixels: no moire
  dHt += zk * stud * 0.00028 * studK; dR += zk * (0.10 - stud * 0.16 * studK);
  dAlb *= 1.0 - zk * 0.14 * (1.0 - stud * studK);
  // moulding parting line on the centre plane, flash trimmed
  float pl = (1.0 - smoothstep(0.00012, 0.00034, abs(dP.x))) * step(dAn.x, 0.55) * dNear; dHt += pl * 0.00005; dR -= pl * 0.10;
  // handling shine on edges, a few pale scuffs (polymer whitens where it is scraped)
  float scuff = smoothstep(0.86, 0.96, dScr) * smoothstep(0.45, 0.70, dLo) * (1.0 - smoothstep(0.0007, 0.0020, dPx));
  dAlb = mix(dAlb, dAlb * 1.5 + 0.006, dPolish * 0.5); dR -= dPolish * 0.12;
  dAlb = mix(dAlb, dAlb * 2.0 + 0.015, scuff * 0.35 + dWorn * 0.25); dR += scuff * 0.06;
#endif
// recesses: darker, rougher, a little pale dust settled in them
float dGrime = dCav * (0.55 + 0.45 * dMid);
dAlb *= 1.0 - 0.50 * dGrime;
dAlb = mix(dAlb, vec3(0.115, 0.100, 0.082), dCav * smoothstep(0.50, 0.85, dLo * 0.5 + dMid * 0.5) * 0.30);
dR += dGrime * 0.22; metalnessFactor *= 1.0 - 0.5 * dGrime;
// rain
float dUpN = vWNrm.y, dUp = smoothstep(0.30, 0.75, dUpN) * uRain, dSide = (1.0 - smoothstep(0.10, 0.60, abs(dUpN))) * uRain;
float dDrop = 0.0, dDropH = 0.0, dRun = 0.0;
if (dUp > 0.002) { vec2 dD1 = dDrops(dUV, 0.0050, 3.0, 0.80), dD2 = dDrops(dUV + 0.31, 0.0024, 9.0, 0.90); dDrop = max(dD1.y, dD2.y) * dUp; dDropH = max(dD1.x, dD2.x) * dUp; }
if (dSide > 0.002) dRun = smoothstep(0.80, 0.90, dn3(vec3(dP.x * 420.0 + dP.z * 610.0, dP.y * 9.0, dP.z * 37.0))) * smoothstep(0.42, 0.62, dLo) * dSide * (1.0 - smoothstep(0.0008, 0.0024, dPx));   // run-off: thin, sparse, broken trickles
float dWet = max(dUp * (0.5 + 0.5 * smoothstep(0.3, 0.7, dLo)), dRun * 0.55);
diffuseColor.rgb = dAlb * (1.0 - 0.20 * dWet);
roughnessFactor = clamp(roughnessFactor + dR, 0.12, 1.0);
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.52, dWet);
roughnessFactor = mix(roughnessFactor, 0.20, dDrop * 0.8);
float dOcc = 1.0 - 0.80 * dCav;
`,
    Vz = `
normal = dBump(normal, dHt + dDropH * 0.17);
`,
    Wz = `
reflectedLight.indirectDiffuse *= dOcc; reflectedLight.indirectSpecular *= dOcc * dOcc;
reflectedLight.directDiffuse *= mix(1.0, dOcc, 0.35); reflectedLight.directSpecular *= mix(1.0, dOcc, 0.6);
`;
  export function _E(n, e) {
    let t = Bz[n.name];
    return (
      t && ((e = t.kind), n.color.setRGB(t.color[0], t.color[1], t.color[2]), (n.roughness = t.roughness), (n.metalness = t.metalness)),
      (n.onBeforeCompile = (i) => {
        ((i.uniforms.uRain = iy),
          (i.vertexShader = i.vertexShader
            .replace(
              "#include <common>",
              `#include <common>
attribute vec4 aSurf; varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm; varying vec4 vSurf;`,
            )
            .replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
vObjP = position; vONrm = normal; vWNrm = normalize(mat3(modelMatrix) * normal); vSurf = aSurf;`,
            )),
          (i.fragmentShader = i.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>
#define D_KIND ` +
                (e | 0) +
                `
` +
                Hz,
            )
            .replace(
              "#include <metalnessmap_fragment>",
              `#include <metalnessmap_fragment>
` + Oz,
            )
            .replace(
              "#include <normal_fragment_maps>",
              `#include <normal_fragment_maps>
` + Vz,
            )
            .replace(
              "#include <aomap_fragment>",
              `#include <aomap_fragment>
` + Wz,
            )));
      }),
      (n.customProgramCacheKey = () => "pac-detail-3-" + e),
      n
    );
  }
  export var u5 = (n, e, t) => {
    let i = Math.min(1, Math.max(0, (t - n) / (e - n)));
    return i * i * (3 - 2 * i);
  };
  export function Gz(n, e) {
    let t = n.attributes.position.array,
      i = t.length / 3,
      s = i / 3,
      o = new Float32Array(s * 3),
      r = new Float32Array(s);
    for (let f = 0; f < s; f++) {
      let h = f * 9,
        p = t[h + 3] - t[h],
        d = t[h + 4] - t[h + 1],
        m = t[h + 5] - t[h + 2],
        x = t[h + 6] - t[h],
        v = t[h + 7] - t[h + 1],
        y = t[h + 8] - t[h + 2],
        b = d * y - m * v,
        g = m * x - p * y,
        E = p * v - d * x,
        M = Math.hypot(b, g, E) || 1;
      ((o[f * 3] = b / M), (o[f * 3 + 1] = g / M), (o[f * 3 + 2] = E / M), (r[f] = M));
    }
    let a = Math.cos((e * Math.PI) / 180),
      l = new Map(),
      c = 5e4;
    for (let f = 0; f < i; f++) {
      let h =
          (Math.round(t[f * 3] * c) + 65536) * 17179869184 +
          (Math.round(t[f * 3 + 1] * c) + 65536) * 131072 +
          (Math.round(t[f * 3 + 2] * c) + 65536),
        p = l.get(h);
      p ? p.push(f) : l.set(h, [f]);
    }
    let u = new Float32Array(i * 3);
    for (let f of l.values())
      for (let h of f) {
        let p = (h / 3) | 0,
          d = o[p * 3],
          m = o[p * 3 + 1],
          x = o[p * 3 + 2],
          v = 0,
          y = 0,
          b = 0;
        for (let E of f) {
          let M = (E / 3) | 0;
          if (d * o[M * 3] + m * o[M * 3 + 1] + x * o[M * 3 + 2] >= a) {
            let _ = r[M];
            ((v += o[M * 3] * _), (y += o[M * 3 + 1] * _), (b += o[M * 3 + 2] * _));
          }
        }
        let g = Math.hypot(v, y, b);
        g > 1e-20
          ? ((u[h * 3] = v / g), (u[h * 3 + 1] = y / g), (u[h * 3 + 2] = b / g))
          : ((u[h * 3] = d), (u[h * 3 + 1] = m), (u[h * 3 + 2] = x));
      }
    n.setAttribute("normal", new nt(u, 3));
  }
  export function vh(n, e, t = {}) {
    let i = n.index ? n.toNonIndexed() : n,
      s = i.attributes.position.array,
      o = i.attributes.normal ? i.attributes.normal.array : null,
      r = [],
      a = [];
    for (let b = 0; b < s.length; b += 9) {
      let g = s[b + 3] - s[b],
        E = s[b + 4] - s[b + 1],
        M = s[b + 5] - s[b + 2],
        _ = s[b + 6] - s[b],
        T = s[b + 7] - s[b + 1],
        w = s[b + 8] - s[b + 2];
      if (!(Math.hypot(E * w - M * T, M * _ - g * w, g * T - E * _) < 1e-11))
        for (let S = 0; S < 9; S++) (r.push(s[b + S]), o && a.push(o[b + S]));
    }
    let l = new pt();
    (l.setAttribute("position", new nt(new Float32Array(r), 3)),
      t.keepN && o ? l.setAttribute("normal", new nt(new Float32Array(a), 3)) : Gz(l, t.crease || 50));
    let c = r.length / 3,
      u = l.attributes.normal.array,
      f = new Float32Array(c * 3),
      h = new Float32Array(c * 4),
      p = new Float32Array(c),
      d = new Float32Array(c),
      m = t.wear == null ? 1 : t.wear,
      x = t.bare || 0,
      v = t.zone || 0,
      y = t.ao || 0;
    for (let b = 0; b < c; b += 3) {
      let g = 0,
        E = 0;
      for (let M = 0; M < 3; M++) {
        let _ = b + M,
          T = b + ((M + 1) % 3),
          w = r[T * 3] - r[_ * 3],
          S = r[T * 3 + 1] - r[_ * 3 + 1],
          R = r[T * 3 + 2] - r[_ * 3 + 2],
          z = w * w + S * S + R * R,
          I = ((u[T * 3] - u[_ * 3]) * w + (u[T * 3 + 1] - u[_ * 3 + 1]) * S + (u[T * 3 + 2] - u[_ * 3 + 2]) * R) / z;
        (I > g && (g = I), I < E && (E = I));
      }
      ((p[b] = p[b + 1] = p[b + 2] = g), (d[b] = d[b + 1] = d[b + 2] = E));
    }
    for (let b = 0; b < c; b++)
      ((f[b * 3] = e[0]),
        (f[b * 3 + 1] = e[1]),
        (f[b * 3 + 2] = e[2]),
        (h[b * 4] = Math.min(1, u5(110, 520, p[b]) * m)),
        (h[b * 4 + 1] = Math.min(1, (t.aoFn ? Math.max(y, t.aoFn(r[b * 3], r[b * 3 + 1], r[b * 3 + 2])) : y) + 0.7 * u5(110, 520, -d[b]))),
        (h[b * 4 + 2] = x),
        (h[b * 4 + 3] = v));
    return (l.setAttribute("color", new nt(f, 3)), l.setAttribute("aSurf", new nt(h, 4)), l);
  }
  export var wE = new _0(),
    qz = new Je(),
    Xz = (n, e, t, i, s) => (s && (wE.set(s[0], s[1], s[2]), n.applyMatrix4(qz.makeRotationFromEuler(wE))), n.translate(e, t, -i), n);
  export function Mt(n, e, t, i, s, o, r, a, l = {}, c = null) {
    return Xz(vh(Ei(n, e, t, i), a, { keepN: !0, ...l }), s, o, r, c);
  }
  export function b0(n, e, t = 2) {
    let i = n.length,
      s = [];
    for (let o = 0; o < i; o++) {
      let r = n[o],
        a = n[(o + i - 1) % i],
        l = n[(o + 1) % i],
        c = typeof e == "number" ? e : e[o] || 0,
        u = a[0] - r[0],
        f = a[1] - r[1],
        h = l[0] - r[0],
        p = l[1] - r[1],
        d = Math.hypot(u, f),
        m = Math.hypot(h, p),
        x = d > 1e-9 && m > 1e-9 ? Math.acos(Math.max(-1, Math.min(1, (u * h + f * p) / (d * m)))) : Math.PI;
      if (c <= 0 || x > 3.05) {
        for (let z = 0; z <= t; z++) s.push([r[0], r[1]]);
        continue;
      }
      let v = c / Math.tan(x / 2),
        y = 0.45 * Math.min(d, m);
      v > y && ((v = y), (c = v * Math.tan(x / 2)));
      let b = u / d + h / m,
        g = f / d + p / m,
        E = Math.hypot(b, g),
        M = c / Math.sin(x / 2),
        _ = r[0] + (b / E) * M,
        T = r[1] + (g / E) * M,
        w = Math.atan2(r[1] + (f / d) * v - T, r[0] + (u / d) * v - _),
        R = Math.atan2(r[1] + (p / m) * v - T, r[0] + (h / m) * v - _) - w;
      for (; R > Math.PI;) R -= 2 * Math.PI;
      for (; R < -Math.PI;) R += 2 * Math.PI;
      for (let z = 0; z <= t; z++) {
        let I = w + (R * z) / t;
        s.push([_ + Math.cos(I) * c, T + Math.sin(I) * c]);
      }
    }
    return s;
  }
  export var EE = (n) =>
    n.filter((e, t) => {
      let i = n[(t + n.length - 1) % n.length];
      return Math.hypot(e[0] - i[0], e[1] - i[1]) > 1e-7;
    });
  export function Yz(n, e) {
    let t = new Qi();
    if ((EE(n).forEach((i, s) => (s ? t.lineTo(i[0], i[1]) : t.moveTo(i[0], i[1]))), t.closePath(), e))
      for (let i of e) t.holes.push(new xr(EE(i).map((s) => new We(s[0], s[1]))));
    return t;
  }
  export function SE(n, e, t, i, s) {
    return new vr(Yz(n, i), {
      depth: Math.max(1e-4, e - 2 * t),
      bevelEnabled: t > 0,
      bevelThickness: t,
      bevelSize: t,
      bevelOffset: -t,
      bevelSegments: s || 1,
      steps: 1,
      curveSegments: 6,
    });
  }
  export function Q0(n, e, t, i, s, o = {}) {
    let r = vh(SE(n, t - e, i, o.holes, o.bs), s, o);
    return (r.translate(0, 0, e + i), r.rotateY(Math.PI / 2), r);
  }
  export function Nn(n, e, t, i, s, o = {}) {
    let r = vh(SE(n, t - e, i, o.holes, o.bs), s, o);
    return (r.translate(0, 0, -t + i), r);
  }
  export function h0(n, e, t, i = {}) {
    let s = [],
      o = [],
      r = [],
      a = [],
      l = 0;
    for (let d = 0; d < n.length - 1; d++) {
      let m = n[d + 1][0] - n[d][0],
        x = n[d + 1][1] - n[d][1],
        v = Math.hypot(m, x);
      s.push(v < 1e-8 ? null : { nr: x / v, nf: -m / v, len: v });
    }
    let c = Math.cos(((i.crease || 50) * Math.PI) / 180),
      u = i.ox || 0,
      f = i.oy || 0,
      h = (d, m) => {
        let x = s[d],
          v = m >= 0 && m < s.length ? s[m] : null,
          y = x.nr * x.len,
          b = x.nf * x.len;
        v && x.nr * v.nr + x.nf * v.nf >= c && ((y += v.nr * v.len), (b += v.nf * v.len));
        let g = Math.hypot(y, b);
        return [y / g, b / g];
      };
    for (let d = 0; d < s.length; d++) {
      if (!s[d]) continue;
      let m = d - 1,
        x = d + 1;
      for (; m >= 0 && !s[m];) m--;
      for (; x < s.length && !s[x];) x++;
      let v = h(d, m),
        y = h(d, x),
        [b, g] = n[d],
        [E, M] = n[d + 1];
      for (let _ = 0; _ <= e; _++) {
        let T = (_ / e) * Math.PI * 2,
          w = Math.cos(T),
          S = Math.sin(T);
        (o.push(u + b * w, f + b * S, -g, u + E * w, f + E * S, -M), r.push(v[0] * w, v[0] * S, -v[1], y[0] * w, y[0] * S, -y[1]));
      }
      for (let _ = 0; _ < e; _++) {
        let T = l + _ * 2,
          w = T + 2,
          S = T + 1,
          R = T + 3;
        a.push(T, S, w, w, S, R);
      }
      l += (e + 1) * 2;
    }
    let p = new pt();
    return (p.setAttribute("position", new et(o, 3)), p.setAttribute("normal", new et(r, 3)), p.setIndex(a), vh(p, t, { keepN: !0, ...i }));
  }
  export function m0(n, e, t, i, s, o, r = 12, a = {}) {
    let l = Math.min(n * 0.25, e * 0.25),
      c = e / 2,
      u = h0(
        [
          [0, -c],
          [n - l, -c],
          [n, -c + l],
          [n, c - l],
          [n - l, c],
          [0, c],
        ],
        r,
        o,
        a,
      );
    return (u.rotateY(Math.PI / 2), u.translate(t, i, -s), u);
  }
  export function Eu(n, e, t = {}) {
    let i = n[0].length,
      s = [],
      o = n.length,
      r = t.caps || [!0, !0],
      a = (f) => {
        let h = 0,
          p = 0,
          d = 0;
        for (let m of f) ((h += m[0]), (p += m[1]), (d += m[2]));
        return [h / i, p / i, d / i];
      },
      l = 0,
      c = n.map(a);
    for (let f = 0; f < o - 1; f++)
      for (let h = 0; h < i; h++) {
        let p = n[f][h],
          d = n[f][(h + 1) % i],
          m = n[f + 1][h],
          x = d[0] - p[0],
          v = d[1] - p[1],
          y = d[2] - p[2],
          b = m[0] - p[0],
          g = m[1] - p[1],
          E = m[2] - p[2];
        l += (v * E - y * g) * (p[0] - c[f][0]) + (y * b - x * E) * (p[1] - c[f][1]) + (x * g - v * b) * (p[2] - c[f][2]);
      }
    for (let f = 0; f < o - 1; f++)
      for (let h = 0; h < i; h++) {
        let p = n[f][h],
          d = n[f][(h + 1) % i],
          m = n[f + 1][(h + 1) % i],
          x = n[f + 1][h];
        l >= 0 ? s.push(...p, ...d, ...m, ...p, ...m, ...x) : s.push(...p, ...m, ...d, ...p, ...x, ...m);
      }
    for (let f of [0, 1]) {
      if (!r[f]) continue;
      let h = n[f ? o - 1 : 0],
        p = c[f ? o - 1 : 0],
        d = c[f ? o - 2 : 1],
        m = [p[0] - d[0], p[1] - d[1], p[2] - d[2]],
        x = Math.abs(m[0]),
        v = Math.abs(m[1]),
        y = Math.abs(m[2]),
        b = x > v && x > y ? 1 : 0,
        g = (v > x && v > y) || b === 1 ? 2 : 1,
        E = [],
        M = [];
      h.forEach((_, T) => {
        let w = h[(T + i - 1) % i];
        Math.hypot(_[0] - w[0], _[1] - w[1], _[2] - w[2]) > 1e-7 && (E.push(T), M.push(new We(_[b], _[g])));
      });
      for (let _ of As.triangulateShape(M, [])) {
        let T = h[E[_[0]]],
          w = h[E[_[1]]],
          S = h[E[_[2]]],
          R = w[0] - T[0],
          z = w[1] - T[1],
          I = w[2] - T[2],
          L = S[0] - T[0],
          U = S[1] - T[1],
          k = S[2] - T[2];
        (z * k - I * U) * m[0] + (I * L - R * k) * m[1] + (R * U - z * L) * m[2] >= 0 ? s.push(...T, ...w, ...S) : s.push(...T, ...S, ...w);
      }
    }
    let u = new pt();
    return (u.setAttribute("position", new et(s, 3)), vh(u, e, t));
  }
  export function $a(n, e, t, i, s, o = 3) {
    let r = [],
      a = (l, c, u, f) => {
        for (let h = 0; h <= o; h++) {
          let p = f + ((h / o) * Math.PI) / 2;
          r.push([l + Math.cos(p) * u, c + Math.sin(p) * u]);
        }
      };
    return (a(-n + s, e + s, s, Math.PI), a(n - s, e + s, s, Math.PI * 1.5), a(n - i, t - i, i, 0), a(-n + i, t - i, i, Math.PI / 2), r);
  }
  export var kn = (n, e, t = {}) =>
    n.map((i) => [
      i[0] * (t.sx || 1) + (t.dx || 0),
      (i[1] - (t.cy || 0)) * (t.sy || 1) + (t.cy || 0) + (t.dy || 0),
      -e + (t.rake || 0) * i[1],
    ]);
  export function c5(n, e, t, i, s = 4) {
    let o = [],
      r = i / 2,
      a = t / 2 - r;
    for (let l = 0; l <= s; l++) {
      let c = -Math.PI / 2 + (l / s) * Math.PI;
      o.push([n + a + Math.cos(c) * r, e + Math.sin(c) * r]);
    }
    for (let l = 0; l <= s; l++) {
      let c = Math.PI / 2 + (l / s) * Math.PI;
      o.push([n - a + Math.cos(c) * r, e + Math.sin(c) * r]);
    }
    return o;
  }
  export var Su = (n, e, t, i, s, o = 2) =>
      b0(
        [
          [n, e],
          [t, e],
          [t, i],
          [n, i],
        ],
        s,
        o,
      ),
    $z = (n, e, t, i = 10) => {
      let s = [];
      for (let o = 0; o < i; o++) {
        let r = (o / i) * Math.PI * 2;
        s.push([n + Math.cos(r) * t, e + Math.sin(r) * t]);
      }
      return s;
    };
  export function Fs(n) {
    let e = n.filter(Boolean);
    if (!e.length) return new pt();
    for (let t of e) for (let i of Object.keys(t.attributes)) ["position", "normal", "color", "aSurf"].includes(i) || t.deleteAttribute(i);
    return Tr(e, !1);
  }
  export function sy(n, e = null, t = 0.002) {
    let i = [1e9, 1e9, 1e9],
      s = [-1e9, -1e9, -1e9],
      o = [];
    for (let E of n) {
      let M = E.g.attributes.position.array,
        _ = E.g.attributes.normal.array,
        T = new Float32Array(M.length),
        w = new Float32Array(M.length),
        S = Math.cos(E.rx || 0),
        R = Math.sin(E.rx || 0),
        z = E.off || [0, 0, 0];
      for (let I = 0; I < M.length; I += 3) {
        ((T[I] = M[I] + z[0]),
          (T[I + 1] = M[I + 1] * S - M[I + 2] * R + z[1]),
          (T[I + 2] = M[I + 1] * R + M[I + 2] * S + z[2]),
          (w[I] = _[I]),
          (w[I + 1] = _[I + 1] * S - _[I + 2] * R),
          (w[I + 2] = _[I + 1] * R + _[I + 2] * S));
        for (let L = 0; L < 3; L++) (T[I + L] < i[L] && (i[L] = T[I + L]), T[I + L] > s[L] && (s[L] = T[I + L]));
      }
      o.push({ w: T, wn: w });
    }
    let r = 8,
      a = Math.ceil((s[0] - i[0]) / t) + 2 * r,
      l = Math.ceil((s[1] - i[1]) / t) + 2 * r,
      c = Math.ceil((s[2] - i[2]) / t) + 2 * r,
      u = new Uint8Array(a * l * c),
      f = i[0] - r * t,
      h = i[1] - r * t,
      p = i[2] - r * t,
      d = 1 / t,
      m = t * 0.9;
    for (let { w: E } of o)
      for (let M = 0; M < E.length; M += 9) {
        let _ = E[M],
          T = E[M + 1],
          w = E[M + 2],
          S = E[M + 3] - _,
          R = E[M + 4] - T,
          z = E[M + 5] - w,
          I = E[M + 6] - _,
          L = E[M + 7] - T,
          U = E[M + 8] - w,
          k = Math.max(1, Math.ceil(Math.hypot(S, R, z) / m)),
          C = Math.max(1, Math.ceil(Math.hypot(I, L, U) / m));
        for (let A = 0; A <= k; A++) {
          let F = A / k,
            H = Math.max(1, Math.ceil(C * (1 - F)));
          for (let N = 0; N <= H; N++) {
            let Z = (N / H) * (1 - F);
            u[((((w + z * F + U * Z - p) * d) | 0) * l + (((T + R * F + L * Z - h) * d) | 0)) * a + (((_ + S * F + I * Z - f) * d) | 0)] =
              1;
          }
        }
      }
    let x = (E, M, _) => u[((((_ - p) * d) | 0) * l + (((M - h) * d) | 0)) * a + (((E - f) * d) | 0)],
      v = [0.0032, 0.007],
      y = [1, 0.6],
      b = [1, -0.5, -0.5],
      g = [0, 0.866, -0.866];
    n.forEach((E, M) => {
      let { w: _, wn: T } = o[M],
        w = E.g.attributes.aSurf.array;
      for (let S = 0; S < _.length; S += 9) {
        let R = Math.max(
            Math.hypot(_[S + 3] - _[S], _[S + 4] - _[S + 1], _[S + 5] - _[S + 2]),
            Math.hypot(_[S + 6] - _[S + 3], _[S + 7] - _[S + 4], _[S + 8] - _[S + 5]),
            Math.hypot(_[S] - _[S + 6], _[S + 1] - _[S + 7], _[S + 2] - _[S + 8]),
          ),
          z = 1 - u5(0.012, 0.045, R);
        for (let I = 0; I < 3; I++) {
          let L = S + I * 3,
            U = L / 3,
            k = _[L],
            C = _[L + 1],
            A = _[L + 2],
            F = T[L],
            H = T[L + 1],
            N = T[L + 2];
          if (e) {
            let ue = e(k, C, A, E.key);
            ue > w[U * 4 + 3] && (w[U * 4 + 3] = ue);
          }
          if (z <= 0) continue;
          let Z, Q, W;
          Math.abs(F) < 0.8 ? ((Z = 0), (Q = -N), (W = H)) : ((Z = N), (Q = 0), (W = -F));
          let J = Math.hypot(Z, Q, W) || 1;
          ((Z /= J), (Q /= J), (W /= J));
          let G = H * W - N * Q,
            te = N * Z - F * W,
            oe = F * Q - H * Z,
            ee = 0,
            le = 0,
            xe = k + F * t * 1.3,
            j = C + H * t * 1.3,
            O = A + N * t * 1.3;
          for (let ue = 0; ue < 4; ue++) {
            let de = F,
              $ = H,
              se = N;
            if (ue) {
              let fe = b[ue - 1] * 0.78,
                me = g[ue - 1] * 0.78;
              ((de = F * 0.62 + Z * fe + G * me), ($ = H * 0.62 + Q * fe + te * me), (se = N * 0.62 + W * fe + oe * me));
            }
            ((le += 1.6),
              x(xe + de * v[0], j + $ * v[0], O + se * v[0]) ? (ee += 1.6) : x(xe + de * v[1], j + $ * v[1], O + se * v[1]) && (ee += 0.6));
          }
          let q = Math.min(1, (ee / le) * 1.4) * z;
          q > w[U * 4 + 1] && (w[U * 4 + 1] = Math.min(1, q + w[U * 4 + 1] * 0.4));
        }
      }
    });
  }
  export var Zl = (n, e, t, i, s, o, r, a, l, c = 0.012) => {
      let u = Math.max(i - n, 0, n - s),
        f = Math.max(o - e, 0, e - r),
        h = Math.max(a + t, 0, -t - l);
      return 1 - u5(0, c, Math.hypot(u, f, h));
    },
    wn = {
      name: "PAC-9 Gold",
      muzzle: [0, 0, -0.531],
      eject: [0.023, 0.004, -0.028],
      sightY: 0.069,
      lensF: 0.0285,
      window: [
        [-0.016, 0.057],
        [0.016, 0.057],
        [0.016, 0.0772],
        [0.0122, 0.081],
        [-0.0122, 0.081],
        [-0.016, 0.0772],
      ],
      magPos: [0, -0.02, -0.0665],
      boltTravel: 0.062,
      railTop: 0.0435,
      grip: [0, -0.1, 0.073],
      handguard: [0, 0, -0.255],
      handguardR: 0.021,
      handlePos: [-0.026, 0.007, -0.078],
      squeeze: 0.86,
    };
  export function TE() {
    let n = [1, 1, 1],
      e = [1.16, 1.05, 0.98],
      t = [0.86, 0.93, 1.04],
      i = [0.8, 0.8, 0.84],
      s = [0.94, 0.92, 0.88],
      o = [1.25, 1.2, 1.15],
      r = [1, 1, 1],
      a = [2.6, 2.6, 2.7],
      l = [11, 11, 11.4],
      c = [0.3, 0.3, 0.31],
      u = [1, 1, 1],
      f = [0.03, 0.03, 0.031],
      h = [0.016, 0.016, 0.017],
      p = { wear: 0.8 },
      d = { wear: 1, zone: 0.5 },
      m = { wear: 0.5, ao: 0.28 },
      x = { wear: 0.55 },
      v = { wear: 0.9 },
      y = { bare: 0.45, wear: 1.2 },
      b = { wear: 0.8 },
      g = { wear: 0, ao: 0.75 },
      E = { wear: 0 },
      M = [],
      _ = [],
      T = [],
      w = [],
      S = [],
      R = [],
      z = [],
      I = 0.0176,
      L = 0.0163,
      U = 0.0012,
      k = (V, ne, ye, Te, Re = 0.0022) => Su(V, ne, ye, Te, Re, 2),
      C = (V, ne, ye, Te, Re, Ue, Ve, ze) => {
        let Ge = Math.min(V * 0.25, (ye - ne) * 0.25);
        return h0(
          [
            [0, ne],
            [V - Ge, ne],
            [V, ne + Ge],
            [V, ye - Ge],
            [V - Ge, ye],
            [0, ye],
          ],
          Ve,
          Ue,
          { ...ze, ox: Te, oy: Re },
        );
      },
      A = (V, ne, ye, Te, Re, Ue, Ve, ze) => {
        let Ge = C(V, -ne / 2, ne / 2, 0, 0, Ue, Ve, ze);
        return (Ge.rotateX(Math.PI / 2), Ge.translate(ye, Te, -Re), Ge);
      },
      F = b0(
        [
          [-0.1, -0.02],
          [0.1, -0.02],
          [0.1, 0.0245],
          [-0.1, 0.0245],
        ],
        8e-4,
        1,
      ),
      H = c5(0.032, 0.007, 0.112, 0.0075, 4),
      N = Su(-0.012, -0.01, 0.06, 0.012, 0.003, 2);
    (M.push(Q0(F, 0, I - U + 1e-4, 5e-4, n, { ...m, holes: [N] })),
      M.push(Q0(F, -(I - U + 1e-4), 0, 5e-4, n, { ...m, holes: [H] })),
      M.push(Q0(F, -I, -(I - U), 45e-5, n, { ...x, holes: [H, k(-0.094, -0.015, -0.033, 0.017), k(-0.0225, -0.0155, 0.093, -8e-4)] })),
      M.push(Q0(F, I - U, I, 45e-5, n, { ...x, holes: [N, k(0.0675, -0.015, 0.094, 0.017), k(-0.094, -0.0155, -0.04, -0.004)] })));
    {
      let V = I + 4e-4,
        ne = (ye, Te, Re) =>
          b0(
            [
              [-V, 0.0226],
              [V, 0.0226],
              [V, Re],
              [Te, ye],
              [-Te, ye],
              [-V, Re],
            ],
            7e-4,
            1,
          );
      M.push(
        Eu(
          [
            kn(ne(0.0252, 0.015, 0.024), -0.1004),
            kn(ne(0.0335, 0.011, 0.0262), -0.0885),
            kn(ne(0.0335, 0.011, 0.0262), 0.0935),
            kn(ne(0.0276, 0.0142, 0.025), 0.1004),
          ],
          n,
          p,
        ),
      );
    }
    (_.push(Mt(0.0034, 0.036, 0.19, 4e-4, -0.0116, 0.006, 0, c, g)),
      _.push(Mt(0.0034, 0.012, 0.19, 4e-4, 0.0125, 0.022, 0, c, g)),
      _.push(Mt(0.0034, 0.008, 0.19, 4e-4, 0.0125, -0.014, 0, c, g)),
      _.push(Mt(0.02, 0.001, 0.196, 2e-4, 0, -0.0203, 0, c, g)),
      _.push(
        h0(
          [
            [0, 0.058],
            [0.0118, 0.058],
            [0.0118, 0.099],
            [0, 0.099],
          ],
          16,
          [0.8, 0.8, 0.82],
          E,
        ),
      ),
      M.push(
        Q0(
          b0(
            [
              [-0.04, -0.008],
              [-0.0165, -0.011],
              [-0.0145, 0.013],
              [-0.034, 0.016],
            ],
            0.002,
            2,
          ),
          I - 0.001,
          I + 0.0052,
          0.0022,
          n,
          { ...d, bs: 2 },
        ),
      ),
      M.push(
        h0(
          [
            [0, -0.086],
            [0.0058, -0.086],
            [0.0066, -0.0845],
            [0.0066, -0.06],
            [0.004, -0.0565],
            [0, -0.0565],
          ],
          14,
          n,
          { ...p, ox: 0.0182, oy: 0.012 },
        ),
      ),
      _.push(
        h0(
          [
            [0, -0.0945],
            [0.004, -0.0945],
            [0.0048, -0.0935],
            [0.0048, -0.0905],
            [0.0042, -0.09],
            [0.0042, -0.0885],
            [0.0048, -0.088],
            [0.0048, -0.086],
            [0, -0.086],
          ],
          12,
          r,
          { ...v, ox: 0.0182, oy: 0.012 },
        ),
      ),
      _.push(Mt(0.0016, 0.02, 0.07, 5e-4, I + 0.0042, -0.0212, 0.024, r, v, [0, 0, 0.3])),
      _.push(Mt(0.0012, 0.013, 0.056, 4e-4, I + 0.0056, -0.0208, 0.024, r, v, [0, 0, 0.3])),
      _.push(C(0.0015, -0.014, 0.062, I + 0.0012, -0.0116, a, 8, y)));
    for (let V of [-0.0115, 0.0245, 0.0595]) _.push(C(0.0023, V - 0.0035, V + 0.0035, I + 0.0012, -0.0116, r, 8, v));
    _.push(m0(0.0016, 0.0016, I + 0.0068, -0.0285, 0.024, a, 8, y));
    for (let V of [-0.06, -0.072]) _.push(m0(0.0019, 8e-4, -I + U - 2e-4, 0.011, V, c, 8, g));
    {
      let V = h0(
        [
          [0.0042, -0.0016],
          [0.0064, -0.0016],
          [0.0068, -0.0012],
          [0.0068, 6e-4],
          [0.0062, 0.0012],
          [0.0046, 0.0012],
          [0.0042, 4e-4],
        ],
        14,
        r,
        v,
      );
      (V.rotateY(-Math.PI / 2),
        V.translate(-(I - U) - 4e-4, 0.0035, 0.064),
        _.push(V),
        _.push(m0(0.0044, 6e-4, -(I - U) + 2e-4, 0.0035, -0.064, c, 10, g)));
    }
    let Z = [
      [-0.0078, 0.0333],
      [0.0078, 0.0333],
      [0.0106, 0.0402],
      [-0.0106, 0.0402],
    ];
    (M.push(Nn(Z, -0.096, 0.1003, 4e-4, n, { wear: 1, ao: 0.42 })), M.push(Nn(Z, 0.1008, 0.397, 4e-4, t, { wear: 1, ao: 0.42 })));
    let Q = b0(
      [
        [-0.0102, 0.0398],
        [0.0102, 0.0398],
        [0.0106, 0.0408],
        [0.008, 0.0435],
        [-0.008, 0.0435],
        [-0.0106, 0.0408],
      ],
      [0, 0, 3e-4, 5e-4, 5e-4, 3e-4],
      1,
    );
    {
      let V = Nn(Q, 0, 0.00478, 6e-4, n, { wear: 1, zone: 0.45 }),
        ne = Nn(Q, 0, 0.00478, 6e-4, t, { wear: 1, zone: 0.45 });
      for (let ye = 0; ye < 49; ye++) {
        let Te = -0.0945 + ye * 0.01001;
        M.push((Te < 0.1 ? V : ne).clone().translate(0, 0, -Te));
      }
    }
    let W = b0(
      [
        [-0.1, -0.0203],
        [0.099, -0.0203],
        [0.101, -0.03],
        [0.098, -0.088],
        [0.036, -0.082],
        [0.031, -0.058],
        [-0.03, -0.058],
        [-0.04, -0.066],
        [-0.078, -0.055],
        [-0.1, -0.044],
      ],
      [8e-4, 8e-4, 0.004, 0.003, 0.003, 0.004, 0.004, 0.004, 0.006, 0.003],
      2,
    );
    M.push(Q0(W, -(L - U + 1e-4), L - U + 1e-4, 5e-4, e, m));
    for (let V of [-1, 1]) {
      let ne = [k(0.0405, -0.077, 0.0945, -0.0265, 0.003), $z(-0.048, -0.036, 0.0074, 14)],
        ye = Q0(W, L - U, L, 45e-5, e, { ...x, holes: ne });
      (V < 0 && (ye.scale(-1, 1, 1), Zz(ye)), M.push(ye));
    }
    (M.push(Mt(0.0372, 0.0095, 0.0665, 0.0022, 0, -0.0838, 0.0668, e, { wear: 0.82, zone: 1 }, [-0.095, 0, 0])),
      M.push(Mt(0.0348, 0.05, 0.0044, 0.001, 0, -0.053, 0.099, e, p)));
    for (let V = 0; V < 7; V++) M.push(Mt(0.024, 0.003, 0.0016, 6e-4, 0, -0.0345 - V * 0.006, 0.1012 - V * 3e-4, e, { wear: 1.4 }));
    M.push(Mt(0.0348, 0.038, 0.0044, 0.001, 0, -0.048, 0.0345, e, p));
    for (let [V, ne] of [
      [0.087, -0.029],
      [-0.086, -0.031],
    ])
      (_.push(m0(0.0036, 0.0336, 0, ne, V, a, 12, y)),
        _.push(m0(0.005, 0.0016, L + 0.0012, ne, V, r, 14, v)),
        _.push(m0(0.0011, 0.001, -L - 8e-4, ne, V, c, 8, g)));
    (_.push(m0(0.0021, 0.0334, 0, -0.04, 0.012, a, 10, y)), _.push(m0(0.0021, 0.0334, 0, -0.032, 0.032, a, 10, y)));
    for (let V of [-1, 1])
      (_.push(m0(0.0062, 0.003, V * (L + 2e-4), -0.036, -0.048, r, 16, v)),
        _.push(Mt(0.0036, 0.0058, 0.022, 0.0014, V * (L + 0.0026), -0.036, -0.037, r, { wear: 1.2 }, [0.5, 0, 0])),
        _.push(m0(0.0016, 0.001, V * (L + 0.002), -0.036, -0.048, a, 8, y)));
    _.push(
      Q0(
        b0(
          [
            [0.0155, -0.019],
            [0.0285, -0.019],
            [0.029, -0.033],
            [0.025, -0.0415],
            [0.019, -0.0415],
            [0.015, -0.033],
          ],
          0.0015,
          1,
        ),
        -L - 0.0032,
        -L + 2e-4,
        9e-4,
        r,
        v,
      ),
    );
    for (let V = 0; V < 4; V++) _.push(Mt(0.0012, 0.0016, 0.0105, 5e-4, -L - 0.0036, -0.0215 - V * 0.0036, 0.022, r, { wear: 1.3 }));
    (_.push(m0(0.0015, 0.034, 0, -0.0375, 0.022, a, 8, y)), _.push(m0(0.0054, 0.0044, L + 0.0014, -0.042, 0.016, r, 14, { wear: 1.2 })));
    for (let V = 0; V < 3; V++)
      _.push(Mt(6e-4, 0.0076 - Math.abs(V - 1) * 0.0018, 0.001, 2e-4, L + 0.0037, -0.042, 0.0138 + V * 0.0022, r, E));
    (M.push(
      Q0(
        b0(
          [
            [0.004, -0.0325],
            [0.029, -0.0335],
            [0.029, -0.053],
            [0.004, -0.053],
            [0.004, -0.05],
            [0.0245, -0.05],
            [0.0245, -0.0365],
            [0.004, -0.036],
          ],
          8e-4,
          1,
        ),
        L - 4e-4,
        L + 0.003,
        0.001,
        e,
        p,
      ),
    ),
      M.push(
        Q0(
          b0(
            [
              [0.033, -0.056],
              [0.033, -0.093],
              [0.024, -0.1005],
              [-0.031, -0.1005],
              [-0.041, -0.09],
              [-0.041, -0.06],
            ],
            0.003,
            2,
          ),
          -0.007,
          0.007,
          0.0014,
          e,
          {
            ...p,
            bs: 2,
            holes: [
              b0(
                [
                  [0.029, -0.059],
                  [0.029, -0.0915],
                  [0.0225, -0.0968],
                  [-0.0295, -0.0968],
                  [-0.0372, -0.0885],
                  [-0.0372, -0.061],
                ],
                0.004,
                3,
              ),
            ],
          },
        ),
      ),
      _.push(
        Q0(
          b0(
            [
              [-0.006, -0.057],
              [0.004, -0.057],
              [0.003, -0.069],
              [0.0065, -0.079],
              [0.01, -0.086],
              [0.0065, -0.088],
              [0.001, -0.081],
              [-0.004, -0.07],
            ],
            [0, 0, 0.004, 0.006, 8e-4, 8e-4, 0.006, 0.004],
            2,
          ),
          -0.0031,
          0.0031,
          0.0011,
          r,
          { wear: 0.6, bs: 2 },
        ),
      ));
    let J = b0(
      [
        [-0.038, -0.05],
        [-0.045, -0.074],
        [-0.049, -0.086],
        [-0.049, -0.1],
        [-0.054, -0.112],
        [-0.057, -0.13],
        [-0.064, -0.158],
        [-0.11, -0.152],
        [-0.102, -0.112],
        [-0.096, -0.082],
        [-0.095, -0.064],
        [-0.103, -0.046],
        [-0.08, -0.044],
      ],
      [0.002, 0.006, 0.004, 0.004, 0.006, 0.008, 0.003, 0.004, 0.02, 0.02, 0.006, 0.003, 0.004],
      2,
    );
    T.push(Q0(J, -0.0142, 0.0142, 0.005, u, { ...b, bs: 3 }));
    {
      let V = b0(
        [
          [-0.0565, -0.085],
          [-0.061, -0.109],
          [-0.068, -0.149],
          [-0.101, -0.145],
          [-0.095, -0.112],
          [-0.09, -0.085],
        ],
        0.004,
        2,
      );
      for (let ne of [-1, 1]) T.push(Q0(V, ne > 0 ? 0.0138 : -0.0146, ne > 0 ? 0.0146 : -0.0138, 4e-4, u, { wear: 0.8, zone: 1 }));
    }
    for (let V = 0; V < 7; V++) {
      let ne = -0.084 - V * 0.0098,
        ye = -0.0527 + (ne + 0.084) * 0.21;
      T.push(Mt(0.015, 0.0034, 0.003, 0.0012, 0, ne, ye, u, b, [-0.21, 0, 0]));
    }
    for (let V = 0; V < 7; V++) {
      let ne = -0.078 - V * 0.01,
        ye = -0.0962 + (ne + 0.078) * 0.16;
      T.push(Mt(0.016, 0.004, 0.0034, 0.0014, 0, ne, ye, u, b, [-0.16, 0, 0]));
    }
    (T.push(Mt(0.03, 0.0056, 0.049, 0.002, 0, -0.1568, -0.087, u, b, [0.13, 0, 0])), _.push(m0(0.0028, 0.0296, 0, -0.15, -0.085, a, 8, y)));
    let G = wn.handguardR,
      te = 0.00885,
      oe = 0.0028,
      ee = 0.101,
      le = 0.398,
      xe = b0(
        [
          [ee, -te],
          [le, -te],
          [le, te],
          [ee, te],
        ],
        0.001,
        1,
      );
    for (let V = 0; V < 8; V++) {
      let ne = [];
      if (V === 0 || V === 4 || V === 6) for (let Re = 0; Re < 7; Re++) ne.push(c5(0.13 + Re * 0.04, 0, 0.032, 0.007, 4));
      else if (V !== 2)
        for (let Re = 0; Re < 10; Re++) {
          let Ue = 0.124 + Re * 0.027;
          (V === 3 && Ue > 0.3) || ne.push(c5(Ue, 0, 0.013, 0.0052, 3));
        }
      let ye = Q0(xe, G - oe, G, 8e-4, t, { ...p, holes: ne });
      (ye.rotateZ((V * Math.PI) / 4), M.push(ye));
      let Te = ((V + 0.5) * Math.PI) / 4;
      M.push(C(0.003, ee, le, Math.cos(Te) * 0.0197, Math.sin(Te) * 0.0197, t, 8, { wear: 1.2 }));
    }
    (M.push(
      Nn(
        b0(
          [
            [-0.0088, 0.02],
            [0.0088, 0.02],
            [0.0106, 0.029],
            [0.0082, 0.0336],
            [-0.0082, 0.0336],
            [-0.0106, 0.029],
          ],
          8e-4,
          1,
        ),
        0.1012,
        0.3978,
        0.001,
        t,
        p,
      ),
    ),
      M.push(
        h0(
          [
            [0.016, 0.096],
            [0.0236, 0.096],
            [0.0243, 0.0967],
            [0.0243, 0.101],
            [0.0236, 0.1016],
            [0.0236, 0.1062],
            [0.0228, 0.1075],
            [0.016, 0.1075],
          ],
          16,
          t,
          { wear: 1.3 },
        ),
      ));
    for (let V of [-1, 1]) {
      M.push(Mt(0.005, 0.015, 0.03, 0.0014, V * 0.0222, -0.003, 0.119, t, p));
      for (let ne of [0.112, 0.126])
        (_.push(m0(0.0027, 0.0016, V * 0.0252, -0.003, ne, a, 6, y)), _.push(m0(0.0012, 6e-4, V * 0.026, -0.003, ne, c, 6, g)));
      M.push(Mt(0.003, 0.006, 0.008, 0.001, V * 0.015, -0.019, 0.1, t, p));
    }
    M.push(
      h0(
        [
          [0.018, 0.3985],
          [0.0222, 0.3985],
          [0.0226, 0.399],
          [0.0226, 0.4004],
          [0.022, 0.4012],
          [0.018, 0.4012],
          [0.018, 0.3985],
        ],
        8,
        t,
        { wear: 1.4 },
      ),
    );
    for (let V of [0.115, 0.215, 0.3, 0.385])
      for (let ne of [-1, 1])
        (_.push(A(0.0019, 0.0012, ne * 0.0098, 0.0314, V, a, 6, y)), _.push(A(9e-4, 4e-4, ne * 0.0098, 0.0321, V, c, 6, g)));
    {
      let V = Q.map((Re) => [Re[0], Re[1] - 0.016]),
        ne = Z.map((Re) => [Re[0], Re[1] - 0.0128]),
        ye = [Nn(ne, 0.318, 0.396, 4e-4, t, p)];
      for (let Re = 0; Re < 8; Re++) {
        let Ue = 0.319 + Re * 0.01001;
        ye.push(Nn(V, Ue, Ue + 0.00478, 6e-4, t, { wear: 1.3 }));
      }
      for (let Re of ye) (Re.rotateZ(Math.PI / 4), M.push(Re));
      let Te = [Nn(ne, 0.35, 0.392, 4e-4, t, p)];
      for (let Re = 0; Re < 4; Re++) {
        let Ue = 0.352 + Re * 0.01001;
        Te.push(Nn(V, Ue, Ue + 0.00478, 6e-4, t, { wear: 1.3 }));
      }
      for (let Re of Te) (Re.rotateZ(Math.PI), M.push(Re));
    }
    (T.push(
      Q0(
        b0(
          [
            [0.35, -0.026],
            [0.392, -0.026],
            [0.388, -0.036],
            [0.372, -0.05],
            [0.362, -0.05],
            [0.354, -0.036],
          ],
          0.003,
          2,
        ),
        -0.011,
        0.011,
        0.0032,
        u,
        { ...b, bs: 2, zone: 0.6 },
      ),
    ),
      T.push(
        Q0(
          b0(
            [
              [0.2395, -0.0215],
              [0.2725, -0.0215],
              [0.2725, -0.03],
              [0.27, -0.092],
              [0.2665, -0.0965],
              [0.2455, -0.0975],
              [0.242, -0.093],
              [0.2395, -0.03],
            ],
            0.0025,
            2,
          ),
          -0.014,
          0.014,
          0.0045,
          u,
          { ...b, bs: 3, zone: 0.7 },
        ),
      ));
    for (let V = 0; V < 6; V++) T.push(Mt(0.0288, 0.0024, 0.0312, 0.001, 0, -0.04 - V * 0.0085, 0.256 - V * 3e-4, u, b));
    (T.push(Mt(0.03, 0.005, 0.04, 0.0016, 0, -0.024, 0.256, u, b)),
      _.push(m0(0.003, 0.031, 0, -0.025, 0.256, a, 8, y)),
      _.push(
        h0(
          [
            [0.0115, 0.095],
            [0.0115, 0.15],
            [0.0095, 0.153],
            [0.0095, 0.285],
            [0.009, 0.288],
            [0.009, 0.322],
            [0.0086, 0.326],
            [0.0086, 0.435],
            [0.0092, 0.437],
            [0.0092, 0.453],
            [0.0075, 0.455],
            [0.0075, 0.461],
          ],
          20,
          r,
          v,
        ),
      ),
      _.push(
        h0(
          [
            [0.0092, 0.286],
            [0.0135, 0.286],
            [0.0142, 0.2875],
            [0.0142, 0.3165],
            [0.0135, 0.318],
            [0.0092, 0.318],
          ],
          16,
          r,
          v,
        ),
      ),
      _.push(Mt(0.014, 0.009, 0.03, 0.002, 0, 0.0145, 0.302, r, v)),
      _.push(C(0.0026, 0.1, 0.3, 0, 0.0172, l, 8, { bare: 0.8, wear: 0.4 })),
      _.push(m0(0.002, 0.0145, 0, 0.012, 0.308, a, 6, y)));
    for (let V of [0.2925, 0.3115]) _.push(A(0.0017, 0.001, 0, -0.0143, V, c, 6, g));
    (_.push(
      h0(
        [
          [0.0075, 0.459],
          [0.0104, 0.459],
          [0.0112, 0.4598],
          [0.0112, 0.4628],
          [0.0104, 0.4636],
          [0.0104, 0.4644],
          [0.011, 0.465],
          [0.0116, 0.4656],
          [0.0116, 0.477],
          [0.011, 0.478],
          [0.0052, 0.478],
        ],
        20,
        r,
        { wear: 1.1, zone: 0.6 },
      ),
    ),
      _.push(
        h0(
          [
            [0.0052, 0.477],
            [0.0052, 0.517],
          ],
          12,
          c,
          g,
        ),
      ));
    for (let V of [0.4865, 0.4965, 0.5065])
      _.push(
        h0(
          [
            [0.0052, V - 0.0019],
            [0.011, V - 0.0019],
            [0.0116, V - 0.0012],
            [0.0116, V + 0.0012],
            [0.011, V + 0.0019],
            [0.0052, V + 0.0019],
          ],
          20,
          r,
          { wear: 1.1, zone: 0.9 },
        ),
      );
    (_.push(
      h0(
        [
          [0.0052, 0.5145],
          [0.011, 0.5145],
          [0.0116, 0.5155],
          [0.0116, 0.527],
          [0.0102, 0.5305],
          [0.0062, 0.5305],
          [0.0048, 0.5285],
        ],
        20,
        r,
        { wear: 1.1, zone: 0.9 },
      ),
    ),
      _.push(
        h0(
          [
            [0.0048, 0.5285],
            [0.0036, 0.526],
            [0.0036, 0.495],
          ],
          14,
          c,
          g,
        ),
      ));
    for (let V of [-1, 1]) _.push(Mt(0.0125, 0.0042, 0.042, 0.0012, 0, V * 0.0096, 0.496, r, { wear: 1.1, zone: 0.9 }));
    for (let V = 0; V < 3; V++) _.push(m0(0.0016, 0.0236, 0, 0, 0.4675 + V * 0.0035, c, 6, g));
    M.push(
      h0(
        [
          [0, -0.292],
          [0.0138, -0.292],
          [0.0146, -0.291],
          [0.0146, -0.1],
        ],
        20,
        o,
        p,
      ),
    );
    {
      let V = [[0.0146, -0.122]];
      for (let ne = 0; ne < 1; ne++) V.push([0.0183, -0.122], [0.019, -0.1212], [0.019, -0.112], [0.0183, -0.111], [0.0146, -0.111]);
      _.push(h0(V, 12, r, { wear: 1.4, crease: 20 }));
      for (let ne = 0; ne < 6; ne++) {
        let ye = (ne * Math.PI) / 3 + 0.3;
        _.push(Mt(0.004, 0.0022, 0.005, 4e-4, Math.cos(ye) * 0.0186, Math.sin(ye) * 0.0186, -0.1192, c, g, [0, 0, ye + Math.PI / 2]));
      }
    }
    {
      let V = [
          [-0.0163, -0.024],
          [0.0163, -0.024],
          [0.018, -0.018],
          [0.018, 0.018],
          [0.0138, 0.024],
          [-0.0138, 0.024],
          [-0.018, 0.018],
          [-0.018, 0.006],
          [-0.031, 0.004],
          [-0.0344, -0.002],
          [-0.0344, -0.014],
          [-0.0292, -0.02],
          [-0.018, -0.02],
        ],
        ne = [
          [-0.0215, -0.014],
          [-0.0215, -0.002],
          [-0.0284, -5e-4],
          [-0.031, -0.004],
          [-0.031, -0.012],
          [-0.0275, -0.016],
        ];
      _.push(Nn(b0(V, 0.0015, 1), -0.1095, -0.1045, 8e-4, r, { ...v, holes: [b0(ne, 0.0012, 1)] }));
    }
    (z.push(Mt(0.003, 8e-4, 0.015, 3e-4, 0.0062, 0.0182, -0.115, [0.5, 0.36, 0.03], E, [0, 0, -0.33])),
      z.push(Mt(0.0022, 6e-4, 0.0022, 2e-4, 0, -0.0146, 0.2925, [0.42, 0.05, 0.03], E)));
    let j = 0.0163;
    T.push(
      Q0(
        b0(
          [
            [-0.146, 0.024],
            [-0.3, 0.024],
            [-0.331, 0.014],
            [-0.334, -0.086],
            [-0.318, -0.101],
            [-0.29, -0.096],
            [-0.232, -0.04],
            [-0.146, -0.024],
          ],
          [0.004, 0.02, 0.006, 0.006, 0.006, 0.02, 0.03, 0.006],
          3,
        ),
        -j,
        j,
        0.0042,
        u,
        {
          ...b,
          bs: 3,
          holes: [
            b0(
              [
                [-0.262, -0.036],
                [-0.306, -0.036],
                [-0.306, -0.074],
                [-0.292, -0.074],
              ],
              0.005,
              2,
            ),
            c5(0.004, -0.3185, 0.022, 0.0055, 3).map((V) => [V[1], V[0]]),
          ],
        },
      ),
    );
    for (let V of [-1, 1])
      (T.push(
        Q0(
          b0(
            [
              [-0.156, 0.017],
              [-0.25, 0.017],
              [-0.25, -0.022],
              [-0.228, -0.026],
              [-0.156, -0.016],
            ],
            0.004,
            2,
          ),
          V > 0 ? j - 3e-4 : -j - 6e-4,
          V > 0 ? j + 6e-4 : -j + 3e-4,
          5e-4,
          u,
          { wear: 0.8, zone: 0.55 },
        ),
      ),
        _.push(m0(0.0064, 0.002, V * (j + 2e-4), -0.06, -0.318, r, 14, { wear: 1.3 })),
        _.push(m0(0.0044, 0.001, V * (j + 0.001), -0.06, -0.318, c, 12, g)));
    T.push(
      Eu(
        [
          kn($a(0.012, 0.0215, 0.033, 0.005, 0.001, 3), -0.158, { sy: 0.25, cy: 0.0215 }),
          kn($a(0.0132, 0.0215, 0.0352, 0.0058, 0.001, 3), -0.166, { sy: 0.7, cy: 0.0215 }),
          kn($a(0.0138, 0.0215, 0.0372, 0.0062, 0.001, 3), -0.184),
          kn($a(0.0142, 0.0215, 0.038, 0.0064, 0.001, 3), -0.288),
          kn($a(0.0138, 0.0215, 0.0372, 0.0062, 0.001, 3), -0.298, { sy: 0.7, cy: 0.0215 }),
          kn($a(0.0128, 0.0215, 0.034, 0.005, 0.001, 3), -0.304, { sy: 0.25, cy: 0.0215 }),
        ],
        u,
        b,
      ),
    );
    for (let V of [-0.196, -0.268]) _.push(m0(0.0028, 0.029, 0, 0.0295, V, a, 8, y));
    (T.push(Mt(0.0105, 0.011, 0.04, 0.003, 0, -0.033, -0.19, u, b, [0.2, 0, 0])),
      _.push(m0(0.0022, 0.02, 0, -0.029, -0.174, a, 8, y)),
      z.push(Mt(0.0322, 0.12, 0.011, 0.0042, 0, -0.04, -0.3395, f, E)));
    for (let V = 0; V < 9; V++) z.push(Mt(0.027, 0.004, 0.003, 0.001, 0, 0.004 - V * 0.011, -0.3455, f, E));
    let O = wn.sightY,
      q = wn.window;
    (M.push(
      Nn(
        b0(
          [
            [-0.015, 0.0436],
            [0.015, 0.0436],
            [0.015, 0.05],
            [0.0176, 0.053],
            [-0.0176, 0.053],
            [-0.015, 0.05],
          ],
          8e-4,
          1,
        ),
        0.001,
        0.041,
        0.001,
        i,
        p,
      ),
    ),
      M.push(Mt(0.0044, 0.0086, 0.034, 0.001, -0.0164, 0.045, 0.021, i, p)));
    for (let V of [0.009, 0.033])
      (_.push(m0(0.004, 0.004, -0.0204, 0.045, V, r, 6, { wear: 1.3 })),
        _.push(m0(0.0019, 0.0012, -0.0228, 0.045, V, a, 8, y)),
        _.push(m0(0.003, 0.002, 0.016, 0.045, V, a, 10, y)));
    let ue = b0(
      [
        [-0.0192, 0.0525],
        [0.0192, 0.0525],
        [0.0192, 0.0788],
        [0.0138, 0.0842],
        [-0.0138, 0.0842],
        [-0.0192, 0.0788],
      ],
      [0.001, 0.001, 0.0022, 0.0022, 0.0022, 0.0022],
      2,
    );
    (M.push(Nn(ue, 0.008, 0.034, 0.0012, i, { ...p, bs: 2, holes: [q] })),
      M.push(Mt(0.042, 0.0052, 0.03, 0.0012, 0, 0.0546, 0.021, i, p)),
      z.push(
        Nn(
          q.map((V) => [V[0] * 1.004, (V[1] - O) * 1.004 + O]),
          0.0078,
          0.0342,
          0,
          h,
          { wear: 0, holes: [q.map((V) => [V[0] * 0.982, (V[1] - O) * 0.982 + O])] },
        ),
      ));
    let de = [
      [-0.0204, 0.06],
      [-0.0204, 0.0792],
      [-0.0143, 0.0854],
      [0.0143, 0.0854],
      [0.0204, 0.0792],
      [0.0204, 0.06],
      [0.0193, 0.06],
      [0.0193, 0.0788],
      [0.0138, 0.0843],
      [-0.0138, 0.0843],
      [-0.0193, 0.0788],
      [-0.0193, 0.06],
    ];
    M.push(Nn(de, 0.0285, 0.0385, 3e-4, i, { wear: 1.3 }));
    {
      let V = h0(
        [
          [0, -0.0058],
          [0.005, -0.0058],
          [0.0057, -0.0052],
          [0.0057, -0.003],
          [0.0052, -0.0026],
          [0.0052, -0.0018],
          [0.0057, -0.0014],
          [0.0057, 0.0034],
          [0.005, 0.0042],
          [0, 0.0042],
        ],
        16,
        r,
        { wear: 1.3 },
      );
      (V.rotateY(Math.PI / 2),
        V.translate(0.0222, 0.0625, -0.021),
        _.push(V),
        _.push(Mt(6e-4, 0.0012, 0.0074, 2e-4, 0.0281, 0.0625, 0.021, c, g)));
    }
    for (let V of [0.0165, 0.0245]) z.push(Mt(0.0022, 0.0055, 0.0055, 0.001, -0.0197, 0.064, V, f, E));
    for (let V of [0.012, 0.03]) for (let ne of [-1, 1]) _.push(m0(0.0016, 0.0012, ne * 0.0212, 0.0546, V, a, 6, y));
    z.push(Mt(0.009, 0.0026, 0.006, 6e-4, 0, 0.058, 0.0115, h, E));
    for (let V of [0.0128, -0.0128]) {
      let ne = h0(
        [
          [0, -6e-4],
          [0.0019, -6e-4],
          [0.0022, -2e-4],
          [0.0022, 7e-4],
          [0, 7e-4],
        ],
        10,
        a,
        { ...y, ox: V, oy: 0.0546 },
      );
      (ne.translate(0, 0, -0.006), _.push(ne));
    }
    (_.push(A(0.003, 0.0022, 0.009, 0.0846, 0.014, a, 12, y)),
      z.push(Mt(0.0044, 3e-4, 9e-4, 1e-4, 0.009, 0.0858, 0.014, h, E)),
      z.push(Mt(0.016, 5e-4, 0.01, 1e-4, -0.003, 0.08435, 0.025, [0.012, 0.016, 0.03], E)));
    {
      let V = h0(
        [
          [0, -0.0012],
          [0.0034, -0.0012],
          [0.004, -6e-4],
          [0.004, 0.0026],
          [0.0034, 0.0032],
          [0, 0.0032],
        ],
        12,
        r,
        { wear: 1.3 },
      );
      (V.rotateY(-Math.PI / 2),
        V.translate(0.0196, 0.0755, -0.0125),
        _.push(V),
        _.push(Mt(5e-4, 0.001, 0.0052, 2e-4, 0.0228, 0.0755, 0.0125, c, g)));
    }
    z.push(Nn(q, 0.0304, 0.0318, 0, h, { wear: 0, holes: [q.map((V) => [V[0] * 0.955, (V[1] - O) * 0.955 + O])] }));
    for (let [V, ne] of [
      [-0.03, 1],
      [0.372, -1],
    ]) {
      (_.push(
        Nn(
          b0(
            [
              [-0.0106, 0.0437],
              [0.0106, 0.0437],
              [0.0112, 0.0462],
              [0.009, 0.0508],
              [-0.009, 0.0508],
              [-0.0112, 0.0462],
            ],
            8e-4,
            1,
          ),
          V - 0.015,
          V + 0.015,
          8e-4,
          r,
          v,
        ),
      ),
        _.push(
          Q0(
            b0(
              [
                [V - ne * 0.0165, 0.0506],
                [V + ne * 0.0215, 0.0506],
                [V + ne * 0.0215, 0.053],
                [V + ne * 0.018, 0.0549],
                [V - ne * 0.01, 0.0549],
                [V - ne * 0.0165, 0.0532],
              ],
              8e-4,
              1,
            ),
            -0.006,
            0.006,
            9e-4,
            r,
            { wear: 1.1 },
          ),
        ));
      for (let ye of [-1, 1]) _.push(Mt(0.0022, 0.0034, 0.02, 8e-4, ye * 0.0071, 0.0524, V + ne * 0.009, r, v));
      (_.push(m0(0.0029, 0.0236, 0, 0.052, V - ne * 0.0125, r, 10, { wear: 1.2 })),
        _.push(Mt(0.004, 0.006, 0.006, 0.001, ne * 0.0128, 0.0472, V, r, v)),
        _.push(m0(0.004, 0.0044, -0.0128, 0.0472, V + 0.006, a, 6, y)),
        _.push(m0(0.0016, 0.0014, 0.0122, 0.0478, V - 0.007, a, 8, y)));
    }
    {
      let V = h0(
        [
          [0.0016, -0.0012],
          [0.0034, -0.0012],
          [0.0038, -8e-4],
          [0.0038, 8e-4],
          [0.0034, 0.0012],
          [0.0016, 0.0012],
          [0.0016, -0.0012],
        ],
        12,
        r,
        v,
      );
      (V.rotateX(Math.PI / 2), V.translate(0, 0.0553, 0.016), _.push(V));
    }
    _.push(m0(0.0048, 0.005, 0.015, 0.049, -0.036, r, 12, { wear: 1.4 }));
    for (let V = 0; V < 6; V++)
      _.push(Mt(0.0044, 0.001, 0.001, 3e-4, 0.015, 0.049 + Math.sin(V * 1.047) * 0.0046, -0.036 + Math.cos(V * 1.047) * 0.0046, r, v));
    (M.push(Mt(0.016, 0.005, 0.02, 0.0014, 0, 0.0352, -0.0975, n, p)), _.push(A(0.003, 0.0012, 0, 0.038, -0.0985, a, 6, y)));
    let $ = -0.0267,
      se = 0.0267;
    (M.push(
      h0(
        [
          [0, 0.308],
          [0.0095, 0.308],
          [0.0108, 0.3095],
          [0.0108, 0.322],
          [0.0118, 0.323],
          [0.0118, 0.378],
          [0.0128, 0.38],
          [0.0142, 0.382],
          [0.0142, 0.404],
          [0.0136, 0.406],
          [0.0142, 0.408],
          [0.0142, 0.412],
          [0.0128, 0.4135],
          [0.0118, 0.4135],
          [0.0112, 0.409],
        ],
        18,
        s,
        { wear: 1.2, ox: $, oy: se },
      ),
    ),
      z.push(
        h0(
          [
            [0.0112, 0.409],
            [0, 0.409],
          ],
          18,
          [0.1, 0.12, 0.14],
          { wear: 0, ox: $, oy: se },
        ),
      ));
    for (let V = 0; V < 5; V++)
      M.push(
        h0(
          [
            [0.0118, 0.33 + V * 0.008],
            [0.0124, 0.3305 + V * 0.008],
            [0.0124, 0.3335 + V * 0.008],
            [0.0118, 0.334 + V * 0.008],
          ],
          18,
          s,
          { wear: 1.4, ox: $, oy: se },
        ),
      );
    {
      let V = Mt(0.02, 0.008, 0.04, 0.0012, 0, 0.028, 0.352, s, p);
      (V.rotateZ(Math.PI / 4), M.push(V));
    }
    {
      let V = m0(0.004, 0.006, 0.0135, 0.028, 0.352, a, 6, y);
      (V.rotateZ(Math.PI / 4), _.push(V));
    }
    z.push(Mt(0.0185, 0.0065, 0.07, 0.0025, 0, 0.0468, 0.214, f, E));
    for (let V = 0; V < 6; V++) z.push(Mt(0.014, 0.0012, 0.004, 5e-4, 0, 0.0503, 0.192 + V * 0.009, f, E));
    z.push(
      vh(
        bn(
          [
            [$, se, -0.308],
            [$ - 0.001, se + 0.002, -0.296],
            [-0.0265, 0.0235, -0.284],
            [-0.0255, 0.0215, -0.272],
            [-0.0235, 0.027, -0.262],
            [-0.016, 0.04, -0.256],
            [-0.007, 0.0465, -0.252],
            [-0.002, 0.047, -0.247],
          ],
          0.0018,
          6,
        ),
        f,
        { keepN: !0, wear: 0 },
      ),
    );
    for (let V of [
      [-0.0262, 0.0228, 0.28],
      [-0.0242, 0.0255, 0.265],
    ]) {
      let ne = Mt(0.0065, 0.0026, 0.0035, 8e-4, 0, 0, 0, [0.04, 0.04, 0.04], E);
      (ne.rotateZ(Math.PI / 4), ne.translate(V[0], V[1], -V[2]), z.push(ne));
    }
    let fe = [9.5, 9.5, 9.9];
    w.push(
      h0(
        [
          [0, -0.058],
          [0.0108, -0.058],
          [0.0114, -0.057],
          [0.0114, -0.01],
          [0.0106, -0.008],
          [0.0106, -0.002],
          [0.0114, 0],
          [0.0114, 0.046],
          [0.0098, 0.048],
          [0.0098, 0.056],
          [0.0058, 0.056],
          [0.0058, 0.06],
          [0, 0.06],
        ],
        16,
        fe,
        { bare: 1, wear: 0.5, oy: 0.001 },
      ),
    );
    for (let V = 0; V < 6; V++)
      w.push(Mt(0.0014, 0.008, 0.0026, 5e-4, 0.0112, 0.001, 0.008 + V * 0.0062, [2.2, 2.2, 2.3], { bare: 0.6, wear: 0 }));
    w.push(Mt(0.01, 0.0054, 0.014, 0.0015, -0.0142, 0.007, 0.078, r, v));
    {
      let V = h0(
        [
          [0, -0.0078],
          [0.0042, -0.0078],
          [0.0056, -0.0066],
          [0.0056, -0.0046],
          [0.005, -0.004],
          [0.005, -0.0026],
          [0.0056, -0.002],
          [0.0056, 0],
          [0.005, 6e-4],
          [0.005, 0.002],
          [0.0056, 0.0026],
          [0.0056, 0.0062],
          [0.0046, 0.0078],
          [0, 0.0078],
        ],
        14,
        r,
        { wear: 1.5, zone: 1 },
      );
      (V.rotateY(Math.PI / 2), V.translate(-0.0267, 0.007, -0.078), w.push(V));
    }
    let me = (V) => 1.5 * Math.pow(Math.max(0, V - 0.07), 2),
      ge = (V) => 3 * Math.max(0, V - 0.07),
      ce = [1, 1, 1],
      P = [],
      D = 0.212,
      B = 12,
      X = { wear: 0.8, zone: 0.25 };
    for (let V = 0; V <= B; V++) {
      let ne = -0.004 + ((D + 0.004) * V) / B;
      P.push([me(ne) + 0.0298, -ne]);
    }
    for (let V = B; V >= 0; V--) {
      let ne = -0.004 + ((D + 0.004) * V) / B;
      P.push([me(ne) - 0.0298, -ne]);
    }
    S.push(Q0(P, -0.0113, 0.0113, 0.0022, ce, { ...X, bs: 2, crease: 40 }));
    for (let V = 0; V < 8; V++) {
      let ne = 0.082 + V * 0.0155;
      S.push(Mt(0.0244, 0.0056, 0.05, 0.0018, 0, -ne, me(ne), ce, X, [Math.atan(ge(ne)), 0, 0]));
    }
    for (let V = 0; V < 10; V++) {
      let ne = 0.078 + V * 0.013;
      S.push(Mt(0.012, 0.011, 0.004, 0.0012, 0, -ne, me(ne) + 0.0302, ce, X, [Math.atan(ge(ne)), 0, 0]));
    }
    (S.push(Mt(0.027, 0.009, 0.068, 0.003, 0, -D - 0.003, me(D) + 0.001, ce, { wear: 1, zone: 0.6 }, [Math.atan(ge(D)), 0, 0])),
      S.push(Mt(0.01, 0.004, 0.012, 0.001, 0, -D - 0.008, me(D) - 0.01, [0.6, 0.6, 0.6], b, [Math.atan(ge(D)), 0, 0])),
      S.push(Mt(0.003, 0.006, 0.04, 0.001, -0.0085, 0.0045, 0.004, ce, X)),
      S.push(Mt(0.003, 0.006, 0.04, 0.001, 0.0085, 0.0045, 0.004, ce, X)));
    let re = [1.25, 0.72, 0.5];
    (R.push(
      h0(
        [
          [0, -0.02],
          [0.004, -0.02],
          [0.0047, -0.019],
          [0.0047, 0.01],
          [0.0034, 0.014],
          [0.0034, 0.018],
        ],
        12,
        [1, 1, 1],
        { wear: 0, ox: 0.002, oy: 0.0062 },
      ),
    ),
      R.push(
        h0(
          [
            [0.003, 0.018],
            [0.0029, 0.024],
            [0.0022, 0.03],
            [0.001, 0.0345],
            [0, 0.0352],
          ],
          12,
          re,
          { wear: 0, ox: 0.002, oy: 0.0062 },
        ),
      ),
      R.push(
        h0(
          [
            [0, -0.02],
            [0.004, -0.02],
            [0.0047, -0.019],
            [0.0047, 0.01],
          ],
          10,
          [0.8, 0.8, 0.8],
          { wear: 0, ox: -0.003, oy: 5e-4 },
        ),
      ));
    let Y = { ano: Fs(M), gun: Fs(_), poly: Fs(T), plain: Fs(z), bolt: Fs(w), mag: Fs(S), round: Fs(R) },
      he = (V, ne, ye, Te) =>
        Te === "poly" || Te === "plain" || Te === "round" || Te === "mag"
          ? 0
          : Math.max(
              Zl(V, ne, ye, -0.03, 0.03, -0.095, -0.074, 0.03, 0.104, 0.014),
              0.85 * Zl(V, ne, ye, 0.012, 0.03, -0.014, 0.016, -0.016, 0.066, 0.012),
              0.85 * Zl(V, ne, ye, -0.03, -0.012, 5e-4, 0.0135, -0.028, 0.092, 0.01),
              0.5 * Zl(V, ne, ye, -0.03, 0.03, -0.026, -0.016, -0.1, 0.1, 0.004),
            );
    sy(
      Object.keys(Y).map((V) => ({ key: V, g: Y[V], off: V === "mag" || V === "round" ? wn.magPos : null })),
      he,
    );
    for (let V in Y) Y[V].computeBoundingSphere();
    return Y;
  }
  export function Zz(n) {
    let e = n.attributes.position.array,
      t = n.attributes.normal.array,
      i = n.attributes.color.array,
      s = n.attributes.aSurf.array,
      o = (r, a, l, c) => {
        for (let u = 0; u < c; u++) {
          let f = r[a * c + u];
          ((r[a * c + u] = r[l * c + u]), (r[l * c + u] = f));
        }
      };
    for (let r = 0; r < e.length / 3; r += 3) (o(e, r + 1, r + 2, 3), o(t, r + 1, r + 2, 3), o(i, r + 1, r + 2, 3), o(s, r + 1, r + 2, 4));
  }
  export var Tu = (n) => (n.index ? n.index.count : n.attributes.position.count) / 3;
  export var RE = St,
    _1 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n),
    Ot = (n) => ((n = _1(n)), n * n * n * (n * (6 * n - 15) + 10)),
    CE = (n) => ((n = _1(n)), n * n),
    yh = (n) => ((n = _1(n)), 1 - (1 - n) * (1 - n));
  export var dn = (n, e, t) => _1((n - e) / (t - e)),
    oy = (n, e) => {
      n = _1(n);
      let t = n - 1;
      return 1 + (e + 1) * t * t * t + e * t * t;
    },
    pn = (n, e = 1) => ({ x: 0, v: 0, w: n, z: e });
  export function en(n, e, t, i = n.w, s = n.z) {
    let o = n.x - e,
      r = n.v;
    if (s >= 0.999) {
      let a = Math.exp(-i * t),
        l = r + i * o;
      ((n.x = e + (o + l * t) * a), (n.v = (r - i * l * t) * a));
    } else {
      let a = i * Math.sqrt(1 - s * s),
        l = Math.exp(-s * i * t),
        c = Math.cos(a * t),
        u = Math.sin(a * t),
        f = (r + s * i * o) / a;
      ((n.x = e + l * (o * c + f * u)), (n.v = l * (a * (f * c - o * u) - s * i * (o * c + f * u))));
    }
    return n.x;
  }
  export var Xn = (n, e = 0) => {
      ((n.x = e), (n.v = 0));
    },
    AE = (n) => {
      let e = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return (e - Math.floor(e)) * 2 - 1;
    };
  export function sa(n, e = 0) {
    let t = Math.floor(n),
      i = n - t,
      s = i * i * i * (i * (6 * i - 15) + 10);
    return 2 * ((1 - s) * AE(t + e * 57.31) * i + s * AE(t + 1 + e * 57.31) * (i - 1));
  }
  export var ry = (n, e) => e * Math.tanh(n / e),
    Au = (n, e, t, i = "XYZ") => new RE().setFromEuler(new _0(n, e, t, i));
  export function Ru(n, e, t, i) {
    let s = 0;
    for (; s < n.length - 2 && e > n[s + 1][0];) s++;
    let o = n[s],
      r = n[s + 1],
      a = Ot((e - o[0]) / Math.max(1e-4, r[0] - o[0]));
    (t.copy(o[1].p).lerp(r[1].p, a), i.copy(o[1].q).slerp(r[1].q, a));
  }
  export var oa = { holster: 0.28, draw: 0.32 },
    bh = {
      rifle: {
        pivot: [0, -0.035, 0.3],
        ads: { pos: 0.22, rot: 0.05, w: 23, z: 0.75, arc: { p: [0.004, 0.011, 0.01], r: [0.02, -0.03, -0.03] }, out: 0.03 },
        idle: { hz: 0.25, breathY: 5e-4, breathP: 9e-4, drift: 6e-4, driftR: 0.001, noise: 18e-5, noiseR: 4e-4 },
        walk: { y: 0.0034, x: 0.0034, z: 0.0016, pitch: 0.007, yaw: 0.01, roll: 0.015, lag: 0.04 },
        run: { y: 0.015, x: 0.011, z: 0.006, pitch: 0.028, yaw: 0.028, roll: 0.046, lag: 0.05 },
        crouch: 0.72,
        inertia: { z: 0.0042, x: 0.0034, pitch: 0.0085, roll: 0.01, lean: 0.006, tau: 0.13, spr: [15, 0.48] },
        sway: { lag: 0.058, max: 0.07, roll: 0.55, shift: 0.02, spr: [13.5, 0.64], adsRot: 0.1, adsPos: 0.5 },
        air: { jumpY: 0.26, jumpP: 0.95, fallY: 0.0019, fallP: 0.004, landY: 0.092, landP: 0.26, landR: 0.17, spr: [20.5, 0.56] },
        recoil: {
          back: 0.82,
          rise: 1.5,
          yaw: 0.95,
          roll: 1.7,
          up: 0.11,
          side: 0.09,
          first: 1.4,
          adsBack: 0.75,
          adsRot: 0.1,
          adsPos: 0.9,
          spr: { kZ: [44, 0.55], kP: [36, 0.5], kY: [30, 0.45], kR: [31, 0.42], kX: [40, 0.5], kU: [40, 0.5] },
        },
        sprint: { spr: [17, 1] },
        wall: { near: 0.42, far: 1.05, p: [-0.03, -0.035, 0.085], r: [0.34, 0.5, 0.16] },
        crouchDip: { y: 0.0075, pitch: 0.02, roll: 0.028, w: [16, 8] },
      },
      pistol: {
        pivot: [0, -0.085, 0.075],
        ads: { pos: 0.14, rot: 0.06, w: 29.5, z: 0.75, arc: { p: [0.003, 0.008, 0.012], r: [0.03, -0.02, -0.03] }, out: 0.024 },
        idle: { hz: 0.25, breathY: 6e-4, breathP: 0.0011, drift: 7e-4, driftR: 0.0014, noise: 25e-5, noiseR: 7e-4 },
        walk: { y: 0.003, x: 0.0036, z: 0.0014, pitch: 0.009, yaw: 0.014, roll: 0.015, lag: 0.028 },
        run: { y: 0.012, x: 0.009, z: 0.005, pitch: 0.034, yaw: 0.03, roll: 0.04, lag: 0.034 },
        crouch: 0.72,
        inertia: { z: 0.0034, x: 0.0028, pitch: 0.011, roll: 0.012, lean: 0.0085, tau: 0.1, spr: [20, 0.5] },
        sway: { lag: 0.04, max: 0.085, roll: 0.45, shift: 0.012, spr: [19, 0.6], adsRot: 0.1, adsPos: 0.4 },
        air: { jumpY: 0.22, jumpP: 1.2, fallY: 0.0017, fallP: 0.005, landY: 0.078, landP: 0.34, landR: 0.2, spr: [23, 0.54] },
        recoil: {
          back: 0.55,
          rise: 6.4,
          yaw: 1.3,
          roll: 2.3,
          up: 0.2,
          side: 0.1,
          first: 1,
          adsBack: 0.8,
          adsRot: 0.42,
          adsPos: 0.8,
          spr: { kZ: [56, 0.55], kP: [50, 0.5], kY: [38, 0.48], kR: [38, 0.45], kX: [46, 0.5], kU: [46, 0.5] },
        },
        sprint: { spr: [20, 1] },
        wall: { near: 0.32, far: 0.8, p: [-0.02, -0.02, 0.13], r: [0.42, 0.3, 0.1] },
        crouchDip: { y: 0.0065, pitch: 0.03, roll: 0.026, w: [18, 9] },
      },
    },
    ft = {
      tac: 2.24,
      empty: 2.72,
      atMag: 0.36,
      magout: 0.4,
      clear: 0.52,
      away: 0.74,
      swap: 0.8,
      rise: 0.86,
      align: 1.1,
      insert: 1.15,
      short: 1.31,
      windup: 1.385,
      magin: 1.44,
      rebound: 1.5,
      regrip: 1.54,
      tugDown: 1.6,
      tugUp: 1.66,
      swapBack: 1.75,
      atHandle: 1.84,
      tacBack: 1.89,
      tacRelease: 1.905,
      tacBolt: 1.93,
      back: 1.96,
      release: 2.12,
      bolt: 2.155,
      shortBy: 0.009,
      backOff: 0.032,
      reboundBy: 0.008,
      tugBy: 0.005,
      partial: 0.32,
    },
    It = {
      tac: 1.5,
      empty: 1.9,
      release: 0.12,
      magout: 0.18,
      swap: 0.48,
      rise: 0.52,
      align: 0.84,
      insert: 0.9,
      fingers: 1.02,
      windup: 1.075,
      magin: 1.13,
      rebound: 1.19,
      swapBack: 1.3,
      regrip: 1.44,
      thumb: 1.53,
      slideRelease: 1.575,
      slide: 1.61,
      backOff: 0.026,
      reboundBy: 0.01,
    };
  export var xU = new _0(),
    vU = new RE();
  export var Us = K,
    ja = St,
    Cu = { upper: 0.3, fore: 0.27 },
    er = { right: [0.19, -0.24, 0.1], left: [-0.19, -0.24, 0.1] };
  export var Un = 20,
    Eh = ["thumb", "index", "middle", "ring", "little"],
    t0 = [
      {
        name: "thumb",
        base: [-0.0235, -0.01, -0.02],
        dir: [-0.3, -0.05, -0.95],
        up: [-0.72, 0.69, 0],
        len: [0.044, 0.033, 0.029],
        rad: [0.015, 0.0122, 0.0112, 0.0098],
        wide: 1.15,
      },
      {
        name: "index",
        base: [-0.0335, 0.0015, -0.096],
        yaw: 0.07,
        roll: -0.05,
        sgn: 1,
        len: [0.0405, 0.0235, 0.022],
        rad: [0.0102, 0.0093, 0.0085, 0.0076],
        wide: 1.12,
      },
      {
        name: "middle",
        base: [-0.011, 0.0035, -0.101],
        yaw: 0.01,
        roll: 0,
        sgn: 1,
        len: [0.044, 0.0262, 0.0238],
        rad: [0.0104, 0.0095, 0.0087, 0.0078],
        wide: 1.12,
      },
      {
        name: "ring",
        base: [0.0105, 0.002, -0.0965],
        yaw: -0.06,
        roll: 0.05,
        sgn: -1,
        len: [0.0412, 0.0245, 0.0223],
        rad: [0.0099, 0.009, 0.0082, 0.0073],
        wide: 1.12,
      },
      {
        name: "little",
        base: [0.0305, -0.0015, -0.0875],
        yaw: -0.14,
        roll: 0.12,
        sgn: -1,
        len: [0.0325, 0.0188, 0.02],
        rad: [0.0089, 0.0081, 0.0073, 0.0065],
        wide: 1.12,
      },
    ],
    jz = new Us(0.2, 0, 0.98).normalize(),
    kE = new Us(1, 0, 0),
    PE = new Us(0, 1, 0),
    Kz = new Us(0, 0, 1);
__late_audio.t0(t0);
  export function Jz(n, e, t = new ja()) {
    let i = new Us(-n[0], -n[1], -n[2]).normalize(),
      s = new Us(e[0], e[1], e[2]).cross(i).normalize(),
      o = new Us().crossVectors(i, s);
    return t.setFromRotationMatrix(new Je().makeBasis(s, o, i));
  }
  t0[0].q0 = Jz(t0[0].dir, t0[0].up);
  for (let n = 1; n < 5; n++) t0[n].qRoll = new ja().setFromAxisAngle(Kz, t0[n].roll);
  for (let n of t0) n.total = n.len[0] + n.len[1] + n.len[2];
  export var l0 = {
      upperArm: 0,
      forearm: 1,
      twist1: 2,
      twist2: 3,
      hand: 4,
      digit: (n, e) => 5 + n * 3 + e,
      helper: (n, e) => 20 + n * 3 + e,
      count: 35,
    },
    T1 = ["upperArm", "forearm", "forearmTwist1", "forearmTwist2", "hand"];
  for (let n of ["", "Helper"]) for (let e = 0; e < 5; e++) for (let t = 0; t < 3; t++) T1.push(Eh[e] + n + (t + 1));
  export var Qz = [
      [-0.25, 1.35],
      [-0.2, 1],
      [-0.35, 1.4],
      [-0.15, 1],
    ],
    eD = [
      [-0.45, 1.6],
      [0, 1.95],
      [-0.1, 1.45],
      [-0.3, 0.4],
    ],
    xs = { min: new Float32Array(Un), max: new Float32Array(Un) };
  for (let n = 0; n < 5; n++)
    for (let e = 0; e < 4; e++) {
      let t = (n ? eD : Qz)[e];
      ((xs.min[n * 4 + e] = t[0]), (xs.max[n * 4 + e] = t[1]));
    }
  export function d0(n = {}, e = null) {
    let t = new Float32Array(Un);
    e && t.set(e);
    for (let i = 0; i < 5; i++) {
      let s = n[Eh[i]] || (i && n.fingers);
      if (s) for (let o = 0; o < 4; o++) t[i * 4 + o] = s[o] || 0;
    }
    return t;
  }
  export function tn(n, e, t, i) {
    for (let s = 0; s < Un; s++) n[s] = e[s] + (t[s] - e[s]) * i;
    return n;
  }
  export function ly(n) {
    let e = 0;
    for (let t = 0; t < Un; t++) {
      let i = xs.min[t],
        s = xs.max[t];
      n[t] < i ? ((e = Math.max(e, i - n[t])), (n[t] = i)) : n[t] > s && ((e = Math.max(e, n[t] - s)), (n[t] = s));
    }
    return e;
  }
  export function LE(n) {
    let e = 0;
    for (let t = 0; t < Un; t++) e = Math.max(e, xs.min[t] - n[t], n[t] - xs.max[t]);
    return Math.max(0, e);
  }
  export var jl = d0({
      thumb: [0.34, 0.08, 0.14, 0.5],
      index: [0.14, 0.22, 0.12, 0.075],
      middle: [0.18, 0.26, 0.14, 0],
      ring: [0.22, 0.28, 0.15, 0.065],
      little: [0.26, 0.3, 0.16, 0.13],
    }),
    di = {
      rest: jl,
      relaxed: d0({
        thumb: [0.42, 0.14, 0.22, 0.34],
        index: [0.3, 0.44, 0.24, 0.03],
        middle: [0.4, 0.52, 0.28, 0],
        ring: [0.48, 0.56, 0.3, 0.02],
        little: [0.54, 0.58, 0.32, 0.06],
      }),
      open: d0({
        thumb: [0.2, -0.05, -0.05, 0.75],
        index: [-0.05, 0.04, 0.02, 0.12],
        middle: [-0.05, 0.04, 0.02, 0],
        ring: [-0.05, 0.04, 0.02, 0.1],
        little: [-0.05, 0.04, 0.02, 0.18],
      }),
      flat: d0({
        thumb: [0.05, 0, 0.02, 0.2],
        index: [0, 0.02, 0.01, -0.04],
        middle: [0, 0.02, 0.01, 0],
        ring: [0, 0.02, 0.01, -0.03],
        little: [0, 0.02, 0.01, -0.06],
      }),
      fist: d0({
        thumb: [0.98, 0.42, 0.62, 0.16],
        index: [1.4, 1.72, 1.02, -0.04],
        middle: [1.44, 1.74, 1.02, 0],
        ring: [1.46, 1.74, 1.02, -0.03],
        little: [1.48, 1.72, 1.02, -0.08],
      }),
    };
  export function Za(n) {
    if (typeof n == "string") {
      let e = di[n];
      if (!e) throw new Error('weapon_hands: unknown pose "' + n + '"');
      return e;
    }
    return n;
  }
  export var IE = new ja(),
    zE = new ja(),
    w1 = new Us();
  export function _h(n, e, t, i) {
    let s = t0[n],
      o = n * 4;
    return e > 0
      ? i.setFromAxisAngle(kE, -t[o + e])
      : n === 0
        ? i.setFromAxisAngle(jz, t[0]).multiply(IE.setFromAxisAngle(PE, t[3])).multiply(s.q0)
        : i
            .setFromAxisAngle(PE, s.yaw + s.sgn * t[o + 3])
            .multiply(s.qRoll)
            .multiply(IE.setFromAxisAngle(kE, -t[o]));
  }
  export function tr() {
    return { q: Array.from({ length: 15 }, () => new ja()), j: Array.from({ length: 20 }, () => new Us()) };
  }
  export function Sh(n, e, t) {
    let i = t0[e],
      s = t.q,
      o = t.j,
      r = e * 3,
      a = e * 4;
    (_h(e, 0, n, s[r]),
      s[r + 1].copy(s[r]).multiply(_h(e, 1, n, zE)),
      s[r + 2].copy(s[r + 1]).multiply(_h(e, 2, n, zE)),
      o[a].set(i.base[0], i.base[1], i.base[2]));
    for (let l = 0; l < 3; l++) o[a + l + 1].copy(o[a + l]).add(w1.set(0, 0, -i.len[l]).applyQuaternion(s[r + l]));
  }
  export function ra(n, e) {
    for (let t = 0; t < 5; t++) Sh(n, t, e);
    return e;
  }
  export function vs(n, e, t) {
    return { type: "capsule", a: [n[0], n[1], n[2]], b: [e[0], e[1], e[2]], r: t };
  }
  export function mn(n, e, t = null, i = 0) {
    let s = t ? (t.isQuaternion ? t.clone() : new ja(t[0], t[1], t[2], t[3])) : new ja(),
      o = new Je().makeRotationFromQuaternion(s).elements;
    return {
      type: "box",
      c: [n[0], n[1], n[2]],
      h: [e[0], e[1], e[2]],
      q: [s.x, s.y, s.z, s.w],
      m: [o[0], o[1], o[2], o[4], o[5], o[6], o[8], o[9], o[10]],
      r: i,
    };
  }
  export function Th(n, e) {
    let t = new Us(),
      i = new Us(),
      s = new ja();
    return (
      e.decompose(t, s, i),
      n.map((o) =>
        o.type === "capsule"
          ? vs(new Us(...o.a).applyMatrix4(e).toArray(), new Us(...o.b).applyMatrix4(e).toArray(), o.r)
          : mn(new Us(...o.c).applyMatrix4(e).toArray(), o.h, s.clone().multiply(new ja(o.q[0], o.q[1], o.q[2], o.q[3])), o.r),
      )
    );
  }
  export function tD(n, e, t, i) {
    if (n.type === "capsule") {
      let p = n.a,
        d = n.b,
        m = d[0] - p[0],
        x = d[1] - p[1],
        v = d[2] - p[2],
        y = e - p[0],
        b = t - p[1],
        g = i - p[2],
        E = (y * m + b * x + g * v) / (m * m + x * x + v * v || 1e-12);
      return ((E = E < 0 ? 0 : E > 1 ? 1 : E), Math.hypot(y - m * E, b - x * E, g - v * E) - n.r);
    }
    let s = n.m,
      o = n.h,
      r = n.r,
      a = e - n.c[0],
      l = t - n.c[1],
      c = i - n.c[2],
      u = Math.abs(a * s[0] + l * s[1] + c * s[2]) - o[0] + r,
      f = Math.abs(a * s[3] + l * s[4] + c * s[5]) - o[1] + r,
      h = Math.abs(a * s[6] + l * s[7] + c * s[8]) - o[2] + r;
    return Math.hypot(Math.max(u, 0), Math.max(f, 0), Math.max(h, 0)) + Math.min(Math.max(u, f, h), 0) - r;
  }
  export function h5(n, e, t, i) {
    let s = 1e9;
    for (let o = 0; o < n.length; o++) {
      let r = tD(n[o], e, t, i);
      r < s && (s = r);
    }
    return s;
  }
  export var Mh = tr(),
    E1 = tr(),
    S1 = 6,
    DE = [0, 0, 0];
  export function wh(n, e, t, i = null, s = null) {
    Sh(n, e, Mh);
    let o = t0[e],
      r = Mh.j,
      a = e * 4;
    for (let l = 0; l < 3; l++) {
      let c = -1e9;
      if (!(e === 0 && l === 0)) {
        let u = r[a + l],
          f = r[a + l + 1],
          h = o.rad[l],
          p = o.rad[l + 1],
          d = l === 2 ? p / o.len[l] : 0,
          m = i && l >= (e === 0 ? 2 : 1);
        for (let x = 0; x < S1; x++) {
          let v = e === 0 && l === 1 ? 0.35 + (0.65 * x) / (S1 - 1) : x / (S1 - 1),
            y = v * (1 - d),
            b = u.x + (f.x - u.x) * y,
            g = u.y + (f.y - u.y) * y,
            E = u.z + (f.z - u.z) * y,
            M = h5(t, b, g, E);
          (s && (M = Math.min(M, h5(s, b, g, E))), m && (M = Math.min(M, i(b, g, E))));
          let _ = h + (p - h) * v - M;
          _ > c && (c = _);
        }
      }
      DE[l] = c;
    }
    return DE;
  }
  export function Kl(n, e, t = {}) {
    ((n = Za(n)), (t.depth = -1e9), (t.digit = 0), (t.phalanx = 0));
    for (let i = 0; i < 5; i++) {
      let s = wh(n, i, e);
      for (let o = 0; o < 3; o++) s[o] > t.depth && ((t.depth = s[o]), (t.digit = i), (t.phalanx = o));
    }
    return t;
  }
  export function Jl(n, e = {}) {
    let t = Za(e.from || "open"),
      i = Za(e.to || "fist"),
      s = e.skin ?? 8e-4,
      o = e.steps || 40,
      r = e.palm || null,
      a = e.out || new Float32Array(Un);
    a.set(Za(e.rest || t));
    let l = [0, 0, 0];
    for (let c of e.digits || [1, 2, 3, 4, 0]) {
      let u = null;
      if (c === 0 && e.self !== !1) {
        (ra(a, E1), (u = []));
        for (let v = 1; v < 5; v++)
          for (let y = 0; y < 3; y++) {
            let b = t0[v],
              g = E1.j[v * 4 + y],
              E = E1.j[v * 4 + y + 1];
            u.push(
              vs(
                [g.x, g.y, g.z],
                y === 2
                  ? [
                      E.x + ((g.x - E.x) * b.rad[3]) / b.len[2],
                      E.y + ((g.y - E.y) * b.rad[3]) / b.len[2],
                      E.z + ((g.z - E.z) * b.rad[3]) / b.len[2],
                    ]
                  : [E.x, E.y, E.z],
                (b.rad[y] + b.rad[y + 1]) / 2,
              ),
            );
          }
      }
      let f = c * 4,
        h = (v, y) => {
          for (let b = 0; b < 3; b++) {
            let g = b > y ? Math.min(1, l[b] + v / o) : l[b];
            ((a[f + b] = t[f + b] + (i[f + b] - t[f + b]) * g), b === 0 && (a[f + 3] = t[f + 3] + (i[f + 3] - t[f + 3]) * g));
          }
        },
        p = [0, 0, 0],
        d = (v) => {
          let y = wh(a, c, n, r, u),
            b = -1;
          for (let g = v + 1; g < 3; g++) y[g] + s > 0 && y[g] > p[g] + 1e-7 && (b = g);
          return b;
        },
        m = () => {
          let v = wh(a, c, n, r, u);
          ((p[0] = v[0]), (p[1] = v[1]), (p[2] = v[2]));
        };
      ((l[0] = l[1] = l[2] = 0), h(0, 2), m());
      let x = -1;
      for (let v = 0; v < o && x < 2; v++) {
        h(1, x);
        let y = d(x);
        if (y < 0) {
          for (let E = x + 1; E < 3; E++) l[E] = Math.min(1, l[E] + 1 / o);
          m();
          continue;
        }
        let b = 0,
          g = 1;
        for (let E = 0; E < 10; E++) {
          let M = (b + g) / 2;
          h(M, x);
          let _ = d(x);
          _ < 0 ? (b = M) : ((g = M), (y = _));
        }
        for (let E = x + 1; E < 3; E++) l[E] = Math.min(1, l[E] + b / o);
        (h(0, 2), m(), (x = y), v--);
      }
      h(0, 2);
    }
    if (e.hold)
      for (let c = 0; c < 5; c++) {
        let u = e.hold[Eh[c]];
        if (u) for (let f = 0; f < 4; f++) a[c * 4 + f] = u[f];
      }
    return a;
  }
  export var Ns = new Us(),
    ay = new Us();
  export function f5(n, e, t, i) {
    Sh(n, e, Mh);
    let s = t0[e],
      o = e * 4;
    return (
      i.copy(Mh.j[o + 2]).lerp(Mh.j[o + 3], t),
      ay.set(0, -1, 0).applyQuaternion(Mh.q[e * 3 + 2]),
      i.addScaledVector(ay, s.rad[2] + (s.rad[3] - s.rad[2]) * t)
    );
  }
  export function FE(n, e, t, i = {}) {
    let s = i.couple ?? 0.6,
      o = i.at ?? 0.5,
      r = e * 4,
      a = [r, r + 3, r + 1],
      l = 0.001,
      c = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      u = [0, 0, 0],
      f = () => {
        for (let v of [r, r + 1, r + 3]) n[v] = Math.min(xs.max[v], Math.max(xs.min[v], n[v]));
        n[r + 2] = Math.min(xs.max[r + 2], Math.max(xs.min[r + 2], s * n[r + 1]));
      },
      h = t[0],
      p = t[1],
      d = t[2],
      m = 1e9,
      x = 1e-4;
    f();
    for (
      let v = 0;
      v < (i.iters || 40) &&
      (f5(n, e, o, Ns), (u[0] = h - Ns.x), (u[1] = p - Ns.y), (u[2] = d - Ns.z), (m = Math.hypot(u[0], u[1], u[2])), !(m < 2e-5));
      v++
    ) {
      for (let _ = 0; _ < 3; _++) {
        let T = a[_],
          w = n[T],
          S = n[r + 2];
        ((n[T] = w + l),
          T === r + 1 && (n[r + 2] = s * n[T]),
          f5(n, e, o, ay.set(0, 0, 0) && Ns),
          (c[0][_] = (Ns.x - (h - u[0])) / l),
          (c[1][_] = (Ns.y - (p - u[1])) / l),
          (c[2][_] = (Ns.z - (d - u[2])) / l),
          (n[T] = w),
          (n[r + 2] = S));
      }
      let y = [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        b = [0, 0, 0];
      for (let _ = 0; _ < 3; _++) {
        for (let T = 0; T < 3; T++) {
          let w = 0;
          for (let S = 0; S < 3; S++) w += c[S][_] * c[S][T];
          y[_][T] = w + (_ === T ? x : 0);
        }
        b[_] = c[0][_] * u[0] + c[1][_] * u[1] + c[2][_] * u[2];
      }
      let g = (_) =>
          _[0][0] * (_[1][1] * _[2][2] - _[1][2] * _[2][1]) -
          _[0][1] * (_[1][0] * _[2][2] - _[1][2] * _[2][0]) +
          _[0][2] * (_[1][0] * _[2][1] - _[1][1] * _[2][0]),
        E = g(y);
      if (Math.abs(E) < 1e-18) break;
      let M = [n[r], n[r + 3], n[r + 1], n[r + 2]];
      for (let _ = 0; _ < 3; _++) {
        let T = y.map((w, S) => w.map((R, z) => (z === _ ? b[S] : R)));
        n[a[_]] += Math.max(-0.35, Math.min(0.35, g(T) / E));
      }
      if ((f(), f5(n, e, o, Ns), Math.hypot(h - Ns.x, p - Ns.y, d - Ns.z) > m)) {
        if (((n[r] = M[0]), (n[r + 3] = M[1]), (n[r + 1] = M[2]), (n[r + 2] = M[3]), (x *= 8), x > 1e3)) break;
      } else x = Math.max(1e-6, x * 0.4);
    }
    return (f5(n, e, o, Ns), Math.hypot(h - Ns.x, p - Ns.y, d - Ns.z));
  }
  export function cy(n, e = null, t = {}) {
    ((n = Za(n)), ra(n, E1), (t.depth = -1e9), (t.a = 0), (t.b = 0));
    let i = E1.j,
      s = (o, r, a) => {
        let l = t0[o],
          c = i[o * 4 + r],
          u = i[o * 4 + r + 1],
          f = a / (S1 - 1),
          h = f * (1 - (r === 2 ? l.rad[3] / l.len[2] : 0));
        return (w1.copy(c).lerp(u, h), l.rad[r] + (l.rad[r + 1] - l.rad[r]) * f);
      };
    for (let o = 0; o < 5; o++)
      for (let r = 0; r < 3; r++)
        for (let a = 0; a < S1; a++) {
          let l = s(o, r, a),
            c = w1.x,
            u = w1.y,
            f = w1.z;
          if (e && r > 0 && !(o === 0 && r === 1)) {
            let h = l - e(c, u, f);
            h > t.depth && ((t.depth = h), (t.a = o), (t.b = -1));
          }
          for (let h = o + 1; h < 5; h++)
            for (let p = 0; p < 3; p++) {
              if ((r === 0 && p === 0) || (o === 0 && r === 0 && p === 0) || (h - o === 1 && o > 0 && (r === 0 || p === 0) && r + p < 2))
                continue;
              let d = t0[h],
                m = i[h * 4 + p],
                x = i[h * 4 + p + 1],
                v = x.x - m.x,
                y = x.y - m.y,
                b = x.z - m.z,
                g = ((c - m.x) * v + (u - m.y) * y + (f - m.z) * b) / (v * v + y * y + b * b),
                E = 1 - (p === 2 ? d.rad[3] / d.len[2] : 0);
              g = g < 0 ? 0 : g > E ? E : g;
              let M = l + d.rad[p] + (d.rad[p + 1] - d.rad[p]) * g - Math.hypot(c - m.x - v * g, u - m.y - y * g, f - m.z - b * g);
              M > t.depth && ((t.depth = M), (t.a = o), (t.b = h));
            }
        }
    return t;
  }
  export var ec = 0,
    Ja = 5,
    py = 6,
    x5 = 7,
    HE = 8,
    vy = 0,
    yy = 1;
__late_fx.py(py); __late_fx.vy(vy); __late_audio.py(py);
  export var nD = 0.03,
    iD = 0.0065,
    sD = 0.01,
    oD = 0.012,
    rD = 0.0015,
    Ah = { hem: 0.046, end: 0.535, band: [0.128, 0.172], refl: [0.1445, 0.1555] },
    zu = [],
    aD = new Je(),
    lD = new St(),
    cD = new K();
  export function my(n) {
    let e = aD.makeRotationFromQuaternion(n).elements;
    return [e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10]];
  }
  export function ku(n, e, t, i, s, o, r, a = {}) {
    let l = (o - r) / s;
    zu.push({
      type: vy,
      bone: n,
      group: e,
      o: [t.x, t.y, t.z],
      m: my(i),
      h: s,
      ra: o,
      rb: r,
      sx: a.wide || 1,
      b: l,
      a_: Math.sqrt(1 - l * l),
      k: a.k ?? 0.004,
      ta: a.ta || 0,
      tb: a.tb || 0,
      R: a.R || 0.01,
      bc: [t.x, t.y, t.z].map((c, u) => c - my(i)[6 + u] * s * 0.5),
      br: s * 0.5 + Math.max(o, r) * (a.wide || 1),
    });
  }
  export function vo(n, e, t, i, s = null, o = {}) {
    zu.push({
      type: yy,
      bone: n,
      group: e,
      o: [t[0], t[1], t[2]],
      m: my(s || lD.identity()),
      r: i,
      k: o.k ?? 0.004,
      R: o.R || 0.01,
      bc: t.slice(),
      br: Math.max(i[0], i[1], i[2]),
    });
  }
  export var uy = (n) => new St().setFromAxisAngle(new K(0, 1, 0), n);
  export var NE = new St(),
    OE = ra(jl, tr());
  export var Dr = (n, e) => OE.j[n * 4 + e],
    Ka = (n, e) => OE.q[n * 3 + e],
    Lr = (n, e, t) => new K(t === 0 ? 1 : 0, t === 1 ? 1 : 0, t === 2 ? 1 : 0).applyQuaternion(Ka(n, e)),
    P1 = { guard: [], web: null };
  export function uD() {
    let n = l0.hand;
    for (let e = 1; e < 5; e++) {
      let t = t0[e],
        i = new K(...t.base),
        s = new K(t.base[0] * 0.74 + 0.001, 5e-4, -0.02),
        o = i.clone().sub(s),
        r = o.length() - 0.002;
      o.normalize();
      let a = new St().setFromUnitVectors(new K(0, 0, -1), o);
      (ku(n, ec, s, a, r, 0.0142, e === 4 ? 0.0112 : 0.0122, { k: 0.012, tb: 0.005, R: 0.012 }),
        vo(
          l0.helper(e, 0),
          ec,
          [t.base[0], t.base[1] + 0.0022, t.base[2] + 0.001],
          [0.0112, 0.0108, 0.0112].map((l) => l * (e === 4 ? 0.9 : 1)),
          null,
          { k: 0.006 },
        ));
    }
    (vo(n, ec, [0, 0.005, -0.056], [0.037, 0.009, 0.046], null, { k: 0.012, R: 0.012 }),
      vo(n, ec, [0.0265, -0.0098, -0.047], [0.0135, 0.0108, 0.035], uy(-0.1), { k: 0.01, R: 0.012 }),
      vo(n, ec, [5e-4, -0.0068, -0.084], [0.037, 0.0078, 0.014], uy(-0.1), { k: 0.012, R: 0.012 }),
      vo(n, ec, [0.001, 0, -0.014], [0.0305, 0.019, 0.024], null, { k: 0.012, R: 0.012 }));
    for (let e = 1; e < 4; e++) {
      let t = t0[e].base,
        i = t0[e + 1].base;
      for (let s of [-1, 1])
        vo(
          l0.digit(s < 0 ? e : e + 1, 0),
          ec,
          [(t[0] + i[0]) / 2 + s * 0.0025, (t[1] + i[1]) / 2 - 0.002, (t[2] + i[2]) / 2 - 0.008],
          [0.0062, 0.0064, 0.0082],
          null,
          { k: 0.006, R: 0.012 },
        );
    }
    for (let e = 1; e < 5; e++) {
      let t = t0[e],
        i = e === 4 ? 0.88 : 1,
        s = [t.base[0], t.base[1] + 0.01, t.base[2] + 0.003],
        o = [0.0112 * i, 0.0042, 0.013 * i];
      if ((vo(l0.helper(e, 0), x5, s, o, uy(t.yaw), { k: 0.004, R: 0.012 }), P1.guard.push({ c: s, r: o, yaw: t.yaw }), e < 4)) {
        let r = t0[e + 1],
          a = new K(s[0], s[1] - 0.0012, s[2] + 0.003),
          l = new K(r.base[0], r.base[1] + 0.0094, r.base[2] + 0.006),
          c = l.clone().sub(a),
          u = c.length();
        (c.normalize(), ku(n, x5, a, new St().setFromUnitVectors(new K(0, 0, -1), c), u, 0.0042, 0.0042, { k: 0.004, R: 0.012 }));
      }
    }
    for (let e = 1; e < 5; e++) {
      let t = t0[e],
        i = t.rad,
        s = t.wide;
      for (let r = 0; r < 3; r++) {
        let a = r === 2,
          l = t.len[r] - (a ? i[3] : 0);
        if ((ku(l0.digit(e, r), e, Dr(e, r), Ka(e, r), l, i[r], i[r + 1], { wide: s, k: 0.0018, ta: 0.005, tb: a ? 0 : 0.005 }), r > 0)) {
          let c = Dr(e, r)
            .clone()
            .addScaledVector(Lr(e, r, 1), 0.0012);
          vo(l0.helper(e, r), e, c.toArray(), [i[r] * s * 0.95, i[r] * 0.95, i[r] * 1.05], Ka(e, r), { k: 0.002 });
        }
      }
      let o = Dr(e, 2)
        .clone()
        .addScaledVector(Lr(e, 2, 2), -t.len[2] * 0.56)
        .addScaledVector(Lr(e, 2, 1), -0.0012);
      vo(l0.digit(e, 2), e, o.toArray(), [i[3] * s * 1.04, i[3] * 0.98, t.len[2] * 0.4], Ka(e, 2), { k: 0.003 });
    }
    {
      let e = t0[0],
        t = e.rad,
        i = e.wide,
        s = l0.digit(0, 0);
      ku(s, Ja, Dr(0, 0), Ka(0, 0), e.len[0], t[0], t[1] * 1.04, { wide: 1.06, k: 0.006, ta: 0.006, tb: 0.005, R: 0.012 });
      let o = Dr(0, 0)
        .clone()
        .addScaledVector(Lr(0, 0, 2), -0.02)
        .addScaledVector(Lr(0, 0, 1), -0.0048)
        .add(cD.set(0.0055, -0.003, 0));
      vo(s, Ja, o.toArray(), [0.0158, 0.0122, 0.027], Ka(0, 0), { k: 0.01, R: 0.012 });
      {
        let a = Dr(0, 1)
            .clone()
            .addScaledVector(Lr(0, 1, 2), -0.004),
          l = new K(t0[1].base[0], t0[1].base[1] - 0.004, t0[1].base[2] + 0.02),
          c = l.clone().sub(a),
          u = c.length() / 2;
        c.normalize();
        let f = new K(0.25, 1, 0).normalize(),
          h = new K().crossVectors(c, f).normalize();
        h.z < 0 && h.negate();
        let p = new K().crossVectors(h, c),
          d = new St().setFromRotationMatrix(new Je().makeBasis(c, p, h)),
          m = a.clone().add(l).multiplyScalar(0.5).addScaledVector(h, 0.0075);
        (vo(l0.helper(0, 0), Ja, m.toArray(), [u + 0.003, 0.0058, 0.015], d, { k: 0.012, R: 0.014 }),
          (P1.web = { c: m.toArray(), ab: c.toArray() }));
      }
      vo(l0.helper(0, 0), Ja, [e.base[0] + 0.002, e.base[1], e.base[2] + 0.002], [0.015, 0.014, 0.015], null, { k: 0.01, R: 0.012 });
      for (let a = 1; a < 3; a++) {
        let l = a === 2,
          c = e.len[a] - (l ? t[3] : 0);
        ku(l0.digit(0, a), Ja, Dr(0, a), Ka(0, a), c, t[a], t[a + 1], { wide: l ? i * 1.03 : i, k: 0.002, ta: 0.005, tb: l ? 0 : 0.005 });
        let u = Dr(0, a)
          .clone()
          .addScaledVector(Lr(0, a, 1), 0.0012);
        vo(l0.helper(0, a), Ja, u.toArray(), [t[a] * i * 0.95, t[a] * 0.96, t[a] * 1.06], Ka(0, a), { k: 0.002 });
      }
      let r = Dr(0, 2)
        .clone()
        .addScaledVector(Lr(0, 2, 2), -e.len[2] * 0.56)
        .addScaledVector(Lr(0, 2, 1), -0.0014);
      vo(l0.digit(0, 2), Ja, r.toArray(), [t[3] * i * 1.1, t[3] * 0.98, e.len[2] * 0.4], Ka(0, 2), { k: 0.003 });
    }
    (ku(l0.twist2, py, new K(0, 5e-4, 0.084), NE, 0.088, 0.0232, 0.0222, { wide: 1.43, k: 0.006, ta: 0, tb: 0.012, R: 0.022 }),
      ku(l0.twist2, py, new K(0, 5e-4, 0.084), NE, 0.064, 0.0246, 0.024, { wide: 1.4, k: 0.0035, ta: 0, tb: 0, R: 0.01 }));
  }
  uD();
  export var ir = zu.length,
    VE = new Uint8Array(ir),
    by = new Uint8Array(ir),
    p5 = new Uint8Array(ir),
    m5 = new Float64Array(ir * 3),
    aa = new Float64Array(ir * 9),
    pi = new Float64Array(ir * 8),
    v5 = new Float64Array(ir),
    C1 = new Float64Array(ir * 4);
__late_audio.ir(ir);
  zu.forEach((n, e) => {
    ((VE[e] = n.type),
      (by[e] = n.group),
      (p5[e] = n.bone),
      (v5[e] = n.k),
      m5.set(n.o, e * 3),
      aa.set(n.m, e * 9),
      C1.set([n.bc[0], n.bc[1], n.bc[2], n.br], e * 4),
      n.type === vy
        ? pi.set([n.h, n.ra, n.rb, 1 / n.sx, n.b, n.a_, n.ta, n.tb], e * 8)
        : n.type === yy
          ? pi.set([1 / n.r[0], 1 / n.r[1], 1 / n.r[2], Math.min(n.r[0], n.r[1], n.r[2])], e * 8)
          : pi.set([n.hh[0], n.hh[1], n.hh[2], n.rr], e * 8));
  });
  export var k1 = 0;
  export function WE(n, e, t, i) {
    let s = n * 3,
      o = n * 9,
      r = n * 8,
      a = e - m5[s],
      l = t - m5[s + 1],
      c = i - m5[s + 2],
      u = a * aa[o] + l * aa[o + 1] + c * aa[o + 2],
      f = a * aa[o + 3] + l * aa[o + 4] + c * aa[o + 5],
      h = a * aa[o + 6] + l * aa[o + 7] + c * aa[o + 8],
      p = VE[n];
    if (p === vy) {
      let E = pi[r],
        M = pi[r + 1],
        _ = u * pi[r + 3],
        T = Math.sqrt(_ * _ + f * f),
        w = -h,
        S = pi[r + 4],
        R = pi[r + 5],
        z = w * R - T * S,
        I = z < 0 ? Math.sqrt(T * T + w * w) - M : z > R * E ? Math.sqrt(T * T + (w - E) * (w - E)) - pi[r + 2] : T * R + w * S - M;
      return ((k1 = Math.max(I, pi[r + 6] - w, w - E + pi[r + 7])), I);
    }
    if (p === yy) {
      let E = u * pi[r],
        M = f * pi[r + 1],
        _ = h * pi[r + 2],
        T = Math.sqrt(E * E + M * M + _ * _);
      if (T < 1e-9) return (k1 = -pi[r + 3]);
      let w = E * pi[r],
        S = M * pi[r + 1],
        R = _ * pi[r + 2];
      return (k1 = (T * (T - 1)) / Math.sqrt(w * w + S * S + R * R));
    }
    let d = pi[r + 3],
      m = Math.abs(u) - pi[r] + d,
      x = Math.abs(f) - pi[r + 1] + d,
      v = Math.abs(h) - pi[r + 2] + d,
      y = m > 0 ? m : 0,
      b = x > 0 ? x : 0,
      g = v > 0 ? v : 0;
    return (k1 = Math.sqrt(y * y + b * b + g * g) + Math.min(Math.max(m, x, v), 0) - d);
  }
  export var Iu = (n, e, t) => {
      let i = t - Math.abs(n - e);
      return i <= 0 ? (n < e ? n : e) : (n < e ? n : e) - (i * i) / (4 * t);
    },
    zr = new Float64Array(HE),
    UE = new Float64Array(ir),
    gy = new Float64Array(ir),
    xy = 0;
  export function Rh(n, e, t, i = !1) {
    xy++;
    for (let r = 0; r < HE; r++) zr[r] = 1e9;
    for (let r = 0; r < ir; r++) {
      let a = r * 4,
        l = n - C1[a],
        c = e - C1[a + 1],
        u = t - C1[a + 2],
        f = Math.sqrt(l * l + c * c + u * u) - C1[a + 3],
        h;
      f > nD ? ((h = f), i && ((UE[r] = f), (gy[r] = f))) : ((h = WE(r, n, e, t)), i && ((UE[r] = h), (gy[r] = k1)));
      let p = by[r];
      zr[p] = Iu(zr[p], h, v5[r]);
    }
    let s = Iu(zr[ec], zr[Ja], sD);
    s = Iu(s, zr[py], oD);
    let o = Math.min(zr[1], zr[2], zr[3], zr[4]);
    return Iu(Iu(s, o, iD), zr[x5], rD);
  }
  export var GE = [];
  zu.forEach((n, e) => {
    n.bone === l0.hand && n.group !== Ja && GE.push(e);
  });
  export function Fr(n, e, t) {
    let i = 1e9,
      s = 1e9;
    for (let o of GE) {
      let r = WE(o, n, e, t);
      by[o] === x5 ? (s = Iu(s, r, v5[o])) : (i = Iu(i, r, v5[o]));
    }
    return Math.min(i, s);
  }
  export function fy(n, e, t) {
    let i = [n];
    for (; i[i.length - 1] < e;) i.push(i[i.length - 1] + t(i[i.length - 1]));
    return Float64Array.from(i);
  }
  export var hy = [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ],
    BE = [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [0, 2],
      [1, 3],
      [4, 6],
      [5, 7],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
  export function fD(n, e, t, i) {
    let s = n.length,
      o = e.length,
      r = t.length,
      a = 1,
      l = s,
      c = s * o,
      u = s * o * r,
      f = new Float32Array(u).fill(NaN),
      h = new Int32Array(u).fill(-1),
      p = new Float64Array(8),
      d = (w) => {
        let S = f[w];
        if (S !== S) {
          let R = (w / c) | 0,
            z = w - R * c,
            I = (z / s) | 0;
          ((S = Rh(n[z - I * s], e[I], t[R])), S === 0 && (S = 1e-9), (f[w] = S));
        }
        return S;
      },
      m = hy.map((w) => w[0] * a + w[1] * l + w[2] * c),
      x = 0,
      v = 0,
      y = 0;
    for (; n[x + 1] < i[0];) x++;
    for (; e[v + 1] < i[1];) v++;
    for (; t[y + 1] < i[2];) y++;
    for (; v < o - 2 && !(d(x + v * l + y * c) < 0 && d(x + (v + 1) * l + y * c) > 0);) v++;
    let b = [],
      g = [],
      E = [x + v * l + y * c];
    for (; E.length;) {
      let w = E.pop();
      if (h[w] !== -1) continue;
      let S = (w / c) | 0,
        R = w - S * c,
        z = (R / s) | 0,
        I = R - z * s;
      if (I < 0 || z < 0 || S < 0 || I >= s - 1 || z >= o - 1 || S >= r - 1) {
        h[w] = -2;
        continue;
      }
      let L = 0;
      for (let H = 0; H < 8; H++) ((p[H] = d(w + m[H])), p[H] < 0 && (L |= 1 << H));
      if (L === 0 || L === 255) {
        h[w] = -2;
        continue;
      }
      let U = 0,
        k = 0,
        C = 0,
        A = 0;
      for (let H = 0; H < 12; H++) {
        let N = BE[H][0],
          Z = BE[H][1];
        if (((L >> N) & 1) === ((L >> Z) & 1)) continue;
        let Q = p[N] / (p[N] - p[Z]),
          W = hy[N],
          J = hy[Z];
        ((U += n[I + W[0]] + (n[I + J[0]] - n[I + W[0]]) * Q),
          (k += e[z + W[1]] + (e[z + J[1]] - e[z + W[1]]) * Q),
          (C += t[S + W[2]] + (t[S + J[2]] - t[S + W[2]]) * Q),
          A++);
      }
      ((h[w] = g.length), g.push(w), b.push(U / A, k / A, C / A));
      let F = (H, N, Z, Q) => {
        let W = (L >> H) & 1;
        return W !== ((L >> N) & 1) || W !== ((L >> Z) & 1) || W !== ((L >> Q) & 1);
      };
      (F(0, 2, 4, 6) && E.push(w - a),
        F(1, 3, 5, 7) && E.push(w + a),
        F(0, 1, 4, 5) && E.push(w - l),
        F(2, 3, 6, 7) && E.push(w + l),
        F(0, 1, 2, 3) && E.push(w - c),
        F(4, 5, 6, 7) && E.push(w + c));
    }
    let M = [],
      _ = b,
      T = (w, S, R, z, I) => {
        if (w < 0 || S < 0 || R < 0 || z < 0) return;
        if (I) {
          let k = S;
          ((S = z), (z = k));
        }
        let L = (_[w * 3] - _[R * 3]) ** 2 + (_[w * 3 + 1] - _[R * 3 + 1]) ** 2 + (_[w * 3 + 2] - _[R * 3 + 2]) ** 2,
          U = (_[S * 3] - _[z * 3]) ** 2 + (_[S * 3 + 1] - _[z * 3 + 1]) ** 2 + (_[S * 3 + 2] - _[z * 3 + 2]) ** 2;
        L <= U ? M.push(w, S, R, w, R, z) : M.push(w, S, z, S, R, z);
      };
    for (let w = 0; w < g.length; w++) {
      let S = g[w],
        R = f[S];
      (R < 0 != f[S + a] < 0 && T(h[S], h[S - l], h[S - l - c], h[S - c], R > 0),
        R < 0 != f[S + l] < 0 && T(h[S], h[S - a], h[S - a - c], h[S - c], R < 0),
        R < 0 != f[S + c] < 0 && T(h[S], h[S - a], h[S - a - l], h[S - l], R > 0));
    }
    return { pos: b, idx: M };
  }
  export var hD = (n) => {
      if (n >= 1) return 0;
      if (n <= 0) return 1;
      let e = 1 - n;
      return e * e * (3 - 2 * e);
    },
    nr = l0.count,
    Ql = new Float64Array(nr),
    g5 = new Uint8Array(nr * nr);
  {
    let n = (e, t) => {
      g5[e * nr + t] = g5[t * nr + e] = 1;
    };
    for (let e = 0; e < nr; e++) g5[e * nr + e] = 1;
    n(l0.hand, l0.twist2);
    for (let e = 0; e < 5; e++) {
      let t = [l0.hand, l0.helper(e, 0), l0.digit(e, 0), l0.helper(e, 1), l0.digit(e, 1), l0.helper(e, 2), l0.digit(e, 2)];
      for (let i = 0; i < t.length; i++) for (let s = i + 1; s <= i + 2 && s < t.length; s++) n(t[i], t[s]);
      if (e > 0 && e < 4) for (let i of [l0.helper(e, 0), l0.digit(e, 0)]) for (let s of [l0.helper(e + 1, 0), l0.digit(e + 1, 0)]) n(i, s);
    }
  }
  export var Pu = [1, 2, 3, 4].map((n) => t0[n].base[0]),
    A1 = [1, 2, 3, 4].map((n) => t0[n].base[2]);
  export function dD(n) {
    if (n <= Pu[0]) return [Math.max(0.3, 1 + (n - Pu[0]) / 0.016), A1[0]];
    for (let e = 0; e < 3; e++)
      if (n <= Pu[e + 1]) {
        let t = (n - Pu[e]) / (Pu[e + 1] - Pu[e]);
        return [1 + e + t, A1[e] + (A1[e + 1] - A1[e]) * t];
      }
    return [Math.min(4.7, 4 + (n - Pu[3]) / 0.016), A1[3]];
  }
  export var R1 = [0, 0, 0, 0];
  export function pD(n, e, t, i) {
    let s = 1e9;
    for (let o = 0; o < 3; o++) {
      let r = Dr(n, o),
        a = Dr(n, o + 1),
        l = a.x - r.x,
        c = a.y - r.y,
        u = a.z - r.z,
        f = l * l + c * c + u * u,
        h = ((e - r.x) * l + (t - r.y) * c + (i - r.z) * u) / f;
      h = Math.max(o === 0 ? -0.5 : 0, Math.min(1, h));
      let p = e - r.x - l * h,
        d = t - r.y - c * h,
        m = i - r.z - u * h,
        x = Math.hypot(p, d, m);
      if (x < s) {
        s = x;
        let v = Lr(n, o, 0),
          y = Lr(n, o, 1),
          b = x || 1;
        ((R1[0] = (o > 0 ? t0[n].len[0] : 0) + (o > 1 ? t0[n].len[1] : 0) + h * t0[n].len[o]),
          (R1[1] = (p * y.x + d * y.y + m * y.z) / b),
          (R1[2] = (p * v.x + d * v.y + m * v.z) / b));
      }
    }
    return ((R1[3] = s), R1);
  }
  export var Qa = (n, e, t) => ((t = Math.min(1, Math.max(0, (t - n) / (e - n)))), t * t * (3 - 2 * t));
  export function dy(n, e, t) {
    let i = (n - 0.066) / (Ah.end - 0.066),
      s = 0.0042 * Math.exp(-Math.pow((n - 0.105) / 0.04, 2)),
      o = 0.005 * Qa(0.19, 0.25, n) * (1 - Qa(0.33, 0.4, n)),
      r = Math.pow(Math.abs(Math.sin((Math.PI * n) / 0.029 + 1.7 * Math.sin(e + 0.5) + 0.8 * Math.sin(2 * e + 1.3))), 0.6) * 2 - 1.25,
      a = Math.pow(Math.abs(Math.sin((Math.PI * n) / 0.036 + 1.9 * Math.sin(e - 0.8) + 0.7 * Math.sin(2 * e))), 0.6) * 2 - 1.25,
      l = Math.sin(n * 38 + 2 * Math.sin(e * 2 + 1)) + 0.6 * Math.sin(3 * e + n * 23),
      c =
        0.041 +
        0.015 * Math.pow(Math.max(0, Math.min(1, i * 1.9)), 0.8) +
        0.0035 * Qa(0.3, 0.42, n) +
        0.0022 * Math.exp(-Math.pow((n - 0.08) / 0.012, 2)),
      u = 0.0016 * Math.exp(-Math.pow(Math.atan2(Math.sin(e + 1.9), Math.cos(e + 1.9)) / 0.1, 2));
    return (t && (t[0] = ((s * r + o * a) / (s + o + 8e-4)) * 0.8 + 0.1 * l), c + s * r + o * a + 0.0015 * l + u);
  }
  export function mD(n) {
    let t = [],
      i = [0],
      s = [
        [0.053, 0.0238, 0],
        [0.049, 0.0262, 0],
        [0.0462, 0.0318, 0],
        [0.0462, 0.0356, 0],
        [0.049, 0.0382, 0],
        [0.053, 0.0388, 0],
        [0.06, 0.0384, 0],
        [0.065, 0.0368, 0],
      ];
    for (let p of s) t.push(p);
    for (let p = 0.072; p < 0.3; p += 0.0072) t.push([p, -1, 0]);
    for (let p = 0.309; p < Ah.end - 0.02; p += 0.015) t.push([p, -1, 0]);
    let o = t.length,
      r = [Ah.end - 0.018, Ah.end - 0.006, Ah.end],
      a = n.pos.length / 3,
      l = [],
      c = (p, d) => {
        let [m, x] = t[p];
        if (x >= 0) {
          let y = Qa(0.0262, 0.0356, x);
          return [Math.cos(d) * x * (1.4 - 0.4 * y), Math.sin(d) * x * (1 - 0.1 * y) + 5e-4, m];
        }
        let v = dy(m, d, i) * (0.9 + 0.1 * Qa(0.066, 0.085, m));
        return [Math.cos(d) * v, Math.sin(d) * v * 0.9 + 5e-4, m];
      },
      u = (p, d, m, x, v) => {
        (n.pos.push(p[0], p[1], p[2]),
          n.nrm.push(d[0], d[1], d[2]),
          n.rest.push(p[0], p[1], p[2], 1),
          n.hand.push(m, v, Math.sin(x), Math.cos(x)));
        let y = Qa(0.095, 0.165, m),
          b = Qa(0.165, 0.235, m),
          g = Qa(Cu.fore - 0.045, Cu.fore + 0.045, m);
        (n.si.push(l0.twist2, l0.twist1, l0.forearm, l0.upperArm), n.sw.push((1 - y) * (1 - g), y * (1 - b) * (1 - g), b * (1 - g), g));
      };
    for (let p = 0; p < o; p++)
      for (let d = 0; d < 24; d++) {
        let m = (d / 24) * Math.PI * 2,
          x = c(p, m),
          y = c(p, m + 0.001),
          b = p < o - 1 ? c(p + 1, m) : null,
          g = p > 0 ? c(p - 1, m) : null,
          E = [y[0] - x[0], y[1] - x[1], y[2] - x[2]],
          M = b || x,
          _ = g || x,
          T = [M[0] - _[0], M[1] - _[1], M[2] - _[2]],
          w = [E[1] * T[2] - E[2] * T[1], E[2] * T[0] - E[0] * T[2], E[0] * T[1] - E[1] * T[0]],
          S = Math.hypot(w[0], w[1], w[2]) || 1;
        ((w = w.map((R) => R / S)), t[p][1] < 0 ? dy(t[p][0], m, i) : (i[0] = 0), u(x, w, t[p][0], m, i[0]), l.push(x));
      }
    for (let p = 0; p < 2; p++)
      for (let d = 0; d < 24; d++) {
        let m = (d / 24) * Math.PI * 2,
          x = [0.8, 0.42][p],
          v = dy(Ah.end - 0.02, m, null),
          y = [Math.cos(m) * v * x, Math.sin(m) * v * 0.9 * x + 5e-4, r[p]],
          b = [0.55, 0.9][p],
          g = Math.sqrt(1 - b * b);
        u(y, [Math.cos(m) * g, Math.sin(m) * g, b], r[p], m, 0);
      }
    u([0, 5e-4, r[2]], [0, 0, 1], r[2], 0, 0);
    let f = o + 2,
      h = a + f * 24;
    for (let p = 0; p < f - 1; p++)
      for (let d = 0; d < 24; d++) {
        let m = a + p * 24 + d,
          x = a + p * 24 + ((d + 1) % 24),
          v = m + 24,
          y = x + 24;
        n.idx.push(m, x, v, x, y, v);
      }
    for (let p = 0; p < 24; p++) n.idx.push(a + (f - 1) * 24 + p, a + (f - 1) * 24 + ((p + 1) % 24), h);
  }
  export var d5 = null;
  export function My(n = {}) {
    if (d5 && !n.force) return d5;
    let e = performance.now();
    xy = 0;
    let t = n.hxy || 0.0034,
      i = n.hzF || 0.0047,
      s = n.hzP || 0.006,
      o = n.hzC || 0.008,
      r = [1e9, 1e9, 1e9],
      a = [-1e9, -1e9, -1e9];
    for (let M of zu) for (let _ = 0; _ < 3; _++) ((r[_] = Math.min(r[_], M.bc[_] - M.br)), (a[_] = Math.max(a[_], M.bc[_] + M.br)));
    let l = 0.006,
      c = fy(r[0] - l, a[0] + l, () => t),
      u = fy(r[1] - l, a[1] + l, () => t),
      f = fy(r[2] - l, a[2] + l, (M) => (M < -0.022 ? i : M < 0.004 ? s : o)),
      { pos: h, idx: p } = fD(c, u, f, [0, 0, -0.05]),
      d = h.length / 3,
      m = {
        pos: h,
        nrm: new Array(d * 3),
        idx: p,
        si: new Array(d * 4),
        sw: new Array(d * 4),
        rest: new Array(d * 4),
        hand: new Array(d * 4),
      },
      x = 6e-4,
      v = [0, 0, 0, 0],
      y = [0, 0, 0, 0],
      b = [0, 0, 0, 0, 0];
    for (let M = 0; M < d; M++) {
      let _ = h[M * 3],
        T = h[M * 3 + 1],
        w = h[M * 3 + 2],
        S = Rh(_ + x, T - x, w - x),
        R = Rh(_ - x, T - x, w + x),
        z = Rh(_ - x, T + x, w - x),
        I = Rh(_ + x, T + x, w + x),
        L = (S - R - z + I) / (4 * x),
        U = (-S - R + z + I) / (4 * x),
        k = (-S + R - z + I) / (4 * x),
        C = L * L + U * U + k * k || 1e-12,
        F = -((S + R + z + I) / 4) / C,
        H = Math.abs(F) * Math.sqrt(C);
      (H > 0.0012 && (F *= 0.0012 / H), (_ += L * F), (T += U * F), (w += k * F), (h[M * 3] = _), (h[M * 3 + 1] = T), (h[M * 3 + 2] = w));
      let N = Math.sqrt(C);
      ((L /= N), (U /= N), (k /= N), (m.nrm[M * 3] = L), (m.nrm[M * 3 + 1] = U), (m.nrm[M * 3 + 2] = k), Rh(_, T, w, !0), Ql.fill(0));
      let Z = 0,
        Q = 1e9;
      for (let G = 0; G < ir; G++) {
        let te = gy[G] / zu[G].R,
          oe = hD(te);
        (oe > Ql[p5[G]] && (Ql[p5[G]] = oe), te < Q && ((Q = te), (Z = p5[G])));
      }
      Ql[Z] < 1e-4 && (Ql[Z] = 1e-4);
      let W = 0;
      for (let G = 1; G < nr; G++) Ql[G] > Ql[W] && (W = G);
      (v.fill(-1), y.fill(0));
      for (let G = 0; G < nr; G++) {
        let te = g5[W * nr + G] ? Ql[G] : 0;
        if (te <= y[3]) continue;
        let oe = 3;
        for (; oe > 0 && te > y[oe - 1];) ((y[oe] = y[oe - 1]), (v[oe] = v[oe - 1]), oe--);
        ((y[oe] = te), (v[oe] = G));
      }
      let J = y[0] + y[1] + y[2] + y[3] || 1;
      for (let G = 0; G < 4; G++) ((m.si[M * 4 + G] = v[G] < 0 ? 0 : v[G]), (m.sw[M * 4 + G] = y[G] / J));
    }
    {
      let M = Array.from({ length: d }, () => []),
        _ = new Set();
      for (let w = 0; w < p.length; w += 3)
        for (let S = 0; S < 3; S++) {
          let R = p[w + S],
            z = p[w + ((S + 1) % 3)],
            I = R < z ? R * d + z : z * d + R;
          _.has(I) || (_.add(I), M[R].push(z), M[z].push(R));
        }
      let T = new Float64Array(nr);
      for (let w = 0; w < (n.relax ?? 3); w++) {
        let S = m.si.slice(),
          R = m.sw.slice();
        for (let z = 0; z < d; z++) {
          T.fill(0);
          let I = M[z],
            L = 1 / I.length;
          for (let k = 0; k < 4; k++) T[S[z * 4 + k]] += R[z * 4 + k];
          for (let k of I) for (let C = 0; C < 4; C++) T[S[k * 4 + C]] += R[k * 4 + C] * L;
          (v.fill(-1), y.fill(0));
          for (let k = 0; k < nr; k++) {
            let C = T[k];
            if (C <= y[3]) continue;
            let A = 3;
            for (; A > 0 && C > y[A - 1];) ((y[A] = y[A - 1]), (v[A] = v[A - 1]), A--);
            ((y[A] = C), (v[A] = k));
          }
          let U = y[0] + y[1] + y[2] + y[3];
          for (let k = 0; k < 4; k++) ((m.si[z * 4 + k] = v[k] < 0 ? 0 : v[k]), (m.sw[z * 4 + k] = y[k] / U));
        }
      }
    }
    for (let M = 0; M < d; M++) {
      let _ = h[M * 3],
        T = h[M * 3 + 1],
        w = h[M * 3 + 2],
        S = m.nrm[M * 3 + 1],
        R = 0;
      b.fill(0);
      for (let A = 0; A < 4; A++) {
        let F = m.si[M * 4 + A],
          H = m.sw[M * 4 + A];
        F >= 5 ? (b[F >= 20 ? ((F - 20) / 3) | 0 : ((F - 5) / 3) | 0] += H) : (R += H);
      }
      let z = dD(_),
        I = (z[1] - w) * R,
        L = z[0] * R,
        U = S * R,
        k = Math.max(-1, Math.min(1, _ / 0.045)) * R,
        C = Math.max(-1, Math.min(1, _ / 0.045));
      for (let A = 0; A < 5; A++)
        if (b[A] > 0) {
          let F = pD(A, _, T, w),
            H = F[1],
            N = F[2];
          if (A === 0) {
            let Z = Qa(0.55, 1.05, F[0] / t0[0].len[0]);
            ((H = S + (H - S) * Z), (N = C + (N - C) * Z));
          }
          ((I += F[0] * b[A]), (L += A * b[A]), (U += H * b[A]), (k += N * b[A]));
        }
      ((m.rest[M * 4] = _),
        (m.rest[M * 4 + 1] = T),
        (m.rest[M * 4 + 2] = w),
        (m.rest[M * 4 + 3] = 0),
        (m.hand[M * 4] = I),
        (m.hand[M * 4 + 1] = L),
        (m.hand[M * 4 + 2] = U),
        (m.hand[M * 4 + 3] = k));
    }
    {
      let M = new Int32Array(d),
        _ = [];
      for (let S = 0; S < d; S++) M[S] = S;
      let T = (S) => {
        for (; M[S] !== S;) S = M[S] = M[M[S]];
        return S;
      };
      for (let S = 0; S < p.length; S += 3)
        for (let R = 0; R < 3; R++) {
          let z = T(p[S + R]),
            I = T(p[S + ((R + 1) % 3)]);
          z !== I &&
            Math.hypot(h[z * 3] - h[I * 3], h[z * 3 + 1] - h[I * 3 + 1], h[z * 3 + 2] - h[I * 3 + 2]) < 25e-5 &&
            (M[Math.max(z, I)] = Math.min(z, I));
        }
      let w = new Int32Array(d).fill(-1);
      for (let S = 0; S < d; S++) T(S) === S && ((w[S] = _.length), _.push(S));
      if (_.length < d) {
        let S = [];
        for (let R = 0; R < p.length; R += 3) {
          let z = w[T(p[R])],
            I = w[T(p[R + 1])],
            L = w[T(p[R + 2])];
          z !== I && I !== L && z !== L && S.push(z, I, L);
        }
        p.length = 0;
        for (let R of S) p.push(R);
        for (let [R, z] of [
          [h, 3],
          [m.nrm, 3],
          [m.si, 4],
          [m.sw, 4],
          [m.rest, 4],
          [m.hand, 4],
        ]) {
          for (let I = 0; I < _.length; I++) for (let L = 0; L < z; L++) R[I * z + L] = R[_[I] * z + L];
          R.length = _.length * z;
        }
      }
    }
    let g = h.length / 3,
      E = p.length / 3;
    return (
      mD(m),
      (d5 = {
        position: Float32Array.from(m.pos),
        normal: Float32Array.from(m.nrm),
        skinIndex: Uint16Array.from(m.si),
        skinWeight: Float32Array.from(m.sw),
        rest: Float32Array.from(m.rest),
        hand: Float32Array.from(m.hand),
        index: Uint32Array.from(m.idx),
        vertexCount: m.pos.length / 3,
        triCount: m.idx.length / 3,
        gloveVerts: g,
        gloveTris: E,
        evals: xy,
        ms: performance.now() - e,
      }),
      d5
    );
  }
  export function qE(n) {
    let e = Float32Array.from(n.position),
      t = Float32Array.from(n.normal),
      i = Uint32Array.from(n.index);
    for (let s = 0; s < e.length; s += 3) ((e[s] = -e[s]), (t[s] = -t[s]));
    for (let s = 0; s < i.length; s += 3) {
      let o = i[s + 1];
      ((i[s + 1] = i[s + 2]), (i[s + 2] = o));
    }
    return { ...n, position: e, normal: t, index: i };
  }
  export var D1 = K,
    _y = St,
    ZE = Je,
    mi = (n, e, t) => new D1(n, e, t);
  export function Ch(n, e, t) {
    let i = e.clone().normalize(),
      s = t.clone().negate();
    s.addScaledVector(i, -s.dot(i)).normalize();
    let o = new D1().crossVectors(i, s);
    return { p: n.clone(), q: new _y().setFromRotationMatrix(new ZE().makeBasis(o, i, s)) };
  }
  export function z1(n, e, t, i, s, o, r, a) {
    return mn(n.toArray(), [s, o, r], new _y().setFromRotationMatrix(new ZE().makeBasis(e, t, i)), a);
  }
  export var XE = mi(0, 1, 0),
    nn = {};
  export function tc(n) {
    let e = mi(Math.cos(n.tilt), 0, Math.sin(n.tilt)),
      t = mi(Math.sin(n.tilt), 0, -Math.cos(n.tilt)),
      i = mi(...n.web),
      s = Math.cos(n.roll),
      o = Math.sin(n.roll),
      r = t.clone().multiplyScalar(s).addScaledVector(XE, -o),
      a = t.clone().multiplyScalar(-o).addScaledVector(XE, -s),
      l = n.roll >= 0 ? i.clone() : i.clone().addScaledVector(t, n.depth).addScaledVector(r, -n.depth),
      c = n.pad || [0, 0, 0];
    l.addScaledVector(e, -(n.drop || 0)).addScaledVector(a, c[0]);
    let u = l
        .clone()
        .addScaledVector(e, n.len / 2 - 0.004)
        .addScaledVector(r, n.depth / 2)
        .addScaledVector(a, n.width / 2),
      f = a.clone().negate(),
      h = [z1(u, e, f, r.clone().negate(), n.len / 2, n.width / 2, n.depth / 2, n.round)];
    if (n.pad) {
      let y = n.pad[2],
        b = n.len - 0.004 - y;
      h.push(
        z1(
          l
            .clone()
            .addScaledVector(e, y + b / 2)
            .addScaledVector(r, (n.depth + c[1]) / 2)
            .addScaledVector(a, (n.width - c[0]) / 2),
          e,
          f,
          r.clone().negate(),
          b / 2,
          (n.width + c[0]) / 2,
          (n.depth + c[1]) / 2,
          n.round + 0.003,
        ),
      );
    }
    let p = e.clone().multiplyScalar(-Math.cos(n.rake)).addScaledVector(r, -Math.sin(n.rake)),
      d = r.clone().multiplyScalar(Math.cos(n.rake)).addScaledVector(e, -Math.sin(n.rake)),
      m = l
        .clone()
        .addScaledVector(a, n.width / 2)
        .addScaledVector(e, -0.004),
      x = (y, b) => m.clone().addScaledVector(d, y).addScaledVector(p, b);
    (h.push(
      z1(
        x((n.top[0] + n.top[1]) / 2, n.top[2] + n.top[3] / 2),
        p.clone().negate(),
        f,
        d.clone().negate(),
        n.top[3] / 2,
        n.topW / 2,
        (n.top[1] - n.top[0]) / 2,
        0.004,
      ),
    ),
      h.push(vs(x(n.guard[0], n.guard[2]).toArray(), x(n.guard[1], n.guard[2]).toArray(), 0.0035)));
    let v = x(n.trigger[0], n.trigger[1]);
    return {
      colliders: h,
      frame: Ch(m, p, d),
      trigger: [v.clone().addScaledVector(a, -0.004).toArray(), v.clone().addScaledVector(a, 0.004).toArray()],
      a: e,
      f: r,
      n: a,
    };
  }
  export var YE = [0.1, 1.62, 1.02, 0],
    el = [1.55, 1.78, 1.08, 0],
    gD = [0.1, 1.62, 1.02, -0.1],
    y5 = [1.55, 1.78, 1.08, -0.1],
    b5 = d0({ thumb: [1.3, 0, 0, 1], index: [-0.45, 0.1, 0.06, 0.36], middle: gD, ring: YE, little: YE }),
    I1 = tc({
      web: [-0.0335, -0.012, -0.045],
      tilt: 0.22,
      roll: -0.3,
      drop: 0.012,
      rake: 0.3,
      len: 0.094,
      width: 0.028,
      depth: 0.045,
      round: 0.009,
      top: [0.012, 0.2, 0.005, 0.04],
      topW: 0.034,
      guard: [0.036, 0.1, -0.024],
      trigger: [0.084, -0.01],
    }),
    jE = [1.3, 0.55, 0.6, -0.1],
    wy = [0.8, 0.1, 0.06, 0.36];
  nn.rifle_grip = {
    ...I1,
    about:
      "firing hand on an AR-style pistol grip, index straight along the receiver. Frame: origin at the top rear of the grip (where the web of the thumb sits), +Y up, -Z muzzle.",
    fit: { from: b5, to: d0({ thumb: jE, index: wy, middle: y5, ring: el, little: el }) },
  };
  nn.trigger = {
    ...I1,
    about: "same grip with the index pad on the trigger (colliders include the trigger as a thin bar). setTrigger(0..1) pulls.",
    colliders: I1.colliders.concat([vs(I1.trigger[0], I1.trigger[1], 0.0032)]),
    fit: {
      from: d0({ index: [-0.25, 0.2, 0.1, 0.16] }, b5),
      to: d0({ thumb: jE, index: [0.34, 1.6, 0.95, 0.2], middle: y5, ring: el, little: el }),
    },
  };
  export var KE = tc({
    web: [-0.0335, -0.012, -0.045],
    tilt: 0.16,
    roll: -0.2,
    drop: 0.008,
    rake: 0.31,
    len: 0.1,
    width: 0.03,
    depth: 0.05,
    round: 0.011,
    top: [0.012, 0.15, 0.004, 0.032],
    topW: 0.027,
    guard: [0.04, 0.096, -0.03],
    trigger: [0.082, -0.013],
  });
  nn.pistol_grip = {
    ...KE,
    about:
      "high firing grip on a service pistol, index straight along the frame. Frame: origin at the top of the backstrap under the beavertail, +Y up, -Z muzzle.",
    fit: { from: b5, to: d0({ thumb: [0.95, 0.18, 0.22, 0.3], index: wy, middle: y5, ring: el, little: el }) },
  };
  nn.slide_stop = {
    ...KE,
    about: "pistol_grip with the thumb pressing the slide stop down (the lever sits on the left of the frame above the trigger).",
    fit: { from: b5, to: d0({ thumb: [1.15, 0.52, 0.66, 0.34], index: wy, middle: y5, ring: el, little: el }) },
  };
  {
    let n = tc({
      web: [-0.0335, -0.012, -0.029],
      tilt: -0.45,
      roll: 0,
      drop: 0.016,
      pad: [0.014, 0.017, 0.03],
      rake: 0.31,
      len: 0.1,
      width: 0.03,
      depth: 0.05,
      round: 0.014,
      top: [0.012, 0.15, 0.004, 0.032],
      topW: 0.027,
      guard: [0.04, 0.096, -0.03],
      trigger: [0.082, -0.013],
    });
    nn.pistol_support = {
      ...n,
      about:
        "support hand wrapped over the firing hand's fingers (the grip shape is padded by those fingers), thumb forward along the frame. Frame: the SAME part frame as pistol_grip (the pistol's tang), so both hands take one frame.",
      fit: {
        from: d0({ thumb: [0, -0.1, -0.1, 0.7], fingers: [-0.2, 1.1, 0.6, 0] }),
        to: d0({ thumb: [0.6, 0.2, 0.2, 0.7], fingers: el }),
      },
    };
  }
  {
    let n = mi(-0.05, -0.0315, -0.078),
      e = mi(0.042, -0.0315, -0.066),
      t = n.clone().sub(e).normalize(),
      i = mi(0.1, -0.5, -0.86);
    i.addScaledVector(t, -i.dot(t)).normalize();
    let s = new D1().crossVectors(i, t);
    nn.foregrip = {
      colliders: [vs(n.toArray(), e.toArray(), 0.0165), z1(n.clone().addScaledVector(t, 0.03), t, s, i, 0.021, 0.022, 0.1, 0.006)],
      frame: Ch(n.clone().addScaledVector(t, 0.009), t, i),
      about:
        "fist round a vertical foregrip. Frame: origin at the top of the grip where it meets the handguard, +Y up along the grip, -Z muzzle (the hand may be turned about +Y freely).",
      fit: {
        from: d0({ thumb: [1.25, 0, 0, 0.85], fingers: [-0.05, 0.04, 0.02, 0] }),
        to: d0({ thumb: [1.25, 0.55, 0.7, -0.12], fingers: [1.5, 1.8, 1.1, -0.02] }),
      },
    };
  }
  {
    let n = mi(0, -0.0375, -0.082);
    nn.handguard = {
      colliders: [mn(n.toArray(), [0.09, 0.0225, 0.0225], null, 0.012)],
      frame: Ch(n, mi(0, -1, 0), mi(-1, 0, 0)),
      about:
        "support hand cupped under a ~45 mm handguard, fingers up the far side, thumb along the near side pointing at the muzzle. Frame: origin on the handguard's centre line under the middle of the palm, +Y up, -Z muzzle.",
      fit: {
        from: d0({ thumb: [0.25, -0.1, -0.2, 1], fingers: [-0.05, 0.04, 0.02, 0.04] }),
        to: d0({ thumb: [1.2, 0.3, 0.35, 1], fingers: [1.5, 1.6, 1, 0] }),
      },
    };
  }
  {
    let n = mi(0.004, -0.1035, -0.059);
    nn.mag_cup = {
      colliders: [mn(n.toArray(), [0.012, 0.09, 0.031], null, 0.003)],
      frame: Ch(mi(0.004, -0.0135, -0.059), mi(0, -1, 0), mi(0, 0, -1)),
      about:
        "palm up under a magazine base plate, fingers up its front face, thumb up its side. Frame: origin at the centre of the base plate, +Y along the magazine toward the gun, -Z the magazine's front (bullet noses).",
      fit: {
        from: d0({ thumb: [0.9, 0, 0, 0.9], fingers: [0.2, 0.05, 0.02, 0] }),
        to: d0({
          thumb: [1.3, 0.3, 0.3, -0.1],
          index: [1.42, 0.3, 0.2, 0],
          middle: [1.6, 0.3, 0.2, 0],
          ring: [1.6, 0.3, 0.2, 0],
          little: [1.36, 0.34, 0.22, 0],
        }),
      },
    };
  }
  {
    let e = mi(0, Math.cos(0.95), Math.sin(0.95)),
      t = mi(0, -Math.sin(0.95), Math.cos(0.95)),
      i = mi(-0.006, -0.05, -0.088);
    nn.mag_pinch = {
      colliders: [z1(i, mi(1, 0, 0), e, t, 0.09, 0.012, 0.031, 0.003)],
      frame: Ch(i, mi(-1, 0, 0), t.clone().negate()),
      about:
        "a magazine held by its flat sides between the thumb and the fingers. Frame: origin at the middle of the magazine body, +Y toward its feed lips, -Z its front.",
      fit: {
        from: d0({ thumb: [0.55, -0.1, -0.2, 1], fingers: [0.35, 0.1, 0.05, 0] }),
        to: d0({ thumb: [1.25, 0.5, 0.5, 0.1], fingers: [1.3, 1.1, 0.6, 0] }),
      },
    };
  }
  {
    let n = d0({ fingers: [0.3, 1.25, 0.85, 0] }),
      e = ra(n, tr()),
      t = e.j[5].clone().lerp(e.j[6], 0.62),
      i = e.j[9].clone().lerp(e.j[10], 0.62),
      s = mi(0, -1, 0).applyQuaternion(e.q[4]),
      o = t.clone().addScaledVector(s, t0[1].rad[1] + 0.006),
      r = i.clone().addScaledVector(mi(0, -1, 0).applyQuaternion(e.q[7]), t0[2].rad[1] + 0.006),
      a = r.clone().sub(o).normalize();
    (o.addScaledVector(a, -0.016), r.addScaledVector(a, 0.014));
    let l = o.clone().add(r).multiplyScalar(0.5),
      c = mi(0, 0, 1).applyQuaternion(e.q[4]).negate();
    nn.charging_handle = {
      colliders: [vs(o.toArray(), r.toArray(), 0.005)],
      frame: Ch(l, new D1().crossVectors(a, c), c.clone()),
      about:
        "index and middle fingers hooked over an AR charging handle, the others folded. Frame: origin at the middle of the handle, +Y up, -Z muzzle (rack by moving the hand along +Z of the part).",
      fit: {
        digits: [1, 2],
        rest: d0({ thumb: [0.25, 0.2, 0.3, 0.45], ring: [1.3, 1.55, 0.9, 0], little: [1.3, 1.5, 0.85, -0.04] }),
        from: d0({ fingers: [0.3, 0.35, 0.2, 0] }),
        to: d0({ fingers: [0.3, 1.8, 1.25, 0] }),
      },
    };
  }
  export var $E = new _y(),
    xD = new D1();
  export function M5(n, e, t, i, s) {
    let o = nn[n];
    if (!o) throw new Error('weapon_hands: unknown grip "' + n + '"');
    return ($E.copy(o.frame.q).invert(), s.copy(t).multiply($E), i.copy(xD.copy(o.frame.p).negate().applyQuaternion(s)).add(e), i);
  }
  export var vD = {
    from: d0({ thumb: [1.3, 0, 0, 0.95] }, di.open),
    to: d0({
      thumb: [1.15, 0.75, 0.95, 0.1],
      index: [1.5, 1.9, 1.3, -0.04],
      middle: [1.52, 1.9, 1.3, 0],
      ring: [1.54, 1.9, 1.3, -0.03],
      little: [1.56, 1.9, 1.3, -0.08],
    }),
  };
  export function Ey() {
    let n = { fist: Jl([], { ...vD, palm: Fr }) };
    for (let e in nn) n[e] = Jl(nn[e].colliders, { ...nn[e].fit, palm: Fr });
    return n;
  }
