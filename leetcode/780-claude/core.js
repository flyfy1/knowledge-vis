'use strict';
(function(root){
// Each preset is [sx, sy, tx, ty].
const presets=[
 [1,1,3,5],
 [1,1,2,2],
 [1,1,1,1],
 [2,3,2,11],
 [1,1,1000000000,999999999],
 [2,3,17,10]
];
// Fresh prediction case, deliberately absent from the tracer presets.
const prediction=[3,2,5,17];
const children=([x,y])=>[[x+y,y],[x,x+y]];
function parent([x,y]){if(x>y)return {point:[x-y,y],axis:'x'};if(y>x)return {point:[x,y-x],axis:'y'};return null;}
function chain(target){const out=[{point:target,axis:null}];let p=parent(target);while(p){out.push(p);p=parent(p.point);}return out;}
function levels(start,depth){const out=[[start]];for(let d=1;d<=depth;d++)out.push(out[d-1].flatMap(children));return out;}
function trace(sx,sy,tx0,ty0){
 let tx=tx0,ty=ty0,subs=0,loops=0;const frames=[],history=[];
 function push(event,result=null){history.push(event);frames.push({tx,ty,subs,loops,event:{...event},history:history.map(e=>({...e})),result});}
 push({kind:'start',tx,ty});
 while(tx>sx&&ty>sy){
  const before=[tx,ty];loops++;
  if(tx>ty){const k=Math.floor(tx/ty);tx%=ty;subs+=k;push({kind:'foldX',bx:before[0],by:before[1],ax:tx,ay:ty,k});}
  else{const k=Math.floor(ty/tx),diag=tx===ty;ty%=tx;subs+=k;push({kind:diag?'foldDiag':'foldY',bx:before[0],by:before[1],ax:tx,ay:ty,k});}
 }
 push({kind:'stop',tx,ty,sx,sy,xs:tx>sx?'gt':tx===sx?'eq':'lt',ys:ty>sy?'gt':ty===sy?'eq':'lt'});
 if(tx===sx&&ty>=sy){const ok=(ty-sy)%sx===0,k=(ty-sy)/sx;if(ok)subs+=k;
  push({kind:ok?'tailYOk':'tailYBad',tx,ty,sx,sy,d:ty-sy,k:ok?k:Math.floor(k),r:(ty-sy)%sx,naive:ty%tx},ok);return frames;}
 if(ty===sy&&tx>=sx){const ok=(tx-sx)%sy===0,k=(tx-sx)/sy;if(ok)subs+=k;
  push({kind:ok?'tailXOk':'tailXBad',tx,ty,sx,sy,d:tx-sx,k:ok?k:Math.floor(k),r:(tx-sx)%sy,naive:tx%ty},ok);return frames;}
 push({kind:'missed',tx,ty,sx,sy},false);return frames;
}
// Independent oracle for small inputs: walk the unique parent chain one subtraction at a time.
function slow(sx,sy,tx,ty){while(tx>=sx&&ty>=sy){if(tx===sx&&ty===sy)return true;if(tx===ty)return false;if(tx>ty)tx-=ty;else ty-=tx;}return false;}
const api={presets,prediction,children,parent,chain,levels,trace,slow};
if(typeof module!=='undefined')module.exports=api;else root.ReachCore=api;
})(typeof window==='undefined'?globalThis:window);
