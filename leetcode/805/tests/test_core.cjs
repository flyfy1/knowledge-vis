const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const {trace,presets}=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function subsets(a){const groups=Array.from({length:a.length+1},()=>new Set());for(let mask=0;mask<2**a.length;mask++){let c=0,s=0;for(let p=0;p<a.length;p++)if(mask&(1<<p)){c++;s+=a[p];}groups[c].add(s);}return groups.map(s=>[...s].sort((a,b)=>a-b));}
function oracle(a){const groups=subsets(a),S=a.reduce((a,b)=>a+b,0);return groups.some((s,k)=>k>0&&k<a.length&&s.some(v=>v*a.length===S*k));}
let states=0,cases=0;
function check(a){const model=trace(a),before=JSON.stringify(a);assert.equal(model.result,oracle(a));let lp=0,rp=0;
 model.frames.forEach((f,index)=>{const e=f.event;if(e.type==='build'){if(e.side==='left')lp++;else rp++;const prev=model.frames[index-1];assert.deepEqual(e.old,e.side==='left'?prev.left:prev.right);}
 assert.deepEqual(f.left,subsets(a.slice(0,lp)));assert.deepEqual(f.right,subsets(a.slice(model.mid,model.mid+rp)));
 if(e.type==='probe'){assert.equal(e.i+e.j,e.k);assert.equal(e.target*a.length,e.k*model.total);e.checks.forEach(c=>assert.equal(c.hit,subsets(a.slice(model.mid))[e.j].includes(e.target-c.a)));assert.equal(!!e.match,e.checks.some(c=>c.hit));if(f.done){assert(e.match);assert.equal(f.result,true);}}
 if(f.done)assert.equal(index,model.frames.length-1);states++;
 });assert.equal(JSON.stringify(a),before);assert(model.frames.at(-1).done);cases++;}
presets.forEach(check);
for(let n=1;n<=6;n++)for(let mask=0;mask<3**n;mask++){let v=mask,a=[];for(let i=0;i<n;i++){a.push(v%3);v=Math.floor(v/3);}check(a);}
let seed=805;for(let z=0;z<200;z++){seed=(seed*1664525+1013904223)>>>0;const n=1+seed%11,a=[];for(let p=0;p<n;p++){seed=(seed*1664525+1013904223)>>>0;a.push(seed%50);}check(a);}
// Detect duplicate keys before JavaScript evaluation can discard them.
const copyText=fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),keys=[...copyText.matchAll(/(?:^|[,\n])\s*(\w+)\s*:\s*\[/g)].map(m=>m[1]);assert.equal(new Set(keys).size,keys.length);
const sandbox={window:{}};vm.runInNewContext(copyText,sandbox);Object.values(sandbox.window.COPY).forEach(pair=>assert(pair.length===2&&pair.every(v=>typeof v==='string'&&v.length>0)));
const report={result:'PASS',cases,states,localizationKeys:keys.length,method:'Independent positional subset enumeration for every half snapshot and complement check'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
