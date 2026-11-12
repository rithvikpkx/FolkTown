# Rendering prototype: findings

`reference/fidelity-test.html` is a single-file, walkable first-person scene: an invented brick hall, a bell tower, a plaza and a street, with a rifle. It exists to answer one question: can a browser hit the target look at the target frame rate on a MacBook Air M1 (16 GB)?

**Answer: yes, with a large margin at 1× resolution.**

## Measurements

All on a MacBook Air M1, 16 GB, real GPU, frame cap removed, standing view, about 460,000 triangles and 70 draw calls.

| Resolution | Effects on | Effects off |
|---|---|---|
| 1.0× (1440×813) | 142 fps | 163 fps |
| 1.5× (2160×1219) | 71 fps | 84 fps |
| 2.0× (2880×1626) | 42 fps | 51 fps |

What the numbers say:

- **Pixel count dominates.** Going from 1× to 2× costs about 70% of the frame rate. Tripling the triangle count cost about 10%.
- **The effects chain costs 10 to 20%.**
- **Rain and wet-ground reflections were tried and removed.** They are cut from the game as a product decision. Removing them recovered almost nothing (72 to about 75 fps at 1.5×), so they were not the expensive part.
- **Lights and clutter cost more than expected.** Going from four lit lamps to eight, plus cars, a bus shelter and other street props, took the 1.5× figure from 93 to about 72 fps. Per-pixel lights are the likely cause and should be counted carefully.
- For comparison, a much-admired browser shooter built the same all-in-code way ran at 29 to 44 fps at 2.0× on the same machine.

Limits of these numbers: one standing viewpoint, no other players, no bots, no networking, no display attached (headless). Treat the margin as budget for those.

## What is in the scene

- Ten buildings from one generator, a bell tower, three parked cars, a bus shelter, eight lit lamps, bikes, cones, utility poles with wires.
- About 15,000 grass tufts, 4,000 fallen leaves, 54 tree-crown clusters, hedge foliage.
- A rifle with hands, recoil, muzzle flash, bullet marks and a shot sound.
- Two time-of-day presets (dusk and golden hour), switchable at run time.
- Controls: `R` resolution, `H` shadows, `P` effects, `T` time of day.

## Techniques worth keeping

| Technique | Why it matters |
|---|---|
| Textures generated on a canvas from layered noise: colour, a height field turned into a normal map, and roughness | No downloads, tiny page, consistent look |
| One merged mesh per material, built from quads, boxes and cylinders with texture coordinates in world metres | About 70 draw calls for the whole scene |
| Walls built as a grid with real openings; glass set back with stone reveals | Recess shadows are most of what makes a facade read as real |
| A shader on the glass that ray-casts a fake room in the pane's local space | Depth behind every window for almost no cost |
| Per-vertex darkening by height, plus transparent stain and grime overlays | Breaks up tiled brick |
| Static sun shadow map, 4096², rendered once | Shadows are nearly free per frame |
| Leaf cards with outward-pointing normals for tree crowns and hedges | Reads as foliage; casts dappled shadows |
| Haze applied in the effects pass from the depth buffer, tinted toward the sun | Distance and atmosphere without touching materials |
| Effects order: scene to a floating-point target, half-size ambient occlusion, three-level bloom, tone mapping, grading, anti-aliasing, sharpen, vignette, grain | The single biggest step from "tech demo" to "game" |
| Painted detail texture on the rifle's flat sides: markings, pins, worn edges | Cheap surface richness on a simple model |

## Pitfalls already paid for

- **Colours came out washed.** The prototype loads an old Three.js build where hex colours are treated as linear light. Dark greys rendered as mid grey until every colour was converted. A current Three.js release handles this by default; check it, do not copy the conversion helper blindly.
- **Cut-out textures had dark fringes.** Transparent canvas pixels are black. Use an opaque colour map plus a separate alpha map.
- **Double-sided foliage had black backs.** The renderer flips normals on back faces. Emit each card's triangles twice with the same normals and render single-sided.
- **A custom sky shader broke the reflection environment.** Use a standard material with a painted sky texture so the environment bake encodes correctly.
- **Sampling a render target while drawing into it** logs errors and drops draws. Hide anything that samples a target before rendering to that target.
- **Tiled wear masks look blocky** when stretched. Keep their texel density close to the surface they sit on.
- **Light shafts and sun sprites blow out fast.** Clamp bright inputs before blurring.
- **Function and variable name clashes in one big closure.** A good reason for the real game to be modules.
- **Frame rate read under virtual time is meaningless.** Benchmark in real time with the frame cap off (see below).

## What the prototype does not prove

- Real campus data. Every building is an axis-aligned rectangle placed by hand.
- Buildings with angled walls, courtyards or pitched roofs.
- Moving actors: no players, bots or vehicles, and no shadows for moving things.
- Interiors you can walk into.
- Load time. Texture generation blocks the page for about a second.

## Harness

Both tools need Google Chrome installed and run it headless on the real GPU.

- `node reference/bench.js <scale> [screenshot.png]` loads the scene, cycles every resolution with effects on and off, prints frame rate per setting, and optionally saves a screenshot. `<scale>` is the device pixel ratio to emulate; use `2` for a Retina laptop.
- `reference/shoot.sh <name> "x,y,z,yaw,pitch"` renders one still from a camera position into `reference/shots/`. Use it to compare looks, not to measure speed.
