// Swaps Saltline's procedural gun meshes for lab GLBs described in weapons.json. Any failure leaves the procedural gun untouched.
import { Box3, Vector3, TextureLoader, SRGBColorSpace } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import manifest from './weapons.json';

const base = import.meta.env.BASE_URL;

async function applyMaps(model, maps) {
  const tl = new TextureLoader();
  const load = async (f, srgb) => {
    const t = await tl.loadAsync(base + f);
    t.flipY = false; // glTF convention
    t.anisotropy = 8;
    if (srgb) t.colorSpace = SRGBColorSpace;
    return t;
  };
  const jobs = [];
  const done = new Set();
  model.traverse((c) => {
    const m = c.material;
    const t = m && maps && maps[m.name];
    if (!t || done.has(m)) return;
    done.add(m);
    jobs.push(
      Promise.all([load(t.map, true), load(t.normal, false), load(t.orm, false)]).then(([a, n, r]) => {
        m.map = a;
        m.normalMap = n;
        m.roughnessMap = m.metalnessMap = m.aoMap = r;
        m.roughness = m.metalness = 1;
        m.needsUpdate = true;
      }),
    );
  });
  await Promise.all(jobs);
}

/** rig: {root, flash, magGroup?}; layer: the view-model render layer. Resolves true when the GLB replaced the procedural meshes. */
export async function attachModel(rig, id, layer) {
  const d = manifest[id];
  if (!d) return false;
  try {
    const model = (await new GLTFLoader().loadAsync(base + d.url)).scene;
    await applyMaps(model, d.maps);
    // fit: rotate, scale the longest horizontal extent to length, then front and top into the rig's gun space
    model.rotation.y = (d.rotationY * Math.PI) / 180;
    model.updateMatrixWorld(true);
    let box = new Box3().setFromObject(model);
    model.scale.setScalar(d.length / Math.max(box.max.x - box.min.x, box.max.z - box.min.z));
    model.updateMatrixWorld(true);
    box = new Box3().setFromObject(model);
    const c = box.getCenter(new Vector3());
    model.position.set(d.x - c.x, d.topY - box.max.y, d.frontZ - box.min.z);
    if (d.alignNode) {
      // optional: slide the model so a named part (the rear sight) sits at alignZ, which is what ADS lines the eye up with
      model.updateMatrixWorld(true);
      model.position.z += d.alignZ - new Box3().setFromObject(model.getObjectByName(d.alignNode)).getCenter(new Vector3()).z;
    }
    model.traverse((o) => {
      o.frustumCulled = false;
      o.layers.set(layer);
    });
    // procedural meshes go only now that the model is ready
    for (const ch of [...rig.root.children]) if (ch !== rig.flash && ch !== rig.magGroup) rig.root.remove(ch);
    rig.root.add(model);
    rig.root.updateMatrixWorld(true);
    if (rig.magGroup) {
      rig.magGroup.clear();
      const mag = d.magazine && model.getObjectByName(d.magazine);
      if (mag) rig.magGroup.attach(mag); // keeps its world pose, then rides the reload animation
    }
    return true;
  } catch (e) {
    console.warn(`[weapons] ${id} model failed, keeping procedural gun: ${e}`);
    return false;
  }
}
