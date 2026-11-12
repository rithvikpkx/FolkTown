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

## Saltline (game base fork)

| Asset | Source | Licence / status | Credit needed |
|---|---|---|---|
| Saltline, a single-file procedural FPS, forked into `packages/saltline` (code only; models, textures and audio are generated in code) | Distributed as a single HTML file; source URL not recorded in the file (supplied by the owner, see `docs/saltline-deep-findings.md`) | Reuse permission granted by Saltline's owner to the FolkTown owner; no licence text in the source. Mark `needs-clearance` until the permission is written down | Credit Saltline's author; the original's page title is "Saltline" |
| Three.js r180 (`three@0.180.0`) used by it | https://github.com/mrdoob/three.js | MIT | Retain the MIT notice (in the npm package) |
| Fonts it loads from Google Fonts: Big Shoulders Display, IBM Plex Mono, Barlow Condensed | https://fonts.google.com | SIL OFL 1.1 | None required |

- Purdue exterior reference photos (35, from Purdue pages; provenance in reference/purdue-photos/manifest.json): owner states Purdue reuse rights; status needs-clearance for non-Purdue images. Purdue ArcGIS building layer (data/raw/purdue-historic-buildings.geojson, reference only).

## Campus ground (`packages/saltline/public/campus/`)

| File | Use | Source | Licence | Needs clearance |
|---|---|---|---|---|
| grass-*.jpg, pavers-*.jpg, asphalt-*.jpg (albedo, normal, roughness, 1024 px) | Ground shader in `src/campus/ground.js` | Copied from `packages/client/public/textures/`; ambientCG Grass (see local-materials table above), PavingStones070, Asphalt031, https://ambientcg.com | CC0 | No |
| mall-paths.json | Footways/roads for the mask, trimmed from `data/campus.json` (OSM) | https://www.openstreetmap.org via `data/campus.json` | ODbL (OSM) | Credit OSM contributors |
| purdue-mall.json | Copy of `data/zones/purdue-mall.json` for the demo page | Generated by the zone pipeline | OSM-derived (ODbL) | Credit OSM contributors |
| Leaf, billboard and tree geometry | `src/campus/vegetation.js` | Generated in code (canvas), no download | n/a | No |

## Pilot free data (`packages/saltline/public/campus/pilot/`, `data/pilot/`)

| File | Use | Source | Licence | Needs clearance |
|---|---|---|---|---|
| pilot/ortho.jpg + ortho.json | 6-inch aerial ground/roof texture, 240 x 250 m, 3150 x 3281 px (7.6 cm/px), flown spring 2023 | Indiana Geographic Information Office orthoimagery, layer `Indiana_2023_SPW_06in`, ImageServer https://di-ingov.img.arcgis.com/arcgis/rest/services/DynamicWebMercator/Indiana_Current_Imagery/ImageServer (IndianaMap / IGIO) | CC0 per the service's copyright text | No (credit IGIO as courtesy) |
| data/pilot/roofs.json | Roof planes, 1 m height rasters, plant boxes for 12 buildings | Derived from USGS 3DEP IN_Statewide_Opt2_B2_2017 QL2 point cloud, https://usgs-lidar-public.s3.amazonaws.com/IN_Statewide_Opt2_B2_2017/ | Public domain (USGS) | No |
| data/raw/purdue-historic-buildings.geojson | Names/years cross-check only (not shipped) | Purdue ArcGIS layer, via research folder | Unknown; Purdue says 3DEP viewer is unrestricted, this layer not stated | needs-clearance |

## Facade photo textures (v2-photo-textures)

Rectified from real photographs by `tools/make-facade-textures.py` (quad corners picked by eye). Output in `packages/saltline/public/campus/walk/tex/`, described by `packages/saltline/public/campus/walk/facades.json`, proof sheet `docs/img/v2-textures.jpg`. Mapillary API search (about 48 images within the pilot area, all 2020-2021 plus a few 2024) found NO usable image of any WALC face and only distant, tree-occluded views of the Bell Tower.

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| bell-shaft.jpg, bell-clock-stage.jpg, mat-brick-red.jpg, mat-limestone-cream.jpg | Bell Tower shaft and clock stage, red brick and cream stone patches | https://commons.wikimedia.org/wiki/File:Purdue_Bell_Tower_Purdue_University_2016_01.jpg (Julian Herzog) | CC BY 4.0 | Yes: "Julian Herzog, CC BY 4.0, via Wikimedia Commons" |
| mat-brick-dark.jpg, mat-limestone-ashlar.jpg | Dark brick and ashlar limestone patches (from Elliott Hall of Music, not WALC or Bell Tower) | Mapillary image 750908235597635, 2020-10-31, user kennystier (Graph API, token not committed) | CC BY-SA 4.0 (Mapillary); `needs-clearance` for share-alike | Yes: "kennystier, CC BY-SA 4.0, via Mapillary" |
| walc-wall-paired-windows.jpg, walc-wall-tall-slits.jpg, mat-glass-window.jpg | WALC brick wall looks (one corner, compass faces unknown, 800 px source so soft) | https://www.purdue.edu/uns/images/2018/plant-wilmeth-now2LO.jpg (Purdue Today, 2018); copy in reference/purdue-photos | `needs-clearance` (Purdue University photo, rights unknown) | Unknown |

## Bell Tower references (v2-belltower; measured only, not shipped, except bell-shaft.jpg via facades.json)
Wikimedia Commons: Purdue_Bell_Tower_Purdue_University_2016_01.jpg (Julian Herzog, CC BY 4.0); Purdue_BellTower_1.jpg (PD); Purdue_University_belltower.jpg (PD); Purdue_BellTowerTimeCapsule.jpg (PD; plaque text reproduced procedurally); Purdue_Bell_Tower_night.JPG (CC BY-SA 3.0); Purdue_BellTower.jpg (CC BY-SA 3.0); 2122_px_-_Bell_Tower_Purdue_University_Fall_2006.JPG (CC BY 3.0).
## v2-environment (walk scene)

| File | Use | Source | Licence | needs-clearance |
|---|---|---|---|---|
| public/campus/walk/concrete-{albedo,normal}.jpg (2K, concrete_pavement) | Plaza and walk paving, ground.js | https://polyhaven.com/a/concrete_pavement | CC0 | No |
| public/campus/walk/dirt-albedo.jpg (2K, park_dirt) | Worn desire paths | https://polyhaven.com/a/park_dirt | CC0 | No |
| public/campus/walk/leaves-albedo.jpg (2K, leafy_grass) | Fallen-leaf litter | https://polyhaven.com/a/leafy_grass | CC0 | No |
| public/campus/env/sky/qwantani_{mid_morning,noon,late_afternoon,sunset}_puresky.jpg, kloofendal_overcast_puresky.jpg | Sky dome and image-based light (?tod=); 2K HDRI converted offline to tonemapped sRGB jpg | https://polyhaven.com/a/qwantani_mid_morning_puresky and siblings, https://polyhaven.com/a/kloofendal_overcast_puresky | CC0 | No |

Ortho georeference fit lives in pilot/ortho.json (fit). Trees, shrubs, grasses, furniture, road paint, curbs are generated in code (src/campus/env/, ground.js decals).

- reference/purdue-photos/walc-design-render-aerial.png: architect design render of WALC and the Bell Tower plaza, from the Purdue Active Learning site (owner-supplied screenshot, 12 Nov 2026). Design reference only, not for use as a texture; licence needs-clearance.
- Sketchfab "Purdue University Bell Tower" (uid 37db7dfc51c347849b8e5975d8a89812, Olivia Bultinck, CC Attribution, downloadable, 21,656 faces, stylised recreation, published 2026-07-16): candidate asset; not yet downloaded (needs owner login). Purdue Memorial Union (3D Warehouse 1982888bb4c06bc2b4250b90e6223188) and EveryPoint Purdue scans collection: candidates for later zones; campusmapper.com and cadmapper.com: reference/tools only.

## v3-plaza
| File | Use | Source | Licence | needs-clearance |
|---|---|---|---|---|
| public/campus/walk/brick-{albedo,normal,rough}.jpg (2K, red_brick_pavers) | WALC plaza brick paving, env/plaza.js (anti-tiled in shader) | https://polyhaven.com/a/red_brick_pavers | CC0 | No |
- public/campus/walk/belltower-scan.json + belltower-scan-{0,1}.webp: Sketchfab "Purdue University Bell Tower" by Olivia Bultinck, CC BY 4.0, https://sketchfab.com/3d-models/purdue-university-bell-tower-37db7dfc51c347849b8e5975d8a89812 (original in reference/models/, 20,844 tris, 87 meshes). Converted by tools/glb-to-web.mjs, loaded by src/campus/env/belltower-scan.js behind ?tower=scan (default is the code tower). Attribution is shown in the walk hint when ?tower=scan; keep it wherever the scan ships. Not needs-clearance (CC BY credit only).

## v4-walc-streetview
Google Street View Static API frames bought/downloaded by the owner with their own key (owner states usage rights); raw 640x640 jpgs stay in data/raw/streetview/ (gitignored, not committed). Credit text from the manifest. **All needs-clearance.**
| File | Use | Source | Credit | needs-clearance |
|---|---|---|---|---|
| packages/saltline/public/campus/walk/walc/west-pavilion.jpg, colonnade.jpg, brick-tile.jpg, limestone-tile.jpg | Rectified/colour-corrected albedo of the south pavilion west face; colonnade reference (not mapped); seamless brick strip tile; limestone grain/colour tile (all derived from pano CAoSF0NJSE0wb2dLRUlDQWdJQzZzNVRTbWdF, 2021-09, heading 90) | Google Street View, pano CAoSF0NJSE0wb2dLRUlDQWdJQzZzNVRTbWdF | Google, © Kaho Sakaue | Yes |
| packages/saltline/public/campus/walk/walc/south-bulge.jpg | Rectified albedo of the south bulge face (pano _2SMIzURFlvLO3vHwJQjiA, 2017-09, heading 0) | Google Street View, pano _2SMIzURFlvLO3vHwJQjiA | © 2026 Google | Yes |
| (measurements only) pano CAoSFENJSE0wb2dLRUlDQWdJQzZzNVF5, 2021-09 | all four headings are INTERIOR (STEAM Commons, Au Bon Pain): no east-face exterior coverage; used for nothing | Google Street View | Google, © Kaho Sakaue | Yes |
Tools: tools/walc-rectify.py (rectify + colour correction), tools/walc-sidebyside.py. Roof tile: no roof is visible in any frame (only dark soffits), colour unchanged from the Purdue design render; north face of WALC: COPIED from the south long wall (layout, mirrored in z so x positions are kept), not measured, no photo. Bell tower frames (bell-tower/) not used here (belltower.js is other work).
