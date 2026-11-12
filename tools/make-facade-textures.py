"""Rectify facade photos into fronto-parallel tiles + facades.json + contact sheet.
Run: uv run --with opencv-python --with numpy python tools/make-facade-textures.py <srcdir>
srcdir holds: bt01.jpg (Wikimedia Purdue_Bell_Tower_Purdue_University_2016_01.jpg original),
mapi_elliott.jpg (Mapillary 750908235597635 thumb_2048), walc.jpg (reference/purdue-photos/walc-news-plant-wilmeth-now2LO.jpg).
Quad corners were picked by eye on gridded crops (see docs/assets.md)."""
import cv2, json, sys, os
import numpy as np

SRC = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f"{ROOT}/packages/saltline/public/campus/walk/tex"
os.makedirs(OUT, exist_ok=True)
rd = lambda n: cv2.imread(f"{SRC}/{n}")
bt, el, wc = rd("bt01.jpg"), rd("mapi_elliott.jpg"), rd("walc.jpg")
sheet = []  # (label, source with overlay, tile)
man = {"buildings": {}, "materials": {}}


def save(name, im, q=88):
    cv2.imwrite(f"{OUT}/{name}", im, [cv2.IMWRITE_JPEG_QUALITY, q])


def rect(img, quad, w, h):
    """quad = TL,TR,BR,BL pixel corners -> w x h fronto-parallel."""
    dst = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    return cv2.warpPerspective(img, cv2.getPerspectiveTransform(np.float32(quad), dst), (w, h), flags=cv2.INTER_CUBIC)


def tileable(im, band=0.22):
    """Cross-fade with the half-shifted copy near the borders so opposite edges match (no new content)."""
    h, w = im.shape[:2]
    def ramp(n):
        x = np.abs(np.linspace(-1, 1, n))
        t = np.clip((1 - x) / band, 0, 1)
        return t * t * (3 - 2 * t)
    m = (ramp(w)[None, :] * ramp(h)[:, None])[..., None]
    sh = np.roll(np.roll(im, h // 2, 0), w // 2, 1).astype(np.float32)
    return (im * m + sh * (1 - m)).astype(np.uint8)


def pitch(gray):
    """Vertical period (px) of the dominant row pattern = brick course height."""
    p = gray.mean(1) - gray.mean(); p = p - np.convolve(p, np.ones(61) / 61, "same")
    ac = np.correlate(p, p, "full")[len(p) - 1:]; ac /= ac[0]
    # first local maximum above 0.2 after lag 8 (brick course period); mean of later multiples would be better
    for i in range(9, 80):
        if ac[i] > 0.2 and ac[i] > ac[i - 1] and ac[i] >= ac[i + 1]: return i, float(ac[i])
    return 0, 0.0


def overlay(img, quad, c=(0, 255, 255)):
    o = img.copy(); cv2.polylines(o, [np.int32(quad)], True, c, max(2, img.shape[1] // 400)); return o


# ---------- Bell Tower (Wikimedia, Julian Herzog, CC BY 4.0) ----------
BT = dict(source="https://commons.wikimedia.org/wiki/File:Purdue_Bell_Tower_Purdue_University_2016_01.jpg",
          sourceId="commons:Purdue_Bell_Tower_Purdue_University_2016_01.jpg", captured="2016 (Commons; exact date in file page)",
          licence="CC BY 4.0", attribution="Julian Herzog, CC BY 4.0, via Wikimedia Commons")
# Shaft face A (lit face, ~33 deg off normal by shaft width ratio 686:444). Horizontal px are foreshortened by cos(33)=0.84.
q = [(1419, 3700), (2105, 3700), (2105, 4690), (1419, 4690)]
shaft = rect(bt, q, 818, 990); save("bell-shaft.jpg", shaft)
sheet.append(("Bell Tower shaft (Commons)", overlay(bt, q), shaft))
q2 = [(1467, 2810), (2101, 2810), (2101, 3600), (1467, 3600)]
clock = rect(bt, q2, 758, 790); save("bell-clock-stage.jpg", clock)
sheet.append(("Bell Tower clock stage (Commons)", overlay(bt, q2), clock))
# scale from brick course pitch (76 mm modular course) measured on the rectified shaft
k, c = pitch(cv2.cvtColor(shaft[:, 330:], cv2.COLOR_BGR2GRAY))
ppm = k / 0.076
print("bell shaft course pitch px", k, "corr", round(c, 2), "px/m", round(ppm))
man["buildings"]["bell_tower"] = {"faces": {f: [] for f in ("N", "E", "S", "W")}, "note": "Tower is a square shaft with identical faces (clocks on all four sides); compass of the photographed face is unknown (sun-lit left face, golden hour), so every face may use the same two tiles.", "all_faces": [
    dict(texture="bell-shaft.jpg", part="brick shaft bay between two limestone ledges (lower shaft; ledge spacing about 5.9 m)", size_m=[round(818 / ppm, 2), round(990 / ppm, 2)], uvRepeat=None, **BT, confidence=0.7,
         notes=f"Rectified by cropping the lit face (telephoto, vertical edges parallel) and stretching x by 1/cos33. Scale from brick course pitch ({k}px = 76 mm), +-15%. Vertical dark seam is a real expansion joint. Face is lit, opposite face in shadow."),
    dict(texture="bell-clock-stage.jpg", part="limestone clock stage incl. clock face, cornice, louvre hood", size_m=[round(758 / ppm, 2), round(790 / ppm, 2)], uvRepeat=None, **BT, confidence=0.6,
         notes="Same method. Baked sun shading and the 3D louvre hood at the bottom are projected flat; clock hands show ~8:15, baked in. Bell chamber arches above are not included.")]}

# ---------- tileable patches ----------
def patch(name, crop, size, kind, src, tile_m, conf, notes, lic):
    t = tileable(cv2.resize(crop, (size, size), interpolation=cv2.INTER_AREA if crop.shape[0] > size else cv2.INTER_CUBIC))
    save(name, t, 90)
    man["materials"][kind] = dict(texture=name, size_px=size, tile_m=round(tile_m, 2), **src, **lic, confidence=conf, notes=notes)
    return t

crop = shaft[100:350, 290:540]
t = patch("mat-brick-red.jpg", crop, 512, "brick_red", dict(source=BT["source"], sourceId=BT["sourceId"], captured=BT["captured"]), 250 / ppm, 0.7,
          "Real Purdue Bell Tower red-brown brick (rectified lit face, between the expansion joints), edge cross-faded with a half-shifted copy to tile (slight ghosting in the middle bands). Contains faint real vertical joint lines about every 0.6 m and a darker left edge, so it reads as striped when tiled.", dict(licence=BT["licence"], attribution=BT["attribution"]))
sheet.append(("brick-red tile (Bell Tower)", crop, t))
crop = bt[3000:3140, 1950:2090]
t = patch("mat-limestone-cream.jpg", crop, 128, "limestone_cream", dict(source=BT["source"], sourceId=BT["sourceId"], captured=BT["captured"]), 140 / ppm, 0.4,
          "Plain cream limestone panel beside the clock; small and low-contrast, edge cross-faded.", dict(licence=BT["licence"], attribution=BT["attribution"]))
sheet.append(("limestone-cream tile (Bell Tower)", crop, t))

# ---------- Elliott Hall (Mapillary 2020-10-31) : materials only, NOT WALC/Bell Tower ----------
MP = dict(source="https://www.mapillary.com/app/?pKey=750908235597635", sourceId="mapillary:750908235597635", captured="2020-10-31")
ML = dict(licence="CC BY-SA 4.0 (Mapillary)", attribution="Image by kennystier, CC BY-SA 4.0, via Mapillary. Share-alike: needs-clearance")
crop = el[1180:1740, 1030:1590] if False else el[150:450, 1040:1340]
t = patch("mat-brick-dark.jpg", crop, 512, "brick_dark", MP, 0, 0.5,
          "Dark purple-brown brick of Elliott Hall of Music (a different building; Purdue standard dark brick). tile_m set below from course pitch.", ML)
k2, c2 = 23, 0.0  # autocorrelation is unreliable here (oblique, shadowed); 23 px/course read by eye
man["materials"]["brick_dark"]["tile_m"] = round(300 / (k2 / 0.076), 2)
man["materials"]["brick_dark"]["notes"] += f" Scale from ~{k2}px per brick course (76 mm) read by eye; oblique view so +-30%."
sheet.append(("brick-dark tile (Elliott, Mapillary)", overlay(el, [(1040, 150), (1340, 150), (1340, 450), (1040, 450)]), t))
crop = el[780:980, 1500:1980]
crop = crop[:, :200]
t = patch("mat-limestone-ashlar.jpg", el[720:930, 1800:2010], 256, "limestone_ashlar", MP, 1.7, 0.4,
          "Grey-buff ashlar limestone base of Elliott Hall (different building; oblique view, sunlit part). tile_m is a guess (course height ~0.4 m).", ML)
sheet.append(("limestone-ashlar tile (Elliott, Mapillary)", overlay(el, [(1800, 720), (2010, 720), (2010, 930), (1800, 930)]), t))

# ---------- WALC (Purdue news photo, 2018, in reference/; needs-clearance) ----------
f, cx, cy = 674.0, 400.0, 729.0  # from two horizontal vanishing points (~(1074,731) and (-274..-438,729)): corner bisected at 45 deg
K = np.array([[f, 0, cx], [0, f, cy], [0, 0, 1.0]])
def metric_aspect(quad, dirx):
    u = np.array([dirx, 0, 1.0]) / np.sqrt(2); v = np.array([0, 1.0, 0])
    O = np.linalg.inv(K) @ np.array([*quad[3], 1.0])
    Hm = K @ np.column_stack([u, v, O]); Hi = np.linalg.inv(Hm)
    P = []
    for p in quad:
        s = Hi @ np.array([*p, 1.0]); P.append(s[:2] / s[2])
    P = np.array(P)  # unit: depth of BL
    wdt = (np.linalg.norm(P[1] - P[0]) + np.linalg.norm(P[2] - P[3])) / 2
    hgt = np.linalg.norm(P[3] - P[0])
    return wdt / hgt
WC = dict(source="https://www.purdue.edu/uns/images/2018/plant-wilmeth-now2LO.jpg", sourceId="reference/purdue-photos/walc-news-plant-wilmeth-now2LO.jpg (page https://www.purdue.edu/newsroom/archive/purduetoday/releases/2018/Q4/then-and-now-wilmeth.html)",
          captured="2018 (Purdue news, then-and-now)", licence="needs-clearance (Purdue University photo, rights unknown)", attribution="Purdue University / Purdue Today")
H_M = 10.2  # two upper storeys + frieze, from LiDAR eave 17.2 m and 3-storey proportions
faces = []
for name, quad, dx, desc in [
    ("walc-wall-paired-windows.jpg", [(337, 540), (497, 581), (497, 689), (337, 677)], 1, "wall with paired double-hung windows, upper two storeys, between stringcourse and cornice"),
    ("walc-wall-tall-slits.jpg", [(50, 632), (322, 541), (322, 678), (50, 716)], -1, "wall with tall slit window bays (3 bays recessed) and dark brick, upper two storeys")]:
    a = metric_aspect(quad, dx); w_m = a * H_M
    ppm_w = 32; W, Hh = int(round(w_m * ppm_w)), int(round(H_M * ppm_w))
    W = min(W, 2048); tile = rect(wc, quad, W, Hh)
    tile = cv2.GaussianBlur(tile, (0, 0), 0.6); save(name, tile)
    sheet.append((name[:-4] + " (WALC photo)", overlay(wc, quad), tile))
    faces.append(dict(texture=name, part=desc, size_m=[round(w_m, 1), H_M], uvRepeat=None, **WC, confidence=0.3,
                      notes=f"Source photo is only 800x887 (about 13 px/m at the near edge), so the tile is upsampled ~2.5x and soft. Metric aspect {a:.2f} from vanishing-point camera model (f=674px, corner bisected at 45 deg), absolute height ASSUMED {H_M} m. Compass face NOT known (photo is of one WALC corner; its two faces are these two). Use as generic WALC brick/window look, not as an exact face."))
man["buildings"]["walc"] = {"faces": {f: [] for f in ("N", "E", "S", "W")}, "unassigned_to_compass": faces,
    "note": "No photo of WALC with a known compass face was found (Mapillary has none within 40 m, Commons has no WALC file). Faces N/E/S/W are empty; the two unassigned tiles are one corner of the real building, orientation unknown."}
# glass patch from WALC tall slit window bays (very low res)
crop = wc[600:690, 98:140]
t = patch("mat-glass-window.jpg", cv2.resize(crop, (128, 128), interpolation=cv2.INTER_CUBIC), 128, "glass_window", dict(source=WC["source"], sourceId=WC["sourceId"], captured=WC["captured"]), 0.0, 0.25,
          "WALC cream-framed glazing, about 40x90 px in the source: upsampled and soft, reflections baked in. Prefer a procedural glass material; kept only as a colour reference.", dict(licence=WC["licence"], attribution=WC["attribution"]))
sheet.append(("glass tile (WALC photo)", overlay(wc, [(98, 600), (140, 600), (140, 690), (98, 690)]), t))

json.dump(man, open(f"{ROOT}/packages/saltline/public/campus/walk/facades.json", "w"), indent=1)

# ---------- contact sheet: source (with quad) | rectified ----------
CH = 360; rows = []
for lab, srcim, tile in sheet:
    a = cv2.resize(srcim, (int(srcim.shape[1] * CH / srcim.shape[0]), CH)); b = cv2.resize(tile, (int(tile.shape[1] * CH / tile.shape[0]), CH))
    a = a[:, :560]; b = b[:, :560]
    r = np.full((CH + 24, 1130, 3), 30, np.uint8); r[24:, :a.shape[1]] = a; r[24:, 570:570 + b.shape[1]] = b
    cv2.putText(r, lab, (6, 17), 0, 0.55, (255, 255, 255), 1); rows.append(r)
cols = [np.vstack(rows[i::2] + [np.full((1, 1130, 3), 30, np.uint8)] * 0) for i in range(2)]
n = max(len(c) for c in cols)
os.makedirs(f"{ROOT}/docs/img", exist_ok=True)
L = np.vstack(rows[0::2]); R = np.vstack(rows[1::2])
if R.shape[0] < L.shape[0]: R = np.vstack([R, np.full((L.shape[0] - R.shape[0], 1130, 3), 30, np.uint8)])
cv2.imwrite(f"{ROOT}/docs/img/v2-textures.jpg", cv2.resize(np.hstack([L, R]), None, fx=0.7, fy=0.7, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 85])
