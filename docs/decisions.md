# FolkTown decisions

Current decisions only. Where a later choice replaced an earlier one, only the later one is listed.

## Product

| Topic | Decision |
|---|---|
| Core experience | A first-person shooter on the Purdue West Lafayette campus, in a browser tab |
| Top priority | Walking around should feel as close as possible to the real campus |
| Order | Single-player first: a real campus slice with guns and bots. Multiplayer is added after |
| First multiplayer mode | Deathmatch: click a link, type a name, play. Free-for-all and teams |
| Match size | Up to 16 humans online. Single-player with up to 128 bots |
| Map | The whole campus is mapped. Each match is played in a Zone chosen by a pre-match vote |
| First Zone | Engineering Mall, built to full fidelity before any other |
| Combat theme | Realistic guns. The enemies are bots and unnamed military NPCs, who shoot back. An unnamed Campus Defence force fights them and cannot be damaged by the player. No shootable students or civilians |
| Quest givers | Unnamed characters who may resemble real Purdue figures. Never named, never shot or harmed |
| Release | Public and promoted around campus. Non-commercial: no ads, payments or donations. Success is measured in player count |
| Landmarks | Buildings with a clear, distinct purpose that everyone on campus recognises. First picks: WALC (the study building), the Bechtel Innovation Design Center (makerspace, with robots), and the nuclear reactor. More are chosen by going through `docs/campus-building-list.md` |
| Interiors | Every building is eventually enterable. Landmarks get themed interiors with gameplay effects. Ordinary buildings get interiors assembled from a kit of rooms, later |
| Destruction | None. Cut in favour of visual fidelity |
| Avatars | A photo cropped in the browser onto the character's head, tied to the player's device token |
| Later features | Vehicles, living campus (a running battle between Campus Defence and military NPCs, traffic, quests, sandbox mode), search and destroy, battle royale, planes |

## Look and performance

| Topic | Decision |
|---|---|
| Baseline machine | MacBook Air M1, 16 GB. 45 fps floor |
| Resolution | A pixel budget of about 1.2 million pixels by default (1× on the baseline machine). The render scale drops automatically when frames run long |
| Assets | Everything generated in code. No model files, image files or paid 3D services |
| Fidelity target | Textured surfaces with depth, real-time shadows, ambient occlusion, bloom, film tone mapping; proven by the prototype in `reference/` |
| Visual reference | Saltline, a browser shooter built all in code. FolkTown should feel like it graphically. Its owner has given permission to reuse its code and shaders (as stated by Rithvik, 12 November 2026); the parts in use are in `reference/saltline/`. See `docs/saltline-findings.md` |
| Rendering pipeline | Saltline's: eye adaptation, wide bloom, ambient-only occlusion, contact-hardening shadows, ray-marched haze with light shafts, GPU-generated textures, and a start-up self test with fallbacks |
| Time of day | Late afternoon, about 5 pm: a low, warm sun with long soft shadows and a soft haze, leaning toward Saltline's mood. Light shafts and a mild lens flare are back, from Saltline's chain |
| Weather | Seasonal sky only. No rain |
| Water | No dynamic water and no wet-ground reflections. Static water at fountains and the pond in front of WALC |
| Glare and reflections | Kept subtle |
| Rifle and cars | Prototype quality is acceptable for now |

## Campus data

| Topic | Decision |
|---|---|
| Base data | OpenStreetMap footprints, roads and paths |
| Heights | Indiana statewide LiDAR (only 4% of campus buildings have a height or floor count in the map data), then floor counts, then defaults |
| Coverage standard | High quality across the whole campus, not just the first Zone |
| Facade accuracy | Own photos, turned into a per-building style sheet |
| Google Earth and similar | Reference only; nothing is extracted |

## Technical

| Topic | Decision |
|---|---|
| Stack | TypeScript, Three.js (WebGL renderer), Vite, Vitest, pnpm workspaces, Biome. Details in `docs/tech-stack.md` |
| Collision | The player is a circle with a height range, collided against building footprint edges. Not boxes |
| Packages | Created when they first get code, not up front. Stage 0 has `client` and `tools/` only |
| Game server | One authoritative Node WebSocket server on Fly.io's smallest always-on machine. Hosted server only: no peer-to-peer, no LAN mode |
| Site | Vercel, at `folktown.rithvik.si`. Game server at `play.folktown.rithvik.si` |
| Player data | SQLite and avatar images on a volume attached to the game server. No Supabase |
| Identity | A typed name plus a device token kept in the browser. No login provider |
| Licence | Source visible, all rights reserved; reuse by permission only (`LICENSE`). Map data derived from OpenStreetMap is under the Open Database License |
| Deferred problems | Moderation, privacy, likeness and capacity are tracked in `docs/refinements-backlog.md` and handled after the main implementation |
| Cost | $0 until multiplayer, then about $2 to $4 a month. Small paid services are fine when they can be reused for other personal projects |

## Process

| Topic | Decision |
|---|---|
| Start | One person builds the first working version: real campus slice, guns, basic physics |
| Team | Four people later, one area each: architecture and server; client gameplay; campus pipeline; bots, NPCs and vehicles |
| Specs | Contracts as code: types, signatures and failing tests written by a top-tier model; cheaper models make them pass |
| Build order | Playable stages. Each is runnable and benchmarked before the next starts |
| Velocity over polish | Development speed and getting the game to players come first. The goal is something to play that looks good. Minor polish and obscure bugs that do not affect core gameplay are logged in `docs/known-gaps.md` and skipped |
| `docs/` and `reference/` | Design and reference only. The game's code lives in the same repository, outside these two folders |
