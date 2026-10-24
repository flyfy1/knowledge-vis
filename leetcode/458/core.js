(function (root) {
  'use strict';
  const presets = [
    {b:3,d:15,t:30}, {b:9,d:15,t:30}, {b:4,d:15,t:15},
    {b:4,d:15,t:30}, {b:10,d:15,t:30}, {b:1,d:15,t:30},
    {b:8,d:15,t:44}, {b:27,d:10,t:20}
  ];
  function count(b,d,t) {
    const rounds=Math.floor(t/d), states=rounds+1, ledger=[{pigs:0,capacity:1}];
    let pigs=0,capacity=1;
    while(capacity<b){capacity*=states;pigs++;ledger.push({pigs,capacity});}
    return {rounds,states,pigs,capacity,ledger};
  }
  function experiment(b,d,t,poison) {
    const meta=count(b,d,t);
    const codes=Array.from({length:b},(_,i)=>Array.from({length:meta.pigs},(_,p)=>Math.floor(i/meta.states**p)%meta.states));
    const plan=Array.from({length:meta.rounds},(_,r)=>Array.from({length:meta.pigs},(_,p)=>codes.flatMap((c,i)=>c[p]===r+1?[i+1]:[])));
    const frames=Array.from({length:meta.rounds+1},(_,elapsed)=>{
      const observed=codes[poison-1].map(x=>x>0&&x<=elapsed?x:0);
      const candidates=codes.flatMap((c,i)=>c.every((x,p)=>(x>0&&x<=elapsed?x:0)===observed[p])?[i+1]:[]);
      const history=Array.from({length:elapsed},(_,r)=>({round:r+1,time:(r+1)*d,
        feeds:plan[r].map((set,p)=>({skipped:observed[p]>0&&observed[p]<r+1,buckets:set.slice()})),
        observed:codes[poison-1].map(x=>x>0&&x<=r+1?x:0)}));
      return {elapsed,time:elapsed*d,observed,candidates,history};
    });
    return {...meta,b,d,t,poison,codes,plan,frames};
  }
  const api={presets,count,experiment};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.Pigs=api;
})(typeof window==='undefined'?globalThis:window);
