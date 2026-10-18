const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const c={window:{},HardLesson:{mount(){}}};vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(base,'../hard-first-ten/core.js'),'utf8'),c);
c.HardModels=c.window.HardModels;
const original=c.HardModels[41];
vm.runInContext(fs.readFileSync(path.join(base,'app.js'),'utf8'),c);
let checks=0;
const plain=x=>JSON.parse(JSON.stringify(x));
function check(a){
 const old=original(a),next=c.HardModels[41](a),present=new Set(a);let answer=1;while(present.has(answer))answer++;
 assert.equal(next.result,answer);assert.equal(next.frames.length,old.frames.length);
 const sorted=a.slice().sort((a,b)=>a-b);
 next.frames.forEach((f,i)=>{
  const before=old.frames[i];
  assert.deepEqual(plain(f.rows[0].values),plain(before.rows[0].values));
  assert.deepEqual(plain(f.rows[0].values).sort((a,b)=>a-b),sorted);
  assert.equal(f.code,before.code);assert.deepEqual(plain(f.message),plain(before.message));
  assert.deepEqual(plain(f.state),{op_i:before.state.i<0?null:before.state.i,swap_to:before.state.target<0?null:before.state.target});
  assert.ok(f.rows.every(r=>r.active.every(x=>x>=0&&x<a.length)));
  if(i){
   const prev=next.frames[i-1].rows[0].values;
   prev.forEach((v,k)=>{if(v===k+1)assert.equal(f.rows[0].values[k],v)});
   if(f.state.swap_to!==null){const {op_i,swap_to}=f.state;assert.equal(swap_to,prev[op_i]-1);const expected=plain(prev);[expected[op_i],expected[swap_to]]=[expected[swap_to],expected[op_i]];assert.deepEqual(plain(f.rows[0].values),expected)}
  }
 });checks++;
}
function generate(a,n){if(!n)return check(a);for(const v of [-2,0,1,2,3,7])generate([...a,v],n-1)}
for(let n=1;n<=5;n++)generate([],n);
console.log(`${checks} trace cases passed: answers, every transition, fixed slots, markers and unchanged frame data`);
