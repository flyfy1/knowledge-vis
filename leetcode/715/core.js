'use strict';
(function(root){
  const presets = [
    [['add',10,20],['remove',14,16],['query',10,14],['query',13,15],['query',16,17]],
    [['add',2,4],['add',6,8],['query',3,7],['add',4,6],['query',3,7]],
    [['add',2,9],['add',3,7],['remove',4,6],['remove',4,6],['add',4,6],['query',2,9]],
    [['query',1,2],['remove',1,8],['add',3,4],['remove',1,8],['query',3,4]],
    [['add',999999995,1000000000],['remove',999999997,999999999],['query',999999999,1000000000],['query',999999996,999999998]]
  ];
  function bound(p,x,inclusive){let lo=0,hi=p.length;while(lo<hi){const m=Math.floor((lo+hi)/2);if(p[m]<x||(inclusive&&p[m]===x))lo=m+1;else hi=m;}return lo;}
  function ranges(p){const out=[];for(let n=0;n<p.length;n+=2)out.push([p[n],p[n+1]]);return out;}
  function trace(ops){
    let p=[];const frames=[{before:[],after:[],op:null,history:[]}],history=[];
    for(const op of ops){
      const [kind,left,right]=op,before=p.slice();let i,j,replacement=[],result=null;
      if(kind==='query'){i=bound(p,left,true);j=bound(p,right,false);result=i===j&&i%2===1;}
      else{ i=bound(p,left,false);j=bound(p,right,true);const parity=kind==='add'?0:1;
        if(i%2===parity)replacement.push(left);if(j%2===parity)replacement.push(right);
        p=[...p.slice(0,i),...replacement,...p.slice(j)];
      }
      history.push({op:op.slice(),after:p.slice(),result});
      frames.push({before,after:p.slice(),op:op.slice(),i,j,replacement,result,history:JSON.parse(JSON.stringify(history))});
    }
    return frames;
  }
  const api={presets,bound,ranges,trace};root.RangeCore=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
