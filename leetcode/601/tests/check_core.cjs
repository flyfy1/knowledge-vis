const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),core=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(rows){
 const ids=[...new Set(rows.filter(r=>r.people>=100).map(r=>r.id))].sort((a,b)=>a-b),runs=[];
 for(const id of ids){if(!runs.length||runs.at(-1).at(-1)!==id-1)runs.push([]);runs.at(-1).push(id);}
 return runs.filter(r=>r.length>=3).flat();
}
let cases=0,frames=0;
function check(rows){
 const before=JSON.stringify(rows),trace=core.trace(rows),expected=oracle(rows);
 assert.equal(JSON.stringify(rows),before);
 assert.deepEqual(trace.frames.at(-1).marked,expected);
 trace.frames.forEach((f,k)=>{
   // Recompute the union from previously tested starts with linear row searches.
   const marked=[];
   for(const s of trace.eligible.slice(0,k)){
     const triple=[s,s+1,s+2];
     if(triple.every(id=>rows.some(r=>r.id===id&&r.people>=100)))marked.push(...triple);
   }
   assert.deepEqual(f.marked,[...new Set(marked)].sort((a,b)=>a-b));
   if(k){assert.equal(f.event.s,trace.eligible[k-1]);assert.deepEqual(f.event.before,trace.frames[k-1].marked);}
   frames++;
 });
 const saved=JSON.stringify(trace.frames);
 for(let k=trace.frames.length-1;k>=0;k--)assert.deepEqual(trace.frames[k],JSON.parse(saved)[k]);
 assert.equal(JSON.stringify(core.trace(rows)),JSON.stringify(trace));cases++;
}
core.presets.forEach(check);
for(let mask=0;mask<3**8;mask++){
 let v=mask,rows=[];
 for(let id=1;id<=8;id++){const state=v%3;v=Math.floor(v/3);if(state)rows.push({id,people:state===1?99:100,visit_date:`2020-01-${String(id*2+1).padStart(2,'0')}`});}
 check(rows.reverse());
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),sandbox);
for(const [key,value] of Object.entries(sandbox.window.LESSON_COPY))assert.ok(Array.isArray(value)&&value.length===2&&value.every(s=>typeof s==='string'&&s.length),key);
const expectedPresets=[[4,5,6,7],[5,6,7,8],[],[],[1,2,3,7,8,9],[],[],[]];
core.presets.forEach((r,i)=>assert.deepEqual(oracle(r),expectedPresets[i]));
const report={kind:'author self-check',cases,frames,exhaustive:'3^8 absent/99/100 states',presetExpected:expectedPresets,intermediateInvariant:'pass',snapshotsAndReplay:'pass',localePairShapes:'pass'};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
