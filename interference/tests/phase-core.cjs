'use strict';
const fs=require('fs'),vm=require('vm'),cp=require('child_process'),assert=require('node:assert/strict'),{load,validate}=require('../../atlas/tests/data-quality.cjs');
const text=fs.readFileSync('interference/app.js','utf8'),old=cp.execFileSync('git',['show','2fdb47b2:interference/app.js'],{encoding:'utf8'}),pure=text.split('/* ================= PURE-BEGIN ================= */')[1].split('/* ================= PURE-END ================= */')[0],c={};
vm.runInNewContext(pure+';this.api={yAt,ySum,ampOf,classify,phaseState,envelopeLevels,fmtAmp,AMP,PERIOD};',c);const api=c.api;
for(const name of ['yAt','ySum']){const extract=s=>s.match(new RegExp('function '+name+'\\([^\\n]+'))[0];assert.equal(extract(text),extract(old),'Original displacement implementation preserved');}
const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t,`${a} ~ ${b}`);let maxResidual=0,cases=0;
for(const lam of [1,1.7,2,3])for(const x of [-7.5,-.5,0,.5,7.5])for(const y of [-4.5,0,2.5])for(const phi of [0,.003*Math.PI,Math.PI/2,Math.PI,1.75*Math.PI,2*Math.PI]){
 const r1=Math.hypot(x+3,y),r2=Math.hypot(x-3,y),d=r2-r1,p=api.phaseState(d,lam,phi);let sn=0,cs=0;
 for(let j=0;j<64;j++){const theta=2*Math.PI*j/64,z=api.ySum(j*api.PERIOD/64,r1,r2,lam,phi);sn+=z*Math.sin(theta)*2/64;cs+=z*Math.cos(theta)*2/64;near(z,api.yAt(j*api.PERIOD/64,r1,lam,0)+api.yAt(j*api.PERIOD/64,r2,lam,phi),1e-14);assert.ok(Math.abs(z)<=p.amp+1e-10);}
 const oracle=Math.hypot(sn,cs);maxResidual=Math.max(maxResidual,Math.abs(oracle-p.amp));near(oracle,p.amp);near(api.ampOf(d,lam,phi+2*Math.PI),p.amp);near(api.ampOf(-d,lam,-phi),p.amp);assert.ok(p.amp>=0&&p.amp<=2);cases++;
}
assert.equal(api.classify(1.02,2,0),'mid');near(api.ampOf(1.02,2,0),.06282151815625656);assert.equal(api.classify(-.5,2,Math.PI/2),'min');assert.equal(api.ampOf(-.5,2,Math.PI/2),0);assert.equal(api.classify(.5,2,Math.PI/2),'max');assert.equal(api.ampOf(.5,2,Math.PI/2),2);
for(const phi of [0,Math.PI/2,Math.PI,2*Math.PI]){const lv=api.envelopeLevels(2,phi,6-1e-6);for(const x of lv.max)assert.equal(api.classify(x,2,phi),'max');for(const x of lv.min)assert.equal(api.classify(x,2,phi),'min');}
const tiny=api.ampOf(1+1e-8,2,0);assert.ok(tiny>0&&tiny<1e-6);assert.match(api.fmtAmp(tiny),/e-/);assert.equal(api.classify(1+1e-8,2,0),'mid');for(const args of [[NaN,2,0],[0,0,0],[0,-1,0],[0,2,Infinity]])assert.throws(()=>api.phaseState(...args));
const d=load();assert.deepEqual(validate(d).errors,[]);assert.equal(d.nodes.length,39);assert.equal(d.edges.length,51);assert.equal(d.trails.length,14);assert.equal(d.nodes.find(n=>n.id==='interference').source,'../interference/#step1');const e=d.edges.find(e=>e.id==='sine:interference');assert.equal(e.type,'application');assert.equal(e.prerequisite,undefined);assert.equal(e.source,'../interference/#step3');
console.log(JSON.stringify({pass:true,cases,maxIndependentFourierAmplitudeResidual:maxResidual,originalDisplacementPreserved:true,graph:'39/51/14',nearCancellationAmplitude:api.ampOf(1.02,2,0),scope:'ideal equal received amplitude, coherent linear sinusoid model; not fluid or energy-flow validation'}));
