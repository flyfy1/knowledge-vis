'use strict';
(function(root){
const presets=[
 {cap:2,ops:[['put',1,10],['put',2,20],['get',1],['put',3,30],['get',2],['get',3],['put',4,40]]},
 {cap:2,ops:[['put',5,50],['put',6,60],['put',5,55],['get',6],['put',7,70],['get',5]]},
 {cap:1,ops:[['get',0],['put',0,0],['put',0,1000000000],['put',100000,1],['get',0],['put',0,2]]},
 {cap:2,ops:[['put',1,1],['put',2,2],['get',1],['get',1],['get',2],['put',3,3],['get',2],['put',2,22]]}
];
function trace(p){
 const items=new Map(),buckets=new Map();let min=0;
 const snap=()=>({min,items:[...items].map(([k,v])=>[k,...v]),groups:[...buckets].sort((a,b)=>a[0]-b[0]).map(([f,ks])=>({f,keys:[...ks]}))});
 const frames=[{kind:'initial',before:snap(),after:snap()}];
 for(const [kind,key,value]of p.ops){
 const before=snap();let result=null,victim=null,from=null,to=null,reason='insert';
 function touch(){const [v,f]=items.get(key);from=f;to=f+1;const ks=buckets.get(f);ks.delete(key);if(!ks.size){buckets.delete(f);if(min===f)min=f+1;}if(!buckets.has(f+1))buckets.set(f+1,new Set());buckets.get(f+1).add(key);items.set(key,[v,f+1]);}
 if(kind==='get'){if(!items.has(key)){result=-1;reason='miss';}else{result=items.get(key)[0];touch();reason='hit';}}
 else if(items.has(key)){items.get(key)[0]=value;touch();reason='update';}
 else if(p.cap>0){if(items.size===p.cap){victim=buckets.get(min).values().next().value;buckets.get(min).delete(victim);items.delete(victim);if(!buckets.get(min).size)buckets.delete(min);}items.set(key,[value,1]);if(!buckets.has(1))buckets.set(1,new Set());buckets.get(1).add(key);min=1;to=1;}
 frames.push({kind,key,value,result,victim,from,to,reason,before,after:snap()});
 }return frames;
}
const api={presets,trace};root.LFULesson=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
