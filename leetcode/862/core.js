(function(root){
'use strict';
const presets=[{nums:[2,-1,2],k:3},{nums:[1],k:1},{nums:[1,2],k:4},{nums:[1,-1,3],k:3},{nums:[2,-2,2,-2,5],k:5},{nums:[84,-37,32,40,95],k:167},{nums:[-3,-2],k:1},{nums:[100000,100000],k:200000}];
function trace({nums,k}){
 const p=[0];for(const v of nums)p.push(p[p.length-1]+v);
 let q=[],best=null,pair=null;const frames=[];
 const save=(kind,j=null,i=null)=>frames.push({kind,j,i,q:[...q],best,pair:pair?[...pair]:null});
 save('initial');
 for(let j=0;j<p.length;j++){
  while(q.length&&p[j]-p[q[0]]>=k){const i=q.shift();if(best===null||j-i<best){best=j-i;pair=[i,j];}save('front',j,i);}
  while(q.length&&p[q[q.length-1]]>=p[j]){const i=q.pop();save('back',j,i);}
  q.push(j);save('append',j);
 }
 save('done',nums.length);return {p,frames};
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.SubarrayLab=api;
})(typeof window!=='undefined'?window:globalThis);
