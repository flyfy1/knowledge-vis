const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const api=require('../core.js');
function independent(row){for(;;){let next=row.replace(/(.)\1{2,}/g,'');if(next===row)return row;row=next;}}
let transitions=0;
for(const p of api.presets){
 const frames=api.trace(p);assert.deepEqual(frames,api.trace(p));
 for(let i=0;i<frames.length;i++){
  const f=frames[i];assert.equal(f.hand.length+f.used,p.hand.length);
  assert.equal(f.stable,!/(.)\1{2,}/.test(f.row));
  if(i){assert.equal(f.before,frames[i-1].row);const prev=frames[i-1];
   if(f.kind==='insert'){assert(prev.stable);assert.equal(f.used,prev.used+1);assert.equal(f.row,prev.row.slice(0,f.gap)+f.color+prev.row.slice(f.gap));assert.equal(independent(f.row),api.collapse(f.row));}
   else{assert.equal(f.used,prev.used);assert.equal(f.hand,prev.hand);assert.equal(f.row.length+f.count,f.before.length);assert(f.count>=3);}
  }
  transitions++;
 }
 assert(frames.at(-1).stable);assert.equal(frames.at(-1).row,p.result<0?'WW':'');
}
for(let n=1;n<=6;n++)for(let mask=0;mask<2**n;mask++){
 const b=Array.from({length:n},(_,i)=>mask>>i&1?'R':'B').join('');if(/(.)\1{2,}/.test(b))continue;
 for(const c of 'RB')for(let g=0;g<=n;g++){const inserted=b.slice(0,g)+c+b.slice(g);assert.equal(api.collapse(inserted),independent(inserted));}
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const report={status:'pass',transitions,sourceParity:true,stableHandConservation:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
