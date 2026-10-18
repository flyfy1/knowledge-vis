'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let trace=SalaryLesson.trace(SalaryLesson.presets[0]),index=0,prediction=null,revealed=false,copyState='';
function render(){
 $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));$('ledgerWrap').setAttribute('aria-label',t('tableLabel'));
 const f=trace.frames[index],kept=f.ranks.filter(r=>r<=3).length;
 $('prev').disabled=index===0;$('next').disabled=index===trace.rows.length;$('end').disabled=index===trace.rows.length;
 $('position').max=trace.rows.length;$('position').value=index;$('progress').textContent=t('progress',{i:index,total:trace.rows.length,kept});
 $('ledger').innerHTML=`<caption>${t('tableLabel')}</caption><thead><tr>${['dept','employee','salary','rank','decision'].map(k=>`<th scope="col">${t(k)}</th>`).join('')}</tr></thead><tbody>${trace.rows.map((r,i)=>`<tr class="${i<index?'done':''} ${i===index-1?'current':''}"><td>${r.department} (${r.departmentId})</td><th scope="row">${i===index-1?'★ ':''}${r.name}</th><td>${r.salary}</td><td>${f.ranks[i]??'—'}</td><td>${t(i>=index?'pending':f.ranks[i]<=3?'keep':'exclude')}</td></tr>`).join('')}</tbody>`;
 $('event').textContent=f.event?t(f.event.kind,f.event):t(trace.rows.length?'initial':'empty');$('final').hidden=index!==trace.rows.length;$('final').textContent=t('final',{n:kept});
 const vals=[90,Number($('hand').value),80,70,60],levels=[...new Set(vals)].sort((a,b)=>b-a),names=vals.map((v,i)=>levels.indexOf(v)<3?'ABCDE'[i]:null).filter(Boolean);
 $('handResult').textContent=t('handResult',{levels:levels.join(', '),names:names.join(', '),count:names.length});
 $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain');$('copyStatus').textContent=copyState?t(copyState):'';
}
$('hand').addEventListener('change',render);$('preset').addEventListener('change',e=>{trace=SalaryLesson.trace(SalaryLesson.presets[+e.target.value]);index=0;render();});
for(const id of ['prev','next','reset','end'])$(id).addEventListener('click',()=>{index=id==='prev'?Math.max(0,index-1):id==='next'?Math.min(trace.rows.length,index+1):id==='reset'?0:trace.rows.length;render();});$('position').addEventListener('input',e=>{index=+e.target.value;render();});
document.querySelectorAll('[name=prediction]').forEach(e=>e.addEventListener('change',()=>{prediction=e.value;revealed=false;render();}));$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallbackStatus';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
function active(){const edge=document.querySelector('nav').getBoundingClientRect().height+40;let s=document.querySelector('.step');document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=edge)s=e;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+s.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',active,{passive:true});window.addEventListener('resize',active);locale.onChange(render);locale.onChange(active);locale.init();active();
