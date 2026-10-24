(() => {
  'use strict';
  function brute(nums) { return nums.map((x,i)=>nums.slice(i+1).filter(y=>y<x).length); }
  function trace(nums) {
    const out=Array(nums.length).fill(null), suffix=[];
    return nums.map((_, idx)=>idx).reverse().map(i=>{
      const x=nums[i], smaller=suffix.filter(v=>v<x).length;
      const before=suffix.slice(); suffix.push(x); suffix.sort((a,b)=>a-b); out[i]=smaller;
      return {i,x,smaller,before:before.slice(),after:suffix.slice(),out:out.slice()};
    });
  }
  function bitTrace(nums) {
    const values=[...new Set(nums)].sort((a,b)=>a-b), rank=new Map(values.map((v,i)=>[v,i+1]));
    const bit=Array(values.length+1).fill(0), frames=[];
    const add=(r)=>{const touched=[];for(let x=r;x<bit.length;x+=x&-x){bit[x]++;touched.push(x)}return touched};
    const sum=(r)=>{let s=0;const touched=[];for(let x=r;x;x-=x&-x){s+=bit[x];touched.push(x)}return {s,touched}};
    const answer=Array(nums.length).fill(null);
    for(let i=nums.length-1;i>=0;i--){const r=rank.get(nums[i]), q=sum(r-1);answer[i]=q.s;frames.push({i,x:nums[i],r,q:q.s,query:q.touched,updates:add(r),bit:bit.slice(),answer:answer.slice()});}
    return {values,frames};
  }
  window.CountSmallerCore={brute,trace,bitTrace};
})();
