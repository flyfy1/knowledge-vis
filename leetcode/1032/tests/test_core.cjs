const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {presets,trace}=require('../core.js');let cases=0,frames=0;
function check(input){
 const model=trace(input),again=trace(input);assert.deepEqual(model,again);
 const L=Math.max(...input.words.map(w=>w.length));let completions=0;
 for(let i=0;i<model.frames.length;i++){
  const f=model.frames[i];frames++;assert.equal(f.buffer,f.received.slice(-L));
  assert.equal(f.path,[...f.received.slice(-f.path.length||f.received.length)].reverse().join(''));
  assert.equal(model.nodes[f.node].path,f.path);
  if(f.kind==='append')assert.equal(f.path,'');
  const expected=[];
  for(let j=1;j<=f.history.length;j++){
   const prefix=input.stream.slice(0,j);expected.push(input.words.some(w=>prefix.endsWith(w)));
  }
  assert.deepEqual(f.history.map(r=>r.result),expected);
  if(f.result!==null){
   completions++;assert.equal(f.result,input.words.some(w=>f.received.endsWith(w)));
   if(f.kind==='terminal')assert(input.words.includes(f.match));
   if(f.kind==='missing')assert(!input.words.some(w=>[...w].reverse().join('').startsWith(f.tested)));
   if(f.kind==='exhausted')assert.equal(f.path.length,f.buffer.length);
  }
  if(f.kind==='edge')assert(!model.nodes[f.node].terminal);
 }
 assert.equal(completions,input.stream.length);cases++;
}
for(const p of presets)check(p);
const words=['a','b','aa','ab','ba','bb'];
for(let mask=1;mask<64;mask++)for(let s=0;s<64;s++)check({words:words.filter((_,i)=>mask&(1<<i)),stream:s.toString(2).padStart(6,'0').replaceAll('0','a').replaceAll('1','b')});
// Snapshot mutation cannot leak to another frame.
const m=trace(presets[0]);m.frames.at(-1).history[0].result='changed';assert.equal(m.frames[2].history[0].result,false);
const result={kind:'author self-check',passed:true,cases,frames};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
