'use strict';
(function(root){
  const presets=[[2,2,2,0,1],[1,0,1,1,1],[1,1,1,0,1],[1,3,5],[7,7,7,7,7],[4],[2,1],[0,1,2,0,0],[-1,-1,-5,-3]];
  function trace(nums){
    let l=0,r=nums.length-1;
    const frames=[{l,r,event:null}];
    while(l<r){
      const a=l,b=r,m=Math.floor((l+r)/2),x=nums[m],y=nums[r];
      const branch=x>y?'greater':x<y?'less':'equal';
      if(x>y)l=m+1;else if(x<y)r=m;else r--;
      frames.push({l,r,event:{a,b,m,x,y,branch}});
    }
    return frames;
  }
  const api={presets,trace};
  if(typeof module==='object')module.exports=api;else root.MinimumLesson=api;
})(typeof window==='object'?window:globalThis);
