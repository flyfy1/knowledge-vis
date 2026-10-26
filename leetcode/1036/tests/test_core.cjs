const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const P=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {presets,trace}=require('../core.js'),expected=[false,false,true,true,true,false];let frames=0;
for(let i=0;i<presets.length;i++){
 const p=presets[i],m=trace(p);assert.equal(m.result,expected[i]);
 for(let j=0;j<m.frames.length;j++){
  const f=m.frames[j],walls=new Set(p.walls.map(String)),seen=new Set(f.seen);
  assert.equal(seen.size,f.seen.length);assert.equal(new Set(f.queue.map(String)).size,f.queue.length);
  for(const k of seen){assert(!walls.has(k));const [x,y]=k.split(',').map(Number);assert(x>=0&&y>=0&&x<1e6&&y<1e6);}
  const reachable=new Set([String(f.phase?p.t:p.s)]),q=[...reachable];for(const k of q){const [x,y]=k.split(',').map(Number);for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const n=String([a,b]);if(seen.has(n)&&!reachable.has(n)){reachable.add(n);q.push(n);}}}assert.equal(reachable.size,seen.size);
  f.queue.forEach(c=>assert(seen.has(String(c))));
  if(f.kind==='expand'){
   const old=m.frames[j-1];assert.equal(f.seen.length,old.seen.length+f.added.length);assert.deepEqual(f.current,old.queue[0]);assert.deepEqual(f.queue,[...old.queue.slice(1),...f.added]);
   f.added.forEach(c=>assert.equal(Math.abs(c[0]-f.current[0])+Math.abs(c[1]-f.current[1]),1));
  }
  if(f.kind==='escaped')assert(seen.size>m.limit);
  if(f.kind==='trapped')assert.equal(f.queue.length,0);
  if(f.kind==='reached')assert.equal(String(f.current),String(f.phase?p.s:p.t));
  frames++;
 }
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(P,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(P,'solution.py'),'utf8'));
// Catch duplicate dictionary keys before JSON parsing can overwrite them.
const raw=fs.readFileSync(path.join(P,'copy.js'),'utf8'),keys=[...raw.matchAll(/^  "([^"]+)":/gm)].map(x=>x[1]);assert.equal(keys.length,new Set(keys).size);const copy=JSON.parse(raw.replace(/^window.LESSON_COPY = /,'').replace(/;\s*$/,''));Object.values(copy).forEach(v=>assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length)));
const report={kind:'author self-check',presets:6,frames,sourceParity:true,uniqueCopyKeys:keys.length,status:'passed'};fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(report,null,2));console.log(report);
