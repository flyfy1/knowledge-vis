'use strict';
(function(root){
 function trace(input){
  const a=input.slice(),total=a.reduce((s,x)=>s+x,0),target=total/a.length;
  if(total%a.length)return {a,target:null,frames:[{rows:[],balance:0,answer:-1,kind:'impossible'}]};
  let balance=0,answer=0;const rows=[],frames=[{rows:[],balance,answer,kind:'initial'}];
  a.forEach((count,i)=>{const old=balance,d=count-target;balance+=d;answer=Math.max(answer,Math.abs(balance),d);rows.push({i,count,d,old,balance,answer});frames.push({rows:rows.map(r=>({...r})),balance,answer,kind:i===a.length-1?'finished':'partial'});});
  return {a,target,frames};
 }
 // Proof schedule: every machine that holds a dress and still owes an outflow sends one;
 // a machine owing both ways sends across its larger cut. Each move lowers the bound M by one.
 function bound(a,target){let b=0,m=0;const cuts=[];a.forEach((x,i)=>{b+=x-target;m=Math.max(m,x-target);if(i<a.length-1){cuts.push(b);m=Math.max(m,Math.abs(b));}});return {cuts,M:m};}
 function plan(input){
  const total=input.reduce((s,x)=>s+x,0),n=input.length;if(total%n)return null;
  const target=total/n;let a=input.slice();const states=[{a:a.slice(),sends:[],...bound(a,target)}];
  while(states.at(-1).M>0){
   const {cuts}=states.at(-1),next=a.slice(),sends=[];
   a.forEach((x,i)=>{
    if(!x)return;
    const left=i>0&&cuts[i-1]<0?-cuts[i-1]:0,right=i<n-1&&cuts[i]>0?cuts[i]:0;
    if(!left&&!right)return;
    const dir=right>left?1:-1;next[i]--;next[i+dir]++;sends.push([i,i+dir]);
   });
   a=next;states.push({a:a.slice(),sends,...bound(a,target)});
   if(states.length>input.length*total+5)throw Error('plan did not converge');
  }
  return {target,states};
 }
 const api={trace,plan};if(typeof module!=='undefined')module.exports=api;else root.Washing517=api;
})(typeof window==='undefined'?globalThis:window);
