# Google data export (owner-run)

Local tools that pull data around the MVP area (Purdue Mall, 500 x 500 m: x -200..300, z -350..150 from the Bell Tower, see `MVP_BBOX` in `packages/map-tools/src/tiles/math.ts`) through Google's official APIs, using the owner's own key. Nothing here runs in CI and nothing is committed: all output is gitignored. Status of the data: `needs-clearance` (`docs/assets.md`).

## One-time setup

1. In Google Cloud Console, create or pick a project and attach billing.
2. APIs and Services, Library: enable **Map Tiles API** and (optional) **Street View Static API**.
3. Credentials, Create credentials, API key. Restrict it to those two APIs.
4. Put it in `.env.local` at the repo root (gitignored via `.env*`), or export it in the shell:
   `GOOGLE_MAPS_API_KEY=your-key`
   The tools never print the key; URLs in errors and manifests have it replaced by `REDACTED`.

## Commands

| Command | What it does |
|---|---|
| `pnpm map:tiles --dry-run` | Walks the tileset JSON only (a few requests), prints how many `.glb` tiles it would fetch and the request total. Do this first |
| `pnpm map:tiles` | Downloads the selected tiles to `data/raw/tiles/tiles/*.glb` and writes `data/raw/tiles/manifest.json` |
| `pnpm map:tiles:convert` | Converts to the campus frame and writes `data/google/` |
| `pnpm map:streetview --dry-run` | Free metadata calls only: coverage and image count and estimated cost |
| `pnpm map:streetview --yes` | Downloads the images (costs money) |

Flags:

- `map:tiles`: `--detail coarse|fine` (default fine = descend to the finest tiles; coarse stops at geometricError 20 m), `--error <metres>` (explicit threshold, wins over `--detail`), `--max-requests <n>` (default 3000, aborts before downloading if the plan exceeds it), `--dry-run`, `--out <dir>`, `--base <url>` (test against a mock server). Concurrency is fixed at 4; failed requests retry with exponential backoff; existing files are skipped, so re-running resumes.
- `--zone mall-union` (both `map:tiles` and `map:tiles:convert`): MVP box plus Memorial Mall and the Purdue Student Union (x -200..320, z -350..365; `ZONE_BBOX` in `math.ts`). Default stays `MVP_BBOX`. Dry run: 763 glb tiles, 1,544 requests. Street View targets now include `memorial-union` and `memorial-mall`. Sample renders: `docs/img/google/`.
- `map:tiles:convert`: `--raw <dir>`, `--out <dir>`, `--ground <metres>` (override the automatic ground level).
- `map:streetview`: `--yes` (required to download), `--max-images <n>` (default 300), `--size 640x640`, `--dry-run`, `--out <dir>`.

## Expected requests and cost (estimates, check Google's current pricing page)

- Map Tiles API is billed per `root.json` request (one per run, plus one per resume), not per tile; each tile is still a request counted against `--max-requests` and quota. A fine-detail 500 x 500 m area is expected to be a few hundred to a couple of thousand `.glb` requests; the dry run gives the real number. Cost is therefore roughly one root request per run.
- Street View Static: metadata is free; images are about USD 7 per 1000 (about USD 2.10 for the 300 default). 12 buildings x 4 positions x 4 headings = 192 candidates, fewer where there is no coverage.

## Output layout

```
data/raw/tiles/manifest.json     tile URIs (no key), bounding volumes, geometricError, bytes, errors,
                                 request count, attribution strings from the glb copyright fields
data/raw/tiles/tiles/<id>.glb    raw tiles (ECEF, Draco/meshopt compressed)
data/google/mall-area.glb        all tiles merged, decompressed, campus frame (x east, y up, z south)
data/google/tiles/<id>.glb       the same, per tile
data/google/report.json          triangles and bytes per tile, ground shift, alignment offset, attributions
data/google/mall-area-topdown.png  top-down height raster (1 m cells), campus.json footprints tinted red
data/raw/streetview/<building>/*.jpg + manifest.json   position, heading, pitch, pano id, date, copyright
```

The campus frame matches `makeProjector` (origin Bell Tower, lat 40.42729, lon -86.91407; x east, z south). ECEF to local is a true tangent-plane transform (the projector is a flat-earth approximation; the two differ by centimetres over 500 m). Ground is set so the 5th percentile of the surface sits at y = 0 (Google heights are ellipsoidal); `--ground` overrides it. KTX2 textures, if present, are passed through unchanged.

## Viewing the result

Open `data/google/mall-area.glb` in any glTF viewer (https://gltf-viewer.donmccurdy.com or Blender, File, Import, glTF). Look at `mall-area-topdown.png` for the footprint overlay. `report.json` `alignment` gives how far the Google geometry is from `data/campus.json` (`google = campus + (dx, dz)` metres, rough: it compares cells taller than 8 m, so trees add noise, and reports the overlap score before and after).

## What to send back to the orchestrator

- The `pnpm map:tiles --dry-run` output and, after the real run, the tail of the log (request count, bytes, errors).
- `data/google/report.json` and `mall-area-topdown.png` (small).
- `data/raw/tiles/manifest.json` attributions list.
- A screenshot of the glb in a viewer.
- Do not send the key, the raw tiles, or the `.env.local`.
