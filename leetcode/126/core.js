'use strict';
(function(root){
 const presets=[
 {begin:'aa',end:'bb',words:['ab','ba','bb']},
 {begin:'hit',end:'cog',words:['hot','dot','dog','lot','log','cog']},
 {begin:'hit',end:'cog',words:['hot','dot','dog','lot','log']},
 {begin:'aa',end:'bb',words:['ab','bb','aa']},
 {begin:'a',end:'c',words:['a','b','c']},
 {begin:'aaa',end:'bbb',words:['aab','bbb']}
 ];
 function trace({begin,end,words}){
  const allowed=new Set(words),dist={[begin]:0},parents={},queue=[begin],frames=[];let target=null;
  const snap=(kind,word=null,added=[])=>frames.push(JSON.parse(JSON.stringify({kind,word,added,dist,parents,queue,target})));
  snap('initial');
  if(!allowed.has(end)){snap('absent');return frames;}
  while(queue.length){
   const word=queue.shift(),depth=dist[word];
   if(target!==null&&depth>=target)break;
   const added=[];
   for(let i=0;i<word.length;i++)for(const letter of 'abcdefghijklmnopqrstuvwxyz'){
    if(letter===word[i])continue;
    const neighbor=word.slice(0,i)+letter+word.slice(i+1);
    if(!allowed.has(neighbor))continue;
    if(dist[neighbor]===undefined){dist[neighbor]=depth+1;queue.push(neighbor);}
    if(dist[neighbor]===depth+1){(parents[neighbor]??=[]).push(word);added.push([word,neighbor]);if(neighbor===end)target=depth+1;}
   }
   snap('expand',word,added);
  }
  const answer=[],path=[end];
  function build(w){if(w===begin){answer.push([...path].reverse());return;}for(const p of parents[w]||[]){path.push(p);build(p);path.pop();}}
  if(dist[end]!==undefined)build(end);
  snap('done');frames.at(-1).answer=answer;return frames;
 }
 const api={presets,trace};root.LadderCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
