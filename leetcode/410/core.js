'use strict';
(function(root){
 const presets=[{nums:[2,3,4],k:2},{nums:[7,2,5,10,8],k:2},{nums:[1,2,3,4,5],k:2},{nums:[0,0,0],k:2},{nums:[3,1,4],k:1},{nums:[3,1,4],k:3}];
 function scan(nums,cap){
  let groups=[[]],current=0;const frames=[{groups:[],sum:0,event:null}];
  nums.forEach((x,i)=>{const before=current,cut=current+x>cap;if(cut){groups.push([]);current=0;}groups[groups.length-1].push(x);current+=x;
   frames.push({groups:groups.map(g=>g.slice()),sum:current,event:{i,x,before,cut,after:current}});
  });return frames;
 }
 function search(nums,k){
  let lo=Math.max(...nums),hi=nums.reduce((a,b)=>a+b,0);const frames=[{lo,hi,event:null}];
  while(lo<hi){const oldLo=lo,oldHi=hi,mid=Math.floor((lo+hi)/2),groups=scan(nums,mid).at(-1).groups,pass=groups.length<=k;
   if(pass)hi=mid;else lo=mid+1;
   frames.push({lo,hi,event:{oldLo,oldHi,mid,groups,pass}});
  }return frames;
 }
 const api={presets,scan,search};if(typeof module!=='undefined')module.exports=api;else root.SplitArray=api;
})(typeof window==='undefined'?globalThis:window);
