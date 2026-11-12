# Assets

Every pre-made asset the game ships: what it is, where it came from, its licence. Order of preference: (1) an existing CC0 or CC-BY asset, (2) an AI-generated one, only with the owner's approval of cost and licence, (3) generated in code.

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|

## Material textures (local-materials)

Procedural world-space detail now covers brick, limestone, pavers, asphalt, grass, metal. Real CC0 photo sets (ambientCG Bricks, Grass, Asphalt; Poly Haven) would clearly beat procedural for brick, grass and asphalt at close range. Loader path not wired yet: swap the baked `map/normalMap/roughnessMap` in `materials/index.ts` for KTX2/JPG textures keeping the `addDetail` layer on top.
