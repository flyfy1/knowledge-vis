'use strict';
(function(root){
const presets=[{matrix:[[1,0,1],[0,-2,3]],k:2},{matrix:[[2,2,-1]],k:3},{matrix:[[-3,-2],[-4,-1]],k:-2},{matrix:[[0,0],[0,0]],k:0},{matrix:[[2],[2],[-1]],k:3}];
function trace(matrix,k,top,bottom){
 const sums=matrix[0].map((_,c)=>matrix.slice(top,bottom+1).reduce((s,row)=>s+row[c],0));
 const frames=[{prefix:0,seen:[0],best:null,history:[]}];let prefix=0,seen=[0],best=null,history=[];
 sums.forEach((value,col)=>{prefix+=value;const before=seen.slice(),eligible=seen.filter(q=>q>=prefix-k),q=eligible.length?eligible[0]:null,candidate=q===null?null:prefix-q;
 if(candidate!==null)best=best===null?candidate:Math.max(best,candidate);
 seen.push(prefix);seen.sort((a,b)=>a-b);
 history.push({col,value,prefix,threshold:prefix-k,before,eligible,q,candidate,best});
 frames.push({prefix,seen:seen.slice(),best,history:JSON.parse(JSON.stringify(history))});});
 return {sums,frames};
}
const api={presets,trace};root.RectLesson=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
