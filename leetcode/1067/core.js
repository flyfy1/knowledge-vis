'use strict';
(function(root){
// Teaching model for #1067. The browser runs this JavaScript; it is not the Python submission.
const presets=[{d:1,low:1,high:13},{d:3,low:100,high:250},{d:0,low:1,high:100},{d:0,low:1,high:2000},{d:2,low:1,high:200000000},{d:5,low:555,high:555}];
const LIMITS={maxHigh:200000000,handMax:999,handSpan:200,wallMax:199,bruteSpan:200000};
function occurrences(x,d){let c=0;const s=String(x),ch=String(d);for(const k of s)if(k===ch)c++;return c;}
function brute(d,low,high){let c=0;for(let x=low;x<=high;x++)c+=occurrences(x,d);return c;}
// One row per place for 1..n. rule 'correct' requires a nonzero left part when d = 0;
// rule 'naive' applies the d > 0 formula to d = 0 as well, i.e. counts leading zeros (and the number 0).
function placeRows(n,d,rule='correct'){
 const rows=[];let total=0;
 for(let power=1;power<=n;power*=10){
  const left=Math.floor(n/(power*10)),cur=Math.floor(n/power)%10,right=n%power;
  if(d===0&&rule==='correct'&&left===0){rows.push({power,left,cur,right,blocks:0,full:0,kind:'leading',partial:0,contribution:0,before:total,total});break;}
  const blocks=d===0&&rule==='correct'?left-1:left,full=blocks*power;
  const kind=cur>d?'above':cur===d?'equal':'below',partial=kind==='above'?power:kind==='equal'?right+1:0;
  const contribution=full+partial,before=total;total+=contribution;
  rows.push({power,left,cur,right,blocks,full,kind,partial,contribution,before,total});
 }
 return {rows,total};
}
function countUpto(n,d,rule='correct'){return n<=0?0:placeRows(n,d,rule).total;}
// Frames: start, each place of f(high), each place of f(low-1), final subtraction. Deep snapshots.
function trace(d,low,high,rule='correct'){
 const frames=[],done={high:[],low:[]};let side='high';
 const save=extra=>frames.push(JSON.parse(JSON.stringify({d,low,high,rule,done,...extra})));
 save({type:'start'});
 const hi=placeRows(high,d,rule);for(const r of hi.rows){done.high.push(r);save({type:'place',side:'high',n:high,row:r});}
 const fh=hi.total;save({type:'sideDone',side:'high',n:high,value:fh});
 const lo=low-1>0?placeRows(low-1,d,rule):{rows:[],total:0};for(const r of lo.rows){done.low.push(r);save({type:'place',side:'low',n:low-1,row:r});}
 const fl=lo.total;save({type:'sideDone',side:'low',n:low-1,value:fl});
 const span=high-low;save({type:'stop',fh,fl,result:fh-fl,check:span<=LIMITS.bruteSpan?brute(d,low,high):null});
 return frames;
}
// Number wall 0..N in rows of ten: which digit places hold d (a number has no leading zeros).
function wall(N,d){
 const cells=[];
 // 0 only completes the first row; the count runs over 1..N, so 0 never holds a hit.
 for(let x=0;x<=N;x++){const s=String(x),hits=[];if(x>0)for(let k=0;k<s.length;k++)if(s[k]===String(d))hits.push(s.length-1-k);cells.push({x,s,hits});}
 return cells;
}
// Place formula for the wall (d = 1..9): complete blocks of 10p numbers plus the unfinished last block.
function placeCount(N,d,p){
 const left=Math.floor(N/(10*p)),cur=Math.floor(N/p)%10,right=N%p,full=left*p,kind=cur>d?'above':cur===d?'equal':'below';
 const partial=kind==='above'?p:kind==='equal'?right+1:0;
 return {left,cur,right,full,kind,partial,count:full+partial,from:left*10*p};
}
function parse(dText,lowText,highText,max=LIMITS.maxHigh,span=Infinity){
 const ints=[dText,lowText,highText].map(v=>String(v).trim());
 if(!ints.every(v=>/^\d+$/.test(v)))return {ok:false,error:'errNumbers'};
 const [d,low,high]=ints.map(Number);
 if(d>9)return {ok:false,error:'errDigit'};
 if(low<1||high>max)return {ok:false,error:'errRange'};
 if(low>high)return {ok:false,error:'errOrder'};
 if(high-low>span)return {ok:false,error:'errSpan'};
 return {ok:true,d,low,high};
}
const api={presets,LIMITS,occurrences,brute,placeRows,countUpto,trace,wall,placeCount,parse};
root.DigitCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
