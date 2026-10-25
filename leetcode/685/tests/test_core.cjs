'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const core=require(path.join(root,'core.js'));
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'fixtures.json'),'utf8'));
function connected(n,edges){
  const adj=Array.from({length:n+1},()=>[]);
  edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});
  const seen=new Set(),groups=[];
  for(let v=1;v<=n;v++)if(!seen.has(v)){
    const group=[],stack=[v];while(stack.length){const u=stack.pop();if(seen.has(u))continue;seen.add(u);group.push(u);stack.push(...adj[u]);}
    groups.push(group.sort((a,b)=>a-b));
  }
  return groups;
}
let frameCount=0;
// The maximum-n solution cases are canonical-runtime checks. Browser traces
// deliberately have a small input contract; sample all other fixtures here.
for(const {edges,expected} of fixtures.filter(c=>c.edges.length<=45)){
  const original=JSON.stringify(edges),frames=core.trace(edges),n=edges.length;
  assert.equal(JSON.stringify(edges),original);
  assert.deepEqual(edges[frames.at(-1).answer],expected);
  let previousGroups=connected(n,[]);
  frames.forEach((f,k)=>{
    frameCount++;
    const kept=edges.filter((_,i)=>f.states[i]==='kept');
    const groups=connected(n,kept);
    assert.deepEqual(f.groups,groups,'partition must equal independent BFS');
    assert.equal(kept.length,n-groups.length,'retained graph must be a forest');
    assert.deepEqual(f.before,previousGroups,'before snapshot must match previous frame');
    previousGroups=f.groups;
    for(const g of f.groups){
      function leader(v){const seen=new Set();while(f.leader[v]!==v){assert(!seen.has(v));seen.add(v);v=f.leader[v];}return v;}
      const rep=leader(g[0]);assert(g.every(v=>leader(v)===rep));assert.equal(f.size[rep],g.length);
    }
    const scanned=f.event.phase==='phaseStart'?0:f.event.phase==='phaseScan'?f.event.i+1:n;
    const first=Array(n+1).fill(-1);let earlier=-1,later=-1;
    edges.slice(0,scanned).forEach(([u,v],i)=>{if(first[v]<0)first[v]=i;else{earlier=first[v];later=i;}});
    assert.deepEqual(f.incoming,first);assert.equal(f.earlier,earlier);assert.equal(f.later,later);
    if(f.event.type==='merge'){
      const [u,v]=edges[f.event.i];assert(!f.before.some(g=>g.includes(u)&&g.includes(v)));
      assert.equal(f.groups.length,f.before.length-1);
    }
    if(f.event.type==='cycle'){
      const [u,v]=edges[f.event.i];assert(f.before.some(g=>g.includes(u)&&g.includes(v)));
      assert.deepEqual(f.groups,f.before);
    }
    if(f.event.type==='skip')assert.equal(f.event.i,f.later);
    if(k>0)assert.notStrictEqual(f.incoming,frames[k-1].incoming,'deep snapshot');
  });
}
core.presets.forEach(edges=>{
  const f=fixtures.find(c=>JSON.stringify(c.edges)===JSON.stringify(edges));assert(f);
  for(let i=-1;i<edges.length;i++){
    // Independent direction-aware rooted tree check, enumerating possible roots.
    const remaining=edges.filter((_,j)=>j!==i),n=edges.length;
    const valid=remaining.length===n-1 && Array.from({length:n},(_,j)=>j+1).some(root=>{
      const count=Array(n+1).fill(0),adj=Array.from({length:n+1},()=>[]);remaining.forEach(([u,v])=>{count[v]++;adj[u].push(v);});
      if(count[root]!==0||count.slice(1).some((c,j)=>j+1!==root&&c!==1))return false;
      const seen=new Set(),q=[root];while(q.length){const u=q.pop();if(seen.has(u))continue;seen.add(u);q.push(...adj[u]);}return seen.size===n;
    });
    assert.equal(core.inspect(edges,i).valid,valid);
  }
});
const report={kind:'author self-check',fixtures:fixtures.filter(c=>c.edges.length<=45).length,frames:frameCount,result:'pass',checks:['independent BFS partitions','forest edge count','snapshot before/after','incoming prefix indices','DSU roots and sizes','merge and rejection preconditions','no mutation','independent final oracle']};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
