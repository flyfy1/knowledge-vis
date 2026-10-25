'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const S=require('../core.js');
const acorn=require('acorn');
function uniqueCopyKeys(source){const ast=acorn.parse(source,{ecmaVersion:'latest'});const obj=ast.body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression').expression.right;const keys=obj.properties.map(p=>p.key.name??p.key.value);assert.equal(keys.length,new Set(keys).size,'duplicate localization key');}
assert.throws(()=>uniqueCopyKeys('window.COPY={x:["中","en"],x:["另","other"]};'),/duplicate/);
uniqueCopyKeys(fs.readFileSync(path.join(root,'copy.js'),'utf8'));

function oracle(a,b,end){let best=Infinity;for(let mask=0;mask<2**a.length;mask++){if(end!==undefined&&((mask>>(a.length-1))&1)!==end)continue;let prev=null,valid=true,cost=0;for(let i=0;i<a.length;i++){const swapped=(mask>>i)&1;cost+=swapped;const pair=swapped?[b[i],a[i]]:[a[i],b[i]];if(prev&&!(prev[0]<pair[0]&&prev[1]<pair[1]))valid=false;prev=pair;}if(valid)best=Math.min(best,cost);}return best;}
let checks=0;
for(const [a,b] of S.presets){for(const f of S.trace(a,b)){assert.equal(f.k,oracle(a.slice(0,f.i+1),b.slice(0,f.i+1),0));assert.equal(f.w,oracle(a.slice(0,f.i+1),b.slice(0,f.i+1),1));checks++;}}
for(const c of JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')))){const frames=S.trace(c.a,c.b);for(let i=0;i<frames.length;i++){assert.deepEqual([frames[i].k,frames[i].w],c.costs[i]);checks++;}}
for(let mask=0;mask<16;mask++){const h=S.orient(...S.presets[0],mask);assert.equal(h.cost,mask.toString(2).split('1').length-1);assert.equal(h.valid,h.x.every((v,i)=>!i||(h.x[i-1]<v&&h.y[i-1]<h.y[i])));}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),ctx);for(const [key,pair] of Object.entries(ctx.window.COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length),key);
assert.deepEqual(S.trace([0,5,4,8,7],[1,2,6,5,9]).map(f=>[f.k,f.w]),[[0,1],[0,1],[1,1],[1,2],[2,2]]);
fs.writeFileSync(path.join(out,'core.json'),JSON.stringify({prefix_invariant_checks:checks,hand_masks:16,copy_pairs:Object.keys(ctx.window.COPY).length,result:'pass'},null,2));console.log('Core prefix invariants PASS:',checks);
