'use strict';
(function(root){
 const presets=[[1,2,3],[1,1,4],[3,1],[0],[0,0],[1,2,3,4,5,6,7,8],[1,1,1,9]];
 const sorted=s=>[...s].sort((a,b)=>a-b);
 function trace(input){
  const nums=input.slice(),n=nums.length,total=nums.reduce((a,b)=>a+b,0),mid=Math.floor(n/2);
  const sizes=Array.from({length:mid},(_,i)=>i+1).filter(k=>total*k%n===0);
  let left=[new Set([0])],right=[new Set([0])];
  const frames=[];
  function push(event,done=false,result=null){frames.push({left:left.map(sorted),right:right.map(sorted),event:JSON.parse(JSON.stringify(event)),done,result});}
  push({type:'initial'});
  if(!sizes.length){push({type:'noSize'},true,false);return {nums,n,total,mid,sizes,frames,result:false};}
  for(const side of ['left','right']){
   const values=side==='left'?nums.slice(0,mid):nums.slice(mid);
   values.forEach((x,pos)=>{
    const old=side==='left'?left:right;
    const fresh=old.map(s=>new Set(s));fresh.push(new Set());
    old.forEach((sums,i)=>sums.forEach(s=>fresh[i+1].add(s+x)));
    if(side==='left')left=fresh;else right=fresh;
    push({type:'build',side,x,pos,old:old.map(sorted)});
   });
  }
  for(const k of sizes){
   const target=total*k/n;
   for(let i=Math.max(0,k-(n-mid));i<=Math.min(k,mid);i++){
    const j=k-i,checks=sorted(left[i]).map(a=>({a,need:target-a,hit:right[j].has(target-a)}));
    const match=checks.find(c=>c.hit)||null;
    push({type:'probe',k,i,j,target,checks,match},!!match,match?true:null);
    if(match)return {nums,n,total,mid,sizes,frames,result:true};
   }
  }
  push({type:'exhausted'},true,false);
  return {nums,n,total,mid,sizes,frames,result:false};
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.AverageCore=api;
})(typeof window==='undefined'?globalThis:window);
