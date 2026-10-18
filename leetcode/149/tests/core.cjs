'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json'),'utf8'));
function onLine(a,b,c){return (b[0]-a[0])*(c[1]-a[1])===(b[1]-a[1])*(c[0]-a[0]);}
function anchorMax(points,i,until){
  let result=1;
  for(let j=i+1;j<=until;j++){
    let count=1;
    for(let k=i+1;k<=until;k++)if(onLine(points[i],points[j],points[k]))count++;
    result=Math.max(result,count);
  }
  return result;
}
let frameCount=0;
for(const {points,expected} of fixtures){
  const original=JSON.stringify(points),frames=core.trace(points);let best=1;
  assert.equal(frames.length,points.length*(points.length+1)/2);
  for(const f of frames){
    frameCount++;
    const until=f.event?f.event.j:f.i;
    assert.equal(f.local,anchorMax(points,f.i,until));
    const allMembers=Object.values(f.buckets).flat();
    assert.deepEqual([...allMembers].sort((a,b)=>a-b),Array.from({length:until-f.i},(_,k)=>f.i+k+1));
    const groups=Object.entries(f.buckets);
    for(let a=0;a<groups.length;a++){
      const [key,members]=groups[a],[dy,dx]=key.split(',').map(Number);
      assert.ok(dx>0||(dx===0&&dy>0),'Sign invariant');
      assert.ok(dy*(points[members[0]][0]-points[f.i][0])===dx*(points[members[0]][1]-points[f.i][1]));
      // No common divisor >1 (independent trial division, not gcd).
      for(let d=2;d<=Math.max(Math.abs(dx),Math.abs(dy));d++)assert.ok(!(dy%d===0&&dx%d===0),'Reduced key');
      for(const j of members)assert.ok(onLine(points[f.i],points[members[0]],points[j]));
      for(let b=a+1;b<groups.length;b++)assert.ok(!onLine(points[f.i],points[members[0]],points[groups[b][1][0]]),'Distinct buckets are distinct lines');
    }
    if(f.event){
      const e=f.event;
      assert.equal(e.dx,points[e.j][0]-points[f.i][0]);assert.equal(e.dy,points[e.j][1]-points[f.i][1]);
      assert.equal(e.after,f.buckets[e.key].length);assert.equal(e.before,e.after-1);
      const previous=frames[frames.indexOf(f)-1];
      assert.equal(e.before,(previous.buckets[e.key]||[]).length);
    }
    for(const c of f.completed)assert.equal(c.local,anchorMax(points,c.i,points.length-1));
    best=Math.max(best,f.local);assert.equal(f.best,best);
    assert.equal(f.log.length,until-f.i);
  }
  assert.equal(frames.at(-1).best,expected);
  assert.equal(frames.at(-1).completed.length,points.length);
  assert.equal(JSON.stringify(points),original);
  // Snapshot isolation: mutation of a later map/log must not alter earlier frames.
  if(frames.length>2){const first=JSON.stringify(frames[0]);frames[1].log.push({probe:true});assert.equal(JSON.stringify(frames[0]),first);}
}
for(const points of core.presets){
  const expected=fixtures.find(f=>JSON.stringify(f.points)===JSON.stringify(points));
  if(expected)assert.equal(core.trace(points).at(-1).best,expected.expected);
}
const report={kind:'author self-check',cases:fixtures.length,intermediateFrames:frameCount,invariants:['exact bucket membership','unique partition','sign normalization','coprime key','before/after insertion','local maximum','monotone global maximum','completed anchor maxima','input immutability','snapshot isolation']};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
