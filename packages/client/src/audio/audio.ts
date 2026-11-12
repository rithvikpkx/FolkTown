import type { GameEvent, PlayerState, Vec3, WeaponId } from '@folktown/shared';
import { type AudioManifest, pitchRate, VoiceLimiter, validateManifest } from './manifest';

const KEY = 'folktown.audio';
const STEP_STRIDE = 2.1; // metres of walking per footstep

interface Counters {
  state: string;
  nodes: number;
  loaded: number;
  missing: string[];
  plays: Record<string, number>;
  muted: boolean;
  volume: number;
}

/**
 * Manifest-driven Web Audio. A missing or undecodable file is silent, never an error.
 * Positional sounds (bot shots, footsteps, impacts) go through a PannerNode with distance falloff.
 * M mutes, [ and ] change the master volume (kept in localStorage).
 */
export class AudioSystem {
  readonly stats: Counters = {
    state: 'none',
    nodes: 0,
    loaded: 0,
    missing: [],
    plays: {},
    muted: false,
    volume: 0.8,
  };
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private manifest: AudioManifest = { master: 0.8, cullDistance: 80, sounds: {} };
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly limiter = new VoiceLimiter();
  private readonly stride = new Map<number, number>();
  private prev = { weapon: '' as string, reloading: false, dry: 0 };
  private loopsOn = false;

  constructor(private readonly baseUrl = import.meta.env.BASE_URL) {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      if (typeof s.volume === 'number') this.stats.volume = Math.min(1, Math.max(0, s.volume));
      this.stats.muted = s.muted === true;
    } catch {}
    (globalThis as unknown as { __audio: Counters }).__audio = this.stats;
    const Ctx =
      globalThis.AudioContext ??
      (globalThis as never as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
    } catch {
      return;
    }
    this.master = this.node(this.ctx.createGain());
    this.master.connect(this.ctx.destination);
    this.applyVolume();
    const resume = () => {
      void this.ctx?.resume().then(() => {
        this.stats.state = this.ctx?.state ?? 'none';
        this.startLoops();
      });
    };
    for (const t of ['pointerdown', 'keydown'] as const)
      addEventListener(t, resume, { passive: true });
    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyM') this.setMuted(!this.stats.muted);
      else if (e.code === 'BracketLeft') this.setVolume(this.stats.volume - 0.1);
      else if (e.code === 'BracketRight') this.setVolume(this.stats.volume + 0.1);
    });
    addEventListener(
      'click',
      (e) => {
        if ((e.target as Element | null)?.closest?.('button,select,[data-ui]'))
          this.play('ui-click');
      },
      true,
    );
    void this.load();
  }

  private node<T extends AudioNode>(n: T): T {
    this.stats.nodes++;
    return n;
  }

  private applyVolume() {
    if (this.master)
      this.master.gain.value = this.stats.muted ? 0 : this.stats.volume * this.manifest.master;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ volume: this.stats.volume, muted: this.stats.muted }),
      );
    } catch {}
  }
  setMuted(m: boolean) {
    this.stats.muted = m;
    this.applyVolume();
  }
  setVolume(v: number) {
    this.stats.volume = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
    this.applyVolume();
  }

  /** Fetch the manifest, then decode every file; failures only log a note in `stats.missing`. */
  private async load() {
    const ctx = this.ctx as AudioContext;
    try {
      const r = await fetch(`${this.baseUrl}audio/manifest.json`);
      const v = validateManifest(await r.json());
      this.manifest = v.manifest;
      this.stats.missing.push(...v.errors);
    } catch {
      this.stats.missing.push('manifest.json');
      return;
    }
    this.applyVolume();
    const files = new Set(Object.values(this.manifest.sounds).flatMap((s) => s.files));
    await Promise.all(
      [...files].map(async (f) => {
        try {
          const r = await fetch(`${this.baseUrl}audio/${f}`);
          if (!r.ok) throw new Error(String(r.status));
          this.buffers.set(f, await ctx.decodeAudioData(await r.arrayBuffer()));
          this.stats.loaded++;
        } catch {
          this.stats.missing.push(f);
        }
      }),
    );
    if (ctx.state === 'running') this.startLoops();
  }

  private startLoops() {
    if (this.loopsOn || !this.buffers.size) return;
    this.loopsOn = true;
    for (const [id, d] of Object.entries(this.manifest.sounds)) if (d.loop) this.play(id);
  }

  /** Play a sound; `at` makes it positional. Unknown ids and missing files are ignored. */
  play(id: string, at?: Vec3) {
    const ctx = this.ctx;
    const def = this.manifest.sounds[id];
    // suspended = no gesture yet; queued sounds would all burst out on resume
    if (!ctx || !this.master || !def || ctx.state !== 'running') return;
    const buf = this.buffers.get(def.files[Math.floor(Math.random() * def.files.length)] as string);
    if (!buf) return;
    let dist = 0;
    if (at) {
      const l = ctx.listener;
      dist = Math.hypot(
        at.x - l.positionX.value,
        at.y - l.positionY.value,
        at.z - l.positionZ.value,
      );
      if (dist > this.manifest.cullDistance) return;
    }
    const release = this.limiter.acquire(id, def.maxVoices);
    if (!release) return;
    const src = this.node(ctx.createBufferSource());
    src.buffer = buf;
    src.loop = def.loop;
    src.playbackRate.value = pitchRate(def);
    const g = this.node(ctx.createGain());
    g.gain.value = def.volume;
    src.connect(g);
    if (at) {
      const p = this.node(ctx.createPanner());
      p.panningModel = 'equalpower';
      p.distanceModel = 'inverse';
      p.refDistance = 4;
      p.maxDistance = this.manifest.cullDistance;
      p.rolloffFactor = 1.2;
      p.positionX.value = at.x;
      p.positionY.value = at.y;
      p.positionZ.value = at.z;
      g.connect(p);
      p.connect(this.master);
    } else g.connect(this.master);
    src.onended = release;
    src.start();
    this.stats.plays[id] = (this.stats.plays[id] ?? 0) + 1;
  }

  /** Game events of one frame: shots, hits, kills, respawns, match end. */
  onEvents(events: readonly GameEvent[], selfId: number) {
    for (const e of events) {
      if (e.type === 'shot')
        this.play(`${e.weapon}-shot`, e.shooter === selfId ? undefined : e.origin);
      else if (e.type === 'hit') {
        if (e.shooter === selfId) this.play(e.headshot ? 'headshot' : 'hit-tick');
        if (e.target === selfId) this.play('hurt');
      } else if (e.type === 'kill' && e.victim === selfId) this.play('death');
      else if (e.type === 'respawn' && e.player === selfId) this.play('respawn');
      else if (e.type === 'matchEnd') this.play('match-end');
    }
  }

  /** A bullet mark landed: dirt for ground, concrete for walls. */
  impact(i: { x: number; y: number; z: number; ny: number }) {
    this.play(i.ny > 0.7 ? 'impact-dirt' : 'impact-concrete', i);
  }

  /** Per frame: listener pose, footsteps, reload start, weapon switch, dry fire. */
  frame(
    dt: number,
    eye: Vec3,
    yaw: number,
    players: readonly PlayerState[],
    me: PlayerState,
    firing: boolean,
  ) {
    const l = this.ctx?.listener;
    if (!l) return;
    l.positionX.value = eye.x;
    l.positionY.value = eye.y;
    l.positionZ.value = eye.z;
    l.forwardX.value = -Math.sin(yaw);
    l.forwardY.value = 0;
    l.forwardZ.value = -Math.cos(yaw);
    l.upX.value = 0;
    l.upY.value = 1;
    l.upZ.value = 0;

    for (const p of players) {
      const speed = Math.hypot(p.vel.x, p.vel.z);
      if (!p.alive || !p.onGround || p.crouching || speed < 1) continue;
      const d = (this.stride.get(p.id) ?? 0) + speed * dt;
      if (d < STEP_STRIDE) this.stride.set(p.id, d);
      else {
        this.stride.set(p.id, d - STEP_STRIDE);
        this.play('step', p.id === me.id ? undefined : p.pos);
      }
    }

    const w: WeaponId = me.weapon;
    const reloading = me.reloadLeft > 0;
    if (me.alive) {
      if (this.prev.weapon && this.prev.weapon !== w) this.play('switch');
      if (reloading && !this.prev.reloading) this.play(`${w}-reload`);
      this.prev.dry -= dt;
      if (firing && me.ammo[w] === 0 && !reloading && this.prev.dry <= 0) {
        this.prev.dry = 0.35;
        this.play('dry-fire');
      }
    }
    this.prev.weapon = w;
    this.prev.reloading = reloading;
  }
}
