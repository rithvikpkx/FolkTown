"""Pilot roofs: USGS 3DEP Indiana 2017 QL2 points (cached by heights.py) -> data/pilot/roofs.json.

Per building inside the pilot box: ground elevation, eave/ridge height above ground, up to 3 RANSAC roof
planes, a 1 m height raster, parapet estimate (flat roofs only) and rooftop plant boxes.
Everything is measured from the point cloud; nothing is hand-set. Local frame: x east, z south (m).
Run: pnpm map:pilot-roofs
"""
import io, json, math, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import laspy, numpy as np
from pyproj import Transformer
from scipy import ndimage
from shapely.geometry import Polygon, box
from shapely.prepared import prep
import shapely

sys.path.insert(0, str(Path(__file__).parent))
import heights as H  # reuse EPT cache + node walk

ROOT = H.ROOT
BOX = (-40, 180, -190, 40)  # x0, x1, z0, z1 local metres (the pilot box)
GROUND_PAD = 20
rng = np.random.default_rng(1)


def main():
    o = json.loads((ROOT / "data/campus.json").read_text())["origin"]
    k = math.cos(o["lat"] * H.RAD)
    m = H.R * H.RAD
    to_ll = Transformer.from_crs(26916, 4326, always_xy=True)
    to_3857 = Transformer.from_crs(4326, 3857, always_xy=True)
    utm = Transformer.from_crs(3857, 26916, always_xy=True)

    def loc_to_ll(x, z):
        return o["lon"] + x / (m * k), o["lat"] - z / m

    pad = GROUND_PAD + 10
    c = [to_3857.transform(*loc_to_ll(x, z)) for x in (BOX[0] - pad, BOX[1] + pad) for z in (BOX[2] - pad, BOX[3] + pad)]
    bb = (min(p[0] for p in c) - 30, min(p[1] for p in c) - 30, max(p[0] for p in c) + 30, max(p[1] for p in c) + 30)
    keys = H.nodes(bb)
    print(len(keys), "EPT nodes", file=sys.stderr)

    X, Z, Y, C = [], [], [], []
    with ThreadPoolExecutor(8) as ex:
        for las in ex.map(lambda key: laspy.read(io.BytesIO(H.cached_bin(key))), keys):
            lon, lat = to_ll.transform(*utm.transform(np.asarray(las.x), np.asarray(las.y)))
            X.append((lon - o["lon"]) * m * k)
            Z.append(-(lat - o["lat"]) * m)
            Y.append(np.asarray(las.z, np.float32))
            C.append(np.asarray(las.classification))
    X, Z, Y, C = map(np.concatenate, (X, Z, Y, C))
    sel = (X > BOX[0] - pad) & (X < BOX[1] + pad) & (Z > BOX[2] - pad) & (Z < BOX[3] + pad)
    X, Z, Y, C = X[sel], Z[sel], Y[sel], C[sel]
    area = (BOX[1] - BOX[0] + 2 * pad) * (BOX[3] - BOX[2] + 2 * pad)
    print(len(X), "points; density", round(len(X) / area, 2), "/m2; classes", dict(zip(*np.unique(C, return_counts=True))), file=sys.stderr)

    campus = json.loads((ROOT / "data/campus.json").read_text())
    pilot_box = box(BOX[0], BOX[2], BOX[1], BOX[3])
    gmask = C == 2
    out = []
    for b in campus["buildings"]:
        poly = Polygon(b["outer"], [h for h in b.get("holes", [])])
        if not poly.is_valid:
            poly = poly.buffer(0)
        if poly.is_empty or not poly.intersects(pilot_box) or poly.area < 25:
            continue
        x0, z0, x1, z1 = poly.bounds
        near = (X > x0 - GROUND_PAD) & (X < x1 + GROUND_PAD) & (Z > z0 - GROUND_PAD) & (Z < z1 + GROUND_PAD)
        inside = near & shapely.contains_xy(poly, X, Z)
        gnd = near & gmask & ~shapely.contains_xy(poly.buffer(2), X, Z)
        roof = inside & ~np.isin(C, [2, 7, 9, 18])
        if gnd.sum() < 10 or roof.sum() < 20:
            out.append({"id": b["id"], "name": b.get("name"), "status": "insufficient-points", "pointsInside": int(roof.sum())})
            continue
        g = float(np.median(Y[gnd]))
        px, pz, ph = X[roof], Z[roof], Y[roof] - g
        # 1 m raster, cell = max height of points inside
        cx0, cz0 = math.floor(x0), math.floor(z0)
        w, h = math.ceil(x1) - cx0 + 1, math.ceil(z1) - cz0 + 1
        ras = np.full((h, w), np.nan, np.float32)
        ci, ri = (px - cx0).astype(int), (pz - cz0).astype(int)
        for a, r, v in zip(ci, ri, ph):
            if np.isnan(ras[r, a]) or v > ras[r, a]:
                ras[r, a] = v
        cells = [(cx0 + i + .5, cz0 + j + .5) for j in range(h) for i in range(w)]
        cin = shapely.contains_xy(poly, [p[0] for p in cells], [p[1] for p in cells]).reshape(h, w)
        coverage = float((~np.isnan(ras) & cin).sum() / max(cin.sum(), 1))
        # planes: RANSAC on points z = a*x + b*z + c, <=3 planes, inlier 0.25 m
        P = np.c_[px, pz, ph]
        rest, planes = np.arange(len(P)), []
        for _ in range(3):
            if len(rest) < max(30, 0.15 * len(P)):
                break
            best = None
            for _ in range(300):
                s = P[rng.choice(rest, 3, replace=False)]
                n = np.cross(s[1] - s[0], s[2] - s[0])
                if abs(n[2]) < 1e-6:
                    continue
                co = np.array([-n[0] / n[2], -n[1] / n[2]])
                if np.hypot(*co) > 1.2:  # > ~50 deg is a wall, not a roof
                    continue
                cc = s[0, 2] - co @ s[0, :2]
                inl = np.abs(P[rest, :2] @ co + cc - P[rest, 2]) < 0.25
                if best is None or inl.sum() > best[0].sum():
                    best = (inl, co, cc)
            if best is None or best[0].sum() < 20:
                break
            idx = rest[best[0]]
            A = np.c_[P[idx, :2], np.ones(len(idx))]
            sol = np.linalg.lstsq(A, P[idx, 2], rcond=None)[0]
            planes.append({"a": round(float(sol[0]), 4), "b": round(float(sol[1]), 4), "c": round(float(sol[2]), 2),
                           "slopeDeg": round(math.degrees(math.atan(math.hypot(sol[0], sol[1]))), 1),
                           "points": int(len(idx)), "areaM2": round(len(idx) / max(len(P) / poly.area, 1e-6), 0)})
            rest = rest[~best[0]]
        planes_note = "h = a*x + b*z + c, h above local ground, x/z local metres"
        flat = bool(planes) and planes[0]["slopeDeg"] < 5
        ring = poly.exterior.buffer(1.5)
        rim = shapely.contains_xy(ring, px, pz)
        rh = ph[rim & (ph > 3)]  # >3 m: drop courtyard/ground/shrub points inside loose footprints
        eave = float(np.median(rh)) if len(rh) >= 5 else float(np.percentile(ph, 10))
        ridge = float(np.percentile(ph, 98))
        rec = {"id": b["id"], "name": b.get("name"), "groundElev": round(g, 2), "eaveH": round(eave, 1),
               "ridgeH": round(ridge, 1), "maxH": round(float(ph.max()), 1), "roofType": "flat" if flat else "pitched/complex",
               "planes": planes, "planesNote": planes_note, "pointsInside": int(roof.sum()), "cellCoverage": round(coverage, 2)}
        # parapet + plant boxes (flat roof only: height above the dominant plane)
        if flat:
            p0 = planes[0]
            plane_h = p0["a"] * (np.arange(w) + cx0 + .5)[None, :] + p0["b"] * (np.arange(h) + cz0 + .5)[:, None] + p0["c"]
            dz = ras - plane_h
            rimc = cin & ~shapely.contains_xy(poly.buffer(-1.5), [p[0] for p in cells], [p[1] for p in cells]).reshape(h, w)
            d_rim = dz[rimc & ~np.isnan(dz)]
            rec["parapetH"] = round(float(np.median(d_rim)), 2) if len(d_rim) >= 5 and 0.3 < np.median(d_rim) < 2.5 else 0  # >2.5 = plane fit/pitched, not a parapet
            rec["parapetNote"] = "median rim-cell height above roof plane; 1 m cells, QL2 -> +-0.3 m"
            hi = (dz > 1.5) & cin & ~rimc
            lab, n = ndimage.label(np.nan_to_num(hi))
            boxes = []
            for i in range(1, n + 1):
                jj, ii = np.where(lab == i)
                if len(jj) < 4:
                    continue
                boxes.append({"x0": cx0 + int(ii.min()), "x1": cx0 + int(ii.max()) + 1, "z0": cz0 + int(jj.min()), "z1": cz0 + int(jj.max()) + 1,
                              "h": round(float(np.nanmax(dz[lab == i])), 1), "baseH": round(float(p0["c"]), 1), "cells": int(len(jj))})
            rec["plantBoxes"] = boxes
        rec["raster"] = {"x0": cx0, "z0": cz0, "w": w, "h": h, "cell": 1,
                         "data": [[None if np.isnan(v) else round(float(v), 1) for v in row] for row in ras]}
        out.append(rec)
    dst = ROOT / "data/pilot"
    dst.mkdir(parents=True, exist_ok=True)
    (dst / "roofs.json").write_text(json.dumps({
        "source": "USGS 3DEP IN_Statewide_Opt2_B2_2017 QL2 EPT", "box": BOX, "pointDensityPerM2": round(len(X) / area, 2),
        "frame": "local metres, x east, z south, origin Bell Tower; heights above local bare earth", "buildings": out}, separators=(",", ":")))
    ok = [r for r in out if "planes" in r]
    print(len(out), "buildings,", len(ok), "with roofs;", sum(len(r.get("plantBoxes", [])) for r in ok), "plant boxes", file=sys.stderr)


if __name__ == "__main__":
    main()
