// Rewrites data.js: spread.s becomes GS10 − bond-equivalent TB3MS (rounded to 2 dp), from the FRED CSVs in ./fred (retrieved 2026-11-18).
const fs=require('fs');const P='/Users/songyy/fast/knowledge-vis/economics/money/why-one-rate-moves-everything/data.js';
const src=fs.readFileSync(P,'utf8');const D=require(P);
const rd=id=>new Map(fs.readFileSync(__dirname+'/fred/'+id+'.csv','utf8').trim().split('\n').slice(1).map(l=>l.split(',')).filter(a=>a[1]!=='').map(a=>[a[0],+a[1]]));
const g=rd('GS10'),b=rd('TB3MS');const bey=d=>100*365*(d/100)/(360-91*(d/100));
const s=[];for(let i=0;i<D.spread.s.length;i++){const y=1960+Math.floor(i/12),m=i%12+1,k=`${y}-${String(m).padStart(2,'0')}-01`;s.push(Math.round((g.get(k)-bey(b.get(k)))*100)/100);}
D.spread.s=s;D.spread.basis='GS10 minus bond-equivalent TB3MS';D.verified='2026-11-18';
const head='/* Data shipped with the essay. Built from FRED series retrieved 2026-11-11 and re-verified point by point against fresh downloads on 2026-11-18 (see BRIEF.md "Data"). spread.s was rebuilt on 2026-11-18 as GS10 minus the bond-equivalent yield of TB3MS. Do not edit by hand. */\n';
const wrap='(function (root, d) { if (typeof module === "object" && module.exports) module.exports = d; else root.RateData = d; }(typeof self !== "undefined" ? self : this, ';
fs.writeFileSync(P,head+wrap+JSON.stringify(D)+'));\n');
