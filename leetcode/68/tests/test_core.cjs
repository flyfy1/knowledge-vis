const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace,presets}=require('../core.js');
const out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'fixtures.json')));let frames=0;
for(const {words,width,expected} of [...fixtures,...presets.map(p=>({...p,expected:null}))]){
 const run=trace(words,width);let last=[];
 for(const f of run.frames){
  frames++;assert.deepEqual(f.lines.slice(0,last.length),last);assert(f.lines.every(l=>l.length===width));
  assert.equal(f.letters,words.slice(f.i,f.j).reduce((s,w)=>s+w.length,0));
  if(f.j>f.i)assert(f.letters+f.j-f.i-1<=width);
  if(f.kind==='test'){assert.equal(f.need,f.letters+f.candidate.length+f.j-f.i);assert.equal(f.accept,f.need<=width);}
  if(f.kind==='emit'){assert(f.last||f.j<words.length&&f.letters+words[f.j].length+f.j-f.i>width);if(f.q!==null){assert.equal(f.S,f.q*f.g+f.r);assert(f.r>=0&&f.r<f.g);}}
  last=f.lines;
 }
 if(expected)assert.deepEqual(last,expected);
 assert.deepEqual(JSON.parse(JSON.stringify(run)),trace(words,width));
}
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({cases:fixtures.length+presets.length,frames,status:'passed'},null,2));console.log(frames+' invariant snapshots passed');
