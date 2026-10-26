(function(root){
'use strict';
const presets=[['ab','aab'],['abc','ababc'],['abca','aabcaca'],['ab','aba'],['a','aaa'],['ab','ab'],['ab','abab'],['ab','aa']];
function inspect(stamp,board,i){let bad=[],fresh=[];for(let j=0;j<stamp.length;j++){const p=i+j;if(board[p]!=='?'){fresh.push(p);if(board[p]!==stamp[j])bad.push(p);}}return {bad,fresh,legal:bad.length===0&&fresh.length>0};}
function trace(stamp,target){
 const m=stamp.length,n=target.length,waiting=Array.from({length:n},()=>[]),todo=Array(n-m+1).fill(0),queue=[],done=Array(n).fill(false),answer=[],frames=[];
 for(let i=0;i<=n-m;i++){for(let j=0;j<m;j++)if(target[i+j]!==stamp[j]){todo[i]++;waiting[i+j].push(i);}if(todo[i]===0)queue.push(i);}
 const save=(kind,i=null,fresh=[],updates=[])=>frames.push(JSON.parse(JSON.stringify({kind,i,fresh,updates,board:[...target].map((c,p)=>done[p]?'?':c).join(''),todo,queue,done,answer,erased:done.filter(Boolean).length})));
 save('setup');
 while(queue.length){const i=queue.shift(),fresh=[],updates=[];for(let p=i;p<i+m;p++){if(done[p])continue;done[p]=true;fresh.push(p);for(const w of waiting[p]){const before=todo[w];todo[w]--;updates.push({p,w,before,after:todo[w]});if(todo[w]===0)queue.push(w);}}if(fresh.length)answer.push(i);save(fresh.length?'erase':'skip',i,fresh,updates);}
 save(done.every(Boolean)?'success':'stuck');
 frames.at(-1).result=done.every(Boolean)?answer.slice().reverse():[];
 return {stamp,target,waiting,frames};
}
const api={presets,inspect,trace};if(typeof module!=='undefined')module.exports=api;else root.Stamping=api;
})(typeof window==='undefined'?globalThis:window);
