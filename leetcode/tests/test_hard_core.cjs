'use strict';
const assert=require('node:assert/strict'),core=require('../hard-first-ten/core.js'),fixtures=require('../hard-first-ten/fixtures.json');
let checks=0,seed=20261017;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const water=a=>a.map((h,i)=>Math.min(Math.max(...a.slice(0,i+1)),Math.max(...a.slice(i)))-h);
function wildcard(s,p){const cache=new Map();function f(i,j){const k=i+','+j;if(cache.has(k))return cache.get(k);let result;if(j===p.length)result=i===s.length;else if(p[j]==='*')result=Array.from({length:s.length-i+1},(_,n)=>i+n).some(n=>f(n,j+1));else result=i<s.length&&(p[j]==='?'||p[j]===s[i])&&f(i+1,j+1);cache.set(k,result);return result;}return f(0,0);}
function check(id,input){const {frames,result}=core[id](input);assert.ok(frames.length);eq(frames.at(-1).result,result);
 if(id===4){const a=input.flat().sort((a,b)=>a-b);eq(result,(a[(a.length-1)>>1]+a[a.length>>1])/2);for(const f of frames)if(f.cuts){eq(f.cuts[0]+f.cuts[1],Math.floor((a.length+1)/2));if(f.code==='lo = i + 1')eq(f.state.lo,f.state.i+1);if(f.code==='hi = i - 1')eq(f.state.hi,f.state.i-1);}}
 if(id===10||id===44){const [s,p]=input,oracle=(s,p)=>id===10?new RegExp('^(?:'+p+')$').test(s):wildcard(s,p);eq(result,oracle(s,p));for(const f of frames){const [i,j]=f.active;eq(f.matrix[i][j],oracle(s.slice(0,i),p.slice(0,j)));for(const [a,b]of f.deps)assert.notEqual(f.matrix[a][b],null);}}
 if(id===23){eq(result,input.flat().sort((a,b)=>a-b));for(const f of frames){f.heap.forEach((x,i)=>{if(i)assert.ok(f.heap[(i-1)>>1].value<=x.value);});eq(new Set(f.heap.map(x=>x.source)).size,f.heap.length);const values=f.output.map(x=>Number(x.split(' = ')[1]));eq(values,values.slice().sort((a,b)=>a-b));}}
 if(id===25){const [a,k]=input,ids=[];for(let i=0;i<a.length;i+=k){const group=Array.from({length:Math.min(k,a.length-i)},(_,n)=>n+i);ids.push(...(group.length===k?group.reverse():group));}const f=frames.at(-1),actual=[],seen=new Set();let p=f.head;while(p!==null){assert.ok(!seen.has(p),'cycle');seen.add(p);actual.push(p);p=f.links[p];}eq(actual,ids);eq(result,ids.map(i=>a[i]));for(const f of frames){eq(f.values,a);if(f.state.changed!==undefined){eq(f.state.prev,f.state.changed);eq(f.state.curr,f.state.nxt);}}}
 if(id===30){const [s,words]=input,w=words[0].length,size=w*words.length,sorted=words.slice().sort().join('|'),expected=[];for(let i=0;i+size<=s.length;i++){const chunks=[];for(let j=i;j<i+size;j+=w)chunks.push(s.slice(j,j+w));if(chunks.sort().join('|')===sorted)expected.push(i);}eq(result.slice().sort((a,b)=>a-b),expected);}
 if(id===32){let best=0;for(let i=0;i<input.length;i++){let balance=0;for(let j=i;j<input.length;j++){balance+=input[j]==='('?1:-1;if(balance<0)break;if(!balance)best=Math.max(best,j-i+1);}}eq(result,best);for(const f of frames)if(f.span){const str=input.slice(f.span[0],f.span[1]+1);let balance=0;for(const c of str){balance+=c==='('?1:-1;assert.ok(balance>=0);}eq(balance,0);eq(str.length,f.state.length);}}
 if(id===41){let missing=1;while(input.includes(missing))missing++;eq(result,missing);let fixed=[];for(const f of frames){const values=f.rows[0].values;eq(values.slice().sort((a,b)=>a-b),input.slice().sort((a,b)=>a-b));for(const i of fixed)eq(values[i],i+1);fixed=values.flatMap((v,i)=>v===i+1?[i]:[]);}}
 if(id===42){const depths=water(input);eq(result,depths.reduce((a,b)=>a+b,0));for(const f of frames){eq(f.state.water,f.settled.reduce((a,b)=>a+(b||0),0));if(f.active>=0){if(f.code.includes('left += 1'))eq(f.state.left,f.active+1);else eq(f.state.right,f.active-1);}f.settled.forEach((v,i)=>{if(v!==null)eq(v,depths[i]);});}}
 if(id===37){const digits='123456789';for(let i=0;i<9;i++){eq(result[i].slice().sort().join(''),digits);eq(result.map(r=>r[i]).sort().join(''),digits);}for(let r=0;r<9;r+=3)for(let c=0;c<9;c+=3)eq(result.slice(r,r+3).flatMap(row=>row.slice(c,c+3)).sort().join(''),digits);for(const f of frames){if(f.state.r>=0){const {r,c}=f.state,values=a=>[...new Set(a.filter(v=>v!=='.'))].sort();eq(f.state.row_used,values(f.board[r]));eq(f.state.column_used,values(f.board.map(row=>row[c])));eq(f.state.box_used,values(f.board.slice(Math.floor(r/3)*3,Math.floor(r/3)*3+3).flatMap(row=>row.slice(Math.floor(c/3)*3,Math.floor(c/3)*3+3))));}}for(const f of frames)for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(input[r][c]!=='.')eq(f.board[r][c],input[r][c]);}
 // Mutating a later frame must not alter any prior snapshot.
 const before=JSON.stringify(frames[0]);if(frames.length>1){frames.at(-1).state.injected=true;eq(JSON.stringify(frames[0]),before);}
}
for(const [id,presets]of Object.entries(fixtures))for(const input of presets)check(+id,input);
for(let run=0;run<600;run++){
 const a=Array.from({length:rand(9)+1},()=>rand(9)-3);check(41,a);check(42,a.map(Math.abs));check(25,[a,rand(a.length)+1]);
 const b=Array.from({length:rand(7)},()=>rand(9)-3);check(4,[a.slice().sort((a,b)=>a-b),b.sort((a,b)=>a-b)]);
 check(23,Array.from({length:rand(5)},()=>Array.from({length:rand(6)},()=>rand(7)).sort((a,b)=>a-b)));
 const s=Array.from({length:rand(7)},()=>rand(2)?'a':'b').join('');let p='';for(let i=0,n=rand(5);i<n;i++)p+=['a','b','.'][rand(3)]+(rand(2)?'*':'');check(10,[s,p]);
 check(44,[s,Array.from({length:rand(6)},()=>['a','b','?','*'][rand(4)]).join('')]);
 check(32,Array.from({length:rand(12)},()=>rand(2)?'(':')').join(''));
 const width=rand(3)+1,words=Array.from({length:rand(4)+1},()=>Array.from({length:width},()=>rand(2)?'a':'b').join(''));check(30,[s,words]);
}
console.log(`JavaScript: ${checks} oracle and intermediate-state checks passed, all ten models.`);
