(function(root){
'use strict';
const presets=[[0,1,2,3,6],[0,1,3,5,6,8,12,17],[0,1,2,3,4,8,9,11],[0,2],[0,1],[0,1,3,6,10,15]];
function trace(stones){
 const r=Object.fromEntries(stones.map(x=>[x,[]]));r[0]=[0];
 const frames=[{r:structuredClone(r),x:null,k:null,candidates:[]}];
 for(const x of stones)for(const k of [...r[x]].sort((a,b)=>a-b)){
  const candidates=[];
  for(const jump of [k-1,k,k+1]){
   const target=x+jump;
   let reason=jump<=0?'nonpositive':!(target in r)?'water':r[target].includes(jump)?'duplicate':'added';
   if(reason==='added'){r[target].push(jump);r[target].sort((a,b)=>a-b);}
   candidates.push({jump,target,reason});
  }
  frames.push({r:structuredClone(r),x,k,candidates});
 }
 return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.FrogCore=api;
})(typeof window==='undefined'?globalThis:window);
