'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
 let model=SubseqCore.trace(SubseqCore.presets[0]),index=0,choice=null,revealed=false,copyState='';
 function renderTrace(){
  const f=model.frames[index];
  $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=$('next').disabled;
  $('caption').textContent=t('caption');
  $('progress').textContent=t('progress',{k:index,n:model.s.length,prefix:index?model.s.slice(0,index):t('empty')});
  $('groups').replaceChildren();
  if(!index){const p=document.createElement('p');p.textContent=t('none');$('groups').append(p);}
  Object.entries(f.groups).sort().forEach(([char,strings])=>{const p=document.createElement('p');p.textContent=t('group',{char,count:strings.length,strings:'{'+strings.join(', ')+'}'});if(char===f.char)p.className='current';$('groups').append(p);});
  $('tableHead').replaceChildren();const head=document.createElement('tr');
  for(let i=0;i<4;i++){const th=document.createElement('th');th.scope='col';th.textContent=t('th'+i);head.append(th);}$('tableHead').append(head);
  $('tableBody').replaceChildren();
  model.frames.slice(0,index+1).forEach((frame,k)=>{const tr=document.createElement('tr');if(k===index)tr.className='current';
   [((k===index)?'◆ ':'')+(k?model.s.slice(0,k):t('empty')),frame.char||'—',k?frame.old+' → '+frame.newCount:'—',frame.total].forEach((value,j)=>{const td=document.createElement(j?'td':'th');if(!j)td.scope='row';td.textContent=value;tr.append(td);});$('tableBody').append(tr);
  });
  $('calculation').textContent=index===0?t('initial'):t('calc',f);
  $('result').textContent=$('next').disabled?t('result',{s:model.s,total:f.total}):t('notFinal');
 }
 function renderPrediction(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='1');}
 $('preset').addEventListener('change',()=>{model=SubseqCore.trace(SubseqCore.presets[Number($('preset').value)]);index=0;renderTrace();});
 for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();renderTrace();});
 $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
 document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;renderPrediction();}));$('reveal').addEventListener('click',()=>{revealed=true;renderPrediction();});
 $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
 function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
 locale.onChange(()=>{renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();
