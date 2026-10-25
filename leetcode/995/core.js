(function(root){
 'use strict';
 const presets=[{a:[0,1,0],k:2},{a:[0,0,0,1,0,1,1,0],k:3},{a:[1,1,0],k:2},{a:[0,1,0],k:1},{a:[0,0,0],k:3},{a:[1,1,1],k:2},{a:[0,1,0],k:3},{a:[0],k:1}];
 function trace(a,k){
  const n=a.length,expiry=Array(n+1).fill(0),starts=[],rows=[],frames=[];let parity=0;
  function save(i,result){const values=a.map((v,j)=>v^(starts.filter(s=>s<=j&&j<s+k).length%2));frames.push(JSON.parse(JSON.stringify({i,values,starts,rows,expiry,parity,result})));}
  save(-1,null);
  for(let i=0;i<n;i++){
   const old=parity,expired=expiry[i];parity^=expired;const before=parity,bit=a[i]^before;
   let action='skip',result=null;
   if(bit===0){if(i+k>n){action='fail';result=-1;}else{action='flip';starts.push(i);parity^=1;expiry[i+k]^=1;}}
   rows.push({i,old,expired,before,bit,action,after:parity,end:action==='flip'?i+k:null});
   if(i===n-1&&result===null)result=starts.length;
   save(i,result);if(result===-1)break;
  }
  return frames;
 }
 const api={presets,trace};root.LessonCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
