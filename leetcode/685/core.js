(function (root) {
  'use strict';
  const presets = [
    [[1,2],[1,3],[2,3]],
    [[1,2],[2,3],[3,4],[4,1],[1,5]],
    [[2,1],[3,1],[4,2],[1,4]],
    [[1,2],[2,3],[3,1],[3,4]],
    [[1,2],[2,1],[1,3]]
  ];
  function inspect(edges, removed = -1) {
    const n = edges.length, counts = Array(n+1).fill(0), adj = Array.from({length:n+1},()=>[]);
    edges.forEach(([u,v],i)=>{if(i!==removed){counts[v]++;adj[u].push(v);}});
    const roots = Array.from({length:n},(_,i)=>i+1).filter(v=>counts[v]===0);
    const seen = new Set(), stack = roots.length===1 ? [roots[0]] : [];
    while(stack.length){const u=stack.pop();if(seen.has(u))continue;seen.add(u);stack.push(...adj[u]);}
    return {counts:counts.slice(1),roots,reach:seen.size,valid:roots.length===1 && counts.slice(1).every(c=>c<=1) && seen.size===n};
  }
  function trace(edges) {
    const n=edges.length, incoming=Array(n+1).fill(-1), leader=Array.from({length:n+1},(_,i)=>i), size=Array(n+1).fill(1);
    let earlier=-1,later=-1;
    const states=Array(n).fill('pending'), frames=[];
    function find(x){while(x!==leader[x]){leader[x]=leader[leader[x]];x=leader[x];}return x;}
    function groups(){const g=new Map();for(let x=1;x<=n;x++){let a=x;while(a!==leader[a])a=leader[a];if(!g.has(a))g.set(a,[]);g.get(a).push(x);}return [...g.values()].sort((a,b)=>a[0]-b[0]);}
    function save(event, before=groups(), answer=-1){frames.push(JSON.parse(JSON.stringify({event,incoming,earlier,later,leader,size,states,before,groups:groups(),answer})));}
    save({type:'start',phase:'phaseStart'});
    edges.forEach(([u,v],i)=>{
      const duplicate=incoming[v]!==-1;
      if(duplicate){earlier=incoming[v];later=i;}else incoming[v]=i;
      save({type:'scan',phase:'phaseScan',i,duplicate});
    });
    for(let i=0;i<n;i++){
      const before=groups(),[u,v]=edges[i];
      if(i===later){states[i]='skipped';save({type:'skip',phase:'phaseUnion',i},before);continue;}
      let a=find(u),b=find(v);
      if(a===b){
        states[i]='rejected';save({type:'cycle',phase:'phaseUnion',i,a},before);
        const answer=earlier!==-1?earlier:i;
        save({type:'decision',phase:'phaseDone',i:answer,reason:earlier!==-1?'reasonEarlier':'reasonCycle'},groups(),answer);
        return frames;
      }
      const oldA=a,oldB=b;
      if(size[a]<size[b])[a,b]=[b,a];leader[b]=a;size[a]+=size[b];states[i]='kept';
      save({type:'merge',phase:'phaseUnion',i,a:oldA,b:oldB},before);
    }
    save({type:'decision',phase:'phaseDone',i:later,reason:'reasonLater'},groups(),later);
    return frames;
  }
  const api={presets,inspect,trace};
  if(typeof module!=='undefined')module.exports=api;else root.Lesson685=api;
})(typeof window!=='undefined'?window:globalThis);
