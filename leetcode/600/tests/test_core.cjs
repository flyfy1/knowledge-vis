const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {suffix,strings,trace}=require('../core.js');
const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
for(let k=0;k<=15;k++)assert.equal(suffix(k),Array.from({length:2**k},(_,x)=>x.toString(2)).filter(x=>!x.includes('11')).length);
for(let k=0;k<=5;k++){assert.equal(strings(k).length,suffix(k));assert(strings(k).every(x=>x.length===k&&!x.includes('11')));}
let count=0,framesChecked=0;
for(let n=1;n<=4095;n++){
 if(n===1)count=1;count+=!n.toString(2).includes('11');
 const run=trace(n),frames=run.frames;assert.equal(frames.at(-1).total,count);
 let seen=new Set(),prev=0;
 for(let j=1;j<frames.length;j++){
  const f=frames[j];framesChecked++;assert.equal(f.before,frames[j-1].total);assert.equal(f.total,f.before+f.add);assert.equal(f.prev,prev);
  if(f.bit!==null){assert.equal(f.prefix,run.binary.slice(0,run.width-f.i));if(f.kind!=='stop')assert(!f.prefix.includes('11'));prev=f.bit;}
  if(n<=256){
   const branch=f.branch===null?[]:Array.from({length:n+1},(_,x)=>x).filter(x=>{const b=x.toString(2).padStart(run.width,'0');return !b.includes('11')&&b.length===f.branch.length&&[...b].every((c,i)=>f.branch[i]==='?'||f.branch[i]===c);});
   assert.equal(branch.length,f.add,JSON.stringify({n,j,f,branch}));for(const x of branch){assert(!seen.has(x));seen.add(x);}
   assert.equal(seen.size,f.total);
   for(let x=0;x<=n;x++)if(!x.toString(2).includes('11')&&!seen.has(x))assert(x.toString(2).padStart(run.width,'0').startsWith(f.prefix));
  }
 }
 assert(frames.at(-1).done);assert(['stop','finish'].includes(frames.at(-1).kind));
}
for(const [n,value] of Object.entries(cases))assert.equal(trace(+n).frames.at(-1).total,value,n);
// Copy representation: catch duplicate keys before JS parsing can discard them.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),ast=require('acorn').parse(copy,{ecmaVersion:'latest'}),properties=ast.body.find(x=>x.type==='ExpressionStatement'&&x.expression.type==='AssignmentExpression').expression.right.properties,keys=properties.map(p=>p.key.name||p.key.value);assert.equal(keys.length,new Set(keys).size);
const sandbox={window:{}};vm.runInNewContext(copy,sandbox);for(const [key,value]of Object.entries(sandbox.window.LESSON_COPY)){assert(Array.isArray(value)&&value.length===2&&value.every(x=>typeof x==='string'&&x.length),key);assert.deepEqual([...value[0].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),[...value[1].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),key);}
vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const report={kind:'author core self-check',status:'PASS',exhaustiveInputs:4095,framesChecked,largeCases:Object.keys(cases).length,branchPartitionInvariant:'all frames for n<=256',suffixCounts:'k=0..15 independent enumeration',localization:'unique keys, two nonempty strings, matching placeholders',sourceMirrorExact:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2));console.log(report);
