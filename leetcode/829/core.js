'use strict';
(function(root){
  const presets=[5,9,15,1,8,16,45];
  function candidate(n,k){
    const offset=k*(k-1)/2, minimum=k*(k+1)/2, remaining=n-offset;
    const accepted=minimum<=n&&remaining%k===0;
    return {k,offset,minimum,remaining,remainder:remaining%k,accepted,a:accepted?remaining/k:null};
  }
  function trace(n){
    const frames=[{phase:'initial',k:1,count:0,done:[],current:null}];
    let count=0,done=[],k=1;
    while(k*(k+1)/2<=n){
      const current=candidate(n,k);if(current.accepted)count++;
      done=done.concat([current]);frames.push({phase:'tested',k,count,done:done.map(c=>({...c})),current:{...current}});k++;
    }
    frames.push({phase:'stop',k,count,done:done.map(c=>({...c})),current:candidate(n,k)});
    return frames;
  }
  const api={presets,candidate,trace};root.SumCore=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
