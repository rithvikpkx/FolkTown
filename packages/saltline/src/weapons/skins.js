// Weapon skins: Default, Old Gold, Black & Gold. Each skin clones the original materials per (material, role) and swaps
// colour / metalness / roughness; normal, AO and bump maps are kept, the albedo and ORM maps are dropped so the flat PBR
// colour reads clean. Originals are never modified or disposed; the previous skin's clones are disposed on every change.
import { Color } from 'three';

const KEY = 'folktown.weaponSkin';
const GOLD = new Color('#CFB991');
const BLACK = new Color('#111111');
export const SKINS = [
  { id: 'default', name: 'Default' },
  { id: 'old-gold', name: 'Old Gold' },
  { id: 'black-gold', name: 'Black & Gold' },
];
const gold = { color: GOLD, metalness: 1, roughness: 0.35 };
const black = { color: BLACK, metalness: 0.35, roughness: 0.45 };
const blackSoft = { color: BLACK, metalness: 0, roughness: 0.62 };
// role -> look for each non-default skin (null keeps the original material)
const LOOKS = {
  'old-gold': { body: gold, head: gold, strike: { ...gold, roughness: 0.25 }, furniture: blackSoft, mag: black, small: black, grip: null, ferrule: black },
  'black-gold': { body: black, furniture: blackSoft, head: black, small: gold, mag: gold, strike: { ...gold, roughness: 0.25 }, grip: null, ferrule: gold },
};

function roleOf(rigId, mesh, root) {
  // the names of the mesh and its ancestors up to the rig root tell us the part
  let names = '';
  for (let o = mesh; o && o !== root; o = o.parent) names += ' ' + (o.name || '');
  names = names.toLowerCase();
  if (rigId === 'hammer') {
    if (names.includes('hammer_head')) return 'head';
    if (names.includes('hammer_strike')) return 'strike';
    if (names.includes('hammer_grip')) return 'grip';
    if (names.includes('hammer_ferrule')) return 'ferrule';
    return 'head';
  }
  if (rigId === 'pistol') {
    if (names.includes('magazine') || names.includes('mag')) return 'mag';
    if (names.includes('slide')) return 'body';
    if (names.includes('hammer') || names.includes('trigger')) return 'small';
    return 'furniture'; // frame / grip
  }
  if (names.includes('stock')) return 'furniture';
  if (names.includes('magazine')) return 'mag';
  if (/charging|ejector|firemode|trigger|sight/.test(names)) return 'small';
  return 'body';
}

function readStored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
const norm = (v) => {
  if (v == null) return null;
  const s = String(v).toLowerCase().replace(/&/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-');
  const hit = SKINS.find((k) => k.id === s || k.name.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') === s);
  return hit ? hit.id : null;
};

/** rigs: {rifle, pistol, hammer}. Applies the saved (or ?skin=) skin and returns the controller. */
export function createSkins(G, rigs) {
  let url = null;
  try {
    url = norm(new URLSearchParams(location.search).get('skin'));
  } catch {}
  let current = url || norm(readStored()) || 'default';
  let cache = new Map(); // `${uuid}|${role}` -> cloned material
  const listeners = new Set();

  function skinMaterial(orig, look, next) {
    const k = orig.uuid + '|' + look.key;
    let m = next.get(k);
    if (m) return m;
    m = orig.clone();
    m.name = (orig.name || 'mat') + '@' + look.key;
    m.map = null;
    m.roughnessMap = null;
    m.metalnessMap = null;
    m.vertexColors = false;
    if (m.color) m.color.copy(look.color);
    if ('metalness' in m) m.metalness = look.metalness;
    if ('roughness' in m) m.roughness = look.roughness;
    if (m.emissive) m.emissive.setRGB(0, 0, 0);
    m.needsUpdate = true;
    next.set(k, m);
    return m;
  }

  function apply() {
    const next = new Map();
    const looks = LOOKS[current];
    for (const [id, rig] of Object.entries(rigs)) {
      if (!rig || !rig.root) continue;
      rig.root.traverse((o) => {
        if (!o.isMesh || o === rig.flash || o.userData.noSkin) return;
        if (o.userData.skinOrig === undefined) o.userData.skinOrig = o.material;
        const orig = o.userData.skinOrig;
        const role = roleOf(id, o, rig.root);
        const look = looks && looks[role];
        if (!look || Array.isArray(orig) || !orig.isMeshStandardMaterial) {
          o.material = orig;
          return;
        }
        o.material = skinMaterial(orig, { ...look, key: current + ':' + role }, next);
      });
    }
    for (const [k, m] of cache) if (!next.has(k) || next.get(k) !== m) m.dispose(); // textures are shared, never disposed
    cache = next;
    for (const f of listeners) f(current);
  }

  const api = {
    list: SKINS.map((s) => s.name),
    ids: SKINS.map((s) => s.id),
    get current() {
      return current;
    },
    get currentName() {
      return SKINS.find((s) => s.id === current).name;
    },
    set(v, persist = true) {
      const id = norm(v) || (typeof v === 'number' ? SKINS[((v % SKINS.length) + SKINS.length) % SKINS.length].id : null);
      if (!id) return false;
      current = id;
      if (persist)
        try {
          localStorage.setItem(KEY, id);
        } catch {}
      apply();
      return true;
    },
    cycle(step = 1) {
      const i = SKINS.findIndex((s) => s.id === current);
      api.set(SKINS[(i + step + SKINS.length) % SKINS.length].id);
      return api.currentName;
    },
    /** re-apply after a rig's meshes changed (GLB swap) */
    refresh() {
      for (const rig of Object.values(rigs))
        rig &&
          rig.root &&
          rig.root.traverse((o) => {
            if (o.isMesh && o.userData.skinOrig !== undefined && o.material !== o.userData.skinOrig && ![...cache.values()].includes(o.material)) o.userData.skinOrig = o.material;
          });
      apply();
    },
    onChange(f) {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    get cacheSize() {
      return cache.size;
    },
  };
  apply();
  return api;
}

/** Wires the B hotkey and a "Weapon skin" row into the settings pane. */
export function bindSkinUI(G, skins) {
  if (typeof window === 'undefined') return;
  addEventListener('keydown', (e) => {
    if (e.code !== 'KeyB' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const name = skins.cycle();
    try {
      G.hud && G.hud.message && G.hud.message(`Weapon skin: ${name}`, 1.6);
    } catch {}
  });
  let tries = 0;
  const inject = () => {
    const pane = document.querySelector('.panel-b[data-pane="settings"]');
    if (!pane) return ++tries < 120 && setTimeout(inject, 500);
    if (pane.querySelector('[data-skin-row]')) return;
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.skinRow = '1';
    row.innerHTML =
      '<label id="lbl-skin">Weapon skin <kbd>B</kbd></label><div class="seg" role="group" aria-labelledby="lbl-skin">' +
      SKINS.map((s) => `<button type="button" data-skin="${s.id}">${s.name.replace('&', '&amp;')}</button>`).join('') +
      '</div>';
    const note = pane.querySelector('.panel-note');
    note ? pane.insertBefore(row, note) : pane.appendChild(row);
    const sync = (id) => row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.skin === id)));
    row.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-skin]');
      if (b) skins.set(b.dataset.skin);
    });
    sync(skins.current);
    skins.onChange(sync);
  };
  inject();
}
