import {
  type MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  type WebGLRenderer,
} from 'three';
import { MATERIAL_NAMES, type MaterialName, TILING } from './table';

/**
 * Optional CC0 photo sets, one per material. To swap a set, drop new files in public/textures/ and edit
 * this manifest. A material with no entry, or whose files fail to load, keeps its procedural maps.
 * `tile` is the real-world size in metres of one repeat of the (square) texture. `tint` multiplies albedo.
 */
export interface TextureSet {
  albedo: string;
  normal: string;
  roughness: string;
  ao?: string;
  tile: number;
  tint?: number;
}

const base = `${import.meta.env?.BASE_URL ?? '/'}textures/`;
const set = (n: string, tile: number, tint?: number): TextureSet => ({
  albedo: `${base}${n}-albedo.jpg`,
  normal: `${base}${n}-normal.jpg`,
  roughness: `${base}${n}-roughness.jpg`,
  tile,
  tint,
});

export const TEXTURE_SETS: Partial<Record<MaterialName, TextureSet>> = {
  brick: set('brick', 1.6),
  limestone: set('limestone', 1.2),
  pavers: set('pavers', 1.2),
  asphalt: set('asphalt', 2),
  grass: set('grass', 1.5),
  metal: set('metal', 1),
};

const loader = new TextureLoader();
const load = (url: string, srgb: boolean, aniso: number) =>
  loader.loadAsync(url).then((t) => {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = aniso; // three generates mipmaps and uses trilinear filtering by default
    if (srgb) t.colorSpace = SRGBColorSpace;
    return t;
  });

/** Loads every set in the manifest in parallel; sets the world tile size of the ones that succeed. */
export async function loadTextureSets(renderer: WebGLRenderer) {
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const out: Partial<Record<MaterialName, { map: Texture; normalMap: Texture; roughnessMap: Texture; aoMap?: Texture; tint?: number }>> = {};
  await Promise.all(
    MATERIAL_NAMES.map(async (n) => {
      const s = TEXTURE_SETS[n];
      if (!s) return;
      try {
        const [map, normalMap, roughnessMap, aoMap] = await Promise.all([
          load(s.albedo, true, aniso),
          load(s.normal, false, aniso),
          load(s.roughness, false, aniso),
          s.ao ? load(s.ao, false, aniso) : undefined,
        ]);
        out[n] = { map, normalMap, roughnessMap, aoMap, tint: s.tint };
        TILING[n].tile = s.tile; // geometry reads this after makeMaterials resolves
      } catch (e) {
        console.warn(`texture set "${n}" failed, using procedural`, e);
      }
    }),
  );
  return out;
}

export function applyTextureSet(m: MeshStandardMaterial, t: NonNullable<Awaited<ReturnType<typeof loadTextureSets>>[MaterialName]>) {
  m.map = t.map;
  m.normalMap = t.normalMap;
  m.roughnessMap = t.roughnessMap;
  if (t.aoMap) m.aoMap = t.aoMap;
  if (t.tint !== undefined) m.color.setScalar(t.tint);
  m.needsUpdate = true;
}
