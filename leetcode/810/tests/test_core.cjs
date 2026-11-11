const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const independent=a=>Array.from({length:16},(_,i)=>a.reduce((s,v)=>s+Math.floor(v/2**i)%2,0)%2*2**i).reduce((a,b)=>a+b,0);
let states=0,moves=0;
function check(a){
 const start=C.start(a),saved=JSON.stringify(start);assert.equal(C.xor(a),independent(a));assert.equal(C.terminal(start),independent(a)===0);
 if(!C.terminal(start))for(const v of start.items){const child=C.move(start,v.id),rest=a.filter((_,i)=>i!==v.id),after=independent(rest);
  assert.deepEqual(child.items.map(v=>v.value),rest);assert.equal(child.event.before,independent(a));assert.equal(child.event.after,after);assert.equal(child.turn,1);assert.equal(child.loser,after===0?0:null);assert.equal(C.terminal(child),after===0);assert.equal(JSON.stringify(start),saved);moves++;
 }
 let s=start,k=0;while(!C.terminal(s)){const before=s;s=C.automatic(s);assert.equal(s.items.length,before.items.length-1);assert.equal(s.event.after,independent(s.items.map(v=>v.value)));if(before.items.some(v=>(independent(before.items.map(v=>v.value))^v.value)!==0))assert(s.event.after!==0);assert(++k<=a.length);states++;}
 if(start.items.length%2===0||independent(a)===0)assert(s.loser===null||s.loser===1);else assert.equal(s.loser,0);
}
C.presets.forEach(check);for(let n=1;n<=6;n++)for(let v=0;v<3**n;v++){let mask=v,a=[];for(let i=0;i<n;i++){a.push(mask%3);mask=Math.floor(mask/3);}check(a);}
const text=fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8');const keys=[...text.matchAll(/(?:^|[,\n])\s*(\w+)\s*:\s*\[/g)].map(m=>m[1]);assert.equal(new Set(keys).size,keys.length,'duplicate copy key');
const box={window:{}};vm.runInNewContext(text,box);assert.equal(keys.length,Object.keys(box.window.COPY).length);Object.entries(box.window.COPY).forEach(([k,p])=>assert(p.length===2&&p.every(s=>typeof s==='string'&&s.length),k));
const report={result:'PASS',states,moves,localizationKeys:keys.length,method:'Independent per-bit XOR; all candidate transitions and automatic terminal paths, exhaustive alphabet 0..2 up to length 6.'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
