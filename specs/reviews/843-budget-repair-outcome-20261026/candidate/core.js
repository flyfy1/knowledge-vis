(function(root){
'use strict';
const score=(a,b)=>Array.from(a).reduce((s,c,i)=>s+(c===b[i]?1:0),0);
const paired=letters=>Array.from('ab').flatMap(g=>Array.from(letters,c=>g+c.repeat(5)));
const presets=[
 {words:['acckzz','ccbazz','eiowzz','abcczz'],secret:'eiowzz'},
 {words:['hamada','khaled'],secret:'khaled'},
 {words:['aaaaaa'],secret:'aaaaaa'},
 {words:['aaaaaa','bbbbbb','cccccc','dddddd','eeeeee','ffffff'],secret:'ffffff'},
 {words:['aaaaaa','aaaabb','aabbbb','bbbbbb'],secret:'aabbbb'},
 {words:paired('cdefghijkl'),secret:'blllll',budget:10},
 {words:paired('cdefghijklm'),secret:'bmmmmm',budget:11},
 {words:paired('cdefghijklmn'),secret:'bnnnnn',budget:30},
 {words:paired('cdefghijklm'),secret:'bmmmmm',budget:10}
];
function plan(words,candidates,used){
 const rows=words.map((word,i)=>{
  const buckets=Array(7).fill(0);
  candidates.forEach(j=>buckets[score(word,words[j])]++);
  return {i,word,buckets,worst:Math.max(...buckets.slice(0,6)),used:used.includes(i),candidate:candidates.includes(i)};
 });
 const legal=rows.filter(r=>!r.used).sort((a,b)=>a.worst-b.worst||Number(b.candidate)-Number(a.candidate)||a.i-b.i);
 return {rows,probe:legal[0].i};
}
// budget is disclosed teaching data, never an argument to the submission.
function trace(words,secret,budget=Infinity){
 let candidates=words.map((_,i)=>i),used=[],history=[];
 const frames=[{candidates:[...candidates],used:[],history:[],done:false}];
 while(candidates.length&&history.length<budget){
  const before=[...candidates],p=plan(words,candidates,used),guess=words[p.probe],reply=score(guess,secret);
  used.push(p.probe); candidates=candidates.filter(i=>score(guess,words[i])===reply);
  history.push({guess,reply,before,after:[...candidates]});
  frames.push({candidates:[...candidates],used:[...used],history:JSON.parse(JSON.stringify(history)),done:reply===6,exhausted:reply!==6&&history.length===budget});
  if(reply===6)break;
 }
 return frames;
}
const api={score,presets,plan,trace};
if(typeof module!=='undefined')module.exports=api;else root.WordCore=api;
})(typeof window!=='undefined'?window:globalThis);
