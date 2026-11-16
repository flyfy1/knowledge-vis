#!/usr/bin/env node
'use strict';
/* Build migrated pages from their template sources (specs/site-template.md).
 *
 *   node scripts/build-pages.cjs <page-dir>...          write index.html, copy.zh.js, copy.en.js, refs.json
 *   node scripts/build-pages.cjs --all                  every live page that has a page.json
 *   node scripts/build-pages.cjs --all --check          build in memory; exit 1 on drift (outputs differ from a
 *                                                       fresh build), parity, refs, bindings or partial errors
 *   options: --no-chrome --no-prefill (equivalence checks only; never commit such output), --root <site-root>
 *
 * Sources per page: page.json, content.zh.md, content.en.md, page.css, figures/*.html, optional bindings.cjs
 * (+ models.js). Outputs carry a GENERATED header: edit the sources and rebuild, never the outputs.
 */
const fs = require('fs');
const path = require('path');
const T = require('./lib/template.cjs');

const args = process.argv.slice(2);
const flag = f => args.includes(f);
const rootArg = args.includes('--root') ? args[args.indexOf('--root') + 1] : null;
const root = path.resolve(rootArg || T.REPO_ROOT);
const CHECK = flag('--check');
const opts = { root, chrome: !flag('--no-chrome'), prefill: flag('--no-prefill') ? false : undefined };

let dirs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--root').map(d => path.resolve(d));
if (flag('--all')) dirs = dirs.concat(T.migratedPages(root).map(p => path.join(root, p.path)));
if (!dirs.length && !flag('--all')) {
  console.error('usage: node scripts/build-pages.cjs <page-dir>... | --all [--check] [--no-chrome] [--no-prefill] [--root <dir>]');
  process.exit(2);
}
dirs = [...new Set(dirs)];

let failed = 0;
for (const dir of dirs) {
  const rel = path.relative(root, dir) || '.';
  if (!fs.existsSync(path.join(dir, 'page.json'))) { console.error(`ERROR ${rel}: no page.json (not a migrated page)`); failed++; continue; }
  let res;
  try { res = T.buildEssay(dir, opts); } catch (e) { console.error(`ERROR ${rel}: ${e.stack || e.message}`); failed++; continue; }
  for (const w of res.warnings) console.warn(`WARN ${rel}: ${w}`);
  if (res.errors.length) { console.error(res.errors.map(e => `ERROR ${rel}: ${e}`).join('\n')); failed++; continue; }
  if (CHECK) {
    const drift = Object.keys(res.outputs).filter(f => !fs.existsSync(path.join(dir, f)) || fs.readFileSync(path.join(dir, f), 'utf8') !== res.outputs[f]);
    if (drift.length) { console.error(`DRIFT ${rel}: ${drift.join(', ')} differ from a fresh build; edit the sources and run node scripts/build-pages.cjs ${rel}`); failed++; continue; }
    console.log(`OK ${rel}: outputs match the sources`);
  } else {
    for (const [f, s] of Object.entries(res.outputs)) fs.writeFileSync(path.join(dir, f), s);
    const st = res.stats;
    console.log(`built ${rel}: ${st.keys} keys/lang, ${st.chapters} chapters, ${st.refs} refs, ${st.backlinks} backlinking pages, ${st.related} related${st.bindings ? ', ' + st.bindings + ' bound numbers' : ''}`);
  }
}
if (flag('--all') && !failed) console.log(`${CHECK ? 'PASS' : 'done'}: ${dirs.length} migrated page(s)${CHECK ? ' match their sources' : ' built'}`);
process.exit(failed ? 1 : 0);
