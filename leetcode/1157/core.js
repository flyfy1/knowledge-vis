'use strict';
(function(root){
 const merge=(a,b)=>a[0]===b[0]?[a[0],a[1]+b[1]]:a[1]>b[1]?[a[0],a[1]-b[1]]:b[1]>a[1]?[b[0],b[1]-a[1]]:[0,0];
 const presets=[
  {arr:[1,1,2,2,1,1],left:0,right:5,threshold:4},
  {arr:[1,1,2,2,1,1],left:0,right:3,threshold:3},
  {arr:[1,1,2,2,1,1],left:2,right:3,threshold:2},
  {arr:[1,2,3],left:0,right:2,threshold:2},
  {arr:[7,7,7,7,7],left:1,right:4,threshold:4},
  {arr:[20000],left:0,right:0,threshold:1},
  {arr:[1,1,1,2,2],left:0,right:4,threshold:4}
 ];
 function build(arr){
  let size=1;while(size<arr.length)size*=2;
  const tree=Array.from({length:size*2},()=>[0,0]),bounds=Array(size*2);
  for(let i=0;i<size;i++){tree[size+i]=i<arr.length?[arr[i],1]:[0,0];bounds[size+i]=[i,i];}
  for(let i=size-1;i;i--){tree[i]=merge(tree[2*i],tree[2*i+1]);bounds[i]=[bounds[2*i][0],bounds[2*i+1][1]];}
  return {size,tree,bounds};
 }
 function boundary(a,x,upper){let l=0,r=a.length;while(l<r){const m=(l+r)>>1;if(a[m]<x||(upper&&a[m]===x))l=m+1;else r=m;}return l;}
 function trace(p){
  const {size,tree,bounds}=build(p.arr),blocks=[];let lo=p.left+size,hi=p.right+size+1;
  while(lo<hi){if(lo%2){blocks.push(lo);lo++;}if(hi%2){--hi;blocks.push(hi);}lo=Math.floor(lo/2);hi=Math.floor(hi/2);}
  const frames=[{summary:[0,0],used:[],kind:'start'}];
  for(const id of blocks){const prev=frames[frames.length-1];frames.push({summary:merge(prev.summary,tree[id]),used:[...prev.used,id],kind:'block',id,before:prev.summary});}
  const prev=frames[frames.length-1],candidate=prev.summary[0];
  const positions=p.arr.flatMap((v,i)=>v===candidate?[i]:[]);
  const low=boundary(positions,p.left,false),high=boundary(positions,p.right,true),count=high-low;
  frames.push({summary:[...prev.summary],used:[...prev.used],kind:'verify',positions,low,high,count,result:prev.summary[1]>0&&count>=p.threshold?candidate:-1});
  return {...p,size,tree,bounds,blocks,frames};
 }
 function hand(arr){
  let survivors=[],pairs=[];const frames=[{survivors:[],pairs:[],kind:'handStart',i:-1}];
  arr.forEach((v,i)=>{let kind;if(!survivors.length){survivors.push(i);kind='adopt';}else if(arr[survivors[0]]===v){survivors.push(i);kind='equal';}else{pairs.push([survivors.pop(),i]);kind='cancel';}frames.push({survivors:[...survivors],pairs:pairs.map(p=>[...p]),kind,i});});
  return frames;
 }
 const api={merge,build,trace,hand,presets,boundary};if(typeof module!=='undefined')module.exports=api;else root.MajorityCore=api;
})(typeof window!=='undefined'?window:globalThis);
