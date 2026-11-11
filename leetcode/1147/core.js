'use strict';
(function(root){
const presets=['volvo','aaaa','merchant','ghiabcdefhelloadamhelloabcdefghi','antaprezatepzapreanta','a','aa','abcab'];
function trace(text){
 let left=0,right=text.length,size=1,chunks=[],history=[];
 const frames=[];
 function save(event,done=false){frames.push({left,right,size,chunks:[...chunks],history:history.map(e=>({...e})),event:event?{...event}:null,done,fixed:2*chunks.length+(done&&left<right?1:0)});}
 save(null);
 while(left<right){
  if(2*size>right-left){const e={kind:'middle',left,right,value:text.slice(left,right)};history.push(e);save(e,true);return {text,frames};}
  const a=text.slice(left,left+size),b=text.slice(right-size,right),equal=a===b;
  const e={kind:equal?'match':'miss',left,right,size,a,b};history.push(e);
  if(equal){chunks.push(a);left+=size;right-=size;size=1;}else size++;
  save(e,left===right);
 }
 return {text,frames};
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.ChunkCore=api;
})(typeof window==='undefined'?globalThis:window);
