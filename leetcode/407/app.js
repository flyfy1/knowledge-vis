'use strict';
(() => {
  const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
  let preset=0,gate=2,index=0,model,choice=null,revealed=false,copyState='';
  function rebuild(){const h=RainCore.presets[preset].map(r=>r.slice());if(preset===1)h[2][4]=gate;model=RainCore.trace(h);index=0;}
  function renderTrace(){
    const f=model.frames[index],m=model.h.length,n=model.h[0].length;
    $('gateRow').hidden=preset!==1;$('gateLabel').textContent=t('gateLabel',{v:gate});
    $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=$('next').disabled;
    const known=f.levels.flat().filter(v=>v!==null).length;
    $('progress').textContent=t('progress',{k:index,n:m*n,known,water:f.water,state:t(index===0?'initial':index===m*n?'done':'running')});
    const table=$('terrain');table.style.setProperty('--cols',n);table.replaceChildren();
    const caption=document.createElement('caption');caption.textContent=t('caption');table.append(caption);
    const head=document.createElement('thead'),hr=document.createElement('tr');
    for(let c=-1;c<n;c++){const th=document.createElement('th');th.scope='col';th.textContent=c===-1?t('rowCol'):c;hr.append(th);}head.append(hr);table.append(head);
    const body=document.createElement('tbody');
    model.h.forEach((row,r)=>{const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=r;tr.append(th);
      row.forEach((h,c)=>{const td=document.createElement('td'),l=f.levels[r][c],current=f.event&&f.event.r===r&&f.event.c===c;
        if(l!==null)td.classList.add('known');if(current)td.classList.add('current');
        for(const text of ['H '+h,'L '+(l===null?'?':l),'W '+(l===null?'?':l-h)]){const span=document.createElement('span');span.textContent=text;td.append(span);}
        const small=document.createElement('small');small.textContent=t(current?'removed':l===null?'unknown':r===0||r===m-1||c===0||c===n-1?'boundary':'discovered');td.append(small);tr.append(td);
      });body.append(tr);
    });table.append(body);
    $('terrainScroll').setAttribute('aria-label',t('terrainLabel'));$('history').setAttribute('aria-label',t('historyLabel'));
    $('heap').textContent=f.heap.length?f.heap.map(([l,r,c])=>`${l}@(${r},${c})`).join(' · '):t('emptyHeap');
    const history=$('history');history.replaceChildren();
    const seed=document.createElement('li');seed.textContent=t('seedHistory');history.append(seed);
    model.frames.slice(1,index+1).forEach(frame=>{const e=frame.event,li=document.createElement('li');li.textContent=t('popHistory',e)+' '+(e.added.length?e.added.map(a=>t('addHistory',{...a,parent:e.level})).join(' '):t('noDiscovery'));history.append(li);});
    history.scrollTop=history.scrollHeight;
  }
  function renderPrediction(){
    $('reveal').disabled=choice===null;
    $('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');
    $('feedback').classList.toggle('correct',revealed&&choice==='1');
  }
  function render(){renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';updateNavigation();}
  $('preset').addEventListener('change',e=>{preset=Number(e.target.value);rebuild();renderTrace();});
  $('gate').addEventListener('input',e=>{gate=Number(e.target.value);rebuild();renderTrace();});
  for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();renderTrace();});
  $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
  document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;renderPrediction();}));
  $('reveal').addEventListener('click',()=>{revealed=true;renderPrediction();});
  $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
  $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
  function updateNavigation(){
    const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;
    let current='step0';
    document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)current=el.id;});
    document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  }
  addEventListener('scroll',updateNavigation,{passive:true});addEventListener('resize',updateNavigation);
  rebuild();locale.onChange(render);locale.init();
})();
