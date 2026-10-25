const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),C=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(s){let words=[''];for(const c of s)words=words.concat(words.map(w=>w+c));return new Set(words.filter(w=>w&&w===Array.from(w).reverse().join('')));}
let cases=0,intervals=0;
function check(s){
 const frames=C.trace(s);assert.equal(frames.length,1+s.length*(s.length+1)/2);
 assert(frames[0].dp.every(r=>r.every(v=>v===null)));
 for(let k=1;k<frames.length;k++){
  const f=frames[k],expected=oracle(s.slice(f.i,f.j+1));assert.equal(f.value,expected.size);
  assert.deepEqual(new Set(C.palindromes(s.slice(f.i,f.j+1))),expected);
  for(const g of f.groups)assert.equal(g.count,[...expected].filter(w=>w[0]===g.c).length);
  for(let a=0;a<s.length;a++)for(let b=a;b<s.length;b++)if(f.dp[a][b]!==null)assert.equal(f.dp[a][b],oracle(s.slice(a,b+1)).size);
  const prev=frames[k-1];assert.equal(prev.dp[f.i][f.j],null);assert.equal(f.dp[f.i][f.j],f.value);intervals++;
 }
 cases++;
}
for(let n=1;n<=6;n++)for(let m=0;m<2**n;m++)check(Array.from({length:n},(_,i)=>m>>i&1?'a':'b').join(''));
for(let n=1;n<=4;n++)for(let m=0;m<4**n;m++){let v=m,s='';for(let i=0;i<n;i++){s+='abcd'[v%4];v=Math.floor(v/4);}check(s);}
for(const s of C.presets)check(s);
const vm=require('node:vm');const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),context);
for(const [k,v]of Object.entries(context.window.LESSON_COPY))assert(v.length===2&&v.every(x=>typeof x==='string'&&x.length),k);
const result={kind:'author self-check',cases,intervals,copyPairShape:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
