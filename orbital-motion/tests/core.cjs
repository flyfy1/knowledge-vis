const assert=require('assert');const o=require('../app.js');
const circular=o.orbit(0,0,90), peri=o.orbit(.6,0,90), apo=o.orbit(.6,180,90);
assert(Math.abs(circular.r-1)<1e-9);assert(peri.r<apo.r);assert(peri.speed>apo.speed);assert(o.orbit(.2,0,90).transit===true);assert(o.orbit(.2,0,70).transit===false);assert(o.transitChance(84)>o.transitChance(80));assert.equal(o.phaseLabel(0),'approaching periapsis');console.log('orbital-motion core ok');
