const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),C=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
let count=0;
for(let p=0;p<5;p++){
 const frames=C.trace(p);assert.deepEqual(frames,C.trace(p));
 assert.equal(frames.at(-1).result,[true,true,false,false,true][p]);
 for(const f of frames){
  assert.deepEqual(f.nodes.flatMap(n=>n.ids).sort(),[0,1,2,3]);
  for(const node of f.nodes){
   assert.equal(new Set(node.ids).size,node.ids.length);
   assert.equal(node.value[1]>0,true);
   // Evaluate the displayed expression independently with JS arithmetic.
   const value=vm.runInNewContext(node.expr.replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/'));
   assert(Math.abs(value-node.value[0]/node.value[1])<1e-9);
   const leaves=node.expr.match(/\d+/g).map(Number).sort();
   assert.deepEqual(leaves,node.ids.map(i=>C.presets[p][i]).sort());
  }count++;
 }
 assert.deepEqual(frames[0].nodes,frames[3].nodes);
 assert.equal(C.solve(frames[1].nodes.map(n=>n.value)),false);
 const frozen=JSON.stringify(frames[0]);frames[1].nodes[0].ids.push(999);assert.equal(JSON.stringify(frames[0]),frozen);
}
assert.equal(C.calc([1,1],[0,1],'÷'),null);
assert.deepEqual(C.calc([0,1],[5,1],'÷'),[0,1]);
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');
const keys=[...copy.matchAll(/^\s*(\w+):/gm)].map(m=>m[1]);
// Also catches keys placed after another entry on the same line.
const allKeys=[...copy.matchAll(/(?:^|[,\n])\s*(\w+)\s*:\s*\[/g)].map(m=>m[1]);
assert.equal(new Set(allKeys).size,allKeys.length);
const pairs=vm.runInNewContext(copy+';COPY');for(const v of Object.values(pairs))assert(v.length===2&&v.every(x=>typeof x==='string'&&x.length));
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,source);
const css=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(css<25000);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({result:'PASS',frames:count,copyKeys:allKeys.length,cssBytes:css,checks:['card identity partition','displayed expression evaluation','rejected subtree','parent restoration','deep immutable snapshots','rational zero rules','unique bilingual keys','exact mirror']},null,2)+'\n');console.log('PASS',count,'frames;',css,'CSS bytes');
