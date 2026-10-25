'use strict';
(function(root){
 function suffix(k){if(!Number.isInteger(k)||k<0||k>30)throw new RangeError('k');const f=[1,2];for(let j=2;j<=k;j++)f[j]=f[j-1]+f[j-2];return f[k];}
 function strings(k){if(k===0)return [''];return Array.from({length:2**k},(_,x)=>x.toString(2).padStart(k,'0')).filter(s=>!s.includes('11'));}
 function trace(n){
  if(!Number.isInteger(n)||n<1||n>1e9)throw new RangeError('n');
  const binary=n.toString(2),width=binary.length,frames=[{kind:'initial',i:null,bit:null,add:0,total:0,prev:0,prefix:'',branch:null,done:false}];
  let total=0,prev=0,prefix='';
  for(let i=width-1;i>=0;i--){const bit=Math.floor(n/2**i)%2,before=total,branch=bit===1?prefix+'0'+'?'.repeat(i):null,add=bit===1?suffix(i):0;total+=add;prefix+=bit;
   const stop=bit===1&&prev===1;frames.push({kind:stop?'stop':bit?'one':'zero',i,bit,add,before,total,prev,prefix,branch,done:stop});if(stop)return {n,binary,width,frames};prev=bit;
  }
  frames.push({kind:'finish',i:null,bit:null,add:1,before:total,total:total+1,prev,prefix,branch:binary,done:true});
  return {n,binary,width,frames};
 }
 root.NoConsecutive={suffix,strings,trace};if(typeof module!=='undefined')module.exports=root.NoConsecutive;
})(typeof window==='undefined'?globalThis:window);
