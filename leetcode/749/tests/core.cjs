const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence/self-check');
const core=require(path.join(root,'core.js'));
let checks=0;const norm=e=>e.map(([a,b])=>[Math.min(a,b),Math.max(a,b)]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
for(const {input,trace}of fixtures){const frames=core.trace(input);assert.equal(frames.length,trace.length);
 frames.forEach((f,i)=>{const o=trace[i];for(const key of ['phase','day','before','grid','chosen','total'])assert.deepStrictEqual(f[key],o[key],key);
 assert.deepStrictEqual(norm(f.walls),norm(o.walls));assert.equal(f.regions.length,o.regions.length);
 f.regions.forEach((r,j)=>{for(const k of ['cells','frontier'])assert.deepStrictEqual(r[k],o.regions[j][k]);assert.deepStrictEqual(norm(r.edges),norm(o.regions[j].edges));});
 assert.equal(f.total,f.ledger.reduce((s,v)=>s+v.walls,0));checks++;
 });
 // No nested snapshot aliases: corrupting one frame must leave all others intact.
 if(frames.length>1){const old=JSON.stringify(frames[1]);frames[0].grid[0][0]=99;assert.equal(JSON.stringify(frames[1]),old);}
}
const expected=[3,10,4,13,0,0,1];core.presets.forEach((g,i)=>assert.equal(core.trace(g).at(-1).total,expected[i]));
// Detect duplicate dictionary keys before JavaScript parsing can hide them.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copy.matchAll(/(?:^|[,\n])\s*([A-Za-z0-9_]+)\s*:\s*\[/g)].map(m=>m[1]);assert.equal(new Set(keys).size,keys.length);
global.window={};eval(copy);for(const pair of Object.values(window.COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length));
const result={status:'passed',fixtures:fixtures.length,intermediateFrames:checks,localizedKeys:keys.length};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
