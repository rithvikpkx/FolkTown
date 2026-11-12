# Rectifies Street View frames of WALC into albedo tiles (public/campus/walk/walc/*.jpg) and prints sampled colours.
# Raw images are gitignored (data/raw/streetview); run: uv run --with opencv-python --with numpy python tools/walc-rectify.py
# Camera model: 640 px, fov 90 (f = 320), pitch fitted to 0, eye 1.7 m. Camera positions are FITTED to the photos (the manifest lat/lon sit ~8 m off the OSM footprint).
import cv2, json, numpy as np, os
SV = '/Users/rithvikpraveenkumar/Codebox/Repos/FolkTown/data/raw/streetview/walc/'
OUT = os.path.join(os.path.dirname(__file__), '..', 'packages', 'saltline', 'public', 'campus', 'walk', 'walc') + '/'
os.makedirs(OUT, exist_ok=True)
F = 320.0
PPM = 40  # output pixels per metre

def rectify(img, cam, p0, p1, u_rng, y_rng, name):
    """Plane through ground points p0->p1 (x,z); cam=(x,h,z) looking east. u metres along the plane from p0, y metres up."""
    cx, ch, cz = cam
    d = np.array(p1) - np.array(p0); L = np.hypot(*d); d /= L
    us = np.arange(u_rng[0], u_rng[1], 1 / PPM); ys = np.arange(y_rng[1], y_rng[0], -1 / PPM)
    U, Y = np.meshgrid(us, ys)
    X = p0[0] + d[0] * U; Z = p0[1] + d[1] * U
    mx = (320 + F * (Z - cz) / (X - cx)).astype(np.float32); my = (320 - F * (Y - ch) / (X - cx)).astype(np.float32)
    big = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)  # upsample once, then sample (no invented detail)
    out = cv2.remap(big, mx * 2, my * 2, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    out = cv2.fastNlMeansDenoisingColored(out, None, 3, 3, 5, 15)  # light denoise
    return out

def gain(img, box, target):
    """per-channel gain so the clean limestone box (x0,y0,x1,y1 in the OUTPUT) matches the target colour (BGR), clamped to avoid blowing noise"""
    x0, y0, x1, y1 = box; m = img[y0:y1, x0:x1].reshape(-1, 3).mean(0)
    g = np.clip(np.array(target) / m, 0.8, 1.8)
    return g

def apply(img, g):
    return np.clip(img.astype(np.float32) * g, 0, 255).astype(np.uint8)

west = cv2.imread(SV + 'CAoSF0NJSE0wb2dLRUlDQWdJQzZzNVRTbWdF_h90.jpg')
CAM_W = (25.1, 1.7, 5.5)
# A: south pavilion west face, corner (41.59, 5.69) -> (42.75, 27.70)
A = rectify(west, CAM_W, (41.59, 5.69), (42.75, 27.70), (0, 19.5), (0, 17.4), 'A')
# B: colonnade face x = 45.3; u runs south from z=-26 so north is on the left as seen from outside. Photo covers z -14.7..5.7 -> u 11.3..31.7
B = rectify(west, CAM_W, (45.3, -26), (45.3, 5.7), (11.3, 31.7), (0, 16.4), 'B')
# C: south face of the south bulge (2017 daylight frame): image quad -> rectangle, y 2.6..16.4 (the site fence hides the base), u 0..10.1
south = cv2.imread(SV + '_2SMIzURFlvLO3vHwJQjiA_h0.jpg')
W, H = int(10.1 * PPM), int(13.8 * PPM)
Hm = cv2.getPerspectiveTransform(np.float32([[66, 130], [230, 129], [230, 346], [66, 343]]), np.float32([[0, 0], [W, 0], [W, H], [0, H]]))
C = cv2.warpPerspective(cv2.resize(south, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC), Hm @ np.diag([.5, .5, 1]), (W, H), flags=cv2.INTER_CUBIC)
C = cv2.fastNlMeansDenoisingColored(C, None, 3, 3, 5, 15)
# limestone belt courses should read buff (RGB ~ 205,197,180); each lighting gets its own clamped gain
tgt = (180, 197, 205)
gW = gain(A, (330, 445, 700, 458), tgt); gC = gain(C, (60, 432, 340, 440), tgt)
print('gain west BGR', gW, 'south BGR', gC)
A, B, C = apply(A, gW), apply(B, gW), apply(C, gC)
A[636:] = A[576:636][::-1]  # shrubs and planter hide y < 1.5 m: mirror the clean strip above (all of it is plinth or glazing in the model)
# tileable brick: clean wall strip between the window rows (5.5 x 2 m), mirror-tiled 2x2 so seams vanish; limestone: noise-free mean + the real grain std of a pier/belt patch
P = A[168:222, 100:700].astype(np.float32)  # 15 x 1.35 m of clean wall between two window rows; blended into a seamless tile (both axes)
def seamless(P, bx, by):
    h, w = P.shape[:2]; o = P[:h - by, :w - bx].copy()
    for x in range(bx): a = x / bx; o[:, x] = (1 - a) * P[:h - by, x + w - bx] + a * P[:h - by, x]
    o2 = o[:h - by - by].copy() if False else o.copy()
    for y in range(by): a = y / by; o2[y] = (1 - a) * o[y + (h - 2 * by)] + a * o[y] if h - 2 * by + y < o.shape[0] else o[y]
    return o2[:h - 2 * by]
T = seamless(P, 40, 6)
cv2.imwrite(OUT + 'brick-tile.jpg', np.clip(T, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90]); print('brick tile', T.shape, 'px; metres', T.shape[1] / PPM, T.shape[0] / PPM)
st = B[150:330, 200:235].astype(np.float32); m, sd = st.reshape(-1, 3).mean(0), st.reshape(-1, 3).std(0)
rng = np.random.default_rng(3); g = cv2.GaussianBlur(rng.normal(0, 1, (256, 256, 3)).astype(np.float32), (0, 0), 1.2)
stone = np.clip(np.array([204, 196, 179])[::-1] + g * sd * 1.4, 0, 255).astype(np.uint8)  # BGR; mean forced to the corrected limestone colour
cv2.imwrite(OUT + 'limestone-tile.jpg', stone, [cv2.IMWRITE_JPEG_QUALITY, 90])
cv2.imwrite(OUT + 'west-pavilion.jpg', A, [cv2.IMWRITE_JPEG_QUALITY, 88])
cv2.imwrite(OUT + 'colonnade.jpg', B, [cv2.IMWRITE_JPEG_QUALITY, 88])
cv2.imwrite(OUT + 'south-bulge.jpg', C, [cv2.IMWRITE_JPEG_QUALITY, 88])
mean = lambda im, b: [int(v) for v in im[b[1]:b[3], b[0]:b[2]].reshape(-1, 3).mean(0)[::-1]]
stats = {  # RGB means of clean regions after gain
    'brick': mean(A, (255, 175, 300, 215)), 'brickSouth': mean(C, (10, 450, 90, 520)),
    'limestone': mean(A, (330, 445, 700, 458)), 'limestonePier': mean(B, (200, 150, 235, 330)),
    'glass': mean(A, (100, 60, 140, 120)), 'glassColonnade': mean(B, (280, 160, 330, 230)), 'bronzeFrame': mean(B, (262, 20, 270, 360)),
}
print(json.dumps(stats))
json.dump(stats, open(OUT + 'colours.json', 'w'))
