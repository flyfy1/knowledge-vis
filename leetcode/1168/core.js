(function(){
 const presets=[
  {n:3,wells:[1,2,2],pipes:[[1,2,1],[2,3,1]]},
  {n:4,wells:[5,1,4,2],pipes:[[1,2,3],[2,3,1],[3,4,1],[1,4,6],[2,4,2]]},
  {n:2,wells:[1,1],pipes:[[1,2,1],[1,2,2]]}
 ];
 function makeEdges(x){return x.wells.map((c,i)=>({u:0,v:i+1,w:c,kind:'well'})).concat(x.pipes.map(p=>({u:p[0],v:p[1],w:p[2],kind:'pipe'}))).sort((a,b)=>a.w-b.w||a.u-b.u||a.v-b.v)}
 function trace(x){const es=makeEdges(x), parent=Array.from({length:x.n+1},(_,i)=>i), rank=Array(x.n+1).fill(0), frames=[{i:0,cost:0,accepted:[],components:x.n+1,current:null,done:false}];
  const find=a=>{while(parent[a]!==a){parent[a]=parent[parent[a]];a=parent[a]}return a};
  es.forEach((e,idx)=>{const before=frames[frames.length-1];let ru=find(e.u),rv=find(e.v),take=ru!==rv; if(take){if(rank[ru]<rank[rv])[ru,rv]=[rv,ru];parent[rv]=ru;if(rank[ru]===rank[rv])rank[ru]++;} frames.push({i:idx+1,cost:before.cost+(take?e.w:0),accepted:take?before.accepted.concat([e]):before.accepted.slice(),components:before.components-(take?1:0),current:{...e,take},done:false});});
  frames[frames.length-1].done=true; return {input:x,edges:es,frames,result:frames.at(-1).cost}; }
 window.WaterCore={presets,trace};
})();
