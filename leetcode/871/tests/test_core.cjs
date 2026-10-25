const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js'),cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
for(const c of cases){
 const frames=core.trace(c),end=frames.at(-1);assert.equal(end.kind==='fail'?-1:end.selected.length,c.expected);
 for(let k=0;k<frames.length;k++){
  const f=frames[k];assert.equal(f.reach,c.startFuel+f.selected.reduce((a,i)=>a+c.stations[i][1],0));
  assert.equal(new Set([...f.pool,...f.selected]).size,f.pool.length+f.selected.length);
  assert.equal(f.i,f.pool.length+f.selected.length);for(const id of [...f.pool,...f.selected])assert(c.stations[id][0]<=f.reach);
  if(f.kind==='admit'){const prev=frames[k-1];assert.equal(f.reach,prev.reach);assert.equal(f.selected.length,prev.selected.length);}
  if(f.kind==='choose'){
   const prev=frames[k-1];assert(prev.pool.includes(f.id));assert.equal(c.stations[f.id][1],Math.max(...prev.pool.map(i=>c.stations[i][1])));
   for(let i=prev.i;i<c.stations.length;i++)assert(c.stations[i][0]>prev.reach);
   assert.equal(f.reach,f.before+c.stations[f.id][1]);
  }
 }
 // The conceptual selection order must reconstruct a legal physical journey in road order.
 let tank=c.startFuel,last=0;for(const id of end.selected.slice().sort((a,b)=>a-b)){const [p,f]=c.stations[id];tank-=p-last;assert(tank>=0);tank+=f;last=p;}
 if(end.kind==='done')assert(tank>=c.target-last);
 const json=JSON.stringify(frames);const repeat=core.trace(c);assert.equal(JSON.stringify(repeat),json);assert.notStrictEqual(frames[0].pool,frames[1]?.pool);
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// AST detects duplicate dictionary properties before JavaScript overwrites them.
const acorn=require('acorn'),ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const obj=ast.body[1].expression.right,keys=obj.properties.map(p=>p.key.name||p.key.value);assert.equal(keys.length,new Set(keys).size);
const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),box);Object.values(box.window.LESSON_COPY).forEach(v=>assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length)));
fs.writeFileSync(path.join(out,'core-result.json'),JSON.stringify({cases:cases.length,result:'pass',checks:'trace invariant, eligibility, maximum choice, legal physical reconstruction, immutable snapshots, mirror and duplicate keys'},null,2));console.log('Core checks passed:',cases.length);
