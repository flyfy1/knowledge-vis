'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const path='/Users/songyy/Documents/knowledge-vis/pinhole-camera/app.js';
const src=fs.readFileSync(path,'utf8').split('/* PURE-BEGIN */')[1].split('/* PURE-END */')[0];
const c=vm.createContext({});vm.runInContext(src,c);
const examples=[];let checked=0,maxError=0,screenOverflows=0,canvasOverflows=0;
for(let H=30;H<=90;H++)for(let u=60;u<=180;u++)for(let v=60;v<=180;v++){
 const O=[56+u,252-H/2],A=[56,252-H],B=[56,252],s=56+u+v;
 const e=c.imageEnds(A,B,O,s),h=c.imgH(H,u,v);
 const err=Math.abs(e.h-h);maxError=Math.max(maxError,err);assert.ok(err<1e-10);
 const ya=O[1]-e.fromA,yb=O[1]-e.fromB;
 const k=(H/2)/(-u);assert.ok(Math.abs(ya-k*v)<1e-10);
 assert.ok(Math.abs((ya-yb)/H+v/u)<1e-12);
 if(e.top<36||e.bot>252)screenOverflows++;
 if(e.top<0||e.bot>330)canvasOverflows++;
 checked++;
 if([[60,120,120],[60,160,80],[60,80,160],[90,60,180],[60,120,90]].some(q=>q[0]===H&&q[1]===u&&q[2]===v))examples.push({H,u,v,h,ends:{top:e.top,bottom:e.bot},holeOrigin:{A:[-u,H/2],B:[-u,-H/2],imageA:[v,ya],imageB:[v,yb]},topRaySlope:k,signedMagnification:-v/u,signedHeight:ya-yb,canvasClipped:e.top<0||e.bot>330,offScreen:e.top<36||e.bot>252});
}
const out={status:'PASS geometric formulas; existing rendering boundary finding',source:path,checked,maxAbsoluteHeightError:maxError,screenOverflows,canvasOverflows,examples,browserRun:false};
fs.writeFileSync('reviewer-optics/design-model-check.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({checked,maxError,screenOverflows,canvasOverflows,examples}));
