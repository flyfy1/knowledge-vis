const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const C=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));let rounds=0;
for(const test of [...cases,...C.presets.map(x=>({...x}))]){
 const {graph,initial}=test,s=C.summarize(graph,initial);assert.deepEqual(s.groups.flatMap(g=>g.members).sort((a,b)=>a-b),graph.map((_,i)=>i));
 for(let a=0;a<graph.length;a++)for(let b=0;b<graph.length;b++)if(graph[a][b])assert.equal(s.component[a],s.component[b]);
 for(const [id,g] of s.groups.entries())assert.deepEqual([...g.seeds].sort((a,b)=>a-b),initial.filter(v=>s.component[v]===id).sort((a,b)=>a-b));
 for(const score of s.scores){
  const frames=C.spread(graph,initial,score.node);assert.deepEqual(frames[0],initial.filter(v=>v!==score.node).sort((a,b)=>a-b));
  for(let j=1;j<frames.length;j++){
   // Independent definition of next round, checked for every intermediate set.
   const expected=graph.map((_,v)=>v).filter(v=>frames[j-1].includes(v)||frames[j-1].some(u=>graph[u][v]));
   assert.deepEqual(frames[j],expected);assert(frames[j].length>frames[j-1].length);rounds++;
  }
  const last=frames.at(-1);assert(last.every(u=>graph[u].every((edge,v)=>!edge||last.includes(v))));assert.equal(last.length,score.final);assert.equal(s.total-last.length,score.saved);if(test.totals)assert.equal(last.length,test.totals[score.node]);
 }
 const scan=C.scan(s.scores);for(let j=1;j<scan.length;j++){const expected=[...s.scores.slice(0,j)].sort((a,b)=>b.saved-a.saved||a.node-b.node)[0];assert.equal(scan[j].answer,expected.node);assert.equal(scan[j].best,expected.saved);}if('answer'in test)assert.equal(scan.at(-1).answer,test.answer);
}
// Parse dictionary as syntax before evaluation to detect duplicate keys, rather than seeing overwritten values.
const acorn=require('acorn'),text=fs.readFileSync(path.join(root,'copy.js'),'utf8'),ast=acorn.parse(text,{ecmaVersion:'latest'});let keys=[];
function visit(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const names=node.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(names).size,names.length,'duplicate dictionary key');keys.push(...names);}for(const v of Object.values(node))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}visit(ast);
const sandbox={window:{}};vm.runInNewContext(text,sandbox);for(const [k,p] of Object.entries(sandbox.window.COPY)){assert(Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='string'&&v.length));assert.deepEqual([...p[0].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),[...p[1].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort());}
const presetEvidence=C.presets.map(p=>{const s=C.summarize(p.graph,p.initial);return {initial:p.initial,totals:s.scores.map(x=>x.final),scores:s.scores,answer:C.scan(s.scores).at(-1).answer};});
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({status:'PASS',cases:cases.length+7,intermediateRounds:rounds,partitionAndEdgeClosure:true,seedCounts:true,prefixBestPairs:true,copyKeys:keys.length,presets:presetEvidence},null,2));console.log('PASS core invariants',cases.length+7,'cases',rounds,'rounds');
