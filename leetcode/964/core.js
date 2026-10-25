(function(root){
'use strict';
function trace(x,target){
 let q=target,k=0,p=0,n=0,S=0,power=1;const rows=[];
 while(q){
  const r=q%x; q=Math.floor(q/x);
  const oldP=p,oldN=n;
  const pc=k?[p+r*k,n+(r+1)*k]:[2*r];
  const nc=k?[p+(x-r)*k,n+(x-r-1)*k]:[2*(x-r)];
  p=Math.min(...pc);n=Math.min(...nc);S+=r*power;
  rows.push({k,r,oldP,oldN,pc,nc,p,n,S,power});power*=x;k++;
 }
 return {x,target,rows,answer:Math.min(p,n+k)-1,finalP:p,finalN:n+k};
}
const api={trace};if(typeof module!=='undefined')module.exports=api;else root.LessonCore=api;
})(typeof window==='undefined'?globalThis:window);
