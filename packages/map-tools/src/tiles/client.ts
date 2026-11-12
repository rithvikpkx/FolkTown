import { redact } from './env.ts';

export class RequestCap {
  count = 0;
  max: number;
  constructor(max: number) {
    this.max = max;
  }
  /** Call before every network request. */
  take() {
    if (this.count >= this.max)
      throw new Error(`request cap reached (${this.max}); raise --max-requests`);
    this.count++;
  }
}

export class TileClient {
  session = '';
  errors: { url: string; error: string }[] = [];
  bytes = 0;
  key: string;
  cap: RequestCap;
  opts: { retries?: number; backoffMs?: number };
  constructor(key: string, cap: RequestCap, opts: { retries?: number; backoffMs?: number } = {}) {
    this.key = key;
    this.cap = cap;
    this.opts = opts;
  }

  /** Add key + the session token (the API returns it in child URIs) to every request. */
  withAuth(url: string): string {
    const u = new URL(url);
    const s = u.searchParams.get('session');
    if (s) this.session = s;
    else if (this.session) u.searchParams.set('session', this.session);
    u.searchParams.set('key', this.key);
    return u.toString();
  }

  async get(url: string): Promise<Buffer> {
    const full = this.withAuth(url);
    const retries = this.opts.retries ?? 4;
    for (let a = 0; ; a++) {
      this.cap.take();
      try {
        const r = await fetch(full);
        if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });
        const b = Buffer.from(await r.arrayBuffer());
        this.bytes += b.length;
        return b;
      } catch (e) {
        const st = (e as { status?: number }).status;
        const fatal = st !== undefined && st < 500 && st !== 429 && st !== 408;
        if (fatal || a >= retries) {
          const error = redact(String((e as Error).message));
          this.errors.push({ url: redact(full), error });
          throw new Error(`${error} for ${redact(full)}`);
        }
        await new Promise((r) => setTimeout(r, (this.opts.backoffMs ?? 500) * 2 ** a));
      }
    }
  }
}

/** Run fn over items with at most `n` in flight. */
export async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++] as T);
    }),
  );
}
