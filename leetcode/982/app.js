'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
 let model=AndTriples.trace(AndTriples.presets[0]),index=0,choice=null,revealed=false,copyState='';
 const descriptions={init:'init',pair:'pairEvent',copy:'startG',merge:'mergeEvent',lookup:'lookupEvent'};
 const describe=e=>t(descriptions[e.type],e);
 function renderTrace(){
  const f=model.frames[index],e=f.event;
  $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=$('next').disabled;
  $('progress').textContent=t('progress',{k:index,n:model.frames.length-1,nums:model.nums.join(','),bits:model.bits,size:model.size});
  $('event').textContent=describe(e);$('maskBody').replaceChildren();
  for(let mask=0;mask<model.size;mask++){
   const row=document.createElement('tr');
   [mask+' / '+mask.toString(2).padStart(model.bits,'0'),f.f[mask],f.g?f.g[mask]:t('notStarted')].forEach((value,j)=>{
    const cell=document.createElement(j?'td':'th');if(!j)cell.scope='row';
    const active=(e.type==='pair'&&j===1&&e.mask===mask)||(e.type==='merge'&&j===2&&e.mask===mask);
    cell.textContent=(active?'◆ ':'')+value;if(active)cell.className='current';row.append(cell);
   });$('maskBody').append(row);
  }
  $('result').textContent=t(index===model.frames.length-1?'final':'running',{total:f.total});
  $('historyBody').replaceChildren();
  model.frames.slice(1,index+1).forEach((frame,k)=>{const row=document.createElement('tr'),head=document.createElement('th'),cell=document.createElement('td');head.scope='row';head.textContent=(k+1)+'. '+t(frame.event.type+'Phase');cell.textContent=describe(frame.event);row.append(head,cell);$('historyBody').append(row);});
 }
 function renderPrediction(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='1');}
 $('preset').addEventListener('change',()=>{model=AndTriples.trace(AndTriples.presets[Number($('preset').value)]);index=0;renderTrace();});
 for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();renderTrace();});
 $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
 document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;renderPrediction();}));$('reveal').addEventListener('click',()=>{revealed=true;renderPrediction();});
 $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
 function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
 locale.onChange(()=>{renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();
