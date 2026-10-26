(function(root){
'use strict';
const presets=[
 {n:2,edges:[[0,1,3]],M:2},
 {n:3,edges:[[0,1,10],[0,2,1],[1,2,2]],M:6},
 {n:4,edges:[[0,1,4],[1,2,6],[0,2,8],[1,3,1]],M:10},
 {n:5,edges:[[1,2,4],[1,4,5],[1,3,1],[2,3,4],[3,4,5]],M:17},
 {n:3,edges:[[0,1,0],[1,2,0]],M:0},
 {n:1,edges:[],M:100}
];
function trace(p){
 const d=Array(p.n).fill(Infinity),done=Array(p.n).fill(false),frames=[];d[0]=0;
 let ledger=[],total=0;
 function snap(kind,u=null,changes=[]){frames.push({kind,u,changes,d:[...d],done:[...done],ledger:ledger.map(x=>({...x})),total});}
 snap('start');
 while(true){let u=-1;for(let i=0;i<p.n;i++)if(!done[i]&&(u<0||d[i]<d[u]))u=i;
 if(u<0||!Number.isFinite(d[u]))break;
 done[u]=true;const changes=[];
 for(const [x,y,c] of p.edges){const v=x===u?y:y===u?x:-1;if(v<0)continue;const candidate=d[u]+c+1;if(candidate<d[v]){changes.push([v,d[v],candidate]);d[v]=candidate;}}
 snap('settle',u,changes);
 }
 total=d.filter(x=>x<=p.M).length;snap('original');
 for(const [u,v,c] of p.edges){const a=Math.max(0,p.M-d[u]),b=Math.max(0,p.M-d[v]),add=Math.min(c,a+b);ledger.push({u,v,c,a,b,add,before:total});total+=add;snap('edge');}
 snap('end');return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Graph882=api;
})(typeof window==='undefined'?globalThis:window);
