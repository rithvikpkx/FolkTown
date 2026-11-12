import type { MaterialName } from './table';

/** Shared GLSL: hash, tileable value noise, fbm, and the pass that writes colour/normal/roughness. */
export const COMMON = /* glsl */ `
precision highp float;
precision highp int;
in vec2 vUv;
layout(location = 0) out vec4 o0;
layout(location = 1) out vec4 o1;
layout(location = 2) out vec4 o2;
float hash(int x, int y, int s) {
  uint h = uint(x) * 374761393u ^ uint(y) * 668265263u ^ uint(s) * 2147483647u;
  h = (h ^ (h >> 13)) * 1274126177u;
  return float(h ^ (h >> 16)) / 4294967296.0;
}
float vnoise(vec2 p, ivec2 per, int s) {
  vec2 i = floor(p), f = p - i, u = f * f * (3.0 - 2.0 * f);
  ivec2 a = ivec2(i);
  int x0 = ((a.x % per.x) + per.x) % per.x, y0 = ((a.y % per.y) + per.y) % per.y;
  int x1 = (x0 + 1) % per.x, y1 = (y0 + 1) % per.y;
  float h00 = hash(x0, y0, s), h10 = hash(x1, y0, s), h01 = hash(x0, y1, s), h11 = hash(x1, y1, s);
  return h00 + (h10 - h00) * u.x + (h01 - h00) * u.y + (h00 - h10 - h01 + h11) * u.x * u.y;
}
float fbm(vec2 uv, ivec2 p, int s, int o) {
  vec2 q = uv * vec2(p);
  float f = 0.0, a = 0.5, t = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i >= o) break;
    f += a * vnoise(q, p, s + i * 17);
    t += a; q *= 2.0; p *= 2; a *= 0.5;
  }
  return f / t;
}
float fbm(vec2 uv, int p, int s, int o) { return fbm(uv, ivec2(p), s, o); }
float sstep(float a, float b, float x) { return smoothstep(a, b, x); }
// surfaces are authored as sRGB byte values, converted to linear on output
vec3 lin(vec3 b) {
  vec3 c = clamp(b / 255.0, 0.0, 1.0);
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
void surf(vec2 uv, out vec3 c, out float h, out float r);
void main() {
  vec3 c, t; float h, r, x0, x1, y0, y1, rr;
  float e = 1.0 / N;
  surf(vUv, c, h, r);
  surf(vUv - vec2(e, 0.0), t, x0, rr);
  surf(vUv + vec2(e, 0.0), t, x1, rr);
  surf(vUv - vec2(0.0, e), t, y0, rr);
  surf(vUv + vec2(0.0, e), t, y1, rr);
  vec3 n = normalize(vec3((x0 - x1) * BUMP, (y0 - y1) * BUMP, 1.0));
  o0 = vec4(lin(c), 1.0);
  o1 = vec4(n * 0.5 + 0.5, 1.0);
  o2 = vec4(vec3(clamp(r, 0.0, 1.0)), 1.0);
}
`;

// staggered courses shared by brick, limestone and pavers; returns (cell x, row, edge distance px)
const COURSES = /* glsl */ `
vec3 courses(vec2 px, float bw, float bh) {
  float row = floor(px.y / bh), fy = px.y - row * bh;
  float xx = mod(px.x + (mod(row, 2.0) > 0.5 ? bw * 0.5 : 0.0), N);
  float ci = floor(xx / bw), fx = xx - ci * bw;
  return vec3(ci, row, min(min(fx, bw - fx), min(fy, bh - fy)));
}
`;

export const SURFACES: Record<MaterialName, string> = {
  brick: /* glsl */ `${COURSES}
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  float M = 5.0 * N / 1024.0;
  vec3 k = courses(uv * N, N / 8.0, N / 24.0);
  float e = k.z;
  float g = fbm(uv, 64, 7, 3), big = fbm(uv, 4, 11, 3), pit = fbm(uv, 160, 19, 2);
  if (e < M / 2.0) {
    float m = 150.0 + g * 30.0 - big * 26.0;
    c = vec3(m, m * 0.95, m * 0.87); h = 0.18 + g * 0.1; r = 0.97;
  } else {
    float h1 = hash(int(k.x), int(k.y), 3), h2 = hash(int(k.x), int(k.y), 9);
    vec3 b = vec3(140.0, 70.0, 52.0);
    if (h1 < 0.07) b = vec3(72.0, 46.0, 42.0);
    else if (h1 < 0.22) b = vec3(100.0, 52.0, 44.0);
    else if (h1 < 0.42) b = vec3(160.0, 92.0, 64.0);
    else if (h1 < 0.52) b = vec3(118.0, 64.0, 60.0);
    float s = (0.78 + g * 0.44) * (0.86 + big * 0.28) * (0.84 + h2 * 0.32) * (pit < 0.3 ? 0.8 : 1.0);
    c = b * s;
    h = 0.5 + min(1.0, (e - M / 2.0) / (4.0 * N / 1024.0)) * 0.38 + g * 0.14 - (pit < 0.3 ? 0.12 : 0.0);
    r = 0.74 + g * 0.2;
  }
}`,
  limestone: /* glsl */ `${COURSES}
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  vec3 k = courses(uv * N, N / 2.0, N / 4.0);
  float g = fbm(uv, 48, 21, 4), big = fbm(uv, 3, 5, 3), hh = hash(int(k.x), int(k.y), 31);
  float st = fbm(uv, ivec2(24, 3), 37, 3);
  float s = (0.86 + g * 0.22) * (0.92 + hh * 0.12) * (0.86 + big * 0.2) * (0.9 + st * 0.16);
  if (k.z < 1.6) { c = vec3(140.0, 132.0, 116.0) * s; h = 0.3; r = 0.95; }
  else { c = vec3(208.0, 198.0, 176.0) * s; h = 0.72 + g * 0.22; r = 0.78 + g * 0.14; }
}`,
  pavers: /* glsl */ `${COURSES}
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  vec3 k = courses(uv * N, N / 4.0, N / 8.0);
  float g = fbm(uv, 96, 41, 3), big = fbm(uv, 3, 43, 3);
  float h1 = hash(int(k.x), int(k.y), 47), h2 = hash(int(k.x), int(k.y), 53);
  float s = (0.8 + g * 0.34) * (0.84 + h1 * 0.26) * (1.0 - sstep(0.52, 0.66, big) * 0.2);
  if (k.z < 2.0) { c = vec3(58.0, 54.0, 50.0) * s; h = 0.2; r = 0.95; }
  else {
    vec3 b = vec3(150.0, 138.0, 124.0);
    if (h2 < 0.3) b = vec3(128.0, 120.0, 114.0); else if (h2 < 0.5) b = vec3(166.0, 146.0, 122.0);
    c = b * s; h = 0.66 + g * 0.24 + min(1.0, (k.z - 2.0) / 3.0) * 0.1; r = 0.86 + g * 0.1;
  }
}`,
  asphalt: /* glsl */ `
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  ivec2 p = ivec2(uv * N);
  float g = fbm(uv, 128, 61, 2), big = fbm(uv, 5, 67, 3), dark = sstep(0.5, 0.62, big);
  float agg = hash(p.x, p.y, 5) > 0.955 ? 1.0 : 0.0;
  float crack = abs(fbm(uv, 9, 113, 4) - 0.5) < 0.006 ? 1.0 : 0.0;
  float v = (44.0 + g * 36.0 + agg * 46.0) * (1.0 - dark * 0.3) * (1.0 - crack * 0.7);
  c = vec3(v, v, v + 4.0); h = (g + agg * 0.5) * (1.0 - dark * 0.5) - crack * 0.8; r = 0.93;
}`,
  grass: /* glsl */ `
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  float g = fbm(uv, 96, 71, 3), big = fbm(uv, 6, 73, 3), s = 0.7 + big * 0.5;
  c = vec3(44.0 + g * 46.0, 74.0 + g * 58.0, 28.0 + g * 26.0) * s; h = g; r = 0.95;
}`,
  bark: /* glsl */ `
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  float g = fbm(uv, ivec2(20, 4), 131, 4), f = fbm(uv, 60, 133, 2), k = 0.55 + g * 0.7;
  c = vec3(74.0, 60.0, 48.0) * k; h = g + f * 0.3; r = 0.95;
}`,
  metal: /* glsl */ `
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  float g = fbm(uv, 90, 141, 3), sc = fbm(uv, ivec2(6, 120), 143, 2);
  float s = sc > 0.72 ? 1.0 : 0.0, k = 200.0 + g * 40.0 + s * 30.0;
  c = vec3(k); h = g * 0.6 + s * 0.5; r = 0.34 + g * 0.22 - s * 0.12;
}`,
  verdigris: /* glsl */ `
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  // oxidised copper roofing: blue-green patina, vertical standing seams every 1/4 repeat, streaky bare-copper tint
  float g = fbm(uv, 70, 171, 3), st = fbm(uv, ivec2(24, 3), 173, 3), big = fbm(uv, 4, 177, 3);
  float seam = abs(fract(uv.x * 4.0) - 0.5) > 0.47 ? 1.0 : 0.0;
  vec3 b = mix(vec3(92.0, 150.0, 128.0), vec3(122.0, 176.0, 152.0), big);
  b = mix(b, vec3(84.0, 112.0, 88.0), sstep(0.62, 0.8, st) * 0.6);
  c = b * (0.82 + g * 0.3) * (1.0 - seam * 0.25); h = g * 0.5 + seam * 0.6; r = 0.6 + g * 0.25;
}`,
  polymer: /* glsl */ `
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  ivec2 p = ivec2(uv * N) / 2;
  float f = fbm(uv, 30, 153, 2);
  c = vec3(205.0 + f * 40.0); h = hash(p.x, p.y, 151); r = 0.8 + f * 0.18;
}`,
  fabric: /* glsl */ `
void surf(vec2 uv, out vec3 c, out float h, out float r) {
  ivec2 p = ivec2(uv * N);
  float w = hash(p.x, p.y, 163), b1 = fbm(uv, 4, 161, 4), b2 = fbm(uv, 6, 167, 4);
  vec3 b = vec3(104.0, 104.0, 80.0);
  if (b1 > 0.58) b = vec3(62.0, 66.0, 50.0); else if (b2 > 0.6) b = vec3(140.0, 132.0, 104.0);
  else if (b2 < 0.36) b = vec3(48.0, 46.0, 40.0);
  c = b * (0.9 + w * 0.1); h = w; r = 0.95;
}`,
};

/** World-space detail (fragment, after `common`). Octaves fade out with the pixel footprint so they never shimmer. */
export const DETAIL = /* glsl */ `
float dh3(vec3 p) {
  uvec3 q = uvec3(ivec3(p)) * uvec3(374761393u, 668265263u, 2147483647u);
  uint h = (q.x ^ q.y ^ q.z); h = (h ^ (h >> 13)) * 1274126177u;
  return float(h ^ (h >> 16)) / 4294967296.0;
}
float dn3(vec3 p) {
  vec3 i = floor(p), f = p - i, u = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(dh3(i), dh3(i + vec3(1, 0, 0)), u.x), mix(dh3(i + vec3(0, 1, 0)), dh3(i + vec3(1, 1, 0)), u.x), u.y);
  float b = mix(mix(dh3(i + vec3(0, 0, 1)), dh3(i + vec3(1, 0, 1)), u.x), mix(dh3(i + vec3(0, 1, 1)), dh3(i + vec3(1, 1, 1)), u.x), u.y);
  return mix(a, b, u.z);
}
float dfbm(vec3 p, float foot, float f0) { // 4 octaves; each fades once its cell is under ~2 pixels
  float s = 0.0, a = 0.5, t = 0.0, fr = f0;
  for (int i = 0; i < 3; i++) {
    float w = 1.0 - smoothstep(0.35, 0.8, foot * fr);
    s += a * w * dn3(p * fr + float(i) * 7.3); t += a * w; a *= 0.5; fr *= 2.1;
  }
  return t > 0.0 ? s / t : 0.5;
}
// modifies albedo, returns the height field used for bump; r is a roughness offset
float detail(inout vec3 albedo, out float r) {
  float foot = length(fwidth(vWp));
  float cellf = 1.0 / CELL;
  float g = dfbm(vWp, foot, cellf);          // centimetre grit
  float m = dfbm(vWp * 0.21 + 3.1, foot * 0.21, cellf * 0.25); // decimetre mottling
  float big = dn3(vWp * 0.35 + 9.0);           // metre-scale blotches
  float side = 1.0 - abs(vWn.y);
  float k = 1.0 + (g - 0.5) * 2.0 * DCOL + (m - 0.5) * DCOL;
  float h = g;
  r = (g - 0.5) * DRV;
#if MODE == 1
  // masonry: rain streaks running down walls, splash zone and soot near the ground, damp-dark blotches
  float streak = dfbm(vec3(vWp.x * 3.0 + vWp.z * 3.0, vWp.y * 0.35, vWp.x * 0.2 + vWp.z * 0.2), foot * 3.0, 1.0);
  float grime = side * (smoothstep(0.55, 0.9, streak) * 0.18 + (1.0 - smoothstep(0.0, 1.2, vWp.y)) * 0.25 * (0.5 + m));
  k *= 1.0 - grime;
  albedo = mix(albedo, albedo * vec3(0.9, 0.95, 1.0), smoothstep(0.55, 0.75, big) * 0.3 * side);
  r += grime * 0.1;
#elif MODE == 2
  // ground: dirt and wear patches, loose grit
  float wear = smoothstep(0.45, 0.8, big);
  k *= 1.0 - wear * 0.18;
  albedo = mix(albedo, albedo * vec3(1.06, 1.0, 0.9), wear * 0.5);
  r += wear * 0.1;
#elif MODE == 3
  // metal: rust bloom in blotches, fine scratches that catch the light
  float rust = smoothstep(0.58, 0.78, dfbm(vWp * 1.7, foot * 1.7, 2.0) * 0.6 + m * 0.4);
  albedo = mix(albedo, vec3(0.36, 0.16, 0.07), rust * 0.55);
  r += rust * 0.45 - smoothstep(0.7, 0.9, dn3(vec3(vWp.x * 60.0, vWp.y * 2.0, vWp.z * 60.0))) * 0.15;
  h += rust * 0.6;
#elif MODE == 4
  // turf: blade-scale colour jitter, dry patches and clover-dark clumps
  float dry = smoothstep(0.5, 0.8, big);
  albedo = mix(albedo, albedo * vec3(1.35, 1.1, 0.55), dry * 0.45);
  k *= 0.85 + m * 0.3;
#endif
  albedo *= k;
  return h;
}
vec3 bumpNormal(vec3 n, float h, vec3 pos, float faceDirection) {
  // Mikkelsen surface-gradient bump from screen-space derivatives of the height
  vec3 sx = dFdx(pos), sy = dFdy(pos);
  vec3 r1 = cross(sy, n), r2 = cross(n, sx);
  float det = dot(sx, r1) * faceDirection;
  float hm = h * DBUMP * CELL * 0.5; // metres of relief
  vec3 grad = sign(det) * (dFdx(hm) * r1 + dFdy(hm) * r2);
  return normalize(abs(det) * n - grad);
}
`;
