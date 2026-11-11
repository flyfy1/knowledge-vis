'use strict';
(function(root){
// Rows are [player_id, device_id, event_date, games_played]; (player_id, event_date) is unique.
const presets=[
 {key:'main',rows:[[1,7,'2024-03-05',2],[2,3,'2024-03-01',1],[1,7,'2024-03-01',4],[3,5,'2024-03-02',0],[4,2,'2024-03-01',3],[1,8,'2024-03-02',6],[5,5,'2024-03-02',1],[3,5,'2024-03-03',2],[4,2,'2024-03-03',5],[5,1,'2024-03-04',1]]},
 {key:'calendar',rows:[[1,1,'2024-02-28',1],[2,2,'2024-02-29',3],[1,1,'2024-02-29',2],[3,4,'2023-12-31',1],[2,2,'2024-03-01',1],[3,4,'2024-01-01',5]]},
 {key:'nobody',rows:[[7,1,'2024-05-05',2],[8,2,'2024-05-05',0],[7,1,'2024-05-07',1]]}
];
const quiz=[[3,2,'2024-06-11',1],[1,4,'2024-06-10',2],[4,1,'2024-06-10',3],[2,2,'2024-06-12',1],[1,4,'2024-06-11',0],[4,1,'2024-06-09',5],[2,3,'2024-06-10',2],[3,2,'2024-06-12',4]];
const clone=x=>JSON.parse(JSON.stringify(x));
function nextDay(d){const t=new Date(d+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+1);return t.toISOString().slice(0,10);}
// ROUND(k / m, 2) as exact half-up cents, printed with two decimals like MySQL DECIMAL output.
function retention(k,m){const cents=Math.floor((200*k+m)/(2*m));return (cents/100).toFixed(2);}
function validRows(rows){const seen=new Set();for(const r of rows){if(!Array.isArray(r)||r.length!==4||!Number.isInteger(r[0])||!/^\d{4}-\d\d-\d\d$/.test(r[2]))return false;const k=r[0]+'|'+r[2];if(seen.has(k))return false;seen.add(k);}return true;}
// Each frame is a deep snapshot taken after one completed action.
function trace(rows,join='left'){
 if(!validRows(rows))throw new Error('rows must be unique (player_id, event_date) records');
 const frames=[],installs={},looked={},joined=[],groups=[];let output=null;
 const push=event=>frames.push(clone({event,installs,looked,joined,groups,output}));
 push({type:'start',rows:rows.length});
 // Phase 1: GROUP BY player_id with MIN(event_date), one scanned row at a time.
 rows.forEach((r,idx)=>{
  const [p,,d]=r,old=installs[p];let action;
  if(!old){installs[p]={install_dt:d,row:idx};action='new';}
  else if(d<old.install_dt){installs[p]={install_dt:d,row:idx};action='earlier';}
  else action='later';
  push({type:'scan',idx,player:p,date:d,action,old:old?old.install_dt:null});
 });
 // Phase 2: LEFT JOIN each installer to the row dated install_dt + 1 day (at most one by the key).
 const players=Object.keys(installs).map(Number).sort((a,b)=>a-b);
 for(const p of players){
  const inst=installs[p].install_dt,target=nextDay(inst),hit=rows.findIndex(r=>r[0]===p&&r[2]===target);
  const kept=hit>=0||join==='left';looked[p]={target,hit,kept};
  if(kept)joined.push({player:p,install_dt:inst,target,match:hit>=0?p:null,row:hit>=0?hit:null});
  push({type:'lookup',player:p,install_dt:inst,target,hit,kept});
 }
 // Phase 3: GROUP BY install_dt; COUNT(*) players, COUNT(a.player_id) non-NULL matches.
 const dates=[...new Set(joined.map(j=>j.install_dt))].sort();
 for(const d of dates){
  const g=joined.filter(j=>j.install_dt===d),m=g.length,k=g.filter(j=>j.match!==null).length;
  groups.push({install_dt:d,installs:m,returned:k,players:g.map(j=>j.player),Day1_retention:retention(k,m)});
  push({type:'group',install_dt:d,installs:m,returned:k,value:retention(k,m)});
 }
 output=groups.map(g=>({install_dt:g.install_dt,installs:g.installs,Day1_retention:g.Day1_retention}));
 push({type:'final',dates:output.length});
 return frames;
}
function result(rows,join='left'){return trace(rows,join).at(-1).output;}
// Seeded random table for the "new random table" button (small enough to read).
function randomRows(seed){
 let s=seed>>>0||1;const rnd=()=>{s=(s*1103515245+12345)>>>0;return s/4294967296;};
 const players=2+Math.floor(rnd()*4),rows=[],used=new Set();
 for(let p=1;p<=players;p++){
  let day=1+Math.floor(rnd()*3);const n=1+Math.floor(rnd()*3);
  for(let i=0;i<n;i++){const d='2024-04-'+String(day).padStart(2,'0');if(!used.has(p+d)){used.add(p+d);rows.push([p,1+Math.floor(rnd()*5),d,Math.floor(rnd()*6)]);}day+=1+(rnd()<.45?0:1+Math.floor(rnd()*2));}
 }
 for(let i=rows.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
 return rows;
}
const api={presets,quiz,nextDay,retention,validRows,trace,result,randomRows};
root.RetentionCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
