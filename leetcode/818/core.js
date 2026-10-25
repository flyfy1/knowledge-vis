(function(root){
'use strict';
const move=(p,s,c)=>c==='A'?[p+s,s*2]:[p,s>0?-1:1];
function trace(target){
 let front=[[0,1,'']],seen=new Set(['0,1']),rows=[{d:0,states:front}],frames=[{d:0,rows:JSON.parse(JSON.stringify(rows)),done:false}];
 while(!front.some(x=>x[0]===target)){
  const next=[];
  for(const [p,s,path] of front)for(const c of ['A','R']){const [np,ns]=move(p,s,c),key=np+','+ns;if(!seen.has(key)){seen.add(key);next.push([np,ns,path+c]);}}
  front=next;rows.push({d:rows.length,states:next});frames.push({d:rows.length-1,rows:JSON.parse(JSON.stringify(rows)),done:front.some(x=>x[0]===target)});
 }
 return frames;
}
const api={move,trace,presets:[6,3,1,4,2]};if(typeof module!=='undefined')module.exports=api;else root.RaceCore=api;
})(typeof window==='undefined'?globalThis:window);
