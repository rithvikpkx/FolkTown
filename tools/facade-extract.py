# Automatic facade extraction from Street View panos (needs-clearance imagery stays in data/raw/streetview-tiles, gitignored).
# Run: uv run --with opencv-python-headless --with numpy python tools/facade-extract.py [--debug id]
# Per building x chosen pano (selection.json): fit the pano pose (dx,dz offset + heading) by maximising image gradient under the projected eave line,
# base line and corner verticals of the LiDAR-height footprint; rectify the best-visible wall into an albedo; crop the cleanest window (least foliage/sky),
# snapped to the detected bay period; keep the best pano per building. Output: packages/saltline/public/campus/facades/photo/*.webp + manifest.json
import cv2, json, math, os, sys, numpy as np
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SV = os.path.join(ROOT, 'data/raw/streetview-tiles') + '/'
OUT = os.path.join(ROOT, 'packages/saltline/public/campus/facades') + '/'
os.makedirs(OUT + 'photo', exist_ok=True)
zone = json.load(open(os.path.join(ROOT, 'data/zones/mall-union.json')))
panos = json.load(open(SV + 'panos.json')); sel = json.load(open(SV + 'selection.json'))
R_E, rad = 6371008.8, math.pi / 180; LAT0, LON0 = 40.42728706, -86.91406754
to_xz = lambda la, lo: (R_E * (lo - LON0) * rad * math.cos(LAT0 * rad), -R_E * (la - LAT0) * rad)
CAM_H, PPM = 2.5, 40

def stitch(pid, w, h):
    f = SV + pid + '.jpg'
    if os.path.exists(f): return cv2.imread(f)
    W, H = w // 2, h // 2; img = np.zeros((math.ceil(H / 512) * 512, math.ceil(W / 512) * 512, 3), np.uint8)
    for y in range(math.ceil(H / 512)):
        for x in range(math.ceil(W / 512)):
            t = cv2.imread(f'{SV}{pid}/{x}_{y}.jpg')
            if t is not None: img[y * 512:y * 512 + t.shape[0], x * 512:x * 512 + t.shape[1]] = t
    img = img[:H, :W]; cv2.imwrite(f, img, [cv2.IMWRITE_JPEG_QUALITY, 92]); return img

def project(pts, cam, head):  # pts Nx3 world (x, y up, z) -> pixel fractions (u in 0..1, v in 0..1); heading 0 = north = -z, 90 = east = +x; image centre = heading
    dx, dy, dz = pts[:, 0] - cam[0], pts[:, 1] - cam[1], pts[:, 2] - cam[2]
    az = np.degrees(np.arctan2(dx, -dz)); el = np.arctan2(dy, np.hypot(dx, dz))
    return (((az - head) / 360 + 0.5) % 1.0), 0.5 - el / math.pi

def inside(p, poly):
    c = False
    for i in range(len(poly)):
        a, b = poly[i], poly[i - 1]
        if (a[1] > p[1]) != (b[1] > p[1]) and p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]: c = not c
    return c
def ccw(a, b, c): return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0])
def crossing(a, b, c, d): return ccw(a, c, d) != ccw(b, c, d) and ccw(a, b, c) != ccw(a, b, d)

def ring_ccw(poly):  # outward normals: make polygon counter-clockwise in (x, -z) so the outward side of edge a->b is (dz, -dx)/L
    a = sum(p[0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * p[1] for i, p in enumerate(poly))
    return poly[::-1] if a < 0 else poly

def edges_facing(poly, others, cam):
    out = []
    for i in range(len(poly)):
        a, b = poly[i], poly[(i + 1) % len(poly)]; L = math.hypot(b[0] - a[0], b[1] - a[1])
        if L < 6: continue
        nx, nz = (b[1] - a[1]) / L, -(b[0] - a[0]) / L; vis = 0; cs = 0; d = 0
        for k in range(9):
            t = (k + .5) / 9; s = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
            vx, vz = cam[0] - s[0], cam[2] - s[1]; dd = math.hypot(vx, vz) or 1; c = (vx * nx + vz * nz) / dd
            if c < 0.25: continue
            near = (s[0] + vx / dd * .3, s[1] + vz / dd * .3)
            if inside(near, poly) or any(crossing((cam[0], cam[2]), near, o[m], o[(m + 1) % len(o)]) for o in others for m in range(len(o))): continue
            vis += 1; cs += c; d += dd
        if vis >= 4: out.append(dict(i=i, a=a, b=b, L=L, vis=vis / 9, cos=cs / vis, d=d / vis))
    return out

def gradients(img):
    g = cv2.GaussianBlur(cv2.cvtColor(cv2.resize(img, None, fx=.5, fy=.5, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 1.5)
    gy = cv2.dilate(np.abs(cv2.Sobel(g, cv2.CV_32F, 0, 1)), np.ones((9, 1)));
    gx = cv2.dilate(np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0)), np.ones((1, 7)))
    return cv2.GaussianBlur(gy, (0, 0), 2), cv2.GaussianBlur(gx, (0, 0), 2)

def samples(poly, edges, top):
    T, B, V = [], [], []
    for e in edges:
        a, b = e['a'], e['b']
        for t in np.linspace(.04, .96, max(6, int(e['L'] / 1.5))): x, z = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t; T.append((x, top, z)); B.append((x, 0.0, z))
        for p in (a, b):
            for y in np.linspace(.5, top - .5, 8): V.append((p[0], y, p[1]))
    return np.array(T), np.array(B), np.array(V)

def score(g, S, cam, head):
    gy, gx = g; h, w = gy.shape; r = []
    for pts, G, wt in ((S[0], gy, 1.0), (S[1], gy, .35), (S[2], gx, .5)):
        if not len(pts): r.append(0); continue
        u, v = project(pts, cam, head); ix = np.clip((u * w).astype(int), 0, w - 1); iy = np.clip((v * h).astype(int), 0, h - 1)
        r.append(wt * float(G[iy, ix].mean()))
    return sum(r)

def fit(g, S, cam0, head0):
    best = None; grid = []
    for dh in range(-8, 9, 2):
        for dx in range(-12, 13, 2):
            for dz in range(-12, 13, 2):
                s = score(g, S, (cam0[0] + dx, CAM_H, cam0[2] + dz), head0 + dh); grid.append(s)
                if not best or s > best[0]: best = (s, dx, dz, dh)
    s, bx, bz, bh = best
    for dh in np.arange(bh - 2, bh + 2.1, .5):
        for dx in np.arange(bx - 2, bx + 2.1, .5):
            for dz in np.arange(bz - 2, bz + 2.1, .5):
                s2 = score(g, S, (cam0[0] + dx, CAM_H, cam0[2] + dz), head0 + dh)
                if s2 > best[0]: best = (s2, dx, dz, dh)
    base = float(np.percentile(grid, 50)); conf = max(0.0, min(1.0, (best[0] - base) / (best[0] + 1e-6) * 2.2))
    return best, conf

def rectify(img, cam, head, a, b, top, u0, u1):  # wall from ground (a->b in x,z), u metres from a, heights 0.3..top
    L = math.hypot(b[0] - a[0], b[1] - a[1]); dx, dz = (b[0] - a[0]) / L, (b[1] - a[1]) / L
    us = np.arange(u0, u1, 1 / PPM); ys = np.arange(top - .15, .3, -1 / PPM)
    U, Y = np.meshgrid(us, ys)
    P = np.stack([(a[0] + dx * U).ravel(), Y.ravel(), (a[1] + dz * U).ravel()], 1)
    u, v = project(P, cam, head); H, W = img.shape[:2]
    mx = (u * W).reshape(U.shape).astype(np.float32); my = (v * H).reshape(U.shape).astype(np.float32)
    return cv2.remap(img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

def clean_window(T, width_px):  # least foliage/sky/ground clutter window across the face
    hsv = cv2.cvtColor(T, cv2.COLOR_BGR2HSV).astype(np.float32); b, gch, r = [T[..., i].astype(np.float32) for i in range(3)]
    bad = ((gch > r * 1.06) & (gch > b * 1.04) & (gch > 55)) | ((b > r + 12) & (hsv[..., 2] > 170))
    col = bad[:int(bad.shape[0] * .85)].mean(0); cs = np.concatenate([[0], np.cumsum(col)]); W = T.shape[1]
    margin = int(.5 * PPM); best = (9, margin)
    for x in range(margin, max(margin + 1, W - width_px - margin + 1), 4):
        f = (cs[x + width_px] - cs[x]) / width_px
        if f < best[0]: best = (f, x)
    return best[1], float(best[0]), float(bad.mean())

def bay_period(T):  # metres, strength 0..1: autocorrelation of the column profile of vertical-edge energy in the upper wall
    g = cv2.GaussianBlur(cv2.cvtColor(T, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 1.2)
    p = np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0))[int(T.shape[0] * .05):int(T.shape[0] * .75)].mean(0); p = p - p.mean()
    n = len(p); ac = np.correlate(p, p, 'full')[n - 1:] / (np.dot(p, p) + 1e-6); lo, hi = int(2.2 * PPM), min(int(9 * PPM), n // 2)
    if hi <= lo + 4: return None, 0.0
    k = lo + int(np.argmax(ac[lo:hi])); return k / PPM, float(max(0, ac[k]))

def run():
    dbg = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    man = {}; cache = {}
    for c in zone['colliders']:
        cid = c['id']
        if cid not in sel or not sel[cid]['picks'] or (dbg and cid != dbg): continue
        poly = ring_ccw([tuple(p) for p in c['poly']]); top = c['topY']
        others = [o['poly'] for o in zone['colliders'] if o['id'] != cid and o['id'] != 'way/301837711']
        best = None
        for pk in sel[cid]['picks']:
            m = panos[pk['panoId']]; cam0 = (*to_xz(m['lat'], m['lng']),); cam0 = (cam0[0], CAM_H, cam0[1])
            img = cache.setdefault(pk['panoId'], stitch(pk['panoId'], m['imageWidth'], m['imageHeight'])); gr = cache.setdefault('g' + pk['panoId'], gradients(img))
            E = edges_facing(poly, others, cam0)
            if not E: continue
            S = samples(poly, E, top); (sc, dx, dz, dh), conf = fit(gr, S, cam0, m['heading'])
            cam = (cam0[0] + dx, CAM_H, cam0[2] + dz); head = m['heading'] + dh
            E = edges_facing(poly, others, cam)
            if not E: continue
            e = max(E, key=lambda e: e['vis'] * min(e['L'], 40) * e['cos'] / (1 + abs(e['d'] - 22) / 25))
            u1 = e['L']; Tf = rectify(img, cam, head, e['a'], e['b'], top, 0, u1)
            win = max(2 * 4, min(10.0, e['L'] - 1.0)); per, pst = bay_period(Tf[:, int(.5 * PPM):int((e['L'] - .5) * PPM)]) if e['L'] > 7 else (None, 0)
            if per and pst > .25 and win > 2.6 * per: win = max(2, round(win / per)) * per
            win = min(win, e['L'] - 1.0)
            x0, bad, badall = clean_window(Tf, int(win * PPM))
            tile = Tf[:, x0:x0 + int(win * PPM)]
            hv = cv2.cvtColor(tile, cv2.COLOR_BGR2HSV); sky = float(((hv[..., 2] > 195) & (hv[..., 1] < 40)).mean()); sd = float(cv2.cvtColor(tile, cv2.COLOR_BGR2GRAY).std())
            valid = max(0.0, 1 - max(0, sky - .08) * 5) * min(1.0, sd / 28)  # blown-out sky / ceiling / flat wall = the fit missed the building
            q = conf * valid * (1 - min(1, bad * 2)) * min(1, e['vis'] * 1.2) * min(1, e['cos'] * 1.3)
            rec = dict(panoId=pk['panoId'], date=m['date'], copyright=m['copyright'], fit=dict(dx=round(dx, 1), dz=round(dz, 1), dh=round(dh, 1)), fitConf=round(conf, 2), bad=round(bad, 2), face=e['i'], faceLen=round(e['L'], 1), d=round(e['d']), cos=round(e['cos'], 2), q=round(q, 3), win=round(win, 2), period=round(per, 2) if per and pst > .25 else None, tile=tile, full=Tf)
            print(cid, c.get('name'), pk['panoId'][:6], {k: v for k, v in rec.items() if k not in ('tile', 'full', 'panoId', 'copyright')}, flush=True)
            if not best or q > best['q']: best = rec
        if best: man[cid] = (c, best)
    return man

def finish(man):
    out = {}; MIN_Q = 0.75; NOT_WALL = {'way/309492283'}  # NOT_WALL: visual QA, pano frame is an interior ceiling that slipped past the sky/flat test
    for f in os.listdir(OUT + 'photo'): os.remove(OUT + 'photo/' + f)
    for cid, (c, r) in man.items():
        if r['q'] < MIN_Q or cid in NOT_WALL: continue
        t = r['tile']; h, w = t.shape[:2]
        # photos are display-referred and often shot in shade; the game lights them again, so normalise the median wall luminance to a plain-albedo level
        med = float(np.median(cv2.cvtColor(t, cv2.COLOR_BGR2GRAY))); gain = float(np.clip(125 / max(med, 20), 0.8, 3.0)); t = np.clip(t.astype(np.float32) * gain, 0, 255).astype(np.uint8)
        sc = min(1, 1024 / h, 1024 / w); t2 = cv2.resize(t, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA) if sc < 1 else t
        fn = 'photo/' + cid.replace('/', '-') + '.webp'; cv2.imwrite(OUT + fn, t2, [cv2.IMWRITE_WEBP_QUALITY, 82])
        okpx = t.reshape(-1, 3)[::7].astype(float); m_ = okpx[(okpx[:, 1] < okpx[:, 2] * 1.06)]; mean = (m_ if len(m_) > 20 else okpx).mean(0)
        who = r['copyright'].replace('From the Owner, Photo by: ', '')
        out[cid] = dict(name=c.get('name'), tex=fn, w=round(r['win'], 2), h=round(h / PPM, 2), y0=0.3, bay=r['period'], gain=round(gain, 2), confidence=r['q'], fitConf=r['fitConf'], pano=r['panoId'], date=r['date'],
                        color='#%02x%02x%02x' % tuple(int(v) for v in mean[::-1]), credit='Google Street View' + (', (c) 2026 Google' if who == 'Google' else f', (c) {who}'), fallback=False)
    # fallback: wall colour (and material class) from the 3 nearest photographed buildings, no texture
    cen = lambda c: np.mean(c['poly'], 0)
    for c in zone['colliders']:
        cid = c['id']
        if cid in out or cid not in sel: continue
        near = sorted(out, key=lambda k: np.hypot(*(cen(c) - cen(next(z for z in zone['colliders'] if z['id'] == k)))))[:3]
        rgb = np.median([[int(out[k]['color'][i:i + 2], 16) for i in (1, 3, 5)] for k in near], 0)
        r_, g_, b_ = rgb; mat = 'brick' if r_ > b_ + 14 and r_ >= g_ else 'concrete'
        out[cid] = dict(name=c.get('name'), tex=None, color='#%02x%02x%02x' % tuple(int(v) for v in rgb), mat=mat, confidence=0, fallback=True, basedOn=near,
                        credit='style from nearest photographed buildings', note='no usable Street View facade' if not man.get(cid) else 'best facade below quality threshold')
    return out

if __name__ == '__main__':
    M = run(); out = finish(M)
    if '--debug' not in sys.argv: json.dump(out, open(OUT + 'manifest.json', 'w'), indent=1)
    print(len(out), 'buildings extracted')
