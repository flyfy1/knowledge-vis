'use strict';
(function(root){
 const presets=[['4','1000'],['1','2'],['676','676'],['121','121'],['10000','15000'],['100','120']];
 const palindrome=n=>String(n)===String(n).split('').reverse().join('');
 function trace(left,right){
  const low=BigInt(left),high=BigInt(right),rows=[];
  for(const odd of [true,false])for(let seed=1;;seed++){
   const s=String(seed),tail=odd?s.slice(0,-1):s,r=BigInt(s+tail.split('').reverse().join(''));
   if(r*r>high)break;
   const square=r*r;
   rows.push({seed:s,odd,tail,root:String(r),square:String(square),inRange:square>=low,pal:palindrome(square),accept:square>=low&&palindrome(square)});
  }
  rows.sort((a,b)=>BigInt(a.root)<BigInt(b.root)?-1:1);
  return rows.map((r,i)=>({...r,count:rows.slice(0,i+1).filter(x=>x.accept).length}));
 }
 const api={presets,palindrome,trace};if(typeof module!=='undefined')module.exports=api;else root.SuperCore=api;
})(typeof window!=='undefined'?window:globalThis);
