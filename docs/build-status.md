# FolkTown build status

The handoff file. Update it at the end of every work package, so a session that hits a usage limit or loses its transcript loses nothing.

## Where things stand (12 November 2026)

- Planning is finished. All decisions are in `docs/decisions.md`; the plan is `docs/implementation-plan.md`.
- `main` holds the docs (fast-forwarded from `docs/design-import`).
- **Work package 1 is done** on branch `wp1-skeleton`: pnpm workspace with `packages/client` and `tools/` (empty until WP5); `client` opens to a blank Three.js scene.
- Pinned: pnpm 12.18.0, TypeScript 7.0.2, Vite 8.3.8, Vitest 5.1.0, Biome 2.6.7, Three.js 0.187.0.
- Commands from the root: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint` (Biome plus `tsc` per package).
- Tooling notes: the shell lazy-loads nvm, so in scripts call pnpm as `npx -y pnpm@12.18.0`. Biome skips `*.md` because it rewrites the doc tables. pnpm 12 refuses very new releases; it listed Biome in `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`.

## Branches and deploys

- `mvp` is the dev branch. Each work package is a branch off `mvp`, merged back by the main session. **Nothing merges into `main`** until the owner has played and approved the MVP.
- Deploy: `npx -y vercel@latest` (logged in) from the built client. `folktown.rithvik.si` needs a CNAME at the domain's DNS host (Hostinger), which only the owner can add; until then use the `*.vercel.app` link.
- This machine is the baseline (MacBook Air M1, 16 GB), so benchmarks run here.
- LiDAR step: Python through `uv run --with rasterio` (no system GDAL needed).

## Next

1. WP1 merged to `main` (PR #1); `mvp` branched from it.
2. Two tracks in parallel, one Sonnet subagent each, at most two running at once.

| Track | Packages, in order | Touches |
|---|---|---|
| A. Rendering and gameplay | 5 harness, 2 batching helper, 4 effects chain, 3 GPU textures, then Stage 2 on the prototype plaza | `packages/client`, `tools/`, later `packages/sim` |
| B. Campus pipeline | 6 map fetch and projection, 7 LiDAR heights, 8 footprint facades, 9 Engineering Mall bake | `packages/map-tools`, `data/` |

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
