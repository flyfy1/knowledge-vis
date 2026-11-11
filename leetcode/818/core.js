(function(root){
'use strict';
const move=(p,s,c)=>c==='A'?[p+s,s*2]:[p,s>0?-1:1];
function trace(target){
 let front=[[0,1,'']],seen=new Set(['0,1']),rows=[{d:0,states:front}],frames=[{d:0,rows:JSON.parse(JSON.stringify(rows)),done:false}];
 while(!front.some(x=>x[0]===target)){
  const next=[];
  for(const [p,s,path] of front)for(const c of ['A','R']){const [np,ns]=move(p,s,c),key=np+','+ns;if(!seen.has(key)){seen.add(key);next.push([np,ns,path+c]);}}
  front=next;rows.push({d:rows.length,states:next});frames.push({d:rows.length-1,rows:JSON.parse(JSON.stringify(rows)),done:front.some(x=>x[0]===target)});
 }
 return frames;
}
// Presets are small enough to retain every event. This is a sorted view,
// not heapq's backing array; removing its first item matches heappop's root.
const bits=n=>n===0?0:Math.floor(Math.log2(n))+1;
function bound(target,p,s){const d=Math.abs(target-p);if(!d)return 0;return (target-p)*s>0?bits(Math.floor((d+Math.abs(s)-1)/Math.abs(s))):1+bits(d);}
const order=(a,b)=>a.f-b.f||b.g-a.g||a.p-b.p||a.s-b.s;
function searchTrace(target){
 const entry=(p,s,g)=>({p,s,g,h:bound(target,p,s),f:g+bound(target,p,s)});
 let frontier=[entry(0,1,0)],best=new Map([['0,1',0]]),generated=1,expanded=0;
 const frames=[];
 function save(kind,current=null,children=[]){frames.push({kind,current,children,frontier:frontier.map(x=>({...x,outdated:x.g!==best.get(x.p+','+x.s)})),generated,expanded,discovered:best.size});}
 save('initial');
 while(frontier.length){
  const current=frontier.shift(),{p,s,g}=current;
  if(g!==best.get(p+','+s)){save('stale',current);continue;}
  if(p===target){save('goal',current);break;}
  expanded++;
  const children=['A','R'].map(command=>{
   const [np,ns]=move(p,s,command),x=entry(np,ns,g+1),key=np+','+ns,old=best.get(key);
   const status=old===undefined?'new':x.g<old?'improved':'notBetter';
   if(status!=='notBetter'){best.set(key,x.g);frontier.push(x);generated++;}
   return {...x,command,status,previous:old};
  });
  frontier.sort(order);save('expand',current,children);
 }
 return frames;
}
const api={move,trace,bound,order,searchTrace,presets:[6,3,1,4,2]};if(typeof module!=='undefined')module.exports=api;else root.RaceCore=api;
})(typeof window==='undefined'?globalThis:window);
