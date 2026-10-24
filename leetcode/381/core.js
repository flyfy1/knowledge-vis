'use strict';
(function(root){
 const presets = [
  [['insert',1],['insert',1],['insert',2],['getRandom',2],['remove',1],['getRandom',0]],
  [['insert',4],['insert',9],['insert',4],['remove',4],['remove',4],['getRandom',0]],
  [['remove',6],['insert',6],['insert',7],['remove',7],['remove',6],['remove',6],['insert',6],['getRandom',0]],
  [['insert',-2147483648],['insert',2147483647],['insert',0],['insert',-2147483648],['remove',0],['remove',-2147483648],['getRandom',0]]
 ];
 function trace(ops){
  const nums=[],pos=new Map();
  const snap=()=>({nums:nums.slice(),pos:[...pos].sort((a,b)=>a[0]-b[0]).map(([v,s])=>[v,[...s].sort((a,b)=>a-b)])});
  const frames=[{before:snap(),after:snap(),kind:'initial'}];
  for(const [op,v] of ops){
   const before=snap();let f={kind:op,v};
   if(op==='insert'){
    f.result=!pos.has(v);f.i=nums.length;
    if(f.result)pos.set(v,new Set());pos.get(v).add(nums.length);nums.push(v);
   }else if(op==='remove'){
    f.result=pos.has(v);
    if(f.result){
     f.i=Math.min(...pos.get(v));f.j=nums.length-1;f.last=nums[f.j];
     pos.get(v).delete(f.i);
     if(f.i!==f.j){nums[f.i]=f.last;pos.get(f.last).delete(f.j);pos.get(f.last).add(f.i);}
     nums.pop();if(!pos.get(v).size)pos.delete(v);
    }
   }else if(op==='getRandom'){
    if(v<0||v>=nums.length)throw new Error('Invalid illustrative slot');
    f.i=v;f.v=nums[v];f.result=nums[v];f.count=pos.get(f.v).size;
   }else throw new Error('Unknown operation');
   frames.push({...f,before,after:snap()});
  }
  return frames;
 }
 root.CollectionLesson={presets,trace};
})(typeof module==='object'?module.exports:window);
