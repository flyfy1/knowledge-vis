'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js'),cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
let prefixes=0;
for(const {rectangles:rs,expected} of cases){
 const frames=C.trace(rs),f=frames.at(-1);assert.equal(f.result,expected);
 for(let k=0;k<frames.length;k++){
  const h=frames[k],counts=new Map();let area=0;
  for(const r of rs.slice(0,k)){area+=(r[2]-r[0])*(r[3]-r[1]);for(const p of [[r[0],r[1]],[r[0],r[3]],[r[2],r[1]],[r[2],r[3]]]){const key=p.join(',');counts.set(key,(counts.get(key)||0)+1);}}
  assert.equal(h.area,area);assert.deepEqual(h.odd,[...counts].filter(([p,n])=>n%2).map(([p])=>p).sort());
  if(k){assert.deepEqual(h.before,frames[k-1].odd);assert.equal(h.toggles.length,4);if(h.boxArea<=100)assert.equal(C.cells(rs.slice(0,k),h.box).reduce((a,c)=>a+c.count,0),area);}
  prefixes++;
 }
 const snapshot=JSON.stringify(frames);if(frames.length>2)frames[1].odd.push('mutation-test');assert(!frames.at(-1).odd.includes('mutation-test'));assert.equal(JSON.stringify(C.trace(rs)),snapshot);
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
// Parse JSON directly with a reviver-equivalent pair hook in Python for duplicate keys.
const copy=JSON.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8').replace(/^window.COPY = /,'').replace(/;\s*$/,''));
for(const [key,value] of Object.entries(copy)){assert.equal(value.length,2);assert(value.every(s=>typeof s==='string'&&s.length),key);}
const css=fs.readFileSync(path.resolve(root,'../style.css')).length+fs.readFileSync(path.join(root,'local.css')).length;assert(css<25000);
const result={result:'pass',cases:cases.length,prefix_invariants:prefixes,snapshot_isolation:true,mirror_parity:true,css_bytes:css,copy_keys:Object.keys(copy).length};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
