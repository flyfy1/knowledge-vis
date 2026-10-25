'use strict';
(function(root) {
  const presets = [[1,2,3],[1,2,3,6],[1,2,3,4,5,6],[1,2],[5],[2,2,2]];
  function trace(rods) {
    if (!Array.isArray(rods) || rods.length > 6 || rods.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new RangeError('Teaching input bounds');
    let states = {0:{h:0,a:[],b:[]}};
    const frames = [{states, incoming:[], x:null}];
    rods.forEach((x,i) => {
      const next={}, incoming=[];
      function offer(d,h,a,b,from,kind) {
        incoming.push({d,h,from,kind});
        if (!next[d] || h > next[d].h) next[d]={h,a,b};
      }
      Object.entries(states).forEach(([key,s]) => {
        const d=Number(key), h=s.h;
        // a is the shorter support (ties arbitrary); arrays store input indices.
        offer(d,h,s.a.slice(),s.b.slice(),d,'skip');
        offer(d+x,h,s.a.slice(),[...s.b,i],d,'taller');
        const shorter=[...s.a,i];
        offer(Math.abs(d-x),h+Math.min(d,x),x<=d?shorter:s.b.slice(),x<=d?s.b.slice():shorter,d,'shorter');
      });
      states=next;
      frames.push({states,incoming,x});
    });
    return frames;
  }
  const api={presets,trace};
  if (typeof module!=='undefined') module.exports=api;
  else root.Billboard=api;
})(typeof window!=='undefined'?window:globalThis);
