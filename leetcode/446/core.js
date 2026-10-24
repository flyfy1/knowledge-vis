(function(root){
 'use strict';
 const presets=[[2,4,6],[2,4,6,8,10],[7,7,7,7,7],[3,1,-1,-3],[9],[-2147483648,0,2147483647],[1,2,4],[2,9,4,6]];
 function trace(nums){
  if(!Array.isArray(nums)||nums.length<1||nums.length>5||nums.some(v=>!Number.isInteger(v)||v<-(2**31)||v>2**31-1))throw new Error('Invalid teaching input');
  const dp=nums.map(()=>({}));let answer=0;const frames=[];
  const save=move=>frames.push({dp:dp.map(x=>({...x})),answer,move});save(null);
  for(let i=0;i<nums.length;i++)for(let j=0;j<i;j++){
   const d=nums[i]-nums[j],c=dp[j][d]||0,before=dp[i][d]||0,oldAnswer=answer;
   answer+=c;dp[i][d]=before+c+1;save({i,j,d,c,before,after:dp[i][d],oldAnswer,answer});
  }
  return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.ArithmeticCore=api;
})(typeof window!=='undefined'?window:globalThis);
