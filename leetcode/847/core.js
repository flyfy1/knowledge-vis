'use strict';
(function(root){
 const presets=[[[1,2,3],[0],[0],[0]],[[1],[0,2,4],[1,3,4],[2],[1,2]],[[]],[[1],[0,2],[1]],[[1,2],[0,2],[0,1]]];
 function trace(graph){
  if(graph.length<1||graph.length>5)throw new Error('Teaching graphs require 1..5 nodes');
  const full=(1<<graph.length)-1,key=(u,m)=>u+':'+m;
  let front=graph.map((_,u)=>({u,mask:1<<u,parent:null,path:[u]}));
  const seen=new Set(front.map(s=>key(s.u,s.mask))),frames=[];
  let total=0,d=0;
  while(front.length){
   total+=front.length;
   const goal=front.find(s=>s.mask===full);
   frames.push({d,states:front,total,result:goal?d:null,witness:goal?goal.path:front[0].path});
   if(goal)break;
   const next=[];
   for(const s of front)for(const v of graph[s.u]){
    const mask=s.mask|(1<<v),k=key(v,mask);
    if(!seen.has(k)){seen.add(k);next.push({u:v,mask,parent:[s.u,s.mask],path:[...s.path,v]});}
   }
   front=next;d++;
  }
  return frames;
 }
 const api={presets,trace};root.VisitCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
