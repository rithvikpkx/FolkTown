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
- **Next (local):** render the cloud's baked zone when it lands (WP9), then the client side of Stage 2 against the `sim` contract (input to `sim`, rifle and hands, ADS, HUD, bot rendering, menus). A reference-based pass on the Bell Tower and fountain can go before or after.
- Stage 0 note: the "prototype plaza" check is met by WP3's plaza test scene, not a full port of the prototype plaza (sensible default; the real Zone supersedes it).

### Cloud client status

Client lock: 2026-11-12T12:16Z

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
