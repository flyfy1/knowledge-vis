'use strict';
(function(root){
const presets=[{a:[3,2,4],k:2},{a:[3,2,4,1],k:2},{a:[3,2,4,1],k:3},{a:[3,5,1,2,6],k:3},{a:[6,4,4,6],k:2},{a:[7],k:30},{a:[1,1,1,1],k:4},{a:[2,2,2],k:4}];
function trace(a,k){
 const n=a.length,rows=[],frames=[],dp=Array.from({length:n},()=>Array.from({length:n},()=>Array(k+1).fill(Infinity)));
 const save=(event,result=null)=>frames.push({rows:JSON.parse(JSON.stringify(rows)),event,result});
 for(let i=0;i<n;i++){dp[i][i][1]=0;rows.push({i,j:i,p:1,value:0});}
 if((n-1)%(k-1)!==0){save({type:'impossible'},-1);return frames;}
 save({type:'init'},n===1?0:null);
 for(let length=2;length<=n;length++)for(let i=0;i+length<=n;i++){
  const j=i+length-1;
  for(let p=2;p<=Math.min(k,length);p++){
   if((length-p)%(k-1))continue;
   const candidates=[];
   for(let m=i;m<j;m++){
    const left=dp[i][m][1],right=dp[m+1][j][p-1];
    if(Number.isFinite(left+right))candidates.push({m,left,right,value:left+right});
   }
   const value=Math.min(...candidates.map(c=>c.value));dp[i][j][p]=value;rows.push({i,j,p,value});save({type:'split',i,j,p,value,candidates});
  }
  if((length-1)%(k-1)===0){
   const before=dp[i][j][k],sum=a.slice(i,j+1).reduce((x,y)=>x+y,0),value=before+sum;dp[i][j][1]=value;rows.push({i,j,p:1,value});save({type:'merge',i,j,p:1,value,before,sum},length===n?value:null);
  }
 }
 return frames;
}
const api={presets,trace};root.LessonCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
