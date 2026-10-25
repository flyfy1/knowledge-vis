'use strict';
(function(root){
const presets=['ABA','ABC','LEETCODE','A','AAAA','ABAB','ABCA'];
function trace(s){
 const entries=Array.from(s,(ch,i)=>{let p=i-1,q=i+1;while(p>=0&&s[p]!==ch)p--;while(q<s.length&&s[q]!==ch)q++;const pairs=[];for(let l=p+1;l<=i;l++)for(let r=i;r<q;r++)pairs.push([l,r]);return {i,ch,p,q,left:i-p,right:q-i,value:(i-p)*(q-i),pairs};});
 return [{total:0,done:[]}].concat(entries.map((e,i)=>JSON.parse(JSON.stringify({total:entries.slice(0,i+1).reduce((a,x)=>a+x.value,0),done:entries.slice(0,i+1),current:e}))));
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.UniqueCore=api;
})(typeof window==='undefined'?globalThis:window);
