# Assets

Every pre-made asset the game ships: what it is, where it came from, its licence. Order of preference: (1) an existing CC0 or CC-BY asset, (2) an AI-generated one, only with the owner's approval of cost and licence, (3) generated in code.

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| Rifle_Assault_West.glb (458 KB) | First-person rifle, packages/client/public/models/ | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |
| Pistol_Full_West.glb (158 KB) | First-person pistol | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |
| Shotgun_Pump_West.glb (120 KB) | First-person shotgun | https://opengameart.org/content/cc0-flat-guns-west | CC0 | No (author: Pichuliru) |

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

Procedural world-space detail now covers brick, limestone, pavers, asphalt, grass, metal. Real CC0 photo sets (ambientCG Bricks, Grass, Asphalt; Poly Haven) would clearly beat procedural for brick, grass and asphalt at close range. Loader path not wired yet: swap the baked `map/normalMap/roughnessMap` in `materials/index.ts` for KTX2/JPG textures keeping the `addDetail` layer on top.
