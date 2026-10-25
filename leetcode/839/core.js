'use strict';
(function(root){
 const presets=[['tars','rats','arts','star'],['omv','ovm'],['a'],['abc','abc','abc'],['abc','bca'],['abc','bac','bca'],['aab','aba','baa']];
 const differences=(a,b)=>Array.from(a,(_,i)=>i).filter(i=>a[i]!==b[i]);
 function trace(words){
  const parent=words.map((_,i)=>i),size=words.map(()=>1),frames=[],history=[];let count=words.length;
  const find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;};
  const rootOf=x=>{while(parent[x]!==x)x=parent[x];return x;};
  function save(event){const groups=[];for(let i=0;i<words.length;i++){const r=rootOf(i);let g=groups.find(g=>g.root===r);if(!g){g={root:r,members:[]};groups.push(g);}g.members.push(i);}frames.push({parent:[...parent],size:[...size],count,groups,event,history:history.map(e=>({...e,diff:[...e.diff]}))});}
  save(null);
  for(let i=0;i<words.length;i++)for(let j=i+1;j<words.length;j++){
   const diff=differences(words[i],words[j]),before=count;let kind='rejected';
   if(diff.length===0||diff.length===2){let a=find(i),b=find(j);kind='already';if(a!==b){if(size[a]<size[b])[a,b]=[b,a];parent[b]=a;size[a]+=size[b];count--;kind='merged';}}
   const event={i,j,diff,before,after:count,kind};history.push(event);save(event);
  }
  return frames;
 }
 const api={presets,differences,trace};if(typeof module!=='undefined')module.exports=api;root.SimilarCore=api;
})(typeof window==='undefined'?globalThis:window);
