'use strict';
(function(root){
 const presets=[{prices:[2,5,1,4],k:2},{prices:[2,5,1,4],k:1},{prices:[2,4,1],k:2},{prices:[3,2,6,5,0,3],k:2},{prices:[1,3,2,4,3,5],k:2},{prices:[5,4,3,2],k:3},{prices:[0],k:1},{prices:[2,2,2],k:3}];
 function trace({prices,k}){
  let cash=Array(k+1).fill(0),hold=Array(k+1).fill(-Infinity);
  const frames=[{price:null,values:Array.from({length:k},(_,i)=>[hold[i+1],cash[i+1]]).flat()}];
  for(const price of prices){
   const oldCash=cash.slice(),oldHold=hold.slice(),old=[],candidates=[],values=[];
   for(let t=1;t<=k;t++){
    const buy=oldCash[t-1]-price,sell=oldHold[t]+price;
    hold[t]=Math.max(oldHold[t],buy);cash[t]=Math.max(oldCash[t],sell);
    old.push(oldHold[t],oldCash[t]);candidates.push(buy,sell);values.push(hold[t],cash[t]);
   }
   frames.push({price,old,candidates,values,oldCash,oldHold});
  }
  return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.StockCore=api;
})(typeof window==='undefined'?globalThis:window);
