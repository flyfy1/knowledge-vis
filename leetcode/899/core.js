'use strict';
(function(root){
 const presets=[{s:'cba',k:1},{s:'cba',k:2},{s:'baaca',k:3},{s:'bca',k:1},{s:'aaaa',k:1},{s:'z',k:1}];
 const move=(s,j)=>s.slice(0,j)+s.slice(j+1)+s[j];
 function trace({s,k}){
  const frames=[{s,j:null,before:null}];
  if(k===1){for(let i=0;i<s.length;i++){const before=frames.at(-1).s;frames.push({s:move(before,0),j:0,before});}return frames;}
  const target=[...s].sort().join(''),queue=[s],parent=new Map([[s,null]]);
  for(let h=0;h<queue.length&&!parent.has(target);h++){
   for(let j=0;j<k;j++){const v=move(queue[h],j);if(!parent.has(v)){parent.set(v,{s:queue[h],j});queue.push(v);}}
  }
  const path=[];let v=target;
  while(parent.get(v)!==null){const p=parent.get(v);path.push({s:v,j:p.j,before:p.s});v=p.s;}
  return frames.concat(path.reverse());
 }
 const api={presets,move,trace};if(typeof module!=='undefined')module.exports=api;else root.QueueCore=api;
})(typeof window!=='undefined'?window:globalThis);
