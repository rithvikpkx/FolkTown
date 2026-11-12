// Builds the ?walk=1 prototype as a relative-path bundle: packages/saltline/dist-walk (serve the folder statically).
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'packages/saltline/dist-walk';
execSync('npx -y pnpm@12.18.0 --filter @folktown/saltline exec vite build --base ./ --outDir dist-walk --emptyOutDir', {
  stdio: 'inherit',
  env: { ...process.env, VITE_WALK: '1' },
});
// walk mode needs none of these: facade/landmark demo shots, the 1K ground sets (walk/ has 2K), the zone copy (bundled into JS)
for (const p of ['facades', 'landmarks', 'purdue-mall.json', ...['grass', 'pavers', 'asphalt'].flatMap((n) => ['albedo', 'normal', 'roughness'].map((k) => `${n}-${k}.jpg`))])
  rmSync(join(out, 'campus', p), { recursive: true, force: true });
// no network: drop the Google Fonts links (the HUD is not used in walk mode)
const idx = join(out, 'index.html');
writeFileSync(idx, readFileSync(idx, 'utf8').replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, ''));
let total = 0;
let bad = 0;
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else {
      total += s.size;
      if (s.size > 16e6) (bad++, console.error('over 16 MB:', p));
    }
  }
};
walk(out);
const abs = readFileSync(idx, 'utf8').match(/(src|href)="(https?:)?\/\/[^"]*"|(src|href)="\/[^"]*"/g);
console.log(`dist-walk ${(total / 1e6).toFixed(1)} MB`, abs ? `ABSOLUTE URLS: ${abs}` : 'no absolute urls');
if (total > 40e6 || bad || abs) process.exit(1);
