(function (root) {
  'use strict';
  const presets = [
    {n:5, blacklist:[1,3]},
    {n:7, blacklist:[2,3,5]},
    {n:4, blacklist:[]},
    {n:8, blacklist:[0,1,4,5,7]},
    {n:4, blacklist:[0,1,2]},
    {n:5, blacklist:[3,4]}
  ];
  function trace(n, blacklist) {
    const m = n - blacklist.length, blocked = new Set(blacklist);
    let high = m;
    const remap = {}, frames = [], log = [];
    function save(kind, b = null, old = high, target = null) {
      const event = {kind,b,old,high,target};
      if (kind !== 'start') log.push(event);
      frames.push({m,high,remap:{...remap},event,log:log.map(e=>({...e})),done:kind==='done'});
    }
    save('start');
    for (const b of blacklist) {
      if (b >= m) {save('upper', b); continue;}
      while (blocked.has(high)) {const old=high;high++;save('skip',b,old);}
      const target=high; remap[b]=high; high++; save('assign',b,target,target);
    }
    save('done');
    return frames;
  }
  function output(frame, k) {return Object.hasOwn(frame.remap,k) ? frame.remap[k] : k;}
  const api={presets,trace,output};
  if (typeof module !== 'undefined') module.exports=api;
  else root.BlacklistCore=api;
})(typeof window === 'undefined' ? globalThis : window);
