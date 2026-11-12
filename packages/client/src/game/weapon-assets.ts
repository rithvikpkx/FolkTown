/**
 * Weapon model manifest: public/models/weapons.json maps each weapon id to a chosen variant and the
 * variants' data (model file, transform, sight and flash points, animated part names, source and
 * licence). To swap a gun, add a variant and point `variant` at it; no code changes. Gun space is
 * the view-model group: origin on the bore, +x right, +y up, the muzzle toward -z, metres.
 */
export type Vec3 = [number, number, number];

export interface PartNames {
  magazine?: string;
  slide?: string;
  bolt?: string;
  pump?: string;
}

export interface WeaponVariant {
  /** Path under the site base, e.g. models/Rifle.glb */
  url: string;
  /** Uniform scale, metres per model unit. */
  scale: number;
  /** Euler XYZ, degrees, applied to the model. */
  rotation: Vec3;
  /** Model origin in gun space. */
  offset: Vec3;
  /** Muzzle point in gun space (tracer origin). */
  muzzle: Vec3;
  /** Muzzle flash centre in gun space. */
  flash: Vec3;
  /** Group position at the hip and when aimed (camera space); `ads` puts the sights on the view axis. */
  hip: Vec3;
  ads: Vec3;
  adsFov: number;
  /** Node names inside the model that animate. */
  parts?: PartNames;
  /** Separate texture files (paths under the site base) per glTF material name, for models exported without textures. */
  maps?: Record<string, { map: string; normal: string; orm: string }>;
  /** Variant to load instead if this one's model or maps fail. */
  fallback?: string;
  'assets-notes': string;
}

export interface WeaponEntry {
  variant: string;
  variants: Record<string, WeaponVariant>;
}

export type WeaponManifest = Record<string, WeaponEntry>;

const isVec3 = (v: unknown): v is Vec3 =>
  Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === 'number' && Number.isFinite(n));
const PART_KEYS = ['magazine', 'slide', 'bolt', 'pump'];

/** Returns every problem found (empty when valid). `ids` are the weapon ids the game needs. */
export function validateManifest(m: unknown, ids: readonly string[]): string[] {
  const errs: string[] = [];
  if (typeof m !== 'object' || m === null) return ['manifest is not an object'];
  const man = m as Record<string, unknown>;
  for (const id of ids) {
    const e = man[id] as WeaponEntry | undefined;
    if (!e || typeof e !== 'object') {
      errs.push(`${id}: missing`);
      continue;
    }
    if (typeof e.variants !== 'object' || !e.variants || !e.variants[e.variant])
      errs.push(`${id}: variant "${e.variant}" not in variants`);
    for (const [k, v] of Object.entries(e.variants ?? {})) {
      const at = `${id}.${k}`;
      if (typeof v.url !== 'string' || !v.url) errs.push(`${at}: url`);
      if (typeof v.scale !== 'number' || !(v.scale > 0)) errs.push(`${at}: scale`);
      for (const f of ['rotation', 'offset', 'muzzle', 'flash', 'hip', 'ads'] as const)
        if (!isVec3(v[f])) errs.push(`${at}: ${f} must be 3 numbers`);
      if (typeof v.adsFov !== 'number' || !(v.adsFov > 0 && v.adsFov < 120))
        errs.push(`${at}: adsFov`);
      if (typeof v['assets-notes'] !== 'string' || v['assets-notes'].length < 10)
        errs.push(`${at}: assets-notes (source and licence) missing`);
      if (v.fallback !== undefined && !e.variants[v.fallback])
        errs.push(`${at}: fallback "${v.fallback}" not in variants`);
      for (const [mn, t] of Object.entries(v.maps ?? {}))
        if (!t.map || !t.normal || !t.orm) errs.push(`${at}: maps.${mn} needs map, normal, orm`);
      for (const [p, n] of Object.entries(v.parts ?? {}))
        if (!PART_KEYS.includes(p) || typeof n !== 'string') errs.push(`${at}: parts.${p}`);
    }
  }
  return errs;
}

/** Fetch and validate the manifest. Null on any failure (the generated guns stay). */
export async function loadManifest(
  base: string,
  ids: readonly string[],
): Promise<WeaponManifest | null> {
  try {
    const res = await fetch(`${base}models/weapons.json`);
    const json = await res.json();
    const errs = validateManifest(json, ids);
    if (errs.length) throw new Error(errs.join('; '));
    return json as WeaponManifest;
  } catch (e) {
    console.error('weapon manifest unusable, using generated guns', e);
    return null;
  }
}
