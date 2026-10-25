const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function oracle(nums,k){let score=-1,best;for(let a=0;a<=nums.length-k;a++)for(let b=a+k;b<=nums.length-k;b++)for(let c=b+k;c<=nums.length-k;c++){let s=0;for(const i of [a,b,c])for(let h=i;h<i+k;h++)s+=nums[h];if(s>score){score=s;best=[a,b,c];}}return {best,score};}
let cases=0,framesChecked=0;
function check(input){const {nums,k}=input,frames=C.trace(input),m=nums.length-k+1,w=Array.from({length:m},(_,i)=>nums.slice(i,i+k).reduce((a,b)=>a+b));
 let previous=0;
 for(const f of frames){assert.deepEqual(f.w,w);for(let i=0;i<m;i++){if(f.left[i]!==null){let max=Math.max(...w.slice(0,i+1));assert.equal(f.left[i],w.indexOf(max));}if(f.right[i]!==null){let max=Math.max(...w.slice(i));assert.equal(f.right[i],w.indexOf(max,i));}}
  let best=null,score=-1;
  for(const row of f.ledger){const [a,b,c]=row.candidate;assert(a+k<=b&&b+k<=c);assert.equal(row.total,w[a]+w[b]+w[c]);const legal=[];for(let x=0;x<=b-k;x++)for(let z=b+k;z<m;z++)legal.push({s:w[x]+w[b]+w[z],a:[x,b,z]});legal.sort((x,y)=>y.s-x.s||x.a[0]-y.a[0]||x.a[2]-y.a[2]);assert.deepEqual(row.candidate,legal[0].a);if(row.total>score){score=row.total;best=row.candidate;}else if(row.total===score){
   const x=row.candidate;if(x[0]<best[0]||(x[0]===best[0]&&(x[1]<best[1]||(x[1]===best[1]&&x[2]<best[2]))))best=x;
  }
  assert.deepEqual(row.best,best);assert.equal(row.bestSum,score);
 }
 assert(f.ledger.length===previous||f.ledger.length===previous+1);previous=f.ledger.length;framesChecked++;
 }
 const want=oracle(nums,k);assert.deepEqual(frames.at(-1).best,want.best);assert.equal(frames.at(-1).bestSum,want.score);assert.equal(frames.length,1+2*m+(m-2*k));cases++;
}
for(let n=3;n<=9;n++)for(let mask=0;mask<2**n;mask++)for(let k=1;k<=Math.floor(n/3);k++)check({nums:Array.from({length:n},(_,i)=>1+((mask>>i)&1)),k});
let seed=689;const rand=n=>{seed=(1664525*seed+1013904223)>>>0;return seed%n;};
for(let z=0;z<300;z++){const n=3+rand(16);check({nums:Array.from({length:n},()=>1+rand(30)),k:1+rand(Math.floor(n/3))});}
for(const x of C.presets)check(x);
const report={kind:'author self-check',cases,framesChecked,invariants:'every filled L/R entry earliest maximum; fixed-middle optimum; all candidate identities, totals, best-so-far and final oracle'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
