const fs=require('fs');const M=require('/Users/songyy/fast/knowledge-vis/economics/money/why-one-rate-moves-everything/models.js');const D=require('/Users/songyy/fast/knowledge-vis/economics/money/why-one-rate-moves-everything/data.js');
const rd=id=>new Map(fs.readFileSync(__dirname+'/fred/'+id+'.csv','utf8').trim().split('\n').slice(1).map(l=>l.split(',')).filter(a=>a[1]!=='').map(a=>[a[0],+a[1]]));
const g=rd('GS10'),b=rd('TB3MS');const bey=d=>100*365*(d/100)/(360-91*(d/100));
const s=[];for(let i=0;i<D.spread.s.length;i++){const y=1960+Math.floor(i/12),m=i%12+1,k=`${y}-${String(m).padStart(2,'0')}-01`;s.push(Math.round((g.get(k)-bey(b.get(k)))*100)/100);}
const lab=i=>`${1960+Math.floor(i/12)}-${i%12+1}`;
for(const [name,ser] of [['disc',D.spread.s],['bey',s]]) for(const lead of [6,12,18,24]){const r=M.inversionRecord(ser,D.spread.rec,lead);console.log(name,lead,'called',r.called.filter(x=>x.called).length+'/'+r.called.length,'miss',r.called.filter(x=>!x.called).map(x=>lab(x.start)).join(),'leads',r.called.map(x=>x.lead).join(),'FA',r.episodes.filter(e=>!e.followed&&!e.open).map(e=>lab(e.start)+'..'+lab(e.end)).join(' '));}
console.log('1989',s.slice(29*12,31*12+8).join(' '));console.log('last',s.slice(-3), 'eps', M.inversionRecord(s,D.spread.rec,12).episodes.map(e=>lab(e.start)+'..'+lab(e.end)+(e.followed?' Y'+e.wait:' N')).join(' | '));
fs.writeFileSync(__dirname+'/spread_bey.json',JSON.stringify(s));
