"""Bake the walkable 'mall-union' region (ZONE_BBOX in tiles/math.ts) into data/zones/mall-union.json, ZoneData-shaped:
colliders = every OSM footprint touching the region (LiDAR height, name, wall/roof colour, roof type), props = trees, paths = highways clipped to the region.
Roof colour comes from the 2023 ortho where it covers the building (x -50..190, z -200..50), else a palette by id hash.
Corrections from the layout audit (duplicates removed, heights, courtyard holes, outlines, official names and codes, missing buildings) come from packages/map-tools/data/footprint-fixes.json (made by layout-audit.py), so they survive re-bakes.
Run: pnpm map:bake-region   (needs data/campus.json, data/pilot/roofs.json, packages/saltline/public/campus/pilot/ortho.*)"""
import json, math, hashlib
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
B = dict(minX=-200, maxX=320, minZ=-350, maxZ=365)  # ZONE_BBOX['mall-union']
WIDTH = {'footway', 'path', 'pedestrian', 'cycleway', 'track', 'corridor', 'service', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'primary_link', 'secondary_link', 'tertiary_link'}
HALLS = {'way/75498146', 'way/117146492', 'way/158307860', 'way/117147171', 'way/117147168', 'relation/3759822'}  # brick halls with terracotta hips (env/context.js)
RED = ['#8a3a30', '#a8532f']
WALLS = [('brick', '#f3d2c4'), ('brick', '#e9c2b0'), ('brick', '#f7dccd'), ('concrete', '#d9d3c4'), ('concrete', '#c9c4b8')]
r1 = lambda v: round(v, 1)
h = lambda s, n: int(hashlib.md5(s.encode()).hexdigest()[:8], 16) % n

campus = json.load(open(ROOT / 'data/campus.json'))
roofs = {b['id']: b for b in json.load(open(ROOT / 'data/pilot/roofs.json'))['buildings']}
od = ROOT / 'packages/saltline/public/campus/pilot'
oj = json.load(open(od / 'ortho.json'))
Image.MAX_IMAGE_PIXELS = None
ortho = Image.open(od / oj['image']).convert('RGB')
fit, ob = oj['fit'], oj['bounds']
mpp = oj['metresPerPixel']
c, s = math.cos(fit['theta']), math.sin(fit['theta'])


def to_px(x, z):  # same mapping as ground.js: sample at R(p-c)+c+d
    a, b = x - fit['cx'], z - fit['cz']
    qx, qz = c * a - s * b + fit['cx'] + fit['dx'], s * a + c * b + fit['cz'] + fit['dz']
    return (qx - ob['xMin']) / mpp, (qz - ob['zMin']) / mpp


def roof_colour(poly):
    pts = [to_px(x, z) for x, z in poly]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, y0, x1, y1 = max(0, int(min(xs))), max(0, int(min(ys))), min(ortho.width, int(max(xs)) + 1), min(ortho.height, int(max(ys)) + 1)
    if x1 - x0 < 8 or y1 - y0 < 8: return None  # partly covered buildings sample the covered part
    m = Image.new('L', (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(m).polygon([(px - x0, py - y0) for px, py in pts], fill=255)
    crop = ortho.crop((x0, y0, x1, y1)).resize((max(1, (x1 - x0) // 4), max(1, (y1 - y0) // 4)))
    mk = m.resize(crop.size)
    px, mp = list(crop.get_flattened_data()), list(mk.get_flattened_data())
    sel = [p for p, k in zip(px, mp) if k > 200]
    if len(sel) < 4:
        return None
    sel.sort(key=sum)
    sel = sel[len(sel) // 5: -len(sel) // 5 or None]  # drop darkest/brightest fifth (shadows, glints)
    return tuple(sum(p[i] for p in sel) / len(sel) for i in range(3))


def hexc(rgb, lo=0.28, hi=0.72):
    l = sum(rgb) / 3 / 255 or 1e-6
    k = min(max(l, lo), hi) / l
    return '#%02x%02x%02x' % tuple(min(255, int(v * k)) for v in rgb)


def height(b):
    if b.get('heightLidar'): return b['heightLidar']
    t = b['tags']
    for k in ('height', 'building:height'):
        try: return float(str(t[k]).split()[0])
        except Exception: pass
    try: return float(t['building:levels']) * 3.5 + 1
    except Exception: return 8


FX = json.load(open(ROOT / 'packages/map-tools/data/footprint-fixes.json'))
cols = []
for b in campus['buildings']:
    if b['id'] in FX['remove']: continue
    o = FX['poly'].get(b['id'], {}).get('poly') or b['outer']
    if len(o) < 3: continue
    xs, zs = [p[0] for p in o], [p[1] for p in o]
    if max(xs) < B['minX'] or min(xs) > B['maxX'] or max(zs) < B['minZ'] or min(zs) > B['maxZ']: continue
    area = abs(sum(o[i][0] * o[(i + 1) % len(o)][1] - o[(i + 1) % len(o)][0] * o[i][1] for i in range(len(o)))) / 2
    if area < 12: continue
    poly = [[r1(x), r1(z)] for x, z in o]
    if poly[0] == poly[-1]: poly.pop()
    top = round(max(FX['height'].get(b['id'], {}).get('topY') or height(b), 3), 1)
    mat, wall = WALLS[h(b['id'], len(WALLS))]
    sty = {'wall': {'mat': mat, 'color': wall}}
    rf = roofs.get(b['id'])
    rc = roof_colour(o)
    if b['id'] in HALLS or (rf and rf['roofType'].startswith('pitched') and rf['ridgeH'] > rf['eaveH'] + 1):
        rise = rf['ridgeH'] - rf['eaveH'] if rf and rf['ridgeH'] > rf['eaveH'] else top * 0.18
        top = round(rf['eaveH'] if rf else top - rise, 1)
        sty['wall'] = {'mat': 'brick', 'color': WALLS[0][1]}
        hip = {'rise': round(rise, 1), 'color': RED[h(b['id'], 2)]}
    else:
        hip = None
        if rc: sty['roof'] = {'color': hexc(rc)}
    d = {'id': b['id'], 'poly': poly, 'baseY': 0, 'topY': top, 'style': sty}
    if b.get('name'): d['name'] = b['name']
    if b['id'] in FX['rename']: d.update(FX['rename'][b['id']])  # official CampusMapper name + Purdue building code
    if b['id'] in FX['holes']: d['holes'] = FX['holes'][b['id']]  # courtyards measured from the Google mesh (consumers may ignore)
    if hip: d['hip'] = hip
    cols.append(d)

for a in FX['add']:  # buildings missing from OSM
    mat, wall = WALLS[h(a['id'], len(WALLS))]
    d = {'id': a['id'], 'name': a['name'], 'code': a['code'], 'poly': a['poly'], 'baseY': 0, 'topY': a['topY'], 'style': {'wall': {'mat': mat, 'color': wall}}}
    if a.get('holes'): d['holes'] = a['holes']
    cols.append(d)


def clip(pts):  # Liang-Barsky per segment, joined back into polylines
    out, cur = [], []
    for (x0, z0), (x1, z1) in zip(pts, pts[1:]):
        dx, dz, t0, t1, ok = x1 - x0, z1 - z0, 0.0, 1.0, True
        for p, q in ((-dx, x0 - B['minX']), (dx, B['maxX'] - x0), (-dz, z0 - B['minZ']), (dz, B['maxZ'] - z0)):
            if p == 0:
                if q < 0: ok = False
            else:
                r = q / p
                if p < 0: t0 = max(t0, r)
                else: t1 = min(t1, r)
        if not ok or t0 > t1:
            if len(cur) > 1: out.append(cur)
            cur = []
            continue
        a, e = [x0 + t0 * dx, z0 + t0 * dz], [x0 + t1 * dx, z0 + t1 * dz]
        if not cur or t0 > 0:
            if len(cur) > 1: out.append(cur)
            cur = [a]
        cur.append(e)
        if t1 < 1: out.append(cur); cur = []
    if len(cur) > 1: out.append(cur)
    return out


paths = []
for p in campus['paths']:
    hw = p.get('tags', {}).get('highway')
    if hw not in WIDTH: continue
    for seg in clip(p['points']):
        paths.append({'kind': p.get('kind', 'path'), 'hw': hw, 'points': [[r1(x), r1(z)] for x, z in seg]})

trees = [{'x': r1(t['x']), 'z': r1(t['z']), 'radius': 0.35, 'baseY': 0, 'topY': 6} for t in campus['trees'] if B['minX'] <= t['x'] <= B['maxX'] and B['minZ'] <= t['z'] <= B['maxZ']]
zone = {
    'name': 'Mall + Union', 'bounds': B, 'ground': {'x0': B['minX'], 'z0': B['minZ'], 'cell': 715, 'cols': 2, 'rows': 2, 'heights': [0, 0, 0, 0]},
    'colliders': cols, 'props': trees, 'paths': paths, 'spawns': [{'x': 8, 'z': 0, 'yaw': -math.pi / 2, 'team': 0}], 'nav': {'nodes': [], 'edges': []},
    'landmarks': {'bellTower': {'x': 0, 'z': 0, 'id': 'way/301837711'}, 'fountain': {'x': 23.73, 'z': -151.06}, 'walc': {'id': 'way/508846031', 'x': 70.08, 'z': -2.21}},
}
out = ROOT / 'data/zones/mall-union.json'
out.write_text(json.dumps(zone, separators=(',', ':')))
print(out, out.stat().st_size, 'bytes;', len(cols), 'buildings,', sum(1 for c in cols if 'roof' in c['style']), 'ortho roofs,', len(paths), 'paths,', len(trees), 'trees')
