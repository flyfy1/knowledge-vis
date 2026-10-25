'use strict';
(()=>{
  const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
  let model=SwimCore.trace(SwimCore.presets[0]),index=0,choice=null,revealed=false,copyState='';
  const fmt=v=>v===Infinity?'∞':v;
  function traceRender(){
    const f=model.frames[index],n=model.grid.length,e=f.event;
    $('presetName').textContent=(Number($('preset').value)+1)+' · '+t('preset'+$('preset').value);
    $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=f.done;$('end').disabled=f.done;
    $('progress').textContent=t('progress',{k:index,total:n*n,state:t(f.done?'done':index?'running':'initial'),detail:e?t(f.done?'finalDetail':'detail',e):t('initialDetail',{v:model.grid[0][0]})});
    const table=$('terrain');table.style.setProperty('--cols',n);table.replaceChildren();
    const cap=document.createElement('caption');cap.textContent=t('caption');table.append(cap);
    const head=document.createElement('thead'),hr=document.createElement('tr');
    for(let c=-1;c<n;c++){const th=document.createElement('th');th.scope='col';th.textContent=c<0?t('rowCol'):c;hr.append(th);}head.append(hr);table.append(head);
    const body=document.createElement('tbody');model.grid.forEach((row,r)=>{const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=r;tr.append(th);row.forEach((h,c)=>{
      const td=document.createElement('td'),cur=e&&e.r===r&&e.c===c;
      td.classList.toggle('settled',f.settled[r][c]);td.classList.toggle('current',Boolean(cur));
      for(const v of ['H '+h,'D '+fmt(f.dist[r][c])]){const s=document.createElement('span');s.textContent=v;td.append(s);}
      const small=document.createElement('small');small.textContent=t(cur?'currentCell':f.settled[r][c]?'settledCell':f.dist[r][c]===Infinity?'unseen':'pendingCell');td.append(small);tr.append(td);
    });body.append(tr);});table.append(body);
    $('terrainScroll').setAttribute('aria-label',t('terrainLabel'));$('history').setAttribute('aria-label',t('historyLabel'));
    $('frontier').textContent=f.queue.length?f.queue.map(([v,r,c])=>`${v} @ (${r},${c})`).join(' · '):t('empty');
    const history=$('history');history.replaceChildren();const seed=document.createElement('li');seed.textContent=t('seed',{v:model.grid[0][0]});history.append(seed);
    model.frames.slice(1,index+1).forEach(frame=>{const ev=frame.event,li=document.createElement('li');li.textContent=t('pop',ev);const ul=document.createElement('ul');
      ev.checks.forEach(ch=>{const item=document.createElement('li');item.textContent=t('check',{...ch,cost:ev.cost,old:fmt(ch.old),value:fmt(ch.improved?ch.candidate:ch.old),action:t(ch.improved?'improve':'keep')});ul.append(item);});li.append(ul);
      if(frame.done){const p=document.createElement('p');p.textContent=t('stop',ev);li.append(p);}history.append(li);
    });history.scrollTop=history.scrollHeight;
  }
  function predictionRender(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='1');}
  $('preset').addEventListener('change',()=>{model=SwimCore.trace(SwimCore.presets[Number($('preset').value)]);index=0;traceRender();});
  for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();traceRender();});
  $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
  document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;predictionRender();}));$('reveal').addEventListener('click',()=>{revealed=true;predictionRender();});
  $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
  $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
  function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
  addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
  locale.onChange(()=>{traceRender();predictionRender();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();
