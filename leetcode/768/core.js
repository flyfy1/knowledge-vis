'use strict';
(function(root){
 const presets=[[2,1,3],[5,4,3,2,1],[2,1,3,4,4],[4,4,4],[0]];
 function partition(a,mask){
  const chunks=[];let start=0;
  for(let i=0;i<a.length;i++)if(i===a.length-1||(mask&(1<<i))){chunks.push(a.slice(start,i+1));start=i+1;}
  const sorted=chunks.map(c=>c.slice().sort((a,b)=>a-b)),joined=sorted.flat();
  return {chunks,sorted,joined,valid:joined.every((x,i)=>!i||joined[i-1]<=x)};
 }
 function trace(a){
  if(!a.length||a.length>8)throw Error('Teaching trace needs 1..8 values');
  const frames=[],suffix=Array(a.length).fill(null),cuts=[];let left=null;
  function save(op,i=-1){frames.push({op,i,a:a.slice(),suffix:suffix.slice(),left,cuts:cuts.map(c=>({...c})),safe:cuts.filter(c=>c.safe).length});}
  save('initial');
  for(let i=a.length-1;i>=0;i--){suffix[i]=i===a.length-1?a[i]:Math.min(a[i],suffix[i+1]);save(i===a.length-1?'suffixLast':'suffixBuild',i);}
  for(let i=0;i<a.length-1;i++){
   left=i===0?a[0]:Math.max(left,a[i]);
   cuts.push({i,left,right:suffix[i+1],safe:left<=suffix[i+1]});save('cut',i);
  }
  return frames;
 }
 const api={presets,partition,trace};if(typeof module!=='undefined')module.exports=api;root.Chunks=api;
})(typeof window==='undefined'?globalThis:window);
