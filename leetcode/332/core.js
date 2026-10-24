(function(root){
'use strict';
const presets = [
 [['JFK','KUL'],['JFK','NRT'],['NRT','JFK']],
 [['JFK','SFO'],['JFK','ATL'],['SFO','ATL'],['ATL','JFK'],['ATL','SFO']],
 [['JFK','AAA'],['AAA','JFK'],['JFK','AAA']],
 [['JFK','BOS']],
 [['JFK','BOS'],['BOS','LAX'],['LAX','JFK']]
];
function trace(tickets){
 const graph={};tickets.forEach(([a,b],id)=>(graph[a]??=[]).push({b,id}));
 Object.values(graph).forEach(a=>a.sort((x,y)=>y.b.localeCompare(x.b)||y.id-x.id));
 const stack=['JFK'],finished=[],used=[],frames=[];
 const save=(kind,a='',b='',id=-1)=>frames.push({kind,a,b,id,stack:[...stack],finished:[...finished],used:[...used]});
 save('start');
 while(stack.length){const a=stack[stack.length-1];if(graph[a]?.length){const {b,id}=graph[a].pop();used.push(id);stack.push(b);save('push',a,b,id);}else{finished.push(stack.pop());save('pop',a);}}
 return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Itinerary=api;
})(typeof window==='undefined'?globalThis:window);
