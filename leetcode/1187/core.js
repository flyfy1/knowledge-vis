'use strict';
window.ArrayIncreasingCore = (() => {
  const presets = [
    {a:[1,5,3,6,7], b:[1,3,2,4]},
    {a:[1,5,3,6,7], b:[4,3,1]},
    {a:[1,5,3,6,7], b:[1,6,3,3]},
    {a:[3,2,1], b:[1,2,3,4]}
  ];
  const brute = (a,b) => {
    const n=a.length; let best=Infinity;
    function go(i,prev,cost){
      if(cost>=best) return;
      if(i===n){best=cost;return;}
      if(a[i]>prev) go(i+1,a[i],cost);
      for(const x of b) if(x>prev) go(i+1,x,cost+1);
    }
    go(0,-Infinity,0); return best===Infinity?-1:best;
  };
  function trace(a,b){
    const sorted=[...new Set(b)].sort((x,y)=>x-y), frames=[{i:0,states:[{v:'−∞',c:0}],choice:'start'}];
    let states=new Map([[-Infinity,0]]);
    for(let i=0;i<a.length;i++){
      const next=new Map(), moves=[];
      const put=(v,c,kind,from)=>{if(!next.has(v)||c<next.get(v)){next.set(v,c);moves.push({from, v, c, kind});}};
      for(const [prev,cost] of states){
        if(a[i]>prev) put(a[i],cost,'keep',prev);
        const j=sorted.findIndex(x=>x>prev);
        if(j>=0) put(sorted[j],cost+1,'replace',prev);
      }
      states=next;
      frames.push({i:i+1,states:[...states].sort((x,y)=>x[0]-y[0]).map(([v,c])=>({v:v===-Infinity?'−∞':v,c})),moves, value:a[i]});
    }
    return {sorted,frames,answer:states.size?Math.min(...states.values()):-1};
  }
  return {presets,brute,trace};
})();
