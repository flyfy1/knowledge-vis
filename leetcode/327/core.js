(function(root){
'use strict';
const presets=[{nums:[-2,5,-1],lower:-2,upper:2},{nums:[0],lower:0,upper:0},{nums:[0,0,0],lower:0,upper:0},{nums:[1,-1],lower:-1,upper:-1},{nums:[2147483647,-2147483648],lower:-1,upper:-1}];
function prefix(nums){const p=[0];for(const x of nums)p.push(p.at(-1)+x);return p;}
function intervals(nums,lower,upper){const rows=[];for(let i=0;i<nums.length;i++){let sum=0;for(let j=i;j<nums.length;j++){sum+=nums[j];rows.push({i,j,sum,valid:lower<=sum&&sum<=upper});}}return rows;}
function trace(nums,lower,upper){
 const p=prefix(nums),frames=[],ledger=[];let total=0;
 function save(frame){frames.push(JSON.parse(JSON.stringify({...frame,total,ledger})));}
 save({kind:'start',p});
 function solve(lo,hi){if(hi-lo<=1)return p.slice(lo,hi);const mid=(lo+hi)>>1;
 const left=solve(lo,mid),right=solve(mid,hi);let k=0,l=0;
 for(let leftIndex=0;leftIndex<left.length;leftIndex++){const x=left[leftIndex];const beforeK=k,beforeL=l;while(k<right.length&&right[k]-x<lower)k++;while(l<right.length&&right[l]-x<=upper)l++;
 const add=l-k;total+=add;ledger.push({lo,mid,hi,x,k,l,add});save({kind:'count',lo,mid,hi,left,right,x,leftIndex,k,l,beforeK,beforeL,add});}
 const merged=[];let a=0,b=0;while(a<left.length&&b<right.length)merged.push(left[a]<=right[b]?left[a++]:right[b++]);merged.push(...left.slice(a),...right.slice(b));
 save({kind:'merge',lo,mid,hi,left,right,merged});return merged;
 }
 const sorted=solve(0,p.length);save({kind:'done',sorted});return frames;
}
const api={presets,prefix,intervals,trace};if(typeof module!=='undefined')module.exports=api;else root.RangeCore=api;
})(typeof window!=='undefined'?window:globalThis);
