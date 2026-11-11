'use strict';
// Collection-level guard: no registered lesson may show internal review/workflow status to learners.
// specs/leetcode-explainers.md ("Workflow records and learner copy"): who built and checked a lesson
// belongs in BRIEF.md and commit trailers, not in the page. Scans every string a lesson's copy file
// defines (both languages) plus the static text and attributes of its index.html.
// Run: node leetcode/tests/no-workflow-status.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const STATUS = [
  /作者候选|自查候选|自检候选|候选稿|本候选/,
  /作者自查|作者自检|本页自查|作者实现与自查|自查不|自检不|自查与独立|自查后|自查完成|自查记录/,
  /独立(?:教学|课例)?(?:评审|审查|验收|审阅)|评审待|待独立|尚待独立|等待独立/,
  /\b(?:author|self)[- ](?:checked|built) candidate|\bauthor candidate|\bthis candidate (?:checks|includes)/i,
  /\bindependent (?:teaching |lesson )?(?:review|acceptance|approval)/i,
  /\breview (?:is |remains )?pending|\bpending (?:independent )?review|\bawaiting independent/i,
  /\bauthor(?:'s)? (?:self-)?checks?\b|\bauthor tests\b|\bauthor self-check|\bself-checks?\b|\bself-checked\b|\bself-check method/i,
  /SELF-CHECK\.md/,
];

function strings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(v => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => strings(v, out));
  return out;
}

function copyStrings(file) {
  const src = fs.readFileSync(file, 'utf8');
  const ctx = { window: {}, document: { documentElement: {} }, console: { log() {}, warn() {}, error() {} } };
  ctx.globalThis = ctx; ctx.self = ctx.window;
  try {
    vm.createContext(ctx);
    vm.runInContext(`${src}\n;this.__lexical=[typeof COPY!=='undefined'?COPY:null,typeof LESSON_COPY!=='undefined'?LESSON_COPY:null];`, ctx, { filename: file, timeout: 2000 });
    return strings([ctx.window, ctx.__lexical]);
  } catch {
    // Fall back to raw string literals if the copy file needs a browser to evaluate.
    return [...src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map(m => m[1] ?? m[2] ?? m[3]);
  }
}

function htmlStrings(file) {
  const src = fs.readFileSync(file, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const text = [...src.matchAll(/>([^<]+)</g)].map(m => m[1]);
  const attrs = [...src.matchAll(/\s(?:content|aria-label|title|alt|placeholder)="([^"]*)"/g)].map(m => m[1]);
  return text.concat(attrs);
}

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'problems.config.js'), 'utf8'), ctx);
const lessons = ctx.window.LEETCODE_PROBLEMS;
if (!Array.isArray(lessons) || lessons.length === 0) throw new Error('registry did not load');

const failures = [];
let scanned = 0;
for (const lesson of lessons) {
  const dir = path.join(root, lesson.path);
  if (!fs.existsSync(dir)) continue;
  const sources = [];
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (name === 'index.html') sources.push([name, htmlStrings(file)]);
    else if (/copy\.js$/i.test(name) || /^lesson-copy|i18n/i.test(name)) sources.push([name, copyStrings(file)]);
  }
  scanned++;
  for (const [name, list] of sources) {
    for (const s of list) {
      const hit = STATUS.find(re => re.test(s));
      if (hit) failures.push(`${lesson.path}${name}: …${s.match(hit)[0]}… in "${s.slice(0, 120)}"`);
    }
  }
}

if (failures.length) {
  const ids = [...new Set(failures.map(f => f.split('/')[0]))];
  console.error(`Workflow status shown to learners in ${ids.length} lesson(s): ${ids.join(' ')}`);
  failures.forEach(f => console.error('  ' + f));
  process.exit(1);
}
console.log(`no-workflow-status: ${scanned} registered lessons clean`);
