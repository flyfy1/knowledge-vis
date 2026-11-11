'use strict';
(function(root){
// Teaching model for #1127. It mirrors the two stages of solution.sql in JavaScript:
// (a) classify each (date, user) as mobile / desktop / both, then (b) fill a fixed
// date × platform grid, keeping empty cells as zero rows. It does not execute SQL.
const DATES=['2024-03-01','2024-03-02'];
const USERS=[1,2,3];
const SOURCES=['mobile','desktop'];
const OUTPUT_PLATFORMS=['desktop','mobile','both'];
// Fixed amount for every possible Spending row, so a toggle never invents a number.
const AMOUNTS={
 '2024-03-01':{1:{mobile:40,desktop:25},2:{mobile:30,desktop:15},3:{mobile:20,desktop:50}},
 '2024-03-02':{1:{mobile:35,desktop:10},2:{mobile:12,desktop:45},3:{mobile:60,desktop:5}}
};
const key=(date,user,platform)=>date+'|'+user+'|'+platform;
const presets=[
 {id:'worked',on:[key(DATES[0],1,'mobile'),key(DATES[0],1,'desktop'),key(DATES[0],2,'mobile'),key(DATES[0],3,'desktop'),key(DATES[1],2,'desktop'),key(DATES[1],3,'mobile')]},
 {id:'noBoth',on:[key(DATES[0],1,'mobile'),key(DATES[0],2,'desktop'),key(DATES[1],3,'mobile')]},
 {id:'allBoth',on:[1,2,3].flatMap(u=>[key(DATES[0],u,'mobile'),key(DATES[0],u,'desktop')])},
 {id:'mixed',on:[key(DATES[0],1,'desktop'),key(DATES[0],2,'mobile'),key(DATES[0],2,'desktop'),key(DATES[1],1,'mobile'),key(DATES[1],1,'desktop'),key(DATES[1],2,'mobile'),key(DATES[1],3,'mobile'),key(DATES[1],3,'desktop')]},
 {id:'empty',on:[]}
];
// Spending rows in a stable order: date, then user, then mobile before desktop.
function rowsFrom(onKeys){
 const on=new Set(onKeys),rows=[];
 for(const date of DATES)for(const user of USERS)for(const platform of SOURCES)
  if(on.has(key(date,user,platform)))rows.push({user_id:user,spend_date:date,platform,amount:AMOUNTS[date][user][platform]});
 return rows;
}
const datesOf=rows=>[...new Set(rows.map(r=>r.spend_date))].sort();
// Correct answer, computed directly from the definition (a user-day has exactly one label).
function result(rows){
 const days=new Map();
 for(const r of rows){
  const k=r.spend_date+'|'+r.user_id;
  if(!days.has(k))days.set(k,{date:r.spend_date,user:r.user_id,platforms:new Set(),amount:0});
  const d=days.get(k);d.platforms.add(r.platform);d.amount+=r.amount;
 }
 const out=[];
 for(const date of datesOf(rows))for(const platform of OUTPUT_PLATFORMS){
  const members=[...days.values()].filter(d=>d.date===date&&(d.platforms.size===2?'both':[...d.platforms][0])===platform);
  out.push({spend_date:date,platform,total_amount:members.reduce((s,d)=>s+d.amount,0),total_users:members.length});
 }
 return out;
}
// The tempting wrong query: GROUP BY spend_date, platform over raw purchase rows.
function naive(rows){
 const groups=new Map();
 for(const r of rows){
  const k=r.spend_date+'|'+r.platform;
  if(!groups.has(k))groups.set(k,{spend_date:r.spend_date,platform:r.platform,total_amount:0,users:new Set()});
  const g=groups.get(k);g.total_amount+=r.amount;g.users.add(r.user_id);
 }
 return [...groups.values()].sort((a,b)=>a.spend_date.localeCompare(b.spend_date)||OUTPUT_PLATFORMS.indexOf(a.platform)-OUTPUT_PLATFORMS.indexOf(b.platform))
  .map(g=>({spend_date:g.spend_date,platform:g.platform,total_amount:g.total_amount,total_users:g.users.size}));
}
const clone=x=>JSON.parse(JSON.stringify(x));
// Frames: start; one per Spending row (stage a); one per output grid cell (stage b).
function trace(rows){
 const frames=[],userDays=[],output=[];
 const spent={};// per date: amount read from Spending so far
 const snap=(event,extra={})=>frames.push(clone({event,userDays,output,spent,...extra}));
 snap({type:'start',n:rows.length,dates:datesOf(rows).length},{row:-1,cell:-1});
 rows.forEach((r,i)=>{
  spent[r.spend_date]=(spent[r.spend_date]||0)+r.amount;
  let d=userDays.find(x=>x.date===r.spend_date&&x.user===r.user_id);
  if(!d){
   d={date:r.spend_date,user:r.user_id,platforms:[r.platform],label:r.platform,amount:r.amount};userDays.push(d);
   snap({type:'new',i,user:r.user_id,date:r.spend_date,platform:r.platform,amount:r.amount,label:d.label,total:d.amount},{row:i,cell:-1,changed:userDays.length-1});
  }else{
   const before=d.label;d.platforms.push(r.platform);d.label=d.platforms.length===2?'both':r.platform;d.amount+=r.amount;
   snap({type:'upgrade',i,user:r.user_id,date:r.spend_date,platform:r.platform,amount:r.amount,before,label:d.label,total:d.amount},{row:i,cell:-1,changed:userDays.indexOf(d)});
  }
 });
 const cells=[];for(const date of datesOf(rows))for(const platform of OUTPUT_PLATFORMS)cells.push({date,platform});
 cells.forEach((c,j)=>{
  const members=userDays.filter(d=>d.date===c.date&&d.label===c.platform);
  const row={spend_date:c.date,platform:c.platform,total_amount:members.reduce((s,d)=>s+d.amount,0),total_users:members.length,users:members.map(d=>d.user)};
  output.push(row);
  snap({type:members.length?'cell':'zero',j,date:c.date,platform:c.platform,amount:row.total_amount,count:row.total_users,users:row.users.join(', ')},{row:rows.length,cell:j});
 });
 frames[frames.length-1].final=true;
 if(rows.length===0)frames[0].final=true;
 return frames;
}
const api={DATES,USERS,SOURCES,OUTPUT_PLATFORMS,AMOUNTS,key,presets,rowsFrom,result,naive,trace};
root.PurchaseCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
