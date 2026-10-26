'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),M=require('../motion-model.js');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../data.js'),'utf8'),c);const D=c.window.ATLAS,ids=new Set(D.nodes.map(n=>n.id));
for(const route of D.trails){assert.ok(route.background.length>=1&&route.background.length<=2);for(const id of route.background)assert.ok(ids.has(id));if(route.backgroundNote)assert.ok(route.backgroundNote.en&&route.backgroundNote.zh&&route.backgroundSource.startsWith('https://'));}
assert.deepEqual(Array.from(D.trails).filter(r=>r.check).map(r=>r.id).sort(),['kinematics','motion']);
for(const n of D.nodes.filter(n=>n.help)){for(const k of ['title','body'])assert.ok(n.help[k].en&&n.help[k].zh);for(const x of n.help.sources)assert.ok(x.label.en&&x.label.zh&&x.href.startsWith('https://'));}
let fixtures=0;for(const mass of [.25,1,4])for(const stiffness of [1,4,16])for(const amplitude of [.1,.6,1])for(const phase of [.25,.75]){const s=M.at(phase,{mass,stiffness,amplitude});assert.equal(s.x,0);assert.equal(s.acceleration,0);assert.equal(s.netForce,0);assert.ok(s.speed>0);assert.ok(Math.abs(s.speed-amplitude*Math.sqrt(stiffness/mass))<1e-12);assert.equal(Math.sign(s.v),phase===.25?-1:1);fixtures++;}
assert.equal(M.at(.25,{mass:1,stiffness:4,amplitude:0}).speed,0,'zero amplitude is outside the prediction conditions');
console.log(JSON.stringify({pass:true,routes:D.trails.length,concepts:D.nodes.length,checkFixtures:fixtures,scope:'canonical references and the bounded free-spring prediction; no learner outcome inferred'}));
