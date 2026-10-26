'use strict';
(function(root){
const presets=[
 {walls:[[0,1],[1,0]],s:[0,0],t:[0,2],origin:[0,0]},
 {walls:[[0,1],[1,0]],s:[4,4],t:[0,0],origin:[0,0]},
 {walls:[[0,2],[1,1],[2,0]],s:[0,0],t:[0,1],origin:[0,0]},
 {walls:[[1,0],[1,1]],s:[0,0],t:[3,0],origin:[0,0]},
 {walls:[],s:[0,0],t:[999999,999999],origin:[0,0]},
 {walls:[[999998,999999],[999999,999998]],s:[999999,999999],t:[999997,999999],origin:[999992,999992]}
];
const key=p=>p.join(',');
function trace(input,side=1000000){
 const walls=new Set(input.walls.map(key)),limit=walls.size**2,frames=[];
 let result=true;
 for(let phase=0;phase<2;phase++){
  const start=phase?input.t:input.s,goal=phase?input.s:input.t;
  const seen=new Set([key(start)]),queue=[start.slice()];let head=0,current=null;
  const save=(kind,added=[])=>frames.push({phase,kind,current:current&&current.slice(),seen:[...seen],queue:queue.slice(head).map(p=>p.slice()),added:added.map(p=>p.slice()),limit,result:kind==='trapped'?false:null});
  save('start');
  let ok=false;
  if(seen.size>limit){save('escaped');ok=true;}
  while(!ok&&head<queue.length){
   current=queue[head++];
   if(key(current)===key(goal)){save('reached');ok=true;break;}
   const added=[];
   for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
    const p=[current[0]+dx,current[1]+dy],k=key(p);
    if(p[0]>=0&&p[0]<side&&p[1]>=0&&p[1]<side&&!walls.has(k)&&!seen.has(k)){seen.add(k);queue.push(p);added.push(p);}
   }
   save('expand',added);
   if(seen.size>limit){save('escaped');ok=true;break;}
  }
  if(!ok){save('trapped');result=false;break;}
 }
 frames[frames.length-1].result=result;
 return {frames,limit,result};
}
const api={presets,trace};root.MazeCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
