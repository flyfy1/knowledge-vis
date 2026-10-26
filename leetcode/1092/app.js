'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,hand=0,choice=null,revealed=false,copyState='';
let model=SCSCore.trace(...SCSCore.presets[preset]);
function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 $('handState').textContent=t('hand'+hand);$('handHistory').replaceChildren();
 for(let k=1;k<=hand;k++)$('handHistory').append(node('li',t('hand'+k)));
 $('handPrev').disabled=hand===0;$('handNext').disabled=hand===3;
 const f=model.frames[index],a=model.a,b=model.b,m=a.length,n=b.length;
 $('input').textContent=t('input',{a,b});$('tableWrap').setAttribute('aria-label',t('tableLabel'));
 $('table').replaceChildren();const head=document.createElement('thead'),hr=document.createElement('tr');
 hr.append(node('th',t('corner')));
 for(let c=0;c<=n;c++){const th=node('th',c+' · '+(b[c]||t('empty')));th.scope='col';hr.append(th);}head.append(hr);$('table').append(head);
 const body=document.createElement('tbody');
 for(let r=0;r<=m;r++){
  const tr=document.createElement('tr'),th=node('th',r+' · '+(a[r]||t('empty')));th.scope='row';tr.append(th);
  for(let c=0;c<=n;c++){
   const current=(f.kind==='equal'||f.kind==='different')?f.r===r&&f.c===c:(f.kind==='ready'||f.kind==='emit')&&f.i===r&&f.j===c;
   const path=f.history.some(h=>h.oi===r&&h.oj===c),v=f.table[r][c];
   const td=node('td',(v===null?'·':v)+(current?' ★':''),(v===null?'unknown ':'')+(current?'current ':'')+(path?'path':''));
   td.dataset.row=r;td.dataset.col=c;tr.append(td);
  }body.append(tr);
 }$('table').append(body);
 let event;
 if(f.kind==='emit')event=t('emit',{...f,reason:t(f.reason)});
 else event=t(f.kind,{...f,m,n,ri:f.r+1,cj:f.c+1});
 $('event').textContent=event;$('progress').textContent=t('progress',{k:index,total:model.frames.length-1,status:t(index===model.frames.length-1?'ended':'active')});
 $('output').textContent=t('output',{out:f.out||t('nothing')});
 $('invariant').textContent=(f.kind==='ready'||f.kind==='emit')?t('invariantRead',{len:f.out.length,left:f.table[f.i][f.j],total:f.table[0][0]}):t('notReconstructing');
 $('history').replaceChildren();
 if(!f.history.length)$('history').append(node('li',t('noHistory')));
 f.history.forEach(h=>$('history').append(node('li',t('historyRow',{...h,reason:t(h.reason)}))));
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=index===model.frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===2?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handPrev').onclick=()=>{if(hand>0)hand--;render();};$('handNext').onclick=()=>{if(hand<3)hand++;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);index=0;model=SCSCore.trace(...SCSCore.presets[preset]);render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<model.frames.length-1)index++;render();};
$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=model.frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const selected=a.hash==='#'+active.id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
