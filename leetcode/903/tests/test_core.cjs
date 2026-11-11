const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const rows=JSON.parse(fs.readFileSync(path.join(out,'oracle-rows.json'))),{trace}=require('../core.js');
let cells=0;
for(const [s,expected] of Object.entries(rows)){
 const frames=trace(s);
 assert.deepStrictEqual(frames.at(-1).rows.at(-1),expected);
 for(const f of frames){
  for(let i=0;i<f.rows.length;i++)for(let j=0;j<f.rows[i].length;j++)if(f.rows[i][j]!==null)assert.strictEqual(f.rows[i][j],rows[s.slice(0,i)][j]);
  if(!f.i)continue;
  const old=rows[s.slice(0,f.i-1)];
  const sources=old.map((_,k)=>k).filter(k=>s[f.i-1]==='I'?k<f.j:k>=f.j);
  assert.deepStrictEqual(f.sources,sources);assert.deepStrictEqual(f.terms,sources.map(k=>old[k]));
  assert.strictEqual(f.value,rows[s.slice(0,f.i)][f.j]);cells++;
 }
 if(frames.length>1){const saved=JSON.stringify(frames[1]);frames.at(-1).rows.at(-1)[0]=999;assert.strictEqual(JSON.stringify(frames[1]),saved);}
}
const acorn=require('acorn');
const ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const props=ast.body[0].expression.right.properties,keys=props.map(p=>p.key.name||p.key.value);assert.strictEqual(keys.length,new Set(keys).size);
const vm=require('vm'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),ctx);
for(const [k,v]of Object.entries(ctx.window.COPY))assert(v.length===2&&v.every(x=>typeof x==='string'&&x.length),k);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({patterns:Object.keys(rows).length,cells,deepSnapshots:true,bilingualPairs:true,uniqueRawDictionaryKeys:keys.length},null,2));console.log('PASS',cells,'cells');
