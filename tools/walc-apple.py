# Camera poses for the Apple Maps frames of WALC (data/raw/apple-maps-walc, gitignored) and metric rectification of any wall or roof plane.
#   uv run --with opencv-python-headless --with numpy --with scipy python tools/walc-apple.py fit                  -> tools/walc-apple.json
#   ... tools/walc-apple.py rect west-mid "(43.4,0,0)" "(0,0,1)" -57 -34 -1 19 out.jpg [px per m]            -> plane through the origin point, u along the given
#        unit vector, v up; ticks every metre. Used for every facade measurement in packages/saltline/src/campus/walc.js (docs/walc-hifi.md).
# Model: pinhole, no roll, principal point at the Maps window centre (the frames are the window cropped by x 0, y 104, so (1600, 845) px), heading clockwise
# from north, tilt from straight down. Control points: roof corners, ridge ends and monitor corners, whose world positions come from the Google mesh
# top-down height raster and LiDAR (hip edges 41.4..101 x -56.05..-33 and 41.5..101 x 5.45..30.55 at 17.0 m, ridges 21.8 / 22.3 m, monitor 19.4 m);
# pixel positions were read off gridded crops by eye (about +/-5 px, 0.2 m). Residuals 2-18 px.
import cv2, json, numpy as np, os, sys
from scipy.optimize import least_squares
HERE = os.path.dirname(os.path.abspath(__file__)) + '/'
AM = '/Users/rithvikpraveenkumar/Codebox/Repos/FolkTown/data/raw/apple-maps-walc/'
CX, CY = 1600.0, 845.0
N = dict(NW=(41.4, 17.0, -56.05), SW=(41.4, 17.0, -33.0), RW=(52.9, 21.83, -44.5), RE=(89.5, 21.83, -44.5), NE=(101.0, 17.0, -56.05), SE=(101.0, 17.0, -33.0))
S = dict(RW=(54.05, 22.27, 18.0), RE=(88.45, 22.27, 18.0), SW=(41.5, 17.0, 30.55), NW=(41.5, 17.0, 5.45), NE=(101.0, 17.0, 5.45), SE=(101.0, 17.0, 30.55))
M = dict(NW=(64.3, 19.4, -24.2), SW=(64.3, 19.4, 3.6), NE=(75.9, 19.4, -24.2), SE=(75.9, 19.4, 3.6))
PTS = {  # frame: (heading guess, tilt guess, ground target x z, [(world, pixel)])
    'west-mid': (90, 50, (41.6, -14), [(N['NW'], (648, 1081)), (N['SW'], (1245, 1077)), (N['RW'], (971, 815)), (N['RE'], (1077, 401)), (N['NE'], (893, 381)), (N['SE'], (1328, 375)), (S['RW'], (2537, 785)), (S['RE'], (2380, 399)),
                                       (S['SW'], (2913, 1069)), (S['NW'], (2262, 1072)), (S['NE'], (2085, 377)), (S['SE'], (2560, 372)), (M['NW'], (1497, 700)), (M['SW'], (2129, 710)), (M['NE'], (1497, 588)), (M['SE'], (2110, 583))]),
    'west-4': (90, 70, (35.6, -36), [(N['NW'], (1185, 842)), (N['RE'], (1492, 435)), (N['RW'], (1481, 621)), (N['SW'], (1758, 839)), (N['NE'], (1298, 468)), (N['SE'], (1713, 456)), (S['RE'], (2742, 435)),
                                     (M['NW'], (1919, 600)), (M['SW'], (2553, 600)), (M['NE'], (1919, 556)), (M['SE'], (2516, 548))]),
    'east-mid': (270, 52, (101.6, -14), [(N['RE'], (2247, 817)), (N['RW'], (2143, 424)), (N['NE'], (2572, 1088)), (N['SE'], (1979, 1092)), (N['NW'], (2340, 400)), (S['RE'], (688, 785)), (S['RW'], (838, 414)), (S['NE'], (951, 1081)),
                                         (M['SE'], (1100, 694)), (M['NE'], (1722, 692)), (M['SW'], (1118, 572)), (M['NW'], (1719, 572)), ((89.5, 16.2, 5.5), (1017, 931)), ((89.5, 16.2, -27.5), (1819, 933))]),
    'south-mid': (0, 52, (71.6, 36), [(S['SW'], (985, 488)), (S['SE'], (2210, 481)), (S['RW'], (1244, 278)), (S['RE'], (1944, 278)), (S['NE'], (2131, 269)), (M['SW'], (1472, 219)), (M['SE'], (1671, 215)), (M['NW'], (1477, 35)), (M['NE'], (1665, 35)),
                                      ((100.0, 16.2, -27.6), (2056, 60))]),
}
def basis(h, t):
    h, t = np.radians(h), np.radians(t)
    return np.array([np.sin(h) * np.sin(t), -np.cos(t), -np.cos(h) * np.sin(t)]), np.array([np.cos(h), 0, np.sin(h)]), np.array([np.sin(h) * np.cos(t), np.sin(t), -np.cos(h) * np.cos(t)])
def project(p, P):  # p = [Cx, Cy, Cz, heading, tilt, f px]
    fw, r, u = basis(p[3], p[4]); d = np.atleast_2d(P) - np.array(p[:3]); z = d @ fw
    return np.stack([CX + p[5] * (d @ r) / z, CY - p[5] * (d @ u) / z], 1)
def fit(h0, t0, target, pts):
    Pw = np.array([q[0] for q in pts], float); Pi = np.array([q[1] for q in pts], float); best = None
    for f0 in (1500, 2500, 4000, 6000, 9000):
        for t in (t0 - 20, t0 - 10, t0, t0 + 10):
            C0 = np.array([target[0], 0, target[1]]) - basis(h0, t)[0] * f0 / 27.0
            p = least_squares(lambda p: (project(p, Pw) - Pi).ravel(), [*C0, h0, t, f0], loss='soft_l1', f_scale=8).x; e = np.abs(project(p, Pw) - Pi).max(1)
            if best is None or np.median(e) < np.median(best[1]): best = (p, e)
    return best
if sys.argv[1] == 'fit':
    out = {}
    for n, (h0, t0, tg, pts) in PTS.items():
        p, e = fit(h0, t0, tg, pts); C = p[:3]; T = C + basis(p[3], p[4])[0] * 150; print(n, 'C', np.round(C, 1), 'heading %.2f tilt %.2f f %.0f' % tuple(p[3:6]), 'residual px', np.round(e, 1))
        out[n] = dict(cam=[round(float(v), 2) for v in [*C, *T]], fov=round(float(np.degrees(2 * np.arctan(949 / p[5]))), 2), heading=round(float(p[3]), 2), tiltFromVertical=round(float(p[4]), 2), fpx=round(float(p[5])))
    json.dump(out, open(HERE + 'walc-apple.json', 'w'), indent=1)
else:
    frame, o, ud = sys.argv[2], np.array(eval(sys.argv[3]), float), np.array(eval(sys.argv[4]), float); u0, u1, y0, y1 = map(float, sys.argv[5:9]); ppm = float(sys.argv[10]) if len(sys.argv) > 10 else 40
    q = json.load(open(HERE + 'walc-apple.json'))[frame]; C = np.array(q['cam'][:3]); p = [*C, q['heading'], q['tiltFromVertical'], q['fpx']]
    U, Y = np.meshgrid(np.arange(u0, u1, 1 / ppm), np.arange(y1, y0, -1 / ppm)); P = o + U[..., None] * ud + Y[..., None] * np.array([0, 1.0, 0])
    uv = project(p, P.reshape(-1, 3)).reshape(*U.shape, 2).astype(np.float32); r = cv2.remap(cv2.imread(AM + frame + '.png'), uv[..., 0], uv[..., 1], cv2.INTER_CUBIC)
    for u in np.arange(np.ceil(u0), u1): cv2.line(r, (int((u - u0) * ppm), 0), (int((u - u0) * ppm), 14 if u % 5 == 0 else 6), (0, 255, 255), 1); u % 5 == 0 and cv2.putText(r, '%g' % u, (int((u - u0) * ppm) + 2, 24), 0, 0.4, (0, 255, 255), 1)
    for y in np.arange(np.ceil(y0), y1): cv2.line(r, (0, int((y1 - y) * ppm)), (14 if y % 5 == 0 else 6, int((y1 - y) * ppm)), (0, 255, 255), 1); y % 5 == 0 and cv2.putText(r, '%g' % y, (16, int((y1 - y) * ppm) + 4), 0, 0.4, (0, 255, 255), 1)
    cv2.imwrite(sys.argv[9], r, [cv2.IMWRITE_JPEG_QUALITY, 92])
