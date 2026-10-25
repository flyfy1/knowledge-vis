'use strict';
(function (root) {
  const presets = [[1,2,1], [1,2,2,1,2,2,1], [1,3,2,2,2,3,4,3,1], [1,1,1], [1,2,3], [1]];
  function solver(a) {
    const memo = new Map();
    function dp(l,r,k) {
      if(l>r) return 0;
      const key=[l,r,k].join(',');
      if(memo.has(key)) return memo.get(key);
      let best=dp(l,r-1,0)+(k+1)**2;
      for(let m=l;m<r;m++) if(a[m]===a[r]) best=Math.max(best,dp(m+1,r-1,0)+dp(l,m,k+1));
      memo.set(key,best); return best;
    }
    function candidates(l,r,k) {
      if(l>r) return [];
      const rows=[{m:null, left:dp(l,r-1,0),right:(k+1)**2, terms:`dp(${l},${r-1},0) + ${k+1}²`}];
      for(let m=l;m<r;m++) if(a[m]===a[r]) rows.push({m,left:dp(m+1,r-1,0),right:dp(l,m,k+1),terms:`dp(${m+1},${r-1},0) + dp(${l},${m},${k+1})`});
      rows.forEach(x=>x.value=x.left+x.right); return rows;
    }
    function plan(l,r,extra=[]) {
      if(l>r) return [];
      const rows=candidates(l,r,extra.length), best=rows.reduce((b,x)=>x.value>b.value?x:b,rows[0]);
      if(best.m===null) return [...plan(l,r-1),[r,...extra]];
      return [...plan(best.m+1,r-1),...plan(l,best.m,[r,...extra])];
    }
    return {dp,candidates,plan};
  }
  function trace(a,greedy=false) {
    let live=a.map((value,id)=>({value,id})),total=0;
    const frames=[{live:live.slice(),total,removed:[],gain:0}], moves=greedy?null:solver(a).plan(0,a.length-1);
    let index=0;
    while(live.length) {
      let ids;
      if(greedy) {
        let best=[];
        for(let i=0;i<live.length;) {let j=i+1;while(j<live.length&&live[j].value===live[i].value)j++;
          if(j-i>best.length)best=live.slice(i,j).map(x=>x.id);i=j;}
        ids=best;
      } else ids=moves[index++];
      const removed=live.filter(x=>ids.includes(x.id)), gain=removed.length**2;
      total+=gain; live=live.filter(x=>!ids.includes(x.id));
      frames.push({live:live.slice(),total,removed,gain});
    }
    return frames;
  }
  const api={presets,solver,trace};root.RemoveBoxes=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
