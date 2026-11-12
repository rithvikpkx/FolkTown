# Assets

Every pre-made asset the game ships: what it is, where it came from, its licence. Order of preference: (1) an existing CC0 or CC-BY asset, (2) an AI-generated one, only with the owner's approval of cost and licence, (3) generated in code.

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| Rifle_Assault_West.glb (458 KB) | First-person rifle, packages/client/public/models/ | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |
| Pistol_Full_West.glb (158 KB) | First-person pistol | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |
| Shotgun_Pump_West.glb (120 KB) | First-person shotgun | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |

## Material textures (local-textures)

All are ambientCG sets (CC0, no credit needed), 1K JPG from `https://ambientcg.com/get?file=<ID>_1K-JPG.zip`, re-encoded to 1024x1024 JPEG (albedo q82, OpenGL normal q88, roughness greyscale q85) in `packages/client/public/textures/`, about 6 MB in total. They are mapped in `packages/client/src/materials/texture-sets.ts`; remove an entry or file and that material falls back to its procedural maps. Texture memory is about 100 MB decoded (6 sets x 3 maps x 1024^2 RGBA8 + mips); the procedural targets of loaded sets are freed.

| Material | ambientCG ID | Tile (m) | Notes |
|---|---|---|---|
| brick | Bricks101 | 1.6 | |
| limestone | Bricks084 | 1.2 | Source is 2:1; stacked with a vertical mirror copy (normal green flipped) to make a seamless square |
| pavers | PavingStones070 | 1.2 | Roughness raised (x0.5 + 0.5) |
| asphalt | Asphalt031 | 2 | Roughness raised (x0.5 + 0.5) |
| grass | Grass004 | 1.5 | Roughness remapped to 0.7-1.0 (source is too glossy) |
| metal | Metal063 | 1 | Roughness remapped to 0.25-0.85; metalness stays the constant 0.85 |

Not sourced: concrete and roof shingle, because the material table has no such materials yet (add to the table with a procedural fallback first). The AO slot in the manifest is supported but no set uses it.
