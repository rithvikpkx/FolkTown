import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const REPO = fileURLToPath(new URL('../../../../', import.meta.url));

/** Read GOOGLE_MAPS_API_KEY from the environment, falling back to a gitignored .env.local. */
export function getKey(): string {
  let k = process.env.GOOGLE_MAPS_API_KEY;
  for (const f of [`${REPO}.env.local`, '.env.local']) {
    if (k || !existsSync(f)) continue;
    const m = readFileSync(f, 'utf8').match(/^\s*GOOGLE_MAPS_API_KEY\s*=\s*["']?([^"'\r\n#\s]+)/m);
    if (m) k = m[1];
  }
  if (!k)
    throw new Error(
      'GOOGLE_MAPS_API_KEY not set (environment or .env.local). See docs/google-export.md',
    );
  return k;
}

/** Strip the key from anything that is printed or stored. */
export const redact = (s: string) => s.replace(/([?&]key=)[^&\s]+/g, '$1REDACTED');

export function parseArgs(argv: string[]): Record<string, string | true> {
  const o: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    if (!a.startsWith('--')) continue;
    const [k, v] = a.slice(2).split('=');
    const next = argv[i + 1];
    let val: string | true = v ?? true;
    if (v === undefined && next && !next.startsWith('--')) {
      val = next;
      i++;
    }
    o[k as string] = val;
  }
  return o;
}
