# FolkTown refinements backlog

Known problems that are deliberately deferred. None of them blocks the main implementation. Revisit each at the stage named, and all of them before the game is spread publicly.

| # | Item | Why it matters | Revisit |
|---|---|---|---|
| 1 | **Selfie avatar moderation and privacy** | Strangers can upload offensive images or other people's faces. Face photos are personal data: they need private storage, a delete button, and a decision about under-18s | Stage 4, before avatars ship |
| 2 | **Typed-name abuse** | Stage 3 ships with a light profanity filter only. Anything stronger (reporting, bans, impersonation) is deferred | After Stage 3 |
| 3 | **Lookalike quest givers** | Quest givers are unnamed but may resemble real Purdue figures. Leaving the name off does not remove the risk: Indiana's right-of-publicity law covers likeness as well as name. A non-commercial project where they are never harmed lowers the risk a lot but does not make it zero. Get a second opinion, and be ready to make the characters more clearly fictional | Before Stage 6 ships |
| 4 | **Purdue marks** | No logos, mascot, official colours-as-branding or anything implying endorsement, in the game or in anything used to promote it | Before any promotion |
| 5 | **Server abuse** | A public server needs connection and message rate limits | Stage 3 |
| 6 | **Server capacity** | One 256 MB machine holds a handful of rooms. Start with a room cap and a "servers full" message; size up if the game spreads | Stage 3, then when rooms fill |
| 7 | **Counting players** | The project's goal is a user number, so it needs a counter. Page analytics from the first public deploy; unique device tokens once the server exists | First public deploy |
| 8 | **Map data credit and licence** | Credit OpenStreetMap contributors on screen and in the README. Baked map data derived from it is published under the Open Database License | Stage 1, when map data lands |
| 9 | **Hosting terms** | Vercel's free plan is for non-commercial use. Fine while the game earns nothing; move to a paid plan or another host if that ever changes | Only if money is involved |

## Google data export (tabled 12 November 2026)

Built, not run. See `docs/google-export.md`: 3D tiles for the Mall area, converted into the campus frame, plus Street View photos around target buildings for facade references. Needs the owner's Google Cloud key and billing. Revisit for higher-quality mapping after the MVP look is settled.
