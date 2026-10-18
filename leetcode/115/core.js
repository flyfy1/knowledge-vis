'use strict';
(function(root){
 function trace(s,t){
  if(!/^[a-zA-Z]{0,10}$/.test(s)||!/^[a-zA-Z]{0,10}$/.test(t))throw new Error('input');
  const n=t.length,dp=Array(n+1).fill(0);dp[0]=1;
  const rows=[dp.slice()],frames=[];
  function save(event){frames.push({...event,dp:dp.slice(),rows:rows.map(r=>r.slice())});}
  save({type:'start',i:0,j:0});
  for(let i=1;i<=s.length;i++){
   rows.push([1,...Array(n).fill(null)]);
   if(n===0)save({type:'empty',i,j:0});
   for(let j=n;j>=1;j--){
    const skip=dp[j],use=s[i-1]===t[j-1]?dp[j-1]:0,match=s[i-1]===t[j-1];
    dp[j]=skip+use;rows[i][j]=dp[j];
    save({type:'update',i,j,char:s[i-1],target:t[j-1],skip,use,match,value:dp[j]});
   }
  }
  save({type:'done',i:s.length,j:0,result:dp[n]});
  return {s,t,frames,result:dp[n]};
 }
 root.Subseq115={trace};
})(typeof window==='undefined'?globalThis:window);
