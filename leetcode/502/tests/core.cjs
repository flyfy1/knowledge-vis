const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const C=require('../core.js'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
function oracle(a){let best=a.w;function visit(mask,w,left){best=Math.max(best,w);if(!left)return;for(let i=0;i<a.p.length;i++)if(!(mask&(1<<i))&&a.c[i]<=w)visit(mask|(1<<i),w+a.p[i],left-1);}visit(0,a.w,a.k);return best;}
let frames=0,cases=0;
function check(a){const ff=C.trace(a);assert.equal(ff.at(-1).w,oracle(a));assert.equal(ff[0].j,0);let prior=ff[0];for(const f of ff){
 frames++;assert.equal(new Set(f.done).size,f.done.length);assert.equal(f.w,a.w+f.done.reduce((s,i)=>s+a.p[i],0));assert.equal(f.ledger.length,f.done.length);
 const ready=f.heap.map(x=>x[1]);assert.equal(new Set(ready).size,ready.length);assert(ready.every(i=>!f.done.includes(i)&&a.c[i]<=f.w));
 assert.deepEqual([...ready,...f.done].sort((x,y)=>x-y),f.order.slice(0,f.j).map(x=>x[2]).sort((x,y)=>x-y));
 for(let h=1;h<f.heap.length;h++){const child=f.heap[h],parent=f.heap[(h-1)>>1];assert(parent[0]<child[0]||(parent[0]===child[0]&&parent[1]<child[1]));}
 if(f.kind==='admit'){assert.equal(f.w,prior.w);assert.equal(f.j,prior.j+1);assert(a.c[f.id]<=prior.w);}
 if(f.kind==='pick'){
  const affordable=a.p.map((p,i)=>i).filter(i=>!prior.done.includes(i)&&a.c[i]<=prior.w);
  assert.deepEqual(prior.heap.map(x=>x[1]).sort((x,y)=>x-y),affordable);
  assert.equal(f.profit,Math.max(...affordable.map(i=>a.p[i])));assert.equal(f.w,prior.w+f.profit);
 }
 if(f.kind==='stop')assert(a.c.every((c,i)=>f.done.includes(i)||c>f.w));
 for(const row of f.ledger)assert.equal(row.before+row.profit,row.after);
 prior=f;
 }const before=JSON.stringify(ff[0]);ff.at(-1).heap.push([-999,999]);assert.equal(JSON.stringify(ff[0]),before);cases++;}
C.presets.forEach(check);
let seed=502;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for(let i=0;i<3000;i++){const n=1+rand(7);check({k:rand(9),w:rand(6),c:Array.from({length:n},()=>rand(12)),p:Array.from({length:n},()=>rand(7))});}
const tree=acorn.parse(fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),{ecmaVersion:'latest'});
function audit(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const seen=new Set();for(const p of node.properties){const key=p.key.name??p.key.value;assert(!seen.has(key),'Duplicate localization key: '+key);seen.add(key);}}for(const v of Object.values(node)){if(Array.isArray(v))v.forEach(audit);else if(v&&typeof v==='object')audit(v);}}audit(tree);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),ctx);for(const [key,pair]of Object.entries(ctx.window.LESSON_COPY)){assert(Array.isArray(pair)&&pair.length===2&&pair.every(x=>typeof x==='string'&&x.length),key);const fields=s=>[...s.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort();assert.deepEqual(fields(pair[0]),fields(pair[1]),key);}
fs.writeFileSync(path.join(OUT,'core.json'),JSON.stringify({kind:'author self-check',result:'pass',cases,frames,seed:502,checks:'independent exhaustive-order oracle; each admission/pick, conservation, heap order, snapshots, ledger, AST duplicate keys; locale pair shapes/placeholders'},null,2));console.log({cases,frames});
