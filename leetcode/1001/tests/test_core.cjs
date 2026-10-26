const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const core=require('../core.js');
const data=JSON.parse(fs.readFileSync(0,'utf8'));let snapshots=0;
function independent(n,lamps,queries){let a=new Set(lamps.map(String)),ans=[];for(const [r,c] of queries){ans.push(+[...a].some(k=>{const [x,y]=k.split(',').map(Number);return x===r||y===c||Math.abs(x-r)===Math.abs(y-c);}));a=new Set([...a].filter(k=>{const [x,y]=k.split(',').map(Number);return Math.abs(x-r)>1||Math.abs(y-c)>1;}));}return ans;}
for(const p of [...data,...core.presets]){
 const frames=core.trace(p);assert.deepEqual(frames.at(-1).ans,p.expected||independent(p.n,p.lamps,p.queries));
 for(const f of frames){
  const maps=[{},{},{},{}];for(const [r,c] of f.active)[r,c,r-c,r+c].forEach((k,i)=>maps[i][k]=(maps[i][k]||0)+1);
  assert.deepEqual(f.maps,maps);assert.equal(f.ans.length,f.history.length);
  const qDone=f.history.length;
  assert.deepEqual(f.ans,independent(p.n,p.lamps,p.queries.slice(0,qDone)));
  if(f.phase==='read'){const prev=frames[frames.indexOf(f)-1];assert.deepEqual(f.active,prev.active);}
  snapshots++;
 }
 if(frames.length>1){const saved=JSON.stringify(frames[0]);frames.at(-1).active.push([99,99]);assert.equal(JSON.stringify(frames[0]),saved);}
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(require.resolve('../solution.py'),'utf8'));
const copy=fs.readFileSync(require.resolve('../copy.js'),'utf8');const keys=[...copy.matchAll(/(?:^|,)\s*([A-Za-z]\w*)\s*:\s*\[/gm)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);assert(keys.length>90);vm.runInNewContext(copy,context);for(const pair of Object.values(context.window.COPY)){assert.equal(pair.length,2);assert(pair.every(x=>typeof x==='string'&&x.length));}
console.log(JSON.stringify({cases:data.length+core.presets.length,snapshots,sourceMirror:true,uniqueBilingualKeys:keys.length}));
