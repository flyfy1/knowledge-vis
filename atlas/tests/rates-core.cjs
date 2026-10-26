'use strict';
const assert=require('node:assert/strict'),M=require('../motion-model.js');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} ≈ ${b}`);
for(const [phase,kind,vs,as]of [[.125,'speeding',-1,-1],[.875,'slowing',1,-1],[.5,'turning',0,1],[.25,'crossing',-1,0]]){
 const s=M.at(phase);assert.equal(s.motionCase,kind);assert.equal(Math.sign(s.v),vs);assert.equal(Math.sign(s.acceleration),as);near(s.speed,Math.abs(s.v));near(s.netForce,M.defaults.mass*s.acceleration);
}
assert.equal(M.at(.5).v,0,'sinπ residual is consistently zero');assert.equal(M.at(.25).acceleration,0);
for(const mass of [.25,1,4])for(const stiffness of [1,4,16])for(const amplitude of [.1,.6,1])for(let i=0;i<=80;i++){
 const p={mass,stiffness,amplitude},phase=i/40,s=M.at(phase,p),dc=1e-6;
 const wrap=c=>(c+2)%2;
 const before=M.at(wrap(phase-dc),p),after=M.at(wrap(phase+dc),p),dt=dc*s.period;
 near((after.x-before.x)/(2*dt),s.v,1e-7);near((after.v-before.v)/(2*dt),s.acceleration,1e-6);
 near(s.netForce,mass*s.acceleration);near(s.netForce,-stiffness*s.x);assert.ok(s.speed>=0);
 if(s.motionCase==='speeding')assert.ok(s.v*s.acceleration>0);
 if(s.motionCase==='slowing')assert.ok(s.v*s.acceleration<0);
 if(s.motionCase==='turning')assert.equal(s.v,0);
}
const a=M.at(.125),b=M.at(.125,{...M.defaults,mass:2});near(a.x,b.x);near(a.netForce,b.netForce);near(a.acceleration/2,b.acceleration);
assert.equal(M.at(0,{...M.defaults,amplitude:0}).motionCase,'stationary');
console.log('PASS: signed velocity/speed, four motion cases, cardinal zeros, independent first/second derivatives, net-force law and parameter boundaries');
