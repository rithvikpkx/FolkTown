import type { PlayerInput, WeaponId } from '@folktown/shared';

const SENS = 0.0022; // radians per pixel
const ADS_SENS = 0.6; // multiplier while aiming
const PITCH_LIMIT = 1.5;

const WEAPON_KEYS: Record<string, WeaponId> = {
  Digit1: 'rifle',
  Digit2: 'pistol',
  Digit3: 'shotgun',
};

/** Raw device state. No DOM types here, so it can be driven by tests. */
export class InputState {
  yaw: number;
  pitch = 0;
  readonly keys = new Set<string>();
  fire = false;
  ads = false;
  private reloadQueued = false;
  private switchQueued: WeaponId | undefined;
  private tick = 0;

  constructor(yaw = 0) {
    this.yaw = yaw;
  }

  look(dx: number, dy: number) {
    const k = SENS * (this.ads ? ADS_SENS : 1);
    this.yaw -= dx * k; // moving the mouse right turns right = negative yaw
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch - dy * k));
  }

  keyDown(code: string) {
    if (this.keys.has(code)) return;
    this.keys.add(code);
    if (code === 'KeyR') this.reloadQueued = true;
    const w = WEAPON_KEYS[code];
    if (w) this.switchQueued = w;
  }

  keyUp(code: string) {
    this.keys.delete(code);
  }

  reset() {
    this.keys.clear();
    this.fire = false;
    this.ads = false;
  }

  /** One PlayerInput for the next sim tick. One-shot actions (reload, switch) fire once. */
  sample(): PlayerInput {
    const k = this.keys;
    const axis = (pos: string, neg: string) => (k.has(pos) ? 1 : 0) - (k.has(neg) ? 1 : 0);
    const input: PlayerInput = {
      tick: ++this.tick,
      moveX: axis('KeyD', 'KeyA'),
      moveZ: axis('KeyW', 'KeyS'),
      yaw: this.yaw,
      pitch: this.pitch,
      jump: k.has('Space'),
      sprint: k.has('ShiftLeft') || k.has('ShiftRight'),
      crouch: k.has('KeyC') || k.has('ControlLeft'),
      fire: this.fire,
      ads: this.ads,
      reload: this.reloadQueued,
    };
    if (this.switchQueued) input.switchWeapon = this.switchQueued;
    this.reloadQueued = false;
    this.switchQueued = undefined;
    return input;
  }
}

/** Attach pointer-lock mouse and keyboard to an InputState. Returns a detach function. */
export function attachInput(
  el: HTMLElement,
  st: InputState,
  onLockChange: (locked: boolean) => void,
) {
  const locked = () => document.pointerLockElement === el;
  const on = <K extends keyof DocumentEventMap>(t: K, f: (e: DocumentEventMap[K]) => void) => {
    document.addEventListener(t, f as EventListener);
    return () => document.removeEventListener(t, f as EventListener);
  };
  const offs = [
    on('mousemove', (e) => locked() && st.look(e.movementX, e.movementY)),
    on('mousedown', (e) => {
      if (!locked()) return;
      if (e.button === 0) st.fire = true;
      if (e.button === 2) st.ads = true;
    }),
    on('mouseup', (e) => {
      if (e.button === 0) st.fire = false;
      if (e.button === 2) st.ads = false;
    }),
    on('keydown', (e) => {
      if (!locked()) return;
      if (e.code === 'Space' || e.code.startsWith('Digit')) e.preventDefault();
      st.keyDown(e.code);
    }),
    on('keyup', (e) => st.keyUp(e.code)),
    on('contextmenu', (e) => e.preventDefault()),
    on('pointerlockchange', () => {
      if (!locked()) st.reset();
      onLockChange(locked());
    }),
  ];
  return () => {
    for (const o of offs) o();
  };
}
