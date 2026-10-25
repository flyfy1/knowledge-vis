'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let hand=0,preset=0,index=0,frames=LessonCore.trace(LessonCore.presets[0].a,2),choice=null,revealed=false,copyState='';
function row(values,cls=''){const tr=document.createElement('tr');tr.className=cls;for(const v of values){const td=document.createElement('td');td.textContent=v;tr.append(td);}return tr;}
function render(){
 $('handPiles').replaceChildren(...[[3,2,4],[5,4],[9]][hand].map(v=>{const d=document.createElement('div');d.className='pile';d.textContent=v;return d;}));
 $('handText').textContent=t('hand'+hand);$('payments').replaceChildren(...Array.from({length:hand},(_,i)=>{const li=document.createElement('li');li.textContent=t('pay'+(i+1));return li;}));$('handPrev').disabled=hand===0;$('handNext').disabled=hand===2;
 const f=frames[index],e=f.event;
 const input=LessonCore.presets[preset];$('presetInput').textContent=t('inputReadout',{a:JSON.stringify(input.a),k:input.k});
 $('event').textContent=t(e.type==='split'?'splitEvent':e.type==='merge'?'mergeEvent':e.type,e);
 $('progress').textContent=t('progress',{done:index,total:frames.length-1,result:f.result===null?t('pending'):t('result',{v:f.result})});
 $('candidates').replaceChildren(...(e.candidates?e.candidates.map(c=>row([c.m,c.left,c.right,c.value,t(c.value===e.value?'best':'other')],c.value===e.value?'current-row':'')):[(()=>{const tr=row([t('noCandidates')]);tr.firstChild.colSpan=5;return tr;})()]));
 $('ledger').replaceChildren(...f.rows.map((r,i)=>row([`D(${r.i},${r.j},${r.p})`,r.value,t(index>0&&i===f.rows.length-1?'current':'complete')],index>0&&i===f.rows.length-1?'current-row':'')));
 for(const [id,disabled] of [['prev',index===0],['reset',index===0],['next',index===frames.length-1],['end',index===frames.length-1]])$(id).disabled=disabled;
 $('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'wrong'+choice)+' '+t('answer'):'';$('reveal').disabled=choice===null;
 $('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));
}
$('handPrev').onclick=()=>{hand=Math.max(0,hand-1);render();};$('handNext').onclick=()=>{hand=Math.min(2,hand+1);render();};
$('preset').onchange=()=>{preset=Number($('preset').value);const p=LessonCore.presets[preset];frames=LessonCore.trace(p.a,p.k);index=0;render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
