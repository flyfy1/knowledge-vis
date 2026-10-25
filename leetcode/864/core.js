'use strict';
(function(root){
const presets=[['@.aA'],['b.A.@.aB'],['@.a..','###.#','b.A.B'],['@..aA','..B#.','....b'],['@Aa'],['@abcdefABCDEF']];
const key=s=>s.join(',');
function trace(grid){
 const m=grid.length,n=grid[0].length;let start,target=0;
 grid.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='@')start=[r,c,0];if(ch>='a'&&ch<='f')target|=1<<(ch.charCodeAt(0)-97);}));
 let front=[start],seen=[{s:start,d:0}],known=new Set([key(start)]),depth=0,events=[],frames=[];
 function snap(result){frames.push(JSON.parse(JSON.stringify({depth,front,seen,events,result,target})));}
 snap(null);
 while(front.length){
  if(front.some(s=>s[2]===target)){snap(depth);break;}
  const next=[];events=[];
  for(const s of front){for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]]){
   const [r,c,mask]=s,nr=r+dr,nc=c+dc;let reason,ns=[nr,nc,mask],ch='';
   if(nr<0||nr>=m||nc<0||nc>=n)reason='bounds';
   else {ch=grid[nr][nc];if(ch==='#')reason='wall';
    else if(ch>='A'&&ch<='F'&&!(mask&(1<<(ch.charCodeAt(0)-65))))reason='lock';
    else {if(ch>='a'&&ch<='f')ns[2]|=1<<(ch.charCodeAt(0)-97);
     if(known.has(key(ns)))reason='duplicate';else{reason=ns[2]!==mask?'key':'walk';known.add(key(ns));seen.push({s:ns,d:depth+1});next.push(ns);}}
   }
   events.push({from:s,to:ns,ch,reason});
  }}
  front=next;depth++;snap(front.length?null:-1);
 }
 return frames;
}
const api={presets,trace,key};root.KeysCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
