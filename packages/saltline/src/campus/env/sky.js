// Walk-mode sky and light: Poly Haven HDRIs (CC0, 2k, tonemapped to jpg by tools offline) replace Saltline's procedural dusk deck.
// URL: ?tod=morning|noon|afternoon|sunset|overcast (default morning), ?exposure=1.0.
// applyEarly() must run before render init (it mutates the shared sun/fog constants); installSky(G) runs after the level exists.
import { BackSide, BoxGeometry, Mesh, PMREMGenerator, Scene, ShaderMaterial, SRGBColorSpace, TextureLoader, LinearFilter, Color, EquirectangularReflectionMapping, Vector3 } from 'three';
import { Z0, T0 } from '../../game/common.js';

const BASE = import.meta.env.BASE_URL + 'campus/env/sky/';
const D = Math.PI / 180;
// az = compass bearing of the sun (deg, clockwise from north); hdriAz/el = where the sun sits in the source image
export const PRESETS = {
  morning: { file: 'qwantani_mid_morning_puresky', az: 150, el: 40.1, hdriAz: 36.05, sun: [1.0, 0.95, 0.85], power: 7, exp: 1.0, env: 0.9, haze: [0.62, 0.7, 0.8], gain: 1.8 },
  noon: { file: 'qwantani_noon_puresky', az: 180, el: 49.8, hdriAz: 36.18, sun: [1.0, 0.97, 0.9], power: 8, exp: 0.95, env: 0.9, haze: [0.64, 0.72, 0.82], gain: 1.8 },
  afternoon: { file: 'qwantani_late_afternoon_puresky', az: 235, el: 19.1, hdriAz: 36.13, sun: [1.0, 0.82, 0.6], power: 6, exp: 1.05, env: 0.85, haze: [0.7, 0.68, 0.68], gain: 1.8 },
  sunset: { file: 'qwantani_sunset_puresky', az: 255, el: 6.1, hdriAz: 36.03, sun: [1.0, 0.6, 0.32], power: 5, exp: 1.2, env: 0.8, haze: [0.7, 0.55, 0.5], gain: 1.8 },
  overcast: { file: 'kloofendal_overcast_puresky', az: 150, el: 22.6, hdriAz: 33.0, sun: [0.85, 0.9, 1.0], power: 0.8, exp: 1.1, env: 1.3, haze: [0.68, 0.71, 0.75], gain: 1.8 },
};

const q = new URLSearchParams(typeof location === 'undefined' ? '' : location.search);
export const TOD = PRESETS[q.get('tod')] ? q.get('tod') : 'morning';
const P = PRESETS[TOD];
// world frame: x east, z south. Direction TO the sun.
const sunDir = () => {
  const e = P.el * D, a = P.az * D;
  return new Vector3(Math.cos(e) * Math.sin(a), Math.sin(e), -Math.cos(e) * Math.cos(a)).normalize();
};

export function applyEarly() {
  Z0.dir.copy(sunDir());
  Z0.color.setRGB(...P.sun);
  Z0.intensity = P.power;
  T0.fog.setRGB(...P.haze).multiplyScalar(0.8);
  T0.zenith.setRGB(0.2, 0.32, 0.55);
  T0.horizon.setRGB(...P.haze);
  T0.horizonAway.setRGB(...P.haze);
}

// yaw so the HDRI's sun lands on our sun azimuth: world atan2(z,x) of sun vs the image's phi
const yaw = () => { const s = sunDir(); return Math.atan2(s.z, s.x) - P.hdriAz * D; };

const FRAG = `// SALTLINE_SKY
uniform sampler2D tSky; uniform float uYaw, uGain; uniform vec3 uHaze, uGround;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  vec2 uv = vec2((atan(d.z, d.x) - uYaw) / 6.2831853 + 0.5, 0.5 + asin(clamp(d.y, -1.0, 1.0)) / 3.14159265);
  vec3 c = texture2D(tSky, vec2(fract(uv.x), uv.y)).rgb * uGain;
  float hz = exp(-max(d.y, 0.0) * 7.0);
  c = mix(c, vec3(dot(c, vec3(0.333)) * 1.05 + 0.02), 0.5);    // pale, slightly milky like the reference photos
  c = mix(c, uHaze, hz * 0.6);                       // light haze toward the horizon
  c = mix(c, uGround, smoothstep(0.0, -0.12, d.y));   // below horizon: ground bounce colour (env capture)
  gl_FragColor = vec4(max(c, vec3(0.0)), 1.0);
}`;

export async function installSky(G) {
  const R = G.render;
  if (!R || !R.sky) return;
  const tex = await new Promise((res, rej) => new TextureLoader().load(BASE + P.file + '.jpg', res, undefined, rej));
  tex.colorSpace = SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = tex.magFilter = LinearFilter; tex.mapping = EquirectangularReflectionMapping;
  const mat = R.sky.material;
  Object.assign(mat.uniforms, {
    tSky: { value: tex }, uYaw: { value: yaw() }, uGain: { value: P.gain },
    uHaze: { value: new Color().setRGB(...P.haze) }, uGround: { value: new Color(0.3, 0.32, 0.27) },
  });
  mat.fragmentShader = FRAG;
  mat.needsUpdate = true;
  // image-based lighting from the same dome
  try {
    const m2 = mat.clone();
    Object.assign(m2.uniforms, { ...mat.uniforms });
    const s = new Scene(), env = new Mesh(R.sky.geometry, m2);
    env.frustumCulled = false; s.add(env);
    const pm = new PMREMGenerator(R.renderer);
    const rt = pm.fromScene(s, 0, 0.1, 100);
    pm.dispose();
    G.scene.environment = rt.texture;
    G.scene.environmentIntensity = P.env;
    R.env = rt.texture;
  } catch (e) { console.error('[env] environment capture failed', e); }
  R.exposure = P.exp * (parseFloat(q.get('exposure')) || 1);
}
