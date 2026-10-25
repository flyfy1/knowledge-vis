const assert=require('assert'),fs=require('fs'),path=require('path');
const {presets,trace}=require('../core.js');
const out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function perms(a){if(!a.length)return [[]];const out=[];for(let i=0;i<a.length;i++)for(const p of perms(a.filter((_,j)=>j!==i)))out.push([a[i],...p]);return out;}
function oracle(a){return [...new Set(perms(a).map(p=>JSON.stringify(p)))].map(s=>JSON.parse(s)).filter(p=>p.every((v,i)=>i===0||Number.isInteger(Math.sqrt(v+p[i-1]))));}
const cases=[...presets];for(let n=1;n<=5;n++){for(let mask=0;mask<3**n;mask++){let x=mask,a=[];for(let j=0;j<n;j++){a.push([0,1,8][x%3]);x=Math.floor(x/3);}cases.push(a);}}
let events=0;
for(const a of cases){const m=trace(a),initial=m.values.map(v=>a.filter(x=>x===v).length),expected=oracle(a).map(JSON.stringify).sort();
 assert.deepStrictEqual(m.frames.at(-1).accepted.map(JSON.stringify).sort(),expected);
 m.frames.forEach((f,i)=>{events++;assert.deepStrictEqual(f.counts,m.values.map((v,j)=>initial[j]-f.path.filter(x=>x===v).length));assert(f.counts.every(c=>c>=0));assert(f.path.every((x,j)=>!j||Number.isInteger(Math.sqrt(x+f.path[j-1]))));assert.equal(new Set(f.accepted.map(JSON.stringify)).size,f.accepted.length);
 if(i){const prev=m.frames[i-1];if(f.kind==='reject'){assert.deepStrictEqual(f.path,prev.path);assert.deepStrictEqual(f.counts,prev.counts);}if(f.kind==='undo'){assert.equal(prev.path.at(-1),f.x);assert.deepStrictEqual(f.path,prev.path.slice(0,-1));}assert.equal(f.accepted.length-prev.accepted.length,f.kind==='accept'?1:0);}
 });
 assert.deepStrictEqual(m.frames.at(-1).counts,initial);
}
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({kind:'author self-check',cases:cases.length,eventInvariants:events,presetAnswers:presets.map(a=>oracle(a).length)},null,2));console.log('PASS',cases.length,'traces;',events,'event invariants');
