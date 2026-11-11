'use strict';
(function(root){
const TURN={'0':'0','1':'1','6':'9','8':'8','9':'6'};
const TURNABLE=[0,1,6,8,9];
const PAIRS=[['0','0'],['1','1'],['6','9'],['8','8'],['9','6']];
const MAX_N=1000000000;
const presets=[70,6189,8250,1,10,69,1000000000];
const clone=x=>JSON.parse(JSON.stringify(x));
function validN(n){return Number.isInteger(n)&&n>=1&&n<=MAX_N;}
// Step 1: read the digits from the right and turn each one.
function turnDetail(x){
 const s=String(x),cells=[];let ok=true,out='';
 for(let i=s.length-1;i>=0;i--){const d=s[i],to=d in TURN?TURN[d]:null;if(to===null)ok=false;else out+=to;cells.push({from:d,to});}
 const result=ok?Number(out):null;
 return {digits:[...s],cells,ok,raw:ok?out:null,result,kind:!ok?'invalid':result===x?'self':'confusing'};
}
function classify(x){return turnDetail(x).kind;}
// Step 3: brute-force picture of 1..limit.
function grid(limit){
 const cells=[];let invalid=0,self=0,confusing=0;
 for(let x=1;x<=limit;x++){const k=classify(x);cells.push({x,kind:k});if(k==='invalid')invalid++;else if(k==='self')self++;else confusing++;}
 return {cells,invalid,survivors:self+confusing,self,confusing};
}
// Step 5: all digit strings of a length that read the same after turning (leading zero allowed here).
function build(length){
 if(length===0)return [''];
 if(length===1)return ['0','1','8'];
 const inner=build(length-2),out=[];
 for(const [a,b] of PAIRS)for(const mid of inner)out.push(a+mid+b);
 return out;
}
function selfNumbers(length){return build(length).filter(t=>t[0]!=='0').map(Number).sort((a,b)=>a-b);}
// The full count used by the step-6 experiment. Each frame is a deep snapshot after one completed action.
function trace(n){
 if(!validN(n))throw new RangeError('n must be an integer in 1..1e9');
 const s=String(n),L=s.length,frames=[],ledger=[];
 let survivors=0,same=0;
 const push=(event,extra={})=>frames.push(clone({event,survivors,same,ledger,n,digits:[...s],...extra}));
 push({type:'start',L});
 for(let length=1;length<L;length++){
  const add=4*5**(length-1);survivors+=add;
  ledger.push({phase:'shorter',length,add,survivors,same});
  push({type:'shorter',length,add});
 }
 let allTurnable=true;
 for(let i=0;i<L;i++){
  const d=Number(s[i]),lower=TURNABLE.filter(v=>v<d&&(i>0||v>0)),rest=L-1-i,add=lower.length*5**rest;
  survivors+=add;const turnable=TURNABLE.includes(d);
  ledger.push({phase:'prefix',pos:i,digit:d,lower,rest,add,turnable,survivors,same});
  push({type:'prefix',pos:i,digit:d,lower,rest,add,turnable});
  if(!turnable){allTurnable=false;break;}
 }
 if(allTurnable){survivors+=1;ledger.push({phase:'itself',add:1,survivors,same});push({type:'itself',add:1});}
 for(let length=1;length<=L;length++){
  const list=selfNumbers(length),kept=list.filter(v=>v<=n).length;same+=kept;
  // Visible sample: everything when short, otherwise a window around the cut at n.
  let start=0,end=list.length;
  if(list.length>16){start=Math.max(0,Math.min(kept-8,list.length-16));end=start+16;}
  const sample=list.slice(start,end).map(v=>({v,kept:v<=n}));
  ledger.push({phase:'self',length,total:list.length,kept,survivors,same});
  push({type:'self',length,total:list.length,kept,sample,before:start,after:list.length-end});
 }
 push({type:'final',answer:survivors-same},{answer:survivors-same});
 return frames;
}
function solve(n){return trace(n).at(-1).answer;}
const api={TURN,TURNABLE,PAIRS,MAX_N,presets,validN,turnDetail,classify,grid,build,selfNumbers,trace,solve};
root.ConfusingCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
