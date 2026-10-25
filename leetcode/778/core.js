'use strict';
(function(root){
  const presets=[[[0,2],[1,3]],[[0,1,8],[2,7,6],[3,4,5]],[[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]],[[0]],[[3,1],[2,0]]];
  function trace(grid){
    const n=grid.length,dist=Array.from({length:n},()=>Array(n).fill(Infinity)),settled=Array.from({length:n},()=>Array(n).fill(false));
    const queue=[[grid[0][0],0,0]],frames=[];dist[0][0]=grid[0][0];
    const cmp=(a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2];
    function save(event,done=false){frames.push({dist:dist.map(r=>r.slice()),settled:settled.map(r=>r.slice()),queue:queue.map(r=>r.slice()).sort(cmp),event,done});}
    save(null);
    while(queue.length){
      queue.sort(cmp);const [cost,r,c]=queue.shift();if(cost!==dist[r][c])continue;
      settled[r][c]=true;const event={cost,r,c,checks:[]};
      if(r===n-1&&c===n-1){save(event,true);break;}
      for(const [dr,dc] of [[-1,0],[0,-1],[0,1],[1,0]]){
        const nr=r+dr,nc=c+dc;if(nr<0||nc<0||nr>=n||nc>=n)continue;
        const old=dist[nr][nc],h=grid[nr][nc],candidate=Math.max(cost,h),improved=candidate<old;
        event.checks.push({r:nr,c:nc,old,h,candidate,improved});
        if(improved){dist[nr][nc]=candidate;queue.push([candidate,nr,nc]);}
      }
      save(event);
    }
    return {grid:grid.map(r=>r.slice()),frames,result:frames.at(-1).event.cost};
  }
  const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.SwimCore=api;
})(typeof window==='undefined'?globalThis:window);
