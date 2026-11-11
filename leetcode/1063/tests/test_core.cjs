'use strict';
// Checks the browser teaching model against totals from the Python oracles (test_solution.py).
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),C=require(R+'/core.js');
const fixtures=JSON.parse(fs.readFileSync(path.join(O,'oracle-fixtures.json'),'utf8'));
let frames=0,cells=0;
function check(nums,total){
 const tr=C.trace(nums);assert.equal(tr.at(-1).result,total,JSON.stringify(nums));assert.equal(tr.at(-1).brute,total);
 for(let f=1;f<tr.length-1;f++){
  const s=tr[f],prev=tr[f-1],j=s.j;frames++;
  assert.deepEqual(s.before,prev.stack);assert.deepEqual(s.counts.slice(0,-1),prev.counts);
  // The stack is exactly the set of starts alive at end j (checked from the definition), in index order.
  const alive=[];for(let i=0;i<=j;i++){if(C.valid(nums,i,j))alive.push(i);cells++;}
  assert.deepEqual(s.stack,alive,JSON.stringify({nums,j}));
  for(let x=1;x<s.stack.length;x++)assert(nums[s.stack[x-1]]<=nums[s.stack[x]],'values never decrease');
  // Popped starts are exactly those alive before and dead now, and they were on top.
  assert.deepEqual(s.popped.slice().reverse(),prev.stack.slice(prev.stack.length-s.popped.length));
  for(const i of s.popped){assert.equal(C.firstSmaller(nums,i),j);assert.equal(s.died[i],j);}
  assert.equal(s.count,s.stack.length);assert.equal(s.total,s.totalBefore+s.count);assert.equal(s.totalBefore,prev.total);
 }
 const saved=JSON.stringify(tr[0]);tr.at(-1).stack.push(99);tr.at(-1).nums[0]=-1;assert.equal(JSON.stringify(tr[0]),saved);
 // The tempting ">=" rule undercounts exactly when a later equal value meets an alive start.
 const wrong=C.trace(nums,'ge').at(-1).result;assert(wrong<=total);
}
for(const x of fixtures)check(x.nums,x.total);
const presetTotals=[11,3,6,15,11];C.presets.forEach((p,i)=>check(p,presetTotals[i]));
assert.equal(C.trace([2,2,2],'ge').at(-1).result,3);assert.equal(C.trace([1,4,2,5,3],'ge').at(-1).result,11);
for(const [s,err] of [['1 4 2','' ],['', 'errCount'],['1 2 3 4 5 6 7 8 9 10 11','errCount'],['1 100','errRange'],['1 -2','errNumbers'],['a','errNumbers']]){const r=C.parse(s);assert.equal(r.ok,!err,s);if(err)assert.equal(r.error,err);}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(R+'/python-code.js','utf8'),ctx);assert.strictEqual(ctx.window.PYTHON_SOURCE,fs.readFileSync(R+'/solution.py','utf8'));
const report={kind:'author check of browser stack model against the subarray definition',cases:fixtures.length+C.presets.length,frames,aliveCellsChecked:cells};
fs.writeFileSync(path.join(O,'core.json'),JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify(report));
