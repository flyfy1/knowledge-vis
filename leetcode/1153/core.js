'use strict';
(function(root){
// Teaching model for #1153. trace() first scans positions to build the letter map (the
// check in solution.py), then — when the answer is true — actually performs a sequence of
// legal conversions and records the string after each one, so the reader can see that the
// verdict is achievable. `alphabet` defaults to the real 26 letters; smaller toy alphabets
// make the "spare letter" limit visible on short strings.
const FULL='abcdefghijklmnopqrstuvwxyz';
const presets=[
 {s:'abbc',t:'bccd',alphabet:FULL},
 {s:'abab',t:'baba',alphabet:FULL},
 {s:'abab',t:'baba',alphabet:'ab'},
 {s:'aab',t:'xyz',alphabet:FULL},
 {s:'abcab',t:'xxyxx',alphabet:FULL},
 {s:'abc',t:'bca',alphabet:'abc'},
 {s:'abcc',t:'bcaa',alphabet:'abcd'},
 {s:FULL,t:'bcdefghijklmnopqrstuvwxyza',alphabet:FULL},
 {s:FULL,t:FULL,alphabet:FULL}
];
const distinct=s=>new Set(s).size;
function convert(cur,from,to){return cur.split(from).join(to);}
// Plan legal conversions for a consistent map; returns [{from,to,kind,before,after}].
function plan(str1,str2,alphabet){
 const f={};for(let i=0;i<str1.length;i++)f[str1[i]]=str2[i];
 let cur=str1;const steps=[];
 const apply=(from,to,kind)=>{const before=cur;cur=convert(cur,from,to);steps.push({from,to,kind,before,after:cur});};
 // 1. Merge letters that share a destination: always safe (same final letter).
 const groups={};for(const x of Object.keys(f).sort())(groups[f[x]]=groups[f[x]]||[]).push(x);
 for(const [dest,xs] of Object.entries(groups))if(xs.length>1){
  const keep=xs.includes(dest)?dest:xs[0];
  for(const x of xs)if(x!==keep){apply(x,keep,'merge');delete f[x];}
 }
 // 2./3. Chains end-first; a cycle borrows a spare letter that is absent right now.
 const pending=()=>Object.keys(f).filter(x=>f[x]!==x&&cur.includes(x));
 for(let guard=0;guard<200&&pending().length;guard++){
  const ready=pending().filter(x=>!cur.includes(f[x])).sort();
  if(ready.length){const x=ready[0];apply(x,f[x],'chain');delete f[x];continue;}
  const x=pending().sort()[0],spare=[...alphabet].find(c=>!cur.includes(c));
  if(spare===undefined)throw new Error('no spare letter');
  apply(x,spare,'spare');f[spare]=f[x];delete f[x];
 }
 return {steps,final:cur};
}
function trace(str1,str2,alphabet=FULL){
 const frames=[],map={},A=alphabet.length;
 const snap=(event,extra={})=>frames.push(JSON.parse(JSON.stringify({event,map,...extra})));
 snap({type:'start',n:str1.length,A},{i:-1,current:str1,history:[],result:null});
 for(let i=0;i<str1.length;i++){
  const a=str1[i],b=str2[i];
  if(a in map&&map[a]!==b){
   let k=0;while(!(str1[k]===a&&str2[k]===map[a]))k++;
   snap({type:'conflict',i,a,b,old:map[a],k},{i,current:str1,history:[],result:false});frames[frames.length-1].final=true;return frames;
  }
  const isNew=!(a in map);map[a]=b;
  snap({type:isNew?'map':'repeat',i,a,b},{i,current:str1,history:[],result:null});
 }
 const scanned=str1.length-1;
 if(str1===str2){snap({type:'equal'},{i:scanned,current:str1,history:[],result:true});frames[frames.length-1].final=true;return frames;}
 const used=distinct(str2);
 if(used>=A){snap({type:'full',used,A},{i:scanned,current:str1,history:[],result:false});frames[frames.length-1].final=true;return frames;}
 snap({type:'spareOk',used,A},{i:scanned,current:str1,history:[],result:true});
 const {steps}=plan(str1,str2,alphabet);
 const history=[];
 steps.forEach((s,k)=>{history.push(s);snap({type:s.kind,from:s.from,to:s.to,k:k+1,total:steps.length,before:s.before,after:s.after},{i:scanned,current:s.after,history,result:true});});
 if(!steps.length)throw new Error('unequal strings need at least one conversion');
 frames[frames.length-1].final=true;
 return frames;
}
// Same rule as solution.py, with the alphabet size as a parameter (for toy alphabets).
function verdict(str1,str2,A=26){
 if(str1===str2)return true;const m={};
 for(let i=0;i<str1.length;i++){if(str1[i] in m&&m[str1[i]]!==str2[i])return false;m[str1[i]]=str2[i];}
 return distinct(str2)<A;
}
// Describe the arrows of a (partial) table as chains, cycles and fixed letters, for display.
function shapes(map){
 const keys=Object.keys(map).sort(),fixed=keys.filter(x=>map[x]===x),moving=keys.filter(x=>map[x]!==x);
 const onCycle=new Set(),cycles=[];
 for(const x of moving){if(onCycle.has(x))continue;const path=[x];let y=map[x];
  while(y in map&&map[y]!==y&&!path.includes(y)){path.push(y);y=map[y];}
  if(path.includes(y)&&!onCycle.has(y)){const cyc=path.slice(path.indexOf(y));cyc.forEach(c=>onCycle.add(c));cycles.push([...cyc,y]);}}
 const target=new Set(moving.map(x=>map[x])),chains=[];
 for(const x of moving)if(!onCycle.has(x)&&!target.has(x)){const path=[x];let y=map[x];
  while(true){path.push(y);if(!(y in map)||map[y]===y||onCycle.has(y))break;y=map[y];}chains.push(path);}
 return {chains,cycles,fixed};
}
const api={FULL,presets,trace,plan,verdict,convert,shapes};
root.ConvertCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
