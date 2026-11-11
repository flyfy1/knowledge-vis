'use strict';
// Static checks on the copy files for demos/scarcity-moves/ (no browser).
// Usage: node demos/scarcity-moves/tests/copy.cjs
// - copy.zh.js and copy.en.js have the same keys in the same order, the same {placeholders} and the same HTML tags;
// - every key used by index.html (data-i18n*) and by app.js (t('…') literals and the template families built in code) exists;
// - no key in the copy is unused;
// - index.html and app.js hold no Chinese apart from the 中 toggle button and index.html's static zh <title> and description;
// - LANG_TOGGLE_ON is declared exactly once.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

global.window = {};
new Function(read('copy.zh.js'))();
new Function(read('copy.en.js'))();
const zh = window.ESSAY_COPY.zh, en = window.ESSAY_COPY.en;
const zk = Object.keys(zh), ek = Object.keys(en);
ok(zk.length > 250, `zh copy looks too small: ${zk.length} keys`);
ok(JSON.stringify(zk) === JSON.stringify(ek), `zh/en keys differ: only zh ${zk.filter(k => !(k in en)).join(',')} | only en ${ek.filter(k => !(k in zh)).join(',')}`);
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(' ');
const tags = s => (s.match(/<\/?[a-z]+\b/gi) || []).map(x => x.toLowerCase()).sort().join(' ');
for (const k of zk) {
  if (!(k in en)) continue;
  ok(ph(zh[k]) === ph(en[k]), `${k}: placeholders differ: zh "${ph(zh[k])}" en "${ph(en[k])}"`);
  ok(tags(zh[k]) === tags(en[k]), `${k}: HTML tags differ`);
  ok(typeof en[k] === 'string' && en[k].trim().length > 0, `${k}: empty English value`);
}

const html = read('index.html'), app = read('app.js');
const used = new Set();
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) used.add(m[1]);
for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) used.add(m[1]);
// keys assembled in code
for (const a of ['mixed', 'aFaster', 'bFaster']) for (const b of ['A', 'B']) used.add(`ch3.say.${a}.${b}`);
for (let i = 1; i <= 15; i++) used.add(`ch13.item${i}`);
for (const q of ['slowShared', 'fastShared', 'slowConc', 'fastConc']) { used.add(`ch14.sc.${q}.name`); used.add(`ch14.sc.${q}.text`); }
for (const k of ['ch12.say.p1', 'ch12.say.p1land', 'ch12.say.p2', 'ch12.say.p3', 'ch12.say.p3landBelow', 'ch12.say.p3landAbove']) { used.add(k); ok(app.includes(`'${k}'`), `app.js should name ${k} in full`); }
['tag.h', 'tag.m', 'tag.l'].forEach(k => used.add(k));
for (const k of used) ok(k in zh, `key used but missing from copy.zh.js: ${k}`);
for (const k of zk) ok(used.has(k), `key in copy.zh.js but never used: ${k}`);

const CJK = /[\u3400-\u9fff\uff00-\uffef\u3000-\u303f]/;
// the only Chinese allowed in index.html: the 中 toggle button, and the static <title> and meta description, which
// must equal doc.title / doc.desc so crawlers and link previews that do not run script see the Chinese page
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const titleLine = `<title>${esc(zh['doc.title'])}</title>`, descLine = `<meta name="description" content="${esc(zh['doc.desc'])}">`;
ok(html.split('\n').filter(l => l === titleLine).length === 1, 'index.html: static <title> must equal zh doc.title');
ok(html.split('\n').filter(l => l === descLine).length === 1, 'index.html: static meta description must equal zh doc.desc');
const htmlCJK = html.replace(/>中</, '><').split('\n').filter(l => l !== titleLine && l !== descLine && CJK.test(l));
ok(!htmlCJK.length, `Chinese left in index.html: ${htmlCJK.slice(0, 3).join(' | ')}`);
// code only: drop block and line comments; ①②③ are numerals drawn on the ch12 canvas, not words
const appCode = app.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
const appCJK = appCode.split('\n').filter(l => CJK.test(l.replace(/[①②③]/g, '')));
ok(!appCJK.length, `Chinese left in app.js code: ${appCJK.slice(0, 3).join(' | ')}`);
ok((app.match(/const LANG_TOGGLE_ON = (true|false);/g) || []).length === 1, 'LANG_TOGGLE_ON must be declared once');

// the sentence templates the page builds per case must stay whole sentences (no fragment keys)
ok(!zk.some(k => /\.(prefix|suffix|frag)\b/.test(k)), 'fragment keys are not allowed; use one template per case');

if (fails.length) { console.log('FAIL\n' + fails.map(f => '  ' + f).join('\n')); process.exit(1); }
console.log(`ok: ${zk.length} keys, zh/en key-for-key, placeholders and tags match, ${used.size} keys used, no Chinese in app.js, none in index.html beyond 中 and the static zh title/description`);
