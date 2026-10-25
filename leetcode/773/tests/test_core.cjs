'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');
const C=require('../core.js'),expected=JSON.parse(fs.readFileSync(path.join(out,'solution-results.json'))).expected;
function neighbors(s){const z=s.indexOf('0'),r=Math.floor(z/3),c=z%3,ans=[];for(let j=0;j<6;j++)if(Math.abs(Math.floor(j/3)-r)+Math.abs(j%3-c)===1){const a=s.split('');[a[z],a[j]]=[a[j],a[z]];ans.push(a.join(''));}return ans;}
let count=0;
for(const [start,answer] of Object.entries(expected)){
 const frames=C.trace(start),local={};let frontier=[start],seen=new Set(frontier);
 for(let i=0;i<frames.length;i++){
  const f=frames[i];assert.equal(f.depth,i);assert.deepEqual([...f.front].sort(),[...frontier].sort());assert.equal(f.seen,seen.size);assert.equal(new Set(f.front).size,f.front.length);
  if(f.result!==null){assert.equal(f.result,answer);assert(f.result===-1?frontier.length===0:frontier.includes('123450'));break;}
  const next=[];
  for(const s of frontier)for(const n of neighbors(s))if(!seen.has(n)){seen.add(n);next.push(n);}
  const child=frames[i+1];assert.deepEqual(child.history.at(-1),{depth:i,count:frontier.length,added:next.length});
  assert.equal(child.parent,frontier[0]);let prior=new Set([...seen].filter(x=>!next.includes(x)));
  for(const row of child.sample){assert(neighbors(child.parent).includes(row.state));assert.equal(row.fresh,!prior.has(row.state));prior.add(row.state);}
  frontier=next;
 }
 assert.equal(frames.at(-1).result,answer);count+=frames.length;
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// JSON parse reviver cannot catch duplicate keys; use the actual copy-file declaration syntax.
const copyText=fs.readFileSync(path.join(root,'copy.js'),'utf8'),keys=[...copyText.matchAll(/^  "([^"]+)":/gm)].map(x=>x[1]);assert.equal(keys.length,new Set(keys).size);
vm.runInNewContext(copyText,context);for(const pair of Object.values(context.window.LESSON_COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length));
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({result:'pass',cases:720,frames:count,invariants:'coordinate-neighbor transitions, complete frontiers, cumulative discovery, history, candidate admission, exact results',mirrorParity:true,uniqueBilingualKeys:keys.length},null,2)+'\n');console.log('PASS core',count,'frames');
