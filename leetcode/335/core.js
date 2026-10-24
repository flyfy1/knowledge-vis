'use strict';
(function(root){
const presets=[[2,1,1,2],[1,2,3,4],[1,1,2,1,1],[1,1,2,2,1,1],[1],[1,1,1,2,1],[1,2,3,4,5,6,1]];
function checks(x,i){
 const has=i>=3,A=has&&x[i]>=x[i-2]&&x[i-1]<=x[i-3],B=i>=4&&x[i-1]===x[i-3]&&x[i]+x[i-4]>=x[i-2],C=i>=5&&x[i-2]>=x[i-4]&&x[i]+x[i-4]>=x[i-2]&&x[i-1]<=x[i-3]&&x[i-1]+x[i-5]>=x[i-3];
 return {A,B,C};
}
function trace(x){
 const frames=[{k:0,points:[[0,0]],checks:{A:false,B:false,C:false},hit:null}],dirs=[[0,1],[-1,0],[0,-1],[1,0]];
 let points=[[0,0]];
 for(let i=0;i<x.length;i++){
  const [dx,dy]=dirs[i%4],[a,b]=points[points.length-1];points.push([a+dx*x[i],b+dy*x[i]]);
  const c=checks(x,i),kind=['A','B','C'].find(key=>c[key])||null;
  frames.push({k:i+1,points:points.map(p=>p.slice()),checks:c,hit:kind?{kind,old:i-({A:3,B:4,C:5}[kind])}:null});
  if(kind)break;
 }
 return frames;
}
const api={presets,checks,trace};root.CrossingCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
