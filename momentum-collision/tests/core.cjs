'use strict';
const assert=require('node:assert/strict');
const core=require('../app.js');
assert.equal(core.momentum(3,4),12);assert.equal(core.momentum(3,-4),-12);assert.equal(core.impulse(6,3),18);
const sticky=core.collision({m1:2,u1:5,m2:3,u2:-1,mode:'sticky'});assert.equal(sticky.v1,1.4);assert.equal(sticky.v2,1.4);assert.ok(Math.abs(sticky.pBefore-sticky.pAfter)<1e-9);
const elastic=core.collision({m1:2,u1:5,m2:3,u2:-1,mode:'elastic'});assert.ok(Math.abs(elastic.pBefore-elastic.pAfter)<1e-9);assert.ok(Math.abs(elastic.keBefore-elastic.keAfter)<1e-9);
assert.equal(core.stopForce(4,8,2),16);assert.equal(core.stopForce(4,8,8),4);console.log('momentum-collision core: ok');
