// Folk University student ID card: a random student identity made at page load, shown on the
// title screen (with a re-roll button), in the pause menu, and as a small badge in the HUD.
// The identity lives in one place: the `identity` export, mirrored on window.__ft.identity.
// The avatar is DiceBear "Notionists" (art CC0 by Zoish, code MIT), rendered offline from a seed.
import { createAvatar } from '@dicebear/core';
import * as notionists from '@dicebear/notionists';
import './idcard.css';

export const MAJORS = [
  'Mechanical Engineering', 'Computer Science', 'Aeronautical and Astronautical Engineering',
  'Electrical Engineering', 'Agricultural Economics', 'Nursing', 'Hospitality and Tourism Management',
  'Biology', 'Industrial Engineering', 'Data Science', 'Aviation Management', 'Chemical Engineering',
  'Civil Engineering', 'Psychology', 'Animal Sciences', 'Brand Management', 'Computer Engineering',
  'Biomedical Engineering', 'Materials Engineering', 'Nuclear Engineering', 'Agricultural and Biological Engineering',
  'Construction Management', 'Professional Flight', 'Pharmacy', 'Chemistry', 'Physics', 'Mathematics',
  'Statistics', 'Actuarial Science', 'Economics', 'Finance', 'Accounting', 'Supply Chain Management',
  'Political Science', 'Communication', 'Kinesiology', 'Food Science', 'Forestry', 'Game Development and Design',
  'Cybersecurity',
];

export const DORMS = [
  'Carry Quad', 'Airhart Hall', 'Harris Hall', 'Hawk Hall', 'Hill Hall', 'Laurel Hall', 'McCutch Hall',
  'Merriweather Hall', 'Merriweather South', 'Owens Hall', 'Shrieve Hall', 'Tarkton Hall', 'Wily Hall',
  'Windham Halls', 'Frida Porter Hall', 'Winnie Porter Hall', 'First Avenue Towers', 'Third Avenue Suites',
  'Gryphon Hall North', 'Gryphon Hall South', 'Fuller House',
];

export const YEARS = [
  { year: 'Freshman', classOf: 2030 },
  { year: 'Sophomore', classOf: 2029 },
  { year: 'Junior', classOf: 2028 },
  { year: 'Senior', classOf: 2027 },
];
const GRAD = { year: 'Graduate Student', classOf: null };

const FIRST = [
  'Aiden', 'Amara', 'Ava', 'Ben', 'Caleb', 'Chloe', 'Daniel', 'Diego', 'Elena', 'Ethan', 'Fatima', 'Grace',
  'Hannah', 'Isaac', 'Jack', 'Jasmine', 'Kai', 'Leah', 'Liam', 'Lucas', 'Maya', 'Mia', 'Nathan', 'Noah',
  'Olivia', 'Omar', 'Priya', 'Quinn', 'Riley', 'Rohan', 'Sara', 'Sofia', 'Tyler', 'Wei', 'Yuki', 'Zoe',
  'Arjun', 'Brooke', 'Carter', 'Emma', 'Gabe', 'Isla', 'Jordan', 'Kofi', 'Lena', 'Mateo', 'Nora', 'Owen',
];
const LAST = [
  'Anderson', 'Baker', 'Chen', 'Clark', 'Davis', 'Diaz', 'Evans', 'Fischer', 'Garcia', 'Gupta', 'Hall', 'Hansen',
  'Ito', 'Johnson', 'Kim', 'Kowalski', 'Lee', 'Lopez', 'Martin', 'Miller', 'Nguyen', 'Novak', 'Okafor', 'Olsen',
  'Patel', 'Price', 'Reyes', 'Rossi', 'Schmidt', 'Shah', 'Singh', 'Smith', 'Taylor', 'Thompson', 'Walker',
  'Wang', 'Weber', 'Wilson', 'Yamamoto', 'Young', 'Zhang', 'Brennan', 'Moreau', 'Haddad', 'Larsen', 'Mensah',
];
const PHOTO_BG = ['e8e4da', 'cfb991', 'ddd3bf', 'c9c2b2', 'e3d6b8'];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

function makeIdentity() {
  const first = pick(FIRST);
  const last = pick(LAST);
  const y = Math.random() < 0.08 ? GRAD : pick(YEARS);
  const seed = `${first}-${last}-${digits(6)}`;
  return {
    first,
    last,
    name: `${first} ${last}`,
    id: `00${digits(8)}`, // 10 digits
    major: pick(MAJORS),
    dorm: pick(DORMS),
    year: y.year,
    classOf: y.classOf,
    avatarSeed: seed,
    avatarStyle: 'notionists',
  };
}

// The current identity. Mutated in place by reroll() so references held elsewhere stay valid.
export const identity = makeIdentity();
let avatarUri = '';
const listeners = new Set();
const ft = (window.__ft = window.__ft || {});
ft.identity = identity;

function renderAvatar() {
  avatarUri = createAvatar(notionists, {
    seed: identity.avatarSeed,
    backgroundColor: [PHOTO_BG[parseInt(identity.id.slice(-2), 10) % PHOTO_BG.length]],
    scale: 108,
    translateY: 4,
  }).toDataUri();
  identity.avatar = avatarUri;
}
renderAvatar();

export function reroll() {
  Object.assign(identity, makeIdentity());
  renderAvatar();
  for (const l of listeners) l(identity);
  sync();
  return identity;
}
export function onIdentity(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
ft.rerollIdentity = reroll;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmtId = (id) => `${id.slice(0, 4)} ${id.slice(4, 7)} ${id.slice(7)}`;
const classLine = (i) => (i.classOf ? `${i.year} \u00b7 Class of ${i.classOf}` : i.year);

// Original emblem: a stylised F on a shield, old gold on black.
const EMBLEM = `<svg class="idc-emblem" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1 38 7v15c0 11-7.6 19.4-18 23C9.6 41.4 2 33 2 22V7z" fill="#0a0908" stroke="#CFB991" stroke-width="2.4"/><path d="M13 11h15v5h-9.4v5.2h8v5h-8V36H13z" fill="#CFB991"/></svg>`;

// Code-39-looking barcode drawn from the ID digits (decorative, not scannable).
function barcode(id) {
  let x = 0;
  let bars = '';
  const seq = `*${id}*`;
  for (let c = 0; c < seq.length; c++) {
    const code = seq[c] === '*' ? 7 : Number(seq[c]);
    for (let b = 0; b < 5; b++) {
      const wide = ((code + 3) * (b + 1) * 7) % 5 < 2;
      const w = wide ? 3 : 1;
      if (b % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="20"/>`;
      x += w + 1;
    }
    x += 2;
  }
  return `<svg class="idc-bars" viewBox="0 0 ${x} 20" preserveAspectRatio="none" aria-hidden="true"><g fill="#0a0908">${bars}</g></svg>`;
}

function cardHTML(i) {
  return `<div class="idc-card" role="img" aria-label="Folk University student ID: ${esc(i.name)}, ${esc(i.major)}, ${esc(i.dorm)}, ${esc(classLine(i))}">
  <div class="idc-head">${EMBLEM}<div class="idc-uni"><b>FOLK UNIVERSITY</b><span>Folktown</span></div><div class="idc-kind">Student</div></div>
  <div class="idc-body">
    <div class="idc-photo"><img alt="" src="${avatarUri}"></div>
    <div class="idc-fields">
      <div class="idc-name">${esc(i.name)}</div>
      <dl>
        <div><dt>ID</dt><dd class="idc-mono">${fmtId(i.id)}</dd></div>
        <div><dt>Major</dt><dd>${esc(i.major)}</dd></div>
        <div><dt>Residence</dt><dd>${esc(i.dorm)}</dd></div>
        <div><dt>Class</dt><dd>${esc(classLine(i))}</dd></div>
      </dl>
    </div>
  </div>
  <div class="idc-strip">${barcode(i.id)}<span class="idc-mono">${i.id}</span></div>
</div>`;
}

const mounts = []; // { el, kind }

function sync() {
  for (const m of mounts) {
    if (m.kind === 'badge') {
      m.el.innerHTML = `<img alt="" src="${avatarUri}"><span><b>${esc(identity.name)}</b><i>${esc(identity.year)}</i></span>`;
    } else {
      const old = m.el.querySelector('.idc-card');
      const tmp = document.createElement('div');
      tmp.innerHTML = cardHTML(identity);
      if (old) old.replaceWith(tmp.firstChild);
      else m.el.prepend(tmp.firstChild);
    }
  }
}

function mountCard(parent, before, kind, withReroll) {
  const el = document.createElement('div');
  el.className = `idc-wrap idc-${kind}`;
  if (withReroll) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small idc-reroll';
    b.textContent = 'Re-roll student';
    b.setAttribute('aria-label', 'Re-roll student identity');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      reroll();
    });
    el.append(b);
  }
  parent.insertBefore(el, before || null);
  mounts.push({ el, kind });
}

function tryMount() {
  const ui = document.getElementById('ui');
  if (!ui) return false;
  const title = ui.querySelector('.m-title .m-title-main');
  if (title && !title.querySelector('.idc-wrap')) {
    title.classList.add('has-idc');
    mountCard(title, title.querySelector('.m-actions'), 'title', true);
  }
  const paused = ui.querySelector('[data-s="paused"]');
  if (paused && !paused.querySelector('.idc-wrap')) mountCard(paused, paused.querySelector('.m-actions'), 'paused', false);
  const hud = ui.querySelector('.hud');
  if (hud && !hud.querySelector('.idc-badge')) {
    const el = document.createElement('div');
    el.className = 'idc-badge';
    el.setAttribute('aria-hidden', 'true');
    hud.append(el);
    mounts.push({ el, kind: 'badge' });
  }
  sync();
  return !!(title && paused && hud);
}

// The menu and HUD are built by hud.js during boot; mount as soon as they exist.
if (!tryMount()) {
  const obs = new MutationObserver(() => {
    if (tryMount()) obs.disconnect();
  });
  obs.observe(document.getElementById('app') || document.documentElement, { childList: true, subtree: true });
}
