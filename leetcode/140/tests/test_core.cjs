const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const core=require(path.join(root,'core.js'));
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json')));
let checks=0;
for(const x of fixtures){
 const frames=core.trace(x),n=x.s.length,L=Math.max(...x.words.map(w=>w.length));
 assert.equal(frames.length,1+Array.from({length:n},(_,i)=>Math.min(L,n-i)).reduce((a,b)=>a+b,0));
 assert.deepEqual([...frames.at(-1).values[0]].sort(),x.expected);
 for(const f of frames){
  for(let j=f.done;j<=n;j++)assert.deepEqual([...f.values[j]].sort(),x.suffixes[j]);
  if(f.event){const e=f.event;assert(e.j>e.i);assert(e.j>=f.done);assert.deepEqual(e.after,e.before.concat(e.added));assert.deepEqual(f.values[e.i],e.after);assert.equal(e.match,x.words.includes(x.s.slice(e.i,e.j)));assert.deepEqual(e.added,e.match?f.values[e.j].map(t=>e.word+(t?' '+t:'')):[]);}
 }
 const snapshot=JSON.stringify(frames[0]);frames.at(-1).values[0].push('test mutation');assert.equal(JSON.stringify(frames[0]),snapshot);
 checks++;
}
for(const p of core.presets)assert(core.trace(p).length>1);
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({checks,result:'pass',invariants:'all completed suffixes, legal dependencies, before+added=after, exact transitions, frame isolation, event count'},null,2));
console.log('Core trace cases passed:',checks);
