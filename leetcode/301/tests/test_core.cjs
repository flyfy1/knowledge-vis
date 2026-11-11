// Checks that the page trace (core.js) runs the same search as solution.py and
// that the numbers quoted in copy.js are what the walk actually produces.
const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'core.js'));
const R = window.Remove301;

function valid(x) { let b = 0; for (const c of x) { if (c === '(') b++; else if (c === ')' && --b < 0) return false; } return b === 0; }
function oracle(s) {
  const idx = [...s].map((c, i) => '()'.includes(c) ? i : -1).filter(i => i >= 0);
  let best = new Set(), ml = -1;
  for (let m = 0; m < (1 << idx.length); m++) {
    const rem = new Set(idx.filter((_, k) => m >> k & 1));
    const x = [...s].filter((_, i) => !rem.has(i)).join('');
    if (valid(x)) { if (x.length > ml) { ml = x.length; best = new Set(); } if (x.length === ml) best.add(x); }
  }
  return [...best].sort();
}
let n = 0;
for (let L = 1; L <= 8; L++) {
  const total = 3 ** L;
  for (let k = 0; k < total; k++) {
    let s = '', v = k;
    for (let j = 0; j < L; j++) { s += '()a'[v % 3]; v = Math.floor(v / 3); }
    const tr = R.trace(s);
    const got = tr.results.slice().sort();
    const want = oracle(s);
    if (JSON.stringify(got) !== JSON.stringify(want)) throw Error(`trace ${s}: ${got} vs ${want}`);
    if (tr.b.left + tr.b.right !== s.replace(/a/g, '').length - (want[0] || '').replace(/a/g, '').length) throw Error(`budget ${s}`);
    if (tr.frames.filter(f => f.kind === 'call' && f.via === 'start').length !== 1) throw Error(`start rows ${s}`);
    for (const f of tr.frames) if (f.bal < 0) throw Error(`negative balance in ${s}`);
    n++;
  }
}
// Facts quoted in the copy.
const w = R.walk('()())()');
if (w.right !== 1 || w.left !== 0 || !w.steps[4].forced) throw Error('walk ()())()');
const ex = R.walk(')(');
if (ex.right !== 1 || ex.left !== 1) throw Error('walk )(');
const hand = R.trace('()())()');
if (JSON.stringify(hand.results) !== JSON.stringify(['(())()', '()()()'])) throw Error('hand results');
if (!hand.frames.some(f => f.kind === 'duplicate' && f.x === '()()()')) throw Error('duplicate frame missing');
let b = 0; const bal = [...'((a)())'].map(c => (b += c === '(' ? 1 : c === ')' ? -1 : 0));
if (bal.join(',') !== '1,2,2,1,2,1,0') throw Error('quiz balances');
global.COPY = undefined;
const fs = require('fs');
const copySrc = fs.readFileSync(path.join(__dirname, '..', 'copy.js'), 'utf8');
const COPY = new Function(copySrc + ';return COPY;')();
for (const [k, v] of Object.entries(COPY)) if (!Array.isArray(v) || v.length !== 2 || typeof v[0] !== 'string' || typeof v[1] !== 'string') throw Error('copy shape ' + k);
if (!COPY.explanation[0].includes('1、2、2、1、2、1、0') || !COPY.explanation[1].includes('1, 2, 2, 1, 2, 1, 0')) throw Error('quiz explanation');
if (/second or fifth \)/.test(COPY.hand[1])) throw Error('stale hand text');
for (const k of Object.keys(COPY)) for (const s of COPY[k]) if (/candidate|候选|review pending|评审待/.test(s)) throw Error('workflow status in copy: ' + k);
console.log(`core trace = oracle on ${n} strings; quoted walk, duplicate and quiz facts hold`);
