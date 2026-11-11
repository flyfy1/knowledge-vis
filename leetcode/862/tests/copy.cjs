const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),s=fs.readFileSync(path.join(root,'copy.js'),'utf8'),tree=acorn.parse(s,{ecmaVersion:2020});
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){const keys=n.properties.map(p=>p.key.name||p.key.value);assert.equal(keys.length,new Set(keys).size,'duplicate object key');}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
walk(tree);const w={};vm.runInNewContext(s,{window:w});
for(const [k,v] of Object.entries(w.LESSON_COPY)){assert.equal(v.length,2,k);assert(v.every(x=>typeof x==='string'&&x.length),k);const placeholders=x=>[...x.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();assert.deepEqual(placeholders(v[0]),placeholders(v[1]),k);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/data-i18n="(\w+)"/g))assert(w.LESSON_COPY[m[1]],m[1]);console.log('PASS AST duplicate keys, bilingual pair shapes, placeholders, static consumers');
