'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {build}=require(path.join(root,'core.js'));
function oracle(s){let best='';for(let len=1;len<s.length;len++){const seen=new Set();for(let i=0;i+len<=s.length;i++){const w=s.slice(i,i+len);if(seen.has(w))best=w;seen.add(w);}}return best.length;}
function lcp(a,b){let h=0;while(h<a.length&&h<b.length&&a[h]===b[h])h++;return h;}
let cases=0,rounds=0,frames=0;
for(let n=2;n<=9;n++)for(let bits=0;bits<2**n;bits++)check(Array.from({length:n},(_,i)=>bits>>i&1?'a':'b').join(''));
for(const s of ['banana','abcd','cababa','ababab','abcabc','mississippi','zzxyzzab'])check(s);
function check(s){
 const m=build(s);cases++;assert.equal(m.answer.length,oracle(s));assert.deepEqual(m.sa,Array.from({length:s.length},(_,i)=>i).sort((a,b)=>s.slice(a)<s.slice(b)?-1:1));
 const snapshot=JSON.stringify(m);
 for(const f of m.rounds.slice(1)){
   rounds++;const values=f.sa.map(i=>s.slice(i,i+2*f.k));assert.deepEqual(values,values.slice().sort());
   const unique=[...new Set(values)].sort();for(const i of f.sa)assert.equal(f.rank[i],unique.indexOf(s.slice(i,i+2*f.k)));
 }
 for(const f of m.scan){
  frames++;let bestLen=0,bestStart=0;
  for(const r of f.rows){const expected=r.j===null?0:lcp(s.slice(r.i),s.slice(r.j));assert.equal(r.lcp,expected);assert.ok(r.j===null||r.before<=expected);assert.equal(r.extra,r.j===null?0:expected-r.before);assert.equal(r.carry,Math.max(0,expected-1));if(expected>bestLen){bestLen=expected;bestStart=r.i;}}
  assert.equal(f.bestLen,bestLen);assert.equal(f.bestStart,bestStart);
 }
 assert.equal(JSON.stringify(m),snapshot);
}
// Parse dictionary with Acorn before execution to catch duplicate keys.
const acorn=require('acorn');const src=fs.readFileSync(path.join(root,'copy.js'),'utf8');
const ast=acorn.parse(src,{ecmaVersion:2022});
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){const keys=n.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate copy key');}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
walk(ast);const ctx={window:{}};vm.runInNewContext(src,ctx);for(const v of Object.values(ctx.window.COPY)){assert.equal(v.length,2);v.forEach(x=>assert.equal(typeof x,'string'));}
const report={kind:'author self-check',cases,rounds,frames,copyKeys:Object.keys(ctx.window.COPY).length,duplicateKeys:false};fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
