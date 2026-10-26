'use strict';
(function(root){
const presets=[
 {a:[1,4,2],target:2,key:'tiny'},
 {a:[1,2,3,4,5,3,1],target:3,key:'official1'},
 {a:[0,1,2,4,2,1],target:3,key:'official2'},
 {a:[1,5,4,3,2],target:3,key:'right'},
 {a:[0,2,4,6,8,1],target:8,key:'peak'},
 {a:[0,5,4,2,1],target:0,key:'first'},
 {a:[2,4,7,9,0],target:0,key:'last'}
];
function trace(a,target){
 const frames=[];let calls=0,history=[],peak=null;
 function save(phase,lo,hi,event,reads=[],result=null){frames.push({phase,lo,hi,event,reads:reads.map(i=>({i,value:a[i]})),calls,peak,result,history:history.map(x=>({...x,reads:x.reads.map(y=>({...y}))}))});}
 function compare(phase,lo,hi,oldLo,oldHi,mid,reads,rule){calls+=reads.length;history.push({phase,oldLo,oldHi,lo,hi,mid,rule,reads:reads.map(i=>({i,value:a[i]})),calls});save(phase,lo,hi,rule,reads);}
 let lo=0,hi=a.length-1;save('peak',lo,hi,'start');
 while(lo<hi){const oldLo=lo,oldHi=hi,mid=Math.floor((lo+hi)/2),rising=a[mid]<a[mid+1];if(rising)lo=mid+1;else hi=mid;compare('peak',lo,hi,oldLo,oldHi,mid,[mid,mid+1],rising?'rise':'fall');}
 peak=lo;save('up',0,peak,'peakFound');
 for(const phase of ['up','down']){
  lo=phase==='up'?0:peak+1;hi=phase==='up'?peak:a.length-1;
  if(phase==='down')save(phase,lo,hi,'leftAbsent');
  while(lo<=hi){const oldLo=lo,oldHi=hi,mid=Math.floor((lo+hi)/2),v=a[mid];if(v===target){compare(phase,lo,hi,oldLo,oldHi,mid,[mid],'equal');save('done',lo,hi,'found',[],mid);return frames;}
   const keepRight=phase==='up'?v<target:v>target;
   if(keepRight)lo=mid+1;else hi=mid-1;
   compare(phase,lo,hi,oldLo,oldHi,mid,[mid],keepRight?'rightHalf':'leftHalf');
  }
 }
 save('done',lo,hi,'absent',[],-1);return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.MountainLesson=api;
})(typeof window==='undefined'?globalThis:window);
