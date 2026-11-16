#!/usr/bin/env node
'use strict';
// The Derived-From trailer (AUTHORSHIP.md §4): a file written from another file by a mechanical
// commit inherits that file's authorship. Runs scripts/authorship.cjs against a throwaway git repo.
//   node tests/authorship-derived-from.cjs
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const base = fs.existsSync('/tmp/agent-tasks') ? '/tmp/agent-tasks' : os.tmpdir();
fs.mkdirSync(base, { recursive: true });
const dir = fs.mkdtempSync(path.join(base, 'authorship-derived-from-'));
const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } });
let date = '2026-11-01T10:00:00';
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), s); };
const lines = (n, tag) => Array.from({ length: n }, (_, i) => `${tag} ${i}`).join('\n') + '\n';
function commit(day, msg, ...files) {
  date = `2026-11-${String(day).padStart(2, '0')}T10:00:00`;
  git('add', '--', ...files);
  git('commit', '-q', '-m', msg);
}
let stderr = '';
function query(...files) {
  const { spawnSync } = require('node:child_process');
  const res = spawnSync('node', [path.join(repoRoot, 'scripts', 'authorship.cjs'), '--json', ...files],
    { encoding: 'utf8', env: { ...process.env, AUTHORSHIP_ROOT: dir } });
  assert.equal(res.status, 0, res.stderr);
  stderr = res.stderr;
  return JSON.parse(res.stdout);
}

git('init', '-q');
git('config', 'user.email', 'test@example.invalid');
git('config', 'user.name', 'test');
write('authorship/agents.json', fs.readFileSync(path.join(repoRoot, 'authorship', 'agents.json'), 'utf8'));
commit(1, 'registry\n\nBuilt-By: Claude Code (claude-opus-5-5)\nAuthorship-Impact: mechanical', 'authorship/agents.json');

// 1. Codex writes the copy table (30 lines), Claude Code revises it (+5).
write('page/copy.zh.js', lines(30, 'codex'));
write('page/index.html', lines(10, 'html'));
commit(2, 'essay\n\nBuilt-By: Codex (gpt-6.1-sol)\nAuthorship-Impact: authored', 'page/copy.zh.js', 'page/index.html');
write('page/copy.zh.js', lines(30, 'codex') + lines(5, 'claude'));
commit(3, 'revise\n\nBuilt-By: Claude Code (claude-opus-5-5)\nAuthorship-Impact: authored', 'page/copy.zh.js');

// 2. A mechanical conversion writes content.zh.md from copy.zh.js and content.en.md from nothing declared.
//    Both trailers name one source each; figures/a.html is derived from two sources.
write('page/content.zh.md', lines(40, 'md'));
write('page/content.en.md', lines(40, 'md-en'));
write('page/figures/a.html', lines(3, 'fig'));
write('page/copy.zh.js', '/* GENERATED */\n' + lines(30, 'codex') + lines(5, 'claude'));
commit(4, [
  'convert',
  '',
  'Built-By: script (deterministic, no model: scripts/convert-essay.cjs)',
  'Authorship-Impact: mechanical',
  'Derived-From: page/copy.zh.js -> page/content.zh.md',
  'Derived-From: ./page/index.html  ->  page/figures/a.html',
  'Derived-From: page/copy.zh.js -> page/figures/a.html',
  'Derived-From: page/missing.js -> page/content.en.md',
].join('\n'), 'page/content.zh.md', 'page/content.en.md', 'page/figures/a.html', 'page/copy.zh.js');

let r = query('page/content.zh.md', 'page/content.en.md', 'page/copy.zh.js', 'page/figures/a.html');
const zh = r['page/content.zh.md'];
assert.ok(zh, 'content.zh.md is tracked');
assert.equal(zh.primary, 'codex', 'derived file keeps the source author as primary');
assert.equal(zh.created.agent, 'codex', 'created comes from the source, not the converter commit');
assert.equal(zh.created.date, '2026-11-02');
assert.deepEqual(zh.agents.codex, { commits: 1, linesAdded: 30 });
assert.deepEqual(zh.agents['claude-code'], { commits: 1, linesAdded: 5 });
assert.ok(!zh.agents.script, 'the converter is not an author');
assert.equal(zh.mechanical.script.commits, 1, 'the converter commit is recorded as mechanical');
assert.equal(zh.lastAuthored.agent, 'claude-code');
assert.deepEqual(zh.derivedFrom.map(d => d.path), ['page/copy.zh.js']);
assert.ok(!zh.renamedFrom, 'derivation is not recorded as a rename');

// The source stays committed and keeps its own record.
const src = r['page/copy.zh.js'];
assert.equal(src.primary, 'codex');
assert.ok(!src.derivedFrom);
assert.equal(src.mechanical.script.commits, 1);

// No usable source (the old path never existed) -> nothing inherited, mechanical first add -> unattributed.
const en = r['page/content.en.md'];
assert.equal(en.primary, 'unattributed');
assert.equal(en.created.mechanical, true);
assert.ok(!en.derivedFrom);

// Two sources merge: counts add up, earliest creation wins, both paths listed.
const fig = r['page/figures/a.html'];
assert.equal(fig.primary, 'codex');
assert.deepEqual(fig.agents.codex, { commits: 2, linesAdded: 40 });
assert.deepEqual(fig.derivedFrom.map(d => d.path).sort(), ['page/copy.zh.js', 'page/index.html']);

// 3. A later authored edit to the derived file adds to its own bucket on top of the inherited history.
write('page/content.zh.md', lines(40, 'md') + lines(50, 'antigravity'));
commit(5, 'edit markdown\n\nBuilt-By: Antigravity (gemini-pro)\nAuthorship-Impact: authored', 'page/content.zh.md');
r = query('page/content.zh.md');
assert.deepEqual(r['page/content.zh.md'].agents.antigravity, { commits: 1, linesAdded: 50 });
assert.equal(r['page/content.zh.md'].primary, 'antigravity', 'primary follows the most added lines, inherited ones included');
assert.equal(r['page/content.zh.md'].created.agent, 'codex');

// 4. The same conversion without the trailer: the new file starts from the converter commit -> unattributed.
write('other/copy.zh.js', lines(30, 'codex'));
commit(6, 'essay 2\n\nBuilt-By: Codex (gpt-6.1-sol)', 'other/copy.zh.js');
write('other/content.zh.md', lines(40, 'md'));
commit(7, 'convert 2\n\nBuilt-By: script (deterministic, no model: scripts/convert-essay.cjs)\nAuthorship-Impact: mechanical', 'other/content.zh.md');
r = query('other/content.zh.md');
assert.equal(r['other/content.zh.md'].primary, 'unattributed', 'without Derived-From the converted file is unattributed');

// 5. A trailer naming a file the commit does not touch inherits nothing and creates nothing.
write('other/copy.zh.js', lines(31, 'codex'));
commit(8, 'touch\n\nBuilt-By: Codex (gpt-6.1-sol)\nAuthorship-Impact: mechanical\nDerived-From: other/copy.zh.js -> other/never.md', 'other/copy.zh.js');
r = query('other/never.md');
assert.equal(r['other/never.md'], null);
// Trailers that take no effect are reported on stderr (stdout stays the same), never silently dropped.
assert.match(stderr, /Derived-From other\/copy\.zh\.js -> other\/never\.md ignored: other\/never\.md already existed or is not in this commit/);
assert.match(stderr, /Derived-From page\/missing\.js -> page\/content\.en\.md ignored: page\/missing\.js is not in history/);

// 6. Only a mechanical commit may declare Derived-From: a hand rewrite cannot borrow another file's authors.
write('other/claimed.md', lines(20, 'hand'));
commit(9, 'rewrite\n\nBuilt-By: Claude Code (claude-opus-5-5)\nAuthorship-Impact: authored\nDerived-From: other/copy.zh.js -> other/claimed.md', 'other/claimed.md');
r = query('other/claimed.md');
assert.equal(r['other/claimed.md'].primary, 'claude-code', 'an authored commit keeps its own authorship');
assert.ok(!r['other/claimed.md'].derivedFrom);
assert.match(stderr, /Derived-From ignored: only an Authorship-Impact: mechanical commit may declare it/);

// 7. The source must exist in the parent commit: a file deleted earlier cannot be named.
write('gone/copy.zh.js', lines(25, 'codex'));
commit(10, 'gone\n\nBuilt-By: Codex (gpt-6.1-sol)\nAuthorship-Impact: authored', 'gone/copy.zh.js');
git('rm', '-q', 'gone/copy.zh.js');
date = '2026-11-11T10:00:00';
git('commit', '-q', '-m', 'drop\n\nBuilt-By: Codex (gpt-6.1-sol)\nAuthorship-Impact: mechanical');
write('gone/content.zh.md', lines(25, 'md'));
commit(12, 'convert gone\n\nBuilt-By: script (deterministic, no model: scripts/convert-essay.cjs)\nAuthorship-Impact: mechanical\nDerived-From: gone/copy.zh.js -> gone/content.zh.md', 'gone/content.zh.md');
r = query('gone/content.zh.md');
assert.equal(r['gone/content.zh.md'].primary, 'unattributed');
assert.ok(!r['gone/content.zh.md'].derivedFrom);
assert.match(stderr, /Derived-From gone\/copy\.zh\.js -> gone\/content\.zh\.md ignored: gone\/copy\.zh\.js is not in the parent commit/);

// The scratch repo is removed on success (kept on failure, or with KEEP_SCRATCH=1, for inspection).
if (!process.env.KEEP_SCRATCH) fs.rmSync(dir, { recursive: true, force: true });
console.log('PASS authorship Derived-From: inheritance, merge of two sources, later edits, no-trailer and no-touch cases, authored and deleted-source refusals');
