'use strict';
const {trace}=require('../core.js'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const rx=/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;
let cases=0,states=0;
function check(s){
 const frames=trace(s),last=frames.at(-1);
 assert.equal(!last.dead&&last.digit,rx.test(s),s);
 assert.equal(frames[0].i,0);assert.equal(frames.length,last.i+1);
 frames.forEach((f,k)=>{
  states++;assert.equal(f.i,k);const prefix=s.slice(0,k);
  const completable=rx.test(prefix)||rx.test(prefix+'0');
  assert.equal(!f.dead,completable,JSON.stringify({s,f}));
  if(!f.dead){
   assert.equal(f.dot,prefix.includes('.'));assert.equal(f.exp,/[eE]/.test(prefix));
   assert.equal(f.digit,/[0-9]/.test(prefix.split(/[eE]/).at(-1)));
   assert.equal(f.digit,rx.test(prefix));
  }
  if(k)assert.equal(f.char,s[k-1]);
  assert.equal(f.done,f.dead||k===s.length);
 });
 if(last.dead)assert.equal(frames.filter(f=>f.dead).length,1);
 // Replay from immutable snapshots, with no partial inverse updates.
 const before=JSON.stringify(frames);trace(s);assert.equal(JSON.stringify(frames),before);
 cases++;
}
function enumerate(s,n){check(s);if(n)for(const c of '01+-.eEa')enumerate(s+c,n-1);}
enumerate('',5);
let seed=65;for(let i=0;i<7000;i++){let s='';seed=(Math.imul(seed,1664525)+1013904223)>>>0;let n=1+seed%20;while(n--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;s+='0123456789eE+-.abcXYZ'[seed%19];}check(s);}
['4.e+2','4.e+','.','-.9','99e2.5','e','-90E3','1..2','--6','1a','1e'+'9'.repeat(18)].forEach(check);
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});const result={result:'pass',cases,states,oracle:'Independent full-match grammar and prefix completable by appending 0'};fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
