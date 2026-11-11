'use strict';
// Checks the browser simulation (core.js) against oracle fixtures written by test_solution.py.
const fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),C=require(path.join(R,'core.js'));
const O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence','run');
const fixtures=JSON.parse(fs.readFileSync(path.join(O,'oracle-fixtures.json'),'utf8'));
let frames=0,tables=0;
const asTuples=out=>out.map(o=>[o.install_dt,o.installs,o.Day1_retention]);
for(const fx of fixtures){
 for(const join of ['left','inner']){
  const tr=C.trace(fx.rows,join),last=tr.at(-1);tables++;
  assert.deepEqual(asTuples(last.output),fx[join]);
  const types=tr.map(f=>f.event.type);
  const players=new Set(fx.rows.map(r=>r[0])).size;
  assert.equal(types.filter(x=>x==='scan').length,fx.rows.length);assert.equal(types.filter(x=>x==='lookup').length,players);
  assert.equal(types.filter(x=>x==='group').length,fx[join].length);assert.equal(types[0],'start');assert.equal(types.at(-1),'final');
  // Phase order is scan* lookup* group* final.
  assert.deepEqual(types,[...types].sort((a,b)=>['start','scan','lookup','group','final'].indexOf(a)-['start','scan','lookup','group','final'].indexOf(b)));
  for(let i=1;i<tr.length;i++){
   const a=tr[i-1],b=tr[i],e=b.event;frames++;
   if(e.type==='scan'){ // running minimum over the prefix of scanned rows
    const prefix=fx.rows.slice(0,e.idx+1).filter(r=>r[0]===e.player).map(r=>r[2]).sort();
    assert.equal(b.installs[e.player].install_dt,prefix[0]);
    for(const p of Object.keys(a.installs))if(Number(p)!==e.player)assert.deepEqual(b.installs[p],a.installs[p]);
   }
   if(e.type==='lookup'){
    const hit=fx.rows.findIndex(r=>r[0]===e.player&&r[2]===e.target);assert.equal(e.hit,hit);
    assert.equal(b.joined.length,a.joined.length+(e.kept?1:0));assert.equal(e.kept,join==='left'||hit>=0);
   }
   if(e.type==='group'){const g=b.groups.at(-1);assert.equal(g.installs,b.joined.filter(j=>j.install_dt===e.install_dt).length);assert.equal(b.groups.length,a.groups.length+1);}
  }
  const saved=JSON.stringify(tr.slice(0,-1));if(last.groups[0])last.groups[0].installs=-1;last.joined.push({x:1});last.installs[999]={};assert.equal(JSON.stringify(tr.slice(0,-1)),saved);
 }
}
// Rounding: exact half-up, compared with integer arithmetic done differently.
for(let m=1;m<=300;m++)for(let k=0;k<=m;k++){const q=Math.floor(k*100/m),r=k*100-q*m;const cents=2*r>=m?q+1:q;assert.equal(C.retention(k,m),(cents/100).toFixed(2),k+'/'+m);}
assert.equal(C.retention(1,3),'0.33');assert.equal(C.retention(19,40),'0.48');assert.equal(C.retention(1,2),'0.50');assert.equal(C.retention(0,5),'0.00');
// Calendar arithmetic
for(const [a,b] of [['2024-02-28','2024-02-29'],['2024-02-29','2024-03-01'],['2023-02-28','2023-03-01'],['2023-12-31','2024-01-01'],['2024-04-30','2024-05-01'],['2100-02-28','2100-03-01']])assert.equal(C.nextDay(a),b);
// Random tables respect the primary key; duplicates are rejected.
for(let s=1;s<=500;s++){const rows=C.randomRows(s);assert(C.validRows(rows));assert(rows.length>=2);C.trace(rows);}
assert(!C.validRows([[1,1,'2024-01-01',0],[1,2,'2024-01-01',3]]));assert.throws(()=>C.trace([[1,1,'2024-01-01',0],[1,2,'2024-01-01',3]]));
assert.deepEqual(asTuples(C.result([])),[]);
const report={kind:'author simulation check against SQLite-verified oracle fixtures',tables,framesChecked:frames};
fs.writeFileSync(path.join(O,'core.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
