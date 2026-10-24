(function(root){
  'use strict';
  const clone = a => a.map(x => x.slice());
  function insert(before, value) {
    const after = clone(before), probes = [];
    let lo = 0, hi = before.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2); probes.push(mid);
      if (before[mid][0] < value) lo = mid + 1; else hi = mid;
    }
    const p = lo;
    if (p > 0 && before[p-1][1] >= value)
      return {before:clone(before),after,value,p,probes,left:false,right:false,kind:'duplicate'};
    let first=p,last=p,start=value,end=value;
    const left=p>0 && before[p-1][1]+1===value;
    const right=p<before.length && before[p][0]<=value+1;
    if(left){first=p-1;start=before[first][0];}
    if(right){last=p+1;end=before[p][1];}
    after.splice(first,last-first,[start,end]);
    const duplicate=p<before.length && before[p][0]===value;
    return {before:clone(before),after,value,p,probes,left,right,
      kind:duplicate?'duplicate':left&&right?'bridge':left?'leftOnly':right?'rightOnly':'isolated'};
  }
  function trace(values){
    let state=[];
    return values.map(value=>{const frame=insert(state,value);state=clone(frame.after);return frame;});
  }
  const api={insert,trace};
  if(typeof module!=='undefined')module.exports=api;
  root.RangeCore=api;
})(typeof window==='undefined'?globalThis:window);
