'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js'),fixtures=JSON.parse(fs.readFileSync(path.join(out,'fixtures.json')));
function chess(b){return b.every((r,i)=>r.every((x,j)=>(i===0||x!==b[i-1][j])&&(j===0||x!==r[j-1])));}
let frameCount=0;
for(const {board,expected} of fixtures){
 const before=JSON.stringify(board),frames=C.trace(board);assert.equal(frames.at(-1).result,expected);assert.equal(JSON.stringify(board),before);
 for(let k=0;k<frames.length;k++){
  const f=frames[k],e=f.event;frameCount++;assert.equal(f.history.length,k+1);assert.equal(f.moves,f.history.filter(x=>x.kind==='swap').length);
  if(e.kind==='rowCheck')assert(f.board[e.i].every((x,j)=>(x^f.board[0][j])===(f.board[e.i][0]^f.board[0][0])));
  if(e.kind==='target'){const a=e.axis==='rows'?f.board.map(r=>r[0]):f.board[0],target=[...e.target].map(Number);assert.equal(a.reduce((s,x)=>s+x),target.reduce((s,x)=>s+x));assert.equal(a.filter((x,i)=>x!==target[i]).length,e.m);assert.equal(e.m/2,e.cost);}
  if(e.kind==='swap'){
   const prev=C.clone(frames[k-1].board);if(e.axis==='rows')[prev[e.a],prev[e.z]]=[prev[e.z],prev[e.a]];else for(const r of prev)[r[e.a],r[e.z]]=[r[e.z],r[e.a]];
   assert.deepEqual(f.board,prev);
  }
  if(f.result>=0&&f.result!==null){assert(chess(f.board));assert.equal(f.moves,f.result);}
 }
 const saved=JSON.stringify(frames[0]);if(frames.length>1){const last=frames.at(-1);last.board[0][0]^=1;assert.equal(JSON.stringify(frames[0]),saved);}
}
assert.deepEqual(C.presets.map(b=>C.trace(b).at(-1).result),[2,1,0,-1,-1,-1,0]);
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,source);
// Parse the actual dictionary AST before evaluation to reject duplicate properties.
const acorn=require('acorn'),ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const obj=ast.body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression').expression.right;
const keys=obj.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length);
vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),ctx);for(const [key,pair] of Object.entries(ctx.window.LESSON_COPY)){assert.equal(pair.length,2,key);assert(pair.every(x=>typeof x==='string'&&x.length>0),key);}
const result={status:'passed',fixtures:fixtures.length,frames:frameCount,checks:['simulation vs independent Python fixtures','every intermediate swap, check, target and count','snapshot isolation','preset promises','exact offline mirror','AST duplicate key detection and bilingual pair shape']};fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
