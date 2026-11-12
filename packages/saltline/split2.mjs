import { parse, tokenizer, tokTypes } from 'acorn';
import fs from 'fs';

const SP = '/private/tmp/claude-502/-Users-rithvikpraveenkumar-Codebox-Repos-FolkTown/a3adacfe-feba-484c-99f9-d50da0da1094/scratchpad/';
const OUT = process.argv[2];
const src = fs.readFileSync(SP + 'game.pretty.js', 'utf8');
const ast = parse(src, { ecmaVersion: 'latest', locations: true });
const body = ast.body[0].expression.callee.body.body;

const plan = [
  ['common', 28747, 'config, RNG/event helpers, geometry merge + primitive builders'],
  ['render', 29304, 'ns render: renderer, post-processing, sky/shadow rig'],
  ['mats', 31115, 'ns mats: materials, textures, shader patches'],
  ['props', 33637, 'ns props: prop builders and registry'],
  ['level', 38462, 'ns level: arena layout and collision'],
  ['backdrop', 41168, 'ns backdrop: skyline / distant scenery'],
  ['ground', 43239, 'ns ground: terrain and ground cover'],
  ['fx', 44455, 'ns fx: particles, decals, effects, sound recipes'],
  ['audio', 51387, 'audio tables, mixer, music, audio engine and game logic'],
  ['weapon', 54427, 'ns weapon: weapon models and firing'],
  ['hands', 58671, 'ns hands: first-person hands and animation'],
  ['enemies', 62747, 'ns enemies: enemy rigs, AI and showcase'],
  ['hud', 64977, 'HUD, menus, settings, legacy fallback'],
  ['loop', 66022, 'frame loop (pT)'],
  ['boot', 66722, 'boot: window.__ready flags, error hooks, asset boot, entry call'],
];

const idx = (L) => body.findIndex((s) => s.loc.start.line <= L && s.loc.end.line >= L);
const starts = plan.map((p) => idx(p[1]));
console.error('starts', plan.map((p, i) => `${p[0]}:${starts[i]}@${body[starts[i]].loc.start.line}`).join(' '));
const kn = starts[0];

// three region
const threeStmts = body.slice(2, kn);
function declNames(s, out = []) {
  const pat = (p) => {
    if (!p) return;
    if (p.type === 'Identifier') out.push(p.name);
    else if (p.type === 'ObjectPattern') p.properties.forEach((q) => pat(q.value ?? q.argument));
    else if (p.type === 'ArrayPattern') p.elements.forEach(pat);
    else if (p.type === 'AssignmentPattern') pat(p.left);
    else if (p.type === 'RestElement') pat(p.argument);
  };
  if (s.type === 'VariableDeclaration') s.declarations.forEach((d) => pat(d.id));
  else if (s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') out.push(s.id.name);
  return out;
}
const threeDecl = new Set(threeStmts.flatMap((s) => declNames(s)));
// ut map
const utStmt = body.find((s) => s.type === 'ExpressionStatement' && s.expression.type === 'CallExpression' && s.expression.arguments[0]?.name === 'ut');
const m2n = new Map(); // mangled -> export name
for (const p of utStmt.expression.arguments[1].properties) {
  const key = p.key.name ?? p.key.value;
  const v = p.value.body.name;
  if (!m2n.has(v)) m2n.set(v, key);
}

// chunks
const chunks = plan.map(([name, , role], i) => {
  const a = starts[i];
  const b = i + 1 < plan.length ? starts[i + 1] : body.length;
  return { name, role, a, b, stmts: body.slice(a, b) };
});
const owner = new Map();
for (const c of chunks) for (const s of c.stmts) for (const n of declNames(s)) {
  if (owner.has(n)) console.error('DUP decl', n, owner.get(n), c.name);
  owner.set(n, c.name);
}
// prelude ar / bT belong to common
owner.set('ar', 'ns'); owner.set('bT', 'ns');

const warn = [];
for (const c of chunks) {
  const text = src.slice(c.stmts[0].start, c.stmts.at(-1).end);
  c.startLine = c.stmts[0].loc.start.line;
  c.endLine = c.stmts.at(-1).loc.end.line;
  const ids = new Set();
  let prev = null;
  for (const t of tokenizer(text, { ecmaVersion: 'latest' })) {
    if (t.type === tokTypes.name && prev !== tokTypes.dot && prev !== tokTypes.questionDot) ids.add(t.value);
    prev = t.type;
  }
  c.own = new Set(c.stmts.flatMap((s) => declNames(s)));
  
  c.threeImp = new Map();
  c.imps = new Map(); // chunk -> Set
  for (const id of ids) {
    if (c.own.has(id)) continue;
    if (id === 'ut') { c.nsThree = true; continue; }
    if (m2n.has(id)) { c.threeImp.set(id, m2n.get(id)); continue; }
    if (owner.has(id)) {
      const o = owner.get(id);
      if (!c.imps.has(o)) c.imps.set(o, new Set());
      c.imps.get(o).add(id);
      continue;
    }
    if (threeDecl.has(id)) warn.push(`${c.name} uses unexported three internal ${id}`);
  }
  c.text = text;
}
// mutation check
const chunkOfPos = (pos) => chunks.find((c) => pos >= c.stmts[0].start && pos <= c.stmts.at(-1).end);
function walk(n, f) {
  if (!n || typeof n.type !== 'string') return;
  f(n);
  for (const k in n) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach((x) => x && x.type && walk(x, f));
    else if (v && typeof v.type === 'string') walk(v, f);
  }
}
const assigned = new Set();
for (const s of body.slice(kn)) walk(s, (n) => {
  let id;
  if (n.type === 'AssignmentExpression' && n.left.type === 'Identifier') id = n.left.name;
  if (n.type === 'UpdateExpression' && n.argument.type === 'Identifier') id = n.argument.name;
  if (id) assigned.add(id);
  if (id && owner.has(id)) {
    const c = chunkOfPos(n.start);
    if (c && owner.get(id) !== c.name) warn.push(`MUTATION of ${id} (owner ${owner.get(id)}) in ${c.name} line ${n.loc.start.line}`);
  }
});
console.error(warn.join('\n') || 'no warnings');

// emit
// Forward imports (chunk i using a name owned by a later chunk j) would reorder module evaluation in
// cyclic ESM graphs, so they become late-bound: i declares `let N` plus a setter, j fills it in.
const ord = Object.fromEntries(chunks.map((c, i) => [c.name, i]));
const byName = Object.fromEntries(chunks.map((c) => [c.name, c]));
for (const c of chunks) {
  c.late = new Set(); // names this chunk receives late
  c.lateOut = new Map(); // importing chunk name -> [names to push]
}
for (const c of chunks) {
  for (const [o, set] of [...c.imps]) {
    if (o === 'ns' || ord[o] < ord[c.name]) continue;
    c.imps.delete(o);
    for (const n of set) {
      c.late.add(n);
      if (assigned.has(n)) console.error('LATE NAME REASSIGNED (stale binding)', n, c.name, o);
      if (!byName[o].lateOut.has(c.name)) byName[o].lateOut.set(c.name, []);
      byName[o].lateOut.get(c.name).push(n);
    }
  }
}
fs.mkdirSync(OUT, { recursive: true });
for (const c of chunks) {
  let t = c.text;
  const base = c.stmts[0].start;
  const fnNames = new Set(c.stmts.filter((s) => s.type === 'FunctionDeclaration').map((s) => s.id.name));
  // insert export at each declaring statement, and late pushes after var statements, back to front
  const edits = [];
  for (const s of c.stmts) {
    if (!declNames(s).length) continue;
    edits.push([s.end - base, ''], [s.start - base, 'export ']);
    const pushes = [];
    for (const [imp, names] of c.lateOut) for (const n of names) if (declNames(s).includes(n) && !fnNames.has(n)) pushes.push(`__late_${imp}.${n}(${n});`);
    edits[edits.length - 2][1] = pushes.length ? `\n${pushes.join(' ')}` : '';
  }
  edits.sort((x, y) => y[0] - x[0]);
  for (const [p, s] of edits) t = t.slice(0, p) + s + t.slice(p);
  let head = '';
  if (c.threeImp.size) head += `import { ${[...c.threeImp].map(([m, n]) => (m === n ? m : `${n} as ${m}`)).join(', ')} } from 'three';\n`;
  if (c.nsThree) head += `import * as ut from 'three';\n`;
  for (const [o, set] of c.imps) head += `import { ${[...set].join(', ')} } from './${o}.js';\n`;
  for (const imp of c.lateOut.keys()) head += `import { __late as __late_${imp} } from './${imp}.js';\n`;
  if (c.late.size) {
    head += `// forward references, filled in by the owning later file (see README)\nlet ${[...c.late].join(', ')};\n`;
    head += `export const __late = {\n${[...c.late].map((n) => `  ${n}(v) {\n    ${n} = v;\n  },`).join('\n')}\n};\n`;
  }
  // hoisted functions are pushed up front, like function hoisting in the original single scope
  const fnPush = [];
  for (const [imp, names] of c.lateOut) for (const n of names) if (fnNames.has(n)) fnPush.push(`__late_${imp}.${n}(${n});`);
  if (fnPush.length) head += `${fnPush.join('\n')}\n`;
  fs.writeFileSync(`${OUT}/${c.name}.js`, `${head}\n${t}\n`);
}
fs.writeFileSync(`${OUT}/ns.js`, `export var bT = Object.defineProperty;\nexport var ar = (n, e) => {\n  for (var t in e) bT(n, t, { get: e[t], enumerable: !0 });\n};\n`);
fs.writeFileSync(`${OUT}/main.js`, ['ns', ...chunks.map((c) => c.name)].map((n) => `import './${n}.js';`).join('\n') + '\n');
fs.writeFileSync(SP + 'chunks.json', JSON.stringify(chunks.map((c) => ({ name: c.name, role: c.role, a: c.startLine, b: c.endLine })), null, 1));
