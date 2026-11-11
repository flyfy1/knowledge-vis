'use strict';
// Checks the browser teaching model against answers from the Python oracles (test_solution.py).
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),C=require(R+'/core.js');
const fixtures=JSON.parse(fs.readFileSync(path.join(O,'oracle-fixtures.json'),'utf8'));
let frames=0,places=0;
// Independent per-place count for small n: how many x in 1..n have digit d at place p.
function placeTruth(n,d,power){let c=0;for(let x=1;x<=n;x++){const s=String(x),k=s.length-1-Math.round(Math.log10(power));if(k>=0&&s[k]===String(d))c++;}return c;}
function check(d,low,high,answer){
 const tr=C.trace(d,low,high),last=tr.at(-1);assert.equal(last.result,answer,JSON.stringify({d,low,high}));
 if(last.check!==null)assert.equal(last.check,answer);
 for(let i=1;i<tr.length;i++){
  const f=tr[i];frames++;
  if(f.type==='place'){
   places++;const r=f.row;
   assert.equal(r.left*r.power*10+r.cur*r.power+r.right,f.n,'n = left|cur|right');
   assert.equal(r.total,r.before+r.contribution);
   if(f.n<=3000)assert.equal(r.contribution,placeTruth(f.n,d,r.power),JSON.stringify({d,n:f.n,r}));
  }
 }
 assert.equal(last.fh,high<=20000?C.brute(d,1,high):last.fh);
 const saved=JSON.stringify(tr[0]);last.done.high.push({x:1});assert.equal(JSON.stringify(tr[0]),saved);
}
for(const x of fixtures)check(x.d,x.low,x.high,x.answer);
const presetAnswers=[6,35,11,null,null,3];C.presets.forEach((p,i)=>{if(presetAnswers[i]!==null)check(p.d,p.low,p.high,presetAnswers[i]);else check(p.d,p.low,p.high,C.trace(p.d,p.low,p.high).at(-1).result);});
assert.equal(C.trace(0,1,2000).at(-1).result,C.brute(0,1,2000));
// The naive rule counts leading zeros (and the number 0): 122 instead of 11 for 1..100.
assert.equal(C.countUpto(100,0,'naive'),122);assert.equal(C.countUpto(100,0),11);
for(let d=1;d<=9;d++)for(const n of [1,9,10,99,555,2024])assert.equal(C.countUpto(n,d,'naive'),C.countUpto(n,d));
// Wall: the place formula equals the marks counted on the wall, for every N, d and place shown.
for(let N=0;N<=199;N++)for(let d=1;d<=9;d++){const cells=C.wall(N,d);for(const [p,place] of [[1,0],[10,1],[100,2]])assert.equal(C.placeCount(N,d,p).count,cells.filter(c=>c.hits.includes(place)).length,JSON.stringify({N,d,p}));}
// Wall: hits by place agree with digits.
for(const c of C.wall(199,3))for(const p of c.hits)assert.equal(String(c.x)[String(c.x).length-1-p],'3');
for(const [args,err] of [[['1','1','13'],null],[['10','1','2'],'errDigit'],[['1','0','2'],'errRange'],[['1','5','2'],'errOrder'],[['1','1','200000001'],'errRange'],[['x','1','2'],'errNumbers']]){const r=C.parse(...args);assert.equal(r.ok,err===null);if(err)assert.equal(r.error,err);}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(R+'/python-code.js','utf8'),ctx);assert.strictEqual(ctx.window.PYTHON_SOURCE,fs.readFileSync(R+'/solution.py','utf8'));
const report={kind:'author check of browser per-place model against independent oracles',cases:fixtures.length+C.presets.length,frames,places};
fs.writeFileSync(path.join(O,'core.json'),JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify(report));
