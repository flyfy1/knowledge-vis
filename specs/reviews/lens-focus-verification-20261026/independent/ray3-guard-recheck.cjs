'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync('lens-audit/staged/lens/app.js','utf8');
function fn(name){const p=src.indexOf('function '+name+'(');let j=src.indexOf('{',p)+1,n=1;for(;n;j++){if(src[j]==='{')n++;if(src[j]==='}')n--;}return src.slice(p,j);}
let lines=[];const ctx={save(){},beginPath(){},rect(){},clip(){},restore(){}};
const c=vm.createContext({clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),VIEWS:{},cyan:'cyan',pink:'pink',green:'green',orange:'orange',t:s=>s,seg:(...x)=>lines.push(x),dot(){},txt(){},drawCandle(){}});
const st=src.indexOf('*/',src.indexOf('PURE-BEGIN'))+2,en=src.lastIndexOf('/*',src.indexOf('PURE-END'));
vm.runInContext(src.slice(st,en)+fn('makeView')+fn('atX')+fn('imageInView')+fn('drawOptics'),c);
const view=c.makeView({id:'s1-canvas',_w:282,_h:360},.42,680),results=[];
for(const [u,count]of [[60,0],[59.8,0],[120,3],[30,4]]){lines=[];const rays={r1:false,r2:false,r3:true};c.drawOptics(ctx,view,60,u,26,{rays,showImageCandle:false});assert.equal(lines.length,count);assert.equal(rays.r3,true);results.push({u,segmentCount:lines.length,selectionRemainsTrue:rays.r3});}
const out={pass:true,results,method:'Actual renderer in isolated VM with drawing spy; no Chrome or pixel claim',reviewerCorrection:'Earlier suggestion misread the pre-drawing R.r3 visibility guard. It already omits the entire out-of-view special ray; ray3Outside copy is accurate. No implementation change was needed.'};
fs.writeFileSync('lens-audit/independent/ray3-guard-recheck.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
