'use strict';
const assert=require('node:assert/strict'),M=require('../response-model.js');
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} ≈ ${b}`);
for(const z of [.1,.2,.7,Math.SQRT1_2,.8,1,1.5]){
 near(M.gain(z,0).magnitude,1);near(M.gain(z,1).phase,-Math.PI/2);near(M.gain(z,1).magnitude,1/(2*z));
 const s=M.inspect(z,1),[p,q]=s.poles;near(p.re+q.re,-2*z*M.omega0);near(p.im+q.im,0);near(p.re*q.re-p.im*q.im,M.omega0*M.omega0);assert.ok(p.re<0&&q.re<0);
 if(z<Math.SQRT1_2){const r=s.peakRatio;assert.ok(M.gain(z,r).magnitude>=M.gain(z,r+.001).magnitude);assert.ok(M.gain(z,r).magnitude>=M.gain(z,Math.max(0,r-.001)).magnitude);}
 else{assert.equal(s.peakRatio,null);for(let r=.01;r<3;r+=.01)assert.ok(M.gain(z,r).magnitude<=M.gain(z,r-.01).magnitude+1e-9);}
 for(const r of [.05,.3,1,1.7,3]){
  const v=M.gain(z,r),a=1-r*r,b=2*z*r;near(a*v.re-b*v.im,1);near(a*v.im+b*v.re,0);near(Math.hypot(v.re,v.im),v.magnitude);assert.ok(v.phase<=0&&v.phase>=-Math.PI);
  // Substitute the real/imaginary displacement coefficients into the physical ODE.
  const s=M.inspect(z,r),X=v.re/4,Y=-v.im/4,omega=s.drive,c=s.damping;
  near((4-omega*omega)*X+c*omega*Y,1);near((4-omega*omega)*Y-c*omega*X,0);
 }
}
assert.ok(M.inspect(.8,1).poles[0].im>0);assert.equal(M.inspect(.8,1).peakRatio,null);
assert.equal(M.inspect(1,1).poles[0].re,M.inspect(1,1).poles[1].re);
assert.ok(M.inspect(1.5,1).poles.every(p=>p.im===0));
const nearThreshold=M.inspect(Math.SQRT1_2-1e-6,1);assert.ok(nearThreshold.peakRatio>0&&nearThreshold.peakRatio<.05,'Peak below slider minimum is still correctly present');
assert.throws(()=>M.inspect(0,1),RangeError);assert.throws(()=>M.inspect(.2,-1),RangeError);
console.log('PASS: transfer identity, ODE substitution, peak threshold/below-slider peak, phase, pole sums/products/stability, critical/overdamped bounds');
