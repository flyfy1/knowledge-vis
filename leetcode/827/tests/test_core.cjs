const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js');const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
// Independent graph traversal for each completed component and each candidate flip.
function reach(g,r,c){const n=g.length,seen=new Set([r+','+c]),queue=[[r,c]];for(const [x,y] of queue)for(const [a,b] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]])if(a>=0&&a<n&&b>=0&&b<n&&g[a][b]&&!seen.has(a+','+b)){seen.add(a+','+b);queue.push([a,b]);}return seen;}
let frameCount=0;
for(const {grid:g,expected} of cases){const frames=C.trace(g),n=g.length;assert.equal(frames.at(-1).best,expected);let priorBest=0,old=null;
 for(const f of frames){frameCount++;assert(f.best>=priorBest);priorBest=f.best;
  for(const [id,area] of Object.entries(f.area)){if(id==='0')continue;const positions=[];f.labels.forEach((row,r)=>row.forEach((v,c)=>{if(v===+id)positions.push([r,c]);}));assert.equal(positions.length,area);const connected=reach(g,...positions[0]);assert.equal(connected.size,area);assert(positions.every(([r,c])=>connected.has(r+','+c)));}
  for(const e of f.history){const b=g.map(row=>row.slice());b[e.r][e.c]=1;assert.equal(reach(b,e.r,e.c).size,e.value);assert.equal(new Set(e.ids).size,e.ids.length);assert.equal(e.value,1+e.parts.reduce((a,b)=>a+b,0));}
  if(f.kind==='test'||f.kind==='done'){assert.equal(f.labels.flat().filter(Boolean).length,g.flat().filter(Boolean).length);const expectedBest=Math.max(0,...Object.values(f.area),...f.history.map(e=>e.value));assert.equal(f.best,expectedBest);}
  if(old&&f.kind==='test')assert.deepEqual(old.labels,f.labels);old=JSON.parse(JSON.stringify(f));
 }
 const snapshot=JSON.stringify(frames[0]);frames.at(-1).labels[0][0]=999;assert.equal(JSON.stringify(frames[0]),snapshot);
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),sandbox);for(const [key,v] of Object.entries(sandbox.window.COPY))assert(v.length===2&&v.every(x=>typeof x==='string'&&x.length),key);
// Detect duplicate definitions at source level; copy.js is generated JSON, not JS object literals.
const cp=require('child_process');cp.execFileSync('python3',['-c',`import json\nfrom pathlib import Path\ndef pairs(items):\n d={}\n for k,v in items:\n  assert k not in d,k\n  d[k]=v\n return d\ns=Path(${JSON.stringify(path.join(root,'copy.js'))}).read_text();json.loads(s[len('window.COPY = '):-2],object_pairs_hook=pairs)`]);
vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({kind:'author model self-check',result:'pass',cases:cases.length,frames:frameCount,invariants:['complete exact connected labels','all land labeled before tests','candidate area matches actual-flip reachability','best equals tested maximum','snapshot independence','source exact','duplicate keys rejected']},null,2));console.log('PASS',cases.length,'cases;',frameCount,'frames');
