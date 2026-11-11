'use strict';
(function(root){
 const presets=[{n:2,goal:3,k:1},{n:2,goal:3,k:0},{n:3,goal:3,k:1},{n:3,goal:5,k:2},{n:1,goal:4,k:0},{n:4,goal:4,k:0}];
 function trace({n,goal,k}){
  const table=Array.from({length:goal+1},()=>Array(n+1).fill(null));
  table[0].fill(0);table[0][0]=1;
  for(let i=1;i<=goal;i++)table[i][0]=0;
  const frames=[{table:table.map(r=>r.slice()),i:0,j:0}];
  for(let i=1;i<=goal;i++)for(let j=1;j<=n;j++){
   const a=table[i-1][j-1],b=table[i-1][j],x=n-j+1,y=Math.max(j-k,0);
   table[i][j]=a*x+b*y;
   frames.push({table:table.map(r=>r.slice()),i,j,a,b,x,y,newCount:a*x,replayCount:b*y,value:table[i][j]});
  }
  return {n,goal,k,frames};
 }
 const api={presets,trace};root.PlaylistCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
