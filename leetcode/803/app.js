'use strict';
(()=>{
  const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
  let model=BricksCore.trace(BricksCore.presets[0]),index=0,choice=null,revealed=false,copyState='';
  function eventText(e){return t('event',{...e,reason:t(e.empty?'emptyHit':e.now>e.old?'positive':'noGain')});}
  function board(side,state,event){
    const table=$(side+'Grid');table.replaceChildren();table.style.setProperty('--cols',state.grid[0].length);
    $(side+'Scroll').setAttribute('aria-label',t('tableLabel'));
    $(side+'Caption').textContent=t(side==='before'?'captionBefore':'captionAfter',{r:state.size});
    const head=document.createElement('thead'),hr=document.createElement('tr');
    for(let c=-1;c<state.grid[0].length;c++){const th=document.createElement('th');th.scope='col';th.textContent=c<0?t('rowCol'):c;hr.append(th);}head.append(hr);table.append(head);
    const body=document.createElement('tbody');state.grid.forEach((row,r)=>{
      const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=r;tr.append(th);
      row.forEach((v,c)=>{const td=document.createElement('td');td.textContent=v?(state.seen[r][c]?'S':'U'):'·';td.classList.toggle('supported',!!v&&state.seen[r][c]);td.classList.toggle('unconnected',!!v&&!state.seen[r][c]);td.classList.toggle('restored',side==='after'&&!!event&&!event.empty&&event.r===r&&event.c===c);tr.append(td);});body.append(tr);
    });table.append(body);
  }
  function traceRender(){
    const f=model.frames[index],done=index===model.frames.length-1;
    $('presetSelected').textContent=t('presetShort'+$('preset').value);
    $('presetName').textContent=t('preset'+$('preset').value);
    $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=done;$('end').disabled=done;
    $('progress').textContent=t('progress',{k:index,total:model.hits.length,state:t(done?'done':index?'running':'initial')});
    $('detail').textContent=f.event?eventText(f.event):t('initialDetail',{r:f.after.size});
    board('before',f.before,f.event);board('after',f.after,f.event);
    $('result').textContent='['+f.answer.map(v=>v===null?'?':v).join(', ')+']';
    const history=$('history');history.replaceChildren();const seed=document.createElement('li');seed.textContent=t('seed',{r:model.frames[0].after.size});history.append(seed);
    model.frames.slice(1,index+1).forEach(frame=>{const li=document.createElement('li');li.textContent=eventText(frame.event);history.append(li);});
  }
  function predictionRender(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='2');}
  $('preset').addEventListener('change',()=>{model=BricksCore.trace(BricksCore.presets[Number($('preset').value)]);index=0;traceRender();});
  for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();traceRender();});
  $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
  document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;predictionRender();}));$('reveal').addEventListener('click',()=>{revealed=true;predictionRender();});
  $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
  $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
  function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
  addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
  locale.onChange(()=>{traceRender();predictionRender();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();
