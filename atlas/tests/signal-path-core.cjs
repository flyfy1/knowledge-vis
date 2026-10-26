'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),{load,validate}=require('./data-quality.cjs');
const root=path.resolve(__dirname,'../..'),d=load(),route=d.trails.find(r=>r.id==='signal');
assert.deepEqual(route.nodes,['lti','impulse','convolution','freqresp']);assert.equal(d.nodes.length,38);assert.equal(d.edges.length,50);assert.deepEqual(validate(d).errors,[]);
assert.deepEqual(route.stationTasks.map(t=>t.href),['../lti/#step3','../lti/#step2','../convolution/#step2','../freqresp/#step3']);
const source=fs.readFileSync(path.join(root,'lti/app.js'),'utf8'),box={};vm.runInNewContext(source.split('/* ================================================================\n   画布适配')[0]+';this.core={run:runSystem,impulse:impulseOf};',box);
assert.deepEqual(Array.from(box.core.impulse('ma3',8)),[1/3,1/3,1/3,0,0,0,0,0]);
let maxSteady=0,startup=0;
for(const phase of [0,.3,1.2])for(const amplitude of [.2,1,2]){
 const x=Array.from({length:92},(_,n)=>amplitude*Math.sin(2*Math.PI*n/3+phase)),y=Array.from(box.core.run('ma3',x));
 startup=Math.max(startup,Math.abs(y[0]),Math.abs(y[1]));
 for(let n=2;n<y.length;n++){maxSteady=Math.max(maxSteady,Math.abs(y[n]));assert.ok(Math.abs(y[n])<3e-14);}
}
assert.ok(startup>.1,'Startup is not a blanket zero-output claim');
const f=fs.readFileSync(path.join(root,'freqresp/app.js'),'utf8'),a=f.indexOf('function maMag('),b=f.indexOf('/* ---- 二阶带通',a),math=vm.createContext({Math});vm.runInContext(f.slice(a,b),math);
assert.ok(math.maMag(3,2*Math.PI/3)<1e-14);assert.ok(math.maSim(3,2*Math.PI/3).amp<1e-14);assert.ok(Math.abs(math.maMag(2,2*Math.PI/3)-.5)<1e-14);assert.ok(Math.abs(math.maSim(2,2*Math.PI/3).amp-.5)<1e-9);assert.ok(math.maMag(3,2.094)>1e-5,'Rounded displayed value is not exact preset');
const report={pass:true,route:'signal',nodes:38,edges:50,stations:4,maxSinusoidalSteadyResidual:maxSteady,nonzeroStartup:startup,twoTapSameFrequencyGain:math.maMag(2,2*Math.PI/3),roundedInputIsNotExactZero:true,scope:'Actual LTI and frequency-response helpers; no hearing or learning-effect claim'};
console.log(JSON.stringify(report));
