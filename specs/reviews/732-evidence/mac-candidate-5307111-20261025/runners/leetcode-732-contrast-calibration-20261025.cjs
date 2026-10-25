const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8');
const body=source.slice(source.indexOf('function lum(c)'),source.indexOf('function ratio(a,b)'));
assert(body.startsWith('function lum(c)'));const lum=vm.runInNewContext('('+body.trim()+')');
const ref=c=>c.map(x=>(x/=255)<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const ratio=(fn,a,b)=>(Math.max(fn(a),fn(b))+.05)/(Math.min(fn(a),fn(b))+.05);
const vectors=[[0,0,0],[255,255,255],[255,0,0],[0,255,0],[0,0,255],[128,128,128]];
const results=vectors.map(rgb=>({rgb,actual:lum(rgb),expected:ref(rgb)}));
let witness;for(let i=0;i<256&&!witness;i++)for(let j=0;j<i;j++){const a=[i,i,i],b=[j,j,j],actual=ratio(lum,a,b),expected=ratio(ref,a,b);if(actual>=4.5&&expected<4.5){witness={a,b,actual,expected};break;}}
const report={source:process.argv[2],reference:'https://www.w3.org/TR/WCAG22/#dfn-relative-luminance',results,falsePassWitness:witness||null,pass:results.every(x=>Math.abs(x.actual-x.expected)<1e-12)};console.log(JSON.stringify(report,null,2));process.exitCode=report.pass?0:1;
