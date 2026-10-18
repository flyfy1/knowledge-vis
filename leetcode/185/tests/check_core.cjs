const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const c=require('../core.js');let checks=0;
function check(rows){const t=c.trace(rows);t.frames.forEach((f,i)=>{assert.equal(f.ranks.length,i);for(let j=0;j<i;j++){const r=t.rows[j],rank=1+new Set(rows.filter(s=>s.departmentId===r.departmentId&&s.salary>r.salary).map(s=>s.salary)).size;assert.equal(f.ranks[j],rank);checks++;}if(i)assert.deepEqual(t.frames[i-1].ranks,f.ranks.slice(0,-1));});}
c.presets.forEach(check);
for(let n=0;n<=5;n++)for(let mask=0;mask<3**n;mask++){let q=mask;const rows=[];for(let i=0;i<n;i++){rows.push({id:i,name:String(i),salary:q%3,departmentId:i%2});q=Math.floor(q/3);}check(rows);}
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({checks,status:'pass',invariants:'every prefix rank independently counted; previous frames unchanged'},null,2));console.log({checks});
