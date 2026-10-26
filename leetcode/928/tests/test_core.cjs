const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const C=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));let rounds=0;
for(const test of [...cases,...C.presets]){
 const {graph,initial}=test,s=C.summarize(graph,initial),clean=graph.map((_,i)=>i).filter(v=>!initial.includes(v));
 assert.deepEqual(s.groups.flatMap(g=>g.members).sort((a,b)=>a-b),clean);
 for(const a of clean)for(const b of clean)if(graph[a][b])assert.equal(s.component[a],s.component[b]);
 for(const [id,g] of s.groups.entries()){
  assert(g.members.every(v=>s.component[v]===id));
  assert.deepEqual(g.seeds,initial.filter(v=>g.members.some(u=>graph[u][v])).sort((a,b)=>a-b));
  // Independently check mutual reachability, not just that no edge crosses groups.
  let reachable=new Set([g.members[0]]);for(let j=0;j<graph.length;j++)for(const a of [...reachable])for(const b of clean)if(graph[a][b])reachable.add(b);
  assert.deepEqual([...reachable].sort((a,b)=>a-b),g.members);
 }
 for(const score of s.scores){
  const frames=C.spread(graph,initial,score.node);assert.deepEqual(frames[0],initial.filter(v=>v!==score.node).sort((a,b)=>a-b));
  for(let j=1;j<frames.length;j++){
   const expected=graph.map((_,v)=>v).filter(v=>v!==score.node&&(frames[j-1].includes(v)||frames[j-1].some(u=>graph[u][v])));
   assert.deepEqual(frames[j],expected);assert(frames[j].length>frames[j-1].length);rounds++;
  }
  const last=frames.at(-1);assert(last.every(u=>graph[u].every((edge,v)=>v===score.node||!edge||last.includes(v))));assert(!last.includes(score.node));
  assert.equal(last.length,score.final);assert.equal(s.total-1-last.length,score.saved);if(test.totals)assert.equal(last.length,test.totals[score.node]);
 }
 const scan=C.scan(s.scores);for(let j=1;j<scan.length;j++){const expected=[...s.scores.slice(0,j)].sort((a,b)=>b.saved-a.saved||a.node-b.node)[0];assert.equal(scan[j].answer,expected.node);assert.equal(scan[j].best,expected.saved);}if('answer'in test)assert.equal(scan.at(-1).answer,test.answer);
}
const acorn=require('acorn'),text=fs.readFileSync(path.join(root,'copy.js'),'utf8'),ast=acorn.parse(text,{ecmaVersion:'latest'});let keys=[];
function visit(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const names=node.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(names).size,names.length,'duplicate dictionary key');keys.push(...names);}for(const v of Object.values(node))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}visit(ast);
const sandbox={};vm.runInNewContext(text+';this.pairs=COPY;',sandbox);for(const [k,p] of Object.entries(sandbox.pairs)){assert(Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='string'&&v.length));assert.deepEqual([...p[0].matchAll(/\{([a-zA-Z]\w*)\}/g)].map(m=>m[1]).sort(),[...p[1].matchAll(/\{([a-zA-Z]\w*)\}/g)].map(m=>m[1]).sort());}
const presetEvidence=C.presets.map(p=>{const s=C.summarize(p.graph,p.initial);return {initial:p.initial,totals:s.scores.map(x=>x.final),scores:s.scores,answer:C.scan(s.scores).at(-1).answer};});
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({status:'PASS',cases:cases.length+C.presets.length,intermediateRounds:rounds,cleanPartitionAndReachability:true,boundarySets:true,prefixBestPairs:true,copyKeys:keys.length,presets:presetEvidence},null,2));console.log('PASS core invariants',cases.length+C.presets.length,'cases',rounds,'rounds');
