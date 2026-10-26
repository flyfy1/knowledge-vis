'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context={window:{addEventListener(){}},document:{querySelectorAll(){return[];},addEventListener(){}}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);const c=context;let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;},close=(a,b,tol=2e-12)=>ok(Math.abs(a-b)<=tol,`${a} versus ${b}`);const point=(a,b)=>{close(a[0],b[0]);close(a[1],b[1]);};
point(c.cAdd([2,-3],[-4,1]),[-2,-2]);point(c.cMul([1,1],[1,1]),[0,2]);close(c.cMod([3,4]),5);assert.equal(c.cArgDeg([0,0]),null);checks++;assert.equal(c.cArgDeg([-1,0]),180);checks++;
for(const z of [[1,0],[3,2],[-1,4],[0,0]]){let w=z;for(let k=0;k<4;k++)w=c.cMulI(w);point(w,z);}
let seed=76193;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<1000;i++){
 const z=[rnd()*10-5,rnd()*10-5],w=[rnd()*10-5,rnd()*10-5],p=c.cMul(z,w),q=c.mulPolar(z,w);point(p,q);close(c.cMod(p),Math.hypot(...z)*Math.hypot(...w),2e-11);close(c.normAng(c.cArgDeg(p)-c.cArgDeg(z)-c.cArgDeg(w)),0,1e-10);
 for(const [limit,disk]of [[5,false],[4.2,false],[2.6,true]]){
  const raw=[rnd()*30-15,rnd()*30-15],original=raw.slice(),r=c.prepareCoordinate(raw,[0,0],limit,disk);ok(r.ok,'finite raw accepted');let expected=raw.map(v=>Math.round(v*10)/10);if(disk){const m=Math.hypot(...expected);if(m>limit)expected=expected.map(v=>v*limit/m);ok(Math.hypot(...r.value)<=limit+2e-12,'disk bound');}else{expected=expected.map(v=>Math.max(-limit,Math.min(limit,v)));ok(r.value.every(v=>Math.abs(v)<=limit),'box bound');}point(r.value,expected);point(raw,original);
 }
}
for(const raw of [[NaN,1],[1,Infinity],[-Infinity,0],[1e308,1e308]]){const current=[1,2],r=c.prepareCoordinate(raw,current,2.6,true);ok(!r.ok,'uncomputable input refused');point(current,[1,2]);}
for(const preset of [[Math.cos(50*Math.PI/180),Math.sin(50*Math.PI/180)],[.5,Math.sqrt(3)/2],c.clampDisc([7.4,3.2],2.6)]){const r=c.prepareCoordinate(preset,preset,2.6,true);ok(r.ok&&r.key==='editUnchanged','no-op preserves exact point');assert.equal(r.value[0],preset[0]);assert.equal(r.value[1],preset[1]);checks+=2;}
const projected=c.prepareCoordinate([2.6,2.6],[0,0],2.6,true);point(projected.value,[2.6/Math.sqrt(2),2.6/Math.sqrt(2)]);ok(projected.key==='editAdjusted','projection explained');point(c.prepareCoordinate([0,0],[1,1],2.6,true).value,[0,0]);
const lang={window:{},document:{addEventListener(){}}};vm.createContext(lang);vm.runInContext(fs.readFileSync(path.join(root,'i18n.js'),'utf8'),lang);const STR=vm.runInContext('STR',lang);assert.deepEqual(Object.keys(STR.en).sort(),Object.keys(STR.zh).sort());checks++;
// Displayed rounded operands must not masquerade as exact arithmetic.
for(const lang of ['zh','en']){
 for(const key of ['s1ro','s4roProd','s4roMod','s4roArg','s4roAlg'])ok(STR[lang][key].includes('≈'),'rounded numeric values marked '+lang+'/'+key);
 for(const key of ['s4roMod','s4roArg','s4roAlg'])ok(STR[lang][key].includes(lang==='en'?'unrounded':'未舍入'),'compute before rounding '+lang+'/'+key);
 ok(!STR[lang].s1ro.includes('√({a}²'),'negative coordinates not substituted unparenthesized under square');
}
// A180° plane rotation maps every vector to its negative: real eigenvalue−1.
point(c.cMul([3,2],[-1,0]),[-3,-2]);
ok(STR.zh.s6lkEigen.includes('选择“旋转缩放：复 λ”'),'link is scoped to actual rotation-scaling preset');
ok(STR.en.s6lkEigen.includes('choose the “Rotation–scaling: complex λ”'),'English same specific preset, not all rotations');
close(Math.sqrt(2)*Math.sqrt(2),2);
ok(Math.abs(Number(Math.sqrt(2).toFixed(2))**2-2)>.005,'rounding witness:1.41² is not2 at two-decimal accuracy');
for(const key of Object.keys(STR.en)){assert.deepEqual([...STR.en[key].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),[...STR.zh[key].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort());checks++;}
for(const [,key]of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/data-i18n(?:-html)?="([^"]+)"/g))ok(key in STR.en&&key in STR.zh,'DOM key '+key);
console.log(JSON.stringify({checks,result:'pass',scope:'Independent complex identities, original box/disk constraints, raw normalization, no-op exact presets, invalid/overflow rejection, bilingual key/placeholder/DOM parity; no learning-effect claim.'}));
