const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),vm=require('vm');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const {trace}=require('../core.js');let checks=0;
for(const {matrix,k,answer} of JSON.parse(fs.readFileSync(path.join(out,'fixtures.json')))){
 let best=null;
 for(let top=0;top<matrix.length;top++)for(let bottom=top;bottom<matrix.length;bottom++){
  const data=trace(matrix,k,top,bottom);let prefixes=[0];
  data.sums.forEach((_,col)=>{
   const h=data.frames[col+1].history[col];const p=data.sums.slice(0,col+1).reduce((a,b)=>a+b,0);
   assert.equal(h.prefix,p);assert.deepEqual(h.before,prefixes.slice().sort((a,b)=>a-b));
   let expected=null;for(let start=0;start<=col;start++){let value=0;for(let r=top;r<=bottom;r++)for(let c=start;c<=col;c++)value+=matrix[r][c];if(value<=k)expected=expected===null?value:Math.max(expected,value);}
   assert.equal(h.candidate,expected);prefixes.push(p);
   const prev=data.frames[col].best;assert.equal(h.best,expected===null?prev:prev===null?expected:Math.max(prev,expected));
   if(h.best!==null)best=best===null?h.best:Math.max(best,h.best);checks++;
  });
 }
 assert.equal(best,answer);
}
const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8'),box);assert(Object.values(box.window.COPY).every(v=>v.length===2&&v.every(x=>typeof x==='string'&&x.length)));
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({intermediate_checks:checks,all_passed:true},null,2));console.log(checks,'intermediate invariant checks passed');
