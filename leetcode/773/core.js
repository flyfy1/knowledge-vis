'use strict';
(function(root){
 const neighbors=[[1,3],[0,2,4],[1,5],[0,4],[1,3,5],[2,4]];
 const presets=['123405','412503','123540','123450','012453'];
 function swap(s,j){const a=s.split(''),i=s.indexOf('0');[a[i],a[j]]=[a[j],a[i]];return a.join('');}
 function trace(start){
  let front=[start],seen=new Set(front),depth=0,history=[],sample=[],parent=null,frames=[];
  while(true){
   const result=front.includes('123450')?depth:front.length?null:-1;
   frames.push({depth,front:[...front],seen:seen.size,history:history.map(x=>({...x})),sample:sample.map(x=>({...x})),parent,result});
   if(result!==null)break;
   const next=[];sample=[];parent=front[0];
   front.forEach((s,k)=>neighbors[s.indexOf('0')].forEach(j=>{const nxt=swap(s,j),fresh=!seen.has(nxt);if(k===0)sample.push({state:nxt,fresh,tile:s[j]});if(fresh){seen.add(nxt);next.push(nxt);}}));
   history.push({depth,count:front.length,added:next.length});front=next;depth++;
  }
  return frames;
 }
 const api={neighbors,presets,swap,trace};root.PuzzleCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
