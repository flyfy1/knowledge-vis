const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const core=require('../core.js');let count=0;
for(const c of JSON.parse(fs.readFileSync(path.join(OUT,'fixtures.json')))){
 const frames=core.trace(c.ops);assert.equal(frames.length,c.states.length+1);
 c.states.forEach((s,i)=>{const f=frames[i+1];for(const k of ['remaining','outputs','group','maxfreq'])assert.deepStrictEqual(f[k],s[k]);assert.deepStrictEqual(Object.fromEntries(Object.entries(f.freq).filter(([,n])=>n)),s.freq);count++;});
}
// Catch duplicate dictionary definitions before JavaScript can overwrite them.
const text=fs.readFileSync(path.join(P,'copy.js'),'utf8');const keys=[...text.matchAll(/(?:^|[,\n])\s*(\w+):\s*\[/g)].map(x=>x[1]);assert.equal(new Set(keys).size,keys.length);
const sandbox={};vm.runInNewContext(text+';this.copy=COPY;',sandbox);for(const pair of Object.values(sandbox.copy)){assert.equal(pair.length,2);assert(pair.every(x=>typeof x==='string'&&x.length));}
fs.writeFileSync(path.join(OUT,'core-results.json'),JSON.stringify({status:'pass',statesChecked:count,uniqueBilingualKeys:keys.length},null,2));console.log({count,keys:keys.length});
