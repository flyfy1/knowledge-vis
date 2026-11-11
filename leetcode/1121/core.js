'use strict';
(function(root){
const presets=[
 {nums:[1,1,2,2,3,4],k:3},
 {nums:[1,1,1,2,3,4,5,6],k:3},
 {nums:[1,2,2,2,3,3,4,5,6],k:3},
 {nums:[2,2,2,2],k:1},
 {nums:[3,5,7,9],k:4},
 {nums:[7],k:1}
];
const LIMITS={maxLen:24,maxValue:99};
const clone=x=>JSON.parse(JSON.stringify(x));
function check(nums,k){
 if(!Array.isArray(nums)||nums.length<1||nums.length>LIMITS.maxLen)return 'length';
 if(nums.some(v=>!Number.isInteger(v)||v<1||v>LIMITS.maxValue))return 'value';
 for(let i=1;i<nums.length;i++)if(nums[i]<nums[i-1])return 'sorted';
 if(!Number.isInteger(k)||k<1||k>nums.length)return 'k';
 return null;
}
// Greedy wrong turn from step 2: repeatedly peel off the longest strictly increasing chain (all distinct values).
function greedyLongest(nums,k){
 const left=nums.slice(),chains=[];
 while(left.length){const chain=[];for(let i=0;i<left.length;i++)if(!chain.length||left[i]>chain.at(-1)){chain.push(left[i]);left.splice(i,1);i--;}chains.push(chain);}
 return {chains,ok:chains.every(c=>c.length>=k)};
}
// Frames: deep snapshots after each completed action.
function trace(nums,k){
 const bad=check(nums,k);if(bad)throw new RangeError('invalid input: '+bad);
 const n=nums.length,frames=[];let run=0,most=0,mostValue=null,piles=null,f=null;
 const push=(event,extra={})=>frames.push(clone({event,run,most,mostValue,piles,n,k,nums,...extra}));
 push({type:'start'});
 for(let i=0;i<n;i++){
  run=i>0&&nums[i]===nums[i-1]?run+1:1;
  const grew=run>most;if(grew){most=run;mostValue=nums[i];}
  push({type:'count',i,value:nums[i],grew});
 }
 f=most;const need=f*k,ok=need<=n;
 push({type:'bound',f,need,ok});
 piles=Array.from({length:f},()=>[]);
 for(let i=0;i<n;i++){const p=i%f;piles[p].push(nums[i]);push({type:'deal',i,value:nums[i],pile:p});}
 const lengths=piles.map(p=>p.length),increasing=piles.every(p=>p.every((v,j)=>j===0||v>p[j-1]));
 push({type:'final',f,need,ok,lengths,shortest:Math.min(...lengths),increasing},{answer:ok});
 return frames;
}
function solve(nums,k){return trace(nums,k).at(-1).answer;}
const api={presets,LIMITS,check,greedyLongest,trace,solve};
root.DivideCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
