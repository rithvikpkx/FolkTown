# Street View frames / SketchUp screenshot (left) vs the same pose rendered by tools/saltline-union-shots.mjs (right) -> docs/img/v5-union-vs-ref.jpg
# run: UNION_SV=<dir with the raw frames> uv run --with opencv-python --with numpy python tools/union-sidebyside.py
import cv2, numpy as np, os
SV = os.environ.get('UNION_SV', '/Users/rithvikpraveenkumar/Codebox/Repos/FolkTown/data/raw/streetview/memorial-union/')
rows = []
for photo, shot, label in [('-6pw5fD2pW12NluOYWf8SQ_h180.jpg', 'union-sv-north.png', 'N wing, Street View 2009-06 (c) Google'), ('11UvcOX8EMp8eaLSIDAdCA_h270.jpg', 'union-sv-east.png', 'SE-wing east gable, Street View 2017-07 (c) Google')]:
    a = cv2.imread(SV + photo); b = cv2.imread('tools/shots/' + shot); h, w = b.shape[:2]; x = (w - h) // 2
    rows.append(np.hstack([a, cv2.resize(b[:, x:x + h], (640, 640), interpolation=cv2.INTER_AREA)]))
    cv2.putText(rows[-1], label, (8, 628), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 1, cv2.LINE_AA)
sk = cv2.imread('reference/purdue-photos/memorial-union-3d-model-screenshot.png'); sk = sk[30:1035, 15:1790]; sk = cv2.resize(sk, (640, int(640 * sk.shape[0] / sk.shape[1])))
r = cv2.imread('tools/shots/union-sketchup.png'); r = cv2.resize(r, (640, int(640 * r.shape[0] / r.shape[1])))
hh = max(sk.shape[0], r.shape[0]); pad = lambda im: np.vstack([im, np.zeros((hh - im.shape[0], 640, 3), np.uint8)])
rows.append(np.hstack([pad(sk), pad(r)])); cv2.putText(rows[-1], 'SketchUp 3D Warehouse (reference) | render', (8, 20), cv2.FONT_HERSHEY_SIMPLEX, .5, (0, 0, 0), 1, cv2.LINE_AA)
os.makedirs('docs/img', exist_ok=True)
cv2.imwrite('docs/img/v5-union-vs-ref.jpg', np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
