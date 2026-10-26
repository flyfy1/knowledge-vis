'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const core=require('../core.js');const known=JSON.parse(fs.readFileSync(path.join(OUT,'oracle-fixtures.json')));
// Independent dynamic program: allow every legal outer length, not only the first.
const memo=new Map([['',0]]);
function oracle(s){if(memo.has(s))return memo.get(s);let best=1;for(let k=1;k*2<=s.length;k++)if(s.slice(0,k)===s.slice(-k))best=Math.max(best,2+oracle(s.slice(k,-k)));memo.set(s,best);return best;}
let count=0;
for(const [s,want] of Object.entries(known)){
 assert.equal(oracle(s),want);const model=core.trace(s);assert.equal(model.frames.at(-1).fixed,want);
 model.frames.forEach((f,i)=>{
  const middle=s.slice(f.left,f.right),left=f.chunks.join(''),right=[...f.chunks].reverse().join('');
  assert.equal(left+middle+right,s);assert.equal(f.fixed,2*f.chunks.length+(f.done&&middle.length>0?1:0));
  assert.equal(2*f.chunks.length+oracle(middle),want);
  assert.equal(f.history.length,i);assert(f.left<=f.right);assert.equal(f.done,i===model.frames.length-1);
  if(i){const p=model.frames[i-1],e=f.event;assert.equal(e.left,p.left);assert.equal(e.right,p.right);
   if(e.kind==='middle'){assert(2*p.size>p.right-p.left);assert.equal(oracle(middle),1);}
   else {assert.equal(e.size,p.size);assert.equal(e.a,s.slice(p.left,p.left+p.size));assert.equal(e.b,s.slice(p.right-p.size,p.right));assert(2*e.size<=e.right-e.left);
    if(e.kind==='match'){assert.equal(e.a,e.b);for(let k=1;k<e.size;k++)assert.notEqual(s.slice(e.left,e.left+k),s.slice(e.right-k,e.right));assert.equal(f.left,p.left+e.size);assert.equal(f.right,p.right-e.size);assert.equal(f.size,1);}
    else{assert.notEqual(e.a,e.b);assert.equal(f.size,p.size+1);assert.equal(f.left,p.left);assert.equal(f.right,p.right);}
   }
  }count++;
 });
}
// Localization syntax, pair shapes and duplicate-key detection before evaluation.
const acorn=require('acorn');const copy=fs.readFileSync(path.join(ROOT,'copy.js'),'utf8');const ast=acorn.parse(copy,{ecmaVersion:'latest'});
const obj=ast.body.find(x=>x.type==='ExpressionStatement'&&x.expression.type==='AssignmentExpression').expression.right;assert.equal(obj.type,'ObjectExpression');const keys=obj.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length);
const ctx={window:{}};vm.runInNewContext(copy,ctx);for(const [k,v] of Object.entries(ctx.window.LESSON_COPY))assert(v.length===2&&v.every(x=>typeof x==='string'&&x.length),k);
const source={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'python-code.js'),'utf8'),source);assert.equal(source.window.PYTHON_SOURCE,fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));
fs.writeFileSync(path.join(OUT,'core.json'),JSON.stringify({kind:'author self-check',cases:Object.keys(known).length,frames:count,checks:['all-length independent recurrence agrees with all-cut-mask oracle','conservation','optimal remainder invariant','event old bounds vs post bounds','shortest match','terminal and partial counts','unique bilingual keys and pair shapes','exact mirror']},null,2)+'\n');console.log('PASS',count,'trace frames');
