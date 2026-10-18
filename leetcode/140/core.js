(function(root){
'use strict';
const presets=[
 {s:'aaa',words:['a','aa']},
 {s:'catsanddog',words:['cat','cats','and','sand','dog']},
 {s:'catsandog',words:['cats','dog','sand','and','cat']},
 {s:'aaaa',words:['aa']},
 {s:'b',words:['a']},
 {s:'a',words:['a']},
 {s:'abcdefghij',words:['abcdefghij']}
];
function trace({s,words}){
 const n=s.length,L=Math.max(...words.map(w=>w.length)),dict=new Set(words);
 const values=Array(n+1).fill(null);values[n]=[''];
 const frames=[],log=[];
 const save=(event,done)=>frames.push(JSON.parse(JSON.stringify({s,words,values,event,done,log})));
 save(null,n);
 for(let i=n-1;i>=0;i--){
  values[i]=[];
  for(let j=i+1;j<=Math.min(n,i+L);j++){
   const word=s.slice(i,j),match=dict.has(word),before=values[i].slice();
   const added=match?values[j].map(tail=>word+(tail?' '+tail:'')):[];
   values[i].push(...added);
   const event={i,j,word,match,before,added,after:values[i].slice(),last:j===Math.min(n,i+L)};
   log.push(event);save(event,event.last?i:i+1);
  }
 }
 return frames;
}
const api={presets,trace};
if(typeof module!=='undefined')module.exports=api;else root.WordBreakLesson=api;
})(typeof window==='undefined'?globalThis:window);
