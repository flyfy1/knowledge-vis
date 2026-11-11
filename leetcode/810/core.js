'use strict';
(function(root){
 const presets=[[1,2],[1,1,2],[0,1],[1,2,3],[1],[0],[2,2,3,3]];
 const xor=a=>a.reduce((x,v)=>x^v,0);
 function start(a){return {items:a.map((value,id)=>({value,id})),turn:0,event:null,loser:null};}
 function terminal(s){return s.loser!==null||xor(s.items.map(v=>v.value))===0;}
 function move(s,id){
  if(terminal(s))throw Error('terminal');
  const item=s.items.find(v=>v.id===id);if(!item)throw Error('missing tile');
  const before=xor(s.items.map(v=>v.value)),after=before^item.value;
  return {items:s.items.filter(v=>v.id!==id).map(v=>({...v})),turn:s.turn+1,
   event:{id,value:item.value,before,after,player:s.turn%2},loser:after===0?s.turn%2:null};
 }
 function automatic(s){const x=xor(s.items.map(v=>v.value));return move(s,(s.items.find(v=>(x^v.value)!==0)||s.items[0]).id);}
 const api={presets,xor,start,terminal,move,automatic};
 if(typeof module!=='undefined')module.exports=api;root.XorCore=api;
})(typeof window!=='undefined'?window:globalThis);
