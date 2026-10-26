'use strict';
const assert=require('node:assert/strict'),M=require('../motion-model.js');
const near=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<eps,`${a} ≈ ${b}`);
for(const [phase,q]of [[0,1],[.25,0],[.5,-1],[.75,0],[1,1],[2,1]]){
 const s=M.at(phase);near(s.q,q);near(s.x,M.defaults.amplitude*q);near(s.force,-M.defaults.stiffness*s.x);
}
near(M.at(0).v,0);near(M.at(0).period,Math.PI);
const base=M.at(.25),doubleMass=M.at(.25,{...M.defaults,mass:2});
near(doubleMass.period/base.period,Math.sqrt(2));near(doubleMass.time/base.time,Math.sqrt(2));near(doubleMass.q,base.q);
near(M.at(0,{...M.defaults,stiffness:16}).period/M.at(0).period,.5);
near(M.at(0,{...M.defaults,amplitude:.1}).period,M.at(0,{...M.defaults,amplitude:1}).period);
for(const mass of [.25,1,4])for(const stiffness of [1,4,16])for(const amplitude of [.1,.6,1])for(let i=0;i<=100;i++){
 const phase=i/50,s=M.at(phase,{mass,stiffness,amplitude});
 near(s.kinetic+s.potential,s.energy,1e-8);near(s.acceleration,-s.omega*s.omega*s.x,1e-8);
 assert.ok(Math.abs(s.x)<=amplitude+1e-10);
 // Finite difference independently checks x'' = F/m away from endpoints.
 if(phase>.001&&phase<1.999){const dc=1e-5,dt=dc*s.period;const dd=(M.at(phase+dc,{mass,stiffness,amplitude}).x-2*s.x+M.at(phase-dc,{mass,stiffness,amplitude}).x)/(dt*dt);near(dd,s.force/mass,2e-4);}
}
for(const invalid of [NaN,-.1,2.1])assert.throws(()=>M.at(invalid),RangeError);
assert.throws(()=>M.at(0,{mass:0,stiffness:4,amplitude:.6}),RangeError);
console.log('PASS: quarter cycles, initial condition, period ratios, force/Newton, conserved energy, parameter boundaries');
