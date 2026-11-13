# WALC hole check (tools/walc-holes.mjs)

Raycasts the near-LOD WALC mesh in headless Chrome. A: rays from probe points inside each enclosed volume must hit the shell; B: segments from ring points outside to those probes must be blocked; C: rays looking up from 0.3 / 1.7 m around the building must never see a roof tile from its underside.

```
tris 48066, probes 394; A escapes 0/118200; B see-through 0/15639; C tile-from-below 0/42720
```
