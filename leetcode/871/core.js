'use strict';
(function(root){
 const presets=[
 {target:25,startFuel:10,stations:[[10,15]]},
 {target:100,startFuel:10,stations:[[10,60],[20,30],[30,30],[60,40]]},
 {target:60,startFuel:25,stations:[[10,5],[25,35]]},
 {target:100,startFuel:1,stations:[[10,100]]},
 {target:1,startFuel:1,stations:[]},
 {target:30,startFuel:10,stations:[[10,10],[20,10]]}
 ];
 function trace(input){
  const {target,startFuel,stations}=input;let reach=startFuel,i=0,selected=[],pool=[],frames=[];
  const save=(kind,id=null,before=reach)=>frames.push({kind,id,before,reach,i,selected:selected.slice(),pool:pool.slice()});
  save('start');
  while(reach<target){
   while(i<stations.length&&stations[i][0]<=reach){pool.push(i);save('admit',i);i++;frames[frames.length-1].i=i;}
   if(!pool.length){save('fail');return frames;}
   pool.sort((a,b)=>stations[b][1]-stations[a][1]||a-b);
   const id=pool.shift(),before=reach;selected.push(id);reach+=stations[id][1];save('choose',id,before);
  }
  save('done');return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.RefuelCore=api;
})(typeof window==='undefined'?globalThis:window);
