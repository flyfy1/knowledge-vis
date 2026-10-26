'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source='/Users/songyy/Documents/knowledge-vis/reflection-refraction/app.js';
const src=fs.readFileSync(source,'utf8');const c=vm.createContext({});
vm.runInContext(src.split('/* PURE-BEGIN */')[1].split('/* PURE-END */')[0]+'\nthis.crit=CRIT;',c);
const crit=Math.asin(1/1.33)*180/Math.PI;
const cases=[];
for(const angle of [0,30,50,80])for(const sign of [-1,1]){
 const a=angle*sign,tr=c.trace2(a),expected=Math.asin(Math.sin(Math.abs(a)*Math.PI/180)/1.33)*180/Math.PI;
 assert.ok(Math.abs(tr.thetaI-Math.abs(a))<1e-10);assert.ok(Math.abs(tr.thetaR-expected)<1e-10);
 cases.push({direction:'air-water',angle:a,expected,actual:tr.thetaR,zeroDeviation:angle===0});
}
const near=[];
for(const delta of [-1e-7,-2e-9,-5e-10,0,5e-10,2e-9,1e-7])for(const sign of [-1,1]){
 const angle=sign*(crit+delta),tr=c.trace3(angle),scalar=c.snellDeg(1.33,1,angle),q=1.33*Math.sin(Math.abs(angle)*Math.PI/180);
 near.push({angle,delta,expected:delta===0?'critical':delta<0?'refract':'tir',traceMode:tr.mode,traceAngle:tr.thetaR,scalarTir:scalar.tir,scalarTheta:Number.isFinite(scalar.theta)?scalar.theta:String(scalar.theta),q});
}
let samples=0,maxErr=0;
for(let i=-8000;i<=8000;i++){
 const angle=i/100;
 const tr=c.trace3(angle),q=1.33*Math.sin(Math.abs(angle)*Math.PI/180);
 const expected=q>1?'tir':'refract';assert.equal(tr.mode,expected);
 if(expected==='refract'){
  const th=Math.asin(q)*180/Math.PI;maxErr=Math.max(maxErr,Math.abs(th-tr.thetaR));
  assert.ok(Math.abs(th-tr.thetaR)<1e-9);
 }else assert.ok(tr.reflEnd&&tr.refrEnd===null);
 samples++;
}
let reflMax=0;for(let i=-800;i<=800;i++){const t=c.trace0(i/10);reflMax=Math.max(reflMax,Math.abs(t.thetaI-t.thetaR));assert.ok(Math.abs(t.thetaI-t.thetaR)<1e-9);}
const fish=[];for(const x of [80,169,170,171,300,400]){const t=c.trace4(x);fish.push({eyeX:x,A:Array.from(t.A),realDepth:t.realDepth,appDepth:t.appDepth,residual:t.residual});}
const negative=c.snellDeg(1.33,1,-60);
const out={source,criticalExact:crit,criticalDisplay:c.fmtDeg(crit),airWater:cases,nearCritical:near,negativeScalar60:{tir:negative.tir,theta:String(negative.theta)},waterAirGrid:{samples,maxAngleError:maxErr},reflectionMaxAngleDifference:reflMax,fish,scope:'Actual PURE evaluated in VM; no Chrome/UI/real energy or complete virtual-image solver validation.'};
fs.writeFileSync('refraction-audit/independent/existing-model-check.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({critical:crit,display:c.fmtDeg(crit),cases,nearCritical:near,negativeScalar60:out.negativeScalar60,fish}));
