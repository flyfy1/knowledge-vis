'use strict';
(function(root){
 const presets=[[[1,3],[3,5]],[[1,3],[3,7],[8,9]],[[1,3],[1,4],[2,5],[3,5]],[[1,2],[2,3],[2,4],[4,5]],[[1,4],[3,4],[2,4]],[[0,1],[0,1]],[[0,1],[4,5]]];
 function trace(input){
  const ordered=input.map(x=>x.slice()).sort((a,b)=>a[1]-b[1]||b[0]-a[0]);
  let p=-1,q=-1,chosen=[];
  const frames=[{p,q,chosen:[],added:[],before:[],interval:null}];
  for(const [l,r] of ordered){const before=chosen.slice();let added=[];
   if(l>q){added=[r-1,r];p=r-1;q=r;}
   else if(l>p){added=[r];p=q;q=r;}
   chosen=chosen.concat(added);
   frames.push({p,q,chosen:chosen.slice(),added,before,interval:[l,r]});
  }
  return {ordered,frames};
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.IntersectionCore=api;
})(typeof window!=='undefined'?window:globalThis);
