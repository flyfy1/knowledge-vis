'use strict';
(function(root){
 const presets=[[2,1,3],[0,0,0],[1,1,2],[7],[0],[4,2,1]];
 function trace(nums){
  const bits=Math.max(1,Math.floor(Math.log2(Math.max(1,...nums)))+1),size=1<<bits;
  const f=Array(size).fill(0);let g=null,total=0;
  const frames=[];
  const save=event=>frames.push({f:f.slice(),g:g&&g.slice(),total,event});
  save({type:'init'});
  nums.forEach((a,i)=>nums.forEach((b,j)=>{const mask=a&b,old=f[mask];f[mask]++;save({type:'pair',i,j,a,b,mask,old,value:f[mask]});}));
  g=f.slice();save({type:'copy'});
  for(let bit=0;bit<bits;bit++){
   const flag=1<<bit;
   for(let mask=0;mask<size;mask++)if(mask&flag){const source=mask^flag,old=g[mask],add=g[source];g[mask]+=add;save({type:'merge',bit,flag,mask,source,old,add,value:g[mask]});}
  }
  nums.forEach((x,k)=>{const s=(size-1)^x,add=g[s],old=total;total+=add;save({type:'lookup',k,x,s,add,old,value:total});});
  return {nums:nums.slice(),bits,size,frames};
 }
 root.AndTriples={presets,trace};
})(typeof window==='undefined'?globalThis:window);
