# Street View frame (left) vs the same pose rendered by tools/saltline-walk-shots.mjs (right, centre square of the 16:9 shot) -> docs/img/v4-walc-vs-streetview.jpg
import cv2, numpy as np
SV = '/Users/rithvikpraveenkumar/Codebox/Repos/FolkTown/data/raw/streetview/walc/'
rows = []
for photo, shot in [('CAoSF0NJSE0wb2dLRUlDQWdJQzZzNVRTbWdF_h90.jpg', 'walk-sv-west.png'), ('_2SMIzURFlvLO3vHwJQjiA_h0.jpg', 'walk-sv-south.png')]:
    a = cv2.imread(SV + photo); b = cv2.imread('tools/shots/' + shot); h, w = b.shape[:2]; x = (w - h) // 2
    rows.append(np.hstack([a, cv2.resize(b[:, x:x + h], (640, 640), interpolation=cv2.INTER_AREA)]))
cv2.imwrite('docs/img/v4-walc-vs-streetview.jpg', np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
