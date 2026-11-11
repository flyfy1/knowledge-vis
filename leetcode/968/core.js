'use strict';
(function(root){
 const presets=[{edges:[[1,-1],[2,3],[-1,-1],[-1,-1]]},{edges:[[1,-1],[2,-1],[3,-1],[-1,4],[-1,-1]]},{edges:[[-1,-1]]},{edges:[[1,-1],[2,-1],[3,-1],[-1,-1]]},{edges:[[1,2],[3,4],[5,6],[-1,-1],[-1,-1],[-1,-1],[-1,-1]]}];
 function trace(edges){
  const states=Array(edges.length).fill('?'),cameras=[];
  const frames=[{states:[...states],cameras:[],node:-1,kind:'start',left:'',right:''}];
  function visit(v){if(v<0)return 'C';const [a,b]=edges[v],left=visit(a),right=visit(b);const s=left==='N'||right==='N'?'K':left==='K'||right==='K'?'C':'N';states[v]=s;if(s==='K')cameras.push(v);frames.push({states:[...states],cameras:[...cameras],node:v,kind:s,left,right});return s;}
  if(visit(0)==='N'){cameras.push(0);states[0]='K';frames.push({states:[...states],cameras:[...cameras],node:0,kind:'root',left:'',right:''});}
  return frames;
 }
 function coverage(edges,cameras){const covered=new Set();for(const v of cameras){covered.add(v);for(const c of edges[v])if(c>=0)covered.add(c);edges.forEach((pair,p)=>{if(pair.includes(v))covered.add(p);});}return [...covered].sort((a,b)=>a-b);}
 const api={presets,trace,coverage};root.LessonCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
