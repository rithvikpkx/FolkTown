# Saltline (base fork)

Saltline, a single-file procedural FPS (everything generated in code, no downloads), split into ES modules. The code is unchanged (still minified names); only the layout moved. FolkTown's own client in `packages/client` is untouched.

- Run: `pnpm saltline` (Vite dev server). Build: `pnpm --filter @folktown/saltline build`. Check: `node tools/saltline-check.mjs` (headless Chrome, waits for `window.__ready`, saves `tools/shots/saltline.png`).
- Controls: WASD move, mouse look, LMB fire, RMB aim, R reload, Q sidearm, E cut relay, Space jump, Shift sprint, C crouch, Esc pause. Gamepad and touch also work.
- Three.js is pinned to r180 (the version the original bundled) via `import ... from 'three'`; the original's inlined copy, the claude.ai frame preamble and the unused `legacy-v8` fallback blob were dropped.

## Files (line ranges are in the prettier-beautified single-file bundle `game.pretty.js`, not in the repo)

| File | Role | Original lines |
|---|---|---|
| `src/main.js` | imports every module in original order | n/a |
| `src/game/ns.js` | `ar` namespace helper (esbuild) | 2-5 |
| `src/game/common.js` | config, RNG/event helpers, geometry merge and primitive builders | 28747-29303 |
| `src/game/render.js` | namespace render: renderer, post-processing, sky/shadow rig | 29304-31114 |
| `src/game/mats.js` | namespace mats: materials, textures, shader patches | 31115-33636 |
| `src/game/props.js` | namespace props: prop builders and registry | 33637-38461 |
| `src/game/level.js` | namespace level: arena layout and collision | 38462-41167 |
| `src/game/backdrop.js` | namespace backdrop: distant scenery | 41168-43238 |
| `src/game/ground.js` | namespace ground: terrain and ground cover | 43239-44454 |
| `src/game/fx.js` | namespace fx: particles, decals, effects, sound recipes | 44455-51386 |
| `src/game/audio.js` | audio tables, mixer, music, engine and game logic (boundary approximate) | 51387-54426 |
| `src/game/weapon.js` | namespace weapon: models and firing | 54427-58667 |
| `src/game/hands.js` | namespace hands: first-person hands and animation | 58668-62746 |
| `src/game/enemies.js` | namespace enemies: rigs, AI, showcase | 62747-64976 |
| `src/game/hud.js` | HUD, menus, settings (localStorage), legacy fallback code | 64977-66021 |
| `src/game/loop.js` | frame loop | 66022-66721 |
| `src/game/boot.js` | `window.__ready`/`__frames`/`__errors` flags, error hooks, boot, entry call | 66722-end |

Three.js internals (lines 7-28746) are replaced by named imports from `three` at the top of each file (`Vector3 as K`).

## How the split works (generated, do not hand-fix cross-file wiring yet)

All files were one scope, so every top-level declaration is `export`ed and imported where used. Names a file uses from a later file (lazy, call-time only) would reorder module evaluation in the circular graph, so they are late-bound: the earlier file declares `let N` plus `export const __late`, and the owning later file calls `__late_x.N(N)` once defined. All real imports therefore point backwards, which keeps the original evaluation order. A few spurious `let` names exist where an object key matched a top-level name; they are harmless.

## Phase 2 gaps

- De-minify names (the mangled `K`, `ot`, `zi`, ...) and replace the late-binding with real module boundaries.
- Data-driven level loader fed from `data/zones/purdue-mall.json` (level.js is hard-coded procedural geometry).
- Collision grid (level.js collision is the original's own) and instancing/batching of props.
- Google Fonts are loaded from the network in `index.html`; self-host them.
- The audio/fx boundary at line 51387 is a guess; sound recipes sit at the end of fx.js.
