const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../core.js'),cases=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let frames=0,states=0;
for(const {graph:g,expected} of cases){
 const trace=C.trace(g),n=g.length,seen=new Map();let total=0;
 assert.equal(trace.at(-1).result,expected);
 for(const f of trace){
  frames++;assert.equal(f.d,trace.indexOf(f));total+=f.states.length;assert.equal(total,f.total);
  const previous=new Map(seen);
  for(const s of f.states){
   states++;const k=s.u+':'+s.mask;assert(!seen.has(k));seen.set(k,f.d);
   assert.equal(s.path.length-1,f.d);assert.equal(s.path.at(-1),s.u);
   assert.equal(s.path.reduce((m,v)=>m|1<<v,0),s.mask);
   for(let i=1;i<s.path.length;i++)assert(g[s.path[i-1]].includes(s.path[i]));
   if(s.parent){assert.equal(previous.get(s.parent.join(':')),f.d-1);assert(g[s.parent[0]].includes(s.u));assert.equal(s.mask,s.parent[1]|1<<s.u);}
   else assert.equal(f.d,0);
  }
  // Every edge out of prior layer is discovered by now (including duplicates).
  if(f.d)for(const s of trace[f.d-1].states)for(const v of g[s.u])assert(seen.has(v+':'+(s.mask|1<<v)));
  assert.equal(f.result,f.states.some(s=>s.mask===(1<<n)-1)?f.d:null);
 }
 // Independent exact-length walk sets, no global seen pruning: earliest arrival per pair.
 let layer=new Map(g.map((_,u)=>[u+':'+(1<<u),[u,1<<u]])),first=new Map();
 for(let d=0;d<trace.length;d++){
  for(const [k,s] of layer)if(!first.has(k))first.set(k,d);
  const next=new Map();for(const [u,m] of layer.values())for(const v of g[u])next.set(v+':'+(m|1<<v),[v,m|1<<v]);layer=next;
 }
 for(const [k,d] of seen)assert.equal(first.get(k),d);
 const snapshot=JSON.stringify(trace);trace.at(-1).witness=[...trace.at(-1).witness];assert.equal(JSON.stringify(C.trace(g)),snapshot);
}
const acorn=require('acorn'),tree=acorn.parse(fs.readFileSync(require.resolve('../copy.js'),'utf8'),{ecmaVersion:'latest'});
function unique(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const names=node.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(names).size,names.length,'duplicate copy key');}for(const v of Object.values(node))if(Array.isArray(v))v.forEach(unique);else if(v&&typeof v==='object')unique(v);}
unique(tree);
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../copy.js'),'utf8'),sandbox);
for(const [k,pair] of Object.entries(sandbox.window.LESSON_COPY)){assert(Array.isArray(pair)&&pair.length===2&&pair.every(v=>typeof v==='string'&&v.length));const tokens=s=>[...s.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort();assert.deepEqual(tokens(pair[0]),tokens(pair[1]),k);}
console.log(JSON.stringify({cases:cases.length,frames,states,intermediate_invariants:true,copy_pairs:true}));
