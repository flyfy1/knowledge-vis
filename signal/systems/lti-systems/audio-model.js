'use strict';
/* Audition adapter only. The lesson supplies its authoritative runSystem. */
(function(root){
 const RATE=8000,REPEATS=515,TAIL=512,GAIN=.03,FADE=.008;
 function build(signal,sys,a,run){
  if(!Array.isArray(signal)||signal.length!==28||signal.some(v=>!Number.isFinite(v)||Math.abs(v)>1))throw new RangeError('signal');
  if(!['ma3','acc','diff'].includes(sys)||!Number.isFinite(a)||a<.3||a>.95||typeof run!=='function')throw new RangeError('system');
  const x=Array.from({length:signal.length*REPEATS+TAIL},(_,n)=>n<signal.length*REPEATS?signal[n%signal.length]:0);
  const y=run(sys,x,{a});
  if(!Array.isArray(y)||y.length!==x.length||y.some(v=>!Number.isFinite(v)))throw new RangeError('output');
  const peak=Math.max(...x.map(Math.abs),...y.map(Math.abs));
  if(peak*GAIN*2>.25)throw new RangeError('audition peak');
  return {x,y,rate:RATE,duration:x.length/RATE,sys,a,peak,scale:GAIN,fade:FADE};
 }
 const api={build,RATE,REPEATS,TAIL,GAIN,FADE};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.LtiAudioModel=api;
})(typeof window==='object'?window:globalThis);
