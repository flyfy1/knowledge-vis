'use strict';const assert=require('node:assert/strict');const c=require('../app.js');
assert(c.memoryRecall(4,1)>c.memoryRecall(10,0));assert(c.attentionAccuracy(2,0)>c.attentionAccuracy(2,12));assert(c.retrievalProbability(0,100)>c.retrievalProbability(60,0));assert(c.interferenceRisk(8,8)>c.interferenceRisk(1,1));console.log('psychology-cognition core: ok');
