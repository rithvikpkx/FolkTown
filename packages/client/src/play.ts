import {
  type GameEvent,
  type MatchConfig,
  type MatchState,
  WALK_SPEED,
  WEAPONS,
  type WeaponId,
  type ZoneData,
} from '@folktown/shared';
import { Vector3 } from 'three';
import zoneJson from '../../../data/zones/engineering-mall.json';
import { AudioSystem } from './audio/audio';
import { cameraPose } from './game/camera';
import { CameraFeel } from './game/feel';
import { Figures } from './game/figures';
import { Hud } from './game/hud';
import { impactsFor } from './game/impacts';
import { attachInput, InputState } from './game/input';
import { ImpactMarks } from './game/marks';
import { GameSession, PLAYER_ID } from './game/session';
import { ViewModel } from './game/weapon';
import { makeMaterials } from './materials';
import { createRenderer, parseFx } from './render';
import { createScene } from './scene';
import { mountUi } from './ui';
import { needsMenu, showMenu } from './ui/menu';
import { buildZone } from './zone/build';

const q = new URLSearchParams(location.search);
const snd = new AudioSystem();
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const { scene, camera } = createScene(innerWidth / innerHeight);
scene.add(camera);
const zone = zoneJson as unknown as ZoneData;
const cx = (zone.bounds.minX + zone.bounds.maxX) / 2;
const cz = (zone.bounds.minZ + zone.bounds.maxZ) / 2;
const fx = createRenderer(canvas, scene, camera, {
  ...parseFx(location.search),
  shadow: { center: new Vector3(cx, 0, cz), size: 340 },
});
addEventListener('resize', () => fx.resize());
// frame-time ring buffer (ms) for tools/bench.mjs and shoot.mjs
const ft = { times: new Float32Array(600), n: 0, renderer: '', texMs: 0 };
(window as unknown as { __ft: typeof ft }).__ft = ft;
ft.renderer = String(fx.webgl.getContext().getParameter(0x1f01));
const mats = await makeMaterials(fx.webgl);
const view = buildZone(scene, mats, zone);
fx.invalidateShadow();

// ?cam=x,y,z,yaw,pitch: a fixed camera over the zone with no game (screenshots, benches).
const cam = q.get('cam')?.split(',').map(Number);
if (cam?.length === 5 && cam.every(Number.isFinite)) {
  const [x = 0, y = 0, z = 0, yaw = 0, pitch = 0] = cam;
  camera.position.set(x, y, z);
  camera.rotation.set((pitch * Math.PI) / 180, (yaw * Math.PI) / 180, 0, 'YXZ');
  view.updateLod(x, z);
  let prev = performance.now();
  fx.webgl.setAnimationLoop((now: number) => {
    ft.times[ft.n++ % 600] = now - prev;
    fx.render(Math.min((now - prev) / 1000, 0.1));
    prev = now;
  });
} else if (needsMenu(location.search)) {
  showMenu();
} else {
  startGame();
}

function startGame() {
  const config: MatchConfig = {
    mode: q.get('mode') === 'tdm' ? 'tdm' : 'ffa',
    difficulty: (['easy', 'normal', 'hard'] as const).find((d) => d === q.get('diff')) ?? 'normal',
    botCount: Number(q.get('bots') ?? 7),
    scoreLimit: 25,
    timeLimit: 600,
  };
  const session = new GameSession(zone, config);
  const input = new InputState(session.player.yaw);
  const figures = new Figures(scene, config.mode === 'tdm');
  const viewModel = new ViewModel(mats, camera);
  const feel = new CameraFeel();
  const marks = new ImpactMarks(scene);
  const hud = new Hud(
    PLAYER_ID,
    (id) => session.match.getPlayer(id)?.name ?? `#${id}`,
    (id) => session.match.getPlayer(id)?.pos,
  );
  const ui = mountUi(zone, PLAYER_ID);
  const state = () => session.match.snapshot();

  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font:600 20px system-ui;background:rgba(0,0,0,.45);cursor:pointer;text-align:center';
  overlay.textContent =
    'Click to play. WASD move, mouse aim, LMB fire, RMB aim down sights, R reload, 1-3 weapons, Shift sprint, C crouch';
  document.body.appendChild(overlay);
  let started = false;
  overlay.addEventListener('click', () => {
    if (!started) snd.play('match-start');
    started = true;
    canvas.requestPointerLock();
  });
  attachInput(canvas, input, (locked) => {
    overlay.style.display = locked ? 'none' : 'flex';
  });

  const hooks: ((events: GameEvent[]) => void)[] = [];
  (window as unknown as { __game: unknown }).__game = { session, input, hooks, viewModel };
  // ?gun=rifle&variant=flat&ads=1 previews a gun (offsets can be tuned live through __game.viewModel)
  const gun = q.get('gun');
  if (gun && gun in WEAPONS) {
    session.player.weapon = gun as WeaponId;
    input.ads = q.get('ads') === '1';
  }

  let last = performance.now();
  let lodT = 0;
  let hudT = 0;
  let matchState: MatchState | null = null;
  fx.webgl.setAnimationLoop((now: number) => {
    ft.times[ft.n++ % 600] = now - last;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const locked = document.pointerLockElement === canvas;
    session.advance(dt, () => input.sample());
    const events = session.drainEvents();
    for (const h of hooks) h(events);
    hud.onEvents(events);
    feel.onEvents(events, PLAYER_ID);
    snd.onEvents(events, PLAYER_ID);
    figures.onEvents(events, PLAYER_ID);
    const eye = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    for (const i of impactsFor(
      events,
      zone,
      (o, d, m) => session.match.collision.raycast(o, d, m),
      eye,
    )) {
      marks.add(i.x, i.y, i.z, i.nx, i.ny, i.nz);
      snd.impact(i);
    }
    if (events.some((e) => e.type === 'shot' && e.shooter === PLAYER_ID)) viewModel.fired();

    const me = session.player;
    const pos = session.lerpPos(me);
    if (!me.alive) {
      input.yaw = me.yaw;
      input.pitch = 0;
    }
    const pose = cameraPose(me, pos, input);
    const fe = feel.update(dt, {
      speed: Math.hypot(me.vel.x, me.vel.z),
      rightVel: me.vel.x * Math.cos(pose.yaw) - me.vel.z * Math.sin(pose.yaw),
      vy: me.vel.y,
      onGround: me.onGround,
      sprinting: Math.hypot(me.vel.x, me.vel.z) > WALK_SPEED + 0.5 && me.onGround && !input.ads,
      crouching: me.crouching,
      alive: me.alive,
      ads: input.ads ? 1 : 0,
    });
    viewModel.fovKick = fe.fov;
    camera.position.set(
      pose.x + Math.cos(pose.yaw) * fe.x,
      pose.y + fe.y,
      pose.z - Math.sin(pose.yaw) * fe.x,
    );
    camera.rotation.set(pose.pitch + fe.pitch, pose.yaw + fe.yaw, fe.roll, 'YXZ');
    snd.frame(dt, pose, pose.yaw, session.match.playerList, me, locked && input.fire);
    figures.update(session.match.playerList, (p) => session.lerpPos(p), PLAYER_ID, dt);
    lodT -= dt;
    if (lodT <= 0) {
      lodT = 0.5;
      view.updateLod(pose.x, pose.z);
    }
    viewModel.update(dt, me, input.ads);
    hudT -= dt;
    if (hudT <= 0) {
      hudT = 0.2;
      matchState = state();
    }
    hud.update(dt, me, matchState, input.ads);
    ui(matchState, me, pos);
    if (!locked) input.fire = false;
    fx.render(dt);
  });
}
