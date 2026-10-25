'use strict';
(function(root){
  const presets=[
    {nums:[1,2,1],k:2},
    {nums:[1,2,1,2,3],k:2},
    {nums:[1,2,1,3,4],k:3},
    {nums:[1,1,1],k:1},
    {nums:[1,2,3],k:2},
    {nums:[1],k:1},
    {nums:[1,1,1],k:3}
  ];
  function trace(nums,k){
    const windows=[{left:0,freq:{}},{left:0,freq:{}}],frames=[{r:-1,windows:windows.map(w=>({left:w.left,freq:{},removed:[],before:0,distinct:0,count:0})),total:0,delta:0}];
    let total=0;
    nums.forEach((value,r)=>{
      const snap=windows.map((w,i)=>{
        const before=w.left,removed=[];
        w.freq[value]=(w.freq[value]||0)+1;
        const distinct=Object.keys(w.freq).length;
        while(Object.keys(w.freq).length>k-i){
          const x=nums[w.left];w.freq[x]--;removed.push({index:w.left,value:x,remaining:w.freq[x]});
          if(w.freq[x]===0)delete w.freq[x];w.left++;
        }
        return {left:w.left,freq:{...w.freq},removed,before,distinct,count:r-w.left+1};
      });
      const delta=snap[1].left-snap[0].left;total+=delta;
      frames.push({r,windows:snap,total,delta});
    });return frames;
  }
  const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.LessonCore=api;
})(typeof window!=='undefined'?window:globalThis);
