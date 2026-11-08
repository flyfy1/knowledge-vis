'use strict';
const assert=require('node:assert/strict');
function calc({prior,sens,spec,N=1000}){
  const p=prior,s=sens,q=spec; const ill=N*p, healthy=N-ill;
  const tp=ill*s, fn=ill*(1-s), tn=healthy*q, fp=healthy*(1-q);
  return {ill,healthy,tp,fn,tn,fp,pos:tp+fp,neg:tn+fn,ppv:tp/(tp+fp),npv:tn/(tn+fn)};
}
const base=calc({prior:.01,sens:.9,spec:.91});
assert.equal(base.ill,10); assert.equal(base.healthy,990);
assert(Math.abs(base.tp-9)<1e-12); assert(Math.abs(base.fn-1)<1e-12); assert(Math.abs(base.fp-89.1)<1e-12); assert(Math.abs(base.tn-900.9)<1e-12);
assert(Math.abs(base.ppv-9/98.1)<1e-12); assert(Math.abs(base.npv-900.9/901.9)<1e-12);
const high=calc({prior:.2,sens:.9,spec:.91}); assert(high.ppv>base.ppv,'higher prevalence should raise PPV');
const perfect=calc({prior:.01,sens:1,spec:1}); assert(Math.abs(perfect.ppv-1)<1e-12); assert(Math.abs(perfect.npv-1)<1e-12);
for(const result of [base,high,perfect]){assert(Math.abs(result.tp+result.fn-result.ill)<1e-9);assert(Math.abs(result.tn+result.fp-result.healthy)<1e-9);assert(Math.abs(result.pos+result.neg-1000)<1e-9)}
console.log('bayes-diagnostics core tests: ok');
