'use strict';
const assert=require('node:assert/strict'),M=require('../motion-model.js');let checks=0,maxFdxError=0,maxTimeError=0;
const near=(a,b,t=1e-10)=>{assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)),`${a} ≈ ${b}`);checks++;};
for(const mass of [.25,1,4])for(const stiffness of [1,4,16])for(const amplitude of [0,.1,.6,1]){const p={mass,stiffness,amplitude},E=.5*stiffness*amplitude**2;
 for(const[a,b]of [[0,.25],[.25,.5],[0,.5],[0,1],[0,2],[.25,0],[.125,.125],[.125,.875],[.137,1.862],[1.862,.137],[1.999,2]]){const s=M.workInterval(a,b,p),reverse=M.workInterval(b,a,p);near(s.work,s.end.kinetic-s.start.kinetic);near(s.work,-(s.end.potential-s.start.potential));near(s.work,s.deltaK);near(s.work,-s.deltaU);near(s.work,-reverse.work);near(s.positive,reverse.positive);near(s.negative,reverse.negative);near(s.positive+s.negative,s.chronologicalWork);near(s.work,s.orientation*s.chronologicalWork);near(s.start.kinetic+s.start.potential,E);near(s.end.kinetic+s.end.potential,E);near(s.legs.reduce((n,l)=>n+l.work,0),s.work);assert.ok(s.positive>=0&&s.negative<=0);checks++;
  const mid=(s.low+s.high)/2;near(s.chronologicalWork,M.workInterval(s.low,mid,p).work+M.workInterval(mid,s.high,p).work);near(s.work,M.workInterval(a,b,{...p,mass:mass*3}).work);
 }
 near(M.workInterval(0,.25,p).work,E);near(M.workInterval(.25,.5,p).work,-E);near(M.workInterval(0,1,p).work,0);near(M.workInterval(0,1,p).positive,2*E);near(M.workInterval(0,1,p).negative,-2*E);near(M.workInterval(0,2,p).positive,4*E);
}
// Independently sample F and displacement; linear-force trapezoids telescope even on a return path.
function fdx(a,b,p,n){let previous=p.amplitude*Math.cos(2*Math.PI*a),sum=0;for(let i=1;i<=n;i++){const x=p.amplitude*Math.cos(2*Math.PI*(a+(b-a)*i/n));sum+=(-p.stiffness*(previous+x)/2)*(x-previous);previous=x;}return sum;}
// Independently integrate F*v over PHYSICAL TIME, not F alone over time.
function fvdt(a,b,p,n){const omega=Math.sqrt(p.stiffness/p.mass),T=2*Math.PI/omega,dt=(b-a)*T/n;let sum=0;for(let i=0;i<=n;i++){const c=a+(b-a)*i/n,x=p.amplitude*Math.cos(2*Math.PI*c),v=-p.amplitude*omega*Math.sin(2*Math.PI*c);sum+=(i===0||i===n?.5:1)*(-p.stiffness*x)*v;}return sum*dt;}
for(const[a,b]of [[0,.25],[.25,.5],[0,1],[.137,1.862],[1.862,.137]]){const p={mass:2.75,stiffness:7,amplitude:.7},exact=M.workInterval(a,b,p).work,area=fdx(a,b,p,71),time=fvdt(a,b,p,64000);maxFdxError=Math.max(maxFdxError,Math.abs(area-exact));maxTimeError=Math.max(maxTimeError,Math.abs(time-exact));near(area,exact);near(time,exact,2e-7);}
for(const a of [0,.25,.5,1]){const d=a===0?1e-9:a===.25?Number.EPSILON/4:a===.5?Number.EPSILON/2:Number.EPSILON,s=M.workInterval(a,a+d);assert.ok(s.work!==0,'representable tiny work retained');const expected=(a===.25?-1:1)*2*4*.6**2*Math.PI**2*d*d;near(s.work/expected,1,1e-6);checks++;}
for(const[a,b]of [[-1,0],[0,2.01],[NaN,1],[0,Infinity]])assert.throws(()=>M.workInterval(a,b),RangeError);
console.log(JSON.stringify({pass:true,checks,maxFdxError,maxPhysicalTimeQuadratureError:maxTimeError,method:'stable analytic work; separate sampled Fdx and Fvdt references'},null,2));
