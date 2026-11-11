'use strict';
(function(root){
// Teaching model for #1063. The browser runs this JavaScript; it is not the Python submission.
const presets=[[1,4,2,5,3],[3,2,1],[2,2,2],[1,2,3,4,5],[2,5,3,5,1,4]];
const LIMITS={minLength:1,maxLength:10,maxValue:99};
// Literal definition: is nums[i] <= every element of nums[i..j]? Returns the first breaker index or -1.
function breaker(nums,i,j){for(let x=i+1;x<=j;x++)if(nums[x]<nums[i])return x;return -1;}
function valid(nums,i,j){return breaker(nums,i,j)===-1;}
function bruteCount(nums){let c=0;for(let i=0;i<nums.length;i++)for(let j=i;j<nums.length;j++)if(valid(nums,i,j))c++;return c;}
// First strictly smaller element to the right of start i (or n): row i is valid exactly for ends i..next-1.
function firstSmaller(nums,i){for(let x=i+1;x<nums.length;x++)if(nums[x]<nums[i])return x;return nums.length;}
function parse(text){
 const parts=String(text).split(/[\s,，]+/).filter(Boolean);
 if(!parts.every(p=>/^\d+$/.test(p)))return {ok:false,error:'errNumbers'};
 const nums=parts.map(Number);
 if(nums.length<LIMITS.minLength||nums.length>LIMITS.maxLength)return {ok:false,error:'errCount'};
 if(nums.some(v=>v>LIMITS.maxValue))return {ok:false,error:'errRange'};
 return {ok:true,nums};
}
// One frame per arriving element. rule 'gt' pops tops larger than the value (correct);
// rule 'ge' also pops equal tops (the tempting mistake), so the lesson can show it undercounting.
function trace(nums,rule='gt'){
 const frames=[],stack=[],died=nums.map(()=>null),counts=[];let total=0;
 const save=extra=>frames.push(JSON.parse(JSON.stringify({nums,rule,stack,died,counts,total,...extra})));
 save({type:'start',j:-1});
 nums.forEach((v,j)=>{
  const before=stack.slice(),popped=[],totalBefore=total;
  while(stack.length&&(rule==='ge'?nums[stack.at(-1)]>=v:nums[stack.at(-1)]>v)){const i=stack.pop();popped.push(i);died[i]=j;}
  stack.push(j);const count=stack.length;total+=count;counts.push(count);
  save({type:'arrive',j,value:v,before,popped,count,totalBefore});
 });
 save({type:'stop',j:nums.length,result:total,brute:bruteCount(nums)});
 return frames;
}
const api={presets,LIMITS,breaker,valid,bruteCount,firstSmaller,parse,trace};
root.ValidCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
