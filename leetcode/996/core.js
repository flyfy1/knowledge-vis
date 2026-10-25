(function(root){
'use strict';
const presets=[[1,17,8],[2,2,2],[0,0,1],[1,1,8,8],[3],[1,2]];
function trace(nums){
 const values=[...new Set(nums)].sort((a,b)=>a-b), counts=values.map(v=>nums.filter(x=>x===v).length);
 const path=[],accepted=[],frames=[];
 const save=(kind,x=null,sum=null)=>frames.push({kind,x,sum,path:[...path],counts:[...counts],accepted:accepted.map(p=>[...p])});
 save('start');
 function dfs(){
  if(path.length===nums.length){accepted.push([...path]);save('accept');return;}
  values.forEach((x,j)=>{
   if(!counts[j])return;
   const sum=path.length?path[path.length-1]+x:null;
   if(sum!==null&&Math.floor(Math.sqrt(sum))**2!==sum){save('reject',x,sum);return;}
   counts[j]--;path.push(x);save('choose',x,sum);dfs();path.pop();counts[j]++;save('undo',x);
  });
 }
 dfs();save('done');return {values,frames};
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Squareful=api;
})(typeof window==='undefined'?globalThis:window);
