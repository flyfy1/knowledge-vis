const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const P=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require(path.join(P,'core.js')),fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
let framesChecked=0;
for(const [s,v] of Object.entries(fixtures)){
 if(s.length>6)continue;
 const frames=C.trace(s);assert.equal(frames.at(-1).dp[0][s.length-1],v);
 for(let index=0;index<frames.length;index++){
  const f=frames[index];
  if(f.kind==='merge'){
   assert.equal(s[f.k],s[f.j]);assert.equal(f.left,fixtures[s.slice(f.i,f.k+1)]);assert.equal(f.gap,f.k+1<f.j?fixtures[s.slice(f.k+1,f.j)]:0);assert.equal(f.value,f.left+f.gap);
   assert.equal(f.best,Math.min(frames[index-1].dp[f.i][f.j],f.value));
  }
  for(let i=0;i<s.length;i++)for(let j=i;j<s.length;j++){
   if(f.dp[i][j]===null)continue;
   const expected=fixtures[s.slice(i,j+1)];
   if(i===f.i&&j===f.j)assert(f.dp[i][j]>=expected);else assert.equal(f.dp[i][j],expected);
  }
  if(f.kind!=='start')assert.equal(f.dp[f.i][f.j],f.best);
  framesChecked++;
 }
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(P,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(P,'solution.py'),'utf8'));
const copy=fs.readFileSync(path.join(P,'copy.js'),'utf8'),keys=[...copy.matchAll(/(?:^|,)\s*(\w+):\[/gm)].map(x=>x[1]);assert.equal(keys.length,new Set(keys).size,'duplicate translation key');
const ctx={};vm.runInNewContext(copy+';globalThis.pairs=COPY;',ctx);for(const pair of Object.values(ctx.pairs))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length));
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({framesChecked,sourceParity:true,uniqueCopyKeys:keys.length},null,2));console.log('Core PASS',framesChecked,'frames');
