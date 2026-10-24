const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),{trace,presets}=require(root+'/core.js');let checked=0;
function check(ops){const ref=new Map();const frames=trace(ops);for(let i=0;i<frames.length;i++){
 const f=frames[i];if(i){const [op,k]=ops[i-1];if(op==='inc')ref.set(k,(ref.get(k)||0)+1);if(op==='dec'){ref.set(k,ref.get(k)-1);if(!ref.get(k))ref.delete(k);}}
 assert.deepEqual(f.after.counts,Object.fromEntries(ref));let prev=0,seen=[];for(const g of f.after.groups){assert(g.c>prev);assert(g.keys.length);prev=g.c;for(const k of g.keys){assert.equal(ref.get(k),g.c);seen.push(k);}}assert.equal(new Set(seen).size,ref.size);if(i)assert.deepEqual(f.before,frames[i-1].after);if(f.kind.startsWith('get')){if(!ref.size)assert.equal(f.result,'');else assert.equal(ref.get(f.result),Math[f.kind==='getMinKey'?'min':'max'](...ref.values()));}checked++;
 }assert.equal(JSON.stringify(trace(ops)),JSON.stringify(frames));}
presets.forEach(check);
function walk(ops,d,depth){check(ops);if(!depth)return;for(const k of ['a','b'])for(const op of ['inc','dec']){if(op==='dec'&&!d[k])continue;const n={...d};n[k]=(n[k]||0)+(op==='inc'?1:-1);if(!n[k])delete n[k];walk([...ops,[op,k]],n,depth-1);}}
walk([],{},6);
// Reject duplicate dictionary keys before JavaScript can silently overwrite them.
const copy=fs.readFileSync(root+'/copy.js','utf8'),keys=[...copy.matchAll(/^\s*(\w+):/gm)].map(m=>m[1]);
// Properties may share a source line: parser-based duplicate detection.
const acorn=require('acorn');let names=[];const ast=acorn.parse(copy,{ecmaVersion:2022});const obj=ast.body[0].expression.right;for(const prop of obj.properties){const k=prop.key.name||prop.key.value;assert(!names.includes(k),'duplicate copy key '+k);names.push(k);assert.equal(prop.value.elements.length,2);}
const context={window:{}};vm.runInNewContext(copy,context);const html=fs.readFileSync(root+'/index.html','utf8');for(const m of html.matchAll(/data-i18n="(.*?)"/g))assert(context.window.COPY[m[1]],m[1]);
const out=process.env.OUTPUT_DIR||__dirname+'/evidence';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/core-results.json',JSON.stringify({status:'pass',checked,copyKeys:names.length},null,2));console.log('PASS',checked,'frames and',names.length,'unique bilingual keys');
