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
| Apple Maps screenshots of WALC (`data/raw/apple-maps-walc/`, reference only, not shipped) | Screenshots of the macOS Apple Maps app window, satellite 3D view, author Apple and its imagery providers (`tools/apple-maps-capture.sh`, `docs/apple-maps-capture.md`) | needs-clearance | Gitignored; per-image camera data in `manifest.json` |

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

- reference/purdue-photos/memorial-union-3d-model-screenshot.png: owner-supplied screenshot of the Purdue Memorial Union SketchUp/3D Warehouse model (https://3dwarehouse.sketchup.com/model/1982888bb4c06bc2b4250b90e6223188). Reference only; licence needs-clearance.
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

## v5-union (Purdue Memorial Union hotspot, `packages/saltline/src/campus/hotspots/union.js`)
Google Street View Static API frames bought/downloaded by the owner with their own key (owner states usage rights); raw jpgs stay in data/raw/streetview/memorial-union/ (gitignored, never committed). **All needs-clearance.** Poses fitted by `tools/union-rectify.py` (manifest lat/lon is 7-9 m off the wall; fitted from visible wall ends and the Google-mesh eave height).
| File | Use | Source | Credit | needs-clearance |
|---|---|---|---|---|
| public/campus/hotspots/union/north-wing.jpg | Rectified north-wing wall (37 x 9 m), measuring reference for window size/pitch/dormers; not mapped on the model | Street View pano -6pw5fD2pW12NluOYWf8SQ, 2009-06, heading 180 | (c) 2026 Google | Yes |
| public/campus/hotspots/union/east-gable.jpg, brick-tile.jpg, limestone-tile.jpg | Rectified SE-wing east gable (13 x 10 m, measuring reference); seamless brick tile (patch of that wall, colour-gained); limestone grain tile (sill band, mean forced to cream) | Street View pano 11UvcOX8EMp8eaLSIDAdCA, 2017-07, heading 270 | (c) 2026 Google | Yes |
| slate colour (procedural, no file) | Slate mean colour 97,88,95 sampled from the 2009 frame's roof | pano -6pw5fD2pW12NluOYWf8SQ | (c) 2026 Google | Yes |
| (looked at, not used) panos CAoSFkNJSE0wb2dLRUlDQWdJQ2MyWjJrVEE. (2020-03, (c) Purdue Agriculture) and CAoSF0NJSE0wb2dLRUlDQWdJRDZfSVRPZ2dF (2021-09, (c) Kaho Sakaue) | All eight frames are INTERIOR (lobby, stair, west door with leaded arched glass): confirm the west arched lobby door and portal door only; no exterior coverage | Google Street View | as stated | Yes |
- reference/purdue-photos/memorial-union-3d-model-screenshot.png (SketchUp 3D Warehouse, see above): plan, roof forms, entrance, courtyard; reference only, no geometry or texture taken.
- data/google/mall-area.glb (Google Photorealistic 3D Tiles, local, gitignored): heights only (eave ~9 m, slate plateau ~13 m, tower 19-20 m, west pavilion 17 m, front pavilion 3-7 m); no texture or geometry used.
- Face coverage (tools/saltline-union-shots.mjs, docs/img/v5-union-vs-ref.jpg): **measured** = north wing north face (2009 frame: 3-light windows 3.4 x 4.8 m at 5.2 m pitch, dormers every ~13 m, eave) and the SE-wing east gable north 13 m (arched triple 4.0 m wide, window pairs, eave 8-9 m); **copied** = rest of the east gable face (punched rhythm), all other main-wall faces (generic 3.6 m punched/arcade rhythm); **guessed from SketchUp + mesh** = south front, front limestone pavilions, tower with stone window, portal and steps, west pavilion and canopy, east bays, dormers on all other wings, roof plateau clutter, chimneys, skylight. West face, south face, tower and portal have NO exterior photo. Interior of the building is not modelled.
## v5 hotspots (v5-elliott-mall): Elliott Hall of Music, Memorial Mall

Code-generated scenes `packages/saltline/src/campus/hotspots/{elliott,memorial-mall}.js` (no model files). Subsets of OSM data in `hotspots/data/*.json` via `tools/hotspot-data.py`.

| File / data | Use | Source | Licence | Needs clearance |
|---|---|---|---|---|
| data/raw/streetview/elliott-hall-of-music: HwF9pEOA_GGsn7OmyaXn2A (2007-09), XvCOiCOdmYC3iN9U64hBJg (2019-08), gd8RfryM02nVN5eF4Kj7Sg (2019-08), all 4 headings | measurements only (plan, portico, belts, windows); side-by-side docs/img/v5-elliott-vs-ref.jpg | Google Street View Static API (owner key) | (c) 2026 Google | Yes |
| data/raw/streetview/memorial-mall: edsyJrqna9EH1j_glWMayw (2019-08), eey-GRoIHUgaa9f9gm4QQw (2026-03), G1TnVsgNtp47PJz65TM4_g (2019-08), 4ZJB4xBsLSZSpd_pZk8Zzw (2019-08) | lamps, chain posts, hedge, walk/paver treatment; docs/img/v5-mall-vs-ref.jpg | Google Street View Static API (owner key) | (c) 2026 Google | Yes |
| docs/img/google/elliott-*.jpg, mall-*.jpg, mall-area-topdown.png | massing, roof, tower/drum layout, path and canopy layout | Google Photorealistic 3D Tiles renders | (c) Google | Yes |
| data/pilot/roofs.json (way/74151922), data/heights.json | roof planes (flat ~22.8 m, hip 33.7 deg), heights | USGS 3DEP lidar (see rows above) | public domain | No |
| data/campus.json (Elliott footprint, Memorial Mall park/lawns/gardens/paths/trees) | footprints, paths, trees | OpenStreetMap contributors | ODbL | Attribution |
| Not found | monuments on Memorial Mall: none in OSM or in the 5 frames, none drawn | | | |

Note: the brief called Elliott circular/domed; the data show a rectangular hipped-roof hall with a half-round rotunda. Raw frames for memorial-mall were read from a sibling worktree (gitignored, not committed).

### Layout cross-check (v6-layout)

| Asset | Used for | Source URL | Licence | Credit needed |
|---|---|---|---|---|
| CampusMapper Purdue campus map SVG + places JSON (not shipped; downloaded to data/raw/campusmapper/) | Cross-check of building outlines, official names and Purdue codes (docs/layout-report.md); no artwork copied, names and codes only | https://campusmapper.com/wp-content/uploads/2026/09/purdue-university-campus-map-2d.svg and https://campusmapper.com/wp-content/uploads/campusmapper-data/9332-3153f440b4d9.json | needs-clearance (unknown) | Unknown |
| v6 roof atlas + far-field ground albedo (`public/campus/walk/roofs/atlas-*.webp`, `ground-far.jpg`) | Top-down orthographic render of the Google Photorealistic 3D Tiles mesh (`data/google/mall-area.glb`) by `tools/google-topdown.mjs`, processed by `tools/google-roofs.py` | needs-clearance | Owner states usage rights; attribution "Google" |
## v6-heroes (Union, Elliott, WALC north/east, Memorial Mall polish)
All Street View sources below are Google frames (c) 2026 Google, downloaded by the owner with their own key; raw jpgs stay gitignored (data/raw/streetview/*) and are never committed. **All needs-clearance.**

| File / data | Use | Source | Needs clearance |
|---|---|---|---|
| public/campus/hotspots/union/brick-tile-large.jpg (tools/union-brick-mosaic.py) | 9.2 x 7.0 m brick tile built from the rectified east-gable brick patch (8 x 8 flipped/jittered copies); replaces the 1.15 m repeating tile | Street View pano 11UvcOX8EMp8eaLSIDAdCA (2017-07, heading 270) | Yes |
| public/campus/hotspots/union/north-wing.jpg | now also the far-LOD (> 140 m) wall texture on every Union face | Street View pano -6pw5fD2pW12NluOYWf8SQ (2009-06, heading 180) | Yes |
| Union face layouts (3-light hall windows; arched triple + window pairs) | measured layout duplicated onto every main wall and bay | same two panos | Yes |
| Elliott brick/stone colours (photo-sampled mean (96,80,73) with mortar, std 25) and the stepped cornice, quoin, pilaster-strip, lot-marking and tree observations | colour tuning and detail placement, no photo is mapped | Street View panos gd8RfryM02nVN5eF4Kj7Sg (2019-08) and HwF9pEOA_GGsn7OmyaXn2A (2007-09) | Yes |
| WALC north and east faces | duplicate the measured west-pavilion layout and rectified tile (public/campus/walk/walc/west-pavilion.jpg, already logged) | Street View CAoSF0NJ...TbWdF (2021-09) | Yes (as before) |
| Memorial Mall lawn patches, expansion joints, extra trees along the walks | procedural, tuned by eye to the 2019 frames; no new files | Street View panos edsyJrqna9EH1j_glWMayw, G1TnVsgNtp47PJz65TM4_g (2019-08) | Yes |
## v6-facades (Street View Tiles API, owner key)
Photographic facade tiles for the 52 non-hotspot massing buildings, rectified from Street View panoramas (Map Tiles API, mapType streetview, zoom 4) with the owner's Google key (owner states usage rights). Raw tiles stay in data/raw/streetview-tiles/ (gitignored). Tools: tools/sv-inventory.mjs, sv-select.mjs, sv-download.mjs, facade-extract.py. Output: packages/saltline/public/campus/facades/photo/*.webp + manifest.json (one rectified wall tile per building, exposure-normalised, duplicated onto every face). **All needs-clearance.** Contributor panos are credited as (c) contributor.

| Building (id) | Pano | Date | Credit | Confidence | Candidate panos |
|---|---|---|---|---|---|
| Physics Building (PHYS) (way/74340895) | R5n3-Wan-fR-gmoilcN_9Q | 2025-08 | Google Street View, (c) 2026 Google | 0.998 | 26 |
| Hovde Hall of Administration (HOVD) (way/75498146) | AlEKOl5L6ZaLeS_RFWTraw | 2019-08 | Google Street View, (c) 2026 Google | 0.978 | 20 |
| Heine Pharmacy (RHPH) (way/117146482) | 4Di-384KjxdTvozJdh_icw | 2026-04 | Google Street View, (c) 2026 Google | 0.961 | 15 |
| Union Club Hotel (way/117146483) | kHR6H6noizuVfkj29PCfOQ | 2026-03 | Google Street View, (c) 2026 Google | 0.775 | 18 |
| Stewart Center (STEW) (way/117146484) | wAIHN7NdJxoKqHXyH8FSMw | 2019-08 | Google Street View, (c) 2026 Google | 0.788 | 20 |
| Student Health Center (PUSH) (way/117146486) | 3-WO0G8nTRrBDVY2aPQUng | 2026-04 | Google Street View, (c) 2026 Google | 0.995 | 17 |
| R. B. Wetherill Laboratory of Chemistry (WTHR) (way/117146489) | wJ-Wrf7vCg8ot3AKt_XBIQ | 2017-09 | Google Street View, (c) 2026 Google | 0.836 | 27 |
| Haas (Felix) Hall (HAAS) (way/117147168) | MtZMclI1aQlsgUm1U4Zsiw | 2026-04 | Google Street View, (c) 2026 Google | 0.832 | 19 |
| Armory (AR) (way/117147171) | CAoSFkNJSE0wb2dLRUlDQWdJRHEzY25MZVE. | 2021-04 | Google Street View, (c) Dana Moseson-Tarrh | 0.926 | 28 |
| Matthews Hall (MTHW) (way/117147172) | s1iu6s9n1GN-FE89VbiSFw | 2023-07 | Google Street View, (c) 2026 Google | 0.891 | 22 |
| Stone Hall (STON) (way/117147178) | K9XU9ibaM4m26MfSH41vog | 2019-08 | Google Street View, (c) 2026 Google | 0.871 | 21 |
| Materials Science and Electrical Engineering (MSEE) (way/158307858) | u149QOTu5LDQAa6qdW4bkw | 2025-08 | Google Street View, (c) 2026 Google | 0.998 | 21 |
| Max W & Maileen Brown Family Hall of Electrical Engineering (BHEE) (way/158307860) | yxb2_jy7IK62GQGlRuZMug | 2025-08 | Google Street View, (c) 2026 Google | 0.978 | 35 |
| University Hall (UNIV) (way/158307901) | se50M2E4MsI4SDY51--kTg | 2019-08 | Google Street View, (c) 2026 Google | 0.981 | 14 |
| way/301932783 (way/301932783) | exlBMg_pdUN9R3Cfm1-9jQ | 2025-08 | Google Street View, (c) 2026 Google | 0.999 | 29 |
| University Lutheran Church (way/301932784) | yxb2_jy7IK62GQGlRuZMug | 2025-08 | Google Street View, (c) 2026 Google | 0.998 | 18 |
| Wang Hall (WANG) (way/301932787) | GDRDAdWQDlUVZI2qsD9uTg | 2025-08 | Google Street View, (c) 2026 Google | 0.915 | 38 |
| way/301932790 (way/301932790) | 1CPNSiyIlJzORCXct7K_SA | 2026-03 | Google Street View, (c) 2026 Google | 0.99 | 14 |
| way/860822250 (way/860822250) | MOM0ExItgzNnpRGYGXtlOA | 2017-08 | Google Street View, (c) 2026 Google | 0.765 | 26 |
| American Railway Building (RAIL) (way/932253994) | 6u2Sw1tE8AOViveStsyV9A | 2017-08 | Google Street View, (c) 2026 Google | 0.916 | 5 |
| Purdue Graduate Student Center (way/1103303762) | rb-46OKsv-rCfnUUIYr4vA | 2025-08 | Google Street View, (c) 2026 Google | 0.933 | 19 |
| way/1149668161 (way/1149668161) | SFkpFTnBSvlf7blM-jBa8g | 2026-03 | Google Street View, (c) 2026 Google | 0.87 | 6 |
| Lambertus Hall (LMBS) (way/1383852532) | MOM0ExItgzNnpRGYGXtlOA | 2017-08 | Google Street View, (c) 2026 Google | 0.785 | 9 |
| way/1418955365 (way/1418955365) | fQPNgpqxXOkFgFCUmL8hgw | 2026-03 | Google Street View, (c) 2026 Google | 0.998 | 29 |
| way/1418958953 (way/1418958953) | ycaxPb0AeM9b8EX15LDDOA | 2025-08 | Google Street View, (c) 2026 Google | 1 | 19 |
| Brown Laboratory of Chemistry (BRWN) (way/117146480) | none: colour/class from way/860822250, way/117146489, way/1383852532 | - | - | fallback | 15 |
| Knoy Hall (KNOY) (way/117146487) | none: colour/class from way/1383852532, way/301932783, way/860822250 | - | - | fallback | 27 |
| Johnson Hall of Nursing (JNSN) (way/117146488) | none: colour/class from way/117146482, way/117146486, way/75498146 | - | - | fallback | 4 |
| Hall of Data Science and AI (DSAI) (way/117146492) | none: colour/class from way/75498146, way/117146488, way/117146482 | - | - | fallback | 3 |
| Grissom Hall (way/117146493) | none: colour/class from way/117146480, way/860822250, way/117146483 | - | - | fallback | 22 |
| Hampton Hall of Civil Engineering (HAMP) (way/117146495) | none: colour/class from way/74340895, way/117146486, way/117146488 | - | - | fallback | 9 |
| Forney Hall of Chemical Engineering (FRNY) (way/117146497) | none: colour/class from way/74340895, way/117146495, way/117146492 | - | - | fallback | 4 |
| Schleman Hall (SCHM) (way/117147167) | none: colour/class from way/158307901, way/117147178, way/1149668161 | - | - | fallback | 12 |
| Potter Engineering Center (POTR) (way/117147170) | none: colour/class from way/932253994, way/1383852532, way/860822250 | - | - | fallback | 14 |
| Psychological Sciences Building (PSYC) (way/117147173) | none: colour/class from way/117147168, way/117147167, way/75498146 | - | - | fallback | 34 |
| Beering Hall (BRNG) (way/117147176) | none: colour/class from way/117147167, way/158307901, way/117147172 | - | - | fallback | 15 |
| Mathematical Sciences Building (MATH) (way/117147177) | none: colour/class from way/117147167, way/117147176, way/117147168 | - | - | fallback | 3 |
| Mechanical Engineering (ME) (way/158307862) | none: colour/class from way/932253994, way/117147170, way/158307860 | - | - | fallback | 16 |
| Hicks Undergraduate Library (HIKS) (way/158307900) | none: colour/class from way/117146484, way/117146483, way/117146489 | - | - | fallback | 11 |
| Northwestern Parking Garage (way/283275025) | none: colour/class from way/1418955365, way/1418958953, way/1103303762 | - | - | fallback | 50 |
| way/301932785 (way/301932785) | none: colour/class from way/301932783, way/301932784, way/1418955365 | - | - | fallback | 13 |
| way/301932786 (way/301932786) | none: colour/class from way/301932785, way/301932784, way/1418955365 | - | - | fallback | 5 |
| Class of 1950 Lecture Hall (CL50) (way/309492283) | none: colour/class from way/117147177, way/117147167, way/117147173 | - | - | fallback | 16 |
| Pierce Hall (PRCE) (way/309492284) | none: colour/class from way/309492283, way/117147173, way/117147177 | - | - | fallback | 10 |
| way/607137011 (way/607137011) | none: colour/class from way/301932790, way/283275025, way/1418958953 | - | - | fallback | 12 |
| way/607137013 (way/607137013) | none: colour/class from way/607137011, way/301932790, way/283275025 | - | - | fallback | 12 |
| way/607137015 (way/607137015) | none: colour/class from way/607137013, way/607137011, way/301932790 | - | - | fallback | 12 |
| Chaney-Hale Hall of Science (CHAS) (way/866802210) | none: colour/class from way/117147171, way/117146492, way/75498146 | - | - | fallback | 10 |
| way/1033674918 (way/1033674918) | none: colour/class from way/158307858, way/74340895, way/117146497 | - | - | fallback | 9 |
| way/1033674919 (way/1033674919) | none: colour/class from way/158307858, way/158307860, way/1418958953 | - | - | fallback | 11 |
| way/1033674920 (way/1033674920) | none: colour/class from way/75498146, way/117146492, way/866802210 | - | - | fallback | 2 |
| Dudley Hall (DUDL) (way/1383852533) | none: colour/class from way/860822250, way/1383852532, way/117146493 | - | - | fallback | 22 |
| way/1418750210 (way/1418750210) | none: colour/class from way/1418958953, way/283275025, way/1103303762 | - | - | fallback | 0 |
| way/1418954764 (way/1418954764) | none: colour/class from way/283275025, way/607137011, way/1418750210 | - | - | fallback | 30 |
| way/1419291577 (way/1419291577) | none: colour/class from way/1418750210, way/283275025, way/1418958953 | - | - | fallback | 0 |
| way/1419291578 (way/1419291578) | none: colour/class from way/301932786, way/301932785, way/1418955365 | - | - | fallback | 0 |

## walc-hifi (WALC rebuilt from measurements)

| Asset | Use | Source, author | Licence status | Needs clearance |
|---|---|---|---|---|
| packages/saltline/public/campus/walk/walc/roof-tile.jpg, roof-tile-n.jpg, brick-hifi.jpg, brick-diaper.jpg, brick-n.jpg, limestone-hifi.jpg (1024 px, limestone 512; 1.2 MB in all) | WALC clay tile, brick, diaper brick and limestone albedo and normal maps | Generated by `tools/walc-textures.py` (own work). Only numbers were taken from imagery: tile pitch 0.25 x 0.37 m and mean colours measured on the rectified Apple Maps frames | Own work; no pixels of third-party imagery | No |
| Apple Maps frames west-mid, west-4, east-mid, south-mid (`data/raw/apple-maps-walc/`, not shipped) | Measurement reference: camera poses (`tools/walc-apple.py`, `tools/walc-apple.json`), rectified facades, colour statistics | Apple Maps macOS app, Apple and its imagery providers | Unknown | needs-clearance (reference only; the frames also appear, downscaled, in docs/img/walc-hifi-vs-apple.jpg) |
| Google mesh top-down rasters and slices (`data/google/`, not shipped) | Roof plan, wall lines, heights | Google Map Tiles API, owner's key | See the Google rows above | needs-clearance (reference only) |
| reference/purdue-photos/walc-news-plant-wilmeth-now2LO.jpg | North face layout | Purdue Today, 2018 (already logged) | As logged | As logged |

Removed from the bundle: the v4 Street View tiles public/campus/walk/walc/{west-pavilion,colonnade,south-bulge,brick-tile,limestone-tile}.jpg and colours.json (no longer mapped; `tools/walc-rectify.py` can rebuild them).
