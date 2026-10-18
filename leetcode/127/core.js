(function(root){
'use strict';
const presets=[
{begin:'aa',end:'bb',words:['ab','bb']},
{begin:'hit',end:'cog',words:['hot','dot','dog','lot','log','cog']},
{begin:'hit',end:'cog',words:['hot','dot','dog','lot','log']},
{begin:'aaa',end:'bbb',words:['aab','bbb']},
{begin:'a',end:'c',words:['a','b','c']},
{begin:'hit',end:'cog',words:['hot','dot','dog','cog']}
];
function trace(p){
 const remaining=new Set(p.words);remaining.delete(p.begin);
 let queue=[[p.begin,1]],nodes=[{word:p.begin,d:1,parent:null,done:false}],history=[],frames=[];
 function save(event,word=null,added=[],tried=0,result=null){frames.push(JSON.parse(JSON.stringify({queue,nodes,history,event,word,added,tried,result})));}
 if(!p.words.includes(p.end)){queue=[];nodes=[];save('missing',null,[],0,0);return frames;}
 save('start');
 while(queue.length){
  const [word,d]=queue.shift();nodes.find(n=>n.word===word).done=true;
  if(word===p.end){history.push({word,d,added:[]});save('found',word,[],0,d);return frames;}
  const added=[];let tried=0;
  for(let i=0;i<word.length;i++)for(const ch of 'abcdefghijklmnopqrstuvwxyz'){
   if(ch===word[i])continue;tried++;const w=word.slice(0,i)+ch+word.slice(i+1);
   if(remaining.has(w)){remaining.delete(w);queue.push([w,d+1]);nodes.push({word:w,d:d+1,parent:word,done:false});added.push(w);}
  }
  history.push({word,d,added});save(queue.length?'expand':'empty',word,added,tried,queue.length?null:0);
 }
 return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Ladder=api;
})(typeof window!=='undefined'?window:globalThis);
