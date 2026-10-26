const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const core=require('../core.js'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
function pal(n){const d=String(n);for(let i=0;i<d.length/2;i++)if(d[i]!==d[d.length-1-i])return false;return true;}
function check(a,b){const rows=core.trace(String(a),String(b)),expected=[];for(let r=1;r*r<=b;r++)if(pal(r))expected.push(r);assert.deepEqual(rows.map(x=>Number(x.root)),expected);let count=0;for(const row of rows){const r=Number(row.root),sq=r*r;assert.equal(row.square,String(sq));assert.equal(row.pal,pal(sq));assert.equal(row.inRange,sq>=a);count+=Number(sq>=a&&pal(sq));assert.equal(row.count,count);assert.equal(row.accept,sq>=a&&pal(sq));assert.equal(BigInt(row.root),BigInt(row.seed+(row.odd?row.seed.slice(0,-1):row.seed).split('').reverse().join('')));}return count;}
const results=core.presets.map(([a,b])=>check(Number(a),Number(b)));assert.deepEqual(results,[4,1,0,1,3,0]);
let seed=906;for(let i=0;i<300;i++){seed=(seed*1664525+1013904223)>>>0;const b=1+seed%1000000;seed=(seed*1664525+1013904223)>>>0;check(1+seed%b,b);}
fs.writeFileSync(path.join(out,'core-results.json'),JSON.stringify({status:'pass',randomCases:300,presetAnswers:results},null,2));console.log('core: pass');
