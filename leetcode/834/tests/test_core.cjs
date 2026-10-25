const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js'),cases=JSON.parse(fs.readFileSync(path.join(out,'cases.json')));
let count=0;
for(const c of cases){const frames=C.trace(c),{g,parent,order}=C.prepare(c);assert.deepStrictEqual(frames.at(-1).answer,c.expected);
 const desc=u=>order.filter(v=>{let w=v;while(w!==-1&&w!==u)w=parent[w];return w===u;});
 const dist=s=>{const d=Array(c.n).fill(-1),q=[s];d[s]=0;for(const u of q)for(const v of g[u])if(d[v]===-1){d[v]=d[u]+1;q.push(v);}return d;};
 const sizes=order.map(desc);const allD=Array.from({length:c.n},(_,u)=>dist(u));
 for(const f of frames){for(let u=0;u<c.n;u++){
  const merged=f.history.filter(e=>e.kind==='merge'&&e.u===u).map(e=>e.v);const nodes=[u,...merged.flatMap(v=>sizes[order.indexOf(v)])];
  assert.strictEqual(f.size[u],nodes.length);assert.strictEqual(f.down[u],nodes.reduce((s,v)=>s+allD[u][v],0));if(f.answer[u]!==null)assert.strictEqual(f.answer[u],c.expected[u]);}
  if(f.kind==='move'){const {u,v,s,outside,value}=f.event;assert.strictEqual(s,sizes[order.indexOf(v)].length);assert.strictEqual(outside,c.n-s);assert.strictEqual(value,allD[v].reduce((a,b)=>a+b,0));for(let w=0;w<c.n;w++)assert.strictEqual(allD[v][w]-allD[u][w],sizes[order.indexOf(v)].includes(w)?-1:1);}
  count++;
 }
 const saved=JSON.stringify(frames[0]);frames.at(-1).size[0]=-77;assert.strictEqual(JSON.stringify(frames[0]),saved);
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.strictEqual(ctx.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Detect duplicate dictionary keys before JavaScript can overwrite them.
const text=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...text.matchAll(/(?:^|[,\n])\s*(\w+)\s*:\s*\[/g)].map(m=>m[1]);assert.strictEqual(new Set(keys).size,keys.length);vm.runInNewContext(text,ctx);assert.strictEqual(keys.length,Object.keys(ctx.window.COPY).length);for(const pair of Object.values(ctx.window.COPY))assert(pair.length===2&&pair.every(v=>typeof v==='string'&&v.length));
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({status:'pass',cases:cases.length,frames:count,checks:['independent BFS final and partial summaries','edge-cut per-node deltas','snapshot isolation','exact source mirror','unique bilingual keys']},null,2));console.log('Core pass:',count,'frames');
