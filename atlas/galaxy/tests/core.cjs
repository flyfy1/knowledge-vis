'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
(async()=>{const {graphModel,layout}=await import('../layout.mjs');const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../data.js'),'utf8'),context);const data=JSON.parse(JSON.stringify(context.window.ATLAS));const model=graphModel(data),p=layout(data);let checks=0;function ok(v,m){assert.ok(v,m);checks++;}
 ok(p.size===data.nodes.length,'every real node placed');ok(model.edges.length===data.edges.length,'every real edge retained');ok([...p.values()].flat().every(Number.isFinite),'finite layout');
 assert.deepEqual([...p], [...layout({...data,nodes:[...data.nodes].reverse(),edges:[...data.edges].reverse()})]);checks++;
 const buckets={};for(const a of model.nodes)for(const b of model.nodes)if(a.id<b.id){const route=model.path(a.id,b.id),hops=route.length-1;if(hops<1)continue;for(let i=1;i<route.length;i++)ok(model.adjacency.get(route[i-1]).includes(route[i]),'path only uses real edges');const d=Math.hypot(...p.get(a.id).map((x,k)=>x-p.get(b.id)[k]));(buckets[hops]??=[]).push(d);}
 const mean=k=>buckets[k].reduce((a,b)=>a+b,0)/buckets[k].length;
 for(let k=1;k<5;k++)ok(mean(k)<mean(k+1),'mean spatial distance increases with graph distance '+k);
 const fixture={nodes:[{id:'a',group:'one'},{id:'b',group:'one'},{id:'c',group:'two'},{id:'isolated',group:'two'}],edges:[{from:'a',to:'b'},{from:'b',to:'c'},{from:'ghost',to:'a'}]};const f=graphModel(fixture);
 assert.deepEqual(f.path('c','a'),['c','b','a']);assert.deepEqual(f.path('a','isolated'),[]);assert.deepEqual(f.path('a','a'),['a']);assert.deepEqual(f.path('bad','a'),[]);checks+=4;
 ok([...layout(fixture).values()].flat().every(Number.isFinite),'isolated and invalid-endpoint handling');ok(layout({nodes:[],edges:[]}).size===0,'empty layout');ok([...layout({nodes:[{id:'one',group:'g'}],edges:[]}).values()].flat().every(x=>x===0),'singleton centered');
 console.log(JSON.stringify({checks,nodes:data.nodes.length,edges:data.edges.length,meanDistanceByHops:Object.fromEntries(Object.keys(buckets).map(k=>[k,+mean(k).toFixed(3)])),scope:'Finite deterministic layout, real-edge shortest paths, empty/isolated graph'},null,2));
})();
