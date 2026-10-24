/* Teaching simulation only. The official submission is solution.py. */
(function(root){
  'use strict';
  const presets=[
    {nums:[1,8,3],k:2,t:2},
    {nums:[1,8,3],k:1,t:2},
    {nums:[1,8,2],k:2,t:2},
    {nums:[1,2,3,1],k:3,t:0},
    {nums:[1,5,9,1,5,9],k:2,t:3},
    {nums:[-4,5,-1],k:2,t:3},
    {nums:[0,5],k:1,t:3},
    {nums:[-1000000000,1000000000],k:1,t:1000000000}
  ];
  function trace({nums,k,t}){
    const width=t+1,map=new Map(),frames=[],history=[];
    function save(phase,i,extra={}){
      if(phase!=='start')history.push({phase,i,...extra});
      frames.push(JSON.parse(JSON.stringify({phase,i,width,nums,k,t,entries:[...map].map(([b,e])=>({b,...e})),history,...extra})));
    }
    save('start',-1);
    for(let i=0;i<nums.length;i++){
      const x=nums[i],b=Math.floor(x/width),expired=i>k?i-k-1:null;
      if(expired!==null)map.delete(Math.floor(nums[expired]/width));
      save('expire',i,{expired,b});
      const probes=[];let pair=null;
      for(const key of [b,b-1,b+1]){
        const e=map.get(key),diff=e?Math.abs(x-e.x):null,hit=!!e&&diff<=t;
        probes.push({b:key,j:e?e.j:null,x:e?e.x:null,diff,hit});
        if(hit){pair=[e.j,i];break;}
      }
      save('probe',i,{b,probes,pair,done:!!pair,result:pair?true:null});
      if(pair)return frames;
      map.set(b,{x,j:i});save('insert',i,{b});
    }
    save('end',nums.length-1,{done:true,result:false});return frames;
  }
  const api={presets,trace};root.BucketLesson=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
