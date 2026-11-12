import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  BufferGeometry,
  DepthTexture,
  DirectionalLight,
  Float32BufferAttribute,
  HalfFloatType,
  HemisphereLight,
  LinearFilter,
  Matrix4,
  Mesh,
  NearestFilter,
  NoToneMapping,
  OrthographicCamera,
  type PerspectiveCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  type Texture,
  type TextureDataType,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { lowerPreset, MIN_SCALE, PRESETS, type PresetName, renderSize, stepScale } from './presets';
import { ADAPT, AO, BLUR, COMPOSITE, DOWN, FINAL, GRADE, HAZE, UP, VERT } from './shaders';
import { installSoftShadows, uninstallSoftShadows } from './shadow';
import { createSky, SUN } from './sky';

export { PRESETS, type PresetName, parseFx } from './presets';

export interface RendererOptions {
  preset?: PresetName;
  /** false = plain forward rendering (the `?fx=0` switch). */
  enabled?: boolean;
  /** Where the static sun shadow map sits, and how many metres across it is. */
  shadow?: { center?: Vector3; size?: number; depth?: number };
}

const TUNE = {
  hazeSun: 0.85,
  hazeAmbient: 0.2,
  hazeSigma: 0.006,
  hazeMaxDist: 170,
  hazeFalloff: 0.03,
  aoRadius: 0.9,
  aoIntensity: 1.6,
  aoStrength: 0.95,
  bloom: 0.065,
  bloomMix: 0.62,
  flare: 0.16,
  key: 0.18,
  minExposure: 0.4,
  maxExposure: 2.5,
  adaptTau: 1.5,
  agxMix: 0.25,
  vignette: 0.3,
  grain: 0.02,
  sharpen: 0.3,
  lookPower: 1.18,
  lookSat: 1.22,
};
const TARGET_MS = 18;
const WINDOW = 45;

const fsGeo = new BufferGeometry();
fsGeo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
fsGeo.setAttribute('uv', new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));

type Targets = {
  scene: WebGLRenderTarget;
  post: WebGLRenderTarget;
  ldr: WebGLRenderTarget;
  aoA: WebGLRenderTarget;
  aoB: WebGLRenderTarget;
  volA: WebGLRenderTarget;
  volB: WebGLRenderTarget;
  down: WebGLRenderTarget[];
  up: WebGLRenderTarget[];
  adapt: [WebGLRenderTarget, WebGLRenderTarget];
};

export function createRenderer(
  canvas: HTMLCanvasElement,
  scene: Scene,
  camera: PerspectiveCamera,
  opts: RendererOptions = {},
) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
  });
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = BasicShadowMap; // our own filter reads raw depth
  renderer.shadowMap.autoUpdate = false;

  // ---- lighting and sky: the look lives here ----
  const sc = opts.shadow?.center ?? new Vector3();
  const shadowSize = opts.shadow?.size ?? 80;
  const shadowDepth = opts.shadow?.depth ?? 200;
  const sun = new DirectionalLight(SUN.color, SUN.intensity);
  sun.position
    .copy(SUN.dir)
    .multiplyScalar(shadowDepth / 2)
    .add(sc);
  sun.target.position.copy(sc);
  sun.castShadow = true;
  sun.shadow.radius = 4;
  sun.shadow.bias = 0;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, {
    left: -shadowSize / 2,
    right: shadowSize / 2,
    top: shadowSize / 2,
    bottom: -shadowSize / 2,
    near: 0.5,
    far: shadowDepth,
  });
  const sky = createSky();
  scene.background = null;
  scene.add(sun, sun.target, new HemisphereLight(0x8aa4d0, 0x7a5a3c, 1.7), sky);

  const state = {
    enabled: opts.enabled ?? true,
    preset: opts.preset ?? ('medium' as PresetName),
    scale: 1,
  };
  let soft = installSoftShadows(shadowSize, shadowDepth - 0.5);
  let css = { w: innerWidth, h: innerHeight, dpr: devicePixelRatio || 1 };
  let size = { w: 16, h: 16 };
  let T: Targets | null = null;
  let frame = 0;
  let shadowDirty = true;
  let adaptFlip = 0;
  let adaptSnap = true;
  let time = 0;
  const hist: number[] = [];
  const failures: string[] = [];
  renderer.debug.onShaderError = (gl, _p, _vs, fs) => {
    const src = gl.getShaderSource(fs) ?? '';
    failures.push(src.includes('SL_FRUSTUM') ? 'soft shadows' : 'post chain');
  };

  // ---- post passes ----
  const fsScene = new Scene();
  const fsMesh = new Mesh(fsGeo);
  fsMesh.frustumCulled = false;
  fsScene.add(fsMesh);
  const fsCam = new OrthographicCamera();
  const mk = (
    frag: string,
    uniforms: ShaderMaterial['uniforms'],
    defines: Record<string, string | number> = {},
  ) =>
    new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: frag,
      uniforms,
      defines,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
  const tex = { value: null as Texture | null };
  const u = <V>(value: V) => ({ value });
  const P = {
    ao: mk(
      AO,
      {
        tDepth: { ...tex },
        uProjInv: u(new Matrix4()),
        uRadius: u(TUNE.aoRadius),
        uIntensity: u(TUNE.aoIntensity),
        uFocal: u(1),
        uAspect: u(1),
      },
      { AO_TAPS: 8 },
    ),
    blur: mk(BLUR, {
      tSrc: { ...tex },
      tDepth: { ...tex },
      uProjInv: u(new Matrix4()),
      uDir: u(new Vector2()),
      uTol: u(0.04),
    }),
    blurVol: mk(BLUR, {
      tSrc: { ...tex },
      tDepth: { ...tex },
      uProjInv: u(new Matrix4()),
      uDir: u(new Vector2()),
      uTol: u(0.3),
    }),
    haze: mk(
      HAZE,
      {
        tDepth: { ...tex },
        tShadow: { ...tex },
        uProjInv: u(new Matrix4()),
        uCamWorld: u(new Matrix4()),
        uShadowMat: u(new Matrix4()),
        uCamPos: u(new Vector3()),
        uSunDir: u(SUN.dir),
        uSunRad: u(SUN.color.clone().multiplyScalar(SUN.intensity * TUNE.hazeSun)),
        uAmb: u(SUN.horizon.clone().multiplyScalar(TUNE.hazeAmbient)),
        uHasShadow: u(0),
        uMaxDist: u(TUNE.hazeMaxDist),
        uSigma: u(TUNE.hazeSigma),
        uFalloff: u(TUNE.hazeFalloff),
      },
      { VOL_STEPS: 12 },
    ),
    comp: mk(COMPOSITE, {
      tColor: { ...tex },
      tAO: { ...tex },
      tVol: { ...tex },
      uAoStrength: u(TUNE.aoStrength),
      uAoOn: u(1),
      uVolOn: u(1),
    }),
    down: mk(DOWN, { tSrc: { ...tex }, uTexel: u(new Vector2()), uFirst: u(0) }),
    up: mk(UP, {
      tLow: { ...tex },
      tHigh: { ...tex },
      uTexel: u(new Vector2()),
      uMix: u(TUNE.bloomMix),
    }),
    adapt: mk(ADAPT, { tPrev: { ...tex }, tLum: { ...tex }, uRate: u(1) }),
    grade: mk(
      GRADE,
      {
        tScene: { ...tex },
        tBloom: { ...tex },
        tAdapt: { ...tex },
        tDepth: { ...tex },
        uSunCol: u(SUN.color.clone()),
        uSunUv: u(new Vector2(0.5, 0.5)),
        uAspect: u(1),
        uBloom: u(TUNE.bloom),
        uFlare: u(TUNE.flare),
        uVignette: u(TUNE.vignette),
        uAgxMix: u(TUNE.agxMix),
        uSunOn: u(0),
        uKey: u(TUNE.key),
        uMinE: u(TUNE.minExposure),
        uMaxE: u(TUNE.maxExposure),
      },
      { LOOK_POWER: TUNE.lookPower.toFixed(3), LOOK_SAT: TUNE.lookSat.toFixed(3) },
    ),
    final: mk(FINAL, {
      tSrc: { ...tex },
      uTexel: u(new Vector2()),
      uTime: u(0),
      uGrain: u(TUNE.grain),
      uSharpen: u(TUNE.sharpen),
    }),
  };
  const run = (m: ShaderMaterial, target: WebGLRenderTarget | null) => {
    fsMesh.material = m;
    renderer.setRenderTarget(target);
    renderer.render(fsScene, fsCam);
  };
  const setSrc = (m: ShaderMaterial, name: string, t: Texture) => {
    const un = m.uniforms[name];
    if (un) un.value = t;
  };

  const rt = (
    w: number,
    h: number,
    type: TextureDataType = HalfFloatType,
    filter: typeof LinearFilter | typeof NearestFilter = LinearFilter,
  ) =>
    new WebGLRenderTarget(w, h, {
      type,
      format: RGBAFormat,
      minFilter: filter,
      magFilter: filter,
      depthBuffer: false,
      generateMipmaps: false,
    });

  function buildTargets() {
    if (T) {
      for (const t of [
        T.scene,
        T.post,
        T.ldr,
        T.aoA,
        T.aoB,
        T.volA,
        T.volB,
        ...T.down,
        ...T.up,
        ...T.adapt,
      ])
        t.dispose();
      T.scene.depthTexture?.dispose();
    }
    const pr = PRESETS[state.preset];
    const { w, h } = size;
    const hw = Math.max(4, Math.ceil(w / 2));
    const hh = Math.max(4, Math.ceil(h / 2));
    const sceneRT = new WebGLRenderTarget(w, h, {
      type: HalfFloatType,
      format: RGBAFormat,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      generateMipmaps: false,
    });
    const dt = new DepthTexture(w, h);
    dt.minFilter = dt.magFilter = NearestFilter;
    sceneRT.depthTexture = dt;
    const down: WebGLRenderTarget[] = [];
    const up: WebGLRenderTarget[] = [];
    let bw = hw;
    let bh = hh;
    for (let i = 0; i < pr.bloomLevels; i++) {
      down.push(rt(bw, bh));
      if (i < pr.bloomLevels - 1) up.push(rt(bw, bh));
      bw = Math.max(2, bw >> 1);
      bh = Math.max(2, bh >> 1);
    }
    T = {
      scene: sceneRT,
      post: rt(w, h),
      ldr: rt(w, h, UnsignedByteType),
      aoA: rt(hw, hh, UnsignedByteType),
      aoB: rt(hw, hh, UnsignedByteType),
      volA: rt(hw, hh),
      volB: rt(hw, hh),
      down,
      up,
      adapt: [rt(1, 1, HalfFloatType, NearestFilter), rt(1, 1, HalfFloatType, NearestFilter)],
    };
    P.ao.defines.AO_TAPS = Math.max(1, pr.aoTaps);
    P.haze.defines.VOL_STEPS = Math.max(1, pr.hazeSteps);
    P.ao.needsUpdate = P.haze.needsUpdate = true;
    adaptSnap = true;
  }

  function applySize() {
    const pr = PRESETS[state.preset];
    size = renderSize(css.w, css.h, css.dpr, pr.budgetMP, state.scale);
    renderer.setPixelRatio(1);
    renderer.setSize(size.w, size.h, false);
    camera.aspect = css.w / css.h;
    camera.updateProjectionMatrix();
    if (state.enabled) buildTargets();
    if (sun.shadow.mapSize.x !== pr.shadowSize) {
      sun.shadow.mapSize.set(pr.shadowSize, pr.shadowSize);
      sun.shadow.map?.dispose();
      sun.shadow.map = null;
      shadowDirty = true;
    }
  }

  const sunUv = new Vector3();
  const fwd = new Vector3();

  function renderFx(dt: number) {
    const t = T;
    if (!t) return;
    const pr = PRESETS[state.preset];
    camera.updateMatrixWorld();
    time += dt;
    sky.material.uniforms.uTime!.value = time;
    const projInv = camera.projectionMatrixInverse;
    const focal = camera.projectionMatrix.elements[5]! * 0.5;
    const aspect = size.w / size.h;

    // sun shadow: once, or every second frame when moving actors need it
    if (shadowDirty || (pr.shadowEveryOther && frame % 2 === 0))
      renderer.shadowMap.needsUpdate = true;
    shadowDirty = false;
    renderer.setRenderTarget(t.scene);
    renderer.render(scene, camera);
    const depth = t.scene.depthTexture as Texture;
    const hw = t.aoA.width;
    const hh = t.aoA.height;

    const aoOn = pr.aoTaps > 0;
    if (aoOn) {
      const u0 = P.ao.uniforms;
      u0.tDepth!.value = depth;
      u0.uProjInv!.value = projInv;
      u0.uFocal!.value = focal;
      u0.uAspect!.value = aspect;
      run(P.ao, t.aoA);
      for (const [src, dst, dir] of [
        [t.aoA, t.aoB, [1 / hw, 0]],
        [t.aoB, t.aoA, [0, 1 / hh]],
      ] as const) {
        P.blur.uniforms.tSrc!.value = src.texture;
        P.blur.uniforms.tDepth!.value = depth;
        P.blur.uniforms.uProjInv!.value = projInv;
        (P.blur.uniforms.uDir!.value as Vector2).set(dir[0], dir[1]);
        run(P.blur, dst);
      }
    }

    const shadowTex = sun.shadow.map?.depthTexture ?? null;
    const hazeOn = pr.hazeSteps > 0;
    if (hazeOn) {
      const h0 = P.haze.uniforms;
      h0.tDepth!.value = depth;
      h0.tShadow!.value = shadowTex;
      h0.uHasShadow!.value = shadowTex ? 1 : 0;
      h0.uProjInv!.value = projInv;
      h0.uCamWorld!.value = camera.matrixWorld;
      h0.uShadowMat!.value = sun.shadow.matrix;
      (h0.uCamPos!.value as Vector3).setFromMatrixPosition(camera.matrixWorld);
      run(P.haze, t.volA);
      for (const [src, dst, dir] of [
        [t.volA, t.volB, [1 / hw, 0]],
        [t.volB, t.volA, [0, 1 / hh]],
      ] as const) {
        P.blurVol.uniforms.tSrc!.value = src.texture;
        P.blurVol.uniforms.tDepth!.value = depth;
        P.blurVol.uniforms.uProjInv!.value = projInv;
        (P.blurVol.uniforms.uDir!.value as Vector2).set(dir[0], dir[1]);
        run(P.blurVol, dst);
      }
    }

    const c = P.comp.uniforms;
    c.tColor!.value = t.scene.texture;
    c.tAO!.value = t.aoA.texture;
    c.tVol!.value = t.volA.texture;
    c.uAoOn!.value = aoOn ? 1 : 0;
    c.uVolOn!.value = hazeOn ? 1 : 0;
    run(P.comp, t.post);

    // bloom: no threshold, down then tent-filtered up
    let src = t.post.texture;
    let sw = size.w;
    let sh = size.h;
    t.down.forEach((d, i) => {
      P.down.uniforms.tSrc!.value = src;
      (P.down.uniforms.uTexel!.value as Vector2).set(1 / sw, 1 / sh);
      P.down.uniforms.uFirst!.value = i === 0 ? 1 : 0;
      run(P.down, d);
      src = d.texture;
      sw = d.width;
      sh = d.height;
    });
    let low = t.down[t.down.length - 1] as WebGLRenderTarget;
    for (let i = t.up.length - 1; i >= 0; i--) {
      P.up.uniforms.tLow!.value = low.texture;
      P.up.uniforms.tHigh!.value = (t.down[i] as WebGLRenderTarget).texture;
      (P.up.uniforms.uTexel!.value as Vector2).set(1 / low.width, 1 / low.height);
      run(P.up, t.up[i] as WebGLRenderTarget);
      low = t.up[i] as WebGLRenderTarget;
    }

    // eye adaptation
    const prev = t.adapt[adaptFlip] as WebGLRenderTarget;
    const next = t.adapt[1 - adaptFlip] as WebGLRenderTarget;
    P.adapt.uniforms.tPrev!.value = prev.texture;
    P.adapt.uniforms.tLum!.value = (t.down[t.down.length - 1] as WebGLRenderTarget).texture;
    P.adapt.uniforms.uRate!.value = adaptSnap ? 1 : 1 - Math.exp(-dt / TUNE.adaptTau);
    adaptSnap = false;
    run(P.adapt, next);
    adaptFlip = 1 - adaptFlip;

    // grade (+ flare)
    camera.getWorldDirection(fwd);
    sunUv
      .copy(SUN.dir)
      .multiplyScalar(500)
      .add(fwd.setFromMatrixPosition(camera.matrixWorld))
      .project(camera);
    camera.getWorldDirection(fwd);
    const g = P.grade.uniforms;
    g.tScene!.value = t.post.texture;
    g.tBloom!.value = low.texture;
    g.tAdapt!.value = next.texture;
    g.tDepth!.value = depth;
    (g.uSunUv!.value as Vector2).set(sunUv.x * 0.5 + 0.5, sunUv.y * 0.5 + 0.5);
    g.uSunOn!.value =
      fwd.dot(SUN.dir) > 0.05 && Math.abs(sunUv.x) < 1.5 && Math.abs(sunUv.y) < 1.5 ? 1 : 0;
    g.uAspect!.value = aspect;
    run(P.grade, t.ldr);

    const f = P.final.uniforms;
    f.tSrc!.value = t.ldr.texture;
    (f.uTexel!.value as Vector2).set(1 / size.w, 1 / size.h);
    f.uTime!.value = time;
    run(P.final, null);
  }

  function renderPlain(dt: number) {
    time += dt;
    sky.material.uniforms.uTime!.value = time;
    renderer.shadowMap.needsUpdate = shadowDirty;
    shadowDirty = false;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }

  function applyMode() {
    renderer.toneMapping = state.enabled ? NoToneMapping : ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
  }

  /** Start-up self test: float targets, then one real frame through the chain, checked for shader errors and a lit image. */
  function selfTest(): boolean {
    const ext = renderer.extensions;
    if (!ext.has('EXT_color_buffer_float') && !ext.has('EXT_color_buffer_half_float')) {
      console.warn('[render] no float render targets: plain rendering');
      return false;
    }
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        failures.length = 0;
        renderFx(0.016);
        const px = new Uint8Array(4 * 16);
        const t = T as Targets;
        renderer.readRenderTargetPixels(t.ldr, size.w >> 1, size.h >> 1, 4, 4, px);
        const lit = px.some((v, i) => i % 4 !== 3 && v > 8);
        if (!failures.length && lit) {
          adaptSnap = true;
          return true;
        }
        console.warn(`[render] self test failed (${failures.join(', ') || 'black frame'})`);
        if (!soft || attempt > 0) break;
        // retry with three's stock shadow filter
        uninstallSoftShadows();
        soft = false;
        scene.traverse((o) => {
          const m = (o as Mesh).material;
          for (const x of Array.isArray(m) ? m : m ? [m] : []) x.needsUpdate = true;
        });
        shadowDirty = true;
      }
    } catch (e) {
      console.warn('[render] self test threw', e);
    }
    return false;
  }

  function setEnabled(on: boolean) {
    state.enabled = on;
    applyMode();
    if (on) {
      applySize();
      if (!selfTest()) setEnabled(false);
    } else {
      applySize();
    }
    hist.length = 0;
  }

  function setPreset(p: PresetName) {
    state.preset = p;
    state.scale = 1;
    applySize();
    hist.length = 0;
  }

  function resize(w = innerWidth, h = innerHeight, dpr = devicePixelRatio || 1) {
    css = { w, h, dpr };
    applySize();
  }

  /** Watch frame times: drop render scale first, then the preset, then the chain itself. */
  function govern(dt: number) {
    if (frame < 10) return; // shader compilation frames
    hist.push(dt * 1000);
    if (hist.length < WINDOW) return;
    const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
    hist.length = 0;
    const s = stepScale(state.scale, avg, TARGET_MS);
    if (s !== state.scale) {
      state.scale = s;
      applySize();
    } else if (state.scale <= MIN_SCALE && avg > TARGET_MS * 1.15) {
      const lower = lowerPreset(state.preset);
      if (lower) setPreset(lower);
      else if (state.enabled && avg > 45) setEnabled(false);
    }
  }

  resize();
  applyMode();
  if (state.enabled && !selfTest()) setEnabled(false);

  return {
    /** Draw one frame. `dt` in seconds. */
    render(dt: number) {
      if (state.enabled) renderFx(dt);
      else renderPlain(dt);
      frame++;
      govern(dt);
    },
    setPreset,
    setEnabled,
    resize,
    /** Ask for the static sun shadow map to be rendered again (after the world changes). */
    invalidateShadow() {
      shadowDirty = true;
    },
    get state() {
      return { ...state, size, soft };
    },
    webgl: renderer,
  };
}

export type FxRenderer = ReturnType<typeof createRenderer>;
