'use strict';
(function(root){
const clone=b=>b.map(r=>r.slice());
const presets=[
 [[0,1,1,0],[0,1,1,0],[1,0,0,1],[1,0,0,1]],
 [[0,0,1],[1,1,0],[0,0,1]],
 [[0,1],[1,0]],
 [[1,0],[1,0]],
 [[0,1],[0,0]],
 [[0,0,0,1],[1,1,1,0],[0,0,0,1],[1,1,1,0]],
 [[1,0,1],[0,1,0],[1,0,1]]
];
function plan(a){
 let best=null;
 for(const start of [0,1]){
  const target=a.map((_,i)=>start^(i%2));
  if(a.reduce((s,x)=>s+x,0)!==target.reduce((s,x)=>s+x,0))continue;
  const low=[],high=[];a.forEach((x,i)=>{if(x!==target[i])(x===0?low:high).push(i);});
  const swaps=low.map((x,i)=>[x,high[i]]);
  if(!best||swaps.length<best.swaps.length)best={start,target,swaps,mismatches:swaps.length*2};
 }
 return best;
}
function trace(input){
 const b=clone(input),n=b.length,frames=[],history=[];let moves=0;
 function push(event,result=null){history.push(event);frames.push({board:clone(b),moves,event:{...event},history:history.map(e=>({...e})),result});}
 push({kind:'start'});
 for(let i=0;i<n;i++){
  const bad=b[i].findIndex((x,j)=>(b[0][0]^b[i][0]^b[0][j]^x)!==0);
  if(bad!==-1){push({kind:'structureFail',i,j:bad,a:b[0][0],b:b[i][0],c:b[0][bad],d:b[i][bad]},-1);return frames;}
  push({kind:'rowCheck',i,relation:b[i][0]===b[0][0]?'equal':'opposite'});
 }
 const rows=plan(b.map(r=>r[0])),cols=plan(b[0]);
 if(!rows||!cols){push({kind:'countFail',axis:!rows?'rows':'cols',ones:(!rows?b.map(r=>r[0]):b[0]).reduce((s,x)=>s+x,0),n},-1);return frames;}
 push({kind:'balanced',r:b.map(r=>r[0]).join(''),c:b[0].join(''),rc:rows.swaps.length,cc:cols.swaps.length});
 for(const axis of ['rows','cols']){
  const p=plan(axis==='rows'?b.map(r=>r[0]):b[0]);
  push({kind:'target',axis,target:p.target.join(''),m:p.mismatches,cost:p.swaps.length});
  for(const [a,z] of p.swaps){
   if(axis==='rows')[b[a],b[z]]=[b[z],b[a]];
   else for(const row of b)[row[a],row[z]]=[row[z],row[a]];
   moves++;push({kind:'swap',axis,a,z});
  }
 }
 push({kind:'done',moves},moves);return frames;
}
const api={clone,presets,plan,trace};if(typeof module!=='undefined')module.exports=api;else root.ChessCore=api;
})(typeof window==='undefined'?globalThis:window);
