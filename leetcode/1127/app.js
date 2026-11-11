'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=PurchaseCore;
const WORKED=C.rowsFrom(C.presets[0].on),WORKED_DAYS=C.trace(WORKED).pop().userDays;
let hand=0,preset='0',on=new Set(C.presets[0].on),rows=WORKED,frames=C.trace(rows),at=0,restarted=false,selection=null,revealed=false,copyState='';
const PRED=[[7,'2024-04-07','mobile',18],[7,'2024-04-07','desktop',22],[8,'2024-04-07','mobile',9],[9,'2024-04-07','mobile',11],[10,'2024-04-07','desktop',6]];
function cell(text,tag='td'){const c=document.createElement(tag);c.textContent=text;if(tag==='th')c.scope='col';return c;}
function tr(values,cls=''){const r=document.createElement('tr');if(cls)r.className=cls;values.forEach(v=>r.append(v instanceof Node?v:cell(String(v))));return r;}
function head(id,keys){$(id).replaceChildren(tr(keys.map(k=>cell(t(k||'colMark'),'th'))));}
const short=d=>d.slice(5);
const platformsText=p=>p.length===2?t('platformsBoth'):p[0];
// Step 1: hand labelling of the five person-days of the worked example.
function renderHand(){
 head('handSpendHead',['colDate','colUser','colPlatform','colAmount']);
 $('handSpend').replaceChildren(...WORKED.map(r=>{const done=WORKED_DAYS.findIndex(d=>d.date===r.spend_date&&d.user===r.user_id)<hand;return tr([r.spend_date,r.user_id,r.platform,r.amount],done?'done-row':'');}));
 head('handAnswerHead',['colDate','colPlatform','colTotalAmount','colTotalUsers']);
 const seen=WORKED_DAYS.slice(0,Math.min(hand,WORKED_DAYS.length)),last=hand>=1&&hand<=WORKED_DAYS.length?WORKED_DAYS[hand-1]:null;
 $('handAnswer').replaceChildren(...C.DATES.flatMap(date=>C.OUTPUT_PLATFORMS.map(p=>{
  const m=seen.filter(d=>d.date===date&&d.label===p),final=hand>WORKED_DAYS.length;
  const amount=m.length?m.reduce((s,d)=>s+d.amount,0):final?0:'?',users=m.length?m.length:final?0:'?';
  const hot=last&&last.date===date&&last.label===p,zero=final&&!m.length;
  return tr([date,p,amount,users],hot?'current-row':zero?'zero-row':'');
 })));
 $('handRead').textContent=hand===0?t('hand0'):hand>WORKED_DAYS.length?t('handDone'):t('handStep',{k:hand,n:WORKED_DAYS.length,user:last.user,date:last.date,platforms:platformsText(last.platforms),amount:last.amount,label:last.label});
 $('handLedger').replaceChildren(...seen.map(d=>{const li=document.createElement('li');li.textContent=`${d.date} · ${t('colUser')} ${d.user} · ${platformsText(d.platforms)} · ${d.amount} → ${d.label}`;return li;}));
 $('handPrev').disabled=hand===0;$('handReset').disabled=hand===0;$('handNext').disabled=hand>WORKED_DAYS.length;
}
// Step 2–4: static comparisons on the worked example, computed by the same model.
function renderStatic(){
 const right=C.result(WORKED),naive=C.naive(WORKED);
 for(const id of ['naiveHead','rightHead'])head(id,['colDate','colPlatform','colTotalAmount','colTotalUsers']);
 $('rightBody').replaceChildren(...right.map(r=>{const n=naive.find(x=>x.spend_date===r.spend_date&&x.platform===r.platform),bad=!n||n.total_amount!==r.total_amount||n.total_users!==r.total_users;return tr([r.spend_date,r.platform,r.total_amount,r.total_users],bad?'diff-row':'');}));
 $('naiveBody').replaceChildren(...right.map(r=>{const n=naive.find(x=>x.spend_date===r.spend_date&&x.platform===r.platform);
  if(!n){const row=tr([r.spend_date,r.platform,t('missingRow'),''],'missing-row');return row;}
  const bad=n.total_amount!==r.total_amount||n.total_users!==r.total_users;return tr([n.spend_date,n.platform,n.total_amount,n.total_users],bad?'diff-row':'');}));
 head('day3Head',['colDate','colUser','colPlatforms','colLabel','colAmount']);
 $('day3Body').replaceChildren(...WORKED_DAYS.map(d=>tr([d.date,d.user,platformsText(d.platforms),d.label,d.amount])));
 head('joinHead',['colCell','colMatched','colCountStar','colCountUser','colSum']);
 $('joinBody').replaceChildren(...right.map(r=>{const m=WORKED_DAYS.filter(d=>d.date===r.spend_date&&d.label===r.platform),empty=!m.length;
  return tr([`${short(r.spend_date)} · ${r.platform}`,empty?t('noneMatched'):m.map(d=>`${t('colUser')} ${d.user} (${d.amount})`).join(t('and')),empty?`1 ${t('wrongMark')}`:m.length,m.length,r.total_amount],empty?'zero-row':'');}));
 head('predHead',['colUser','colDate','colPlatform','colAmount']);
 $('predBody').replaceChildren(...PRED.map(r=>tr(r)));
}
// Step 5: editable input and the row-by-row walk.
function renderToggles(){
 const body=[];
 for(const date of C.DATES)for(const user of C.USERS){
  const r=document.createElement('tr');r.append(cell(`${short(date)} · ${t('colUser')} ${user}`,'th'));r.firstChild.scope='row';
  for(const platform of C.SOURCES){
   const k=C.key(date,user,platform),amount=C.AMOUNTS[date][user][platform],td=document.createElement('td'),b=document.createElement('button');
   b.type='button';b.className='btn toggle';b.dataset.key=k;b.dataset.step='5';b.setAttribute('aria-pressed',String(on.has(k)));
   b.textContent=t('toggleLabel',{platform,amount});b.setAttribute('aria-label',t('toggleAria',{date,user,platform,amount}));
   b.onclick=()=>{if(on.has(k))on.delete(k);else on.add(k);preset='custom';restart();};
   td.append(b);r.append(td);
  }
  body.push(r);
 }
 $('toggles').replaceChildren(...body);
}
function restart(){rows=C.rowsFrom([...on]);frames=C.trace(rows);at=0;restarted=true;$('preset').value=preset;renderTrace();
 const focusKey=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.key:null;renderToggles();if(focusKey)document.querySelector(`[data-key="${focusKey}"]`).focus();}
function renderTrace(){
 const f=frames[at],e=f.event,n=frames.length-1;
 const phase=at===0?'phaseStart':f.final?'phaseDone':f.cell>=0?'phaseB':'phaseA';
 $('frameRead').textContent=t('frame',{i:at,n,phase:t(phase)});
 $('restart').textContent=restarted?t('restartNote'):'';
 const evKey={start:rows.length?'evStart':'evStartEmpty',new:'evNew',upgrade:'evUpgrade',cell:'evCell',zero:'evZero'}[e.type];
 const users=f.cell>=0&&f.output[f.cell]?f.output[f.cell].users.join(t('and')):'';
 $('eventRead').textContent=t(evKey,{...e,row:e.i+1,users});
 const dates=[...new Set(rows.map(r=>r.spend_date))];
 const items=dates.filter(d=>d in f.spent).map(d=>t('conservationItem',{date:short(d),spent:f.spent[d],kept:f.userDays.filter(u=>u.date===d).reduce((s,u)=>s+u.amount,0)}));
 $('conservation').textContent=t('conservation',{items:items.length?items.join(t('sep')):t('conservationNone')});
 head('rowsHead',['','colDate','colUser','colPlatform','colAmount']);
 $('rowsBody').replaceChildren(...(rows.length?rows.map((r,i)=>tr([i===f.row?t('markCurrent'):i<f.row?t('markDone'):'',short(r.spend_date),r.user_id,r.platform,r.amount],i===f.row?'current-row':i<f.row?'':'future-row')):[emptyRow(5)]));
 head('dayHead',['','colDate','colUser','colPlatforms','colLabel','colAmount']);
 $('dayBody').replaceChildren(...(f.userDays.length?f.userDays.map((d,i)=>tr([i===f.changed?t('markChanged'):'',short(d.date),d.user,platformsText(d.platforms),d.label,d.amount],i===f.changed?'current-row':'')):[emptyRow(6)]));
 head('outHead',['','colDate','colPlatform','colTotalAmount','colTotalUsers']);
 const out=[];for(const d of dates)for(const p of C.OUTPUT_PLATFORMS){const j=out.length,o=f.output[j];
  out.push(o?tr([j===f.cell?t('markChanged'):'',short(d),p,o.total_amount,o.total_users],(j===f.cell?'current-row ':'')+(o.total_users===0?'zero-row':'')):tr(['',short(d),p,t('pending'),t('pending')],'future-row'));}
 $('outBody').replaceChildren(...(out.length?out:[emptyRow(5)]));
 $('prev').disabled=$('traceReset').disabled=at===0;$('next').disabled=$('end').disabled=at===n;
}
function emptyRow(span){const r=document.createElement('tr'),c=cell(t('emptyTable'));c.colSpan=span;r.append(c);return r;}
function renderPrediction(){
 $('reveal').disabled=selection===null;$('predictReset').disabled=selection===null;
 $('feedback').textContent=revealed?(selection===2?t('correct'):t('wrong'+selection))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selection===2);
}
function render(){renderHand();renderStatic();renderToggles();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('handNext').onclick=()=>{hand=Math.min(WORKED_DAYS.length+1,hand+1);renderHand();};
$('handPrev').onclick=()=>{hand=Math.max(0,hand-1);renderHand();};
$('handReset').onclick=()=>{hand=0;renderHand();$('handNext').focus();};
$('preset').onchange=e=>{preset=e.target.value;on=new Set(C.presets[Number(preset)].on);restart();};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};
$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('end').onclick=()=>{at=frames.length-1;renderTrace();};
$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name="prediction"]'))r.onchange=()=>{selection=Number(r.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{if(selection!==null){revealed=true;renderPrediction();}};
$('predictReset').onclick=()=>{selection=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('sourceCode').textContent=window.SQL_SOURCE;$('manualSource').value=window.SQL_SOURCE;
$('copySource').onclick=async()=>{try{await navigator.clipboard.writeText(window.SQL_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);updateNav();
