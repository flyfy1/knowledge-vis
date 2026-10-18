'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=[['aaa','aa'],['ab','aa'],['rabbbit','rabbit'],['babgbag','bag'],['a','aa'],['aA','A'],['','a'],['abc','']];
let run=Subseq115.trace(...presets[0]),index=0,selected=null,revealed=false,validation='',copyState='';
function el(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function render(){
 const f=run.frames[index],last=run.frames.length-1;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===last;
 $('position').max=last;$('position').value=index;
 $('progress').textContent=t('progress',{index,total:last,s:run.s,target:run.t});
 const key=f.type==='update'?(f.match?'updateMatch':'updateMiss'):f.type==='empty'?'emptyEvent':f.type;
 $('message').textContent=t(key,{...f,oldi:f.i-1,left:f.j-1});
 $('array').replaceChildren(...f.dp.map((v,j)=>{
  const current=f.type==='update'&&f.j===j;
  let row=f.i;
  if(f.type==='update'&&j>0&&j<f.j)row--;
  const cell=el('div','',`dp-cell${current?' current':''}`);
  cell.append(el('span',`j=${j} · ${run.t.slice(0,j)||'∅'}`),el('b',v),el('small',t('rowTag',{row,j})));
  if(current)cell.append(el('span',t('current'),'current-note'));
  return cell;
 }));
 const head=document.createElement('thead'),hr=document.createElement('tr');
 hr.append(el('th',t('rowHeader')));hr.firstChild.scope='col';
 for(let j=0;j<=run.t.length;j++){const h=el('th',`${j}: ${run.t.slice(0,j)||'∅'}`);h.scope='col';hr.append(h);}head.append(hr);
 const body=document.createElement('tbody');
 f.rows.forEach((row,i)=>{const tr=document.createElement('tr'),h=el('th',`${i}: ${run.s.slice(0,i)||'∅'}`);h.scope='row';tr.append(h);row.forEach((v,j)=>{const current=f.type==='update'&&f.i===i&&f.j===j;const td=el('td',v===null?t('pending'):`${current?'★ ':''}${v}`,current?'current':v===null?'pending':'');tr.append(td);});body.append(tr);});
 $('dpTable').replaceChildren(head,body);$('tableWrap').setAttribute('aria-label',t('tableTitle'));
 $('feedback').hidden=!revealed;$('reveal').disabled=selected===null;
 $('feedback').className='readout '+(selected==='1'?'status-good':'status-bad');
 $('feedback').textContent=revealed?t(selected==='1'?'correct':'incorrect')+' '+t('explanation'):'';
 $('validation').hidden=!validation;$('validation').textContent=validation?t(validation):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('next').onclick=()=>{index=Math.min(index+1,run.frames.length-1);render();};
$('prev').onclick=()=>{index=Math.max(index-1,0);render();};
$('reset').onclick=()=>{index=0;render();};
$('position').oninput=e=>{index=Number(e.target.value);render();};
$('preset').onchange=e=>{const [s,target]=presets[Number(e.target.value)];run=Subseq115.trace(s,target);index=0;validation='';$('inputS').value=s;$('inputT').value=target;render();};
$('customForm').noValidate=true;$('customForm').onsubmit=e=>{e.preventDefault();try{const next=Subseq115.trace($('inputS').value,$('inputT').value);run=next;index=0;validation='applied';$('preset').value='custom';}catch(_){validation='invalid';}render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){const active=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=130).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const current=a.hash==='#'+active.id;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();
