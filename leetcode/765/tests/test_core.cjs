const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(out,{recursive:true});
const core=require('../core.js'),fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
for(const {row,expected} of fixtures){
 const frames=core.trace(row);assert.equal(frames.at(-1).swaps,expected);assert.equal(frames.length,row.length/2+1);
 for(let k=0;k<frames.length;k++){
  const f=frames[k];assert.equal(f.done,k);assert.deepEqual(f.row.slice().sort((a,b)=>a-b),Array.from({length:row.length},(_,i)=>i));
  f.row.forEach((x,i)=>assert.equal(f.pos[x],i));
  for(let i=0;i<2*k;i+=2)assert.equal(f.row[i]^1,f.row[i+1]);
  assert.equal(f.swaps+row.length/2-f.groups.length,expected);
  if(k){const prev=frames[k-1];assert.deepEqual(f.before,prev.row);assert.equal(f.swaps-prev.swaps,f.op==='swap'?1:0);assert.deepEqual(f.row.slice(0,2*(k-1)),prev.row.slice(0,2*(k-1)));if(f.op==='swap')assert.ok(f.j>=f.i+2);}
 }
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Detect duplicate dictionary definitions before object evaluation can hide them.
const acorn=require('acorn');const tree=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:2022});
const obj=tree.body[0].expression.right,keys=obj.properties.map(p=>p.key.name||p.key.value);assert.equal(keys.length,new Set(keys).size);
for(const prop of obj.properties){assert.equal(prop.value.elements.length,2);for(const e of prop.value.elements)assert.equal(typeof e.value,'string');}
const data={fixtures:fixtures.length,intermediate_prefix_map_components:'pass',source_mirror:'exact',unique_bilingual_keys:keys.length};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(data,null,2)+'\n');console.log(data);
