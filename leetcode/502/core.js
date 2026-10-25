(function(root){
'use strict';
const presets=[
 {k:2,w:1,c:[1,1,4],p:[1,3,5]},
 {k:2,w:0,c:[0,1,1],p:[1,2,3]},
 {k:3,w:0,c:[0,1,2],p:[1,2,3]},
 {k:3,w:0,c:[1,2],p:[4,9]},
 {k:5,w:0,c:[0,0,1],p:[0,0,9]},
 {k:4,w:2,c:[2,2,2],p:[3,3,1]}
];
const less=(a,b)=>a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
function push(h,v){h.push(v);let i=h.length-1;while(i){const p=(i-1)>>1;if(!less(h[i],h[p]))break;[h[i],h[p]]=[h[p],h[i]];i=p;}}
function pop(h){const v=h[0],last=h.pop();if(h.length){h[0]=last;let i=0;while(true){let a=2*i+1,b=a+1;if(a>=h.length)break;let q=b<h.length&&less(h[b],h[a])?b:a;if(!less(h[q],h[i]))break;[h[q],h[i]]=[h[i],h[q]];i=q;}}return v;}
function trace(input){
 const {k,c,p}=input,order=c.map((x,i)=>[x,p[i],i]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
 let w=input.w,j=0;const heap=[],done=[],ledger=[],frames=[];
 function save(kind,extra={}){frames.push(JSON.parse(JSON.stringify({kind,w,j,heap,done,ledger,order,...extra})));}
 save('start');
 for(let round=0;round<Math.min(k,c.length);round++){
  while(j<order.length&&order[j][0]<=w){const [need,profit,id]=order[j];push(heap,[-profit,id]);j++;save('admit',{id,need,profit});}
  if(!heap.length){save('stop');break;}
  const [neg,id]=pop(heap),before=w;w-=neg;done.push(id);ledger.push({id,before,profit:-neg,after:w});save('pick',{id,before,profit:-neg});
 }
 save('done');return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.IPOCore=api;
})(typeof window!=='undefined'?window:globalThis);
