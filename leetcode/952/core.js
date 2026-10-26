(function(root){
'use strict';
const presets=[[4,6,15,35],[20,50,9,63],[2,3,6,7,4,12,21,39],[1],[6,10,15],[1,2,3,5],[49,77,121]];
function factors(value){let x=value,out=[];for(let p=2;p*p<=x;p++){if(x%p===0){out.push(p);while(x%p===0)x/=p;}}if(x>1)out.push(x);return out;}
function trace(nums){
 const parent=nums.map((_,i)=>i),size=nums.map(()=>1),owner={},events=[],frames=[];
 function find(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
 function snapshot(){const map={};nums.forEach((v,i)=>{const r=find(i);(map[r]??=[]).push(v);});const groups=Object.values(map);frames.push({groups,owner:{...owner},events:events.map(e=>({...e})),largest:Math.max(...groups.map(g=>g.length))});}
 snapshot();nums.forEach((v,i)=>factors(v).forEach(p=>{let j=owner[p],kind='remember';if(j===undefined)owner[p]=i;else{let a=find(i),b=find(j);kind=a===b?'same':'merge';if(a!==b){if(size[a]<size[b])[a,b]=[b,a];parent[b]=a;size[a]+=size[b];}}events.push({i,p,j,kind});snapshot();}));return frames;
}
const api={presets,factors,trace};if(typeof module!=='undefined')module.exports=api;else root.FactorCore=api;
})(typeof window!=='undefined'?window:globalThis);
