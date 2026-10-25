'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.OUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js'),fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
let count=0;
for(const {grid:g,expected,distances} of fixtures){
 const before=JSON.stringify(g),frames=C.trace(g),end=frames.at(-1),actual=['blocked','unreachable'].includes(end.kind)?-1:end.total;
 assert.equal(actual,expected);assert.equal(JSON.stringify(g),before);assert.equal(end.kind==='done',expected>=0);
 const n=g[0].length;
 for(const f of frames){
  count++;
  assert.equal(f.total,f.ledger.reduce((s,x)=>s+x.distance,0));assert.equal(f.cut.length,f.ledger.length);
  for(const row of f.ledger){assert.equal(row.before+row.distance,row.total);assert.equal(row.distance,distances[row.from[0]*n+row.from[1]][row.to[0]*n+row.to[1]]);}
  // Cut frames have already moved start to target: retain original leg source
  // in its completed ledger for this distance field.
  const source=['cut','done'].includes(f.kind)?f.ledger.at(-1).from:f.start;
  for(let r=0;r<g.length;r++)for(let c=0;c<n;c++)if(f.dist[r][c]!==null){assert(g[r][c]>0);assert.equal(f.dist[r][c],distances[source[0]*n+source[1]][r*n+c]);}
  if(f.kind==='layer')for(const [r,c] of f.front)assert.equal(f.dist[r][c],f.depth);
 }
 // Deep snapshots cannot share mutable structures.
 if(frames.length>1){const saved=JSON.stringify(frames[1]);frames[0].dist[0][0]=999;assert.equal(JSON.stringify(frames[1]),saved);}
}
const results={kind:'author self-check',cases:fixtures.length,frames:count,preset_expected:[3,10,-1,0,9,-1],checks:['independent Floyd distances','every completed ledger entry','all discovered distance values','frontier layer','deep snapshots','input preservation']};
C.presets.forEach((g,i)=>{const f=C.trace(g).at(-1);assert.equal(['blocked','unreachable'].includes(f.kind)?-1:f.total,results.preset_expected[i]);});
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(results,null,2)+'\n');console.log(results);
