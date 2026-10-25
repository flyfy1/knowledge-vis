(function(root){
'use strict';
const presets=[[1,1,3,5],[1,1,3,17],[3,2,3,8],[3,2,3,7],[2,3,3,4],[1,1,2,2],[1,1,1,1],[1,1,1,1000000000],[5,3,4,9]];
function trace(input){
 const [sx,sy,tx,ty]=input;let x=tx,y=ty;const frames=[{x,y,kind:'start',history:[],result:null}];let history=[];
 while(x>sx&&y>sy){
  const before=[x,y],axis=x>y?'x':'y',a=axis==='x'?x:y,b=axis==='x'?y:x,q=Math.floor(a/b),r=a%b;
  if(axis==='x')x=r;else y=r;
  const row={kind:'mod',before,after:[x,y],axis,a,b,q,r};history=history.concat([row]);frames.push(JSON.parse(JSON.stringify({x,y,kind:'mod',row,history,result:null})));
 }
 let kind,result,d,b;
 if(x===sx&&y>=sy){kind='tailY';d=y-sy;b=sx;result=d%b===0;}
 else if(y===sy&&x>=sx){kind='tailX';d=x-sx;b=sy;result=d%b===0;}
 else{kind='below';result=false;}
 const row={kind,x,y,d,b,result};history=history.concat([row]);frames.push(JSON.parse(JSON.stringify({x,y,kind,row,history,result})));return frames;
}
const api={presets,trace};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ReachingCore=api;
})(typeof window==='undefined'?globalThis:window);
