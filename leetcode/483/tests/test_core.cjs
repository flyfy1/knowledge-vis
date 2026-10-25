'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const {trace}=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json'),'utf8'));
let rounds=0;
function check(input,expected){
 const model=trace(input),N=BigInt(input);if(expected!==undefined)assert.equal(String(model.answer),expected);
 for(const f of model.frames){
  if(!f.terms)continue;rounds++;
  assert(f.beforeLo<=f.k&&f.k<=f.beforeHi);
  assert.equal(f.k,(f.beforeLo+f.beforeHi)/2n);
  let total=0n;for(let i=0;i<f.terms.length;i++){total+=f.k**BigInt(i);assert.equal(f.terms[i],total);}
  assert.equal(total,f.total);
  assert(f.terms.length===f.m+1||f.total>N);
  if(f.kind==='high'){assert(f.total>N);assert.equal(f.hi,f.k-1n);assert.equal(f.lo,f.beforeLo);}
  if(f.kind==='low'){assert(f.total<N);assert.equal(f.lo,f.k+1n);assert.equal(f.hi,f.beforeHi);}
  if(f.kind==='equal'){assert.equal(f.total,N);assert.equal(f.terms.length,f.m+1);}
  // Independently enumerate feasible bases for small N using polynomial powers,
  // then ensure no feasible base is lost from before or after bounds.
  if(N<=300n)for(let b=2n;b<N;b++){
   let sum=0n;for(let j=0;j<=f.m;j++)sum+=b**BigInt(j);
   if(sum===N){assert(b>=f.beforeLo&&b<=f.beforeHi);assert(b>=f.lo&&b<=f.hi);}
  }
 }
 for(let i=1;i<model.frames.length;i++){
  const prev=model.frames[i-1],f=model.frames[i];assert(f.m<=prev.m);
  if(f.terms){assert.equal(f.history.length,prev.history.length+1);assert.equal(f.history.at(-1).k,f.k);}
 }
 const saved=JSON.stringify(model,(_,v)=>typeof v==='bigint'?String(v):v);
 assert.equal(saved,JSON.stringify(trace(input),(_,v)=>typeof v==='bigint'?String(v):v));
}
for(const f of fixtures)check(f.n,f.answer);
for(const [n,k] of [['13','3'],['4681','8'],['3','2'],['1000000000000000000','999999999999999999'],['16','15'],['31','2']])check(n,k);
// Detect duplicate definitions before evaluating the dictionary.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const ast=require('acorn').parse(copy,{ecmaVersion:2022});const keys=ast.body[1].expression.right.properties.map(p=>p.key.name);assert.equal(keys.length,new Set(keys).size);
const context={window:{}};vm.runInNewContext(copy,context);assert.equal(Object.keys(context.window.COPY).length,keys.length);for(const [k,v] of Object.entries(context.window.COPY)){assert.equal(v.length,2,k);assert(v.every(x=>typeof x==='string'&&x.length));}
const result={passed:true,fixtures:fixtures.length+6,rounds,checks:['independent power sums for every intermediate total','early-stop semantics','inclusive bounds and exhaustive no-loss invariant for n<=300','descending exponents','immutable cumulative history length','deterministic snapshots','unique bilingual copy keys'],copyKeys:keys.length};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
