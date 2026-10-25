'use strict';
(function(root){
 function trace(input){
  const a=input.slice(),total=a.reduce((s,x)=>s+x,0),target=total/a.length;
  if(total%a.length)return {a,target:null,frames:[{rows:[],balance:0,answer:-1,kind:'impossible'}]};
  let balance=0,answer=0;const rows=[],frames=[{rows:[],balance,answer,kind:'initial'}];
  a.forEach((count,i)=>{const old=balance,d=count-target;balance+=d;answer=Math.max(answer,Math.abs(balance),d);rows.push({i,count,d,old,balance,answer});frames.push({rows:rows.map(r=>({...r})),balance,answer,kind:i===a.length-1?'finished':'partial'});});
  return {a,target,frames};
 }
 const api={trace};if(typeof module!=='undefined')module.exports=api;else root.Washing517=api;
})(typeof window==='undefined'?globalThis:window);
