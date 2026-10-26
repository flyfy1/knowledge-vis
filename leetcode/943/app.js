'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),core=SuperstringCore;
 let model=core.trace(core.presets[0]),index=0,choice=null,revealed=false,copyState='';
 const subset=mask=>'{'+model.words.map((_,i)=>i).filter(i=>mask&(1<<i)).join(',')+'}';
 function addRow(parent,values,heading=false){const tr=document.createElement('tr');values.forEach((v,j)=>{const cell=document.createElement(heading||j===0?'th':'td');if(heading)cell.scope='col';else if(j===0)cell.scope='row';cell.textContent=v;tr.append(cell);});parent.append(tr);return tr;}
 function renderTrace(){
  const n=model.words.length,f=model.frames[index],e=f.event;
  $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=$('next').disabled;
  $('progress').textContent=t('progress',{k:index,n:model.frames.length-1,words:model.words.map((w,i)=>i+': '+w).join(' · ')});
  $('overlapHead').replaceChildren();$('overlapBody').replaceChildren();addRow($('overlapHead'),['→',...model.words.map((w,i)=>i+': '+w)],true);model.overlap.forEach((row,i)=>addRow($('overlapBody'),[i+': '+model.words[i],...row]));
  $('tableHead').replaceChildren();addRow($('tableHead'),[t('subset'),...model.words.map((w,i)=>i+': '+w)],true);$('tableBody').replaceChildren();
  for(let mask=1;mask<(1<<n);mask++){
   const tr=addRow($('tableBody'),[subset(mask)+' / '+mask,...Array(n).fill('')]);
   for(let j=0;j<n;j++){
    const td=tr.children[j+1];td.dataset.mask=mask;td.dataset.last=j;
    if(!(mask&(1<<j))){td.textContent='·';continue;}
    const b=document.createElement('b');b.textContent=f.dp[mask][j]===null?'—':f.dp[mask][j];td.append(b);
    if(f.dp[mask][j]!==null){const s=document.createElement('span');s.textContent=t(f.settled[mask][j]?'settled':'testing');td.append(s);}
    if(e&&((mask===e.previous&&j===e.i)||(mask===e.mask&&j===e.j))){const source=mask===e.previous;td.className=source?'source':'target';const mark=document.createElement('span');mark.textContent=t(source?'sourceMark':'targetMark');td.append(mark);}
   }
  }
  $('calculation').textContent=e?t('calc',{...e,mask:subset(e.mask),previous:subset(e.previous),length:model.words[e.j].length,old:e.old===null?'—':e.old,status:t(e.complete?'settled':'testing')}):t('initial');
  $('history').replaceChildren();$('history').start=Math.max(1,index-5);
  if(!index){const li=document.createElement('li');li.textContent=t('noHistory');$('history').append(li);}
  model.frames.slice(Math.max(1,index-5),index+1).forEach(frame=>{const li=document.createElement('li');li.textContent=t('history',{...frame.event,mask:subset(frame.event.mask)});$('history').append(li);});
  $('result').textContent=$('next').disabled?t('result',{length:model.result.length,order:model.order.map(i=>i+':'+model.words[i]).join(' → '),pieces:model.pieces.map(x=>JSON.stringify(x)).join(' + '),result:model.result}):t('notFinal');
 }
 function renderPrediction(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='2');}
 $('preset').addEventListener('change',()=>{model=core.trace(core.presets[Number($('preset').value)]);index=0;renderTrace();});
 for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();renderTrace();});
 $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
 document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;renderPrediction();}));$('reveal').addEventListener('click',()=>{revealed=true;renderPrediction();});
 $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
 function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
 locale.onChange(()=>{renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();
