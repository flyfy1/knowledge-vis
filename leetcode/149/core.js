'use strict';
(function(root){
  const presets=[
    [[0,0],[2,1],[4,2],[1,3]],
    [[1,1],[2,2],[3,3]],
    [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]],
    [[0,0],[-2,-1],[2,1],[0,-2],[0,2]],
    [[0,0],[1,1],[0,1],[1,2]],
    [[0,2],[2,2],[4,2],[1,0]],
    [[-2,3]]
  ];
  function gcd(a,b){while(b){const r=a%b;a=b;b=r;}return a;}
  function direction(a,b){
    let dx=b[0]-a[0],dy=b[1]-a[1];
    const rawDx=dx,rawDy=dy,g=gcd(Math.abs(dx),Math.abs(dy));
    if(!g)throw new Error('Distinct points required');
    dx/=g;dy/=g;
    if(dx<0||(dx===0&&dy<0)){dx=-dx;dy=-dy;}
    return {dx:rawDx,dy:rawDy,g,key:`${dy},${dx}`};
  }
  function trace(points){
    const frames=[],completed=[];let best=1;
    for(let i=0;i<points.length;i++){
      const buckets={},log=[];
      function save(kind,event){frames.push(JSON.parse(JSON.stringify({points,i,kind,event,buckets,log,completed,best,local:1+Math.max(0,...Object.values(buckets).map(a=>a.length))})));}
      if(i===points.length-1)completed.push({i,local:1});
      save('start',null);
      for(let j=i+1;j<points.length;j++){
        const d=direction(points[i],points[j]),before=(buckets[d.key]||[]).length;
        (buckets[d.key] ||= []).push(j);
        const event={j,...d,before,after:before+1};log.push(event);
        best=Math.max(best,before+2);
        if(j===points.length-1)completed.push({i,local:1+Math.max(...Object.values(buckets).map(a=>a.length))});
        save('pair',event);
      }
    }
    return frames;
  }
  const api={presets,direction,trace};
  if(typeof module!=='undefined')module.exports=api;
  else root.LineLesson=api;
})(typeof window==='undefined'?globalThis:window);
