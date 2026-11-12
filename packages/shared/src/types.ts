/** Coordinates: metres, x east, z south (north is -z), y up. Yaw 0 looks toward -z, positive turns left (counter-clockwise from above). */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type WeaponId = 'rifle' | 'pistol' | 'shotgun';

export interface WeaponDef {
  id: WeaponId;
  /** Damage per bullet (per pellet for the shotgun) inside falloffStart. */
  damage: number;
  /** Metres. Full damage up to falloffStart, linear down to minDamageFraction at falloffEnd. */
  falloffStart: number;
  falloffEnd: number;
  minDamageFraction: number;
  rpm: number;
  mag: number;
  /** Seconds. */
  reloadTime: number;
  /** Cone half-angle, radians. */
  spreadHip: number;
  spreadAds: number;
  pellets: number;
  auto: boolean;
  /** [pitch, yaw] radians per consecutive shot. */
  recoil: [pitch: number, yaw: number][];
}

/** One tick of player intent. The only thing a client sends. */
export interface PlayerInput {
  tick: number;
  /** Strafe, -1 left .. 1 right. */
  moveX: number;
  /** Forward/back, -1 back .. 1 forward. */
  moveZ: number;
  yaw: number;
  pitch: number;
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  fire: boolean;
  ads: boolean;
  reload: boolean;
  /** Weapon to switch to this tick, if any. */
  switchWeapon?: WeaponId;
}

export type Team = 0 | 1;

export interface PlayerState {
  id: number;
  name: string;
  isBot: boolean;
  team: Team;
  /** Feet position. */
  pos: Vec3;
  vel: Vec3;
  yaw: number;
  pitch: number;
  onGround: boolean;
  /** Seconds a jump is still allowed after leaving the ground, and seconds a jump press stays queued. */
  coyote: number;
  jumpBuffer: number;
  crouching: boolean;
  health: number;
  alive: boolean;
  weapon: WeaponId;
  ammo: Record<WeaponId, number>;
  /** Seconds until reload finishes, 0 when not reloading. */
  reloadLeft: number;
  /** Seconds until next shot allowed. */
  fireCooldown: number;
  /** Consecutive shots, indexes the recoil pattern. */
  shotsInBurst: number;
  /** Seconds until respawn while dead. */
  respawnIn: number;
  /** Seconds of damage immunity left after a spawn. */
  spawnProtection: number;
  /** Accumulated recoil the client adds to its view: pitch up and yaw to the right, radians. Decays when not firing. */
  recoilPitch: number;
  recoilYaw: number;
  kills: number;
  deaths: number;
}

/** A building or obstacle footprint extruded from baseY to topY. */
export interface ColliderData {
  id: string;
  /** Open ring of [x, z] points, either winding. */
  poly: [x: number, z: number][];
  baseY: number;
  topY: number;
}

/** A vertical cylinder: tree trunk, bin, cone. */
export interface PropData {
  x: number;
  z: number;
  radius: number;
  baseY: number;
  topY: number;
}

export interface SpawnData {
  x: number;
  z: number;
  yaw: number;
  team: Team;
}

export interface NavNode {
  id: number;
  x: number;
  z: number;
}

export interface ZoneData {
  name: string;
  /** Playable rectangle. */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Regular height grid, bilinear. cols*rows values, row-major (z rows). A flat zone is 2x2 equal values. */
  ground: { x0: number; z0: number; cell: number; cols: number; rows: number; heights: number[] };
  colliders: ColliderData[];
  props: PropData[];
  spawns: SpawnData[];
  nav: { nodes: NavNode[]; edges: [a: number, b: number][] };
}

export type MatchMode = 'ffa' | 'tdm';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface MatchConfig {
  mode: MatchMode;
  difficulty: Difficulty;
  botCount: number;
  /** Kills (ffa) or team kills (tdm) to win. */
  scoreLimit: number;
  /** Seconds. */
  timeLimit: number;
}

export interface MatchState {
  config: MatchConfig;
  tick: number;
  /** Seconds elapsed. */
  time: number;
  players: PlayerState[];
  teamScores: [number, number];
  ended: boolean;
  /** Winning player id (ffa) or team (tdm); null for a draw or while running. */
  winner: number | null;
}

export type GameEvent =
  | { type: 'shot'; tick: number; shooter: number; weapon: WeaponId; origin: Vec3; dir: Vec3 }
  | {
      type: 'hit';
      tick: number;
      shooter: number;
      target: number;
      damage: number;
      point: Vec3;
      headshot?: boolean;
    }
  | { type: 'kill'; tick: number; killer: number; victim: number; weapon: WeaponId }
  | { type: 'respawn'; tick: number; player: number; pos: Vec3 }
  | { type: 'matchEnd'; tick: number; winner: number | null };
