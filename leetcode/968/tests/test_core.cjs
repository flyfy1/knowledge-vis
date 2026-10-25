const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js');
function oracle(edges){let best=edges.length;for(let mask=0;mask<2**edges.length;mask++){const cameras=edges.map((_,i)=>i).filter(i=>mask>>i&1);let covered=new Set(cameras);edges.forEach(([a,b],p)=>{for(const c of [a,b])if(c>=0){if(cameras.includes(c))covered.add(p);if(cameras.includes(p))covered.add(c);}});if(covered.size===edges.length)best=Math.min(best,cameras.length);}return best;}
let cases=0,frames=0;
function check(edges){const trace=core.trace(edges),saved=JSON.stringify(trace);assert.equal(trace.at(-1).cameras.length,oracle(edges));assert.equal(core.coverage(edges,trace.at(-1).cameras).length,edges.length);
for(const f of trace){const covered=core.coverage(edges,f.cameras);assert.equal(f.cameras.length,f.states.filter(x=>x==='K').length);f.states.forEach((s,v)=>{if(s==='?')return;if(s!=='N')assert(covered.includes(v));if(v===f.node&&f.kind==='N')assert(!covered.includes(v));const descendants=[];function collect(x){for(const c of edges[x])if(c>=0){descendants.push(c);collect(c);}}collect(v);assert(descendants.every(c=>covered.includes(c)));});if(['N','C','K'].includes(f.kind)){const [l,r]=edges[f.node].map(c=>c<0?'C':f.states[c]);assert.equal(f.left,l);assert.equal(f.right,r);assert.equal(f.kind,l==='N'||r==='N'?'K':l==='K'||r==='K'?'C':'N');}frames++;}
assert.equal(JSON.stringify(trace),saved);cases++;}
core.presets.forEach(p=>check(p.edges));
function shapes(n){if(!n)return [null];let r=[];for(let k=0;k<n;k++)for(const l of shapes(k))for(const rr of shapes(n-1-k))r.push([l,rr]);return r;}
function edges(shape){const es=[];function add(s){if(!s)return -1;const v=es.length;es.push(null);es[v]=s.map(add);return v;}add(shape);return es;}
for(let n=1;n<=7;n++)for(const s of shapes(n))check(edges(s));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const copyText=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copyText.matchAll(/^  "([^"]+)": \[/gm)].map(x=>x[1]);assert.equal(keys.length,new Set(keys).size);vm.runInNewContext(copyText,ctx);for(const pair of Object.values(ctx.window.LESSON_COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length));
const result={kind:'author self-check',cases,frames,checks:['independent subset oracle','descendant coverage invariant','actual coverage versus N/K/C','child operands','camera count and identity','source parity','unique bilingual keys'],result:'pass'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
