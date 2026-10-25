const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const {trace,presets}=require('../core.js');
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
let frames=0,checks=0;
for(const {grid,answer,optimal} of fixtures){
 const model=trace(grid);assert.equal(model.result,answer);
 let previous=-Infinity;
 for(const [index,f] of model.frames.entries()){
  frames++;for(let r=0;r<grid.length;r++)for(let c=0;c<grid.length;c++){
   if(f.settled[r][c])assert.equal(f.dist[r][c],optimal[r][c]);
   if(Number.isFinite(f.dist[r][c]))assert(f.dist[r][c]>=optimal[r][c]);
  }
  if(!index)continue;
  const e=f.event;assert(e.cost>=previous);previous=e.cost;
  assert.equal(e.cost,optimal[e.r][e.c]);
  for(const ch of e.checks){checks++;assert.equal(ch.candidate,Math.max(e.cost,grid[ch.r][ch.c]));assert.equal(ch.improved,ch.candidate<ch.old);assert.equal(f.dist[ch.r][ch.c],Math.min(ch.old,ch.candidate));}
  if(f!==model.frames.at(-1)){const snapshot=JSON.stringify(f);model.frames.at(-1).queue.push([99,99,99]);assert.equal(JSON.stringify(f),snapshot);model.frames.at(-1).queue.pop();}
 }
}
for(const p of presets)assert(trace(p).frames.at(-1).done);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Acorn catches duplicate definitions before the JS object can overwrite them.
const acorn=require('acorn'),ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const seen=new Set;for(const p of node.properties){const k=p.key.name||p.key.value;assert(!seen.has(k),'duplicate copy key '+k);seen.add(k);assert(p.value.type==='ArrayExpression'&&p.value.elements.length===2&&p.value.elements.every(e=>e.type==='Literal'&&typeof e.value==='string'));}}for(const v of Object.values(node)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
walk(ast);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({fixtures:fixtures.length,frames,checks,sourceParity:true,duplicateKeys:false})+'\n');
console.log('PASS snapshot invariants', {frames,checks});
