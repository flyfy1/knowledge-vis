'use strict';
(function(root){
 function make(n,edges,initial){const graph=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));for(const[a,b]of edges)graph[a][b]=graph[b][a]=1;return{graph,initial};}
 const presets=[
  make(3,[[0,1],[1,2]],[0,1]),
  make(3,[[0,1]],[0,1]),
  make(4,[[0,1],[1,2],[2,3]],[0,1]),
  make(5,[[0,2],[2,3],[1,3],[1,4]],[0,1]),
  make(5,[[0,2],[0,3],[2,3],[1,4]],[0,1]),
  make(4,[],[2,0]),
  make(4,[[0,1],[1,2],[2,3]],[2]),
  make(4,[[0,2],[1,3]],[1,0])
 ];
 function spread(graph,initial,removed){
  let seen=new Set(initial.filter(x=>x!==removed));const frames=[[...seen].sort((a,b)=>a-b)];
  while(true){const next=new Set(seen);for(const a of seen)for(let b=0;b<graph.length;b++)if(b!==removed&&graph[a][b])next.add(b);if(next.size===seen.size)break;seen=next;frames.push([...seen].sort((a,b)=>a-b));}
  return frames;
 }
 function summarize(graph,initial){
  const infected=new Set(initial),component=Array(graph.length).fill(-1),groups=[],saved=Array(graph.length).fill(0);let total=initial.length;
  for(let start=0;start<graph.length;start++){
   if(infected.has(start)||component[start]!==-1)continue;
   const id=groups.length,stack=[start],members=[],boundary=new Set();component[start]=id;
   while(stack.length){const a=stack.pop();members.push(a);for(let b=0;b<graph.length;b++)if(graph[a][b]){if(infected.has(b))boundary.add(b);else if(component[b]===-1){component[b]=id;stack.push(b);}}}
   const seeds=[...boundary].sort((a,b)=>a-b);members.sort((a,b)=>a-b);groups.push({members,seeds});
   if(seeds.length)total+=members.length;if(seeds.length===1)saved[seeds[0]]+=members.length;
  }
  return{groups,component,total,scores:initial.map(node=>({node,saved:saved[node],final:total-1-saved[node]}))};
 }
 function scan(scores){const frames=[{answer:null,best:0}];let answer=null,best=-1;for(const s of scores){if(s.saved>best||(s.saved===best&&s.node<answer)){answer=s.node;best=s.saved;}frames.push({answer,best});}return frames;}
 const api={make,presets,spread,summarize,scan};root.Malware=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
