"""Pilot orthophoto: Indiana 2023 6-inch (CC0) ImageServer -> local-metre mosaic.

Writes the raw export to data/raw/ortho (gitignored) and
packages/saltline/public/campus/pilot/ortho.jpg + ortho.json (world bounds in local metres).
Local frame: x east, z south, origin = Bell Tower (data/campus.json origin).
shortcut: UTM 16N is used as the local frame; ignores 0.056 deg grid convergence (~0.2 m over 240 m)
and 0.9996 scale. Upgrade if the pilot grows past ~500 m.
"""
import io, json, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[3]
SVC = "https://di-ingov.img.arcgis.com/arcgis/rest/services/DynamicWebMercator/Indiana_Current_Imagery/ImageServer"
BOX = dict(x0=-50, x1=190, z0=-200, z1=50)  # local metres, z south; pilot box + 10 m margin
PX = 0.0762  # native 6-inch

o = json.loads((ROOT / "data/campus.json").read_text())["origin"]
ue, un = Transformer.from_crs(4326, 26916, always_xy=True).transform(o["lon"], o["lat"])
xmin, xmax = ue + BOX["x0"], ue + BOX["x1"]
ymin, ymax = un - BOX["z1"], un - BOX["z0"]  # z south -> northing minus z
W, H = round((xmax - xmin) / PX), round((ymax - ymin) / PX)

q = dict(bbox=f"{xmin},{ymin},{xmax},{ymax}", bboxSR=26916, imageSR=26916, size=f"{W},{H}",
         format="jpg", interpolation="RSP_BilinearInterpolation", f="image", bandIds="0,1,2",
         mosaicRule=json.dumps({"mosaicMethod": "esriMosaicLockRaster", "lockRasterIds": [4]}))  # 4 = Indiana_2023_SPW_06in
raw = urllib.request.urlopen(f"{SVC}/exportImage?" + urllib.parse.urlencode(q), timeout=300).read()
out = ROOT / "data/raw/ortho"
out.mkdir(parents=True, exist_ok=True)
(out / "pilot-2023-6in.jpg").write_bytes(raw)
im = Image.open(io.BytesIO(raw)).convert("RGB")
print("raw", im.size)
if max(im.size) > 4096:
    s = 4096 / max(im.size)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
dst = ROOT / "packages/saltline/public/campus/pilot"
dst.mkdir(parents=True, exist_ok=True)
im.save(dst / "ortho.jpg", quality=88)
(dst / "ortho.json").write_text(json.dumps({
    "image": "ortho.jpg", "width": im.width, "height": im.height,
    "bounds": {"xMin": BOX["x0"], "xMax": BOX["x1"], "zMin": BOX["z0"], "zMax": BOX["z1"]},
    "metresPerPixel": (BOX["x1"] - BOX["x0"]) / im.width,
    "source": "Indiana_2023_SPW_06in, IndianaMap/IGIO, CC0",
}, indent=1))
print("wrote", im.size)
