'use strict';
(function(root) {
  const presets = [
    {matrix:[[1,-1],[-1,1]],target:0,key:'caseHand'},
    {matrix:[[0,1,0],[1,1,1],[0,1,0]],target:0,key:'caseCross'},
    {matrix:[[904]],target:0,key:'case904'},
    {matrix:[[0,0]],target:0,key:'caseZeros'},
    {matrix:[[2,-2]],target:0,key:'caseNegative'},
    {matrix:[[5]],target:5,key:'caseHit'},
    {matrix:[[1],[-1],[0]],target:0,key:'caseTall'}
  ];
  function trace(matrix,target) {
    const frames=[], ledger=[];
    let total=0;
    const save = f => frames.push(JSON.parse(JSON.stringify({...f,total,ledger})));
    for(let top=0;top<matrix.length;top++) {
      const cols=matrix[0].map(()=>0);
      for(let bottom=top;bottom<matrix.length;bottom++) {
        cols.forEach((_,c)=>cols[c]+=matrix[bottom][c]);
        let s=0,bandTotal=0;
        const seen={'0':1}, positions={'0':[0]};
        save({top,bottom,cols,c:-1,s:0,oldS:0,need:null,hits:0,matches:[],before:{},seen,bandTotal,kind:'band'});
        for(let c=0;c<cols.length;c++) {
          const oldS=s,before={...seen};
          s+=cols[c];
          const need=s-target, matches=[...(positions[need]||[])],hits=matches.length;
          bandTotal+=hits;total+=hits;
          seen[s]=(seen[s]||0)+1;
          (positions[s] ||= []).push(c+1);
          ledger.push({top,bottom,c,s,need,hits,bandTotal,total,matches});
          save({top,bottom,cols,c,s,oldS,need,hits,matches,before,seen,bandTotal,kind:'column'});
        }
      }
    }
    return frames;
  }
  const hand = [
    {top:0,bottom:0,left:0,right:1},
    {top:1,bottom:1,left:0,right:1},
    {top:0,bottom:1,left:0,right:0},
    {top:0,bottom:1,left:1,right:1},
    {top:0,bottom:1,left:0,right:1}
  ];
  const api={presets,trace,hand};
  if(typeof module!=='undefined') module.exports=api;
  root.Lesson1074=api;
})(typeof window!=='undefined'?window:globalThis);
