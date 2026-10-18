(function(root){
'use strict';
const presets=[[2,5,1,4],[3,3,5,0,0,3,1,4],[1,2,3,4,5],[7,6,4,3,1],[5],[0,0,0],[1,3,2,4,3,5]];
function trace(prices){
 const frames=[{day:0,values:[-Infinity,0,-Infinity,0],old:null,candidates:null,price:null}];
 for(const p of prices){const old=frames[frames.length-1].values.slice();const candidates=[-p,old[0]+p,old[1]-p,old[2]+p];frames.push({day:frames.length,old,candidates,price:p,values:old.map((x,i)=>Math.max(x,candidates[i]))});}return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.StockCore=api;
})(typeof window==='undefined'?globalThis:window);
