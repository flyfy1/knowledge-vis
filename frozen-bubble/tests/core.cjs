'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const M=require('../model.js');
assert.equal(M.front(0,'warm'),0);
for(let t=0;t<24;t+=.1){assert.ok(M.front(t+.1,'warm')>=M.front(t,'warm'));assert.ok(M.front(t,'warm')<.46);}
assert.ok(M.front(24,'warm')-M.front(20,'warm') < .003,'Warm front demonstrably stalls');
assert.ok(M.front(4,'warm')-M.front(0,'warm') > .25,'Warm front first advances');
assert.ok(M.radius(10,18)>M.radius(10,2));assert.equal(M.radius(-1),0);
assert.ok(!M.crystal(1,0).active);assert.ok(M.crystal(3,0).active);
assert.ok(M.crystal(6,0).y<M.crystal(3,0).y,'Crystal moves up away from base');
for(let i=0;i<22;i++)for(let t=2+i*.62;t<24;t+=.1){const c=M.crystal(t,i);assert.ok(c.x*c.x+c.y*c.y<1,'Prescribed transport stays on projected shell');assert.ok(c.size>=0);}
const context={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../i18n.js'),'utf8')+';this.dict=STR;',context);
assert.deepEqual(Object.keys(context.dict.zh).sort(),Object.keys(context.dict.en).sort());
console.log('PASS: advancing/stalling front, undercooling comparison, transported paths, bilingual key parity');
