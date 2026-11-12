# Rectifies Street View frames of Purdue Memorial Union into albedo tiles (packages/saltline/public/campus/hotspots/union/*.jpg).
# Raw frames are gitignored (data/raw/streetview/memorial-union); run: uv run --with opencv-python --with numpy python tools/union-rectify.py
# Camera model: 640 px, fov 90 (f = 320), pitch 0, heading h (0 = north = -z, 90 = east = +x). Poses: manifest lat/lon projected to the Bell Tower frame, then moved
# ~7-9 m to fit the photos; fitted from the visible wall ends and window scale (north 22 m from the wall, east 12.8 m): fitted by the visible wall ends and by wall height = Google-mesh eave (9 m), not taken from the manifest.
import cv2, json, numpy as np, os, sys
SV = os.environ.get('UNION_SV', '/Users/rithvikpraveenkumar/Codebox/Repos/FolkTown/data/raw/streetview/memorial-union/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'packages', 'saltline', 'public', 'campus', 'hotspots', 'union') + '/'
os.makedirs(OUT, exist_ok=True)
F, PPM = 320.0, 40

def rectify(img, cam, head, p0, p1, u_rng, y_rng):
    """Plane through ground points p0->p1 (x,z); cam=(x,eye,z); u metres along the plane from p0, y metres up."""
    cx, ch, cz = cam; h = np.radians(head)
    f = np.array([np.sin(h), -np.cos(h)]); r = np.array([np.cos(h), np.sin(h)])
    d = np.array(p1, float) - np.array(p0, float); L = np.hypot(*d); d /= L
    us = np.arange(u_rng[0], u_rng[1], 1 / PPM); ys = np.arange(y_rng[1], y_rng[0], -1 / PPM)
    U, Y = np.meshgrid(us, ys)
    X = p0[0] + d[0] * U - cx; Z = p0[1] + d[1] * U - cz
    dep = X * f[0] + Z * f[1]; lat = X * r[0] + Z * r[1]
    mx = (320 + F * lat / dep).astype(np.float32); my = (320 - F * (Y - ch) / dep).astype(np.float32)
    big = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    out = cv2.remap(big, mx * 2, my * 2, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    return cv2.fastNlMeansDenoisingColored(out, None, 3, 3, 5, 15)

def seamless(P, bx, by):
    h, w = P.shape[:2]; o = P[:h - by, :w - bx].copy()
    for x in range(bx): a = x / bx; o[:, x] = (1 - a) * P[:h - by, x + w - bx] + a * P[:h - by, x]
    o2 = o.copy()
    for y in range(by): a = y / by; o2[y] = (1 - a) * o[y + (h - 2 * by)] + a * o[y]
    return o2[:h - 2 * by]

if __name__ == '__main__':
    north = cv2.imread(SV + '-6pw5fD2pW12NluOYWf8SQ_h180.jpg')   # 2009-06 Google, looking south at the north wing wall z = 202.2
    east = cv2.imread(SV + '11UvcOX8EMp8eaLSIDAdCA_h270.jpg')    # 2017-07 Google, looking west at the SE-wing gable wall x = 296.5
    CN, CE = (238.0, 2.5, 180.2), (309.3, 2.5, 271.7)  # fitted: manifest (242.8,189.1) and (304.1,266.8) are 9 m and 7 m off
    # north wall, x 230..252 (u runs west->east reversed so x decreases to the right in the photo: u = 252 - x); y 0.3..8.6
    N = rectify(north, CN, 180, (253.1, 202.2), (216, 202.2), (0, 37), (0.0, 9.0))
    # east wall, z 264.3..274.2 (u = z increasing southwards would be mirrored; run p0 at z 274.2 -> p1 z 264.3 so north is on the right); y 0.3..10
    E = rectify(east, CE, 270, (296.5, 284.5), (296.5, 271.3), (0, 13.2), (0.0, 10.0))
    for k in range(2):  # lowest ~0.6 m is hedge/lamp/planter: mirror the clean strip above
        pass
    cv2.imwrite(OUT + 'north-wing.jpg', N, [cv2.IMWRITE_JPEG_QUALITY, 88])
    cv2.imwrite(OUT + 'east-gable.jpg', E, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print('north', N.shape, 'east', E.shape)
    if len(sys.argv) > 1:  # second pass: clean patches (pixel boxes read off the rectified tiles) -> tiles + colour stats
        cfg = json.load(open(sys.argv[1]))
        bx = cfg['brick']; Pb = (E if bx['src'] == 'east' else N)[bx['y0']:bx['y1'], bx['x0']:bx['x1']].astype(np.float32)
        g = np.clip(np.array([54, 66, 122]) / Pb.reshape(-1, 3).mean(0), 0.8, 2.2)  # BGR gain toward Purdue brick as lit in the model (122,66,54); the patch is in shade under the eave
        T = np.clip(seamless(Pb, 24, 6) * g, 0, 255)
        cv2.imwrite(OUT + 'brick-tile.jpg', np.clip(T, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90]); print('brick tile', T.shape, T.shape[1] / PPM, 'x', T.shape[0] / PPM, 'm')
        lb = cfg['stone']; St = (E if lb['src'] == 'east' else N)[lb['y0']:lb['y1'], lb['x0']:lb['x1']].astype(np.float32)
        m, sd = St.reshape(-1, 3).mean(0), St.reshape(-1, 3).std(0)
        rng = np.random.default_rng(3); g = cv2.GaussianBlur(rng.normal(0, 1, (256, 256, 3)).astype(np.float32), (0, 0), 1.2)
        stone = np.clip(np.array([166, 186, 196]) + g * sd * 1.6, 0, 255).astype(np.uint8)  # BGR; mean forced to cream limestone (the sill band is in shade)
        cv2.imwrite(OUT + 'limestone-tile.jpg', stone, [cv2.IMWRITE_JPEG_QUALITY, 90])
        sl = cfg['slate']; Sl = cv2.imread(SV + sl['file'])[sl['y0']:sl['y1'], sl['x0']:sl['x1']].astype(np.float32)
        sm, ssd = Sl.reshape(-1, 3).mean(0), Sl.reshape(-1, 3).std(0)
        json.dump({'brickBGR': Pb.reshape(-1, 3).mean(0)[::-1].round().tolist(), 'stoneRGB': m[::-1].round().tolist(), 'slateRGB': sm[::-1].round().tolist(), 'slateStd': ssd.round().tolist()}, open(OUT + 'colours.json', 'w'))
        print(open(OUT + 'colours.json').read())
