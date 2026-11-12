# Street View frame (left) vs the same fitted pose rendered by tools/saltline-hotspot-shots.mjs (right) -> docs/img/v5-{elliott,mall}-vs-ref.jpg
# Run: /usr/local/bin/python3 -I tools/hotspot-sidebyside.py   (raw frames are gitignored; Elliott is in the main checkout data/raw, memorial-mall in a sibling worktree)
import os
from PIL import Image
R = '/Users/rithvikpraveenkumar/Codebox/Repos/FolkTown/'
SV = R + 'data/raw/streetview/'
SV2 = R + '.claude/worktrees/agent-a0dea8b89a24d1c5a/data/raw/streetview/'  # memorial-mall frames live here
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SETS = {
    'elliott': [(SV + 'elliott-hall-of-music/HwF9pEOA_GGsn7OmyaXn2A_h180.jpg', 'ell-hwf-h180'), (SV + 'elliott-hall-of-music/XvCOiCOdmYC3iN9U64hBJg_h0.jpg', 'ell-xvc-h0'), (SV + 'elliott-hall-of-music/gd8RfryM02nVN5eF4Kj7Sg_h90.jpg', 'ell-gd8-h90')],
    'mall': [(SV2 + 'memorial-mall/edsyJrqna9EH1j_glWMayw_h180.jpg', 'mall-eds-h180'), (SV2 + 'memorial-mall/eey-GRoIHUgaa9f9gm4QQw_h0.jpg', 'mall-eey-h0')],
}
for name, rows in SETS.items():
    ims = []
    for ref, shot in [r for r in rows if os.path.exists(os.path.join(HERE, 'tools/shots/hs-%s.png' % r[1]))]:
        a = Image.open(ref).convert('RGB').resize((640, 640)); b = Image.open(os.path.join(HERE, 'tools/shots/hs-%s.png' % shot)).convert('RGB').resize((640, 640))
        row = Image.new('RGB', (1280, 640)); row.paste(a, (0, 0)); row.paste(b, (640, 0)); ims.append(row)
    if not ims: continue
    out = Image.new('RGB', (1280, 640 * len(ims)))
    for i, r in enumerate(ims): out.paste(r, (0, 640 * i))
    out.save(os.path.join(HERE, 'docs/img/v5-%s-vs-ref.jpg' % name), quality=84); print(name, out.size)
