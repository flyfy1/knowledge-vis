const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm'),acorn=require('acorn');
const C=require('../core.js'),root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
function gcd(a,b){while(b){const r=a%b;a=b;b=r;}return a;}
function partition(nums,edges){const adj=nums.map(()=>[]);for(const [a,b] of edges){adj[a].push(b);adj[b].push(a);}const seen=new Set(),groups=[];for(let i=0;i<nums.length;i++){if(seen.has(i))continue;const todo=[i],g=[];seen.add(i);while(todo.length){const u=todo.pop();g.push(nums[u]);for(const v of adj[u])if(!seen.has(v)){seen.add(v);todo.push(v);}}groups.push(g);}return norm(groups);}
function norm(gs){return gs.map(g=>g.slice().sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]);}
let inputs=0,frames=0;
function check(nums,answer){const original=JSON.stringify(nums),trace=C.trace(nums);let associations=[];for(let i=0;i<nums.length;i++){
 const expected=[];for(let p=2;p<=nums[i];p++){if(nums[i]%p===0){let prime=true;for(let d=2;d*d<=p;d++)if(p%d===0)prime=false;if(prime)expected.push(p);}}
 assert.deepEqual(C.factors(nums[i]),expected);associations.push(...expected.map(p=>({i,p})));}
 assert.equal(trace.length,associations.length+1);
 for(let k=0;k<trace.length;k++){const f=trace[k],edges=[],owners={};for(const {i,p} of associations.slice(0,k)){if(owners[p]===undefined)owners[p]=i;else edges.push([i,owners[p]]);}assert.deepEqual(f.owner,owners);assert.deepEqual(norm(f.groups),partition(nums,edges));assert.equal(f.events.length,k);assert.equal(f.largest,Math.max(...f.groups.map(g=>g.length)));assert.equal(f.groups.flat().length,nums.length);assert.equal(new Set(f.groups.flat()).size,nums.length);for(const e of f.events){assert.equal(nums[e.i]%e.p,0);if(e.j!==undefined){assert.equal(nums[e.j]%e.p,0);assert(gcd(nums[e.i],nums[e.j])>1);}}frames++;}
 const all=[];for(let i=0;i<nums.length;i++)for(let j=0;j<i;j++)if(gcd(nums[i],nums[j])>1)all.push([i,j]);assert.deepEqual(norm(trace.at(-1).groups),partition(nums,all));if(answer!==undefined)assert.equal(trace.at(-1).largest,answer);assert.equal(JSON.stringify(nums),original);inputs++;}
for(let mask=1;mask<(1<<12);mask++)check(Array.from({length:12},(_,i)=>i+1).filter((_,i)=>mask&(1<<i)));
// Independent final partitions for larger random cases; factor list uses slow divisibility oracle.
for(const row of JSON.parse(fs.readFileSync(path.join(out,'oracle-corpus.json'))).slice(0,80))check(row.nums,row.answer);
C.presets.forEach((a,i)=>check(a,[4,2,8,1,3,1,3][i]));check([14,25,35,11],3);
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),context);assert.equal(context.window.PYTHON_SOURCE,source);
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),ast=acorn.parse(copy,{ecmaVersion:'latest'}),keys=new Set();const obj=ast.body[0].expression.right;for(const prop of obj.properties){const k=prop.key.name||prop.key.value;assert(!keys.has(k),'Duplicate '+k);keys.add(k);assert.equal(prop.value.elements.length,2);for(const e of prop.value.elements)assert.equal(typeof e.value,'string');}
const entry=JSON.parse(fs.readFileSync(path.join(root,'lesson-entry.json')));assert.equal(typeof entry.complexity,'string');assert(entry.complexity.length);const official=JSON.parse(fs.readFileSync(path.join(root,'provenance/official.json'))).response.data.question;assert.equal(official.questionFrontendId,'952');assert(official.codeSnippets.some(s=>s.langSlug==='python3'&&s.code.includes('largestComponentSize')));
const result={kind:'author self-check',inputs,intermediateFrames:frames,duplicateCopyKeys:false,copyPairs:keys.size,sourceMirrorExact:true,officialPython3Verified:true};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2));console.log(result);
