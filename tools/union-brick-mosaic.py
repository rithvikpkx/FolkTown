# Larger, non-repeating-looking Union brick tile: 8 x 8 copies of the photo-rectified brick-tile.jpg patch (tools/union-rectify.py, 46 x 35 px = 1.15 x 0.875 m),
# each with a random horizontal flip, brightness and hue jitter (course lines stay aligned) -> brick-tile-large.jpg, 9.2 x 7.0 m. Also writes far-wall.jpg: north-wing.jpg
# (rectified Street View, 37 x 9 m) as the far-LOD wall texture.
# run: uv run --with opencv-python --with numpy python tools/union-brick-mosaic.py
import cv2, numpy as np, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'packages', 'saltline', 'public', 'campus', 'hotspots', 'union') + '/'
P = cv2.imread(D + 'brick-tile.jpg').astype(np.float32); h, w = P.shape[:2]
rng = np.random.default_rng(7); N = 8
out = np.zeros((h * N, w * N, 3), np.float32)
for i in range(N):
    for j in range(N):
        t = P[:, ::-1] if rng.random() < 0.5 else P
        g = 0.88 + rng.random() * 0.24; hue = 1 + rng.normal(0, 0.035, 3)
        out[i * h:(i + 1) * h, j * w:(j + 1) * w] = t * g * hue
# soft large-scale mottling (weathering / flashed clusters), 2-4 m blobs
blob = cv2.GaussianBlur(rng.normal(0, 1, (out.shape[0], out.shape[1])).astype(np.float32), (0, 0), 28); blob /= blob.std()
out *= (1 + 0.06 * blob)[..., None]
cv2.imwrite(D + 'brick-tile-large.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 88])
print('brick-tile-large', out.shape, 'm', out.shape[1] / 40, out.shape[0] / 40)
