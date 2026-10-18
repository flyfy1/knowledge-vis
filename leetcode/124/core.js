'use strict';
(function(root){
 const presets=[[1,2,3],[-10,9,20,null,null,15,7],[-3,-2,-5],[10,2,null,4,3],[0,0,0],[2,-4,null,6]];
 function trace(values){
  const gains={},rows=[],frames=[{gains:{},rows:[],best:null,current:null}];let best=-Infinity;
  function visit(i){if(values[i]===undefined||values[i]===null)return 0;const rawL=visit(2*i+1),rawR=visit(2*i+2),left=Math.max(0,rawL),right=Math.max(0,rawR),through=values[i]+left+right,gain=values[i]+Math.max(left,right);best=Math.max(best,through);gains[i]=gain;rows.push({i,value:values[i],rawL,rawR,left,right,through,gain,best});frames.push({gains:{...gains},rows:rows.map(r=>({...r})),best,current:i});return gain;}
  visit(0);return frames;
 }
 const api={presets,trace};root.PathCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
