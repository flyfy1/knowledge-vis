'use strict';
const fs=require('fs'),cp=require('child_process'),assert=require('node:assert/strict'),M=require('../motion-model.js'),{load,validate}=require('./data-quality.cjs');
assert.equal(fs.readFileSync('atlas/motion-model.js','utf8'),cp.execFileSync('git',['show','b70d3231:atlas/motion-model.js'],{encoding:'utf8'}),'Canonical model unchanged');const d=load();assert.deepEqual(validate(d).errors,[]);assert.ok(d.nodes.length>=39);assert.ok(d.edges.length>=51);assert.ok(d.trails.length>=14);const route=d.trails.find(t=>t.id==='work');assert.deepEqual(Array.from(route.nodes),['integral','work-energy','net-force','oscillation']);for(let i=1;i<route.nodes.length;i++)assert.ok(d.edges.some(e=>e.from===route.nodes[i-1]&&e.to===route.nodes[i]||e.to===route.nodes[i-1]&&e.from===route.nodes[i]),'Every route hop uses an existing directed statement, not an invented prerequisite');
const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)),`${a} ~ ${b}`);let maxDerivativeResidual=0;
for(const mass of [.25,1,4])for(const stiffness of [1,4,16])for(const amplitude of [0,.1,.6,1])for(let i=0;i<=80;i++){
 const c=i/40,p={mass,stiffness,amplitude},s=M.at(c,p),E=.5*stiffness*amplitude**2;
 near(s.potential,E*Math.cos(2*Math.PI*c)**2);near(s.kinetic,E*Math.sin(2*Math.PI*c)**2);near(s.potential+s.kinetic,E);near(s.force,-stiffness*s.x);assert.ok(s.kinetic>=0&&s.potential>=0);
 const m=M.at(c,{...p,mass:mass*2});for(const k of ['x','force','potential','kinetic','energy'])near(m[k],s[k]);near(m.period/s.period,Math.sqrt(2));near(m.v,s.v/Math.sqrt(2));near(m.acceleration,s.acceleration/2);
 // Independent U(x±h) finite difference; use unit-amplitude states to cover this x.
 const h=1e-5;if(Math.abs(s.x)<.99){const U=x=>M.at(Math.acos(x)/(2*Math.PI),{mass,stiffness,amplitude:1}).potential;const gradient=(U(s.x+h)-U(s.x-h))/(2*h);maxDerivativeResidual=Math.max(maxDerivativeResidual,Math.abs(gradient+s.force));near(-gradient,s.force,1e-8);}
}
for(const c of [0,.5,1,1.5,2]){const s=M.at(c);near(s.kinetic,0);near(s.potential,s.energy);assert.notEqual(s.force,0);}
for(const c of [.25,.75,1.25,1.75]){const s=M.at(c);near(s.force,0);near(s.potential,0);near(s.kinetic,s.energy);assert.notEqual(s.v,0);}
console.log(JSON.stringify({pass:true,modelBytePreserved:true,graph:d.nodes.length+'/'+d.edges.length+'/'+d.trails.length,maxDerivativeResidual,scope:'existing analytic ideal spring; graph samples are display geometry, not a new solver'}));
