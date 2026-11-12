# Saltline: deep findings

Second, full read of Saltline (12 November 2026), after `docs/saltline-findings.md` covered only the sky, shadows, post chain and renderer setup. Source: the published artifact https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp, a 1.6 MB script (Three.js r180 is about 0.75 MB of it; the game is about 0.87 MB, 38,000 lines once beautified). Saltline's owner has given permission to reuse it. Extracted code is in `reference/saltline/` (list at the end).

**Method and limits.** Static reading only: the bundle was beautified and read module by module. The game was **not run** (running third-party code was not permitted in this session), so there are no measured triangle counts, draw calls, texture memory, start-up time or frame times. Where a number below is derived from code it says so; where it is an estimate it says "estimate". The claim that it runs well on an M1 is the owner's and is unverified here. The raw 3.6 MB artifact page is not committed (over the 2 MB limit); it was kept outside the repo.

## 1. The short answer

Saltline does not look photorealistic because of any one effect. Five things stack, and the post chain (which FolkTown already ported) is the smallest of them:

1. **One strong, designed light and a real sky as the environment.** A single low warm sun (13 degrees up, colour 1.0/0.72/0.42, intensity 9) plus the sky shader itself captured once into a PMREM and set as `scene.environment` at 2x intensity. There is **no hemisphere or ambient light**. Every PBR surface therefore gets directional, coloured ambient and sky reflections with Fresnel sheen, including dry asphalt and painted metal at grazing angles. This alone separates "lit" from "photographed".
2. **Geometry modelled at human scale, with bevels everywhere.** Containers have a real ISO corrugation profile (278 mm pitch, 36 mm deep), dents that displace the wall, cast corners, locking rods, hinges, gaskets, a wooden floor. Edges are bevelled (3 to 20 mm radii) so every edge carries a thin highlight. Bolts, rungs and welds are modelled. About 35 prop types, roughly 7,000 beautified lines of builder code. This is the single biggest cue that is geometry, not shading.
3. **Per-vertex baked weathering.** Every merged prop gets a colour attribute from value-noise functions of position: rust runs, dirt toward the bottom, edge darkening, dents darkening. It costs nothing at run time and breaks up every flat surface at metre and decimetre scale.
4. **A material system with depth at every scale.** 29 GPU-baked texture sets (27 shader functions) (albedo, roughness-AO-metal packed, normal) at real-world tile sizes, then a shared shader layer in world space: macro colour and roughness variation at two scales, grime on up-facing surfaces, a splash band at the ground, wetness gated by surface direction, a roughness boost where the normal map is short (kills specular shimmer), and cm-scale beads. Close up, nothing goes blurry.
5. **Ground, weapon and arms are bespoke shaders, not tiling materials.** The ground has unique mask textures (dampness, wear, oil, tyre polish), 6 m slab joints with tar, cracks, painted markings with chips, and a planar reflection. The rifle has per-vertex edge/cavity/zone data and a 440-line micro-surface shader; weapon and hands are about a fifth of all game code.

Then the pipeline on top (already ported by FolkTown): half-float HDR, contact-hardening soft sun shadows, depth-aware AO, ray-marched haze with shafts, energy-conserving bloom, eye adaptation, ACES/AgX blend, grade, FXAA, grain.

**Scale matters.** The playable area is 80 x 60 m (`Kn = {min:(-40,0,-30), max:(40,30,30)}`) plus a backdrop of cranes, a ship and a skyline. Everything in it is hand-authored and merged into a few meshes with no LOD and no instancing (instancing only for particles). FolkTown's campus is far larger, so the geometry and ground techniques must be applied by generators, in chunks, with distance tiers (section 8).

**Assets: none are embedded.** No `data:image`, no `.glb`/`gltf`, no `base64` payloads in the game script, no `TextureLoader`, `ImageLoader`, `GLTFLoader`, `createImageBitmap`. The `blob:` and `fetch(` hits are Three.js internals. Audio is synthesised (`OfflineAudioContext`, `createBuffer`). Textures come from fragment shaders (materials), CPU loops writing typed arrays (ground masks), or 2D canvas (decal labels, ground markings, weapon engraving atlas). The only network dependency is a Google Fonts stylesheet (Big Shoulders Display, Barlow Condensed, IBM Plex Mono) for UI and the weapon's engraved markings. The page also carries a base64 copy of itself (`legacy-v8`, a fallback build for old engines); that is a second copy of the same code, not an asset.

## 2. Materials (27 surface shaders and the shared layer)

`reference/saltline/materials.txt` (already in the repo) holds the 27 texture-generating shaders. They are complete: it is the same 38 KB as the bundle's block. New in `material-system.txt` are the table, the injection and the factory.

**How a surface is made**

- Each material name (`ug`, 48 entries such as `paint_red`, `steel_rust`, `concrete_dirty`, `glass_dirty`) points at a texture set (`p_`, 29 sets built by 27 shader functions) plus tint mode, base roughness/metal, a wetness vector, a macro vector and a normal strength. Several names share one set with different tint/colour (eight paints use the one `paint` set), which is how 48 looks cost 29 bakes.
- One fragment shader per set renders **three outputs in one pass** (multiple render targets): sRGB albedo (with tint mask in alpha), `orm` (R = occlusion, G = roughness, B = metal) and a height that a second pass turns into a normal map (`l_`, `bump` strength per set). Mipmaps on, anisotropy 8. Size is per set: 1024 for asphalt/concrete/paint, 512 for most, 256 for polymer/carbon/fabric/rope; asphalt "hero" goes to 2048 on ultra. Estimate from the table: about 140 MB of GPU texture at the 1024 setting. The generation targets are freed 4 s after start (`update`).
- Textures tile at **real sizes** (`tile` in metres: asphalt 2 m, brick 1.8 m, corrugated sheet 0.762 x 2.286 m, polymer 0.1 m). UVs on the geometry are in metres (the box/cylinder helpers write metre UVs).
- A standard `MeshStandardMaterial` with `map`, `normalMap`, `roughnessMap`/`metalnessMap`/`aoMap` all pointing at the packed maps, then `onBeforeCompile` swaps in the chunks from `g_`:

```glsl
// macro variation in world space, two scales (vSlPos = world position)
slMac = slN3(vSlPos * uSlMacro.z); slMac2 = slN3(vSlPos * uSlMacro.z * 3.7 + 11.3);
sampledDiffuseColor.rgb *= 1.0 + uSlMacro.x * (slMac*0.65 + slMac2*0.35 - 0.5) * 2.0;
// roughness: macro noise, then wetness pulls it toward uSlWetP.y, then beads to 0.05
roughnessFactor += uSlMacro.y * ((slMac2 - 0.5)*1.4 + (slMac - 0.5)*0.8);
// anti-shimmer: where the normal map is "short" (averaged away at distance) raise roughness
float slNl = length(texture2D(normalMap, slUv).xyz * 2.0 - 1.0);
roughnessFactor = sqrt(roughnessFactor*roughnessFactor + clamp(1.0 - slNl, 0.0, 1.0) * 0.6);
```

- **Wear, rust, grime:** the baked sets carry rust/chips/paint damage in the albedo and height (`materials.txt` paint-damage model: chip, stain halo, run below damage). On top, `uSlMacro.w` darkens grime patches (`slGr`), and a "splash band" darkens and wets the lowest 0.5 m of vertical faces (`slLow`).
- **Wetness (rain, one global uniform for all 48 materials):** gated by surface normal (`slUp` strong on up faces, none underneath), streaky on verticals (two noise octaves stretched along y), darkens albedo and lowers roughness toward a per-material wet roughness, flattens the normal map by up to 45% on wet up faces, and adds bead cells (noise at 170 and 410 cycles per metre, so 6 mm and 2.4 mm) that drop roughness to 0.05, faded out when they would be under a pixel. **FolkTown has no rain**, but the same chain, parameterised, gives damp shadow-side masonry and dirty up-faces for free.
- **Triplanar** (`SL_TRIPLANAR`) for props with no usable UVs (weapon parts, armour, gunmetal): weights `pow(abs(n), 6)`, world-oriented normals.
- **Alpha-tested chain-link** that survives distance: wire threshold follows the mip level and dissolves into a stable one-third dither veil when the diamonds are sub-pixel.
- **Parallax / displacement / tessellation:** none. Depth comes from real geometry, normal maps and a derivative bump (`dBump`, `armBump`), nothing else. No SSR; reflections are the PMREM sky, a planar reflection on the ground only, and an interior cube probe.
- **Decals and labels** (`d_`): canvas-drawn decal sheets (stencils, hazard labels, numbers, text) as polygon-offset transparent standard materials; a label atlas pass merges the label canvases into one texture so labels merge with the level.

## 3. Geometry

All in `geometry-kit.txt`, `container-builder.txt`, `prop-kit-examples.txt`.

- **Primitives** (`ot` box with metre UVs, `Ei` rounded box with a real bevel, `vt` cylinder, `bn` tube along a Catmull-Rom curve, `Fa` swept profile, `sh` the corrugation profile function). `Ei` is a 3x3x3-segment box whose vertices are pushed to a radius, normals rebuilt, UVs in metres: 108 triangles per bevelled box.
- **Builder kit** (`On`): `box`, `cyl`, `tube`, `bar`, `beam`, `slab`, `rod`, `decal`, with a per-call vertex-colour function. Props are described in real dimensions (e.g. the light mast: 13.3 m tapered 8-sided pole built from 3 cone segments, ladder rungs every 0.38 m, lamp heads with bezels).
- **Container** (`Pk`, 316 lines): corrugation as a swept profile (pitch 0.278 m x 4 vertices per period), dents as a smooth displacement summed over `1 - q^2` bumps on the wall, four corner castings with oval holes, top and bottom rails, locking rods with cams, hinges, door gaskets, wooden floor, stencilled decals. Door open angle, wear and colour are variants; results are cached by (type, seed mod 6, doors, wear) and re-coloured per instance. Estimate: 5 to 8 k triangles for a 40 ft box (43 periods x 4 verts x 4 rows x 2 sides plus fittings).
- **Per-vertex weathering** (`Cv`, `Kr`): `Cv(x,y,z)` returns a colour multiplier from 3D value noise: low-frequency lightness drift plus a rust-orange tint where a second noise passes 0.68. The container colour function adds rust and dirt toward the bottom, dark rust streaks running down from the top rail, darkening in dents and at the corner folds.
- **Merging:** after all props are placed, the static root is merged **per material** (`ig`/`Jr`), and materials that have a vertex-colour twin are swapped to it. Result: a few dozen meshes for the whole level. Dynamic or `noMerge` objects stay separate. A frame-wide stat (`level.stats`: tris, meshes, containers, props) exists but its values are unknown to me. Instancing is used only for particles, debris, shells, decals and rain.
- **No LOD, no spatial culling.** The merged level meshes cover the whole 80 x 60 m, so frustum culling never removes anything. That only works at this size.
- **Characters and enemies:** robot "hounds", gulls and the "Harbormaster" are skinned or procedural machines (armour-white and gunmetal triplanar materials, emissive lenses, a cone-of-light shader). No humanoid character modelling to port.

## 4. Ground, water and the wet look

`ground-wet-shader.txt`. The ground is **one 190 x 320 m plane** with a bespoke `MeshStandardMaterial` patch (cache key `saltline-apron-3`).

- **Unique masks** (1024 or 512, bicubic B-spline sampled so texels never show): R = puddle height, G = dampness, B = oil, A = traffic polish/wear. Generated by a CPU loop (`Dw`), not painted.
- **Tiling detail** (512): one RGBA noise + a normal map, sampled at 0.21 and 1.37 cycles per metre.
- **Structure:** 6 m expansion-joint slabs with tar sealing (`tar`, `groove`), cracks gated by the wear mask, sealed cracks, a pale-aggregate speckle, polished lanes. Painted markings from a 2048 canvas (`Fw`) with **chips from world-space noise down to sub-centimetre** (the chip noise octaves fade in by camera distance, so it never shows texels or aliases).
- **Water as a continuous gradient:** standing water (sharp mirror, roughness 0.055) to a soaked band (roughness 0.1 to 0.2) to damp (0.36 to 0.56) to dry (0.72). The shoreline is organically perturbed by 40/15/5 cm noise. Albedo darkens with wetness; deep water gets murky, never black.
- **Reflection:** a planar reflection pass (clipped mirrored camera, half resolution = quarter pixels, mip-blurred by roughness, tilted by the surface normal) feeds `radiance` in the shader; damp asphalt gets a heavily blurred, vertically stretched sheen, puddles a sharper mirror. The specular colour is forced to 0.075 on water so it reads as water, and direct specular is capped at 40 so the sun glint cannot blow out.
- **Contact darkening and sky reflection** elsewhere come from baked vertex colour, the splash band, and the PMREM.
- **Water** (sea): 4 + 7 summed sine waves, Gerstner-style displacement, foam and scum along the quay by distance fields, cat's-paw gust patches, haze mix at distance. No FolkTown use.
- **Rain:** instanced streak quads and splash crowns (`rain`, `rainSplash`), droplets as ring ripples in the normal.

**What transfers without rain:** the roughness model (macro noise + polish masks + sealed-crack and tar response), world-space chips on markings, slab joints with anti-aliased `fwidth` widths, bicubic data masks, dampness as a shading variable (darker, glossier damp zones near drains, shaded walls, fountain), distance-faded noise octaves, and the capped-specular trick.

## 5. Lighting

- **Sun:** `DirectionalLight` 9.0, colour (1, 0.72, 0.42), direction (0.916, 0.225, 0.331). Shadow camera fitted to the level boxes, 2048 (medium) or 4096 (high), `normalBias` 0.02, `bias` -0.00012, soft shadows from the custom filter, map refreshed every other frame except on ultra. Already ported.
- **Sky:** `SALTLINE_SKY` shader mesh. Cloud deck with a clear burning gap toward the sun, aureole, sun disk, sheet lightning, horizon colours (`T0`: zenith 0.055/0.085/0.13, horizon 0.95/0.55/0.28, away 0.16/0.22/0.3, fog 0.42/0.47/0.52). Already ported.
- **Environment (not ported):** `YM`: clone the sky material with `uEnv = 1`, put it in a throwaway scene, `PMREMGenerator.fromScene(skyScene, 0, 0.1, 100)` once. That texture is `scene.environment`, `environmentIntensity = 2` (`n_`). It re-uses the exact sky the player sees, so ambient colour, sun-side warmth and reflections all agree.
- **Interior:** one `CubeCamera` (128, half float) placed inside the single building at 40% height, rendered with the sky in "environment mode off", PMREM'd, and assigned to materials flagged `interior` at intensity 1 (`i_`) instead of 2. Skylights and shed lamps are emissive meshes (`mats.emissive(colour, 4..12)` is a basic material with HDR colour) and one point light (intensity 34, range 13). No real light probes, no baked GI, no light maps.
- **Lights count:** 1 sun, 1 view-model key (0.9), a pool of 6 point lights used for muzzle flashes and explosions (`lightPool.flash`), 1 static point light. Everything else is emissive plus bloom with no threshold.
- **Exposure:** forward fallback uses ACES at 0.6 x exposure; the advanced path uses linear output and adapts in the post pass (centre-weighted log average, 1.5 s). Already ported.
- **Haze and shafts, grade, flare:** already ported.
- **Dim, contrasty values:** albedos are low (asphalt 0.125, dark paint 0.04 to 0.15, gunmetal 0.03 to 0.04) so that the 9.0 sun and 2.0 environment give wide dynamic range and a punchy S-curve grade.

## 6. Post

Everything in `sky-shadows-post.txt` was already read. Extra points found:

- **No TAA, no depth of field.** FXAA plus 4x MSAA on the HDR target (medium: 2x, low: none) carries anti-aliasing.
- **Motion blur exists but is off by default** (on only for `high`/`ultra`): per-pixel reprojection from the depth buffer, shutter `min(0.5, 1/190/dt)`.
- **ADS:** peripheral blur through a half-size blur buffer; chromatic aberration is tiny and grows when hurt.
- **Weapon depth slice:** the view-model is drawn with `gl.depthRange(0, 0.05)` so the post passes treat it as nearest and AO/haze are consistent.
- Film grain, dither, vignette, unsharp mask: as in the earlier note.

## 7. Weapon and arms

`weapon-surface-shader.txt`, `arm-glove-shader.txt`.

- **Rendering:** second camera, own layer, FOV 54 (world 74), near 1 cm, depth slice 0 to 0.05, own `viewmodel-key` light (0.9, cool), environment intensity scaled by `viewFill` (1.1, faded when indoors). The earlier note covered this.
- **Modelling:** the rifle is built in code at true scale (muzzle 0.531 m forward of the bore origin, 21 mm handguard radius) from filleted 2D profiles extruded with holes (`b0`, `Yz`), bevelled boxes (`Mt`) and cylinders, then converted to flat-shaded-with-crease (`Gz`, crease 50 degrees). Rack tag, serial, calibre, torque warning and the optic text are drawn into an engraving atlas (`Fz`, canvas) and applied as small quads (`M1`).
- **Per-vertex surface attributes `aSurf` (vec4):** x = edge (convexity of the mesh at that vertex, 110 to 520 per metre), y = cavity (a voxel cavity AO: the whole gun is voxelised at 2 to 3 mm and 4 rays are tested per vertex, `sy`), z = bare metal, w = zone (grip or high wear). These drive everything the shader does.
- **Shader (`Oz`, kind 0 anodised, 1 phosphate, 2 polymer, 3 nitride, 4 rubber):** object-space turned noise at 34 and 180 cycles/m, a 2.9 mm hash grain, scratches along the bore, burnished edges, wear-through to bare steel on edges, palm-oil smears, grime in cavities, 1.15 mm studs on grip zones, moulding parting line, rain beads and run-off. **Every fine layer fades by pixel footprint** (`dPx = length(fwidth(dP))`, `dNear`) so nothing aliases. Height goes through a derivative bump `dBump` (no normal map). Cavity multiplies indirect light (`dOcc`).
- **Optic:** a reflex sight shader with a procedural reticle and dichroic coating (thin-film colour shift, dust specks, smudge) that mirrors the sky with an `uEnv` toggle indoors.
- **Muzzle flash:** two crossed quads plus petals/jet/glow in a procedural additive shader, plus a pool point light for a few frames.
- **Arms:** a skinned procedural sleeve and glove. Banded layout (cuff, strap, tab, reinforcement, stitches, rubber guards, knit rib), micro-detail per "kind" (weave 5.7 kHz, pebbled leather, moulded rubber, knit, waxed ripstop, glass-bead tape) that fades with pixel footprint, derivative bump, wetness beads. The arm module (about 2,400 beautified lines) also holds joint limits, poses and a grip-fitting routine (`LIMITS`, `POSES`, `fitGrip` exports); not read in detail.

## 8. Performance tricks (as written; not measured)

| Trick | Detail |
|---|---|
| Pixel budget | Quality levels cap pixels at 1.0, 1.5, 2.3, 3.7 M (low/medium/high/ultra) |
| Dynamic scale | Median frame time over 45 frames; above 21.5 ms step the scale down by 0.1 (0.2 above 30 ms, to 0.6 above 45 ms); below 17.4 ms step up with a growing back-off (4 s doubling to 60 s); at 0.6 and still slow, drop a quality level. 3.5 s settle after load |
| Auto quality | `high` by default; `medium` for Intel iGPU, SwiftShader or mobile GPUs; `low` for touch phones |
| Shadows | One map for the whole level; refreshed every second frame except ultra; map size from quality |
| Draw calls | Whole static level merged per material; materials cached; one shader program per tint/triplanar combination (`customProgramCacheKey`) |
| Texture bake | 29 sets baked once on the GPU, generation targets freed after 4 s; `compileAsync` before the first frame; boot bar yields to the event loop between stages |
| Planar reflection | Quarter pixel count, skipped when the camera is below 3 cm; sky and ground excluded from its own pass |
| Anti-aliasing | MSAA on the HDR target by quality, FXAA in post |
| Half-size AO and haze | Ported already |
| Fallbacks | Start-up self test; advanced pipeline disabled on first error; soft-shadow chunk falls back to PCF; per-module stubs (`Sr[module]`) if a module throws |
| Bench harness | `?bench` flies a 30 s camera path and prints average/median/p99 frame time and renderer stats |

## 9. Technique table

Visual impact: how much it contributes to the "photographed" look (+ small to +++++ decisive). Cost: GPU/CPU at runtime, then work to port. FolkTown status from reading `packages/client/src` on `mvp`.

| Technique | Visual impact | Run cost / port effort | FolkTown today |
|---|---|---|---|
| Sky captured to PMREM as `scene.environment` (2x) | +++++ | One capture at load; ~40 lines | **Missing.** Flat `HemisphereLight` 1.7 |
| Low warm key sun + cool sky fill, low albedos, wide range | ++++ | Free | Partly (sun 3.2, hemisphere); no tuning for range |
| Bevelled primitives, swept profiles, mm-scale parts | +++++ | Triangles; medium-large | **Missing.** `Batch` has flat `rect/box/cyl` only |
| Per-vertex baked weathering and dirt | ++++ | Free at run time; small | Only `shade(y)` grime hook |
| GPU texture sets with packed ORM + normal, real tile sizes | ++++ | One-time bake; done | Ported for 10 surfaces, colour/normal/roughness only |
| World-space macro variation, grime, splash band | +++ | ALU only; small | Ported, simplified (`DETAIL`, 5 modes) |
| Short-normal roughness boost (anti-shimmer) | ++ | Tiny | Missing |
| Triplanar for UV-less props | ++ | ALU; small | Missing |
| Material count and tint variants (48 over 29 sets) | +++ | Bake time; medium | 10 materials |
| Ground shader: masks, slabs, cracks, markings, chips, bicubic | ++++ | Medium | Missing (tiled materials) |
| Planar reflection on ground | +++ (for wet) | Quarter-res second render | Not needed (no wet ground) |
| Decal and label system with canvas text | +++ | Small | Missing |
| Interior reflection probe | ++ | One cube capture | Missing (not needed until interiors) |
| Contact-hardening soft sun shadows | ++++ | Done | Ported |
| Depth-aware half-size AO, upsample | +++ | Done | Ported |
| Ray-marched haze and shafts | ++++ | Done | Ported (20% strength in dev) |
| Bloom (no threshold, 6 levels), flare, eye adaptation, ACES/AgX, grade, FXAA, grain | +++ | Done | Ported |
| Pixel budget, dynamic scale, self test | n/a | Done | Ported |
| Weapon: own camera, depth slice, key light | ++ | Small | Not taken (main camera; clipping logged) |
| Weapon built in code with baked cavity/edge data and micro shader | +++ (constant on screen) | Large | GLB model, generated fallback |
| Procedural arms and glove shader | ++ | Large | Generated hands (simple) |
| Reflex sight shader | + | Small | Missing |
| Motion blur | + | Optional pass | Not ported |
| Parallax, tessellation, SSR, TAA, DoF | none | n/a | n/a (Saltline has none either) |

## 10. Why FolkTown looks worse: the top five gaps

Compared against `render/`, `materials/`, `facade/`, `landmarks/`, `game/weapon*`, `scene.ts`, `batch.ts`.

1. **No image-based lighting.** `render/index.ts` lights the scene with a `DirectionalLight` and a `HemisphereLight(0x8aa4d0, 0x7a5a3c, 1.7)`; there is no `scene.environment`. Surfaces get one flat ambient and no reflections, so brick, limestone, glass, metal and wet-looking asphalt all read as matte plastic regardless of the shaders on them.
2. **Forms are sharp boxes.** `Batch.box/rect` produce 90-degree edges and flat walls; windows are 0.12 m proud limestone boxes; `buildPlaza` builds a building from five boxes. Saltline's bevelled, profiled, mm-detailed geometry is what makes light grab edges. A campus facade needs recessed windows with reveals and sills, string courses, cornices as swept profiles, and bevelled brick and stone returns.
3. **Materials are shallow.** 10 materials, no per-material macro/wear/tint model, no occlusion channel, no short-normal roughness fix, no triplanar, no dirt that depends on surface direction beyond a `y` shade. On top, `materials/texture-sets.ts` loads CC0 JPEG photo sets, which replaces the procedural maps and sits against "everything generated in code" (the procedural fallback remains).
4. **The ground is a tiled material.** Saltline's ground is its strongest-looking surface because it has unique large-scale variation (masks), real construction detail (joints, cracks, patches, markings with chips) and distance-aware detail. A campus lives on sidewalks, roads, plazas and lawn; today these are `box` calls with one tiling material.
5. **The weapon is imported and unlit like the world.** A GLB model with generated hands on the main camera carries none of Saltline's cavity/edge wear, pixel-footprint micro detail or its own light. It is the one object on screen all the time. (Priority below the world, because the stated goal is that walking around feels like the real campus.)

Not a gap any more: the post chain, soft shadows, haze, bloom, grade and pixel budget are already in.

## 11. Ranked port plan

Work-package sized (one fresh Sonnet worker each). Order is gain per effort. "Gain" is the expected change in the look, not frame rate. All steps keep the 45 fps floor in mind; the benchmark rule at the end of each stage applies.

| # | Package | What to do | Source in `reference/saltline/` | Size | Expected gain |
|---|---|---|---|---|---|
| 1 | **Sky environment lighting** | Capture the sky shader to a PMREM once (`fromScene`, 0.1 near), set `scene.environment`, `environmentIntensity` about 2; remove the `HemisphereLight`; re-tune sun and exposure for dimmer albedos; recapture only if the sun moves | `sky-shadows-post.txt` (sky), engine lines `YM` quoted above | S (0.5 day) | Largest single jump: all materials get coloured ambient and Fresnel sheen; metals and glass start working |
| 2 | **Geometry kit in `Batch`** | Add `Batch.bevelBox(r)` (Saltline's `Ei`), `profile()` swept along a path (`Fa`/`sh`), and a vertex-colour weathering function (`Cv`: noise drift, rust tint, bottom dirt) applied at `mesh()`; unit-test counts and normals | `geometry-kit.txt` | M (1 day) | Edge highlights and broken-up flats on every building; foundation for #3 |
| 3 | **Facade 2.0** | Rebuild `facade/build.ts` detail: recessed punched windows with reveal, sill, lintel, mullion; brick or stone returns; cornice and base as swept profiles; roof parapets and equipment; bake per-vertex AO (dark in reveals, under cornices, at the base) | `geometry-kit.txt`, `prop-kit-examples.txt`, `container-builder.txt` (how to bake dents/AO) | L (2 days) | Buildings stop looking like boxes; this is most of the campus |
| 4 | **Material system upgrade** | Add the packed ORM (occlusion/roughness/metal) output and the AO/metal wiring; port the injection chunks (macro, grime on up-faces, splash band, short-normal roughness, dryness masks); extend the table to about 20 campus materials (painted metal, concrete, roof tile, mulch, rubber, wood, glass, dirty glass, curb stone); drop the JPEG sets unless the owner wants them | `material-system.txt`, `materials.txt` | M-L (1.5 days) | Close-up credibility; fixes shimmer on distant brick |
| 5 | **Campus ground shader** | One ground material per zone chunk: unique wear/dirt mask from zone data (distance to roads, paths, building edges), sidewalk slab joints (1.5 m), tar-sealed cracks, asphalt aggregate and polish, lane and crosswalk markings with world-space chips, bicubic data maps; keep the roughness ramp; no planar reflection | `ground-wet-shader.txt` | M-L (1.5 days) | Roads and walkways stop repeating; the biggest area on screen |
| 6 | **Props and signage** | A prop library in the Saltline kit style (bench, bike rack, lamp post, bin, sign, hydrant, bollard, planter, fence): 20 to 30 builders; instanced where repeated; decal and label canvas system for signs and building names | `prop-kit-examples.txt`, engine `d_` decal factory (not extracted) | L | Density and scale cues; makes the space read as inhabited |
| 7 | **Weapon pass** | Second camera on its own layer with depth slice; viewmodel key light; then either (a) author the rifle in code with fillets, `aSurf` baking and the micro shader, or (b) keep the GLB but give it the micro shader with edge/cavity baked by the voxel routine | `weapon-surface-shader.txt`, `sky-shadows-post.txt` (view-model camera) | L (2 to 3 days) | Constant-on-screen quality; fixes clipping |
| 8 | **Arms and hands** | Port the arm shader onto the existing generated hands: bands, stitches, micro-detail by kind | `arm-glove-shader.txt` | M | Moderate; only after #7 |
| 9 | **Polish** | Reflex sight shader, optional motion blur, interior probe for the first enterable building, distance tiers for bevels and profiles | various | S each | Small |

Cross-cutting requirements that Saltline never needed:

- **Chunked merges.** Merge per material **per 64 to 128 m cell**, not per level, so frustum culling works; Saltline's single merged mesh per material would disable it on a campus.
- **Distance tiers.** Keep full bevels and profile detail within about 60 m; beyond that, use flat shading and the macro detail only. Drop vertex-colour dirt detail at far chunks.
- **Instancing** for repeated props (Saltline never needed it).
- **Triangle budget:** set one before step 3 and measure with `pnpm bench`; the container estimate above (5 to 8 k) shows how fast bevelled hand-modelling adds up. Bake the 0.5 m and larger detail into geometry and everything smaller into shaders.

## 12. What could not be read or measured

- Runtime numbers (triangles, draw calls, texture MB, start-up time, fps) because the game was not run; the in-game `[mats]`, `[level]` and `[weapon]` logs would give them. Opening the artifact on the Mac with `?bench` prints them.
- The encoded `legacy-v8` copy was not compared line by line with the main script (same shader markers present; not diffed).
- Not extracted (read only at summary level): the audio synthesiser (`cE`), the HUD and menus, combat and AI (`W5`, `ey`), the explosives, the rain/splash particle shaders, the ocean vertex shader, the gull and skyline builders, the ground-marks canvas generator (`Fw`) and the decal sheet drawing (`d_`), the crane and ship builders. None is needed for the world look; pull them from the beautified bundle if a package needs them.
- The beautified bundle itself is not in the repo (3.6 MB source page; 1.6 MB script). Line numbers in extract headers refer to a prettier-3 pass at `--print-width 140` of the script (`prettier --parser babel`), which can be reproduced from the artifact.

## 13. Extracted files (`reference/saltline/`)

| File | Contents |
|---|---|
| `material-system.txt` | Material table (48 names over 29 sets), injection chunks, factory with GPU baking |
| `ground-wet-shader.txt` | Wet ground shader chunks, material setup, planar reflection pass, mask generator head |
| `geometry-kit.txt` | Primitives, bevelled box, tube, swept profile, vertex-colour weathering, merge-per-material |
| `container-builder.txt` | The shipping container, with dents and baked weathering |
| `prop-kit-examples.txt` | Jersey barrier, light mast and the builder-kit calls |
| `weapon-surface-shader.txt` | View-model micro-surface shader and per-vertex baking (edge, voxel cavity) |
| `arm-glove-shader.txt` | Arm and glove shading |
