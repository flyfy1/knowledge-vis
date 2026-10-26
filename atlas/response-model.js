/* Causal, stable, force→displacement model; no transient integration. */
(function(root){
 'use strict';
 const omega0=2,mass=1,stiffness=4,forceAmplitude=1;
 function gain(zeta,r){
  if(!Number.isFinite(zeta)||zeta<=0||!Number.isFinite(r)||r<0)throw new RangeError('Positive damping and nonnegative drive ratio required');
  const a=1-r*r,b=2*zeta*r,d=a*a+b*b;
  return{re:a/d,im:-b/d,magnitude:1/Math.sqrt(d),phase:-Math.atan2(b,a)};
 }
 function inspect(zeta,r){
  const g=gain(zeta,r),real=-zeta*omega0;
  const poles=zeta<1?[{re:real,im:omega0*Math.sqrt(1-zeta*zeta)},{re:real,im:-omega0*Math.sqrt(1-zeta*zeta)}]:
   [{re:real+omega0*Math.sqrt(zeta*zeta-1),im:0},{re:real-omega0*Math.sqrt(zeta*zeta-1),im:0}];
  const peakRatio=zeta<Math.SQRT1_2?Math.sqrt(1-2*zeta*zeta):null;
  return{...g,poles,zeta,r,omega0,drive:omega0*r,damping:2*zeta*mass*omega0,
   peakRatio,peakFrequency:peakRatio===null?null:peakRatio*omega0,
   peakGain:peakRatio===null?null:gain(zeta,peakRatio).magnitude,
   freeFrequency:zeta<1?omega0*Math.sqrt(1-zeta*zeta):null,
   displacementAmplitude:g.magnitude*forceAmplitude/stiffness};
 }
 const api={gain,inspect,omega0,mass,stiffness,forceAmplitude};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ResponseModel=api;
})(typeof window==='undefined'?globalThis:window);
