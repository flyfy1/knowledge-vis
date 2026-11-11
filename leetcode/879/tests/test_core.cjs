const fs=require('fs'),path=require('path'),assert=require('assert');
const core=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(a,k){const dp=Array.from({length:a.n+1},()=>Array(a.P+1).fill(0));for(let mask=0;mask<2**k;mask++){let u=0,p=0;for(let i=0;i<k;i++)if(mask>>i&1){u+=a.group[i];p+=a.profit[i];}if(u<=a.n)dp[u][Math.min(a.P,p)]++;}return dp;}
let cases=0,frames=0;
function check(a){const trace=core.trace(a);for(const f of trace){assert.deepStrictEqual(f.dp,oracle(a,f.k));assert.equal(f.answer,f.dp.reduce((s,r)=>s+r[a.P],0));if(f.k){assert.deepStrictEqual(f.old,oracle(a,f.k-1));const expected=f.old.map(r=>r.slice());for(const x of f.moves){assert.equal(x.count,f.old[x.u][x.p]);assert.equal(x.legal,x.u+a.group[f.k-1]<=a.n);if(x.legal)expected[x.v][x.q]+=x.count;}assert.deepStrictEqual(expected,f.dp);}frames++;}cases++;}
for(const a of core.presets)check(a);
for(let m=1;m<=3;m++)for(let code=0;code<9**m;code++){let c=code,g=[],h=[];for(let i=0;i<m;i++){g.push(c%3+1);h.push(Math.floor(c/3)%3);c=Math.floor(c/9);}for(let n=1;n<=3;n++)for(let P=0;P<=3;P++)check({n,P,group:g,profit:h});}
assert.deepEqual(core.presets.map(a=>core.trace(a).at(-1).answer),[2,7,1,4,0,0]);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({result:'pass',cases,frames,oracle:'independent subset enumeration for every prefix/cell'},null,2));console.log('Core:',cases,'cases;',frames,'prefix frames passed');
