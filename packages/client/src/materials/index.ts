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
import { COMMON, SURFACES } from './shaders';
import { MATERIAL_NAMES, type MaterialName, TILING } from './table';

export { MATERIAL_NAMES, type MaterialName, TILING } from './table';

const VERT = `in vec3 position; in vec2 uv; out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

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
