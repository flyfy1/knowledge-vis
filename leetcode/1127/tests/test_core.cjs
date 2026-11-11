'use strict';
// Checks the browser teaching model against oracle fixtures produced by test_solution.py
// (stdin, or OUTPUT_DIR/oracle-fixtures.json when run alone).
const fs=require('fs'),path=require('path'),assert=require('assert');
const C=require('../core.js');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const input=fs.fstatSync(0).isFIFO()||fs.fstatSync(0).isFile()?fs.readFileSync(0,'utf8'):'';
const fixtures=JSON.parse(input.trim()?input:fs.readFileSync(path.join(OUT,'oracle-fixtures.json'),'utf8'));
let frames=0,tables=0;
const strip=rows=>rows.map(({spend_date,platform,total_amount,total_users})=>({spend_date,platform,total_amount,total_users}));
for(const f of fixtures){
 const rows=C.rowsFrom(f.on);
 assert.deepStrictEqual(C.result(rows),f.expected);
 const tr=C.trace(rows),dates=[...new Set(rows.map(r=>r.spend_date))];
 assert.equal(tr.length,1+rows.length+3*dates.length);
 const last=tr[tr.length-1];assert(last.final);
 assert.deepStrictEqual(strip(last.output),f.expected);
 tr.forEach((fr,i)=>{
  // Invariant of stage (a): every Spending amount read so far sits in exactly one user-day.
  for(const d of Object.keys(fr.spent))assert.equal(fr.userDays.filter(u=>u.date===d).reduce((s,u)=>s+u.amount,0),fr.spent[d]);
  const ids=fr.userDays.map(u=>u.date+'|'+u.user);assert.equal(new Set(ids).size,ids.length);
  for(const u of fr.userDays)assert.equal(u.label,u.platforms.length===2?'both':u.platforms[0]);
  // Stage (b): a finished date's three cells account for every user and every unit of money that date.
  for(const d of dates){const cells=fr.output.filter(o=>o.spend_date===d);if(cells.length===3){
   assert.equal(cells.reduce((s,c)=>s+c.total_users,0),new Set(rows.filter(r=>r.spend_date===d).map(r=>r.user_id)).size);
   assert.equal(cells.reduce((s,c)=>s+c.total_amount,0),rows.filter(r=>r.spend_date===d).reduce((s,r)=>s+r.amount,0));}}
  if(i>0&&fr.event.type==='zero')assert.equal(fr.event.amount+fr.event.count,0);
  frames++;
 });
 // Deep snapshots: mutating one frame cannot leak into another.
 if(tr.length>2){const before=tr[2].userDays.length;tr[1].userDays.push({x:1});assert.equal(tr[2].userDays.length,before);tr[1].userDays.pop();}
 tables++;
}
// Presets: advertised outcomes.
const worked=C.result(C.rowsFrom(C.presets[0].on));
assert.deepStrictEqual(worked.map(r=>[r.platform,r.total_amount,r.total_users]),[['desktop',50,1],['mobile',30,1],['both',65,1],['desktop',45,1],['mobile',60,1],['both',0,0]]);
assert.deepStrictEqual(C.naive(C.rowsFrom(C.presets[0].on)).map(r=>[r.platform,r.total_amount,r.total_users]),[['desktop',75,2],['mobile',70,2],['desktop',45,1],['mobile',60,1]]);
assert.equal(C.result(C.rowsFrom(C.presets[1].on)).filter(r=>r.platform==='both'&&r.total_users===0).length,2);
assert.deepStrictEqual(C.result(C.rowsFrom(C.presets[2].on)).map(r=>r.total_users),[0,0,3]);
assert.deepStrictEqual(C.trace([]).length,1);assert(C.trace([])[0].final);
const up=C.trace(C.rowsFrom(C.presets[0].on));assert.equal(up[2].event.type,'upgrade');assert.equal(up[2].event.before,'mobile');assert.equal(up[2].event.label,'both');
console.log(JSON.stringify({tables,frames,presetsChecked:C.presets.length}));
