'use strict';
(function(root){
 const presets=[
  {n:4,lamps:[[0,0],[0,3]],queries:[[0,1],[0,2]]},
  {n:5,lamps:[[0,0],[4,4]],queries:[[1,1],[1,0]]},
  {n:5,lamps:[[0,0],[4,4]],queries:[[1,1],[1,1]]},
  {n:5,lamps:[[0,0],[0,4]],queries:[[0,4],[0,1],[1,4]]},
  {n:3,lamps:[[0,0],[0,0],[0,2]],queries:[[0,0],[1,2]]},
  {n:3,lamps:[],queries:[[0,0],[2,2]]},
  {n:1,lamps:[[0,0]],queries:[[0,0],[0,0]]},
  {n:3,lamps:[[2,2]],queries:[]}
 ];
 const key=(r,c)=>r+','+c;
 function trace(input){
  const active=new Map(input.lamps.map(([r,c])=>[key(r,c),[r,c]])),maps=[{},{},{},{}],ans=[],frames=[],history=[];
  function adjust(r,c,d){[r,c,r-c,r+c].forEach((k,i)=>{maps[i][k]=(maps[i][k]||0)+d;if(!maps[i][k])delete maps[i][k];});}
  active.forEach(([r,c])=>adjust(r,c,1));
  function snap(phase,q=null,counts=[],removed=[]){frames.push(JSON.parse(JSON.stringify({phase,q,counts,removed,active:[...active.values()],maps,ans,history})));}
  snap('initial');
  input.queries.forEach(([r,c],i)=>{
   const counts=[r,c,r-c,r+c].map((k,j)=>maps[j][k]||0),bit=Number(counts.some(x=>x>0));
   ans.push(bit);history.push({i,q:[r,c],counts,bit,removed:null});snap('read',[r,c],counts);
   const removed=[];
   for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
    const x=r+dr,y=c+dc,k=key(x,y);
    if(active.has(k)){active.delete(k);adjust(x,y,-1);removed.push([x,y]);}
   }
   history[history.length-1].removed=removed;snap('remove',[r,c],counts,removed);
  });return frames;
 }
 const api={presets,trace};root.LessonCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
