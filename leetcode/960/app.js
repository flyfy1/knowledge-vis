'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
 let model=ColumnsCore.trace(ColumnsCore.presets[0]),index=0,choice=null,revealed=false,copyState='';
 const cell=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
 function renderTrace(){
  const f=model.frames[index];
  $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=$('next').disabled;
  $('progress').textContent=t('progress',{k:index,m:model.m,j:f.j<0?'—':f.j});
  $('inputTable').replaceChildren();const caption=cell('caption',t('inputCaption'));$('inputTable').append(caption);
  const head=document.createElement('thead'),tr=document.createElement('tr');tr.append(cell('th','r / j'));
  for(let j=0;j<model.m;j++){const th=cell('th',(j===f.j?'◆ ':'')+j);th.scope='col';tr.append(th);}head.append(tr);$('inputTable').append(head);
  const body=document.createElement('tbody');model.rows.forEach((row,r)=>{const tr=document.createElement('tr'),th=cell('th',t('row',{r}));th.scope='row';tr.append(th);[...row].forEach((char,j)=>{const td=cell('td',char);if(j===f.j)td.className='current';tr.append(td);});body.append(tr);});$('inputTable').append(body);
  $('tableBody').replaceChildren();for(let j=0;j<model.m;j++){const tr=document.createElement('tr'),th=cell('th',j);th.scope='row';tr.append(th,cell('td',j<=f.j?f.dp[j]:'—'),cell('td',t(j===f.j?'current':j<f.j?'done':'pendingCell')));if(j===f.j)tr.className='current';$('tableBody').append(tr);}
  $('pairs').replaceChildren();if(!index)$('pairs').append(cell('p',t('initial')));else if(!f.j)$('pairs').append(cell('p',t('singleton')));
  f.pairs.forEach(p=>{const checks=p.checks.map(([a,b,ok],r)=>t('comparison',{r,a,b,op:ok?'≤':'>',status:t(ok?'pass':'fail')})).join('; ');$('pairs').append(cell('p',t(p.ok?'candidate':'reject',{...p,checks})));});
  $('path').hidden=!index;$('path').textContent=index?t('path',{path:f.path.join(', '),length:f.path.length,rows:model.rows.map(s=>'"'+f.path.map(j=>s[j]).join('')+'"').join(' / ')}):'';
  $('result').textContent=index===model.m?t('result',{m:model.m,length:f.path.length,answer:model.m-f.path.length}):t('notFinal');
 }
 function renderPrediction(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='2');}
 $('preset').addEventListener('change',()=>{model=ColumnsCore.trace(ColumnsCore.presets[Number($('preset').value)]);index=0;renderTrace();});
 for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();renderTrace();});
 $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
 document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;renderPrediction();}));$('reveal').addEventListener('click',()=>{revealed=true;renderPrediction();});
 $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
 function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
 locale.onChange(()=>{renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();
