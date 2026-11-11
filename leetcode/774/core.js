'use strict';
(function(root){
// Teaching model for #774. The browser runs this JavaScript; it is not the Python submission.
const EPS=1e-6;
const presets=[
 {stations:[0,4,10],k:3},
 {stations:[0,6],k:2},
 {stations:[1,2,3,4,5,6,7,8,9,10],k:9},
 {stations:[23,24,36,39,46,56,57,65,84,98],k:1},
 {stations:[0,1,100],k:1},
 {stations:[0,3,6,9],k:3}
];
const LIMITS={minStations:2,maxStations:12,maxPosition:1000,minK:1,maxK:40};
function gaps(stations){const g=[];for(let i=1;i<stations.length;i++)g.push(stations[i]-stations[i-1]);return g;}
// Stations a gap of length g needs so that every piece is at most limit long.
function needFor(g,limit){return Math.ceil(g/limit)-1;}
function need(gs,limit){const each=gs.map(g=>needFor(g,limit));return {each,total:each.reduce((a,b)=>a+b,0)};}
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
// Exact optimum by integer comparisons: give each station to the gap whose evenly spaced
// piece g/(c+1) is longest. Used to display D* beside the search, never by the search itself.
function exact(stations,k){
 const gs=gaps(stations),counts=gs.map(()=>0);
 const longer=(i,j)=>gs[i]*(counts[j]+1)>gs[j]*(counts[i]+1);
 for(let s=0;s<k;s++){let best=0;for(let i=1;i<gs.length;i++)if(longer(i,best))best=i;counts[best]++;}
 let worst=0;for(let i=1;i<gs.length;i++)if(longer(i,worst))worst=i;
 const num=gs[worst],den=counts[worst]+1,d=gcd(num,den);
 return {num:num/d,den:den/d,value:num/den,counts};
}
function parse(stationsText,kText){
 const parts=String(stationsText).split(/[\s,，]+/).filter(Boolean);
 if(!parts.every(p=>/^\d+$/.test(p)))return {ok:false,error:'errNumbers'};
 const stations=parts.map(Number),k=/^\d+$/.test(String(kText).trim())?Number(String(kText).trim()):NaN;
 if(stations.length<LIMITS.minStations||stations.length>LIMITS.maxStations)return {ok:false,error:'errCount'};
 if(stations.some(x=>x>LIMITS.maxPosition))return {ok:false,error:'errRange'};
 for(let i=1;i<stations.length;i++)if(stations[i]<=stations[i-1])return {ok:false,error:'errOrder'};
 if(!Number.isInteger(k)||k<LIMITS.minK||k>LIMITS.maxK)return {ok:false,error:'errK'};
 return {ok:true,stations,k};
}
// One frame per completed binary-search round; deep copies so rewinding restores everything.
function trace(stations,k){
 const gs=gaps(stations),star=exact(stations,k),frames=[],history=[];
 let lo=0,hi=Math.max(...gs),round=0;
 const save=extra=>frames.push(JSON.parse(JSON.stringify({lo,hi,round,history,star:{num:star.num,den:star.den,value:star.value},gaps:gs,k,...extra})));
 save({type:'start'});
 while(hi-lo>EPS){
  const mid=(lo+hi)/2,n=need(gs,mid),ok=n.total<=k,before={lo,hi};
  if(ok)hi=mid;else lo=mid;round++;
  history.push({round,lo:before.lo,hi:before.hi,mid,total:n.total,ok});
  save({type:'round',mid,each:n.each,total:n.total,ok,before});
 }
 save({type:'stop',result:hi});
 return frames;
}
// Stations needed on a grid of promised limits (step 2 staircase).
function staircase(stations,k,step=0.5){
 const gs=gaps(stations),top=Math.max(...gs),rows=[];
 for(let d=step;d<=top+1e-9;d+=step){const n=need(gs,d);rows.push({d:Math.round(d*1000)/1000,each:n.each,total:n.total,ok:n.total<=k});}
 return rows;
}
const api={EPS,LIMITS,presets,gaps,needFor,need,exact,parse,trace,staircase};
root.GasCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
