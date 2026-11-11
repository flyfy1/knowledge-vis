const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const {trace}=require(ROOT+'/core.js');
function oracle(s){const words=new Set();function visit(x){const r=x.indexOf('}');if(r<0){words.add(x);return;}const l=x.lastIndexOf('{',r);for(const a of x.slice(l+1,r).split(','))visit(x.slice(0,l)+a+x.slice(r+1));}visit(s);return [...words].sort();}
function split(s){let depth=0,parts=[''];for(const c of s){if(c===','&&depth===0)parts.push('');else {parts[parts.length-1]+=c;if(c==='{')depth++;if(c==='}')depth--;}}assert.equal(depth,0);return parts;}
let total=0,framesChecked=0,events=new Set();
const cases=JSON.parse(fs.readFileSync(OUT+'/cases.json'));
// Long output case checks final result but snapshots still tested on all others.
for(const {expression:s,expected} of cases){
 const frames=trace(s);assert.deepEqual(frames.at(-1).detail.result,expected);let previousI=0;
 for(let k=0;k<frames.length;k++){
  const f=frames[k];framesChecked++;events.add(f.event);assert(f.i>=previousI&&f.i<=s.length);previousI=f.i;
  for(let d=0;d<f.stack.length;d++){
   const c=f.stack[d];let end=d+1<f.stack.length?f.stack[d+1].start-1:f.i;
   if(d===f.stack.length-1&&f.event==='descend')end--;
   const parts=split(s.slice(c.start,end));const term=oracle(parts.pop());const union=[...new Set(parts.flatMap(oracle))].sort();
   assert.deepEqual(c.union,union,JSON.stringify({s,k,d,f,end}));assert.deepEqual(c.term,term,JSON.stringify({s,k,d,f,end}));
  }
  const d=f.detail;
  if(f.event==='product')assert.deepEqual(d.after,[...new Set(d.before.flatMap(a=>d.atom.map(b=>a+b)))].sort());
  if(f.event==='comma')assert.deepEqual(d.after,[...new Set([...d.before,...d.term])].sort());
  if(f.event==='return'){const c=f.stack.at(-1);assert.deepEqual(d.result,[...new Set([...c.union,...c.term])].sort());}
  if(k&&f.event==='enter')assert.deepEqual(f.stack.slice(0,-1),frames[k-1].stack);
  if(k&&f.event==='product'&&d.kind==='group')assert.deepEqual(d.atom,frames[k-1].detail.result);
 }
 const frozen=JSON.stringify(frames[0]);if(frames.length>1&&frames[1].stack.length)frames[1].stack[0].term.push('mutation probe');assert.equal(JSON.stringify(frames[0]),frozen);total++;
}
const report={scope:'author self-check',passed:true,cases:total,framesChecked,events:[...events],invariant:'Each live call U/T independently evaluated from its completed own-level input prefix; pending child excluded.'};
fs.writeFileSync(OUT+'/core-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
