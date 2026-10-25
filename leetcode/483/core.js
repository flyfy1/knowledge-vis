'use strict';
(function(root){
function trace(input){
 const N=BigInt(input),L=N.toString(2).length,frames=[];let history=[];
 function save(f){frames.push({...f,history:history.map(r=>({...r}))});}
 save({kind:'start',m:L-1,lo:2n,hi:1n<<BigInt(Math.ceil(L/(L-1)))});
 for(let m=L-1;m>=2;m--){
  let lo=2n,hi=1n<<BigInt(Math.ceil(L/m));
  while(lo<=hi){
   const beforeLo=lo,beforeHi=hi,k=(lo+hi)/2n;let total=1n;const terms=[1n];
   for(let j=0;j<m;j++){total=total*k+1n;terms.push(total);if(total>N)break;}
   const kind=total===N?'equal':total<N?'low':'high';
   if(kind==='low')lo=k+1n;else if(kind==='high')hi=k-1n;
   const row={m,beforeLo,beforeHi,k,total,lo,hi,kind,terms};history.push(row);save(row);
   if(kind==='equal')return {N,L,frames,answer:k};
  }
 }
 save({kind:'fallback',m:1,lo:0n,hi:0n,answer:N-1n});return {N,L,frames,answer:N-1n};
}
root.Base483={trace};if(typeof module!=='undefined')module.exports=root.Base483;
})(typeof window==='undefined'?globalThis:window);
