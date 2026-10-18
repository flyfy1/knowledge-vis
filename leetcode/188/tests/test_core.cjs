const assert=require('assert'),fs=require('fs'),path=require('path');
const core=require('../core.js');
// Enumerate actual legal action histories and group by budget, independently of max recurrence.
function historyValues(prices,k){
 let histories=[{cash:0,held:false,buys:0,sells:0}];
 for(const p of prices){
  const next=[];for(const h of histories){next.push(h);if(h.held)next.push({...h,cash:h.cash+p,held:false,sells:h.sells+1});else if(h.buys<k)next.push({...h,cash:h.cash-p,held:true,buys:h.buys+1});}histories=next;
 }
 return Array.from({length:k},(_,i)=>{
  const t=i+1;return [Math.max(-Infinity,...histories.filter(h=>h.held&&h.buys<=t).map(h=>h.cash)),Math.max(...histories.filter(h=>!h.held&&h.sells<=t).map(h=>h.cash))];
 }).flat();
}
let count=0;
function check(prices,k){const frames=core.trace({prices,k});assert.equal(frames.length,prices.length+1);for(let d=0;d<frames.length;d++){const f=frames[d];assert.deepStrictEqual(f.values,historyValues(prices.slice(0,d),k));if(d){assert.deepStrictEqual(f.old,frames[d-1].values);f.values.forEach((x,i)=>assert.equal(x,Math.max(f.old[i],f.candidates[i])));}count++;}}
for(let n=0;n<=6;n++){for(let code=0;code<3**n;code++){let v=code,p=[];for(let i=0;i<n;i++){p.push(v%3);v=Math.floor(v/3);}for(let k=1;k<=3;k++)check(p,k);}}
core.presets.forEach(p=>check(p.prices,p.k));
assert.deepStrictEqual(core.trace({prices:[1,4,2,5],k:2}).at(-1).values,[-1,4,1,6]);
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({prefixStateChecks:count,oracle:'enumeration of action histories, grouped by at-most budget',presets:core.presets.length},null,2));console.log('Core checks passed:',count);
