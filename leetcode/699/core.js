'use strict';
(function(root){
  const presets = [
    [[1,2],[2,2],[5,1]],
    [[1,2],[2,3],[6,1]],
    [[100,100],[200,100]],
    [[1,3],[5,2],[3,4],[4,1]],
    [[2,2],[2,2],[2,2]],
    [[1,1]]
  ];
  function trace(positions){
    const frames=[],landed=[],answer=[];let highest=0;
    const save=f=>frames.push(JSON.parse(JSON.stringify({...f,landed,answer,highest})));
    for(let i=0;i<positions.length;i++){
      const [left,side]=positions[i],right=left+side;let base=0;const checks=[];
      save({phase:'ready',i,left,right,side,base,checks});
      for(let j=0;j<landed.length;j++){
        const old=landed[j],lo=Math.max(left,old.left),hi=Math.min(right,old.right),overlap=lo<hi,before=base;
        if(overlap)base=Math.max(base,old.top);
        checks.push({j,lo,hi,overlap,before,after:base,top:old.top});
        save({phase:'check',i,left,right,side,base,checks});
      }
      const top=base+side;landed.push({left,right,side,base,top});highest=Math.max(highest,top);answer.push(highest);
      save({phase:'land',i,left,right,side,base,top,checks});
    }
    return frames;
  }
  const api={presets,trace};root.Lesson699=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
