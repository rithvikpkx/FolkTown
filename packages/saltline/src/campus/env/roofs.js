// Real roof albedo per building: a flat cap just above each footprint's roof, UV-mapped into the roofs atlas
// (tools/google-roofs.py from the Google 3D tiles top-down mosaic; src/campus/roofs.json holds uv rects, classes, colours).
import { BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, ShapeUtils, TextureLoader, Vector2 } from 'three';
import ROOFS from '../roofs.json';

/** Adds one mesh per atlas page to `root`; skip = building ids built elsewhere (hotspots, WALC). Returns triangle count. */
export function addRoofs(zone, root, skip = [], base = import.meta.env.BASE_URL + 'campus/walk/') {
  const pages = ROOFS.pages.map(() => ({ p: [], uv: [] }));
  for (const c of zone.colliders) {
    const r = ROOFS.buildings[c.id];
    if (!r || skip.includes(c.id) || c.poly.length < 3) continue;
    const poly = c.poly.slice(), f = poly[0], l = poly[poly.length - 1];
    if (f[0] === l[0] && f[1] === l[1]) poly.pop();
    const y = Math.max(c.topY, c.baseY + 0.5) + 0.035, [bx0, bz0, bx1, bz1] = r.box, [u0, v0, u1, v1] = r.uv;
    const pts = poly.map(([x, z]) => new Vector2(x, z));
    let tri;
    try { tri = ShapeUtils.triangulateShape(pts, []); } catch { continue; }
    const pg = pages[r.p];
    for (const t of tri) {
      let [a, b, d] = t.map((i) => pts[i]);
      if ((b.y - a.y) * (d.x - a.x) - (b.x - a.x) * (d.y - a.y) < 0) [b, d] = [d, b]; // wind so the normal faces up
      for (const q of [a, b, d]) {
        pg.p.push(q.x, y, q.y);
        pg.uv.push(u0 + ((q.x - bx0) / (bx1 - bx0)) * (u1 - u0), v0 + ((q.y - bz0) / (bz1 - bz0)) * (v1 - v0));
      }
    }
  }
  const g = new Group(); g.name = 'roof_atlas';
  let tris = 0;
  pages.forEach((pg, i) => {
    if (!pg.p.length) return;
    const map = new TextureLoader().load(base + ROOFS.pages[i]);
    map.colorSpace = SRGBColorSpace; map.flipY = false; map.anisotropy = 8;
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(pg.p, 3));
    geo.setAttribute('uv', new Float32BufferAttribute(pg.uv, 2));
    geo.setAttribute('normal', new Float32BufferAttribute(pg.p.map((_, k) => (k % 3 === 1 ? 1 : 0)), 3));
    const m = new Mesh(geo, new MeshStandardMaterial({ map, roughness: 0.92, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.receiveShadow = true; m.name = 'roof_page_' + i;
    g.add(m); tris += pg.p.length / 9;
  });
  root.add(g);
  return tris;
}

/** roof class and colour of one building, or undefined */
export const roofOf = (id) => ROOFS.buildings[id];
