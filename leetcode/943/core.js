'use strict';
(function(root){
 const presets=[['ab','bc','ca'],['bcabb','acc','bbbca','ccabc'],['alex','loves','leetcode'],['ab','cd'],['solo']];
 function trace(words){
  const n=words.length,size=1<<n;
  if(n<1||n>4)throw new Error('Teaching input requires 1..4 words');
  const overlap=words.map((a,i)=>words.map((b,j)=>{if(i===j)return 0;for(let k=Math.min(a.length,b.length);k>0;k--)if(a.endsWith(b.slice(0,k)))return k;return 0;}));
  const dp=Array.from({length:size},()=>Array(n).fill(null)),parent=Array.from({length:size},()=>Array(n).fill(-1)),settled=Array.from({length:size},()=>Array(n).fill(false));
  const frames=[];
  function snapshot(event){frames.push({dp:dp.map(r=>r.slice()),parent:parent.map(r=>r.slice()),settled:settled.map(r=>r.slice()),event});}
  for(let j=0;j<n;j++){dp[1<<j][j]=words[j].length;settled[1<<j][j]=true;}
  snapshot(null);
  for(let mask=1;mask<size;mask++)for(let j=0;j<n;j++)if(mask&(1<<j)){
   const previous=mask^(1<<j);if(!previous)continue;
   const sources=Array.from({length:n},(_,i)=>i).filter(i=>previous&(1<<i));
   sources.forEach((i,k)=>{
    const old=dp[mask][j],source=dp[previous][i],added=words[j].length-overlap[i][j],candidate=source+added;
    if(old===null||candidate<old){dp[mask][j]=candidate;parent[mask][j]=i;}
    const complete=k===sources.length-1;settled[mask][j]=complete;
    snapshot({mask,j,previous,i,old,source,added,candidate,overlap:overlap[i][j],best:dp[mask][j],winner:parent[mask][j],complete});
   });
  }
  let last=0;for(let j=1;j<n;j++)if(dp[size-1][j]<dp[size-1][last])last=j;
  let mask=size-1;const order=[];
  while(last!==-1){order.push(last);const before=parent[mask][last];mask^=1<<last;last=before;}
  order.reverse();const pieces=order.map((j,k)=>k?words[j].slice(overlap[order[k-1]][j]):words[j]);
  return {words:words.slice(),overlap,frames,order,pieces,result:pieces.join('')};
 }
 const api={presets,trace};root.SuperstringCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
