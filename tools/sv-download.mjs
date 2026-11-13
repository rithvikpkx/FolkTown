// Download selected panos at zoom 4 -> data/raw/streetview-tiles/<panoId>/<x>_<y>.jpg (resumable). Usage: node tools/sv-download.mjs [minSecondScore=15]
import fs from 'node:fs';
import { DIR, usage, saveUsage, tile } from './sv-common.mjs';
const sel = JSON.parse(fs.readFileSync(DIR + 'selection.json')), minSecond = +process.argv[2] || 15, Z = 4;
const want = new Map();
for (const s of Object.values(sel)) s.picks.forEach((k, i) => { if (i === 0 || k.score >= minSecond) want.set(k.panoId, k.w); });
const jobs = [];
for (const [id, w] of want) {
  fs.mkdirSync(DIR + id, { recursive: true });
  for (let y = 0; y < Math.ceil(w / 2 / 2 / 512); y++) for (let x = 0; x < Math.ceil(w / 2 / 512); x++) if (!fs.existsSync(`${DIR}${id}/${x}_${y}.jpg`)) jobs.push([id, x, y]);
}
console.log('panos', want.size, 'tiles to fetch', jobs.length);
let n = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (jobs.length) {
    const [id, x, y] = jobs.pop(), b = await tile(id, Z, x, y);
    if (b) fs.writeFileSync(`${DIR}${id}/${x}_${y}.jpg`, b);
    if (++n % 500 === 0) { saveUsage(); console.log(n); }
  }
}));
saveUsage(); console.log(usage);
