'use strict';
(function(root){
 const presets=[{nums:[2,1,4,1,3],k:1},{nums:[1,2,1,2,6,7,5,1],k:2},{nums:[1,2,1,2,1,2,1,2,1],k:2},{nums:[5,5,5],k:1},{nums:[1,9,9,1,1,1],k:2}];
 function trace({nums,k}){
  const m=nums.length-k+1,w=Array.from({length:m},(_,i)=>nums.slice(i,i+k).reduce((a,b)=>a+b,0));
  const left=Array(m).fill(null),right=Array(m).fill(null),frames=[],ledger=[];
  let best=null,bestSum=null;
  function save(kind,i,old=null){frames.push(JSON.parse(JSON.stringify({kind,i,old,w,left,right,ledger,best,bestSum})));}
  save('init',null);
  for(let i=0;i<m;i++){const old=i?left[i-1]:null;left[i]=old===null||w[i]>w[old]?i:old;save('left',i,old);}
  for(let i=m-1;i>=0;i--){const old=i<m-1?right[i+1]:null;right[i]=old===null||w[i]>=w[old]?i:old;save('right',i,old);}
  for(let j=k;j<m-k;j++){
   const candidate=[left[j-k],j,right[j+k]],total=candidate.reduce((s,i)=>s+w[i],0);
   const earlier=best===null||candidate.some((v,i)=>v!==best[i]&&candidate.slice(0,i).every((x,h)=>x===best[h])&&v<best[i]);
   const update=best===null||total>bestSum||(total===bestSum&&earlier);
   if(update){best=candidate.slice();bestSum=total;}
   ledger.push({j,candidate,total,update,best:best.slice(),bestSum});save('middle',j);
  }
  return frames;
 }
 const api={presets,trace};root.ThreeCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
