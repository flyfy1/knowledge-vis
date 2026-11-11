'use strict';
(function(root){
 const presets=[
  {routes:[[1,2,7],[3,6,7]],source:1,target:6},
  {routes:[[7,12],[4,5,15],[6],[15,19],[9,12,13]],source:15,target:12},
  {routes:[[1,2,3,6],[1,9],[9,6]],source:1,target:6},
  {routes:[[1,7],[7,6]],source:42,target:42},
  {routes:[[1,7],[7,6]],source:42,target:6},
  {routes:[[1,2,3],[2,3,4],[3,4,5],[5,6]],source:1,target:6},
  {routes:[[0]],source:0,target:999999}
 ];
 function trace(input){
  const {routes,source,target}=input,by=new Map();
  routes.forEach((stops,bus)=>stops.forEach(s=>{if(!by.has(s))by.set(s,[]);by.get(s).push(bus);}));
  const dist=new Map([[source,0]]),used=new Map(),frames=[];let front=[source],d=0,history=[];
  function snap(events){frames.push({depth:d,front:front.slice(),dist:[...dist].map(x=>x.slice()),used:[...used].map(x=>x.slice()),events:events.map(x=>({...x,fresh:x.fresh.slice()})),history:history.map(x=>({...x})),result:front.includes(target)?d:front.length?null:-1});}
  snap([]);
  while(frames.at(-1).result===null){
   const next=[],events=[];let scans=0;
   for(const stop of front)for(const bus of by.get(stop)||[]){
    if(used.has(bus))continue;
    used.set(bus,d+1);const fresh=[];scans+=routes[bus].length;
    for(const s of routes[bus])if(!dist.has(s)){dist.set(s,d+1);next.push(s);fresh.push(s);}
    events.push({bus,via:stop,fresh});
   }
   history.push({from:d,to:d+1,routes:events.length,scans,newStops:next.length});d++;front=next;snap(events);
  }
  return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.BusCore=api;
})(typeof window!=='undefined'?window:globalThis);
