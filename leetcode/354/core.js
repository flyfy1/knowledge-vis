(function(root){
'use strict';
const presets=[[[2,3],[5,4],[6,7]],[[5,4],[6,4],[6,7],[2,3]],[[2,2],[2,3]],[[1,1],[1,1],[1,1]],[[1,3],[2,5],[3,6],[4,2],[5,4],[6,5]],[[100000,100000]]];
function trace(input,wrong=false){
 const ordered=input.map(e=>e.slice()).sort((a,b)=>a[0]-b[0]||(wrong?a[1]-b[1]:b[1]-a[1]));
 const frames=[{tails:[],history:[]}];let tails=[],history=[];
 for(const pair of ordered){const before=tails.slice(),probes=[];let lo=0,hi=tails.length;
 while(lo<hi){const mid=Math.floor((lo+hi)/2);probes.push({lo,hi,mid,value:tails[mid]});if(tails[mid]<pair[1])lo=mid+1;else hi=mid;}
 const append=lo===tails.length;tails[lo]=pair[1];history=history.concat([{pair:pair.slice(),before,pos:lo,append,after:tails.slice(),probes}]);frames.push({tails:tails.slice(),history:JSON.parse(JSON.stringify(history))});}
 return {ordered,frames};
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Envelopes=api;
})(typeof window==='undefined'?globalThis:window);
