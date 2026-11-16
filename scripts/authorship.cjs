#!/usr/bin/env node
'use strict';
// Per-file agent authorship, derived from git history. Rules: AUTHORSHIP.md.
//
//   node scripts/authorship.cjs <file>...      show who wrote each file
//   node scripts/authorship.cjs --summary      agents per top-level directory
//   node scripts/authorship.cjs --write        write authorship/inventory.json
//   node scripts/authorship.cjs --commits      list commit attributions (audit)
//   node scripts/authorship.cjs --json <file>  the same records as JSON (tests)
//   AUTHORSHIP_ROOT=<repo> node scripts/authorship.cjs …   run against another git repo
//
// History is the only source of truth. A commit is attributed from, in order:
//   1. authorship/overrides.json "commits" entries (human-confirmed facts);
//   2. its Built-By line (trailer or body line), normalised via
//      authorship/agents.json;
//   3. a Co-Authored-By line naming a registered agent;
//   4. otherwise "unattributed". Nothing is guessed.
// A commit with "Authorship-Impact: mechanical" (pure moves, path rewrites,
// regenerated output) is recorded but does not make its agent an author.
// A "Derived-From: <old path> -> <new path>" line (one per pair, several
// allowed) says the commit wrote <new path> from <old path> (e.g. the template
// converter turning copy.zh.js into content.zh.md). The new file inherits the
// old file's record as it stood before that commit, like a rename, but the old
// file keeps its own record because it stays committed (AUTHORSHIP.md §4).
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.env.AUTHORSHIP_ROOT ? path.resolve(process.env.AUTHORSHIP_ROOT) : path.resolve(__dirname, '..');
const agentsFile = path.join(root, 'authorship', 'agents.json');
const overridesFile = path.join(root, 'authorship', 'overrides.json');
const inventoryFile = path.join(root, 'authorship', 'inventory.json');

const registry = JSON.parse(fs.readFileSync(agentsFile, 'utf8'));
const overrides = fs.existsSync(overridesFile)
  ? JSON.parse(fs.readFileSync(overridesFile, 'utf8')) : { commits: {}, files: {} };
const rules = registry.agents.map(a => ({ ...a, re: new RegExp(a.match, 'i') }));
const modelRules = registry.models.map(m => ({ ...m, re: new RegExp(m.match, 'i') }));

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30 });
}

function classify(text) {
  for (const r of rules) if (r.re.test(text)) return r.id;
  return null;
}
function modelOf(text) {
  for (const m of modelRules) if (m.re.test(text)) return m.id;
  return 'unavailable';
}

function attribute(hash, body) {
  const short = hash.slice(0, 8);
  const o = overrides.commits[hash] || overrides.commits[short];
  const impact = (/^Authorship-Impact:\s*(\S+)/im.exec(body) || [])[1] || 'authored';
  if (o) return { agent: o.agent, model: o.model || 'unavailable', basis: 'override', impact: o.impact || impact };
  const built = /^Built-By:\s*(.+)$/im.exec(body);
  if (built) {
    const agent = classify(built[1]);
    if (agent) return { agent, model: modelOf(built[1]), basis: 'built-by', impact, declared: built[1].trim() };
    return { agent: 'unattributed', model: 'unavailable', basis: 'built-by-unrecognised', impact, declared: built[1].trim() };
  }
  const co = /^Co-Authored-By:\s*(.+)$/im.exec(body);
  if (co && classify(co[1])) return { agent: classify(co[1]), model: modelOf(co[1]), basis: 'co-authored-by', impact, declared: co[1].trim() };
  return { agent: 'unattributed', model: 'unavailable', basis: 'none', impact };
}

// Derived-From: <old> -> <new>, one pair per line; paths are repo-relative.
const normPath = p => p.trim().replace(/^\.\//, '').replace(/^\/+/, '');
function derivedPairs(body) {
  const out = [];
  for (const m of body.matchAll(/^Derived-From:\s*(.+?)\s*->\s*(.+?)\s*$/gim)) out.push([normPath(m[1]), normPath(m[2])]);
  return out;
}
const cloneRec = r => JSON.parse(JSON.stringify(r));
// Several sources for one new file: counts add up, the earliest creation wins.
function mergeRecs(recs) {
  const out = cloneRec(recs[0]);
  for (const r of recs.slice(1)) {
    for (const k of ['agents', 'mechanical']) for (const [a, b] of Object.entries(r[k])) {
      const t = out[k][a] = out[k][a] || { commits: 0, linesAdded: 0 };
      t.commits += b.commits; t.linesAdded += b.linesAdded;
    }
    if (r.created.date < out.created.date) out.created = cloneRec(r.created);
    if (r.last && (!out.last || r.last.date > out.last.date)) out.last = cloneRec(r.last);
    if (r.renamedFrom) out.renamedFrom = [...(out.renamedFrom || []), ...r.renamedFrom];
    if (r.derivedFrom) out.derivedFrom = [...(out.derivedFrom || []), ...r.derivedFrom];
  }
  return out;
}

// One pass over history, oldest first, following renames.
function build() {
  const SEP = '\x1e', END = '\x1f';
  // Merges are diffed against their first parent so files that only entered
  // history through an integration merge are still found; a merge counts as
  // mechanical (integration) unless it declares otherwise.
  const raw = git(['log', '--reverse', '--topo-order', '--diff-merges=first-parent', '-M', '--numstat', '-z',
    `--format=${SEP}%H%x00%ad%x00%P%x00%B${END}`, '--date=short']);
  const files = new Map(); // path -> record
  const commits = [];
  for (const chunk of raw.split(SEP).slice(1)) {
    const endAt = chunk.indexOf(END);
    const head = chunk.slice(0, endAt), stat = chunk.slice(endAt + 1);
    const [hash, date, parents, ...bodyParts] = head.split('\0');
    const body = bodyParts.join('\0');
    const a = attribute(hash, body);
    const isMerge = parents.trim().split(' ').length > 1;
    if (isMerge && !/^Authorship-Impact:/im.test(body)) a.impact = 'mechanical';
    commits.push({ hash: hash.slice(0, 8), date, subject: body.split('\n')[0], ...a });
    const tok = stat.replace(/^\n/, '').split('\0');
    // Derived-From: snapshot the sources before this commit's own changes touch them.
    const derived = new Map(); // new path -> { recs, from }
    for (const [from, to] of derivedPairs(body)) {
      const src = files.get(from);
      if (!src) { console.error(`authorship: ${hash.slice(0, 8)} Derived-From ${from} -> ${to} ignored: ${from} is not in history before this commit`); continue; }
      const d = derived.get(to) || { recs: [], from: [] };
      d.recs.push(cloneRec(src)); d.from.push(from); derived.set(to, d);
    }
    for (let i = 0; i < tok.length; i++) {
      const t = tok[i].replace(/^\n/, '');
      if (!t) continue;
      const m = /^(\d+|-)\t(\d+|-)\t(.*)$/s.exec(t);
      if (!m) continue;
      const added = m[1] === '-' ? 0 : +m[1];
      let file = m[3], from = null;
      if (file === '') { from = tok[++i]; file = tok[++i]; }
      let rec = from ? files.get(from) : files.get(file);
      if (from) files.delete(from);
      if (!rec && derived.has(file)) {
        const d = derived.get(file); derived.delete(file);
        rec = mergeRecs(d.recs);
        rec.derivedFrom = [...(rec.derivedFrom || []), ...d.from.map(f => ({ path: f, commit: hash.slice(0, 8), date }))];
      }
      if (!rec) {
        rec = { created: { agent: a.agent, model: a.model, commit: hash.slice(0, 8), date }, agents: {}, mechanical: {}, last: null };
        if (a.impact === 'mechanical') rec.created.mechanical = true;
      }
      if (from) (rec.renamedFrom = rec.renamedFrom || []).push(from);
      const bucket = a.impact === 'mechanical' ? rec.mechanical : rec.agents;
      const b = bucket[a.agent] = bucket[a.agent] || { commits: 0, linesAdded: 0 };
      b.commits++; b.linesAdded += added;
      if (a.impact !== 'mechanical') rec.last = { agent: a.agent, commit: hash.slice(0, 8), date };
      files.set(file, rec);
    }
    for (const [to, d] of derived) console.error(`authorship: ${hash.slice(0, 8)} Derived-From ${d.from.join(', ')} -> ${to} ignored: ${to} already existed or is not in this commit`);
  }
  // Staged-but-uncommitted renames keep their history (no attribution yet).
  const staged = git(['diff', '--cached', '-M', '--name-status', '-z']).split('\0');
  for (let i = 0; i < staged.length; i++) {
    if (/^R\d*$/.test(staged[i])) {
      const from = staged[i + 1], to = staged[i + 2]; i += 2;
      if (files.has(from)) { const rec = files.get(from); files.delete(from); (rec.renamedFrom = rec.renamedFrom || []).push(from); rec.pendingChange = true; files.set(to, rec); }
    } else if (/^[AMD]$/.test(staged[i])) {
      const f = staged[++i]; if (staged[i - 1] === 'M' && files.has(f)) files.get(f).pendingChange = true;
    }
  }
  const tracked = new Set(git(['ls-files', '-z']).split('\0').filter(Boolean));
  const out = {};
  for (const f of [...tracked].sort()) {
    const rec = files.get(f);
    if (!rec) { out[f] = { primary: 'uncommitted' }; continue; }
    const fo = overrides.files[f];
    const ranked = Object.entries(rec.agents).sort((x, y) => y[1].linesAdded - x[1].linesAdded || y[1].commits - x[1].commits);
    out[f] = {
      // Mechanical-only history (lost rename, regenerated file) never makes its
      // executor the author: without an authored commit the file is unattributed.
      primary: fo ? fo.agent : (ranked[0] ? ranked[0][0] : (rec.created.mechanical ? 'unattributed' : rec.created.agent)),
      created: rec.created,
      agents: rec.agents,
      ...(Object.keys(rec.mechanical).length ? { mechanical: rec.mechanical } : {}),
      ...(rec.last ? { lastAuthored: rec.last } : {}),
      ...(rec.renamedFrom ? { renamedFrom: rec.renamedFrom } : {}),
      ...(rec.derivedFrom ? { derivedFrom: rec.derivedFrom } : {}),
      ...(fo ? { override: fo } : {}),
      ...(rec.pendingChange ? { pendingChange: true } : {}),
    };
  }
  return { out, commits };
}

const args = process.argv.slice(2);
if (args.includes('--json')) {
  const { out } = build();
  const pick = {};
  for (const f of args.filter(x => !x.startsWith('--'))) pick[f] = out[f] || null;
  console.log(JSON.stringify(pick, null, 1));
  process.exit(0);
}
const { out, commits } = build();
if (args.includes('--commits')) {
  for (const c of commits) console.log([c.hash, c.date, c.agent, c.model, c.basis, c.impact, c.subject.slice(0, 70)].join('\t'));
} else if (args.includes('--write')) {
  fs.mkdirSync(path.dirname(inventoryFile), { recursive: true });
  const head = git(['rev-parse', '--short=8', 'HEAD']).trim();
  const agentCommits = {};
  for (const c of commits) agentCommits[c.agent] = (agentCommits[c.agent] || 0) + 1;
  fs.writeFileSync(inventoryFile, JSON.stringify({ schemaVersion: 1, generatedFrom: head, rules: 'AUTHORSHIP.md', commitsByAgent: agentCommits, files: out }) + '\n');
  console.log(`WROTE ${path.relative(root, inventoryFile)}: ${Object.keys(out).length} files from HEAD ${head}`);
} else if (args.includes('--summary')) {
  const by = {};
  for (const [f, r] of Object.entries(out)) {
    const top = f.includes('/') ? f.split('/')[0] + '/' : '(root)';
    (by[top] = by[top] || {})[r.primary] = (by[top][r.primary] || 0) + 1;
  }
  const agentCommits = {};
  for (const c of commits) agentCommits[c.agent] = (agentCommits[c.agent] || 0) + 1;
  console.log('commits by agent:', JSON.stringify(agentCommits));
  for (const [d, c] of Object.entries(by).sort()) console.log(d.padEnd(22), Object.entries(c).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a}:${n}`).join('  '));
} else if (args.length) {
  for (const f of args) {
    const rel = path.relative(root, path.resolve(f));
    const r = out[rel];
    if (!r) { console.log(`${rel}: not tracked`); continue; }
    console.log(`${rel}\n  primary: ${r.primary}`);
    if (r.created) console.log(`  created: ${r.created.agent} (${r.created.model}) ${r.created.commit} ${r.created.date}`);
    for (const [a, s] of Object.entries(r.agents || {})) console.log(`  ${a}: ${s.commits} commits, +${s.linesAdded} lines`);
    for (const [a, s] of Object.entries(r.mechanical || {})) console.log(`  ${a} (mechanical only): ${s.commits} commits`);
    for (const d of r.derivedFrom || []) console.log(`  derived from: ${d.path} (${d.commit} ${d.date})`);
  }
} else {
  console.log('usage: node scripts/authorship.cjs <file>... | --summary | --write | --commits');
}
