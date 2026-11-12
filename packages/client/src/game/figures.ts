import {
  type GameEvent,
  PLAYER_HEIGHT,
  PLAYER_HEIGHT_CROUCH,
  type PlayerState,
  type Vec3,
} from '@folktown/shared';
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';

const TEAM_COLOURS = [0x2f6fcf, 0xc4452f];
const FFA_COLOURS = [0x2f6fcf, 0xb8892b];

const body = new CapsuleGeometry(0.3, 0.9, 4, 10);
const head = new SphereGeometry(0.16, 12, 8);
const gun = new BoxGeometry(0.06, 0.08, 0.6);
const skin = new MeshStandardMaterial({ color: 0xc89b7b, roughness: 0.8 });
const dark = new MeshStandardMaterial({ color: 0x222428, roughness: 0.6 });

const flashMat = new MeshBasicMaterial({ color: 0xffd27a });
const flashGeo = new SphereGeometry(0.1, 8, 6);
const TRACERS = 16;
const FLASH_T = 0.12;
const HIT_T = 0.15;
const RED = new Color(0xff2020);

interface Fig {
  g: Group;
  torso: Mesh;
  head: Mesh;
  muzzle: Mesh;
  bar: Sprite;
  barCtx: CanvasRenderingContext2D;
  barTex: CanvasTexture;
  barHp: number;
  hitT: number;
  flashT: number;
  last: Vec3 | null;
  phase: number;
}

function makeBar(): Pick<Fig, 'bar' | 'barCtx' | 'barTex'> {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 8;
  const tex = new CanvasTexture(c);
  const bar = new Sprite(new SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  bar.scale.set(0.9, 0.11, 1);
  bar.renderOrder = 10;
  return { bar, barCtx: c.getContext('2d') as CanvasRenderingContext2D, barTex: tex };
}

/** Simple capsule-like bot figures (a body, a head and a gun), one group per bot. */
export class Figures {
  private readonly groups = new Map<number, Fig>();
  private readonly tracers: { line: Line; t: number }[] = [];
  private nextTracer = 0;

  constructor(
    private readonly scene: Scene,
    private readonly tdm: boolean,
  ) {
    for (let i = 0; i < TRACERS; i++) {
      const line = new Line(
        new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]),
        new LineBasicMaterial({ color: 0xffe9a8, transparent: true }),
      );
      line.visible = false;
      line.frustumCulled = false;
      scene.add(line);
      this.tracers.push({ line, t: 0 });
    }
  }

  /** Hit flash, muzzle flash and tracer from sim events (the human's own shots are skipped). */
  onEvents(events: GameEvent[], selfId: number) {
    for (const e of events) {
      if (e.type === 'hit') {
        const f = this.groups.get(e.target);
        if (f) f.hitT = HIT_T;
      } else if (e.type === 'shot' && e.shooter !== selfId) {
        const f = this.groups.get(e.shooter);
        if (f) f.flashT = FLASH_T;
        const tr = this.tracers[this.nextTracer++ % TRACERS];
        if (tr) {
          const o = e.origin;
          const pos = tr.line.geometry.getAttribute('position');
          pos.setXYZ(0, o.x, o.y - 0.15, o.z);
          pos.setXYZ(1, o.x + e.dir.x * 45, o.y - 0.15 + e.dir.y * 45, o.z + e.dir.z * 45);
          pos.needsUpdate = true;
          tr.t = FLASH_T;
          tr.line.visible = true;
        }
      }
    }
  }

  update(
    players: readonly PlayerState[],
    posOf: (p: PlayerState) => Vec3,
    selfId: number,
    dt = 1 / 60,
  ) {
    for (const t of this.tracers) {
      t.t -= dt;
      if (t.t <= 0) t.line.visible = false;
      else (t.line.material as LineBasicMaterial).opacity = t.t / FLASH_T;
    }
    for (const p of players) {
      if (p.id === selfId) continue;
      let f = this.groups.get(p.id);
      if (!f) {
        const col = (this.tdm ? TEAM_COLOURS : FFA_COLOURS)[p.team] ?? 0x888888;
        const torso = new Mesh(body, new MeshStandardMaterial({ color: col, roughness: 0.85 }));
        const h = new Mesh(head, skin);
        const g = new Group();
        const rifle = new Mesh(gun, dark);
        rifle.position.set(0.2, 0, -0.35);
        const muzzle = new Mesh(flashGeo, flashMat);
        muzzle.position.set(0.2, 0, -0.75);
        muzzle.visible = false;
        g.add(torso, h, rifle, muzzle);
        g.traverse((o) => {
          o.castShadow = true;
        });
        const b = makeBar();
        this.scene.add(g, b.bar);
        f = {
          g,
          torso,
          head: h,
          muzzle,
          ...b,
          barHp: -1,
          hitT: 0,
          flashT: 0,
          last: null,
          phase: 0,
        };
        this.groups.set(p.id, f);
      }
      f.g.visible = p.alive;
      f.bar.visible = p.alive;
      if (!p.alive) {
        f.last = null;
        continue;
      }
      const pos = posOf(p);
      const height = p.crouching ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT;
      // run bob and forward lean from ground speed
      const speed = f.last ? Math.hypot(pos.x - f.last.x, pos.z - f.last.z) / dt : 0;
      f.last = { x: pos.x, y: pos.y, z: pos.z };
      const run = Math.min(1, speed / 6);
      f.phase += speed * dt * 2.2;
      f.g.position.set(pos.x, pos.y + Math.abs(Math.sin(f.phase)) * 0.07 * run, pos.z);
      f.g.rotation.set(0.14 * run, p.yaw, Math.sin(f.phase) * 0.05 * run, 'YXZ');
      f.torso.position.y = (height - 0.3) / 2 + 0.05;
      f.torso.scale.y = (height - 0.3) / 1.5;
      f.head.position.y = height - 0.16;
      f.g.children[2]?.position.setY(height * 0.65);
      f.muzzle.position.y = height * 0.65;
      f.flashT -= dt;
      f.muzzle.visible = f.flashT > 0;
      f.hitT -= dt;
      (f.torso.material as MeshStandardMaterial).emissive
        .copy(RED)
        .multiplyScalar(f.hitT > 0 ? 0.9 : 0);
      f.bar.position.set(pos.x, pos.y + height + 0.35, pos.z);
      const hp = Math.round(p.health);
      if (hp !== f.barHp) {
        f.barHp = hp;
        const c = f.barCtx;
        c.fillStyle = 'rgba(0,0,0,.7)';
        c.fillRect(0, 0, 64, 8);
        c.fillStyle = hp > 50 ? '#5fd35f' : hp > 25 ? '#e0b030' : '#e04040';
        c.fillRect(1, 1, Math.max(0, (62 * hp) / 100), 6);
        f.barTex.needsUpdate = true;
      }
    }
  }
}
