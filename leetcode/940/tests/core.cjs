const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js');let checks=0;
function oracle(s){const words=new Set();for(let mask=1;mask<2**s.length;mask++){let word='';for(let i=0;i<s.length;i++)if(mask&(1<<i))word+=s[i];words.add(word);}return [...words];}
function check(s){const m=core.trace(s);m.frames.forEach((f,k)=>{const words=oracle(s.slice(0,k));assert.equal(f.total,words.length);const groups={};for(const word of words)(groups[word.at(-1)]??=[]).push(word);for(const c in groups)groups[c].sort();assert.deepEqual(f.groups,groups);if(k){assert.equal(f.newCount,f.before+1);assert.equal(f.total,f.before-f.old+f.newCount);}checks++;});}
for(let n=1;n<=7;n++)for(let v=0;v<3**n;v++){let x=v,s='';for(let i=0;i<n;i++){s+='abc'[x%3];x=Math.floor(x/3);}check(s);}
core.presets.forEach(check);const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),ctx);for(const [k,v] of Object.entries(ctx.window.COPY)){assert(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length),k);}
// Catch duplicate keys before JavaScript silently discards them (all keys are one per line).
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copy.matchAll(/(?:^|,)\s*([A-Za-z0-9]+)\s*:\s*\[/gm)].map(x=>x[1]);assert.equal(new Set(keys).size,keys.length);assert.equal(keys.length,Object.keys(ctx.window.COPY).length);
const result={type:'author core self-check',checks,result:'pass',localizationKeys:keys.length,oracle:'independent position masks, each prefix and ending group'};fs.writeFileSync(path.join(out,'core.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
