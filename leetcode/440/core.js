'use strict';
(function(root){
 const presets=[{n:23,k:14},{n:13,k:2},{n:13,k:6},{n:1,k:1},{n:100,k:10},{n:1000000000,k:1000000000}];
 function levels(n,p){
  const out=[];let first=p,stop=p+1,d=0;
  while(first<=n){const clipped=Math.min(n+1,stop);out.push({d,first,stop,clipped,count:clipped-first});first*=10;stop*=10;d++;}
  return out;
 }
 function trace(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<1||k>n||n>1e9)throw new RangeError('1 <= k <= n <= 10^9');
  const frames=[];let p=1,r=k-1,move=null;
  while(true){
   const rows=levels(n,p),size=rows.reduce((s,x)=>s+x.count,0);
   frames.push({p,r,size,rows,move});
   if(r===0)return frames;
   const beforeP=p,beforeR=r;
   if(size<=r){p++;r-=size;move={kind:'skip',beforeP,beforeR,size,p,r};}
   else{p*=10;r--;move={kind:'descend',beforeP,beforeR,size,p,r};}
  }
 }
 const api={presets,levels,trace};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.PrefixCore=api;
})(typeof window!=='undefined'?window:globalThis);
