'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),{trace}=require('../core.js');
let checks=0;
function oracle(a,k){return Array.from({length:a.length-k+1},(_,i)=>{const s=a.slice(i,i+k).sort((x,y)=>x-y);return (s[Math.floor((k-1)/2)]+s[Math.floor(k/2)])/2;});}
function check(a,k){const m=trace(a,k);for(const [i,f] of m.frames.entries()){
 const counts=m.values.map(v=>f.active.filter(x=>x===v).length);
 assert.deepEqual(f.tree.slice(m.size,m.size+m.values.length),counts);
 assert(f.tree.slice(m.size+m.values.length).every(x=>x===0));
 assert.equal(f.tree[1],f.active.length);
 for(let node=1;node<m.size;node++)assert.equal(f.tree[node],f.tree[node*2]+f.tree[node*2+1]);
 for(const v of f.tree)assert(v>=0);
 if(f.kind==='remove')assert.equal(f.active.length,k-1);
 if(f.kind==='query'){
  assert.equal(f.active.length,k);const sorted=f.active.slice().sort((x,y)=>x-y);
  f.selections.forEach((s,j)=>{let r=Math.floor((k+1+j)/2);assert.equal(s.value,sorted[r-1]);for(const v of s.route){assert.equal(v.r,r);assert.equal(v.c,f.tree[v.node*2]);assert.equal(v.left,r<=v.c);if(!v.left)r-=v.c;}assert.equal(m.values[s.leaf-m.size],s.value);});
 }
 assert.deepEqual(f.answers,oracle(a.slice(0,Math.max(0,f.i+(f.kind==='query'?1:0))),k));
 if(i)assert.notStrictEqual(f.tree,m.frames[i-1].tree);
 checks++;
}assert.deepEqual(m.frames.at(-1).answers,oracle(a,k));}
for(let n=1;n<=6;n++){for(let mask=0;mask<3**n;mask++){let z=mask,a=[];for(let i=0;i<n;i++){a.push(z%3-1);z=Math.floor(z/3);}for(let k=1;k<=n;k++)check(a,k);}}
let seed=480;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
for(let i=0;i<500;i++){const n=1+rand()%30,a=Array.from({length:n},()=>rand()%101-50);check(a,1+rand()%n);}
check([-2147483648,2147483647,0,0,-2],2);
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const acorn=require('acorn');
function copyKeys(source){const ast=acorn.parse(source,{ecmaVersion:2022});const assignment=ast.body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression');assert(assignment);return assignment.expression.right.properties.map(p=>p.key.name??p.key.value);}
const keys=copyKeys(fs.readFileSync(path.join(root,'copy.js'),'utf8'));assert.equal(keys.length,new Set(keys).size);
const duplicate=copyKeys('window.COPY={a:["一","one"],a:["二","two"]};');assert.notEqual(duplicate.length,new Set(duplicate).size);
const cp={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),cp);for(const pair of Object.values(cp.window.COPY)){assert.equal(pair.length,2);assert(pair.every(x=>typeof x==='string'&&x.length));}
const out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({passed:true,frames:checks,copy_keys:keys.length,seed:480},null,2));console.log('PASS:',checks,'intermediate frames; source mirror and copy-key uniqueness');
