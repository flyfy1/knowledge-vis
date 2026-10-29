'use strict';const assert=require('node:assert/strict');const r=require('../app.js');
const p=r.forward(2,1,0,0);assert.ok(Math.abs(p.x-3)<1e-9&&Math.abs(p.y)<1e-9);
const ik=r.inverse(2,1,2,1,1);assert.ok(ik);const back=r.forward(2,1,ik.theta1,ik.theta2);assert.ok(Math.abs(back.x-2)<1e-9&&Math.abs(back.y-1)<1e-9);
assert.equal(r.inverse(2,1,4,0),null);assert.ok(Math.abs(r.jacobian(2,1,30,90).det-2)<1e-9);assert.ok(Math.abs(r.jacobian(2,1,30,0).det)<1e-9);console.log('advanced-robotics core: ok');
