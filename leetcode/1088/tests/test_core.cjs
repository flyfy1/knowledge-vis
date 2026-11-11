'use strict';
// Checks the browser simulation (core.js) against fixtures written by test_solution.py,
// plus frame-by-frame accounting and snapshot isolation.
const fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),C=require(path.join(R,'core.js'));
const O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence','run');
const fixtures=JSON.parse(fs.readFileSync(path.join(O,'oracle-fixtures.json'),'utf8'));
const TURN={'0':'0','1':'1','6':'9','8':'8','9':'6'};
const turned=x=>{const s=String(x);if([...s].some(c=>!(c in TURN)))return null;return Number([...s].reverse().map(c=>TURN[c]).join(''));};
let frames=0,cases=0;
for(const fx of fixtures){
 const tr=C.trace(fx.n),last=tr.at(-1);cases++;
 assert.equal(last.answer,fx.answer,fx.n);assert.equal(last.survivors,fx.turnable,fx.n);assert.equal(last.same,fx.unchanged,fx.n);
 assert.equal(C.solve(fx.n),fx.answer);
 assert.equal(tr[0].event.type,'start');assert.equal(tr[0].survivors,0);assert.equal(tr[0].ledger.length,0);
 for(let i=1;i<tr.length;i++){
  const a=tr[i-1],b=tr[i],e=b.event;frames++;
  if(e.type==='final'){assert.equal(b.ledger.length,a.ledger.length);assert.equal(b.answer,b.survivors-b.same);continue;}
  assert.deepEqual(b.ledger.slice(0,-1),a.ledger,'ledger is append-only');
  const row=b.ledger.at(-1);
  if(e.type==='self'){assert.equal(b.same,a.same+e.kept);assert.equal(b.survivors,a.survivors);assert.equal(e.sample.length+e.before+e.after,e.total);
   for(const s of e.sample)assert.equal(s.kept,s.v<=fx.n);}
  else{assert.equal(b.survivors,a.survivors+e.add);assert.equal(b.same,a.same);}
  assert.equal(row.survivors,b.survivors);assert.equal(row.same,b.same);
  if(e.type==='prefix'){const d=Number(String(fx.n)[e.pos]);assert.equal(e.digit,d);assert.deepEqual(e.lower,[0,1,6,8,9].filter(v=>v<d&&(e.pos>0||v>0)));assert.equal(e.add,e.lower.length*5**e.rest);}
 }
 // Deep snapshots: mutating a late frame cannot alter an earlier one.
 const saved=JSON.stringify(tr.slice(0,-1));tr.at(-1).ledger.push({x:1});if(tr.at(-1).ledger[0])tr.at(-1).ledger[0].add=-5;tr.at(-1).digits[0]='x';assert.equal(JSON.stringify(tr.slice(0,-1)),saved);
}
// Unchanged-number groups against a brute scan of every number of that length (lengths 1..6).
for(let L=1;L<=6;L++){const lo=L===1?1:10**(L-1),hi=10**L-1,brute=[];for(let x=lo;x<=hi;x++)if(turned(x)===x)brute.push(x);assert.deepEqual(C.selfNumbers(L),brute,'length '+L);}
// Step-1 tool and step-3 grid against the plain definition.
for(let x=1;x<=3000;x++){const d=C.turnDetail(x),r=turned(x);assert.equal(d.result,r);assert.equal(d.kind,r===null?'invalid':r===x?'self':'confusing');}
for(const x of [1000000000,999999999,8916,10,100]){const r=turned(x);assert.equal(C.turnDetail(x).result,r);}
for(let N=1;N<=300;N++){const g=C.grid(N);const want=fixtures.find(f=>f.n===N);assert.equal(g.confusing,want.answer);assert.equal(g.survivors,want.turnable);assert.equal(g.self,want.unchanged);}
// Input bounds.
for(const bad of [0,-1,1.5,1000000001,NaN])assert.throws(()=>C.trace(bad));
const report={kind:'author simulation check against oracle fixtures',cases,framesChecked:frames};
fs.writeFileSync(path.join(O,'core.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
