(function(root){
'use strict';
function trace(s){
 const rows=[[1]], frames=[{i:0,j:0,rows:[[1]],sources:[],terms:[],value:1}];
 for(let i=1;i<=s.length;i++){
  const old=rows[i-1];rows.push(Array(i+1).fill(null));
  for(let j=0;j<=i;j++){
   const sources=old.map((_,k)=>k).filter(k=>s[i-1]==='I'?k<j:k>=j);
   const terms=sources.map(k=>old[k]);
   const value=terms.reduce((a,b)=>a+b,0);rows[i][j]=value;
   frames.push({i,j,rows:rows.map(r=>r.slice()),sources,terms,value});
  }
 }
 return frames;
}
const api={trace};if(typeof module!=='undefined')module.exports=api;else root.DICore=api;
})(typeof window==='undefined'?globalThis:window);
