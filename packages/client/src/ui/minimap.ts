import type { PlayerState, Vec3, ZoneData } from '@folktown/shared';

const SIZE = 160;

/** Corner map: footprints drawn once into a backdrop, then the player arrow and bot dots each update. */
export class Minimap {
  private readonly c = document.createElement('canvas');
  private readonly back = document.createElement('canvas');
  private readonly scale: number;
  private readonly x0: number;
  private readonly z0: number;

  constructor(zone: ZoneData) {
    const { minX, maxX, minZ, maxZ } = zone.bounds;
    this.scale = SIZE / Math.max(maxX - minX, maxZ - minZ);
    this.x0 = minX;
    this.z0 = minZ;
    this.c.width = this.back.width = SIZE;
    this.c.height = this.back.height = SIZE;
    this.c.style.cssText =
      'position:fixed;left:16px;top:16px;border:2px solid rgba(255,255,255,.6);border-radius:4px;pointer-events:none';
    document.body.appendChild(this.c);
    const g = this.back.getContext('2d');
    if (!g) return;
    g.fillStyle = 'rgba(20,30,20,.7)';
    g.fillRect(0, 0, SIZE, SIZE);
    g.fillStyle = '#9a8f80';
    for (const col of zone.colliders) {
      g.beginPath();
      col.poly.forEach(([x, z], i) => {
        const [px, pz] = this.toMap(x, z);
        if (i) g.lineTo(px, pz);
        else g.moveTo(px, pz);
      });
      g.closePath();
      g.fill();
    }
  }

  private toMap(x: number, z: number): [number, number] {
    return [(x - this.x0) * this.scale, (z - this.z0) * this.scale];
  }

  update(me: PlayerState, mePos: Vec3, others: readonly PlayerState[], teamMode: boolean) {
    const g = this.c.getContext('2d');
    if (!g) return;
    g.drawImage(this.back, 0, 0);
    for (const p of others) {
      if (p.id === me.id || !p.alive) continue;
      const [x, z] = this.toMap(p.pos.x, p.pos.z);
      g.fillStyle = teamMode && p.team === me.team ? '#6ab0ff' : '#ff5a4a';
      g.fillRect(x - 2, z - 2, 4, 4);
    }
    // View direction is (-sin yaw, -cos yaw) in (x, z); map y runs along world z.
    const [x, z] = this.toMap(mePos.x, mePos.z);
    g.save();
    g.translate(x, z);
    g.rotate(Math.PI - me.yaw);
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(0, 6);
    g.lineTo(4, -4);
    g.lineTo(-4, -4);
    g.closePath();
    g.fill();
    g.restore();
  }
}
