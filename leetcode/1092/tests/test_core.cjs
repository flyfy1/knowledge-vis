const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),core=require(root+'/core.js');
const ast=require('acorn').parse(fs.readFileSync(root+'/copy.js','utf8'),{ecmaVersion:'latest'});
const pairs=ast.body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression').expression.right.properties;
const keys=pairs.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate dictionary keys');
for(const p of pairs){assert.equal(p.value.type,'ArrayExpression');assert.equal(p.value.elements.length,2);for(const v of p.value.elements)assert.equal(typeof v.value,'string');}
const out=process.env.OUTPUT_DIR||__dirname+'/evidence';fs.mkdirSync(out,{recursive:true});
function sub(a,b){let i=0;for(const c of b)if(c===a[i])i++;return i===a.length;}
function oracle(a,b){let best=0;for(let mask=0;mask<2**a.length;mask++){let s='';for(let i=0;i<a.length;i++)if(mask&(1<<i))s+=a[i];if(sub(s,b))best=Math.max(best,s.length);}return a.length+b.length-best;}
let cases=[...core.presets,['','abc'],['','']];let seed=1092;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
for(let k=0;k<120;k++){let a='',b='';for(let i=rand()%7;i>=0;i--)a+='abc'[rand()%3];for(let i=rand()%7;i>=0;i--)b+='abc'[rand()%3];cases.push([a,b]);}
let frames=0,branches=new Set();
for(const [a,b] of cases){const m=core.trace(a,b);assert.equal(m.result.length,oracle(a,b));assert(sub(a,m.result)&&sub(b,m.result));
 let known=0;
 for(const f of m.frames){frames++;branches.add(f.reason||f.kind);
  const cells=f.table.flat().filter(v=>v!==null).length;assert(cells>=known);known=cells;
  for(let i=0;i<=a.length;i++)for(let j=0;j<=b.length;j++)if(f.table[i][j]!==null)assert.equal(f.table[i][j],oracle(a.slice(i),b.slice(j)));
  if(f.kind==='emit'||f.kind==='ready'){assert.equal(f.out.length+f.table[f.i][f.j],oracle(a,b));assert(sub(a.slice(0,f.i),f.out));assert(sub(b.slice(0,f.j),f.out));}
 }
 const initial=JSON.stringify(m.frames[0]);if(m.frames.length>1)m.frames[1].table[0][0]=999;assert.equal(JSON.stringify(m.frames[0]),initial,'deep snapshots');
}
fs.writeFileSync(out+'/core.json',JSON.stringify({scope:'author self-check',cases:cases.length,frames,branches:[...branches]},null,2));console.log({cases:cases.length,frames,branches:[...branches]});
