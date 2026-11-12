# FolkTown implementation plan

FolkTown is a Purdue-themed first-person shooter that runs in a browser tab. The West Lafayette campus is the map. The first goal is that walking around it feels like the real campus; gunplay, multiplayer and everything else are built on top of that.

This plan is written so a fresh session can start building from it without any other context. Supporting documents:

- `docs/decisions.md`: every product and technical decision, stated as fact.
- `docs/fidelity-findings.md`: what the rendering prototype proved, with measurements and the pitfalls it hit.
- `docs/tech-stack.md`: the fixed stack and the hosting tiers behind it.
- `docs/campus-data-research.md`: what map data exists for campus and what is missing.
- `docs/campus-building-list.md`: every named campus building, for choosing landmarks.
- `reference/fidelity-test.html`: the working rendering prototype. Read it for technique; do not build the game inside it.
- `reference/bench.js`, `reference/shoot.sh`: the frame-rate and screenshot harness.
- `docs/original-pitch.md`: the original, unscoped pitch.
- `docs/refinements-backlog.md`: known problems deliberately deferred until after the main implementation.
- `docs/known-gaps.md`: minor polish and obscure bugs, logged and skipped.
- `docs/saltline-findings.md` and `reference/saltline/`: how the visual reference builds its frame, and its source to port from.

## 1. What is being built

| | |
|---|---|
| Platform | Desktop and laptop browsers, keyboard and mouse |
| Baseline machine | MacBook Air M1, 16 GB. Floor of 45 fps, aim for 60+ |
| Render resolution | A pixel budget of about 1.2 million pixels (1× on the baseline machine, no Retina scaling), with the render scale dropping automatically when frames run long. The difference from 2× is barely visible and 1× is roughly three times faster |
| Look | Realistic-leaning: textured brick and limestone with depth, real-time shadows, ambient occlusion, bloom, film tone mapping. Everything generated in code: no model files, no image files |
| Map | The whole West Lafayette campus exists as buildings. Each match is played in one Zone |
| First Zone | Engineering Mall |
| Players | Up to 16 humans per online match. Single-player with up to 128 bots |
| Combat | Realistic guns. Enemies are bots and unnamed military NPCs, who shoot back. An unnamed Campus Defence force fights them and cannot be damaged by the player. Quest givers are unnamed and can never be harmed |
| Release | Public, source-visible, non-commercial. Promoted around campus; success is measured in player count |
| Hosting | Static site on Vercel at `folktown.rithvik.si`. From Stage 3, one small always-on Fly.io machine (about $2 to $4 a month) runs the game server and keeps player data in SQLite on its own volume |

### Cut, permanently unless reopened

- Destructible buildings.
- Rain, dynamic water, wet-ground reflections. Water exists only as static surfaces at fountains and the pond in front of WALC.
- Strong sun glare and mirror-like reflections.
- Peer-to-peer and LAN play. More than 16 humans per match.
- Photoreal scans, faithful interiors for ordinary buildings, AI-generated avatars, paid 3D services.

## 2. Priorities, in order

1. **Campus fidelity.** Right buildings in the right places at the right size, with the right materials and recognisable landmarks.
2. **Frame rate** on the baseline machine.
3. **Gunplay feel** in single-player.
4. **Multiplayer.**
5. Everything else in the pitch.

When two of these conflict, the higher one wins.

**Velocity over polish.** Development speed and getting the game to players come before finish. The goal is something to play that looks good. Minor polish and obscure bugs that do not affect core gameplay are logged in `docs/known-gaps.md` and skipped, not fixed.

## 3. Performance budget

Measured on the baseline machine with the rendering prototype (about 460,000 triangles, 70 draw calls, full effects chain):

| Resolution | Effects on | Effects off |
|---|---|---|
| 1.0× (1440×813) | 142 fps | 163 fps |
| 1.5× (2160×1219) | 71 fps | 84 fps |
| 2.0× (2880×1626) | 42 fps | 51 fps |

Frame rate tracks pixel count far more than scene content, so resolution is the main lever.

Budget for the real game at 1×:

| Situation | Target |
|---|---|
| Standing in a Zone, no other actors | 90 fps or better |
| Single-player fight, 32 bots visible | 60 fps or better |
| 16-player match, worst case | never below 45 fps |

Rules that protect the budget:

- Resolution is a pixel budget, about 1.2 million pixels by default. Higher budgets are an opt-in setting.
- Static world geometry is merged into a few meshes per material per chunk. Repeated things are instanced.
- Static world shadows are rendered once and reused. Whether the map is also refreshed every second frame for moving actors, as Saltline does, is decided by benchmark in Stage 0; the fallback is blob shadows.
- Every stage ends with a benchmark run on the baseline machine using the harness in `reference/`. A stage is not done if it breaks the table above.

## 4. Visual direction

Carry over from the prototype:

- **Generated materials.** Colour, bump (as a normal map) and roughness textures built from layered noise at load time: brick, limestone, pavers, asphalt, grass, bark, metal, polymer, fabric.
- **Facade kit.** Walls are built as a grid with real window recesses, stone surrounds with keystones, brick piers, a tooth-pattern cornice, corner stonework, a base course, and a columned entrance.
- **Rooms behind windows.** A shader fakes a room with depth behind each pane, so buildings do not look hollow. Some windows are lit.
- **Grime.** Darker brick near the ground, stain streaks under sills, weathering blotches, dirt where walls meet the ground.
- **Foliage.** Tree crowns and hedges made of leaf cards; small grass tufts; fallen leaves.
- **Street furniture.** Lamps with banners, benches, bins, bollards, bike racks and bikes, hydrants, blue-light emergency phones, street signs, a bus shelter, utility poles with wires, traffic cones, parked cars.
- **Effects chain.** Ambient occlusion, bloom, distance haze tinted toward the sun, film tone mapping, colour grading, anti-aliasing with a light sharpen, vignette, grain.
- **Time of day.** Late afternoon, about 5 pm: a low, warm sun with long soft shadows and soft haze, leaning toward Saltline's mood. Light shafts and a mild lens flare are back. No precipitation.
- **First-person rifle** with hands, recoil, muzzle flash, bullet marks and sound. Its current quality is accepted.

Taken from Saltline, the visual reference (`docs/saltline-findings.md`; source in `reference/saltline/`, reused with its owner's permission). These replace the prototype's versions:

- **Effects chain.** Eye adaptation, wide bloom with no threshold, occlusion that only darkens ambient light, its tone curve and grade, anti-aliasing, sharpen, grain and dither.
- **Haze with light shafts,** ray-marched against the shadow map, and a mild lens flare. This replaces the prototype's depth fog.
- **Soft shadows** that are sharp at contact and soften with distance.
- **Textures generated on the GPU,** one fragment shader per material, so the page does not freeze while loading.
- **Pixel budget** with a dynamic render scale, and a **start-up self test** that falls back to simpler rendering on machines that cannot run the full chain.

New for the real game:

- Static water surfaces for fountains and the pond.
- Shadows for moving things (players, bots, vehicles): refresh the sun shadow map every second frame if the benchmark allows, otherwise blob shadows.

## 5. Campus fidelity pipeline

This is the top priority and the least proven part: the prototype is an invented plaza, not real campus data.

### 5.1 Sources

| Source | Gives | Status |
|---|---|---|
| OpenStreetMap | Building footprints, names, roads, paths, trees, water | Checked: 232 named campus buildings, about 5,000 mapped trees, all major landmarks present. Only 4% of buildings have a height or floor count. Requires visible credit |
| Indiana statewide LiDAR | Real building heights, roof hints, terrain | Statewide and free; a ready-made height-above-ground product exists. Download for campus not yet tested |
| Own phone photos | Facade material, window rhythm, entrances, signage | To be taken per building |
| Google Earth, Street View | Visual reference while authoring | Reference only. Nothing is extracted from them |

### 5.2 Stages of the pipeline (`map-tools`)

1. **Fetch.** Pull campus buildings, roads, paths, green areas and water from OpenStreetMap into a raw file kept in the repo.
2. **Project.** Convert to metres on a flat local grid. Origin at the Bell Tower. +X east, −Z north, Y up.
3. **Clean footprints.** Simplify polygons, merge building parts, keep courtyards as holes.
4. **Heights.** Sample the LiDAR height-above-ground model inside each footprint. Fall back to floor count, then to a default by building type.
5. **Style sheet.** One small JSON entry per building: wall material, floors, bay width, window type, roof type, trim options, entrance positions, display name. Three accuracy tiers:
   - **Tier 1, landmarks:** hand-authored generator code for the unique shape (Bell Tower, Engineering Fountain, and so on).
   - **Tier 2, style-sheeted:** entry filled in from photos. Right material, floor count, window rhythm and entrance side.
   - **Tier 3, automatic:** defaults only. Right footprint and height.
6. **Ground.** Roads, pavements, plazas, lawns and static water from map polygons. Trees from map data where tagged, otherwise scattered on lawns.
7. **Zones.** Named polygons that mark where a match is played, with spawn points.
8. **Bake.** Write compact per-Zone files: render geometry inputs, collision primitives, navigation graph, spawn points.

### 5.3 Generator changes needed

The prototype's facade code only handles axis-aligned rectangles. Real footprints need:

- Facades generated per polygon edge at any angle, with correct inside and outside corners.
- Trim pieces (cornice, base course, piers) as oriented boxes, not axis-aligned ones.
- Courtyards and L, U and H shaped buildings.
- At least flat and gabled roofs.
- Short edges handled sensibly: no window bays squeezed onto a 1 m wall.

### 5.4 Checking fidelity

- For each Tier 1 and Tier 2 building: a fixed camera position matching a reference photo, rendered by the screenshot harness and compared side by side.
- A walk-through checklist per Zone: can someone who knows campus name every building without labels?
- A top-down render overlaid on the map data to catch misplaced or mis-sized buildings.

## 6. Architecture

### 6.1 Repository layout

```
folktown/
  packages/
    shared/      types, constants, the network protocol
    sim/         match rules. Pure TypeScript, no browser or Node APIs
    client/      rendering, input, audio, HUD, menus
    server/      Node WebSocket server that runs sim (added in Stage 3)
    map-tools/   the campus pipeline; runs offline, writes baked Zone files
  data/          raw map data, style sheets, baked Zones
  tools/         benchmark and screenshot harness
```

TypeScript throughout, Three.js for rendering, Vite for the client build, Vitest for tests.

Packages are created when they first get code, not up front: `client` and `tools/` in Stage 0, `map-tools` with work package 6, `sim` with work package 12, `shared` when two packages first need the same type, `server` in Stage 3.

### 6.2 The one structural rule

**`sim` never imports from `client`.** It takes inputs and a time step and produces state. The client draws that state.

This is what keeps later stages cheap: the same `sim` runs in the browser for single-player, in a background worker for 128 bots, and on the server for multiplayer. Breaking this rule is the main way the project could paint itself into a corner.

### 6.3 Simulation

- Fixed time step, 60 per second, independent of frame rate. The client interpolates between steps.
- Player controller: a circle with a height range against building footprint edges. Walk, sprint, crouch, jump.
- Collision data is footprint edges with heights, plus simple shapes for props, baked by `map-tools`. It is not render meshes, so the server can load it.
- Weapons: instant-hit with spread, recoil pattern and damage falloff. Thrown and launched projectiles with gravity and bounce.
- Physics scope: character movement, projectiles, and light props that can be knocked over (cones, bins). No general rigid-body engine until something needs it.
- Bots: a state machine (patrol, chase, attack, take cover) over a navigation graph baked from walkable areas.

### 6.4 Rendering

- World chunks per Zone. The active Zone is full detail; the rest of campus is simpler geometry seen through haze.
- One merged mesh per material per chunk, built by a small batching helper (quads, boxes, cylinders with world-scaled texture coordinates and per-vertex grime shading).
- Effects chain as in section 4, with a single on/off switch and quality presets.
- The rifle and hands are drawn as children of the camera.

### 6.5 Networking (Stage 3)

- The server is authoritative: clients send inputs, the server sends state.
- State updates about 20 times a second. The client predicts its own movement and corrects when the server disagrees; other players are interpolated.
- Hit checks are done on the server against slightly rewound positions, so shots land where the shooter saw them.
- Rooms of up to 16. Bots fill empty seats.

## 7. Stages

Each stage ends deployed or runnable, benchmarked, and playable. Sizes are relative: S is a session or two, M is several, L is many.

### Stage 0: Foundations (S)

- Create the pnpm workspace with `client` and `tools/` only, lint, tests, and a client that opens to a blank scene.
- Port the batching helper from the prototype into `client`, cleaned up and typed.
- Build the effects chain, soft shadows and GPU-generated textures from Saltline's source in `reference/saltline/`, adapted and typed.
- Add the pixel budget with dynamic render scale, and the start-up self test with fallbacks.
- Move the benchmark and screenshot harness into `tools/` and wire a single command for each.
- Use a current Three.js release. Note the colour-handling difference described in `docs/fidelity-findings.md`.

**Done when:** the prototype plaza renders from the new codebase through the Saltline-derived pipeline at 90 fps or better, standing, at 1× on the baseline machine, and one command prints a benchmark table.

### Stage 1: Real campus slice (L)

- Build `map-tools` stages 1 to 4 and 6 to 8 for the Engineering Mall Zone.
- Rewrite the facade generator for arbitrary footprints (section 5.3).
- Hand-build the Zone's landmarks, starting with the Bell Tower and the Engineering Fountain (static water). Campus-wide landmark picks so far: WALC, the Bechtel Innovation Design Center and the nuclear reactor.
- Take photos and fill in style sheets for every building facing the Zone.
- Player can walk the Zone with collision.
- Rest of campus present as Tier 3 buildings at low detail.

**Done when:** the walk-through checklist passes for the Zone, side-by-side shots exist for each landmark, and standing frame rate is 90 fps or better at 1×.

### Stage 2: Gunplay, single-player (M)

- `sim` package with the controller, three weapons (rifle, pistol, shotgun), health, damage, respawn.
- Aim-down-sights, recoil, hit marks, hit feedback, weapon sounds.
- Bots with navigation and three difficulty levels.
- HUD: health, ammo, kill feed, scoreboard, minimap.
- Free-for-all and team deathmatch against bots.

**Done when:** a full match against 32 bots plays start to finish at 60 fps or better, and `sim` has tests that run a bot-only match with no browser.

### Stage 3: Multiplayer deathmatch (L)

- `server` package, rooms, join by link with a typed name.
- Prediction, correction, interpolation, rewound hit checks.
- Deploy: site on Vercel at `folktown.rithvik.si`, server on Fly.io at `play.folktown.rithvik.si`.
- Automated check: a headless match of bot clients against a real server.

**Done when:** 16 people click a link and finish a match with scoring, never dropping below 45 fps on the baseline machine.

### Stage 4: More campus (L)

- Second and third Zones, then the Zone vote before each match.
- All remaining campus buildings at Tier 3, with Tier 2 for anything visible from a Zone.
- Landmark interiors with gameplay effects: dining courts restore health and give boosts; the robotics lab has robots that can be hacked to fight for you.
- Room-kit interiors (lobby, hallway, classroom, stairwell) for ordinary buildings in the active Zone.
- Selfie avatars: a photo cropped in the browser onto the character's head, stored on the game server's volume and tied to the player's device token.
- Leaderboards in SQLite on the same volume.

### Stage 5: Vehicles and big single-player (L)

- Cars and buses with arcade handling, run-over damage, entering and leaving.
- Single-player scaled to 128 bots, with `sim` running in a background worker.

### Stage 6: Living campus (L)

- A running battle between Campus Defence and groups of military NPCs. Traffic, stealing cars.
- Unnamed quest givers who cannot be harmed; quests.
- Sandbox mode: flying, god mode, all weapons.
- Time of day and season following the real date (sky, haze, foliage colour). No precipitation.

### Stage 7: Big modes (L)

- Search and destroy. Battle royale across the whole campus with bots filling the lobby.
- Flyable planes at the airport; more vehicle types.

## 8. First work packages

Sized for one session each. Each lists what must exist at the end.

| # | Package | Deliverable |
|---|---|---|
| 1 | Repository skeleton | pnpm workspace with `client` and `tools/`, lint, test and build commands, blank scene opens |
| 2 | Batching helper | Typed port with tests for winding, normals and texture coordinates |
| 3 | Generated textures | Materials generated on the GPU from Saltline's surface shaders, adapted for brick, limestone, pavers, asphalt, grass, bark, metal, polymer and fabric |
| 4 | Effects chain | Saltline's chain adapted and typed, with soft shadows, light shafts and a mild flare. Presets, an on/off switch, the pixel budget and the start-up fallback |
| 5 | Harness | `bench` and `shoot` commands; a saved baseline table |
| 6 | Map fetch and projection | Raw campus data in `data/`, projected to metres, top-down debug render |
| 7 | LiDAR heights | Download the height-above-ground model for campus, sample it per footprint, and check the results against known heights (Bell Tower 48.8 m, Armstrong Hall 16.5 m) |
| 8 | Footprint facades | Facade generator on arbitrary polygons, with a test page of awkward shapes |
| 9 | Engineering Mall bake | Zone file with buildings, ground, collision, spawns |
| 10 | Bell Tower | Tier 1 landmark matched to a reference photo |
| 11 | Engineering Fountain | Tier 1 landmark with static water |
| 12 | Walkable Zone | Controller and collision in `sim`, driven by the client |

Packages 6 and 7 can run before or alongside 1 to 5, and package 7 should be done early: it is the last unproven piece of the data pipeline.

## 9. Working method

- **Start solo.** Stages 0 to 2 are built by one person. The four-person split begins when there is a working game to divide.
- **Team split, when it starts:**
  - Architect: `shared`, `sim` contracts, `server`, final review of merges.
  - Client: movement and weapon feel, HUD, menus, effects.
  - World: `map-tools`, style sheets, landmarks, interiors.
  - Things that move: bots, NPCs, vehicles, landmark gameplay.
- **Contracts as code.** For each feature, the higher-tier model writes the TypeScript types, function signatures and failing tests plus a short brief. Cheaper models make the tests pass without changing the contract.
- **Model budget.** Top-tier models for architecture, contracts, cross-cutting bugs and review. Mid-tier for design inside one area. Cheapest capable model for bulk implementation, screens and content such as style sheets.
- **One owner per package.** Contract changes go through the architect.
- **Small merges, always playable.** Unfinished features sit behind a switch.

## 10. Verification

| What | How |
|---|---|
| Match rules | Unit tests in `sim`; a bot-only match that runs without a browser |
| Frame rate | `bench` on the baseline machine at every stage end; fail the stage if below budget |
| Look | `shoot` renders fixed camera positions; compare against the previous run and against reference photos |
| Campus accuracy | Section 5.4 |
| Multiplayer | Headless bot clients against a real server |

## 11. Risks

| Risk | Response |
|---|---|
| LiDAR heights turn out unusable for campus | Work package 7 tests it first. Fallbacks: floor counts from photos, default heights by type |
| Arbitrary footprints make the facade kit much harder than the prototype suggests | Work package 8 is isolated with a test page of awkward shapes before any Zone depends on it |
| Hand-building landmarks takes far longer than ordinary buildings | Two landmarks in Stage 1 set the real cost before more are planned |
| One machine and one volume hold the server and all player data | Volume snapshots for the data; accept short downtime on restarts. Re-read Fly.io's prices at Stage 3 |
| 128 bots at 60 fps | Raise the count stepwise and benchmark each step |
| Likenesses and Purdue marks in a public game | No real names, no Purdue logos or mascot, no shootable students. Lookalike quest givers still carry some risk: see `docs/refinements-backlog.md` |
| Face photos are personal data, and strangers can upload anything | Deferred to `docs/refinements-backlog.md`; settle before avatars ship |
| The prototype's code style leaking into the game | It is reference only. Port ideas, not the file |

## 12. Open questions

1. **The full landmark list.** Go through `docs/campus-building-list.md` and pick the buildings with a clear purpose and a good idea for the interior.
2. **Where the nuclear reactor is on the map.** It is not a named building in the map data; it is believed to sit inside the Electrical Engineering building. Confirm before modelling it.
3. **Whether the LiDAR height model resolves individual campus buildings** (work package 7).
4. **Whether Purdue will share footprints or floor plans** on request.

## 13. Glossary

- **Campus:** the full West Lafayette map.
- **Zone:** a named area of the Campus where one match is played.
- **Landmark:** a named building with a hand-built shape and, later, a themed interior with a gameplay effect.
- **Tier 1 / 2 / 3:** hand-built, style-sheeted from photos, or automatic.
- **Style sheet:** the per-building JSON entry that tells the generator how the building looks.
- **Bot:** an AI combatant that plays like a player.
- **Military NPC:** an unnamed enemy soldier. Can be shot and shoots back.
- **Campus Defence:** the unnamed allied force fighting the military NPCs. Cannot be damaged by the player.
- **Quest giver:** an unnamed character who may resemble a real Purdue figure. Cannot be harmed.
- **Baseline machine:** MacBook Air M1, 16 GB.
