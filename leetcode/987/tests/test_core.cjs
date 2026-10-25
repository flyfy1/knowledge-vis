const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const {trace,presets}=require('../core.js');
// Independent breadth-first queue assigns coordinates directly from serialized input.
function oracle(a){let queue=a.length?[[0,0]]:[],i=0,at=1,records=[];if(a.length)records.push([0,0,a[0],'root']);let qi=0;
 while(qi<queue.length&&at<a.length){const [row,col]=queue[qi++];for(const d of [-1,1]){const v=a[at++];if(v!=null){queue.push([row+1,col+d]);records.push([col+d,row+1,v]);}}}
 const groups=new Map();for(const [col,row,value] of records){if(!groups.has(col))groups.set(col,new Map());const rows=groups.get(col);if(!rows.has(row))rows.set(row,[]);rows.get(row).push(value);}
 return {records,result:[...groups.keys()].sort((a,b)=>a-b).map(c=>[...groups.get(c).keys()].sort((a,b)=>a-b).flatMap(r=>groups.get(c).get(r).sort((a,b)=>a-b)))};
}
let cases=0,framesChecked=0;
function check(a){const {nodes,frames}=trace(a),o=oracle(a);assert.deepEqual(frames.at(-1).output,o.result);
 for(let i=0;i<frames.length;i++){const f=frames[i];framesChecked++;assert.equal(new Set(f.seen).size,f.seen.length);assert.equal(f.records.length,f.seen.length);
 for(const r of f.records){const n=nodes.find(n=>n.id===r.id);assert(f.seen.includes(r.id));assert.deepEqual([r.col,r.row,r.value],[n.col,n.row,n.value]);assert(o.records.some(x=>x[0]===r.col&&x[1]===r.row&&x[2]===r.value));}
 if(f.phase==='collect'){assert.equal(f.records.at(-1).id,f.current);assert.equal(f.records.length,i);assert.deepEqual(f.records.slice(0,-1),frames[i-1].records);}
 if(f.phase==='sorted'||f.phase==='grouped'){for(let j=1;j<f.records.length;j++){const a=f.records[j-1],b=f.records[j];assert(a.col<b.col||a.col===b.col&&(a.row<b.row||a.row===b.row&&a.value<=b.value));}}
 }
 // Snapshots must be independent objects.
 if(frames.length>2){const old=JSON.stringify(frames[1]);frames.at(-1).records[0].value=-999;assert.equal(JSON.stringify(frames[1]),old);}
 cases++;
}
presets.forEach(check);
let seed=987;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for(let k=0;k<1000;k++){const a=[rand(1001)];let pending=1;for(let j=0;j<30&&pending;j++){pending--;for(let t=0;t<2;t++){const v=rand(4)===0?null:rand(1001);a.push(v);if(v!==null)pending++;}}check(a);}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'python-code.js'),'utf8'),sandbox);assert.equal(sandbox.window.PYTHON_SOURCE,fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));
// Catch duplicate dictionary keys before JS object parsing discards them.
const copy=fs.readFileSync(path.join(ROOT,'copy.js'),'utf8');const keys=[...copy.matchAll(/(?:^|[,\n])\s*(\w+)\s*:\s*\[/g)].map(m=>m[1]);assert.equal(new Set(keys).size,keys.length);
const ctx={window:{}};vm.runInNewContext(copy,ctx);assert.equal(Object.keys(ctx.window.COPY).length,keys.length);for(const [key,pair]of Object.entries(ctx.window.COPY)){assert.equal(pair.length,2,key);pair.forEach(x=>assert(typeof x==='string'&&x.length,key));}
const report={kind:'author self-check',cases,framesChecked,copyKeys:keys.length,sourceParity:true};fs.writeFileSync(path.join(OUT,'core.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
