const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const {trace,presets}=require('../core.js');
const OUT=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
function bfs(n,k){let target=(1<<n)-1,dist=new Map([[target,0]]),queue=[target];for(let h=0;h<queue.length;h++)for(let s=0;s<=n-k;s++){let next=queue[h]^(((1<<k)-1)<<s);if(!dist.has(next)){dist.set(next,dist.get(queue[h])+1);queue.push(next);}}return dist;}
let cases=0,frameCount=0;
for(let n=1;n<=9;n++)for(let k=1;k<=n;k++){const oracle=bfs(n,k);for(let state=0;state<1<<n;state++){
 const a=Array.from({length:n},(_,i)=>(state>>i)&1),f=trace(a,k);assert.equal(f.at(-1).result,oracle.get(state)??-1);assert.deepEqual(a,Array.from({length:n},(_,i)=>(state>>i)&1));
 for(let j=0;j<f.length;j++){const row=f[j].rows.at(-1);frameCount++;assert.equal(f[j].rows.length,j);
  const beforeStarts=j?f[j-1].starts:[];
  if(row){assert.equal(row.i,j-1);const covering=beforeStarts.filter(s=>s<=row.i&&row.i<s+k).length%2;assert.equal(row.before,covering);assert.equal(row.bit,a[row.i]^covering);assert.equal(row.old^row.expired,row.before);assert.equal(row.after,row.before^(row.action==='flip'?1:0));assert.equal(row.expired,beforeStarts.filter(s=>s+k===row.i).length%2);if(row.action==='flip')assert.equal(row.end,row.i+k);assert.equal(row.action==='fail',row.bit===0&&row.i+k>n);}
  const values=a.map((v,i)=>{let b=v;for(const s of f[j].starts)if(i>=s&&i<s+k)b=1-b;return b;});assert.deepEqual(f[j].values,values);
  const fixed=row&&row.action==='fail'?row.i:f[j].i+1;assert(values.slice(0,fixed).every(v=>v===1));
  for(let q=0;q<=n;q++)assert.equal(f[j].expiry[q],f[j].starts.filter(s=>s+k===q).length%2);
 }
 const stored=JSON.stringify(f[0]);f.at(-1).values[0]=9;assert.equal(JSON.stringify(f[0]),stored);cases++;
}}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),sandbox);for(const [key,pair]of Object.entries(sandbox.window.COPY)){assert(Array.isArray(pair)&&pair.length===2&&pair.every(s=>typeof s==='string'&&s.length),key);assert.deepEqual((pair[0].match(/\{\w+\}/g)||[]).sort(),(pair[1].match(/\{\w+\}/g)||[]).sort(),key);}
const results=presets.map(p=>trace(p.a,p.k).at(-1).result);assert.deepEqual(results,[2,3,-1,2,1,0,-1,1]);
fs.writeFileSync(path.join(OUT,'core.json'),JSON.stringify({kind:'author simulation self-check',cases,frameCount,results,checks:'BFS result, raw-value reconstruction, expired and entry/decision parity, fixed prefix, exact deep snapshots, copy pair/placeholder shape'},null,2)+'\n');console.log({cases,frameCount,results});
