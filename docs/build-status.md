# FolkTown build status

The handoff file. Update it at the end of every work package, so a session that hits a usage limit or loses its transcript loses nothing.

## Where things stand (12 November 2026)

- Planning is finished. All decisions are in `docs/decisions.md`; the plan is `docs/implementation-plan.md`.
- `main` holds the docs (fast-forwarded from `docs/design-import`).
- **Done on `mvp`:** WP1 skeleton (also on `main`), WP5 harness, WP6 map fetch, WP2 batching helper, WP7 LiDAR heights.
  - WP7: `pnpm map:heights` (USGS 3DEP Indiana 2017 via public EPT on AWS, `uv` Python `heights.py`, cache `data/raw/lidar/` gitignored) writes `data/heights.json` and `heightLidar` in `data/campus.json`. P90 surface minus local ground. Bell Tower 45.9 m (known 48.8), Armstrong 21.9 m (known 16.5, roof plant; known-gaps 5). Open question 3 answered: yes, it resolves individual buildings. `data/` is now excluded from Biome.
  - WP2: `packages/client/src/batch.ts` (`Batch` with `rect`/`box`/`cyl`, world-scaled UVs, `shade(y)` grime hook, `mesh(material)`); tests in `batch.test.ts`.
  - WP5: `pnpm bench` (table, `--save` writes `tools/baseline.md`) and `pnpm shoot <name> [pose]`; poses in `tools/poses.json`; client takes `?cam=x,y,z,yaw,pitch` and exposes `window.__ft` frame times.
  - WP6: `packages/map-tools`; `pnpm map:fetch` (Overpass, cached in `data/raw/osm-campus.json`; public Overpass is flaky, curl the query if it times out), `pnpm map:project` writes `data/campus.json` (1376 buildings, 193 named, 102 with height/levels). Origin = Bell Tower centroid 40.42729, -86.91407; x east, z south; outer rings CCW, holes CW (see `types.ts`).
- Agent cost so far: WP5 ~77k tokens, WP6 ~116k tokens, WP2 ~60k, WP7 ~76k tokens (Sonnet). Owner's weekly usage was 54% before WP5/6 started.
- Pinned: pnpm 12.18.0, TypeScript 7.0.2, Vite 8.3.8, Vitest 5.1.0, Biome 2.6.7, Three.js 0.187.0.
- Commands from the root: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint` (Biome plus `tsc` per package).
- Tooling notes: the shell lazy-loads nvm, so in scripts call pnpm as `npx -y pnpm@12.18.0`. Biome skips `*.md` because it rewrites the doc tables. pnpm 12 refuses very new releases; it listed Biome in `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`.

## Branches and deploys

- `mvp` is the dev branch. Each work package is a branch off `mvp`, merged back by the main session. **Nothing merges into `main`** until the owner has played and approved the MVP.
- **Deploy is automatic:** Vercel project `folktown` is connected to the GitHub repo; every push to `mvp` deploys to **https://folktown.vercel.app** (config in `vercel.json`; `ENABLE_EXPERIMENTAL_COREPACK=1` is set so Vercel uses pnpm 12). `folktown.rithvik.si` needs a CNAME at Hostinger, which only the owner can add.

## Rules for the autonomous run to the MVP

The owner asked for the MVP (end of Stage 2) to be built without check-ins, as cheaply as possible.
- Never merge into `main`, never push `main`. The finished MVP lives on `mvp`; the owner merges after playing it.
- Orchestrator stays lean: one Sonnet subagent per work package with a short brief that points at files; the orchestrator reviews the diff stat and test output, merges, updates this file, pushes. At most two subagents at once.
- Do not ask the owner questions; pick the sensible default and note it here. Minor issues go in `docs/known-gaps.md`.
- Update this file and push after every merged package, so any session can resume from it.
- Cloud sessions have no Mac GPU: `pnpm bench` numbers from the cloud do not count. Keep a "Benchmarks pending on the Mac" list below; the owner's Mac runs them. Screenshots in the cloud may use software rendering (set the Chrome path via env; `tools/chrome.mjs` defaults to the macOS path).
- Landmark and facade references: public photos (Wikimedia Commons), since nobody can take photos.
- When the Stage 2 done-when criteria are met (apart from the Mac benchmark), stop and report the link.
- **Fresh context per task (owner's rule, be mindful of usage):** every work package is done by a fresh subagent, never inside an orchestrator's own context. An orchestrator session handles at most 3 packages, then writes its handoff here, pushes, and ends; a new session continues from this file. Read only the files and line ranges a task needs.
- **Models and effort (owner's rule, 12 November):** orchestrators and workers both run on Sonnet (`claude-sonnet-5-5`), in the cloud and locally. Opus only if a Sonnet worker has failed the same package twice; note it here when that happens. When spawning a worker, set effort `medium` for routine packages (ports, pipelines, data, UI, tests); leave the default effort for the hard ones: WP4 effects chain, WP8 facades, bots and navigation.
- **Starting the local track:** a fresh local session per batch, started with `claude --model sonnet "continue the local track per docs/build-status.md"` (this repo's local settings already default to Sonnet, so plain `claude` works too). It reads this file, runs up to 3 packages through fresh workers, updates 'Local track status', pushes, and ends.
- **Cloud lock:** the cloud track has one hourly routine. The first line of 'Cloud track status' is `Cloud lock: <UTC time>` or `Cloud lock: free`. A cloud session that finds a lock newer than 75 minutes exits at once without doing anything else. Otherwise it writes the current time as the lock, pushes, works (refreshing the lock after each package), and sets `Cloud lock: free` before it ends.

## Benchmarks pending on the Mac

- (none yet)
- This machine is the baseline (MacBook Air M1, 16 GB), so benchmarks run here.
- LiDAR step: Python through `uv run --with rasterio` (no system GDAL needed).

## Next

### Cloud / local split (from 12 November)

Two orchestrators work on `mvp` at once. Each owns its own folders and its own subsection below, and never edits the other's. Before every push: `git pull --rebase origin mvp`; if this file conflicts, keep both sides.

| | Cloud (always on, no GPU) | Local (owner's Mac, online in windows) |
|---|---|---|
| Owns | `packages/sim`, `packages/shared`, `packages/map-tools`, `data/` | `packages/client`, `tools/` |
| Order | 1. `sim` contract (types for inputs, state, zone collision, weapons) pushed first so the client can build against it. 2. WP12 controller + collision on synthetic footprints, then on campus data. 3. WP9 Engineering Mall bake (zone file: ground, footprints with heights, collision, spawns, nav graph). 4. Stage 2 rules: rifle/pistol/shotgun (hit-scan, spread, recoil pattern, falloff), health, damage, respawn, FFA and TDM, bots (patrol/chase/attack/cover, three difficulties). 5. Headless bot-only match test with 32 bots. | WP4 effects chain, WP8 facades (running), WP3 GPU textures, WP10 Bell Tower, WP11 fountain, render the baked zone, then client side of Stage 2: input to `sim`, rifle and hands, ADS, hit marks and feedback, sounds, HUD (health, ammo, kill feed, scoreboard, minimap), bot rendering, menus for mode and difficulty. Runs all Mac benchmarks. |
| Checks | unit tests, headless match | `pnpm shoot` images, `pnpm bench` |

The client never adds rules; if it needs one, it notes it in the cloud subsection and stubs it.

### Cloud track status

Cloud lock: done

- **WP12 merged** (~78k tokens Sonnet): `@folktown/shared` (contract: PlayerInput, WeaponDef/WEAPONS, ZoneData, MatchConfig/State, GameEvent, constants) and `@folktown/sim` (`stepController`, `ZoneCollision` + `raycast`, `makeSyntheticZone`). Yaw 0 looks toward -z, positive yaw turns left. 35 tests.
- **WP9 merged** (~79k): `pnpm map:bake` -> `data/zones/engineering-mall.json` (109 KB; 300 m box centred (-30,-290), north of Bell Tower; 14 colliders, 296 trees, 24 spawns, 1443 nav nodes). Flat ground.
- **WP13 merged** (~81k): `Match` class in sim (weapons, hit-scan, headshots, health, respawn, FFA/TDM, events, `snapshot()`); recoil exposed as `recoilPitch/recoilYaw` on PlayerState.
- **WP14 merged** (~92k): `NavGraph` A*, `BotController`, 3 difficulties, `runBotMatch`. `packages/sim/test/bot-match.test.ts`: 32-bot FFA and TDM run to matchEnd headless (~2-4 s each). 72 tests pass.
- **Cloud track step 5 done: Stage 2 sim side complete.** Client needs: feed `PlayerInput` to `Match.step`, render `snapshot()`, load zone JSON, use `BotController` for bots. Open: no hit-scan vs ground, bots have no healing, flat ground (known-gaps).

### Local track status

- **Cloud client session (12 November):** the owner is away, so a one-off cloud session owns `packages/client` and `tools/` and writes under "Cloud client status" below. Local sessions must not start until it has set `Client lock: free` there.

- **WP4 effects chain merged** (~130k tokens, Sonnet). `packages/client/src/render/`: `createRenderer(canvas, scene, camera, opts)` -> `{render(dt), setPreset, setEnabled, resize, invalidateShadow, state, webgl}`. Presets `?q=low|medium|high` (default medium, 1.2 MP), `?fx=0` or F toggles the chain, dynamic scale 0.6-1.0, start-up self test with fallbacks. Static shadow map once; `high` refreshes every second frame. `pnpm bench` on M1 (test boxes scene): median 263 fps, 1% low 185-192. Known gaps 6, 7.
- **WP8 footprint facades merged** (~106k tokens, Sonnet). `packages/client/src/facade/`: `new Batches()`, `buildFacade(B, {outer, holes?}, height, FacadeStyle)`, `buildLowDetail(B, fp, height, {wall})` (Tier 3); `glassMaterial()` fake-room shader. Test page `/facades.html` (`packages/client/vite.config.ts` has both inputs). Batch gained `tri()` and `triangleCount`. Real buildings cost 13k-21k triangles detailed vs 34-70 Tier 3: use Tier 3 beyond ~150 m. Known gap 8 (no entrances, gables only on rectangles).
- **WP3 textures, WP10 Bell Tower, WP11 Engineering Fountain merged** (~82k, ~58k, ~51k tokens, Sonnet). `makeMaterials(renderer.webgl)` gives the material table; `buildPlaza` in `scene.ts`. Landmarks in `packages/client/src/landmarks/`: `buildBellTower(scene, mats, at)` (48.8 m, grey cap not verdigris, known-gaps 12), `buildFountain(mats, cx, cz)` (stylised, 40 m south of origin, known-gaps 11). Poses `belltower`, `fountain`. Neither checked against reference photos.
- **Owner decisions, 12 November:** (1) Haze is cut to 20% by default so screenshots are readable while developing (`?haze=1` shows the full look). **Restore full haze as the default when the game is close to done.** (2) **Landmarks and buildings are built from real-world references:** before a landmark or facade package, look up public photos and descriptions (Wikimedia Commons) of the real building, exterior and interior, and match proportions, materials, roof and window layout. Note the sources in the package report. Landmarks to redo this way: Bell Tower (pointed copper-green cap, arched belfry openings), Engineering Fountain (real sculpture shape), then each chosen landmark.
- **Deploy:** fixed 12 November (deployment login off, production now serves the latest `mvp`); owner confirmed the Bell Tower and fountain render at folktown.vercel.app.
- **Owner decisions, 12 November (later):** assets first, code second (`CLAUDE.md`, `docs/decisions.md`, ledger in `docs/assets.md`). Guns and generic non-Purdue things (props, characters, textures) use internet assets in a **modular, manifest-driven** setup so any asset swaps by editing data. Purdue buildings and custom Purdue landmarks stay procedural (revisited later; AI 3D generation only with the owner approving cost and licence). Merged so far: CC0 "Flat Guns West" weapons (owner finds them poor), Saltline-style material detail layer. Running: `local-weapons2` (weapon manifest + better guns), `local-textures` (CC0 PBR texture manifest). Art comparison page: https://claude.ai/artifact/TfN8tubWbUkgpmQZgTfziR.
- **Handoff, 12 November (orchestrator-1-main):** all merged and pushed on `mvp`: WP3/10/11, UI (menu, scoreboard, minimap), verify fixes, CC0 weapons manifest (M4A1/1911/pump), Saltline material detail, CC0 PBR texture manifest, audio system (21 CC0/CC-BY sounds; gunshots need a credit line, gap 59), `local-play` (bots hunt the player, ground raycast, bot health bars/flash/tracers, `tools/play-check.mjs`). **Still running as research (branches, not merged, report to the orchestrator):** `research-graphics` (Fable: photoreal research, `docs/graphics-research.md`, plus a published "Photoreal Lab" artifact: gun models and the WALC) and `saltline-deep` (Sonnet: reverse-engineer Saltline, `docs/saltline-deep-findings.md`). Next: act on those two reports (port Saltline techniques as work packages; decide on paid AI generation with the owner), CC0 characters and props with manifests, reference-photo facades and landmarks, owner play-test, Mac benchmark. Owner feedback so far: weapons and campus fidelity far from the target; audio serviceable; keep everything modular.
- **Graphics port plan (owner approved the Photoreal Lab look, 12 November; source in `reference/photoreal-lab/`, findings in `docs/graphics-research.md` and `docs/saltline-deep-findings.md`).** Work packages, one fresh Sonnet worker each, in order: **G1** sky PMREM environment light (`scene.environment`) replacing the hemisphere light (cheapest, biggest jump). **G2** weapons: bring the lab's models and 2K maps (Poly Haven pistol, bolt rifle, M4A1, shotgun) into `weapons.json` as new default variants, add the lab's weapon lighting. **G3** `Batch` bevelled boxes, swept profiles and vertex weathering (Saltline gap 2). **G4** facade generator rebuild: recessed windows, sills, cornice and trim depth, per-pane glass, baked AO, using the lab's WALC generator as the reference. **G5** WALC as a real landmark in a zone (OSM footprint, data in the lab assets). **G6** quality tiers: Medium 1.2 MP at the 45 fps floor, High/Ultra 2.3 MP with a 30 fps floor, with GTAO, MSAA on the scene pass only, DoF, grain; benchmark each on the Mac. **G7** KTX2 textures, mesh LOD and campus chunking. **G8** owner photos of landmarks into style sheets. Each must stay manifest-driven with fallbacks. **Owner decisions closed (12 November):** any freely downloadable asset may be used (CC-BY Sketchfab models included; log them in `docs/assets.md`, mark `needs-clearance` where licence is unclear; the owner clears licences; no paywall/login/DRM bypass, no ripping from commercial games); gather as many photographs per building as possible (G8 starts now, in parallel with G1-G2); tools like Blender and `ktx` may be installed; High/Ultra floor is 30 fps, Medium 45; paid AI 3D generation is banked for later.
- **MVP playable area (owner, 12 November; replaces the 300 m Engineering Mall box):** the Purdue Mall and its surroundings around the Bell Tower: WALC (enterable, with special gameplay features inside), the Bell Tower, the Purdue Mall with the Engineering Fountain, and the buildings directly around the Mall. From the owner's Google Earth view: Hall of Data Science and AI (DSAI), Forney Hall of Chemical Engineering, Mechanical Engineering Building, Materials Science and Electrical Engineering, BHEE, Duncan Annex, Hovde Hall of Administration, Stanley Coulter Hall, Psychological Sciences, Elliott Hall of Music (the circular hall at the bottom of the view; confirmed by the owner), Cheney Hall and the other halls on the west edge. Small and general; every building mapped out. Work packages: **Z1** re-bake the zone (`pnpm map:bake`) to cover Bell Tower to north of the Mall (check coordinates against `data/campus.json`, bounds roughly 450 x 400 m), real footprints and LiDAR heights for all those buildings, named list in `docs/campus-building-list.md`, spawns and nav; move the test fountain/Bell Tower to their real positions. **Z2** WALC interior (enterable): footprint floor plans from photos/references, doors, atrium, stairs, collision, interior lighting; special features (default until the owner says otherwise: health station, ammo/armour pickup room, a weapon locker, a scoreboard wall); this is the main gameplay addition beyond Stage 2. Per-building style sheets from as many photographs as can be found (G8, uses Wikimedia, Purdue pages, any freely downloadable photos). The owner suggests Google Earth/3D tiles for higher-quality mapping later; its terms for use in a shipped game are restricted, so use it as a visual reference only until that is checked.
- **Z1 done (branch `z1-mall-zone`):** `pnpm map:bake [zone]` reads `data/zones.config.json` and writes `data/zones/<zone>.json`; `purdue-mall` (x -190..275, z -335..135) has landmark records (Bell Tower, fountain at the real OSM position (23.7, -151.1), WALC), flat ground (no terrain model, gap 61), Stanley Coulter as a bounding box and Duncan Annex missing (gaps 62-63, matches in `docs/campus-building-list.md`). `play.html` loads it by default (`?zone=engineering-mall` for the old one), the sim clamps players to the zone bounds and the HUD shows an edge note. Shot poses `mall-*` in `tools/poses.json` open play.html.
- **Open bug (owner report 12 November):** on the live `play.html` the screen shows only sky after clicking to play (world and weapon not drawn, minimap empty, cannot move); audio and shots work. Worker `fix-sky-stuck` is on it; merge its branch first thing.
- **Saltline gameplay port merged** (`docs/saltline-gameplay-findings.md`): acceleration movement, spread model, bot hearing/aim error/shooter cap, camera feel (`game/feel.ts`), HUD effects (`game/hud-fx.ts`), synth audio backend (`?audio=synth`). 131 tests pass. Not yet checked by the owner by eye/ear. Left list with costs is in the findings doc. No agents running; start with G1 and G2.
- **Session hygiene (owner rule, 12 November):** watch context and usage; when the context gets long, write the handoff here and recommend the owner start a fresh session (`claude --model sonnet "continue the local track per docs/build-status.md"`) instead of rereading an expensive long transcript.
- **Not yet checked by anyone:** whether bots move/chase in `play.html` (verify worker saw them barely move), real mouse/keyboard play, ADS on pistol and shotgun. Next after the two running: a bots-behaviour check, generic CC0 character models for bots (unnamed military NPCs only), props (benches, lamps) from CC0 kits, then the reference-photo facade work.
- **Next (local):** render the cloud's baked zone when it lands (WP9), then the client side of Stage 2 against the `sim` contract (input to `sim`, rifle and hands, ADS, HUD, bot rendering, menus). A reference-based pass on the Bell Tower and fountain can go before or after.
- Stage 0 note: the "prototype plaza" check is met by WP3's plaza test scene, not a full port of the prototype plaza (sensible default; the real Zone supersedes it).

### Cloud client status

Client lock: free

- **Stage 2 client side merged** (~122k Sonnet): `play.html` (`?mode=ffa|tdm&diff=&bots=`) renders the baked Engineering Mall zone, pointer-lock input into `Match`, bots as capsules, rifle/pistol/shotgun with hands and ADS, decals, HUD. Not done: scoreboard, minimap, menus, sound, reload/switch animations. Known gaps 50-53. Benchmarks pending on the Mac: play.html frame rate at 1.2 MP with 7 and 31 bots, facade LOD switch cost, view-model look and POSES check. No screenshots (no GPU).

- **Bell Tower + Engineering Fountain redone and merged** (~64k, ~59k Sonnet). Wikimedia/Wikipedia were blocked from the cloud, so only search snippets were used: proportions, cap pitch, slab lean are estimates (known-gaps 12, 30, 40). Bell Tower: brick shaft, clock stage with 4 dials, arched belfry, verdigris pointed cap (`verdigris` in materials). Fountain: four leaning concrete slabs, mirror-steel jet cylinder, animated water shader (`landmarks/fountainMaterials.ts`). Lint import-order error in scene.ts fixed. Not visually checked. Benchmarks pending on the Mac: landmark triangle cost, water shader cost.

- **Cloud client, Stage 2 pass (branch cloud/stage2, ~no GPU, nothing seen on screen):** `packages/client/play.html` (+`src/play.ts`): renders `data/zones/engineering-mall.json` (`src/zone/build.ts`: ground, `buildFacade` within 150 m else `buildLowDetail`, instanced trees, Bell Tower, Fountain), runs a single-player `Match` + `BotController` (`src/game/session.ts`, 60 Hz fixed step, interpolated), pointer-lock WASD/mouse (`input.ts`), capsule bots (`figures.ts`), generated rifle/pistol/shotgun with hands, ADS, kick, reload dip, flash (`weapon.ts`), bullet marks (`marks.ts`, `impacts.ts`), DOM HUD (`hud.ts`). URL: `/play.html?mode=ffa|tdm&diff=easy|normal|hard&bots=7`; `?cam=x,y,z,yaw,pitch` gives a fixed camera without the game. Gaps 50-53. To check on the Mac: look and feel, view-model poses, benchmark of zone (14 near facades + trees).

Work package numbers are from section 8 of the plan.

## Rules for subagents, to keep usage low

- **One work package per subagent,** in its own git worktree and branch. The main session reviews the diff and merges.
- **Cheapest model that can do it.** Sonnet for ports and pipelines (packages 2, 3, 5, 6, 7). Sonnet for the effects chain (4) and facade generator (8) too; escalate to the session model only if Sonnet fails (owner asked for lowest cost). Haiku for lookups.
- **Briefs point at files, they do not paste them.** Each brief names the work package, the files to read (with line ranges where known), the deliverable, and the check that proves it.
- **Reports are ten lines or fewer:** what was built, the command that proves it, its output, anything logged to `docs/known-gaps.md`.
- **Every package ends with its test or benchmark passing.** No report of success without the command output.
- **Minor issues are logged, not fixed** (`docs/known-gaps.md`).
- No fan-out beyond two at a time without asking.

## Known line ranges, to save reading

- `reference/fidelity-test.html`: noise and canvas textures 62 to 167, batching helper 168 to 310, scene 311 to 477, rifle 478 to 562, effects chain 563 to 631, renderer and resize 632 to 645, player 646 to 689, loop 690 on. It loads Three.js r128; colours need the care described in `docs/fidelity-findings.md`.
- `reference/saltline/sky-shadows-post.txt`: the post passes begin at the line containing `SALTLINE_POST`; the function that wires them, with all tuning values, and the renderer setup are on the last line.
