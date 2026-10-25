const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js');
// Direct union merge: independent from floor counts and binary search.
function oracle(n,a,b){let i=1,j=1,v;for(let k=0;k<n;k++){v=Math.min(a*i,b*j);if(a*i===v)i++;if(b*j===v)j++;}return v;}
function bruteCount(x,a,b){let c=0;for(let i=1;i<=x;i++)if(i%a===0||i%b===0)c++;return c;}
let traces=0,frames=0,counts=0;
function check(p,expected){const f=core.trace(p),initialHi=p.n*Math.min(p.a,p.b);assert.equal(f[0].kind,'initial');assert.equal(f[0].lo,1);assert.equal(f[0].hi,initialHi);
 f.forEach((x,i)=>{frames++;assert(x.lo<=expected&&expected<=x.hi);assert(core.count(x.lo-1,p.a,p.b)<p.n);assert(core.count(x.hi,p.a,p.b)>=p.n);
 if(i){const prev=f[i-1];assert.equal(x.beforeLo,prev.lo);assert.equal(x.beforeHi,prev.hi);assert.equal(x.mid,Math.floor((prev.lo+prev.hi)/2));assert.equal(x.c,core.count(x.mid,p.a,p.b));assert.equal(x.c,x.ca+x.cb-x.both);assert(x.hi-x.lo<prev.hi-prev.lo);assert.equal(x.kind,x.c<p.n?'few':'enough');assert.equal(x.lo,x.c<p.n?x.mid+1:prev.lo);assert.equal(x.hi,x.c<p.n?prev.hi:x.mid);
 if(initialHi<10000)assert.equal(x.c,bruteCount(x.mid,p.a,p.b));}
 });assert.equal(f.at(-1).lo,expected);assert.equal(f.at(-1).hi,expected);assert(f.length<=47);traces++;return f;}
for(let a=2;a<=15;a++)for(let b=2;b<=15;b++){
 for(let x=0;x<=150;x++){assert.equal(core.count(x,a,b),bruteCount(x,a,b));counts++;}
 for(let n=1;n<=40;n++)check({n,a,b},oracle(n,a,b));
}
let seed=878;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for(let i=0;i<500;i++){const p={n:rand(200)+1,a:rand(39999)+2,b:rand(39999)+2};check(p,oracle(p.n,p.a,p.b));}
// Large raw expected values independently obtained by the periodic union oracle.
for(const [n,a,b,expected] of [[1e9,39999,40000,20000000000000],[1e9,2,40000,2000000000],[1e9,39999,39999,39999000000000],[1,39999,40000,39999]])check({n,a,b},expected);
const presetResults=core.presets.map(p=>({input:p,raw:p.n===1e9?p.n*p.a:oracle(p.n,p.a,p.b),trace:check(p,p.n===1e9?p.n*p.a:oracle(p.n,p.a,p.b))}));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Parse keys before evaluation so duplicate definitions cannot silently disappear.
const ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'}),obj=ast.body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression').expression.right,keys=new Set();
for(const prop of obj.properties){const key=prop.key.name||prop.key.value;assert(!keys.has(key),'duplicate '+key);keys.add(key);assert.equal(prop.value.type,'ArrayExpression');assert.equal(prop.value.elements.length,2);assert(prop.value.elements.every(e=>e.type==='Literal'&&typeof e.value==='string'&&e.value.length));}
vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),context);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/data-i18n="([^"]+)"/g))assert(keys.has(m[1]),m[1]);
fs.writeFileSync(path.join(out,'core-result.json'),JSON.stringify({result:'pass',traces,frames,counts,seed:878,copyKeys:keys.size,presets:presetResults},null,2));console.log('Core passed',traces,'traces,',frames,'frames,',counts,'counts; mirror and unique bilingual keys passed');
