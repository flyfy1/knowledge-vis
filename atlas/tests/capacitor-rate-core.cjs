'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),cp=require('node:child_process'),{load,validate}=require('./data-quality.cjs'),{pulse}=require('../../power-converters/model.js');
const d=load(),r=d.trails.find(t=>t.id==='charge'),e=d.edges.find(e=>e.id==='derivative:capacitor');
assert.equal(d.nodes.length,39);assert.equal(d.edges.length,51);assert.equal(d.trails.length,14);assert.equal(e.type,'application');assert.equal(e.prerequisite,undefined);assert.deepEqual(r.nodes,['derivative','capacitor']);assert.deepEqual(r.stationTasks.map(t=>t.href),['../derivative/#step2','../power-converters/#step2']);assert.deepEqual(validate(d).errors,[]);
// Compare independent accumulated charge with existing analytic pulse recurrence.
let cases=0,maxResidual=0;
function visit(v,charge,depth){
 const expected=charge/100e-6;maxResidual=Math.max(maxResidual,Math.abs(v-expected));assert.ok(Math.abs(v-expected)<1e-12);cases++;
 if(depth===8)return;
 for(const i of [-.02,0,.02]){const out=pulse('capacitor',v,i),slope=(out.value-v)/.0005;assert.ok(Math.abs(slope-i/100e-6)<1e-9);assert.ok(Math.abs(out.energy-.5*100e-6*out.value**2)<1e-14);visit(out.value,charge+i*.0005,depth+1);}
}
visit(0,0,0);
let v=0;for(const i of [.02,.02,0,-.02])v=pulse('capacitor',v,i).value;assert.ok(Math.abs(v-.1)<1e-12);
v=pulse('capacitor',v,-.02).value;v=pulse('capacitor',v,-.02).value;assert.ok(Math.abs(v+.1)<1e-12);
assert.ok(pulse('capacitor',-.1,-.02).deltaEnergy>0,'Negative current at negativeV can increase energy');
for(const f of ['power-converters/model.js','power-converters/flow.js','atlas/app.js'])assert.equal(fs.readFileSync(f,'utf8'),cp.execFileSync('git',['show','227f37b6:'+f],{encoding:'utf8'}),f+' untouched');
console.log(JSON.stringify({pass:true,graph:'39/51/14',independentChargeCases:cases,maxResidual,scope:'Existing pulse recurrence and scoped graph metadata; no measured hardware/learning claim'}));
