const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const {presets,trace}=require('../core.js');const out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
let seed=850;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
function cells(rs,left,right){const seen=new Set();for(const [a,b,c,d] of rs)for(let x=a;x<c;x++)if(left===undefined||left<=x&&x<right)for(let y=b;y<d;y++)seen.add(`${x},${y}`);return seen.size;}
let cases=0,framesChecked=0;
function check(rs){const frames=trace(rs);assert.equal(frames[0].area,0);for(let i=1;i<frames.length;i++){const f=frames[i];assert.equal(f.delta,cells(rs,f.left,f.right));assert.equal(f.area,f.before+f.delta);assert.equal(f.area,cells(rs,0,f.right));assert.equal(f.delta,(f.right-f.left)*f.height);assert.equal(f.rows.length,i);for(let j=1;j<f.merged.length;j++)assert(f.merged[j-1][1]<f.merged[j][0]);assert.equal(f.before,frames[i-1].area);framesChecked++;}assert.equal(frames.at(-1).area,cells(rs));cases++;}
presets.forEach(check);assert.deepEqual(presets.map(r=>trace(r).at(-1).area),[5,6,4,4,4,2]);
for(let i=0;i<1000;i++){const rs=[];for(let j=0,n=1+rand(8);j<n;j++){const a=rand(6),b=rand(6);rs.push([a,b,a+1+rand(3),b+1+rand(3)]);}check(rs);}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),context);for(const [k,v] of Object.entries(context.window.COPY)){assert.equal(v.length,2,k);assert(v.every(x=>typeof x==='string'&&x.length),k);}
const result={status:'pass',cases,framesChecked,presetAreas:[5,6,4,4,4,2]};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
