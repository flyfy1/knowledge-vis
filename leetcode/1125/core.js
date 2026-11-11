'use strict';
(function(root){
 const presets=[
  {skills:['a','b','c'],people:[['a'],['b'],['b','c']]},
  {skills:['java','nodejs','reactjs'],people:[['java'],['nodejs'],['nodejs','reactjs']]},
  {skills:['a','b'],people:[[],['a'],['a'],['b']]},
  {skills:['a','b','c'],people:[['a','b','c'],['a'],[]]},
  {skills:['a','b','c','d','e','f'],people:[['a','b','c','d'],['a','b','e'],['c','d','f']]},
  {skills:['algorithms','math','java','reactjs','csharp','aws'],people:[['algorithms','math','java'],['algorithms','math','reactjs'],['java','csharp','aws'],['reactjs','csharp'],['csharp','math'],['aws','java']]},
  {skills:['a'],people:[[],['a'],['a']]},
  {skills:['a','b'],people:[['a'],['b'],['a','b']]}
 ];
 function trace(skills,people){
  const masks=people.map(p=>p.reduce((v,s)=>v|(1<<skills.indexOf(s)),0));
  let dp={0:[]};const clone=x=>JSON.parse(JSON.stringify(x));
  const frames=[{done:0,before:{},after:clone(dp),events:[]}];
  masks.forEach((person,i)=>{
   const before=clone(dp),events=[];
   Object.entries(before).forEach(([key,team])=>{
    const mask=Number(key),merged=mask|person,candidate=team.concat(i),old=dp[merged]===undefined?null:dp[merged].slice();
    const accept=old===null||candidate.length<old.length;
    if(accept)dp[merged]=candidate;
    events.push({mask,merged,candidate,old,accept});
   });
   frames.push({done:i+1,before,after:clone(dp),events});
  });
  return {skills,people,masks,full:(1<<skills.length)-1,frames};
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.TeamCore=api;
})(typeof window==='undefined'?globalThis:window);
