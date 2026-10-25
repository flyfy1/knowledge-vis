const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {presets,trace}=require('../core.js');let total=0;
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
for(let k=0;k<presets.length;k++){
 const g=presets[k],n=g[0].length,V=g.flat().filter(x=>x!==-1).length,frames=trace(g),expected=fixtures[k].expected;
 assert.equal(frames.at(-1).found,expected);assert.equal(frames.at(-1).kind,'done');assert.deepEqual(frames.at(-1).path,[]);
 let previous=0,previousPath=[];
 for(const f of frames){
  if(f.kind==='enter')assert.deepEqual(f.path,[...previousPath,f.at]);
  else if(f.kind==='undo'){assert.equal(previousPath.at(-1),f.at);assert.deepEqual(f.path,previousPath.slice(0,-1));}
  else assert.deepEqual(f.path,previousPath);
  previousPath=[...f.path];
  assert.equal(f.remaining,V-f.path.length);assert.equal(new Set(f.path).size,f.path.length);
  for(let i=0;i<f.path.length;i++){const v=f.path[i];assert.notEqual(g[Math.floor(v/n)][v%n],-1);if(i){const u=f.path[i-1];assert.equal(Math.abs(Math.floor(v/n)-Math.floor(u/n))+Math.abs(v%n-u%n),1);}}
  if(f.path.length)assert.equal(g[Math.floor(f.path[0]/n)][f.path[0]%n],1);
  assert(f.found===previous||f.found===previous+1);if(f.found>previous)assert.equal(f.kind,'accept');previous=f.found;
  if(f.kind==='accept')assert.equal(f.remaining,0);if(f.kind==='early')assert(f.remaining>0);
  for(const route of f.routes){assert.equal(route.length,V);assert.equal(g[Math.floor(route.at(-1)/n)][route.at(-1)%n],2);}
 }
 total+=frames.length;
}
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),ctx);assert.equal(ctx.window.PYTHON_SOURCE,source);
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copy.matchAll(/^  "([^"]+)":/gm)].map(x=>x[1]);assert.equal(new Set(keys).size,keys.length);vm.runInNewContext(copy,ctx);for(const [key,value] of Object.entries(ctx.window.COPY)){assert.equal(value.length,2,key);assert(value.every(x=>typeof x==='string'&&x.length));}
fs.writeFileSync(path.join(out,'core.json'),JSON.stringify({kind:'author self-check',frames:total,presets:6,sourceParity:true,copyKeys:keys.length},null,2));console.log('PASS core',total,'frames');
