# Photoreal Lab (owner-approved look)

The prototype the owner approved on 12 November 2026 ("I can actually recognise WALC now"). Published as the artifact "FolkTown Photoreal Lab" (https://claude.ai/artifact/R6zcvySTJTadnqdmeKvFBQ). Research behind it: `docs/graphics-research.md`.

- `lab-entry.js`: the page script (three r170 via import; WALC generator from OSM footprints, the weapon scenes, lighting rig, Balanced/Ultra post chain with GTAO, bloom, DoF, grain). Port from it; do not ship it.
- `assets/`: the models and maps it uses (`pistol`, `boltrifle` from Poly Haven; `m4a1`, `shotgun` from 3dmodelscc0; bricks/concrete/grass/pavers/roof tiles from ambientCG/Poly Haven; `studio.hdr`; `manifest.json` has sources and licences; `osm_polys.json` is the WALC footprint data).
- Port the pieces into `packages/client` behind the existing manifests (`public/models/weapons.json`, `materials/texture-sets.ts`).
