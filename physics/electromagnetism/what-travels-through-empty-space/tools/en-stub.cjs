#!/usr/bin/env node
'use strict';
/* Writes content.en.md as a structural stub while the translation is pending (specs/site-template.md §3a, §9a):
   the same skeleton and text as content.zh.md, with the English front matter and hero heading taken from
   REGISTRY.json so the build's registry-text check passes. page.json declares "languages": {"en": "stub"}, so the
   page keeps showing Chinese. The translator replaces content.en.md wholesale; delete this script then. */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..');
const reg = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
let s = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');
s = s.replace(/^lang: zh$/m, 'lang: en')
  .replace(/^title: .*$/m, 'title: ' + reg.title.en + ' · A Hands-on Essay')
  .replace(/^desc: .*$/m, 'desc: ' + reg.desc.en)
  .replace(/^# .* \{#hero\}$/m, '# ' + reg.title.en + ' {#hero}');
fs.writeFileSync(path.join(DIR, 'content.en.md'), s);
console.log('wrote content.en.md (stub)');
