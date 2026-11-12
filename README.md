# FolkTown

A Purdue-themed first-person shooter in the browser, with the West Lafayette campus as the map.

`docs/` and `reference/` are the design and reference material. The game is built in this repository alongside them. Run `pnpm install`, then `pnpm dev`, `pnpm test`, `pnpm lint` or `pnpm build`.

## Read in this order

1. [`docs/implementation-plan.md`](docs/implementation-plan.md): what is being built and how, stage by stage.
2. [`docs/decisions.md`](docs/decisions.md): the decisions behind it.
3. [`docs/tech-stack.md`](docs/tech-stack.md): the stack and hosting tiers.
4. [`docs/campus-data-research.md`](docs/campus-data-research.md) and [`docs/campus-building-list.md`](docs/campus-building-list.md): the map data.
5. [`docs/fidelity-findings.md`](docs/fidelity-findings.md): what the rendering prototype proved.

## Try the prototype

Open [`reference/fidelity-test.html`](reference/fidelity-test.html) in Chrome. It needs an internet connection the first time to load Three.js.

- `W A S D` move, `Shift` sprint, `Space` jump, click to fire, `Esc` to release the mouse.
- `R` resolution, `H` shadows, `P` effects, `T` time of day.

To benchmark it: `node reference/bench.js 2`

Map data used by the game will come from OpenStreetMap contributors.
