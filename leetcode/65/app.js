'use strict';
(()=>{
 const locale=LeetCodeLocale(LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
 const presets=['4.e+2','4.e+','.','-.9','99e2.5','e','-90E3','1..2','--6','1a'];
 let input=presets[0],frames=NumberLesson.trace(input),at=0,choice=null,revealed=false,copyState='';
 const b=x=>String(x),empty=s=>s||t('empty');
 function status(f){return f.dead?'dead':f.digit?'complete':'incomplete';}
 function render(){
  const f=frames[at];
  $('langToggle').setAttribute('aria-label',t('langLabel'));
  document.querySelector('.step-nav').setAttribute('aria-label',t('navLabel'));
  $('ledgerWrap').setAttribute('aria-label',t('ledger'));
  $('position').max=frames.length-1;$('position').value=at;
  $('progress').textContent=t('progress',{i:f.i,n:input.length,k:at,m:frames.length-1});
  $('inputView').textContent=t('inputView',{s:input,prefix:empty(input.slice(0,f.i)),suffix:empty(input.slice(f.i))});
  $('message').textContent=t(f.kind,{ch:f.char})+(f.dead?' '+t('rejectedFlags'):'');
  $('state').textContent=`digit = ${b(f.digit)}\ndot = ${b(f.dot)}\nexp = ${b(f.exp)}\ndead = ${b(f.dead)}`;
  $('result').textContent=t(f.done?(f.digit&&!f.dead?'finalYes':'finalNo'):status(f));
  $('result').className='readout '+(f.dead?'status-bad':f.digit?'status-good':'');
  $('prev').disabled=at===0;$('reset').disabled=at===0;$('next').disabled=at===frames.length-1;
  $('rows').replaceChildren();
  for(let j=1;j<=at;j++){
   const cur=frames[j],old=frames[j-1],tr=document.createElement('tr');if(j===at)tr.className='current';
   const cells=[`${cur.i-1} · ${cur.char} · ${t('class_'+cur.kind)}`,input.slice(0,cur.i),['digit','dot','exp','dead'].map(k=>`${k}: ${b(old[k])} → ${b(cur[k])}`).join('\n'),t(status(cur))];
   cells.forEach((value,k)=>{const td=document.createElement('td');td.textContent=value;if(k===2)td.className='state-change';tr.append(td);});$('rows').append(tr);
  }
  $('feedback').hidden=!revealed;
  if(revealed){$('feedback').textContent=t(choice==='1'?'correct':'incorrect')+' '+t('answer');$('feedback').className='readout '+(choice==='1'?'status-good':'status-bad');}
  $('reveal').disabled=choice===null;
  if(!$('validation').hidden)$('validation').textContent=t('invalid');
  $('copyStatus').textContent=copyState?t(copyState):'';
 }
 function restart(s){input=s;frames=NumberLesson.trace(s);at=0;$('custom').value=s;$('validation').hidden=true;render();}
 $('preset').addEventListener('change',()=>restart(presets[Number($('preset').value)]));
 $('apply').addEventListener('click',()=>{const s=$('custom').value;if(!/^[A-Za-z0-9+.-]{1,20}$/.test(s)){$('validation').hidden=false;render();return;}restart(s);});
 $('next').addEventListener('click',()=>{if(at<frames.length-1)at++;render();});
 $('prev').addEventListener('click',()=>{if(at>0)at--;render();});
 $('reset').addEventListener('click',()=>{at=0;render();});
 $('position').addEventListener('input',()=>{at=Number($('position').value);render();});
 document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;render();}));
 $('reveal').addEventListener('click',()=>{revealed=true;render();});
 $('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
  catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
  render();
 });
 const anchors=[...document.querySelectorAll('.step-nav a')];
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)anchors.forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});},{rootMargin:'-10% 0px -65% 0px',threshold:0});
 document.querySelectorAll('.step').forEach(el=>observer.observe(el));
 locale.onChange(render);locale.init();
})();
