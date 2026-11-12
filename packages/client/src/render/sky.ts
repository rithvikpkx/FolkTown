import {
  BackSide,
  Color,
  Mesh,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';

// Late afternoon, about 5 pm: a low, warm sun ahead and to the right of the default view. Linear colours.
export const SUN = {
  dir: new Vector3(0.45, 0.26, -0.85).normalize(),
  color: new Color(1.0, 0.6, 0.3),
  /** Directional light intensity; also drives sky glow and haze. */
  intensity: 3.2,
  zenith: new Color(0.1, 0.2, 0.45),
  horizon: new Color(0.95, 0.55, 0.32),
};

const frag = /* glsl */ `
varying vec3 vDir;
uniform vec3 uSunDir, uSunCol, uZen, uHor;
uniform float uTime, uDisk;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
void main(){
  vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);
  float mu = dot(d, uSunDir);
  float s = max(mu, 0.0);
  float ts = 0.5 + 0.5 * mu;
  vec3 hc = mix(uHor, uHor * vec3(1.3, 0.85, 0.55), pow(ts, 3.0));
  vec3 col = mix(hc, uZen, pow(smoothstep(0.0, 0.75, h), 0.55));
  // mie glow round the sun
  col += uSunCol * vec3(1.0, 0.86, 0.68) * (pow(s, 8.0) * 0.14 + uDisk * (pow(s, 64.0) * 0.55 + pow(s, 600.0) * 2.2));
  // a thin deck of cloud, lit warm from the low sun
  vec2 uv = d.xz / (h + 0.14) * vec2(0.8, 1.2) + vec2(uTime * 0.004, 0.0);
  float c = fbm(uv * 1.3);
  float cov = smoothstep(0.48, 0.78, c) * smoothstep(0.0, 0.14, h);
  vec3 cloud = mix(uZen * 1.6 + 0.05, uHor * vec3(1.9, 1.0, 0.6), pow(ts, 2.0));
  cloud *= 0.75 + 0.5 * smoothstep(0.4, 0.8, fbm(uv * 1.3 + uSunDir.xz * 0.3));
  col = mix(col, cloud, cov * 0.85);
  col += uSunCol * smoothstep(0.99985, 0.99996, mu) * 45.0 * (1.0 - cov) * uDisk;
  if (d.y < 0.0) col = mix(hc, hc * 0.45, smoothstep(0.0, 0.3, -d.y)) * mix(0.3, 1.0, uDisk); // env capture: dim ground bounce
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const vert = /* glsl */ `
varying vec3 vDir;
void main(){ vDir = position; gl_Position = (projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0)).xyww; }`;

/** Sky dome pinned at the far plane (depth exactly 1, so the post chain can tell sky from geometry). */
export function createSky() {
  const material = new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    side: BackSide,
    depthWrite: false,
    uniforms: {
      uSunDir: { value: SUN.dir },
      uSunCol: { value: new Color(SUN.color).multiplyScalar(SUN.intensity * 0.5) },
      uZen: { value: SUN.zenith },
      uHor: { value: SUN.horizon },
      uTime: { value: 0 },
      uDisk: { value: 1 },
    },
  });
  const mesh = new Mesh(new SphereGeometry(1, 32, 16), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}

/** Capture the sky (without the sun disk: the directional light supplies that) into a PMREM environment. Null on failure. */
export function createSkyEnv(renderer: WebGLRenderer): WebGLRenderTarget | null {
  try {
    const dome = createSky();
    dome.material = dome.material.clone();
    dome.material.uniforms.uDisk!.value = 0;
    const scene = new Scene();
    scene.add(dome);
    const pmrem = new PMREMGenerator(renderer);
    const rt = pmrem.fromScene(scene, 0, 0.1, 100);
    pmrem.dispose();
    dome.geometry.dispose();
    dome.material.dispose();
    return rt;
  } catch (e) {
    console.warn('[render] sky environment failed, using hemisphere light', e);
    return null;
  }
}
