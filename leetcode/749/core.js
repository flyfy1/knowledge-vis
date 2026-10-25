'use strict';
(function(root){
 const dirs=[[1,0],[-1,0],[0,1],[0,-1]],clone=x=>JSON.parse(JSON.stringify(x));
 const presets=[[[1,0,0,1,1,0]],[[0,1,0,0,0,0,0,1],[0,1,0,0,0,0,0,1],[0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0]],[[1,1,1],[1,0,1],[1,1,1]],[[1,1,1,0,0,0,0,0,0],[1,0,1,0,1,1,1,1,1],[1,1,1,0,0,0,0,0,0]],[[0]],[[1]],[[1,0,0,0]]];
 function scan(g){const m=g.length,n=g[0].length,seen=new Set(),regions=[];
  for(let r=0;r<m;r++)for(let c=0;c<n;c++){
   const id=r*n+c;if(g[r][c]!==1||seen.has(id))continue;
   const cells=[],frontier=new Set(),edges=[],stack=[id];seen.add(id);
   while(stack.length){const u=stack.pop(),x=Math.floor(u/n),y=u%n;cells.push(u);
    for(const [dx,dy]of dirs){const a=x+dx,b=y+dy,v=a*n+b;if(a<0||a>=m||b<0||b>=n)continue;
     if(g[a][b]===0){frontier.add(v);edges.push([u,v]);}
     else if(g[a][b]===1&&!seen.has(v)){seen.add(v);stack.push(v);}
    }
   }regions.push({cells:cells.sort((a,b)=>a-b),frontier:[...frontier].sort((a,b)=>a-b),edges});
  }return regions;
 }
 function trace(input){const g=clone(input),frames=[],walls=[],ledger=[];let total=0,day=1;
  function save(phase,before,regions,chosen){frames.push(clone({phase,day,before,grid:g,regions,chosen,walls,total,ledger}));}
  while(true){const before=clone(g),regions=scan(g);let chosen=-1;
   regions.forEach((r,i)=>{if(chosen<0||r.frontier.length>regions[chosen].frontier.length)chosen=i;});
   if(chosen<0||regions[chosen].frontier.length===0){save('done',before,regions,-1);break;}
   save('inspect',before,regions,chosen);
   const q=regions[chosen];total+=q.edges.length;walls.push(...q.edges);ledger.push({day,region:chosen,walls:q.edges.length,total});
   for(const u of q.cells)g[Math.floor(u/g[0].length)][u%g[0].length]=-1;
   save('quarantine',before,regions,chosen);
   regions.forEach((r,i)=>{if(i!==chosen)for(const u of r.frontier)g[Math.floor(u/g[0].length)][u%g[0].length]=1;});
   save('spread',before,regions,chosen);day++;
  }return frames;
 }
 const api={scan,trace,presets};root.Lesson749=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
