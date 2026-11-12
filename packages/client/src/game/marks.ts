import {
  CanvasTexture,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  type Scene,
  Vector3,
} from 'three';

const CAPACITY = 128;
const Z = new Vector3(0, 0, 1);

function holeTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d') as CanvasRenderingContext2D;
  const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(15,12,10,0.95)');
  gr.addColorStop(0.45, 'rgba(25,20,16,0.7)');
  gr.addColorStop(1, 'rgba(25,20,16,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 32, 32);
  return new CanvasTexture(c);
}

/** Bullet-hole decals on walls and ground, a ring buffer of the most recent 128. */
export class ImpactMarks {
  private readonly mesh: InstancedMesh;
  private n = 0;
  private readonly m = new Matrix4();
  private readonly q = new Quaternion();
  private readonly normal = new Vector3();

  constructor(scene: Scene) {
    const mat = new MeshBasicMaterial({
      map: holeTexture(),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    this.mesh = new InstancedMesh(new PlaneGeometry(0.16, 0.16), mat, CAPACITY);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    // start with every instance collapsed to nothing
    this.m.makeScale(0, 0, 0);
    for (let i = 0; i < CAPACITY; i++) this.mesh.setMatrixAt(i, this.m);
    scene.add(this.mesh);
  }

  add(x: number, y: number, z: number, nx: number, ny: number, nz: number) {
    this.normal.set(nx, ny, nz).normalize();
    this.q.setFromUnitVectors(Z, this.normal);
    this.m.compose(
      new Vector3(x + this.normal.x * 0.012, y + this.normal.y * 0.012, z + this.normal.z * 0.012),
      this.q,
      new Vector3(1, 1, 1),
    );
    this.mesh.setMatrixAt(this.n++ % CAPACITY, this.m);
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
