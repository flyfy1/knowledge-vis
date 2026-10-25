'use strict';
(function(root){
 const presets=[
  {stickers:['ab','a'],target:'aab'},
  {stickers:['with','example','science'],target:'thehat'},
  {stickers:['notice','possible'],target:'basicbasic'},
  {stickers:['abcd','abe','cdf'],target:'abcdef'},
  {stickers:['a'],target:'aaa'},
  {stickers:['a'],target:'b'},
  {stickers:['abcdefghij'],target:'abcdefghijklmno'}
 ];
 function trace({stickers,target}){
  const letters=[...new Set(target)].sort(), vector=w=>letters.map(c=>[...w].filter(x=>x===c).length);
  const counts=stickers.map(vector),need=vector(target),memo={},stack=[],frames=[];
  const key=r=>r.join(','), word=r=>r.map((n,i)=>letters[i].repeat(n)).join('')||'∅';
  function emit(kind,data={}){frames.push(JSON.parse(JSON.stringify({kind,...data,stack,memo})));}
  function solve(r){
   stack.push({r:[...r],best:null});emit('enter',{r});
   if(key(r) in memo){const v=memo[key(r)].value;emit('cache',{r,value:v});stack.pop();return v;}
   if(!r.some(Boolean)){memo[key(r)]={r,value:0};emit('base',{r,value:0});stack.pop();return 0;}
   const pivot=r.findIndex(Boolean);let best=null;
   for(let i=0;i<counts.length;i++){
    if(!counts[i][pivot]){emit('skip',{r,i,pivot});continue;}
    const child=r.map((n,j)=>Math.max(0,n-counts[i][j]));emit('child',{r,i,pivot,child});
    const v=solve(child),candidate=v===null?null:1+v;
    if(candidate!==null&&(best===null||candidate<best))best=candidate;
    stack[stack.length-1].best=best;emit('return',{r,i,child,value:v,candidate,best});
   }
   memo[key(r)]={r,value:best};emit('done',{r,value:best});stack.pop();return best;
  }
  emit('start',{r:need});const result=solve(need);emit('finish',{r:need,value:result});
  return {letters,counts,need,frames,result,word};
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.Stickers=api;
})(typeof window==='undefined'?globalThis:window);
