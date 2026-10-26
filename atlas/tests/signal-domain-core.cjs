'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=process.env.SIGNAL_PROJECT_ROOT||path.resolve(__dirname,'../..');let checks=0;
function near(a,b,t=1e-8){assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<t,`${a} vs ${b}`);checks++;}
const source=fs.readFileSync(path.join(root,'freqresp/app.js'),'utf8');const a=source.indexOf('function maMag('),b=source.indexOf('/* ---- 二阶带通',a);assert.ok(a>0&&b>a);const ma=vm.createContext({Math});vm.runInContext(source.slice(a,b),ma);
// Independent oracle: average the M delayed unit complex inputs, not the closed-form sine quotient.
function directGain(M,w){let re=0,im=0;for(let n=0;n<M;n++){re+=Math.cos(w*n)/M;im-=Math.sin(w*n)/M;}return Math.hypot(re,im);}
// Live UI regression: M2 → first zeroπ → M3 retainsπ.
near(ma.maSim(3,Math.PI).amp,1/3);
for(const M of [2,3,4,7,8,16,31,32])for(const w of [0,.05,.2,.7831,Math.PI/2,Math.PI-1e-8,Math.PI]){const ref=directGain(M,w);near(ma.maMag(M,w),ref);near(ma.maSim(M,w).amp,ref,3e-7);}
for(let M=2;M<=32;M++){near(ma.maMag(M,0),1);near(ma.maMag(M,2*Math.PI),1);for(let k=1;k<M;k++)near(ma.maMag(M,2*Math.PI*k/M),0);for(const w of [.1,.72,Math.PI])near(ma.maMag(M,w+2*Math.PI),ma.maMag(M,w));}
const sampling=fs.readFileSync(path.join(root,'sampling/app.js'),'utf8');const ai=sampling.indexOf('function aliasSigned('),bi=sampling.indexOf('/* ---------- 画布',ai);const ss=vm.createContext({Math,window:{}});vm.runInContext(sampling.slice(ai,bi),ss);
for(const[f,fsamp]of [[3,25],[9,10],[14,20],[10,10],[4,8],[15,4]]){const g=ss.aliasSigned(f,fsamp).g;assert.ok(Math.abs(g)<=fsamp/2+1e-12);for(let n=0;n<32;n++)near(Math.sin(2*Math.PI*f*n/fsamp),Math.sin(2*Math.PI*g*n/fsamp));}
// A counterexample to unqualified uniqueness even above2f; the extra high-frequency candidate is ruled out only by a bandlimit assumption.
for(let n=0;n<32;n++)near(Math.sin(2*Math.PI*3*n/25),Math.sin(2*Math.PI*28*n/25));
// Nyquist-boundary data identifies A sin(phi), not amplitude and phase separately.
for(let n=0;n<16;n++)near(Math.sin(Math.PI*n+Math.PI/6),.5*Math.sin(Math.PI*n+Math.PI/2));
// Same sample sequence; continuousω is rad/s and digitalΩ is rad/sample.
for(const Fs of [10,25,4000])for(const f of [1,3])for(let n=0;n<12;n++)near(Math.cos((2*Math.PI*f)*(n/Fs)),Math.cos((2*Math.PI*f/Fs)*n));
console.log(JSON.stringify({pass:true,checks,scope:'Actual moving-average helpers vs independent finite sum; sample alias/phase/units invariants, not learner outcomes or a whole-signal-course certification'}));
