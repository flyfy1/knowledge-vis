const fs=require('fs'),path=require('path'),vm=require('vm'),acorn=require('acorn');
const src=fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8');
const tree=acorn.parse(src,{ecmaVersion:2022});
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){const keys=n.properties.map(p=>p.key.name||p.key.value);if(new Set(keys).size!==keys.length)throw Error('duplicate key');}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else walk(v);}
walk(tree);const sandbox={window:{}};vm.runInNewContext(src,sandbox);for(const [k,v]of Object.entries(sandbox.window.LESSON_COPY)){if(!Array.isArray(v)||v.length!==2||v.some(s=>typeof s!=='string'||!s))throw Error(k);}
