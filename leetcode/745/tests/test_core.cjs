const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const C=require('../core.js');let states=0;
function oracle(words,p,s){let best=-1;words.forEach((w,i)=>{if(w.startsWith(p)&&w.endsWith(s))best=i;});return best;}
for(const {words,queries} of C.presets){
 const frames=C.trace(words);assert.equal(frames.length,words.length+1);let writes=0;
 frames.forEach((f,k)=>{assert.equal(f.k,k);if(k)writes+=words[k-1].length**2;assert.equal(f.writes,writes);
 const done=words.slice(0,k),pairs=new Set();done.forEach(w=>{for(let i=1;i<=w.length;i++)for(let j=1;j<=w.length;j++)pairs.add(JSON.stringify([w.slice(0,i),w.slice(-j)]));});
 assert.equal(Object.keys(f.map).length,pairs.size);
 for(const key of pairs){const [p,s]=JSON.parse(key);assert.equal(f.map[key],oracle(done,p,s));}
 for(const [p,s]of queries)assert.equal(f.map[C.key(p,s)]??-1,oracle(done,p,s));states++;
 });
 const original=JSON.stringify(frames[0]);frames.at(-1).map['test']=0;assert.equal(JSON.stringify(frames[0]),original);
}
// Parse dictionary with Acorn before JS can silently overwrite duplicate keys.
const acorn=require('acorn');const copy=fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),ast=acorn.parse(copy,{ecmaVersion:'latest'});const props=ast.body[0].expression.right.properties,keys=props.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length);
const ctx={window:{}};vm.runInNewContext(copy,ctx);for(const v of Object.values(ctx.window.LESSON_COPY))assert.ok(Array.isArray(v)&&v.length===2&&v.every(s=>typeof s==='string'&&s.length));
const out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});const result={status:'pass',states,localizedKeys:keys.length,duplicateKeys:0};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
