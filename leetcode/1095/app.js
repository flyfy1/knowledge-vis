'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
const {presets,trace}=MountainLesson;
let selected=0,k=0,frames=trace(presets[0].a,presets[0].target),hand=0,choice=null,revealed=false,copyState='';
function phaseText(p){return t({peak:'phasePeak',up:'phaseUp',down:'phaseDown',done:'phaseDone'}[p]);}
function rangeText(lo,hi){return lo<=hi?'['+lo+','+hi+']':t('empty');}
presets.forEach((p,i)=>{const o=document.createElement('option');o.value=i;$('preset').append(o);});
function render(){
 const p=presets[selected],f=frames[k];
 [...$('preset').options].forEach((o,i)=>o.textContent=t('scenario',{n:i+1}));
 $('scenarioName').textContent=t(p.key);
 $('progress').textContent=t('progress',{k,total:frames.length-1,target:p.target,calls:f.calls});
 $('bounds').textContent=t('bounds',{phase:phaseText(f.phase),range:f.phase==='done'?'—':rangeText(f.lo,f.hi),peak:f.peak===null?t('unknown'):f.peak});
 $('mountain').replaceChildren(...p.a.map((v,i)=>{const el=document.createElement('div'),possible=f.phase!=='done'&&i>=f.lo&&i<=f.hi;el.className='tile'+(possible?' possible':'');el.dataset.index=i;
 const ix=document.createElement('span');ix.textContent=t('index',{i});const value=document.createElement('b');value.textContent=v;const state=document.createElement('span');state.className='state-mark';state.textContent=f.phase==='done'?'—':t(possible?'candidate':'excluded');const read=document.createElement('span');read.className='read-mark';read.textContent=f.reads.some(x=>x.i===i)?'◆ '+t('read'):'';el.append(ix,value,state,read);return el;}));
 $('prev').disabled=k===0;$('next').disabled=k===frames.length-1;$('end').disabled=k===frames.length-1;$('reset').disabled=k===0;
 $('event').textContent=t(f.event,{result:f.result});
 $('history').replaceChildren();
 if(!f.history.length){const li=document.createElement('li');li.textContent=t('noHistory');$('history').append(li);}
 f.history.forEach(h=>{const li=document.createElement('li');li.textContent=t('logLine',{...h,phase:phaseText(h.phase),reads:h.reads.map(x=>'get('+x.i+')='+x.value).join(', '),range:rangeText(h.lo,h.hi)});const why=document.createElement('small');why.textContent=t(h.rule);li.append(why);$('history').append(li);});
 $('handNext').disabled=hand===3;$('handReset').disabled=hand===0;$('handLog').replaceChildren();
 if(!hand)$('handLog').textContent=t('handInitial');else for(let i=0;i<hand;i++){const row=document.createElement('div');row.textContent=t('handLine',{i,v:[1,4,2][i],why:t(i===2?'yes':'notYet')});$('handLog').append(row);}
 $('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('answer'):t(choice===null?'choose':'chosen');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').onchange=()=>{selected=Number($('preset').value);frames=trace(presets[selected].a,presets[selected].target);k=0;render();};
$('next').onclick=()=>{if(k<frames.length-1)k++;render();};$('prev').onclick=()=>{if(k>0)k--;render();};$('end').onclick=()=>{k=frames.length-1;render();};$('reset').onclick=()=>{k=0;render();};
$('handNext').onclick=()=>{if(hand<3)hand++;render();};$('handReset').onclick=()=>{hand=0;render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{choice=Number(r.value);revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const yes=a.hash==='#'+active.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let pending=false;function scheduleNav(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;updateNav();});}window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
