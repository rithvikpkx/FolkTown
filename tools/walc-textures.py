# WALC hi-fi material tiles -> packages/saltline/public/campus/walk/walc/. Run: uv run --with opencv-python-headless --with numpy python tools/walc-textures.py
# Pattern is generated (the Apple Maps / Google meshes are too soft to tile); colour statistics and pattern pitch are MEASURED from the
# Apple Maps frames (data/raw/apple-maps-walc, rectified with the fitted poses in tools/walc-apple.json):
#   clay tile: 0.25 m across, 0.37 m exposure, sunlit mean (176,108,84); brick: sunlit mean (160,128,113); limestone sunlit (236,230,214) -> albedo below.
import cv2, numpy as np, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'packages', 'saltline', 'public', 'campus', 'walk', 'walc') + '/'
rng = np.random.default_rng(11)
def noise(h, w, scale, seed):  # tileable value noise
    r = np.random.default_rng(seed); g = r.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    g = np.tile(g, (3, 3)); g = cv2.resize(g, (w * 3, h * 3), interpolation=cv2.INTER_CUBIC)
    return g[h:2 * h, w:2 * w]
def save(name, img, q=88):
    cv2.imwrite(OUT + name, np.clip(img, 0, 255).astype(np.uint8)[..., ::-1] if img.ndim == 3 else np.clip(img, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, q]); print(name, img.shape, os.path.getsize(OUT + name) // 1024, 'KB')
def normal_from_height(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.dstack([-dx, dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return (n * 0.5 + 0.5) * 255

# ---- clay barrel tile: 16 columns x 16 courses = 4.0 x 5.92 m, 1024 px. v up the slope (image row 0 = top = up-slope).
def roof():
    N, C, R = 1024, 16, 16; cw, ch = N // C, N // R
    y, x = np.mgrid[0:N, 0:N].astype(np.float32)
    col = (x // cw).astype(int); u = (x % cw) / cw  # 0..1 across one tile column: cover (convex) 0.1..0.7, pan (concave) between
    row = ((N - 1 - y) // ch).astype(int); v = ((N - 1 - y) % ch) / ch  # v 0 = lower (exposed butt) edge of the course
    cover = np.clip(1 - ((u - 0.4) / 0.32) ** 2, 0, 1) ** 0.5  # half-round cover tile profile
    pan = np.clip(1 - (np.minimum(u, 1 - u) / 0.12) ** 2, 0, 1) * -0.35
    height = cover + pan + (1 - v) * 0.3
    tid = (col * 37 + row * 101) % 997; tone = np.random.default_rng(5).normal(0, 1, 997).astype(np.float32)[tid]
    hue = np.random.default_rng(6).normal(0, 1, 997).astype(np.float32)[tid]
    base = np.array([176, 108, 84], np.float32)
    img = base[None, None] * (1 + 0.075 * tone[..., None]) + hue[..., None] * np.array([3, -4, -5], np.float32)
    light = 0.80 + 0.26 * cover - 0.20 * (pan < -0.01) * (-pan / 0.35)  # baked soft shading: covers catch light, pans sit in shade
    butt = np.clip(1 - v / 0.07, 0, 1); light *= 1 - 0.38 * butt  # shadow line under each course butt
    light *= 1 - 0.10 * np.clip((v - 0.9) / 0.1, 0, 1)
    grain = noise(N, N, 3, 1) * 0.10 + noise(N, N, 24, 2) * 0.08 + noise(N, N, 256, 3) * 0.12
    img = img * light[..., None] * (0.86 + grain[..., None])
    lichen = np.clip(noise(N, N, 60, 4) - 0.72, 0, 1) * 2.2; img = img * (1 - lichen[..., None] * 0.35) + lichen[..., None] * np.array([70, 62, 52], np.float32) * 0.35
    save('roof-tile.jpg', img); save('roof-tile-n.jpg', normal_from_height(cv2.GaussianBlur(height, (0, 0), 1.0), 6.0), 85)

# ---- brick: 12 stretchers x 32 courses = 2.438 x 2.438 m (203.2 x 76.2 mm modules), running bond, 1024 px. diaper=True adds the dark-header diamond pattern of the pavilion spandrels.
def brick(name, diaper):
    N, BW, BH = 1024, 1024 / 12, 1024 / 32; img = np.zeros((N, N, 3), np.float32); hgt = np.zeros((N, N), np.float32)
    mortar = np.array([201, 194, 179], np.float32); img[:] = mortar
    r = np.random.default_rng(21); base = np.array([158, 117, 101], np.float32); J = 3.2
    for c in range(32):
        off = 0.5 if c % 2 else 0.0
        for b in range(-1, 13):
            x0 = (b + off) * BW; t = r.normal(0, 1); k = r.random()
            colr = base * (1 + 0.085 * t) + r.normal(0, 1) * np.array([5, -3, -4], np.float32)
            if k < 0.10: colr = colr * np.array([0.62, 0.60, 0.66], np.float32)  # flashed dark units
            elif k < 0.2: colr = colr * np.array([1.10, 1.07, 1.03], np.float32) + 6
            if diaper:  # diamond lattice, period 6 bricks x 16 courses, drawn with dark headers on the half-brick grid
                gx = (2 * b + (1 if c % 2 else 0)) % 12; gy = c % 16; dd = abs(gx - 6) / 6 + abs(gy - 8) / 8
                if abs(dd - 1) < 0.09 or (gx == 6 and gy == 8): colr = base * np.array([0.50, 0.50, 0.56], np.float32)
            xa, xb, ya, yb = int(round(x0 + J / 2)), int(round(x0 + BW - J / 2)), int(round(c * BH + J / 2)), int(round((c + 1) * BH - J / 2))
            for xs, xe in ((max(xa, 0), min(xb, N)),):
                if xe > xs: img[ya:yb, xs:xe] = colr; hgt[ya:yb, xs:xe] = 1
            if xa < 0: img[ya:yb, N + xa:N] = colr; hgt[ya:yb, N + xa:N] = 1
            if xb > N: img[ya:yb, 0:xb - N] = colr; hgt[ya:yb, 0:xb - N] = 1
    g = noise(N, N, 2, 7) * 0.16 + noise(N, N, 9, 8) * 0.12 + noise(N, N, 200, 9) * 0.07
    img = cv2.GaussianBlur(img, (0, 0), 0.7) * (0.83 + g[..., None]); hb = cv2.GaussianBlur(hgt, (0, 0), 1.1)
    img *= (0.80 + 0.20 * hb)[..., None]
    save(name, img, 86)
    if not diaper: save('brick-n.jpg', normal_from_height(hb + noise(N, N, 3, 12) * 0.25, 5.0), 85)

def limestone():
    N = 512; g = noise(N, N, 2, 31) * 0.05 + noise(N, N, 14, 32) * 0.06 + noise(N, N, 110, 33) * 0.07
    streak = cv2.GaussianBlur(np.tile(np.random.default_rng(34).random((1, N)).astype(np.float32), (N, 1)), (0, 0), 3) * 0.05  # faint vertical tooling / run-off
    img = np.array([226, 218, 199], np.float32)[None, None] * (0.88 + g + streak)[..., None]
    for y0, x0 in ((0, 0), (N // 2, N // 2)):  # ashlar joints: 0.8 m courses, 1.6 m stones, half bond
        img[y0:y0 + 2] *= 0.86; img[y0:y0 + N // 2, x0:x0 + 2] *= 0.88
    pits = (np.random.default_rng(35).random((N, N)) > 0.9985).astype(np.float32); pits = cv2.GaussianBlur(pits, (0, 0), 0.8) * 2; img *= (1 - np.clip(pits, 0, 0.18))[..., None]
    save('limestone-hifi.jpg', img, 88)

roof(); brick('brick-hifi.jpg', False); brick('brick-diaper.jpg', True); limestone()
