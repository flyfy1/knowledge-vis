(function(root){
'use strict';
const presets=[20,100,133,321,1,1000000000];
function perm(a,k){let v=1;for(let j=0;j<k;j++)v*=a-j;return v;}
function trace(n){
 const digits=String(n).split('').map(Number),D=digits.length;
 let unique=0,prefix='',used=[],ledger=[],frames=[];
 const save=(kind,data={})=>frames.push(JSON.parse(JSON.stringify({kind,n,D,unique,prefix,used,ledger,...data})));
 const add=(kind,data,amount)=>{unique+=amount;ledger.push({kind,...data,amount,total:unique});save(kind,{...data,amount});};
 save('initial');
 for(let size=1;size<D;size++)add('short',{size,a:9,k:size-1},9*perm(9,size-1));
 for(let i=0;i<D;i++){
  for(let digit=i===0?1:0;digit<digits[i];digit++)if(!used.includes(digit))add('block',{i,digit,branch:prefix+digit,a:9-i,k:D-i-1},perm(9-i,D-i-1));
  if(used.includes(digits[i])){save('stop',{i,digit:digits[i],answer:n-unique});return frames;}
  prefix+=digits[i];used.push(digits[i]);save('equal',{i,digit:digits[i]});
 }
 add('include',{},1);save('done',{answer:n-unique});return frames;
}
const api={presets,perm,trace};if(typeof module!=='undefined')module.exports=api;else root.LessonCore=api;
})(typeof window==='undefined'?globalThis:window);
