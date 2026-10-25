const fs=require('fs'),path=require('path'),assert=require('assert');
const base=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const c=require('../core.js'),fixtures=JSON.parse(fs.readFileSync(path.join(out,'fixtures.json')));
let moves=0;
for(const {a,expected} of fixtures.cases){
 const s=c.solver(a);assert.equal(s.dp(0,a.length-1,0),expected);
 const frames=c.trace(a);assert.equal(frames.at(-1).total,expected);
 for(let j=1;j<frames.length;j++){
  const before=frames[j-1],after=frames[j],ids=after.removed.map(x=>x.id),indexes=ids.map(id=>before.live.findIndex(x=>x.id===id));
  assert(indexes.every((x,i)=>x>=0&&(i===0||x===indexes[i-1]+1)));
  assert(after.removed.every(x=>x.value===after.removed[0].value));
  assert.equal(after.gain,ids.length**2);assert.equal(after.total,before.total+after.gain);
  assert.deepEqual(after.live,before.live.filter(x=>!ids.includes(x.id)));moves++;
 }
}
for(const {a,l,r,k,expected} of fixtures.states){const s=c.solver(a);assert.equal(s.dp(l,r,k),expected);const candidates=s.candidates(l,r,k);assert.equal(Math.max(...candidates.map(x=>x.value)),expected);}
assert.deepEqual(c.presets.map(a=>c.trace(a,true).at(-1).total),[3,13,17,9,3,1]);
assert.deepEqual([0,1,2].map(k=>c.solver([1,2,1]).candidates(0,2,k).map(x=>x.value)),[[3,5],[6,10],[11,17]]);
// Parse object syntax so duplicate keys cannot silently disappear.
const acorn=require('acorn'),ast=acorn.parse(fs.readFileSync(path.join(base,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const walk=n=>{if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){const keys=n.properties.map(p=>p.key.name??p.key.value);assert.equal(keys.length,new Set(keys).size,'duplicate copy key');for(const p of n.properties){assert.equal(p.value.type,'ArrayExpression');assert.equal(p.value.elements.length,2);assert(p.value.elements.every(x=>x.type==='Literal'&&typeof x.value==='string'&&x.value.length));}}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);};walk(ast);
const vm=require('vm'),context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(base,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(base,'solution.py'),'utf8'));
const result={passed:true,cases:fixtures.cases.length,legal_move_checks:moves,intermediate_states:fixtures.states.length,root_candidates:[[3,5],[6,10],[11,17]],duplicate_copy_keys:0};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
