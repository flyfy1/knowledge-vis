'use strict';
(function(root){
function trace(a,b){
 if(!/^[a-z]{1,5}$/.test(a)||a.length!==b.length||!/^[a-z]+$/.test(b))throw new Error('invalid');
 const n=a.length,dp=Array.from({length:n+1},()=>Array.from({length:n},()=>Array(n).fill(null))),frames=[],ledger=[];
 const save=(event,data={})=>frames.push({event,...data,dp:JSON.parse(JSON.stringify(dp)),ledger:JSON.parse(JSON.stringify(ledger))});
 const pair=(length,i,j)=>({length,i,j,a:a.slice(i,i+length),b:b.slice(j,j+length),value:dp[length][i][j]});
 save('start');
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){
  dp[1][i][j]=a[i]===b[j];ledger.push({event:'base',length:1,i,j,value:dp[1][i][j]});save('base',{length:1,i,j});
 }
 for(let length=2;length<=n;length++)for(let i=0;i<=n-length;i++)for(let j=0;j<=n-length;j++){
  for(let k=1;k<length;k++){
   const keep=[pair(k,i,j),pair(length-k,i+k,j+k)],swap=[pair(k,i,j+length-k),pair(length-k,i+k,j)];
   const kept=keep.every(p=>p.value),swapped=swap.every(p=>p.value);
   if(kept||swapped)dp[length][i][j]=true;else if(k===length-1)dp[length][i][j]=false;
   ledger.push({event:'cut',length,i,j,k,kept,swapped,value:dp[length][i][j]});
   save('cut',{length,i,j,k,keep,swap,kept,swapped});
   if(dp[length][i][j]===true)break;
  }
 }
 save('done');return {a,b,n,frames,result:dp[n][0][0]};
}
root.Scramble87={trace};if(typeof module!=='undefined')module.exports=root.Scramble87;
})(typeof window!=='undefined'?window:globalThis);
