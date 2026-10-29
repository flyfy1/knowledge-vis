'use strict';const assert=require('node:assert/strict');const m=require('../app.js');
const e=m.response('steel',.001);assert.equal(e.phase,'elastic');assert.ok(Math.abs(e.stress-200)<1e-9);
assert.equal(m.response('steel',.01).phase,'plastic');assert.equal(m.response('steel',.2).phase,'necking');assert.equal(m.response('steel',.28).phase,'fracture');
assert.ok(m.toughness('steel')>m.toughness('aluminum')/2);assert.ok(m.forceN('steel',.01,100)>0);assert.ok(m.forceN('steel',.01,200)>m.forceN('steel',.01,100));console.log('materials-science core: ok');
