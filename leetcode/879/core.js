'use strict';
(function(root){
 const presets=[
 {n:5,P:3,group:[2,2],profit:[2,3]},
 {n:10,P:5,group:[2,3,5],profit:[6,7,8]},
 {n:3,P:3,group:[2,2],profit:[2,3]},
 {n:2,P:0,group:[1,1],profit:[0,0]},
 {n:1,P:2,group:[2],profit:[5]},
 {n:2,P:3,group:[1],profit:[2]}];
 function trace(a){
  let dp=Array.from({length:a.n+1},()=>Array(a.P+1).fill(0));dp[0][0]=1;
  const frames=[{k:0,old:dp.map(r=>r.slice()),dp:dp.map(r=>r.slice()),moves:[],answer:dp.reduce((s,r)=>s+r[a.P],0)}];
  a.group.forEach((g,i)=>{const old=dp.map(r=>r.slice()),nxt=old.map(r=>r.slice()),moves=[];
   for(let u=0;u<=a.n;u++)for(let p=0;p<=a.P;p++)if(old[u][p]){
    const v=u+g,q=Math.min(a.P,p+a.profit[i]),count=old[u][p],legal=v<=a.n;
    moves.push({u,p,v,q,count,legal});if(legal)nxt[v][q]=(nxt[v][q]+count)%1000000007;
   }
   dp=nxt;frames.push({k:i+1,old,dp:dp.map(r=>r.slice()),moves,answer:dp.reduce((s,r)=>(s+r[a.P])%1000000007,0)});
  });return frames;
 }
 const api={presets,trace};root.SchemeCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
