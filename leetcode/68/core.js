'use strict';
(function(root){
 const presets=[{words:['a','bb','c','dddd'],width:8},{words:['This','is','an','example','of','text','justification.'],width:16},{words:['What','must','be','acknowledgment','shall','be'],width:16},{words:['aa','b','cc','dddd'],width:8},{words:['abcd'],width:4},{words:['a','b','c'],width:1},{words:['a','b'],width:100}];
 function trace(words,width){
  let i=0,j=0,letters=0,lines=[],frames=[];
  const snap=(kind,extra={})=>frames.push({kind,i,j,letters,lines:[...lines],...extra});
  snap('start');
  while(i<words.length){
   j=i;letters=0;
   while(j<words.length){
    const need=letters+words[j].length+j-i,accept=need<=width;
    snap('test',{candidate:words[j],need,accept});
    if(!accept)break;
    letters+=words[j].length;j++;snap('accept',{word:words[j-1]});
   }
   const g=j-i-1,S=width-letters,last=j===words.length;
   let line,q=null,r=null;
   if(last||g===0){line=words.slice(i,j).join(' ');line+=' '.repeat(width-line.length);}
   else{q=Math.floor(S/g);r=S%g;line=words.slice(i,j).map((w,k)=>w+(k<g?' '.repeat(q+(k<r)): '')).join('');}
   lines.push(line);snap('emit',{g,S,q,r,last,line});i=j;
  }
  letters=0;snap('done');return {words:[...words],width,frames};
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Justify68=api;
})(typeof window==='undefined'?globalThis:window);
