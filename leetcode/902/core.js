'use strict';
(function(root){
 const presets=[{digits:['1','3'],n:31},{digits:['1','3'],n:30},{digits:['1','3','5','7'],n:100},{digits:['1','4','9'],n:1000000000},{digits:['7'],n:8},{digits:['9'],n:1},{digits:['1','2','3','4','5','6','7','8','9'],n:1000000000}];
 function trace({digits,n}){
  const bound=String(n),m=digits.length,L=bound.length,frames=[];let total=0;
  function add(kind,extra,delta){const before=total;total+=delta;frames.push({kind,before,delta,total,...extra});}
  add('initial',{},0);
  for(let size=1;size<L;size++)add('short',{size,m},m**size);
  for(let i=0;i<L;i++){
   const prefix=bound.slice(0,i),current=bound[i],remaining=L-i-1;
   const rows=digits.map(d=>({digit:d,prefix:prefix+d,relation:d<current?'less':d===current?'equal':'greater',ways:d<current?m**remaining:0}));
   const matched=digits.includes(current);
   add('position',{i,prefix,current,remaining,m,rows,matched},rows.reduce((s,x)=>s+x.ways,0));
   if(!matched){add('stop',{prefix:bound.slice(0,i),current},0);return frames;}
  }
  add('exact',{n},1);return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.DigitCore=api;
})(typeof window==='undefined'?globalThis:window);
