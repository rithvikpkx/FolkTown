import { CanvasTexture as Rs, SRGBColorSpace as In, LinearMipmapLinearFilter as yn, MeshStandardMaterial as L0, DoubleSide as ln, ShaderChunk as Yt, OrthographicCamera as Mr, Scene as mr, Mesh as ht, PlaneGeometry as w0, RawShaderMaterial as Gc, GLSL3 as jf, Vector2 as We, WebGLRenderTarget as Zn, LinearFilter as x0, RepeatWrapping as qs, NoColorSpace as ci, NearestFilter as Dn, Vector4 as Jt, Vector3 as K, MeshBasicMaterial as An, Color as Qe, SphereGeometry as Gi, Group as At } from 'three';
import { ar } from './ns.js';
import { Kn } from './common.js';
// forward references, filled in by the owning later file (see README)
let fn, uP, ms;
export const __late = {
  fn(v) {
    fn = v;
  },
  uP(v) {
    uP = v;
  },
  ms(v) {
    ms = v;
  },
};

export var cv = {};
  ar(cv, { applyPatch: () => g_, create: () => lv, showcase: () => _k });
  export var s_ = `
in vec3 position; out vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    o_ = `
precision highp float; precision highp int;
uniform vec4 uP; uniform float uSeed; uniform float uTexel;
in vec2 vUv;
layout(location=0) out vec4 o0; layout(location=1) out vec4 o1; layout(location=2) out vec4 o2;
#define TAU 6.28318530718
#define sat(x) clamp(x, 0.0, 1.0)
#define OV(D, k) { float k_ = sat(k); nt = mix(nt, D, k_); ta = mix(ta, 0.0, k_); }
vec3 L(float r, float g, float b){ return pow(vec3(r, g, b), vec3(2.2)); }
uvec3 pcg3(uvec3 v){ v = v * 1664525u + 1013904223u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; v ^= v >> 16u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; return v; }
vec3 h3(vec2 c, vec2 per, float s){ c = mod(c, per); return vec3(pcg3(uvec3(uint(c.x + 0.5), uint(c.y + 0.5), uint(s + uSeed)))) * (1.0 / 4294967296.0); }
float gn(vec2 p, vec2 per, float s){
  vec2 i = floor(p), f = p - i; vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(h3(i, per, s).xy * 2.0 - 1.0, f);
  float b = dot(h3(i + vec2(1.0, 0.0), per, s).xy * 2.0 - 1.0, f - vec2(1.0, 0.0));
  float c = dot(h3(i + vec2(0.0, 1.0), per, s).xy * 2.0 - 1.0, f - vec2(0.0, 1.0));
  float d = dot(h3(i + vec2(1.0, 1.0), per, s).xy * 2.0 - 1.0, f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// fractal noise, ~0..1 centred on 0.5 (std ~0.18)
float fbm(vec2 uv, vec2 f, int oct, float s){
  float a = 0.5, v = 0.0, t = 0.0;
  for (int i = 0; i < oct; i++){ v += a * gn(uv * f, f, s + float(i) * 7.0); t += a; a *= 0.5; f *= 2.0; }
  return sat(v / t * 1.8 + 0.5);
}
// voronoi: x = F1, y = F2, z = cell random, w = second cell random
vec4 vor(vec2 p, vec2 per, float s){
  vec2 i = floor(p), f = p - i; float d1 = 9.0, d2 = 9.0; vec2 id = vec2(0.0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 o = vec2(float(x), float(y)); vec3 r = h3(i + o, per, s); vec2 d = o + r.xy - f; float dd = dot(d, d);
    if (dd < d1){ d2 = d1; d1 = dd; id = vec2(r.z, fract(r.z * 37.0 + r.x * 11.0)); } else if (dd < d2) d2 = dd;
  }
  return vec4(sqrt(d1), sqrt(d2), id);
}
// scattered straight scratches: f cells per tile, w half-width (cells), base angle + spread, density 0..1
float scr(vec2 uv, float f, float s, float w, float ang, float spread, float dens){
  vec2 p = uv * f; vec2 i = floor(p); vec2 fr = p - i; float m = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 o = vec2(float(x), float(y)); vec3 r = h3(i + o, vec2(f), s); vec3 r2 = h3(i + o, vec2(f), s + 31.0);
    vec2 c = o + r.xy - fr; float a = ang + (r.z - 0.5) * spread; vec2 dir = vec2(cos(a), sin(a));
    float al = dot(c, dir), ac = dot(c, vec2(-dir.y, dir.x)); float len = 0.15 + r2.x * 0.8;
    m = max(m, smoothstep(w, w * 0.3, abs(ac)) * smoothstep(len, len * 0.7, abs(al)) * step(r2.y, dens) * (0.35 + 0.65 * r2.z));
  }
  return m;
}
void emit(vec3 c, float a, float h, float ao, float r, float m){
  o0 = vec4(sqrt(clamp(c, 0.0, 1.0)), sat(a));
  o1 = vec4(sat(ao), clamp(r, 0.03, 1.0), sat(m), 1.0);
  float hh = sat(h) * 255.0; float fl = floor(hh); o2 = vec4(fl / 255.0, hh - fl, 0.0, 1.0);
}
// soft, grainy rust patch mask: f = patch frequency, th = threshold (higher = rarer)
float rustMask(vec2 uv, vec2 f, float th, float s){
  float n = fbm(uv, f, 5, s), g = fbm(uv, f * 14.0, 3, s + 50.0);
  return smoothstep(th, th + 0.14, n + (g - 0.5) * 0.3) * (0.5 + 0.5 * g);
}
// ---- shared paint damage model ----
float chipsF(vec2 uv, vec2 f, float s, float dens, float rmax){
  vec4 v = vor(uv * f, f, s); float e = fbm(uv, f * 3.0, 3, s + 3.0) - 0.5; float r = rmax * (0.25 + 0.75 * v.w);
  return step(v.z, dens) * smoothstep(r, r * 0.55, v.x + e * 0.6);
}
// chip: 0 = intact paint .. 1 = through to substrate; stain: thin oxide halo; run: rust run below damage (-V is down)
void paintDmg(vec2 uv, float amt, out float chip, out float stain, out float run){
  float wearN = fbm(uv, vec2(3.0), 6, 21.0);
  float zone = smoothstep(0.58, 0.82, fbm(uv, vec2(2.0), 3, 22.0));      // damage clusters; most of the panel is clean
  float dn = (0.012 + 0.085 * zone) * (0.5 + amt);
  float c1 = chipsF(uv, vec2(20.0, 11.0), 23.0, dn, 0.24);                // vertically stretched flakes
  float c2 = chipsF(uv, vec2(64.0, 40.0), 24.0, dn * 1.6, 0.34);
  float th = 0.925 - 0.06 * amt;
  float c3 = smoothstep(th, th + 0.03, wearN + (fbm(uv, vec2(40.0), 3, 25.0) - 0.5) * 0.12);
  float s1 = scr(uv, 5.0, 26.0, 0.0035, 0.0, 0.4, 0.2 + 0.25 * amt);
  float s2 = scr(uv, 16.0, 27.0, 0.009, 1.57, 0.5, 0.12 + 0.2 * amt);
  float sbreak = smoothstep(0.4, 0.65, fbm(uv, vec2(50.0), 2, 28.0));
  chip = sat(max(max(c1, c2), max(c3, max(s1, s2) * sbreak)));
  vec4 v = vor(uv * vec2(20.0, 11.0), vec2(20.0, 11.0), 23.0);
  float b1 = step(v.z, dn) * smoothstep(0.42, 0.14, v.x) * (0.3 + 0.7 * v.w);
  float bn = fbm(uv, vec2(36.0), 4, 29.0);
  stain = sat(max(b1 * smoothstep(0.4, 0.7, bn) * 0.8, smoothstep(th - 0.03, th + 0.02, wearN) * smoothstep(0.4, 0.7, bn) * 0.7));
  float streak = fbm(uv, vec2(120.0, 1.0), 3, 30.0);
  float rr = 0.0;
  for (int i = 1; i <= 4; i++){
    vec2 q = uv + vec2(0.0, float(i) * 0.034);
    float src = max(chipsF(q, vec2(20.0, 11.0), 23.0, dn, 0.24), smoothstep(th, th + 0.03, fbm(q, vec2(3.0), 6, 21.0)));
    rr = max(rr, src * (1.0 - float(i) / 5.0));
  }
  run = rr * smoothstep(0.5, 0.78, streak);
}
`,
    r_ = `
void main(){ surf(vUv); }`,
    cn = {};
  cn.asphalt = `
void surf(vec2 uv){
  vec4 a = vor(uv * 110.0, vec2(110.0), 1.0);
  vec4 b = vor(uv * 230.0 + 3.0, vec2(230.0), 2.0);
  float big = fbm(uv, vec2(3.0), 4, 5.0), mid = fbm(uv, vec2(24.0), 4, 6.0), fine = fbm(uv, vec2(300.0), 2, 7.0);
  float jag = fbm(uv, vec2(420.0), 2, 8.0) - 0.5;
  float sa = smoothstep(0.46, 0.3, a.x + jag * 0.3 - (a.y - a.x) * 0.2 + (1.0 - a.w) * 0.12) * step(a.z, 0.62);
  float sb = smoothstep(0.46, 0.3, b.x + jag * 0.2 + (1.0 - b.w) * 0.15) * step(b.z, 0.85);
  float h = max(sa * (0.45 + 0.55 * a.w), sb * 0.5 * (0.5 + 0.5 * b.w));
  h = h * 0.6 + fine * 0.3 + mid * 0.1;
  float wearK = smoothstep(0.3, 0.7, big);
  float stone = sat(max(sa, sb * 0.8));
  vec3 stA = mix(L(0.28, 0.28, 0.29), L(0.45, 0.43, 0.41), a.w); stA = mix(stA, L(0.42, 0.35, 0.28), step(0.9, a.z * 0.5 + a.w * 0.6));
  vec3 stB = mix(L(0.26, 0.26, 0.28), L(0.44, 0.43, 0.42), b.w);
  vec3 col = L(0.13, 0.13, 0.135) * (0.8 + 0.4 * mid);
  col = mix(col, stB, sb * 0.7 * (0.45 + 0.55 * wearK));
  col = mix(col, stA, sa * (0.5 + 0.45 * wearK));
  col *= 0.8 + 0.4 * big;
  float cn = fbm(uv + vec2(0.13, 0.4), vec2(2.0), 3, 9.0);
  float band = smoothstep(0.016, 0.009, abs(cn - 0.5) + (fbm(uv, vec2(70.0), 2, 13.0) - 0.5) * 0.008) * smoothstep(0.4, 0.6, fbm(uv, vec2(2.0), 2, 12.0));
  col = mix(col, L(0.075, 0.075, 0.08), band * 0.93);
  h = mix(h, 0.74 + fine * 0.05 + sa * 0.04, band * 0.88);
  float r = mix(0.93, 0.74, stone * (0.4 + 0.6 * wearK)); r = mix(r, 0.36, band);
  float oil = smoothstep(0.72, 0.86, fbm(uv + 0.5, vec2(5.0), 4, 14.0)); col *= 1.0 - oil * 0.45; r = mix(r, 0.5, oil * 0.6);
  emit(col, 1.0, h, mix(0.55, 1.0, smoothstep(0.0, 0.6, h)), r, 0.0);
}`;
  cn.concrete = `
void surf(vec2 uv){
  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(12.0), 5, 2.0), fine = fbm(uv, vec2(180.0), 3, 3.0);
  float form = fbm(uv, vec2(2.0, 7.0), 5, 4.0);
  vec4 po = vor(uv * 70.0, vec2(70.0), 5.0); float pore = step(po.z, 0.35) * smoothstep(0.16 * po.w + 0.03, 0.02, po.x);
  vec4 po2 = vor(uv * 260.0, vec2(260.0), 6.0); float pore2 = step(po2.z, 0.5) * smoothstep(0.3 * po2.w, 0.05, po2.x);
  vec2 wu = uv + (vec2(fbm(uv, vec2(6.0), 3, 7.0), fbm(uv, vec2(6.0), 3, 8.0)) - 0.5) * 0.12 + (vec2(fbm(uv, vec2(48.0), 3, 17.0), fbm(uv, vec2(48.0), 3, 18.0)) - 0.5) * 0.022;
  vec4 cr = vor(wu * 3.0, vec2(3.0), 9.0);
  float crack = smoothstep(0.0045, 0.0012, cr.y - cr.x) * smoothstep(0.45, 0.6, fbm(uv, vec2(3.0), 2, 10.0));
  float chip = smoothstep(0.83, 0.87, fbm(uv, vec2(7.0), 4, 11.0) + (fine - 0.5) * 0.08 + (mid - 0.5) * 0.06);
  vec4 ag = vor(uv * 140.0, vec2(140.0), 12.0); float stone = smoothstep(0.5, 0.3, ag.x) * step(ag.z, 0.6);
  vec2 dj = min(uv, 1.0 - uv); float jd = min(dj.x, dj.y);
  float joint = smoothstep(0.0022, 0.0012, jd), jstain = smoothstep(0.07, 0.0, jd + (mid - 0.5) * 0.04);
  float h = 0.6 + (mid - 0.5) * 0.25 + (fine - 0.5) * 0.12 + (form - 0.5) * 0.06;
  h -= pore * 0.35 + pore2 * 0.08 + crack * 0.2; h = mix(h, 0.42 + stone * 0.12 + fine * 0.08, chip); h = mix(h, 0.05, joint);
  vec3 col = L(0.53, 0.52, 0.49) * (0.72 + 0.4 * big + 0.22 * (mid - 0.5) + 0.08 * (form - 0.5));
  col *= mix(vec3(1.04, 1.0, 0.94), vec3(0.95, 1.0, 1.05), fbm(uv, vec2(3.0), 3, 13.0));
  float st = smoothstep(0.55, 0.8, fbm(uv, vec2(4.0), 5, 14.0)); col *= 1.0 - st * 0.3;
  float ef = smoothstep(0.66, 0.85, fbm(uv, vec2(5.0), 4, 15.0)) * sat(fine * 1.6 - 0.2); col = mix(col, L(0.68, 0.67, 0.64), ef * 0.22);
  col *= 1.0 - pore * 0.5 - pore2 * 0.2 - crack * 0.6;
  vec3 agc = mix(L(0.38, 0.37, 0.35), L(0.54, 0.52, 0.47), ag.w); agc = mix(agc, L(0.46, 0.41, 0.34), step(0.45, ag.z));
  col = mix(col, mix(L(0.4, 0.39, 0.37) * (0.8 + 0.4 * fine), agc, stone * 0.8), chip);
  col *= 1.0 - jstain * 0.25; col = mix(col, L(0.1, 0.1, 0.1), joint);
  float r = 0.82 + (mid - 0.5) * 0.2 - (form - 0.5) * 0.15; r = mix(r, 0.95, chip); r = mix(r, 0.62, st * 0.3);
  float ao = 1.0 - pore * 0.5 - crack * 0.5 - joint * 0.6 - chip * 0.15;
  float pa = smoothstep(0.40, 0.47, fbm(uv, vec2(9.0), 5, 16.0) + (mid - 0.5) * 0.2) * (1.0 - chip) * (1.0 - crack) * (1.0 - pore);
  emit(col, pa, h, ao, r, 0.0);
}`;
  cn.brick = `
void surf(vec2 uv){
  float rows = 24.0, cols = 8.0; float y = uv.y * rows; float row = floor(y); float x = uv.x * cols + 0.5 * mod(row, 2.0); float cl = floor(x);
  vec2 f = vec2(fract(x), fract(y)); vec3 id = h3(vec2(cl, row), vec2(cols, rows), 1.0);
  float ed = fbm(uv, vec2(60.0), 3, 2.0);
  vec2 d = min(f, 1.0 - f) * vec2(225.0, 75.0);
  float mort = 5.0 + (ed - 0.5) * 5.0; float dm = min(d.x, d.y); float brick = smoothstep(mort, mort + 3.0, dm);
  float fine = fbm(uv, vec2(200.0), 3, 3.0), mid = fbm(uv, vec2(30.0), 4, 4.0);
  vec3 c = mix(L(0.52, 0.27, 0.2), L(0.42, 0.2, 0.15), id.x); c = mix(c, L(0.3, 0.17, 0.15), smoothstep(0.75, 1.0, id.y)); c = mix(c, L(0.58, 0.38, 0.26), smoothstep(0.85, 1.0, id.z));
  c *= (0.8 + 0.4 * mid) * (0.9 + 0.2 * fine);
  float pit = smoothstep(0.7, 0.8, fbm(uv, vec2(90.0), 3, 5.0)); c *= 1.0 - pit * 0.35;
  vec3 mc = L(0.5, 0.48, 0.44) * (0.75 + 0.5 * fine);
  float soot = smoothstep(0.5, 0.8, fbm(uv, vec2(3.0), 4, 6.0));
  vec3 col = mix(mc, c, brick) * (1.0 - soot * 0.35);
  float ef = smoothstep(0.7, 0.85, fbm(uv, vec2(5.0), 4, 7.0)) * brick; col = mix(col, L(0.7, 0.68, 0.64), ef * 0.3);
  float h = mix(0.25 + fine * 0.1, 0.7 + (mid - 0.5) * 0.15 + (fine - 0.5) * 0.1 - pit * 0.2 + (id.x - 0.5) * 0.12, brick);
  emit(col, 1.0, h, mix(0.6, 1.0, brick) * (1.0 - pit * 0.3), mix(0.95, 0.86 + (mid - 0.5) * 0.15, brick), 0.0);
}`;
  cn.epoxy = `
void surf(vec2 uv){
  float big = fbm(uv, vec2(3.0), 5, 1.0), mid = fbm(uv, vec2(20.0), 4, 2.0), fine = fbm(uv, vec2(250.0), 2, 3.0), mott = fbm(uv, vec2(9.0), 5, 11.0);
  vec3 col = L(0.41, 0.445, 0.435) * (0.78 + 0.3 * big + 0.22 * (mott - 0.5));
  col *= mix(vec3(1.03, 1.0, 0.97), vec3(0.95, 1.0, 1.03), fbm(uv, vec2(2.0), 3, 19.0));
  vec4 ag = vor(uv * 180.0, vec2(180.0), 12.0); col *= 1.0 + (ag.w - 0.5) * 0.14 * smoothstep(0.5, 0.2, ag.x);
  float gloss = smoothstep(0.35, 0.62, fbm(uv, vec2(5.0), 5, 4.0));          // sealer still intact
  float lane = smoothstep(0.35, 0.65, fbm(uv, vec2(1.0, 3.0), 3, 13.0));     // traffic lanes worn matt
  float worn = sat(1.0 - gloss * 0.85 + lane * 0.45 - 0.15);
  float sc1 = scr(uv, 14.0, 5.0, 0.012, 0.5, 6.3, 0.7), sc2 = scr(uv, 40.0, 6.0, 0.02, 0.0, 6.3, 0.5);
  float t1 = abs(uv.y - 0.31 - 0.06 * sin(uv.x * TAU)), t2 = abs(uv.x - 0.62 - 0.09 * sin(uv.y * TAU + 1.0));
  float t3 = abs(uv.y - 0.74 - 0.1 * sin(uv.x * TAU * 2.0 + 2.0)), t4 = abs(uv.x - 0.2 - 0.05 * sin(uv.y * TAU + 4.0));
  float tread = 0.6 + 0.4 * sin((uv.x + uv.y) * TAU * 90.0);
  float tm = smoothstep(0.022, 0.016, t1) * smoothstep(0.35, 0.6, fbm(uv, vec2(8.0), 3, 7.0)) + smoothstep(0.02, 0.014, t2) * smoothstep(0.4, 0.65, fbm(uv, vec2(6.0), 3, 8.0))
           + smoothstep(0.026, 0.018, t3) * smoothstep(0.45, 0.7, fbm(uv, vec2(5.0), 3, 14.0)) + smoothstep(0.018, 0.012, t4) * smoothstep(0.4, 0.65, fbm(uv, vec2(7.0), 3, 15.0));
  tm = sat(tm * tread);
  col = mix(col, L(0.1, 0.1, 0.105), tm * 0.75);
  col *= 1.0 - worn * 0.1; col = mix(col, col * 1.25, sc1 * 0.4);
  float dirt = smoothstep(0.55, 0.85, fbm(uv, vec2(2.0), 4, 9.0)); col = mix(col, L(0.3, 0.29, 0.26), dirt * 0.3);
  float r = mix(0.1, 0.52, worn) + sc1 * 0.2 + sc2 * 0.15 + tm * 0.3 + dirt * 0.2 + (mid - 0.5) * 0.12 + (mott - 0.5) * 0.1;
  float h = 0.5 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.06 - sc1 * 0.2 - sc2 * 0.08 + tm * 0.05 + (gloss - 0.5) * 0.03;
  float chip = smoothstep(0.87, 0.9, fbm(uv, vec2(14.0), 5, 10.0) + (fine - 0.5) * 0.06); col = mix(col, L(0.44, 0.44, 0.43) * (0.75 + 0.5 * fine), chip); h -= chip * 0.3; r = mix(r, 0.85, chip);
  emit(col, 1.0, h, 1.0 - chip * 0.2, r, 0.0);
}`;
  export var a_ = `
  float fine = fbm(uv, vec2(260.0), 2, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float chalk = smoothstep(0.3, 0.8, fbm(uv, vec2(1.0, 2.0), 4, 4.0));
  float dirt = smoothstep(0.42, 0.85, fbm(uv, vec2(3.0, 2.0), 5, 5.0));
  float vs1 = fbm(uv, vec2(70.0, 1.0), 3, 6.0), vs2 = fbm(uv, vec2(22.0, 1.0), 3, 16.0), vs3 = fbm(uv, vec2(9.0, 2.0), 3, 17.0);
  float steel = smoothstep(0.55, 0.8, chip);
  float primer = smoothstep(0.15, 0.4, chip) * (1.0 - steel);
  float rustN = fbm(uv, vec2(60.0), 4, 7.0);
  float fresh = steel * smoothstep(0.78, 0.86, fbm(uv, vec2(25.0), 3, 8.0));
  vec3 rustC = mix(L(0.2, 0.135, 0.105), L(0.36, 0.23, 0.15), rustN);
  rustC = mix(rustC, L(0.5, 0.33, 0.18), smoothstep(0.7, 0.95, fbm(uv, vec2(120.0), 2, 9.0)) * 0.5);
  vec3 nt = vec3(0.0); float ta = shade * (0.9 + 0.2 * (mid - 0.5) + 0.2 * (big - 0.5));
  // dirt film: broad grime + fine and broad vertical wash streaks
  float df = sat(dirt * 0.3 + smoothstep(0.55, 0.85, vs1) * 0.3 * (0.4 + dirt) + smoothstep(0.55, 0.8, vs2) * 0.38 * (0.3 + dirt) + smoothstep(0.5, 0.8, vs3) * 0.2);
  float clean = smoothstep(0.6, 0.85, 1.0 - vs2) * 0.5;            // rain-washed lighter streaks
  float rs = sat(stain * 0.7 + run * 0.85);
  ta *= 1.0 + clean * 0.08 - chalk * 0.06;
  OV(vec3(0.72), chalk * 0.075 + clean * 0.02);
  OV(L(0.24, 0.22, 0.19), df * 0.42);
  OV(mix(L(0.3, 0.2, 0.14), L(0.44, 0.28, 0.16), rustN), rs * 0.5);
  OV(mix(L(0.5, 0.25, 0.2), L(0.55, 0.54, 0.5), 0.35), primer);
  OV(rustC, steel);
  OV(L(0.55, 0.55, 0.57), fresh);
  float h = 0.62 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.04;
  h = mix(h, 0.5, primer); h = mix(h, 0.36 + rustN * 0.14, steel); h += rs * 0.02 * rustN;
  float r = baseR + chalk * 0.26 + df * 0.3 - clean * 0.06 + (mid - 0.5) * 0.14 + (big - 0.5) * 0.1; r = mix(r, 0.75, primer); r = mix(r, 0.92, steel); r = mix(r, 0.35, fresh); r = mix(r, 0.72, rs * 0.6);
  float m = fresh * 0.95 + (steel - fresh) * 0.15;
  float ao = 1.0 - steel * 0.25 - primer * 0.1;
`;
  cn.paint = `
void surf(vec2 uv){
  float chip, stain, run; paintDmg(uv, uP.x, chip, stain, run);
  float shade = 0.8, baseR = 0.40;
  ${a_}
  emit(nt, ta, h, ao, r, m);
}`;
  cn.hazard = `
void surf(vec2 uv){
  float chip, stain, run; paintDmg(uv, 1.4, chip, stain, run);
  float shade = 1.0, baseR = 0.5;
  ${a_}
  float s = fract((uv.x + uv.y) * 5.0);
  float yel = smoothstep(0.244, 0.256, abs(s - 0.5) + (fbm(uv, vec2(80.0), 2, 41.0) - 0.5) * 0.02);
  vec3 pc = mix(L(0.1, 0.1, 0.11), L(0.86, 0.66, 0.1), yel);
  emit(nt + pc * ta, 1.0, h, ao, r, m);
}`;
  cn.hull = `
void surf(vec2 uv){
  float ry = uv.y * 2.0; float row = floor(ry); float fy = fract(ry); float sx = fract(uv.x + 0.5 * mod(row, 2.0));
  float dh = min(fy, 1.0 - fy) * 2.0, dv = min(sx, 1.0 - sx) * 4.0; float dseam = min(dh, dv);
  float wn = fbm(uv, vec2(200.0), 2, 1.0);
  float bead = smoothstep(0.012, 0.004, dseam + (wn - 0.5) * 0.004);
  float ripple = 0.75 + 0.25 * sin((uv.x + uv.y) * TAU * 400.0);
  float dish = cos(uv.x * TAU * 8.0) * 0.5 + 0.5;
  float big = fbm(uv, vec2(2.0), 4, 2.0), mid = fbm(uv, vec2(14.0), 4, 3.0), fine = fbm(uv, vec2(220.0), 2, 4.0);
  float roller = fbm(uv, vec2(120.0, 30.0), 3, 5.0);
  float seamK = smoothstep(0.12, 0.0, dseam);
  float pit = fbm(uv, vec2(70.0), 4, 7.0);
  float rust = smoothstep(0.72, 0.79, fbm(uv, vec2(10.0), 5, 6.0) + seamK * 0.2);
  rust *= smoothstep(0.3, 0.5, pit + rust * 0.3);
  float streak = fbm(uv, vec2(110.0, 1.0), 3, 8.0);
  float wp = 0.0;
  for (int i = 1; i <= 4; i++){
    vec2 q = uv + vec2(0.0, float(i) * 0.03); float qy = fract(q.y * 2.0);
    float qs = smoothstep(0.02, 0.0, min(qy, 1.0 - qy) * 2.0); float qr = smoothstep(0.72, 0.79, fbm(q, vec2(10.0), 5, 6.0));
    wp = max(wp, max(qs * 0.7, qr) * (1.0 - float(i) / 5.0));
  }
  float weep = wp * smoothstep(0.4, 0.75, streak);
  float salt = smoothstep(0.6, 0.85, fbm(uv, vec2(3.0, 9.0), 4, 9.0));
  vec3 nt = vec3(0.0); float ta = 0.82 * (0.88 + 0.2 * (big - 0.5) + 0.14 * (mid - 0.5) + 0.08 * (roller - 0.5));
  OV(vec3(0.6), salt * 0.025 * (0.5 + roller));
  OV(L(0.45, 0.27, 0.14), weep * 0.7);
  OV(mix(L(0.25, 0.16, 0.11), L(0.5, 0.31, 0.17), pit), rust);
  float h = 0.5 + (roller - 0.5) * 0.05 + (fine - 0.5) * 0.03 + bead * 0.35 * ripple + (dish - 0.5) * 0.1 - rust * 0.08 * (1.0 - pit);
  float r = 0.5 + (mid - 0.5) * 0.15 + salt * 0.2; r = mix(r, 0.9, rust); r = mix(r, 0.7, weep * 0.5);
  emit(nt, ta, h, 1.0 - rust * 0.2 - smoothstep(0.03, 0.012, dseam) * (1.0 - bead) * 0.3, r, rust * 0.1);
}`;
  cn.galv = `
void surf(vec2 uv){
  vec2 wu = uv + (vec2(fbm(uv, vec2(8.0), 2, 1.0), fbm(uv, vec2(8.0), 2, 2.0)) - 0.5) * 0.03;
  vec4 a = vor(wu * 22.0, vec2(22.0), 3.0); vec4 b = vor(wu * 50.0 + 1.5, vec2(50.0), 4.0);
  float sp = mix(a.w, b.w, 0.35);
  float edge = smoothstep(0.0, 0.08, a.y - a.x);
  float big = fbm(uv, vec2(2.0), 4, 5.0), fine = fbm(uv, vec2(200.0), 2, 6.0), mid = fbm(uv, vec2(20.0), 4, 7.0);
  vec3 col = vec3(0.56, 0.58, 0.6) * (0.72 + 0.4 * sp) * (0.92 + 0.16 * big);
  float wr = smoothstep(0.55, 0.85, fbm(uv, vec2(6.0), 5, 8.0)) * (0.4 + 0.6 * fbm(uv, vec2(90.0), 3, 10.0));
  col = mix(col, L(0.74, 0.74, 0.72), wr * 0.4);
  float rs = rustMask(uv, vec2(9.0), 0.8, 9.0);
  col = mix(col, L(0.42, 0.27, 0.16) * (0.7 + 0.6 * fine), rs);
  float r = 0.3 + 0.28 * sp + (mid - 0.5) * 0.15 + wr * 0.3; r = mix(r, 0.9, rs);
  float h = 0.5 + (sp - 0.5) * 0.08 * edge + (fine - 0.5) * 0.04 + wr * 0.05 * fine - (1.0 - edge) * 0.03;
  emit(col, 1.0, h, 1.0, r, 1.0 - wr * 0.45 - rs * 0.9);
}`;
  cn.metal = `
void surf(vec2 uv){
  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(18.0), 4, 2.0), fine = fbm(uv, vec2(240.0), 2, 3.0);
  float smudge = fbm(uv, vec2(5.0, 7.0), 5, 4.0);
  float s1 = scr(uv, 9.0, 5.0, 0.006, 0.2, 6.3, 0.6), s2 = scr(uv, 30.0, 6.0, 0.012, 1.0, 6.3, 0.5), s3 = scr(uv, 70.0, 7.0, 0.03, 2.0, 6.3, 0.4);
  float sc = sat(max(s1, max(s2 * 0.8, s3 * 0.5)));
  float rust = rustMask(uv, vec2(12.0), 0.74, 8.0) * uP.x;
  float scale_ = smoothstep(0.4, 0.7, fbm(uv, vec2(7.0), 4, 10.0));
  vec3 nt = vec3(0.0); float ta = 0.95 * (0.85 + 0.2 * (big - 0.5) + 0.16 * (mid - 0.5)) * (1.0 - scale_ * 0.18);
  OV(vec3(0.55, 0.56, 0.58), sc * 0.3);
  OV(mix(L(0.27, 0.17, 0.12), L(0.5, 0.31, 0.17), fbm(uv, vec2(90.0), 3, 11.0)), rust);
  float r = 0.42 + (smudge - 0.5) * 0.3 + (mid - 0.5) * 0.1 - sc * 0.15 + scale_ * 0.08; r = mix(r, 0.9, rust);
  float h = 0.5 + (fine - 0.5) * 0.04 + (mid - 0.5) * 0.04 - sc * 0.12 + rust * 0.08 * fine;
  emit(nt, ta, h, 1.0 - rust * 0.2, r, 1.0 - rust * 0.85);
}`;
  cn.brushed = `
void surf(vec2 uv){
  float l1 = fbm(uv, vec2(2.0, 300.0), 3, 1.0), l2 = fbm(uv, vec2(6.0, 120.0), 3, 2.0), l3 = fbm(uv, vec2(1.0, 500.0), 2, 12.0);
  float big = fbm(uv, vec2(3.0), 4, 3.0), smudge = fbm(uv, vec2(6.0), 5, 4.0);
  float sc = scr(uv, 12.0, 5.0, 0.008, 0.6, 6.3, 0.4);
  float tar = smoothstep(0.45, 0.9, fbm(uv, vec2(5.0), 5, 6.0));
  vec3 nt = vec3(0.0); float ta = 0.95 * (0.82 + 0.16 * (l1 - 0.5) + 0.14 * (l2 - 0.5) + 0.1 * (big - 0.5)) * (1.0 - tar * 0.13);
  OV(vec3(0.7), sc * 0.2);
  float r = 0.3 + (l1 - 0.5) * 0.2 + (smudge - 0.5) * 0.2 + tar * 0.18 - sc * 0.08;
  float h = 0.5 + (l1 - 0.5) * 0.2 + (l3 - 0.5) * 0.2 + (l2 - 0.5) * 0.1 - sc * 0.2;
  emit(nt, ta, h, 1.0, r, 1.0);
}`;
  cn.rust = `
void surf(vec2 uv){
  vec2 wu = uv + (vec2(fbm(uv, vec2(5.0), 3, 1.0), fbm(uv, vec2(5.0), 3, 2.0)) - 0.5) * 0.08;
  float n = fbm(wu, vec2(6.0), 7, 3.0);
  float fl = fbm(wu, vec2(11.0), 6, 4.0);
  float tf = fract(fl * 4.0); float layer = floor(fl * 4.0) / 4.0 + smoothstep(0.0, 0.45, tf) * 0.25;
  float flakeEdge = smoothstep(0.1, 0.0, tf) * smoothstep(0.4, 0.6, fbm(uv, vec2(9.0), 3, 14.0));
  vec4 pv = vor(uv * 70.0, vec2(70.0), 5.0); float pit = step(pv.z, 0.5) * smoothstep(0.35 * pv.w + 0.05, 0.03, pv.x);
  vec4 pv2 = vor(uv * 190.0, vec2(190.0), 15.0); float speck = smoothstep(0.35, 0.1, pv2.x) * step(pv2.z, 0.4);
  float grain = fbm(uv, vec2(220.0), 3, 6.0);
  float scaleI = smoothstep(0.75, 0.8, fbm(wu, vec2(4.0), 5, 7.0) + (grain - 0.5) * 0.1);
  float h = 0.25 + layer * 0.4 + (n - 0.5) * 0.3 + (grain - 0.5) * 0.14 - pit * 0.2 + speck * 0.04;
  h = mix(h, 0.8 + (grain - 0.5) * 0.04, scaleI);
  float t = sat(layer * 0.5 + n * 0.55 + (grain - 0.5) * 0.35);
  vec3 c = mix(L(0.26, 0.17, 0.13), L(0.4, 0.25, 0.16), smoothstep(0.25, 0.6, t));
  float bloom = smoothstep(0.55, 0.85, fbm(uv, vec2(7.0), 5, 8.0));
  c = mix(c, L(0.55, 0.34, 0.17), bloom * (0.35 + 0.65 * smoothstep(0.4, 0.7, t)));
  c = mix(c, L(0.62, 0.45, 0.25), smoothstep(0.7, 0.95, fbm(uv, vec2(34.0), 4, 18.0)) * 0.4);
  c = mix(c, L(0.2, 0.14, 0.12), sat(flakeEdge * 0.6 + pit * 0.7));
  c *= (0.8 + 0.4 * grain) * (0.9 + 0.2 * speck);
  float streak = fbm(uv, vec2(60.0, 2.0), 3, 9.0); c = mix(c, L(0.5, 0.31, 0.17), smoothstep(0.55, 0.8, streak) * 0.2);
  c = mix(c, L(0.3, 0.3, 0.33) * (0.8 + 0.4 * grain), scaleI);
  float r = 0.9 + (grain - 0.5) * 0.15 - bloom * 0.06; r = mix(r, 0.55, scaleI);
  emit(c, 1.0, h, 1.0 - pit * 0.4 - flakeEdge * 0.25, r, scaleI * 0.35);
}`;
  cn.diamond = `
void surf(vec2 uv){
  vec2 p = uv * 12.0; vec2 i = floor(p); vec2 q = fract(p) - 0.5; float par = mod(i.x + i.y, 2.0);
  vec2 d = (par < 0.5 ? vec2(q.x + q.y, q.x - q.y) : vec2(q.x - q.y, q.x + q.y)) * 0.7071;
  float e = length(d * vec2(1.0 / 0.46, 1.0 / 0.13));
  float loz = smoothstep(1.0, 0.55, e), top = smoothstep(0.75, 0.4, e);
  float big = fbm(uv, vec2(2.0), 4, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), fine = fbm(uv, vec2(200.0), 2, 3.0);
  float wear = smoothstep(0.3, 0.7, big);
  float grime = (1.0 - loz) * smoothstep(0.3, 0.65, fbm(uv, vec2(8.0), 4, 4.0));
  float sc = scr(uv, 20.0, 5.0, 0.02, 0.0, 6.3, 0.5);
  vec3 col = vec3(0.42, 0.43, 0.45) * (0.85 + 0.3 * (mid - 0.5));
  col = mix(col, vec3(0.68, 0.69, 0.7), top * (0.4 + 0.6 * wear));
  col = mix(col, L(0.22, 0.19, 0.16), grime * 0.8);
  float rust = smoothstep(0.7, 0.86, fbm(uv, vec2(10.0), 5, 6.0) + (fine - 0.5) * 0.12) * (1.0 - top) * (0.6 + 0.4 * fine); col = mix(col, L(0.42, 0.27, 0.16) * (0.7 + 0.6 * fine), rust);
  float r = 0.5 + (mid - 0.5) * 0.15; r = mix(r, 0.22, top * (0.4 + 0.6 * wear)); r = mix(r, 0.85, grime); r = mix(r, 0.9, rust); r -= sc * 0.1;
  float h = 0.2 + loz * 0.7 + (fine - 0.5) * 0.03 - sc * 0.03 * top;
  emit(col, 1.0, h, mix(1.0, 0.6, smoothstep(1.5, 1.0, e) * (1.0 - loz)), r, 1.0 - grime * 0.8 - rust * 0.9);
}`;
  cn.corrugated = `
void surf(vec2 uv){
  float w = uv.x * 10.0; float cz = 0.5 + 0.5 * cos(w * TAU);
  float big = fbm(uv, vec2(2.0), 4, 1.0), fine = fbm(uv, vec2(160.0, 480.0), 2, 3.0);
  float streak = fbm(uv, vec2(40.0, 1.0), 3, 6.0), streak2 = fbm(uv, vec2(10.0, 1.0), 3, 16.0);
  float lapV = smoothstep(0.004, 0.0015, abs(uv.y - 0.012) * 2.286);
  float lapZone = smoothstep(0.32, 0.0, (uv.y - 0.012) * 2.286) * step(0.012, uv.y);       // drip end of the upper sheet
  float fi = floor(w + 0.5); float onC = step(mod(fi, 5.0), 0.5);
  float fd = length(vec2((w - fi) / 10.0 * 0.762, (uv.y - 0.5) * 2.286));
  float fast = onC * smoothstep(0.008, 0.006, fd), washer = onC * smoothstep(0.014, 0.011, fd) * (1.0 - fast);
  float rg = fbm(uv, vec2(90.0, 270.0), 3, 15.0);
  float which = smoothstep(0.45, 0.7, fbm(uv, vec2(3.0, 1.0), 3, 5.0));
  float rust = smoothstep(0.5, 0.95, lapZone * which * (0.55 + 0.9 * streak) + (rg - 0.5) * 0.22) * (0.5 + 0.5 * rg);
  vec3 col = vec3(0.43, 0.47, 0.52) * (0.9 + 0.2 * (big - 0.5)) * (0.95 + 0.1 * (streak2 - 0.5));
  col = mix(col, vec3(0.6, 0.62, 0.64), smoothstep(0.6, 0.9, streak) * 0.12);
  float dirtV = (1.0 - cz) * smoothstep(0.4, 0.75, fbm(uv, vec2(3.0, 2.0), 4, 7.0)) * 0.5;
  col = mix(col, L(0.25, 0.24, 0.22), dirtV * 0.6);
  col = mix(col, mix(L(0.24, 0.16, 0.12), L(0.42, 0.28, 0.17), rg), rust);
  col = mix(col, vec3(0.5, 0.52, 0.54), fast); col *= 1.0 - washer * 0.4;
  col *= 1.0 - lapV * 0.5;
  float h = cz * 0.9 + (fine - 0.5) * 0.008 + fast * 0.05 - lapV * 0.03;
  float r = 0.5 + (streak2 - 0.5) * 0.14 + (big - 0.5) * 0.12; r = mix(r, 0.8, dirtV); r = mix(r, 0.92, rust);
  emit(col, 1.0, h, mix(0.72, 1.0, smoothstep(0.0, 0.6, cz)) * (1.0 - lapV * 0.4), r, 0.72 * (1.0 - rust * 0.9) * (1.0 - dirtV * 0.6));
}`;
  cn.chainlink = `
void surf(vec2 uv){
  float n = 7.0; float a = (uv.x + uv.y) * n, b = (uv.x - uv.y) * n;
  float da = abs(fract(a) - 0.5), db = abs(fract(b) - 0.5);
  float rw = 0.044;
  float over = mod(floor(a) + floor(b), 2.0) < 0.5 ? 1.0 : -1.0;
  float pa = sqrt(max(0.0, 1.0 - (da / rw) * (da / rw))), pb = sqrt(max(0.0, 1.0 - (db / rw) * (db / rw)));
  float za = over * cos((fract(b) - 0.5) * 3.14159), zb = -over * cos((fract(a) - 0.5) * 3.14159);
  float ha = da < rw ? 0.45 + 0.2 * za + 0.3 * pa : 0.0, hb = db < rw ? 0.45 + 0.2 * zb + 0.3 * pb : 0.0;
  float px = uTexel * n * 1.41421;
  float alpha = max(smoothstep(rw + px * 0.5, rw - px * 0.5, da), smoothstep(rw + px * 0.5, rw - px * 0.5, db));
  float fine = fbm(uv, vec2(120.0), 3, 1.0);
  vec3 col = vec3(0.6, 0.62, 0.64) * (0.8 + 0.3 * fine);
  float rust = smoothstep(0.62, 0.75, fbm(uv, vec2(9.0), 4, 3.0)); col = mix(col, L(0.42, 0.26, 0.15), rust * 0.8);
  emit(col, alpha, max(ha, hb), 1.0, mix(0.4 + 0.2 * fine, 0.9, rust), 1.0 - rust * 0.9);
}`;
  cn.gunmetal = `
void surf(vec2 uv){
  float fine = fbm(uv, vec2(160.0), 3, 1.0), mid = fbm(uv, vec2(12.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  vec4 g = vor(uv * 200.0, vec2(200.0), 4.0);
  float wear = smoothstep(0.66, 0.92, fbm(uv, vec2(4.0), 5, 5.0) + (fine - 0.5) * 0.1) * uP.x;
  float s1 = scr(uv, 8.0, 6.0, 0.005, 0.3, 6.3, 0.3), s2 = scr(uv, 24.0, 7.0, 0.011, 1.2, 6.3, 0.32), s3 = scr(uv, 60.0, 8.0, 0.03, 0.0, 6.3, 0.3);
  float sc = sat(max(s1 * uP.x, max(s2 * 0.8, s3 * 0.6)));
  float bright = sat(wear * 0.22 + sc * (0.3 + 0.4 * uP.x));
  float oil = smoothstep(0.4, 0.75, fbm(uv, vec2(3.0, 5.0), 4, 9.0));
  vec3 nt = vec3(0.0); float ta = 0.9 * (0.8 + 0.25 * (mid - 0.5) + 0.2 * (g.w - 0.5) + 0.15 * (big - 0.5));
  OV(vec3(0.42, 0.42, 0.44), bright * 0.6);
  float r = 0.58 + (g.w - 0.5) * 0.12 + (mid - 0.5) * 0.1 - oil * 0.14 - wear * 0.14; r = mix(r, 0.3, bright * 0.8);
  float h = 0.5 + (g.x - 0.5) * 0.12 + (fine - 0.5) * 0.1 - sc * 0.25 - wear * 0.05;
  emit(nt, ta, h, 1.0 - sc * 0.1, r, mix(0.75, 1.0, bright));
}`;
  cn.polymer = `
void surf(vec2 uv){
  vec4 g = vor(uv * 40.0, vec2(40.0), 1.0); vec4 g2 = vor(uv * 90.0 + 0.5, vec2(90.0), 2.0);
  float fine = fbm(uv, vec2(120.0), 2, 3.0), big = fbm(uv, vec2(3.0), 4, 4.0);
  float stip = smoothstep(0.6, 0.1, g.x) * (0.5 + 0.5 * g.w) * 0.7 + smoothstep(0.6, 0.1, g2.x) * 0.3;
  float scuff = smoothstep(0.62, 0.8, fbm(uv, vec2(4.0), 5, 5.0));
  float sc = scr(uv, 10.0, 6.0, 0.01, 0.5, 6.3, 0.4);
  vec3 nt = vec3(0.0); float ta = 0.92 * (0.9 + 0.12 * (big - 0.5) + 0.08 * (fine - 0.5));
  OV(vec3(0.45), sc * 0.25 + scuff * 0.06);
  float h = 0.3 + stip * 0.6 * (1.0 - scuff * 0.6) + (fine - 0.5) * 0.05 - sc * 0.2;
  float r = 0.62 + (stip - 0.5) * 0.1 + (big - 0.5) * 0.1 - scuff * 0.22 + sc * 0.1;
  emit(nt, ta, h, 0.8 + 0.2 * stip, r, 0.0);
}`;
  cn.carbon = `
void surf(vec2 uv){
  vec2 p = uv * 12.0; vec2 i = floor(p), q = fract(p);
  float warpTop = step(mod(i.x - i.y + 400.0, 4.0), 1.5);
  float prof = warpTop > 0.5 ? sin(q.x * 3.14159) : sin(q.y * 3.14159);
  float fib = warpTop > 0.5 ? fbm(uv, vec2(240.0, 12.0), 2, 1.0) : fbm(uv, vec2(12.0, 240.0), 2, 5.0);
  float h = 0.35 + 0.5 * pow(prof, 0.6) + (fib - 0.5) * 0.12;
  vec3 col = vec3(0.035, 0.036, 0.04) * (0.7 + 0.6 * fib) * (warpTop > 0.5 ? 1.0 : 0.8);
  float big = fbm(uv, vec2(2.0), 3, 2.0);
  emit(col, 1.0, h, 0.6 + 0.4 * prof, 0.32 + (fib - 0.5) * 0.2 + (big - 0.5) * 0.1, 0.0);
}`;
  cn.fabric = `
void surf(vec2 uv){
  float f = 36.0; vec2 p = uv * f; vec2 i = floor(p), q = fract(p);
  float top = mod(i.x + i.y, 2.0);
  float pw = sin(q.x * 3.14159), pf = sin(q.y * 3.14159);
  float h = top > 0.5 ? pw * (0.6 + 0.4 * pf) : pf * (0.6 + 0.4 * pw) * 0.85;
  float fz = fbm(uv, vec2(150.0), 3, 1.0), big = fbm(uv, vec2(2.0), 4, 2.0);
  float thr = h3(vec2(top > 0.5 ? i.x : i.y, top), vec2(f), 3.0).x;
  float ta = 0.9 * (0.55 + 0.45 * h) * (0.85 + 0.2 * (thr - 0.5) + 0.2 * (fz - 0.5) + 0.2 * (big - 0.5));
  emit(vec3(0.0), ta, 0.2 + h * 0.7 + (fz - 0.5) * 0.15, 0.5 + 0.5 * h, 0.92, 0.0);
}`;
  cn.armor = `
void surf(vec2 uv){
  float chip, stain, run; paintDmg(uv, 0.5, chip, stain, run);
  float fine = fbm(uv, vec2(200.0), 2, 1.0), mid = fbm(uv, vec2(14.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float grime = smoothstep(0.45, 0.8, fbm(uv, vec2(3.0, 4.0), 5, 4.0)); float sc = scr(uv, 14.0, 5.0, 0.008, 0.4, 6.3, 0.5);
  float sub = smoothstep(0.5, 0.75, chip), prim = smoothstep(0.15, 0.4, chip) * (1.0 - sub);
  vec3 nt = vec3(0.0); float ta = 0.85 * (0.92 + 0.14 * (mid - 0.5) + 0.1 * (big - 0.5));
  OV(L(0.2, 0.18, 0.15), grime * 0.07 * (0.5 + fine));
  OV(vec3(0.55), sc * 0.3);
  OV(L(0.5, 0.5, 0.47), prim);
  float wv = fbm(uv, vec2(160.0, 8.0), 2, 6.0);
  OV(L(0.4, 0.38, 0.33) * (0.6 + 0.8 * wv), sub);
  float h = 0.6 + (fine - 0.5) * 0.04 + (mid - 0.5) * 0.03 - prim * 0.1 - sub * 0.25 - sc * 0.08;
  float r = 0.36 + (mid - 0.5) * 0.1 + grime * 0.1 + sc * 0.15; r = mix(r, 0.6, prim); r = mix(r, 0.75, sub);
  emit(nt, ta, h, 1.0 - sub * 0.2, r, 0.0);
}`;
  cn.wood = `
void surf(vec2 uv){
  vec4 kv = vor(uv * vec2(2.0, 4.0), vec2(2.0, 4.0), 1.0); float isK = step(kv.z, 0.3);
  float knot = isK * smoothstep(0.2, 0.0, length((kv.x) * vec2(1.0))), core = isK * smoothstep(0.05, 0.03, kv.x);
  float wob = fbm(uv, vec2(1.0, 3.0), 3, 2.0);
  float ring = fract(uv.y * 44.0 + (wob - 0.5) * 2.4 + knot * knot * 4.0 + (fbm(uv, vec2(4.0, 30.0), 2, 12.0) - 0.5) * 0.35);
  float late = smoothstep(0.5, 0.92, ring) * (1.0 - smoothstep(0.92, 1.0, ring));
  float fib = fbm(uv, vec2(3.0, 260.0), 3, 3.0), fib2 = fbm(uv, vec2(8.0, 90.0), 3, 4.0);
  float saw = 0.5 + 0.5 * sin((uv.x + 0.02 * sin(uv.y * TAU * 2.0)) * TAU * 240.0);
  float sawK = smoothstep(0.35, 0.7, fbm(uv, vec2(3.0), 3, 5.0));
  float grey = smoothstep(0.2, 0.68, fbm(uv, vec2(2.0, 3.0), 5, 6.0));
  float crack = smoothstep(0.84, 0.87, fbm(uv, vec2(2.0, 110.0), 3, 7.0)) * smoothstep(0.45, 0.65, fbm(uv, vec2(5.0, 3.0), 3, 8.0));
  vec3 early = L(0.58, 0.49, 0.38), lateC = L(0.36, 0.28, 0.2);
  float bigv = fbm(uv, vec2(1.0, 2.0), 3, 21.0);
  vec3 col = mix(early, lateC, late * 0.9) * (0.85 + 0.6 * (fib - 0.5) + 0.4 * (fib2 - 0.5)) * (0.78 + 0.44 * bigv);
  col = mix(col, lateC * 0.8, knot * 0.5); col = mix(col, L(0.28, 0.17, 0.09), core);
  col = mix(col, L(0.47, 0.465, 0.45) * (0.7 + 0.6 * fib) * (1.0 - late * 0.3), grey * 0.82);
  float dirt = smoothstep(0.55, 0.85, fbm(uv, vec2(4.0), 5, 9.0)); col *= 1.0 - dirt * 0.35;
  col *= 1.0 - crack * 0.55;
  float h = 0.5 + (fib - 0.5) * 0.4 + (late - 0.5) * 0.2 - (saw - 0.5) * 0.12 * sawK + (fib2 - 0.5) * 0.15 - crack * 0.3 + core * 0.05;
  emit(col, 1.0, h, 1.0 - crack * 0.5, 0.82 + (fib - 0.5) * 0.15 + grey * 0.08 - core * 0.15, 0.0);
}`;
  cn.plastic = `
void surf(vec2 uv){
  float fine = fbm(uv, vec2(220.0), 3, 1.0), mid = fbm(uv, vec2(14.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float scuff = smoothstep(0.55, 0.75, fbm(uv, vec2(5.0, 8.0), 5, 4.0));
  float s1 = scr(uv, 7.0, 5.0, 0.005, 0.2, 6.3, 0.35), s2 = scr(uv, 22.0, 6.0, 0.012, 1.0, 6.3, 0.3), s3 = scr(uv, 50.0, 7.0, 0.03, 2.0, 6.3, 0.25);
  float sc = sat(max(s1, max(s2 * 0.8, s3 * 0.5)));
  float dirt = smoothstep(0.5, 0.85, fbm(uv, vec2(3.0), 5, 8.0));
  vec3 nt = vec3(0.0); float ta = 0.9 * (0.92 + 0.1 * (mid - 0.5) + 0.1 * (big - 0.5));
  OV(vec3(0.6), sc * 0.22 + scuff * 0.03 * fine);
  OV(L(0.25, 0.22, 0.18), dirt * 0.4);
  float h = 0.5 + (fine - 0.5) * 0.12 + (mid - 0.5) * 0.04 - sc * 0.25;
  emit(nt, ta, h, 1.0, 0.42 + (fine - 0.5) * 0.08 + scuff * 0.2 + sc * 0.2 + dirt * 0.2, 0.0);
}`;
  cn.tarp = `
void surf(vec2 uv){
  vec2 wu = uv + (vec2(fbm(uv, vec2(2.0), 3, 1.0), fbm(uv, vec2(2.0), 3, 2.0)) - 0.5) * 0.12;
  float f1 = 1.0 - abs(gn(wu * vec2(2.0, 7.0), vec2(2.0, 7.0), 3.0)) * 2.4;        // long drape folds
  float f2 = 1.0 - abs(gn(wu * vec2(5.0, 13.0) + 2.0, vec2(5.0, 13.0), 4.0)) * 2.4; // finer wrinkles
  f1 = smoothstep(0.0, 1.0, sat(f1)); f2 = smoothstep(0.2, 1.0, sat(f2));
  float bill = fbm(wu, vec2(2.0, 3.0), 3, 5.0);
  float scrim = max(smoothstep(0.42, 0.5, abs(fract(uv.x * 200.0) - 0.5)), smoothstep(0.42, 0.5, abs(fract(uv.y * 200.0) - 0.5)));
  float fine = fbm(uv, vec2(240.0), 2, 6.0), mid = fbm(uv, vec2(14.0), 4, 7.0);
  float h = 0.25 + bill * 0.35 + f1 * 0.22 + f2 * 0.07 + scrim * 0.02 + (fine - 0.5) * 0.012;
  float dirt = smoothstep(0.5, 0.85, fbm(uv, vec2(4.0), 5, 8.0) + (0.5 - f1) * 0.08);
  vec3 nt = vec3(0.0); float ta = 0.9 * (0.88 + 0.14 * (mid - 0.5)) * (1.0 - scrim * 0.06);
  OV(vec3(0.5), smoothstep(0.85, 1.0, f1) * 0.03);
  OV(L(0.3, 0.27, 0.22), dirt * 0.3);
  emit(nt, ta, h, 0.9 + 0.1 * smoothstep(0.1, 0.7, f1), 0.48 + (mid - 0.5) * 0.15 + dirt * 0.25, 0.0);
}`;
  cn.cardboard = `
void surf(vec2 uv){
  float fl = 0.5 + 0.5 * cos(uv.y * TAU * 140.0);
  float fib = fbm(uv, vec2(40.0, 160.0), 3, 1.0), fine = fbm(uv, vec2(250.0), 2, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float sn = fbm(uv, vec2(3.0), 5, 4.0); float damp = smoothstep(0.62, 0.72, sn); float tide = smoothstep(0.61, 0.64, sn) * (1.0 - smoothstep(0.64, 0.7, sn));
  float crease = smoothstep(0.012, 0.004, abs(fbm(uv, vec2(2.0), 2, 5.0) - 0.5)) * smoothstep(0.5, 0.7, fbm(uv, vec2(3.0), 2, 6.0));
  vec3 col = L(0.66, 0.52, 0.36) * (0.85 + 0.2 * (fib - 0.5) + 0.12 * (fine - 0.5) + 0.2 * (big - 0.5)) * (0.97 + 0.06 * fl);
  col *= (1.0 - damp * 0.3) * (1.0 - tide * 0.18); col = mix(col, col * 1.25, crease * 0.5);
  col *= 1.0 - smoothstep(0.8, 0.9, fbm(uv, vec2(120.0), 2, 7.0)) * 0.2;
  float h = 0.5 + (fl - 0.5) * 0.12 + (fib - 0.5) * 0.15 + (fine - 0.5) * 0.08 - crease * 0.3 + damp * 0.2 * (fbm(uv, vec2(20.0), 3, 8.0) - 0.5);
  emit(col, 1.0, h, 1.0 - crease * 0.3, 0.9 - damp * 0.2 + (fib - 0.5) * 0.1, 0.0);
}`;
  cn.rope = `
void surf(vec2 uv){
  float a = (uv.x + uv.y) * 4.0; float prof = sin(fract(a) * 3.14159);
  float fib = fbm(uv, vec2(60.0), 3, 1.0);
  float yarn = 0.5 + 0.5 * sin((uv.x - uv.y) * 4.0 * TAU * 5.0 + 2.0 * sin(a * TAU));
  float h = pow(prof, 0.7) * 0.8 + yarn * 0.1 + (fib - 0.5) * 0.15;
  vec3 col = L(0.66, 0.6, 0.46) * (0.6 + 0.4 * prof) * (0.85 + 0.3 * (fib - 0.5)) * (0.92 + 0.16 * yarn);
  float dirt = smoothstep(0.4, 0.8, fbm(uv, vec2(3.0), 4, 2.0)); col = mix(col, L(0.25, 0.22, 0.18), dirt * 0.5 * (1.0 - prof * 0.5));
  emit(col, 1.0, h, 0.45 + 0.55 * prof, 0.95, 0.0);
}`;
  cn.tire = `
void surf(vec2 uv){
  float sv = fract(uv.y + 0.5) - 0.5; float v = abs(sv) * 2.0; float u = uv.x;
  float zig = 0.03 * abs(fract(u * 10.0) - 0.5) * 2.0;
  float g1 = smoothstep(0.035, 0.02, abs(v - 0.36 - zig)), g0 = smoothstep(0.03, 0.018, abs(v - zig * 0.5));
  float lat = smoothstep(0.06, 0.03, abs(fract(u * 10.0 + v * 1.2 * sign(sv)) - 0.5)) * step(0.4, v) * step(v, 0.8);
  float sipe = smoothstep(0.012, 0.005, abs(fract(u * 20.0 + v * 0.8) - 0.5)) * step(0.05, v) * step(v, 0.33);
  float groove = sat(max(max(g0, g1), max(lat, sipe * 0.6)));
  float side = smoothstep(0.84, 0.9, v);
  float rib = (0.5 + 0.5 * cos(v * TAU * 14.0)) * side;
  float fine = fbm(uv, vec2(200.0, 120.0), 3, 1.0), mid = fbm(uv, vec2(10.0, 6.0), 4, 2.0);
  float h = (1.0 - groove) * (1.0 - side) * 0.8 + side * (0.35 + rib * 0.1) + (fine - 0.5) * 0.04;
  float dust = smoothstep(0.4, 0.75, fbm(uv, vec2(4.0, 3.0), 5, 3.0));
  vec3 col = vec3(0.022) * (0.8 + 0.5 * (mid - 0.5)); col = mix(col, L(0.22, 0.2, 0.17), dust * 0.25 + groove * (1.0 - side) * 0.2);
  emit(col, 1.0, h, 1.0 - groove * 0.5 * (1.0 - side), 0.85 + (fine - 0.5) * 0.1 - side * 0.1, 0.0);
}`;
  cn.glass = `
void surf(vec2 uv){
  float d = uP.x;
  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(12.0), 4, 2.0), fine = fbm(uv, vec2(200.0), 2, 3.0);
  float dust = sat(smoothstep(0.75 - 0.45 * d, 0.95 - 0.3 * d, big * 0.7 + mid * 0.3) + fine * 0.15 * d);
  float st2 = fbm(uv, vec2(120.0, 3.0), 2, 5.0);
  float trail = smoothstep(0.62, 0.72, fbm(uv, vec2(50.0, 1.0), 2, 4.0)) * smoothstep(0.3, 0.6, fbm(uv, vec2(50.0, 2.0), 2, 6.0));
  vec4 dv = vor(uv * 60.0, vec2(60.0), 7.0); float drop = step(dv.z, 0.45) * smoothstep(0.32 * dv.w + 0.06, 0.0, dv.x);
  vec4 dv2 = vor(uv * 150.0, vec2(150.0), 8.0); float drop2 = step(dv2.z, 0.5) * smoothstep(0.3 * dv2.w + 0.05, 0.0, dv2.x);
  dust *= 1.0 - trail * 0.7;
  vec3 col = mix(L(0.5, 0.6, 0.62) * 0.25, L(0.5, 0.47, 0.4), dust);
  float alpha = mix(0.16, 0.55 + 0.35 * d, dust) + drop * 0.08 + (st2 - 0.5) * 0.05 * d;
  float h = 0.3 + drop * 0.5 + drop2 * 0.15 + trail * 0.06 * st2;
  float r = mix(0.03, 0.55, dust); r = mix(r, 0.03, sat(drop * 2.0));
  emit(col, alpha, h, 1.0, r, 0.0);
}`;
  cn.water = `
void surf(vec2 uv){
  float a = fbm(uv, vec2(6.0, 10.0), 4, 1.0), b = fbm(uv + 0.3, vec2(20.0, 30.0), 3, 2.0);
  emit(L(0.1, 0.16, 0.18) * 0.5, 1.0, 0.5 + (a - 0.5) * 0.6 + (b - 0.5) * 0.2, 1.0, 0.06, 0.0);
}`;
  export var l_ = `
precision highp float;
uniform sampler2D tH; uniform vec2 uK; uniform float uTexel; in vec2 vUv; out vec4 o;
float H(vec2 uv){ vec4 t = texture(tH, uv); return t.r + t.g / 255.0; }
void main(){
  vec2 e = vec2(uTexel, 0.0);
  float l = H(vUv - e.xy), r = H(vUv + e.xy), d = H(vUv - e.yx), u = H(vUv + e.yx);
  float ld = H(vUv - e.xx), rd = H(vUv + vec2(e.x, -e.x)), lu = H(vUv + vec2(-e.x, e.x)), ru = H(vUv + e.xx);
  float gx = (r - l) * 0.5 + (ru + rd - lu - ld) * 0.25, gy = (u - d) * 0.5 + (ru + lu - rd - ld) * 0.25;
  vec3 n = normalize(vec3(-gx * uK.x, -gy * uK.y, 1.0));
  o = vec4(n * 0.5 + 0.5, 1.0);
}`,
    c_ = `
precision highp float;
uniform sampler2D tA; uniform float uSq; in vec2 vUv; out vec4 o;
void main(){ vec4 t = texture(tA, vUv); o = uSq > 0.5 ? vec4(t.rgb * t.rgb, t.a) : t; }`;
  export var u_ = '"Big Shoulders Display", "Barlow Condensed", "Arial Narrow", Impact, "Helvetica Neue", Arial, sans-serif',
    f_ = '"Barlow Condensed", "Arial Narrow", "Helvetica Neue", Arial, sans-serif',
    sk = '"IBM Plex Mono", "DejaVu Sans Mono", Menlo, Consolas, monospace',
    i0 = {
      white: [226, 223, 213],
      black: [24, 24, 26],
      yellow: [222, 172, 30],
      red: [168, 36, 28],
      navy: [24, 38, 58],
      orange: [206, 100, 30],
    },
    un = (n, e = 1) => `rgba(${n[0]},${n[1]},${n[2]},${e})`,
    ok = new Set(["I", "1", " ", "-", ".", "/", ":", ",", "'", "!", "\xB7"]);
  export function rk(n) {
    let e = n >>> 0;
    return () => {
      ((e |= 0), (e = (e + 1831565813) | 0));
      let t = Math.imul(e ^ (e >>> 15), 1 | e);
      return ((t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t), ((t ^ (t >>> 14)) >>> 0) / 4294967296);
    };
  }
  export function ak(n) {
    let e = 2166136261;
    for (let t = 0; t < n.length; t++) ((e ^= n.charCodeAt(t)), (e = Math.imul(e, 16777619)));
    return e >>> 0;
  }
  export function av(n, e) {
    let t = document.createElement("canvas");
    return ((t.width = n), (t.height = e), t);
  }
  export function Da(n, e, t, i, s, o = 0.35, r = 9) {
    n.beginPath();
    for (let a = 0; a < r; a++) {
      let l = (a / r) * Math.PI * 2,
        c = i * (1 - o + s() * o * 2),
        u = e + Math.cos(l) * c,
        f = t + Math.sin(l) * c;
      a ? n.lineTo(u, f) : n.moveTo(u, f);
    }
    n.closePath();
  }
  export function lo(n, e, t, i, s) {
    if (i <= 0) return;
    (n.save(), (n.globalCompositeOperation = "destination-out"));
    let o = Math.floor((i * e * t) / 700);
    for (let r = 0; r < o; r++) {
      let a = Math.pow(s(), 3) * t * 0.09 + 0.6;
      ((n.globalAlpha = 0.45 + s() * 0.55), Da(n, s() * e, s() * t, a, s, 0.5, 7), n.fill());
    }
    n.lineCap = "round";
    for (let r = 0; r < i * 16; r++) {
      let a = s() * e,
        l = s() * t,
        c = (s() - 0.5) * 0.7,
        u = (0.1 + s() * 0.5) * e;
      ((n.globalAlpha = 0.5 + s() * 0.5),
        (n.lineWidth = 0.5 + s() * s() * 3),
        n.beginPath(),
        n.moveTo(a, l),
        n.lineTo(a + Math.cos(c) * u, l + Math.sin(c) * u),
        n.stroke());
    }
    n.globalAlpha = 0.8;
    for (let r = 0; r < (i * e * t) / 60; r++) n.fillRect(s() * e, s() * t, 1 + s(), 1 + s());
    for (let r = 0; r < i * 6; r++) {
      let a = s() * e,
        l = s() * t,
        c = (0.1 + s() * 0.25) * t,
        u = n.createRadialGradient(a, l, 0, a, l, c);
      (u.addColorStop(0, "rgba(0,0,0," + (0.25 + s() * 0.4) + ")"),
        u.addColorStop(1, "rgba(0,0,0,0)"),
        (n.globalAlpha = 1),
        (n.fillStyle = u),
        n.fillRect(a - c, l - c, c * 2, c * 2));
    }
    n.restore();
  }
  export function h_(n, e, t, i, s, o) {
    n.font = `${s} ${t}px ${i}`;
    let r = 0;
    for (let a of e) r += n.measureText(a).width + o;
    return r - o;
  }
  export function zl(n, e, t, i, s, o, r = {}) {
    let a = r.font === "sans" ? f_ : r.font === "mono" ? sk : u_,
      l = r.weight || 700,
      c = r.spacing !== void 0 ? r.spacing : s * 0.06,
      u = r.font !== "sans" && r.font !== "mono" && r.bridges !== !1,
      f = h_(n, e, s, a, l, c),
      h = r.maxW && f > r.maxW ? r.maxW / f : r.fitW ? r.fitW / f : 1,
      p = av(Math.ceil(f * h) + 8, Math.ceil(s * 1.4)),
      d = p.getContext("2d");
    ((d.font = `${l} ${s}px ${a}`), (d.textBaseline = "alphabetic"), (d.fillStyle = o), d.scale(h, 1));
    let m = 4 / h,
      x = s * 1.08;
    for (let y of e) {
      let b = d.measureText(y).width;
      (d.fillText(y, m, x),
        u &&
          !ok.has(y) &&
          (d.save(),
          (d.globalCompositeOperation = "destination-out"),
          d.fillRect(m + b * 0.5 - s * 0.032, 0, s * 0.064, s * 1.4),
          d.restore()),
        (m += b + c));
    }
    let v = r.align === "center" ? t - (f * h) / 2 : r.align === "right" ? t - f * h : t;
    return (n.drawImage(p, v - 4, i - x), f * h);
  }
  export function d_(n, e = 4) {
    let t = new Map(),
      i = [],
      s = 0;
    function o(m, x = {}) {
      let v = new Rs(m);
      ((v.colorSpace = In), (v.anisotropy = e), (v.generateMipmaps = !0), (v.minFilter = yn), (s += m.width * m.height * 4 * 1.34));
      let y = new L0({
        map: v,
        transparent: !0,
        depthWrite: !1,
        polygonOffset: !0,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        roughness: x.rough !== void 0 ? x.rough : 0.7,
        metalness: x.metal || 0,
        opacity: x.opacity !== void 0 ? x.opacity : 1,
      });
      return ((y.name = "decal"), x.doubleSide && (y.side = ln), { material: y, aspect: m.width / m.height, texture: v });
    }
    function r(m, x, v, y, b = {}) {
      let g = av(x, v),
        E = g.getContext("2d"),
        M = () => {
          (E.setTransform(1, 0, 0, 1, 0, 0),
            E.clearRect(0, 0, x, v),
            (E.globalAlpha = 1),
            (E.globalCompositeOperation = "source-over"),
            b.bleed && ((E.fillStyle = un(b.bleed, 0.012)), E.fillRect(0, 0, x, v)),
            y(E, x, v, rk(ak(m) + 17)));
        };
      M();
      let _ = o(g, b);
      return (
        b.text &&
          i.push(() => {
            (M(), (_.texture.needsUpdate = !0));
          }),
        _
      );
    }
    function a(m, x, v, y) {
      ((m.lineJoin = "round"),
        m.beginPath(),
        m.moveTo(x / 2, v * 0.12),
        m.lineTo(x * 0.9, v * 0.84),
        m.lineTo(x * 0.1, v * 0.84),
        m.closePath(),
        (m.lineWidth = x * 0.11),
        (m.strokeStyle = un(i0.black)),
        m.stroke(),
        (m.fillStyle = y),
        m.fill(),
        (m.lineWidth = x * 0.035),
        (m.strokeStyle = un(i0.black)),
        m.stroke());
    }
    function l(m, x, v, y, b, g, E, M) {
      m.fillStyle = m.strokeStyle = un(y);
      let _ = v;
      (m.save(),
        m.translate(_ * 0.5, _ * 0.5),
        b(m, _ * 0.38, un(M || y)),
        m.restore(),
        zl(m, g, _ * 1, v * 0.6, v * 0.42, un(y), { weight: 900, bridges: !1, maxW: x - _ * 1.05, spacing: v * 0.012 }),
        (m.fillStyle = un(M || y)),
        m.fillRect(_ * 1, v * 0.67, x - _ * 1.12, v * 0.022),
        zl(m, E, _ * 1, v * 0.84, v * 0.115, un(y), { font: "sans", weight: 600, spacing: v * 0.035, maxW: x - _ * 1.1 }));
    }
    let c = {
        hazard_flammable: () =>
          r(
            "hazard_flammable",
            256,
            256,
            (m, x, v, y) => {
              (m.save(),
                m.translate(x / 2, v / 2),
                m.rotate(Math.PI / 4),
                (m.fillStyle = un(i0.red)),
                m.fillRect(-86, -86, 172, 172),
                (m.strokeStyle = un(i0.white)),
                (m.lineWidth = 5),
                m.strokeRect(-76, -76, 152, 152),
                m.restore(),
                m.save(),
                m.translate(x / 2, v / 2 - 8),
                (m.fillStyle = un(i0.white)),
                m.beginPath(),
                m.moveTo(2, -64),
                m.bezierCurveTo(34, -28, 40, 6, 24, 28),
                m.bezierCurveTo(12, 44, -12, 44, -24, 28),
                m.bezierCurveTo(-40, 6, -20, -12, -15, -34),
                m.bezierCurveTo(-6, -28, 0, -44, 2, -64),
                m.fill(),
                (m.fillStyle = un(i0.red)),
                m.beginPath(),
                m.moveTo(1, -10),
                m.bezierCurveTo(15, 6, 15, 24, 0, 31),
                m.bezierCurveTo(-15, 24, -13, 8, 1, -10),
                m.fill(),
                (m.fillStyle = un(i0.white)),
                m.fillRect(-34, 50, 68, 6),
                m.restore(),
                zl(m, "3", x / 2, v * 0.9, 34, un(i0.white), { align: "center", weight: 900, bridges: !1 }),
                lo(m, x, v, 0.3, y));
            },
            { bleed: i0.red, text: !0 },
          ),
        hazard_voltage: () =>
          r(
            "hazard_voltage",
            256,
            256,
            (m, x, v, y) => {
              (a(m, x, v, un(i0.yellow)),
                (m.fillStyle = un(i0.black)),
                m.save(),
                m.translate(x / 2, v * 0.56),
                m.beginPath(),
                [
                  [12, -58],
                  [-24, 4],
                  [-3, 4],
                  [-16, 50],
                  [26, -14],
                  [5, -14],
                  [22, -58],
                ].forEach((b, g) => (g ? m.lineTo(b[0], b[1]) : m.moveTo(b[0], b[1]))),
                m.closePath(),
                m.fill(),
                m.restore(),
                lo(m, x, v, 0.3, y));
            },
            { bleed: i0.yellow },
          ),
        hazard_general: () =>
          r(
            "hazard_general",
            256,
            256,
            (m, x, v, y) => {
              (a(m, x, v, un(i0.yellow)),
                (m.fillStyle = un(i0.black)),
                m.beginPath(),
                m.moveTo(x / 2 - 13, v * 0.34),
                m.lineTo(x / 2 + 13, v * 0.34),
                m.lineTo(x / 2 + 7, v * 0.62),
                m.lineTo(x / 2 - 7, v * 0.62),
                m.closePath(),
                m.fill(),
                m.beginPath(),
                m.arc(x / 2, v * 0.715, 11, 0, 7),
                m.fill(),
                lo(m, x, v, 0.3, y));
            },
            { bleed: i0.yellow },
          ),
        arrow: () =>
          r(
            "arrow",
            384,
            192,
            (m, x, v, y) => {
              ((m.fillStyle = un(i0.white)),
                m.beginPath(),
                [
                  [20, 68],
                  [226, 68],
                  [226, 22],
                  [364, 96],
                  [226, 170],
                  [226, 124],
                  [20, 124],
                ].forEach((b, g) => (g ? m.lineTo(b[0], b[1]) : m.moveTo(b[0], b[1]))),
                m.closePath(),
                m.fill(),
                (m.globalCompositeOperation = "destination-out"),
                m.fillRect(118, 0, 9, v),
                m.fillRect(232, 0, 7, v),
                (m.globalCompositeOperation = "source-over"),
                lo(m, x, v, 0.5, y));
            },
            { bleed: i0.white },
          ),
        no_entry: () =>
          r(
            "no_entry",
            256,
            256,
            (m, x, v, y) => {
              ((m.fillStyle = un(i0.white)),
                m.beginPath(),
                m.arc(128, 128, 112, 0, 7),
                m.fill(),
                (m.fillStyle = un(i0.red)),
                m.beginPath(),
                m.arc(128, 128, 102, 0, 7),
                m.fill(),
                (m.fillStyle = un(i0.white)),
                m.fillRect(52, 106, 152, 44),
                lo(m, x, v, 0.3, y));
            },
            { bleed: i0.red },
          ),
        logo_a: () =>
          r(
            "logo_a",
            640,
            192,
            (m, x, v, y) => {
              (l(
                m,
                x,
                v,
                i0.white,
                (b, g, E) => {
                  ((b.lineWidth = g * 0.13),
                    b.beginPath(),
                    b.arc(0, 0, g * 0.92, 0.25 * Math.PI, 1.75 * Math.PI),
                    b.stroke(),
                    b.beginPath(),
                    b.moveTo(0, -g * 1.08),
                    b.lineTo(g * 0.26, 0),
                    b.lineTo(0, g * 0.62),
                    b.lineTo(-g * 0.26, 0),
                    b.closePath(),
                    b.fill(),
                    b.beginPath(),
                    b.moveTo(g * 0.5, 0),
                    b.lineTo(g * 1.12, -g * 0.1),
                    b.lineTo(g * 1.12, g * 0.1),
                    b.closePath(),
                    b.fill());
                },
                "NORDKAP LINE",
                "ARCTIC  \xB7  ATLANTIC  \xB7  FEEDER",
              ),
                lo(m, x, v, 0.35, y));
            },
            { bleed: i0.white, text: !0 },
          ),
        logo_b: () =>
          r(
            "logo_b",
            640,
            192,
            (m, x, v, y) => {
              (l(
                m,
                x,
                v,
                i0.white,
                (b, g, E) => {
                  b.fillStyle = E;
                  for (let M = 0; M < 2; M++) {
                    let _ = -g * 0.35 + M * g * 0.55,
                      T = g * (0.3 - M * 0.06);
                    (b.beginPath(),
                      b.moveTo(-g * 1.05, _ - g * 0.25),
                      b.quadraticCurveTo(-g * 0.3, _ - g * 0.2, 0, _ + g * 0.35),
                      b.quadraticCurveTo(g * 0.3, _ - g * 0.2, g * 1.05, _ - g * 0.25),
                      b.quadraticCurveTo(g * 0.35, _ + T * 0.2, 0, _ + g * 0.35 + T),
                      b.quadraticCurveTo(-g * 0.35, _ + T * 0.2, -g * 1.05, _ - g * 0.25),
                      b.fill());
                  }
                },
                "TERN OCEANIC",
                "CONTAINER SERVICES",
                i0.orange,
              ),
                lo(m, x, v, 0.35, y));
            },
            { bleed: i0.white, text: !0 },
          ),
        logo_c: () =>
          r(
            "logo_c",
            640,
            192,
            (m, x, v, y) => {
              (l(
                m,
                x,
                v,
                i0.navy,
                (b, g, E) => {
                  (b.beginPath(),
                    b.arc(0, g * 0.25, g * 0.55, Math.PI, 0),
                    b.closePath(),
                    b.fill(),
                    (b.lineWidth = g * 0.1),
                    (b.lineCap = "butt"));
                  for (let M = 0; M < 7; M++) {
                    let _ = Math.PI + ((M + 0.5) / 7) * Math.PI;
                    (b.beginPath(),
                      b.moveTo(Math.cos(_) * g * 0.7, g * 0.25 + Math.sin(_) * g * 0.7),
                      b.lineTo(Math.cos(_) * g * 1.05, g * 0.25 + Math.sin(_) * g * 1.05),
                      b.stroke());
                  }
                  (b.fillRect(-g * 1.05, g * 0.42, g * 2.1, g * 0.13), b.fillRect(-g * 0.8, g * 0.68, g * 1.6, g * 0.1));
                },
                "AUREL PACIFIC",
                "DEEP SEA  \xB7  REEFER  \xB7  BULK",
              ),
                lo(m, x, v, 0.35, y));
            },
            { bleed: i0.navy, text: !0 },
          ),
        logo_d: () =>
          r(
            "logo_d",
            640,
            192,
            (m, x, v, y) => {
              (l(
                m,
                x,
                v,
                i0.white,
                (b, g, E) => {
                  (b.fillRect(-g, -g, g * 0.5, g * 2),
                    b.fillRect(g * 0.5, -g, g * 0.5, g * 2),
                    b.fillRect(-g, -g * 0.2, g * 2, g * 0.4),
                    (b.fillStyle = E),
                    b.fillRect(-g * 0.32, -g, g * 0.64, g * 0.5),
                    b.fillRect(-g * 0.32, g * 0.5, g * 0.64, g * 0.5));
                },
                "HOLMGARD",
                "INTERMODAL  FREIGHT",
                i0.yellow,
              ),
                lo(m, x, v, 0.35, y));
            },
            { bleed: i0.white, text: !0 },
          ),
        berth4: () =>
          r(
            "berth4",
            640,
            224,
            (m, x, v, y) => {
              ((m.strokeStyle = un(i0.yellow)),
                (m.lineWidth = 12),
                m.strokeRect(14, 14, x - 28, v - 28),
                (m.globalCompositeOperation = "destination-out"));
              for (let b of [x * 0.25, x * 0.75]) m.fillRect(b - 6, 0, 12, v);
              ((m.globalCompositeOperation = "source-over"),
                zl(m, "BERTH 4", x / 2, v * 0.76, v * 0.66, un(i0.yellow), { align: "center", weight: 900, maxW: x - 80 }),
                lo(m, x, v, 0.55, y));
            },
            { bleed: i0.yellow, text: !0 },
          ),
        caution_stripes: () =>
          r(
            "caution_stripes",
            512,
            128,
            (m, x, v, y) => {
              ((m.fillStyle = un(i0.black)),
                m.fillRect(0, 8, x, v - 16),
                m.save(),
                m.beginPath(),
                m.rect(0, 8, x, v - 16),
                m.clip(),
                (m.fillStyle = un(i0.yellow)));
              for (let b = -v; b < x + v; b += 64)
                (m.beginPath(), m.moveTo(b, v), m.lineTo(b + 32, v), m.lineTo(b + 32 + v, 0), m.lineTo(b + v, 0), m.closePath(), m.fill());
              (m.restore(), lo(m, x, v, 0.5, y));
            },
            { bleed: i0.black },
          ),
        grime_streak: () =>
          r(
            "grime_streak",
            128,
            256,
            (m, x, v, y) => {
              for (let b = 0; b < 46; b++) {
                let g = x * (0.12 + 0.76 * (y() * 0.5 + y() * 0.5)),
                  E = v * (0.25 + y() * 0.7),
                  M = 1.5 + y() * y() * 12,
                  _ = 0.05 + y() * 0.16,
                  T = m.createLinearGradient(0, 0, 0, E);
                (T.addColorStop(0, `rgba(26,23,19,${_})`),
                  T.addColorStop(0.15, `rgba(26,23,19,${_ * 1.3})`),
                  T.addColorStop(1, "rgba(26,23,19,0)"),
                  (m.fillStyle = T),
                  m.fillRect(g - M / 2 + (y() - 0.5) * 2, 0, M, E));
              }
            },
            { rough: 0.85, bleed: [26, 23, 19] },
          ),
        rust_run: () =>
          r(
            "rust_run",
            128,
            256,
            (m, x, v, y) => {
              for (let b = 0; b < 40; b++) {
                let g = x * (0.2 + 0.6 * (y() * 0.5 + y() * 0.5)),
                  E = v * (0.2 + y() * 0.75),
                  M = 1.2 + y() * y() * 9,
                  _ = 0.08 + y() * 0.22,
                  T = y() < 0.5 ? "118,52,18" : "150,78,26",
                  w = m.createLinearGradient(0, 8, 0, E);
                (w.addColorStop(0, `rgba(${T},${_ * 1.4})`),
                  w.addColorStop(0.3, `rgba(${T},${_})`),
                  w.addColorStop(1, `rgba(${T},0)`),
                  (m.fillStyle = w),
                  m.fillRect(g - M / 2, 8, M, E));
              }
              for (let b = 0; b < 9; b++)
                ((m.fillStyle = `rgba(${y() < 0.5 ? "70,30,14" : "104,44,16"},${0.5 + y() * 0.4})`),
                  Da(m, x * (0.3 + y() * 0.4), 6 + y() * 12, 3 + y() * 8, y, 0.5, 7),
                  m.fill());
            },
            { rough: 0.9, bleed: [118, 52, 18] },
          ),
        oil_stain: () =>
          r(
            "oil_stain",
            256,
            256,
            (m, x, v, y) => {
              for (let b = 0; b < 26; b++) {
                let g = y() * 7,
                  E = Math.pow(y(), 1.5) * x * 0.26,
                  M = x / 2 + Math.cos(g) * E,
                  _ = v / 2 + Math.sin(g) * E * 0.8,
                  T = x * (0.06 + y() * 0.16),
                  w = m.createRadialGradient(M, _, T * 0.2, M, _, T);
                (w.addColorStop(0, `rgba(10,10,11,${0.35 + y() * 0.3})`),
                  w.addColorStop(0.75, "rgba(12,11,10,0.22)"),
                  w.addColorStop(1, "rgba(12,11,10,0)"),
                  (m.fillStyle = w),
                  m.fillRect(M - T, _ - T, T * 2, T * 2));
              }
              for (let b = 0; b < 30; b++) {
                m.fillStyle = `rgba(10,10,11,${0.3 + y() * 0.4})`;
                let g = y() * 7,
                  E = x * (0.25 + y() * 0.2);
                (m.beginPath(), m.arc(x / 2 + Math.cos(g) * E, v / 2 + Math.sin(g) * E, 1 + y() * 4, 0, 7), m.fill());
              }
            },
            { rough: 0.12, bleed: [10, 10, 11] },
          ),
        leak_stain: () =>
          r(
            "leak_stain",
            192,
            256,
            (m, x, v, y) => {
              for (let b = 0; b < 18; b++) {
                let g = x * (0.3 + y() * 0.4),
                  E = v * (0.12 + y() * 0.2),
                  M = x * (0.1 + y() * 0.2),
                  _ = m.createRadialGradient(g, E, M * 0.5, g, E, M);
                (_.addColorStop(0, "rgba(150,146,130,0.0)"),
                  _.addColorStop(0.8, `rgba(168,162,140,${0.18 + y() * 0.2})`),
                  _.addColorStop(1, "rgba(168,162,140,0)"),
                  (m.fillStyle = _),
                  m.fillRect(g - M, E - M, M * 2, M * 2));
              }
              for (let b = 0; b < 22; b++) {
                let g = x * (0.25 + 0.5 * y()),
                  E = v * (0.3 + y() * 0.6),
                  M = 2 + y() * 9,
                  _ = 0.08 + y() * 0.16,
                  T = y() < 0.6 ? "160,154,132" : "60,66,52",
                  w = m.createLinearGradient(0, v * 0.2, 0, v * 0.2 + E);
                (w.addColorStop(0, `rgba(${T},${_})`), w.addColorStop(1, `rgba(${T},0)`), (m.fillStyle = w), m.fillRect(g, v * 0.2, M, E));
              }
            },
            { rough: 0.8, bleed: [160, 154, 132] },
          ),
        bullet_metal: () =>
          r(
            "bullet_metal",
            128,
            128,
            (m, x, v, y) => {
              ((m.fillStyle = "rgba(96,52,40,0.9)"),
                Da(m, 64, 64, 30, y, 0.4, 11),
                m.fill(),
                (m.fillStyle = "rgba(150,152,156,0.95)"),
                Da(m, 64, 64, 22, y, 0.3, 12),
                m.fill(),
                (m.strokeStyle = "rgba(205,207,210,0.9)"),
                (m.lineWidth = 1));
              for (let g = 0; g < 14; g++) {
                let E = y() * 7;
                (m.beginPath(),
                  m.moveTo(64 + Math.cos(E) * 9, 64 + Math.sin(E) * 9),
                  m.lineTo(64 + Math.cos(E) * (16 + y() * 10), 64 + Math.sin(E) * (16 + y() * 10)),
                  m.stroke());
              }
              let b = m.createRadialGradient(64, 64, 2, 64, 64, 12);
              (b.addColorStop(0, "rgba(4,4,5,1)"),
                b.addColorStop(0.75, "rgba(10,10,12,1)"),
                b.addColorStop(1, "rgba(70,72,76,0.9)"),
                (m.fillStyle = b),
                Da(m, 64, 64, 12, y, 0.15, 12),
                m.fill(),
                (m.strokeStyle = "rgba(230,232,235,0.85)"),
                (m.lineWidth = 1.5),
                m.beginPath(),
                m.arc(64, 64, 12.5, 3.6, 5.6),
                m.stroke());
            },
            { rough: 0.4, metal: 0.8, bleed: [96, 52, 40] },
          ),
        bullet_concrete: () =>
          r(
            "bullet_concrete",
            128,
            128,
            (m, x, v, y) => {
              let b = m.createRadialGradient(64, 64, 20, 64, 64, 60);
              (b.addColorStop(0, "rgba(176,172,162,0.5)"),
                b.addColorStop(1, "rgba(176,172,162,0)"),
                (m.fillStyle = b),
                m.fillRect(0, 0, x, v),
                (m.fillStyle = "rgba(168,164,154,0.95)"),
                Da(m, 64, 64, 32, y, 0.35, 13),
                m.fill(),
                (m.fillStyle = "rgba(120,116,108,0.95)"),
                Da(m, 65, 66, 20, y, 0.35, 11),
                m.fill(),
                (m.strokeStyle = "rgba(40,38,36,0.8)"),
                (m.lineWidth = 1));
              for (let E = 0; E < 6; E++) {
                let M = y() * 7,
                  _ = 64 + Math.cos(M) * 14,
                  T = 64 + Math.sin(M) * 14;
                (m.beginPath(), m.moveTo(_, T));
                for (let w = 0; w < 5; w++) ((M += (y() - 0.5) * 0.9), (_ += Math.cos(M) * 8), (T += Math.sin(M) * 8), m.lineTo(_, T));
                m.stroke();
              }
              let g = m.createRadialGradient(64, 64, 1, 64, 64, 11);
              (g.addColorStop(0, "rgba(18,17,16,1)"),
                g.addColorStop(1, "rgba(60,58,54,0.95)"),
                (m.fillStyle = g),
                Da(m, 64, 64, 10, y, 0.3, 9),
                m.fill());
              for (let E = 0; E < 40; E++) {
                m.fillStyle = `rgba(${y() < 0.5 ? "90,86,80" : "190,186,176"},0.8)`;
                let M = y() * 7,
                  _ = 10 + y() * 24;
                m.fillRect(64 + Math.cos(M) * _, 64 + Math.sin(M) * _, 1 + y() * 2, 1 + y() * 2);
              }
            },
            { rough: 0.95, bleed: [168, 164, 154] },
          ),
        scorch: () =>
          r(
            "scorch",
            256,
            256,
            (m, x, v, y) => {
              for (let b = 0; b < 40; b++) {
                let g = y() * 7,
                  E = Math.pow(y(), 1.2) * x * 0.3,
                  M = x / 2 + Math.cos(g) * E,
                  _ = v / 2 + Math.sin(g) * E,
                  T = x * (0.07 + y() * 0.15) * (1.2 - E / (x * 0.4)),
                  w = m.createRadialGradient(M, _, 0, M, _, Math.max(4, T));
                (w.addColorStop(0, `rgba(8,7,6,${0.3 + y() * 0.3})`),
                  w.addColorStop(1, "rgba(8,7,6,0)"),
                  (m.fillStyle = w),
                  m.fillRect(0, 0, x, v));
              }
              m.strokeStyle = "rgba(8,7,6,0.25)";
              for (let b = 0; b < 50; b++) {
                let g = y() * 7,
                  E = x * 0.1,
                  M = x * (0.25 + y() * 0.22);
                ((m.lineWidth = 1 + y() * 3),
                  m.beginPath(),
                  m.moveTo(x / 2 + Math.cos(g) * E, v / 2 + Math.sin(g) * E),
                  m.lineTo(x / 2 + Math.cos(g) * M, v / 2 + Math.sin(g) * M),
                  m.stroke());
              }
            },
            { rough: 0.95, bleed: [8, 7, 6] },
          ),
        crack: () =>
          r(
            "crack",
            256,
            256,
            (m, x, v, y) => {
              ((m.lineCap = "round"), (m.lineJoin = "round"));
              let b = (g, E, M, _, T, w) => {
                ((m.strokeStyle = `rgba(20,19,18,${0.6 + 0.35 * Math.min(1, T / 2.5)})`), (m.lineWidth = T), m.beginPath(), m.moveTo(g, E));
                let S = Math.floor(_ / 9);
                for (let R = 0; R < S; R++)
                  ((M += (y() - 0.5) * 0.8),
                    (g += Math.cos(M) * 9),
                    (E += Math.sin(M) * 9),
                    m.lineTo(g, E),
                    w > 0 &&
                      y() < 0.22 &&
                      (m.stroke(),
                      b(g, E, M + (y() < 0.5 ? 1 : -1) * (0.5 + y() * 0.7), _ * (0.3 + y() * 0.3), T * 0.6, w - 1),
                      (m.strokeStyle = `rgba(20,19,18,${0.6 + 0.35 * Math.min(1, T / 2.5)})`),
                      (m.lineWidth = T),
                      m.beginPath(),
                      m.moveTo(g, E)));
                m.stroke();
              };
              (b(x * 0.5, v * 0.5, y() * 7, x * 0.42, 2.6, 3),
                b(x * 0.5, v * 0.5, y() * 7 + 2, x * 0.4, 2.2, 3),
                b(x * 0.5, v * 0.5, y() * 7 + 4, x * 0.36, 1.8, 2));
            },
            { rough: 0.95, bleed: [20, 19, 18] },
          ),
        graffiti_tag: () =>
          r(
            "graffiti_tag",
            384,
            256,
            (m, x, v, y) => {
              ((m.lineCap = "round"), (m.lineJoin = "round"));
              let b = (M, _, T) => {
                  ((m.strokeStyle = T), (m.lineWidth = _), m.beginPath(), m.moveTo(M[0][0], M[0][1]));
                  for (let w = 1; w < M.length - 1; w += 2) m.quadraticCurveTo(M[w][0], M[w][1], M[w + 1][0], M[w + 1][1]);
                  m.stroke();
                },
                g = "rgba(206,214,208,0.92)",
                E = [
                  [
                    [40, 60],
                    [36, 130],
                    [48, 200],
                    [70, 150],
                    [44, 128],
                    [80, 110],
                    [104, 70],
                  ],
                  [
                    [104, 70],
                    [76, 140],
                    [108, 190],
                    [150, 200],
                    [150, 110],
                    [140, 60],
                    [112, 84],
                  ],
                  [
                    [168, 196],
                    [172, 120],
                    [186, 62],
                    [200, 110],
                    [226, 92],
                    [214, 150],
                    [236, 196],
                  ],
                  [
                    [250, 76],
                    [300, 60],
                    [318, 66],
                    [282, 110],
                    [262, 178],
                    [300, 200],
                    [334, 176],
                  ],
                ];
              for (let M of E) (b(M, 12, "rgba(206,214,208,0.25)"), b(M, 7, g));
              (b(
                [
                  [30, 222],
                  [180, 236],
                  [352, 206],
                ],
                5,
                g,
              ),
                b(
                  [
                    [330, 40],
                    [344, 30],
                    [356, 44],
                  ],
                  5,
                  g,
                ));
              for (let M = 0; M < 7; M++) {
                let _ = 50 + y() * 290,
                  T = 150 + y() * 50,
                  w = 12 + y() * 46,
                  S = m.createLinearGradient(0, T, 0, T + w);
                (S.addColorStop(0, g), S.addColorStop(1, "rgba(206,214,208,0)"), (m.fillStyle = S), m.fillRect(_, T, 2 + y() * 2, w));
              }
              for (let M = 0; M < 260; M++)
                ((m.fillStyle = `rgba(206,214,208,${y() * 0.5})`), m.fillRect(30 + y() * 330, 40 + y() * 190, 1.2, 1.2));
              lo(m, x, v, 0.25, y);
            },
            { rough: 0.6, bleed: [206, 214, 208] },
          ),
        csc_plate: () =>
          r(
            "csc_plate",
            288,
            200,
            (m, x, v, y) => {
              let b = m.createLinearGradient(0, 0, x, v);
              (b.addColorStop(0, "rgb(150,152,150)"),
                b.addColorStop(0.5, "rgb(176,178,176)"),
                b.addColorStop(1, "rgb(138,140,138)"),
                (m.fillStyle = b),
                m.beginPath(),
                m.roundRect ? m.roundRect(3, 3, x - 6, v - 6, 8) : m.rect(3, 3, x - 6, v - 6),
                m.fill(),
                (m.strokeStyle = "rgba(40,42,44,0.8)"),
                (m.lineWidth = 2),
                m.strokeRect(11, 11, x - 22, v - 22));
              for (let [M, _] of [
                [20, 20],
                [x - 20, 20],
                [20, v - 20],
                [x - 20, v - 20],
              ])
                ((m.fillStyle = "rgb(96,98,98)"),
                  m.beginPath(),
                  m.arc(M, _, 5, 0, 7),
                  m.fill(),
                  (m.fillStyle = "rgba(230,232,232,0.7)"),
                  m.beginPath(),
                  m.arc(M - 1.2, _ - 1.2, 2, 0, 7),
                  m.fill());
              let g = "rgba(28,30,32,0.92)";
              (zl(m, "SAFETY APPROVAL PLATE", x / 2, 46, 19, g, { font: "sans", weight: 600, align: "center", spacing: 1.5, maxW: x - 60 }),
                [
                  "APPROVAL REF   SL/PA-4207/19",
                  "DATE MANUFACTURED   03/2019",
                  "IDENT NO   SLTU 402719 6",
                  "MAX GROSS   30 480 KG",
                  "STACKING LOAD   192 000 KG",
                  "RACKING TEST   150 KN",
                  "NEXT EXAM   09/2027",
                ].forEach((M, _) => {
                  (zl(m, M, 30, 70 + _ * 16.5, 11, g, { font: "mono", weight: 500, spacing: 0, maxW: x - 60 }),
                    (m.fillStyle = "rgba(28,30,32,0.35)"),
                    m.fillRect(30, 73 + _ * 16.5, x - 60, 1));
                }),
                (m.fillStyle = "rgba(60,40,24,0.25)"));
              for (let M = 0; M < 30; M++) (Da(m, y() * x, y() * v, 2 + y() * 9, y, 0.5, 7), m.fill());
            },
            { rough: 0.45, metal: 0.75, text: !0 },
          ),
        numbers_0_9: () =>
          r(
            "numbers_0_9",
            640,
            128,
            (m, x, v, y) => {
              for (let b = 0; b < 10; b++)
                zl(m, String(b), b * 64 + 32, v * 0.86, v * 0.92, un(i0.white), { align: "center", weight: 900, maxW: 54 });
              lo(m, x, v, 0.3, y);
            },
            { bleed: i0.white, text: !0 },
          ),
      },
      u = Object.keys(c),
      f = new Set();
    function h(m) {
      let x = t.get("d:" + m);
      if (x) return x;
      let v = c[m];
      if (!v) (f.has(m) || (f.add(m), console.warn(`[mats] unknown decal "${m}"`)), (x = h("grime_streak")));
      else {
        let y = v();
        ((x = { material: y.material, aspect: y.aspect }), (x.material.name = "decal_" + m));
      }
      return (t.set("d:" + m, x), x);
    }
    function p(m) {
      let x = "n:" + m,
        v = t.get(x);
      if (v) return v;
      let y = h("numbers_0_9").material,
        b = y.map.clone();
      (b.repeat.set(0.1, 1), b.offset.set((Math.abs(m | 0) % 10) / 10, 0), (b.needsUpdate = !0));
      let g = y.clone();
      return (
        (g.map = b),
        i.push(() => {
          b.needsUpdate = !0;
        }),
        (v = { material: g, aspect: 0.5 }),
        t.set(x, v),
        v
      );
    }
    function d(m, x = {}) {
      m = String(m === void 0 ? "" : m).toUpperCase() || " ";
      let v = i0[x.color] ? x.color : "white",
        y = x.font === "sans" ? "sans" : "stencil",
        b = x.distress !== void 0 ? +x.distress : 0.35,
        g = `l:${m}|${v}|${y}|${b}`,
        E = t.get(g);
      if (E) return E;
      let M = 128,
        _ = 100,
        T = av(4, 4).getContext("2d"),
        w = y === "sans" ? f_ : u_,
        S = y === "sans" ? 600 : 700,
        R = _ * 0.06,
        z = h_(T, m, _, w, S, R),
        I = Math.min(1, 2e3 / (z + 32)),
        L = Math.max(48, Math.ceil((z + 32) * I)),
        U = Math.ceil(M * I),
        k = r(
          g,
          L,
          U,
          (C, A, F, H) => {
            (C.save(),
              C.scale(I, I),
              zl(C, m, 16, M * 0.84, _, un(i0[v]), { font: y, weight: S, spacing: R, fitW: z }),
              C.restore(),
              lo(C, A, F, b, H));
          },
          { bleed: i0[v], text: !0, rough: 0.65 },
        );
      return ((E = { material: k.material, aspect: k.aspect }), (E.material.name = "label"), t.set(g, E), E);
    }
    try {
      if (typeof document < "u" && document.fonts && document.fonts.load) {
        let m = 0,
          x = () => {
            m = 0;
            for (let v of i)
              try {
                v();
              } catch {}
          };
        for (let v of [
          '700 20px "Big Shoulders Display"',
          '900 20px "Big Shoulders Display"',
          '600 20px "Barlow Condensed"',
          '500 20px "IBM Plex Mono"',
        ])
          document.fonts.load(v).then(
            (y) => {
              y && y.length && !m && (m = setTimeout(x, 120));
            },
            () => {},
          );
      }
    } catch {}
    return { decal: h, label: d, number: p, names: u, bytes: () => s };
  }
  export var p_ = {
      asphalt: { fn: "asphalt", size: 1, tile: 2, bump: 1.6, hero: !0 },
      concrete: { fn: "concrete", size: 1, tile: 3, bump: 2.5 },
      brick: { fn: "brick", size: 0.5, tile: 1.8, bump: 6 },
      epoxy: { fn: "epoxy", size: 0.5, tile: 4, bump: 3 },
      paint: { fn: "paint", size: 1, tile: 2.5, bump: 2.5, p: [0.5] },
      hull: { fn: "hull", size: 0.5, tile: 4, bump: 12 },
      galv: { fn: "galv", size: 0.5, tile: 1, bump: 0.8 },
      metal: { fn: "metal", size: 0.5, tile: 1, bump: 0.5, p: [1] },
      brushed: { fn: "brushed", size: 0.5, tile: 0.5, bump: 0.4 },
      rust: { fn: "rust", size: 0.5, tile: 1.2, bump: 3 },
      diamond: { fn: "diamond", size: 0.5, tile: 0.5, bump: 2 },
      corrugated: { fn: "corrugated", size: 0.5, tile: [0.762, 2.286], bump: 19 },
      chainlink: { fn: "chainlink", size: 0.5, tile: 0.5, bump: 5 },
      hazard: { fn: "hazard", size: 0.5, tile: 1, bump: 2.5 },
      gunmetal: { fn: "gunmetal", size: 0.5, tile: 0.25, bump: 0.3, p: [0.6] },
      anodized: { fn: "gunmetal", size: 0.5, tile: 0.25, bump: 0.25, p: [0.2], seed: 11 },
      polymer: { fn: "polymer", size: 0.25, tile: 0.1, bump: 0.4 },
      carbon: { fn: "carbon", size: 0.25, tile: 0.05, bump: 0.5 },
      fabric: { fn: "fabric", size: 0.25, tile: 0.05, bump: 0.4 },
      armor: { fn: "armor", size: 0.5, tile: 0.5, bump: 0.8 },
      wood: { fn: "wood", size: 0.5, tile: 1.2, bump: 2.6 },
      plastic: { fn: "plastic", size: 0.5, tile: 1, bump: 1 },
      tarp: { fn: "tarp", size: 0.5, tile: 1.5, bump: 20 },
      cardboard: { fn: "cardboard", size: 0.5, tile: 1, bump: 0.8 },
      rope: { fn: "rope", size: 0.25, tile: 0.1, bump: 4 },
      tire: { fn: "tire", size: 0.5, tile: [0.5, 0.3], bump: 7 },
      glass: { fn: "glass", size: 0.5, tile: 1.5, bump: 1.5, p: [0.3] },
      glass_dirty: { fn: "glass", size: 0.5, tile: 1.5, bump: 1.5, p: [1], seed: 40 },
      water: { fn: "water", size: 0.25, tile: 4, bump: 30 },
    },
    lk = [0.42, 0.38, 0.5, 0],
    nh = [0.05, 0.62, 0.65, 0.7],
    La = [0, 0.7, 0.55, 0.5],
    ck = [0.3, 0.6, 0.55, 0],
    og = [0.08, 0.62, 0.6, 0.5],
    m_ = [0.4, 0.5, 0.6, 0],
    rg = [0, 1, 0, 0],
    ag = [0.22, 0.12, 0.35, 0.35],
    uk = [0.14, 0.1, 0.8, 0.2],
    lg = [0.07, 0.06, 3, 0],
    cg = [0, 0, 1, 0],
    s0 = (n, e = {}) => ({ set: n, tint: 0, color: 16777215, rough: 1, metal: 1, wet: lk, macro: uk, nrm: 1, ...e }),
    Dl = (n) => s0("paint", { tint: 1, color: n, wet: nh, macro: [0.2, 0.16, 0.4, 0.45] }),
    ug = {
      asphalt: s0("asphalt", { wet: [0.45, 0.3, 0.5, 0], macro: ag }),
      concrete: s0("concrete", { macro: ag }),
      concrete_dirty: s0("concrete", { color: 13616822, macro: [0.3, 0.15, 0.35, 0.9] }),
      concrete_painted: s0("concrete", { tint: 2, color: 9343638, rough: 0.9, wet: [0.15, 0.55, 0.6, 0.3], macro: [0.14, 0.1, 0.5, 0.3] }),
      brick: s0("brick"),
      floor_epoxy: s0("epoxy", { wet: [0.04, 0.75, 0.4, 0], macro: [0.12, 0.2, 0.45, 0.25] }),
      paint_red: Dl(8200729),
      paint_blue: Dl(2047846),
      paint_green: Dl(2906692),
      paint_yellow: Dl(12159516),
      paint_orange: Dl(11751962),
      paint_white: Dl(12172214),
      paint_grey: Dl(5922920),
      paint_teal: Dl(2055523),
      steel_galv: s0("galv", { wet: La }),
      steel_dark: s0("metal", { tint: 1, color: 4014406, rough: 1.15, wet: La }),
      steel_worn: s0("metal", { tint: 1, color: 9080466, rough: 0.9, wet: La }),
      steel_bare: s0("brushed", { tint: 1, color: 11843771, wet: La, macro: lg }),
      steel_rust: s0("rust", { wet: ck }),
      diamond_plate: s0("diamond", { wet: La }),
      corrugated_roof: s0("corrugated", { wet: La }),
      chainlink: s0("chainlink", { tint: 3, alphaCut: !0, side: 2, wet: rg, macro: cg }),
      aluminium: s0("brushed", { tint: 1, color: 12896459, rough: 1.15, wet: La, macro: lg }),
      brass: s0("brushed", { tint: 1, color: 12753477, rough: 0.9, wet: La, macro: [0.1, 0.08, 20, 0] }),
      hazard_stripes: s0("hazard", { wet: nh }),
      gunmetal: s0("gunmetal", { tint: 1, color: 2764081, wet: [0, 0.75, 0.6, 0.5], macro: [0.08, 0.06, 6, 0] }),
      anodized_black: s0("anodized", {
        tint: 1,
        color: 1184790,
        rough: 0.72,
        metal: 0.9,
        wet: [0, 0.75, 0.6, 0.5],
        macro: [0.06, 0.05, 6, 0],
      }),
      polymer_black: s0("polymer", { tint: 1, color: 1513498, wet: [0, 0.7, 0.6, 0.5], macro: [0.06, 0.06, 6, 0] }),
      polymer_tan: s0("polymer", { tint: 1, color: 7299144, wet: [0, 0.7, 0.6, 0.5], macro: [0.06, 0.06, 6, 0] }),
      rubber: s0("polymer", { tint: 1, color: 1052688, rough: 1.4, wet: [0.05, 0.6, 0.6, 0.4], macro: [0.06, 0.06, 6, 0] }),
      carbon: s0("carbon", { wet: [0, 0.8, 0.6, 0.5], macro: [0.05, 0.05, 6, 0] }),
      glove_fabric: s0("fabric", { tint: 1, color: 2303530, wet: [0.3, 0.7, 0.6, 0], macro: [0.08, 0.04, 8, 0] }),
      armor_white: s0("armor", { tint: 1, color: 11449528, wet: nh, macro: [0.08, 0.08, 2.5, 0.15] }),
      armor_orange: s0("armor", { tint: 1, color: 12670234, wet: nh, macro: [0.08, 0.08, 2.5, 0.15] }),
      wood_pallet: s0("wood", { wet: m_, macro: [0.2, 0.1, 0.9, 0.4] }),
      wood_dark: s0("wood", { color: 9074794, wet: m_, macro: [0.2, 0.1, 0.9, 0.4] }),
      plastic_blue: s0("plastic", { tint: 1, color: 1920134, wet: og }),
      plastic_red: s0("plastic", { tint: 1, color: 9314074, wet: og }),
      plastic_grey: s0("plastic", { tint: 1, color: 4935508, wet: og }),
      tarp: s0("tarp", { tint: 1, color: 3885626, wet: og, macro: [0.1, 0.1, 1.2, 0.2] }),
      cardboard: s0("cardboard", { wet: [0.4, 0.75, 0.6, 0] }),
      rope: s0("rope", { macro: lg }),
      tire: s0("tire", { wet: [0.1, 0.6, 0.6, 0.3], macro: lg }),
      glass: s0("glass", { tint: 3, transparent: !0, wet: rg, macro: cg }),
      glass_dirty: s0("glass_dirty", { tint: 3, transparent: !0, wet: rg, macro: cg }),
      hull_paint: s0("hull", { tint: 1, color: 1778219, wet: nh, macro: ag }),
      hull_red: s0("hull", { tint: 1, color: 6233880, wet: nh, macro: ag }),
      water_dark: s0("water", { wet: rg, macro: cg }),
    },
    fk = s0("metal", { tint: 1, color: 8027520, wet: La }),
    hk = `
varying vec3 vSlPos;
#ifdef SL_TRIPLANAR
varying vec3 vSlONrm; varying vec3 vSlAx; varying vec3 vSlAy;
#endif
`,
    dk = `
#ifdef SL_TRIPLANAR
  vSlPos = position; vSlONrm = normal;
  vec3 slAx = vec3(1.0, 0.0, 0.0), slAy = vec3(0.0, 1.0, 0.0);
  #ifdef USE_SKINNING
    slAx = (skinMatrix * vec4(slAx, 0.0)).xyz; slAy = (skinMatrix * vec4(slAy, 0.0)).xyz;
  #endif
  #ifdef USE_INSTANCING
    slAx = mat3(instanceMatrix) * slAx; slAy = mat3(instanceMatrix) * slAy;
  #endif
  vSlAx = normalize(mat3(modelViewMatrix) * slAx); vSlAy = normalize(mat3(modelViewMatrix) * slAy);
#else
  vec4 slWP = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    slWP = instanceMatrix * slWP;
  #endif
  vSlPos = (modelMatrix * slWP).xyz;
#endif
`,
    pk = `
uniform float uSlWet; uniform vec4 uSlWetP; uniform vec4 uSlMacro; uniform vec3 uSlUv; uniform vec2 uSlX;
varying vec3 vSlPos;
#ifdef SL_TRIPLANAR
varying vec3 vSlONrm; varying vec3 vSlAx; varying vec3 vSlAy;
vec3 slTw; vec2 slUx; vec2 slUy; vec2 slUz;
vec4 slTri(sampler2D t){ return texture2D(t, slUx) * slTw.x + texture2D(t, slUy) * slTw.y + texture2D(t, slUz) * slTw.z; }
#endif
vec4 slORM; vec2 slUv; float slWetK = 0.0; float slUp = 0.0; float slMac = 0.5; float slMac2 = 0.5; float slBead = 0.0;
float slH(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float slN3(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(slH(i), slH(i + vec3(1.0, 0.0, 0.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 0.0)), slH(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(slH(i + vec3(0.0, 0.0, 1.0)), slH(i + vec3(1.0, 0.0, 1.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 1.0)), slH(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
`,
    mk = `
#ifdef SL_TRIPLANAR
  { vec3 slOn = normalize(vSlONrm); vec3 slW3 = pow(abs(slOn), vec3(6.0)); slTw = slW3 / (slW3.x + slW3.y + slW3.z);
    vec3 slQ = vSlPos * uSlUv.z; slUx = slQ.zy; slUy = slQ.xz; slUz = slQ.xy; }
  vec4 sampledDiffuseColor = slTri(map);
  slORM = slTri(roughnessMap);
#else
  slUv = vMapUv * uSlUv.xy;
  vec4 sampledDiffuseColor = texture2D(map, slUv);
  slORM = texture2D(roughnessMap, slUv);
#endif
#ifdef SL_FX
  {
    #ifdef FLAT_SHADED
      vec3 slVN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
    #else
      vec3 slVN = normalize(vNormal);
      #ifdef DOUBLE_SIDED
        slVN *= gl_FrontFacing ? 1.0 : -1.0;
      #endif
    #endif
    vec3 slWN = inverseTransformDirection(slVN, viewMatrix);
    vec3 slMp = vSlPos * uSlMacro.z;
    slMac = slN3(slMp); slMac2 = slN3(slMp * 3.7 + 11.3);
    float slM = slMac * 0.65 + slMac2 * 0.35 - 0.5;
    sampledDiffuseColor.rgb *= 1.0 + uSlMacro.x * slM * 2.0;
    float slGr = smoothstep(0.5, 0.85, slMac * 0.6 + slMac2 * 0.4 + (1.0 - slORM.r) * 0.3) * uSlMacro.w;
    sampledDiffuseColor.rgb *= 1.0 - slGr * 0.35;
    #if SL_TINT == 1
      sampledDiffuseColor.a *= 1.0 - slGr * 0.2;
    #endif
    // rain wetness: strongest on up-facing faces, streaky on verticals, none underneath
    slUp = smoothstep(0.15, 0.85, slWN.y);
    float slExpo = smoothstep(-0.4, -0.05, slWN.y);
    float slStreak = 0.0;
    #ifndef SL_TRIPLANAR
      float slSc = vSlPos.x + vSlPos.z;
      slStreak = slN3(vec3(slSc * 9.0, vSlPos.y * 0.55, slSc * 0.7 + 3.0)) * slN3(vec3(slSc * 29.0, vSlPos.y * 1.1, 7.0));
      slStreak = smoothstep(0.12, 0.42, slStreak) * smoothstep(0.3, 0.7, slN3(vec3(slSc * 1.1, vSlPos.y * 0.25, 1.7)));
    #endif
    float slW = uSlWet * uSlX.x * slExpo;
    slWetK = slW * mix(uSlWetP.z * (0.55 + 0.9 * slStreak), 0.75 + 0.5 * slMac, slUp);
    #ifndef SL_TRIPLANAR
      { float slLow = smoothstep(0.5, 0.0, vSlPos.y) * (1.0 - slUp) * slExpo;        // damp, splashed band where things meet the ground
        slWetK += slW * slLow * 0.6;
        float slLg = 1.0 - slLow * min(uSlMacro.w, 0.5) * 0.45;
        sampledDiffuseColor.rgb *= slLg;
        #if SL_TINT == 1
          sampledDiffuseColor.a *= slLg;
        #endif
      }
    #endif
    slWetK = clamp(slWetK, 0.0, 1.0);
    float slBf = clamp(1.0 - length(fwidth(vSlPos)) * 120.0, 0.0, 1.0);
    if (uSlWetP.w > 0.0 && slBf > 0.0) {
      float slB = slN3(vSlPos * 170.0) * 0.6 + slN3(vSlPos * 410.0 + 5.0) * 0.4;
      slBead = smoothstep(0.6, 0.68, slB) * uSlWetP.w * slW * slBf * (0.4 + 0.6 * slUp + 0.5 * slStreak);
    }
  }
#endif
#if SL_TINT == 1
  diffuseColor.rgb = sampledDiffuseColor.rgb + diffuse * sampledDiffuseColor.a;
#elif SL_TINT == 2
  { float slL = clamp(dot(sampledDiffuseColor.rgb, vec3(0.3333)) / 0.19, 0.55, 1.35);
    diffuseColor.rgb = mix(sampledDiffuseColor.rgb, diffuse * slL, sampledDiffuseColor.a * 0.96); }
#elif SL_TINT == 3
  diffuseColor *= sampledDiffuseColor;
#else
  diffuseColor.rgb *= sampledDiffuseColor.rgb;
#endif
#ifdef SL_FX
  { float slLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
    diffuseColor.rgb = mix(vec3(slLum), diffuseColor.rgb, 1.0 + 0.25 * slWetK * uSlWetP.x * 2.0);
    diffuseColor.rgb *= 1.0 - uSlWetP.x * slWetK; }
#endif
#ifdef SL_ACUT
  // alpha-tested wire mesh that survives distance: wires stay ~1 px wide through the mips (lowered threshold),
  // then dissolve into a stable ~1/3-coverage dither veil once the diamonds themselves are sub-pixel.
  { vec2 slFw = fwidth(slUv) * 512.0; float slLod = log2(max(max(slFw.x, slFw.y), 1e-4));
    float slThC = 0.5 * exp2(-clamp(slLod - 1.0, 0.0, 4.0));
    float slIgn = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float slTh = mix(slThC, 0.05 + slIgn * 0.80, smoothstep(3.5, 5.5, slLod));
    diffuseColor.a = sampledDiffuseColor.a > slTh ? 1.0 : 0.0;
    // sub-pixel wires: the surviving fragments stand in for a much thinner wire, so dim them (no white sheets in the sun)
    diffuseColor.rgb *= mix(1.0, 0.45, smoothstep(1.5, 4.5, slLod)); }
#endif
`,
    gk = `
float roughnessFactor = roughness * slORM.g;
#ifdef SL_FX
  roughnessFactor += uSlMacro.y * ((slMac2 - 0.5) * 1.4 + (slMac - 0.5) * 0.8);
  roughnessFactor = mix(roughnessFactor, roughnessFactor * uSlWetP.y, slWetK);
  roughnessFactor = mix(roughnessFactor, 0.05, slBead);
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) && !defined( SL_TRIPLANAR )
  { float slNl = length(texture2D(normalMap, slUv).xyz * 2.0 - 1.0);
    roughnessFactor = sqrt(roughnessFactor * roughnessFactor + clamp(1.0 - slNl, 0.0, 1.0) * 0.6); }
#endif
roughnessFactor = clamp(roughnessFactor, 0.045, 1.0);
`,
    xk = `
float metalnessFactor = metalness * slORM.b;
`,
    vk = `
#ifdef SL_TRIPLANAR
  { vec3 slOn = normalize(vSlONrm);
    vec3 slTx = texture2D(normalMap, slUx).xyz * 2.0 - 1.0, slTy = texture2D(normalMap, slUy).xyz * 2.0 - 1.0, slTz = texture2D(normalMap, slUz).xyz * 2.0 - 1.0;
    slTx.xy *= normalScale; slTy.xy *= normalScale; slTz.xy *= normalScale;
    slTx = vec3(slTx.xy + slOn.zy, abs(slTx.z) * slOn.x); slTy = vec3(slTy.xy + slOn.xz, abs(slTy.z) * slOn.y); slTz = vec3(slTz.xy + slOn.xy, abs(slTz.z) * slOn.z);
    vec3 slNo = normalize(slTx.zyx * slTw.x + slTy.xzy * slTw.y + slTz.xyz * slTw.z);
    vec3 slA = normalize(vSlAx), slB = normalize(vSlAy); vec3 slC = cross(slA, slB);
    normal = normalize(slA * slNo.x + slB * slNo.y + slC * slNo.z);
    #ifdef DOUBLE_SIDED
      normal *= faceDirection;
    #endif
  }
#elif defined( USE_NORMALMAP_TANGENTSPACE )
  { vec3 mapN = texture2D(normalMap, slUv).xyz * 2.0 - 1.0;
    mapN.xy *= normalScale * (1.0 - 0.45 * slWetK * slUp);
    normal = normalize(tbn * mapN); }
#endif
`,
    yk = Yt.aomap_fragment.replace("texture2D( aoMap, vAoMapUv ).r", "slORM.r");
  export function g_(n, e) {
    (Object.assign(n.uniforms, e),
      (n.vertexShader = n.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
` + hk,
        )
        .replace(
          "#include <project_vertex>",
          `#include <project_vertex>
` + dk,
        )),
      (n.fragmentShader = n.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
` + pk,
        )
        .replace("#include <map_fragment>", mk)
        .replace("#include <roughnessmap_fragment>", gk)
        .replace("#include <metalnessmap_fragment>", xk)
        .replace("#include <normal_fragment_maps>", vk)
        .replace("#include <aomap_fragment>", yk)));
  }
  export async function lv(n) {
    let e = n.renderer || (n.render && n.render.renderer),
      t = n.params || {},
      i = +(t.tex || 0) || (n.quality && n.quality.tex) || 1024,
      s = Math.min(i, 1024),
      o = Math.min(8, e.capabilities.getMaxAnisotropy ? e.capabilities.getMaxAnisotropy() : 1),
      r = { wet: { value: t.wet !== void 0 ? +t.wet : 1 } },
      a = { sets: 0, bytes: 0, ms: 0 },
      l = new Mr(-1, 1, 1, -1, 0, 1),
      c = new mr(),
      u = new ht(new w0(2, 2));
    ((u.frustumCulled = !1), c.add(u));
    let f = new Map(),
      h = new Map(),
      p = new Map(),
      d = 0,
      m = null,
      x = (I, L) => new Gc({ glslVersion: jf, vertexShader: s_, fragmentShader: I, uniforms: L, depthTest: !1, depthWrite: !1 });
    function v() {
      return (
        m ||
          (m = {
            normal: x(l_, { tH: { value: null }, uK: { value: new We() }, uTexel: { value: 0 } }),
            copy: x(c_, { tA: { value: null }, uSq: { value: 0 } }),
          }),
        m
      );
    }
    function y(I, L) {
      ((u.material = L), e.setRenderTarget(I), e.render(c, l));
    }
    function b(I, L) {
      let U = new Zn(I, I, {
        depthBuffer: !1,
        generateMipmaps: !0,
        minFilter: yn,
        magFilter: x0,
        wrapS: qs,
        wrapT: qs,
        anisotropy: o,
        colorSpace: L ? In : ci,
      });
      return ((a.bytes += I * I * 4 * 1.34), U);
    }
    function g(I) {
      let L = Math.round(s * I.size);
      return (I.hero && i >= 2048 && (L = 2048), Math.max(32, L));
    }
    function E(I) {
      let L = p.get(I);
      if (L) return L;
      let U = p_[I],
        k = performance.now(),
        C = g(U),
        A = Array.isArray(U.tile) ? U.tile : [U.tile, U.tile],
        F = f.get(C);
      F ||
        ((F = new Zn(C, C, { count: 3, depthBuffer: !1, generateMipmaps: !1, minFilter: Dn, magFilter: Dn, wrapS: qs, wrapT: qs })),
        f.set(C, F));
      let H = h.get(U.fn);
      H || ((H = x(o_ + cn[U.fn] + r_, { uP: { value: new Jt() }, uSeed: { value: 0 }, uTexel: { value: 0 } })), h.set(U.fn, H));
      let N = U.p || [];
      (H.uniforms.uP.value.set(N[0] || 0, N[1] || 0, N[2] || 0, N[3] || 0),
        (H.uniforms.uSeed.value = U.seed || 0),
        (H.uniforms.uTexel.value = 1 / C));
      let Z = v(),
        Q = e.getRenderTarget(),
        W = e.autoClear,
        J = e.xr.enabled,
        G = e.shadowMap.autoUpdate;
      ((e.autoClear = !0), (e.xr.enabled = !1), (e.shadowMap.autoUpdate = !1), y(F, H));
      let te = b(C, !0),
        oe = b(C, !1),
        ee = b(C, !1);
      ((Z.copy.uniforms.tA.value = F.textures[0]),
        (Z.copy.uniforms.uSq.value = 1),
        y(te, Z.copy),
        (Z.copy.uniforms.tA.value = F.textures[1]),
        (Z.copy.uniforms.uSq.value = 0),
        y(oe, Z.copy),
        (Z.normal.uniforms.tH.value = F.textures[2]),
        (Z.normal.uniforms.uTexel.value = 1 / C),
        Z.normal.uniforms.uK.value.set((U.bump * 0.001 * C) / A[0], (U.bump * 0.001 * C) / A[1]),
        y(ee, Z.normal),
        e.setRenderTarget(Q),
        (e.autoClear = W),
        (e.xr.enabled = J),
        (e.shadowMap.autoUpdate = G));
      for (let le of [te, oe, ee]) (le.texture.repeat.set(1 / A[0], 1 / A[1]), (le.texture.name = "sl_" + I));
      return (
        (L = { key: I, albedo: te.texture, orm: oe.texture, normal: ee.texture, tile: A, size: C, targets: [te, oe, ee] }),
        p.set(I, L),
        a.sets++,
        (a.ms += performance.now() - k),
        (d = performance.now()),
        L
      );
    }
    function M() {
      for (let I of f.values()) I.dispose();
      f.clear();
      for (let I of h.values()) I.dispose();
      h.clear();
    }
    let _ = new Map(),
      T = new Set();
    function w(I, L = {}) {
      let U =
          I +
          "|" +
          (L.vertexColors ? "v" : "") +
          (L.triplanar ? "t" + (L.scale || 1) : "") +
          (L.doubleSide ? "d" : "") +
          (L.interior ? "i" : "") +
          (L.color !== void 0 ? "c" + L.color : ""),
        k = _.get(U);
      if (k) return k;
      let C = ug[I];
      C || (T.has(I) || (T.add(I), console.warn(`[mats] unknown material "${I}" \u2014 using fallback`)), (C = fk));
      let A;
      try {
        A = E(C.set);
      } catch (Q) {
        return (
          T.has("gen:" + C.set) || (T.add("gen:" + C.set), console.error(`[mats] texture set "${C.set}" failed: ${(Q && Q.message) || Q}`)),
          (k = new L0({
            color: L.color !== void 0 ? L.color : C.tint ? C.color : 8421504,
            roughness: 0.6,
            metalness: 0,
            vertexColors: !!L.vertexColors,
          })),
          (k.name = I),
          _.set(U, k),
          k
        );
      }
      let F = !!L.triplanar,
        H = !C.transparent && !C.alphaCut;
      ((k = new L0({
        map: A.albedo,
        normalMap: A.normal,
        roughnessMap: A.orm,
        metalnessMap: A.orm,
        aoMap: A.orm,
        color: L.color !== void 0 ? L.color : C.color,
        roughness: C.rough,
        metalness: C.metal,
        vertexColors: !!L.vertexColors,
      })),
        k.normalScale.set(C.nrm, C.nrm),
        (k.name = I),
        (L.doubleSide || C.side === 2) && (k.side = ln),
        C.transparent && ((k.transparent = !0), (k.depthWrite = !1), (k.envMapIntensity = 1.4)),
        C.alphaCut && (k.alphaTest = 0.5),
        (k.defines = { ...k.defines, SL_TINT: C.tint }),
        F && (k.defines.SL_TRIPLANAR = ""),
        H && (k.defines.SL_FX = ""),
        C.alphaCut && !F && (k.defines.SL_ACUT = ""));
      let N = {
        uSlWet: r.wet,
        uSlWetP: { value: new Jt(...C.wet) },
        uSlMacro: { value: new Jt(...C.macro) },
        uSlUv: { value: new K(1, 1, F ? (L.scale || 1) / A.tile[0] : A.size) },
        uSlX: { value: new We(L.interior ? 0.12 : 1, 0) },
      };
      ((k.userData.sl = N),
        (k.userData.set = A.key),
        (k.userData.tile = A.tile),
        L.interior && (k.userData.interior = !0),
        (k.onBeforeCompile = (Q) => g_(Q, N)));
      let Z = "sl2|" + C.tint + (F ? "t" : "") + (H ? "f" : "") + (C.alphaCut ? "a" : "");
      return ((k.customProgramCacheKey = () => Z), _.set(U, k), k);
    }
    function S(I = 16777215, L = 4) {
      let U = "em|" + I + "|" + L;
      if (_.has(U)) return _.get(U);
      let k = new An({ color: new Qe(I).multiplyScalar(L), toneMapped: !0 });
      return ((k.name = "emissive"), _.set(U, k), k);
    }
    let R = d_(n, o);
    return {
      get: w,
      emissive: S,
      decal: R.decal,
      label: R.label,
      number: R.number,
      names: Object.keys(ug),
      decalNames: R.names,
      uniforms: r,
      update(I) {
        f.size && performance.now() - d > 4e3 && M();
      },
      prewarm(I) {
        for (let L of I || Object.keys(ug)) w(L);
      },
      stats() {
        return {
          sets: a.sets,
          textureMB: +(a.bytes / 1048576).toFixed(1),
          genMs: +a.ms.toFixed(0),
          decalMB: +(R.bytes() / 1048576).toFixed(1),
        };
      },
      tileOf(I) {
        let L = ug[I];
        return L ? p_[L.set].tile : 1;
      },
    };
  }
  export var bk = new Set([
    "gunmetal",
    "anodized_black",
    "polymer_black",
    "polymer_tan",
    "rubber",
    "carbon",
    "glove_fabric",
    "armor_white",
    "armor_orange",
  ]);
  export function Mk(n) {
    let e = new Gi(n, 48, 32),
      t = e.attributes.uv;
    for (let i = 0; i < t.count; i++) t.setXY(i, t.getX(i) * 2 * Math.PI * n, t.getY(i) * Math.PI * n);
    return e;
  }
  export function fg(n, e) {
    let t = new w0(n, e),
      i = t.attributes.uv;
    for (let s = 0; s < i.count; s++) i.setXY(s, i.getX(s) * n, i.getY(s) * e);
    return t;
  }
  export function _k(n) {
    let e = n.mats,
      t = new At();
    n.scene.add(t);
    let i = n.params.only ? String(n.params.only).split(",").filter(Boolean) : null,
      s = !i || i.includes("decals"),
      o = i ? i.filter((x) => x !== "decals") : e.names,
      r = i ? Math.max(1, o.length) : 10,
      a = 1.9,
      l = 3.6,
      c = Mk(0.42),
      u = fg(1.5, 1.5),
      f = fg(1.5, 1.5).rotateX(-Math.PI / 2),
      h = (x, v, y, b, g) => {
        let E = new ht(x, v);
        return (E.position.set(y, b, g), (E.castShadow = E.receiveShadow = !0), t.add(E), E);
      };
    o.forEach((x, v) => {
      let y = ((v % r) - (r - 1) / 2) * a,
        b = -Math.floor(v / r) * l,
        g = e.get(x, x.startsWith("glass") || x === "chainlink" ? { doubleSide: !0 } : {});
      (h(u, g, y, 0.76, b), h(f, g, y, 0.012, b + 1.1), h(c, bk.has(x) ? e.get(x, { triplanar: !0 }) : g, y, 0.46, b + 1.25));
    });
    let p,
      d,
      m = r * a;
    if ((i && o.length ? ((p = [0.25 * m, 1.5, 2.6 + m * 0.42]), (d = [0, 0.62, 0.5])) : ((p = [0, 9.5, 12]), (d = [0, 0, -7])), s)) {
      let x = i && !o.length ? 0 : m / 2 + 5.5,
        v = 8.4,
        y = 3.3,
        b = h(fg(v, y), e.get("paint_blue"), x, y / 2, -1),
        g = h(fg(v, y), e.get("concrete"), x, y / 2, -1.01);
      g.position.x += v;
      let E = e.decalNames,
        M = -v / 2 + 0.25,
        _ = y - 0.75,
        T = 0.62,
        w = (R, z, I) => {
          let L = z * R.aspect;
          if (M + L > v * 1.5 - 0.2) return;
          M < v / 2 && M + L > v / 2 - 0.15 && (M = v / 2 + 0.25);
          let U = new ht(new w0(L, z), R.material);
          (U.position.set(x + M + L / 2, _ + z / 2, -0.996), (U.renderOrder = 2), t.add(U), (M += L + 0.14));
        };
      ([E.slice(0, 9), E.slice(9, 17), E.slice(17)].forEach((R, z) => {
        ((M = -v / 2 + 0.25), (_ = y - 0.75 - z * 0.78), R.forEach((I) => w(e.decal(I), T)));
      }),
        (M = -v / 2 + 0.25),
        (_ = y - 0.75 - 3 * 0.78 - 0.05),
        w(e.label("SALTLINE TERMINAL  B4-0271", { color: "white" }), 0.3),
        w(e.label("MAX GROSS 30480 KG", { color: "yellow", distress: 0.6 }), 0.22),
        w(e.label("DANGER", { color: "red", distress: 0.2 }), 0.3),
        w(e.label("KEEP CLEAR", { color: "black", font: "sans" }), 0.25),
        w(e.number(4), 0.3),
        w(e.number(7), 0.3),
        i && !o.length && ((p = [v / 2, 1.7, 7.2]), (d = [v / 2, 1.6, -1])));
    }
    return (
      n.params.wet !== void 0 && (e.uniforms.wet.value = +n.params.wet),
      console.log("[mats] " + JSON.stringify(e.stats())),
      { cam: p, target: d, update() {} }
    );
  }
  export var hg = 0.42,
    $s = 0.5,
    Ll = -40,
    wk = 31,
    ru = -32,
    Ek = 30,
    f0 = Math.round((wk - Ll) / $s),
    co = Math.round((Ek - ru) / $s),
    t1 = 0.5;
  export function v_(n) {
    let e = [],
      t = !0,
      i = new Uint8Array(f0 * co),
      s = new K(),
      o = {
        boxes: e,
        bounds: { min: Kn.min.clone(), max: Kn.max.clone() },
        addBox(M, _, T = {}) {
          let w = x_(M),
            S = x_(_),
            R = {
              min: new K(Math.min(w.x, S.x), Math.min(w.y, S.y), Math.min(w.z, S.z)),
              max: new K(Math.max(w.x, S.x), Math.max(w.y, S.y), Math.max(w.z, S.z)),
              surface: T.surface || "concrete",
              tag: T.tag || "",
              noNav: !!T.noNav,
              bulletOnly: !!T.bulletOnly,
              playerOnly: !!T.playerOnly,
            };
          return (e.push(R), (t = !0), R);
        },
        removeBox(M) {
          let _ = e.indexOf(M);
          _ >= 0 && (e.splice(_, 1), (t = !0));
        },
        build() {
          a();
        },
        raycast(M, _, T = 500) {
          let w = T,
            S = null,
            R = -1,
            z = 0,
            I = 0,
            L = M.x,
            U = M.y,
            k = M.z,
            C = _.x,
            A = _.y,
            F = _.z;
          if (A < -1e-6) {
            let J = (Kn.groundY - U) / A;
            if (J > 0 && J < w)
              if (L + C * J <= Kn.quayX) ((w = J), (I = 1));
              else {
                let te = (Kn.seaY - U) / A;
                te > 0 && te < w && ((w = te), (I = 2));
              }
          }
          let H = C === 0 ? 1 / 0 : 1 / C,
            N = A === 0 ? 1 / 0 : 1 / A,
            Z = F === 0 ? 1 / 0 : 1 / F;
          for (let J = 0; J < e.length; J++) {
            let G = e[J];
            if (G.playerOnly) continue;
            let te = 0,
              oe = w,
              ee = -1,
              le = 0,
              xe,
              j;
            if (C !== 0) {
              ((xe = (G.min.x - L) * H), (j = (G.max.x - L) * H));
              let O = -1;
              if (xe > j) {
                let q = xe;
                ((xe = j), (j = q), (O = 1));
              }
              if ((xe > te && ((te = xe), (ee = 0), (le = O)), j < oe && (oe = j), te > oe)) continue;
            } else if (L < G.min.x || L > G.max.x) continue;
            if (A !== 0) {
              ((xe = (G.min.y - U) * N), (j = (G.max.y - U) * N));
              let O = -1;
              if (xe > j) {
                let q = xe;
                ((xe = j), (j = q), (O = 1));
              }
              if ((xe > te && ((te = xe), (ee = 1), (le = O)), j < oe && (oe = j), te > oe)) continue;
            } else if (U < G.min.y || U > G.max.y) continue;
            if (F !== 0) {
              ((xe = (G.min.z - k) * Z), (j = (G.max.z - k) * Z));
              let O = -1;
              if (xe > j) {
                let q = xe;
                ((xe = j), (j = q), (O = 1));
              }
              if ((xe > te && ((te = xe), (ee = 2), (le = O)), j < oe && (oe = j), te > oe)) continue;
            } else if (k < G.min.z || k > G.max.z) continue;
            ee < 0 || ((w = te), (S = G), (R = ee), (z = le), (I = 0));
          }
          if (!S && !I) return null;
          let Q = new K(L + C * w, U + A * w, k + F * w);
          if (I)
            return {
              dist: w,
              point: Q,
              normal: new K(0, 1, 0),
              surface: I === 2 ? "water" : n.level && n.level.groundSurfaceAt ? n.level.groundSurfaceAt(Q.x, Q.z) : "concrete",
              box: null,
            };
          let W = new K();
          return (W.setComponent(R, z), { dist: w, point: Q, normal: W, surface: S.surface, box: S });
        },
        lineOfSight(M, _) {
          s.subVectors(_, M);
          let T = s.length();
          return T < 1e-4 ? !0 : (s.multiplyScalar(1 / T), !o.raycast(M, s, T - 0.05));
        },
        groundHeight(M, _, T = 50) {
          let w = M <= Kn.quayX ? Kn.groundY : Kn.seaY;
          for (let S = 0; S < e.length; S++) {
            let R = e[S];
            R.bulletOnly || (M >= R.min.x && M <= R.max.x && _ >= R.min.z && _ <= R.max.z && R.max.y <= T && R.max.y > w && (w = R.max.y));
          }
          return w;
        },
        moveCapsule(M, _, T, w = 0.32, S = 1.8, R = !0) {
          let z = { onGround: !1, hitWall: !1, hitCeil: !1, surface: "concrete" },
            I = _.x * T,
            L = _.z * T,
            U = Math.max(1, Math.ceil(Math.hypot(I, L) / (w * 0.6))),
            k = M.y;
          for (let Q = 0; Q < U; Q++) {
            ((M.x += I / U), (M.z += L / U));
            for (let W = 0; W < 3; W++) {
              let J = !1;
              for (let G = 0; G < e.length; G++) {
                let te = e[G];
                if (te.bulletOnly || te.max.y <= M.y + (R ? hg : 0.08) || te.min.y >= M.y + S) continue;
                let oe = Math.max(te.min.x, Math.min(te.max.x, M.x)),
                  ee = Math.max(te.min.z, Math.min(te.max.z, M.z)),
                  le = M.x - oe,
                  xe = M.z - ee,
                  j = le * le + xe * xe;
                if (!(j >= w * w)) {
                  if (j > 1e-10) {
                    let O = Math.sqrt(j),
                      q = w - O;
                    ((le /= O), (xe /= O), (M.x += le * q), (M.z += xe * q));
                    let ue = _.x * le + _.z * xe;
                    ue < 0 && ((_.x -= le * ue), (_.z -= xe * ue));
                  } else {
                    let O = M.x - te.min.x,
                      q = te.max.x - M.x,
                      ue = M.z - te.min.z,
                      de = te.max.z - M.z,
                      $ = Math.min(O, q, ue, de);
                    $ === O
                      ? ((M.x = te.min.x - w), _.x > 0 && (_.x = 0))
                      : $ === q
                        ? ((M.x = te.max.x + w), _.x < 0 && (_.x = 0))
                        : $ === ue
                          ? ((M.z = te.min.z - w), _.z > 0 && (_.z = 0))
                          : ((M.z = te.max.z + w), _.z < 0 && (_.z = 0));
                  }
                  ((J = !0), (z.hitWall = !0));
                }
              }
              if (!J) break;
            }
          }
          let C = M.y + _.y * T,
            A = w * 0.7,
            F = M.x <= Kn.quayX + A ? Kn.groundY : -50,
            H = null,
            N = 1 / 0,
            Z = k + (R ? hg : 0.08) + 1e-4;
          for (let Q = 0; Q < e.length; Q++) {
            let W = e[Q];
            W.bulletOnly ||
              M.x + A < W.min.x ||
              M.x - A > W.max.x ||
              M.z + A < W.min.z ||
              M.z - A > W.max.z ||
              (W.max.y <= Z && W.max.y > F && ((F = W.max.y), (H = W.surface)), W.min.y >= k + S - 0.05 && W.min.y < N && (N = W.min.y));
          }
          return (
            _.y > 0 && C + S > N
              ? ((M.y = N - S), (_.y = 0), (z.hitCeil = !0))
              : C <= F
                ? ((M.y = F), _.y < 0 && (_.y = 0), (z.onGround = !0))
                : R && _.y <= 0 && C - F < hg
                  ? ((M.y = F), (_.y = 0), (z.onGround = !0))
                  : (M.y = C),
            z.onGround && (z.surface = H || (n.level && n.level.groundSurfaceAt ? n.level.groundSurfaceAt(M.x, M.z) : "concrete")),
            z
          );
        },
        nav: {
          cell: $s,
          isWalkable(M, _) {
            r();
            let T = l(M, _);
            return T >= 0 && !i[T];
          },
          findPath(M, _) {
            r();
            let T = u(M.x, M.z),
              w = u(_.x, _.z);
            if (T < 0 || w < 0) return null;
            if (T === w) return [new K(_.x, 0, _.z)];
            let S = E(T, w);
            if (!S) return null;
            let R = [],
              z = 0;
            for (; z < S.length - 1;) {
              let I = z + 1;
              for (let L = S.length - 1; L > z + 1; L--)
                if (f(S[z], S[L])) {
                  I = L;
                  break;
                }
              (R.push(c(S[I])), (z = I));
            }
            return (l(_.x, _.z) === w && R.length && R[R.length - 1].set(_.x, 0, _.z), R);
          },
          randomPoint(M, _) {
            r();
            for (let w = 0; w < 24; w++) {
              let S = Math.random() * 6.2832,
                R = Math.sqrt(Math.random()) * _,
                z = M.x + Math.cos(S) * R,
                I = M.z + Math.sin(S) * R,
                L = l(z, I);
              if (L >= 0 && !i[L]) return new K(z, 0, I);
            }
            let T = u(M.x, M.z);
            return T >= 0 ? c(T) : new K(M.x, 0, M.z);
          },
          clearLine(M, _) {
            r();
            let T = l(M.x, M.z),
              w = l(_.x, _.z);
            return T >= 0 && w >= 0 && f(T, w);
          },
          _grid: () => (r(), { blocked: i, w: f0, h: co, minX: Ll, minZ: ru, cell: $s }),
        },
      };
    function r() {
      t && a();
    }
    function a() {
      ((i = new Uint8Array(f0 * co)), (t = !1));
      for (let M of e) {
        if (M.noNav || M.bulletOnly || M.max.y < hg + 0.05 || M.min.y > 1.5) continue;
        let _ = Math.max(0, Math.floor((M.min.x - t1 - Ll) / $s)),
          T = Math.min(f0 - 1, Math.floor((M.max.x + t1 - Ll) / $s)),
          w = Math.max(0, Math.floor((M.min.z - t1 - ru) / $s)),
          S = Math.min(co - 1, Math.floor((M.max.z + t1 - ru) / $s));
        for (let R = w; R <= S; R++) for (let z = _; z <= T; z++) i[R * f0 + z] = 1;
      }
      for (let M = 0; M < co; M++)
        for (let _ = 0; _ < f0; _++)
          (Ll + (_ + 0.5) * $s > Kn.quayX - t1 || _ === 0 || M === 0 || _ === f0 - 1 || M === co - 1) && (i[M * f0 + _] = 1);
    }
    function l(M, _) {
      let T = Math.floor((M - Ll) / $s),
        w = Math.floor((_ - ru) / $s);
      return T < 0 || w < 0 || T >= f0 || w >= co ? -1 : w * f0 + T;
    }
    function c(M) {
      return new K(Ll + ((M % f0) + 0.5) * $s, 0, ru + (Math.floor(M / f0) + 0.5) * $s);
    }
    function u(M, _) {
      let T = Math.floor((M - Ll) / $s),
        w = Math.floor((_ - ru) / $s);
      if (((T = Math.max(0, Math.min(f0 - 1, T))), (w = Math.max(0, Math.min(co - 1, w))), !i[w * f0 + T])) return w * f0 + T;
      for (let S = 1; S <= 12; S++) {
        let R = -1,
          z = 1e9;
        for (let I = -S; I <= S; I++)
          for (let L = -S; L <= S; L++) {
            if (Math.max(Math.abs(L), Math.abs(I)) !== S) continue;
            let U = T + L,
              k = w + I;
            if (!(U < 0 || k < 0 || U >= f0 || k >= co) && !i[k * f0 + U]) {
              let C = L * L + I * I;
              C < z && ((z = C), (R = k * f0 + U));
            }
          }
        if (R >= 0) return R;
      }
      return -1;
    }
    function f(M, _) {
      let T = M % f0,
        w = Math.floor(M / f0),
        S = _ % f0,
        R = Math.floor(_ / f0),
        z = Math.abs(S - T),
        I = Math.abs(R - w),
        L = T < S ? 1 : -1,
        U = w < R ? 1 : -1,
        k = z - I;
      for (let C = 0; C < 600; C++) {
        if (i[w * f0 + T]) return !1;
        if (T === S && w === R) return !0;
        let A = 2 * k;
        if (A > -I && A < z) {
          if (i[w * f0 + T + L] || i[(w + U) * f0 + T]) return !1;
          ((k += z - I), (T += L), (w += U));
        } else A > -I ? ((k -= I), (T += L)) : ((k += z), (w += U));
      }
      return !1;
    }
    let h = new Float32Array(f0 * co),
      p = new Int32Array(f0 * co),
      d = new Uint32Array(f0 * co),
      m = new Uint32Array(f0 * co),
      x = 0,
      v = [],
      y = [];
    function b(M, _) {
      let T = v.length;
      for (v.push(M), y.push(_); T > 0;) {
        let w = (T - 1) >> 1;
        if (y[w] <= _) break;
        ((v[T] = v[w]), (y[T] = y[w]), (T = w));
      }
      ((v[T] = M), (y[T] = _));
    }
    function g() {
      let M = v[0],
        _ = v.pop(),
        T = y.pop(),
        w = v.length;
      if (w) {
        let S = 0;
        for (;;) {
          let R = 2 * S + 1;
          if (R >= w || (R + 1 < w && y[R + 1] < y[R] && R++, y[R] >= T)) break;
          ((v[S] = v[R]), (y[S] = y[R]), (S = R));
        }
        ((v[S] = _), (y[S] = T));
      }
      return M;
    }
    function E(M, _) {
      (x++, (v.length = 0), (y.length = 0));
      let T = _ % f0,
        w = Math.floor(_ / f0),
        S = (I) => {
          let L = Math.abs((I % f0) - T),
            U = Math.abs(Math.floor(I / f0) - w);
          return L + U + (1.4142 - 2) * Math.min(L, U);
        };
      ((h[M] = 0), (d[M] = x), (p[M] = -1), b(M, S(M)));
      let R = 0;
      for (; v.length;) {
        let I = g();
        if (I === _) break;
        if (m[I] === x) continue;
        if (((m[I] = x), ++R > 9e3)) return null;
        let L = I % f0,
          U = Math.floor(I / f0);
        for (let k = -1; k <= 1; k++)
          for (let C = -1; C <= 1; C++) {
            if (!C && !k) continue;
            let A = L + C,
              F = U + k;
            if (A < 0 || F < 0 || A >= f0 || F >= co) continue;
            let H = F * f0 + A;
            if (i[H] || m[H] === x || (C && k && (i[U * f0 + A] || i[F * f0 + L]))) continue;
            let N = h[I] + (C && k ? 1.4142 : 1);
            (d[H] !== x || N < h[H]) && ((h[H] = N), (d[H] = x), (p[H] = I), b(H, N + S(H)));
          }
      }
      if (d[_] !== x) return null;
      let z = [];
      for (let I = _; I !== -1; I = p[I]) z.push(I);
      return (z.reverse(), z);
    }
    return o;
  }
  export function x_(n) {
    return n.isVector3 ? n.clone() : new K(n[0], n[1], n[2]);
  }
