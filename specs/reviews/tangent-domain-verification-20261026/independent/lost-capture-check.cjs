'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const path='/Users/songyy/Documents/knowledge-vis/trig/app.js',src=fs.readFileSync(path,'utf8');
function fn(name){const p=src.indexOf('function '+name+'(');assert.ok(p>=0,name);let j=src.indexOf('{',p)+1,n=1;for(;n;j++){if(src[j]==='{')n++;if(src[j]==='}')n--;}return src.slice(p,j);}
const nodes={},timers=new Map();let timerId=0,draws=0;
function element(id){return nodes[id]||(nodes[id]={handlers:{},attrs:{},classes:new Set(),addEventListener(type,cb){(this.handlers[type]??=[]).push(cb)},setAttribute(k,v){this.attrs[k]=v},getBoundingClientRect(){return{left:0,top:0,width:200,height:200}},setPointerCapture(){},classList:{toggle(k,on){if(on)nodes[id].classes.add(k);else nodes[id].classes.delete(k)},remove(k){nodes[id].classes.delete(k)}}});}
const c=vm.createContext({TAU:2*Math.PI,S1:{theta:0,unit:'deg'},S4:{theta:0},S6:{theta:0,playing:true,chain:false,trail:[]},TRIG:{steps:{}},tangentReadingTimer:null,history:{state:{foreign:42},replaceState(s){this.state=s}},setTimeout(cb,ms){assert.equal(ms,180);timers.set(++timerId,cb);return timerId},clearTimeout(id){timers.delete(id)},$:element,regCanvas:element,s6Geom(){return{czx:0,czw:200,czh:200}},s6ResetBuckets(){},s6Paint(){},s6Draw(){c.TRIG.steps.s6={theta:c.S6.theta}},s6Readout(){},s1Draw(){draws++;c.TRIG.steps.s1={theta:c.S1.theta,unit:c.S1.unit}},s1Readouts(){},onLangRefresh(){},onRefit(){},animate(){},document:{querySelectorAll(){return[]}},t:k=>k});
vm.runInContext(['norm','s6Apply','s6Labels','s6Manual','initS6','initS1','queueTangentReading','saveTangentReading','restoreTangentReading','validTangentReading'].map(fn).join('\n'),c);
c.initS6();c.initS1();
const commitStart=src.indexOf('  // Persist completed native edits');const commitEnd=src.indexOf("  document.querySelectorAll('a[href]')",commitStart);assert.ok(commitStart>src.indexOf('restoreTangentReading();initS0();'));
const preset=element('s4-preset');c.document.querySelectorAll=selector=>selector.includes('[data-snap],')?[element('s1-unit-deg'),element('s1-unit-rad'),element('s6-chain'),element('s6-toggle'),preset]:[];
vm.runInContext(src.slice(commitStart,commitEnd),c);
function fire(id,event,e={}){for(const cb of element(id).handlers[event]||[])cb({...e,preventDefault(){}})}function flush(){for(const [id,cb]of [...timers]){timers.delete(id);cb()}}function point(deg){const r=deg*Math.PI/180;return{pointerId:1,clientX:100+80*Math.cos(r),clientY:100-80*Math.sin(r)}}
c.s1Geom=()=>({cx:100,cy:100,R:80});c.s1Snap=x=>x;
c.s4Geom=()=>({ox:100,oy:100,scale:80});c.s4Draw=()=>{};c.s4Readout=()=>{};c.s4SyncSlider=()=>{};
vm.runInContext(fn('s1Set')+fn('s4Set')+fn('initS4'),c);c.initS4();
const trials=[];for(const [id,model]of [['s1-canvas',c.S1],['s4-canvas',c.S4]]){fire(id,'pointerdown',point(0));fire(id,'lostpointercapture');const committed=model.theta;fire(id,'pointermove',point(90));trials.push({id,committed,afterMove:model.theta,dragging:model.dragging,pass:model.theta===committed&&!model.dragging});}
const out={pass:trials.every(t=>t.pass),trials,source:path,sha256:crypto.createHash('sha256').update(src).digest('hex'),method:'Actual initS1/initS4 lost-capture and move callbacks in isolated VM with geometry/DOM/drawing adapters; not Chrome.'};fs.writeFileSync(process.argv[2]||'tangent-audit/independent/lost-capture-red.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));if(!out.pass)process.exitCode=1;
