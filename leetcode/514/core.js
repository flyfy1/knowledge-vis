(function(root){
'use strict';
const presets=[['abc','ca'],['abxxcbx','bc'],['godding','gd'],['godding','godding'],['a','aaa'],['aaaa','aa'],['abcde','e']];
function trace(ring,key){
 const n=ring.length,frames=[{costs:{0:0},candidates:[],done:0}];let previous={0:0};
 for(let k=0;k<key.length;k++){
  const costs={},candidates=[];
  for(let target=0;target<n;target++)if(ring[target]===key[k]){
   costs[target]=Infinity;
   for(const [s,cost] of Object.entries(previous)){
    const source=Number(s),gap=Math.abs(target-source),distance=Math.min(gap,n-gap),total=cost+distance+1;
    candidates.push({source,target,cost,distance,total});costs[target]=Math.min(costs[target],total);
   }
  }
  frames.push({costs,candidates,done:k+1});previous=costs;
 }
 return {ring,key,frames,answer:Math.min(...Object.values(previous))};
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Trail=api;
})(typeof window==='undefined'?globalThis:window);
