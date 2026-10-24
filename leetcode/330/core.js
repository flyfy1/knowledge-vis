(function(root){
'use strict';
const presets=[{nums:[1,3],n:6},{nums:[1,5,10],n:20},{nums:[1,2,2],n:5},{nums:[2],n:8},{nums:[1],n:1},{nums:[10000],n:2147483647}];
function sums(items){let map=new Map([[0,[]]]);for(const x of items){for(const [s,w] of [...map])if(!map.has(s+x))map.set(s+x,[...w,x]);}return map;}
function trace(nums,n){let miss=1,i=0,patches=0,ledger=[];const frames=[{miss,i,patches,ledger:[],kind:'start'}];while(miss<=n){const before=miss,patch=!(i<nums.length&&nums[i]<=miss),x=patch?miss:nums[i];if(patch)patches++;else i++;miss+=x;ledger=[...ledger,{before,x,after:miss,patch,i,patches}];frames.push({miss,i,patches,kind:patch?'patch':'consume',x,before,ledger:ledger.map(r=>({...r}))});}return frames;}
const api={presets,sums,trace};if(typeof module!=='undefined')module.exports=api;else root.PatchingCore=api;
})(typeof window==='undefined'?globalThis:window);
