'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let trace=StadiumLesson.trace(StadiumLesson.presets[0]),index=0,prediction=null,revealed=false,copyState='';
const tableHead=keys=>'<thead><tr>'+keys.map(k=>`<th scope="col">${t(k)}</th>`).join('')+'</tr></thead>';
function render(){
  $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
  $('rowsWrap').setAttribute('aria-label',t('tableLabel'));$('ledgerWrap').setAttribute('aria-label',t('ledgerLabel'));
  const f=trace.frames[index],marked=new Set(f.marked),event=f.event;
  $('prev').disabled=index===0;$('next').disabled=index===trace.eligible.length;$('end').disabled=index===trace.eligible.length;
  $('position').max=trace.eligible.length;$('position').value=index;
  $('progress').textContent=t('progress',{i:index,total:trace.eligible.length,n:marked.size});
  $('eligible').textContent=t('eligibleReadout',{ids:trace.eligible.join(', ')});
  $('rows').innerHTML=`<caption>${t('tableLabel')}</caption>${tableHead(['id','date','people','decision'])}<tbody>${trace.rows.map(r=>{
    const current=event&&r.id>=event.s&&r.id<=event.s+2;
    return `<tr class="${current?'current ':''}${marked.has(r.id)&&r.people>=100?'marked':''}"><th scope="row">${current?'★ ':''}${r.id}</th><td>${r.visit_date}</td><td>${r.people}</td><td>${t(r.people<100?'low':marked.has(r.id)?'marked':index===trace.eligible.length?'excluded':'pending')}</td></tr>`;
  }).join('')}</tbody>`;
  $('ledger').innerHTML=`<caption>${t('ledgerLabel')}</caption>${tableHead(['start','triple','reason','union'])}<tbody>${index?trace.frames.slice(1,index+1).map((frame,j)=>{const e=frame.event;return `<tr class="${j===index-1?'current':''}"><th scope="row">${j===index-1?'★ ':''}${e.s}</th><td>[${e.s}, ${e.s+1}, ${e.s+2}]</td><td>${t(e.kind,{missing:e.missing.join(', ')})}</td><td class="witness">[${frame.marked.join(', ')}]</td></tr>`;}).join(''):`<tr><td colspan="4">${t('noTests')}</td></tr>`}</tbody>`;
  $('event').textContent=event?t(event.kind==='hit'?'eventHit':'eventMiss',{...event,a:event.s+1,b:event.s+2,before:event.before.join(', '),after:f.marked.join(', '),missing:event.missing.join(', ')}):t(trace.eligible.length?'initial':'empty');
  const finalIds=trace.rows.filter(r=>r.people>=100&&marked.has(r.id)).sort((a,b)=>a.visit_date.localeCompare(b.visit_date)).map(r=>r.id);
  $('final').hidden=index!==trace.eligible.length;$('final').textContent=t('final',{ids:finalIds.join(', ')});
  $('handResult').textContent=t($('hand').value==='100'?'handGood':'handBad');
  $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
  if(revealed)$('feedback').textContent=t(prediction==='2'?'correct':'incorrect')+' '+t('quizExplain');
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('hand').addEventListener('change',render);
$('preset').addEventListener('change',e=>{trace=StadiumLesson.trace(StadiumLesson.presets[+e.target.value]);index=0;render();});
for(const id of ['prev','next','reset','end'])$(id).addEventListener('click',()=>{index=id==='prev'?Math.max(0,index-1):id==='next'?Math.min(trace.eligible.length,index+1):id==='reset'?0:trace.eligible.length;render();});
$('position').addEventListener('input',e=>{index=+e.target.value;render();});
document.querySelectorAll('[name=prediction]').forEach(e=>e.addEventListener('change',()=>{prediction=e.value;revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallbackStatus';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
function active(){const edge=document.querySelector('nav').getBoundingClientRect().height+40;let s=document.querySelector('.step');document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=edge)s=e;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+s.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',active,{passive:true});window.addEventListener('resize',active);locale.onChange(render);locale.onChange(active);locale.init();active();
