(function(root){
'use strict';
const zeros=x=>{let n=0;while(x){x=Math.floor(x/5);n+=x;}return n;};
function trace(k){
 const frames=[],history=[];let left=null;
 for(let phase=0;phase<2;phase++){
  const target=k+phase;let lo=0,hi=5*(target+1);
  frames.push({phase,target,lo,hi,left,history:history.slice(),row:null});
  while(lo<hi){
   const before=[lo,hi],mid=Math.floor((lo+hi)/2),z=zeros(mid);
   if(z<target)lo=mid+1;else hi=mid;
   const row={phase,target,before,mid,z,lo,hi};history.push(row);
   frames.push({phase,target,lo,hi,left,history:history.slice(),row});
  }
  if(phase===0)left=lo;
 }
 const f=frames[frames.length-1];f.result=f.lo-left;return frames;
}
const api={zeros,trace,presets:[0,3,5,6,24,1000000000]};
if(typeof module==='object')module.exports=api;else root.FZFCore=api;
})(typeof window==='object'?window:globalThis);
