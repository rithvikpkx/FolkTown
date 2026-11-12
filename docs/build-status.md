# FolkTown build status

The handoff file. Update it at the end of every work package, so a session that hits a usage limit or loses its transcript loses nothing.

## Where things stand (12 November 2026)

- Planning is finished. All decisions are in `docs/decisions.md`; the plan is `docs/implementation-plan.md`.
- No game code exists yet.
- The docs are committed on the branch `docs/design-import`. `main` has only the initial commit.

## Next: on the word "start"

1. Fast-forward `main` to `docs/design-import`.
2. **Work package 1, repository skeleton,** done by the main session, not a subagent: it is small and everything else needs it. Pin current stable versions of pnpm, TypeScript, Vite, Vitest, Biome and Three.js.
3. Then two tracks in parallel, one subagent each, at most two running at once.

| Track | Packages, in order | Touches |
|---|---|---|
| A. Rendering and gameplay | 5 harness, 2 batching helper, 4 effects chain, 3 GPU textures, then Stage 2 on the prototype plaza | `packages/client`, `tools/`, later `packages/sim` |
| B. Campus pipeline | 6 map fetch and projection, 7 LiDAR heights, 8 footprint facades, 9 Engineering Mall bake | `packages/map-tools`, `data/` |

Work package numbers are from section 8 of the plan.

## Rules for subagents, to keep usage low

- **One work package per subagent,** in its own git worktree and branch. The main session reviews the diff and merges.
- **Cheapest model that can do it.** Sonnet for ports and pipelines (packages 2, 3, 5, 6, 7). The session's own model only for the two hard ones: the effects chain (4) and the footprint facade generator (8). Haiku for lookups.
- **Briefs point at files, they do not paste them.** Each brief names the work package, the files to read (with line ranges where known), the deliverable, and the check that proves it.
- **Reports are ten lines or fewer:** what was built, the command that proves it, its output, anything logged to `docs/known-gaps.md`.
- **Every package ends with its test or benchmark passing.** No report of success without the command output.
- **Minor issues are logged, not fixed** (`docs/known-gaps.md`).
- No fan-out beyond two at a time without asking.

## Known line ranges, to save reading

- `reference/fidelity-test.html`: noise and canvas textures 62 to 167, batching helper 168 to 310, scene 311 to 477, rifle 478 to 562, effects chain 563 to 631, renderer and resize 632 to 645, player 646 to 689, loop 690 on. It loads Three.js r128; colours need the care described in `docs/fidelity-findings.md`.
- `reference/saltline/sky-shadows-post.txt`: the post passes begin at the line containing `SALTLINE_POST`; the function that wires them, with all tuning values, and the renderer setup are on the last line.
