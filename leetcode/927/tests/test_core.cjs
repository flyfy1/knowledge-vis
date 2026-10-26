const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function value(a){let v=0;for(const b of a)v=v*2+b;return v;}
function oracle(a){const results=[];for(let i=0;i<a.length-2;i++)for(let j=i+2;j<a.length;j++)if(value(a.slice(0,i+1))===value(a.slice(i+1,j))&&value(a.slice(i+1,j))===value(a.slice(j)))results.push([i,j]);return results;}
let count=0,frameCount=0;
function check(a){const original=a.slice();const frames=C.trace(a),valid=oracle(a),result=frames.at(-1).result;
assert(valid.length?valid.some(p=>p[0]===result[0]&&p[1]===result[1]):result[0]===-1);
let prefix=0;
for(const f of frames){frameCount++;assert.equal(f.ones,a.filter(b=>b).length);
 if(f.starts){assert.equal(f.length,a.length-f.starts[2]);for(let g=0;g<3;g++){assert.equal(a[f.starts[g]],1);assert.equal(a.slice(0,f.starts[g]).filter(b=>b).length,g*f.k);}}
 if(f.bits){assert.equal(f.offset,prefix);assert.deepEqual(f.bits,f.starts.map(s=>a[s+f.offset]));assert.equal(f.ok,f.bits.every(b=>b===f.bits[0]));if(f.ok)prefix++;}
 if(f.kind==='success')assert.equal(prefix,f.length);
}
assert.deepEqual(a,original);count++;
}
for(let n=3;n<=12;n++)for(let mask=0;mask<2**n;mask++)check(Array.from({length:n},(_,i)=>(mask>>i)&1));
C.presets.forEach(check);
assert.equal(C.baseline(C.presets[0]).length,6);assert.deepEqual(C.baseline(C.presets[0]).filter(r=>r.ok).map(r=>[r.i,r.j]),[[0,3]]);
const kinds=[...new Set(C.presets.flatMap(a=>C.trace(a).map(f=>f.kind)))];assert.equal(kinds.length,8);
const record={kind:'author self-check',arrays:count,frames:frameCount,branches:kinds};fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(record,null,2));console.log(record);
