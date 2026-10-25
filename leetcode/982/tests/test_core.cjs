const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});require(root+'/core.js');
function oracle(a){let r=0;for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)for(let k=0;k<a.length;k++)if((a[i]&a[j]&a[k])===0)r++;return r;}
let cases=0,frames=0;
function check(a){const m=AndTriples.trace(a),exact=Array(m.size).fill(0);let p=0;
 const pairs=[];for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)pairs.push(a[i]&a[j]);
 const full=Array(m.size).fill(0);for(const mask of pairs)full[mask]++;
 for(const f of m.frames){frames++;const e=f.event;if(e.type==='pair')exact[pairs[p++]]++;
  assert.deepStrictEqual(f.f,exact);
  if(f.g){for(let s=0;s<m.size;s++){
   let free=e.type==='copy'?0:e.type==='merge'?(1<<e.bit)-1:m.size-1;
   if(e.type==='merge'&&(s&(1<<e.bit))&&s<=e.mask)free|=1<<e.bit;
   let expected=0;for(let z=0;z<m.size;z++)if((z&~s)===0&&((z^s)&~free)===0)expected+=full[z];
   assert.strictEqual(f.g[s],expected,JSON.stringify({a,e,s,actual:f.g[s],expected}));
  }}
  if(e.type==='lookup'){
   let expected=0;for(let k=0;k<=e.k;k++)for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)if(!(a[i]&a[j]&a[k]))expected++;
   assert.strictEqual(f.total,expected);
  }else assert.strictEqual(f.total,0);
 }
 assert.strictEqual(m.frames.at(-1).total,oracle(a));
 assert.strictEqual(m.frames.length-1,a.length*a.length+1+m.bits*m.size/2+a.length);
 cases++;return m;
}
for(let n=1;n<=4;n++)for(let code=0;code<4**n;code++){let t=code;const a=[];for(let i=0;i<n;i++){a.push(t%4);t=Math.floor(t/4);}check(a);}
const fixtures=AndTriples.presets.map(a=>({nums:a,expected:oracle(a),trace:check(a)}));check([3,5,6]);check([1,2,2]);
// Snapshot aliasing must not mutate any earlier state.
const one=AndTriples.trace([2,1,3]);const before=JSON.stringify(one.frames[0]);one.frames.at(-1).f[0]=99;assert.strictEqual(JSON.stringify(one.frames[0]),before);
global.window={};require(root+'/copy.js');const entries=window.LESSON_COPY_ENTRIES;assert.strictEqual(new Set(entries.map(x=>x[0])).size,entries.length);for(const [key,pair] of entries)assert(pair.length===2&&pair.every(v=>typeof v==='string'&&v.length),key);
fs.writeFileSync(out+'/oracle-fixtures.json',JSON.stringify(fixtures,null,2));fs.writeFileSync(out+'/core-results.json',JSON.stringify({kind:'author self-check',cases,frames,checks:'Independent enumeration of every partial transform cell, pair count, k-prefix contribution; snapshot isolation; duplicate keys and bilingual pair shape'},null,2));console.log({cases,frames});
