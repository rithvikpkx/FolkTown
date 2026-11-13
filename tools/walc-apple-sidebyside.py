# Apple Maps frame (left) vs the walk scene at the fitted camera (right) -> docs/img/walc-hifi-vs-apple.jpg, plus a row of eye-level plaza views.
# Run after: node tools/saltline-walk-shots.mjs apple-west-mid apple-west-4 apple-east-mid apple-south-mid hifi-front hifi-oblique hifi-colonnade hifi-nw hifi-east hifi-south
#   uv run --with opencv-python-headless --with numpy python tools/walc-apple-sidebyside.py [name ...]   (raw frames are gitignored, this Mac only)
import cv2, numpy as np, sys
AM = '/Users/rithvikpraveenkumar/Codebox/Repos/FolkTown/data/raw/apple-maps-walc/'
names = [a for i, a in enumerate(sys.argv[1:]) if not a.startswith('-') and sys.argv[i] != '-o'] or ['west-mid', 'west-4', 'east-mid', 'south-mid']
W = 1500
def lab(im, t): cv2.rectangle(im, (0, 0), (16 + 13 * len(t), 34), (0, 0, 0), -1); cv2.putText(im, t, (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2); return im
rows = []
for n in names:
    a = cv2.imread(AM + n + '.png'); b = cv2.imread(f'tools/shots/walk-apple-{n}.png')
    b = cv2.resize(b, (3200, 1898))[104:104 + 1794, 0:3056]  # the Maps window crop
    f = W / a.shape[1]; a = cv2.resize(a, None, fx=f, fy=f, interpolation=cv2.INTER_AREA); b = cv2.resize(b, (a.shape[1], a.shape[0]), interpolation=cv2.INTER_AREA)
    rows.append(np.hstack([lab(a, 'Apple Maps ' + n), lab(b, 'walk scene, same camera')]))
if '--no-eye' not in sys.argv:
    eye = [cv2.imread(f'tools/shots/walk-hifi-{n}.png') for n in ['front', 'oblique', 'colonnade', 'nw', 'east', 'south']]
    eye = [lab(cv2.resize(e, (1000, 625), interpolation=cv2.INTER_AREA), 'eye level: ' + n) for e, n in zip(eye, ['front', 'oblique', 'colonnade', 'north-west', 'east', 'south']) if e is not None]
    for i in range(0, len(eye) - 2, 3): rows.append(np.hstack(eye[i:i + 3]))
out = sys.argv[sys.argv.index('-o') + 1] if '-o' in sys.argv else 'docs/img/walc-hifi-vs-apple.jpg'
cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 86]); print(out, np.vstack(rows).shape)
