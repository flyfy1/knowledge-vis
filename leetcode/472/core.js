'use strict';
(function(root){
 const presets=[
  {word:'catcat',words:['cat','catcat']},
  {word:'abcd',words:['ab','abc','cd','abcd']},
  {word:'cat',words:['cat']},
  {word:'aaaa',words:['a','aa','aaaa']},
  {word:'catsdog',words:['cat','dog','catsdog']},
  {word:'a',words:['a']}
 ];
 function trace({word,words}){
  const dictionary=new Set(words),n=word.length,dp=Array(n+1).fill(false);dp[0]=true;
  const frames=[],log=[];let completed=0;
  const save=e=>frames.push({word,words:[...words],dp:[...dp],completed,event:e?{...e}:null,log:log.map(x=>({...x}))});
  save(null);
  for(let i=1;i<=n;i++)for(let j=0;j<i;j++){
   const piece=word.slice(j,i),reason=j===0&&i===n?'self':!dp[j]?'unreachable':!dictionary.has(piece)?'absent':'witness';
   const before=dp[i];if(reason==='witness')dp[i]=true;
   const e={i,j,piece,reason,before,after:dp[i],source:dp[j]};
   log.push(e);if(dp[i]||j===i-1)completed=i;save(e);if(dp[i])break;
  }
  return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.ConcatLesson=api;
})(typeof window==='undefined'?globalThis:window);
