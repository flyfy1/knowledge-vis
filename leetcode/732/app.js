'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=CalendarCore;
let probe=4,preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function plot(id,events,domain){
 const el=$(id);el.replaceChildren();if(!events.length){el.textContent=t('none');return;}
 const lo=Math.min(...domain.flat()),hi=Math.max(...domain.flat());
 for(const [l,r] of events){const row=document.createElement('div');row.className='event-row';const text=document.createElement('code');text.textContent=`[${l}, ${r})`;const track=document.createElement('div');track.className='event-track';track.setAttribute('aria-hidden','true');const bar=document.createElement('span');bar.className='event-bar';bar.style.left=(l-lo)/(hi-lo)*100+'%';bar.style.width=(r-l)/(hi-lo)*100+'%';track.append(bar);for(const [x,start] of [[l,true],[r,false]]){const dot=document.createElement('span');dot.className='dot'+(start?' included':'');dot.style.left=(x-lo)/(hi-lo)*100+'%';track.append(dot);}row.append(text,track);el.append(row);}
}
function renderHand(){plot('handPlot',C.presets[0],C.presets[0]);const v=C.presets[0].map(([l,r])=>Number(l<=probe&&probe<r));$('handRead').textContent=t('handRead',{x:probe,a:v[0],b:v[1],c:v[2],k:v.reduce((a,b)=>a+b,0)});for(const x of [4,5,6]){$('probe'+x).textContent=t('probe',{x});$('probe'+x).setAttribute('aria-pressed',String(x===probe));}}
function renderTrace(){const f=frames[at];$('progress').textContent=t('progress',{at,total:frames.length-1,b:f.bookings.length,done:f.history.length});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 let message=t('empty');if(f.phase==='update')message=t('update',f.change);if(f.scanned){const row=f.rows[f.scanned-1],prev=f.rows[f.scanned-2];message=t(f.phase==='return'?'scanDone':'scan',{x:row.x,old:prev?prev.active:0,d:row.d,a:row.active,oldBest:prev?prev.best:0,best:row.best,n:f.scanned,u:f.rows.length});}
 $('operation').textContent=message;$('returnRead').textContent=f.phase==='return'?t('returned',{...f.change,k:f.best}):'';
 plot('eventPlot',f.bookings,C.presets[preset]);$('ledger').replaceChildren(...f.rows.map((r,i)=>{const tr=document.createElement('tr');for(const value of [r.x,r.d,i<f.scanned?r.active:'—',i<f.scanned?r.best:'—',t(i<f.scanned?'processed':'pending')]){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}return tr;}));
 $('noHistory').hidden=!!f.history.length;$('history').replaceChildren(...f.history.map(h=>{const li=document.createElement('li');li.textContent=t('historyRow',h);return li;}));
}
function renderPrediction(){$('reveal').disabled=selected===null;$('feedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');$('feedback').classList.toggle('correct',revealed&&selected===1);}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
for(const x of [4,5,6])$('probe'+x).onclick=()=>{probe=x;renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name=prediction]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('quizReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(r=>r.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{copyState='copying';$('copyStatus').textContent=t(copyState);try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
