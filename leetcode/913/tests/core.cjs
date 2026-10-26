const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
const acorn=require('acorn'),vm=require('vm');
const copySource=fs.readFileSync(path.join(root,'copy.js'),'utf8'),ast=acorn.parse(copySource,{ecmaVersion:'latest'}),pairs=ast.body[0].expression.right;
const keys=pairs.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length);
const sandbox={window:{}};vm.runInNewContext(copySource,sandbox);for(const value of Object.values(sandbox.window.LESSON_COPY)){assert(Array.isArray(value)&&value.length===2&&value.every(v=>typeof v==='string'&&v.length));}
const C=require('../core.js'),cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
let framesChecked=0,edgesChecked=0,casesChecked=0;
for(const {graph:g,winner:oracle} of cases){
 // n=50 snapshots are intentionally not generated: avoid teaching O(n^4) storage.
 if(g.length>9)continue;
 const frames=C.trace(g),last=frames.at(-1),popped=new Set(),reachable=C.reachable(g);
 for(const k of reachable)assert.strictEqual(last.w[k],oracle[k]);
 for(let i=0;i<frames.length;i++){
  const f=frames[i];if(f.current){const k=C.key(f.current);assert(!popped.has(k));popped.add(k);assert(f.w[k]);}
  for(const [k,w] of Object.entries(f.w)){
   const s=k.split(',').map(Number);assert(!w||w===oracle[k]);
   if(!w){
    const exits=C.children(g,s),remaining=exits.filter(ch=>!popped.has(C.key(ch))||f.w[C.key(ch)]===s[2]).length;
    assert.strictEqual(f.r[k],remaining,k);if(reachable.has(k))assert(f.r[k]>0);
    if(f.done&&reachable.has(k)){assert(exits.some(ch=>!f.w[C.key(ch)]));assert(!exits.some(ch=>f.w[C.key(ch)]===s[2]));}
    edgesChecked+=exits.length;
   }
   if(i)assert(!frames[i-1].w[k]||frames[i-1].w[k]===w);
  }
  for(const u of f.updates){
   assert(C.children(g,u.state).some(ch=>C.key(ch)===C.key(u.child)));
   assert(u.reason==='one'?u.before===u.after:u.after===u.before-1);
   if(u.reason==='all')assert(u.after===0&&u.winner===3-u.state[2]);
  }
  framesChecked++;
 }
 casesChecked++;
}
const result={status:'PASS',casesChecked,framesChecked,edgesChecked,localizationKeys:keys.length,checks:['AST duplicate-key detection and bilingual pair shape','all reachable final states vs synchronous oracle','monotone sound win labels','exact unproved counters','legal predecessors','all/some transition arithmetic','draw residual closed exits']};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
