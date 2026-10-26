'use strict';
const assert=require('node:assert/strict'),M=require('../motion-model.js');let checks=0,maxError=0;
const near=(a,b,tol=1e-10)=>{assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} ≈ ${b}`);checks++;};
for(const mass of [.25,1,4])for(const stiffness of [1,4,16])for(const amplitude of [0,.1,.6,1]){
 const p={mass,stiffness,amplitude};
 for(const[a,b]of [[0,0],[.5,.5],[0,.5],[.5,0],[0,1],[1,0],[0,2],[2,0],[.125,.875],[.63,1.94],[1.94,.63],[.999,1.001],[.5,.5000000001],[.125,.1250000001],[0,1e-9]]){
  const s=M.interval(a,b,p),r=M.interval(b,a,p);near(s.integral,s.end.x-s.start.x);near(s.integral,-r.integral);near(s.distance,r.distance);near(s.distance,s.positive-s.negative);near(s.chronologicalDisplacement,s.positive+s.negative);near(s.integral,s.orientation*s.chronologicalDisplacement);near(s.speedIntegral,s.orientation*s.distance);
  assert.ok(s.distance>=0&&s.positive>=0&&s.negative<=0);assert.ok(Math.abs(s.integral)<=s.distance+1e-12);checks+=2;
  const mid=(s.low+s.high)/2;near(s.distance,M.interval(s.low,mid,p).distance+M.interval(mid,s.high,p).distance);
  near(s.distance,M.interval(a,b,{...p,mass:2*mass,stiffness:3*stiffness}).distance);
 }
 near(M.interval(0,1,p).distance,4*amplitude);near(M.interval(0,2,p).distance,8*amplitude);near(M.interval(0,1,p).integral,0);near(M.interval(.5,0,p).integral,2*amplitude);
}
// Independent quadrature of velocity in PHYSICAL SECONDS, not the analytic segment helper.
function trap(a,b,p,n,speed){const T=M.at(0,p).period,dt=(b-a)*T/n;let sum=0;for(let i=0;i<=n;i++){const v=-p.amplitude*Math.sqrt(p.stiffness/p.mass)*Math.sin(2*Math.PI*(a+(b-a)*i/n));sum+=(i===0||i===n?.5:1)*(speed?Math.abs(v):v);}return sum*dt;}
for(const[a,b]of [[0,.5],[0,1],[.137,1.731],[1.86,.274]]){
 const p={mass:2.75,stiffness:7,amplitude:.7},s=M.interval(a,b,p);
 for(const speed of [false,true]){
  const exact=speed?s.speedIntegral:s.integral,e1=Math.abs(trap(a,b,p,800,speed)-exact),e2=Math.abs(trap(a,b,p,16000,speed)-exact);maxError=Math.max(maxError,e2);assert.ok(e2<=e1+1e-12);near(trap(a,b,p,16000,speed),exact,2e-7);checks++;
 }
}
const tiny=M.interval(.125,.125+1e-12);assert.ok(tiny.distance>0);near(tiny.distance/(1e-12),.6*2*Math.PI/Math.sqrt(2),1e-4);checks++;
assert.ok(M.interval(0,1e-9).distance>0,'tiny quadratic excursion remains nonzero');checks++;
for(const a of [.5,1]){const d=a===.5?Number.EPSILON/2:Number.EPSILON,q=M.interval(a,a+d);assert.ok(q.distance>0,'adjacent representable times retain nonzero path');near(q.distance/(2*.6*Math.PI**2*d*d),1,1e-10);checks++;}
for(const[a,b]of [[-1,0],[0,2.1],[NaN,1],[0,Infinity]])assert.throws(()=>M.interval(a,b),RangeError);
console.log(JSON.stringify({pass:true,checks,maxQuadratureErrorMetres:maxError,method:'exact turning-point segments; independent physical-time trapezoid convergence'},null,2));
