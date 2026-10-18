'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace,presets}=require('../core.js');
const copy=fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),keys=[...copy.matchAll(/\b([A-Za-z]\w*):\[/g)].map(m=>m[1]);assert.equal(new Set(keys).size,keys.length,'Duplicate translation keys');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function border(s){for(let k=s.length-1;k>=0;k--)if(s.slice(0,k)===s.slice(s.length-k))return k;}
function expected(s){for(let k=s.length;k>=0;k--)if(s.slice(0,k)===[...s.slice(0,k)].reverse().join(''))return [...s.slice(k)].reverse().join('')+s;}
let inputs=0,events=0,cells=0;
function check(s){
  const frames=trace(s),t=s+'#'+[...s].reverse().join('');
  assert.equal(frames[0].kind,'initial');assert.equal(frames[0].pi[0],0);
  for(let k=0;k<frames.length;k++){
    const f=frames[k];assert.equal(f.log.length,k);assert.equal(f.t,t);
    for(let i=0;i<t.length;i++)if(f.pi[i]!==null){assert.equal(f.pi[i],border(t.slice(0,i+1)));cells++;}
    if(k){
      const old=frames[k-1];
      assert.equal(f.before,old.i===f.i?old.after:old.pi[f.i-1]);
      if(f.kind==='fallback'){
        assert.notEqual(t[f.i],t[f.before]);assert.equal(f.after,f.pi[f.before-1]);assert(f.after<f.before);assert.equal(f.pi[f.i],null);
        assert.equal(t.slice(0,f.after),t.slice(f.i-f.after,f.i));
      }else{
        assert.equal(f.after,t[f.i]===t[f.before]?f.before+1:0);
        assert.equal(f.pi[f.i],f.after);
        assert.equal(t.slice(0,f.after),t.slice(f.i+1-f.after,f.i+1));
      }
    }
    events++;
  }
  const f=frames.at(-1),ell=f.pi.at(-1);assert(ell<=s.length);
  assert.equal([...s.slice(ell)].reverse().join('')+s,expected(s));
  // Snapshot independence: mutate the latest arrays, keeping earlier frames intact.
  if(frames.length>1){const saved=JSON.stringify(frames[0]);f.pi[0]=999;f.log[0].after=999;assert.equal(JSON.stringify(frames[0]),saved);}
  inputs++;
}
for(let n=0;n<=7;n++)for(let mask=0;mask<2**n;mask++)check(Array.from({length:n},(_,i)=>(mask>>i)&1?'a':'b').join(''));
presets.forEach(check);check('aabaaa');
assert.throws(()=>trace('A'));assert.throws(()=>trace('a'.repeat(9)));
const result={status:'passed',inputs,events,determined_cells_checked:cells,deep_snapshot_independence:true,teaching_input_bound:true};
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
