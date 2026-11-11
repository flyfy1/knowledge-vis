'use strict';
const C=require('../core.js'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function oracle(routes,s,t){
 if(s===t)return 0;
 const n=routes.length,sets=routes.map(r=>new Set(r)),d=routes.map((_,i)=>routes.map((_,j)=>i===j?0:routes[i].some(x=>sets[j].has(x))?1:Infinity));
 for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);
 let ans=Infinity;for(let i=0;i<n;i++)if(sets[i].has(s))for(let j=0;j<n;j++)if(sets[j].has(t))ans=Math.min(ans,1+d[i][j]);return Number.isFinite(ans)?ans:-1;
}
let cases=0,framesTested=0;
function check(input){
 const frames=C.trace(input),{routes,source,target}=input;assert.equal(frames.at(-1).result,oracle(routes,source,target));
 const expected=new Map([...new Set(routes.flat().concat(source))].map(s=>[s,oracle(routes,source,s)]));
 for(let i=0;i<frames.length;i++){
  const f=frames[i],dist=new Map(f.dist),used=new Map(f.used);framesTested++;
  assert.equal(f.dist.length,dist.size);assert.equal(f.used.length,used.size);
  for(const [s,d] of dist){assert.equal(d,expected.get(s));assert(d<=f.depth);}
  assert.deepEqual(f.front,f.dist.filter(([s,d])=>d===f.depth).map(([s])=>s));
  for(const [bus,layer] of used){assert.equal(layer,1+Math.min(...routes[bus].map(s=>expected.get(s))));for(const s of routes[bus])assert(dist.has(s)&&dist.get(s)<=layer);}
  if(i){const prev=frames[i-1];assert.deepEqual(f.history.slice(0,-1),prev.history);assert.deepEqual(f.dist.slice(0,prev.dist.length),prev.dist);assert.deepEqual(f.used.slice(0,prev.used.length),prev.used);assert.equal(f.events.length,f.used.length-prev.used.length);
   const fresh=f.events.flatMap(e=>e.fresh);assert.deepEqual(f.front,fresh);assert.equal(f.history.at(-1).newStops,fresh.length);assert.equal(f.history.at(-1).scans,f.events.reduce((a,e)=>a+routes[e.bus].length,0));
   for(const e of f.events){assert(prev.front.includes(e.via));assert(routes[e.bus].includes(e.via));assert(!new Map(prev.used).has(e.bus));}
  }
 }
 // Check snapshot isolation from later mutations and determinism.
 const before=JSON.stringify(frames[0]);if(frames.length>1){frames.at(-1).front.push(123456);assert.equal(JSON.stringify(frames[0]),before);}
 cases++;
}
const subsets=Array.from({length:7},(_,m)=>[0,1,2].filter(x=>(m+1)>>x&1));
for(const a of subsets)for(const b of subsets)for(const c of subsets)for(let s=0;s<4;s++)for(let t=0;t<4;t++)check({routes:[a,b,c],source:s,target:t});
let seed=815;const rand=n=>{seed=(1664525*seed+1013904223)>>>0;return seed%n;};
for(let n=0;n<800;n++){const routes=Array.from({length:1+rand(7)},()=>Array.from({length:9},(_,i)=>i).filter(()=>rand(2)));for(const r of routes)if(!r.length)r.push(rand(9));check({routes,source:rand(11),target:rand(11)});}
C.presets.forEach(check);
const copyContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),copyContext);for(const [key,pair] of Object.entries(copyContext.window.LESSON_COPY)){assert.equal(pair.length,2,key);assert(pair.every(x=>typeof x==='string'&&x.length),key);}
const out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});const report={kind:'author trace self-check',result:'pass',cases,framesTested,invariants:'independent route-graph distances; frontier equality; monotone snapshots; route-once expansion; causal via stop; per-layer entry scan accounting',seed:815};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
