(function () {
  'use strict';
  const $=id=>document.getElementById(id), C=window.BlacklistCore;
  const locale=window.LeetCodeLocale(window.LESSON_COPY), t=locale.t;
  let preset=0, frames=C.trace(C.presets[0].n,C.presets[0].blacklist), index=0;
  let selected=null, revealed=false, copyState='';
  $('pythonCode').textContent=window.PYTHON_SOURCE;
  $('copyText').value=window.PYTHON_SOURCE;
  function eventText(e) {return t(e.kind,e);}
  function setTicketOptions() {
    $('ticket').replaceChildren(...Array.from({length:frames[0].m},(_,i)=>new Option(String(i),String(i))));
  }
  function renderHand() {
    const k=Number($('handTicket').value), outputs=[0,4,2];
    $('handRows').innerHTML=outputs.map((v,i)=>`<tr class="${k===i?'active-row':''}"><td>${i}${k===i?' ←':''}</td><td>${v}</td><td>${t(i===1?'repair':'direct')}</td></tr>`).join('');
    $('handResult').textContent=t('handResult',{k,v:outputs[k]});
  }
  function renderTrace() {
    const p=C.presets[preset], f=frames[index], blocked=new Set(p.blacklist), k=Number($('ticket').value);
    const holes=p.blacklist.filter(v=>v<f.m).length;
    $('input').textContent=t('input',{n:p.n,b:p.blacklist.join(','),m:f.m});
    $('progress').textContent=t('progress',{i:index,total:frames.length-1,a:Object.keys(f.remap).length,holes,high:f.high});
    $('event').textContent=eventText(f.event);
    $('prev').disabled=index===0; $('next').disabled=index===frames.length-1; $('end').disabled=index===frames.length-1;
    $('ticket').disabled=!f.done;
    let active=f.done?C.output(f,k):(f.event.kind==='assign'?f.event.target:f.event.kind==='skip'?f.event.old:null);
    $('domain').innerHTML=Array.from({length:p.n},(_,v)=>`<div class="value ${blocked.has(v)?'blocked':''} ${active===v?'active':''}"><b>${v}</b><span>${t(v<f.m?'low':'high')} · ${t(blocked.has(v)?'blocked':'allowed')}</span></div>`).join('');
    $('mappingRows').innerHTML=Array.from({length:f.m},(_,v)=>{
      const mapped=Object.hasOwn(f.remap,v), pending=blocked.has(v)&&!mapped;
      return `<tr class="${f.done&&v===k?'active-row':''}"><td>${v}${f.done&&v===k?' ←':''}</td><td>${pending?t('dash'):C.output(f,v)}</td><td>${t(pending?'pending':mapped?'mapped':'keep')}</td></tr>`;
    }).join('');
    $('ledger').innerHTML=f.log.length?f.log.map(e=>`<li>${eventText(e)}</li>`).join(''):`<li>${t('emptyLog')}</li>`;
    $('probe').textContent=f.done?t('probeResult',{k,v:C.output(f,k),route:t(Object.hasOwn(f.remap,k)?'mapped':'keep'),m:f.m}):t('probePending');
  }
  function renderQuiz() {
    $('reveal').disabled=selected===null;
    $('feedback').hidden=!revealed;
    $('feedback').textContent=revealed?t(selected==='1'?'correct':'incorrect')+' '+t('quizAnswer'):'';
  }
  function render() {
    document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.label)));
    renderHand();renderTrace();renderQuiz();
    $('copyStatus').textContent=copyState?t(copyState):'';
  }
  $('handTicket').addEventListener('change',renderHand);
  $('preset').addEventListener('change',()=>{preset=Number($('preset').value);const p=C.presets[preset];frames=C.trace(p.n,p.blacklist);index=0;setTicketOptions();renderTrace();});
  $('prev').onclick=()=>{if(index>0) index--;renderTrace();};
  $('next').onclick=()=>{if(index<frames.length-1) index++;renderTrace();};
  $('reset').onclick=()=>{index=0;$('ticket').value='0';renderTrace();};
  $('end').onclick=()=>{index=frames.length-1;renderTrace();};
  $('ticket').addEventListener('change',renderTrace);
  document.querySelectorAll('[name="prediction"]').forEach(el=>el.addEventListener('change',()=>{selected=el.value;revealed=false;renderQuiz();}));
  $('reveal').onclick=()=>{if(selected!==null){revealed=true;renderQuiz();}};
  $('copy').onclick=async()=>{
    copyState='copying';$('copyStatus').textContent=t(copyState);
    try {await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
    catch (_) {copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
    $('copyStatus').textContent=t(copyState);
  };
  setTicketOptions();locale.onChange(render);locale.init();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('#stepNav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}),{rootMargin:'-15% 0px -65% 0px'});
  document.querySelectorAll('.step').forEach(s=>observer.observe(s));
})();
