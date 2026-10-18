(function(root){
 'use strict';
 const presets=[[3,2,1],[1,3,2,1],[1,0,2],[1,2,2],[2],[2,2,2,2]];
 function trace(ratings){
  if(!Array.isArray(ratings)||ratings.length<1||ratings.length>6||ratings.some(x=>!Number.isInteger(x)||x<0||x>50000))throw new Error('Invalid teaching input');
  const n=ratings.length,L=Array(n).fill(1),R=Array(n).fill(1),C=Array(n).fill(null),frames=[];
  const push=(phase,i,previous=null)=>frames.push({phase,i,previous,L:L.slice(),R:R.slice(),C:C.slice()});
  push('seed',null);
  for(let i=1;i<n;i++){const old=L[i];if(ratings[i]>ratings[i-1])L[i]=L[i-1]+1;push('left',i,old);}
  for(let i=n-2;i>=0;i--){const old=R[i];if(ratings[i]>ratings[i+1])R[i]=R[i+1]+1;push('right',i,old);}
  for(let i=0;i<n;i++){C[i]=Math.max(L[i],R[i]);push('merge',i);}
  return frames;
 }
 const api={presets,trace};if(typeof module==='object')module.exports=api;else root.CandyCore=api;
})(typeof window==='object'?window:globalThis);
