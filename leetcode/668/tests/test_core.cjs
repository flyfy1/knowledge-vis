const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),core=require(path.join(root,'core.js'));
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
let cases=0,frames=0,thresholds=0;
function check(m,n,k){
 const cells=[];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)cells.push(i*j);cells.sort((a,b)=>a-b);
 const count=x=>cells.filter(v=>v<=x).length,expected=cells[k-1],trace=core.trace(m,n,k);
 assert.deepEqual(trace[0],{lo:1,hi:m*n,test:null});
 for(let i=0;i<trace.length;i++){
  const f=trace[i];assert.ok(f.lo<=expected&&expected<=f.hi);assert.ok(count(f.lo-1)<k&&count(f.hi)>=k);
  if(i){const p=trace[i-1],q=f.test;assert.equal(q.beforeLo,p.lo);assert.equal(q.beforeHi,p.hi);assert.equal(q.mid,Math.floor((p.lo+p.hi)/2));assert.equal(q.count,count(q.mid));
   for(let r=1;r<=m;r++)assert.equal(q.rows[r-1],Array.from({length:n},(_,j)=>r*(j+1)).filter(v=>v<=q.mid).length);
   assert.ok(f.hi-f.lo<p.hi-p.lo);assert.equal(q.enough,q.count>=k);
   assert.deepEqual([f.lo,f.hi],q.enough?[p.lo,q.mid]:[q.mid+1,p.hi]);
  }frames++;
 }
 assert.equal(trace.at(-1).lo,expected);assert.equal(trace.at(-1).hi,expected);
 const snapshot=JSON.stringify(trace);const replay=core.trace(m,n,k);assert.equal(JSON.stringify(replay),snapshot);cases++;
}
for(let m=1;m<=12;m++)for(let n=1;n<=12;n++){
 for(let k=1;k<=m*n;k++)check(m,n,k);
 for(let x=0;x<=m*n+2;x++){const got=core.counts(m,n,x);for(let r=1;r<=m;r++){let want=0;for(let j=1;j<=n;j++)if(r*j<=x)want++;assert.equal(got[r-1],want);}thresholds++;}
}
let seed=668;function rand(n){seed=(1664525*seed+1013904223)>>>0;return seed%n;}
for(let i=0;i<300;i++){const m=rand(40)+1,n=rand(40)+1;check(m,n,rand(m*n)+1);}
core.presets.forEach(({m,n,k})=>check(m,n,k));
const report={kind:'author self-check',cases,frames,thresholds,seed:668,presets:core.presets,invariants:'independent cell enumeration; exact row counts; strict shrinking; answer containment; deterministic snapshots'};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
