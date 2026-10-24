'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
const DATA=[
 {id:1,date:'2013-10-01',client:1,driver:10,status:'completed',eligible:true},
 {id:2,date:'2013-10-01',client:2,driver:11,status:'cancelled_by_driver',eligible:false},
 {id:3,date:'2013-10-01',client:3,driver:12,status:'completed',eligible:true},
 {id:4,date:'2013-10-01',client:4,driver:13,status:'cancelled_by_client',eligible:true},
 {id:5,date:'2013-10-02',client:1,driver:10,status:'completed',eligible:true},
 {id:6,date:'2013-10-02',client:2,driver:11,status:'completed',eligible:false},
 {id:7,date:'2013-10-02',client:3,driver:12,status:'completed',eligible:true},
 {id:8,date:'2013-10-03',client:2,driver:12,status:'completed',eligible:false},
 {id:9,date:'2013-10-03',client:3,driver:10,status:'completed',eligible:true},
 {id:10,date:'2013-10-03',client:4,driver:13,status:'cancelled_by_driver',eligible:true}
];
const ALT=[{id:1,date:'2013-10-02',client:1,driver:10,status:'completed',eligible:true},{id:2,date:'2013-10-02',client:1,driver:11,status:'cancelled_by_driver',eligible:false},{id:3,date:'2013-10-03',client:4,driver:13,status:'cancelled_by_client',eligible:true}];
let data=DATA,idx=0,choice=null,revealed=false,copyState='';
function statusLabel(s){return s.replaceAll('_',' ')}
function counts(){const out={};data.slice(0,idx).forEach(r=>{if(!r.eligible)return;(out[r.date]??={num:0,den:0}).den++;if(r.status!=='completed')out[r.date].num++;});return out;}
function render(){const c=counts();$('prev').disabled=idx===0;$('reset').disabled=idx===0;$('next').disabled=idx===data.length;$('progress').textContent=t('progress',{i:idx,n:data.length});
 $('rows').replaceChildren(...data.map((r,i)=>{const tr=document.createElement('tr');if(i===idx-1)tr.className='current';const cells=[r.id,r.date,`${r.client} → ${r.driver}`,statusLabel(r.status),r.eligible?t('yes'):t('no'),r.eligible&&i<idx&&(r.status!=='completed')?'1':'0',r.eligible&&i<idx?'1':'0',r.eligible&&i<idx?(c[r.date].num/c[r.date].den).toFixed(2):'—'];cells.forEach((v,j)=>{const el=document.createElement(j===0?'th':'td');if(j===0)el.scope='row';el.textContent=v;el.className=r.eligible?'ok':'no';tr.append(el)});return tr}));
 $('daily').replaceChildren(...Object.entries(c).map(([day,v])=>{const d=document.createElement('div');d.className='daily-card';d.innerHTML=`<strong>${day}</strong><br>${t('num')}: ${v.num} · ${t('den')}: ${v.den}<br><b>${t('rate')}: ${(v.num/v.den).toFixed(2)}</b>`;return d;}));
 $('message').textContent=idx? (idx===data.length?t('done'):t('progress',{i:idx,n:data.length})) : t('traceHint');
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed){$('feedback').textContent=(choice==='0'?t('correct'):t('incorrect'))+' '+t('explain');$('feedback').className='readout '+(choice==='0'?'status-good':'status-bad')}else $('feedback').textContent='';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
['prev','next','reset'].forEach(id=>$(id).onclick=()=>{if(id==='prev')idx=Math.max(0,idx-1);if(id==='next')idx=Math.min(data.length,idx+1);if(id==='reset')idx=0;render();});
$('preset').append(...['Sample / 示例','Transfer / 迁移'].map((v,i)=>{const o=document.createElement('option');o.value=i;o.textContent=v;return o;}));$('preset').onchange=e=>{data=Number(e.target.value)?ALT:DATA;idx=0;render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{choice=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select()}render()};
locale.onChange(render);locale.init();
function updateStep(){const current=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=130).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+current.id;a.classList.toggle('active',on);on?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current')})}window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();render();
