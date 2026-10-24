(function(root){
'use strict';
function trace(matrix){
 const m=matrix.length,n=matrix[0].length,dirs=[[1,0],[-1,0],[0,1],[0,-1]];
 const neighbors=(r,c)=>dirs.map(([dr,dc])=>[r+dr,c+dc]).filter(([a,b])=>a>=0&&a<m&&b>=0&&b<n);
 const out=matrix.map((row,r)=>row.map((v,c)=>neighbors(r,c).filter(([a,b])=>matrix[a][b]>v).length));
 const lengths=matrix.map(row=>row.map(()=>0));let ready=[];const frames=[],history=[];
 out.forEach((row,r)=>row.forEach((v,c)=>{if(v===0)ready.push([r,c]);}));
 const snap=()=>frames.push(JSON.parse(JSON.stringify({round:history.length,out,lengths,ready,history})));
 snap();while(ready.length){const batch=ready;ready=[];const changes=[];const round=history.length+1;
 for(const [r,c] of batch){lengths[r][c]=round;for(const [a,b] of neighbors(r,c)){if(matrix[a][b]<matrix[r][c]){const before=out[a][b];out[a][b]--;changes.push({from:[r,c],to:[a,b],before,after:out[a][b]});if(out[a][b]===0)ready.push([a,b]);}}}
 history.push({round,cells:batch,changes});snap();}return frames;
}
const presets=[[[1,2],[4,3]],[[9,9,4],[6,6,8],[2,1,1]],[[3,4,5],[3,2,6],[2,2,1]],[[1,9,10],[2,3,4]],[[7,7],[7,7]],[[0]]];
const api={trace,presets};if(typeof module!=='undefined')module.exports=api;else root.LIP=api;
})(typeof window!=='undefined'?window:globalThis);
