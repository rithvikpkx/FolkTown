// Fragment shaders for the post chain, adapted from Saltline (reference/saltline/sky-shadows-post.txt).
// Rain, damage, ADS, lens dirt/streak/fringe and motion blur are left out (docs/known-gaps.md #2).

export const VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const COMMON = /* glsl */ `
varying vec2 vUv;
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
uniform mat4 uProjInv;
vec3 viewPos(vec2 uv, float d){ vec4 p = uProjInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return p.xyz / p.w; }
`;

/** Half-size ambient occlusion: spiral taps, normals from depth derivatives. Result in .r. */
export const AO = /* glsl */ `${COMMON}
uniform sampler2D tDepth;
uniform float uRadius, uIntensity, uFocal, uAspect;
void main(){
  float d0 = texture2D(tDepth, vUv).r;
  if (d0 >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec3 P = viewPos(vUv, d0);
  vec3 n = normalize(cross(dFdx(P), dFdy(P)));
  if (dot(n, P) > 0.0) n = -n;
  float rv = uRadius * uFocal / max(-P.z, 0.1);
  vec2 ruv = vec2(rv / uAspect, rv);
  float ang = ign(gl_FragCoord.xy) * 6.2831853;
  float occ = 0.0;
  for (int i = 0; i < AO_TAPS; i++) {
    float t = (float(i) + 0.5) / float(AO_TAPS);
    float a = ang + float(i) * 2.39996323;
    vec2 suv = vUv + vec2(cos(a), sin(a)) * mix(0.15, 1.0, t) * ruv;
    vec3 v = viewPos(suv, texture2D(tDepth, suv).r) - P;
    float len = length(v);
    occ += max(dot(n, v) / max(len, 1e-3) - 0.12, 0.0) * (1.0 - smoothstep(0.5 * uRadius, 1.6 * uRadius, len));
  }
  gl_FragColor = vec4(clamp(1.0 - uIntensity * occ / float(AO_TAPS), 0.0, 1.0), 0.0, 0.0, 1.0);
}`;

/** Depth-aware separable blur for the half-size AO and haze buffers. */
export const BLUR = /* glsl */ `${COMMON}
uniform sampler2D tSrc, tDepth;
uniform vec2 uDir;
uniform float uTol;
void main(){
  float dc = -viewPos(vUv, texture2D(tDepth, vUv).r).z;
  vec4 sum = texture2D(tSrc, vUv) * 3.0; float ws = 3.0;
  for (int i = -2; i <= 2; i++) {
    if (i == 0) continue;
    vec2 uv = vUv + uDir * float(i);
    float w = (3.0 - abs(float(i))) * exp(-abs(-viewPos(uv, texture2D(tDepth, uv).r).z - dc) / (max(dc, 0.1) * uTol));
    sum += texture2D(tSrc, uv) * w; ws += w;
  }
  gl_FragColor = sum / ws;
}`;

/** Half-size ray-marched haze with sun shafts, against the sun shadow map. rgb = in-scatter, a = transmittance. */
export const HAZE = /* glsl */ `${COMMON}
uniform sampler2D tDepth, tShadow;
uniform mat4 uCamWorld, uShadowMat;
uniform vec3 uCamPos, uSunDir, uSunRad, uAmb;
uniform float uHasShadow, uMaxDist, uSigma, uFalloff;
void main(){
  float d = texture2D(tDepth, vUv).r;
  vec3 wp = (uCamWorld * vec4(viewPos(vUv, d), 1.0)).xyz;
  vec3 ray = wp - uCamPos;
  float dist = length(ray);
  vec3 rd = ray / max(dist, 1e-4);
  float L = min(dist, uMaxDist);
  float stepL = L / float(VOL_STEPS);
  float j = ign(gl_FragCoord.xy);
  float cosT = dot(rd, uSunDir);
  const float g = 0.55;
  float phase = mix(0.0796, (1.0 - g * g) / (12.566 * pow(1.0 + g * g - 2.0 * g * cosT, 1.5)), 0.75);
  float tau = 0.0;
  vec3 scat = vec3(0.0);
  for (int i = 0; i < VOL_STEPS; i++) {
    vec3 p = uCamPos + rd * ((float(i) + j) * stepL);
    float dens = uSigma * exp(-max(p.y, 0.0) * uFalloff);
    float lit = 1.0;
    if (uHasShadow > 0.5) {
      vec4 sc = uShadowMat * vec4(p, 1.0);
      if (sc.x > 0.0 && sc.x < 1.0 && sc.y > 0.0 && sc.y < 1.0 && sc.z < 1.0) lit = step(sc.z - 0.003, texture2D(tShadow, sc.xy).r);
    }
    tau += dens * stepL;
    scat += uSunRad * (lit * phase) * (dens * stepL * exp(-tau));
  }
  // beyond the march range only the ambient haze keeps thickening, so far buildings melt into the horizon
  float far = exp(-uSigma * 0.7 * max(dist - uMaxDist, 0.0));
  float trans = exp(-tau) * far;
  gl_FragColor = vec4(scat * far + uAmb * (1.0 - trans), trans);
}`;

/** Full-size composite: occlusion on ambient only (faded on bright pixels), then haze. */
export const COMPOSITE = /* glsl */ `
varying vec2 vUv;
uniform sampler2D tColor, tAO, tVol;
uniform float uAoStrength, uAoOn, uVolOn;
void main(){
  vec3 col = texture2D(tColor, vUv).rgb;
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  if (uAoOn > 0.5) col *= mix(1.0, texture2D(tAO, vUv).r, uAoStrength * (1.0 - smoothstep(1.0, 4.0, l)));
  if (uVolOn > 0.5) { vec4 v = texture2D(tVol, vUv); col = col * v.a + v.rgb; }
  gl_FragColor = vec4(col, 1.0);
}`;

/** 13-tap downsample; the first level is firefly-suppressed (Karis average). */
export const DOWN = /* glsl */ `
varying vec2 vUv;
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uFirst;
vec3 s(float x, float y){ return texture2D(tSrc, vUv + vec2(x, y) * uTexel).rgb; }
float kw(vec3 c){ return 1.0 / (1.0 + dot(c, vec3(0.2126, 0.7152, 0.0722))); }
void main(){
  vec3 A = s(-2.,2.), B = s(0.,2.), C = s(2.,2.), D = s(-2.,0.), E = s(0.,0.), F = s(2.,0.), G = s(-2.,-2.), H = s(0.,-2.), I = s(2.,-2.);
  vec3 J = s(-1.,1.), K = s(1.,1.), L = s(-1.,-1.), M = s(1.,-1.);
  vec3 r;
  if (uFirst > 0.5) {
    vec3 g0 = (A + B + D + E) * 0.25, g1 = (B + C + E + F) * 0.25, g2 = (D + E + G + H) * 0.25, g3 = (E + F + H + I) * 0.25, g4 = (J + K + L + M) * 0.25;
    float w0 = 0.125 * kw(g0), w1 = 0.125 * kw(g1), w2 = 0.125 * kw(g2), w3 = 0.125 * kw(g3), w4 = 0.5 * kw(g4);
    r = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
  } else {
    r = E * 0.125 + (A + C + G + I) * 0.03125 + (B + D + F + H) * 0.0625 + (J + K + L + M) * 0.125;
  }
  gl_FragColor = vec4(r, 1.0);
}`;

/** Tent-filtered upsample blended with the next level up (energy conserving). */
export const UP = /* glsl */ `
varying vec2 vUv;
uniform sampler2D tLow, tHigh; uniform vec2 uTexel; uniform float uMix;
vec3 s(float x, float y){ return texture2D(tLow, vUv + vec2(x, y) * uTexel).rgb; }
void main(){
  vec3 t = s(-1.,1.) + s(1.,1.) + s(-1.,-1.) + s(1.,-1.) + 2.0 * (s(0.,1.) + s(-1.,0.) + s(1.,0.) + s(0.,-1.)) + 4.0 * s(0., 0.);
  gl_FragColor = vec4(mix(texture2D(tHigh, vUv).rgb, t / 16.0, uMix), 1.0);
}`;

/** Eye adaptation: centre-weighted log-average luminance of the smallest bloom level, eased over time. */
export const ADAPT = /* glsl */ `
varying vec2 vUv;
uniform sampler2D tPrev, tLum; uniform float uRate;
void main(){
  float sum = 0.0, ws = 0.0;
  for (int i = 0; i < 5; i++) for (int j = 0; j < 5; j++) {
    vec2 uv = (vec2(float(i), float(j)) + 0.5) / 5.0;
    float w = exp(-dot(uv - 0.5, uv - 0.5) * 8.0);
    sum += log(max(dot(texture2D(tLum, uv).rgb, vec3(0.2126, 0.7152, 0.0722)), 1e-4)) * w; ws += w;
  }
  float target = exp(sum / ws);
  float prev = texture2D(tPrev, vec2(0.5)).r;
  gl_FragColor = vec4(exp(mix(log(prev), log(target), uRate)), 0.0, 0.0, 1.0);
}`;

/** Bloom mix, mild lens flare, exposure, ACES/AgX curve, grade, vignette, sRGB. Alpha = luma for FXAA. */
export const GRADE = /* glsl */ `
varying vec2 vUv;
uniform sampler2D tScene, tBloom, tAdapt, tDepth;
uniform vec3 uSunCol;
uniform vec2 uSunUv;
uniform float uAspect, uBloom, uFlare, uVignette, uAgxMix, uSunOn, uKey, uMinE, uMaxE;
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
const mat3 SL_REC2020_TO_SRGB = mat3(vec3(1.6605, -0.1246, -0.0182), vec3(-0.5876, 1.1329, -0.1006), vec3(-0.0728, -0.0083, 1.1187));
const mat3 SL_SRGB_TO_REC2020 = mat3(vec3(0.6274, 0.0691, 0.0164), vec3(0.3293, 0.9195, 0.0880), vec3(0.0433, 0.0113, 0.8956));
vec3 slAgxContrast(vec3 x){ vec3 x2 = x * x; vec3 x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 slAgx(vec3 color){
  const mat3 inset = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 outset = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  const float minEv = -12.47393, maxEv = 4.026069;
  color = inset * (SL_SRGB_TO_REC2020 * color);
  color = clamp((log2(max(color, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
  color = slAgxContrast(color);
  float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = pow(max(color, vec3(0.0)), vec3(LOOK_POWER));
  color = l + (color - l) * LOOK_SAT;
  color = outset * color;
  color = pow(max(color, vec3(0.0)), vec3(2.2));
  return clamp(SL_REC2020_TO_SRGB * color, 0.0, 1.0);
}
vec3 slRRTODT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 slAces(vec3 c){
  const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  return clamp(outM * slRRTODT(inM * (c * 1.3)), 0.0, 1.0);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

vec3 flare(vec2 uv, vec2 sun, float vis){
  vec2 asp = vec2(uAspect, 1.0);
  vec2 p = (uv - 0.5) * asp, s = (sun - 0.5) * asp;
  vec2 dv = p - s; float r = length(dv);
  vec3 c = uSunCol * (0.020 / (r * r * 9.0 + 0.010) + 0.10 * exp(-r * 3.2));
  vec3 g = vec3(0.0);
  g += vec3(0.30, 0.75, 0.55) * smoothstep(0.085, 0.06, length(p + s * 0.38)) * 0.050;
  g += vec3(0.85, 0.45, 0.25) * smoothstep(0.045, 0.030, length(p + s * 0.82)) * 0.075;
  float k2 = length(p + s * 1.35);
  g += vec3(0.35, 0.50, 0.95) * smoothstep(0.17, 0.12, k2) * (0.4 + 0.6 * smoothstep(0.05, 0.16, k2)) * 0.040;
  c += g * uSunCol * 2.4;
  return c * vis;
}

void main(){
  vec2 c = vUv - 0.5;
  float r2 = dot(c * vec2(uAspect, 1.0), c * vec2(uAspect, 1.0)) / (0.25 * (uAspect * uAspect + 1.0));
  vec3 col = texture2D(tScene, vUv).rgb;
  col = mix(col, texture2D(tBloom, vUv).rgb, uBloom);
  // flare, only while the sun itself is visible (sky pixels around it)
  if (uSunOn > 0.5) {
    float vis = 0.0;
    for (int i = 0; i < 9; i++) {
      vec2 o = (vec2(float(i - 3 * (i / 3)), float(i / 3)) - 1.0) * 0.012;
      vis += step(0.99999, texture2D(tDepth, clamp(uSunUv + o, 0.0, 1.0)).r);
    }
    vec2 e = abs(uSunUv - 0.5) * 2.0;
    col += flare(vUv, uSunUv, vis / 9.0 * uFlare * (1.0 - smoothstep(1.0, 1.3, max(e.x, e.y))));
  }
  float a = texture2D(tAdapt, vec2(0.5)).r;
  col *= clamp(pow(uKey / max(a, 1e-4), 0.85), uMinE, uMaxE);
  col = mix(slAces(col), slAgx(col), uAgxMix);
  float l = luma(col);
  col *= mix(vec3(0.80, 1.01, 1.13), vec3(1.07, 1.0, 0.90), smoothstep(0.03, 0.55, l));
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.22);
  col = col * 0.988 + vec3(0.006, 0.0085, 0.011);
  float vr = smoothstep(0.15, 1.05, r2);
  col *= 1.0 - uVignette * vr * vr * (3.0 - 2.0 * vr);
  col = toSRGB(clamp(col, 0.0, 1.0));
  gl_FragColor = vec4(col, dot(col, vec3(0.299, 0.587, 0.114)));
}`;

/** FXAA, light unsharp mask, luminance-weighted grain and a one-bit dither. */
export const FINAL = /* glsl */ `
varying vec2 vUv;
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uTime, uGrain, uSharpen;
void main(){
  vec4 M = texture2D(tSrc, vUv);
  vec3 col = M.rgb;
  vec4 NW = texture2D(tSrc, vUv + vec2(-1.0, -1.0) * uTexel), NE = texture2D(tSrc, vUv + vec2(1.0, -1.0) * uTexel);
  vec4 SW = texture2D(tSrc, vUv + vec2(-1.0, 1.0) * uTexel), SE = texture2D(tSrc, vUv + vec2(1.0, 1.0) * uTexel);
  float lMin = min(M.a, min(min(NW.a, NE.a), min(SW.a, SE.a)));
  float lMax = max(M.a, max(max(NW.a, NE.a), max(SW.a, SE.a)));
  float contrast = lMax - lMin;
  if (contrast > max(0.0312, lMax * 0.10)) {
    vec2 dir = vec2(-((NW.a + NE.a) - (SW.a + SE.a)), (NW.a + SW.a) - (NE.a + SE.a));
    float dirReduce = max((NW.a + NE.a + SW.a + SE.a) * 0.03125, 0.0078125);
    float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * uTexel;
    vec4 A = 0.5 * (texture2D(tSrc, vUv + dir * (1.0 / 3.0 - 0.5)) + texture2D(tSrc, vUv + dir * (2.0 / 3.0 - 0.5)));
    vec4 B = A * 0.5 + 0.25 * (texture2D(tSrc, vUv - dir * 0.5) + texture2D(tSrc, vUv + dir * 0.5));
    col = (B.a < lMin || B.a > lMax) ? A.rgb : B.rgb;
  }
  vec3 blur = (NW.rgb + NE.rgb + SW.rgb + SE.rgb) * 0.25;
  col += (M.rgb - blur) * uSharpen * (1.0 - smoothstep(0.04, 0.22, contrast));
  vec2 seed = gl_FragCoord.xy + fract(uTime * vec2(7.31, 3.17)) * vec2(311.7, 173.3);
  float g = hash12(seed) + hash12(seed + 57.3) - 1.0;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col += g * uGrain * mix(1.0, 0.30, smoothstep(0.25, 0.9, l)) * (0.35 + 0.65 * smoothstep(0.0, 0.08, l));
  col += (hash12(gl_FragCoord.xy * 1.37 + 11.0) + hash12(gl_FragCoord.xy * 0.71 + 3.0) - 1.0) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;
