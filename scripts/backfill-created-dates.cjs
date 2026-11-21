#!/usr/bin/env node
'use strict';
/* Backfill "created": "YYYY-MM-DD" into every registered page's page.json from git history.
 * Uses scripts/authorship.cjs --write (authorship/inventory.json, which follows renames and
 * Derived-From template migrations) so dates stay grounded in AUTHORSHIP.md history.
 *
 *   node scripts/backfill-created-dates.cjs [--dry-run]
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const REG = require('./lib/registry.cjs');

const root = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const MIN_DATE = '2026-10-01';
const MAX_DATE = '2026-11-21';

execFileSync(process.execPath, [path.join(__dirname, 'authorship.cjs'), '--write'], {
  cwd: root,
  stdio: 'inherit',
});

const inv = JSON.parse(fs.readFileSync(path.join(root, 'authorship', 'inventory.json'), 'utf8'));
const reg = REG.loadRegistry(root);
if (reg.problems.length) {
  console.error(reg.problems.join('\n'));
  process.exit(1);
}

const CANDIDATES = ['content.zh.md', 'copy.zh.js', 'i18n.js', 'index.html'];
const missing = [];
const outOfRange = [];
let updated = 0;
let unchanged = 0;

function orderedMeta(meta, created) {
  const next = {};
  let inserted = false;
  for (const [k, v] of Object.entries(meta)) {
    if (k === 'created') continue;
    if (!inserted && k === 'order') {
      next.created = created;
      inserted = true;
    }
    next[k] = v;
    if (!inserted && k === 'path') {
      next.created = created;
      inserted = true;
    }
  }
  if (!inserted) next.created = created;
  return next;
}

for (const e of reg.entries) {
  const files = CANDIDATES.map(f => e.dir + f).filter(f => fs.existsSync(path.join(root, f)));
  const dates = files
    .map(f => inv.files[f] && inv.files[f].created && inv.files[f].created.date)
    .filter(d => d && REG.validDate(d))
    .sort();
  if (!dates.length) {
    missing.push({ slug: e.row.slug, dir: e.dir, files });
    continue;
  }
  const created = dates[0];
  if (created < MIN_DATE || created > MAX_DATE) {
    outOfRange.push({ slug: e.row.slug, dir: e.dir, created });
  }
  const pjPath = path.join(root, e.dir, 'page.json');
  const meta = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
  if (meta.created === created) {
    unchanged++;
    continue;
  }
  const next = orderedMeta(meta, created);
  if (!dryRun) {
    fs.writeFileSync(pjPath, JSON.stringify(next, null, 2) + '\n');
  }
  updated++;
}

if (missing.length) {
  console.error('ERROR missing creation dates:', JSON.stringify(missing, null, 2));
  process.exit(1);
}
if (outOfRange.length) {
  console.error('ERROR dates out of expected range:', JSON.stringify(outOfRange, null, 2));
  process.exit(1);
}

console.log(`${dryRun ? '[dry-run] ' : ''}backfill-created-dates: ${reg.entries.length} registered pages checked, ${updated} updated, ${unchanged} unchanged`);
