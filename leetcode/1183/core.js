'use strict';
(function(root){
// Teaching model for #1183. Rows are indexed r = 0..height-1, columns c = 0..width-1.
// Cell (r, c) belongs to class (r % s, c % s). The trace counts every class, sorts the
// sizes, then picks the largest maxOnes classes one at a time (same steps as solution.py).
const presets=[{w:5,h:4,s:2,k:2},{w:5,h:4,s:2,k:1},{w:3,h:2,s:2,k:2},{w:7,h:5,s:3,k:2},{w:6,h:6,s:3,k:4},{w:4,h:4,s:4,k:0},{w:1,h:1,s:1,k:1},{w:9,h:7,s:4,k:16}];
const LIMIT=12;
const count=(n,s,a)=>Math.floor((n-a+s-1)/s);// indices x < n with x % s == a
const letter=(a,b,s)=>a*s+b;// class id
function classes(w,h,s){const out=[];for(let a=0;a<s;a++)for(let b=0;b<s;b++){const rows=count(h,s,a),cols=count(w,s,b);out.push({a,b,id:letter(a,b,s),rows,cols,size:rows*cols});}return out;}
function sortClasses(list){return list.slice().sort((x,y)=>y.size-x.size||x.id-y.id);}
function answer(w,h,s,k){return sortClasses(classes(w,h,s)).slice(0,k).reduce((t,c)=>t+c.size,0);}
function gridFrom(w,h,s,chosenIds){const set=new Set(chosenIds),g=[];for(let r=0;r<h;r++){const row=[];for(let c=0;c<w;c++)row.push(set.has(letter(r%s,c%s,s))?1:0);g.push(row);}return g;}
function windowCount(g,s,r,c){let t=0;for(let i=0;i<s;i++)for(let j=0;j<s;j++)t+=g[r+i][c+j];return t;}
function worstWindow(g,s){let best=-1,at=null;for(let r=0;r+s<=g.length;r++)for(let c=0;c+s<=g[0].length;c++){const v=windowCount(g,s,r,c);if(v>best){best=v;at=[r,c];}}return {max:best,at};}
function overfull(g,s,k){const cells=new Set();let windows=0;for(let r=0;r+s<=g.length;r++)for(let c=0;c+s<=g[0].length;c++)if(windowCount(g,s,r,c)>k){windows++;for(let i=0;i<s;i++)for(let j=0;j<s;j++)cells.add((r+i)+','+(c+j));}return {windows,cells:[...cells]};}
// Tempting wrong turn: scan row by row, place a 1 whenever no window would exceed k.
function greedy(w,h,s,k){const g=Array.from({length:h},()=>Array(w).fill(0));
 for(let r=0;r<h;r++)for(let c=0;c<w;c++){g[r][c]=1;let ok=true;
  for(let r0=Math.max(0,r-s+1);r0<=Math.min(r,h-s)&&ok;r0++)for(let c0=Math.max(0,c-s+1);c0<=Math.min(c,w-s);c0++)if(windowCount(g,s,r0,c0)>k){ok=false;break;}
  if(!ok)g[r][c]=0;}
 return g;}
// Proof device: probabilities for the window's start in one dimension such that index x is
// covered with probability exactly 1 / (number of indices sharing x % s).
function startWeights(n,s){const G=x=>x<0?0:(Math.floor(x/s)+1)/count(n,s,x%s);const p=[];for(let x=0;x<=n-s;x++)p.push(G(x)-G(x-1));return p;}
function trace(w,h,s,k){
 const frames=[],list=classes(w,h,s),counted=[];let sorted=null;const chosen=[];let total=0;
 const snap=(event,extra={})=>frames.push(JSON.parse(JSON.stringify({event,counted,sorted,chosen,total,...extra})));
 snap({type:'start',w,h,s,k,classes:s*s});
 for(const c of list){counted.push(c);snap({type:'count',...c});}
 sorted=sortClasses(list);snap({type:'sort',order:sorted.map(c=>c.size).join(' ≥ ')});
 for(let i=0;i<k;i++){const c=sorted[i];chosen.push(c.id);const before=total;total+=c.size;snap({type:'pick',i:i+1,k,...c,before,total});}
 const g=gridFrom(w,h,s,chosen),worst=worstWindow(g,s);
 snap({type:'done',total,max:worst.max,k});frames[frames.length-1].final=true;
 return frames;
}
const api={presets,LIMIT,count,classes,sortClasses,answer,gridFrom,windowCount,worstWindow,overfull,greedy,startWeights,trace,letter};
root.OnesCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
