'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
 let model=PlaylistCore.trace(PlaylistCore.presets[0]),index=0,choice=null,revealed=false,copyState='';
 function renderTrace(){
  const f=model.frames[index];
  $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=$('next').disabled;
  $('caption').textContent=t('caption',model);
  $('progress').textContent=t('progress',{index,total:model.frames.length-1,...f});
  $('tableHead').innerHTML='<tr><th scope="col">i \\ j</th>'+Array.from({length:model.n+1},(_,j)=>'<th scope="col">'+j+'</th>').join('')+'</tr>';
  $('tableBody').replaceChildren();
  f.table.forEach((row,i)=>{
   const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=i;tr.append(th);
   row.forEach((v,j)=>{
    const td=document.createElement('td');td.dataset.i=i;td.dataset.j=j;
    let mark='';
    if(i===f.i&&j===f.j){td.classList.add('current');mark='◆';}
    if(index>0&&i===f.i-1&&(j===f.j-1||j===f.j)){td.classList.add('source');mark=j===f.j-1?'N':'R';}
    if(v===null)td.classList.add('future');
    const val=document.createElement('span');val.className='cell-value';val.textContent=v===null?'?':v;td.append(val);
    const label=document.createElement('span');label.className='cell-mark';label.textContent=mark||'\u00a0';td.append(label);tr.append(td);
   });$('tableBody').append(tr);
  });
  $('calculation').textContent=index===0?t('initial'):t('calc',{...f,prev:f.i-1,jm:f.j-1});
  $('result').textContent=$('next').disabled?t('result',{...model,value:f.table[model.goal][model.n]}):t('notFinal');
 }
 function renderPrediction(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='2');}
 $('preset').addEventListener('change',()=>{model=PlaylistCore.trace(PlaylistCore.presets[Number($('preset').value)]);index=0;renderTrace();});
 for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();renderTrace();});
 $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
 document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;renderPrediction();}));$('reveal').addEventListener('click',()=>{revealed=true;renderPrediction();});
 $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
 function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
 locale.onChange(()=>{renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();
