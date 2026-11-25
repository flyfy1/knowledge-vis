#!/usr/bin/env node
'use strict';
/* Writes ../content.en.md as a structural stub of ../content.zh.md while the translation is pending
   (specs/site-template.md §9a step 2; page.json "languages": {"en": "stub"}). Same blocks, keys, {=bindings},
   {placeholders} and [[targets]]; every text is "[EN pending]". Title and desc come from REGISTRY.json.
   Adapted from investment/derivatives/a-fair-price-for-a-bet/tools/make-en-stub.cjs. Retire once translated. */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..');
const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
const zh = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8').split('\n');
const tokens = s => (s.match(/\{=[\w.]+\}|\{\w+\}|\[\[[^\]]+\]\]/g) || []).map(tk => tk.startsWith('[[') && tk.includes('|') ? tk.replace(/\|[^\]]*\]\]$/, '|EN pending]]') : tk);
const stub = s => ['[EN pending]', ...tokens(s)].join(' ');
const out = []; let fm = 0, block = null;
for (const l of zh) {
  if (l === '---' && fm < 2) { fm++; out.push(l); continue; }
  if (fm === 1) { out.push(l.startsWith('lang:') ? 'lang: en' : l.startsWith('title:') ? 'title: ' + R.title.en + ' · A Hands-on Essay' : l.startsWith('desc:') ? 'desc: ' + R.desc.en : l); continue; }
  if (/^:::/.test(l)) { block = l === ':::' ? null : l.split(/\s+/)[1]; out.push(l); continue; }
  if (!l.trim() || l === '---' || /^\{[^}]*\}$/.test(l)) { out.push(l); continue; }
  if (block && block !== 'footer') { const m = l.match(/^([\w.-]+): (.*)$/); out.push(m[1] + ': ' + (/^\{[^}]*\}%?$/.test(m[2]) || !/[^\x00-\x7f]/.test(m[2]) ? m[2] : stub(m[2]))); continue; }
  const attr = (l.match(/\s*\{[#.][^}]*\}$/) || [''])[0], body = attr ? l.slice(0, -attr.length) : l;
  const h = body.match(/^(#+) /), li = body.match(/^(- |\d+\. )/);
  if (h && h[1] === '#') out.push('# ' + R.title.en + attr);
  else out.push((h ? h[0] : li ? li[0] : '') + stub(body) + attr);
}
fs.writeFileSync(path.join(DIR, 'content.en.md'), out.join('\n'));
console.log('content.en.md: structural stub, ' + out.length + ' lines');
