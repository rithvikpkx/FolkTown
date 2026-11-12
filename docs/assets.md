# Assets

Every pre-made asset the game ships: what it is, where it came from, its licence. Order of preference: (1) an existing CC0 or CC-BY asset, (2) an AI-generated one, only with the owner's approval of cost and licence, (3) generated in code.

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| Rifle_Assault_West.glb (458 KB) | First-person rifle, packages/client/public/models/ | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |
| Pistol_Full_West.glb (158 KB) | First-person pistol | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |
| Shotgun_Pump_West.glb (120 KB) | First-person shotgun | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |

## Material textures (local-textures)
### Weapon models (local-weapons2)

Models are chosen in `packages/client/public/models/weapons.json` (see `weapon-assets.ts`): each weapon id has a `variant` and a `variants` map with file, scale, rotation, offset, muzzle, flash, hip and ADS poses, animated part names and an `assets-notes` field with source and licence. To swap a gun: add a variant, point `variant` at it. Preview and tune with `play.html?bots=1&gun=rifle&variant=ak47&ads=1`, then `node tools/shoot-weapons.mjs` (env `VARIANT`, `ONLY`, `OUT`). All sources below are CC0, so no credits screen is needed; if a CC-BY model is ever added, put its credit line here and add a CREDITS entry to the start menu.

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| Rifle_M4A1_CC0.glb (9,256 tris, 590 KB, 1024 px PBR) | Rifle, default (`m4a1`) | https://3dmodelscc0.itch.io/free-cc0-guns-explosives-pack (3dmodelscc0) | CC0 | No |
| Rifle_AK47_CC0.glb (15,662 tris, 1.3 MB, 1024 px PBR) | Rifle alternate (`ak47`) | https://stein-indie.itch.io/classic-weapons-pack (Stein Games) | CC0 (page and zip licence.txt) | No |
| Pistol_1911_CC0.glb (9,533 tris, 1.1 MB, 1024 px PBR) | Pistol, default (`m1911`) | https://stein-indie.itch.io/classic-weapons-pack (Stein Games) | CC0 | No |
| Shotgun_Pump_CC0.glb (1,740 tris, 350 KB, 1024 px PBR) | Shotgun, default (`pump`) | https://3dmodelscc0.itch.io/free-cc0-guns-explosives-pack (3dmodelscc0) | CC0 | No |

The Flat Guns West models stay as the `flat` variant of each weapon. FBX files were converted with FBX2glTF; textures resized to 1024 px JPEG (base colour, normal, ORM packed from the roughness/metal maps).

## Material textures (local-materials)

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
