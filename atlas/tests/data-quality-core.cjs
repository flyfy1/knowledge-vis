'use strict';
const assert=require('node:assert/strict'),{load,validate}=require('./data-quality.cjs');
let checks=0;const test=(edit,expected)=>{const d=load();edit(d);const r=validate(d,{checkFiles:false});assert.equal(r.errors.length===0,expected,r.errors.join('\n'));checks++;return r;};
assert.deepEqual(validate(load(),{checkFiles:false}).errors,[]);checks++;
test(d=>d.nodes={},false);
test(d=>d.nodes[0]=null,false);
test(d=>d.edges[0]=null,false);
test(d=>d.nodes.find(n=>n.help).help.body={},false);
test(d=>d.nodes.push(d.nodes[0]),false);
test(d=>d.edges.push(d.edges[0]),false);
test(d=>delete d.edges[0].id,false);
test(d=>d.edges[0].to='missing',false);
test(d=>delete d.nodes[0].title.en,false);
test(d=>delete d.edges[0].reason.zh,false);
test(d=>d.trails[0].background=['missing'],false);
test(d=>d.trails[0].nodes=['work-energy','gaussian'],false);
test(d=>d.edges[0].type='unknown',false);
// A real explanatory edge already connects integral -> work-energy. A reverse
// explanatory edge creates a general cycle, which must remain valid.
const reverse=()=>({id:'fixture-return',from:'work-energy',to:'integral',type:'connection',label:{zh:'联系',en:'relation'},reason:{zh:'测试一般关系环',en:'General-cycle fixture'},source:'https://example.org/fixture'});
test(d=>d.edges.push(reverse()),true);
const cycle=test(d=>{d.edges.push({...reverse(),prerequisite:true});d.edges.find(e=>e.from==='integral'&&e.to==='work-energy').prerequisite=true;},false);assert.ok(cycle.cycles.length);checks++;
test(d=>{d.edges[0].prerequisite=true;},true);
test(d=>{d.edges[0].prerequisite='true';},false);
// Reversed traversal is editorially valid; route reading order is not an arrow.
test(d=>d.trails.find(t=>t.id==='work').nodes.reverse(),true);
test(d=>d.nodes[0].source='javascript:alert(1)',false);
test(d=>d.trails.find(r=>r.id==='signal').stationTasks.pop(),false);
test(d=>delete d.trails.find(r=>r.id==='signal').stationTasks[0].action.en,false);
test(d=>d.trails.find(r=>r.id==='signal').stationTasks[0].evidenceEdge='probability:bayes',false);
test(d=>d.trails.find(r=>r.id==='signal').stationTasks.push(d.trails.find(r=>r.id==='signal').stationTasks[0]),false);
test(d=>d.trails.find(r=>r.id==='signal').nodes=null,false);
test(d=>d.trails.find(r=>r.id==='signal').nodes={},false);
test(d=>d.trails.find(r=>r.id==='signal').stationTasks[0]=[],false);
console.log(JSON.stringify({checks,result:'pass',semantics:'General cycles allowed; only explicitly declared prerequisite cycles request review. No prerequisite inferred from foundation.'}));
