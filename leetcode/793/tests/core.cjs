const assert=require('node:assert/strict'),fs=require('node:fs'),C=require('../core.js');
const fixture=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
// Digit-sum identity is independent of repeated division-and-sum implementation.
function f(x){let y=x,sum=0;while(y){sum+=y%5;y=Math.floor(y/5);}return (x-sum)/4;}
let frames=0;
for(const [k,expected] of [...fixture.small,...fixture.cases]){
 const trace=C.trace(k);assert.equal(trace.at(-1).result,expected);
 for(let i=0;i<trace.length;i++){
  const s=trace[i];frames++;
  assert(s.lo<=s.hi);assert(s.lo===0||f(s.lo-1)<s.target);assert(f(s.hi)>=s.target);
  assert.equal(C.zeros(s.lo),f(s.lo));assert.equal(C.zeros(s.hi),f(s.hi));
  if(s.row){const r=s.row;assert.equal(r.mid,Math.floor((r.before[0]+r.before[1])/2));assert.equal(r.z,f(r.mid));assert(r.hi-r.lo<r.before[1]-r.before[0]);assert.equal(s.history.at(-1),r);assert.equal(r.lo,s.lo);assert.equal(r.hi,s.hi);}
  if(i>0){const prev=trace[i-1];assert(s.history.length>=prev.history.length);}
 }
 const original=JSON.stringify(trace);C.trace(k+1);assert.equal(JSON.stringify(trace),original,'deep snapshots stable');
}
for(let x=0;x<=1000;x++){let n=0;for(let i=1;i<=x;i++){let y=i;while(y%5===0){n++;y/=5;}}assert.equal(C.zeros(x),n);}
console.log(JSON.stringify({cases:fixture.small.length+fixture.cases.length,frames,zeroFactorizationChecks:1001,results:'all results and intermediate invariants pass'}));
