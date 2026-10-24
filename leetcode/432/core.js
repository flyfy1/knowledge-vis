/* Bounded teaching simulation. Arrays represent sorted buckets, not submission runtime. */
(function(root){
 const presets=[
 [['inc','tea'],['inc','tea'],['inc','bun'],['getMinKey'],['inc','bun'],['getMaxKey']],
 [['inc','a'],['inc','b'],['inc','b'],['inc','b'],['inc','c'],['inc','c'],['inc','c'],['inc','c'],['inc','c'],['dec','a'],['inc','b'],['dec','c']],
 [['getMinKey'],['getMaxKey'],['inc','x'],['inc','y'],['dec','x'],['dec','y'],['getMinKey']],
 [['inc','red'],['inc','red'],['inc','red'],['inc','blue'],['inc','blue'],['dec','red'],['dec','blue'],['dec','blue']]
 ];
 function trace(ops){
  let counts={},groups=[];const snap=()=>({counts:{...counts},groups:groups.map(g=>({c:g.c,keys:[...g.keys]}))});
  let frames=[{kind:'initial',before:snap(),after:snap()}];
  for(const [op,key] of ops){
   const before=snap();let f={kind:op,key,before};
   if(op==='inc'||op==='dec'){
    const a=counts[key]||0,b=a+(op==='inc'?1:-1);if(b<0)throw Error('Invalid decrement');
    const old=groups.find(g=>g.c===a);let target=groups.find(g=>g.c===b);f.a=a;f.b=b;f.reused=!!target;
    if(old)old.keys.splice(old.keys.indexOf(key),1);
    if(b){if(!target){target={c:b,keys:[]};groups.push(target);groups.sort((x,y)=>x.c-y.c);}target.keys.unshift(key);counts[key]=b;}else delete counts[key];
    f.dropped=!!old&&!old.keys.length;groups=groups.filter(g=>g.keys.length);
   }else {const g=groups[op==='getMinKey'?0:groups.length-1];f.result=g?g.keys[0]:'';}
   f.after=snap();frames.push(f);
  }return frames;
 }
 const api={presets,trace};root.AllOneLesson=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
