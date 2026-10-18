(function(root){
'use strict';
const presets=[[2,1,2],[2,1,5,6,2,3],[2,4],[2,2,2],[0,0],[1,2,3,4],[4,3,2,1],[0],[10000]];
function interval(a,l,r){const height=Math.min(...a.slice(l,r+1));return {height,width:r-l+1,area:height*(r-l+1)};}
function trace(a){
 if(!Array.isArray(a)||a.length<1||a.length>12||a.some(x=>!Number.isInteger(x)||x<0||x>10000))throw new RangeError('teaching input');
 a=a.slice();const stack=[],ledger=[],frames=[];let best=0;
 const save=(type,i,before,j=null,left=null)=>frames.push({type,i,current:i<a.length?a[i]:-1,before:before.slice(),stack:stack.slice(),j,left,best,ledger:ledger.map(x=>({...x}))});
 save('start',0,[]);
 for(let i=0;i<=a.length;i++){
  const current=i<a.length?a[i]:-1;
  while(stack.length&&a[stack[stack.length-1]]>current){
   const before=stack.slice(),j=stack.pop(),left=stack.length?stack[stack.length-1]:-1,width=i-left-1,area=a[j]*width;
   best=Math.max(best,area);ledger.push({i,j,left,width,height:a[j],area,best});save('pop',i,before,j,left);
  }
  if(i<a.length){const before=stack.slice();stack.push(i);save('push',i,before);}else save('done',i,stack);
 }
 return {a,frames,best};
}
const api={presets,interval,trace};if(typeof module!=='undefined')module.exports=api;root.Histogram84=api;
})(typeof window==='undefined'?globalThis:window);
