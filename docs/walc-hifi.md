# WALC hi-fi model (branch walc-hifi)

`packages/saltline/src/campus/walc.js`, built in code. Proof image: `docs/img/walc-hifi-vs-apple.jpg` (`node tools/saltline-walk-shots.mjs apple-west-mid apple-west-4 apple-east-mid apple-south-mid hifi-front hifi-oblique hifi-colonnade hifi-nw hifi-east hifi-south`, then `tools/walc-apple-sidebyside.py`).

## How it was measured

| What | Source | Method | Accuracy |
|---|---|---|---|
| Roof plan, ridges, eave edges, flat roofs, monitor, the two notches, lobe | Google mesh top-down colour and height raster (0.087 m px, `data/google/topdown`), LiDAR raster (`data/pilot/roofs.json`) | read directly in the campus frame; the two agree to 0.3 m after a 0.4 m ground offset | 0.3 m |
| Wall lines | horizontal slices of the Google mesh at 3.5, 10 and 14.5 m | walls sit about 2 m inside the roof edge; the OSM polygon traces the roof edge, not the walls | 0.4 m |
| Camera poses of the Apple Maps frames | `tools/walc-apple.py fit` | pinhole fit (position, heading, tilt, focal length) to 10-16 roof points per frame; residual 2-18 px (27 px per metre) | 0.2-0.5 m |
| West, east and south facades | `tools/walc-apple.py rect` on west-mid, east-mid, south-mid | each wall plane rectified to a metric image, window, belt, pier and band positions read off it | 0.2 m across, 0.3 m in height |
| Colonnade glazing, canopies, doors | Street View 2021 frame (rectified tile from v4) | proportions only, rescaled with the 5.09 m bay pitch from the Apple frame | 0.3 m |
| North face | 2018 Purdue photo (`reference/purdue-photos/walc-news-plant-wilmeth-now2LO.jpg`) | cross-ratio along the face from the two corners and the centre; the east half is mirrored from the west half | 0.5 m, east half assumed |

Finding: the Street View heights used since v4 were about 17% too tall (belt course 5.7-6.4 m then, 4.8-5.35 m measured). The Apple heights reproduce the Street View frame's own proportions and the 2018 photo's belt-to-eave ratio.

## Key dimensions (m, campus frame)

- Hips: edges x 41.4..101.0, z -56.05..-33.0 (ridge 21.8) and x 41.5..101.0, z 5.45..30.55 (ridge 22.3); pitch 0.42 (22.8 deg); tile edge 17.0; walls and flat soffit 16.55; overhang 2.0 (1.5 on the north).
- West bar gable: eave x 45.2 at 16.0 (43.95 and lower over the stair bay), ridge x 54.4 at 19.8, inner edge x 60.3; flat roof 16.2; monitor x 64.3..75.9, z -24.2..3.6, top 19.4; notches x 65.5..68 (north) and 66.8..74.4 (south).
- Colonnade: 7 bays of 5.086 m between z -28.1 and 7.5, piers 1.08 wide and 0.7 deep, glazing plane x 48.4, frieze 4.85..6.6, lettering 20.6 m long with 0.45 m capitals centred on the bays, bronze window units 6.6..13.7.
- Shared levels: plinth 1.0, ground openings 1.0..4.6, belt 4.8..5.35, second floor windows 7.4..9.95, third floor 12.0..14.5, string 14.5..14.72, frieze 15.75..16.55.
- East: stair towers z -36.4..-27.6 and 7.5..16.25 at x 99.9, inner wall x 89.5 with six triple windows and a pair per floor at 5.11 m, lobe to x 95.9, roof 7.2.
- South: eight single windows per upper floor, bay x 48.9..59.0 projecting to z 33.3 with four-tier windows.

## Still different from the frames

- North face east half and all ground-floor detail behind trees are inferred; the north centre section's depth (0.3 m) is a guess.
- Canopy height (3.95 m) and depth come from one dusk Street View frame; the Apple mesh shows the teal glass but not reliably where.
- The top 2 m of the colonnade bays (above 13.4 m) is hidden by the eave in every aerial frame; it follows the Street View tile.
- Brick, limestone and tile patterns are generated (the meshes are too soft to tile); only colour and pitch are sampled. The diaper brick bond on the west pavilion faces is schematic.
- No interior beyond a backdrop and stair flights; rooftop plant is five generic vents; lobe garden is a low wall only; no east or south site furniture.
- The scene's lighting is hazier and cooler than the Apple imagery, so sunlit brick reads darker and redder.
