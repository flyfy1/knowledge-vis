'use strict';
const assert=require('node:assert/strict');
const m=require('../app.js');
assert.equal(m.quorumStatus(5,3,3).overlap,true);assert.equal(m.quorumStatus(5,2,2).overlap,false);
assert.equal(m.writeStatus(5,3,0,'A').success,true);assert.equal(m.writeStatus(5,3,3,'A').success,false);
assert.equal(m.readStatus('strong',5,3,1).success,true);assert.equal(m.readStatus('strong',5,3,3).success,false);assert.equal(m.readStatus('eventual',5,1,3).success,true);console.log('distributed-systems core: ok');
