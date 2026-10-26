const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {trace,presets}=require('../core.js');
function permutations(a){if(!a.length)return [[]];return a.flatMap((v,i)=>permutations(a.filter((_,k)=>k!==i)).map(p=>[v,...p]));}
function merged(words){let s=words[0];for(const w of words.slice(1)){let best=s+w;for(let k=0;k<=Math.min(s.length,w.length);k++)if(s.slice(s.length-k)===w.slice(0,k))best=s+w.slice(k);s=best;}return s;}
function minFor(words,indices,last){return Math.min(...permutations(indices.filter(i=>i!==last)).map(p=>merged([...p,last].map(i=>words[i])).length));}
let frames=0,cases=0;
function check(words){const model=trace(words),n=words.length;
 for(const [k,f] of model.frames.entries()){
  frames++;
  for(let m=1;m<1<<n;m++)for(let j=0;j<n;j++)if(f.settled[m][j])assert.equal(f.dp[m][j],minFor(words,Array.from({length:n},(_,i)=>i).filter(i=>m&(1<<i)),j));
  const e=f.event;if(!e)continue;
  assert(f.settled[e.previous][e.i]);assert.equal(e.candidate,merged((()=>{ // oracle: best smaller order followed by target
   const ids=Array.from({length:n},(_,i)=>i).filter(i=>e.previous&(1<<i));
   return permutations(ids).filter(p=>p.at(-1)===e.i).sort((a,b)=>merged(a.map(i=>words[i])).length-merged(b.map(i=>words[i])).length)[0].concat(e.j).map(i=>words[i]);})()).length);
  assert.equal(e.best,Math.min(e.old===null?Infinity:e.old,e.candidate));assert.equal(f.dp[e.mask][e.j],e.best);
  const previous=model.frames[k-1];
  for(let m=1;m<1<<n;m++)for(let j=0;j<n;j++)if(m!==e.mask||j!==e.j)assert.equal(f.dp[m][j],previous.dp[m][j]);
  assert.equal(f.parent[e.mask][e.j],e.winner);
 }
 assert.equal(model.result.length,Math.min(...permutations(words).map(p=>merged(p).length)));
 assert(words.every(w=>model.result.includes(w)));assert.equal(model.pieces.join(''),model.result);
 // Distinct deep snapshots: modifying one does not mutate another.
 if(model.frames.length>1){const saved=model.frames[1].dp[1][0];model.frames[0].dp[1][0]=999;assert.equal(model.frames[1].dp[1][0],saved);}
 cases++;
}
presets.forEach(check);
const pool=['aaa','aab','aba','abb','baa','bab','bba','bbb'];
for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++)for(let k=j+1;k<pool.length;k++)check([pool[i],pool[j],pool[k]]);
// Detect duplicate translation keys before JS object parsing can overwrite them.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),keys=[...copy.matchAll(/(?:^|[,\n])\s*([A-Za-z]\w*)\s*:\s*\[/g)].map(m=>m[1]);assert(keys.length>60);assert.equal(new Set(keys).size,keys.length);
const context={window:{}};vm.runInNewContext(copy,context);for(const pair of Object.values(context.window.COPY)){assert.equal(pair.length,2);assert(pair.every(v=>typeof v==='string'&&v.length));}
const report={kind:'author JS simulation self-check',cases,frames,checks:'every settled cell vs independent order oracle; candidate vs independently merged order; old/new minimum; parent identity; unchanged cells; deep snapshots; copy key uniqueness and pairs'};
fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
