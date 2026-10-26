(function(root){
'use strict';
const presets=[
 [[1],[0,3],[3],[1,2]],
 [[2],[2],[0,1]],
 [[2,5],[3],[0,4,5],[1,4,5],[2,3],[0,2,3]],
 [[1,3],[0],[3],[0,2]]
];
const key=s=>s.join(',');
function children(g,[m,c,t]){return t===1?g[m].map(v=>[v,c,2]):g[c].filter(v=>v!==0).map(v=>[m,v,1]);}
function reachable(g){
 const seen=new Set(),todo=[[1,2,1]];while(todo.length){const s=todo.pop(),k=key(s);if(seen.has(k))continue;seen.add(k);if(s[0]!==0&&s[0]!==s[1])todo.push(...children(g,s));}return seen;
}
function trace(g){
 const n=g.length,w={},r={},queue=[],frames=[],allowed=reachable(g);
 for(let m=0;m<n;m++)for(let c=1;c<n;c++)for(let t=1;t<=2;t++){
  const s=[m,c,t],k=key(s);if(!allowed.has(k))continue;r[k]=children(g,s).length;w[k]=m===0?1:m===c?2:0;
  if(w[k])queue.push(s);
 }
 function save(current,updates,done){frames.push({w:{...w},r:{...r},pending:queue.length-head,processed:head,current,updates,done});}
 let head=0;save(null,[],false);
 while(head<queue.length){
  const s=queue[head++],[m,c,t]=s,result=w[key(s)],updates=[];
  const parents=t===2?g[m].map(pm=>[pm,c,1]):g[c].filter(pc=>pc!==0).map(pc=>[m,pc,2]);
  for(const p of parents){const k=key(p),player=p[2];if(!allowed.has(k)||w[k])continue;
   const before=r[k];let reason;
   if(result===player){w[k]=player;reason='one';queue.push(p);}
   else{r[k]--;reason=r[k]===0?'all':'wait';if(!r[k]){w[k]=result;queue.push(p);}}
   updates.push({state:p,child:s,result,before,after:r[k],winner:w[k],reason});
  }
  save(s,updates,false);
 }
 // Separate frame: no newly proved win; reinterpret residual unknowns as draws.
 save(null,[],true);return frames;
}
const api={presets,key,children,reachable,trace};
if(typeof module!=='undefined')module.exports=api;else root.CatMouse=api;
})(typeof window==='undefined'?globalThis:window);
