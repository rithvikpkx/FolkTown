import {
  GLSL3,
  HalfFloatType,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  RepeatWrapping,
  Scene,
  type Texture,
  UnsignedByteType,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { COMMON, DETAIL, SURFACES } from './shaders';
import { MATERIAL_NAMES, type MaterialName, TILING } from './table';

export { MATERIAL_NAMES, type MaterialName, TILING } from './table';

const VERT = `in vec3 position; in vec2 uv; out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/** Saltline-style world-space detail on top of the baked maps: sub-centimetre grit, grime, wear, bump. */
const DETAIL_MODE: Record<MaterialName, [number, number, number, number, number]> = {
  // [mode, metres per grit cell, colour strength, bump strength, roughness variation]
  brick: [1, 0.04, 0.12, 0.5, 0.15],
  limestone: [1, 0.05, 0.12, 0.4, 0.12],
  pavers: [2, 0.04, 0.2, 0.5, 0.15],
  asphalt: [2, 0.02, 0.3, 0.8, 0.12],
  grass: [4, 0.03, 0.3, 0.9, 0.05],
  bark: [0, 0.03, 0.25, 0.8, 0.1],
  metal: [3, 0.02, 0.25, 0.3, 0.3],
  polymer: [0, 0.03, 0.12, 0.2, 0.1],
  fabric: [0, 0.01, 0.12, 0.3, 0.05],
  verdigris: [3, 0.03, 0.2, 0.3, 0.2],
};
function addDetail(m: MeshStandardMaterial, name: MaterialName) {
  const [mode, cell, col, bump, rv] = DETAIL_MODE[name];
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWp; varying vec3 vWn;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 wp_ = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        wp_ = instanceMatrix * wp_;
        #endif
        vWp = (modelMatrix * wp_).xyz; vWn = normalize(mat3(modelMatrix) * objectNormal);`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vWp; varying vec3 vWn;\n#define MODE ${mode}\n#define CELL ${cell}\n#define DCOL ${col}\n#define DBUMP ${bump}\n#define DRV ${rv}\n${DETAIL}`,
      )
      .replace('#include <map_fragment>', '#include <map_fragment>\n  float dRough; float dH = detail(diffuseColor.rgb, dRough);')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor + dRough, 0.04, 1.0);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = bumpNormal(normal, dH, -vViewPosition, faceDirection);');
  };
}

type Set = Record<MaterialName, MeshStandardMaterial>;
const cache = new WeakMap<WebGLRenderer, { mats: Set; targets: WebGLRenderTarget[] }>();

/**
 * Renders every material's colour (linear, half float), normal and roughness maps once on the
 * GPU and returns MeshStandardMaterials. UVs are in repeats: build geometry with `TILING[name].tile`.
 * Cached per renderer; call `disposeMaterials` to free the textures.
 */
export async function makeMaterials(renderer: WebGLRenderer): Promise<Set> {
  const hit = cache.get(renderer);
  if (hit) return hit.mats;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const quad = new Mesh(new PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  const scene = new Scene().add(quad);
  const cam = new OrthographicCamera();
  const shaders = MATERIAL_NAMES.map((name) => {
    const { size, bump } = TILING[name];
    return new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: VERT,
      fragmentShader: `#define N ${size}.0\n#define BUMP ${bump.toFixed(1)}\n${COMMON}\n${SURFACES[name]}`,
      depthTest: false,
      depthWrite: false,
    });
  });
  // compile off the main thread (parallel shader compile) before any drawing
  await Promise.all(
    shaders.map((m) => {
      const q = new Mesh(quad.geometry, m);
      return renderer.compileAsync(new Scene().add(q), cam);
    }),
  );
  const prev = renderer.getRenderTarget();
  const mats = {} as Set;
  const targets: WebGLRenderTarget[] = [];
  MATERIAL_NAMES.forEach((name, i) => {
    const { size } = TILING[name];
    const rt = new WebGLRenderTarget(size, size, { count: 3, depthBuffer: false });
    const [col, nor, rgh] = rt.textures as [Texture, Texture, Texture];
    col.type = HalfFloatType; // linear colour; 8 bits would band in the darks
    nor.type = rgh.type = UnsignedByteType;
    for (const t of rt.textures) {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.generateMipmaps = true;
      t.minFilter = LinearMipmapLinearFilter;
      t.anisotropy = aniso;
    }
    quad.material = shaders[i] as RawShaderMaterial;
    renderer.setRenderTarget(rt);
    renderer.render(scene, cam);
    targets.push(rt);
    mats[name] = new MeshStandardMaterial({
      map: col,
      normalMap: nor,
      roughnessMap: rgh,
      metalness: name === 'metal' ? 0.85 : name === 'verdigris' ? 0.25 : 0,
      vertexColors: true, // Batch writes per-vertex grime/AO into the colour attribute
    });
    addDetail(mats[name], name);
  });
  renderer.setRenderTarget(prev);
  renderer.getContext().finish();
  for (const m of shaders) m.dispose();
  quad.geometry.dispose();
  cache.set(renderer, { mats, targets });
  return mats;
}

export function disposeMaterials(renderer: WebGLRenderer) {
  const hit = cache.get(renderer);
  if (!hit) return;
  for (const m of Object.values(hit.mats)) m.dispose();
  for (const rt of hit.targets) rt.dispose();
  cache.delete(renderer);
}
