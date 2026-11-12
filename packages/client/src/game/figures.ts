import { PLAYER_HEIGHT, PLAYER_HEIGHT_CROUCH, type PlayerState, type Vec3 } from '@folktown/shared';
import {
  BoxGeometry,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Scene,
  SphereGeometry,
} from 'three';

const TEAM_COLOURS = [0x2f6fcf, 0xc4452f];
const FFA_COLOURS = [0x2f6fcf, 0xb8892b];

const body = new CapsuleGeometry(0.3, 0.9, 4, 10);
const head = new SphereGeometry(0.16, 12, 8);
const gun = new BoxGeometry(0.06, 0.08, 0.6);
const skin = new MeshStandardMaterial({ color: 0xc89b7b, roughness: 0.8 });
const dark = new MeshStandardMaterial({ color: 0x222428, roughness: 0.6 });

/** Simple capsule-like bot figures (a body, a head and a gun), one group per bot. */
export class Figures {
  private readonly groups = new Map<number, { g: Group; torso: Mesh; head: Mesh }>();

  constructor(
    private readonly scene: Scene,
    private readonly tdm: boolean,
  ) {}

  update(players: readonly PlayerState[], posOf: (p: PlayerState) => Vec3, selfId: number) {
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
        g.add(torso, h, rifle);
        g.traverse((o) => {
          o.castShadow = true;
        });
        this.scene.add(g);
        f = { g, torso, head: h };
        this.groups.set(p.id, f);
      }
      f.g.visible = p.alive;
      if (!p.alive) continue;
      const pos = posOf(p);
      const height = p.crouching ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT;
      f.g.position.set(pos.x, pos.y, pos.z);
      f.g.rotation.y = p.yaw;
      f.torso.position.y = (height - 0.3) / 2 + 0.05;
      f.torso.scale.y = (height - 0.3) / 1.5;
      f.head.position.y = height - 0.16;
      f.g.children[2]?.position.setY(height * 0.65);
    }
  }
}
