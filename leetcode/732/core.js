'use strict';
(function(root){
const presets=[[[2,5],[4,7],[5,6]],[[10,20],[50,60],[10,40],[5,15],[5,10],[25,55]],[[1,3],[3,5]],[[2,6],[2,6],[2,6]],[[0,1000000000],[1,999999999],[3,4]]];
function trace(input){
 const frames=[],delta=new Map(),bookings=[],history=[];
 function save(phase,rows,scanned,active,best,change){frames.push(JSON.parse(JSON.stringify({phase,rows,scanned,active,best,change,bookings,history})));}
 save('empty',[],0,0,0,null);
 for(const [l,r] of input){
  const oldL=delta.get(l)||0,oldR=delta.get(r)||0;
  bookings.push([l,r]);delta.set(l,oldL+1);delta.set(r,oldR-1);
  const rows=[...delta].sort((a,b)=>a[0]-b[0]).map(([x,d])=>({x,d}));
  const change={l,r,oldL,oldR,newL:oldL+1,newR:oldR-1};
  save('update',rows,0,0,0,change);
  let active=0,best=0;
  rows.forEach((row,i)=>{active+=row.d;best=Math.max(best,active);row.active=active;row.best=best;
   if(i===rows.length-1)history.push({l,r,k:best});
   save(i===rows.length-1?'return':'scan',rows,i+1,active,best,change);
  });
 }
 return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.CalendarCore=api;
})(typeof window==='undefined'?globalThis:window);
