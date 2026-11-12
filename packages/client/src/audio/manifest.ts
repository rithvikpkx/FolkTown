/** One sound: the files to pick from, and how it is played. */
export interface SoundDef {
  files: string[];
  volume: number;
  /** Base playback rate (1 = as recorded). */
  rate: number;
  /** Random pitch spread: the rate varies by +-this fraction. */
  pitch: number;
  /** Most copies that may play at once; extra triggers are dropped. */
  maxVoices: number;
  loop: boolean;
}
export interface AudioManifest {
  master: number;
  /** Positional sounds beyond this many metres are skipped. */
  cullDistance: number;
  sounds: Record<string, SoundDef>;
}

const num = (v: unknown, d: number, lo: number, hi: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;

/** Validate untrusted manifest JSON. Bad sounds are dropped and reported, never thrown. */
export function validateManifest(raw: unknown): { manifest: AudioManifest; errors: string[] } {
  const errors: string[] = [];
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const manifest: AudioManifest = {
    master: num(r.master, 0.8, 0, 1),
    cullDistance: num(r.cullDistance, 80, 1, 1000),
    sounds: {},
  };
  const src = (r.sounds && typeof r.sounds === 'object' ? r.sounds : {}) as Record<string, unknown>;
  for (const [id, v] of Object.entries(src)) {
    const s = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
    const files = Array.isArray(s.files) ? s.files.filter((f) => typeof f === 'string' && f) : [];
    if (!files.length) {
      errors.push(`sound "${id}": no files`);
      continue;
    }
    manifest.sounds[id] = {
      files: files as string[],
      volume: num(s.volume, 1, 0, 4),
      rate: num(s.rate, 1, 0.25, 4),
      pitch: num(s.pitch, 0, 0, 0.5),
      maxVoices: Math.round(num(s.maxVoices, 4, 1, 32)),
      loop: s.loop === true,
    };
  }
  return { manifest, errors };
}

/** Playback rate for a sound: base rate with a random spread; `rnd` is a value in [0, 1). */
export const pitchRate = (def: Pick<SoundDef, 'rate' | 'pitch'>, rnd = Math.random()) =>
  def.rate * (1 + (rnd * 2 - 1) * def.pitch);

/** Per-sound polyphony cap. `acquire` returns a release function, or null when the cap is reached. */
export class VoiceLimiter {
  private readonly live = new Map<string, number>();
  acquire(id: string, max: number): (() => void) | null {
    const n = this.live.get(id) ?? 0;
    if (n >= max) return null;
    this.live.set(id, n + 1);
    let done = false;
    return () => {
      if (done) return;
      done = true;
      this.live.set(id, (this.live.get(id) ?? 1) - 1);
    };
  }
}
