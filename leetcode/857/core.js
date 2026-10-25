(function(root){
'use strict';
const presets=[
 {q:[2,3,1],w:[6,6,4],k:2},
 {q:[10,20,5],w:[70,50,30],k:2},
 {q:[3,1,10,10,1],w:[4,8,2,2,7],k:3},
 {q:[1,2,10],w:[1,4,30],k:2},
 {q:[2,1,3],w:[4,2,6],k:2},
 {q:[5,2,3],w:[5,8,6],k:1},
 {q:[2,3],w:[6,6],k:2},
 {q:[1],w:[10000],k:1}
];
function trace(p){
 const order=p.q.map((q,id)=>({id,q,w:p.w[id],rate:p.w[id]/q})).sort((a,b)=>a.rate-b.rate||a.q-b.q||a.id-b.id);
 let kept=[],sum=0,best=null,bestIds=[];const frames=[{kept:[],sum:0,best:null,bestIds:[],done:0}];
 for(const x of order){
  const old=sum;kept.push(x);sum+=x.q;
  kept.sort((a,b)=>a.q-b.q||a.id-b.id);
  const removed=kept.length>p.k?kept.pop():null;if(removed)sum-=removed.q;
  const cost=kept.length===p.k?x.rate*sum:null;
  if(cost!==null&&(best===null||cost<best)){best=cost;bestIds=kept.map(a=>a.id);}
  frames.push({done:frames.length,x:{...x},old,removed:removed?{...removed}:null,kept:kept.map(a=>({...a})),sum,cost,best,bestIds:[...bestIds]});
 }
 return {order,frames};
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.WorkerLab=api;
})(typeof window==='undefined'?globalThis:window);
