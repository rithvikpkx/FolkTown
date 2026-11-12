# Campus map data: what exists

Preliminary research into building an accurate 3D map of the Purdue West Lafayette campus. The short version: **footprints, names, paths and trees are available and good; building heights are almost entirely missing from the map data and must come from LiDAR; facades must come from photos.**

## OpenStreetMap, measured

Queried on 12 November 2026 for the area latitude 40.415 to 40.440, longitude −86.940 to −86.905. That box covers the academic campus, residence halls, athletics and the airport, plus some surrounding housing.

| What | Count | Note |
|---|---|---|
| Buildings | 1,705 | Includes about 550 private houses around campus |
| Buildings with a name | 232 | The campus buildings. Listed in `docs/campus-building-list.md` |
| Buildings with a height | 10 | 0.6% |
| Buildings with a floor count | 68 | 4% |
| Buildings with either | 72 | 4% |
| Buildings with a roof shape | 0 | |
| Buildings with a wall material or colour | 1 | |
| Separately mapped building parts | 47 | Some complex buildings are split into parts |
| Individually mapped trees | 5,090 | Enough to place real trees rather than scatter them |
| Footpath, path and steps segments | 3,454 | |
| Road segments | 1,164 | |
| Grass areas | 856 | |
| Parks, pitches, gardens | 163 | |

Water and fountains present by name: Engineering Fountain, Loeb Fountain, John Purdue Memorial Fountain, De Bedout Fountain, Sinninger Pond, and about a dozen unnamed water areas.

Landmarks confirmed present by name: Wilmeth Active Learning Center (WALC), Purdue Bell Tower (height 48.8 m), Bechtel Innovation Design Center, Neil Armstrong Hall of Engineering (16.5 m), Hovde Hall, Elliott Hall of Music, Purdue Student Union, Mackey Arena, the dining courts, the airport terminal and hangars.

**Conclusion:** OpenStreetMap is a sound base for layout. It cannot supply heights, roofs or facades.

Licence: Open Database License. The game must show "© OpenStreetMap contributors", and a database derived from it must be shared under the same licence if distributed.

## Heights: Indiana statewide LiDAR

- Indiana was flown for the federal 3D Elevation Program between 2016 and 2020 at Quality Level 2 (about two points per square metre), following an earlier 2011 to 2013 collection. A newer collection labelled 2025 onward also appears in catalogues.
- The data is described as free and without use restrictions.
- A portal at https://lidar.digitalforestry.org/ offers point clouds and ready-made products: a surface model (tops of buildings and trees), a terrain model (bare ground) and a **height-above-ground model**. The last one gives building heights directly: sample it inside each footprint.
- The same data is also distributed through the USGS National Map and IndianaMap.

Not yet checked: that the Tippecanoe County tiles download cleanly, the grid resolution of the height model, and the file format. This is the first thing to do in the map tools.

**Plan for heights:** take the 90th-percentile height-above-ground inside each footprint as the roof height, and the spread of values as a hint for flat versus pitched roofs. Fall back to floor count × typical storey height, then to a default by building type.

## Facades: photos

No dataset describes what Purdue's walls look like. For each building that matters:

- Photograph each visible face square-on, plus entrances and signs.
- Record in the style sheet: wall material, floor count, bay width, window type, roof type, entrance positions.

Free aerial imagery can help with roof colour, ground materials and checking tree positions. Indiana publishes statewide aerial photography; the exact source and resolution for campus have not been checked.

## Sources that cannot be used as data

**Google's 3D city tiles and Google Earth.** Google's Map Tiles API policies prohibit caching, offline use and extracting data from the tiles. One language version of the policy also states that your own 3D objects may not be extracted, traced or otherwise derived from the tiles; that sentence was not found in the English text, so read the current English policy before relying on either reading. Treat Google imagery as something to look at, not something to build from. Google Earth Studio produces video, not 3D models.

**Purdue's own drawings.** The university keeps base maps and floor plans, but no public download was found. The Libraries' GIS service and the campus maps and records office are the places to ask; a student request may get footprints or floor plans that would make interiors much more accurate.

**Tippecanoe County.** The county runs a GIS portal (maps.tippecanoe.in.gov). No public building-footprint download was found in search results; the portal itself was not browsed.

## Other sources looked at

| Source | What it adds | Verdict |
|---|---|---|
| Overture Maps buildings | Merges OpenStreetMap with machine-learned footprints from Microsoft and Google; has height, floor and roof fields where known. Same licence family as OpenStreetMap | Worth one query for campus to see if it has heights OpenStreetMap lacks. Not expected to beat LiDAR |
| Tools that turn OpenStreetMap into 3D models (Blender add-ons, OSM2World and similar) | Extruded boxes with generic textures | No better than the game's own generator, and the game needs its own for the facade kit anyway |
| Phone photogrammetry of a landmark | A measurable 3D reference for an unusual shape | Useful as reference for hand-built landmarks. Not shipped in the game |

## Recommended pipeline

1. Layout from OpenStreetMap: footprints, names, roads, paths, lawns, water, trees.
2. Heights and roof hints from the LiDAR height-above-ground model.
3. Facades from own photos, recorded as style sheets.
4. Landmarks hand-built in code from photos and measurements.
5. Check against reality with side-by-side screenshots and a walk-through.

## Next checks, in order

1. Download the LiDAR height model for one campus tile and confirm it resolves individual buildings.
2. Run the height sampling on the 232 named buildings and eyeball the results against known values (Bell Tower 48.8 m, Armstrong 16.5 m).
3. Query Overture for the same area and compare its heights.
4. Ask Purdue Libraries GIS whether campus footprints or floor plans can be shared.
5. Read Google's current English Map Tiles policy before using any Google imagery even as tracing reference.

## Sources

- OpenStreetMap, via the Overpass API (query run 12 November 2026)
- https://gis.iu.edu/s/isdp/page/20162020elevation
- https://geobtaa.blogspot.com/2024/05/indiana-statewide-lidar.html
- https://lidar.digitalforestry.org/
- https://developers.google.com/maps/documentation/tile/policies
- https://docs.overturemaps.org/guides/buildings
- https://lib.purdue.edu/gis/
