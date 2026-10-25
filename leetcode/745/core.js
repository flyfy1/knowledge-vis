(function(root){
 'use strict';
 const presets=[
  {words:['ape','apple','ape'],queries:[['ap','e'],['ap','pe'],['app','le'],['z','e']]},
  {words:['ab','ac','db'],queries:[['a','b'],['a','c'],['d','b'],['a','db']]},
  {words:['a','aba','a'],queries:[['a','a'],['aba','aba'],['ab','ba'],['aaaaaaa','a']]},
  {words:['apple'],queries:[['a','e'],['apple','apple'],['a','z']]}
 ];
 const key=(p,s)=>JSON.stringify([p,s]);
 function trace(words){
  const frames=[{k:0,map:{},writes:0}];let map={},writes=0;
  words.forEach((w,i)=>{for(let p=1;p<=w.length;p++)for(let s=1;s<=w.length;s++){map[key(w.slice(0,p),w.slice(-s))]=i;writes++;}frames.push({k:i+1,map:{...map},writes});});
  return frames;
 }
 const api={presets,key,trace};root.PairCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
