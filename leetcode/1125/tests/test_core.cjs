'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {presets,trace}=require('../core.js');
// Set-based person-subset enumeration, independent of the mask DP.
function exact(skills,people){const best=new Map();for(let subset=0;subset<2**people.length;subset++){
 const set=new Set(),team=[];for(let i=0;i<people.length;i++)if(subset&(1<<i)){team.push(i);people[i].forEach(s=>set.add(s));}
 const key=skills.filter(s=>set.has(s)).join(',');if(!best.has(key)||team.length<best.get(key))best.set(key,team.length);
 }return best;}
let rounds=0,events=0,cases=0;
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
for(const p of [...presets,...fixtures]){
 const model=trace(p.skills,p.people);cases++;
 model.frames.forEach((f,k)=>{
  const expected=exact(p.skills,p.people.slice(0,k));
  assert.equal(Object.keys(f.after).length,expected.size);
  for(let mask=0;mask<=model.full;mask++){
   const key=p.skills.filter((s,j)=>mask&(1<<j)).join(','),team=f.after[mask];
   if(expected.has(key)){
    assert.equal(team.length,expected.get(key));assert.equal(new Set(team).size,team.length);assert(team.every(i=>i<k));
    const covered=new Set(team.flatMap(i=>p.people[i]));assert.deepEqual(p.skills.filter(s=>covered.has(s)),p.skills.filter((s,j)=>mask&(1<<j)));
   }else assert.equal(team,undefined);
  }
  if(k){assert.deepEqual(f.before,model.frames[k-1].after);assert.equal(f.events.length,Object.keys(f.before).length);
   const rebuilt=JSON.parse(JSON.stringify(f.before));for(const e of f.events){events++;
    assert.equal(e.merged,e.mask|model.masks[k-1]);assert.deepEqual(e.candidate,f.before[e.mask].concat(k-1));assert.deepEqual(e.old,rebuilt[e.merged]??null);
    const accept=e.old===null||e.candidate.length<e.old.length;assert.equal(e.accept,accept);if(accept)rebuilt[e.merged]=e.candidate;
   }assert.deepEqual(rebuilt,f.after);
  }rounds++;
 });
}
// Detect duplicate object keys before JavaScript can overwrite them.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const tree=acorn.parse(copy,{ecmaVersion:'latest'});
function walk(x){if(!x||typeof x!=='object')return;if(x.type==='ObjectExpression'){const keys=x.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate copy keys');}for(const v of Object.values(x))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(tree);
const sandbox={window:{}};vm.runInNewContext(copy,sandbox);for(const pair of Object.values(sandbox.window.LESSON_COPY)){assert.equal(pair.length,2);assert(pair.every(x=>typeof x==='string'&&x.length));}
const src=fs.readFileSync(path.join(root,'solution.py'),'utf8');vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,src);
assert.equal(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),'window.PYTHON_SOURCE = '+JSON.stringify(src)+';\n');
const css=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(css<25000);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({status:'pass',cases,rounds,events,cssBytes:css,duplicateCopyKeys:0,mirrorExact:true},null,2));console.log({cases,rounds,events,css});
