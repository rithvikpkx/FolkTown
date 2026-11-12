# FolkTown tech stack

The stack is fixed as below. Free-tier figures were read from each provider's own pages on 12 November 2026; they change, so re-read them before depending on one.

## Decided

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript everywhere | One language across client, match rules, server and tools |
| Rendering | Three.js with its WebGL renderer | The prototype's whole pipeline is proven on it. The newer WebGPU renderer uses a different material system and is not needed |
| Client build | Vite | Fast, minimal configuration |
| Tests | Vitest | Same toolchain as Vite; runs the match rules with no browser |
| Monorepo | pnpm workspaces | `shared`, `sim`, `client`, `server`, `map-tools` as separate packages |
| Lint and format | Biome | One tool instead of two |
| Physics | None to start: the player is a circle with a height range, collided against building footprint edges, written in `sim` | Buildings are extruded footprints, so this is exact for angled walls and courtyards. Add an engine only when something needs it |
| Game server | Node with the `ws` library, running the same `sim` package | Plain Node runs on every host listed below |
| Protocol | JSON behind a codec interface, swapped for a binary format when profiling says so | Easy to debug first |
| Game server hosting | Fly.io, one small always-on machine | See below. Not needed until Stage 3 |
| Player data, leaderboards, avatars | A SQLite file and an image folder on a volume attached to the same Fly.io machine | No separate database service. Needed from Stage 4 |
| Identity | A typed name plus a random device token kept in the browser | No login provider to run. A proper login can be added later if it is ever needed |
| Site hosting | Vercel (Hobby) | Static files only |
| Addresses | `folktown.rithvik.si` for the site, `play.folktown.rithvik.si` for the game server | Two DNS records on the existing domain |
| Map tools | TypeScript scripts, plus one Python step for LiDAR heights | LiDAR rasters are far easier to read with Python's geospatial libraries |
| Benchmark and screenshots | Headless Chrome driven over its debugging protocol | Already working in `reference/` |

Pin exact versions of everything when the repository is created, using the current stable releases at that time.

Nothing with a bill attached is needed for Stages 0 to 2. Single-player runs entirely in the browser.

## Expected cost

| When | Monthly cost |
|---|---|
| Stages 0 to 2 | $0 |
| Stage 3 onward | About $2.34: $2.19 for the machine plus $0.15 for a 1 GB volume. Fly.io currently waives bills under $5, so this may be $0 in practice |
| If the server needs more memory | $3.69 for 512 MB, $6.70 for 1 GB |

Small paid services are acceptable where they can be reused for other personal projects. Fly.io fits: each project is its own app on the same account, a machine can be set to stop when idle (a stopped machine is billed only for its disk at $0.15 per GB a month), and the under-$5 waiver applies to the whole account's bill.

## Hosting tiers, as checked

### Site: Vercel Hobby

- Free. 100 GB data transfer and 1,000,000 requests a month, 100 deployments a day.
- **Personal, non-commercial use only.** Fine for this project as it stands; it would need the paid plan if the game ever earned money.
- Cannot hold open game connections. It serves the site and the baked campus files, nothing else.

### Game server: Fly.io

- Smallest always-on machine: shared CPU with 256 MB for $2.19 a month. 512 MB is $3.69, 1 GB is $6.70.
- Volumes: $0.15 per GB a month. Volume snapshots: first 10 GB free.
- Outbound data: $0.02 per GB in North America. Shared IPv4 and the first 10 single-hostname certificates are free; a dedicated IPv4 is $2 a month and is not needed.
- No free tier. A 7-day trial with $1 of credit, then a card is required. Bills under $5 a month are currently waived; treat that as a bonus, not a guarantee.
- A single machine with a single volume has no redundancy. Snapshots cover the data; a few minutes of downtime during a restart is acceptable for this project.

Alternatives looked at:

| Host | Cost | Always on? | Why not first choice |
|---|---|---|---|
| Render, free web service | $0, no card | No. Sleeps after 15 minutes idle; about a minute to wake | The wake-up delay, and Render says not to use it for production. A good zero-cost fallback: the server is plain Node, so moving is a configuration change |
| Cloudflare Durable Objects, free plan | $0 | Yes | 100,000 requests a day with 20 incoming WebSocket messages counted as one: about 104 minutes of a full 16-player match a day. Different runtime from Node |
| Railway | $5 a month on Hobby | Yes | Costs more than Fly.io for the same job |
| Koyeb | No free compute tier found | | |
| Oracle Cloud Always Free | Could not be verified | | Unverified |

### Player data: why not Supabase

- The free plan allows two active projects, and both slots are already in use.
- Supabase Pro is $25 a month, which includes one project; each further project is about $10 a month. That is far more than this project's data needs justify.
- A paused free project does not count toward the limit, so pausing an unused one would free a slot at no cost. Free projects also pause themselves after a week without activity.
- The data here is small and simple: player records, leaderboard rows and face textures of roughly 10 KB each. A SQLite file on the game server's own volume holds all of it with nothing else to run.
- If avatars ever outgrow the volume, Cloudflare R2 stores 10 GB free with no charge for downloads.

## Not chosen

- **WebGPU renderer:** not needed for the target look, and it would mean re-proving the prototype.
- **A physics engine from day one:** unnecessary for a static world of boxes.
- **Peer-to-peer networking:** campus networks often block it, and it is a second networking layer to maintain.
- **Supabase:** both free project slots are in use and the paid plan starts at $25 a month.
- **A game engine (Unity, Godot, PlayCanvas editor):** the project's premise is everything generated in code, in the browser.

## Sources

- https://render.com/docs/free
- https://docs.fly.io/about/pricing
- https://developers.cloudflare.com/durable-objects/platform/pricing/
- https://docs.railway.com/reference/pricing/plans
- https://www.koyeb.com/pricing
- https://vercel.com/docs/plans/hobby
- https://supabase.com/pricing
- https://developers.cloudflare.com/r2/pricing/
