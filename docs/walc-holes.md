# WALC hole check (tools/walc-holes.mjs)

Raycasts the near-LOD WALC mesh in headless Chrome. A: rays from probe points inside each enclosed volume must hit the shell; B: segments from ring points outside to those probes must be blocked; C: rays looking up from 0.3 / 1.7 m around the building must never see a roof tile from its underside.

```
tris 22013, probes 409; A escapes 0/122700; B see-through 0/17001; C tile-from-below 0/38880
```

## What was wrong and what closed it (v5-walc-holes)

Before: A found 1590 escaping rays and B 740 see-through segments (HEAD walc.js, 22316 tris). After: 0 / 0 / 0 (22633 tris incl. far LOD and props, 22013 in the checked near mesh).

- No back wall behind the curtain wall or any opening: every edge now gets an interior backdrop plane (dark, warm ceiling-glow texture), 2.6 m behind the colonnade, 0.6 m behind other faces.
- Colonnade: brick spandrel over the arcade (y 5 to 7.6 was open), overhang back closed against the flat roof.
- Flat roofs sat 5 to 10 cm above the wall tops (slits at the coping); now flush. Eave fascia runs down to the flat roof, so no slit where a pavilion eave overhangs the mid block.
- Walls slanting inside the LiDAR hip outline left a wedge under the tile: soffit now runs 1.3 m in under the wall, brick raised to the tile plane.
- Missing walls: south pavilion north gable above the low east wing (z 5.7), and the south face of the 16.2 m block over the wing (z -26).
- Box bottoms added (monitor roof slab, ridge cap, mullions); ground-floor cap under the footprint.

Run: `node tools/saltline-walk-build.mjs && node tools/walc-holes.mjs --write`. Screenshots: docs/img/v5-walc-holes.jpg (top row plaza bay, bottom row east pavilions; before left, after right; poses v5-bay and v5-sw-up in tools/saltline-walk-shots.mjs).
