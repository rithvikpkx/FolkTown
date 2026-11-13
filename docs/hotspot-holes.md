# Hotspot hole check (tools/hotspot-holes.mjs)

Raycasts the near-LOD mesh of each hero hotspot in headless Chrome (demo-hotspot.html, far LOD, trees and props skipped).
A: Fibonacci-sphere rays from probe points inside every enclosed volume must hit the shell (downward rays: the y=0 ground). B: segments from ring points outside (0.3 / 1.7 / 4 m) to those probes must be blocked (no see-through). C: rays looking up from 0.3 / 1.7 m around the building must not see a roof tile from its underside (missing soffit).
Re-run: `node tools/hotspot-holes.mjs union elliott --write` (exit code 1 while any hole remains).

```
union: tris 18876, probes 1595; A escapes 0/319000; B see-through 0/70797; C tile-from-below 0/35520
elliott: tris 27771, probes 1488; A escapes 0/297600; B see-through 0/50055; C tile-from-below 0/26880
```
