'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,C=WordCore,$=id=>document.getElementById(id);
let preset=0,frames=C.trace(C.presets[0].words,C.presets[0].secret),at=0,hand=false,answer=null,revealed=false,copyState='';
function render(){
 $('handRead').textContent=t(hand?'handResult':'handHidden');$('letters').hidden=!hand;
 $('letters').innerHTML=Array.from('acckzz').map((c,i)=>`<div class="letter ${c==='ccbazz'[i]?'hit':''}"><small>${i+1}</small><br>${c}<br>${'ccbazz'[i]}<br>${c==='ccbazz'[i]?'✓':'×'}</div>`).join('');
 const data=C.presets[preset],f=frames[at];
 $('presetSelection').textContent=t('preset'+preset);
 $('frameRead').textContent=t('frame',{k:at,n:f.candidates.length,secret:data.secret});
 $('terminal').textContent=f.done?t('found'):f.exhausted?t('exhausted'):f.candidates.length===1?t('known'):'';
 $('prev').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
 $('candidates').innerHTML=f.candidates.map(i=>`<code>${data.words[i]}</code>`).join('');
 $('buckets').innerHTML='';
 if(!f.done&&!f.exhausted){
  const plan=C.plan(data.words,f.candidates,f.used);
  $('buckets').innerHTML=plan.rows.map(r=>`<tr class="${r.i===plan.probe?'changed':''}"><th scope="row"><code>${r.word}</code></th>${r.buckets.map(n=>`<td>${n}</td>`).join('')}<td>${r.worst}</td><td>${t(r.used?'used':r.i===plan.probe?'chosen':'available')}</td></tr>`).join('');
 }
 $('buckets').closest('.table-wrap').hidden=f.done||!!f.exhausted;
 document.querySelector('[data-i18n=tableTitle]').hidden=f.done||!!f.exhausted;document.querySelector('[data-i18n=scrollHint]').hidden=f.done||!!f.exhausted;
 $('empty').textContent=at?'':t('empty');
 $('ledger').innerHTML=f.history.map(h=>`<li>${t('history',{guess:h.guess,reply:h.reply,before:h.before.length,after:h.after.length,words:h.after.map(i=>data.words[i]).join(', ')})}</li>`).join('');
 $('reveal').disabled=answer===null;
 $('feedback').textContent=revealed?t(answer===1?'correct':'incorrect')+' '+t('answer'):t('pending');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handToggle').onclick=()=>{hand=!hand;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);const p=C.presets[preset];frames=C.trace(p.words,p.secret,p.budget);at=0;render();};
$('prev').onclick=()=>{at=Math.max(0,at-1);render();};
$('next').onclick=()=>{at=Math.min(frames.length-1,at+1);render();};
$('end').onclick=()=>{at=frames.length-1;render();};
$('reset').onclick=()=>{at=0;render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{answer=Number(r.value);revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('predictionReset').onclick=()=>{answer=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}
 catch(_){copyState='manualCopy';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}
 render();
};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));},{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(s=>observer.observe(s));
