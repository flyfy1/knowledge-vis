const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace,presets}=require('../core.js');
// Independent brute cell checks over all rectangles; no heights or stack.
function oracle(a){let best=0;for(let t=0;t<a.length;t++)for(let b=t;b<a.length;b++)for(let l=0;l<a[0].length;l++)for(let r=l;r<a[0].length;r++){
 let ok=true;for(let y=t;y<=b;y++)for(let x=l;x<=r;x++)if(a[y][x]==='0')ok=false;
 if(ok)best=Math.max(best,(b-t+1)*(r-l+1));}return best;}
let cases=0,frames=0;
function check(a){const old=JSON.stringify(a),run=trace(a);assert.equal(run.result,oracle(a));assert.equal(JSON.stringify(a),old);let prev=run.frames[0];
 for(const f of run.frames){frames++;
  for(let c=0;c<run.cols;c++){let h=0;for(let r=f.row;r>=0&&a[r][c]==='1';r--)h++;assert.equal(f.heights[c],h);}
  assert.equal(f.heights[run.cols],0);
  assert.equal(f.stack[0],-1);
  for(let k=2;k<f.stack.length;k++){assert(f.stack[k]>f.stack[k-1]);assert(f.heights[f.stack[k]]>=f.heights[f.stack[k-1]]);}
  assert.equal(f.best,Math.max(0,...f.ledger.map(r=>r.area)));
  if(f.kind==='pop'){
   const r=f.rect;assert.equal(r.width,r.i-r.left-1);assert.equal(r.height,f.heights[r.j]);assert(f.heights[r.i]<r.height);
   for(let y=r.row-r.height+1;y<=r.row;y++)for(let x=r.left+1;x<r.i;x++)assert.equal(a[y][x],'1');
   assert.equal(f.ledger.length,prev.ledger.length+1);assert.deepEqual(f.before,prev.stack);assert.equal(f.stack.at(-1),r.left);
  }
  if(f.kind==='rowDone')assert.equal(f.best,oracle(a.slice(0,f.row+1)));
  prev=f;
 }
 // Deep snapshots: changing final snapshot cannot alter an earlier snapshot.
 const first=JSON.stringify(run.frames[0]);run.frames.at(-1).heights[0]=999;assert.equal(JSON.stringify(run.frames[0]),first);cases++;
}
for(const a of presets)check(a);
const quiz=trace(['0100','0110','1110','1111']);
assert.deepEqual(quiz.frames.filter(f=>f.kind==='pop'&&f.row===3&&f.i===3).map(f=>[f.rect.j,f.rect.area]),[[2,6],[0,6]]);
check(['0100','0110','1110','1111']);
for(let R=1;R<=3;R++)for(let C=1;C<=3;C++)for(let mask=0;mask<(1<<(R*C));mask++)check(Array.from({length:R},(_,r)=>Array.from({length:C},(_,c)=>(mask&(1<<(r*C+c)))?'1':'0').join('')));
let seed=85;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed>>>8)%n;};
for(let k=0;k<400;k++)check(Array.from({length:1+rnd(5)},()=>Array.from({length:5},()=>String(rnd(2))).join('')));
const report={cases,frames,result:'pass',checks:['independent cell-enumeration oracle','all intermediate heights','stack ordering','pop rectangles','row-end oracle','deep snapshots','input unchanged']};
const out=process.env.OUTPUT_DIR||path.join(__dirname,'../evidence');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
