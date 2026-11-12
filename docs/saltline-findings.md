# Saltline: rendering findings

Saltline is a browser shooter built all in code, set in a rainy container port at dawn. It is FolkTown's visual reference: the game should feel like it graphically. Source read on 12 November 2026 from https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp (a minified bundle with Three.js inlined).

**Saltline's owner has given permission to reuse its code and shaders** (as stated by Rithvik, 12 November 2026). The parts in use are in `reference/saltline/`.

What was read: the sky, shadow and full post-processing shaders, the pipeline wiring, and the renderer setup. What was only indexed: the 27 material shaders, weapon and arm shaders, water, and the gameplay code (about 800 KB minified).

## How its frame is built

1. Scene rendered to a half-float target with a depth texture. Optional multisampling on that target, set by quality level. Renderer tone mapping is off; it happens in the post chain.
2. The weapon is drawn by a second camera with its own field of view, near plane of 1 cm and a thin slice of the depth range, so it never clips into walls. It has its own key light and reflection strength. **Not taken:** FolkTown keeps the rifle on the main camera, and the clipping is logged in `docs/known-gaps.md`.
3. Half-size linear depth, then ambient occlusion: 12 taps on a spiral, 0.9 m radius, normals rebuilt from depth, two depth-aware blur passes.
4. Ray-marched haze with sun shafts, 16 steps against the shadow map. FolkTown takes this, in place of the prototype's depth fog.
5. Composite: half-size buffers are upsampled with depth weighting so edges have no halos. Occlusion is faded out on brightly lit pixels, because it belongs to ambient light only.
6. Bloom: no brightness threshold. Six downsamples with a 13-tap filter (the first one weighted to suppress fireflies), tent-filtered upsamples, then blended at 6.5% as an energy-conserving mix. Lens dirt and a horizontal streak sit on top; FolkTown does not need them.
7. Eye adaptation: a centre-weighted log average of the smallest bloom level, eased over 1.5 s, drives exposure between 0.6× and 2×.
8. Grade: ACES tone curve blended 25% toward AgX so highlights roll off to white, split tone, a gentle S-curve, slightly lifted blacks, vignette 0.3, then a correct sRGB encode.
9. Final: FXAA, unsharp mask 0.3 backed off on strong edges, luminance-weighted grain 0.02, and a one-bit dither against banding in sky gradients.

## Other things it does

| Technique | Detail |
|---|---|
| Soft shadows | One 2048² sun shadow map over an area roughly 80 m across. Custom filter: blocker search then a penumbra that widens with distance from the caster, on a rotated Vogel disc, with a bias taken from the receiver's slope. Shadows are sharp at contact and soft far away |
| Moving shadows | The shadow map is re-rendered every second frame, so moving things cast real shadows |
| Resolution | A pixel budget per quality level (1.0, 1.5, 2.3 and 3.7 million pixels) instead of a fixed ratio. A render scale between 0.6 and 1.0 moves in steps of 0.1 with measured frame time, and the quality level drops by itself if the floor is not enough |
| Start-up self test | Renders one test frame. If the post chain fails it falls back to plain forward rendering; if the soft-shadow shader is rejected it falls back to the stock filter. Shader errors are labelled by which part failed |
| Textures | Generated on the GPU: one fragment shader per material, rendered once into a texture. No canvas work on the main thread |
| Close-up detail | Material shaders add world-space procedural detail down to under a centimetre, and sample data maps with a bicubic filter, so surfaces never go blurry when the camera is against them |
| Reflections | The sky is captured once into a reflection environment. A second capture inside its one building is given to interior materials |

## Against our prototype

| | Prototype | Saltline |
|---|---|---|
| Three.js | r128 (2021) | A current release |
| Exposure | Fixed at 1.25 | Eye adaptation |
| Tone curve | ACES approximation, gamma 2.2 | ACES blended toward AgX, true sRGB |
| Bloom | Thresholded, three blur levels, added on top | No threshold, six levels, energy-conserving |
| Occlusion | Half-size, 4×4 box blur, applied everywhere | Half-size, depth-aware blur and upsample, ambient only |
| Sun shadows | 4096² over 170 m, rendered once, stock soft filter | 2048² over about 80 m, contact-hardening, refreshed every second frame |
| Haze | Depth fog tinted toward the sun | Ray-marched with shafts |
| Weapon | Child of the main camera | Own camera and depth slice |
| Resolution | Fixed 1×, 1.5× or 2× | Pixel budget with dynamic scale |
| Textures | Canvas, on the main thread, about a second | Fragment shaders on the GPU |
| Failure handling | None | Self test with fallbacks |

## What does not transfer

Saltline's mood comes from dawn light under storm cloud, wet ground and puddles, light shafts, lens flare, lens dirt and a teal-and-orange grade. FolkTown leans toward that mood with a low late-afternoon sun and Saltline's pipeline. Light shafts and a mild lens flare are back. Rain and wet ground stay cut.
