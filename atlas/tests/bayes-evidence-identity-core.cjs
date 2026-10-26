'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),cp=require('child_process');
const s=fs.readFileSync('bayes/app.js','utf8'),old=cp.execFileSync('git',['show','9173da78:bayes/app.js'],{encoding:'utf8'});
const slice=(x,a,b)=>x.slice(x.indexOf(a),x.indexOf(b));
assert.equal(slice(s,'const CASE =','/* ---------- Beta 分布'),slice(old,'const CASE =','/* ---------- Beta 分布'));
assert.equal(slice(s,'const s2 = {','const s3 = {'),slice(old,'const s2 = {','const s3 = {'));
assert.equal(slice(s,'const PRIORS =','window.BAYES ='),slice(old,'const PRIORS =','window.BAYES ='));
const c={};vm.runInNewContext(slice(s,'const CASE =','/* ---------- Beta 分布')+slice(s,'const s3 = {','function s3Draw()')+';this.api={postProb,applyEvidence,recordEvidenceLRs,LR_PLUS,LR_MINUS};',c);
const{postProb,applyEvidence,recordEvidenceLRs,LR_PLUS,LR_MINUS}=c.api,close=(a,b)=>assert.ok(Math.abs(a-b)<1e-14,`${a} != ${b}`);
for(const k of ['pos','neg']){const l=recordEvidenceLRs([k,k,k],[1,1,1]);assert.deepEqual(Array.from(l),[k==='pos'?LR_PLUS:LR_MINUS,1,1]);const p=applyEvidence(.01,l);close(p[1],p[2]);close(p[2],p[3]);}
assert.deepEqual(Array.from(recordEvidenceLRs(['pos','pos','neg','pos'],[1,1,2,1])),[10,1,LR_MINUS,1]);
close(applyEvidence(.01,recordEvidenceLRs(['pos','pos'],[1,1]))[2],90/981);
close(applyEvidence(.01,recordEvidenceLRs(['pos','pos'],[1,2]))[2],100/199);
for(const args of [[['pos'],[]],[['bad'],[1]],[['pos'],[0]],[['pos'],[1.5]],[['pos','neg'],[1,1]],[null,[]]])assert.throws(()=>recordEvidenceLRs(...args));
const h=[.89,.01,.01,.09],nh=[.0082,.0818,.0818,.8282];for(const [a,m]of[[h,.9],[nh,.09]]){close(a.reduce((a,b)=>a+b),1);close(a[0]+a[1],m);close(a[0]+a[2],m);assert.ok(a[0]>m*m);}
const independent=postProb(.01,.81,.0081),dependent=postProb(.01,h[0],nh[0]);assert.ok(dependent>independent);close(dependent,.5229756728170173);
// Conditional independence need not imply marginal independence in a mixture.
const marginal=.01*.9+.99*.09,joint=.01*.81+.99*.0081;assert.ok(Math.abs(joint-marginal*marginal)>.001);
// Marginal independence can coexist with conditional dependence under not-H.
const marginalIndependentJointNotH=(marginal*marginal-.01*.81)/.99;assert.ok(marginalIndependentJointNotH>=0&&marginalIndependentJointNotH<=.09);assert.ok(Math.abs(marginalIndependentJointNotH-.09**2)>.001);
console.log(JSON.stringify({pass:true,sameRecordPosterior:90/981,independentTwoReadings:independent,dependentCounterexample:dependent,unchanged:'probability core / S2 / S4–S6',scope:'constructed probability model, not calibrated reader data'}));
