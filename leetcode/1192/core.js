'use strict';
window.BridgeCore = (() => {
  const presets = [
    {n:4, edges:[[0,1],[1,2],[2,0],[1,3]]},
    {n:5, edges:[[0,1],[1,2],[2,0],[1,3],[3,4]]},
    {n:4, edges:[[0,1],[1,2],[2,3]]},
    {n:6, edges:[[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]}
  ];
  function trace(input){
    const n=input.n, edges=input.edges, adj=Array.from({length:n},()=>[]);
    edges.forEach(([a,b],id)=>{adj[a].push([b,id]);adj[b].push([a,id]);});
    const tin=Array(n).fill(-1),low=Array(n).fill(-1), bridges=[], frames=[];let timer=0;
    const snap=(kind,extra={})=>frames.push({kind,tin:[...tin],low:[...low],bridges:bridges.map(x=>[...x]),...extra});
    snap('start',{u:null,v:null,edge:null});
    function dfs(u,parentEdge){
      tin[u]=low[u]=timer++; snap('discover',{u,v:null,edge:null});
      for(const [v,id] of adj[u]){
        if(id===parentEdge) continue;
        if(tin[v]!==-1){ const before=low[u]; low[u]=Math.min(low[u],tin[v]); snap('back',{u,v,edge:id,before,after:low[u]}); }
        else { snap('tree',{u,v,edge:id}); dfs(v,id); const before=low[u]; low[u]=Math.min(low[u],low[v]); snap('return',{u,v,edge:id,before,after:low[u]}); if(low[v]>tin[u]){bridges.push([u,v]);snap('bridge',{u,v,edge:id});} }
      }
    }
    for(let u=0;u<n;u++) if(tin[u]===-1) dfs(u,-1);
    snap('done',{u:null,v:null,edge:null});
    return frames;
  }
  return {presets,trace};
})();
