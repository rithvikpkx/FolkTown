# Extracts the small OSM subsets the v5 hotspots need from data/campus.json -> packages/saltline/src/campus/hotspots/data/{elliott,mall}.json
# Run: /usr/local/bin/python3 -I tools/hotspot-data.py   (local metres: x east, z south, origin Bell Tower)
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
c = json.load(open(os.path.join(ROOT, 'data/campus.json')))
OUT = os.path.join(ROOT, 'packages/saltline/src/campus/hotspots/data'); os.makedirs(OUT, exist_ok=True)
r1 = lambda p: [round(p[0], 1), round(p[1], 1)]
def inb(p, b): return b[0] < p[0] < b[1] and b[2] < p[1] < b[3]
def sub(box, trees=True):
    paths = [{'id': p['id'], 'kind': p['kind'], 'hw': p['tags'].get('highway'), 'surface': p['tags'].get('surface'), 'name': p.get('name'), 'points': [r1(q) for q in p['points']]}
             for p in c['paths'] if any(inb(q, box) for q in p['points'])]
    grass = [{'id': g['id'], 'tags': {k: v for k, v in g['tags'].items() if k in ('leisure', 'landuse', 'name')}, 'outer': [r1(q) for q in g['outer']]}
             for g in c['grass'] if any(inb(q, box) for q in g['outer'])]
    tr = [r1([t['x'], t['z']]) for t in c['trees'] if inb([t['x'], t['z']], box)]
    return {'paths': paths, 'grass': grass, 'trees': tr}
ell = next(b for b in c['buildings'] if b['id'] == 'way/74151922')
d = sub([-170, -10, -150, 20]); d['ring'] = [r1(q) for q in ell['outer']]
json.dump(d, open(OUT + '/elliott.json', 'w'), separators=(',', ':'))
m = sub([-100, 70, 120, 440]); m['park'] = next(g for g in c['grass'] if g['id'] == 'way/74154179')['outer']; m['park'] = [r1(q) for q in m['park']]
json.dump(m, open(OUT + '/mall.json', 'w'), separators=(',', ':'))
print({k: len(v) for k, v in d.items()}, {k: len(v) for k, v in m.items()})
