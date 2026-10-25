'use strict';
(function(root){
 const presets=['aba','aaabbb','abc','ababa','a','abab','bcacba'];
 function trace(s){
  const n=s.length,dp=Array.from({length:n},()=>Array(n).fill(null)),frames=[];
  const snap=(x)=>frames.push({...x,dp:dp.map(r=>r.slice())});
  snap({kind:'start'});
  for(let i=n-1;i>=0;i--){dp[i][i]=1;snap({kind:'base',i,j:i,value:1,best:1});
   for(let j=i+1;j<n;j++){
    dp[i][j]=dp[i][j-1]+1;let bestName='solo';
    snap({kind:'solo',i,j,value:dp[i][j],best:dp[i][j],bestName,left:dp[i][j-1]});
    for(let k=i;k<j;k++)if(s[k]===s[j]){
     const left=dp[i][k],gap=k+1<=j-1?dp[k+1][j-1]:0,value=left+gap;
     if(value<dp[i][j]){dp[i][j]=value;bestName=String(k);}
     snap({kind:'merge',i,j,k,left,gap,value,best:dp[i][j],bestName});
    }
   }
  }
  return frames;
 }
 root.Printer={presets,trace};
 if(typeof module!=='undefined')module.exports=root.Printer;
})(typeof window==='undefined'?globalThis:window);
