# Graphics research: the route to near-photoreal

Written 12 November 2026. Question: how close can FolkTown get to Call of Duty-like realism for (a) generic assets (guns, props, characters) and (b) Purdue buildings, in a browser tab on a MacBook Air M1.

Prototype: **FolkTown Photoreal Lab**, https://claude.ai/artifact/R6zcvySTJTadnqdmeKvFBQ (source and assets in the session scratchpad under `lab/`, not in the repo). Four weapons and a code-built WALC, with Balanced and Ultra presets and a measured cost per technique.

How to read this file: rows marked **checked** were read from the primary source or measured in this session. Rows marked **reported** came from delegated web research or secondary sources and should be re-read before anyone depends on them. Rows marked **not checked** were not researched.

## 1. Verdict

**Generic assets.** Near-photoreal is achievable now for guns and props. The Poly Haven service pistol in the lab (16,650 triangles, 2K maps, lit by an HDRI) holds up in close-up. The limit is supply, not rendering: Poly Haven has only two firearms (a service pistol and a bolt-action rifle), and the CC0 itch.io packs the game ships today have nearly flat colour and normal maps. Photoreal M4, 1911 and pump shotgun models exist on Sketchfab under CC-BY, which needs a login to download and a credits screen. Characters are the weak point: no photoreal, rigged, CC0 soldier was found.

**Purdue buildings.** No ready-made model exists in any source checked, and Google's 3D tiles cannot be used. Buildings have to be made. Code plus CC0 materials plus two reference photos gave a recognisable WALC at 96,051 triangles and 4.2 ms a frame, which reads as a good game building and not as a photograph. Getting closer needs the owner's own photos of each landmark (for facade style sheets and photo textures), baked occlusion, and better vegetation. A photo-match of the real campus is not realistic in a browser.

**Honest ceiling.** Weapons: close to a 2015-era console shooter in close-up. Campus: clean, well-lit, recognisable architecture with correct materials. Not reachable on this hardware: real-time global illumination, ray tracing, film-quality foliage and characters.

## 2. What the lab measured

Baseline machine (MacBook Air M1, 16 GB), headless Chrome with Metal, Retina scale, Three.js r170 WebGL2. Bursts of frames timed with `performance.now()` and forced to finish with a pixel read. The scenes are small (one building or one weapon, no bots, no haze), so these are technique costs, not game frame times.

| Scene | Triangles | Balanced, 1.2 MP | Ultra, 2.3 MP |
|---|---|---|---|
| Rifle (M4A1, CC0) | 9,256 | 4.3 ms | 19.8 ms |
| Pistol (Poly Haven) | 16,650 | 4.4 ms | 19.6 ms |
| Shotgun (pump, CC0) | 1,740 | 4.3 ms | 19.4 ms |
| Bolt rifle (Poly Haven) | 19,985 | 4.5 ms | 19.3 ms |
| WALC and plaza | 96,051 | 4.2 ms | 15.4 ms |

Balanced: FXAA, 2048 px sun shadow, image-based light, bloom, grain. Ultra adds 4× MSAA, half-size GTAO, a 4096 px shadow map, depth of field on weapons and 2.3 MP.

Cost of each Ultra step, measured by removing it:

| Step | WALC | Pistol |
|---|---|---|
| 2.3 MP instead of 1.2 MP | 5.5 ms | 7.5 ms |
| 4× MSAA on the scene pass instead of FXAA | 3.5 ms | 4.2 ms |
| GTAO at half size, 12 samples, with denoise | 3.2 ms | 4.3 ms |
| Depth of field (Bokeh pass) | not used | 4.2 ms |
| Shadow map 4096 px instead of 2048 px | 2.1 ms | 3.5 ms |
| Sun shadows at all | 4.9 ms | 7.1 ms |
| Bloom | 1.9 ms | 2.6 ms |
| Image-based light | 0.7 ms | 0.8 ms |
| Grain and vignette | 0 | 0.4 ms |

Two findings worth keeping:

- **MSAA must be on the scene pass only.** With MSAA on the composer's ping-pong targets every post pass paid for a resolve: the MSAA step alone measured 17 ms and Ultra cost 29 to 38 ms. On one dedicated scene target it measured 3.5 ms, and with occlusion samples trimmed from 16 to 12 Ultra fell to 15 to 20 ms.
- **Triangle count barely moved the frame time.** 1,740 and 96,051 triangles cost the same in Balanced. Pixels and passes are the cost, which matches `docs/fidelity-findings.md`.

## 3. Generic assets: sources ranked

| Rank | Source | Licence | Login | Quality for this job | Status |
|---|---|---|---|---|---|
| 1 | [Poly Haven](https://polyhaven.com) models, textures, HDRIs | CC0 | No | Scan-grade. Firearms: `service_pistol` (27,548 triangles with all variants) and `bolt_action_rifle_7_62` (19,985). Also ammo box, military crates, jerrycan, stick grenade, radio | checked (API listing and downloads) |
| 2 | [ambientCG](https://ambientcg.com) | CC0, redistribution allowed ([licence](https://docs.ambientcg.com/license)) | No | Excellent tiling PBR sets. Already in use | checked |
| 3 | [Sketchfab](https://sketchfab.com) CC-BY and CC0 downloads | Per model | Yes ([download API](https://sketchfab.com/developers/download-api)) | The best supply of realistic modern guns and soldiers. Quality and provenance vary | reported |
| 4 | [Quaternius](https://quaternius.com/packs/universalbasecharacters.html) characters and [animation library](https://quaternius.com/packs/universalanimationlibrary.html) | CC0 | No | Clean, rigged, 120+ animations. Stylised, not photoreal | reported |
| 5 | itch.io CC0 packs: [3dmodelscc0](https://3dmodelscc0.itch.io/free-cc0-guns-explosives-pack), [Stein Games](https://stein-indie.itch.io/classic-weapons-pack) | CC0 | No | Game-ready, 2K maps. The M4A1's colour map compresses to 28 KB at 2K: it is almost a flat colour. The Stein 1911 and AK47 maps are far larger files and were not re-examined here | checked (files) |
| 6 | Quixel Megascans on [Fab](https://www.fab.com/eula) | Fab Standard | Epic account | Top-tier scanned props and surfaces. Reported free for the whole library from 6 November 2026 ([80.lv](https://80.lv/articles/entire-quixel-megascans-library-now-available-for-free/)). The licence is not limited to Unreal, but does not say whether files a browser can download count as redistribution | reported, licence question open |
| 7 | [BlenderKit](https://www.blenderkit.com/docs/licenses/) free tier | Royalty Free or CC0 | Yes | Mixed. Royalty Free assets may ship in a game only if players cannot easily extract them, which a browser game cannot promise | reported |
| 8 | Mixamo characters and animations | Adobe terms ([FAQ thread](https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/m-p/13234775)) | Adobe ID | Good animations, dated characters. Raw files must not be redistributed, and a web server serving them is the risky case | reported |
| 9 | [Smithsonian 3D](https://www.si.edu/openaccess) | CC0 | No | Museum scans, very heavy. No usable firearm confirmed | reported |
| | Kenney, OpenGameArt, NASA, MakeHuman, CGTrader and TurboSquid free tiers | | | | not checked |
| | Ready Player Me | | | Shut down 31 January 2026 ([summary](https://avatarsdk.com/blog/2026/08/31/avatar-platforms-2026-whos-alive-whos-gone/)) | reported |

Concrete candidates on Sketchfab, all listed as CC-BY 4.0 (face counts from Sketchfab's API, texture sizes from the authors' descriptions; none downloaded or inspected):

| Weapon | Model | Faces |
|---|---|---|
| Rifle | [Colt M4A1 Carbine, 8sianDude](https://sketchfab.com/3d-models/none-fa4a73faf4234e5db4066335074a7655), 4K PBR | 83,941 (needs decimating) |
| Rifle | [Low-Poly M4a1, TastyTony](https://sketchfab.com/3d-models/none-8cab1cbeb82c4396a154f9fc8771417b) | 10,680 |
| Pistol | [M1911, e.belous](https://sketchfab.com/3d-models/none-80a0b8a6c4314da4a7b3a7cfe6cec1d4), 4K and 2K sets | 23,160 |
| Shotgun | [Remington 870 Police Magnum, 8sianDude](https://sketchfab.com/3d-models/none-eea11de7e9d24b6683962b8388c319eb), 4K PBR | 17,476 |
| Shotgun | [Remington 870, tris.blend](https://sketchfab.com/3d-models/none-26e37df4c38c4e8a9da8adeb4b66bff6), game-ready | 4,391 |
| Soldier | [S.W.A.T. Operator, SpatialNeglect](https://sketchfab.com/3d-models/none-9e82fabf26194896b5ad4a364d864eab), rig not confirmed | 106,714 |
| Soldier | [Soldier Full Tactical Gear, DanlyVostok](https://sketchfab.com/3d-models/none-850593a8c7114c188395ba1849a66eb9), rig not confirmed | 84,158 |

Licence traps:

- **Game rips.** Many realistic guns on Sketchfab are extracted from commercial games and re-uploaded under a Creative Commons tag. Check each author's description for how it was made before shipping.
- **Titles that say CC0 over a CC-BY tag.** Example: ["Firearms kit #10 CC0"](https://sketchfab.com/3d-models/firearms-kit--10-cc0-386f0582c28d4dff96da967f42ba20f7) is listed CC-BY. The licence line on the page rules.
- **No-extraction clauses** (BlenderKit Royalty Free, Mixamo, possibly Fab). A browser game hands every file to the player.
- **CC-BY-NC, Editorial and Sketchfab Standard** are not usable. FolkTown is non-commercial today, but the repo's licence and any later change would break NC assets.
- **CC-BY needs a credits screen.** `docs/assets.md` already says where the credit line goes.

## 4. AI 3D generation

All rows reported, not tested. Nothing was generated and no account was made.

| Tool | Output | Price and licence | Runs on an M1 with 16 GB |
|---|---|---|---|
| [Meshy](https://www.meshy.ai/pricing) | Textured mesh; remesh and rigging as separate steps | Free: 100 credits, 10 downloads a month, outputs are **CC BY 4.0**. Pro: $20 for 1,000 credits, outputs private | No, cloud |
| [Tripo](https://developers.tripo3d.com/en/models/v3-1) | Quad output and PBR claimed; 500 to 50k triangles ([review](https://digitalproduction.com/2026/09/29/tripo-p2-0-put-quad-mesh-generation-to-the-test/)) | Not verified | No, cloud |
| Rodin (Hyper3D) | High-poly quads, 4K textures claimed | Not verified | No, cloud |
| Hunyuan3D 2.1 (open weights) | Shape plus PBR texture stage | [Licence](https://gitserver.onethingai.com/ai-models/Hunyuan3D-2.1/raw/branch/main/LICENSE) excludes the EU, UK and South Korea | Shape only reported on Apple silicon; the texture stage is reported to need about 21 GB |
| [TRELLIS.2](https://github.com/microsoft/TRELLIS.2) | Base colour, roughness, metallic | Code and model MIT. The [Mac port](https://github.com/shivampkumar/trellis-mac) pulls in a CC BY-NC dependency | [A test on an M1 Max with 64 GB](https://lilting.ch/en/articles/trellis2-m1-max-hands-on) peaked at 17.5 to 18.5 GB and took 75 to 229 minutes to bake textures. Not practical on 16 GB |
| [Stable Fast 3D](https://huggingface.co/stabilityai/stable-fast-3d) | Fast single-image mesh | Free under $1M annual revenue | Not verified |

Judgment: AI meshes are useful for one-off props (a statue, a sign, a piece of plaza furniture). They are a poor fit for guns and buildings, where straight edges, exact parts and correct proportions are the whole point, and a free scanned-grade asset usually beats them. No local model is practical on the baseline machine.

If one is used, the clean-up is: decimate or retopologise in Blender, unwrap, bake the high-poly normals onto the low-poly mesh, fix roughness and metalness, then compress with glTF-Transform. Estimate one to three hours per asset; this needs Blender, which is not installed on this machine (`which blender` finds nothing) and was not installed.

## 5. Purdue buildings: routes ranked

| Rank | Route | Fidelity | Cost in browser | Licence | Verdict |
|---|---|---|---|---|---|
| 1 | **Facade grammar in code from the real footprint, a per-building style sheet and CC0 PBR sets** (what the lab's WALC does) | Recognisable, correct massing and rhythm | 96k triangles, 4.2 ms | Own work plus OSM (ODbL) | Use for every building. Already the plan |
| 2 | **Own photos, rectified into facade textures or trim atlases** for landmarks | The largest step toward photo-match | One 2K atlas per landmark | Own photos | Use for landmarks. Needs the owner to photograph each one |
| 3 | **Baked occlusion** (ray-cast in the map bake, stored per vertex or in a lightmap) | Grounds buildings, removes the flat look | Free at run time | Own work | Do after the Zone is stable |
| 4 | OSM `building:part` and Overture heights | Massing only | None | ODbL. Overture has `height` and `roof_shape` fields ([docs](https://docs.overturemaps.org/guides/buildings)) | WALC has only an outline and `building:levels=3` in OSM (checked). Do not expect parts on campus |
| 5 | Indiana LiDAR | About 2 points per square metre ([IGIC](https://igic.memberclicks.net/indiana-s-new-3dep-lidar-data-and-informational-resources)): heights and rough roof planes, no facade detail | None | Listed as public | Already used for heights. Good for roof shape, which the lab had to guess |
| 6 | Photogrammetry or Gaussian splats from own photos or drone | Photo-real from the capture path only | Splats: sorting and fill cost every frame, no collision, no dynamic shadows from the sun ([Spark](https://github.com/sparkjsdev/spark)). No M1 figures found | Own capture. Drone rules on campus not checked | Not for a shooter. Possible later as a far backdrop |
| 7 | Mapillary street imagery | | | CC BY-SA ([help page](https://help.mapillary.com/hc/en-us/articles/115001770409-CC-BY-SA-license-for-open-data)); building 3D from many photos is legally unclear | Reference only |
| 8 | **Google Photorealistic 3D Tiles** | High from the air, melted at eye level | Heavy streaming | The [Map Tiles API policies](https://developers.google.com/maps/documentation/tile/policies), as returned by the fetch tool, bar caching content, creating content based on it, and non-visualisation uses. Games are not mentioned | **Do not use.** Using the tiles as game geometry or baking them into assets breaks those terms. `docs/decisions.md` already says reference only |

What the lab's WALC is built from, so the next landmark can copy the method:

- Footprint: OpenStreetMap way 508846031 (58 m by 87 m), split into three masses.
- West front from two photographs that could be opened: [BSA LifeStructures' project page](https://www.bsadesign.com/project/active-learning-center/) (one exterior) and [FRP's project page](https://frpinc.com/projects/wilmeth-active-learning-center/) (one aerial). They show brick end pavilions with a limestone base and belt course, a limestone centre with tall bronze-framed window bays under bracketed eaves, a ground-floor colonnade with small canopies and the name in metal letters, red clay tile hip roofs, and a herringbone brick plaza.
- Estimated: every height, the bay count, window sizes, roof pitch, plaza furniture.
- Not referenced: the north, east and south fronts, and the atrium skylight. The Bell Tower is left out.
- Facts from [BSA](https://www.bsadesign.com/project/active-learning-center/) and [Campus Technology](https://campustechnology.com/articles/2017/08/21/purdue-opens-combo-library-active-learning-center.aspx): 164,000 square feet, on the old power plant's site, dedicated 22 September 2017, multi-level atrium with a large stair.

A search of Wikimedia Commons found no photo of the building, so reference photos for landmarks will mostly have to be the owner's own.

## 6. Rendering techniques, ranked by gain for cost

Costs are from the lab on the baseline machine unless marked as estimates. "Has it" refers to the game on `mvp`.

| Rank | Technique | Visual gain | Cost | Game has it? |
|---|---|---|---|---|
| 1 | **Image-based lighting**: capture the sky and ground once into a PMREM environment; a studio or sky HDRI for the weapon | Large. Metal and glass have something to reflect; shadowed sides stop being flat | 0.7 to 0.8 ms | No: no `scene.environment` or PMREM in `packages/client/src` |
| 2 | **Full PBR sets at 2K on hero assets** (normal, roughness, metalness, occlusion) | Large on weapons, which fill the screen | Memory, not time. 2K with three maps is about 64 MB per weapon uncompressed | Weapons ship at 1024 px |
| 3 | **Window reveals, proud trim and per-pane glass normals** in the facade generator | Large for buildings in low sun | Triangles only, which are cheap | Partly (fake-room glass shader) |
| 4 | **MSAA 4× on the scene pass only** | Medium. Clean edges on mullions, railings, the gun | 3.5 to 4.2 ms at 2.3 MP | FXAA only |
| 5 | **Cascaded sun shadows** (three cascades; r186 adds a `SunLight` with cascades to WebGLRenderer, reported) | Medium. Sharp near shadows across a whole Zone | Estimate 2 to 5 ms; the lab's single 4096 px map cost 2.1 to 3.5 ms over 2048 px | One 2048 px map |
| 6 | **Ambient occlusion at half size** | Medium | 3.2 to 4.3 ms for GTAO. The game's own 12-tap pass is likely cheaper | Yes |
| 7 | **KTX2 (Basis) textures and meshopt geometry** | None visible; makes ranks 2 and 3 affordable. UASTC for normals, ETC1S for colour | None at run time. Needs the `ktx` tool, not installed | No |
| 8 | **Baked occlusion or lightmaps** for the static campus | Medium to large | Free at run time | No |
| 9 | **Micro-detail layer** on flat-textured assets | Small to medium | Not measurable | Yes (Saltline material layer) |
| 10 | **Depth of field**, only while aiming down sights | Small, cinematic | 4.2 ms with the stock Bokeh pass | No |
| 11 | Bloom, grain, vignette, ACES or AgX curve, eye adaptation | Small each, large together | 1.9 to 2.6 ms for bloom | Yes |
| 12 | Decals, trim sheets, parallax occlusion for brick | Small at play distance | Parallax is expensive per pixel | Decals yes |
| 13 | Screen-space reflections or global illumination, temporal AA, motion blur | Medium on the right scene | High, and they smear in a fast shooter. [realism-effects](https://www.npmjs.com/package/realism-effects) exists for WebGL; maintenance not checked | No. Not recommended on WebGL |
| 14 | Path-traced baking in the browser ([three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)) | | Its WebGPU path is described as not yet stable and it has no lightmap baker | Use an offline bake instead |

**WebGPU renderer.** The game is on three 0.187. Reported: `three/webgpu` falls back to WebGL2, Safari shipped WebGPU in September 2025, and built-in nodes exist for bloom, depth of field, SSR, SSGI and temporal AA. No trustworthy speed-up figure was found, and add-ons that reach into WebGLRenderer break. FolkTown's effects chain is hand-written GLSL from Saltline, so moving is a rewrite. Verdict: stay on WebGL to the MVP, then try WebGPU as the Ultra tier, where SSGI and temporal AA would be the reason.

## 7. What browser shooters and Three.js showcases do

This section is thin. The search turned up marketing pages, not technical write-ups, and none of Krunker, Venge, Shell Shockers, War Brokers, Deadshot or the Three.js Sponza and SSGI examples were studied. What can be said from the sources read:

- Three.js r186 merged a WebGPU Gaussian splat renderer ([radiancefields.com](https://radiancefields.com/three.js-merges-a-native-gaussian-splat-renderer-for-webgpu-in-r186)), and PlayCanvas renders splats with compute on WebGPU. The photoreal browser showcases of 2025 and 2026 are mostly splat viewers, which are static scenes and not games.
- Saltline, already studied in `docs/saltline-findings.md`, is the closest real example of a good-looking browser shooter, and it gets there with lighting and post-processing, not with scanned assets.

Treat this as an open item, not a finding.

## 8. Recommended stack

1. Stay on Three.js WebGLRenderer and the Saltline-style chain.
2. Add image-based lighting: one sky-and-ground probe per Zone, and a fixed studio-style environment for the first-person weapon.
3. Weapons and props from Poly Haven first, then CC-BY Sketchfab models the owner downloads, at 2K, through the existing `weapons.json` manifest.
4. Buildings from the facade generator with a per-landmark style sheet from the owner's photos; real trim depth and per-pane glass.
5. Three quality tiers:

| Tier | Pixels | Adds | Target on the M1 Air |
|---|---|---|---|
| Medium (default) | 1.2 MP | Image-based light, 2K weapon maps | 45 fps floor, as now |
| High | 2.3 MP | Cascaded shadows, half-size occlusion | 30 fps floor |
| Ultra (opt-in) | 2.3 MP | 4× MSAA on the scene pass, depth of field when aiming | 30 fps on the lab's scenes; expect less in a full Zone |

Expected cost: image-based light adds under 1 ms. The whole Ultra set cost 11 to 15 ms over Balanced in the lab (15.4 to 19.8 ms against 4.2 to 4.5 ms), of which 5.5 to 7.5 ms is the higher resolution. A full Zone with bots and haze starts from a higher base, so Ultra should be expected to run at 30 to 40 fps, not 60.

## 9. Staged plan

Usage is in Sonnet sessions of roughly 80k to 130k tokens, the size of past work packages.

| Step | What | Visual gain | Frame cost | Effort | Usage |
|---|---|---|---|---|---|
| 1 | Image-based lighting in the game: sky probe per Zone, weapon environment | High | Under 1 ms | Small | 1 session |
| 2 | Swap the pistol for Poly Haven's; ship all weapon maps at 2K; add Poly Haven crates, ammo box and jerrycan as props | High | None | Small | 1 session |
| 3 | Owner downloads the CC-BY rifle and shotgun; decimate, convert, add a credits screen | High | None | Medium; needs the owner's Sketchfab login | 1 session |
| 4 | KTX2 and meshopt in the asset pipeline (install `ktx`) | None visible | None; cuts texture memory several-fold | Small | 1 session |
| 5 | Facade generator: reveals, trim, per-pane glass, bracketed eaves, hip roofs. WALC as the first landmark, ported from the lab | High | Low | Medium | 1 to 2 sessions |
| 6 | Owner photographs WALC, the Bell Tower and Engineering Mall fronts; style sheets and photo atlases | High | Low | Owner's time plus 1 session per landmark | 1 session each |
| 7 | High and Ultra tiers: cascaded shadows, MSAA on the scene pass, depth of field when aiming | Medium | 5 to 12 ms, opt-in | Medium | 1 to 2 sessions |
| 8 | Baked occlusion in the map bake | Medium | None | Medium | 1 session |
| 9 | Characters: Quaternius CC0 base with the animation library, dressed as unnamed soldiers | Medium (not photoreal) | Low | Medium | 1 to 2 sessions |
| 10 | After the MVP: WebGPU Ultra tier with SSGI and temporal AA | Medium | High | Large | 3 or more sessions |

Steps 1 and 2 are the cheapest large gains and need no decision from the owner.

## 10. Licence status of everything in the lab

| Asset | Source | Licence |
|---|---|---|
| M4A1 and pump shotgun | 3dmodelscc0, itch.io (already in `docs/assets.md`) | CC0 |
| Service pistol, bolt-action rifle | Poly Haven | CC0 |
| Studio HDRI `studio_small_08` | Poly Haven | CC0 |
| `herringbone_pavement`, `clay_roof_tiles_02` | Poly Haven | CC0 |
| Bricks101, Concrete012, Grass004 | ambientCG | CC0 |
| Footprints of WALC, Potter, Mechanical Engineering, American Railway Building | OpenStreetMap | ODbL, credit shown on the page |
| Three.js r170 | jsDelivr | MIT |
| WALC reference photographs | BSA LifeStructures, FRP | Looked at only. Not embedded, traced or redistributed |

## 11. Decisions for the owner

1. **Allow CC-BY assets with a credits screen?** This unlocks the realistic Sketchfab rifle and shotgun. The owner would need to download them with a Sketchfab login.
2. **Photograph the landmarks?** Four sides plus details for WALC, the Bell Tower and the Engineering Mall fronts. This is the main lever for buildings.
3. **Accept a 30 fps floor for High and Ultra,** keeping 45 fps at Medium?
4. **Paid routes:** none is needed now. Meshy Pro is $20 a month if AI props are wanted later; realistic rigged soldiers are the one place a paid asset may be worth it.
5. **Install Blender and the `ktx` tool** on the build machine? Both are free. Blender is needed for decimating heavy models and any bake.
6. **Megascans:** worth an Epic account only if Epic confirms browser delivery is allowed.

## 12. Evidence gaps

- Google's main Maps Platform terms were not readable by the fetch tool; only the Map Tiles policies page was. Coverage of West Lafayette was not confirmed.
- No independent M1 frame costs were found for any effect; the only numbers here are the lab's.
- The survey of browser shooters was not done.
- Sketchfab models were not downloaded, so their quality, rigs and provenance are unconfirmed.
- AI generators were not tried.
- The lab was measured in headless Chrome. A visible tab adds compositor cost.
- The lab page was tested locally in Chrome only, not in Safari or on a phone.
