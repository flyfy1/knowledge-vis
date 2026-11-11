(function(root){
'use strict';
const presets=[
 [['push',2],['push',2],['push',9],['pop'],['pop'],['pop']],
 [5,7,5,7,4,5].map(v=>['push',v]).concat(Array.from({length:4},()=>['pop'])),
 [['push',0],['pop'],['push',1000000000],['push',0],['push',0],['pop'],['pop'],['pop']]
];
function trace(ops){
 const freq={},group={},remaining=[],outputs=[],frames=[];let maxfreq=0;
 const save=op=>frames.push(JSON.parse(JSON.stringify({freq,group,remaining,outputs,maxfreq,op})));
 save(null);
 for(const op of ops){
  if(op[0]==='push'){
   const v=op[1],f=(freq[v]||0)+1;freq[v]=f;(group[f]??=[]).push(v);maxfreq=Math.max(maxfreq,f);remaining.push(v);
   save({kind:'push',v,f});
  }else{
   const f=maxfreq,v=group[f].pop();freq[v]--;remaining.splice(remaining.lastIndexOf(v),1);outputs.push(v);
   if(!group[f].length){delete group[f];maxfreq--;}
   save({kind:'pop',v,f});
  }
 }
 return frames;
}
const api={presets,trace};root.FreqCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
