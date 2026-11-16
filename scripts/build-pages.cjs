#!/usr/bin/env node
'use strict';
/* Build migrated pages from their template sources (specs/site-template.md).
 *
 *   node scripts/build-pages.cjs <page-dir>...          write index.html, copy.zh.js, copy.en.js, refs.json
 *   node scripts/build-pages.cjs --all                  every live page that has a page.json
 *   node scripts/build-pages.cjs --all --check          build in memory; exit 1 on drift (outputs differ from a
 *                                                       fresh build), parity, refs, bindings or partial errors
 *                                                       (and reruns each page.json generator in a scratch copy)
 *   node scripts/build-pages.cjs --print-bindings <dir>  each {=name}: its value and the keys that use it
 *   node scripts/build-pages.cjs --print-budgets <dir>   each inline-SVG diagram label: the room it has and the
 *                                                       estimated width in zh and en (the build fails above 100%)
 *   options: --no-chrome --no-prefill (equivalence checks only; never commit such output), --root <site-root>
 *
 * Sources per page: page.json, content.zh.md, content.en.md, page.css, figures/*.html, optional bindings.cjs
 * (+ models.js). Outputs carry a GENERATED header: edit the sources and rebuild, never the outputs.
 * A lesson ("layout": "lesson", specs/site-template.md §3c) builds index.html, i18n.js and refs.json from page.json,
 * content.<lang>.md, figures/*.html, i18n.shell.js and its layout.html (or templates/layouts/lesson.html).
 */
const fs = require('fs');
const path = require('path');
const T = require('./lib/template.cjs');

const args = process.argv.slice(2);
const flag = f => args.includes(f);
const rootArg = args.includes('--root') ? args[args.indexOf('--root') + 1] : null;
const root = path.resolve(rootArg || T.REPO_ROOT);
const CHECK = flag('--check');
const PRINT = flag('--print-bindings') ? 'bindings' : flag('--print-budgets') ? 'budgets' : null;
const opts = { root, chrome: !flag('--no-chrome'), prefill: flag('--no-prefill') ? false : undefined, generators: CHECK };

let dirs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--root').map(d => path.resolve(d));
if (flag('--all')) dirs = dirs.concat(T.migratedPages(root).map(p => path.join(root, p.path)));
if (!dirs.length && !flag('--all')) {
  console.error('usage: node scripts/build-pages.cjs <page-dir>... | --all [--check] [--no-chrome] [--no-prefill] [--root <dir>]\n' +
    '       node scripts/build-pages.cjs --print-bindings|--print-budgets <page-dir>...');
  process.exit(2);
}
dirs = [...new Set(dirs)];

let failed = 0;
for (const dir of dirs) {
  const rel = path.relative(root, dir) || '.';
  if (!fs.existsSync(path.join(dir, 'page.json'))) { console.error(`ERROR ${rel}: no page.json (not a migrated page)`); failed++; continue; }
  // Phase 2: a page.json without "layout" only registers a hand-written page (specs/site-template.md §3b)
  if (!T.isTemplateDir(dir) && (() => { try { JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8')); return true; } catch (e) { return false; } })()) { console.error(`ERROR ${rel}: page.json has no "layout": it is the registry row of a hand-written page, not a template page (nothing to build)`); failed++; continue; }
  let res;
  try { res = T.buildEssay(dir, opts); } catch (e) { console.error(`ERROR ${rel}: ${e.stack || e.message}`); failed++; continue; }
  if (PRINT === 'bindings') { printBindings(rel, res); if (res.errors.length) failed++; continue; }
  if (PRINT === 'budgets') { printBudgets(rel, dir, res); if (res.errors.length) failed++; continue; }
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
function printBindings(rel, res) {
  const b = res.bindings || {};
  if (!Object.keys(b).length) { console.log(`${rel}: no bindings.cjs`); return; }
  const uses = name => Object.keys(res.src.zh).filter(k => String(res.src.zh[k]).includes('{=' + name + '}'));
  console.log(`${rel}: ${Object.keys(b).length} bound numbers ({=name} = value  <- keys that use it)`);
  for (const [k, v] of Object.entries(b)) console.log(`  {=${k}} = ${JSON.stringify(String(v))}  <- ${uses(k).join(', ') || '(unused)'}`);
  for (const e of res.errors) console.error(`ERROR ${rel}: ${e}`);
}
function printBudgets(rel, dir, res) {
  const figDir = path.join(dir, 'figures');
  const pct = (w, room) => (room > 0 ? Math.round(100 * w / room) + '%' : '-');
  console.log(`${rel}: inline-SVG diagram labels (room in viewBox units for the anchor; estimated width zh / en; ≈ Latin / CJK characters that fit)`);
  for (const f of fs.existsSync(figDir) ? fs.readdirSync(figDir).filter(x => x.endsWith('.html')).sort() : []) {
    const html = fs.readFileSync(path.join(figDir, f), 'utf8');
    const labels = T.svgLabels(html).filter(L => L.key);
    if (!labels.length) continue;
    console.log(`  figures/${f}`);
    for (const L of labels) {
      const room = T.labelRoom(L), w = l => T.emWidth(T.plainText(res.copy[l][L.key] || ''), L.mono) * L.fs;
      console.log(`    ${L.key.padEnd(22)} svg ${L.svg} room ${String(Math.round(room)).padStart(4)}  zh ${pct(w('zh'), room).padStart(4)}  en ${pct(w('en'), room).padStart(4)}  ≈${Math.floor(room / (0.52 * L.fs))} Latin / ${Math.floor(room / L.fs)} CJK`);
    }
  }
  for (const e of res.errors) console.error(`ERROR ${rel}: ${e}`);
}
if (flag('--all') && !failed) console.log(`${CHECK ? 'PASS' : 'done'}: ${dirs.length} migrated page(s)${CHECK ? ' match their sources' : ' built'}`);
process.exit(failed ? 1 : 0);
