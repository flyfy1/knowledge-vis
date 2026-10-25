'use strict';
(function(root){
 const presets=[1,2,3,4,6,10];
 function trace(n){
  const frames=[{day:0,counts:[1,0,0,0,0,0],incoming:Array.from({length:6},()=>[])}];
  for(let day=1;day<=n;day++){
   const old=frames[day-1].counts,counts=Array(6).fill(0),incoming=Array.from({length:6},()=>[]);
   for(let a=0;a<2;a++)for(let l=0;l<3;l++){
    const from=a*3+l,v=old[from];
    const add=(to,letter)=>{counts[to]+=v;incoming[to].push({from,letter,count:v});};
    add(a*3,'P');if(a===0)add(3,'A');if(l<2)add(from+1,'L');
   }
   frames.push({day,counts,incoming});
  }
  return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Attendance=api;
})(typeof window!=='undefined'?window:globalThis);
