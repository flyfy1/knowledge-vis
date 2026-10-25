'use strict';
(function(root){
 const MOD=1000000007;
 const digits=c=>c==='*'?'123456789':c;
 const singles=c=>[...digits(c)].filter(d=>d!=='0');
 function pairs(a,b){const out=[];for(const x of digits(a))for(const y of digits(b))if(x!=='0'&&+(x+y)<=26)out.push(x+y);return out;}
 function trace(s){
  const frames=[{i:0,a:0,b:0,one:0,two:0,value:1}];
  for(let i=1;i<=s.length;i++){
   const a=singles(s[i-1]).length,b=i>1?pairs(s[i-2],s[i-1]).length:0;
   const one=a*frames[i-1].value,two=i>1?b*frames[i-2].value:0,value=(one+two)%MOD;
   frames.push({i,a,b,one,two,value});
  }
  return {s,frames};
 }
 const api={MOD,singles,pairs,trace};root.DecodeWays=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
