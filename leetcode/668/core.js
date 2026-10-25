'use strict';
(function(root){
  const presets=[{m:3,n:3,k:5},{m:2,n:3,k:6},{m:3,n:3,k:4},{m:1,n:7,k:4},{m:1,n:1,k:1},{m:4,n:5,k:1}];
  function counts(m,n,x){return Array.from({length:m},(_,r)=>Math.min(n,Math.floor(x/(r+1))));}
  function trace(m,n,k){
    let lo=1,hi=m*n;
    const frames=[{lo,hi,test:null}];
    while(lo<hi){
      const beforeLo=lo,beforeHi=hi,mid=Math.floor((lo+hi)/2),rows=counts(m,n,mid),count=rows.reduce((a,b)=>a+b,0);
      if(count>=k)hi=mid;else lo=mid+1;
      frames.push({lo,hi,test:{beforeLo,beforeHi,mid,rows,count,enough:count>=k}});
    }
    return frames;
  }
  const api={presets,counts,trace};
  if(typeof module!=='undefined')module.exports=api;else root.TableCore=api;
})(typeof window==='undefined'?globalThis:window);
