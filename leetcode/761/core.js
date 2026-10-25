'use strict';
(function(root){
 const presets=['101100','11011000','10','111000','101010'];
 function trace(input){
  const frames=[];
  function run(s,depth){
   let balance=0,start=0,parts=[],prefix=[];
   const emit=(kind,extra={})=>frames.push({kind,s,depth,balance,start,parts:[...parts],prefix:[...prefix],...extra});
   emit('enter');
   for(let i=0;i<s.length;i++){
    balance+=s[i]==='1'?1:-1;prefix.push(balance);emit('scan',{i,bit:s[i]});
    if(balance===0){
     const block=s.slice(start,i+1),inside=s.slice(start+1,i);
     emit('descend',{block,inside});
     const inner=run(inside,depth+1);
     parts.push('1'+inner+'0');start=i+1;emit('append',{block,inner,built:'1'+inner+'0'});
    }
   }
   const before=[...parts];parts.sort().reverse();emit('sort',{before});
   const result=parts.join('');emit('return',{result});return result;
  }
  run(input,0);return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.Special=api;
})(typeof window!=='undefined'?window:globalThis);
