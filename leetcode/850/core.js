(function(root){
 'use strict';
 const presets=[[[0,0,2,2],[1,0,3,1]],[[0,0,2,2],[1,0,2,3],[1,0,3,1]],[[0,0,2,1],[0,3,2,4]],[[0,0,2,2],[0,0,2,2]],[[0,0,1,2],[1,0,2,2]],[[0,0,1,1],[3,0,4,1]]];
 function trace(rects){
  const xs=[...new Set(rects.flatMap(r=>[r[0],r[2]]))].sort((a,b)=>a-b);
  const frames=[{rows:[],area:0}];let area=0;const rows=[];
  for(let i=0;i+1<xs.length;i++){
   const left=xs[i],right=xs[i+1];
   const raw=rects.filter(r=>r[0]<=left&&right<=r[2]).map(r=>[r[1],r[3]]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
   const merged=[];
   for(const [lo,hi] of raw){const last=merged[merged.length-1];if(!last||lo>last[1])merged.push([lo,hi]);else last[1]=Math.max(last[1],hi);}
   const height=merged.reduce((s,[lo,hi])=>s+hi-lo,0),delta=(right-left)*height,before=area;area+=delta;
   rows.push({left,right,height,delta,area});
   frames.push({left,right,raw,merged,height,delta,before,area,rows:rows.map(r=>({...r}))});
  }return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Rect850=api;
})(typeof window==='undefined'?globalThis:window);
