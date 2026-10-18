'use strict';
(function(root){
 const presets=[[[ -2,-3],[-5,10]],[[-2,-3,3],[-5,-10,1],[10,30,-5]],[[0]],[[8]],[[-8]],[[-3,5,-7]],[[2],[-4],[0]],[[0,-9,20],[-2,0,0]]];
 function trace(grid){
  const m=grid.length,n=grid[0].length,needs=grid.map(row=>row.map(()=>null)),frames=[{needs:needs.map(row=>row.slice()),event:null}];
  for(let r=m-1;r>=0;r--)for(let c=n-1;c>=0;c--){
   const down=r+1<m?needs[r+1][c]:Infinity,right=c+1<n?needs[r][c+1]:Infinity;
   const target=r===m-1&&c===n-1?1:Math.min(down,right);
   needs[r][c]=Math.max(1,target-grid[r][c]);
   frames.push({needs:needs.map(row=>row.slice()),event:{r,c,down,right,target,value:grid[r][c],need:needs[r][c]}});
  }
  return frames;
 }
 root.DungeonLesson={presets,trace};
})(typeof window==='undefined'?globalThis:window);
