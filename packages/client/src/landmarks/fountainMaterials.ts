import { Color, DoubleSide, MeshStandardMaterial, ShaderMaterial } from 'three';

/** Plain cast concrete for the sculpture (the shared material set has no concrete). */
export function makeConcrete() {
  return new MeshStandardMaterial({
    color: 0x9a978f,
    roughness: 0.92,
    metalness: 0,
    side: DoubleSide,
  });
}

/** Mirror-polished steel cylinder around the central jet. */
export function makeMirrorSteel() {
  return new MeshStandardMaterial({ color: 0xd8dde0, roughness: 0.12, metalness: 1 });
}

/**
 * Water surface in code: layered sine ripples drive a fake normal, shaded with a sky-tinted
 * fresnel and a sun glint. Animated by wall-clock time. No reflection pass, no simulation.
 * `flow` scrolls ripples along world y (for sheets falling down the concrete).
 */
export function makeWaterMaterial(flow = 0) {
  const sun = new Color(0xffe2b0);
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: { uTime: { value: 0 }, uFlow: { value: flow }, uSun: { value: sun } },
    vertexShader: `
      varying vec3 vW; varying vec3 vN;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      uniform float uTime; uniform float uFlow; uniform vec3 uSun;
      varying vec3 vW; varying vec3 vN;
      void main() {
        vec2 p = vW.xz * 1.7 + vec2(0.0, vW.y * uFlow * 3.0);
        float t = uTime;
        vec2 g = vec2(
          cos(p.x * 2.1 + t * 1.3) * 0.5 + cos(p.x * 5.3 - p.y * 3.1 + t * 2.1) * 0.25,
          cos(p.y * 1.9 - t * 1.1) * 0.5 + cos(p.y * 4.7 + p.x * 2.9 - t * 1.7) * 0.25
        );
        if (uFlow > 0.0) g.y += cos(vW.y * 9.0 + t * 7.0) * 0.4;
        vec3 n = normalize(vN + vec3(g.x, 0.0, g.y) * 0.14 * (1.0 - abs(vN.y) * 0.0));
        vec3 v = normalize(cameraPosition - vW);
        float f = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 3.0);
        vec3 deep = vec3(0.08, 0.20, 0.24);
        vec3 sky = vec3(0.62, 0.74, 0.82);
        vec3 l = normalize(vec3(-0.5, 0.35, 0.6));
        float s = pow(max(dot(reflect(-l, n), v), 0.0), 60.0);
        vec3 c = mix(deep, sky, f) + uSun * s * 0.9;
        float foam = uFlow > 0.0 ? 0.25 : 0.0;
        gl_FragColor = vec4(c + foam, clamp(0.55 + f * 0.35 + foam, 0.0, 0.92));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/** Advance the water clock; call from each water mesh's onBeforeRender. */
export function tickWater(m: ShaderMaterial) {
  const u = m.uniforms.uTime;
  if (u) u.value = performance.now() / 1000;
}
