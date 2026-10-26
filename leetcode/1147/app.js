'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,hand=0,choice=null,revealed=false,copyState='';
let model=ChunkCore.trace(ChunkCore.presets[0]);
function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function list(a){return a.length?a.map(x=>'['+x+']').join(' '):t('empty');}
function eventText(e){return e?t(e.kind,e):t('initial');}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 $('handState').textContent=t('hand'+hand);$('handHistory').replaceChildren();
 for(let k=1;k<=hand;k++)$('handHistory').append(node('li',t('hand'+k)));
 $('handPrev').disabled=hand===0;$('handNext').disabled=hand===4;
 const f=model.frames[index],middle=model.text.slice(f.left,f.right);
 $('input').textContent=t('input',{text:model.text});
 $('chunks').replaceChildren(node('p',t('leftChunks',{value:list(f.chunks)})),node('p',t('middleChunks',{status:t(f.done?'center':'unresolved'),value:middle?'['+middle+']':t('empty')}),'middle'),node('p',t('rightChunks',{value:list([...f.chunks].reverse())})));
 $('event').textContent=eventText(f.event);
 $('bounds').textContent=t(f.done?'finalBounds':'bounds',{left:f.left,right:f.right,value:middle||t('empty'),size:f.size});
 $('progress').textContent=t('progress',{i:index,n:model.frames.length-1,fixed:f.fixed,status:t(f.done?'final':'partial')});
 $('history').replaceChildren();if(!f.history.length)$('history').append(node('li',t('noEvents')));
 f.history.forEach((e,j)=>$('history').append(node('li',eventText(e),j===f.history.length-1?'current':'')));
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=f.done;$('end').disabled=f.done;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===2?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handPrev').onclick=()=>{if(hand>0)hand--;render();};$('handNext').onclick=()=>{if(hand<4)hand++;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);index=0;model=ChunkCore.trace(ChunkCore.presets[preset]);render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<model.frames.length-1)index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=model.frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const selected=a.hash==='#'+active.id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
