'use strict';
(function(root){
 const presets=[{k:2,n:6},{k:1,n:2},{k:3,n:14},{k:2,n:10},{k:1,n:6},{k:3,n:1}];
 function trace(k,n){
  const rows=[Array(k+1).fill(0)];
  while(rows[rows.length-1][k]<n){const old=rows[rows.length-1];rows.push(old.map((v,e)=>e===0?0:old[e-1]+1+v));}
  return rows;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.EggCore=api;
})(typeof window==='undefined'?globalThis:window);
