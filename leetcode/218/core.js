(function(root){
'use strict';
const presets = [
 [[1,5,3],[2,4,5]],
 [[0,2,3],[2,5,3]],
 [[1,3,4],[5,7,2]],
 [[1,8,9],[2,4,3],[3,6,5]],
 [[1,4,4],[1,4,4],[1,3,7]],
 [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]
];
const less=(a,b)=>a[0]<b[0] || (a[0]===b[0] && a[1]<b[1]);
function push(h,v){h.push(v);let k=h.length-1;while(k){const p=(k-1)>>1;if(!less(h[k],h[p]))break;[h[k],h[p]]=[h[p],h[k]];k=p;}}
function pop(h){const top=h[0],v=h.pop();if(h.length){h[0]=v;let k=0;while(true){let c=2*k+1;if(c>=h.length)break;if(c+1<h.length&&less(h[c+1],h[c]))c++;if(!less(h[c],h[k]))break;[h[c],h[k]]=[h[k],h[c]];k=c;}}return top;}
function trace(buildings){
 const xs=[...new Set(buildings.flatMap(b=>b.slice(0,2)))].sort((a,b)=>a-b);
 const heap=[],answer=[],frames=[];let i=0,old=0;
 const snap=(x,ops)=>({x,i,heap:heap.map(v=>v.slice()),answer:answer.map(v=>v.slice()),old,height:heap.length?-heap[0][0]:0,ops:ops.map(v=>({...v}))});
 frames.push(snap(null,[]));
 for(const x of xs){const ops=[];
  while(i<buildings.length&&buildings[i][0]<=x){const b=buildings[i];push(heap,[-b[2],b[1]]);ops.push({kind:'push',id:i+1,height:b[2],right:b[1]});i++;}
  while(heap.length&&heap[0][1]<=x){const v=pop(heap);ops.push({kind:'pop',height:-v[0],right:v[1]});}
  const height=heap.length?-heap[0][0]:0;
  if(!answer.length||answer[answer.length-1][1]!==height)answer.push([x,height]);
  frames.push(snap(x,ops));old=height;
 }
 return frames;
}
const api={presets,trace,less};if(typeof module!=='undefined')module.exports=api;else root.Skyline=api;
})(typeof window!=='undefined'?window:globalThis);
