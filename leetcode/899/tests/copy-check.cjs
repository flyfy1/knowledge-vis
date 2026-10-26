const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path'),acorn=require('acorn');
const file=path.join(__dirname,'../copy.js'),source=fs.readFileSync(file,'utf8');
const ast=acorn.parse(source,{ecmaVersion:'latest'});
function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const keys=node.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate copy key');}for(const v of Object.values(node)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
walk(ast);const ctx={window:{}};vm.runInNewContext(source,ctx);for(const [key,v]of Object.entries(ctx.window.LESSON_COPY)){assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length));assert.deepEqual([...v[0].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),[...v[1].matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),key);}
console.log('PASS: AST copy-key uniqueness, bilingual pairs and placeholder parity');
