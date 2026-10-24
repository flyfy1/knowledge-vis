const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const {presets,trace,less}=require('../core.js');
const scan=bs=>{let a=[];for(const x of [...new Set(bs.flatMap(b=>b.slice(0,2)))].sort((a,b)=>a-b)){let h=Math.max(0,...bs.filter(b=>b[0]<=x&&x<b[1]).map(b=>b[2]));if(!a.length||a.at(-1)[1]!==h)a.push([x,h]);}return a;};
let framesChecked=0,cases=0;
const corpus=JSON.parse(fs.readFileSync(path.join(OUT,'oracle-cases.json')));
for(const item of [...presets.map(buildings=>({buildings,expected:scan(buildings)})),...corpus]){
 const b=item.buildings,original=JSON.stringify(b),fsnap=trace(b);
 assert.deepEqual(fsnap.at(-1).answer,item.expected);assert.equal(JSON.stringify(b),original);
 assert.deepEqual(trace(b),fsnap);
 fsnap.forEach((f,k)=>{
  if(k===0){assert.equal(f.x,null);assert.deepEqual(f.answer,[]);return;}
  assert.equal(f.height,Math.max(0,...b.filter(v=>v[0]<=f.x&&f.x<v[1]).map(v=>v[2])));
  assert.equal(f.old,fsnap[k-1].height);
  assert.deepEqual(f.answer,item.expected.filter(v=>v[0]<=f.x));
  assert.equal(f.i,b.filter(v=>v[0]<=f.x).length);
  assert.ok(!f.heap.length||f.heap[0][1]>f.x);
  for(let j=1;j<f.heap.length;j++)assert.ok(!less(f.heap[j],f.heap[(j-1)>>1]));
  const expectedLive=b.filter(v=>v[0]<=f.x&&f.x<v[1]).map(v=>[-v[2],v[1]]).sort();
  assert.deepEqual(f.heap.filter(v=>v[1]>f.x).sort(),expectedLive);
  framesChecked++;
 });cases++;
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(P,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(P,'solution.py'),'utf8'));
const hidden=trace(presets[3]);assert.ok(hidden.some(f=>f.heap.some(v=>v[1]<=f.x)));
const r={status:'passed',cases,framesChecked,sourceMirror:'exact',hiddenExpiredEntries:true};fs.writeFileSync(path.join(OUT,'core-results.json'),JSON.stringify(r,null,2));console.log(r);
