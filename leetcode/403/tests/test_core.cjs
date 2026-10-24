const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {trace,presets}=require('../core.js');
// Independent incoming-edge DP: compare each pair of stones and predecessor lengths.
function expected(a){const r=Object.fromEntries(a.map(x=>[x,new Set()]));r[0].add(0);for(let j=1;j<a.length;j++)for(let i=0;i<j;i++){const d=a[j]-a[i];for(const k of r[a[i]])if(Math.abs(k-d)<=1)r[a[j]].add(d);}return r;}
let count=0,framesChecked=0;
const cases=[...presets,[0,1,2,4,7,11],[0,1,2147483647]];
for(let mask=1;mask<2048;mask++)cases.push([0,...Array.from({length:11},(_,i)=>i+1).filter((_,i)=>mask>>i&1)]);
let seed=403;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};for(let i=0;i<500;i++){const a=[0];for(let j=1;j<40;j++)if(rnd()%5===0)a.push(j);if(a.length===1)a.push(39);cases.push(a);}
for(const a of cases){const want=expected(a),frames=trace(a),processed=[];for(const f of frames){
 const partial=Object.fromEntries(a.map(x=>[x,new Set()]));partial[0].add(0);
 if(f.x!==null)processed.push([f.x,f.k]);
 for(const [x,k]of processed)for(const y of a)if(y>x&&Math.abs((y-x)-k)<=1)partial[y].add(y-x);
 for(const x of a){assert.deepEqual(f.r[x],[...partial[x]].sort((a,b)=>a-b));for(const k of f.r[x])assert(want[x].has(k));if(f.x!==null&&x<=f.x)assert.deepEqual(f.r[x],[...want[x]].sort((a,b)=>a-b));}
 if(f.x!==null)for(const c of f.candidates){assert.equal(c.target,f.x+c.jump);assert.equal(c.reason==='nonpositive',c.jump<=0);assert.equal(c.reason==='water',c.jump>0&&!a.includes(c.target));}
 framesChecked++;
 }
 assert.deepEqual(frames.at(-1).r,Object.fromEntries(a.map(x=>[x,[...want[x]].sort((a,b)=>a-b)])));
 const encoded=JSON.stringify(frames[0]);frames.at(-1).r[0].push(999);assert.equal(JSON.stringify(frames[0]),encoded);count++;
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(P,'copy.js'),'utf8'),context);const entries=Object.entries(context.window.COPY);assert(entries.every(([k,v])=>v.length===2&&v.every(x=>typeof x==='string'&&x.length)));
const acorn=require('acorn');const ast=acorn.parse(fs.readFileSync(path.join(P,'copy.js'),'utf8'),{ecmaVersion:'latest'});function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const keys=node.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate localization key');}for(const v of Object.values(node))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(ast);
const report={kind:'author self-check',cases:count,frames:framesChecked,invariants:'exact partial sets, soundness, completeness at processed coordinates, candidate rejection semantics, snapshot independence',localizationKeys:entries.length,duplicateKeys:0};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2));console.log(report);
