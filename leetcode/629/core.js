/* A bounded teaching simulation, not a Python execution engine. */
(function(root){
 'use strict';
 const MOD=1000000007;
 function pairs(a){const out=[];for(let p=0;p<a.length;p++)for(let q=p+1;q<a.length;q++)if(a[p]>a[q])out.push({p,q,a:a[p],b:a[q]});return out;}
 function insert(x){if(!Number.isInteger(x)||x<0||x>2)throw new RangeError('x');const a=[2,1];a.splice(2-x,0,3);return {a,pairs:pairs(a),x};}
 function trace(n,k){
  if(!Number.isInteger(n)||n<1||n>5||!Number.isInteger(k)||k<0||k>6)throw new RangeError('teaching bounds');
  const table=Array.from({length:n+1},()=>Array(k+1).fill(null));table[0].fill(0);table[0][0]=1;
  const frames=[],save=f=>frames.push({...f,table:table.map(row=>row.slice())});
  save({kind:'initial',i:0,j:null,before:0,add:0,remove:0,removeIndex:null,window:0,lo:null,hi:null});
  for(let i=1;i<=n;i++){
   let window=0;
   for(let j=0;j<=k;j++){
    const before=window,add=table[i-1][j],removeIndex=j>=i?j-i:null,remove=removeIndex===null?0:table[i-1][removeIndex];
    window=(before+add-remove+MOD)%MOD;table[i][j]=window;
    save({kind:'cell',i,j,before,add,remove,removeIndex,window,lo:Math.max(0,j-i+1),hi:j});
   }
  }
  return {n,k,frames,result:table[n][k]};
 }
 const api={pairs,insert,trace,MOD};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.InversePairs=api;
})(typeof window!=='undefined'?window:globalThis);
