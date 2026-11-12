export const MATERIAL_NAMES = [
  'brick',
  'limestone',
  'pavers',
  'asphalt',
  'grass',
  'bark',
  'metal',
  'polymer',
  'fabric',
  'verdigris',
] as const;
export type MaterialName = (typeof MATERIAL_NAMES)[number];

/**
 * Metres per texture repeat: pass as `tile` to Batch so the pattern keeps its real size.
 * `size` is the generated texture edge in pixels, `bump` the normal-map strength.
 * brick: 24 courses of 0.075 m, 8 bricks of 0.225 m. limestone: 0.6 x 0.3 m blocks.
 * pavers: 0.3 x 0.15 m. The rest are unstructured and only need a non-obvious repeat.
 */
export const TILING: Record<MaterialName, { tile: number; size: number; bump: number }> = {
  brick: { tile: 1.8, size: 1024, bump: 4 },
  limestone: { tile: 1.2, size: 512, bump: 3 },
  pavers: { tile: 1.2, size: 512, bump: 4 },
  asphalt: { tile: 4, size: 512, bump: 3 },
  grass: { tile: 3, size: 512, bump: 3 },
  bark: { tile: 1, size: 512, bump: 5 },
  metal: { tile: 1, size: 512, bump: 2 },
  polymer: { tile: 1, size: 512, bump: 1.5 },
  fabric: { tile: 1, size: 512, bump: 3 },
  verdigris: { tile: 1, size: 512, bump: 2 },
};
