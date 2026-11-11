'use strict';
(function(root){
const presets=[[2,3,1,1,4],[10,13,12,14,15],[5,1,3,4,2],[7],[3,3,3],[1,2,3,4],[4,3,2,1],[0,99999,0]];
function trace(a){
 const n=a.length,up=Array(n).fill(-1),down=Array(n).fill(-1),odd=Array(n).fill(null),even=Array(n).fill(null),frames=[];
 function save(event,extra={}){frames.push({event,up:[...up],down:[...down],odd:[...odd],even:[...even],...extra});}
 save('initial');
 for(const [mode,dir,target] of [['up',1,up],['down',-1,down]]){
  const order=Array.from({length:n},(_,i)=>i).sort((i,j)=>dir*(a[i]-a[j])||i-j),stack=[];
  for(const j of order){const assigned=[];while(stack.length&&stack[stack.length-1]<j){const i=stack.pop();target[i]=j;assigned.push(i);}stack.push(j);save('target',{mode,j,assigned,order:[...order],stack:[...stack]});}
 }
 odd[n-1]=even[n-1]=true;save('base',{i:n-1});
 for(let i=n-2;i>=0;i--){odd[i]=up[i]!==-1&&even[up[i]];even[i]=down[i]!==-1&&odd[down[i]];save('dp',{i});}
 return frames;
}
const api={presets,trace};root.JumpCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
