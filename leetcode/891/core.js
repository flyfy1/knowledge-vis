'use strict';
(function(root){
  const presets = [[2,1,3],[1,1,3],[2],[4,4,4],[3,2,1],[1,2,4,5]];
  function trace(nums) {
    const a = [...nums].sort((x,y)=>x-y);
    let sum=0;
    const rows=a.map((value,i)=>{
      const maxCount=2**i,minCount=2**(a.length-1-i),before=sum;
      const delta=value*(maxCount-minCount); sum+=delta;
      return {i,value,maxCount,minCount,before,delta,after:sum};
    });
    return {a,rows,result:((sum%1000000007)+1000000007)%1000000007};
  }
  function groups(a,i,isMax) {
    const eligible=Array.from({length:a.length},(_,j)=>j).filter(j=>isMax?j<i:j>i);
    let subsets=[[]];
    for(const j of eligible) subsets=subsets.concat(subsets.map(s=>[...s,j]));
    return subsets.map(s=>[...s,i].sort((x,y)=>x-y));
  }
  const api={presets,trace,groups};
  if(typeof module!=='undefined') module.exports=api;
  else root.WidthCore=api;
})(typeof window!=='undefined'?window:globalThis);
