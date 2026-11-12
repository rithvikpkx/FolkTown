# Pilot free data (WALC, Bell Tower, Mall strip)

Local frame: x east, z south, origin Bell Tower (40.42729, -86.91407). Pilot box x -40..180, z -190..40 (WALC at (70,-2) and the fountain at (24,-151) both inside; fountain confirmed in the ortho).
Reproduce: `pnpm map:pilot-ortho`, `pnpm map:pilot-roofs` (LiDAR tiles cached under gitignored `data/raw/lidar/`, raw ortho in `data/raw/ortho/`).

## 1. Orthophoto
- Source: Indiana 2023 6-inch, layer `Indiana_2023_SPW_06in`, state ImageServer (see docs/assets.md). CC0, no login. Anonymous `exportImage`; no tile download was needed.
- Output: `packages/saltline/public/campus/pilot/ortho.jpg` (3150 x 3281, native 7.62 cm/px, so no downsizing was required) + `ortho.json` (bounds x -50..190, z -200..50 m = box + 10 m margin, metres per pixel 0.0762). KTX2 conversion not done.
- Georeference shortcut: exported in UTM 16N and treated as the local frame; ignores 0.056 deg grid convergence and 0.9996 scale (about 0.2 m error at the far corner). Alignment verified by eye only (fountain and Bell Tower fall where expected); not measured against surveyed points.
- Limits: leaf-off spring capture (bare trees), long shadows baked in, roofs are shown from directly above, tall buildings lean slightly (not true-ortho), predates 3rd & West.
- Screenshots: `docs/img/pilot-ortho-ground.png`, `docs/img/pilot-roofs-3d.png` via `packages/saltline/demo-pilot.html` (serve repo root, three.js from unpkg).

## 2. Roofs (`data/pilot/roofs.json`)
- Source: USGS 3DEP 2017 QL2, 5.0 pts/m2 over the area (classes: only 1 unclassified, 2 ground, 7 noise; no building class, so vegetation inside a footprint is not separable).
- 12 OSM footprints (>25 m2) intersect the box; all 12 have output. Per building: ground elevation, eave/ridge/max height above bare earth, up to 3 RANSAC planes (h = a x + b z + c, 25 cm inlier), 1 m max-height raster, parapet (flat roofs), plant boxes. 9 plant boxes total.
- Honest quality: heights from the raster are good to about +-0.3 m. `eaveH` is the median of rim points above 3 m, so it is only indicative on complex or stepped roofs (Elliott 4.0 m and Bell Tower 26.7 m are unreliable). `cellCoverage` is under 0.6 for Elliott, DSAI, PSYC and MSEE (dark roofs, holes, courtyards in the loose OSM footprints). Plane fits on those and pitched roofs (DSAI, BHEE) are rough. ME's parapet and plane results were clamped when implausible (>2.5 m reads as 0). Plant boxes are bounding boxes of >1.5 m protrusions, not real shapes. Not hand-corrected.

## 3. Purdue ArcGIS layer vs OSM footprints
- 31 Purdue polygons touch the box; 19 are demolished (RazeYear set) historical footprints, only 12 current ones map to the 12 OSM footprints (IoU 0.85 to 0.97, so footprints agree; no geometric corrections worth making). Unmatched OSM: way/1033674920, 66 m2, unnamed, no Purdue counterpart.
- What it adds: build years (e.g. WALC 2017, Potter 1977, PSYC 1983, MSEE 1988, Hovde 1937, Elliott 1940, Bell Tower 1996), official names (WALC = "Thomas S. and Harvey D. Wilmeth Active Learning Center"), the history of replaced buildings (old Mechanical/Electrical Engineering, Heating and Power Plant, Pharmacy, Locomotive Museum on the site). No heights. Purdue's DSAI is listed as "Data Science" built 1990 (the AI hall name is OSM's). Note the layer's `BUILTYear`/`RazeYear` use 9999 for "standing" and unreliable 1899 occupied-year placeholders.

## Gaps / guessed
- No facade imagery, no wall data, no tree heights separable from roofs. Roof materials/colours are not extracted (read from the ortho if wanted). Nothing was invented; thresholds above (3 m, 1.5 m, 2.5 m, 0.25 m) are heuristics.
