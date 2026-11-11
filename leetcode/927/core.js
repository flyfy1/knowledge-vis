'use strict';
(function(root){
const presets=[[1,0,1,0,1],[1,1,0,1,1],[1,1,0,0,1],[1,0,0,1,0,0,1,0,0],[1,0,1,0,1,0,0],[1,1,0,1,0,1,1,0,1],[0,0,0],[0,1,0,1,0,1]];
function value(bits){return bits.reduce((v,b)=>v*2+b,0);}
function cuts(a,i,j){const parts=[a.slice(0,i+1),a.slice(i+1,j),a.slice(j)],values=parts.map(value);return {i,j,parts,values,ok:values.every(v=>v===values[0])};}
function baseline(a){const rows=[];for(let i=0;i<a.length-2;i++)for(let j=i+2;j<a.length;j++)rows.push(cuts(a,i,j));return rows;}
function trace(a){
 const n=a.length,ones=a.reduce((s,b)=>s+b,0),frames=[{kind:'count',ones}],k=ones/3;
 if(ones===0){frames.push({kind:'zero',ones,result:[0,2]});return frames;}
 if(ones%3){frames.push({kind:'countFail',ones,result:[-1,-1]});return frames;}
 const positions=[];a.forEach((b,i)=>{if(b)positions.push(i);});const starts=[positions[0],positions[k],positions[2*k]],length=n-starts[2],base={ones,k,starts,length};
 if(starts[0]+length>starts[1]||starts[1]+length>starts[2]){frames.push({...base,kind:'gapFail',result:[-1,-1]});return frames;}
 frames.push({...base,kind:'starts'});
 for(let offset=0;offset<length;offset++){
  const bits=starts.map(s=>a[s+offset]),ok=bits.every(b=>b===bits[0]);
  frames.push({...base,kind:ok?'match':'mismatch',offset,bits,ok,...(!ok?{result:[-1,-1]}:{})});
  if(!ok)return frames;
 }
 frames.push({...base,kind:'success',result:[starts[0]+length-1,starts[1]+length]});return frames;
}
const api={presets,value,cuts,baseline,trace};root.ThreeParts=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
