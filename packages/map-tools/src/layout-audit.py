"""Layout audit of the walkable region: OSM footprints vs CampusMapper outlines vs the Google 3D tiles mesh vs Street View positions.
Writes packages/map-tools/data/footprint-fixes.json (applied by bake-region.py), docs/layout-report.md tables and docs/img/v6-layout-overlay.jpg.
Run: uv run --with numpy --with scipy --with pillow --with shapely --with trimesh python packages/map-tools/src/layout-audit.py [path/to/mall-area.glb]
Inputs: data/campus.json, data/google/mall-area.glb (gitignored, see docs/google-export.md), data/raw/streetview/manifest.json (gitignored),
CampusMapper SVG + JSON (downloaded to data/raw/campusmapper/; outlines are a cross-check only, never copied as artwork: needs-clearance in docs/assets.md)."""
import json, math, re, sys, urllib.request
from pathlib import Path
import numpy as np
from scipy import ndimage as ndi
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
B = dict(minX=-200, maxX=320, minZ=-350, maxZ=365)
CMDIR = ROOT / 'data/raw/campusmapper'
SVG = 'https://campusmapper.com/wp-content/uploads/2026/09/purdue-university-campus-map-2d.svg'
JSN = 'https://campusmapper.com/wp-content/uploads/campusmapper-data/9332-3153f440b4d9.json'
GLB = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'data/google/mall-area.glb'
GX0, GZ0, GW, GH = -220, -385, 560, 770  # Google raster window, 1 m cells, x east / z south like the campus frame
HALLS_HIP = {'way/75498146', 'way/117146492', 'way/158307860', 'way/117147171', 'way/117147168', 'relation/3759822'}
log = []

# ---------- CampusMapper ----------
CMDIR.mkdir(parents=True, exist_ok=True)
for u, f in ((SVG, 'map.svg'), (JSN, 'places.json')):
    if not (CMDIR / f).exists(): (CMDIR / f).write_bytes(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})).read())  # urllib's default UA gets 403
svg = (CMDIR / 'map.svg').read_text()
i = svg.find('id="Buildings"'); j = svg.find('</g>', i)
cm = {}
for m in re.finditer(r'<path id="([^"]+)" data-name="([^"]*)"[^>]*? d="([^"]+)"', svg[i:j]):
    pid, name, d = m.groups()
    pts = np.array([[float(a), float(b)] for a, b in re.findall(r'(-?[\d.]+) (-?[\d.]+)', d.split('Z')[0])])
    if len(pts) >= 3: cm[pid] = dict(name=name.replace('&amp;', '&'), pts=pts)
places = {p['id']: p for p in json.load(open(CMDIR / 'places.json'))['places']}


def centroid(p):
    p = np.asarray(p); x, y = p[:, 0], p[:, 1]; cr = x * np.roll(y, -1) - np.roll(x, -1) * y; a = cr.sum() / 2
    return np.array([((x + np.roll(x, -1)) * cr).sum() / (6 * a), ((y + np.roll(y, -1)) * cr).sum() / (6 * a)])


# ---------- OSM footprints in the region (same filter as bake-region.py) ----------
def lidar(b):
    if b.get('heightLidar'): return b['heightLidar']
    t = b['tags']
    for k in ('height', 'building:height'):
        try: return float(str(t[k]).split()[0])
        except Exception: pass
    try: return float(t['building:levels']) * 3.5 + 1
    except Exception: return 8.0


campus = json.load(open(ROOT / 'data/campus.json'))
osm = {}
for b in campus['buildings']:
    o = b['outer']
    if len(o) < 3: continue
    xs, zs = [p[0] for p in o], [p[1] for p in o]
    if max(xs) < B['minX'] or min(xs) > B['maxX'] or max(zs) < B['minZ'] or min(zs) > B['maxZ']: continue
    pg = Polygon(o).buffer(0)
    if pg.area < 12: continue
    osm[b['id']] = dict(name=b.get('name') or '', pg=pg, lidar=lidar(b))

# ---------- fit CampusMapper -> our frame (similarity-free affine from buildings whose OSM name ends in their code) ----------
pairs = [(i, 'B' + m.group(1)) for i, o in osm.items() if (m := re.search(r'\(([A-Z0-9]+)\)$', o['name'])) and 'B' + m.group(1) in cm]
Aa = np.array([[*osm[i]['pg'].centroid.coords[0], 1] for i, _ in pairs]); Bm = np.array([centroid(cm[c]['pts']) for _, c in pairs])
keep = np.ones(len(pairs), bool)
for _ in range(4):
    Mx, *_ = np.linalg.lstsq(Aa[keep], Bm[keep], rcond=None)
    res = np.linalg.norm(Aa @ Mx - Bm, axis=1); keep = res < max(3 * np.median(res), 8)
Ai = np.linalg.inv(Mx[:2].T); scale = float(np.linalg.norm(Mx[0]))
fit = dict(pairs=len(pairs), inliers=int(keep.sum()), pxPerMetre=round(scale, 4), rotationDeg=round(math.degrees(math.atan2(Mx[0][1], Mx[0][0])), 3), rmsM=round(float(np.sqrt(np.mean((res[keep] / scale) ** 2))), 2))
to_xz = lambda p: (np.asarray(p) - Mx[2]) @ Ai.T
cmpg = {}
for k, v in cm.items():
    pg = Polygon(to_xz(v['pts'])).buffer(0)
    c = pg.centroid
    if pg.area >= 8 and B['minX'] - 5 <= c.x <= B['maxX'] + 5 and B['minZ'] - 5 <= c.y <= B['maxZ'] + 5: cmpg[k] = pg

# ---------- Google mesh -> height raster (1 m cells) ----------
import trimesh
sc = trimesh.load(str(GLB), force='scene'); mesh = trimesh.util.concatenate(list(sc.dump()))
P, _ = trimesh.sample.sample_surface(mesh, 6_000_000, seed=1)
ix, iz = (P[:, 0] - GX0).astype(int), (P[:, 2] - GZ0).astype(int)
ok = (ix >= 0) & (ix < GW) & (iz >= 0) & (iz < GH)
dsm = np.full((GH, GW), -99.0, np.float32); dmin = np.full((GH, GW), 99.0, np.float32)
np.maximum.at(dsm, (iz[ok], ix[ok]), P[ok, 1]); np.minimum.at(dmin, (iz[ok], ix[ok]), P[ok, 1])
dsm = np.where(dsm < -90, ndi.maximum_filter(dsm, 5), dsm); dmin = np.where(dmin > 90, ndi.minimum_filter(dmin, 5), dmin)


def raster(poly, grow=0):
    img = Image.new('L', (GW, GH), 0)
    ImageDraw.Draw(img).polygon([(x - GX0, z - GZ0) for x, z in poly.exterior.coords], fill=1)
    return np.array(img, bool)


bm = ndi.binary_dilation(np.zeros((GH, GW), bool) | np.any([raster(o['pg']) for o in osm.values()], axis=0), iterations=3)
g0 = ndi.percentile_filter(np.where(bm, 99.0, dsm).astype(np.float32), 8, size=21)  # ground: low percentile of cells outside any footprint, smoothed
good = (g0 < 90) & ~bm
gnew = ndi.gaussian_filter(np.where(good, g0, 0).astype(np.float32), 20) / np.maximum(ndi.gaussian_filter(good.astype(np.float32), 20), 1e-3)
gold = ndi.gaussian_filter(ndi.minimum_filter(ndi.percentile_filter(dmin, 10, size=15), 31), 8)
nd = dsm - np.maximum(gnew, gold)  # the higher estimate is right in both the dense east and the window edge
tall = ndi.binary_closing(nd > 5, iterations=1)


def cells(mask):
    ys, xs = np.nonzero(mask)
    return unary_union([box(x + GX0, y + GZ0, x + GX0 + 1, y + GZ0 + 1) for x, y in zip(xs, ys)]) if len(xs) else Polygon()


def ring(pg, nd_=1):
    r = lambda p: [[round(x, 1), round(z, 1)] for x, z in list(p.coords)[:-1]]
    return r(pg.exterior)


# ---------- per-building comparison ----------
rows, fixes = [], dict(remove={}, rename={}, height={}, holes={}, poly={}, add=[])
match = {}
for k, pg in cmpg.items():
    best = None
    for i, o in osm.items():
        if pg.intersects(o['pg']):
            iou = pg.intersection(o['pg']).area / pg.union(o['pg']).area
            if best is None or iou > best[1]: best = (i, iou)
    if best and best[1] > 0.2 and (best[0] not in match or match[best[0]][1] < best[1]): match[best[0]] = (k, best[1])
for i, o in osm.items():
    pg = o['pg']; m = raster(pg)
    inner = ndi.binary_erosion(m, iterations=2); vals = nd[inner if inner.sum() > 4 else m]
    p90, med = float(np.percentile(vals, 90)), float(np.median(vals))
    cover = float((tall & m).sum() / max(m.sum(), 1))
    best = (-1, 0, 0)
    for dx in range(-8, 9):
        for dz in range(-8, 9):
            f = (tall & np.roll(np.roll(m, dz, 0), dx, 1)).sum() / m.sum()
            if f > best[0]: best = (f, dx, dz)
    row = dict(id=i, osmName=o['name'], area=round(pg.area), lidar=round(o['lidar'], 1), g90=round(p90, 1), gmed=round(med, 1), cover=round(cover, 2), shift=[best[1], best[2]])
    if i in match:
        k, iou = match[i]; c = cmpg[k]
        row.update(code=k[1:], cmName=cm[k]['name'], iou=round(iou, 2), dCentroid=round(math.dist(pg.centroid.coords[0], c.centroid.coords[0]), 1), cmArea=round(c.area))
        fixes['rename'][i] = dict(name=cm[k]['name'], code=k[1:])
    rows.append(row)
rowd = {r['id']: r for r in rows}

# duplicates: a footprint whose area lies >90 % inside another, bigger one is a building:part of it (or a stacked copy) and doubles the massing
for a, oa in osm.items():
    for b, ob in osm.items():
        if a != b and oa['pg'].area < ob['pg'].area and oa['pg'].intersection(ob['pg']).area > 0.9 * oa['pg'].area:
            fixes['remove'][a] = f'lies inside {b} (building part / stacked copy): massing doubled'
# a union ring whose parts are all present is the duplicate instead of the parts
for b, ob in osm.items():
    parts = [a for a, oa in osm.items() if a != b and oa['pg'].intersection(ob['pg']).area > 0.9 * oa['pg'].area and oa['pg'].area < 0.9 * ob['pg'].area]
    if len(parts) >= 2 and sum(osm[a]['pg'].area for a in parts) > 0.95 * ob['pg'].area:
        for a in parts: fixes['remove'].pop(a, None)
        fixes['remove'][b] = f'is the union of {", ".join(parts)}, which carry the heights'
        if b in fixes['rename']:  # the union carried the CampusMapper match: hand the name and code to the parts
            for a in parts: fixes['rename'].setdefault(a, fixes['rename'][b])
# slivers that Google shows nowhere near a tall mass, not matched by CampusMapper and overlapping a sibling
for i, r in rowd.items():
    if r['cover'] < 0.25 and r['area'] < 400 and r['lidar'] > 8 and i not in fixes['remove'] and 'code' not in r and any(
            j != i and osm[j]['pg'].intersects(osm[i]['pg']) for j in osm):
        fixes['remove'][i] = 'sliver overlapping a sibling, no tall mass in the Google mesh'
# heights: Google p90 AND median both far from the LiDAR value on a well-located, non-hip footprint
for i, r in rowd.items():
    if i in fixes['remove'] or i in HALLS_HIP or r['cover'] < 0.3 and r['area'] > 400: continue
    if abs(r['g90'] - r['lidar']) > 4 and abs(r['gmed'] - r['lidar']) > 3.5 and r['g90'] < 40 and r['area'] > 100:
        fixes['height'][i] = dict(topY=round(r['g90'], 1), was=r['lidar'], why='Google mesh p90/median disagree with LiDAR by >4 m')
# courtyards: low cells inside the eroded footprint, polygonised
for i, o in osm.items():
    if i in fixes['remove'] or o['lidar'] < 8 or o['pg'].area < 400: continue
    m = ndi.binary_erosion(raster(o['pg']), iterations=2) & (nd < 4); lab, n = ndi.label(m); hs = []
    for q in range(1, n + 1):
        if (lab == q).sum() < 30: continue
        h = cells(lab == q).buffer(0.5, join_style=2).simplify(0.6)
        h = h.geoms[0] if h.geom_type == 'MultiPolygon' else h
        if h.area >= 30 and o['pg'].buffer(-1).contains(h): hs.append(ring(h))
    if hs: fixes['holes'][i] = hs
# outlines: OSM disagrees with BOTH CampusMapper and Google by >=100 m2 of tall ground -> consensus outline
G = lambda pg: cells(tall & raster(pg.buffer(3))).buffer(1.0)
for i, r in rowd.items():
    if 'code' not in r or i in fixes['remove']: continue
    o, c = osm[i]['pg'], cmpg['B' + r['code']]; g = G(o.union(c)); added = c.difference(o).intersection(g).buffer(-1.5).buffer(1.5)  # opening: drop edge slivers from sub-metre registration error
    low = o.difference(c).difference(g.buffer(1.5))
    if added.area >= 120:
        new = o.union(added).difference(low if low.area >= 100 else Polygon()).buffer(0.6, join_style=2).buffer(-0.6, join_style=2).simplify(0.4)
        if new.geom_type == 'MultiPolygon': new = max(new.geoms, key=lambda x: x.area)
        fixes['poly'][i] = dict(poly=ring(new), was=round(o.area), now=round(new.area), why=f'CampusMapper and Google both show {round(added.area)} m2 outside the OSM outline' + (f', and {round(low.area)} m2 inside it is low ground' if low.area >= 100 else ''))
# missing buildings: CampusMapper building with no OSM match, Google shows a tall mass inside it
for k, c in cmpg.items():
    if k in [v[0] for v in match.values()] or not k.startswith('B') or 'Fountain' in cm[k]['name'] or 'Fountain' in places.get(k, {}).get('c', ''): continue
    m = raster(c.buffer(3)) & tall
    if m.sum() < 400: log.append(f'{k} {cm[k]["name"]}: CampusMapper only, no tall Google mass ({int(m.sum())} cells): not added'); continue
    g = cells(ndi.binary_opening(m, iterations=1)).buffer(1.0, join_style=2).buffer(-1.0, join_style=2).simplify(0.5)
    g = max(g.geoms, key=lambda x: x.area) if g.geom_type == 'MultiPolygon' else g
    host = [i for i, o in osm.items() if i not in fixes['remove'] and o['pg'].intersection(g).area > 0.5 * g.area]
    if host: log.append(f'{k} {cm[k]["name"]}: lies inside OSM footprint {host[0]} (merged into it), not added'); continue
    v = nd[ndi.binary_erosion(raster(g), iterations=2)]
    fixes['add'].append(dict(id='cm/' + k, name=cm[k]['name'], code=k[1:], poly=ring(g), holes=[ring(Polygon(h)) for h in g.interiors if Polygon(h).area >= 30], topY=round(float(np.percentile(v, 90)), 1),
                             why='in CampusMapper, absent from OSM; outline measured from the Google mesh (CampusMapper draws only a bounding box)'))
for a in fixes['add']: print('ADD', a['id'], a['name'], round(Polygon(a['poly']).area), a['topY'], 'holes', len(a['holes']))

# ---------- Street View panoramas vs OSM paths ----------
sv = json.load(open(Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / 'data/raw/streetview/manifest.json'))
kk = math.cos(40.42728706 * math.pi / 180); R = 6371008.8
lines = [LineString(p['points']) for p in campus['paths'] if p.get('tags', {}).get('highway') in
         {'footway', 'path', 'pedestrian', 'cycleway', 'service', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'steps', 'corridor'} and len(p['points']) > 1]
svrows, seen = [], set()
for s in sv:
    if (s['lat'], s['lon']) in seen: continue
    seen.add((s['lat'], s['lon']))
    pt = Point((s['lon'] + 86.91406754) * math.pi / 180 * R * kk, -(s['lat'] - 40.42728706) * math.pi / 180 * R)
    d = min(l.distance(pt) for l in lines)
    ins = [i for i, o in osm.items() if o['pg'].contains(pt)]
    svrows.append(dict(building=s['building'], pano=s['panoId'][:10], x=round(pt.x, 1), z=round(pt.y, 1), toPath=round(d, 1), insideBuilding=ins))

for i in fixes['remove']:
    for k in ('rename', 'height', 'holes', 'poly'): fixes[k].pop(i, None)
fixes['_meta'] = dict(fit=fit, note='generated by packages/map-tools/src/layout-audit.py; hand edits survive only if the audit is not re-run, bake-region.py reads this file as is')
out = ROOT / 'packages/map-tools/data/footprint-fixes.json'
out.parent.mkdir(exist_ok=True); json.dump(fixes, open(out, 'w'), indent=1)
json.dump(dict(fit=fit, rows=rows, sv=svrows, log=log, cmOnly=[(k, cm[k]['name']) for k in cmpg if k not in [v[0] for v in match.values()]]), open(ROOT / 'data/debug/layout-audit.json', 'w'), indent=1)
np.save(ROOT / 'data/debug/layout-nd.npy', nd.astype(np.float16))
print(fit, 'remove', len(fixes['remove']), 'rename', len(fixes['rename']), 'height', len(fixes['height']), 'holes', len(fixes['holes']), 'poly', list(fixes['poly']), 'add', len(fixes['add']))
