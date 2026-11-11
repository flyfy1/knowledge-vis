const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const C=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));let frames=0,kinds=new Set();
for(const [stamp,target,exists] of fixtures){const model=C.trace(stamp,target),m=stamp.length,n=target.length;assert.equal(model.frames.at(-1).kind==='success',exists);const visited=new Set();let erased=0;
for(const [index,f] of model.frames.entries()){frames++;kinds.add(f.kind);assert.equal(f.erased,f.done.filter(Boolean).length);assert.equal(f.board,[...target].map((c,p)=>f.done[p]?'?':c).join(''));assert(f.erased>=erased);erased=f.erased;
for(let i=0;i<=n-m;i++){let bad=0;for(let j=0;j<m;j++)if(!f.done[i+j]&&target[i+j]!==stamp[j])bad++;assert.equal(f.todo[i],bad);}
assert.equal(new Set(f.queue).size,f.queue.length);for(const i of f.queue){assert.equal(f.todo[i],0);assert(!visited.has(i));}
if(f.i!==null){assert(!visited.has(f.i));visited.add(f.i);const prev=model.frames[index-1];assert.equal(prev.queue[0],f.i);assert.equal(C.inspect(stamp,prev.board,f.i).bad.length,0);assert.deepEqual(f.fresh,[...Array(m)].map((_,j)=>f.i+j).filter(p=>!prev.done[p]));assert.equal(f.erased-prev.erased,f.fresh.length);for(const u of f.updates){assert.equal(u.after,u.before-1);assert(f.fresh.includes(u.p));assert(model.waiting[u.p].includes(u.w));}}
}
const last=model.frames.at(-1);if(exists){let board='?'.repeat(n);for(const i of last.result)board=board.slice(0,i)+stamp+board.slice(i+m);assert.equal(board,target);assert(last.result.length<=n);}
const saved=JSON.stringify(model.frames);const repeat=C.trace(stamp,target);assert.equal(JSON.stringify(repeat.frames),saved);repeat.frames[0].todo[0]=99;assert.equal(JSON.stringify(model.frames),saved);
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
vm.runInNewContext(fs.readFileSync(path.join(root,'baseline-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.BASELINE_SOURCE,fs.readFileSync(path.join(root,'baseline.py'),'utf8'));
// Parse raw copy definitions before JS could silently overwrite a duplicate.
const acorn=require('acorn'),ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'}),props=ast.body[0].expression.right.properties,keys=props.map(p=>p.key.value);assert.equal(keys.length,new Set(keys).size);for(const p of props)assert.equal(p.value.elements.length,2);
const result={kind:'author self-check',cases:fixtures.length,frames,kinds:[...kinds],sourceParity:true,uniqueBilingualKeys:keys.length};fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(result,null,2));console.log(result);
