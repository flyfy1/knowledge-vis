'use strict';
const SCSCore = (()=>{
 const presets=[['ab','ac'],['abac','cab'],['aaaaaaaa','aaaaaaaa'],['aab','baa'],['ab','cd'],['a','a'],['a','b']];
 function trace(a,b){
  const m=a.length,n=b.length,d=Array.from({length:m+1},()=>Array(n+1).fill(null));
  for(let i=0;i<=m;i++)d[i][n]=m-i;
  for(let j=0;j<=n;j++)d[m][j]=n-j;
  let i=0,j=0,out='',history=[];const frames=[];
  function save(kind,extra={}){frames.push({kind,i,j,out,history:[...history],table:d.map(r=>[...r]),...extra});}
  save('initial');
  for(let r=m-1;r>=0;r--)for(let c=n-1;c>=0;c--){
   const same=a[r]===b[c],down=d[r+1][c],right=d[r][c+1],diag=d[r+1][c+1];
   d[r][c]=1+(same?diag:Math.min(down,right));
   save(same?'equal':'different',{r,c,down,right,diag,value:d[r][c],x:a[r],y:b[c]});
  }
  save('ready');
  while(i<m||j<n){
   const oi=i,oj=j;let reason,ch;
   if(i===m){reason='tailB';ch=b[j++];}
   else if(j===n){reason='tailA';ch=a[i++];}
   else if(a[i]===b[j]){reason='both';ch=a[i++];j++;}
   else if(d[i+1][j]<=d[i][j+1]){reason='takeA';ch=a[i++];}
   else{reason='takeB';ch=b[j++];}
   out+=ch;history.push({oi,oj,i,j,ch,reason});save('emit',{reason,ch,oi,oj});
  }
  return {a,b,frames,result:out};
 }
 return {presets,trace};
})();
if(typeof module!=='undefined')module.exports=SCSCore;
