'use strict';
const ColumnsCore=(()=>{
 const presets=[['bac','abc'],['babca','bbazb'],['edcba'],['ghi','def','abc'],['aaa','bbb'],['cab','abc']];
 function trace(rows){
  const m=rows[0].length,dp=Array(m).fill(1),paths=Array.from({length:m},(_,i)=>[i]);
  const frames=[{j:-1,dp:[],pairs:[],path:[]}];
  for(let j=0;j<m;j++){
   const pairs=[];
   for(let i=0;i<j;i++){
    const checks=rows.map(s=>[s[i],s[j],s[i]<=s[j]]),ok=checks.every(x=>x[2]),old=dp[j],candidate=ok?dp[i]+1:null;
    if(ok&&candidate>dp[j]){dp[j]=candidate;paths[j]=[...paths[i],j];}
    pairs.push({i,j,checks,ok,old,candidate,value:dp[j]});
   }
   let best=0;for(let k=1;k<=j;k++)if(dp[k]>dp[best])best=k;
   frames.push({j,dp:dp.slice(0,j+1),pairs,path:[...paths[best]]});
  }
  return {rows,m,frames};
 }
 return {presets,trace};
})();
if(typeof module!=='undefined')module.exports=ColumnsCore;
