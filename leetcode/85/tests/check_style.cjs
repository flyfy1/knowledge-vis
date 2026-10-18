const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),shared=fs.readFileSync(path.join(root,'../style.css'),'utf8'),local=fs.readFileSync(path.join(root,'style.css'),'utf8');
const tokens=Object.fromEntries([...shared.matchAll(/--([a-z0-9]+):(#[0-9a-f]{6})/g)].map(m=>[m[1],m[2]]));
function lum(h){return h.slice(1).match(/../g).map(s=>{let x=parseInt(s,16)/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const pairs=[['primary text','text','bg'],['panel text','text','panel'],['readout text','text','panel2'],['muted on panel','muted','panel'],['disabled / ledger text','muted','panel2'],['correct feedback','good','panel2'],['incorrect feedback','bad','panel2'],['active action','bg','accent'],['focus against page','accent2','bg'],['focus against stage','accent2','panel'],['focus against field','accent2','panel2'],['histogram units / settled outline','accent','panel'],['row marker','accent2','panel2']].map(([role,fg,bg])=>({role,foreground:tokens[fg],background:tokens[bg],ratio:ratio(tokens[fg],tokens[bg])}));
for(const p of pairs)assert(p.ratio>=4.5,JSON.stringify(p));
const bytes=Buffer.byteLength(shared)+Buffer.byteLength(local);assert(bytes<25000);
assert(local.includes('outline-offset:4px'));assert(local.includes('outline-offset:-3px'));assert(local.includes('opacity:1'));assert(local.includes('min-height:48px'));
const out=process.env.OUTPUT_DIR||path.join(root,'evidence');fs.mkdirSync(out,{recursive:true});const report={result:'pass',totalShippedCSSBytes:bytes,focusSeparation:'3px outline at 4px offset; adjacent surface is dark even on cyan actions',pairs};fs.writeFileSync(path.join(out,'style-results.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
