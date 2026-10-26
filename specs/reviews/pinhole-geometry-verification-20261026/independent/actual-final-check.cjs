'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const base='/Users/songyy/Documents/knowledge-vis/';
const pin=fs.readFileSync(base+'pinhole-camera/app.js','utf8'),lin=fs.readFileSync(base+'linear-functions/app.js','utf8');
function fn(src,name){const start=src.indexOf('function '+name+'(');assert.ok(start>=0);let b=src.indexOf('{',start),depth=1,j=b+1;for(;depth;j++){if(src[j]==='{')depth++;if(src[j]==='}')depth--;}return src.slice(start,j);}
const c=vm.createContext({S:{s2:{H:60,u:120,v:120}},CX2:56,GROUND2:252,history:{state:{untouched:{a:1}}},clearTimeout(){},setTimeout(){return 1},geometryReadingTimer:null});
vm.runInContext(pin.split('/* PURE-BEGIN */')[1].split('/* PURE-END */')[0]+fn(pin,'s2geo')+fn(pin,'validGeometryReading')+fn(pin,'saveGeometryReading')+fn(pin,'restoreGeometryReading'),c);
c.history.replaceState=(s)=>{c.history.state=s};
let checked=0,maxErr=0;
for(let H=30;H<=90;H++)for(let u=60;u<=180;u++)for(let v=60;v<=180;v++){
 Object.assign(c.S.s2,{H,u,v});const g=c.s2geo(),e=g.ends,err=Math.abs(e.h-H*v/u);maxErr=Math.max(err,maxErr);
 assert.ok(err<1e-10);assert.ok(Math.abs(g.math.signedHeight+H*v/u)<1e-10);assert.ok(Math.abs(g.math.magnification+v/u)<1e-12);assert.ok(Math.abs(g.math.slope+H/(2*u))<1e-12);
 assert.ok(e.top>=g.view.screenTop&&e.bot<=g.view.screenBottom&&e.bot<g.view.uY&&g.view.uY<g.view.vY&&g.view.vY<g.view.height&&g.view.screenBottom<g.view.height&&g.view.height===420&&g.view.screenBottom===354);
 assert.ok(g.scrX+36<=480&&e.top>=0&&e.bot<g.view.height);checked++;
}
Object.assign(c.S.s2,{H:87,u:63,v:179});c.saveGeometryReading();assert.equal(c.history.state.untouched.a,1);Object.assign(c.S.s2,{H:60,u:120,v:120});c.restoreGeometryReading();assert.equal(c.S.s2.H,87);assert.equal(c.S.s2.u,63);assert.equal(c.S.s2.v,179);
for(const value of [null,{},[],{version:2,lesson:'pinhole-camera',H:60,u:120,v:120},{version:1,lesson:'other',H:60,u:120,v:120},{version:1,lesson:'pinhole-camera',H:60,u:0,v:120},{version:1,lesson:'pinhole-camera',H:60,u:60.1,v:120}])assert.ok(!c.validGeometryReading(value));
c.history.replaceState=()=>{throw new Error('blocked')};assert.doesNotThrow(()=>c.saveGeometryReading());
const d=vm.createContext({S2:{ki:6,b:1,sel:{x:2,y:3}},S2XR:[-6,6],S2YR:[-9,9],history:{state:{untouched:42}},linearReadingTimer:null,clearTimeout(){},setTimeout(){return 1}});
const linearPureStart=lin.indexOf('*/',lin.indexOf('/* PURE-BEGIN'))+2;vm.runInContext(lin.slice(linearPureStart,lin.indexOf('/* PURE-END')),d);
vm.runInContext(fn(lin,'s2Pts')+fn(lin,'validLinearGeometryReading')+fn(lin,'saveLinearGeometryReading')+fn(lin,'restoreLinearGeometryReading'),d);
d.history.replaceState=s=>{d.history.state=s};
d.S2.ki=3;d.S2.b=-4;d.S2.sel={x:2,y:-5};d.saveLinearGeometryReading();assert.equal(d.history.state.untouched,42);d.S2.ki=6;d.S2.b=1;d.S2.sel=null;assert.equal(d.restoreLinearGeometryReading(),true);assert.equal(d.S2.ki,3);assert.equal(d.S2.b,-4);assert.equal(d.S2.sel.x,2);assert.equal(d.S2.sel.y,-5);
for(const value of [null,{},[],{version:1,lesson:'other',ki:3,b:-4,x:2},{version:1,lesson:'linear-functions',ki:3,b:-5,x:2},{version:1,lesson:'linear-functions',ki:9,b:0,x:2},{version:1,lesson:'linear-functions',ki:3,b:0,x:7}])assert.ok(!d.validLinearGeometryReading(value));
d.history.replaceState=()=>{throw new Error('blocked')};assert.doesNotThrow(()=>d.saveLinearGeometryReading());
const atlas={window:{}};vm.runInNewContext(fs.readFileSync(base+'atlas/data.js','utf8'),atlas);const D=atlas.window.ATLAS;
assert.equal(D.nodes.length,37);assert.equal(D.edges.length,46);assert.equal(D.trails.length,9);
const actual=fs.readFileSync('pinhole-bridge/staged/pinhole-camera/app.js','utf8');
const pure=s=>s.split('/* PURE-BEGIN */')[1].split('/* PURE-END */')[0];assert.equal(pure(actual),pure(pin));
const out={status:'PASS actual fixed-scale formula/view/history CLI; UI not run',checked,maxErr,pureUnchanged:true,history:{bothLessonGeometryRestored:true,unrelatedFieldsKept:true,invalidSchemasRejected:true,blockedReplaceStateNoThrow:true},atlas:{nodes:D.nodes.length,edges:D.edges.length,trails:D.trails.length},method:'Actual repository functions evaluated in isolated VM. DOM/browser/Back/paint/focus not exercised.'};
fs.writeFileSync('reviewer-optics/actual-final-check.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
