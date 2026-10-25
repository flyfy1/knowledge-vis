const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {trace,presets}=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(xs){const map={};function visit(i,a,b){if(i===xs.length){const d=Math.abs(a-b),h=Math.min(a,b);map[d]=Math.max(map[d]??-1,h);return;}visit(i+1,a,b);visit(i+1,a+xs[i],b);visit(i+1,a,b+xs[i]);}visit(0,0,0);return map;}
let cases=0,framesChecked=0;
function check(xs){const frames=trace(xs);frames.forEach((f,k)=>{const expected=oracle(xs.slice(0,k));assert.deepEqual(Object.fromEntries(Object.entries(f.states).map(([d,s])=>[d,s.h])),expected);Object.entries(f.states).forEach(([d,s])=>{const all=[...s.a,...s.b];assert.equal(new Set(all).size,all.length);assert(all.every(i=>i<k));const sum=is=>is.reduce((a,i)=>a+xs[i],0);assert.equal(sum(s.a),s.h);assert.equal(sum(s.b),s.h+Number(d));});if(k){assert.equal(f.incoming.length,3*Object.keys(frames[k-1].states).length);Object.keys(expected).forEach(d=>assert.equal(Math.max(...f.incoming.filter(c=>c.d===+d).map(c=>c.h)),expected[d]));}framesChecked++;});cases++;}
function generate(xs,n){if(!n){check(xs);return;}for(let x=1;x<=4;x++)generate([...xs,x],n-1);}
for(let n=1;n<=5;n++)generate([],n);presets.forEach(check);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),ctx);for(const [k,v] of Object.entries(ctx.window.COPY))assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length),k);
assert.throws(()=>trace([0]));assert.throws(()=>trace(Array(7).fill(1)));
const results={status:'pass',cases,framesChecked,allIntermediateMapsAndWitnesses:true,copyPairs:Object.keys(ctx.window.COPY).length};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(results,null,2));console.log(results);
