'use strict';
(function(root){
 const presets=[[[4,4],[2,5],[2,6]],[[100,200],[200,1300],[1000,1250],[2000,3200]],[[1,2]],[[3,2],[4,3]],[[2,2],[2,2],[1,4],[1,4]]];
 function trace(input){
  const order=input.map(([d,last],id)=>({d,last,id})).sort((a,b)=>a.last-b.last||a.id-b.id);
  let kept=[],total=0,ledger=[];
  const frames=[];
  function save(k){frames.push(JSON.parse(JSON.stringify({order,kept,total,ledger,k})));}
  save(0);
  order.forEach((c,i)=>{
   const before=total; kept.push(c.id);total+=c.d;const trial=total;
   let removed=null;
   if(total>c.last){removed=kept.reduce((best,id)=>input[id][0]>input[best][0]?id:best,kept[0]);kept=kept.filter(id=>id!==removed);total-=input[removed][0];}
   ledger.push({id:c.id,d:c.d,last:c.last,before,trial,removed,total});save(i+1);
  });
  return frames;
 }
 const api={presets,trace};root.CourseCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
