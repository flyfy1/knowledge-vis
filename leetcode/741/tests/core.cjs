'use strict';
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),core=require('../core.js');
const fixtures=JSON.parse(fs.readFileSync(0,'utf8'));let checked=0;
for(const {grid,layers} of fixtures){
 const trace=core.trace(grid);
 for(const f of trace){
  assert.deepEqual(f.states.map(row=>row.map(s=>s.value)),layers[f.t]);
  for(const row of f.states)for(const s of row){
   checked++;
   if(s.value!==null){
    assert(s.paths);const union=new Set();
    s.paths.forEach((p,i)=>{assert.equal(p.length,f.t+1);assert.deepEqual(p[0],[0,0]);assert.deepEqual(p.at(-1),i?[s.r2,s.c2]:[s.r1,s.c1]);p.forEach(([r,c],j)=>{assert.equal(r+c,j);assert(grid[r][c]>=0);if(j){const [pr,pc]=p[j-1];assert((r===pr+1&&c===pc)||(c===pc+1&&r===pr));}union.add(r+','+c);});});
    assert.equal([...union].reduce((a,key)=>{const [r,c]=key.split(',').map(Number);return a+grid[r][c]},0),s.value);
    if(f.t){assert(s.best);assert.equal(s.best.value,Math.max(...s.candidates.filter(x=>x.value!==null).map(x=>x.value)));assert.equal(s.best.value+s.gain,s.value);}
   } else assert.equal(s.paths,null);
  }
 }
}
const expected=[4,5,0,5,1,0,9];core.presets.forEach((g,i)=>{const f=core.trace(g).at(-1);assert.equal(Math.max(0,f.states.at(-1).at(-1).value??0),expected[i])});
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Acorn sees object properties before evaluation could silently overwrite keys.
const acorn=require('acorn');const tree=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:2022});const object=tree.body[1].expression.right;const names=object.properties.map(p=>p.key.name);assert.equal(new Set(names).size,names.length);
const copyBox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),copyBox);Object.values(copyBox.window.COPY).forEach(pair=>assert(Array.isArray(pair)&&pair.length===2&&pair.every(s=>typeof s==='string'&&s.length>0)));
console.log(`${checked} intermediate states matched independent prefix-union oracle; path histories, candidates, presets, copy key uniqueness and mirror exact.`);
