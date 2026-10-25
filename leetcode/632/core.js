(function(root){
 'use strict';
 const presets=[[[1,5],[2,6],[4,7]],[[4,10,15,24,26],[0,9,12,20],[5,18,22,30]],[[1,2,3],[1,2,3],[1,2,3]],[[-5,-1],[-4,0]],[[-2,3,9]],[[1],[10],[20]]];
 function trace(nums){
  const p=nums.map(()=>0),frames=[],ledger=[];let best=null,previous=null;
  while(true){
   const values=nums.map((r,i)=>r[p[i]]),lo=Math.min(...values),hi=Math.max(...values),row=values.indexOf(lo);
   if(!best||hi-lo<best[1]-best[0]||(hi-lo===best[1]-best[0]&&lo<best[0]))best=[lo,hi];
   const done=p[row]+1===nums[row].length;
   ledger.push({lo,hi,best:best.slice(),row,done});
   frames.push({p:p.slice(),values,lo,hi,row,best:best.slice(),done,previous,ledger:ledger.map(r=>({...r,best:r.best.slice()}))});
   if(done)break;
   previous={row,old:values[row],next:nums[row][p[row]+1]};p[row]++;
  }
  return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.RangeCore=api;
})(typeof window==='undefined'?globalThis:window);
