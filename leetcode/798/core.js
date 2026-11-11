'use strict';
(function(root){
const presets=[[1,0,2],[2,3,1,4,0],[1,3,0,2,4],[0],[0,0,0],[2,2,2]];
function intervals(n,i,v){if(v===0)return [];const l=(i-v+1+n)%n;return l<=i?[[l,i]]:[[l,n-1],[0,i]];}
function model(a){const n=a.length,d=Array(n+1).fill(0);a.forEach((v,i)=>intervals(n,i,v).forEach(([l,r])=>{d[l]++;d[r+1]--;}));let bad=0,best=-1,answer=0;const rows=[];for(let k=0;k<n;k++){bad+=d[k];const score=n-bad;if(score>best){best=score;answer=k;}rows.push({k,event:d[k],bad,score,best,answer,rotated:a.slice(k).concat(a.slice(0,k))});}return {d,rows};}
const api={presets,intervals,model};root.RotationCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
