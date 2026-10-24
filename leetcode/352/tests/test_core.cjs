const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js');
function oracle(seen){let result=[],start=null;const max=Math.max(-1,...seen);for(let x=0;x<=max+1;x++){if(seen.has(x)&&start===null)start=x;else if(!seen.has(x)&&start!==null){result.push([start,x-1]);start=null;}}return result;}
let count=0,seed=352;
function check(values){let seen=new Set(),previous=[];const frames=core.trace(values);frames.forEach((f,i)=>{assert.deepEqual(f.before,previous);seen.add(values[i]);assert.deepEqual(f.after,oracle(seen));assert.ok(f.after.every((r,j)=>r[0]<=r[1]&&(!j||f.after[j-1][1]+1<r[0])));assert.equal(f.p,f.before.findIndex(r=>r[0]>=f.value)<0?f.before.length:f.before.findIndex(r=>r[0]>=f.value));previous=f.after;count++;});if(frames.length>1){let saved=JSON.stringify(frames[0]);frames.at(-1).after.push([-1,-1]);assert.equal(JSON.stringify(frames[0]),saved);}}
function visit(a){check(a);if(a.length<6)for(let x=0;x<5;x++)visit([...a,x]);}visit([]);
for(let n=0;n<100;n++){let values=[];for(let i=0;i<100;i++){seed=(1664525*seed+1013904223)>>>0;values.push(seed%10001);}check(values);}
check([0,10000,9999,1,0]);
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),context);
for(const [key,pair] of Object.entries(context.window.LESSON_COPY)){assert.equal(pair.length,2,key);assert.ok(pair.every(x=>typeof x==='string'&&x.length));}
// Detect duplicate definitions before evaluation can silently overwrite them.
const acorn=require('acorn');const ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const keys=node.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate localization key');}for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}walk(ast);
const report={kind:'author self-check',result:'pass',intermediateFrames:count,seed:352,localizationKeys:Object.keys(context.window.LESSON_COPY).length,duplicateKeys:'AST verified'};
fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(report,null,2));console.log(report);
