import type { GameEvent, MatchConfig, ZoneData } from '@folktown/shared';
import { Vector3 } from 'three';
import zoneJson from '../../../data/zones/engineering-mall.json';
import { cameraPose } from './game/camera';
import { Figures } from './game/figures';
import { impactsFor } from './game/impacts';
import { attachInput, InputState } from './game/input';
import { ImpactMarks } from './game/marks';
import { GameSession, PLAYER_ID } from './game/session';
import { ViewModel } from './game/weapon';
import { makeMaterials } from './materials';
import { createRenderer, parseFx } from './render';
import { createScene } from './scene';
import { buildZone } from './zone/build';

const q = new URLSearchParams(location.search);
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
  fx.webgl.setAnimationLoop((now: number) => fx.render(Math.min(now / 1000, 0.1)));
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
  const marks = new ImpactMarks(scene);

  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font:600 20px system-ui;background:rgba(0,0,0,.45);cursor:pointer;text-align:center';
  overlay.textContent =
    'Click to play. WASD move, mouse aim, LMB fire, RMB aim down sights, R reload, 1-3 weapons, Shift sprint, C crouch';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => canvas.requestPointerLock());
  attachInput(canvas, input, (locked) => {
    overlay.style.display = locked ? 'none' : 'flex';
  });

  const hooks: ((events: GameEvent[]) => void)[] = [];
  (window as unknown as { __game: unknown }).__game = { session, input, hooks };

  let last = performance.now();
  let lodT = 0;
  fx.webgl.setAnimationLoop((now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const locked = document.pointerLockElement === canvas;
    session.advance(dt, () => input.sample());
    const events = session.drainEvents();
    for (const h of hooks) h(events);
    const eye = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    for (const i of impactsFor(
      events,
      zone,
      (o, d, m) => session.match.collision.raycast(o, d, m),
      eye,
    ))
      marks.add(i.x, i.y, i.z, i.nx, i.ny, i.nz);
    if (events.some((e) => e.type === 'shot' && e.shooter === PLAYER_ID)) viewModel.fired();

    const me = session.player;
    const pos = session.lerpPos(me);
    if (!me.alive) {
      input.yaw = me.yaw;
      input.pitch = 0;
    }
    const pose = cameraPose(me, pos, input);
    camera.position.set(pose.x, pose.y, pose.z);
    camera.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ');
    figures.update(session.match.playerList, (p) => session.lerpPos(p), PLAYER_ID);
    lodT -= dt;
    if (lodT <= 0) {
      lodT = 0.5;
      view.updateLod(pose.x, pose.z);
    }
    viewModel.update(dt, me, input.ads);
    if (!locked) input.fire = false;
    fx.render(dt);
  });
}
