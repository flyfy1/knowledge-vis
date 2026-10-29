'use strict';const assert=require('node:assert/strict');const s=require('../app.js');
assert.equal(s.sampleMeanSE(12,36),2);const ci=s.confidenceInterval(100,12,36,1.96);assert.ok(Math.abs(ci.low-96.08)<.01);assert.ok(Math.abs(ci.high-103.92)<.01);assert.equal(s.zScore(64,60,12,36),2);assert.ok(Math.abs(s.pValueTwoSided(1.96)-.049996)<.001);console.log('statistical-inference core: ok');
