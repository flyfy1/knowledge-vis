const fs=require('fs'),assert=require('assert/strict'),vm=require('vm'),acorn=require('acorn');
const src=fs.readFileSync(require.resolve('../copy.js'),'utf8'),tree=acorn.parse(src,{ecmaVersion:'latest'});
let objects=0;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){objects++;const keys=n.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate translation key');}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(tree);
const ctx={window:{}};vm.runInNewContext(src,ctx);for(const [k,v] of Object.entries(ctx.window.COPY)){assert.equal(v.length,2,k);assert(v.every(s=>typeof s==='string'&&s.length));}
console.log(`${Object.keys(ctx.window.COPY).length} bilingual pairs; ${objects} object namespaces checked before evaluation`);
