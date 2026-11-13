# Layout report: walkable region (v6-layout)

Region x -200..320, z -350..365 from the Bell Tower. Three independent sources against the OSM footprints baked into `data/zones/mall-union.json` (`pnpm map:bake-region`). Audit script: `packages/map-tools/src/layout-audit.py`; corrections: `packages/map-tools/data/footprint-fixes.json` (read by `bake-region.py`, so they survive re-bakes). Overlay: `docs/img/v6-layout-overlay.jpg` (grey = Google mesh height, red = baked footprints, blue = CampusMapper outlines, green = courtyard holes, orange = OSM paths, yellow = Street View panoramas).

## Sources and registration

- **CampusMapper** (illustrated 2D plan; used as a cross-check only, no artwork copied, `needs-clearance` in `docs/assets.md`). It is not isometric in practice: the building layer is a plan view. Fitting 35 buildings whose OSM name ends in the Purdue code (`BELLT` = Elliott ..., id = `B` + code) gives a pure scale of **2.0017 px/m**, rotation **-0.035 deg**, x east and y south like our frame, residual **0.96 m RMS** (34 inliers; Wang Hall is the one outlier, 5.5 m, because OSM and CampusMapper draw its wings differently). Transform: `cm_px = [2.0017 x - 0.0013 z + 4113.3, -0.0002 x + 2.0024 z + 3109.5]`.
- **Google 3D tiles** (`data/google/mall-area.glb`): 6M surface samples rasterised to a 1 m height grid, ground estimated from cells outside every footprint (low percentile, smoothed), building height = 90th percentile of the above-ground height inside the eroded footprint. The glb is already in our frame (report.json alignment dx = dz = 0; the per-building search below confirms: median best shift 0-1 m).
- **Street View** (25 unique panoramas in `data/raw/streetview/manifest.json`) against OSM highways, see the last section.

## Match table (OSM footprint vs CampusMapper vs Google)

`dCM` = distance between OSM and CampusMapper centroids (m); `IoU` = footprint overlap with the CampusMapper outline; `shift` = best 1 m offset (x, z) of the OSM outline onto the Google tall-cell mask, searched +-8 m (an 8 means unresolved: no tall mass there); `cover` = share of the OSM outline that is >5 m above ground in the mesh; heights in m: LiDAR (baked before) vs Google p90. Rows with a change are in bold.

| OSM id | Code | Official name (CampusMapper) | dCM | IoU | shift | cover | LiDAR h | Google h | Change |
|---|---|---|---|---|---|---|---|---|---|
| w117147171 | AR | Armory | 0.3 | 0.98 | -1,0 | 0.99 | 18 | 17.2 |  |
| w301837711 | BELL | Bell Tower | 0.3 | 0.37 | -8,-6 | 0.95 | 45.9 | 46.3 |  |
| **w158307860** | BHEE | Max W & Maileen Brown Family Hall | 0.9 | 0.9 | 1,0 | 0.97 | 18.6 | 18.5 | 1 courtyard hole(s) |
| w117147176 | BRNG | Steven C. Beering Hall of Liberal Arts & Education | 0.1 | 0.97 | 0,-1 | 1.0 | 30.5 | 31.3 |  |
| w117146480 | BRWN | Herbert C. Brown Laboratory of Chemistry | 0.7 | 0.94 | 0,0 | 0.98 | 22 | 23.6 |  |
| **w866802210** | CHAS | Chaney-Hale Hall of Science | 1.4 | 0.87 | 3,-1 | 0.99 | 13.1 | 22.7 | height 13.1 -> 22.7 |
| w309492283 | CL50 | Class of 1950 Lecture Hall | 0.9 | 0.95 | -1,0 | 0.96 | 10.5 | 10.3 |  |
| w117146492 | DSAI | Hall of Data Science and AI | 0.9 | 0.91 | 0,0 | 0.99 | 16.2 | 16.6 |  |
| **w1383852533** | DUDL | Dudley Hall | 0.7 | 0.86 | 1,-1 | 0.99 | 10.9 | 24.2 | height 10.9 -> 24.2; outline 2466 -> 2587 m2 |
| w74151922 | ELLT | Edward C. Elliott Hall of Music | 0.3 | 0.94 | -2,1 | 0.95 | 23.8 | 26.8 |  |
| w117146497 | FRNY | Forney Hall of Chemical Engineering | 0.7 | 0.96 | 0,1 | 0.93 | 22.9 | 22.7 |  |
| w117146493 | GRIS | Grissom Hall | 0.2 | 0.95 | 8,1 | 0.85 | 19.1 | 18.9 |  |
| w117147168 | HAAS | Felix Haas Hall | 0.2 | 0.97 | -1,-1 | 1.0 | 16 | 17.8 |  |
| w117146495 | HAMP | Delon and Elizabeth Hampton Hall of Civil Engineering | 0.4 | 0.96 | 0,0 | 1.0 | 21.2 | 22.2 |  |
| w158307900 | HIKS | John W. Hicks Undergraduate Library | 0.1 | 0.92 | -8,-8 | 0.02 | 4.9 | 4.8 |  |
| w75498146 | HOVD | Frederick L. Hovde Hall of Administration | 0.6 | 0.94 | 0,0 | 1.0 | 18.3 | 18.3 |  |
| w117146488 | JNSN | Helen R. Johnson Hall of Nursing | 0.4 | 0.95 | -1,0 | 0.99 | 12 | 8.3 |  |
| w117146487 | KNOY | Maurice G. Knoy Hall of Technology | 2.0 | 0.9 | 0,0 | 1.0 | 20.1 | 20.1 |  |
| **w1383852532** | LMBS | Lambertus Hall | 2.5 | 0.87 | -1,0 | 0.99 | 9.6 | 23.4 | height 9.6 -> 23.4 |
| w117147177 | MATH | Mathematical Sciences Building | 0.5 | 0.93 | -1,0 | 0.89 | 37.7 | 40.4 |  |
| w158307862 | ME | Mechanical Engineering Building | 0.3 | 0.94 | 1,-1 | 0.98 | 20.5 | 20.7 |  |
| w158307858 | MSEE | Materials and Electrical Engineering | 0.3 | 0.98 | 0,0 | 1.0 | 19.4 | 19.4 |  |
| w117147172 | MTHW | Matthews Hall | 0.4 | 0.95 | 0,0 | 1.0 | 18.1 | 19.0 |  |
| **w283275025** | PGNW | Northwestern Avenue Parking Garage | 1.6 | 0.95 | 1,1 | 0.97 | 15.9 | 15.4 | removed: is the union of way/1418954764, way/1418955365, which carry the heights |
| w74340895 | PHYS | Physics Building | 0.6 | 0.95 | 0,-1 | 0.95 | 17.9 | 19.2 |  |
| **w117146490** | PMU | Purdue Memorial Union | 0.7 | 0.93 | 0,-1 | 0.93 | 14 | 14.2 | 3 courtyard hole(s) |
| **w117146483** | PMUC | Purdue Memorial Union Club | 4.4 | 0.85 | 1,0 | 0.96 | 18.7 | 18.7 | outline 2372 -> 2546 m2 |
| w117147170 | POTR | A. A. Potter Engineering Center | 2.0 | 0.87 | 1,0 | 0.98 | 18.4 | 18.4 |  |
| w309492284 | PRCE | Peirce Hall | 0.1 | 0.96 | 0,0 | 0.95 | 11.4 | 10.9 |  |
| w117147173 | PSYC | Psychological Sciences Building | 0.4 | 0.94 | 0,0 | 0.74 | 17.5 | 17.4 |  |
| w117146486 | PUSH | Purdue University Student Health Center | 0.7 | 0.92 | 0,0 | 0.99 | 15.9 | 16.4 |  |
| w932253994 | RAIL | American Railway Building | 0.3 | 0.93 | 0,0 | 1.0 | 9.7 | 9.5 |  |
| w117146482 | RHPH | Robert E. Heine Pharmacy Building | 2.4 | 0.92 | 0,0 | 1.0 | 21.1 | 21.7 |  |
| w117147167 | SCHM | Helen B. Schleman Hall | 0.3 | 0.93 | 0,0 | 0.99 | 18.4 | 18.8 |  |
| w117146484 | STEW | Stewart Center | 1.1 | 0.96 | 1,-1 | 0.99 | 16.4 | 16.1 |  |
| w117147178 | STON | Winthrop E. Stone Hall | 0.2 | 0.94 | 0,-1 | 0.91 | 14.4 | 15.2 |  |
| w158307901 | UNIV | University Hall | 0.2 | 0.93 | 0,0 | 0.98 | 22.2 | 22.2 |  |
| w508846031 | WALC | Thomas S. and Harvey D. Wilmeth Active Learning Center | 0.9 | 0.92 | 0,0 | 1.0 | 21 | 21.3 |  |
| w301932787 | WANG | Seng-Liang Wang Hall | 5.5 | 0.83 | 1,2 | 0.97 | 23.9 | 24.4 |  |
| **w117146489** | WTHR | Richard Benbridge Wetherill Lab of Chemistry | 0.6 | 0.97 | 0,0 | 0.95 | 19.5 | 20.0 | 2 courtyard hole(s) |
| w301932783 |  | (unnamed) |  |  | 1,0 | 0.93 | 7.6 | 8.5 |  |
| w301932785 |  | (unnamed) |  |  | 1,0 | 0.96 | 8.2 | 8.9 |  |
| w301932786 |  | (unnamed) |  |  | 1,0 | 0.9 | 11.1 | 11.9 |  |
| w301932790 |  | (unnamed) |  |  | 1,0 | 0.97 | 10 | 10.8 |  |
| w607137011 |  | (unnamed) |  |  | -1,-4 | 0.77 | 10.7 | 8.2 |  |
| **w607137013** |  | (unnamed) |  |  | 5,-6 | 0.51 | 12.7 | 6.7 | height 12.7 -> 6.7 |
| w607137015 |  | (unnamed) |  |  | 8,-8 | 0.46 | 6.6 | 5.4 |  |
| **w860822250** |  | (unnamed) |  |  | 0,-1 | 0.99 | 10.5 | 23.9 | removed: is the union of way/1383852532, way/1383852533, which carry the heights |
| w1033674918 |  | (unnamed) |  |  | -7,-8 | 1.0 | 15.6 | 10.8 |  |
| w1033674919 |  | (unnamed) |  |  | -8,-8 | 1.0 | 16 | 10.5 |  |
| w1033674920 |  | (unnamed) |  |  | -8,6 | 1.0 | 13.5 | 7.3 |  |
| w1149668161 |  | (unnamed) |  |  | 6,8 | 0.0 | 3.8 | 2.2 |  |
| w1418750210 |  | (unnamed) |  |  | -8,-8 | 1.0 | 25.5 | 25.3 |  |
| w1418954764 |  | (unnamed) |  |  | 1,0 | 1.0 | 16.5 | 15.7 |  |
| **w1418955365** |  | (unnamed) |  |  | 1,0 | 0.92 | 13.9 | 13.1 | 1 courtyard hole(s) |
| **w1418958953** |  | (unnamed) |  |  | 5,-8 | 0.16 | 15.5 | 4.3 | removed: sliver overlapping a sibling, no tall mass in the Google mesh |
| w1419291577 |  | (unnamed) |  |  | 2,-8 | 0.71 | 14.6 | 14.3 |  |
| w1419291578 |  | (unnamed) |  |  | -8,-8 | 1.0 | 15.8 | 15.7 |  |
| **w1103303762** |  | Purdue Graduate Student Center |  |  | 5,-8 | 0.16 | 15.5 | 4.3 | removed: lies inside way/1418958953 (building part / stacked copy): massing doubled |
| w301932784 |  | University Lutheran Church |  |  | 1,0 | 0.98 | 15.9 | 16.1 |  |

OSM vs CampusMapper centroid residual over 40 matched buildings: median 0.6 m, p90 2.4 m, max 5.5 m. OSM vs Google best shift for the 51 well-covered footprints: median 1.0 m, max 11.3 m. All three sources agree on position to about 1 m; the layout problems were not offsets but duplicates, a missing building, wrong heights and unrepresented courtyards.

## What changed (all in `footprint-fixes.json`, applied by `bake-region.py`)

- **Names and codes**: every matched collider now carries the official CampusMapper `name` and Purdue building `code` (code = CampusMapper id without the leading B, e.g. ELLT); consumers can ignore the extra `code` field. 41 colliders coded.
- **Duplicates removed** (they doubled the massing, z-fighting roofs and walls):
  - `way/1103303762`: lies inside way/1418958953 (building part / stacked copy): massing doubled
  - `way/283275025`: is the union of way/1418954764, way/1418955365, which carry the heights
  - `way/860822250`: is the union of way/1383852532, way/1383852533, which carry the heights
  - `way/1418958953`: sliver overlapping a sibling, no tall mass in the Google mesh
  The Northwestern Parking Garage and the Dudley/Lambertus block were each drawn as one outer ring plus its two parts; the parts stay (they carry the heights), the ring goes, and the parts inherit its name and code.
- **Heights corrected** (Google p90 and median both >3.5 m from LiDAR, footprint well covered):
  - `way/607137013`: 12.7 -> 6.7 m
  - `way/866802210`: 13.1 -> 22.7 m
  - `way/1383852532`: 9.6 -> 23.4 m
  - `way/1383852533`: 10.9 -> 24.2 m
  Dudley, Lambertus and the neighbouring ring read 10 m from LiDAR but 23-24 m in the mesh across the whole footprint (not trees); Chaney-Hale reads 13 m but is a 5-storey block (22.7 m). Hip halls (Hovde etc.) were skipped, their `topY` is the eave.
- **Courtyard holes**: `holes` arrays (rings in the same frame) for 4 footprints: `w117146489`, `w117146490`, `w158307860`, `w1418955365`. The v5 bake ignored all courtyards; `region.js`/`index.js` do not read `holes` yet, so rendering is unchanged until a consumer does.
- **Outlines adjusted** where CampusMapper and Google both show >120 m2 outside the OSM outline:
  - `way/117146483`: 2372 -> 2546 m2 (CampusMapper and Google both show 178 m2 outside the OSM outline)
  - `way/1383852533`: 2466 -> 2587 m2 (CampusMapper and Google both show 122 m2 outside the OSM outline)
- **Added** (in CampusMapper, missing from OSM):
  - `cm/BSC` Stanley Coulter Hall (SC): outline measured from the Google mesh (CampusMapper draws only a bounding box), top 13.2 m, 1 courtyard hole.

## Not matched / left alone

- BPGSC Purdue Graduate Student Center: lies inside OSM footprint way/1418954764 (merged into it), not added
- Fountains drawn in CampusMapper (Engineering, John Purdue Memorial, Loeb) are not buildings; the `Hovde Hall (part)` shape (198 m2) has no tall mass in the Google mesh, so it is a low portico, not added.
- OSM footprints with no CampusMapper counterpart (small outbuildings, the University Lutheran Church which is not Purdue property, the unnamed sheds near x 230-290): left as OSM, unnamed. The three small boxes at x 232, z -322..-353 are 5-9 m high in the mesh; only `w607137013` differed enough from LiDAR to correct.
- Duncan Annex does not appear in either CampusMapper or the OSM data for this region (no entry in the 481 places). CampusMapper spells the Chaney-Hale building the same way as OSM (`BCHAS`); no "Cheney Hall" entry exists, so nothing to rename.
- Graduate Student Center (BPGSC, 603 m2): CampusMapper puts it in the north-west lobe of the Northwestern garage; OSM has no footprint of its own there (two overlapping 150 m2 slivers 8 m away, now removed). It stays part of the garage massing.
- Elliott Hall and Physics: CampusMapper and Google both disagree with OSM by 150-200 m2 at the apron / edge, but the shapes are curved or stepped and the difference is under 4 percent, so the outline was left.
- Google heights are not used where the footprint is low or tree-covered (Hicks Library, small sheds); LiDAR stays authoritative elsewhere.

## Street View vs OSM paths and roads

| Set | Pano | x | z | distance to nearest OSM path/road (m) | inside a building |
|---|---|---|---|---|---|
| walc | CAoSFENJSE | 107.8 | -2.2 | 2.7 | 0 |
| walc | _2SMIzURFl | 70.1 | 40.4 | 7.5 | 0 |
| walc | CAoSF0NJSE | 33.3 | -2.2 | 3.1 | 0 |
| bell-tower | CAoSFkNJSE | -0.1 | -14.8 | 1.3 | 0 |
| bell-tower | CAoSF0NJSE | 15.5 | 0.8 | 0.1 | 0 |
| bell-tower | CAoSF0NJSE | -0.1 | 16.3 | 1.2 | 0 |
| bell-tower | CAoSF0NJSE | -15.6 | 0.8 | 7.6 | 0 |
| dsai | CAoSFkNJSE | -63.2 | -149.7 | 4.4 | 0 |
| dsai | Lbpr0miE_Q | -109.2 | -179.2 | 2.3 | 0 |
| mechanical-engineering | CAoSFkNJSE | 105.6 | -159.7 | 0.4 | 0 |
| mechanical-engineering | 6DxBmx7b1N | 152.0 | -94.3 | 12.4 | 0 |
| mechanical-engineering | 6u2Sw1tE8A | 105.6 | -65.9 | 4.2 | 0 |
| mechanical-engineering | GdyP25rOs0 | 32.5 | -94.3 | 3.2 | 0 |
| msee | u149QOTu5L | 122.5 | -263.0 | 2.5 | 0 |
| msee | ycaxPb0AeM | 150.1 | -232.0 | 0.3 | 0 |
| bhee | piQ7yiKpGR | 174.2 | -216.2 | 2.0 | 0 |
| bhee | H0h2DIBVxz | 214.2 | -137.8 | 2.8 | 0 |
| hovde | CAoSFkNJSE | -30.6 | -132.5 | 8.4 | 0 |
| hovde | CAoSF0NJSE | -30.6 | -76.9 | 0.7 | 0 |
| hovde | CAoSF0NJSE | -56.9 | -106.1 | 2.4 | 0 |
| psychological-sciences | 8kLvPmwZwB | -81.4 | -0.3 | 0.3 | 0 |
| psychological-sciences | -pab4WE3KE | -28.0 | 35.1 | 1.2 | 0 |
| elliott-hall-of-music | HwF9pEOA_G | -78.1 | -117.0 | 6.1 | 0 |
| elliott-hall-of-music | XvCOiCOdmY | -78.1 | -17.3 | 0.9 | 0 |
| elliott-hall-of-music | gd8RfryM02 | -127.9 | -63.7 | 0.4 | 0 |

Median distance 2.4 m, 18 of 25 within 4 m, none inside a building. Panoramas more than 6 m from any OSM way: walc (70.1, 40.4) 7.5 m, bell-tower (-15.6, 0.8) 7.6 m, mechanical-engineering (152.0, -94.3) 12.4 m, hovde (-30.6, -132.5) 8.4 m, elliott-hall-of-music (-78.1, -117.0) 6.1 m. Those are the candidates for a missing or misplaced path (Mechanical Engineering at x 152, z -94 is 12 m off: a driveway or plaza path absent from OSM); no path was edited, a panorama gives a point, not a direction.
