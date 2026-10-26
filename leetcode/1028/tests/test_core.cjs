const assert=require('node:assert/strict'),fs=require('fs'),{presets,trace}=require('../core.js');
const fixtures=JSON.parse(fs.readFileSync(0,'utf8'));
function oracle(s){
 const ts=[...s.matchAll(/(-*)(\d+)/g)].map(m=>[m[1].length,Number(m[2])]);
 function build(a){if(!a.length)return null;let cut=a.length;for(let j=2;j<a.length;j++)if(a[j][0]===a[0][0]+1){cut=j;break;}return [a[0][1],build(a.slice(1,cut)),build(a.slice(cut))];}
 return build(ts);
}
function nested(nodes,id=0){if(!nodes.length||id===null)return null;const n=nodes[id];return [n.value,nested(nodes,n.left),nested(nodes,n.right)];}
let snapshots=0;
for(const p of [...fixtures,...presets.map(input=>({input,expected:oracle(input)}))]){
 const frames=trace(p.input);assert.deepEqual(nested(frames.at(-1).nodes),p.expected);
 for(let j=0;j<frames.length;j++){
  const f=frames[j];assert(f.i<=p.input.length);assert.equal(f.history.length,j);
  assert.equal(new Set(f.path).size,f.path.length);
  f.path.forEach((id,d)=>{assert.equal(f.nodes[id].depth,d);assert.equal(f.nodes[id].parent,d?f.path[d-1]:null);});
  for(const n of f.nodes){assert.equal(n.id,f.nodes.indexOf(n));if(n.parent!==null){assert.equal(f.nodes[n.parent][n.side],n.id);assert.equal(f.nodes[n.parent].depth,n.depth-1);}}
  if(j){const before=frames[j-1];
   if(f.phase==='parse'){assert.deepEqual(f.nodes,before.nodes);assert.deepEqual(f.path,before.path);assert.equal(p.input.slice(f.token.start,f.i),'-'.repeat(f.token.depth)+f.token.value);}
   if(f.phase==='pop'){assert.deepEqual(f.nodes,before.nodes);assert.deepEqual(f.path,before.path.slice(0,-1));assert.equal(f.popped,before.path.at(-1));assert(before.nodes[f.popped].depth>=f.token.depth);assert.equal(f.i,before.i);}
   if(f.phase==='attach'){assert.equal(before.path.length,f.token.depth);assert.equal(f.path.length,f.token.depth+1);assert.deepEqual(nested(f.nodes),oracle(p.input.slice(0,f.i)));assert.equal(f.nodes.length,before.nodes.length+1);}
  }snapshots++;
 }
 const initial=JSON.stringify(frames[0]);frames.at(-1).history.push({bad:1});assert.equal(JSON.stringify(frames[0]),initial);
}
console.log(JSON.stringify({cases:fixtures.length+presets.length,snapshots}));
