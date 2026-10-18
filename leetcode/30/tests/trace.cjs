const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const model = require('../../hard-first-ten/core.js')[30];
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('leetcode/30/copy.js','utf8'), context);
const counts = a => { const m={}; for(const x of a) m[x]=(m[x]||0)+1; return m; };
function oracle(s, words) {
  const expected=counts(words), w=words[0].length, out=[];
  for(let i=0;i+w*words.length<=s.length;i++) {
    const actual=counts(Array.from({length:words.length},(_,j)=>s.slice(i+j*w,i+(j+1)*w)));
    if(Object.keys(expected).every(k=>actual[k]===expected[k])) out.push(i);
  }
  return out;
}
const cases = [...context.window.LESSON.presets.map(p=>JSON.parse(JSON.stringify(p.input))),
  ['abacabab',['ab','ac','ab']],['abacacad',['ab','ac','ad']],['aaaaaa',['aa','aa']]];
let seed=30;
const random = n => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
for(let i=0;i<500;i++) {
  const w=random(3)+1, word=()=>Array.from({length:w},()=> 'abc'[random(3)]).join('');
  cases.push([Array.from({length:random(30)+1},()=> 'abc'[random(3)]).join(''),Array.from({length:random(5)+1},word)]);
}
let frames=0, transient=0;
for(const [s,words] of cases) {
  const trace=model([s,words]), expected=oracle(s,words), w=words[0].length, need=counts(words);
  assert.deepEqual([...trace.result].sort((a,b)=>a-b),expected);
  for(let i=0;i<trace.frames.length;i++) {
    const f=trace.frames[i], {left,right,offset,used}=f.state;
    assert.ok(left>=offset && right>=left && right<=s.length);
    assert.equal((left-offset)%w,0); assert.equal((right-offset)%w,0);
    assert.equal(used,(right-left)/w);
    assert.deepEqual(f.rows[0].active,Array.from({length:right-left},(_,j)=>left+j));
    const actual=counts(Array.from({length:used},(_,j)=>s.slice(left+j*w,left+(j+1)*w)));
    const shown=Object.fromEntries(f.rows[2].values.map(v=>v.split(': ').map((v,j)=>j?Number(v):v)));
    assert.deepEqual(shown,actual);
    assert.ok(f.output.every(start=>expected.includes(start)));
    const excess=Object.keys(actual).some(k=>actual[k]>need[k]);
    if(excess) {transient++;assert.match(trace.frames[i+1].code,/have\[s\[left/);}
    frames++;
  }
  assert.deepEqual(trace.frames[0].rows[2].values,[]);
  assert.deepEqual(trace.frames[0].output,[]);
}
console.log(`${cases.length} trace inputs / ${frames} frames passed; ${transient} temporary-excess frames followed by shrinking`);
