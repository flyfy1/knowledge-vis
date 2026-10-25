'use strict';
(function(root){
 const presets=['aba','abc','aaa','a','abab','abca'];
 function trace(s){
  let sets={},total=0;const frames=[{k:0,char:'',old:0,newCount:0,before:0,total:0,groups:{}}];
  for(const char of s){
   const strings=Object.values(sets).flat();
   const group=['',...strings].map(x=>x+char).sort();
   const old=(sets[char]||[]).length,before=total;
   sets={...sets,[char]:group}; total=Object.values(sets).reduce((a,g)=>a+g.length,0);
   frames.push({k:frames.length,char,old,newCount:group.length,before,total,groups:JSON.parse(JSON.stringify(sets))});
  }
  return {s,frames};
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.SubseqCore=api;
})(typeof window==='undefined'?globalThis:window);
