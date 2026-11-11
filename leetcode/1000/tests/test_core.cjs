const fs=require('fs'),path=require('path'),assert=require('assert'),core=require('../core.js');
const O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');let frames=0,rows=0,candidates=0;
for(const x of JSON.parse(fs.readFileSync(path.join(O,'oracle-fixtures.json')))){
 const trace=core.trace(x.a,x.k),last=trace.at(-1);assert.equal(last.result,x.result);
 const expected=new Map(x.rows.map(([i,j,p,v])=>[`${i},${j},${p}`,v]));
 for(let f=0;f<trace.length;f++){
  const snap=trace[f];frames++;
  for(const r of snap.rows){assert.equal(r.value,expected.get(`${r.i},${r.j},${r.p}`));rows++;}
  const e=snap.event;
  if(e.type==='split'){
   assert.equal(e.value,Math.min(...e.candidates.map(c=>c.value)));
   for(const c of e.candidates){assert.equal(c.left,expected.get(`${e.i},${c.m},1`));assert.equal(c.right,expected.get(`${c.m+1},${e.j},${e.p-1}`));assert.equal(c.value,c.left+c.right);candidates++;}
   // Independently enumerate every feasible cut from oracle cells.
   const cuts=[];for(let m=e.i;m<e.j;m++)if(expected.has(`${e.i},${m},1`)&&expected.has(`${m+1},${e.j},${e.p-1}`))cuts.push(m);
   assert.deepEqual(e.candidates.map(c=>c.m),cuts);
  }else if(e.type==='merge'){assert.equal(e.before,expected.get(`${e.i},${e.j},${x.k}`));assert.equal(e.sum,x.a.slice(e.i,e.j+1).reduce((a,b)=>a+b,0));assert.equal(e.value,e.before+e.sum);}
 }
 if(x.result!==-1)assert.equal(last.rows.length,expected.size);
 const saved=JSON.stringify(trace[0]);if(trace.length>1){trace.at(-1).rows[0].value=-42;assert.equal(JSON.stringify(trace[0]),saved);}
}
const report={kind:'author simulation against independently enumerated pile reductions',frames,rows,candidates};fs.writeFileSync(path.join(O,'core.json'),JSON.stringify(report,null,2));console.log(report);
