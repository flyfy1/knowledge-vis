'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const root=process.argv[2]||'refraction-audit/staged/';
const path=root+'reflection-refraction/app.js',src=fs.readFileSync(path,'utf8');
function fn(name){const start=src.indexOf('function '+name+'(');assert.ok(start>=0);let b=src.indexOf('{',start),n=1,j=b+1;for(;n;j++){if(src[j]==='{')n++;if(src[j]==='}')n--;}return src.slice(start,j);}
const c=vm.createContext({S:{s2:{theta:-40,side:-1},s3:{theta:-30,side:-1},quiz:{done:true}},history:{state:{foreign:{keep:42}}},opticsReadingTimer:null,clearTimeout(){}});
vm.runInContext(src.split('/* PURE-BEGIN */')[1].split('/* PURE-END */')[0]+'\nthis.CRITICAL=CRIT;',c);
const crit=Math.asin(1/1.33)*180/Math.PI;assert.equal(c.CRITICAL,crit);
function next(x,up){const d=new DataView(new ArrayBuffer(8));d.setFloat64(0,x);d.setBigUint64(0,d.getBigUint64(0)+(up?1n:-1n));return d.getFloat64(0);}
const adjacent=[next(crit,false),crit,next(crit,true)];
const boundary=[];
for(const mag of [...adjacent,crit-1e-12,crit+1e-12,crit-1e-10,crit+1e-10,crit-1e-7,crit+1e-7,0,30,60,80])for(const sign of [-1,1]){
 const a=mag*sign,expected=mag>crit?'tir':mag===crit?'critical':'refract';
 const scalar=c.snellDeg(1.33,1,a),tr=c.trace3(a);
 assert.equal(scalar.mode,expected);assert.equal(tr.mode,expected);assert.equal(scalar.tir,expected==='tir');
 if(expected==='tir'){assert.equal(scalar.theta,null);assert.equal(tr.thetaR,null);assert.equal(tr.refrDir,null);assert.equal(tr.refrEnd,null);}else{assert.ok(Number.isFinite(scalar.theta));assert.equal(tr.thetaR,Math.abs(scalar.theta));assert.ok(Math.abs(Math.hypot(...tr.refrDir)-1)<1e-14);}
 boundary.push({angle:a,expected,mode:scalar.mode,s:scalar.s,scalarAngle:scalar.theta,traceAngle:tr.thetaR});
}
let rays=0,maxSnellResidual=0,maxDrawnAngleError=0;
for(let i=-8000;i<=8000;i++){
 const a=i/100,rad=Math.abs(a)*Math.PI/180;
 for(const mode of [2,3]){
  const n1=mode===2?1:1.33,n2=mode===2?1.33:1,t=mode===2?c.trace2(a):c.trace3(a);
  assert.ok(Math.abs(Math.atan2(Math.abs(t.incDir[0]),Math.abs(t.incDir[1]))-rad)<1e-14);
  if(t.refrDir){
   const residual=Math.abs(n1*Math.abs(t.incDir[0])-n2*Math.abs(t.refrDir[0]));maxSnellResidual=Math.max(residual,maxSnellResidual);assert.ok(residual<1e-13);
   const actualAngle=Math.atan2(Math.abs(t.refrDir[0]),Math.abs(t.refrDir[1]))*180/Math.PI;
   maxDrawnAngleError=Math.max(maxDrawnAngleError,Math.abs(actualAngle-t.thetaR));assert.ok(Math.abs(actualAngle-t.thetaR)<1e-10);
   if(a!==0)assert.equal(Math.sign(t.refrDir[0]),-Math.sign(a));
   assert.ok(mode===2?t.refrDir[1]>0:t.refrDir[1]<0);
  }else assert.equal(t.mode,'tir');
  const refl=c.trace0(a);assert.ok(Math.abs(refl.thetaI-refl.thetaR)<1e-10);
  rays++;
 }
}
assert.equal(c.trace2(0).refrDir[1],1);assert.equal(c.trace3(0).refrDir[1],-1);assert.equal(c.trace0(0).reflDir[1],-1);
for(const n of [[1,1.33],[1,1],[0,1],[-1,1],[Infinity,1],[1,0],[NaN,1]])assert.equal(c.criticalDeg(...n),null);
for(const a of [-80,-30,0,30,80,90]){const s=c.snellDeg(1,1,a);assert.equal(s.mode,'refract');assert.ok(Math.abs(s.theta-a)<1e-12);}
for(const args of [[0,1,30],[1,0,30],[-1,1,30],[1,1,NaN],[1,1,Infinity],[1,1,91],[1,1,-91],[Infinity,1,30]])assert.equal(c.snellDeg(...args).mode,'invalid');
let fishMaxResidual=0;for(let x=80;x<=400;x++){const t=c.trace4(x);assert.equal(t.A[0],170);assert.ok(t.appDepth>0&&t.appDepth<t.realDepth);assert.ok(Number.isFinite(t.residual));fishMaxResidual=Math.max(fishMaxResidual,t.residual);}
vm.runInContext(fn('validOpticsReading')+fn('saveOpticsReading')+fn('restoreOpticsReading'),c);
c.history.replaceState=s=>{c.history.state=s};c.S.s2={theta:0,side:1};c.S.s3={theta:-crit,side:-1};c.saveOpticsReading();assert.equal(c.history.state.foreign.keep,42);const saved=c.history.state.knowledgeGeometryReading;
assert.deepEqual(Object.keys(saved).sort(),['lesson','s2','s3','version']);c.S.s2={theta:-40,side:-1};c.S.s3={theta:60,side:1};c.restoreOpticsReading();assert.equal(c.S.s2.theta,0);assert.equal(c.S.s2.side,1);assert.equal(c.S.s3.theta,-crit);assert.equal(c.S.quiz.done,true);
for(const bad of [null,{},[],{...saved,version:2},{...saved,lesson:'pinhole-camera'},{...saved,s2:{theta:NaN,side:1}},{...saved,s2:{theta:81,side:1}},{...saved,s2:{theta:30,side:-1}},{...saved,s2:{theta:0,side:0}},{...saved,s2:[]}])assert.equal(c.validOpticsReading(bad),false);
c.history.replaceState=()=>{throw new Error('denied')};assert.doesNotThrow(()=>c.saveOpticsReading());Object.defineProperty(c.history,'state',{get(){throw new Error('denied')},configurable:true});assert.doesNotThrow(()=>c.saveOpticsReading());assert.doesNotThrow(()=>c.restoreOpticsReading());
const i18n=fs.readFileSync(root+'reflection-refraction/i18n.js','utf8'),dictContext={};vm.runInNewContext(i18n.slice(0,i18n.indexOf('let _lang'))+'this.dict=STR;',dictContext);const dict=dictContext.dict;
assert.deepEqual(Object.keys(dict.zh).sort(),Object.keys(dict.en).sort());for(const k of Object.keys(dict.zh))assert.deepEqual((dict.zh[k].match(/\{\w+\}/g)||[]).sort(),(dict.en[k].match(/\{\w+\}/g)||[]).sort());
const atlas={window:{}};vm.runInNewContext(fs.readFileSync(root+'atlas/data.js','utf8'),atlas);const D=atlas.window.ATLAS;assert.equal(D.nodes.length,38);assert.equal(D.edges.length,47);assert.equal(D.trails.length,10);
const out={result:'PASS independent staged numerical/history/parity review; Chrome not run',source:path,sha256:crypto.createHash('sha256').update(src).digest('hex'),critical:crit,display:c.fmtDeg(crit),boundary,rays,maxSnellResidual,maxDrawnAngleError,fish321:{fixedX:true,maxResidual:fishMaxResidual,scope:'vertical-reference depth, not complete virtual imaging'},history:{validRestore:true,foreignFields:true,noQuizSave:true,schemaReject:true,deniedReadWriteSafe:true},bilingualKeys:Object.keys(dict.zh).length,atlas:{nodes:38,edges:47,trails:10}};
fs.writeFileSync('refraction-audit/independent/stage-model-check.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,boundary:out.boundary.length}));
