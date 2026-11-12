# Assets

Every pre-made asset the game ships: what it is, where it came from, its licence. Rule (owner, 12 November 2026): any freely downloadable asset may be used; record source, author and licence status, marking unknown or restrictive ones `needs-clearance`; the owner clears them. Order of preference: (1) an existing CC0 or CC-BY asset, (2) an AI-generated one, only with the owner's approval of cost and licence, (3) generated in code.

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

| lab/pistol.glb + pistol_0..2.webp (service_pistol, 16,650 tris, 2K maps; Poly Haven author as listed on the asset page, https://polyhaven.com/a/service_pistol) | Pistol, default (lab variant); copied from reference/photoreal-lab/assets | https://polyhaven.com/a/service_pistol | CC0 | No |
| lab/m4a1.glb + m4a1_0..2.webp (9,256 tris, 2K maps) | Rifle, default (lab variant) | https://3dmodelscc0.itch.io/free-cc0-guns-explosives-pack (3dmodelscc0) | CC0 | No |
| lab/shotgun.glb + shotgun_0..2.webp (1,740 tris, 2K maps) | Shotgun, default (lab variant) | https://3dmodelscc0.itch.io/free-cc0-guns-explosives-pack (3dmodelscc0) | CC0 | No |

The three `lab` models are the Photoreal Lab's quantised, texture-less GLBs; the webp maps are applied at load from the manifest `maps` field. Maps were prepared in the lab (2K, webp); their exact resize/pack steps are in reference/photoreal-lab/assets/manifest.json. The bolt rifle (Poly Haven bolt_action_rifle_7_62) is not copied: the game has no sniper weapon yet.

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

## Sound effects (local-audio)

All files are in `packages/client/public/audio/` (about 0.5 MB of mono Ogg Vorbis, trimmed with ffmpeg from the originals) and are mapped by `manifest.json` (sound id -> files, volume, rate, pitch spread, max voices, loop). To swap a sound, replace the file or edit the manifest; a missing file is silent. Master volume and mute persist in localStorage (`M` mute, `[` and `]` volume). No sound was synthesised in code.

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| sks.wav, cz.wav, shotty.wav (first shot only) | rifle-shot, pistol-shot, shotgun-shot | https://opengameart.org/content/gunshot-sounds (Tabasco) | Page says CC0; the zip's creativecommons.txt says CC-BY 3.0, copyright 2009 Vincent Sevedge. Treated as CC-BY | Yes: "Gunshot sounds, Vincent Sevedge, CC-BY 3.0" (add to a credits screen) |
| assaultriflereload1_0.wav, reload.wav, Shell in Chamber.mp3 | rifle, pistol, shotgun reload | https://opengameart.org/content/gun-reload-sounds, /content/handgun-reload-sound-effect, /content/shotgun-reload-sound-effects | CC0 | No |
| equipmentclicks.wav (first 0.3 s) | dry-fire, weapon switch | https://opengameart.org/content/equipment-clicks-ii | CC0 | No |
| bfh1_rock_falling_02, bfh1_misc_03, bfh1_metal_hit_05, bfh1_metal_hit_03 | impact-concrete, impact-dirt, hit-tick, headshot | https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx | CC0 | No |
| 01-04-footstep.ogg | footsteps | https://opengameart.org/content/footsteps-0 | CC0 | No |
| hit3.ogg, die1.ogg | player hurt, death | https://opengameart.org/content/5-hit-sounds-dying | CC0 | No |
| qubodup-click1.wav | ui-click, respawn, match start and end (pitched, echoed) | https://opengameart.org/content/button-click-sound-effect-cc0public-domain | CC0 | No |
| windy_ambiance_0.ogg (24 s cut) | wind loop | https://opengameart.org/content/windy-ambient-noise | CC0 | No |
| birds-isaiah658.ogg | birds loop | https://opengameart.org/content/ambient-bird-sounds | CC0 | No |

## Candidates from the graphics research (not in the game yet)

Used only in the prototype page (`docs/graphics-research.md`); the files are in the session scratchpad, not the repo. All are CC0, so no credit is needed. Poly Haven files come from `https://api.polyhaven.com/files/<id>`.

| Asset | Would be used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| service_pistol (16,650 tris for one pistol and its loaded magazine; 2K maps) | Pistol | https://polyhaven.com/a/service_pistol | CC0 | No |
| bolt_action_rifle_7_62 (19,985 tris; 2K and 1K maps) | A future sniper rifle | https://polyhaven.com/a/bolt_action_rifle_7_62 | CC0 | No |
| studio_small_08 HDRI (512 px used) | Weapon reflections | https://polyhaven.com/a/studio_small_08 | CC0 | No |
| herringbone_pavement (1K, colour warmed toward red) | Plaza pavers | https://polyhaven.com/a/herringbone_pavement | CC0 | No |
| clay_roof_tiles_02 (1K) | Clay tile hip roofs | https://polyhaven.com/a/clay_roof_tiles_02 | CC0 | No |
| Concrete012 (1K) | Limestone (brightened, joints drawn in), concrete bands | https://ambientcg.com/view?id=Concrete012 | CC0 | No |

## Google data (owner-exported, local only)

| Asset | Source | Licence / status | Credit needed |
|---|---|---|---|
| Photorealistic 3D Tiles around the Mall (`data/google/`, raw in `data/raw/tiles/`) | Google Map Tiles API, official, owner's key (`pnpm map:tiles`, `docs/google-export.md`) | needs-clearance | Attribution strings are recorded in `data/raw/tiles/manifest.json` |
| Street View Static images (`data/raw/streetview/`) | Google Street View Static API, official, owner's key (`pnpm map:streetview`) | needs-clearance | Copyright text per image in its manifest |

Both are gitignored and not part of any shipped build until cleared.
