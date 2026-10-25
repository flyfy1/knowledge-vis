(function(root){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const presets=[
    {grid:[[1,0,0,0],[1,1,1,0]],hits:[[1,0]]},
    {grid:[[1,0,0,0],[1,1,0,0]],hits:[[1,1],[1,0]]},
    {grid:[[1,0,1],[1,1,1]],hits:[[1,1],[1,0]]},
    {grid:[[1,0,0,0],[1,1,1,0]],hits:[[1,0],[1,2]]},
    {grid:[[1,0]],hits:[[0,1],[0,0]]}
  ];
  function stable(grid){
    const m=grid.length,n=grid[0].length,seen=grid.map(row=>row.map(()=>false)),todo=[];
    for(let c=0;c<n;c++)if(grid[0][c]){seen[0][c]=true;todo.push([0,c]);}
    for(let k=0;k<todo.length;k++){
      const [r,c]=todo[k];
      for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
        const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<m&&nc>=0&&nc<n&&grid[nr][nc]&&!seen[nr][nc]){seen[nr][nc]=true;todo.push([nr,nc]);}
      }
    }
    return {seen,size:todo.length+1};
  }
  function trace(input){
    const grid=clone(input.grid),hits=clone(input.hits),work=clone(grid),answer=hits.map(()=>null),frames=[];
    hits.forEach(([r,c])=>work[r][c]=0);
    function save(event,before){const after={grid:clone(work),...stable(work)};frames.push(clone({event,before:before||after,after,answer}));}
    save(null);
    for(let i=hits.length-1;i>=0;i--){
      const [r,c]=hits[i],before={grid:clone(work),...stable(work)},empty=!grid[r][c];
      if(!empty)work[r][c]=1;
      const after=stable(work);answer[i]=empty?0:Math.max(0,after.size-before.size-1);
      save({i,r,c,empty,old:before.size,now:after.size,fall:answer[i]},before);
    }
    return {grid,hits,frames};
  }
  const api={presets,stable,trace};
  if(typeof module!=='undefined')module.exports=api;else root.BricksCore=api;
})(typeof window!=='undefined'?window:globalThis);
