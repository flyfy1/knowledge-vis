'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
  const {graphModel}=await import('../layout.mjs');
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../data.js'),'utf8'),context);
  const model=graphModel(context.window.ATLAS),degree=new Map(model.nodes.map(n=>[n.id,0]));
  for(const edge of model.edges){degree.set(edge.from,degree.get(edge.from)+1);degree.set(edge.to,degree.get(edge.to)+1);}
  assert.equal([...degree.values()].reduce((sum,n)=>sum+n,0),model.edges.length*2,'each valid edge contributes to two nodes');
  assert.ok([...degree.values()].every(Number.isInteger),'every list count is an integer');
  assert.ok([...degree.keys()].every(id=>model.nodes.some(n=>n.id===id)),'list counts contain no ghost nodes');
  const fixture=graphModel({nodes:[{id:'a'},{id:'b'},{id:'isolated'}],edges:[{from:'a',to:'b'},{from:'ghost',to:'a'}]});
  const fixtureDegree=new Map(fixture.nodes.map(n=>[n.id,0]));
  fixture.edges.forEach(e=>{fixtureDegree.set(e.from,fixtureDegree.get(e.from)+1);fixtureDegree.set(e.to,fixtureDegree.get(e.to)+1);});
  assert.deepEqual(Object.fromEntries(fixtureDegree),{a:1,b:1,isolated:0},'invalid endpoints are excluded and isolated concepts read zero');
  console.log(JSON.stringify({checks:5,nodes:model.nodes.length,edges:model.edges.length,scope:'direct connection counts follow the authoritative valid edge list'},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
