'use strict';
(function(root){
 function trace(n){
  const d=n.length,h=Math.ceil(d/2),p=BigInt(n.slice(0,h)),x=BigInt(n),rows=[];
  for(const delta of [-1n,0n,1n]){
   const q=p+delta,s=String(q);
   if(q<0n||s.length!==h||(d>1&&s[0]==='0'))continue;
   const tail=d%2?s.slice(0,-1):s;
   rows.push({kind:'mirror',q:s,value:BigInt(s+Array.from(tail).reverse().join(''))});
  }
  rows.push({kind:'lower',value:10n**BigInt(d-1)-1n},{kind:'upper',value:10n**BigInt(d)+1n});
  let best=null;
  const frames=[{best:null,current:null}];
  for(const row of rows){
   row.distance=row.value>x?row.value-x:x-row.value;
   row.excluded=row.value===x;
   if(!row.excluded&&(best===null||row.distance<(best>x?best-x:x-best)||(row.distance===(best>x?best-x:x-best)&&row.value<best)))best=row.value;
   frames.push({best,current:row});
  }
  return {n,d,h,p:String(p),rows,frames};
 }
 const api={trace};if(typeof module!=='undefined')module.exports=api;else root.Palindrome=api;
})(typeof window!=='undefined'?window:globalThis);
