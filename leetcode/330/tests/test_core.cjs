const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js'),cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json'),'utf8'));
let states=0;
for(const [nums,n,expected] of cases){
 const original=JSON.stringify(nums),frames=C.trace(nums,n);
 assert.equal(JSON.stringify(nums),original);assert.equal(frames.at(-1).patches,expected);
 for(let at=0;at<frames.length;at++){
  const f=frames[at],patches=f.ledger.filter(r=>r.patch).map(r=>r.x),items=[...nums.slice(0,f.i),...patches];
  // Independent subset enumeration verifies the complete interval and first gap.
  let set=new Set([0]);for(const x of items)for(const s of [...set])set.add(s+x);
  for(let s=0;s<f.miss;s++)assert(set.has(s));assert(!set.has(f.miss));
  assert.equal(f.ledger.length,at);assert.equal(f.patches,patches.length);assert.equal([...set].sort((a,b)=>b-a)[0],f.miss-1);
  if(at){const before=frames[at-1];assert.equal(f.before,before.miss);assert.equal(f.miss,before.miss+f.x);assert.equal(f.i,before.i+(f.kind==='consume'?1:0));}
  states++;
 }
 assert.equal(frames[0].ledger.length,0);assert.deepEqual(frames,C.trace(nums,n));
 if(frames.length>2){const before=JSON.stringify(frames[1]);frames.at(-1).ledger[0].x=-123;assert.equal(JSON.stringify(frames[1]),before);}
}
for(const p of C.presets){const frames=C.trace(p.nums,p.n);assert(frames.at(-1).miss>p.n);assert(frames.at(-2).miss<=p.n);}
assert.equal(C.trace([10000],2147483647).at(-1).patches,31);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({kind:'author self-check',cases:cases.length,intermediateStates:states,deepSnapshots:true,maximumTarget:true},null,2));console.log(`PASS ${cases.length} oracle cases; ${states} intermediate states and deep snapshots`);
