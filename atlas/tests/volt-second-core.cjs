'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),cp=require('node:child_process'),{load,validate}=require('./data-quality.cjs'),{converter}=require('../../power-converters/model.js'),A=require('../../power-converters/voltage-area.js');
const d=load(),r=d.trails.find(t=>t.id==='volt-second'),e=d.edges.find(e=>e.id==='integral:inductor');assert.deepEqual(validate(d).errors,[]);assert.ok(d.nodes.length>=39);assert.ok(d.edges.length>=51);assert.ok(d.trails.length>=14);assert.deepEqual(r.nodes,['integral','inductor','buck']);assert.equal(e.type,'application');assert.equal(e.prerequisite,undefined);assert.deepEqual(r.stationTasks.map(t=>t.href),['../integral/#step2','../power-converters/#step1','../power-converters/#step4']);
let cases=0,maxAreaError=0,maxCurrentError=0;
function verify(vin,duty,tFraction){const m=converter('buck',vin,duty),t=tFraction*m.T,q=A.buck(m,t);assert.ok(q.positive>=0&&q.negative<=0&&q.segments.length<=4);
 // Independent quadrature splits at switching times from the original model;
 // vL(midpoint) is exactly constant on each leg; it does not use area segments.
 const cuts=[0,m.duty*m.T,m.T,(1+m.duty)*m.T,2*m.T].filter(s=>s<t);cuts.push(t);let reference=0;for(let i=1;i<cuts.length;i++)reference+=m.sample((cuts[i-1]+cuts[i])/2).vl*(cuts[i]-cuts[i-1]);
 const difference=m.sample(t).il-m.sample(0).il;maxAreaError=Math.max(maxAreaError,Math.abs(reference-q.net));maxCurrentError=Math.max(maxCurrentError,Math.abs(difference-q.deltaI));assert.ok(Math.abs(reference-q.net)<1e-17);assert.ok(Math.abs(difference-q.deltaI)<1e-11);
 let end=0;for(const s of q.segments){assert.ok(s.start>=end&&s.end<=t&&s.end>s.start);assert.equal(s.area,s.voltage*(s.end-s.start));end=s.end;}assert.ok(Math.abs(q.net-(q.positive+q.negative))<1e-20);cases++;
}
for(let vin=5;vin<=12;vin++)for(let d=20;d<=75;d+=5)for(const f of [0,.01,d/100-1e-8,d/100,d/100+1e-8,.99,1-1e-8,1,1+1e-8,1+d/100-1e-8,1+d/100,1+d/100+1e-8,2-1e-8,2])verify(vin,d/100,f);
let seed=317;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);for(let i=0;i<100;i++)verify(5+7*random(),.2+.55*random(),2*random());
const m=converter('buck',12,.5),on=A.buck(m,.5*m.T),period=A.buck(m,m.T);assert.ok(Math.abs(on.positive*1e6-150)<1e-9);assert.ok(Math.abs(on.deltaI-.15)<1e-12);assert.ok(Math.abs(m.sample(m.T).il-.925)<1e-12);assert.ok(Math.abs(period.net)<1e-18);assert.ok(m.sample(m.T).il>.9);assert.ok(A.buck(m,.75*m.T).negative<0&&A.buck(m,.75*m.T).net>0,'Negative OFF contribution is not necessarily negative accumulated net');
for(const t of [NaN,Infinity,-Infinity,-1,2*m.T+1e-12])assert.throws(()=>A.buck(m,t),RangeError);for(const bad of [null,{},converter('boost',12,.5),{...m,L:0},{...m,T:Infinity}])assert.throws(()=>A.buck(bad,0),RangeError);
const base='dc453c92';for(const f of ['power-converters/model.js','power-converters/flow.js','atlas/app.js'])assert.equal(fs.readFileSync(f,'utf8'),cp.execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),f+' unchanged');
console.log(JSON.stringify({pass:true,graph:d.nodes.length+'/'+d.edges.length+'/'+d.trails.length,cases,maxAreaError,maxCurrentError,defaultONVoltMicroseconds:on.positive*1e6,fullPeriodCurrent:m.sample(m.T).il,scope:'Independent quadrature/current difference over existing ideal model; no transient/hardware claim'}));
