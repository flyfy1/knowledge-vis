'use strict';
// Checks the browser teaching model against exact optima produced by test_solution.py.
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),C=require(R+'/core.js');
const fixtures=JSON.parse(fs.readFileSync(path.join(O,'oracle-fixtures.json'),'utf8'));
// Independent piece count: smallest c with g <= limit*(c+1), found by counting upward.
function slowNeed(g,limit){let c=0;while(g>limit*(c+1))c++;return c;}
let frames=0,rounds=0;
function checkCase(stations,k,num,den){
 const tr=C.trace(stations,k),star=num/den;
 assert.equal(tr[0].type,'start');assert.equal(tr[0].lo,0);assert.equal(tr[0].hi,Math.max(...C.gaps(stations)));
 assert.equal(tr.at(-1).type,'stop');
 assert.equal(tr.at(-1).star.num*den,num*tr.at(-1).star.den,'exact optimum');
 for(let i=0;i<tr.length;i++){
  const f=tr[i];frames++;
  // Invariant: the true optimum stays inside (lo, hi]; lo never works, hi always works.
  assert(f.lo*den<num,JSON.stringify({stations,k,i,lo:f.lo}));
  assert(f.hi>=star*(1-1e-12),JSON.stringify({stations,k,i,hi:f.hi}));
  if(i>0)assert.deepEqual(f.type==='round'?f.history.slice(0,-1):f.history,tr[i-1].history);
  if(f.type==='round'){
   rounds++;
   const each=f.gaps.map(g=>slowNeed(g,f.mid));
   assert.deepEqual(f.each,each);assert.equal(f.total,each.reduce((a,b)=>a+b,0));
   assert.equal(f.ok,f.total<=k);
   assert.equal(f.mid,(f.before.lo+f.before.hi)/2);
   if(f.ok){assert.equal(f.hi,f.mid);assert.equal(f.lo,f.before.lo);}else{assert.equal(f.lo,f.mid);assert.equal(f.hi,f.before.hi);}
   assert(f.before.hi-f.before.lo>C.EPS);
  }
 }
 const last=tr.at(-1);assert(last.hi-last.lo<=C.EPS);assert.equal(last.result,last.hi);
 assert(Math.abs(last.result-star)<=1e-6,JSON.stringify({stations,k,result:last.result,star}));
 const saved=JSON.stringify(tr[0]);tr.at(-1).history.push({injected:true});tr.at(-1).gaps[0]=-1;assert.equal(JSON.stringify(tr[0]),saved);
 const stairs=C.staircase(stations,k);for(let i=1;i<stairs.length;i++)assert(stairs[i].total<=stairs[i-1].total,'staircase never rises');
}
for(const x of fixtures)checkCase(x.stations,x.k,x.num,x.den);
const presetAnswers=[[2,1],[2,1],[1,2],[14,1],[99,2],[3,2]];
C.presets.forEach((p,i)=>checkCase(p.stations,p.k,...presetAnswers[i]));
// Input guard: invalid inputs never reach the trace.
for(const [s,k,err] of [['0 4 10','3',null],['0,4,10','0','errK'],['4 0','1','errOrder'],['0 0','1','errOrder'],['5','1','errCount'],['0 1001','1','errRange'],['0 x','1','errNumbers'],['0 -3','1','errNumbers'],['0 1 2 3 4 5 6 7 8 9 10 11 12','1','errCount'],['0,1','41','errK']]){
 const r=C.parse(s,k);assert.equal(r.ok,err===null,s);if(err)assert.equal(r.error,err,s);
}
// Offline mirror equals the canonical source byte for byte.
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(R+'/python-code.js','utf8'),ctx);assert.strictEqual(ctx.window.PYTHON_SOURCE,fs.readFileSync(R+'/solution.py','utf8'));
const report={kind:'author check of browser model against exact optima',cases:fixtures.length+C.presets.length,frames,rounds};
fs.writeFileSync(path.join(O,'core.json'),JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify(report));
