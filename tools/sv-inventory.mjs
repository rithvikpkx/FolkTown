// Inventory: sample panoIds on a 25 m grid over the region (+margin), then metadata per unique pano -> data/raw/streetview-tiles/panos.json
import fs from 'node:fs';
import { DIR, usage, saveUsage, toLL, panoIds, metadata } from './sv-common.mjs';
const pts = [];
for (let x = -260; x <= 380; x += 25) for (let z = -410; z <= 425; z += 25) pts.push(toLL(x, z));
const ids = new Set();
for (let i = 0; i < pts.length; i += 100) (await panoIds(pts.slice(i, i + 100), 30)).forEach((p) => p && ids.add(p));
console.log('points', pts.length, 'unique panos', ids.size);
const out = {}; const list = [...ids];
for (let i = 0; i < list.length; i += 10) await Promise.all(list.slice(i, i + 10).map(async (id) => { try { out[id] = await metadata(id); } catch (e) { console.log(id, e.message); } }));
saveUsage(); fs.writeFileSync(DIR + 'panos.json', JSON.stringify(out));
console.log(usage);
