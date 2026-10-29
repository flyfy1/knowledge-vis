'use strict';
const assert=require('node:assert/strict');
const q=require('../app.js');
const a=q.amplitudes(0);assert.ok(Math.abs(a.alpha-1)<1e-12);assert.ok(Math.abs(a.beta)<1e-12);
const p=q.probabilities(90);assert.ok(Math.abs(p.p0-.5)<1e-12);assert.ok(Math.abs(p.p1-.5)<1e-12);assert.ok(Math.abs(p.p0+p.p1-1)<1e-12);
assert.equal(q.interferenceProbability(0,1),1);assert.equal(q.interferenceProbability(180,1),0);assert.equal(q.interferenceProbability(90,0),.5);
assert.equal(q.measurementOutcome(7,0),0);assert.equal(q.measurementOutcome(7,1),1);console.log('quantum-basics core: ok');
