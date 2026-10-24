const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {build,trace,presets}=require('../core.js');
// Independent baseline enumerates pairs and compares the concatenated letters.
function oracle(words){const a=[];for(let i=0;i<words.length;i++)for(let j=0;j<words.length;j++){if(i===j)continue;const s=words[i]+words[j];let ok=true;for(let k=0;k<s.length/2;k++)if(s[k]!==s[s.length-1-k])ok=false;if(ok)a.push([i,j]);}return a;}
const norm=a=>a.map(JSON.stringify).sort();let cases=0,events=0;
function test(words){
  const nodes=build(words),frames=trace(words),expected=oracle(words);
  for(const node of nodes){
    const expectedPal=[],expectedEnd=[];
    words.forEach((w,j)=>{const rev=[...w].reverse().join('');if(rev===node.path)expectedEnd.push(j);if(rev.startsWith(node.path)){const left=w.slice(0,w.length-node.path.length);if(left===[...left].reverse().join(''))expectedPal.push(j);}});
    assert.deepStrictEqual(node.pal,expectedPal);assert.strictEqual(node.end,expectedEnd.length?expectedEnd[0]:-1);
  }
  frames.forEach((f,index)=>{
    assert.strictEqual(new Set(norm(f.pairs)).size,f.pairs.length);
    for(const p of norm(f.pairs))assert(norm(expected).includes(p));
    if(f.i>=0)assert.strictEqual(f.path,words[f.i].slice(0,f.k));
    if(f.kind==='check')assert.strictEqual(f.ok,f.suffix===[...f.suffix].reverse().join(''));
    if(index){const delta=f.pairs.slice(frames[index-1].pairs.length);assert.deepStrictEqual(delta,f.emitted||[]);}
    events++;
  });
  assert.deepStrictEqual(norm(frames.at(-1).pairs),norm(expected));cases++;
}
const universe=['','a','b','aa','ab','ba','bb'];
for(let mask=1;mask<1<<universe.length;mask++)test(universe.filter((_,i)=>mask&(1<<i)));
for(const p of presets)test(p);
let seed=336;function rnd(n){seed=(1664525*seed+1013904223)>>>0;return seed%n;}
for(let k=0;k<300;k++){const words=new Set();for(let j=0;j<15;j++){let w='';const len=rnd(8);for(let c=0;c<len;c++)w+='abc'[rnd(3)];words.add(w);}test([...words]);}
const result={status:'pass',cases,events,nodeCandidateInvariant:true,allIntermediateEmissions:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
