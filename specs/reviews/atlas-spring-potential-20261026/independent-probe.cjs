const fs=require('fs'),vm=require('vm'),cp=require('child_process'),assert=require('assert'),crypto=require('crypto');
const root=process.cwd(),M=require(root+'/atlas/motion-model.js'),src=fs.readFileSync('atlas/motion-bridge.js','utf8');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.strictEqual(fs.readFileSync('atlas/motion-model.js','utf8'),cp.execFileSync('git',['show','b70d3231:atlas/motion-model.js'],{encoding:'utf8'}));
let cases=0,maxEnergyError=0,maxGradientError=0;
for(const mass of [.25,1,4])for(const stiffness of [1,4,16])for(const amplitude of [0,.1,.6,1])for(const phase of [0,.125,.25,.5,.75,1,1.3,2]){
 const s=M.at(phase,{mass,stiffness,amplitude}),eps=1e-5;
 const de=Math.abs(s.potential+s.kinetic-s.energy),slope=(.5*stiffness*(s.x+eps)**2-.5*stiffness*(s.x-eps)**2)/(2*eps);
 maxEnergyError=Math.max(maxEnergyError,de);maxGradientError=Math.max(maxGradientError,Math.abs(slope+s.force));
 assert(de<1e-12);assert(Math.abs(slope+s.force)<1e-8);assert(s.kinetic>=0);cases++;
}
const fn=src.slice(src.indexOf('  function drawPotential(s){'),src.indexOf('  function drawWork(s){'));
function render(phase,parameters,a=0){
 const lines=[],labels=[],points=[],elements={},host={dataset:{}};
 const ctx=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const box={parameters,startCycles:a,host,Math,fmt:n=>String(n),value:n=>String(n),$:id=>elements[id]||(elements[id]={}),text:(e,v)=>e.text=v,template:(key,values)=>JSON.stringify({key,values}),t:k=>k,fit:()=>({ctx,w:640,h:320}),C:{muted:'muted',ink:'ink',green:'green',cyan:'cyan',amber:'amber'},line:(...x)=>lines.push(x),dot:(...x)=>points.push(x),label:(...x)=>labels.push(x)};
 vm.createContext(box);vm.runInContext(fn+';this.run=drawPotential',box);box.run(M.at(phase,parameters));
 return {dataset:host.dataset,lines:lines.map(x=>x.slice(1)),labels:labels.map(x=>x.slice(1)),points:points.map(x=>x.slice(1)),elements};
}
const p={mass:1,stiffness:4,amplitude:.6},turn=render(0,p),cross=render(.25,p),left=render(.5,p),zero=render(.125,{...p,amplitude:0});
assert.equal(turn.dataset.potential,.72);assert.equal(turn.dataset.kinetic,0);assert.equal(turn.dataset.potentialSlope,2.4);
assert.equal(turn.lines.filter(l=>l[4]==='cyan').length,0);assert(turn.lines.filter(l=>l[4]==='amber')[0][2]<turn.lines.filter(l=>l[4]==='amber')[0][0]);
assert.equal(cross.dataset.potential,0);assert.equal(cross.dataset.kinetic,.72);assert.equal(cross.lines.filter(l=>l[4]==='cyan').length,2);assert(cross.labels.some(l=>l[0]==='F = 0'));
assert(left.lines.filter(l=>l[4]==='amber')[0][2]>left.lines.filter(l=>l[4]==='amber')[0][0]);assert.equal(zero.elements['potential-insight'].text,'potentialStationary');assert.equal(zero.lines.filter(l=>l[4]==='cyan').length,0);
assert.deepStrictEqual(render(.125,p,0),render(.125,p,1.8));
const heavy=render(.125,{...p,mass:4});assert.deepStrictEqual(render(.125,p).lines,heavy.lines);assert.deepStrictEqual(render(.125,p).points,heavy.points);
const full=render(0,{...p,amplitude:1});assert.equal(full.dataset.potential,2);assert.equal(full.dataset.kinetic,0);
const dbox={window:{}};vm.createContext(dbox);vm.runInContext(fs.readFileSync('atlas/data.js','utf8'),dbox);const D=dbox.window.ATLAS||Object.values(dbox).find(v=>v?.nodes&&v?.edges&&v?.trails);
assert(D);const work=D.trails.find(x=>x.id==='work');assert.equal(work.nodes.at(-1),'oscillation');for(let i=1;i<work.nodes.length;i++)assert(D.edges.some(e=>e.from===work.nodes[i-1]&&e.to===work.nodes[i]||e.to===work.nodes[i-1]&&e.from===work.nodes[i]));
const report={verdict:'PASS',remainingMustFix:0,method:'Independent actual-model arithmetic and extracted actual drawPotential VM with canvas spies; no browser or pixel claim',modelByteIdentical:true,cases,maxEnergyError,maxGradientError,rendererChecks:['turn: K0 no cyan gap, force inward','crossing: U0 K=E force0','negative x inward force','zero amplitude no division or gap','a-independent current state and geometry','mass-invariant geometry at fixed phase,k,A','maximum A fits k-scaled energy domain'],graph:{nodes:D.nodes.length,edges:D.edges.length,trails:D.trails.length,workNodes:work.nodes},hashes:Object.fromEntries(['atlas/motion-model.js','atlas/motion-bridge.js','atlas/index.html','atlas/data.js'].map(p=>[p,sha(p)]))};
fs.writeFileSync('specs/reviews/atlas-spring-potential-20261026/independent-probe.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
