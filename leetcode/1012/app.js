'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=LessonCore.trace(LessonCore.presets[0]),hand=false,choice=null,revealed=false,copyState='';
function render(){
 const f=frames[index];$('event').textContent=t(f.kind,f);$('progress').textContent=t('progress',{i:index,total:frames.length-1,n:f.n});
 $('prefix').textContent=f.prefix||t('empty');$('used').textContent=JSON.stringify(f.used);$('unique').textContent=f.unique;$('result').textContent=f.answer===undefined?t('pending'):f.answer;
 const cards=f.ledger.map((entry,i)=>{const card=document.createElement('div');const current=i===f.ledger.length-1&&['short','block','include'].includes(f.kind);card.className='block'+(current?' current':'');const label=document.createElement('b');label.textContent=t(entry.kind,entry);card.append(label);const counts=document.createElement('span');counts.textContent=t('ledgerCount',entry);card.append(counts);if(current){const flag=document.createElement('span');flag.className='badge';flag.textContent=t('current');card.append(flag);}return card;});
 if(!cards.length){const p=document.createElement('p');p.textContent=t('noLedger');cards.push(p);}$('ledger').replaceChildren(...cards);
 for(const [id,disabled] of [['prev',index===0],['reset',index===0],['next',index===frames.length-1],['end',index===frames.length-1]])$(id).disabled=disabled;
 $('handAnswer').hidden=!hand;$('handReveal').textContent=t(hand?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(hand));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'wrong'+choice)+' '+t('answer'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));
}
$('preset').onchange=()=>{preset=Number($('preset').value);frames=LessonCore.trace(LessonCore.presets[preset]);index=0;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<frames.length-1)index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('handReveal').onclick=()=>{hand=!hand;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const selected=a.hash==='#'+active.id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
