// Run with node; OUTPUT_DIR changes the evidence destination.
const {trace}=require('../core.js'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
function counts(s){const m={};for(const c of s)m[c]=(m[c]||0)+1;return m;}
function oracle(s,t){const need=counts(t);let best='';for(let l=0;l<s.length;l++)for(let r=l+1;r<=s.length;r++){const x=s.slice(l,r),have=counts(x);if(Object.keys(need).every(c=>(have[c]||0)>=need[c])&&(!best||x.length<best.length))best=x;}return best;}
let cases=0,frames=0;
function verify(s,t){const run=trace(s,t),need=counts(t);let best=null;
 for(let i=0;i<run.frames.length;i++){
  const f=run.frames[i],actual=s.slice(f.left,f.right+1),have=counts(actual);
  assert.equal(f.window,actual);assert.deepEqual(f.need,need);
  for(const c in need)assert.equal(f.have[c],have[c]||0);
  assert.equal(f.missing,Object.keys(need).reduce((n,c)=>n+Math.max(need[c]-(have[c]||0),0),0));
  if(f.type==='check'){assert.equal(f.missing,0);if(!best||actual.length<best.length)best={start:f.left,end:f.right,length:actual.length,text:actual};}
  assert.deepEqual(f.best,best);
  if(i){const prev=run.frames[i-1];if(f.type==='expand'){assert.equal(f.right,prev.right+1);assert.equal(f.left,prev.left);}if(f.type==='remove'){assert.equal(prev.missing,0);assert.equal(f.left,prev.left+1);assert.equal(f.right,prev.right);}if(f.type==='check'){assert.equal(f.left,prev.left);assert.equal(f.right,prev.right);}}
  frames++;
 }
 assert.equal(run.result,oracle(s,t));
 // Deep-snapshot isolation, not only equivalent values.
 if(run.frames.length>2)assert.notEqual(run.frames[0].have,run.frames[1].have);
 cases++;
}
function words(a,n){let all=[],current=[''];for(let i=1;i<=n;i++){current=current.flatMap(p=>[...a].map(c=>p+c));all.push(...current);}return all;}
for(const s of words('ABC',5))for(const t of words('ABC',3))verify(s,t);
let seed=760018;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
for(let i=0;i<1200;i++){const word=n=>Array.from({length:n},()=> 'ABabC'[Math.floor(rand()*5)]).join('');verify(word(1+Math.floor(rand()*18)),word(1+Math.floor(rand()*10)));}
for(const x of [['ADOBECODEBANC','ABC'],['AAAC','AAC'],['a','aa'],['a','a'],['aA','AA'],['AABBC','ABC']])verify(...x);
for(const x of [['','A'],['A',''],['AB1','A'],['A'.repeat(19),'A']])assert.throws(()=>trace(...x));
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});const result={cases,frames,oracle:'independent slice enumeration',invariants:'counts, deficits, candidate minimum, atomic pointer changes, snapshot isolation'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
