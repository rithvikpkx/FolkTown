import { Vector3 as K, Quaternion as St, Matrix4 as Je, BufferGeometry as pt, BufferAttribute as nt, Sphere as an, Box3 as B0, Euler as _0, Group as At, Bone as qr, TriangleFanDrawMode as vx, Skeleton as _a, SkinnedMesh as Gr, LinearFilter as x0, SrcAlphaFactor as hd, CircleGeometry as Bc, AddOperation as ox, MixOperation as sx, LinearToneMapping as rx, Float32BufferAttribute as et, Mesh as ht, MeshStandardMaterial as L0, Color as Qe } from 'three';
import * as ut from 'three';
import { Ey, di, Cu, l0, T1, t0, Eh, nn, xs, jl, er, mn, vs, ly, M5, tn, LE, d0, Kl, Th, P1, cy, Fr, Jl, qE, My, _h, Un, vy, Za, FE, tr, Sh, h5, ra, z1, wn, Ot, tc, TE, M1, ME, l5, Au, ft, Tu, bh, dn, Ru, yh, h0, oy, kn, sy, Eu, Nn, Mt, b0, Q0, m0, Su, $a, Fs, Zl, wh, It, _E, pn, iy, Xn, oa, CE, en, sa, ry } from './weapon.js';
import { ar } from './ns.js';
import { attachModel } from '../weapons/models.js';
import { ik, ao } from './render.js';
import { Ro, Ia, u0, ev, Is, j0, Hn } from './common.js';
import { st, at, jP } from './fx.js';
import { x1 } from './audio.js';
import { hw } from './level.js';
import { sh, nw } from './props.js';
import { mk } from './mats.js';
import { kP } from './ground.js';
import { __late as __late_render } from './render.js';
import { __late as __late_props } from './props.js';
import { __late as __late_fx } from './fx.js';
import { __late as __late_audio } from './audio.js';
import { __late as __late_weapon } from './weapon.js';
__late_render.ca(ca);
__late_weapon.I5(I5);
__late_weapon.BD(BD);

export function JE(n = Ey()) {
    for (let e in n) di[e] = n[e];
    return di;
  }
  export var zy = {};
  ar(zy, {
    ARM: () => Cu,
    BONE: () => l0,
    BONE_NAMES: () => T1,
    COLORS: () => Ay,
    DEFAULT_POLE: () => S5,
    DIGITS: () => t0,
    DIGIT_NAMES: () => Eh,
    GRIPS: () => nn,
    LIMITS: () => xs,
    POSES: () => di,
    REST: () => jl,
    SHOULDER: () => er,
    TRIGGER_PULL: () => oS,
    TWIST_SHARE: () => Iy,
    WETNESS: () => kh,
    WRIST_LIMITS: () => sS,
    armGeometry: () => aS,
    armMaterial: () => lS,
    box: () => mn,
    capsule: () => vs,
    clampPose: () => ly,
    createArm: () => Fh,
    fitGrip: () => rS,
    fitReferencePoses: () => Ey,
    handSocket: () => M5,
    lerpPose: () => tn,
    limitViolation: () => LE,
    makePose: () => d0,
    mirrorColliders: () => Lh,
    penetration: () => Kl,
    selfPenetration: () => wD,
    showcase: () => TD,
    transformColliders: () => Th,
  });
  export var Ay = {
      olive: [0.15, 0.156, 0.094],
      gusset: [0.066, 0.071, 0.05],
      tan: [0.33, 0.245, 0.14],
      tanDark: [0.235, 0.172, 0.1],
      rubber: [0.06, 0.062, 0.068],
      stitch: [0.5, 0.44, 0.3],
      cuff: [0.062, 0.066, 0.056],
      strap: [0.036, 0.038, 0.04],
      tab: [0.56, 0.15, 0.03],
      navy: [0.046, 0.068, 0.106],
      hem: [0.028, 0.04, 0.062],
      orange: [0.5, 0.145, 0.028],
      refl: [0.42, 0.42, 0.4],
    },
    kh = { value: 0.7 },
    ys = Ay,
    L1 = t0.map((n) => [n.len[0], n.len[0] + n.len[1], n.total]),
    Ty = P1.web,
    yD = Ty.c.map((n, e) => n - Ty.ab[e] * 0.009),
    Du = Ty.ab.map((n) => n * 0.018),
    bD = Du[0] * Du[0] + Du[1] * Du[1] + Du[2] * Du[2],
    nc = P1.guard.map((n) => [
      n.c[0],
      n.c[1],
      n.c[2],
      Math.cos(n.yaw),
      Math.sin(n.yaw),
      1 / (n.r[0] + 0.001),
      1 / (n.r[1] + 0.0035),
      1 / (n.r[2] + 0.001),
    ]),
    _5 = [0.0165, -0.037, 0.02, 0.028],
    w5 = [-0.047, 0.0085, 0.22];
  export var En = (n) => {
      let e = (+n).toPrecision(6).replace(/\.?0+$/, "");
      return /[.e]/.test(e) ? e : e + ".0";
    },
    Ui = (n) => `vec3(${n.map(En).join(", ")})`,
    Sy = (n) =>
      `(F < 0.5 ? ${En(L1[0][n])} : F < 1.5 ? ${En(L1[1][n])} : F < 2.5 ? ${En(L1[2][n])} : F < 3.5 ? ${En(L1[3][n])} : ${En(L1[4][n])})`,
    MD = `
float aBand(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }
float aHash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float aNoise(vec3 x) { vec3 i = floor(x), q = fract(x); q = q * q * (3.0 - 2.0 * q);
  return mix(mix(mix(aHash(i), aHash(i + vec3(1, 0, 0)), q.x), mix(aHash(i + vec3(0, 1, 0)), aHash(i + vec3(1, 1, 0)), q.x), q.y),
             mix(mix(aHash(i + vec3(0, 0, 1)), aHash(i + vec3(1, 0, 1)), q.x), mix(aHash(i + vec3(0, 1, 1)), aHash(i + vec3(1, 1, 1)), q.x), q.y), q.z); }
// hc = (A, F, D, S), rs = rest position + zone. Returns albedo; rough, h (metres), kind as in surfaceJS.
vec3 armSurface(vec4 hc, vec4 rs, float gD, out float rough, out float h, out float kind) {
  float A = hc.x, F = hc.y, D = hc.z, S = hc.w, x = rs.x, y = rs.y, z = rs.z; vec3 col; h = 0.0;
  if (rs.w > 0.5) {
    float ang = atan(D, S);
    col = ${Ui(ys.navy)}; rough = 0.50; kind = 4.0;
    col *= 0.80 + 0.26 * smoothstep(-0.9, 0.6, F);
    float bandM = aBand(A, 0.128, 0.172, 0.0012), refl = aBand(A, 0.1445, 0.1555, 0.0008);
    col = mix(col, ${Ui(ys.orange)}, bandM); col = mix(col, ${Ui(ys.refl)}, refl); rough = mix(rough, 0.62, bandM); rough = mix(rough, 0.30, refl); kind = mix(kind, 5.0, refl);
    h += 0.00035 * bandM + 0.00015 * refl;
    float edge = aBand(A, 0.1268, 0.1292, 0.0006) + aBand(A, 0.1708, 0.1732, 0.0006);
    col = mix(col, ${Ui(ys.stitch)}, 0.55 * edge * step(fract(ang * 9.5), 0.62));
    float hem = 1.0 - smoothstep(0.0655, 0.0675, A), rib = 0.5 + 0.5 * cos(ang * 44.0);
    col = mix(col, ${Ui(ys.hem)}, hem); col *= mix(1.0, 0.62 + 0.5 * rib, hem); h += 0.0007 * rib * hem; rough = mix(rough, 0.82, hem); kind = mix(kind, 3.0, hem);
    float sa = atan(sin(ang + 1.9), cos(ang + 1.9)) / 0.045, seam = exp(-sa * sa) * (1.0 - hem);
    rough = mix(rough, 0.34, seam * 0.8); col *= 1.0 - 0.25 * seam;
  } else {
    float j1 = ${Sy(0)}, j2 = ${Sy(1)}, j3 = ${Sy(2)};
    float u = A < j1 ? A / j1 : A < j2 ? 1.0 + (A - j1) / (j2 - j1) : 2.0 + (A - j2) / (j3 - j2);
    float thumb = 1.0 - smoothstep(0.35, 0.65, F), digit = smoothstep(0.003, 0.010, A), cuff = smoothstep(0.0045, 0.0060, z);
    float sw = 0.025 + 0.31 * digit * mix(1.0, smoothstep(0.9, 1.15, u), thumb);
    float back = smoothstep(sw - 0.035, sw + 0.035, D), palmar = 1.0 - smoothstep(-sw - 0.035, -sw + 0.035, D), side = 1.0 - back - palmar;
    float r = length(rs.xyz);
    col = ${Ui(ys.olive)}; rough = 0.92; kind = 0.0;
    col = mix(col, ${Ui(ys.gusset)}, side); rough = mix(rough, 0.95, side);
    col = mix(col, ${Ui(ys.tan)}, palmar); rough = mix(rough, 0.66, palmar); kind = mix(kind, 1.0, palmar);
    float cap = smoothstep(2.40, 2.46, u) * (1.0 - palmar);
    col = mix(col, ${Ui(ys.tan)}, cap); rough = mix(rough, 0.66, cap); kind = mix(kind, 1.0, cap);
    float ex = (x - ${En(_5[0])}) / ${En(_5[2])}, ez = (z - ${En(_5[1])}) / ${En(_5[3])}, he = sqrt(ex * ex + ez * ez), heelOn = palmar * (1.0 - digit);
    float heel = (1.0 - smoothstep(0.94, 1.0, he)) * heelOn;
    vec3 wv = rs.xyz - ${Ui(yD)}, sdv = ${Ui(Du)}; float wt = clamp(dot(wv, sdv) / ${En(bD)}, 0.0, 1.0);
    float sdist = length(wv - sdv * wt), saddle = (1.0 - smoothstep(0.0158, 0.0168, sdist)) * (1.0 - smoothstep(0.30, 0.50, D));
    float reinf = max(heel, saddle) * (1.0 - cuff);
    col = mix(col, ${Ui(ys.tanDark)}, reinf); rough = mix(rough, 0.76, reinf); h += 0.0005 * reinf; kind = mix(kind, 1.0, reinf);
    float prow = max(aBand(he, 0.86, 0.89, 0.012) * heelOn, aBand(sdist, 0.0138, 0.0144, 0.0003) * (1.0 - smoothstep(-0.25, -0.05, D))) * (1.0 - cuff);
    float ge = 9.0, gE; vec3 gv; vec2 gl = vec2(0.0), gL;
${nc.map(
  (n) =>
    `    gv = rs.xyz - ${Ui(n.slice(0, 3))}; gL = vec2(gv.x * ${En(n[3])} - gv.z * ${En(n[4])}, gv.x * ${En(n[4])} + gv.z * ${En(n[3])}); gE = length(vec3(gL.x * ${En(n[5])}, gv.y * ${En(n[6])}, gL.y * ${En(n[7])})); if (gE < ge) { ge = gE; gl = gL; }`,
).join(`
`)}
    float gs = 9.0; vec2 gp, gb;
${[0, 1, 2].map(
  (n) =>
    `    gp = rs.xz - vec2(${En(nc[n][0])}, ${En(nc[n][2] + 0.0045)}); gb = vec2(${En(nc[n + 1][0] - nc[n][0])}, ${En(nc[n + 1][2] - nc[n][2])}); gs = min(gs, length(gp - gb * clamp(dot(gp, gb) / dot(gb, gb), 0.0, 1.0)));`,
).join(`
`)}
    float lobe = clamp(1.15 - ge, 0.0, 1.0), guard = max(1.0 - smoothstep(0.94, 1.0, ge), (1.0 - smoothstep(0.0066, 0.0074, gs)) * smoothstep(0.004, 0.006, y - ${En(nc[1][1] - 0.011)})) * smoothstep(0.15, 0.35, D);
    float top = smoothstep(0.835, 0.875, D), fs = fract(u);
    float ribs = aBand(fs, 0.24, 0.80, 0.02) * (1.0 - 0.85 * (aBand(fs, 0.405, 0.435, 0.008) + aBand(fs, 0.605, 0.635, 0.008)));
    float bars = top * ribs * (u < 2.0 ? 1.0 : 0.0) * (u < 1.0 ? 1.0 - thumb : 1.0) * digit;
    float rz = (${En(w5[0])} + ${En(w5[2])} * x - z) / ${En(w5[1])}, ri = clamp(floor(rz + 0.5), 0.0, 2.0);
    float plate = aBand((rz - ri) * ${En(w5[1])}, -0.0016, 0.0016, 0.0006) * aBand(x, -0.0175 + 0.004 * ri, 0.0200 - 0.002 * ri, 0.0012) * smoothstep(0.62, 0.70, D) * (1.0 - digit);
    float rub = max(guard, max(bars, plate));
    col = mix(col, ${Ui(ys.rubber)}, rub); rough = mix(rough, 0.46, rub); kind = mix(kind, 2.0, rub);
    float rim = aBand(ge, 0.80, 0.87, 0.02) * guard;
    float slot = (aBand(gl.y, -0.0052, -0.0036, 0.0004) + aBand(gl.y, 0.0012, 0.0028, 0.0004)) * aBand(gl.x, -0.0052, 0.0052, 0.0006) * (1.0 - smoothstep(0.70, 0.80, ge)) * guard;
    h += 0.0011 * bars + 0.0010 * plate + 0.0006 * guard * (0.4 + 0.6 * lobe) - 0.00035 * rim - 0.0006 * slot;
    col *= (1.0 + 0.5 * guard * lobe * lobe) * (1.0 - 0.3 * rim) * (1.0 - 0.55 * slot);
    float dash = step(fract(r / 0.0024), 0.60), free = (1.0 - rub) * (1.0 - cuff) * (1.0 - saddle);
    float gd = clamp(gD, 25.0, 700.0), sA = abs(D - sw) / gd, sB = abs(D + sw) / gd, sd = min(sA, sB), groove = (1.0 - smoothstep(0.0, 0.0006, sd)) * free;
    float row = aBand(sd, 0.0010, 0.0016, 0.00025) * free * (sA < sB ? step(sw, D) : step(D, -sw));
    float cs = abs(u - 2.43) * (j3 - j2), capSeam = (1.0 - smoothstep(0.0, 0.0006, cs)) * (1.0 - palmar);
    float capRow = aBand(cs, 0.0010, 0.0016, 0.00025) * (1.0 - palmar) * step(fract(S * 5.5 + D * 2.0), 0.6);
    float gr = max(groove, capSeam); h -= 0.00045 * gr; col *= 1.0 - 0.45 * gr;
    float st = max(row * dash, max(capRow, prow * 0.55)); col = mix(col, ${Ui(ys.stitch)}, 0.85 * st); h += 0.00022 * st;
    float c1 = (A - j1) / 0.0013, c2 = (A - j2) / 0.0013, c0 = (A - 0.0135) / 0.0014;
    float cre = (exp(-c1 * c1) + exp(-c2 * c2)) * digit, root = exp(-c0 * c0) * (1.0 - thumb) * palmar;
    h -= 0.0006 * (cre * palmar + root) + 0.00025 * cre * back * (1.0 - rub); col *= 1.0 - 0.35 * (cre * palmar + root);
    float ang = atan(y, x), rib = 0.5 + 0.5 * cos(ang * 46.0);
    col = mix(col, ${Ui(ys.cuff)}, cuff); col *= mix(1.0, 0.70 + 0.45 * rib, cuff); h = mix(h, 0.0005 * rib, cuff); rough = mix(rough, 0.88, cuff); kind = mix(kind, 3.0, cuff);
    float strap = aBand(z, 0.0165, 0.0345, 0.0005) * smoothstep(-0.55, -0.45, D) * cuff;
    col = mix(col, ${Ui(ys.strap)}, strap); h = mix(h, 0.0012, strap); rough = mix(rough, 0.80, strap); kind = mix(kind, 0.0, strap);
    float tabE = strap * aBand(x, 0.0080, 0.0280, 0.0008) * smoothstep(0.2, 0.3, D); col = mix(col, ${Ui(ys.rubber)}, tabE); h += 0.0009 * tabE; rough = mix(rough, 0.45, tabE); kind = mix(kind, 2.0, tabE);
    float srow = strap * (1.0 - tabE) * (aBand(z, 0.0176, 0.0186, 0.0003) + aBand(z, 0.0324, 0.0334, 0.0003)) * step(fract(ang * 14.0), 0.6); col = mix(col, ${Ui(ys.stitch)}, 0.8 * srow);
    float tab = aBand(z, 0.0078, 0.0140, 0.0003) * aBand(x, -0.0225, -0.0090, 0.0005) * smoothstep(0.3, 0.4, D); col = mix(col, ${Ui(ys.tab)}, tab); h += 0.0006 * tab; rough = mix(rough, 0.7, tab); kind = mix(kind, 0.0, tab);
    col *= 1.0 - 0.4 * aBand(z, 0.0040, 0.0064, 0.0006);
  }
  return col;
}
// sub-millimetre detail by kind: weave (0), pebbled grain (1), moulded rubber (2), knit rib (3), waxed ripstop + beads (4), glass bead tape (5)
vec3 armMicro(vec3 col, vec4 hc, vec4 rs, vec3 rn, float kind, float wet, inout float rough, inout float h) {
  vec3 p = rs.xyz, an = abs(rn); an = an * an; an /= an.x + an.y + an.z + 1e-5;
  float px = max(length(dFdx(p)), length(dFdy(p))), fine = 1.0 - smoothstep(0.00018, 0.00050, px);      // fade detail the pixels cannot hold
  float wf = 5712.0, weave = (sin(p.y * wf) * sin(p.z * wf)) * an.x + (sin(p.x * wf) * sin(p.z * wf)) * an.y + (sin(p.x * wf) * sin(p.y * wf)) * an.z;
  float n1 = aNoise(p * 950.0), n2 = aNoise(p * 2300.0 + 7.3), big = aNoise(p * 90.0 + 3.1);
  float kFab = 1.0 - min(1.0, abs(kind - 0.0)), kLea = 1.0 - min(1.0, abs(kind - 1.0)), kRub = 1.0 - min(1.0, abs(kind - 2.0)), kRib = 1.0 - min(1.0, abs(kind - 3.0)), kShell = 1.0 - min(1.0, abs(kind - 4.0)), kRefl = 1.0 - min(1.0, abs(kind - 5.0));
  h += fine * (kFab * 0.00005 * weave + kLea * 0.00011 * (n1 * 0.7 + n2 * 0.3 - 0.5) + kRub * 0.00003 * (n2 - 0.5) + kRib * 0.00006 * weave + kShell * 0.000035 * weave + kRefl * 0.00004 * (n2 - 0.5));
  col *= 1.0 + fine * (kFab * 0.06 * weave + kLea * 0.16 * (n1 - 0.5) + kRib * 0.08 * weave + kShell * 0.04 * weave) + (big - 0.5) * (0.16 * kLea + 0.10 * kFab + 0.10 * kShell + 0.06 * kRub);
  rough += (big - 0.5) * (0.10 * kLea + 0.10 * kShell + 0.12 * kRub) + fine * (n1 - 0.5) * 0.10 * kLea;
  // rain beads on the shell (laid out in the sleeve's own angle / length coordinates) and, sparser, on the rubber
  if (wet > 0.01 && (kShell + kRefl + kRub) > 0.3) {
    vec2 q = rs.w > 0.5 ? vec2(atan(hc.z, hc.w) * 0.046, hc.x) : vec2(dot(p, vec3(0.8, 0.0, 0.6)), dot(p, vec3(-0.42, 0.7, 0.57)));
    float bead = 0.0, wetR = 0.0;
    for (int o = 0; o < 2; o++) {
      float cell = o == 0 ? 0.0085 : 0.0041; vec2 g = q / cell + float(o) * 13.7, id = floor(g), fr = fract(g);
      float r1 = aHash(vec3(id, 1.0 + float(o))), r2 = aHash(vec3(id, 5.0)), r3 = aHash(vec3(id, 9.0));
      float rad = (o == 0 ? 0.0019 : 0.0010) * (0.55 + 0.6 * r3), on = step(r1, (o == 0 ? 0.42 : 0.5) * wet * (rs.w > 0.5 ? 1.0 : 0.5));
      float d = length((fr - (0.25 + 0.5 * vec2(r2, r3))) * cell) / rad;
      bead = max(bead, on * sqrt(max(0.0, 1.0 - d * d)) * rad * 0.55); wetR = max(wetR, on * (1.0 - smoothstep(0.85, 1.0, d)));
    }
    h += bead; rough = mix(rough, 0.07, wetR); col *= 1.0 - 0.18 * wetR;
  }
  rough = clamp(rough, 0.05, 1.0);
  return col;
}
vec3 armBump(vec3 N, vec3 vp, float h) {
  vec3 dpx = dFdx(vp), dpy = dFdy(vp), r1 = cross(dpy, N), r2 = cross(N, dpx);
  float det = dot(dpx, r1); vec3 g = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  return normalize(abs(det) * N - g);
}
`;
  export function QE(n) {
    let e = new n.MeshStandardMaterial({ color: 16777215, roughness: 0.8, metalness: 0 });
    return (
      (e.name = "saltline_arm"),
      (e.onBeforeCompile = (t) => {
        ((t.uniforms.uArmWet = kh),
          (t.vertexShader = t.vertexShader
            .replace(
              "#include <common>",
              `#include <common>
attribute vec4 aRest; attribute vec4 aHand; varying vec4 vArmRest; varying vec4 vArmHand; varying vec3 vArmN;`,
            )
            .replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
vArmRest = aRest; vArmHand = aHand; vArmN = normal;`,
            )),
          (t.fragmentShader = t.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>
uniform float uArmWet; varying vec4 vArmRest; varying vec4 vArmHand; varying vec3 vArmN;
` + MD,
            )
            .replace(
              "#include <map_fragment>",
              `#include <map_fragment>
  vec3 armPx = dFdx(-vViewPosition), armPy = dFdy(-vViewPosition), armNg = normalize(cross(armPx, armPy)), armR1 = cross(armPy, armNg), armR2 = cross(armNg, armPx);
  float armGD = length(dFdx(vArmHand.z) * armR1 + dFdy(vArmHand.z) * armR2) / max(abs(dot(armPx, armR1)), 1e-12);
  float armRough, armH, armKind; vec3 armCol = armSurface(vArmHand, vArmRest, armGD, armRough, armH, armKind);
  armCol = armMicro(armCol, vArmHand, vArmRest, normalize(vArmN), armKind, uArmWet, armRough, armH);
  diffuseColor.rgb = armCol;`,
            )
            .replace(
              "#include <roughnessmap_fragment>",
              `#include <roughnessmap_fragment>
  roughnessFactor = armRough;`,
            )
            .replace(
              "#include <normal_fragment_maps>",
              `#include <normal_fragment_maps>
  normal = armBump(normal, -vViewPosition, armH);`,
            )));
      }),
      (e.customProgramCacheKey = () => "saltline-arm-1"),
      e
    );
  }
  JE();
  export var U0 = K,
    la = St,
    iS = Je,
    nl = Cu.upper,
    Lu = Cu.fore,
    ic = Math.PI,
    Iy = [0.42, 0.84],
    sS = { flex: [-1.22, 1.4], deviation: [-0.61, 0.35], twist: [-1.66, 1.66] },
    S5 = { right: [0.8, -0.6, 0], left: [-0.8, -0.6, 0] },
    oS = [0.04, 0.22, 0.16, 0],
    _D = [0.16, 0.2, 0.2],
    wD = (n, e) => cy(n, Fr, e),
    rS = (n, e = {}) => Jl(n, e.palm === void 0 ? { ...e, palm: Fr } : e);
  export function Lh(n) {
    return n.map((e) =>
      e.type === "capsule"
        ? vs([-e.a[0], e.a[1], e.a[2]], [-e.b[0], e.b[1], e.b[2]], e.r)
        : mn([-e.c[0], e.c[1], e.c[2]], e.h, [e.q[0], -e.q[1], -e.q[2], e.q[3]], e.r),
    );
  }
  export var Ry = {};
  export function aS(n = "right") {
    if (Ry[n]) return Ry[n];
    let e = n === "left" ? qE(My()) : My(),
      t = new pt();
    return (
      t.setAttribute("position", new nt(e.position, 3)),
      t.setAttribute("normal", new nt(e.normal, 3)),
      t.setAttribute("skinIndex", new nt(e.skinIndex, 4)),
      t.setAttribute("skinWeight", new nt(e.skinWeight, 4)),
      t.setAttribute("aRest", new nt(e.rest, 4)),
      t.setAttribute("aHand", new nt(e.hand, 4)),
      t.setIndex(new nt(e.index, 1)),
      (t.boundingSphere = new an(new U0(0, 0, 0.2), 0.7)),
      (t.boundingBox = new B0(new U0(-0.5, -0.5, -0.5), new U0(0.5, 0.5, 0.9))),
      (t.userData = { triCount: e.triCount, buildMs: e.ms }),
      (Ry[n] = t)
    );
  }
  export var eS = null;
  export function lS() {
    return eS || (eS = QE(ut));
  }
  export var F1 = new U0(),
    tS = new U0(),
    nS = new U0(),
    Nr = new U0(),
    tl = new U0(),
    Ph = new U0(),
    yo = new U0(),
    sr = new U0(),
    zh = new U0(),
    N1 = new U0(),
    Fu = new U0(),
    bs = new la(),
    ni = new la(),
    E5 = new la(),
    Cy = new la(),
    ky = new la(),
    Dh = new iS(),
    ED = new U0(),
    Py = new U0(0, 0, 1),
    SD = new _0(),
    Ih = (n, e) => (n.isVector3 ? e.copy(n) : e.set(n[0], n[1], n[2]));
__late_fx.sr(sr); __late_audio.sr(sr); __late_weapon.bs(bs);
  export function Fh(n, e = {}) {
    let t = e.side === "left" ? "left" : "right",
      i = t === "left" ? -1 : 1,
      s = new At();
    s.name = "arm-" + t;
    let o = T1.map((A) => {
        let F = new qr();
        return ((F.name = A), F);
      }),
      r = o,
      a = r[0],
      l = r[1],
      c = r[2],
      u = r[3],
      f = r[4];
    (s.add(a),
      a.add(l),
      l.add(c, u, f),
      l.position.set(0, 0, -nl),
      c.position.set(0, 0, -0.09),
      u.position.set(0, 0, -0.2),
      f.position.set(0, 0, -Lu));
    let h = [],
      p = [],
      d = [],
      m = [];
    for (let A = 0; A < 5; A++)
      for (let F = 0; F < 3; F++) {
        let H = r[l0.digit(A, F)],
          N = r[l0.helper(A, F)],
          Z = F ? r[l0.digit(A, F - 1)] : f,
          Q = t0[A];
        (Z.add(H, N),
          F ? H.position.set(0, 0, -Q.len[F - 1]) : H.position.set(Q.base[0] * i, Q.base[1], Q.base[2]),
          N.position.copy(H.position),
          m.push(H.position.clone()),
          h.push(_h(A, F, jl, new la())),
          p.push(H),
          d.push(N));
      }
    let x = (A) => (i < 0 && ((A.y = -A.y), (A.z = -A.z)), A),
      v = new Float32Array(Un),
      y = new Float32Array(Un),
      b = new Float32Array(5),
      g = new Float32Array(5),
      E = 0;
    function M() {
      for (let A = 0; A < Un; A++) y[A] = v[A];
      for (let A = 0; A < 4; A++) y[4 + A] += oS[A] * E;
      for (let A = 0; A < 5; A++) {
        let F = b[A];
        F !== 0 && ((y[A * 4 + 1] += F), (y[A * 4 + 2] += F * 0.6), A && (y[A * 4] += F * 0.4));
      }
      ly(y);
      for (let A = 0; A < 5; A++)
        for (let F = 0; F < 3; F++) {
          let H = A * 3 + F,
            N = p[H],
            Z = d[H];
          (x(_h(A, F, y, N.quaternion)), Z.quaternion.copy(x(bs.copy(h[H]))).slerp(N.quaternion, 0.5));
          let Q = A === 0 && F === 0 ? 0 : y[A * 4 + F] - jl[A * 4 + F],
            W = Math.sin(Math.min(Math.max(Q, 0), 2) * 0.5);
          (F1.set(0, _D[F] * t0[A].rad[F] * W * W, 0).applyQuaternion(Z.quaternion), Z.position.copy(m[H]).add(F1));
        }
    }
    function _(A) {
      for (let F = 0; F < Un; F++) v[F] = A[F];
    }
    let T = { reach: 0, wristFlex: 0, wristDeviation: 0, twist: 0, violation: 0, lean: 0, elbow: new U0(), shoulder: new U0() },
      w = new U0(),
      S = new U0(),
      R = new la(),
      z = !1,
      I = { x: 0, y: 0, vx: 0, vy: 0 };
    function L(A, F, H, N, Z, Q) {
      (Ih(A, Nr),
        (Nr.x *= i),
        Ih(F, tl),
        (tl.x *= i),
        E5.copy(H),
        x(E5),
        N ? (Ih(N, sr), (sr.x *= i)) : sr.set(0.8, -0.6, 0),
        yo.subVectors(tl, Nr));
      let W = yo.length() || 1e-6;
      yo.multiplyScalar(1 / W);
      let J = (nl + Lu) * 0.999,
        G = Math.abs(nl - Lu) + 0.02,
        te = 0;
      W > J && Z > 0 && ((te = Math.min(Z, W - J)), Nr.addScaledVector(yo, te), (W -= te));
      let oe = Math.max(0, W - J);
      oe > 0 ? ((W = J), tl.copy(Nr).addScaledVector(yo, W)) : W < G && ((W = G), tl.copy(Nr).addScaledVector(yo, W));
      let ee = (W * W + nl * nl - Lu * Lu) / (2 * W),
        le = Math.sqrt(Math.max(0, nl * nl - ee * ee));
      (sr.addScaledVector(yo, -sr.dot(yo)),
        sr.lengthSq() < 1e-8 &&
          (sr.set(0, -1, 0).addScaledVector(yo, yo.y), sr.lengthSq() < 1e-8 && sr.set(1, 0, 0).addScaledVector(yo, -yo.x)),
        sr.normalize(),
        Ph.copy(Nr).addScaledVector(yo, ee).addScaledVector(sr, le),
        zh.crossVectors(sr, yo).normalize(),
        Fu.subVectors(Nr, Ph).normalize(),
        N1.crossVectors(Fu, zh),
        Cy.setFromRotationMatrix(Dh.makeBasis(zh, N1, Fu)),
        Fu.subVectors(Ph, tl).normalize(),
        N1.crossVectors(Fu, zh),
        ky.setFromRotationMatrix(Dh.makeBasis(zh, N1, Fu)),
        bs.copy(ky).invert().multiply(E5),
        bs.w < 0 && ((bs.x = -bs.x), (bs.y = -bs.y), (bs.z = -bs.z), (bs.w = -bs.w)));
      let xe = 2 * Math.atan2(bs.z, bs.w);
      for (; xe > ic / 2;) xe -= 2 * ic;
      for (; xe <= -1.5 * ic;) xe += 2 * ic;
      (ni.setFromAxisAngle(Py, -xe).multiply(bs), ni.w < 0 && ((ni.x = -ni.x), (ni.y = -ni.y), (ni.z = -ni.z), (ni.w = -ni.w)));
      let j = Math.sqrt(ni.x * ni.x + ni.y * ni.y + ni.z * ni.z),
        O = 2 * Math.atan2(j, ni.w),
        q = j > 1e-9 ? O / j : 2,
        ue = -ni.x * q,
        de = ni.y * q,
        $ = xe + ic / 2,
        se = sS;
      return (
        (T.reach = oe),
        (T.lean = te),
        (T.wristFlex = ue),
        (T.wristDeviation = de),
        (T.twist = $),
        (T.violation = Math.max(
          0,
          se.flex[0] - ue,
          ue - se.flex[1],
          se.deviation[0] - de,
          de - se.deviation[1],
          se.twist[0] - $,
          $ - se.twist[1],
        )),
        Q &&
          (T.elbow.set(Ph.x * i, Ph.y, Ph.z),
          T.shoulder.set(Nr.x * i, Nr.y, Nr.z),
          a.position.copy(T.shoulder),
          x(a.quaternion.copy(Cy)),
          x(l.quaternion.copy(Cy).invert().multiply(ky)),
          x(f.quaternion.copy(bs)),
          x(R.setFromAxisAngle(Py, xe * Iy[0])),
          c.quaternion.copy(R),
          x(u.quaternion.setFromAxisAngle(Py, xe * Iy[1])),
          F1.set(tl.x * i, tl.y, tl.z),
          z && S.subVectors(F1, w),
          w.copy(F1),
          (z = !0)),
        T
      );
    }
    (_(jl), M(), a.position.set(0, 0, nl + Lu), s.updateMatrixWorld(!0));
    let U = new _a(o),
      k = new Gr(aS(t), e.material || lS());
    ((k.name = "arm-mesh-" + t), (k.frustumCulled = !1), (k.castShadow = !1), (k.receiveShadow = !0), s.add(k), k.bind(U, new iS()));
    let C = {
      side: t,
      group: s,
      mesh: k,
      bones: o,
      skeleton: U,
      ik: T,
      pose: v,
      hand: f,
      bone: Object.fromEntries(T1.map((A, F) => [A, o[F]])),
      triCount: k.geometry.userData.triCount,
      setLayer(A) {
        return (s.traverse((F) => F.layers.set(A)), C);
      },
      setVisible(A) {
        return ((s.visible = !!A), C);
      },
      setFingers(A, F = 1) {
        return ((A = Za(A)), F >= 1 ? _(A) : tn(v, v, A, F), M(), C);
      },
      blendFingers(A, F, H) {
        return (tn(v, Za(A), Za(F), H), M(), C);
      },
      setFinger(A, F, H = 1) {
        typeof A == "string" && (A = Eh.indexOf(A));
        for (let N = 0; N < 4; N++) v[A * 4 + N] += (F[N] - v[A * 4 + N]) * H;
        return (M(), C);
      },
      setTrigger(A) {
        return ((A = A < 0 ? 0 : A > 1 ? 1 : A), A !== E && ((E = A), M()), C);
      },
      get trigger() {
        return E;
      },
      get shown() {
        return y;
      },
      solve(A, F, H, N = null, Z = null) {
        return L(A, F, H, N, Z && Z.lean ? Z.lean : 0, !0);
      },
      solveMatrix(A, F, H = null, N = null) {
        return (F.decompose(tS, ni, ED), L(A, tS, E5.copy(ni), H, N && N.lean ? N.lean : 0, !0));
      },
      findPole(A, F, H, N = null) {
        let Z = Ih(A, new U0()),
          Q = Ih(F, new U0()),
          W = H.clone(),
          J = Q.clone().sub(Z).normalize(),
          G = Ih(N || S5[t], new U0());
        G.addScaledVector(J, -G.dot(J)).normalize();
        let te = new U0().crossVectors(J, G),
          oe = new U0(),
          ee = new U0(),
          le = 1e9;
        for (let xe = 0; xe < 24; xe++) {
          let j = (xe / 24) * 2 * ic;
          ee.copy(G).multiplyScalar(Math.cos(j)).addScaledVector(te, Math.sin(j));
          let O = L(Z, Q, W, ee, 0, !1),
            q = O.violation + 0.12 * (1 - Math.cos(j));
          q < le && ((le = q), oe.copy(ee));
        }
        return oe;
      },
      fitGrip(A, F = {}) {
        let H = A;
        if (F.space === "parent" || F.space === "world") {
          let Z = s.parent;
          (s.updateWorldMatrix(!0, !0),
            Dh.copy(f.matrixWorld).invert(),
            Z && F.space === "parent" && Dh.multiply(Z.matrixWorld),
            (H = Th(A, Dh)));
        }
        i < 0 && (H = Lh(H));
        let N = rS(H, F);
        return (F.apply !== !1 && (_(N), M()), N);
      },
      socket(A, F, H, N, Z) {
        return i > 0
          ? M5(A, F, H, N, Z)
          : (nS.set(-F.x, F.y, F.z), ni.set(H.x, -H.y, -H.z, H.w), M5(A, nS, ni, N, Z), (N.x = -N.x), (Z.y = -Z.y), (Z.z = -Z.z), N);
      },
      gripFrame(A, F, H) {
        let N = nn[A].frame;
        return (F.copy(N.p), H.copy(N.q), i < 0 && ((F.x = -F.x), (H.y = -H.y), (H.z = -H.z)), F);
      },
      penetration(A, F) {
        return Kl(y, i < 0 ? Lh(A) : A, F);
      },
      selfPenetration(A) {
        return cy(y, Fr, A);
      },
      impulse(A = 1) {
        for (let F = 0; F < 5; F++) g[F] += A * (1.6 + 0.3 * F);
        ((I.vx += A * 0.5), (I.vy -= A * 0.35));
      },
      update(A) {
        if (!(A > 0)) return;
        A > 0.05 && (A = 0.05);
        let F = !1;
        for (let Z = 0; Z < 5; Z++)
          ((g[Z] += (-b[Z] * 900 - g[Z] * 34) * A),
            (b[Z] += g[Z] * A),
            Math.abs(b[Z]) > 2e-4 || Math.abs(g[Z]) > 0.02 ? (F = !0) : ((b[Z] = 0), (g[Z] = 0)));
        (F && M(),
          (I.vx += (-I.x * 260 - I.vx * 18) * A - S.y * 9),
          (I.vy += (-I.y * 260 - I.vy * 18) * A + S.x * 9 * i),
          S.set(0, 0, 0),
          (I.x += I.vx * A),
          (I.y += I.vy * A));
        let H = Math.max(-0.06, Math.min(0.06, I.x)),
          N = Math.max(-0.06, Math.min(0.06, I.y));
        Math.abs(H) > 1e-5 || Math.abs(N) > 1e-5
          ? (bs.set(H * 0.5, N * 0.5, 0, 1).normalize(), c.quaternion.copy(R).multiply(bs))
          : c.quaternion.copy(R);
      },
      dispose() {
        (s.parent && s.parent.remove(s), U.dispose());
      },
    };
    return (e.layer != null && C.setLayer(e.layer), C);
  }
  export async function TD(n) {
    let e = Fh(n, { side: "right" }),
      t = Fh(n, { side: "left" }),
      i = new At();
    ((i.name = "hands-studio"), n.scene.add(i));
    let s = { view: "back", pose: ["relaxed", "relaxed"], poseSet: !1, blend: null, trig: 0, grip: null, held: "rifle", gun: null, t: 0 },
      o = { rifle: [0.118, -0.122, -0.275, 0.034, 0.085, -0.03], pistol: [0.135, -0.078, -0.5, 0.06, 0.12, -0.07] },
      r = { p: new U0(), q: new la() },
      a = new U0(0, -0.055, 0.085),
      l = new U0(0, -0.04, -0.256),
      c = new U0(0, -0.012, 0.045),
      u = new U0(),
      f = new la(),
      h = new U0(),
      p = new la(),
      d = [0, 1.68, 4],
      m = {
        back: [[0.2, 1.34, 0.78], [0, 1.25, 0], 26, 0],
        palm: [[0.2, 1.34, 0.78], [0, 1.25, 0], 26, ic],
        side: [[0.74, 1.3, 0.34], [0, 1.24, 0], 26, 0],
        arm: [[0.62, 1.02, 0.62], [0.06, 0.98, 0], 30, 0],
      },
      x = typeof window < "u" ? window.__setShot : null;
    function v() {
      let M = s.view === "fp";
      for (let _ of [e, t])
        ((M ? n.camera : i).add(_.group), _.setLayer(M ? Ro : Ia), _.group.position.set(0, 0, 0), _.group.quaternion.identity());
      if (!M) {
        let _ = m[s.view] || m.back;
        (i.position.set(0, 1.16, 0), i.rotation.set(ic / 2, 0, 0), i.rotateZ(_[3]));
        for (let T of [e, t]) {
          let w = T === e ? 1 : -1;
          T.bone.upperArm.position.set(0.125 * w, 0, nl + Lu);
          for (let S of ["upperArm", "forearm", "forearmTwist1", "forearmTwist2", "hand"]) T.bone[S].quaternion.identity();
        }
      }
    }
    function y() {
      let M = s.view === "fp";
      if (s.blend) {
        let _ = s.blend[2] != null ? +s.blend[2] : 0.5 - 0.5 * Math.cos(s.t * 1.6);
        (e.blendFingers(s.blend[0], s.blend[1], _), t.blendFingers(s.blend[0], s.blend[1], _));
      } else
        s.poseSet
          ? (e.setFingers(s.pose[0]), t.setFingers(s.pose[1]))
          : s.grip
            ? (e.setFingers("foregrip"), t.setFingers("foregrip"))
            : M && s.held === "pistol"
              ? (e.setFingers(s.trig ? "trigger" : "pistol_grip"), t.setFingers("pistol_support"))
              : M
                ? (e.setFingers(s.trig ? "trigger" : "rifle_grip"), t.setFingers("foregrip"))
                : (e.setFingers(s.pose[0]), t.setFingers(s.pose[1]));
      if ((e.setTrigger(s.trig === "anim" ? 0.5 - 0.5 * Math.cos(s.t * 4) : +s.trig || 0), !!M))
        if (s.grip)
          for (let _ of [e, t]) {
            let T = _ === e ? 1 : -1;
            (h.set(s.grip[0] + 0.11 * T, s.grip[1], s.grip[2]),
              p.setFromRotationMatrix(
                Dh.makeBasis(zh.set(0, 0.86 * T, -0.5 * T).normalize(), N1.set(-T, 0, 0), Fu.set(0, 0.5, 0.86).normalize()),
              ),
              _.socket("foregrip", h, p, u, f),
              _.solve(er[_.side], u, f, null, { lean: 0.15 }));
          }
        else {
          let _ = s.gun || o[s.held] || o.rifle,
            T = s.held === "pistol";
          (r.p.set(_[0], _[1], _[2]),
            r.q.setFromEuler(SD.set(_[3] || 0, _[4] || 0, _[5] || 0, "YXZ")),
            h
              .copy(T ? c : a)
              .applyQuaternion(r.q)
              .add(r.p),
            e.socket(T ? "pistol_grip" : "rifle_grip", h, r.q, u, f),
            e.solve(er.right, u, f, null, { lean: 0.2 }),
            T || h.copy(l).applyQuaternion(r.q).add(r.p),
            t.socket(T ? "pistol_support" : "foregrip", h, r.q, u, f),
            t.solve(er.left, u, f, null, { lean: 0.2 }));
        }
    }
    function b(M, _) {
      if ((M.hview && (s.view = M.hview), M.hpose != null)) {
        let w = String(M.hpose).split(",");
        ((s.pose = [di[w[0]] ? w[0] : "relaxed", di[w[1] || w[0]] ? w[1] || w[0] : "relaxed"]),
          (s.poseSet = M.hpose !== ""),
          (s.blend = null));
      }
      if (M.hblend != null) {
        let w = String(M.hblend).split(",");
        s.blend = di[w[0]] && di[w[1]] ? w : null;
      }
      (M.htrig != null && (s.trig = M.htrig === "anim" ? "anim" : +M.htrig),
        M.hgrip != null && (s.grip = M.hgrip === "" ? null : String(M.hgrip).split(",").map(Number)),
        M.hheld != null && (s.held = M.hheld === "pistol" ? "pistol" : "rifle"),
        M.hgun != null && (s.gun = M.hgun === "" ? null : String(M.hgun).split(",").map(Number)),
        M.hwet != null && (kh.value = +M.hwet),
        v(),
        y());
      for (let w of [e, t])
        console.log(
          `[hands] ${w.side}: view ${s.view}, ${w.triCount} tris` +
            (s.view === "fp"
              ? `, reach ${w.ik.reach.toFixed(3)} flex ${w.ik.wristFlex.toFixed(2)} dev ${w.ik.wristDeviation.toFixed(2)} twist ${w.ik.twist.toFixed(2)} violation ${w.ik.violation.toFixed(2)}`
              : ""),
        );
      let T = {};
      if (!M.cam)
        if (s.view === "fp") ((T.cam = [...d, d[0] + 0.28, d[1] - 0.01, d[2] + 1].join(",")), M.fov || (T.fov = 74));
        else {
          let w = m[s.view] || m.back;
          ((T.cam = [...w[0], ...w[1]].join(",")), M.fov || (T.fov = w[2]));
        }
      return (!_ && x && x(T), T);
    }
    typeof window < "u" &&
      ((window.__setShot = (M) => {
        (M &&
          (M.hview ||
            M.hpose != null ||
            M.hblend != null ||
            M.htrig != null ||
            M.hgrip != null ||
            M.hheld != null ||
            M.hgun != null ||
            M.hwet != null) &&
          b(M, !1),
          x && x(M));
      }),
      (window.__hands = { R: e, L: t, st: s, apply: (M) => b(M, !1) }));
    let g = b(n.params || {}, !0),
      E = g.cam ? g.cam.split(",").map(Number) : [0.2, 1.34, 0.78, 0, 1.25, 0];
    return (
      g.fov && !(n.params && n.params.fov) && ((n.camera.fov = g.fov), n.camera.updateProjectionMatrix()),
      {
        cam: E.slice(0, 3),
        target: E.slice(3, 6),
        R: e,
        L: t,
        state: s,
        update(M) {
          ((s.t += M), (s.trig === "anim" || (s.blend && s.blend[2] == null)) && y(), e.update(M), t.update(M));
        },
      }
    );
  }
  export var W0 = K,
    Ur = St,
    Nu = Je,
    Nh = new W0(1, 1, 1),
    cS = (n) => ((n = n < 0 ? 0 : n > 1 ? 1 : n), n * n * n * (n * (6 * n - 15) + 10));
  export function fS(n, e) {
    let t = new W0(n[0], n[1], n[2]).normalize().negate(),
      i = new W0(e[0], e[1], e[2]);
    return (
      i.addScaledVector(t, -i.dot(t)).normalize(),
      new Ur().setFromRotationMatrix(new Nu().makeBasis(new W0().crossVectors(i, t), i, t))
    );
  }
  export function hS(n, e, t, i) {
    return new W0(n === "left" ? -i[0] : i[0], i[1], i[2])
      .applyQuaternion(e)
      .negate()
      .add(new W0(t[0], t[1], t[2]));
  }
  export function il(n, e, t, i = new Ur()) {
    let s = typeof e == "string" ? nn[e].frame : e,
      o = new W0(),
      r = new Ur(),
      a = n === "left",
      l = a ? new W0(-t.x, t.y, t.z) : t,
      c = a ? new Ur(i.x, -i.y, -i.z, i.w) : i;
    return (
      r.copy(c).multiply(new Ur().copy(s.q).invert()),
      o.copy(s.p).negate().applyQuaternion(r).add(l),
      a && ((o.x = -o.x), (r.y = -r.y), (r.z = -r.z)),
      { p: o, q: r }
    );
  }
  export function AD(n) {
    let e = -1e9,
      t = new W0(),
      i = new Ur(),
      s = (o, r, a) => {
        let l = -Fr(o, r, a);
        l > e && (e = l);
      };
    for (let o of n)
      if (o.type === "capsule") {
        let r = new W0(...o.a),
          a = new W0(...o.b),
          l = a.clone().sub(r),
          c = l.length() || 1e-9;
        l.multiplyScalar(1 / c);
        let u = new W0(1, 0, 0);
        (Math.abs(l.x) > 0.9 && u.set(0, 1, 0), u.addScaledVector(l, -u.dot(l)).normalize());
        let f = new W0().crossVectors(l, u);
        for (let h = 0; h <= 8; h++)
          for (let p = 0; p < 12; p++) {
            let d = (p / 12) * Math.PI * 2;
            (t
              .copy(r)
              .addScaledVector(l, (c * h) / 8)
              .addScaledVector(u, Math.cos(d) * o.r)
              .addScaledVector(f, Math.sin(d) * o.r),
              s(t.x, t.y, t.z));
          }
      } else {
        i.set(o.q[0], o.q[1], o.q[2], o.q[3]);
        let r = o.h,
          a = 6;
        for (let l = 0; l < 6; l++) {
          let c = l >> 1,
            u = l & 1 ? 1 : -1,
            f = (c + 1) % 3,
            h = (c + 2) % 3;
          for (let p = 0; p <= a; p++)
            for (let d = 0; d <= a; d++) {
              let m = [0, 0, 0];
              ((m[c] = u * r[c]),
                (m[f] = ((p / a) * 2 - 1) * Math.max(0, r[f] - o.r)),
                (m[h] = ((d / a) * 2 - 1) * Math.max(0, r[h] - o.r)),
                t.set(m[0], m[1], m[2]).applyQuaternion(i),
                s(t.x + o.c[0], t.y + o.c[1], t.z + o.c[2]));
            }
        }
      }
    return e;
  }
  export function ca(n, e, t, i, s, o = {}) {
    let r = new Nu().compose(t, i, Nh).invert(),
      a = Th(s, r);
    e === "left" && (a = Lh(a));
    let l = Jl(a, { palm: Fr, ...o });
    return { name: n, side: e, p: t.clone(), q: i.clone(), pose: l, shapes: a, depth: Kl(l, a).depth, palm: () => AD(a) };
  }
  export function dS(n, e, t, i = null) {
    let s = n.shapes;
    if (i) {
      let r = new Nu().compose(n.p, n.q, Nh).invert(),
        a = Th(i, r);
      (n.side === "left" && (a = Lh(a)), (s = s.concat(a)));
    }
    let o = Jl(s, { palm: Fr, ...t });
    return { ...n, name: e, pose: o, shapes: s, depth: Kl(o, s).depth };
  }
  export function Uu(n, e, t, i, s = null, o = {}) {
    s = s || n.pose;
    let r = new W0(i[0], i[1], i[2]).applyMatrix4(new Nu().compose(n.p, n.q, Nh).invert());
    n.side === "left" && (r.x = -r.x);
    let a = Float32Array.from(s);
    if (o.start) for (let c = 0; c < 4; c++) a[t * 4 + c] = o.start[c];
    let l = FE(a, t, [r.x, r.y, r.z], o);
    return { ...n, name: e, pose: a, depth: Kl(a, n.shapes).depth, miss: l };
  }
  export var T5 = tr();
  export function pS(n, e, t = n.pose, i = 0.5) {
    Sh(t, e, T5);
    let s = t0[e],
      o = e * 4,
      r = new W0().copy(T5.j[o + 2]).lerp(T5.j[o + 3], i);
    return (
      r.addScaledVector(new W0(0, -1, 0).applyQuaternion(T5.q[e * 3 + 2]), s.rad[2] + (s.rad[3] - s.rad[2]) * i),
      n.side === "left" && (r.x = -r.x),
      r.applyMatrix4(new Nu().compose(n.p, n.q, Nh))
    );
  }
  export var Dy = tr(),
    U1 = new W0(),
    uS = new W0();
  export function RD(n, e, t, i, s, o, r, a) {
    Sh(n, e, Dy);
    let l = t0[e],
      c = Dy.j,
      u = e * 4,
      f = -1e9;
    for (let p = e === 0 ? 1 : 0; p < 3; p++) {
      let d = c[u + p],
        m = c[u + p + 1],
        x = p === 2 ? l.rad[3] / l.len[2] : 0;
      for (let v = 0; v < 6; v++) {
        let y = e === 0 && p === 1 ? a + ((1 - a) * v) / 5 : v / 5,
          b = y * (1 - x),
          g = l.rad[p] + (l.rad[p + 1] - l.rad[p]) * y - h5(t, d.x + (m.x - d.x) * b, d.y + (m.y - d.y) * b, d.z + (m.z - d.z) * b);
        g > f && (f = g);
      }
    }
    (U1.copy(c[u + 2]).lerp(c[u + 3], 0.55),
      uS.set(0, -1, 0).applyQuaternion(Dy.q[e * 3 + 2]),
      U1.addScaledVector(uS, l.rad[2] + (l.rad[3] - l.rad[2]) * 0.55));
    let h = Math.hypot(U1.x - i, U1.y - s, U1.z - o);
    return { cost: h + 6 * Math.max(0, f + r), miss: h, deep: f };
  }
  export function R5(n, e, t, i, s = {}) {
    let o = new W0(i[0], i[1], i[2]).applyMatrix4(new Nu().compose(n.p, n.q, Nh).invert());
    n.side === "left" && (o.x = -o.x);
    let r = Float32Array.from(s.base || n.pose),
      a = t * 4,
      l = s.skin ?? 8e-4,
      c = [0, 0, 0, 0],
      u = [0, 0, 0, 0],
      f = [0, 0, 0, 0],
      h = [7, 6, 4, 5];
    for (let x = 0; x < 4; x++) ((c[x] = xs.min[a + x]), (u[x] = xs.max[a + x]));
    let p = 1e9,
      d = 0,
      m = 0;
    for (let x = 0; x < 3; x++) {
      let v = [0, 0, 0, 0];
      for (v[0] = 0; v[0] < h[0]; v[0]++)
        for (v[1] = 0; v[1] < h[1]; v[1]++)
          for (v[2] = 0; v[2] < h[2]; v[2]++)
            for (v[3] = 0; v[3] < h[3]; v[3]++) {
              for (let b = 0; b < 4; b++) r[a + b] = c[b] + (u[b] - c[b]) * (h[b] > 1 ? v[b] / (h[b] - 1) : 0.5);
              let y = RD(r, t, n.shapes, o.x, o.y, o.z, l, s.root ?? 0.35);
              if (y.cost < p) {
                ((p = y.cost), (d = y.miss), (m = y.deep));
                for (let b = 0; b < 4; b++) f[b] = r[a + b];
              }
            }
      for (let y = 0; y < 4; y++) {
        let b = (u[y] - c[y]) / (h[y] - 1);
        ((c[y] = Math.max(xs.min[a + y], f[y] - b)), (u[y] = Math.min(xs.max[a + y], f[y] + b)));
      }
    }
    for (let x = 0; x < 4; x++) r[a + x] = f[x];
    return { ...n, name: e, pose: r, depth: Kl(r, n.shapes).depth, miss: d, deep: m };
  }
  export function mS(n, e = n.pose, t = [1, 2, 3, 4]) {
    let i = ra(e, tr()),
      s = new Nu().compose(n.p, n.q, Nh),
      o = n.side === "left" ? -1 : 1,
      r = [],
      a = (l) => new W0(l.x * o, l.y, l.z).applyMatrix4(s).toArray();
    for (let l of t)
      for (let c = 0; c < 3; c++) {
        let u = t0[l],
          f = i.j[l * 4 + c],
          h = i.j[l * 4 + c + 1],
          p = c === 2 ? h.clone().lerp(f, u.rad[3] / u.len[2]) : h;
        r.push(vs(a(f), a(p), (u.rad[c] + u.rad[c + 1]) / 2));
      }
    return r;
  }
  export function gi(n, e, t) {
    let i = n.attributes.position.array,
      s = [1e9, 1e9, 1e9],
      o = [-1e9, -1e9, -1e9],
      r = 0;
    for (let a = 0; a < i.length; a += 3) {
      let l = i[a],
        c = i[a + 1],
        u = i[a + 2];
      l < e[0] ||
        l > t[0] ||
        c < e[1] ||
        c > t[1] ||
        u < e[2] ||
        u > t[2] ||
        (r++,
        l < s[0] && (s[0] = l),
        l > o[0] && (o[0] = l),
        c < s[1] && (s[1] = c),
        c > o[1] && (o[1] = c),
        u < s[2] && (s[2] = u),
        u > o[2] && (o[2] = u));
    }
    return { min: s, max: o, n: r };
  }
  export function Bu(n, e, t, i = 0.01) {
    let s = [];
    for (let o = t[1]; o > e[1] + 1e-9; o -= i) {
      let r = gi(n, [e[0], Math.max(e[1], o - i), e[2]], [t[0], o, t[2]]);
      r.n && s.push({ y: o - i / 2, x0: r.min[0], x1: r.max[0], z0: r.min[2], z1: r.max[2], n: r.n });
    }
    return s;
  }
  export function gS(n) {
    let e = Math.max(...n.map((l) => l.z1 - l.z0)),
      t = n.filter((l) => l.z1 - l.z0 > 0.75 * e),
      i = (l) => {
        let c = 0,
          u = 0,
          f = 0,
          h = 0;
        for (let m of t) ((c += m.y), (u += m[l]), (f += m.y * m.y), (h += m.y * m[l]));
        let p = t.length,
          d = p > 1 ? (p * h - c * u) / (p * f - c * c) : 0;
        return [(u - d * c) / p, d];
      },
      s = i("z0"),
      o = i("z1"),
      r = (l) => s[0] + s[1] * l,
      a = (l) => o[0] + o[1] * l;
    return {
      rake: Math.atan(-(s[1] + o[1]) / 2),
      hw: Math.max(...t.map((l) => Math.max(-l.x0, l.x1))),
      top: Math.max(...n.map((l) => l.y)),
      bottom: Math.min(...n.map((l) => l.y)),
      front: r,
      back: a,
      centre: (l) => (r(l) + a(l)) / 2,
      depth: (l) => a(l) - r(l),
    };
  }
  export var xS = { shoulder: { right: [er.right[0], er.right[1], er.right[2]], left: [er.left[0], er.left[1], er.left[2]] }, lean: 0.2 },
    A5 = (n) => ({
      p: new W0(),
      q: new Ur(),
      pose: new Float32Array(Un),
      trig: 0,
      pole: new W0().fromArray(S5[n]),
      sh: new W0().fromArray(xS.shoulder[n]),
    });
  export function vS(n, e = 1) {
    let t = Fh(n, { side: "right" }),
      i = Fh(n, { side: "left" }),
      s = [t, i];
    for (let S of s) (S.setLayer(e), n.camera && n.camera.add(S.group));
    let o = { r: A5("right"), l: A5("left") },
      r = [o.r, o.l];
    (o.r.pose.set(di.relaxed), o.l.pose.set(di.relaxed));
    let a = s.map((S, R) => ({
        last: A5(S.side),
        from: A5(S.side),
        fromL: { p: new W0(), q: new Ur() },
        v: new W0(),
        w: new W0(),
        side: R ? -1 : 1,
      })),
      l = new W0(),
      c = new Ur(),
      u = new W0(),
      f = new Float32Array(Un),
      h = { lean: xS.lean },
      p = new Ur(),
      d = new Ur(),
      m = new W0(),
      x = new W0(),
      v = new W0(),
      y = 1,
      b = 0,
      g = !0,
      E = -1,
      M = null,
      _ = !1,
      T = !1;
    return {
      right: t,
      left: i,
      list: s,
      targets: o,
      state: a,
      get dropping() {
        return E >= 0;
      },
      setVisible(S) {
        if (((g = !!S), E < 0)) for (let R of s) R.group.visible = g;
      },
      blend(S = 0.2) {
        if (_) {
          for (let R of a)
            (R.from.p.copy(R.last.p),
              R.from.q.copy(R.last.q),
              R.from.pose.set(R.last.pose),
              R.from.pole.copy(R.last.pole),
              R.from.sh.copy(R.last.sh));
          ((y = 0), (b = S), (T = !0));
        }
      },
      snap() {
        ((y = 1), (b = 0), (T = !1));
      },
      attach(S, R = null, z = 0) {
        M = S ? { root: S } : null;
        for (let I of s) ((S || n.camera).add(I.group), I.setLayer(S ? z : e));
        (S &&
          (p.setFromEuler(new _0(R.r[0], R.r[1], R.r[2], "YXZ")),
          d.copy(p).invert(),
          m.fromArray(R.p),
          (M.qi = d.clone()),
          (M.p = m.clone())),
          (y = 1));
      },
      update(S, R, z) {
        if (E >= 0 || !R || !R.armTargets) return;
        R.armTargets(o, S);
        let I = y < 1 && b > 0 ? cS((y += S / b)) : 1;
        if ((I >= 1 && (y = 1), T)) {
          ((T = !1), d.copy(z.quaternion).invert());
          for (let L of a) (L.fromL.p.copy(L.from.p).sub(z.position).applyQuaternion(d), L.fromL.q.copy(d).multiply(L.from.q));
        }
        if (I < 1)
          for (let L of a)
            (L.from.p.copy(L.fromL.p).applyQuaternion(z.quaternion).add(z.position), L.from.q.copy(z.quaternion).multiply(L.fromL.q));
        for (let L = 0; L < 2; L++) {
          let U = r[L],
            k = a[L],
            C = s[L],
            A = U.pose;
          (M
            ? (l.copy(U.p), c.copy(U.q), u.copy(U.pole).applyQuaternion(M.qi), x.copy(U.sh).sub(M.p).applyQuaternion(M.qi))
            : (l.copy(U.p).applyQuaternion(z.quaternion).add(z.position), c.copy(z.quaternion).multiply(U.q), u.copy(U.pole), x.copy(U.sh)),
            I < 1 &&
              (l.lerpVectors(k.from.p, l, I),
              c.slerpQuaternions(k.from.q, c, I),
              u.lerpVectors(k.from.pole, u, I),
              x.lerpVectors(k.from.sh, x, I),
              (A = tn(f, k.from.pose, U.pose, I))),
            k.last.p.copy(l),
            k.last.q.copy(c),
            k.last.pose.set(A),
            k.last.pole.copy(u),
            k.last.sh.copy(x),
            C.setFingers(A),
            C.setTrigger(U.trig),
            C.solve(x, l, c, u, h),
            C.update(S));
        }
        _ = !0;
      },
      startDrop(S = Math.random) {
        if (_) {
          ((E = 0), (y = 1));
          for (let R of a)
            (R.from.p.copy(R.last.p),
              R.from.q.copy(R.last.q),
              R.from.pose.set(R.last.pose),
              R.v.set(R.side * (0.1 + S() * 0.08), -0.05, 0.1),
              R.w.set(-1.5 - S() * 0.5, R.side * 0.5, R.side * (0.7 + S() * 0.4)));
        }
      },
      dropUpdate(S) {
        if (E < 0) return;
        E += S;
        let R = cS(E / 0.15);
        for (let z = 0; z < 2; z++) {
          let I = a[z],
            L = s[z];
          if (!L.group.visible) continue;
          ((I.v.y -= 2.2 * S), I.from.p.addScaledVector(I.v, S));
          let U = I.w.length() * S;
          (U > 0 && (c.setFromAxisAngle(v.copy(I.w).normalize(), U), I.from.q.multiply(c)),
            L.setFingers(tn(f, I.from.pose, di.relaxed, R)),
            L.setTrigger(0),
            L.solve(I.last.sh, I.from.p, I.from.q, I.last.pole, h),
            L.update(S),
            I.last.p.copy(I.from.p),
            I.last.q.copy(I.from.q),
            (E > 0.9 || I.from.p.y < -0.6) && (L.group.visible = !1));
        }
      },
      restore() {
        if (!(E < 0)) {
          ((E = -1), (y = 1), (_ = !1));
          for (let S of s) S.group.visible = g;
        }
      },
      report() {
        return s.map((S) => ({
          side: S.side,
          reach: S.ik.reach,
          violation: S.ik.violation,
          lean: S.ik.lean,
          flex: S.ik.wristFlex,
          deviation: S.ik.wristDeviation,
          twist: S.ik.twist,
        }));
      },
      dispose() {
        for (let S of s) S.dispose();
      },
    };
  }
  export var Pn = K,
    Fo = St,
    C5 = 0.076,
    yS = 0,
    bS = (n, e) => ({ p: n.p.map((t, i) => t - e.p[i]), r: n.r.map((t, i) => t - e.r[i]) }),
    Ly = (n, e, t, i, s, o, r) => ({
      name: n,
      HIP: e,
      ADS: { p: [0, -wn.sightY, t], r: [0, 0, 0] },
      SPRINT: bS(i, e),
      SPRINT_ARC: s,
      RELOAD: bS(o, e),
      RACK: r,
    }),
    Fy = { p: [0, 0, 0], r: [-0.16, 0, 0.62] },
    Ny = [0.494, 0.305, -0.83],
    Uy = [
      Ly(
        "close",
        { p: [0.1, -0.109, -0.219], r: [-0.045, 0.035, 0.09] },
        -0.1065,
        { p: [0.07, -0.205, -0.27], r: [0.25, 0.8, 0.32] },
        { p: [-0.01, -0.022, 0.02], r: [-0.06, 0.02, 0.07] },
        { p: [0.088, -0.022, -0.295], r: Ny },
        Fy,
      ),
      Ly(
        "threequarter",
        { p: [0.143, -0.173, -0.397], r: [0.065, 0.14, 0.04] },
        -0.1115,
        { p: [0.07, -0.16, -0.3], r: [-0.2, 0.85, 0.35] },
        { p: [-0.008, -0.02, 0.03], r: [0.05, 0.02, 0.06] },
        { p: [0.09, -0.035, -0.34], r: Ny },
        Fy,
      ),
      Ly(
        "compact",
        { p: [0.165, -0.172, -0.345], r: [0.045, 0.075, 0.03] },
        -0.1115,
        { p: [0.13, -0.185, -0.3], r: [-0.28, 0.55, 0.15] },
        { p: [-0.006, -0.016, 0.02], r: [0.04, 0.02, 0.05] },
        { p: [0.1, -0.04, -0.31], r: Ny },
        Fy,
      ),
    ],
    B1 = (n, e, t) => (n < e || n >= t ? 0 : Ot((n - e) / (t - e))),
    Uh = (n) => new Fo().setFromAxisAngle(new Pn(1, 0, 0), n),
    By = (n) => new Fo().setFromAxisAngle(new Pn(0, 1, 0), n),
    CD = [1, 0, 0, 1],
    kD = [1.6, 1.1, 0.8, 1],
    PD = d0({ thumb: [1.35, 0.7, 0.6, 0.3], fingers: [1.6, 1.1, 0.7, 0] }),
    MS = 0.0275,
    sc = {
      grip: { web: [-0.0335, -0.012, -0.045], tilt: 0.22, roll: -0.3, drop: 0.012, lift: 0.0025 },
      foreYaw: -0.8,
      foreTip: 0.08,
      foreDrop: 0.008,
      pinchAt: 0.15,
      pinchYaw: 0,
      cupYaw: 0,
      handle: { fingers: [0.85, 0.4, -0.34], back: [-0.36, 0.1, -1] },
      shR: [0.2, -0.18, 0.4],
      shL: [-0.17, -0.24, 0.05],
      poleR: [0.3, -0.95, 0],
      poleL: [-0.5, -0.85, 0],
      sprintShR: [0.19, -0.24, 0.1],
      sprintPoleR: [0.9, -0.4, 0],
    };
  export function ID(n) {
    let e = wn.grip,
      t = wn.handguard,
      i = wn.handguardR,
      s = wn.magPos,
      o = wn.handlePos,
      r = {},
      a = gi(n.poly, [-0.02, e[1] - 0.065, e[2] - 0.045], [0.02, e[1] + 0.058, e[2] + 0.05]),
      l = gS(Bu(n.poly, [-0.02, e[1] - 0.06, e[2] - 0.045], [0.02, e[1] + 0.03, e[2] + 0.05])),
      c = l.rake,
      u = a.max[1],
      f = l.bottom - 0.005,
      h = (u + f) / 2,
      p = (u - f) / 2 / Math.cos(c),
      d = (l.depth(h) / 2) * Math.cos(c);
    r.gripDim = { rake: c, hw: l.hw, hl: p, hd: d + 8e-4, c: [0, h, l.centre(h) - 8e-4] };
    let m = mn(r.gripDim.c, [l.hw, p, r.gripDim.hd], Uh(-c), l.hw * 0.9),
      x = gi(n.ano, [-0.03, e[1] + 0.045, e[2] - 0.17], [0.03, e[1] + 0.125, e[2] + 0.028]),
      v = -gi(n.ano, [-0.03, -0.018, e[2] - 0.12], [0, -0.008, e[2] - 0.02]).min[0],
      y = mn(
        [0, (x.min[1] + x.max[1]) / 2, (x.min[2] + x.max[2]) / 2],
        [v, (x.max[1] - x.min[1]) / 2, (x.max[2] - x.min[2]) / 2],
        null,
        0.003,
      ),
      b = mn([0, s[1] - 0.0345, s[2]], [v + 0.001, 0.0345, 0.0355], null, 0.003),
      g = mn([0, 0.002, x.max[2] + 0.09], [0.014, 0.016, 0.09], null, 0.01),
      E = gi(n.ano, [-0.009, e[1] - 0.004, e[2] - 0.115], [0.009, e[1] + 0.006, e[2] - 0.03]);
    r.tang = new Pn(0, E.min[1] + MS, l.back(E.min[1] + MS));
    let M = mn(
        [0, (E.min[1] + E.max[1]) / 2, (E.min[2] + E.max[2]) / 2],
        [(E.max[0] - E.min[0]) / 2, (E.max[1] - E.min[1]) / 2, (E.max[2] - E.min[2]) / 2],
        null,
        0.0018,
      ),
      _ = Bu(n.gun, [-0.0034, e[1] + 0.012, e[2] - 0.092], [0.0034, e[1] + 0.043, e[2] - 0.058], 0.006),
      T = _[Math.floor(_.length / 2)];
    r.triggerAt = [0, T.y, T.z0];
    let w = vs([-0.0031, T.y + 0.006, T.z0 + 0.0028], [0.0031, T.y - 0.01, T.z0 + 0.0028 - 0.003], 0.003);
    ((r.grip = [m, y, b, g, M]), (r.trigger = [w]));
    let S = Bu(n.poly, [-0.03, -i - 0.085, t[2] - 0.03], [0.03, -i + 0.002, t[2] + 0.03]),
      R = S.slice(1),
      z = Math.min(...R.map((te) => te.z0)),
      I = Math.max(...R.map((te) => te.z1)),
      L = Math.max(...R.map((te) => te.x1)),
      U = gi(n.poly, [-0.03, -i - 0.085, t[2] - 0.03], [0.03, -i + 0.002, t[2] + 0.03]);
    ((r.foreTop = new Pn(0, U.max[1], (z + I) / 2)),
      (r.foreDim = { hw: L, hd: (I - z) / 2, len: U.max[1] - U.min[1] }),
      (r.fore = [
        mn([0, (U.max[1] + U.min[1]) / 2, (z + I) / 2], [L, (U.max[1] - U.min[1]) / 2, (I - z) / 2], null, 0.01),
        mn([t[0], t[1], t[2]], [i, i, 0.146], null, 0.008),
      ]));
    let k = Bu(n.mag, [-1, -1, -1], [1, 0, 1], 0.02),
      C = (te) => (te.z0 + te.z1) / 2,
      A = [];
    for (let te = 0; te < k.length - 1; te++) {
      let oe = k[te],
        ee = k[Math.min(k.length - 2, te + 1)],
        le = k[Math.max(0, te - 1)],
        xe = Math.atan2(C(le) - C(ee), le.y - ee.y || 1);
      A.push(mn([0, oe.y, C(oe)], [Math.max(-oe.x0, oe.x1), 0.0125, ((oe.z1 - oe.z0) / 2) * Math.cos(xe)], Uh(xe), 0.003));
    }
    let F = gi(n.mag, [-1, -1, -1], [1, 1, 1]),
      H = gi(n.mag, [-1, F.min[1], -1], [1, F.min[1] + 0.012, 1]),
      N = k[k.length - 2],
      Z = k[k.length - 3],
      Q = Math.atan2(C(Z) - C(N), Z.y - N.y) * 1.25;
    ((r.magAxis = (te) => {
      let oe = 0;
      for (; oe < k.length - 2 && -k[oe + 1].y < te;) oe++;
      let ee = k[oe],
        le = k[oe + 1],
        xe = Math.min(1, Math.max(0, (-te - ee.y) / (le.y - ee.y)));
      return {
        z: C(ee) + (C(le) - C(ee)) * xe,
        tilt: Math.atan2(C(ee) - C(le), ee.y - le.y),
        hw: Math.max(-ee.x0, ee.x1),
        hd: (ee.z1 - ee.z0) / 2,
      };
    }),
      (r.magTilt = Q),
      (r.magLen = -F.min[1]));
    let W = k[k.length - 1],
      J = C(N) + (C(N) - C(Z)) * 0.9;
    ((r.plate = new Pn(0, (H.min[1] + W.y + 0.01) / 2 - 0.004, J)),
      A.push(mn([0, r.plate.y + 0.0045 * Math.cos(Q), r.plate.z + 0.0045 * Math.sin(Q)], [F.max[0], 0.0045, 0.034], Uh(Q), 0.003)),
      (r.mag = A));
    let G = gi(n.bolt, [-1, -1, -1], [-v - 0.0015, 1, 1]);
    return (
      (r.knob = vs([G.min[0] + 0.003, o[1], o[2]], [G.max[0], o[1], o[2]], (G.max[1] - G.min[1]) / 2)),
      (r.knobTip = G.min[0]),
      (r.handle = [r.knob, y, mn([0, wn.railTop - 0.004, o[2]], [0.011, 0.006, 0.1], null, 0.002)]),
      r
    );
  }
  export var Hy = null,
    _S = "";
  export function zD(n) {
    let e = JSON.stringify(sc);
    if (Hy && e === _S) return Hy;
    let t = ID(n),
      i = sc,
      s = { shapes: t },
      o = new Fo();
    ((Hy = s), (_S = e));
    let r = tc({
        ...i.grip,
        rake: t.gripDim.rake,
        len: (t.tang.y - (t.gripDim.c[1] - t.gripDim.hl * Math.cos(t.gripDim.rake))) / Math.cos(t.gripDim.rake),
        width: 2 * t.gripDim.hw,
        depth: 2 * t.gripDim.hd,
        round: 0.009,
        top: [0.012, 0.2, 0.005, 0.04],
        topW: 0.034,
        guard: [0.036, 0.1, -0.024],
        trigger: [0.084, -0.01],
      }),
      a = il("right", r.frame, t.tang, o);
    (a.p.add(new Pn(0, i.grip.lift, 0).applyQuaternion(a.q)),
      (s.grip = ca("grip", "right", a.p, a.q, t.grip, {
        from: d0({ thumb: CD }, nn.rifle_grip.fit.from),
        to: d0({ thumb: kD }, nn.rifle_grip.fit.to),
      })),
      (s.trigger = Uu(s.grip, "trigger", 1, [t.triggerAt[0] + 0.002, t.triggerAt[1], t.triggerAt[2] - 0.0015], s.grip.pose, {
        start: [0.2, 1, 0.6, 0.1],
        at: 0.7,
      })));
    let l = il("left", "foregrip", t.foreTop.clone().add(new Pn(0, -i.foreDrop, 0)), By(i.foreYaw).multiply(Uh(i.foreTip)));
    s.fore = ca("fore", "left", l.p, l.q, t.fore, nn.foregrip.fit);
    let c = t.magAxis(i.pinchAt),
      u = il("left", "mag_pinch", new Pn(0, -i.pinchAt, c.z), Uh(c.tilt).multiply(By(i.pinchYaw)));
    s.pinch = ca("pinch", "left", u.p, u.q, t.mag, nn.mag_pinch.fit);
    let f = il("left", "mag_cup", t.plate, Uh(t.magTilt).multiply(By(i.cupYaw)));
    (f.p.add(new Pn(0, 0.003, 0).applyQuaternion(f.q)),
      (s.carry = ca("carry", "left", f.p, f.q, t.mag, { from: nn.mag_cup.fit.from, to: PD })),
      (s.cup = { ...s.carry, name: "cup", pose: tn(new Float32Array(Un), nn.mag_cup.fit.from, s.carry.pose, 0.72) }));
    let h = fS(i.handle.fingers, i.handle.back),
      p = d0({
        thumb: [0.9, 0.2, 0.3, 0.6],
        index: [0.45, 0.55, 0.33, 0],
        middle: [0.45, 0.55, 0.33, 0],
        ring: [1.2, 1.45, 0.9, 0],
        little: [1.25, 1.45, 0.85, -0.04],
      }),
      d = ra(p, tr()),
      m = d.j[6].clone().lerp(d.j[7], 0.5).lerp(d.j[10].clone().lerp(d.j[11], 0.5), 0.5);
    m.y -= 0.009;
    let x = t.knobTip + 0.0035,
      v = t.knob.a[2] - t.knob.r - 5e-4,
      y = hS("left", h, [x, t.knob.a[1], v], m.toArray()),
      b = { name: "handle", side: "left", p: y, q: h, pose: p, shapes: ca("handle", "left", y, h, t.handle, { from: p, to: p }).shapes };
    return (
      (s.handle = Uu(Uu(b, "handle", 1, [x, t.knob.a[1] + 0.0075, v], null, { at: 0.8 }), "handle", 2, [x, t.knob.a[1] - 0.0075, v], null, {
        at: 0.8,
      })),
      s
    );
  }
  export function wS(n) {
    let { G: e, mats: t, mk: i, S: s, rng: o } = n,
      r = new At();
    r.name = "viewmodel-pac9";
    let a = TE();
    r.add(i(a.ano, t.ano), i(a.gun, t.steel), i(a.poly, t.poly), i(a.plain, t.plain));
    let l = i(a.bolt, t.steel);
    r.add(l);
    let c = new At(),
      u = new Pn().fromArray(wn.magPos);
    c.position.copy(u);
    let f = i(a.round, t.brass);
    (c.add(i(a.mag, t.tan), f), r.add(c));
    let h = null;
    try {
      ((h = M1([
        ["model", -0.0168, -0.0315, 0.064, 0.0095, "L"],
        ["maker", -0.0168, -0.042, 0.064, 0.003, "L"],
        ["cal", -0.0168, -0.0465, 0.064, 0.0028, "L"],
        ["prop", -0.0168, -0.071, 0.066, 0.0026, "L"],
        ["auto", -0.0168, -0.027, -0.0335, 0.0036, "L"],
        ["semi", -0.0168, -0.0262, -0.049, 0.0036, "L"],
        ["safe", -0.0168, -0.0362, -0.062, 0.0036, "L"],
        ["rack", -0.0168, -0.004, -0.205, 0.02, "L"],
        ["warn", -0.0181, -0.01, 0.03, 0.0062, "L"],
        ["optic", -0.0195, 0.0735, 0.021, 0.0024, "L"],
        ["model", 0.0168, -0.0315, 0.068, 0.0095, "R"],
        ["warn", 0.0168, -0.066, 0.066, 0.0075, "R"],
        ["rack", 0.0168, -0.004, -0.205, 0.02, "R"],
        ["auto", 0.0168, -0.027, -0.0335, 0.0036, "R"],
        ["safe", 0.0168, -0.0362, -0.062, 0.0036, "R"],
        ["optic", 0.0195, 0.0735, 0.021, 0.0024, "R"],
        ["cal", 0.0181, 0.0245, -0.055, 0.0026, "R"],
        ["r2", 0, 0.04365, -0.0816, 0.003, "T"],
        ["r4", 0, 0.04365, -0.0616, 0.003, "T"],
        ["r6", 0, 0.04365, 0.0584, 0.003, "T"],
        ["r8", 0, 0.04365, 0.0784, 0.003, "T"],
        ["r10", 0, 0.04365, 0.0984, 0.003, "T"],
        ["r12", 0, 0.04365, 0.1184, 0.003, "T"],
      ])),
        (h.castShadow = !1),
        (h.receiveShadow = !0),
        (h.frustumCulled = !1),
        r.add(h));
    } catch (B) {
      console.warn("[weapon] markings skipped: " + B);
    }
    let p = ME(
      wn.window.map((B) => [B[0] * 1.01, (B[1] - wn.sightY) * 1.01 + wn.sightY]),
      wn.lensF + 0.0025,
    );
    ((p.frustumCulled = !1), r.add(p));
    let d = l5();
    (d.position.fromArray(wn.muzzle), (d.visible = !1), r.add(d));
    let m = zD(a),
      x = n.arms || null,
      v = new Je(),
      y = new Pn(1, 1, 1),
      b = new Fo(),
      g = (B, X, re, Y, he) => {
        (he.copy(re).multiply(B.q), Y.copy(B.p).applyQuaternion(re).add(X));
      },
      E = { p: m.fore.p, q: m.fore.q },
      M = { p: new Pn(), q: new Fo() };
    g(m.pinch, u, b, M.p, M.q);
    let _ = { p: M.p.clone().add(new Pn(-0.045, -0.035, 0.015)), q: M.q.clone() },
      T = { p: M.p.clone().add(new Pn(0, -(C5 + 0.006), 0)), q: M.q.clone() },
      w = Au(-0.5, 0, 0.25),
      S = { p: M.p.clone().add(new Pn(-0.06, -0.36, 0.13)), q: w.clone().multiply(M.q) },
      R = { p: new Pn(-0.05, -0.38, 0.14), q: w.clone() },
      z = { p: new Pn(-0.005, -(C5 + 0.014), 0.006), q: Au(-0.11, 0, 0.07) },
      I = { p: new Pn(0, -C5, 0), q: new Fo() },
      L = [
        [ft.rise, R],
        [ft.align, z],
        [ft.insert, I],
        [9, I],
      ],
      U = { p: new Pn(), q: new Fo() };
    g(m.carry, u.clone().add(R.p), R.q, U.p, U.q);
    let k = { p: new Pn(), q: new Fo() };
    g(m.carry, u, b, k.p, k.q);
    let C = { p: m.handle.p, q: m.handle.q },
      A = { p: new Pn(), q: new Fo() },
      F = { partial: !0 },
      H = [
        [0, E],
        [0.07, E],
        [0.27, _],
        [ft.atMag, M],
        [9, M],
      ],
      N = {
        tac: [
          [ft.tacRelease + 0.03, A],
          [ft.tac - 0.04, E],
          [9, E],
        ],
        empty: [
          [ft.release + 0.03, A],
          [ft.empty - 0.1, E],
          [9, E],
        ],
      },
      Z = tn(new Float32Array(Un), di.relaxed, di.open, 0.25),
      Q = tn(new Float32Array(Un), nn.mag_pinch.fit.from, m.pinch.pose, 0.25),
      W = new Pn(),
      J = new Fo(),
      G = new Fo(),
      te = new Pn(),
      oe = new Pn(),
      ee = new Fo(),
      le = new Je().compose(m.pinch.p, m.pinch.q, y).invert(),
      xe = new Je().compose(m.carry.p, m.carry.q, y).invert(),
      j = new Pn(),
      O = { p: new Pn().copy(E.p), q: new Fo().copy(E.q), pose: new Float32Array(Un), busy: !1 },
      q = (B, X, re, Y, he) => (he < 0.5 ? tn(B, X, re, Ot(he * 2)) : tn(B, re, Y, Ot(he * 2 - 1))),
      ue = (B) => {
        (v.compose(W, J, y).multiply(B), v.decompose(c.position, c.quaternion, j));
      },
      de = 9,
      $ = !1,
      se = 0,
      fe = 1,
      me = 0;
    function ge() {
      ((O.busy = !1),
        O.p.copy(E.p),
        O.q.copy(E.q),
        O.pose.set(m.fore.pose),
        (c.visible = !0),
        c.position.copy(u),
        c.quaternion.identity(),
        (se = 0));
    }
    ge();
    let ce = Object.values(a).reduce((B, X) => B + Tu(X), 0) + (h ? Tu(h.geometry) : 0) + 2,
      P = 0;
    r.traverse((B) => {
      B.isMesh && P++;
    });
    let D = {
      id: "rifle",
      name: wn.name,
      root: r,
      magGroup: c,
      flash: d,
      muzzle: wn.muzzle,
      eject: wn.eject,
      sight: [0, wn.sightY, -wn.lensF],
      info: { tris: Math.round(ce), meshes: P },
      slot: { id: "rifle", name: wn.name, ammo: 30, magSize: 30, reserve: 150 },
      def: {
        magSize: 30,
        reserve: 150,
        rpm: 720,
        damage: 26,
        range: 300,
        auto: !0,
        adsTime: 0.18,
        inspect: !0,
        flashLight: 45,
        flashScale: 1,
        smoke: !0,
        spread: {
          hip: 0.0125,
          ads: 0.0012,
          moveHip: 0.013,
          moveAds: 0.004,
          bloomHip: 0.0065,
          bloomAds: 0.0022,
          air: 0.022,
          crouch: 0.002,
          shot: 0.17,
          decay: 1.5,
        },
      },
      views: Uy,
      view: 0,
      get pose() {
        return Uy[D.view];
      },
      setView(B) {
        D.view = Math.max(0, Math.min(Uy.length - 1, B | 0));
      },
      motion: bh.rifle,
      reloadTime: (B) => (B ? ft.empty : ft.tac),
      reset() {
        ((de = 9), ($ = !1), (f.visible = !0), ge(), (l.position.z = 0), (fe = 1), (me = 0));
      },
      cancelReload(B) {
        (ge(), B && ($ = !1), (f.visible = D.slot.ammo > 0));
      },
      shot(B) {
        ((de = 0), x && (x.right.impulse(0.55), x.left.impulse(0.35)), B && (($ = !0), (f.visible = !1)));
      },
      recoil(B, X, re) {
        let Y = B <= 9 ? 1 : 0.38,
          he = (B < 4 ? (o() - 0.5) * 0.0022 : Math.sin(B * 0.57 + s.recPhase) * 0.0042 + (o() - 0.5) * 0.002) * X;
        (re.addRecoil && re.addRecoil(0.0068 * Y * X * (0.85 + o() * 0.3), he), re.addShake && re.addShake(0.12 * X));
        let V = bh.rifle.recoil,
          ne = s.adsE,
          Te = (B === 1 ? V.first : B === 2 ? 0.5 + 0.5 * V.first : 1) * (0.88 + o() * 0.24) * (re.crouching ? 0.88 : 1),
          Re = Te * u0(1, V.adsRot, ne),
          Ue = Te * u0(1, V.adsPos, ne);
        ((s.kZ.v += V.back * Te * u0(1, V.adsBack, ne)),
          (s.kP.v += V.rise * Re),
          (s.kY.v += (o() - 0.5) * V.yaw * Re),
          (s.kR.v += (o() - 0.5) * V.roll * Re),
          (s.kU.v += V.up * Ue * (0.7 + 0.6 * o())),
          (s.kX.v += (o() - 0.5) * 2 * V.side * Ue));
      },
      reload(B, X) {
        let re = n.ev,
          Y = B.empty;
        (re(B, "magout", ft.magout) && (s.bump.v -= 0.25),
          X >= ft.swap && !B.f.fresh && ((B.f.fresh = 1), (f.visible = !0)),
          re(B, "maginsert", ft.insert) && ((s.bump.v += 0.1), (s.kR.v += 0.4)),
          re(B, "magin", ft.magin) && ((s.bump.v += 0.8), (s.kR.v -= 0.55), Y || ($ = !1), x && x.left.impulse(1)),
          X >= ft.regrip + 0.025 && !B.f.tug && ((B.f.tug = 1), (s.bump.v -= 0.3)));
        let he = Y ? ft.back : ft.tacBack,
          V = Y ? ft.release : ft.tacRelease,
          ne = Y ? ft.bolt : ft.tacBolt,
          ye = Y ? 1 : ft.partial,
          Te = Y ? yS : 0;
        ((se =
          X < ft.atHandle
            ? Te
            : X < he
              ? Te + (ye - Te) * Ot(dn(X, ft.atHandle, he))
              : X < V
                ? ye
                : ye * Math.max(0, 1 - (X - V) / (ne - V))),
          re(B, "boltback", he, Y ? null : F) && (($ = !1), (s.kZ.v += Y ? 0.55 : 0.3), (s.bump.v -= Y ? 0.12 : 0.06)),
          re(B, "bolt", ne) && (($ = !1), (s.kZ.v -= Y ? 0.85 : 0.45), (s.kP.v -= Y ? 0.9 : 0.4), (s.bump.v -= Y ? 0.14 : 0.05), (se = 0)),
          (s.antYT =
            0.0045 * B1(X, ft.magout - 0.14, ft.magout) - 0.002 * B1(X, ft.insert - 0.1, ft.insert) - 0.006 * B1(X, ft.short, ft.magin)),
          (s.antRT = 0.022 * B1(X, ft.magout - 0.14, ft.magout) + 0.05 * B1(X, ft.atHandle - 0.04, V)));
        let Re = O.pose;
        if (((O.busy = !0), X < ft.magout))
          (Ru(H, X, W, J),
            q(Re, m.fore.pose, Z, Q, dn(X, 0.03, 0.3)),
            X > 0.3 && tn(Re, Q, m.pinch.pose, Ot(dn(X, 0.3, ft.atMag + 0.02))),
            c.quaternion.identity(),
            c.position.copy(u));
        else if (X < ft.away) {
          let ze = yh(dn(X, ft.magout, ft.clear)),
            Ge = Ot(dn(X, ft.clear - 0.03, ft.away));
          (W.copy(M.p).lerp(T.p, ze).lerp(S.p, Ge), J.copy(M.q).slerp(S.q, Ge), Re.set(m.pinch.pose), ue(le));
        } else if (X < ft.rise) {
          let ze = Ot(dn(X, ft.away, ft.rise));
          (W.copy(S.p).lerp(U.p, ze), J.copy(S.q).slerp(U.q, ze), tn(Re, m.pinch.pose, m.carry.pose, ze), ue(X < ft.swap ? le : xe));
        } else {
          let ze = 0,
            Ge = 0,
            _e = 0;
          if (X < ft.insert) Ru(L, X, oe, ee);
          else {
            if ((oe.set(0, 0, 0), ee.identity(), X < ft.short))
              ze = ft.shortBy + (C5 - ft.shortBy) * Math.pow(1 - dn(X, ft.insert, ft.short), 2.2);
            else if (X < ft.windup) ((ze = ft.shortBy), (_e = Ot(dn(X, ft.short, ft.windup))), (Ge = ft.backOff * _e));
            else if (X < ft.magin) {
              let Ne = dn(X, ft.windup, ft.magin),
                ke = (ft.shortBy + ft.backOff) * (1 - Ne * Ne);
              ((ze = Math.min(ft.shortBy, ke)), (Ge = ke - ze), (_e = 1));
            } else
              X < ft.rebound
                ? ((Ge = ft.reboundBy * yh(dn(X, ft.magin, ft.rebound))), (_e = 1))
                : X < ft.regrip
                  ? ((Ge = ft.reboundBy * (1 - Ot(dn(X, ft.rebound, ft.regrip)))), (_e = 1 - Ot(dn(X, ft.rebound, ft.regrip))))
                  : X < ft.tugDown
                    ? (Ge = ft.tugBy * Ot(dn(X, ft.regrip, ft.tugDown)))
                    : X < ft.tugUp && (Ge = ft.tugBy * (1 - Ot(dn(X, ft.tugDown, ft.tugUp))));
            oe.y = -ze;
          }
          if ((c.quaternion.copy(ee), c.position.copy(u).add(oe), X < ft.tugUp))
            (g(m.carry, c.position, ee, W, J), (W.y -= Ge), tn(Re, m.carry.pose, m.cup.pose, _e));
          else if (X < ft.atHandle) {
            let Ne = dn(X, ft.tugUp, ft.atHandle),
              ke = Ot(Ne);
            (te.copy(C.p),
              (te.z += wn.boltTravel * Te),
              W.copy(k.p).lerp(te, ke),
              (W.x -= 0.03 * Math.sin(Math.PI * ke)),
              J.copy(k.q).slerp(C.q, ke),
              q(Re, m.carry.pose, Z, m.handle.pose, Ne));
          } else if (X < V + 0.03)
            (W.copy(C.p),
              (W.z += wn.boltTravel * (X < V ? se : ye)),
              J.copy(C.q),
              A.p.copy(W),
              A.q.copy(J),
              tn(Re, m.handle.pose, Z, 0.5 * Ot(dn(X, V, V + 0.03))));
          else {
            let Ne = Y ? N.empty : N.tac;
            Ru(Ne, X, W, J);
            let ke = dn(X, Ne[0][0], Ne[1][0]);
            ((W.y -= 0.035 * Math.sin(Math.PI * Ot(ke))),
              ke < 0.6 ? tn(Re, m.handle.pose, Z, 0.5 + 0.5 * Ot(ke / 0.6)) : tn(Re, Z, m.fore.pose, Ot((ke - 0.6) / 0.4)));
          }
        }
        (O.p.copy(W), O.q.copy(J));
        let Ue = Ot(X / 0.3),
          Ve = 1 - Ot((X - (B.T - 0.46)) / 0.4);
        ((s.reloadW = Math.min(Ue, Ve)), (s.rackW = Ot((X - (ft.magin + 0.08)) / 0.28) * Ve));
      },
      endReload() {
        ge();
      },
      parts(B, X) {
        de += B;
        let re = 0.072,
          Y = de < re ? Math.sin((Math.PI * de) / re) : 0;
        ($ && de > re * 0.5 && (Y = Math.max(Y, yS / 0.95)), (l.position.z = wn.boltTravel * Math.max(Y * 0.95, se)), (me = X));
      },
      armTargets(B, X) {
        let re = s.spV.x > 0.3 || s.reload || s.hol > 0.12 ? 0 : 1;
        ((fe += (re - fe) * (1 - Math.exp(-16 * X))),
          B.r.p.copy(m.grip.p),
          B.r.q.copy(m.grip.q),
          tn(B.r.pose, m.grip.pose, m.trigger.pose, Ot(fe)),
          (B.r.trig = me * fe));
        let Y = Math.min(1, Math.max(0, s.spV.x));
        (B.r.pole.fromArray(sc.poleR).lerp(te.fromArray(sc.sprintPoleR), Y),
          B.r.sh.fromArray(sc.shR).lerp(te.fromArray(sc.sprintShR), Y),
          B.l.p.copy(O.p),
          B.l.q.copy(O.q),
          B.l.pose.set(O.busy ? O.pose : m.fore.pose),
          (B.l.trig = 0),
          B.l.pole.fromArray(sc.poleL),
          B.l.sh.fromArray(sc.shL));
      },
      snapArms() {
        fe = s.spV.x > 0.3 || s.reload || s.hol > 0.12 ? 0 : 1;
      },
      setLocked(B) {
        (($ = !!B), (f.visible = !B));
      },
      get locked() {
        return $;
      },
      holds: m,
    };
    return D;
  }
  export var Hu = 0.0128,
    sl = -0.012,
    Ki = 0.011,
    No = 0.0165,
    ES = 0.0074,
    Oy = 0.0046,
    Vy = 0.314,
    SS = [-0.309, -0.951],
    RS = 0.1185,
    G0 = {
      name: "PAC-4 Bosun",
      muzzle: [0, 0, -0.1075],
      eject: [0.017, 0.007, -0.01],
      sightY: No,
      rearF: -0.0705,
      frontF: 0.0885,
      slideTravel: 0.04,
      slideLock: 0.036,
      rake: Vy,
      magPos: [0, -0.013, 0.0387],
      magLen: RS,
      magAxis: [0, SS[1], -SS[0]],
      stopPivot: [0, -0.0165, -0.004],
      barrelPivot: [0, -0.01, 0],
      gripFront: [-0.0335, -0.06],
      gripBack: [-0.0925, -0.06],
    },
    TS = (n, e, t, i, s = 12) => {
      let o = new Bc(n, s);
      return (o.translate(e, t, i), o);
    };
__late_props.sl(sl);
  export function AS(n = 0, e = Hu) {
    let t = [
      [e - 8e-4, sl],
      [e, sl + 8e-4],
      [e, sl + 0.0022],
      [e - 55e-5, sl + 0.0027],
      [e - 55e-5, sl + 0.0041],
      [e, sl + 0.0046],
      [e - n, sl + 0.0056],
      [e - n, Oy - 0.001],
      [e, Oy],
      [ES + 7e-4, Ki - 8e-4],
      [ES, Ki],
    ];
    return t.concat(t.map((i) => [-i[0], i[1]]).reverse());
  }
  export function CS() {
    let n = [1, 1, 1],
      e = [1, 1, 1],
      t = [2.6, 2.6, 2.7],
      i = [0.3, 0.3, 0.31],
      s = [1, 1, 1],
      o = [0.014, 0.014, 0.015],
      r = { wear: 1 },
      a = { wear: 0.9 },
      l = { bare: 0.45, wear: 1.2 },
      c = { wear: 0.8 },
      u = { wear: 0, ao: 0.75 },
      f = { wear: 0 },
      h = [],
      p = [],
      d = [],
      m = [],
      x = [],
      v = [],
      y = [],
      b = [],
      g = [],
      E = (H, N, Z, Q, W, J, G, te) => {
        let oe = Math.min(H * 0.25, (Z - N) * 0.25);
        return h0(
          [
            [0, N],
            [H - oe, N],
            [H, N + oe],
            [H, Z - oe],
            [H - oe, Z],
            [0, Z],
          ],
          G,
          J,
          { ...te, ox: Q, oy: W },
        );
      },
      M = 0.245,
      _ = 65e-5,
      T = AS(0),
      w = AS(_),
      S = (H, N) => (Math.abs(H) < Hu - 3e-4 && N > sl + 0.005 && N < Oy - 5e-4 ? 0.8 : 0),
      R = (H, N, Z, Q = 0.0032, W = 0.0015) => {
        for (let J = 0; J < Z; J++) {
          let G = N + J * Q;
          H.push(
            kn(T, G - W / 2 - 35e-5, { rake: -M }),
            kn(w, G - W / 2, { rake: -M }),
            kn(w, G + W / 2, { rake: -M }),
            kn(T, G + W / 2 + 35e-5, { rake: -M }),
          );
        }
      };
    {
      let H = [kn(T, -0.082, { sx: 0.945, sy: 0.94, cy: -5e-4 }), kn(T, -0.0811)];
      (R(H, -0.0735, 10), H.push(kn(T, -0.038), kn(T, -0.0118)), h.push(Eu(H, n, { ...r, crease: 38, aoFn: S })));
    }
    {
      let H = T.slice(0, 6),
        N = T.slice(11),
        Z = [
          ...H,
          [Hu, -0.0011],
          [Hu - 6e-4, -5e-4],
          [-0.0042, -5e-4],
          [-0.0042, Ki - 6e-4],
          [-0.0048, Ki],
          ...N.filter((Q) => Q[0] < -0.005),
        ];
      h.push(Nn(Z, -0.012, 0.03, 4e-4, n, { wear: 1, zone: 0.5, crease: 38 }));
    }
    {
      let H = [kn(T, 0.0298), kn(T, 0.056)];
      (R(H, 0.064, 6),
        H.push(
          kn(T, 0.088),
          kn(T, 0.0975),
          kn(T, 0.1018, { sx: 0.965, sy: 0.97, cy: 0.002 }),
          kn(T, 0.104, { sx: 0.9, sy: 0.92, cy: 0.002 }),
        ),
        h.push(Eu(H, n, { ...r, crease: 38, aoFn: S })));
    }
    for (let H = 0; H < 5; H++) {
      let N = (H - 2) * 0.0026;
      (h.push(Mt(9e-4, 5e-4, 0.044, 2e-4, N, Ki + 1e-4, -0.04, n, { wear: 0.45 })),
        h.push(Mt(9e-4, 5e-4, 0.05, 2e-4, N, Ki + 1e-4, 0.059, n, { wear: 0.45 })));
    }
    let z = [0.8, 0.8, 0.83];
    (h.push(
      Nn(
        b0(
          [
            [-0.0092, Ki - 4e-4],
            [0.0092, Ki - 4e-4],
            [0.0092, No - 0.0016],
            [0.0078, No],
            [0.0019, No],
            [0.0019, No - 0.003],
            [-0.0019, No - 0.003],
            [-0.0019, No],
            [-0.0078, No],
            [-0.0092, No - 0.0016],
          ],
          [0, 0, 6e-4, 6e-4, 0, 0, 0, 0, 6e-4, 6e-4],
          1,
        ),
        -0.0755,
        -0.0655,
        4e-4,
        z,
        r,
      ),
    ),
      h.push(
        Nn(
          [
            [-0.0074, Ki - 2e-4],
            [0.0074, Ki - 2e-4],
            [0.0066, Ki + 0.0011],
            [-0.0066, Ki + 0.0011],
          ],
          -0.078,
          -0.063,
          3e-4,
          z,
          r,
        ),
      ),
      h.push(
        h0(
          [
            [0, -6e-4],
            [0.0011, -6e-4],
            [0.0013, -3e-4],
            [0.0013, 4e-4],
            [0, 4e-4],
          ],
          6,
          t,
          l,
        )
          .rotateX(Math.PI / 2)
          .translate(0, Ki + 0.0011, 0.0642),
      ),
      h.push(
        Q0(
          [
            [0.0885, Ki - 4e-4],
            [0.0975, Ki - 4e-4],
            [0.0935, No],
            [0.0885, No],
          ],
          -0.0017,
          0.0017,
          3e-4,
          z,
          r,
        ),
      ),
      h.push(
        Nn(
          [
            [-0.005, Ki - 2e-4],
            [0.005, Ki - 2e-4],
            [0.0044, Ki + 0.001],
            [-0.0044, Ki + 0.001],
          ],
          0.087,
          0.0985,
          3e-4,
          z,
          r,
        ),
      ),
      h.push(Mt(0.0013, 0.003, 0.019, 5e-4, Hu, 0.0012, -0.0225, [2.2, 2.2, 2.3], { bare: 0.5, wear: 1 })),
      h.push(m0(0.001, 6e-4, Hu + 2e-4, 0.0012, -0.03, t, 6, l)),
      h.push(Nn(Su(-0.008, -0.0092, 0.008, 0.0052, 0.0016, 2), -0.0826, -0.0816, 3e-4, [0.62, 0.62, 0.64], { wear: 0.6 })),
      h.push(E(0.0016, -0.0829, -0.082, 0, -0.0052, t, 8, l)),
      h.push(Mt(0.0012, 0.0032, 0.0052, 3e-4, -Hu, sl + 0.0015, 0.008, i, u)),
      h.push(
        h0(
          [
            [0.0082, 0.10405],
            [0.0067, 0.10405],
          ],
          16,
          [0.1, 0.1, 0.11],
          u,
        ),
      ),
      h.push(
        h0(
          [
            [0.0036, 0.10405],
            [0.0029, 0.10405],
          ],
          10,
          [0.1, 0.1, 0.11],
          { ...u, oy: -0.0088 },
        ),
      ));
    for (let H of [-1, 1]) g.push(TS(0.00105, H * 0.0052, No - 0.0024, 0.0755 + 1e-4));
    (g.push(TS(0.00115, 0, No - 0.0019, -0.0885 + 1e-4)),
      p.push(
        h0(
          [
            [0.0066, 0.026],
            [0.0066, 0.105],
            [0.0061, 0.1066],
            [0.0055, 0.1075],
            [0.0049, 0.1075],
            [0.0045, 0.1062],
          ],
          16,
          [5.5, 5.5, 5.7],
          { bare: 0.8, wear: 0.6 },
        ),
      ),
      p.push(
        h0(
          [
            [0.0045, 0.1062],
            [0.0045, 0.09],
            [0, 0.09],
          ],
          12,
          [0.25, 0.25, 0.25],
          u,
        ),
      ),
      p.push(
        Nn(
          b0(
            [
              [-0.0038, -4e-4],
              [0.009, -4e-4],
              [0.009, 0.0096],
              [0.008, 0.0106],
              [-0.003, 0.0106],
              [-0.0038, 0.0098],
            ],
            5e-4,
            1,
          ),
          -0.0115,
          0.0295,
          5e-4,
          [7.5, 7.5, 7.8],
          { bare: 1, wear: 0.5, zone: 0.8 },
        ),
      ),
      p.push(Mt(0.0022, 6e-4, 0.0034, 2e-4, 0.0026, 0.0106, -0.0085, i, u)),
      p.push(Mt(6e-4, 0.004, 0.006, 2e-4, 0.0091, 0.004, -0.008, i, u)));
    let I = b0(
      [
        [0.098, -0.0126],
        [0.1, -0.015],
        [0.1, -0.027],
        [0.097, -0.03],
        [0.024, -0.03],
        [0.02, -0.033],
        [-0.026, -0.033],
        [-0.031, -0.04],
        [-0.084, -0.04],
        [-0.0875, -0.03],
        [-0.0885, -0.0126],
      ],
      [6e-4, 0.0015, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.004, 8e-4],
      2,
    );
    (d.push(Q0(I, -0.0127, 0.0127, 0.0016, s, { ...c, bs: 2 })),
      d.push(
        Eu(
          [
            [-0.084, 0.0126, -0.033, -0.0126, 0.0016, 0.003],
            [-0.0872, 0.0125, -0.0292, -0.0126, 0.0018, 0.004],
            [-0.0902, 0.012, -0.0258, -0.0128, 0.0022, 0.0046],
            [-0.093, 0.011, -0.0232, -0.0132, 0.0026, 0.0044],
            [-0.0954, 0.0096, -0.0214, -0.0139, 0.0028, 0.0036],
            [-0.0972, 0.008, -0.0203, -0.0147, 0.0026, 0.0028],
            [-0.0984, 0.006, -0.0196, -0.0156, 0.0019, 0.0019],
          ].map(([H, N, Z, Q, W, J]) => kn($a(N, Z, Q, W, J, 4), H)),
          s,
          { ...c, crease: 62 },
        ),
      ));
    {
      let H = [
          [-0.0262, -0.015],
          [-0.0275, -0.033],
          [-0.03, -0.037],
          [-0.0335, -0.06],
          [-0.0545, -0.125],
          [-0.056, -0.13],
        ],
        N = [
          [-0.0895, -0.015],
          [-0.0915, -0.0222],
          [-0.0878, -0.03],
          [-0.085, -0.035],
          [-0.0885, -0.042],
          [-0.093, -0.062],
          [-0.101, -0.09],
          [-0.1085, -0.115],
        ],
        Z = (G, te) => {
          let oe = 0;
          for (; oe < G.length - 2 && te < G[oe + 1][1];) oe++;
          return G[oe][0] + ((G[oe + 1][0] - G[oe][0]) * (te - G[oe][1])) / (G[oe + 1][1] - G[oe][1]);
        },
        Q = [];
      for (let [G, te, oe, ee, le] of [
        [-0.015, -0.015, 0.0124, 0.004, 0.004],
        [-0.0185, -0.0185, 0.013, 0.0055, 0.005],
        [-0.024, -0.024, 0.0137, 0.0068, 0.0062],
        [-0.031, -0.031, 0.0146, 0.0078, 0.008],
        [-0.04, -0.039, 0.015, 0.0082, 0.0096],
        [-0.06, -0.058, 0.015, 0.0084, 0.0102],
        [-0.08, -0.076, 0.015, 0.0084, 0.0104],
        [-0.1, -0.093, 0.015, 0.0084, 0.0104],
        [-0.118, -0.106, 0.015, 0.0082, 0.01],
        [-0.124, -0.1105, 0.0158, 0.008, 0.0096],
        [-0.13, -0.115, 0.0162, 0.0078, 0.0092],
        [-0.1308, -0.1158, 0.015, 0.007, 0.0084],
      ]) {
        let xe = Z(H, G),
          j = Z(N, te),
          O = $a(oe, j, xe, ee, le, 4);
        Q.push(O.map((q) => [q[0], te + ((G - te) * (q[1] - j)) / (xe - j), -q[1]]));
      }
      d.push(Eu(Q, s, { ...c, crease: 40 }));
      let W = b0(
          [
            [-0.044, -0.05],
            [-0.06, -0.115],
            [-0.099, -0.104],
            [-0.0935, -0.085],
            [-0.0865, -0.06],
            [-0.083, -0.045],
            [-0.056, -0.041],
          ],
          0.004,
          2,
        ),
        J = [];
      for (let G = 0; G < 16; G++) {
        let te = (G / 16) * Math.PI * 2;
        J.push([-0.0685 + Math.cos(te) * 0.0064, -0.072 + Math.sin(te) * 0.0064]);
      }
      for (let G of [-1, 1])
        (d.push(Q0(W, G > 0 ? 0.0146 : -0.0155, G > 0 ? 0.0155 : -0.0146, 4e-4, s, { wear: 0.8, zone: 1, holes: [J] })),
          m.push(m0(0.0058, 0.0012, G * 0.015, -0.072, -0.0685, [3.2, 3.2, 3.3], 16, { bare: 0.7, wear: 1 })),
          d.push(
            Q0(Su(0, -0.027, 0.019, -0.018, 0.002, 2), G > 0 ? 0.0124 : -0.0131, G > 0 ? 0.0131 : -0.0124, 3e-4, s, { wear: 0.8, zone: 1 }),
          ));
    }
    d.push(
      Nn(
        [
          [-0.0086, -0.0296],
          [0.0086, -0.0296],
          [0.01, -0.032],
          [-0.01, -0.032],
        ],
        0.038,
        0.095,
        4e-4,
        s,
        c,
      ),
    );
    {
      let H = b0(
        [
          [-0.01, -0.0316],
          [0.01, -0.0316],
          [0.0106, -0.0326],
          [0.009, -0.0346],
          [-0.009, -0.0346],
          [-0.0106, -0.0326],
        ],
        4e-4,
        1,
      );
      for (let N = 0; N < 5; N++) {
        let Z = 0.042 + N * 0.01001;
        d.push(Nn(H, Z, Z + 0.00478, 6e-4, s, c));
      }
    }
    d.push(
      Q0(
        b0(
          [
            [0.024, -0.029],
            [0.025, -0.056],
            [0.016, -0.0665],
            [-0.029, -0.0665],
            [-0.0345, -0.06],
            [-0.03, -0.032],
          ],
          [0.001, 0.004, 0.004, 0.004, 0.003, 0.001],
          2,
        ),
        -0.0075,
        0.0075,
        0.002,
        s,
        {
          ...c,
          bs: 2,
          holes: [
            b0(
              [
                [0.0195, -0.0335],
                [0.02, -0.055],
                [0.014, -0.062],
                [-0.027, -0.062],
                [-0.03, -0.057],
                [-0.026, -0.0335],
              ],
              0.004,
              3,
            ),
          ],
        },
      ),
    );
    for (let H = 0; H < 5; H++) d.push(Mt(0.011, 0.0016, 0.0014, 5e-4, 0, -0.037 - H * 0.0042, 0.0252, s, c));
    (v.push(Mt(0.0222, 0.001, 0.0345, 2e-4, 0, -0.12585, -0.07526, o, f, [-0.278, 0, 0])),
      d.push(
        Q0(
          b0(
            [
              [-0.101, -0.1085],
              [-0.1094, -0.1112],
              [-0.1072, -0.1188],
              [-0.099, -0.116],
            ],
            0.0015,
            2,
          ),
          -0.003,
          0.003,
          8e-4,
          s,
          { ...c, holes: [Su(-0.1064, -0.1158, -0.1026, -0.1116, 0.0012, 2)] },
        ),
      ),
      m.push(m0(0.0013, 0.0304, 0, -0.103, -0.0985, t, 8, l)),
      d.push(Mt(0.0034, 0.0082, 0.0072, 0.0014, -0.015, -0.0455, -0.0375, s, { wear: 1.2 }, [-Vy, 0, 0])));
    for (let H = 0; H < 3; H++) d.push(Mt(8e-4, 0.001, 0.006, 3e-4, -0.0169, -0.0432 - H * 0.0022, -0.0375 - H * 7e-4, s, c));
    for (let [H, N, Z] of [
      [0.004, -0.0225, 0.0019],
      [-0.008, -0.0178, 0.0016],
      [-0.076, -0.026, 0.0019],
    ])
      m.push(m0(Z, 0.0262, 0, N, H, t, 10, l));
    (m.push(
      Q0(
        b0(
          [
            [-0.0065, -0.0325],
            [0.0012, -0.0325],
            [6e-4, -0.042],
            [0.003, -0.05],
            [0.0056, -0.0565],
            [0.0022, -0.0588],
            [-0.003, -0.052],
            [-0.0055, -0.043],
          ],
          [0, 0, 0.004, 0.005, 8e-4, 8e-4, 0.005, 0.004],
          2,
        ),
        -0.0033,
        0.0033,
        0.0011,
        [1.2, 1.2, 1.25],
        { wear: 0.6, bs: 2 },
      ),
    ),
      m.push(Mt(0.0012, 0.011, 0.0014, 4e-4, 0, -0.049, 0.0048, [0.6, 0.6, 0.62], a, [0.36, 0, 0])));
    for (let H of [-1, 1]) {
      m.push(Mt(0.0018, 0.0044, 0.0125, 7e-4, H * 0.0131, -0.0188, 0.0215, e, { wear: 1.3 }));
      for (let N = 0; N < 4; N++) m.push(Mt(8e-4, 0.0034, 0.001, 3e-4, H * 0.0142, -0.0188, 0.0178 + N * 0.0025, e, { wear: 1.3 }));
    }
    m.push(
      h0(
        [
          [0.0028, 0.03],
          [0.0028, 0.1036],
          [0.0023, 0.1046],
          [0, 0.1046],
        ],
        10,
        [8, 8, 8.3],
        { bare: 0.9, wear: 0.4, oy: -0.0088 },
      ),
    );
    for (let H of [-1, 1]) m.push(Mt(0.002, 0.001, 0.15, 3e-4, H * 0.0112, -0.01225, 0.01, i, u));
    {
      x.push(
        Q0(
          b0(
            [
              [0.0045, 0.0024],
              [0.0045, -0.0024],
              [-0.019, -0.0022],
              [-0.029, -0.004],
              [-0.0335, -0.0016],
              [-0.0335, 0.003],
              [-0.0255, 0.004],
              [-0.019, 0.0022],
            ],
            8e-4,
            1,
          ),
          -0.0149,
          -0.0128,
          5e-4,
          [1.3, 1.3, 1.35],
          { wear: 1.3 },
        ),
      );
      for (let H = 0; H < 4; H++)
        x.push(Mt(8e-4, 0.005, 0.0011, 3e-4, -0.0152, 2e-4, -0.0222 - H * 0.0026, [1.3, 1.3, 1.35], { wear: 1.3 }));
      x.push(m0(0.0026, 0.001, -0.0153, 0, 0.001, t, 10, l));
    }
    let L = [2.3, 2.3, 2.4],
      U = RS,
      k = { bare: 0.45, wear: 1, zone: 0.6 };
    (y.push(
      Q0(
        Su(-0.0155, -U, 0.0155, 0, 0.003, 2).map((H) => [-H[0], H[1]]),
        -0.01025,
        0.01025,
        0.0018,
        L,
        { ...k, bs: 2 },
      ),
    ),
      y.push(Mt(0.005, U - 0.02, 0.001, 4e-4, 0, -U / 2 - 0.004, 0.0157, L, k)));
    for (let H = 0; H < 6; H++) y.push(m0(0.0015, 6e-4, 0.01025, -0.03 - H * 0.014, -0.01, i, 8, u));
    for (let H of [-1, 1]) y.push(Mt(0.0024, 0.0052, 0.023, 8e-4, H * 0.0074, 0.0016, -0.003, L, k));
    (y.push(Mt(0.0262, 0.008, 0.04, 0.0026, 0, -U - 0.0036, 0.0025, [0.85, 0.85, 0.87], { wear: 0.7 })),
      y.push(Mt(0.018, 0.0012, 0.008, 4e-4, 0, -U - 0.0078, 0.01, [0.55, 0.55, 0.56], f)),
      y.push(Mt(0.015, 0.004, 0.019, 0.001, 0, -0.001, -0.004, [6, 2.6, 0.9], f)));
    let C = [1.25, 0.72, 0.5];
    {
      let H = h0(
          [
            [0, -0.0105],
            [0.0046, -0.0105],
            [0.0049, -0.0098],
            [0.0049, 0.007],
            [0.0046, 0.0085],
          ],
          12,
          [1, 1, 1],
          f,
        ),
        N = h0(
          [
            [0.0045, 0.0085],
            [0.0043, 0.0125],
            [0.0034, 0.016],
            [0.0018, 0.0182],
            [0, 0.0188],
          ],
          12,
          C,
          f,
        );
      for (let Z of [H, N]) (Z.rotateX(0.09), Z.translate(0, 0.0046, -0.001), b.push(Z));
    }
    let A = { slide: Fs(h), barrel: Fs(p), frame: Fs(d), steel: Fs(m), stop: Fs(x), plain: Fs(v), mag: Fs(y), round: Fs(b) },
      F = (H, N, Z, Q) =>
        Q === "frame"
          ? Math.abs(H) < 0.0155 && N < -0.048 && N > -0.124 && -Z < -0.03
            ? (1 - Math.min(1, Math.max(0, (Math.abs(H) - 0.0075) / 0.003))) *
              Math.max(
                1 - Math.min(1, Math.max(0, (-0.0335 + (N + 0.06) * 0.323 + Z - 0.004) / 0.003)),
                1 - Math.min(1, Math.max(0, (-Z - (-0.093 + (N + 0.062) * 0.2857) - 0.004) / 0.003)),
              )
            : 0
          : Q === "slide"
            ? Math.max(
                0.8 * Zl(H, N, Z, -0.006, 0.02, -0.002, 0.009, -0.014, 0.032, 0.004),
                0.6 * Zl(H, N, Z, -0.02, 0.02, -0.02, 0.02, 0.094, 0.11, 0.008),
                0.5 * Zl(H, N, Z, -0.02, 0.02, -0.014, -0.0105, -0.09, 0.11, 0.002),
              )
            : 0;
    (sy(
      Object.keys(A).map((H) => ({
        key: H,
        g: A[H],
        off: H === "mag" || H === "round" ? G0.magPos : H === "stop" ? G0.stopPivot : null,
        rx: H === "mag" || H === "round" ? -Vy : 0,
      })),
      F,
      0.0013,
    ),
      (A.dots = DD(g)));
    for (let H in A) A[H].computeBoundingSphere();
    return A;
  }
  export function DD(n) {
    let e = [],
      t = [],
      i = [],
      s = [],
      o = 0;
    for (let a of n) {
      let l = a.attributes.position.array,
        c = a.attributes.normal.array,
        u = a.attributes.uv.array;
      for (let f = 0; f < l.length; f++) (e.push(l[f]), t.push(c[f]));
      for (let f = 0; f < u.length; f++) i.push(u[f]);
      for (let f of a.index.array) s.push(f + o);
      o += l.length / 3;
    }
    let r = new pt();
    return (
      r.setAttribute("position", new et(e, 3)),
      r.setAttribute("normal", new et(t, 3)),
      r.setAttribute("uv", new et(i, 2)),
      r.setIndex(s),
      r
    );
  }
  export var ii = K,
    or = St,
    Bh = 0.118,
    k5 = 0.062,
    kS = (n, e) => ({ p: n.p.map((t, i) => t - e.p[i]), r: n.r.map((t, i) => t - e.r[i]) }),
    Wy = (n, e, t, i, s, o, r) => ({
      name: n,
      HIP: e,
      ADS: { p: [0, -G0.sightY, t], r: [0, 0, 0] },
      SPRINT: kS(i, e),
      SPRINT_ARC: s,
      RELOAD: kS(o, e),
      RACK: r,
    }),
    Gy = { p: [-0.03, 0.035, 0.04], r: [0.06, 0.04, -0.22] },
    qy = [0.58, 0.28, -0.99],
    Xy = [
      Wy(
        "close",
        { p: [0.075, -0.071, -0.343], r: [0.01, 0.08, 0.1] },
        -0.44,
        { p: [0.07, -0.11, -0.33], r: [-0.55, 0.35, 0.12] },
        { p: [-0.006, -0.012, 0.02], r: [0.05, 0.03, 0.04] },
        { p: [0.065, 0.057, -0.4], r: qy },
        Gy,
      ),
      Wy(
        "threequarter",
        { p: [0.103, -0.101, -0.5], r: [0.05, 0.16, 0.05] },
        -0.47,
        { p: [0.09, -0.13, -0.42], r: [-0.45, 0.5, 0.1] },
        { p: [-0.006, -0.012, 0.025], r: [0.05, 0.03, 0.04] },
        { p: [0.07, 0.05, -0.44], r: qy },
        Gy,
      ),
      Wy(
        "compact",
        { p: [0.166, -0.123, -0.481], r: [0.04, 0.07, 0.02] },
        -0.47,
        { p: [0.14, -0.15, -0.42], r: [-0.6, 0.25, 0.05] },
        { p: [-0.004, -0.01, 0.02], r: [0.05, 0.02, 0.03] },
        { p: [0.08, 0.04, -0.42], r: qy },
        Gy,
      ),
    ],
    H1 = (n, e, t) => (n < e || n >= t ? 0 : Ot((n - e) / (t - e))),
    Yy = (n) => new or().setFromAxisAngle(new ii(1, 0, 0), n),
    LD = (n) => new or().setFromAxisAngle(new ii(0, 1, 0), n),
    PS = 0.026,
    ol = {
      grip: {
        web: [-0.0335, -0.012, -0.045],
        tilt: 0.3,
        roll: 0.3,
        drop: 0.008,
        lift: 0.0025,
        nudge: [-0.008, 0, -0.002],
        thumb: [0, 0],
        wrap: { back: [-0.006, 0.024], out: [0, 0.0015, 0.003], dip: [0.3, 0.6, 0.9], clear: 3e-4, skin: 0 },
      },
      support: {
        web: [-0.0335, -0.012, -0.029],
        tilt: 0.3,
        roll: 0.2,
        drop: 0.016,
        pad: [0.008, 0.017, 0.03],
        nudge: [0, -0.014, 0],
        thumb: [0, 0],
        sweep: [0.5, 0.15, 0.1, 1.5, 1.3, -0.25],
      },
      carryYaw: 0,
      slapShift: 0.028,
      shR: [0.2, -0.2, 0.32],
      shL: [-0.2, -0.2, 0.32],
      poleR: [0.8, -0.6, 0],
      poleL: [-0.8, -0.6, 0],
      sprintShR: [0.26, -0.1, 0.32],
      sprintPoleR: [1, -0.2, 0],
      ads: { shR: [0.22, -0.3, 0.15], shL: [-0.22, -0.3, 0.15], poleR: [0.87, -0.5, 0], poleL: [-0.87, -0.5, 0] },
    };
  export function FD(n) {
    let e = -G0.gripFront[0],
      t = -G0.gripBack[0],
      i = G0.gripFront[1],
      s = G0.rake,
      o = Math.tan(s),
      r = {},
      a = (() => {
        let L = gi(n.frame, [-0.03, i - 0.02, e], [0.03, i + 0.01, t]);
        return Math.min(-L.min[0], L.max[0]);
      })(),
      l = gi(n.frame, [-0.02, i + 0.015, t - 0.004], [0.02, i + 0.048, t + 0.003]).min[1],
      c = gi(n.frame, [-0.03, i - 0.14, e], [0.03, i, t + 0.03]).min[1],
      u = (l + c) / 2,
      f = (e + t) / 2 + (i - u) * o,
      h = (l - c) / 2 / Math.cos(s),
      p = ((t - e) / 2) * Math.cos(s);
    ((r.gripDim = { rake: s, hw: a, hl: h, hd: p, c: [0, u, f] }), (r.frontAt = (L) => e + (i - L) * o));
    let d = mn(r.gripDim.c, [a, h, p], Yy(-s), a * 0.62),
      m = gi(n.slide, [-1, -1, -1], [1, 1, 1]),
      x = gi(n.frame, [-1, i + 0.026, -1], [1, 0, t]),
      v = mn(
        [0, (x.min[1] + m.max[1] - 0.005) / 2, (m.min[2] + x.max[2]) / 2],
        [(m.max[0] - m.min[0]) / 2, (m.max[1] - 0.005 - x.min[1]) / 2, (x.max[2] - m.min[2]) / 2],
        null,
        0.003,
      ),
      y = gi(n.frame, [-0.009, i - 0.008, e - 0.064], [0.009, i - 0.003, e - 0.004]),
      b = mn(
        [0, (y.min[1] + y.max[1]) / 2, (y.min[2] + y.max[2]) / 2],
        [(y.max[0] - y.min[0]) / 2, (y.max[1] - y.min[1]) / 2, (y.max[2] - y.min[2]) / 2],
        null,
        0.0015,
      );
    r.tang = new ii(0, y.min[1] + PS, t + (i - y.min[1] - PS) * o);
    let g = mn(
        [0, (y.max[1] + x.min[1]) / 2, y.min[2] + 0.002],
        [(y.max[0] - y.min[0]) / 2, (x.min[1] - y.max[1]) / 2, 0.002],
        null,
        0.0015,
      ),
      E = Bu(n.steel, [-0.0034, i + 0.0015, -0.008], [0.0034, i + 0.026, 0.008], 0.005),
      M = E[Math.floor(E.length / 2)];
    ((r.triggerAt = [0, M.y, M.z0]), (r.trigger = [vs([-0.0033, M.y + 0.005, M.z0 + 0.003], [0.0033, M.y - 0.008, M.z0 + 0.001], 0.003)]));
    let _ = gi(n.stop, [-1, -1, -1], [1, 1, 1]),
      T = G0.stopPivot;
    r.lever = [
      mn([T[0] + (_.min[0] + _.max[0]) / 2, T[1], T[2] + _.max[2] - 0.008], [(_.max[0] - _.min[0]) / 2, 0.004, 0.008], null, 0.001),
    ];
    let w = gi(n.frame, [-1, i + 0.026, t - 0.012], [1, 0, 1]),
      S = mn(
        [0, (w.min[1] + w.max[1]) / 2, (w.min[2] + w.max[2]) / 2],
        [(w.max[0] - w.min[0]) / 2, (w.max[1] - w.min[1]) / 2, (w.max[2] - w.min[2]) / 2],
        null,
        0.004,
      );
    ((r.upperHw = (m.max[0] - m.min[0]) / 2), (r.grip = [d, v, b, g, S]));
    let R = gi(n.mag, [-1, -1, -1], [1, 1, 1]),
      z = gi(n.mag, [-1, R.min[1] + 0.012, -1], [1, -0.012, 1]),
      I = gi(n.mag, [-1, R.min[1], -1], [1, R.min[1] + 0.0085, 1]);
    ((r.mag = [
      mn(
        [0, (R.min[1] + 0.008) / 2, (z.min[2] + z.max[2]) / 2],
        [Math.max(-z.min[0], z.max[0]), -(R.min[1] + 0.008) / 2, (z.max[2] - z.min[2]) / 2],
        null,
        0.003,
      ),
      mn(
        [0, (I.min[1] + I.max[1]) / 2, (I.min[2] + I.max[2]) / 2],
        [I.max[0], (I.max[1] - I.min[1]) / 2, (I.max[2] - I.min[2]) / 2],
        null,
        0.0025,
      ),
    ]),
      (r.padBottom = new ii(0, R.min[1], (I.min[2] + I.max[2]) / 2)));
    {
      let L = r.mag[1];
      r.grip.push(mn(new ii().fromArray(L.c).applyQuaternion(Yy(-s)).add(new ii().fromArray(G0.magPos)).toArray(), L.h, Yy(-s), L.r));
    }
    return r;
  }
  export var $y = null,
    IS = "";
  export function ND(n) {
    let e = JSON.stringify(ol);
    if ($y && e === IS) return $y;
    let t = FD(n),
      i = ol,
      s = { shapes: t },
      o = new or(),
      r = t.gripDim;
    (($y = s), (IS = e));
    let a = {
        rake: r.rake,
        len: (t.tang.y - (r.c[1] - r.hl * Math.cos(r.rake))) / Math.cos(r.rake),
        width: 2 * r.hw,
        depth: 2 * r.hd,
        top: [0.012, 0.15, 0.004, 0.032],
        topW: 0.027,
        guard: [0.04, 0.096, -0.03],
        trigger: [0.082, -0.013],
      },
      l = il("right", tc({ ...i.grip, ...a, round: 0.011 }).frame, t.tang, o);
    (l.p.add(new ii(0, i.grip.lift, 0).applyQuaternion(l.q)), i.grip.nudge && l.p.add(new ii().fromArray(i.grip.nudge)));
    let c = t.lever[0],
      u = -t.upperHw - 5e-4;
    if (((s.grip = ca("grip", "right", l.p, l.q, t.grip, nn.pistol_grip.fit)), i.grip.wrap)) {
      let y = i.grip.wrap,
        b = (g, E, M, _, T, w) =>
          Uu(s.grip, "grip", g, [-(r.hw + M), T.y, w + E], s.grip.pose, {
            start: [1.35, 1.45, 0.4, s.grip.pose[g * 4 + 3]],
            at: 0.5,
            couple: _,
          });
      for (let g = 2; g < 5; g++) {
        let E = pS(s.grip, g),
          M = t.frontAt(E.y),
          _ = null,
          T = 1e9;
        for (let w = y.back[0]; w <= y.back[1] + 1e-9; w += 0.003)
          for (let S of y.out)
            for (let R of y.dip) {
              let z = b(g, w, S, R, E, M),
                I = wh(z.pose, g, s.grip.shapes),
                L = 5 * Math.max(0, Math.max(I[0], I[1]) + y.clear) + Math.abs(I[2] + y.skin) + 3 * z.miss - 0.02 * w;
              L < T && ((T = L), (_ = z));
            }
        s.grip = _;
      }
    }
    ((s.grip = R5(s.grip, "grip", 0, [u, c.c[1] - 0.006 + i.grip.thumb[0], c.c[2] + 0.022 + i.grip.thumb[1]], { root: 0.85 })),
      (s.trigger = Uu(s.grip, "trigger", 1, [t.triggerAt[0] + 0.002, t.triggerAt[1] + 0.007, t.triggerAt[2] - 0.0015], s.grip.pose, {
        start: [0.2, 1, 0.6, 0.1],
        at: 0.4,
        couple: 0.3,
      })));
    let f = il("left", tc({ ...i.support, ...a, round: 0.014 }).frame, t.tang, o);
    i.support.nudge && f.p.add(new ii().fromArray(i.support.nudge));
    let h = i.support.sweep,
      p = d0({ thumb: [0, -0.1, -0.1, 0.7], fingers: [h[0], h[1], h[2], 0], index: [h[0], h[1], h[2], h[5]] }),
      d = d0({ thumb: [0, -0.1, -0.1, 0.7], fingers: [1.6, h[1], h[2], 0], index: [1.6, h[1], h[2], h[5]] });
    s.support = ca("support", "left", f.p, f.q, t.grip.concat(mS(s.grip, s.grip.pose, [0, 1, 2, 3, 4])), {
      from: p,
      to: d,
      digits: [1, 2, 3, 4],
    });
    let m = Float32Array.from(s.support.pose);
    for (let y = 1; y < 5; y++) ((m[y * 4 + 1] = h[3]), (m[y * 4 + 2] = h[4]));
    ((s.support = dS(s.support, "support", { from: s.support.pose, to: m, digits: [1, 2, 3, 4] })),
      (s.support = R5(s.support, "support", 0, [u, c.c[1] - 0.002 + i.support.thumb[0], c.c[2] - 0.03 + i.support.thumb[1]])),
      (s.supportOpen = tn(new Float32Array(Un), p, s.support.pose, 0.2)),
      (s.stop = R5(s.grip, "stop", 0, [c.c[0] - c.h[0], c.c[1] + 0.002, c.c[2] + 0.002], { skin: -0.003, root: 0.85 })));
    let x = il("left", "mag_cup", t.padBottom, LD(i.carryYaw));
    s.carry = ca("carry", "left", x.p, x.q, t.mag, {
      from: nn.mag_cup.fit.from,
      to: d0({ thumb: [1.35, 0.7, 0.6, 0.3], fingers: [1.6, 1.1, 0.7, 0] }),
    });
    let v = x.p.clone().add(new ii(0, 0, -i.slapShift).applyQuaternion(x.q));
    return ((s.slap = { ...s.carry, name: "slap", p: v, pose: tn(new Float32Array(Un), s.carry.pose, di.relaxed, 0.55) }), s);
  }
  export function zS(n) {
    let { mats: e, mk: t, S: i, rng: s } = n,
      o = new At();
    o.name = "viewmodel-pac4";
    let r = CS();
    o.add(t(r.frame, e.poly), t(r.steel, e.steel), t(r.plain, e.plain));
    let a = new At();
    (a.position.fromArray(G0.barrelPivot),
      r.barrel.translate(-G0.barrelPivot[0], -G0.barrelPivot[1], -G0.barrelPivot[2]),
      a.add(t(r.barrel, e.steel)),
      o.add(a));
    let l = new At();
    (l.add(t(r.slide, e.slide), t(r.dots, e.dots)), o.add(l));
    let c = t(r.stop, e.steel);
    (c.position.fromArray(G0.stopPivot), o.add(c));
    let u = new At(),
      f = new ii().fromArray(G0.magPos),
      h = Au(-G0.rake, 0, 0),
      p = new ii().fromArray(G0.magAxis),
      d = t(r.round, e.brass);
    (u.add(t(r.mag, e.steel), d), o.add(u));
    let m = null,
      x = null;
    try {
      ((m = M1([
        ["p_model", -0.01295, 2e-4, 0.0465, 0.0072, "L"],
        ["p_name", -0.01295, 2e-4, 0.0215, 0.0044, "L"],
        ["p_maker", -0.01295, -0.0052, -0.013, 0.0019, "L"],
        ["p_cal", 0.01295, 2e-4, 0.047, 0.004, "R"],
      ])),
        (x = M1([
          ["p_prop", -0.01285, -0.0212, 0.059, 0.0022, "L"],
          ["p_sn", 0.01285, -0.0212, 0.062, 0.0026, "R"],
          ["p_rack", -0.01285, -0.03, -0.06, 0.0034, "L"],
        ])));
      for (let ge of [m, x]) ((ge.castShadow = !1), (ge.receiveShadow = !0), (ge.frustumCulled = !1));
      (l.add(m), o.add(x));
    } catch (ge) {
      console.warn("[weapon] pistol markings skipped: " + ge);
    }
    let v = l5();
    (v.position.fromArray(G0.muzzle), (v.visible = !1), o.add(v));
    let y = ND(r),
      b = n.arms || null,
      g = new or(),
      E = (ge, ce, P, D, B) => {
        (B.copy(P).multiply(ge.q), D.copy(ge.p).applyQuaternion(P).add(ce));
      },
      M = { p: y.support.p, q: y.support.q },
      _ = { p: new ii(0.1, -0.38, 0.12), q: Au(-0.3, 0, 0.45) },
      T = {
        p: p
          .clone()
          .multiplyScalar(Bh + 0.016)
          .add(new ii(-0.004, 0, 0.005)),
        q: Au(-0.1, 0, 0.08),
      },
      w = { p: p.clone().multiplyScalar(Bh), q: new or() },
      S = [
        [It.rise, _],
        [It.align, T],
        [It.insert, w],
        [9, w],
      ],
      R = new or(),
      z = { p: new ii(), q: new or() };
    E(y.carry, f.clone().add(_.p), R.copy(_.q).multiply(h), z.p, z.q);
    let I = { p: new ii(), q: new or() };
    E(y.slap, f.clone().addScaledVector(p, It.reboundBy), h, I.p, I.q);
    let L = [
        [0, M],
        [0.05, M],
        [0.42, z],
        [9, z],
      ],
      U = I.p
        .clone()
        .lerp(M.p, 0.5)
        .add(new ii(0.035, -0.07, 0.045)),
      k = tn(new Float32Array(Un), di.relaxed, di.open, 0.25),
      C = y.supportOpen,
      A = new ii(),
      F = new or(),
      H = new ii(),
      N = new or(),
      Z = new ii(),
      Q = new ii(),
      W = new ii(),
      J = new or(),
      G = { p: new ii().copy(M.p), q: new or().copy(M.q), pose: new Float32Array(Un), busy: !1 },
      te = (ge, ce, P, D, B) => (B < 0.5 ? tn(ge, ce, P, Ot(B * 2)) : tn(ge, P, D, Ot(B * 2 - 1))),
      oe = 0.1366,
      ee = 1.53,
      le = 9,
      xe = !1,
      j = 0,
      O = 1,
      q = 0,
      ue = 0;
    function de() {
      ((G.busy = !1),
        G.p.copy(M.p),
        G.q.copy(M.q),
        G.pose.set(y.support.pose),
        (ue = 0),
        (u.visible = !0),
        u.position.copy(f),
        u.quaternion.copy(h));
    }
    de();
    let $ = (ge) => {
        l.position.z = ge;
        let ce = Math.min(1, ge / 0.006);
        ((a.rotation.x = 0.02 * ce), (a.position.z = G0.barrelPivot[2] + 0.0025 * ce));
      },
      se = Object.values(r).reduce((ge, ce) => ge + Tu(ce), 0) + (m ? Tu(m.geometry) + Tu(x.geometry) : 0) + 2,
      fe = 0;
    o.traverse((ge) => {
      ge.isMesh && fe++;
    });
    let me = {
      id: "pistol",
      name: G0.name,
      root: o,
      flash: v,
      muzzle: G0.muzzle,
      eject: G0.eject,
      sight: [0, G0.sightY, -G0.rearF],
      info: { tris: Math.round(se), meshes: fe },
      slot: { id: "pistol", name: G0.name, ammo: 15, magSize: 15, reserve: 1 / 0 },
      def: {
        magSize: 15,
        reserve: 1 / 0,
        rpm: 420,
        damage: 34,
        range: 120,
        auto: !1,
        adsTime: 0.14,
        inspect: !1,
        flashLight: 30,
        flashScale: 0.55,
        smoke: !1,
        spread: {
          hip: 0.0105,
          ads: 0.0017,
          moveHip: 0.0065,
          moveAds: 0.003,
          bloomHip: 0.0085,
          bloomAds: 0.003,
          air: 0.018,
          crouch: 0.002,
          shot: 0.3,
          decay: 2.8,
        },
      },
      views: Xy,
      view: 0,
      get pose() {
        return Xy[me.view];
      },
      setView(ge) {
        me.view = Math.max(0, Math.min(Xy.length - 1, ge | 0));
      },
      motion: bh.pistol,
      reloadTime: (ge) => (ge ? It.empty : It.tac),
      reset() {
        ((le = 9), (xe = !1), (j = 0), (d.visible = !0), de(), $(0), (c.rotation.x = 0), (O = 1), (q = 0));
      },
      cancelReload(ge) {
        (de(), ge && (xe = !1), (d.visible = me.slot.ammo > 0));
      },
      shot(ge) {
        ((le = 0), b && (b.right.impulse(0.8), b.left.impulse(0.6)), ge && ((xe = !0), (d.visible = !1)));
      },
      recoil(ge, ce, P) {
        (P.addRecoil && P.addRecoil(0.0092 * ce * (0.9 + s() * 0.2), (s() - 0.5) * 0.005 * ce), P.addShake && P.addShake(0.14 * ce));
        let D = bh.pistol.recoil,
          B = i.adsE,
          X = (0.9 + s() * 0.2) * (P.crouching ? 0.9 : 1),
          re = X * u0(1, D.adsRot, B),
          Y = X * u0(1, D.adsPos, B);
        ((i.kZ.v += D.back * X * u0(1, D.adsBack, B)),
          (i.kP.v += D.rise * re),
          (i.kY.v += (s() - 0.5) * D.yaw * re),
          (i.kR.v += (s() - 0.5) * D.roll * re),
          (i.kU.v += D.up * Y),
          (i.kX.v += (s() - 0.5) * 2 * D.side * Y));
      },
      reload(ge, ce) {
        let P = n.ev,
          D = ge.empty;
        (P(ge, "magout", It.magout) && (i.bump.v += 0.1),
          ce >= It.swap && !ge.f.fresh && ((ge.f.fresh = 1), (d.visible = !0)),
          P(ge, "maginsert", It.insert) && ((i.bump.v += 0.1), (i.kR.v += 0.5)),
          P(ge, "magin", It.magin) && ((i.bump.v += 0.85), (i.kP.v += 0.85), b && b.left.impulse(1)),
          D && P(ge, "slide", It.slide) && ((xe = !1), (i.kZ.v -= 0.9), (i.kP.v -= 2.6), (i.bump.v -= 0.12)),
          (i.antRT = 0.035 * H1(ce, 0.03, It.magout) - 0.03 * H1(ce, It.thumb - 0.08, It.slideRelease) * (D ? 1 : 0)),
          (i.antYT =
            -0.002 * H1(ce, It.insert - 0.1, It.insert) -
            0.0065 * H1(ce, It.fingers, It.magin) +
            0.003 * H1(ce, It.thumb - 0.08, It.slideRelease) * (D ? 1 : 0)));
        let B = 0,
          X = 0;
        if (ce < It.swap)
          if (ce < It.magout) (u.position.copy(f), u.quaternion.copy(h));
          else {
            let Y = ce - It.magout;
            if (Y < oe) (u.position.copy(f).addScaledVector(p, 4.5 * Y * Y + 0.3 * Y), u.quaternion.copy(h));
            else {
              let he = Y - oe;
              (Q.set(0, -1, 0).applyQuaternion(N.copy(o.quaternion).invert()),
                u.position
                  .copy(f)
                  .addScaledVector(p, 0.125 + ee * he)
                  .addScaledVector(Q, 4.9 * he * he),
                N.setFromAxisAngle(Z.set(1, 0, 0), -2.6 * he),
                u.quaternion.copy(h).multiply(N));
            }
          }
        else {
          let Y = 0;
          if (ce < It.insert) Ru(S, Math.max(ce, It.rise), H, N);
          else {
            if ((N.identity(), ce < It.fingers)) Y = Bh - k5 * yh(dn(ce, It.insert, It.fingers));
            else if (ce < It.windup) ((Y = Bh - k5), (X = Ot(dn(ce, It.fingers, It.windup))), (B = It.backOff * X));
            else if (ce < It.magin) {
              let he = dn(ce, It.windup, It.magin),
                V = (Bh - k5 + It.backOff) * (1 - he * he);
              ((Y = Math.min(Bh - k5, V)), (B = V - Y), (X = 1));
            } else ((X = 1), (B = It.reboundBy * yh(dn(ce, It.magin, It.rebound))));
            H.copy(p).multiplyScalar(Y);
          }
          (u.position.copy(f).add(H), u.quaternion.copy(N).multiply(h));
        }
        let re = G.pose;
        if (((G.busy = !0), ce < It.swap)) (Ru(L, ce, A, F), te(re, y.support.pose, k, y.carry.pose, dn(ce, 0.03, It.swap - 0.02)));
        else if (ce < It.rebound)
          (E(y.carry, u.position, u.quaternion, A, F),
            E(y.slap, u.position, u.quaternion, W, J),
            A.lerp(W, X).addScaledVector(p, B),
            F.slerp(J, X),
            tn(re, y.carry.pose, y.slap.pose, X));
        else {
          let Y = dn(ce, It.rebound, It.regrip),
            he = Ot(Y),
            V = 1 - he;
          (A.copy(I.p)
            .multiplyScalar(V * V)
            .addScaledVector(U, 2 * V * he)
            .addScaledVector(M.p, he * he),
            F.copy(I.q).slerp(M.q, Ot(dn(ce, It.rebound + 0.02, It.regrip - 0.02))),
            Y < 0.55 ? tn(re, y.slap.pose, C, Ot(Y / 0.55)) : tn(re, C, y.support.pose, Ot((Y - 0.55) / 0.45)));
        }
        (G.p.copy(A),
          G.q.copy(F),
          D
            ? ((j = ce < It.thumb ? 1 : 1 - Ot(dn(ce, It.thumb, It.slideRelease))),
              $(
                ce < It.slideRelease ? G0.slideLock : G0.slideLock * Math.max(0, 1 - (ce - It.slideRelease) / (It.slide - It.slideRelease)),
              ),
              (ue = Ot(dn(ce, It.thumb - 0.16, It.thumb - 0.01)) * (1 - Ot(dn(ce, It.slide + 0.02, It.slide + 0.16)))))
            : (ue = 0),
          (i.reloadW = Math.min(Ot(ce / 0.22), 1 - Ot((ce - (It.magin + 0.03)) / 0.32))),
          (i.rackW = D ? Ot((ce - (It.magin + 0.05)) / 0.28) * (1 - Ot((ce - (It.slide + 0.04)) / 0.24)) : 0));
      },
      endReload() {
        de();
      },
      parts(ge, ce, P) {
        le += ge;
        let D = 0.066;
        if (!(P && xe)) {
          let B = le < D ? (le < 0.024 ? le / 0.024 : 1 - (le - 0.024) / (D - 0.024)) : 0;
          (xe && le > 0.024 && (B = Math.max(B, G0.slideLock / G0.slideTravel)), $(G0.slideTravel * B), (j = xe && le > 0.03 ? 1 : 0));
        }
        ((c.rotation.x = -0.06 * j), (q = ce));
      },
      armTargets(ge, ce) {
        let P = i.spV.x > 0.3 || i.reload || i.hol > 0.12 ? 0 : 1;
        ((O += (P - O) * (1 - Math.exp(-16 * ce))),
          ge.r.p.copy(y.grip.p),
          ge.r.q.copy(y.grip.q),
          tn(ge.r.pose, y.grip.pose, y.trigger.pose, Ot(O)),
          (ge.r.trig = q * O));
        let D = Math.min(1, Math.max(0, i.spV.x)),
          B = Ot(Math.min(1, Math.max(0, i.adsV.x))),
          X = ol.ads;
        if (
          (ge.r.pole.fromArray(ol.poleR).lerp(Z.fromArray(ol.sprintPoleR), D).lerp(Z.fromArray(X.poleR), B),
          ge.r.sh.fromArray(ol.shR).lerp(Z.fromArray(ol.sprintShR), D).lerp(Z.fromArray(X.shR), B),
          ge.l.p.copy(G.p),
          ge.l.q.copy(G.q),
          ge.l.pose.set(G.busy ? G.pose : y.support.pose),
          (ge.l.trig = 0),
          ge.l.pole.fromArray(ol.poleL).lerp(Z.fromArray(X.poleL), B),
          ge.l.sh.fromArray(ol.shL).lerp(Z.fromArray(X.shL), B),
          ue > 0)
        )
          for (let re = 0; re < 4; re++) ge.r.pose[re] += (y.stop.pose[re] - ge.r.pose[re]) * ue;
      },
      snapArms() {
        O = i.spV.x > 0.3 || i.reload || i.hol > 0.12 ? 0 : 1;
      },
      setLocked(ge) {
        ((xe = !!ge), (d.visible = !ge), ge && (le = 9));
      },
      get locked() {
        return xe;
      },
      holds: y,
    };
    return me;
  }
  export var Js = K,
    UD = ["kZ", "kP", "kY", "kR", "kX", "kU"],
    DS = [
      "kZ",
      "kP",
      "kY",
      "kR",
      "kX",
      "kU",
      "swY",
      "swP",
      "jY",
      "jP",
      "jR",
      "inZ",
      "inX",
      "inP",
      "inR",
      "bump",
      "antY",
      "antR",
      "amt",
      "wall",
    ],
    Hh = { p: [0.085, -0.34, 0.07], r: [-0.5, 0.22, -0.42] },
    LS = 1.25,
    O1 = Math.PI * 2,
    P5 = 0.965,
    FS = (n) => -(0.9 * Math.sin(n) + 0.318 * Math.sin(2 * n) + 0.1 * Math.sin(3 * n)) * 0.9416,
    NS = { walk: 1.55, sprint: 2.1, crouch: 1.05 };
  export async function I5(n) {
    let e = { brass: 4, glove_fabric: 3 },
      t = (B) => n.mats.get(B, { triplanar: !0, vertexColors: !0, scale: e[B] || 1 }),
      i = (B, X) => {
        let re = new ht(B, X);
        return ((re.castShadow = !1), (re.receiveShadow = !0), (re.frustumCulled = !1), re);
      },
      s = (B, X, re, Y, he) => {
        let V = new L0({ color: new Qe(X[0], X[1], X[2]), roughness: re, metalness: Y, vertexColors: !0 });
        return ((V.name = B), he >= 0 && _E(V, he), V);
      },
      o = {
        ano: s("pac9_anodised", [0.0085, 0.009, 0.0105], 0.4, 0.45, 0),
        plain: s("pac9_matte", [1, 1, 1], 0.92, 0, 4),
        steel: s("pac9_phosphate", [0.016, 0.016, 0.0165], 0.5, 0.7, 1),
        poly: s("pac9_polymer", [0.0125, 0.0128, 0.0135], 0.62, 0, 2),
        tan: s("pac9_polymer_tan", [0.105, 0.08, 0.05], 0.62, 0, 2),
        slide: s("pac4_nitride", [0.008, 0.0083, 0.0092], 0.36, 0.55, 0),
        dots: new L0({
          color: new Qe(0.3, 0.42, 0.3),
          emissive: new Qe(0.16, 0.5, 0.2),
          emissiveIntensity: 0.55,
          roughness: 0.35,
          metalness: 0,
        }),
        fab: t("glove_fabric"),
        brass: t("brass"),
      };
    o.dots.name = "pac4_tritium";
    let r = n.rng && n.rng.fork ? n.rng.fork() : Math.random,
      a = {
        t: 0,
        cooldown: 0,
        prevFire: !1,
        dryDone: !1,
        fireQ: 0,
        autoReload: -1,
        reload: null,
        burst: 0,
        lastShot: -9,
        bloom: 0,
        heat: 0,
        smoke: 0,
        smokeTick: 0,
        adsLin: 0,
        adsE: 0,
        sprintT: 0,
        reloadW: 0,
        rackW: 0,
        finger: 0,
        flashT: 0,
        flashDur: 0.05,
        recPhase: 0,
        wasGround: !0,
        lastVy: 0,
        spreadS: 0.0125,
        idleT: 0,
        inspect: -1,
        hol: 0,
        adsWant: !1,
        spWant: !1,
        urgent: !1,
        antYT: 0,
        antRT: 0,
        gait: 0,
        gOffT: 0,
        gOff: pn(9, 1),
        stride: { x: 1.55, v: 0, w: 14, z: 1 },
        spd: 0,
        stepEv: 0,
        jumpEv: 0,
        landEv: -1,
        landSide: 1,
        lpR: 0,
        lpF: 0,
        breath: 0,
        exert: 0,
        wallT: 0,
        wallK: 0,
        adsV: pn(23, 0.75),
        adsS: pn(9, 1),
        spV: pn(17, 1),
        rwS: pn(45, 1),
        rkS: pn(45, 1),
        wall: pn(10, 1),
        amt: pn(13, 1),
        kZ: pn(44, 0.55),
        kP: pn(36, 0.5),
        kY: pn(30, 0.45),
        kR: pn(31, 0.42),
        kX: pn(40, 0.5),
        kU: pn(40, 0.5),
        swY: pn(13.5, 0.64),
        swP: pn(13.5, 0.64),
        jY: pn(20.5, 0.56),
        jP: pn(20.5, 0.56),
        jR: pn(20.5, 0.56),
        inZ: pn(15, 0.48),
        inX: pn(15, 0.48),
        inP: pn(15, 0.48),
        inR: pn(15, 0.48),
        stance: pn(13, 1),
        stance2: pn(5.5, 1),
        bump: pn(24.5, 0.61),
        antY: pn(50, 0.8),
        antR: pn(50, 0.8),
      };
    n.events &&
      n.events.on &&
      (n.events.on("player:step", () => {
        a.stepEv = 1;
      }),
      n.events.on("player:jump", () => {
        a.jumpEv = 1;
      }),
      n.events.on("player:land", (B) => {
        a.landEv = B && B.speed > 0 ? B.speed : 0;
      }));
    let l = { freeze: !1, pause: !1, reloadT: null, empty: !1, flash: !1, noFire: !1, ads: !1, sprint: !1, noIdle: !1 };
    l.S = a;
    let c = { t: 0, T: 0, empty: !1, rig: null, seated: !1, fresh: !1, f: null },
      u = { active: !1, phase: "", t: 0, fresh: !1, from: null, to: null };
    function f(B, X, re, Y) {
      if (B.t < re || B.f[X]) return !1;
      ((B.f[X] = 1), X === "magin" && h(B));
      let he = { phase: X, empty: B.empty, weapon: B.rig.id };
      return (Y && Object.assign(he, Y), n.events.emit("weapon:reload", he), !0);
    }
    function h(B) {
      let X = B.rig.slot,
        re = Math.min(X.magSize - X.ammo, X.reserve);
      ((X.ammo += re), (X.reserve -= re), (B.seated = !0));
    }
    let p = vS(n, Ro),
      d = { G: n, S: a, mats: o, mk: i, rng: r, ev: f, arms: p },
      m = wS(d),
      x = zS(d),
      v = { rifle: m, pistol: x },
      y = [m, x];
    for (let B of y) attachModel(B, B.id, Ro);
    for (let B of y)
      (B.root.traverse((X) => {
        X.layers.set(Ro);
      }),
        (B.root.visible = !1),
        n.camera.add(B.root),
        console.log(`[weapon] ${B.name}: ${B.info.tris} tris, ${B.info.meshes} meshes (flash only while firing, hidden while holstered)`));
    console.log(`[weapon] arms: 2 x ${p.right.triCount} tris, 2 draw calls, shared by both weapons`);
    let b = m,
      g = !0,
      E = {
        state: "idle",
        ads: 0,
        spread: 0.0125,
        debug: l,
        slots: [m.slot, x.slot],
        rigs: v,
        pending: null,
        arms: p,
        info: { tris: m.info.tris, meshes: m.info.meshes, pistol: x.info },
        update: O,
        reset: T,
        switchTo: U,
        swap() {
          return U((u.active ? u.to : b) === m ? "pistol" : "rifle");
        },
        equip(B) {
          v[B] && (I(), (u.active = !1), (E.pending = null), (a.hol = 0), _(v[B]), p.snap());
        },
        setVisible(B) {
          ((g = !!B), (b.root.visible = g), p.setVisible(g));
        },
        muzzleWorld: S,
        reloadNow: z,
        addAmmo(B) {
          b.slot.reserve += B;
        },
        setWetness(B) {
          iy.value = kh.value = Math.max(0, Math.min(1, +B || 0));
        },
        snap() {
          let B = n.player,
            X = (!!B.sprinting || l.sprint) && !n.input.fire && !n.input.ads && !a.reload;
          ((a.adsLin = (n.input.ads || l.ads) && !u.active ? 1 : 0),
            (a.adsE = Ot(a.adsLin)),
            (E.ads = a.adsE),
            (a.adsWant = a.adsLin > 0),
            (a.sprintT = X ? 1 : 0),
            (a.spWant = X));
          for (let re of DS) Xn(a[re]);
          (Xn(a.adsV, a.adsLin),
            Xn(a.adsS, a.adsLin),
            Xn(a.spV, a.sprintT),
            Xn(a.rwS, a.reloadW),
            Xn(a.rkS, a.rackW),
            (a.lpR = 0),
            (a.lpF = 0),
            (a.gait += a.gOff.x),
            Xn(a.gOff),
            (a.gOffT = 0),
            (a.stepEv = 0),
            (a.jumpEv = 0),
            (a.landEv = -1),
            (a.wasGround = B.onGround !== !1),
            Xn(a.stance, B.crouching ? 1 : 0),
            Xn(a.stance2, B.crouching ? 1 : 0),
            (a.wallK = 0),
            (a.antYT = 0),
            (a.antRT = 0));
          for (let re of y) re.snapArms && re.snapArms();
          p.snap();
        },
        view: 1,
        setView: M,
      };
    function M(B) {
      ((B = Math.max(1, Math.min(3, Math.round(+B) || 1))), (E.view = B));
      for (let X of y) X.setView && X.setView(B - 1);
      return B;
    }
    Object.defineProperties(E, {
      name: { enumerable: !0, get: () => b.slot.name },
      ammo: {
        enumerable: !0,
        get: () => b.slot.ammo,
        set: (B) => {
          b.slot.ammo = B;
        },
      },
      magSize: { enumerable: !0, get: () => b.slot.magSize },
      reserve: {
        enumerable: !0,
        get: () => b.slot.reserve,
        set: (B) => {
          b.slot.reserve = B;
        },
      },
      damage: { enumerable: !0, get: () => b.def.damage },
      rpm: { enumerable: !0, get: () => b.def.rpm },
      current: { enumerable: !0, get: () => b.id },
      root: { enumerable: !0, get: () => b.root },
    });
    function _(B) {
      (b.flash && (b.flash.visible = !1), (b.root.visible = !1), (b = B), (b.root.visible = g));
      let X = B.motion;
      for (let re of UD) ((a[re].w = X.recoil.spr[re][0]), (a[re].z = X.recoil.spr[re][1]), Xn(a[re]));
      for (let re of ["swY", "swP"]) ((a[re].w = X.sway.spr[0]), (a[re].z = X.sway.spr[1]));
      for (let re of ["jY", "jP", "jR"]) ((a[re].w = X.air.spr[0]), (a[re].z = X.air.spr[1]));
      for (let re of ["inZ", "inX", "inP", "inR"]) ((a[re].w = X.inertia.spr[0]), (a[re].z = X.inertia.spr[1]));
      (Xn(a.adsV),
        Xn(a.adsS),
        Xn(a.rwS),
        Xn(a.rkS),
        Xn(a.antY),
        Xn(a.antR),
        (a.antYT = 0),
        (a.antRT = 0),
        (a.adsWant = !1),
        (a.reloadW = 0),
        (a.rackW = 0),
        (a.cooldown = 0),
        (a.fireQ = 0),
        (a.dryDone = !1),
        (a.burst = 0),
        (a.bloom = 0),
        (a.heat = 0),
        (a.smoke = 0),
        (a.flashT = 0),
        (a.finger = 0),
        (a.adsLin = 0),
        (a.adsE = 0),
        (a.inspect = -1),
        (a.idleT = 0),
        (a.autoReload = -1));
    }
    function T() {
      (j(), p.snap());
      for (let B of y) ((B.slot.ammo = B.def.magSize), (B.slot.reserve = B.def.reserve), B.reset(), B.flash && (B.flash.visible = !1));
      ((a.reload = null),
        (u.active = !1),
        (E.pending = null),
        (E.state = "idle"),
        (E.ads = 0),
        Object.assign(a, {
          prevFire: !1,
          lastShot: -9,
          sprintT: 0,
          reloadW: 0,
          rackW: 0,
          hol: 0,
          gait: 0,
          gOffT: 0,
          spd: 0,
          stepEv: 0,
          jumpEv: 0,
          landEv: -1,
          lpR: 0,
          lpF: 0,
          exert: 0,
          wallK: 0,
          wasGround: !0,
        }));
      for (let B of DS) Xn(a[B]);
      (Xn(a.spV), Xn(a.stance), Xn(a.stance2), Xn(a.gOff), Xn(a.stride, NS.walk), _(m));
    }
    function w(B, X) {
      let re = b.root;
      (re.updateMatrix(), X.fromArray(B).applyMatrix4(re.matrix));
      let Y = n.camera,
        he = Math.tan((Y.fov * Math.PI) / 360) / Math.tan((n.viewCamera.fov * Math.PI) / 360);
      return ((X.x *= he), (X.y *= he), X.applyQuaternion(Y.quaternion).add(Y.position));
    }
    function S(B = new Js()) {
      return w(b.muzzle, B);
    }
    function R(B) {
      ((c.t = 0),
        (c.fresh = !0),
        (c.T = b.reloadTime(B)),
        (c.empty = B),
        (c.rig = b),
        (c.seated = !1),
        (c.f = {}),
        (a.reload = c),
        (a.autoReload = -1));
    }
    function z() {
      let B = b.slot;
      return a.reload || u.active || B.ammo >= B.magSize || B.reserve <= 0
        ? !1
        : (R(B.ammo <= 0), n.events.emit("weapon:reload", { phase: "start", empty: c.empty, weapon: b.id }), !0);
    }
    function I() {
      if (!a.reload) return;
      let B = a.reload;
      ((a.reload = null), p.blend(0.22), B.rig.cancelReload(B.seated));
    }
    function L(B, X, re) {
      (I(),
        (a.autoReload = -1),
        (a.inspect = -1),
        (a.fireQ = 0),
        (u.active = !0),
        (u.phase = "holster"),
        (u.t = re),
        (u.fresh = !0),
        (u.from = B),
        (u.to = X),
        (E.pending = X.id),
        n.events.emit("weapon:switch", { from: B.id, to: X.id, phase: "holster" }));
    }
    function U(B) {
      let X = v[B];
      return X
        ? u.active
          ? u.phase === "holster"
            ? u.to === X
              ? !1
              : ((u.to = X), (E.pending = X.id), !0)
            : X === b
              ? !1
              : (L(b, X, oa.holster * (1 - Is(u.t / oa.draw))), !0)
          : X === b
            ? !1
            : (L(b, X, 0), !0)
        : !1;
    }
    function k(B) {
      if ((u.fresh ? (u.fresh = !1) : (u.t += B), u.phase === "holster"))
        if (u.t >= oa.holster) {
          let X = u.from;
          (p.blend(0.13),
            _(u.to),
            (u.phase = "draw"),
            (u.t = Math.min(u.t - oa.holster, oa.draw * 0.5)),
            n.events.emit("weapon:switch", { from: X.id, to: b.id, phase: "draw" }),
            (a.hol = 1 - oy(u.t / oa.draw, LS)));
        } else a.hol = CE(u.t / oa.holster);
      else u.t >= oa.draw ? ((u.active = !1), (E.pending = null), (a.hol = 0)) : (a.hol = 1 - oy(u.t / oa.draw, LS));
    }
    let C = new Js(),
      A = new Js(),
      F = new Js(),
      H = new Js(),
      N = new Js(),
      Z = new Js();
    function Q() {
      let B = n.player,
        X = n.camera,
        re = b,
        Y = re.def;
      (re.slot.ammo--, a.burst++, (a.lastShot = a.t), (a.heat = Math.min(1.3, a.heat + 0.05)));
      let he = E.spread,
        V = r() * Math.PI * 2,
        ne = Math.tan(he) * Math.sqrt(r());
      (C.set(Math.cos(V) * ne, Math.sin(V) * ne, -1)
        .normalize()
        .applyQuaternion(X.quaternion),
        Z.copy(B.eye || X.position));
      let ye = null;
      try {
        ye = n.combat.playerShot(Z, C, { damage: Y.damage, range: Y.range });
      } catch {}
      (ye && ye.point ? F.copy(ye.point) : F.copy(Z).addScaledVector(C, Y.range), S(A));
      let Te = n.fx;
      (Te &&
        (Te.tracer && Te.tracer(A, F),
        Te.shell &&
          (w(re.eject, H),
          N.set(2 + r() * 1.2, 1.2 + r() * 0.8, 0.5 - r() * 0.6).applyQuaternion(X.quaternion),
          B.vel && N.add(B.vel),
          Te.shell(H, N))),
        n.render && n.render.lightPool && n.render.lightPool.flash(A, 16756832, Y.flashLight, 9, 0.05),
        n.events.emit("weapon:fire", { origin: Z, dir: C, muzzle: A, ads: a.adsE, weapon: re.id }),
        re.recoil(a.burst, u0(1, 0.55, a.adsE) * (B.crouching ? 0.85 : 1), B),
        (a.bloom = Math.min(1, a.bloom + Y.spread.shot)),
        (a.flashT = a.flashDur = 0.036 + r() * 0.02));
      let Re = re.flash,
        Ue = Re.material.uniforms;
      ((Ue.uSeed.value = r() * 100), (Ue.uJet.value = (0.6 + r() * 0.6) * (Y.auto ? 1 : 0.25)), (Re.rotation.z = (r() - 0.5) * 0.4));
      let Ve = (0.8 + r() * 0.5) * u0(1, 0.62, a.adsE) * Y.flashScale;
      (Re.scale.set(Ve, Ve, Ve * (0.8 + r() * 0.5)), re.shot(re.slot.ammo <= 0));
    }
    let W = { active: !1, rig: null, t: 0, vel: new Js(), w: new Js(), rest: !1, sunk: !1, bounces: 0, qRest: new St(), heard: 0 },
      J = new St(),
      G = new Js(),
      te = new _0();
    function oe() {
      if (W.active || !g || !b.root.visible) return;
      let B = b,
        X = B.root,
        re = n.camera,
        Y = n.player;
      (I(),
        (u.active = !1),
        (E.pending = null),
        B.flash && (B.flash.visible = !1),
        re.updateMatrixWorld(!0),
        X.updateMatrixWorld(!0),
        p.startDrop(r));
      let he = Math.tan((re.fov * Math.PI) / 360) / Math.tan((n.viewCamera.fov * Math.PI) / 360);
      (G.copy(X.position),
        (G.z /= he),
        G.applyQuaternion(re.quaternion).add(re.position),
        J.copy(re.quaternion).multiply(X.quaternion),
        n.scene.add(X),
        X.position.copy(G),
        X.quaternion.copy(J),
        X.traverse((V) => {
          (V.layers.set(Ia), V.isMesh && (V.castShadow = V !== B.flash));
        }),
        W.vel.set(0.35 + r() * 0.3, 0.5, -0.5 - r() * 0.4).applyQuaternion(re.quaternion),
        Y && Y.vel && W.vel.addScaledVector(Y.vel, 0.6),
        W.w.set(2.2 + r() * 1.5, (r() - 0.5) * 3, -(3 + r() * 2)),
        Object.assign(W, { active: !0, rig: B, t: 0, rest: !1, sunk: !1, bounces: 0, heard: 0 }),
        (E.state = "dropped"),
        n.events.emit("weapon:dropped", { weapon: B.id, pos: X.position }));
    }
    function ee(B, X) {
      if (!n.audio || !n.audio.play || W.heard > 3) return;
      W.heard++;
      let re = Math.min(1.4, 0.35 + X * 0.28);
      try {
        (n.audio.play("shell_bounce_metal", { pos: B.position, gain: re * 1.3, pitch: 0.42 + r() * 0.08 }),
          n.audio.play("reload_magout", { pos: B.position, gain: re, pitch: 0.7 + r() * 0.1 }));
      } catch {}
    }
    function le(B) {
      if (!W.active) return;
      ((W.t += B), p.dropUpdate(B));
      let X = W.rig.root;
      if (W.rest || W.sunk) return;
      let re = Math.max(1, Math.ceil(B / 0.012)),
        Y = B / re;
      for (let he = 0; he < re; he++) {
        W.vel.y -= 13.5 * Y;
        let V = Math.hypot(W.vel.x, W.vel.z);
        if (V > 0.05) {
          G.set(W.vel.x / V, 0, W.vel.z / V);
          let Te = null;
          try {
            Te = n.physics.raycast(X.position, G, V * Y + 0.12);
          } catch {
            Te = null;
          }
          Te && ((W.vel.x *= -0.2), (W.vel.z *= -0.2));
        }
        (X.position.addScaledVector(W.vel, Y), te.set(W.w.x * Y, W.w.y * Y, W.w.z * Y), J.setFromEuler(te), X.quaternion.multiply(J));
        let ne = 0;
        try {
          ne = n.physics.groundHeight(X.position.x, X.position.z, X.position.y + 0.4);
        } catch {
          ne = 0;
        }
        if (!(ne > -1.5)) {
          if (X.position.y < -1.7) {
            ((W.sunk = !0), (X.visible = !1));
            try {
              n.fx.splash && n.fx.splash(X.position, 0.8);
            } catch {}
          }
          continue;
        }
        let ye = 0.045;
        if (X.position.y < ne + ye && W.vel.y < 0) {
          X.position.y = ne + ye;
          let Te = -W.vel.y;
          if ((ee(X, Te), W.bounces++, Te < 1.1 || W.bounces >= 3)) {
            G.set(0, 0, -1).applyQuaternion(X.quaternion);
            let Re = Math.atan2(-G.x, -G.z),
              Ue = new Js(1, 0, 0).applyQuaternion(X.quaternion).y > 0 ? 1 : -1;
            (W.qRest.setFromEuler(te.set(0, Re, Ue * (Math.PI / 2 - 0.06), "YXZ")), (W.rest = !0), (W.restT = 0), W.vel.set(0, 0, 0));
            break;
          }
          ((W.vel.y = Te * 0.3), (W.vel.x *= 0.55), (W.vel.z *= 0.55), W.w.multiplyScalar(0.55), (W.w.x += (r() - 0.5) * 3));
        }
      }
    }
    function xe(B) {
      if (!W.active || !W.rest || W.sunk || ((W.restT += B), W.restT > 0.5)) return;
      let X = W.rig.root;
      X.quaternion.slerp(W.qRest, 1 - Math.exp(-16 * B));
      let re = 0;
      try {
        re = n.physics.groundHeight(X.position.x, X.position.z, X.position.y + 0.4);
      } catch {
        re = 0;
      }
      X.position.y = j0(X.position.y, re + 0.024, 18, B);
    }
    function j() {
      if (!W.active) return;
      let B = W.rig,
        X = B.root;
      (n.camera.add(X),
        X.scale.set(1, 1, 1),
        p.restore(),
        X.traverse((re) => {
          (re.layers.set(Ro), re.isMesh && (re.castShadow = !1));
        }),
        (X.visible = !1),
        (W.active = !1),
        (W.rig = null));
    }
    function O(B) {
      let X = n.player,
        re = n.input;
      if ((X && re && !X.alive && !l.pause && (W.active || oe(), le(B), xe(B)), !X || !re || !X.alive)) {
        ((a.prevFire = !1), b.flash && (b.flash.visible = !1));
        return;
      }
      if (l.pause) return;
      ((a.t += B),
        re.pressed && (re.pressed("swap") ? E.swap() : re.pressed("weapon1") ? U("rifle") : re.pressed("weapon2") && U("pistol")),
        u.active && k(B));
      let Y = b,
        he = Y.def,
        V = Y.slot,
        ne = u.active,
        ye = !!re.fire && g && !l.noFire,
        Te = ye && !a.prevFire;
      ((a.prevFire = ye), ye || (a.dryDone = !1));
      let Re = (!!X.sprinting || l.sprint) && !ye && !re.ads && !a.reload;
      if (
        ((a.sprintT = j0(a.sprintT, Re ? 1 : 0, 9, B)),
        (a.spWant = Re),
        (a.urgent = !Re && (ye || !!re.ads || !!a.reload)),
        re.pressed && re.pressed("reload") && z(),
        a.autoReload >= 0 && ((a.autoReload -= B), a.autoReload < 0 && z()),
        l.reloadT != null && !a.reload && R(l.empty),
        a.reload)
      ) {
        let $e = a.reload;
        (l.reloadT != null ? ($e.t = l.reloadT) : $e.fresh ? ($e.fresh = !1) : ($e.t += B),
          Y.reload($e, $e.t),
          $e.t >= $e.T &&
            l.reloadT == null &&
            ((a.reload = null),
            (a.reloadW = 0),
            (a.rackW = 0),
            (a.antYT = 0),
            (a.antRT = 0),
            Y.endReload(),
            n.events.emit("weapon:reload", { phase: "done", empty: $e.empty, weapon: Y.id })));
      } else ((a.reloadW = 0), (a.rackW = 0), (a.antYT = 0), (a.antRT = 0));
      a.cooldown -= B;
      let Ue = !a.reload && !ne && a.sprintT < 0.45;
      if (he.auto) {
        if (ye && Ue)
          if (V.ammo > 0) {
            let $e = 0;
            for (; a.cooldown <= 0 && V.ammo > 0 && $e < 3;) (Q(), (a.cooldown += 60 / he.rpm), $e++);
          } else
            a.dryDone ||
              ((a.dryDone = !0), n.events.emit("weapon:dry", { weapon: Y.id }), (a.bump.v -= 0.08), V.reserve > 0 && (a.autoReload = 0.32));
      } else
        (Te ? (a.fireQ = 0.13) : a.fireQ > 0 && (a.fireQ -= B),
          a.fireQ > 0 &&
            Ue &&
            a.cooldown <= 0 &&
            ((a.fireQ = 0),
            V.ammo > 0
              ? (Q(), (a.cooldown = 60 / he.rpm))
              : (n.events.emit("weapon:dry", { weapon: Y.id }),
                (a.bump.v -= 0.08),
                (a.cooldown = 0.12),
                V.reserve > 0 && (a.autoReload = 0.28))));
      (a.cooldown < 0 && (a.cooldown = Math.max(a.cooldown, -0.001)),
        a.t - a.lastShot > 0.24 && (a.burst > 0 && (a.recPhase = r() * 6.28), (a.burst = 0)),
        (a.bloom = Math.max(0, a.bloom - B * he.spread.decay)),
        he.smoke && a.t - a.lastShot > 0.11 && a.t - a.lastShot < 0.11 + B * 1.5 && a.heat > 0.4 && (a.smoke = Math.min(1.6, a.heat * 1.3)),
        a.smoke > 0 &&
          ((a.smoke -= B),
          (a.smokeTick -= B),
          a.smokeTick <= 0 &&
            n.fx &&
            n.fx.smoke &&
            ((a.smokeTick = 0.085), S(A), n.fx.smoke(A, { size: 0.1 + a.smoke * 0.06, life: 1.3, rise: 0.5, count: 1, alpha: 0.22 }))),
        (a.heat = Math.max(0, a.heat - B * 0.2)));
      let Ve = (!!re.ads || l.ads) && !a.reload && !ne && a.sprintT < 0.35;
      ((a.adsLin = Hn(a.adsLin + (Ve ? B : -B) / he.adsTime, 0, 1)), (a.adsE = Ot(a.adsLin)), (E.ads = a.adsE), (a.adsWant = Ve));
      let ze = X.speed || 0,
        Ge = Is(ze / 6),
        _e = he.spread,
        Ne =
          u0(_e.hip, _e.ads, a.adsE) +
          Ge * u0(_e.moveHip, _e.moveAds, a.adsE) +
          a.bloom * u0(_e.bloomHip, _e.bloomAds, a.adsE) +
          (X.onGround === !1 ? _e.air : 0) -
          (X.crouching ? _e.crouch * (1 - a.adsE) : 0);
      ((a.spreadS = j0(a.spreadS, Ne, 18, B)),
        (E.spread = a.spreadS),
        ye ||
        !!re.ads ||
        !!a.reload ||
        ne ||
        ze > 0.2 ||
        (re.look && Math.abs(re.look.dx) + Math.abs(re.look.dy) > 0.002) ||
        a.sprintT > 0.1
          ? ((a.idleT = 0), a.inspect >= 0 && (a.inspect = Math.max(a.inspect, 2.9)))
          : (a.idleT += B),
        he.inspect && a.inspect < 0 && a.idleT > 24 && (a.inspect = 0));
      let je = 0,
        Ze = 0,
        qe = 0;
      if (a.inspect >= 0) {
        let $e = (a.inspect += B);
        ((je = Ot($e / 0.5) * (1 - Ot(($e - 1.4) / 0.5))),
          (Ze = Ot(($e - 1.5) / 0.5) * (1 - Ot(($e - 2.8) / 0.5))),
          (qe = Ot($e / 0.5) * (1 - Ot(($e - 2.9) / 0.5))),
          $e > 3.5 && ((a.inspect = -1), (a.idleT = 0)));
      }
      ((E.state = ne
        ? "switching"
        : a.reload
          ? "reloading"
          : a.inspect >= 0
            ? "inspect"
            : a.sprintT > 0.5
              ? "sprinting"
              : a.t - a.lastShot < 0.14
                ? "firing"
                : "idle"),
        (a.finger = j0(a.finger, (ye && Ue) || l.flash ? 1 : 0, 30, B)),
        Y.parts(B, a.finger, !!a.reload));
      let Oe = Y.flash,
        mt = Oe.material.uniforms;
      if (
        (l.flash && ((a.flashT = a.flashDur = 0.05), (mt.uSeed.value = 3.7), Oe.scale.setScalar(he.flashScale)),
        (a.flashT -= B),
        l.flash && (a.flashT = a.flashDur * 0.6),
        (mt.uInt.value = a.flashT > 0 ? 9.5 * Math.sqrt(a.flashT / a.flashDur) : a.lastShot === a.t ? 4.5 : 0),
        (mt.uHeat.value = he.smoke ? Is((a.heat - 0.45) / 0.8) * 2.2 : 0),
        (Oe.visible = mt.uInt.value > 0 || mt.uHeat.value > 0.02),
        l.freeze)
      ) {
        p.update(B, Y, Y.root);
        return;
      }
      (D(Math.min(B, 0.1), Y, X, re, je, Ze, qe), p.update(B, Y, Y.root));
    }
    let q = new St(),
      ue = new St(),
      de = new _0(),
      $ = new Js(),
      se = new Js(),
      fe = new Js(),
      me = (B) => B * (0.35 + 0.65 * Math.abs(B)),
      ge = (B) => B * (1.6 - 0.6 * Math.abs(B)),
      ce = (B) => B * (1.45 - 0.45 * Math.abs(B)),
      P = (B, X) => {
        Math.abs(B.x - X) < 1e-5 && Math.abs(B.v) < 1e-4 && Xn(B, X);
      };
    function D(B, X, re, Y, he, V, ne) {
      let ye = X.motion,
        Te = X.pose,
        Re = Te.HIP,
        Ue = Te.ADS,
        Ve = Te.SPRINT,
        ze = Te.SPRINT_ARC,
        Ge = Te.RELOAD,
        _e = Te.RACK,
        Ne = ye.ads.arc,
        ke = ye.wall,
        je = re.onGround !== !1,
        Ze = re.speed || 0,
        qe = re.vel ? re.vel.x : 0,
        Oe = re.vel ? re.vel.y : 0,
        mt = re.vel ? re.vel.z : 0,
        $e = a.t;
      (en(a.adsV, a.adsWant ? 1 : 0, B, ye.ads.w, ye.ads.z),
        P(a.adsV, a.adsWant ? 1 : 0),
        en(a.adsS, a.adsWant ? 1 : 0, B),
        P(a.adsS, a.adsWant ? 1 : 0));
      let Ke = a.adsS.x - a.adsV.x,
        Bt = Ke > 0 ? Ke * Ke * ye.ads.out : 0;
      (en(a.spV, a.spWant ? 1 : 0, B, ye.sprint.spr[0] * (a.urgent ? 1.5 : 1), ye.sprint.spr[1]),
        P(a.spV, a.spWant ? 1 : 0),
        en(a.rwS, a.reloadW, B),
        P(a.rwS, a.reloadW),
        en(a.rkS, a.rackW, B),
        P(a.rkS, a.rackW));
      let Gt = a.adsV.x,
        vi = Is(Gt),
        q0 = vi * vi * (3 - 2 * vi),
        yi = 4 * Gt * (1 - Gt),
        sn = a.spV.x,
        P0 = 4 * sn * (1 - sn),
        $t = a.rwS.x,
        Sn = a.rkS.x,
        bi = a.hol,
        oi = ge(bi),
        xn = me(bi),
        Zt = ce(bi);
      if (((a.wallT -= B), a.wallT <= 0 && n.physics && n.physics.raycast && re.forward && re.eye)) {
        a.wallT = 0.08;
        let pe = null;
        try {
          pe = n.physics.raycast(re.eye, re.forward, ke.far);
        } catch {
          pe = null;
        }
        a.wallK = pe ? Ot((ke.far - pe.dist) / (ke.far - ke.near)) : 0;
      }
      (en(a.wall, a.wallK, B), P(a.wall, a.wallK));
      let Vs = a.wall.x * (1 - 0.85 * q0) * (1 - Is(bi * bi)),
        ws =
          Re.p[0] +
          (Ue.p[0] - Re.p[0]) * Gt +
          Ne.p[0] * yi +
          Ve.p[0] * sn +
          ze.p[0] * P0 +
          Ge.p[0] * $t +
          _e.p[0] * Sn +
          Hh.p[0] * oi +
          ke.p[0] * Vs -
          0.035 * ne,
        cl =
          Re.p[1] +
          (Ue.p[1] - Re.p[1]) * Gt +
          Ne.p[1] * yi +
          Ve.p[1] * sn +
          ze.p[1] * P0 +
          Ge.p[1] * $t +
          _e.p[1] * Sn +
          Hh.p[1] * xn +
          ke.p[1] * Vs +
          0.045 * ne,
        I0 =
          Re.p[2] +
          (Ue.p[2] - Re.p[2]) * Gt +
          Ne.p[2] * yi +
          Ve.p[2] * sn +
          ze.p[2] * P0 +
          Ge.p[2] * $t +
          _e.p[2] * Sn +
          Hh.p[2] * oi +
          ke.p[2] * Vs,
        Kt =
          Re.r[0] * (1 - Gt) +
          Ne.r[0] * yi +
          Ve.r[0] * sn +
          ze.r[0] * P0 +
          Ge.r[0] * $t +
          _e.r[0] * Sn +
          Hh.r[0] * Zt +
          ke.r[0] * Vs +
          0.3 * ne,
        be =
          Re.r[1] * (1 - Gt) +
          Ne.r[1] * yi +
          Ve.r[1] * sn +
          ze.r[1] * P0 +
          Ge.r[1] * $t +
          _e.r[1] * Sn +
          Hh.r[1] * Zt +
          ke.r[1] * Vs +
          0.18 * ne +
          0.25 * V,
        Le =
          Re.r[2] * (1 - Gt) +
          Ne.r[2] * yi +
          Ve.r[2] * sn +
          ze.r[2] * P0 +
          Ge.r[2] * $t +
          _e.r[2] * Sn +
          Hh.r[2] * Zt +
          ke.r[2] * Vs -
          0.75 * he +
          0.55 * V,
        Fe = 0,
        He = 0,
        De = 0,
        ve = 0,
        we = 0,
        Ae = 0,
        ie = u0(1, ye.ads.pos, q0),
        ae = u0(1, ye.ads.rot, q0);
      if (!l.noIdle) {
        let pe = ye.idle,
          Ee = a.exert,
          Me = ie * (1 - 0.5 * sn),
          Ie = ae;
        ((a.exert = j0(a.exert, re.sprinting ? 1 : 0, re.sprinting ? 0.3 : 0.14, B)),
          (a.breath += B * O1 * pe.hz * (1 + 0.5 * Ee) * (1 + 0.1 * sa($e * 0.11, 3))),
          a.breath > 4096 && (a.breath -= 651 * O1));
        let Ce = a.breath,
          Ye = (1 + 0.9 * Ee) * (1 + 0.2 * sa($e * 0.07, 5)),
          rt = (Math.sin(Ce) + 0.24 * Math.sin(2 * Ce + 0.7)) * Ye,
          Be = (Math.sin(Ce - 0.6) + 0.2 * Math.sin(2 * Ce + 0.2)) * Ye,
          _t = 1.4 * sa($e * 0.09, 7),
          wt = 1.4 * sa($e * 0.08, 8);
        ((Fe += (Math.sin($e * 0.53 + _t) * pe.drift + rt * pe.breathY * 0.15 + sa($e * 2.3, 12) * pe.noise) * Me),
          (He += (rt * pe.breathY + Math.sin($e * 0.83 + 1.7 + wt) * pe.drift * 0.6 + sa($e * 1.9, 11) * pe.noise) * Me),
          (ve += (Be * pe.breathP + Math.sin($e * 0.41 + 0.9 + wt) * pe.driftR * 0.5 + sa($e * 1.6, 13) * pe.noiseR) * Ie),
          (we += (Math.sin($e * 0.37 + 2.2 + _t) * pe.driftR + sa($e * 1.3, 14) * pe.noiseR) * Ie),
          (Ae += (Math.sin($e * 0.29 + 0.4 - _t) * pe.driftR * 0.8 + sa($e * 1.1, 15) * pe.noiseR) * Ie));
      }
      {
        let pe = re.tuning && re.tuning.stride ? re.tuning.stride : NS,
          Ee = en(a.stride, re.crouching ? pe.crouch : re.sprinting ? pe.sprint : pe.walk, B);
        a.spd = j0(a.spd, Ze, 14, B);
        let Me = a.gait + a.gOff.x;
        if (je) {
          let Tn = Is(Ze / 0.5);
          a.gait += (Tn * Ze * B) / Ee - (((1 - Tn) * Math.sin(O1 * Me)) / O1) * (1 - Math.exp(-8 * B));
        }
        if (a.landEv >= 0 || (!a.wasGround && je)) a.gOffT += Math.floor(Me) + 0.35 - Me;
        else if (a.stepEv) {
          let Tn = (Ze * B) / Ee,
            ri = Math.round(Me) - Me - Tn * 0.5;
          Math.abs(ri) > 0.55 * Tn && (a.gOffT += ri - (a.gOffT - a.gOff.x));
        }
        ((a.stepEv = 0),
          en(a.gOff, a.gOffT, B),
          a.gait > 2048 && (a.gait -= 2048),
          en(a.amt, je ? Math.pow(Is(Ze / 3.8), 0.8) * (re.crouching ? ye.crouch : 1) : 0, B));
        let Ie = ye.walk,
          Ce = ye.run,
          Ye = a.amt.x,
          rt = a.gait + a.gOff.x - (u0(Ie.lag, Ce.lag, sn) * a.spd) / Ee,
          Be = O1 * rt - P5,
          _t = Math.PI * rt,
          wt = Ye * u0(1, 0.14, q0),
          z0 = Ye * u0(1, 0.05, q0),
          Pi = FS(Be),
          Lt = Math.sin(_t) + 0.16 * Math.sin(3 * _t + 0.5),
          o0 = Math.sin(Be + P5 + 2.2) + 0.25 * Math.sin(_t + 0.4),
          g0 = FS(Be - 0.55),
          M0 = Math.sin(_t + 1.25) + 0.22 * Math.sin(Be + P5),
          on = Math.sin(_t + 0.35) + 0.25 * Math.sin(Be + P5 + 1);
        ((Fe += Lt * u0(Ie.x, Ce.x, sn) * wt),
          (He += Pi * u0(Ie.y, Ce.y, sn) * wt),
          (De += o0 * u0(Ie.z, Ce.z, sn) * wt),
          (ve += g0 * u0(Ie.pitch, Ce.pitch, sn) * z0),
          (we += M0 * u0(Ie.yaw, Ce.yaw, sn) * z0),
          (Ae += on * u0(Ie.roll, Ce.roll, sn) * z0));
      }
      {
        let pe = ye.inertia,
          Ee = re.yaw || 0,
          Me = Math.cos(Ee),
          Ie = Math.sin(Ee),
          Ce = qe * Me - mt * Ie,
          Ye = -qe * Ie - mt * Me,
          rt = 1 - Math.exp(-B / pe.tau);
        ((a.lpR += (Ce - a.lpR) * rt), (a.lpF += (Ye - a.lpF) * rt));
        let Be = Ce - a.lpR,
          _t = Ye - a.lpF,
          wt = u0(1, 0.3, q0),
          z0 = u0(1, 0.08, q0);
        ((De += en(a.inZ, _t * pe.z, B) * wt),
          (Fe += en(a.inX, -Be * pe.x, B) * wt),
          (ve += en(a.inP, _t * pe.pitch, B) * z0),
          (Ae += en(a.inR, -Be * pe.roll - a.lpR * pe.lean * (1 - sn), B) * z0));
      }
      {
        let pe = ye.sway,
          Ee = pe.spr[0] * pe.spr[0] * pe.lag,
          Me = pe.max * 2.5;
        ((a.swY.v += Hn(Y.look ? Y.look.dx : 0, -0.35, 0.35) * Ee),
          (a.swP.v += Hn(Y.look ? Y.look.dy : 0, -0.35, 0.35) * Ee * 0.8),
          en(a.swY, 0, B),
          en(a.swP, 0, B),
          (a.swY.x > Me || a.swY.x < -Me) && ((a.swY.x = Hn(a.swY.x, -Me, Me)), (a.swY.v = 0)),
          (a.swP.x > Me || a.swP.x < -Me) && ((a.swP.x = Hn(a.swP.x, -Me, Me)), (a.swP.v = 0)));
        let Ie = ry(a.swY.x, pe.max),
          Ce = ry(a.swP.x, pe.max * 0.75),
          Ye = u0(1, pe.adsRot, q0),
          rt = u0(1, pe.adsPos, q0);
        ((we += Ie * Ye), (Ae -= Ie * pe.roll * Ye), (ve += Ce * Ye), (Fe -= Ie * pe.shift * rt), (He += Ce * pe.shift * rt));
      }
      {
        let pe = ye.air,
          Ee = u0(1, 0.45, q0),
          Me = u0(1, 0.1, q0);
        if ((a.wasGround && !je && (a.jumpEv || Oe > 1) && ((a.jY.v += pe.jumpY), (a.jP.v += pe.jumpP)), !a.wasGround && je)) {
          let rt = Hn(Math.max(a.landEv, -a.lastVy), 0, 14);
          ((a.landSide = -a.landSide),
            (a.jY.v -= rt * pe.landY),
            (a.jP.v -= rt * pe.landP),
            (a.jR.v += a.landSide * rt * pe.landR * (0.65 + 0.35 * r())));
        }
        ((a.wasGround = je), (a.jumpEv = 0), (a.landEv = -1), je || (a.lastVy = Oe));
        let Ie = ye.crouchDip,
          Ce = re.crouching ? 1 : 0,
          Ye = (en(a.stance, Ce, B, Ie.w[0], 1) - en(a.stance2, Ce, B, Ie.w[1], 1)) * 2.4;
        ((He -= Ye * Ie.y * Ee),
          (ve -= Ye * Ie.pitch * Me),
          (Ae += Ye * Ie.roll * Me),
          (He += en(a.jY, je ? 0 : Hn(-Oe * pe.fallY, -0.004, 0.016), B) * Ee),
          (ve += en(a.jP, je ? 0 : Hn(-Oe * pe.fallP, -0.02, 0.04), B) * Me),
          (Ae += en(a.jR, 0, B) * Me));
      }
      (en(a.kZ, 0, B),
        en(a.kP, 0, B),
        en(a.kY, 0, B),
        en(a.kR, 0, B),
        en(a.kX, 0, B),
        en(a.kU, 0, B),
        en(a.bump, 0, B),
        en(a.antY, a.antYT, B),
        en(a.antR, a.antRT, B),
        (ve += a.kP.x + a.bump.x * 1.5),
        (we += a.kY.x),
        (Ae += a.kR.x + a.antR.x),
        (He += a.bump.x * 0.6 + a.antY.x),
        q.setFromEuler(de.set(Kt, be, Le, "YXZ")),
        ue.setFromEuler(de.set(ve, we, Ae, "YXZ")),
        $.fromArray(ye.pivot),
        se.copy($).applyQuaternion(ue),
        $.sub(se),
        fe.set($.x + a.kX.x, $.y + a.kU.x, $.z + a.kZ.x - Bt).applyQuaternion(q),
        X.root.position.set(ws + Fe + fe.x, cl + He + fe.y, I0 + De + fe.z),
        X.root.quaternion.copy(q).multiply(ue));
    }
    if (
      (T(),
      n.params && n.params.wview && M(n.params.wview),
      typeof window < "u" && n.params && n.params.shot && !n.showcase && window.__setShot)
    ) {
      let B = window.__setShot;
      window.__setShot = (X) => {
        if ((X && X.wview && M(X.wview), X && X.wfill && n.render && (n.render.viewFill = +X.wfill), X && (X.wgun || X.wpose))) {
          l.pause = !1;
          let re = X.wgun === "pistol" ? "pistol" : "rifle",
            Y = X.wpose || "hip",
            he = Y === "empty";
          ((a.reload = null),
            (l.reloadT = null),
            (l.empty = !1),
            (l.flash = Y === "fire"),
            (l.ads = Y === "ads" || !!X.wads),
            (l.sprint = Y === "sprint"));
          for (let V of y) ((V.slot.ammo = V.def.magSize), V.reset());
          if (
            (E.equip(re),
            (he || Y === "locked") && ((b.slot.ammo = 0), b.setLocked(!0)),
            (Y === "reload" || he) && ((l.reloadT = X.wt != null ? +X.wt : 0.6), (l.empty = he)),
            E.snap(),
            O(0.016),
            E.snap(),
            Y === "switch")
          ) {
            U(re === "rifle" ? "pistol" : "rifle");
            let V = X.wt != null ? +X.wt : 0.14;
            for (let ne = 0; ne < V - 1e-6; ne += 0.005) O(0.005);
            l.pause = !0;
          }
        }
        B(X);
      };
    }
    return E;
  }
  export async function BD(n) {
    let e = await I5(n);
    n.weapon = e;
    let t = new Js(0, 1.68, 4),
      i = { south: [0.28, -0.01, 1], east: [1, 0, 0.25], north: [-0.2, -0.01, -1], west: [-1, 0, 0.1], nw: [-0.75, -0.01, -0.65] },
      s = {
        rifle: {
          side: [Math.PI, [1.12, 1.3, 0.11], [0, 1.235, 0.11], 30],
          right: [0, [1.12, 1.3, -0.11], [0, 1.235, -0.11], 30],
          top: [Math.PI * 0.86, [0.62, 1.8, -0.42], [0, 1.24, 0.12], 32],
          hands: [Math.PI, [0.4, 1.4, 0.02], [0.02, 1.215, 0.25], 30],
          rhand: [0, [0.36, 1.22, 0.27], [0.03, 1.16, 0.09], 30],
          muzzle: [Math.PI, [0.26, 1.37, 0.98], [0, 1.262, 0.44], 30],
          optic: [Math.PI, [0.2, 1.4, -0.26], [0, 1.31, 0.02], 30],
          lower: [Math.PI, [0.34, 1.26, 0.04], [0, 1.2, 0.03], 30],
        },
        pistol: {
          side: [Math.PI, [0.5, 1.25, -0.03], [0, 1.215, -0.03], 30],
          right: [0, [0.5, 1.25, 0.03], [0, 1.215, 0.03], 30],
          top: [Math.PI * 0.86, [0.2, 1.56, -0.16], [0, 1.25, 0], 32],
          hands: [Math.PI * 0.8, [0.3, 1.36, -0.2], [0, 1.2, -0.01], 30],
          rear: [Math.PI * 0.93, [0.07, 1.33, -0.34], [0, 1.24, 0], 30],
          grip: [0, [0.28, 1.2, 0.16], [0, 1.19, 0.05], 30],
          under: [Math.PI, [0.26, 1.02, -0.16], [0, 1.17, -0.05], 30],
        },
      },
      o = window.__setShot,
      r = null;
    function a(c, u = {}) {
      let f = u.wgun === "pistol" ? "pistol" : "rifle",
        h = s[f][c];
      ((r = c), u.wview && e.setView(u.wview));
      let p = n.input,
        d = n.player;
      ((p.ads = !1),
        (p.fire = !1),
        (d.sprinting = !1),
        (d.speed = 0),
        (e.debug.pause = !1),
        (e.debug.reloadT = null),
        (e.debug.flash = !1),
        (e.debug.empty = !1),
        (e.debug.freeze = !!h),
        e.arms.attach(null),
        e.reset(),
        e.equip(f));
      for (let E of Object.values(e.rigs)) (n.camera.add(E.root), E.root.traverse((M) => M.layers.set(Ro)));
      let m = e.root,
        x = e.rigs[f],
        v = (E, M) => {
          ((e.debug.reloadT = +E), (e.debug.empty = !!M), M && ((e.ammo = 0), x.setLocked(!0)));
        },
        y,
        b,
        g;
      if (h)
        (n.scene.add(m),
          m.position.set(0, 1.25, 0),
          m.rotation.set(0, h[0], 0, "YXZ"),
          m.traverse((E) => E.layers.set(Ia)),
          e.arms.attach(m, x.pose.HIP, Ia),
          (y = h[1]),
          (b = h[2]),
          (g = h[3]),
          u.wt != null ? v(u.wt, !!u.wempty) : u.wempty && ((e.ammo = 0), x.setLocked(!0)));
      else {
        let E = i[u.wlook] || i.south;
        ((y = [t.x, t.y, t.z]),
          (b = [t.x + E[0] * 50, t.y + E[1] * 50, t.z + E[2] * 50]),
          (g = 74),
          c === "ads" && ((p.ads = !0), (g = 52)),
          c === "sprint" && ((d.sprinting = !0), (d.speed = 6)),
          c === "fire" && ((e.debug.flash = !0), u.wads && ((p.ads = !0), (g = 52))),
          (c === "reload" || c === "empty") && v(u.wt != null ? u.wt : 0.62, c === "empty"),
          c === "locked" && ((e.ammo = 0), x.setLocked(!0), u.wads && ((p.ads = !0), (g = 52))));
      }
      if ((e.snap(), e.update(0.016), e.snap(), c === "switch")) {
        e.switchTo(f === "rifle" ? "pistol" : "rifle");
        let E = u.wt != null ? +u.wt : 0.14;
        for (let M = 0; M < E - 1e-6; M += 0.005) e.update(0.005);
        e.debug.pause = !0;
      }
      return (o && o({ cam: u.cam || [...y, ...b].join(","), fov: u.fov || g, exposure: u.exposure }), { cam: y, target: b });
    }
    window.__setShot = (c) => {
      c && c.wpose ? a(c.wpose, c) : o && o(c);
    };
    let l = a(n.params.wpose || "hip", n.params);
    return {
      cam: l.cam,
      target: l.target,
      update(c) {
        (e.update(c), r === "fire" && (e.debug.flash = !0));
      },
    };
  }
