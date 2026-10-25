'use strict';
(function(root){
 const presets=[[[1,1],[1,1]],[[0,1,-1],[1,0,-1],[1,1,1]],[[1,1,-1],[1,-1,1],[-1,1,1]],[[1,1,-1],[-1,1,-1],[-1,1,1]],[[1]],[[0]],[[0,0,1,1],[1,0,1,0],[1,1,1,1],[1,1,0,1]]];
 function trace(grid){
  const n=grid.length,frames=[];let previous=null;
  for(let t=0;t<=2*n-2;t++){
   const states=Array.from({length:n},()=>Array(n).fill(null));
   for(let r1=0;r1<n;r1++)for(let r2=0;r2<n;r2++){
    const c1=t-r1,c2=t-r2;
    const valid=c1>=0&&c1<n&&c2>=0&&c2<n&&grid[r1][c1]!==-1&&grid[r2][c2]!==-1;
    let candidates=[],best=null,paths=null,gain=null,value=null;
    if(valid){
     gain=grid[r1][c1]+(r1===r2?0:grid[r2][c2]);
     if(t===0){value=gain;paths=[[[0,0]],[[0,0]]];}
     else{
      for(const p1 of [r1,r1-1])for(const p2 of [r2,r2-1]){
       const old=previous[p1]?.[p2];const v=old?.value??null;
       candidates.push({p1,p2,value:v});
       if(v!==null&&(best===null||v>best.value)){best={p1,p2,value:v};paths=[old.paths[0].concat([[r1,c1]]),old.paths[1].concat([[r2,c2]])];}
      }
      if(best!==null)value=best.value+gain;
     }
    }
    states[r1][r2]={r1,r2,c1,c2,valid,gain,candidates,best,value,paths};
   }
   let selected=[0,0],max=null;
   for(const row of states)for(const s of row)if(s.value!==null&&(max===null||s.value>max)){max=s.value;selected=[s.r1,s.r2];}
   frames.push({t,states,selected,max});previous=states;
  }
  return frames;
 }
 const api={presets,trace};root.Lesson741=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
