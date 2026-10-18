'use strict';
(function(root){
 function trace(n,k){
  const factorial=[1];for(let m=1;m<=9;m++)factorial[m]=factorial[m-1]*m;
  if(!Number.isInteger(n)||n<1||n>9||!Number.isInteger(k)||k<1||k>factorial[n])throw new RangeError('contract');
  let unused=Array.from({length:n},(_,i)=>String(i+1)),prefix='',r=k-1;
  const frames=[{unused:[...unused],prefix,r,operation:null}];
  for(let m=n;m>0;m--){
   const block=factorial[m-1],q=Math.floor(r/block),before={unused:[...unused],prefix,r},digit=unused[q];
   r%=block;unused.splice(q,1);prefix+=digit;
   frames.push({unused:[...unused],prefix,r,operation:{before,block,q,digit}});
  }
  return {n,k,factorial,frames};
 }
 const api={trace};if(typeof module!=='undefined')module.exports=api;else root.Permutation60=api;
})(globalThis);
