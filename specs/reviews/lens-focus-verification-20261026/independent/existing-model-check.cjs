'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source='/Users/songyy/Documents/knowledge-vis/lens/app.js',src=fs.readFileSync(source,'utf8');
const start=src.indexOf('*/',src.indexOf('PURE-BEGIN'))+2,end=src.lastIndexOf('/*',src.indexOf('PURE-END'));
const c=vm.createContext({});vm.runInContext(src.slice(start,end),c);
const safe=o=>JSON.parse(JSON.stringify(o,(_,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v));
const near=[];for(const u of [30,59.5,59.8,60,60.2,60.5,60.500001,90,119.6,120,120.2,120.5,180]){
 const actual=c.imageOf(60,u,30),ray=c.rayLines(60,u,30),intersection=c.lineIntersect(ray.r1,ray.r2);
 const expected=u===60?{type:'inf',v:null,M:null}: {type:u>60?'real':'virtual',v:60*u/(u-60),M:-60/(u-60)};
 near.push({u,actual:safe(actual),zone:c.zoneOf(60,u),physicalExpected:expected,rayIntersection:intersection&&Array.from(intersection)});
}
let finiteCases=0,maxIntersectionError=0;
for(let u=28;u<=215;u++)for(let h=10;h<=46;h++){
 if(u===60)continue;const img=c.imageOf(60,u,h),rl=c.rayLines(60,u,h);
 assert.equal(img.type,u>60?'real':'virtual');assert.equal(img.imgH,-img.v/u*h);assert.equal(img.m,img.v/u);assert.ok(Math.abs(img.mAbs-Math.abs(img.imgH/h))<1e-12);
 for(const [x,y]of [[rl.r1,rl.r2],[rl.r1,rl.r3],[rl.r2,rl.r3]]){const p=c.lineIntersect(x,y);const error=Math.max(Math.abs(p[0]-img.v),Math.abs(p[1]-img.imgH));maxIntersectionError=Math.max(error,maxIntersectionError);assert.ok(error<1e-8);}
 finiteCases++;
}
const viewport={viewportWidth:320,canvasWidth:282,canvasHeight:360,lensX:Math.round(282*.42),ppu:Math.max(.6,Math.min(1.9,282/680))};viewport.objectAtU215=viewport.lensX-215*viewport.ppu;
const virtualR3={u:30,h:30,lensPoint:Array.from(c.rayLines(60,30,30).r3.p),nearFocus:[-60,0],forwardParameterToFocus:(30-60)/30};
const screen=[98,100,102].map(p=>({p,formulaImage:100,existingExactClearBranch:Math.abs(p-100)<=2,actuallyEqual:p===100}));
const out={source,near,finiteCases,maxIntersectionError,legacyM:'v/u, opposite sign to signed transverse magnification; UI uses positive mAbs and correct imgH',viewport,virtualR3,screen,method:'Actual original PURE isolated VM and source-derived geometry, no Chrome.'};
fs.writeFileSync('lens-audit/independent/existing-model-check.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({finiteCases,maxIntersectionError,near:near.filter(x=>[30,59.8,60.2,120.2].includes(x.u)),viewport,virtualR3,screen}));
