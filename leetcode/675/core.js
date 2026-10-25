'use strict';
(function(root){
const presets=[[[1,3,2]],[[1,0,2],[1,0,1],[3,1,1]],[[1,2,3],[0,0,0],[7,6,5]],[[2]],[[1,4,2],[1,0,1],[3,1,1]],[[0,2]]];
function trace(grid){
 const m=grid.length,n=grid[0].length,trees=[];
 grid.forEach((row,r)=>row.forEach((h,c)=>{if(h>1)trees.push([h,r,c]);}));trees.sort((a,b)=>a[0]-b[0]);
 let total=0,ledger=[],cut=[],frames=[],start=[0,0];
 function snap(kind,dist,front,target,depth){frames.push(JSON.parse(JSON.stringify({kind,dist,front,target,depth,total,ledger,cut,start,trees})));}
 for(const target of trees){
  const dist=Array.from({length:m},()=>Array(n).fill(null));
  if(grid[start[0]][start[1]]===0){snap('blocked',dist,[],target,0);return frames;}
  let front=[start.slice()],depth=0;dist[start[0]][start[1]]=0;snap('init',dist,front,target,depth);
  while(dist[target[1]][target[2]]===null&&front.length){
   const next=[];
   for(const [r,c] of front)for(const [nr,nc] of [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]){
    if(nr>=0&&nr<m&&nc>=0&&nc<n&&grid[nr][nc]>0&&dist[nr][nc]===null){dist[nr][nc]=depth+1;next.push([nr,nc]);}
   }
   front=next;depth++;snap('layer',dist,front,target,depth);
  }
  const d=dist[target[1]][target[2]];
  if(d===null){snap('unreachable',dist,[],target,depth);return frames;}
  const before=total;total+=d;ledger.push({height:target[0],from:start.slice(),to:target.slice(1),distance:d,before,total});cut.push(target[0]);start=target.slice(1);
  snap(cut.length===trees.length?'done':'cut',dist,front,target,depth);
 }
 return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.ForestCore=api;
})(typeof window==='undefined'?globalThis:window);
