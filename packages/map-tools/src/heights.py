"""LiDAR heights: USGS 3DEP Indiana Statewide 2017 (QL2) point clouds -> data/heights.json.

Per building: height = P90 of non-ground surface cells (1 m DSM, max z per cell) inside the
footprint minus median bare-earth (class 2) cell elevation within 15 m of the footprint bbox.
Run via `pnpm map:heights` (then merge-heights.ts writes heightLidar into campus.json).
"""
import io, json, math, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import laspy, numpy as np
from pyproj import Transformer
from rasterio import features
from rasterio.transform import from_origin

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "data/raw/lidar"
EPT = "https://usgs-lidar-public.s3.amazonaws.com/IN_Statewide_Opt2_B2_2017/"  # 3DEP 2017 QL2, EPSG:3857
R, RAD = 6371008.8, math.pi / 180  # same flat projection as geo.ts
PCT, PAD = 90, 15


def get(url, retries=5):
    for i in range(retries):
        try:
            return urllib.request.urlopen(url, timeout=60).read()
        except Exception as e:
            if i == retries - 1:
                raise
            time.sleep(2 * (i + 1))


def cached(name):
    f = RAW / name
    if not f.exists():
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_bytes(get(EPT + name))
    return f.read_bytes()


def cached_bin(key):
    return cached(f"ept-data/{key}.laz")


def nodes(bbox):
    """EPT node keys whose x/y extent touches bbox=(xmin,ymin,xmax,ymax) in EPSG:3857."""
    b = json.loads(cached("ept.json"))["bounds"]
    hier, out = json.loads(cached("ept-hierarchy/0-0-0-0.json")), []
    seen = ["0-0-0-0"]
    while seen:
        k = seen.pop()
        d, x, y, z = map(int, k.split("-"))
        size = (b[3] - b[0]) / 2**d
        x0, y0 = b[0] + x * size, b[1] + y * size
        if x0 > bbox[2] or x0 + size < bbox[0] or y0 > bbox[3] or y0 + size < bbox[1]:
            continue
        n = hier.get(k)
        if n is None:
            continue
        if n == -1:  # subtree lives in its own hierarchy file
            hier.update(json.loads(cached(f"ept-hierarchy/{k}.json")))
            n = hier.get(k)
        if n and n > 0:
            out.append(k)
        seen += [f"{d+1}-{2*x+i}-{2*y+j}-{2*z+m}" for i in (0, 1) for j in (0, 1) for m in (0, 1)]
    return out


def height(cells, ground):
    return np.percentile(cells, PCT) - ground


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    campus = json.loads((ROOT / "data/campus.json").read_text())
    o = campus["origin"]
    k = math.cos(o["lat"] * RAD)
    to_ept = Transformer.from_crs(4326, 3857, always_xy=True)
    utm = Transformer.from_crs(3857, 26916, always_xy=True)  # NAD83 / UTM 16N
    to_crs = Transformer.from_crs(4326, 26916, always_xy=True)

    def proj(p):  # local (x east, z south) -> LAZ CRS
        lat = o["lat"] - p[1] / (R * RAD)
        lon = o["lon"] + p[0] / (R * RAD * k)
        return to_crs.transform(lon, lat)

    polys = {b["id"]: [proj(p) for p in b["outer"]] for b in campus["buildings"]}
    allp = np.array([p for r in polys.values() for p in r])
    x0, y1 = allp.min(0)[0] - 50, allp.max(0)[1] + 50
    W, H = int(allp.max(0)[0] + 50 - x0) + 1, int(y1 - (allp.min(0)[1] - 50)) + 1
    dsm = np.full((H, W), -np.inf, np.float32)
    gsum, gn = np.zeros((H, W), np.float64), np.zeros((H, W), np.int32)
    ll = [(o["lat"] - p[1] / (R * RAD), o["lon"] + p[0] / (R * RAD * k)) for b in campus["buildings"] for p in b["outer"]]
    la, lo = zip(*ll)
    (bx0, by0), (bx1, by1) = to_ept.transform(min(lo), min(la)), to_ept.transform(max(lo), max(la))
    keys = nodes((bx0 - 60, by0 - 60, bx1 + 60, by1 + 60))
    print(len(keys), "EPT nodes", file=sys.stderr)

    def load(key):
        return laspy.read(io.BytesIO(cached_bin(key)))

    with ThreadPoolExecutor(8) as ex:
        for las in ex.map(load, keys):
            ux, uy = utm.transform(np.asarray(las.x), np.asarray(las.y))
            c = np.asarray(las.classification)
            col, row = (ux - x0).astype(int), (y1 - uy).astype(int)
            z = np.asarray(las.z, np.float32)
            ok = (col >= 0) & (col < W) & (row >= 0) & (row < H)
            g = ok & (c == 2)
            np.add.at(gsum, (row[g], col[g]), z[g])
            np.add.at(gn, (row[g], col[g]), 1)
            s = ok & ~np.isin(c, [2, 7, 9, 18])
            np.maximum.at(dsm, (row[s], col[s]), z[s])
    gnd = np.where(gn > 0, gsum / np.maximum(gn, 1), np.nan)

    out = {}
    for b in campus["buildings"]:
        ring = polys[b["id"]]
        xs, ys = zip(*ring)
        r0, r1 = max(int(y1 - max(ys)) - PAD, 0), min(int(y1 - min(ys)) + PAD + 1, H)
        c0, c1 = max(int(min(xs) - x0) - PAD, 0), min(int(max(xs) - x0) + PAD + 1, W)
        if r1 <= r0 or c1 <= c0:
            continue
        tr = from_origin(x0 + c0, y1 - r0, 1, 1)
        # all_touched so footprints under ~2 m wide still get cells
        m = features.rasterize([({"type": "Polygon", "coordinates": [ring]}, 1)],
                               (r1 - r0, c1 - c0), transform=tr, all_touched=True).astype(bool)
        d = dsm[r0:r1, c0:c1][m]
        d = d[np.isfinite(d)]
        gg = gnd[r0:r1, c0:c1]
        gg = gg[~m & ~np.isnan(gg)]
        if len(d) < 1 or len(gg) < 3:
            continue
        out[b["id"]] = {"h": round(float(height(d, np.median(gg))), 1), "n": int(len(d))}
    (ROOT / "data/heights.json").write_text(json.dumps(out, separators=(",", ":")))
    print(len(out), "of", len(campus["buildings"]), "buildings sampled")


if __name__ == "__main__":
    main()
