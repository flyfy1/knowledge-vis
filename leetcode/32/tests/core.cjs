const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict'), path=require('node:path');
const root=path.resolve(__dirname,'..'), ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'../hard-first-ten/core.js'),'utf8'),ctx);
const model=ctx.window.HardModels[32];
function valid(s){let n=0;for(const c of s){n+=c==='('?1:-1;if(n<0)return false;}return n===0;}
function best(s){let b=0;for(let a=0;a<s.length;a++)for(let z=a+1;z<=s.length;z++)if(valid(s.slice(a,z)))b=Math.max(b,z-a);return b;}
let inputs=0,frames=0;
for(let n=0;n<=10;n++)for(let bits=0;bits<2**n;bits++){
 const s=Array.from({length:n},(_,i)=>bits&(1<<i)?'(':')').join(''), trace=model(s);
 assert.equal(trace.result,best(s));
 for(const f of trace.frames){
  const prefix=s.slice(0,f.state.i+1);assert.equal(f.state.best,best(prefix));
  let length=0;for(let a=0;a<prefix.length;a++)if(valid(prefix.slice(a)))length=Math.max(length,prefix.length-a);
  assert.equal(f.state.length,length);
  const stack=Array.from(f.rows[1].values);assert.ok(stack.length>0);assert.equal(stack[0],f.state.boundary);
  if(f.span)assert.ok(valid(s.slice(f.span[0],f.span[1]+1)));
  frames++;
 }
 inputs++;
}
const result={inputs,frames,finalAndIntermediateChecks:true};
fs.writeFileSync(path.join(root,'evidence/fix-r1-r2/core.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
