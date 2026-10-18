'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let nums=MinimumLesson.presets[0],frames=MinimumLesson.trace(nums),index=0,prediction=null,revealed=false,copyState='';
const symbol=branch=>branch==='greater'?'>':branch==='less'?'<':'=';
function render(){
 const f=frames[index];
 $('langToggle').setAttribute('aria-label',t('langLabel'));
 document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
 $('array').setAttribute('aria-label',t('arrayLabel'));
 $('history').setAttribute('aria-label',t('historyTitle'));
 $('position').max=frames.length-1;$('position').value=index;
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{i:index,total:frames.length-1,l:f.l,r:f.r,n:f.r-f.l+1});
 $('event').textContent=f.event?t('event',{...f.event,l:f.l,r:f.r,symbol:symbol(f.event.branch),rule:t(f.event.branch)}):t('initial');
 $('array').innerHTML=nums.map((v,i)=>{const kept=i>=f.l&&i<=f.r;return `<div class="cell ${kept?'kept':'excluded'}" role="listitem"><span>i=${i}${i===f.l?' · l':''}${i===f.r?' · r':''}</span><b>${v}</b><span>${t(kept?'kept':'excluded')}</span></div>`;}).join('');
 $('final').hidden=index!==frames.length-1;if(!$('final').hidden)$('final').textContent=t('final',{l:f.l,v:nums[f.l]});
 $('emptyLog').hidden=index!==0;$('history').hidden=index===0;
 $('historyBody').innerHTML=frames.slice(1,index+1).map((frame,k)=>{const e=frame.event;return `<tr class="${k===index-1?'active-row':''}"><td>[${e.a},${e.b}]</td><td>m=${e.m}: ${e.x} ${symbol(e.branch)} ${e.y}</td><td>${t(e.branch)}</td><td>[${frame.l},${frame.r}]</td></tr>`;}).join('');
 $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{nums=MinimumLesson.presets[Number(e.target.value)];frames=MinimumLesson.trace(nums);index=0;render();});
$('prev').addEventListener('click',()=>{index=Math.max(0,index-1);render();});
$('next').addEventListener('click',()=>{index=Math.min(frames.length-1,index+1);render();});
$('end').addEventListener('click',()=>{index=frames.length-1;render();});
$('reset').addEventListener('click',()=>{index=0;render();});
$('position').addEventListener('input',e=>{index=Number(e.target.value);render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{prediction=el.value;revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallbackStatus';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
const links=[...document.querySelectorAll('.step-nav a')],sections=[...document.querySelectorAll('.step')];
let queued=false;
function active(){queued=false;const edge=document.querySelector('nav').getBoundingClientRect().height+40;let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=edge)current=s;links.forEach(a=>{const on=a.hash==='#'+current.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
function queue(){if(!queued){queued=true;requestAnimationFrame(active);}}
window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);locale.onChange(render);locale.onChange(queue);locale.init();queue();
