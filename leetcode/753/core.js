(function(root){
'use strict';
const presets=[[2,2],[1,2],[3,2],[4,1],[2,3]];
function trace(n,k){
 const V=k**(n-1),next=Array(V).fill(0),stack=[[0,null]],finished=[],used=[],frames=[];
 function save(op){frames.push({op,stack:stack.map(x=>x.slice()),next:next.slice(),finished:finished.slice(),used:used.slice()});}
 save({kind:'initial'});
 while(stack.length){
  const [v,d]=stack[stack.length-1];
  if(next[v]<k){const digit=next[v]++,edge=v*k+digit,target=edge%V;used.push(edge);stack.push([target,digit]);save({kind:'push',v,digit,edge,target});}
  else{stack.pop();if(d!==null)finished.push(String(d));save({kind:'pop',v,digit:d});}
 }
 return frames;
}
function word(v,width,k){if(!width)return 'ε';let out='';for(let i=0;i<width;i++){out=String(v%k)+out;v=Math.floor(v/k);}return out;}
const api={presets,trace,word};if(typeof module!=='undefined')module.exports=api;root.SafeCore=api;
})(typeof window==='undefined'?globalThis:window);
