'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'app.js'),'utf8'),box={};
vm.runInNewContext(source.split('/* ================================================================\n   画布适配')[0]+';this.core={run:runSystem,signal:SIG2};',box);
const model=require('../audio-model.js'),run=(...a)=>Array.from(box.core.run(...a)),signal=Array.from(box.core.signal);let comparisons=0,peak=0;
for(const sys of ['ma3','diff','acc'])for(let n=30;n<=95;n++){
 const a=n/100,p=model.build(signal,sys,a,run);assert.equal(p.x.length,14932);assert.equal(p.duration,1.8665);assert.equal(p.rate,8000);
 assert.deepEqual(p.y.slice(0,28),run(sys,signal,{a}));assert.deepEqual(p.x.slice(28,56),signal);assert.ok(p.x.slice(14420).every(v=>v===0));
 for(let i=0;i<p.y.length;i++){
  let expected=0;
  if(sys==='ma3')expected=(p.x[i]+(p.x[i-1]||0)+(p.x[i-2]||0))/3;
  if(sys==='diff')expected=p.x[i]-(p.x[i-1]||0);
  if(sys==='acc'){for(let k=0;k<=Math.min(i,600);k++)expected+=p.x[i-k]*a**k;}
  assert.ok(Math.abs(expected-p.y[i])<2e-12,sys+'/'+a+'/'+i);comparisons++;
 }
 peak=Math.max(peak,p.peak);assert.ok(p.peak*model.GAIN*2<.25);
}
assert.ok(Math.abs(peak-3.875200950367902)<1e-12);
const zero=model.build(Array(28).fill(0),'acc',.95,run);assert.ok(zero.y.every(v=>v===0));
for(const args of [[signal,'wire',.7,run],[signal,'acc',1,run],[signal,'acc',NaN,run],[[1],'ma3',.7,run],[Array(28).fill(Infinity),'ma3',.7,run],[signal,'acc',.95,()=>Array(14932).fill(100)]])assert.throws(()=>model.build(...args));
// Closed-form complex frequency responses on the settled28-sample period.
const dft=(x,k)=>x.reduce((z,v,n)=>[z[0]+v*Math.cos(-2*Math.PI*k*n/x.length),z[1]+v*Math.sin(-2*Math.PI*k*n/x.length)],[0,0]);
const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
for(const sys of ['ma3','diff','acc'])for(const a of [.3,.7,.95]){
 const p=model.build(signal,sys,a,run);
 for(let k=1;k<14;k++){
  const w=2*Math.PI*k/28,c=Math.cos(w),s=Math.sin(w);let h;
  if(sys==='ma3')h=[(1+c+Math.cos(2*w))/3,(-s-Math.sin(2*w))/3];
  if(sys==='diff')h=[1-c,s];
  if(sys==='acc'){const re=1-a*c,im=a*s,d=re*re+im*im;h=[re/d,-im/d];}
  const expected=mul(dft(signal,k),h),actual=dft(p.y.slice(14392,14420),k);
  assert.ok(Math.hypot(expected[0]-actual[0],expected[1]-actual[1])<1e-10);
 }
}
const report={pass:true,comparisons,parameterGrid:66,systems:3,maxRawPeak:peak,maxSingleDigitalPeak:peak*.03,maxTwoVoiceTriangleBound:peak*.06,fullDuration:1.8665,static56Duration:.007,tailMultiplier:.95**512,frequencyResponse:true,heardByHuman:false};
const out=process.env.LTI_EVIDENCE||'/tmp/lti-audio-model';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'model.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
