'use strict';
(function(root){
 const presets=[[1,3,2,3,1],[2,4,3,5,1],[4,2,1],[-5,-5],[1],[2147483647,-2147483648,0]];
 function pairs(a){const out=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)out.push({i,j,x:a[i],y:a[j],yes:a[i]>2*a[j]});return out;}
 function trace(input){
  const a=input.slice(),frames=[],ledger=[];let total=0;
  const save=f=>frames.push(JSON.parse(JSON.stringify({...f,total,ledger})));
  save({kind:'start'});
  function rec(lo,hi){if(hi-lo<=1)return;const mid=(lo+hi)>>1;rec(lo,mid);rec(mid,hi);
   const left=a.slice(lo,mid),right=a.slice(mid,hi);let q=0;
   left.forEach((x,i)=>{const before=q;while(q<right.length&&x>2*right[q])q++;total+=q;const row={lo,mid,hi,x,q,add:q};ledger.push(row);save({kind:'count',...row,left,right,i,before});});
   const merged=[...left,...right].sort((x,y)=>x-y);a.splice(lo,hi-lo,...merged);save({kind:'merge',lo,mid,hi,left,right,merged});
  }rec(0,a.length);save({kind:'done',sorted:a});return frames;
 }
 const api={presets,pairs,trace};if(typeof module!=='undefined')module.exports=api;else root.ReverseCore=api;
})(typeof window==='undefined'?globalThis:window);
