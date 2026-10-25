'use strict';
(function(root){
 const presets=[[[0,4,3,4],[0,2,5,6]],[[1,3,5,4],[1,2,3,7]],[[0,3,5,8,9],[2,1,4,6,9]],[[1,2],[1,2]],[[1,1],[0,2]]];
 function orient(a,b,mask){const x=a.map((v,i)=>mask&(1<<i)?b[i]:v),y=b.map((v,i)=>mask&(1<<i)?a[i]:v);return {x,y,cost:mask.toString(2).replace(/0/g,'').length,valid:x.every((v,i)=>!i||(x[i-1]<v&&y[i-1]<y[i]))};}
 function trace(a,b){
  const frames=[{i:0,k:0,w:1,oldK:null,oldW:null,s:null,c:null}];
  for(let i=1;i<a.length;i++){
   const old=frames.at(-1),s=a[i-1]<a[i]&&b[i-1]<b[i],c=a[i-1]<b[i]&&b[i-1]<a[i];
   frames.push({i,oldK:old.k,oldW:old.w,s,c,k:Math.min(s?old.k:Infinity,c?old.w:Infinity),w:Math.min(s?old.w+1:Infinity,c?old.k+1:Infinity)});
  }return frames;
 }
 const api={presets,orient,trace};root.Swaps=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
