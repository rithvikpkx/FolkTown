# FolkTown

## What FolkTown is

FolkTown is a Purdue-themed first-person shooter that runs in a browser tab. The West Lafayette campus is the map, and the first goal is that walking around it feels like the real campus. Gunplay, multiplayer for up to 16 players, single-player with bots, vehicles and a living campus are built on top of that, in stages.

Everything is generated in code: no model files, no image files. The target machine is a MacBook Air M1 with 16 GB, with a floor of 45 fps at 1× resolution.

## What this repository is

This is the game's repository. `docs/` and `reference/` hold the design and reference material; the game is built alongside them in the layout from `docs/implementation-plan.md` section 6.1. **Do not build the game inside `reference/`:** port ideas from the prototype, not the file.

| Path | Contents |
|---|---|
| `docs/implementation-plan.md` | The full plan: priorities, performance budget, campus pipeline, architecture, stages, first work packages, risks. Start here |
| `docs/decisions.md` | Every product and technical decision |
| `docs/fidelity-findings.md` | What the rendering prototype proved, with measurements and pitfalls |
| `docs/saltline-findings.md` | How Saltline, the visual reference, builds its frame, and how the prototype differs |
| `docs/refinements-backlog.md` | Known problems deliberately deferred until after the main implementation |
| `docs/known-gaps.md` | Minor polish and obscure bugs, logged and skipped. Add to it instead of fixing them |
| `docs/tech-stack.md` | The fixed stack and the hosting tiers behind it |
| `docs/campus-data-research.md` | What map data exists for campus and what is missing |
| `docs/campus-building-list.md` | Every named campus building, for choosing landmarks |
| `docs/original-pitch.md` | The original unscoped pitch |
| `reference/saltline/` | Saltline's sky, shadow, post-processing and material shader source, to port from |
| `reference/fidelity-test.html` | Working rendering prototype. Reference for technique only |
| `reference/bench.js`, `reference/shoot.sh` | Frame-rate and screenshot harness for the prototype |

## The rules that matter most

- **Priority order:** campus fidelity, then frame rate, then gunplay feel, then multiplayer, then everything else.
- **Velocity over polish.** Development speed and getting the game to players come first. When the choice is between fixing a minor issue that does not affect core gameplay (gun clipping, an obscure bug, a final touch) and moving on, add a row to `docs/known-gaps.md` and move on.
- **Match rules live in a package that never imports rendering code.** The same rules must run in the browser, in a worker and on the server.
- **Single-player first,** multiplayer after.
- **Pixel budget of about 1.2 million pixels by default** (1× on the baseline machine). Resolution is the main cost; scene detail is cheap by comparison.
- **Lean toward Saltline's look** (`docs/saltline-findings.md`): its rendering pipeline, and a low, warm late-afternoon sun with long soft shadows. Its source may be reused with the owner's permission; the parts in use are in `reference/saltline/`.
- **No rain, no dynamic water, no wet-ground reflections, no destructible buildings.**
- **Who can be shot:** bots and unnamed military NPCs. Campus Defence allies and quest givers cannot be harmed. No real names, and no shootable students or civilians.
- **Deferred problems go in `docs/refinements-backlog.md`,** not into the current stage.
- **Every stage ends with a benchmark** on the baseline machine.

## Open questions

1. The full landmark list, chosen from `docs/campus-building-list.md`.
2. Where the nuclear reactor sits on the map.
3. Whether the LiDAR height model resolves individual campus buildings.
4. Whether Purdue will share footprints or floor plans on request.