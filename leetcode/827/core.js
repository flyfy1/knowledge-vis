(function(root){
'use strict';
const presets=[[[1,0],[0,1]],[[1,1],[1,0]],[[1,1],[1,1]],[[0,0],[0,0]],[[1,1,1],[1,0,1],[1,1,1]],[[1,1,0],[1,0,0],[0,0,0]],[[0]],[[1]]];
const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
function trace(grid){
 const n=grid.length,labels=grid.map(row=>row.map(()=>0)),area={0:0},frames=[],history=[];
 let best=0,id=2;
 const save=(kind,event)=>frames.push(JSON.parse(JSON.stringify({kind,event,labels,area,best,history})));
 save('start',null);
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(grid[r][c]&&!labels[r][c]){
  const stack=[[r,c]];labels[r][c]=id;let size=0;
  while(stack.length){const [x,y]=stack.pop();size++;for(const [dx,dy] of dirs){const a=x+dx,b=y+dy;if(a>=0&&a<n&&b>=0&&b<n&&grid[a][b]&&!labels[a][b]){labels[a][b]=id;stack.push([a,b]);}}}
  area[id]=size;best=Math.max(best,size);save('label',{id,size});id++;
 }
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!grid[r][c]){
  const raw=[];for(const [dx,dy] of dirs){const a=r+dx,b=c+dy;if(a>=0&&a<n&&b>=0&&b<n&&labels[a][b])raw.push(labels[a][b]);}
  const ids=[...new Set(raw)].sort((a,b)=>a-b),parts=ids.map(k=>area[k]),value=1+parts.reduce((a,b)=>a+b,0);
  best=Math.max(best,value);const e={r,c,raw,ids,parts,value};history.push(e);save('test',e);
 }
 save('done',null);return frames;
}
function largest(grid){return trace(grid).at(-1).best;}
const api={presets,trace,largest};if(typeof module!=='undefined')module.exports=api;else root.IslandCore=api;
})(typeof window==='undefined'?globalThis:window);
