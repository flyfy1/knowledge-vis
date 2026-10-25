const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
for(const {input,expected} of cases){const m=C.trace(input);assert.equal(m.frames.at(-1).chosen.length,expected);
 for(let i=1;i<m.frames.length;i++){const f=m.frames[i];assert.equal(new Set(f.chosen).size,f.chosen.length);assert.deepEqual(f.chosen.slice(-2),[f.p,f.q]);assert.equal(f.before.length+f.added.length,f.chosen.length);for(const [l,r] of m.ordered.slice(0,i))assert(f.chosen.filter(x=>l<=x&&x<=r).length>=2);}
}
const w={};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),{window:w});assert.equal(w.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),keys=[...copy.matchAll(/^\s+(\w+):/gm)].map(x=>x[1]); // parser check below handles inline properties too
const acorn=require('acorn'),ast=acorn.parse(copy,{ecmaVersion:2022});
const object=ast.body[1].expression.right,seen=new Set();for(const p of object.properties){const key=p.key.name;assert(!seen.has(key),'duplicate '+key);seen.add(key);assert.equal(p.value.elements.length,2);for(const el of p.value.elements)assert.equal(typeof el.value,'string');}
fs.writeFileSync(path.join(out,'core-result.json'),JSON.stringify({status:'passed',cases:cases.length,checks:'Every frame: unique choices, two-largest summary, prefix coverage, accounting; source parity; duplicate keys and bilingual shape'}));console.log('Core and copy checks passed',cases.length);
