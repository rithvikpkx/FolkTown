"""Builds the roof atlas, roof classes and far-field ground albedo from tools/google-topdown.mjs tiles.
Run: uv run --with pillow --with numpy --with scipy python tools/google-roofs.py [topdownDir]
Writes: packages/saltline/public/campus/walk/roofs/atlas-N.webp, ground-far.jpg, src/campus/roofs.json,
        data/google/derived/{height,canopy}.png (not bundled). Frame: x east, z south, image row 0 = minZ."""
import json, sys, colorsys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

D = sys.argv[1] if len(sys.argv) > 1 else 'data/google/topdown'
PUB = 'packages/saltline/public/campus/walk/'
m = json.load(open(f'{D}/meta.json')); T, MPP, X0, Z0 = m['tile'], m['mpp'], m['x0'], m['z0']
W, Hh = m['cols'] * T, m['rows'] * T
C = np.zeros((Hh, W, 3), np.uint8); H = np.zeros((Hh, W), np.float32)
for j in range(m['rows']):
    for i in range(m['cols']):
        C[j*T:(j+1)*T, i*T:(i+1)*T] = np.array(Image.open(f'{D}/c_{i}_{j}.png').convert('RGB'))
        h = np.array(Image.open(f'{D}/h_{i}_{j}.png').convert('RGB')).astype(np.float32)
        H[j*T:(j+1)*T, i*T:(i+1)*T] = (h[..., 0] * 256 + h[..., 1]) / 65535 * 140 - 20
zone = json.load(open('data/zones/mall-union.json'))
px = lambda x, z: ((x - X0) / MPP, (z - Z0) / MPP)

def raster(polys, grow_m=0.0):
    im = Image.new('L', (W, Hh), 0); d = ImageDraw.Draw(im)
    for p in polys: d.polygon([px(*q) for q in p], fill=255)
    a = np.array(im) > 0
    return ndi.binary_dilation(a, iterations=int(grow_m / MPP)) if grow_m > 0 else a

# --- height above ground: ground = smoothed local minimum (windows larger than any building)
s = 8
Hs = H[::s, ::s]
ground = ndi.gaussian_filter(ndi.minimum_filter(Hs, size=int(120 / (MPP * s))), 20 / (MPP * s))
hag = H - np.kron(ground, np.ones((s, s), np.float32))[:Hh, :W]
foot = raster([c['poly'] for c in zone['colliders']], 2.0)
Cf = C.astype(np.float32)
exg = 2 * Cf[..., 1] - Cf[..., 0] - Cf[..., 2]
# canopy = tall, green-ish or dark-leafy, not a known building
canopy = (hag > 2.2) & (exg > 3) & ~foot
canopy = ndi.binary_closing(canopy, iterations=3)
canopy = ndi.binary_opening(canopy, iterations=2)
canopy_d = ndi.binary_dilation(canopy, iterations=int(0.6 / MPP))  # leaf edge + its shadow fringe
tall = hag > 2.2
Image.fromarray((np.clip(hag, 0, 60) / 60 * 255).astype(np.uint8)).save('data/google/derived-height.png')
Image.fromarray((canopy * 255).astype(np.uint8)).resize((W // 4, Hh // 4)).save('data/google/derived-canopy.png')
print('canopy fraction', canopy.mean().round(3))

lum = lambda a: (a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722)
lin = lambda a: np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
def nconv(img, valid, sigma):  # normalised convolution: smooth only over valid pixels
    w = ndi.gaussian_filter(valid.astype(np.float32), sigma)
    num = np.stack([ndi.gaussian_filter(img[..., k] * valid, sigma) for k in range(img.shape[2])], -1) if img.ndim == 3 else ndi.gaussian_filter(img * valid, sigma)
    return (num / np.maximum(w, 1e-4)[..., None] if img.ndim == 3 else num / np.maximum(w, 1e-4)), w
def lift(img, L, valid, sigma, thr=0.72, cap=1.45):
    """Brighten cast-shadow pixels (much darker than their valid surroundings) toward the surroundings."""
    ref, _ = nconv(L[..., None], valid & (L > np.percentile(L[valid], 25)), sigma) if valid.any() else (L[..., None], 0)
    ref = ref[..., 0]
    k = np.clip((thr * ref - L) / (0.25 * ref + 1e-4), 0, 1); k = ndi.gaussian_filter(k, 1.5)
    g = 1 + k * (np.clip(ref / np.maximum(L, 1e-3), 1, cap) - 1)
    return img * g[..., None]

# --- exposure: match photo lawn to the PBR grass albedo of the walk scene
lawn = (exg > 12) & (hag < 1.0) & ~foot
grass = np.array(Image.open(PUB + 'grass-albedo.jpg').convert('RGB')).astype(np.float32) / 255
gl = lum(lin(grass)).mean() * 0.9  # shader tints grass by ~0.9 on average
pl = lum(lin(Cf[lawn] / 255)).mean()
GAIN = float(np.clip(gl / pl, 0.4, 1.6))
print('lawn lum photo', round(pl, 3), 'pbr', round(gl, 3), 'gain', round(GAIN, 3))
def expose(a255):  # sRGB 0-255 -> sRGB 0-255, linear gain
    l = lin(a255 / 255) * GAIN
    return np.clip(np.where(l <= 0.0031308, l * 12.92, 1.055 * np.maximum(l, 0) ** (1 / 2.4) - 0.055), 0, 1) * 255

# --- far-field ground albedo (region x -200..320, z -350..365)
gx0, gz0, gw, gh = -200, -350, 520, 715
gpx = 3072; gpy = round(gpx * gh / gw)
bx, by = int((gx0 - X0) / MPP), int((gz0 - Z0) / MPP)
bw, bh = int(gw / MPP), int(gh / MPP)
sub = lambda a: a[by:by + bh, bx:bx + bw]
Gc = np.array(Image.fromarray(sub(C)).resize((gpx, gpy), Image.LANCZOS)).astype(np.float32)
size = (gpx, gpy)
rs = lambda a: np.array(Image.fromarray((sub(a) * 255).astype(np.uint8)).resize(size, Image.BILINEAR)) > 127
can = rs(canopy_d); tl = rs(tall); ft = rs(foot)
gexg = 2 * Gc[..., 1] - Gc[..., 0] - Gc[..., 2]
lawn_s = (gexg > 12) & ~can & ~tl & ~ft
sig = 30 / (gw / gpx)  # ~30 m
lawn_c, w = nconv(Gc, lawn_s, 5.0)
lawn_c2, _ = nconv(Gc, lawn_s, 20.0)
fill = np.where((w > 0.05)[..., None], lawn_c, lawn_c2)
mix = np.clip(ndi.gaussian_filter(can.astype(np.float32), 1.2), 0, 1)[..., None]
Gc = Gc * (1 - mix) + fill * mix
# lift shadows cast by buildings/trees on the ground
shadowzone = ndi.binary_dilation(tl | can, iterations=int(14 / (gw / gpx))) & ~tl
Gc = np.where(shadowzone[..., None], lift(Gc, lum(Gc), ~tl & ~can & ~shadowzone, 6.0 / (gw / gpx) * 3, 0.75, 1.35), Gc)
Gc = expose(Gc)
Image.fromarray(Gc.astype(np.uint8)).save(PUB + 'ground-far.jpg', quality=84, optimize=True)
json.dump({'xMin': gx0, 'zMin': gz0, 'w': gw, 'h': gh, 'gain': GAIN}, open(PUB + 'ground-far.json', 'w'))

# --- roofs
def classify(rgb):  # rgb 0-255 median of the (un-exposed) photo roof
    r, g, b = rgb / 255; h, sa, v = colorsys.rgb_to_hsv(r, g, b)
    if r > g * 1.1 and r > b * 1.18 and sa > 0.17 and v > 0.3: return 'terracotta'
    if g > r * 1.06 and g > b * 1.02 and sa > 0.08: return 'green'
    if v < 0.55: return 'slate'
    if b - r > 0.03 and sa > 0.07: return 'metal'
    return 'membrane'
S_PX = [8, 6, 5, 4, 3, 2.5, 2]
rects = []
for c in zone['colliders']:
    xs = [q[0] for q in c['poly']]; zs = [q[1] for q in c['poly']]
    bb = [min(xs) - 0.3, min(zs) - 0.3, max(xs) + 0.3, max(zs) + 0.3]
    x0, y0 = int((bb[0] - X0) / MPP), int((bb[1] - Z0) / MPP); x1, y1 = int((bb[2] - X0) / MPP) + 1, int((bb[3] - Z0) / MPP) + 1
    x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, W), min(y1, Hh)  # clip to the mosaic; the box follows
    bb = [X0 + x0 * MPP, Z0 + y0 * MPP, X0 + x1 * MPP, Z0 + y1 * MPP]
    cr = C[y0:y1, x0:x1].astype(np.float32)
    im = Image.new('L', (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(im).polygon([((q[0] - X0) / MPP - x0, (q[1] - Z0) / MPP - y0) for q in c['poly']], fill=255)
    inside = ndi.binary_erosion(np.array(im) > 0, iterations=int(0.35 / MPP))
    bad = ndi.binary_dilation(canopy[y0:y1, x0:x1], iterations=int(0.5 / MPP))
    # walls/ground slivers from slight misregistration: keep pixels near the roof height only
    hh = H[y0:y1, x0:x1]
    good = inside & ~bad
    if good.sum() < 20: good = inside
    rh = np.median(hh[good]) if good.any() else 0
    good = good & (np.abs(hh - rh) < 5.0)
    if good.sum() < 20: good = inside
    med = np.median(cr[good], 0)
    rects.append(dict(id=c['id'], bb=bb, cr=cr, good=good, inside=inside, med=med, cls=classify(med)))

def pack(sc):  # shelf packing into 2048 pages; returns page count or None
    pages = []  # each: list of shelves [x, y, h]; page height used = last shelf y+h
    for i in sorted(range(len(rects)), key=lambda i: -(rects[i]['bb'][3] - rects[i]['bb'][1])):
        r = rects[i]; w_ = int((r['bb'][2] - r['bb'][0]) * sc) + 2; h_ = int((r['bb'][3] - r['bb'][1]) * sc) + 2
        if w_ > 2048 or h_ > 2048: return None
        for pi, sh in enumerate(pages):
            for s_ in sh:
                if s_[2] >= h_ and s_[0] + w_ <= 2048:
                    r['slot'] = (pi, s_[0], s_[1], w_, h_); s_[0] += w_; break
            else:
                y = sh[-1][1] + sh[-1][2]
                if y + h_ <= 2048: sh.append([w_, y, h_]); r['slot'] = (pi, 0, y, w_, h_)
            if 'slot' in r: break
        else:
            pages.append([[w_, 0, h_]]); r['slot'] = (len(pages) - 1, 0, 0, w_, h_)
    return pages if len(pages) <= 2 else None
for sc in S_PX:
    for r in rects: r.pop('slot', None)
    pages = pack(sc)
    if pages: break
print('atlas px/m', sc, 'pages', len(pages))
atl = [np.zeros((2048, 2048, 3), np.uint8) + 90 for _ in pages]
out = {'pages': [f'roofs/atlas-{i}.webp' for i in range(len(pages))], 'gain': GAIN, 'buildings': {}}
for r in rects:
    p, sx, sy, w_, h_ = r['slot']
    cr = r['cr']; good = r['good']
    L = lum(cr)
    fillc, fw = nconv(cr, good, 8.0 / MPP / 8)
    fillc = np.where((fw > 0.02)[..., None], fillc, r['med'])  # holes (trees, off-roof slivers) take surrounding roof colour
    img = np.where(good[..., None], cr, fillc)
    img = lift(img, lum(img), good, 2.5 / MPP, 0.6, 1.5)
    img = expose(img)
    pil = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((w_ - 2, h_ - 2), Image.LANCZOS)
    atl[p][sy + 1:sy + h_ - 1, sx + 1:sx + w_ - 1] = np.array(pil)
    bb = r['bb']
    out['buildings'][r['id']] = dict(p=p, uv=[round((sx + 1) / 2048, 5), round((sy + 1) / 2048, 5), round((sx + w_ - 1) / 2048, 5), round((sy + h_ - 1) / 2048, 5)],
        box=[round(v, 2) for v in bb], cls=r['cls'], color='#%02x%02x%02x' % tuple(int(v) for v in expose(r['med'][None])[0]))
for i, a in enumerate(atl): Image.fromarray(a).save(PUB + f'roofs/atlas-{i}.webp', quality=82, method=6)
json.dump(out, open('packages/saltline/src/campus/roofs.json', 'w'), separators=(',', ':'))
names = {c['id']: c.get('name') or c['id'] for c in zone['colliders']}
by = {}
for r in rects: by.setdefault(r['cls'], []).append(names[r['id']])
for k, v in by.items(): print(k, len(v), '; '.join(map(str, v)))
