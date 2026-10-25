'use strict';
(function(root){
  const pow = n => 10n ** BigInt(n);
  function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
  function frac(n,d=1n){const g=gcd(n,d);return {n:n/g,d:d/g};}
  function add(a,b){return frac(a.n*b.d+b.n*a.d,a.d*b.d);}
  function parse(s){const [integer,rest='']=s.split('.');const [finite,repeat]=rest.split('(');return {I:BigInt(integer),A:BigInt(finite||'0'),m:finite.length,B:BigInt(repeat?repeat.slice(0,-1):'0'),k:repeat?repeat.length-1:0};}
  function stages(s){const p=parse(s),base=frac(p.I),prefix=add(base,frac(p.A,pow(p.m)));return [base,prefix,add(prefix,p.k?frac(p.B,pow(p.m)*(pow(p.k)-1n)):frac(0n))];}
  const presets=[['0.1(6)','0.16(6)'],['0.(52)','0.5(25)'],['0.1666(6)','0.166(66)'],['0.9(9)','1.'],['0.(0)','0'],['9999.9999(9999)','9999.9999']];
  const api={pow,frac,add,parse,stages,presets,format:f=>`${f.n}/${f.d}`,equal:(a,b)=>a.n*b.d===b.n*a.d};
  if(typeof module!=='undefined')module.exports=api;else root.RationalCore=api;
})(typeof window!=='undefined'?window:globalThis);
